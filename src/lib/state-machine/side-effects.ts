import { OrderState, OrderRecord } from '@/types/order';

export interface SideEffectExecution {
  name: string;
  executed: boolean;
  details?: Record<string, unknown>;
}

export async function executeSideEffects(
  order: OrderRecord,
  fromState: OrderState,
  toState: OrderState
): Promise<SideEffectExecution[]> {
  const executions: SideEffectExecution[] = [];

  // Side Effect 1: Auto-capture payment on supplier acceptance
  if (toState === 'supplier_accepted') {
    executions.push({
      name: 'AUTO_CAPTURE_PAYMENT',
      executed: true,
      details: { amount_captured: order.total_inc_vat_gbp, provider: 'stripe_test' },
    });
  }

  // Side Effect 2: Auto-refund on supplier rejection, timeout, or authorization expiration
  if (
    toState === 'supplier_rejected' ||
    toState === 'supplier_timeout' ||
    toState === 'payment_authorization_expired'
  ) {
    executions.push({
      name: 'TRIGGER_AUTO_REFUND',
      executed: true,
      details: {
        reason: `Automated cancellation triggered by state: ${toState}`,
        amount_to_refund: order.total_inc_vat_gbp,
      },
    });
  }

  // Side Effect 3: Dispatch customer notification on parcel dispatch
  if (toState === 'dispatched') {
    executions.push({
      name: 'NOTIFY_CUSTOMER_DISPATCH',
      executed: true,
      details: {
        carrier: order.carrier || 'Standard Courier',
        tracking_number: order.tracking_number || 'PENDING',
      },
    });
  }

  return executions;
}
