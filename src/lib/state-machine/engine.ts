import { OrderAuditLog } from '@/types/order';
import { TransitionRequest, TransitionResult } from './types';
import { isValidTransition } from './transitions';
import { executeSideEffects } from './side-effects';
import { getDb } from '@/lib/db';

export function generatePoIdempotencyKey(orderId: string, supplierId: string): string {
  return `${orderId}#${supplierId}`;
}

export async function executeOrderTransition(req: TransitionRequest): Promise<TransitionResult> {
  const db = getDb();
  const order = await db.orders.getById(req.order_id);

  if (!order) {
    throw new Error(`Order ${req.order_id} not found`);
  }

  const previousState = order.state;
  const targetState = req.to_state;
  const auditLogs = order.audit_logs || [];

  // Idempotency check 1: Request with matching idempotency key already processed in audit logs
  if (req.idempotency_key) {
    const matchingLog = auditLogs.find(
      (log) => log.metadata?.idempotency_key === req.idempotency_key
    );
    if (matchingLog) {
      return {
        success: true,
        order_id: order.id,
        previous_state: matchingLog.from_state,
        current_state: order.state,
        idempotent_replay: true,
        audit_log: matchingLog,
        side_effects_executed: ['IDEMPOTENT_NOOP'],
      };
    }
  }

  // Idempotency check 2: repeated request with same target state
  if (previousState === targetState) {
    const existingLog =
      auditLogs.find(
        (log) => log.to_state === targetState && log.metadata?.idempotency_key === req.idempotency_key
      ) || auditLogs[auditLogs.length - 1];

    const fallbackLog: OrderAuditLog = existingLog || {
      id: `synthetic_${order.id}`,
      order_id: order.id,
      from_state: previousState,
      to_state: previousState,
      trigger: req.trigger || 'system',
      actor: req.actor || 'system',
      created_at: new Date().toISOString(),
    };

    return {
      success: true,
      order_id: order.id,
      previous_state: previousState,
      current_state: previousState,
      idempotent_replay: true,
      audit_log: fallbackLog,
      side_effects_executed: ['IDEMPOTENT_NOOP'],
    };
  }

  // Validation against transition DAG
  if (!isValidTransition(previousState, targetState)) {
    throw new Error(
      `Illegal transition from '${previousState}' to '${targetState}' for order ${order.id}`
    );
  }

  // Side effects
  const sideEffects = await executeSideEffects(order, previousState, targetState);

  // Append-only audit log
  const auditLog: OrderAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    order_id: order.id,
    from_state: previousState,
    to_state: targetState,
    trigger: req.trigger,
    actor: req.actor,
    metadata: {
      ...req.metadata,
      idempotency_key: req.idempotency_key,
      side_effects: sideEffects.map((s) => s.name),
    },
    created_at: new Date().toISOString(),
  };

  // Update order in repository
  await db.orders.updateState(order.id, targetState, auditLog);

  let currentState: typeof targetState = targetState;

  // If auto-refund triggered, transition automatically to refund_pending
  if (
    sideEffects.some((s) => s.name === 'TRIGGER_AUTO_REFUND') &&
    targetState !== 'refund_pending'
  ) {
    const refundLog: OrderAuditLog = {
      id: `log_${Date.now()}_refund`,
      order_id: order.id,
      from_state: targetState,
      to_state: 'refund_pending',
      trigger: 'cron_timeout',
      actor: 'system:auto_refund',
      metadata: { reason: `Auto-refund after ${targetState}` },
      created_at: new Date().toISOString(),
    };
    await db.orders.updateState(order.id, 'refund_pending', refundLog);
    currentState = 'refund_pending';
  }

  return {
    success: true,
    order_id: order.id,
    previous_state: previousState,
    current_state: currentState,
    idempotent_replay: false,
    audit_log: auditLog,
    side_effects_executed: sideEffects.map((s) => s.name),
  };
}
