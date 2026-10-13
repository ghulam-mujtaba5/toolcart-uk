import { OrderState } from '@/types/order';

export const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  cart_pending: [
    'checkout_authorized',
    'manual_review',
  ],
  checkout_authorized: [
    'supplier_order_pending',
    'payment_authorization_expired',
    'refund_pending',
    'manual_review',
  ],
  supplier_order_pending: [
    'supplier_accepted',
    'supplier_rejected',
    'supplier_timeout',
    'partial_supplier_acceptance',
    'manual_review',
  ],
  supplier_accepted: [
    'payment_captured',
    'refund_pending',
    'manual_review',
  ],
  payment_captured: [
    'dispatched',
    'partial_dispatch',
    'refund_pending',
    'manual_review',
  ],
  partial_dispatch: [
    'dispatched',
    'delivered',
    'refund_pending',
    'manual_review',
  ],
  dispatched: [
    'delivered',
    'refund_pending',
    'manual_review',
  ],
  delivered: [
    'refund_pending',
    'manual_review',
  ],
  supplier_rejected: [
    'refund_pending',
    'manual_review',
  ],
  supplier_timeout: [
    'refund_pending',
    'manual_review',
  ],
  payment_authorization_expired: [
    'refund_pending',
    'manual_review',
  ],
  partial_supplier_acceptance: [
    'payment_captured',
    'refund_pending',
    'manual_review',
  ],
  refund_pending: [
    'refunded',
    'manual_review',
  ],
  refunded: [
    'manual_review',
  ],
  manual_review: [
    'supplier_order_pending',
    'supplier_accepted',
    'payment_captured',
    'dispatched',
    'refund_pending',
    'refunded',
  ],
};

export function isValidTransition(from: OrderState, to: OrderState): boolean {
  if (from === to) return true; // Handled as idempotent replay
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
