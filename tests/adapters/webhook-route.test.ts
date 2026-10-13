import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/webhooks/stripe/route';
import { getDb } from '@/lib/db';
import { executeOrderTransition } from '@/lib/state-machine/engine';

describe('Stripe Webhook Route Integration Test Suite', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  it('handles payment_intent.succeeded event and advances order from cart_pending to supplier_order_pending', async () => {
    const db = getDb();
    const orderId = 'ORD-2026-WEBHOOK-1';

    // Seed test order in cart_pending state
    await db.orders.create({
      id: orderId,
      order_number: 'TC-WH-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'cart_pending',
      customer_email: 'electrician@sparky.co.uk',
      shipping_address: {
        full_name: 'Dave Sparks',
        address_line_1: 'Unit 4 Trade Park',
        city: 'Manchester',
        postcode: 'M1 1AA',
        country: 'GB',
      },
      items: [],
      subtotal_ex_vat_gbp: 40.0,
      subtotal_inc_vat_gbp: 48.0,
      shipping_ex_vat_gbp: 5.0,
      shipping_inc_vat_gbp: 6.0,
      vat_amount_gbp: 9.0,
      total_inc_vat_gbp: 54.0,
      supplier_id: 'status-uk',
    });

    const eventPayload = {
      id: 'evt_test_pi_succeeded_001',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Math.floor(Date.now() / 1000),
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_test_12345',
          object: 'payment_intent',
          amount: 5400,
          amount_received: 5400,
          currency: 'gbp',
          status: 'succeeded',
          metadata: {
            order_id: orderId,
          },
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'mock_signature',
      },
      body: JSON.stringify(eventPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.event_type).toBe('payment_intent.succeeded');

    // Verify order transitioned to supplier_order_pending
    const updatedOrder = await db.orders.getById(orderId);
    expect(updatedOrder).toBeDefined();
    expect(updatedOrder?.state).toBe('supplier_order_pending');
    expect(updatedOrder?.audit_logs.length).toBeGreaterThanOrEqual(2);
  });

  it('handles charge.refunded event and advances order from refund_pending to refunded', async () => {
    const db = getDb();
    const orderId = 'ORD-2026-WEBHOOK-REFUND';

    // Seed test order in refund_pending state
    await db.orders.create({
      id: orderId,
      order_number: 'TC-WH-REFUND',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'cart_pending',
      customer_email: 'diy@customer.co.uk',
      shipping_address: {
        full_name: 'Sarah Homeowner',
        address_line_1: '12 Willow Lane',
        city: 'Leeds',
        postcode: 'LS1 2AB',
        country: 'GB',
      },
      items: [],
      subtotal_ex_vat_gbp: 20.0,
      subtotal_inc_vat_gbp: 24.0,
      shipping_ex_vat_gbp: 5.0,
      shipping_inc_vat_gbp: 6.0,
      vat_amount_gbp: 5.0,
      total_inc_vat_gbp: 30.0,
      supplier_id: 'status-uk',
    });

    // Advance to supplier_rejected -> refund_pending
    await executeOrderTransition({
      order_id: orderId,
      to_state: 'checkout_authorized',
      trigger: 'test',
      actor: 'test',
    });
    await executeOrderTransition({
      order_id: orderId,
      to_state: 'supplier_order_pending',
      trigger: 'test',
      actor: 'test',
    });
    await executeOrderTransition({
      order_id: orderId,
      to_state: 'supplier_rejected',
      trigger: 'supplier',
      actor: 'supplier_api',
    });
    await executeOrderTransition({
      order_id: orderId,
      to_state: 'refund_pending',
      trigger: 'system',
      actor: 'refund_engine',
    });

    const eventPayload = {
      id: 'evt_test_charge_refunded_002',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Math.floor(Date.now() / 1000),
      type: 'charge.refunded',
      data: {
        object: {
          id: 'ch_test_98765',
          object: 'charge',
          amount: 3000,
          amount_refunded: 3000,
          currency: 'gbp',
          status: 'succeeded',
          metadata: {
            order_id: orderId,
          },
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'mock_signature',
      },
      body: JSON.stringify(eventPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.event_type).toBe('charge.refunded');

    const updatedOrder = await db.orders.getById(orderId);
    expect(updatedOrder?.state).toBe('refunded');
  });

  it('rejects malformed non-JSON payload with HTTP 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'mock_signature',
      },
      body: 'INVALID_NON_JSON_CORRUPT_PAYLOAD{{{{',
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Invalid JSON payload');
  });

  it('returns HTTP 200 for unhandled/informational event types gracefully', async () => {
    const eventPayload = {
      id: 'evt_test_customer_created_003',
      object: 'event',
      api_version: '2024-11-20.acacia',
      created: Math.floor(Date.now() / 1000),
      type: 'customer.created',
      data: {
        object: {
          id: 'cus_12345',
        },
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'mock_signature',
      },
      body: JSON.stringify(eventPayload),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.received).toBe(true);
    expect(json.event_type).toBe('customer.created');
  });
});
