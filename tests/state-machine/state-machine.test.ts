import { describe, it, expect, beforeEach } from 'vitest';
import { executeOrderTransition, generatePoIdempotencyKey } from '@/lib/state-machine/engine';
import { isValidTransition, VALID_TRANSITIONS } from '@/lib/state-machine/transitions';
import { getDb } from '@/lib/db';
import { OrderState } from '@/types/order';

describe('Supplier Order State Machine Test Suite', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  it('validates all 15 states in the state machine transition graph', () => {
    const states: OrderState[] = [
      'cart_pending',
      'checkout_authorized',
      'supplier_order_pending',
      'supplier_accepted',
      'payment_captured',
      'dispatched',
      'delivered',
      'supplier_rejected',
      'supplier_timeout',
      'payment_authorization_expired',
      'partial_supplier_acceptance',
      'partial_dispatch',
      'refund_pending',
      'refunded',
      'manual_review',
    ];
    for (const state of states) {
      expect(VALID_TRANSITIONS[state]).toBeDefined();
    }
  });

  it('executes the full happy path: cart_pending -> delivered', async () => {
    const orderId = 'ORD-2026-HAPPY';
    // Create new order in cart_pending
    await getDb().orders.create({
      id: orderId,
      order_number: 'TC-HAPPY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'cart_pending',
      customer_email: 'test@toolcart.co.uk',
      shipping_address: {
        full_name: 'John Doe',
        address_line_1: '1 High St',
        city: 'London',
        postcode: 'EC1A 1BB',
        country: 'GB',
      },
      items: [],
      subtotal_ex_vat_gbp: 10,
      subtotal_inc_vat_gbp: 12,
      shipping_ex_vat_gbp: 5,
      shipping_inc_vat_gbp: 6,
      vat_amount_gbp: 3,
      total_inc_vat_gbp: 18,
      supplier_id: 'status-uk',
    });

    const transitions: OrderState[] = [
      'checkout_authorized',
      'supplier_order_pending',
      'supplier_accepted',
      'payment_captured',
      'dispatched',
      'delivered',
    ];

    for (const targetState of transitions) {
      const res = await executeOrderTransition({
        order_id: orderId,
        to_state: targetState,
        trigger: 'admin',
        actor: 'test_runner',
      });
      expect(res.success).toBe(true);
      expect(res.current_state).toBe(targetState);
    }

    const finalOrder = await getDb().orders.getById(orderId);
    expect(finalOrder?.state).toBe('delivered');
    expect(finalOrder?.audit_logs.length).toBe(6);
  });

  it('prevents illegal transitions and throws informative error', async () => {
    expect(isValidTransition('cart_pending', 'delivered')).toBe(false);
    expect(isValidTransition('cart_pending', 'dispatched')).toBe(false);
    expect(isValidTransition('supplier_rejected', 'dispatched')).toBe(false);

    await expect(
      executeOrderTransition({
        order_id: 'ORD-2026-1002', // state is supplier_order_pending
        to_state: 'delivered',
        trigger: 'admin',
        actor: 'bad_actor',
      })
    ).rejects.toThrow(/Illegal transition/);
  });

  it('enforces idempotency using order_id + supplier_id PO key', async () => {
    const key = generatePoIdempotencyKey('ORD-2026-1002', 'status-uk');
    expect(key).toBe('ORD-2026-1002#status-uk');

    // First transition
    const res1 = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_accepted',
      trigger: 'supplier',
      actor: 'status-uk_portal',
      idempotency_key: key,
    });
    expect(res1.idempotent_replay).toBe(false);

    // Duplicate call with same state & idempotency key
    const res2 = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_accepted',
      trigger: 'supplier',
      actor: 'status-uk_portal',
      idempotency_key: key,
    });
    expect(res2.idempotent_replay).toBe(true);
    expect(res2.current_state).toBe('supplier_accepted');
  });

  it('triggers auto-refund side effect when supplier rejects order', async () => {
    const res = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_rejected',
      trigger: 'supplier',
      actor: 'status_uk_api',
      metadata: { reason: 'Out of stock at supplier warehouse' },
    });
    expect(res.side_effects_executed).toContain('TRIGGER_AUTO_REFUND');
    expect(res.current_state).toBe('refund_pending');

    const order = await getDb().orders.getById('ORD-2026-1002');
    expect(order?.state).toBe('refund_pending');
  });

  it('handles idempotency replay on auto-compensated states without DAG error', async () => {
    const testOrderId = 'ORD-2026-COMPENSATE';
    await getDb().orders.create({
      id: testOrderId,
      order_number: 'TC-COMPENSATE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'supplier_order_pending',
      customer_email: 'test@toolcart.co.uk',
      shipping_address: {
        full_name: 'Jane Doe',
        address_line_1: '2 High St',
        city: 'Manchester',
        postcode: 'M1 1AA',
        country: 'GB',
      },
      items: [],
      subtotal_ex_vat_gbp: 20,
      subtotal_inc_vat_gbp: 24,
      shipping_ex_vat_gbp: 5,
      shipping_inc_vat_gbp: 6,
      vat_amount_gbp: 5,
      total_inc_vat_gbp: 35,
      supplier_id: 'status-uk',
    });

    const idempotencyKey = 'RETRY_REJECT_KEY_999';

    // First transition: supplier_rejected -> auto-refund to refund_pending
    const res1 = await executeOrderTransition({
      order_id: testOrderId,
      to_state: 'supplier_rejected',
      trigger: 'supplier',
      actor: 'status_uk_api',
      idempotency_key: idempotencyKey,
      metadata: { reason: 'Discontinued product line' },
    });

    expect(res1.success).toBe(true);
    expect(res1.current_state).toBe('refund_pending');
    expect(res1.idempotent_replay).toBe(false);

    // Second call: Supplier webhook retries supplier_rejected with same idempotency key
    const res2 = await executeOrderTransition({
      order_id: testOrderId,
      to_state: 'supplier_rejected',
      trigger: 'supplier',
      actor: 'status_uk_api',
      idempotency_key: idempotencyKey,
    });

    expect(res2.success).toBe(true);
    expect(res2.idempotent_replay).toBe(true);
    expect(res2.current_state).toBe('refund_pending');
  });

  it('guarantees append-only audit trail logging', async () => {
    const orderBefore = await getDb().orders.getById('ORD-2026-1002');
    const logsCountBefore = orderBefore?.audit_logs.length || 0;

    await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'manual_review',
      trigger: 'admin',
      actor: 'admin:ops',
      metadata: { reason: 'Investigating delivery address' },
    });

    const orderAfter = await getDb().orders.getById('ORD-2026-1002');
    expect(orderAfter?.audit_logs.length).toBe(logsCountBefore + 1);

    const latestLog = orderAfter?.audit_logs[orderAfter.audit_logs.length - 1];
    expect(latestLog?.from_state).toBe('supplier_order_pending');
    expect(latestLog?.to_state).toBe('manual_review');
    expect(latestLog?.trigger).toBe('admin');
    expect(latestLog?.actor).toBe('admin:ops');
    expect(latestLog?.created_at).toBeDefined();
  });
});
