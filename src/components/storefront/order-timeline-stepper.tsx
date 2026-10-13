'use client';

import React, { useState } from 'react';
import { OrderState, OrderAuditLog } from '@/types/order';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Package,
  Truck,
  CreditCard,
  Building2,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  FulfillmentStepperMotion,
  type FulfillmentMotionStage,
} from '@/components/motion';

interface OrderTimelineStepperProps {
  orderId: string;
  initialState?: OrderState;
}

const HAPPY_PATH: OrderState[] = [
  'cart_pending',
  'checkout_authorized',
  'supplier_order_pending',
  'supplier_accepted',
  'payment_captured',
  'dispatched',
  'delivered',
];

const ALL_STATES: OrderState[] = [
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

const STATE_DETAILS: Record<
  OrderState,
  { label: string; description: string; badge: string; color: string }
> = {
  cart_pending: {
    label: 'Cart Pending',
    description: 'Items staged in customer basket.',
    badge: 'Draft',
    color: 'bg-tc-canvas text-tc-graphite border-tc-border',
  },
  checkout_authorized: {
    label: 'Checkout Authorized',
    description: 'Stripe test payment hold placed.',
    badge: 'Authorized',
    color: 'bg-tc-surface-soft text-tc-primary border-[#C8D9F9]',
  },
  supplier_order_pending: {
    label: 'Supplier Order Pending',
    description: 'PO generated; awaiting Status International confirmation.',
    badge: 'Pending Supplier',
    color: 'bg-[#FFF7E8] text-tc-warning border-[#E8CB91]',
  },
  supplier_accepted: {
    label: 'Supplier Accepted',
    description: 'Status International confirmed line availability.',
    badge: 'Confirmed',
    color: 'bg-[#E8F5E9] text-tc-success border-[#A3D9B5]',
  },
  payment_captured: {
    label: 'Payment Captured',
    description: 'Stripe charge captured following supplier approval.',
    badge: 'Paid',
    color: 'bg-[#E8F5E9] text-tc-success border-[#A3D9B5]',
  },
  dispatched: {
    label: 'Dispatched from Hub',
    description: 'Carrier collection from West Yorkshire facility.',
    badge: 'In Transit',
    color: 'bg-tc-surface-soft text-tc-primary border-[#C8D9F9]',
  },
  delivered: {
    label: 'Delivered',
    description: 'Package delivered to recipient site.',
    badge: 'Delivered',
    color: 'bg-tc-action-lime text-tc-ink border-tc-ink',
  },
  supplier_rejected: {
    label: 'Supplier Rejected',
    description: 'Item stock unavailable; auto-cancellation triggered.',
    badge: 'Cancelled',
    color: 'bg-[#FEECEB] text-tc-error border-[#FECDCA]',
  },
  supplier_timeout: {
    label: 'Supplier SLA Timeout',
    description: 'No response from supplier within 24h SLA window.',
    badge: 'Timeout',
    color: 'bg-[#FEECEB] text-tc-error border-[#FECDCA]',
  },
  payment_authorization_expired: {
    label: 'Authorization Expired',
    description: 'Payment hold expired prior to supplier acceptance.',
    badge: 'Expired',
    color: 'bg-[#FEECEB] text-tc-error border-[#FECDCA]',
  },
  partial_supplier_acceptance: {
    label: 'Partial Acceptance',
    description: 'Subset of lines confirmed by supplier.',
    badge: 'Partial',
    color: 'bg-[#FFF7E8] text-tc-warning border-[#E8CB91]',
  },
  partial_dispatch: {
    label: 'Partially Dispatched',
    description: 'First consignment dispatched; remainder pending.',
    badge: 'Partial Transit',
    color: 'bg-tc-surface-soft text-tc-primary border-[#C8D9F9]',
  },
  refund_pending: {
    label: 'Refund Pending',
    description: 'Refund instruction transmitted to Stripe API.',
    badge: 'Refunding',
    color: 'bg-[#FFF7E8] text-tc-warning border-[#E8CB91]',
  },
  refunded: {
    label: 'Full Refund Issued',
    description: 'Payment voided or refunded to customer card.',
    badge: 'Refunded',
    color: 'bg-[#E8F5E9] text-tc-success border-[#A3D9B5]',
  },
  manual_review: {
    label: 'Manual Review Required',
    description: 'Discrepancy flagged for operations supervisor.',
    badge: 'Review',
    color: 'bg-[#FFF7E8] text-tc-warning border-[#E8CB91]',
  },
};

export function OrderTimelineStepper({
  orderId,
  initialState = 'supplier_order_pending',
}: OrderTimelineStepperProps) {
  const [currentState, setCurrentState] = useState<OrderState>(initialState);
  const [auditLogs, setAuditLogs] = useState<OrderAuditLog[]>([
    {
      id: 'log_1',
      order_id: orderId,
      from_state: 'cart_pending',
      to_state: 'checkout_authorized',
      trigger: 'CUSTOMER_CHECKOUT_AUTHORIZED',
      actor: 'checkout_session',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log_2',
      order_id: orderId,
      from_state: 'checkout_authorized',
      to_state: 'supplier_order_pending',
      trigger: 'DISPATCH_PO_TRANSMITTED',
      actor: 'supplier_adapter_status_uk',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
  ]);

  const transitionTo = (nextState: OrderState, triggerName: string) => {
    const newLog: OrderAuditLog = {
      id: `log_${Date.now()}`,
      order_id: orderId,
      from_state: currentState,
      to_state: nextState,
      trigger: triggerName,
      actor: 'state_machine_simulator',
      created_at: new Date().toISOString(),
    };
    setAuditLogs((prev) => [...prev, newLog]);
    setCurrentState(nextState);
  };

  const details = STATE_DETAILS[currentState] || STATE_DETAILS.supplier_order_pending;
  const currentStepIndex = HAPPY_PATH.indexOf(currentState);

  return (
    <div className="space-y-8">
      {/* Current State Card */}
      <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <FulfillmentStepperMotion
            stage={
              currentState === 'dispatched' || currentState === 'partial_dispatch'
                ? 'transit'
                : currentState === 'delivered'
                ? 'delivered'
                : 'packing'
            }
            size={56}
          />
          <div>
            <span className="text-[11px] font-mono font-bold text-tc-text-secondary uppercase">
              Order Status State Machine
            </span>
            <div className="flex items-center gap-3 mt-1">
              <h2 className="font-heading font-extrabold text-2xl text-tc-ink">
                {details.label}
              </h2>
              <span
                className={cn(
                  'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                  details.color
                )}
              >
                {details.badge}
              </span>
            </div>
            <p className="text-xs text-tc-text-secondary mt-1">{details.description}</p>
          </div>
        </div>

        <div className="text-xs text-tc-text-secondary text-right shrink-0">
          <p className="font-bold text-tc-ink">Supplier: Status International (UK)</p>
          <p className="text-[11px] font-mono">PO Ref: PO-{orderId}</p>
        </div>
      </div>

      {/* Visual Stepper (Happy Path) */}
      <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-tc-ink uppercase tracking-wider">
          Fulfillment Timeline Stepper
        </h3>

        <div className="relative flex items-center justify-between overflow-x-auto pb-2">
          {HAPPY_PATH.map((state, idx) => {
            const isCompleted = currentStepIndex >= idx;
            const isCurrent = currentState === state;
            const stepInfo = STATE_DETAILS[state];

            return (
              <div key={state} className="flex flex-col items-center min-w-[90px] relative px-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border transition-colors',
                    isCurrent
                      ? 'bg-tc-action-lime text-tc-ink border-tc-ink ring-4 ring-tc-action-lime/30'
                      : isCompleted
                      ? 'bg-tc-primary text-white border-tc-primary'
                      : 'bg-tc-canvas text-tc-text-secondary border-tc-border'
                  )}
                >
                  {isCompleted && !isCurrent ? (
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  ) : (
                    idx + 1
                  )}
                </div>

                <span
                  className={cn(
                    'text-[10px] font-semibold text-center mt-2 leading-tight',
                    isCurrent ? 'text-tc-ink font-bold' : isCompleted ? 'text-tc-primary' : 'text-tc-text-secondary'
                  )}
                >
                  {stepInfo.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive State Machine Simulator (For QA / Auditor Verification) */}
      <div className="bg-tc-surface-soft border border-[#C8D9F9] rounded-card p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-tc-primary uppercase font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>STATE MACHINE SIMULATOR (ALL 13 STATES)</span>
          </div>
          <span className="text-[11px] text-tc-text-secondary">
            architecture/SUPPLIER_ORDER_STATE_MACHINE.md
          </span>
        </div>

        <p className="text-xs text-tc-graphite leading-relaxed">
          Simulate real supplier webhooks, SLA timeouts, auto-cancellations, and dispatch transitions:
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('supplier_accepted', 'SUPPLIER_ACCEPTED_FEED')}
            className="text-xs"
          >
            Simulate: Supplier Accepted
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('payment_captured', 'PAYMENT_CAPTURE_SUCCEEDED')}
            className="text-xs"
          >
            Simulate: Payment Captured
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('dispatched', 'SUPPLIER_DISPATCH_CONFIRMED')}
            className="text-xs"
          >
            Simulate: Dispatched
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('delivered', 'CARRIER_DELIVERY_POD')}
            className="text-xs"
          >
            Simulate: Delivered
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('supplier_rejected', 'SUPPLIER_REJECTED_OUT_OF_STOCK')}
            className="text-xs text-tc-error border-tc-error/40 hover:bg-tc-error/10"
          >
            Simulate: Supplier Rejection
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('supplier_timeout', 'SUPPLIER_SLA_24H_EXPIRED')}
            className="text-xs text-tc-error border-tc-error/40 hover:bg-tc-error/10"
          >
            Simulate: SLA Timeout
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => transitionTo('refunded', 'AUTO_REFUND_EXECUTED')}
            className="text-xs text-tc-success border-tc-success/40 hover:bg-tc-success/10"
          >
            Simulate: Auto-Refund
          </Button>
        </div>
      </div>

      {/* Append-Only Order Audit Log */}
      <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-tc-ink uppercase tracking-wider">
          Append-Only Audit Log (`order_audit_logs`)
        </h3>

        <div className="divide-y divide-tc-border/60">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between text-xs">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-tc-primary">{log.trigger}</span>
                  <span className="text-tc-text-secondary">({log.from_state} → {log.to_state})</span>
                </div>
                <p className="text-[11px] text-tc-text-secondary">Actor: {log.actor}</p>
              </div>

              <span className="font-mono text-[11px] text-tc-text-secondary tabular-nums">
                {new Date(log.created_at).toLocaleTimeString('en-GB')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
