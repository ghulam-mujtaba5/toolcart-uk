'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { OrderRecord, OrderState } from '@/types/order';
import { Button } from '@/components/ui/button';
import {
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Truck,
  PackageCheck,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';

export interface OrderActionBarProps {
  order: OrderRecord;
  onTransitionComplete?: () => void;
}

export function OrderActionBar({ order, onTransitionComplete }: OrderActionBarProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [carrier, setCarrier] = useState(order.carrier || 'DPD');
  const [showTrackingPrompt, setShowTrackingPrompt] = useState(false);

  const handleTransition = async (
    targetState: OrderState,
    meta?: Record<string, unknown>
  ) => {
    try {
      setLoading(true);
      setError(null);

      const idempotencyKey = `${order.id}#${order.supplier_id}#${targetState}`;

      const res = await fetch(`/api/admin/orders/${order.id}/transition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_state: targetState,
          trigger: 'admin',
          actor: 'admin:ops@toolcart.co.uk',
          metadata: {
            ...meta,
            reason: meta?.reason || `Manual admin action from dashboard`,
          },
          idempotency_key: idempotencyKey,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Transition failed with status ${res.status}`);
      }

      router.refresh();
      if (onTransitionComplete) {
        onTransitionComplete();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'State transition failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleTransition('dispatched', {
      carrier,
      tracking_number: trackingNumber,
    });
    setShowTrackingPrompt(false);
  };

  return (
    <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-tc-border pb-3">
        <div>
          <h3 className="font-heading font-bold text-sm text-tc-ink">
            Fulfillment & State Controls
          </h3>
          <p className="text-xs text-tc-text-secondary">
            Execute state machine transitions with automated side-effects and append-only audit logging.
          </p>
        </div>
        <div className="text-right font-mono text-xs text-tc-primary font-bold">
          Current State: {order.state}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* State-specific transition action buttons */}
      <div className="flex flex-wrap items-center gap-3">
        {order.state === 'checkout_authorized' && (
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={() => handleTransition('supplier_order_pending')}
          >
            <Send className="w-3.5 h-3.5 mr-1.5" />
            Send PO to Supplier (status-uk)
          </Button>
        )}

        {order.state === 'supplier_order_pending' && (
          <>
            <Button
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={() => handleTransition('supplier_accepted')}
            >
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              Supplier Accepted (Auto-Capture Payment)
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={loading}
              onClick={() =>
                handleTransition('supplier_rejected', {
                  reason: 'Supplier warehouse rejected order line fulfillment',
                })
              }
            >
              <XCircle className="w-3.5 h-3.5 mr-1.5" />
              Supplier Rejected (Auto-Refund)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              isLoading={loading}
              onClick={() =>
                handleTransition('supplier_timeout', {
                  reason: 'No supplier response within 120-minute SLA window',
                })
              }
            >
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Supplier Timeout
            </Button>
          </>
        )}

        {order.state === 'payment_captured' && (
          <>
            {!showTrackingPrompt ? (
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                onClick={() => setShowTrackingPrompt(true)}
              >
                <Truck className="w-3.5 h-3.5 mr-1.5" />
                Mark Dispatched (Enter Tracking)
              </Button>
            ) : null}
          </>
        )}

        {order.state === 'dispatched' && (
          <Button
            variant="primary"
            size="sm"
            isLoading={loading}
            onClick={() => handleTransition('delivered')}
          >
            <PackageCheck className="w-3.5 h-3.5 mr-1.5" />
            Mark Delivered (Carrier Proof)
          </Button>
        )}

        {order.state === 'refund_pending' && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={loading}
            onClick={() => handleTransition('refunded')}
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Confirm Refund Settlement
          </Button>
        )}

        {/* Global Action: Manual Review Toggle */}
        {order.state !== 'manual_review' && order.state !== 'delivered' && (
          <Button
            variant="secondary"
            size="sm"
            isLoading={loading}
            onClick={() =>
              handleTransition('manual_review', {
                reason: 'Operator flagged for manual inspection',
              })
            }
          >
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-tc-warning" />
            Flag for Manual Review
          </Button>
        )}

        {order.state === 'manual_review' && (
          <>
            <Button
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={() =>
                handleTransition('supplier_order_pending', {
                  reason: 'Manual inspection cleared by operator',
                })
              }
            >
              Resume: Order Pending
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={loading}
              onClick={() =>
                handleTransition('refund_pending', {
                  reason: 'Manual review rejected order',
                })
              }
            >
              Issue Full Refund
            </Button>
          </>
        )}
      </div>

      {/* Tracking Prompt Form */}
      {showTrackingPrompt && (
        <form
          onSubmit={handleDispatchSubmit}
          className="p-4 bg-tc-surface-soft border border-tc-border rounded-lg space-y-3"
        >
          <h4 className="text-xs font-bold uppercase tracking-wider text-tc-primary">
            Enter Carrier & Tracking Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-tc-text-secondary uppercase mb-1">
                Carrier
              </label>
              <select
                value={carrier}
                onChange={(e) => setCarrier(e.target.value)}
                className="w-full h-9 px-2 bg-white border border-tc-border rounded text-xs text-tc-ink"
              >
                <option value="DPD">DPD Next Day</option>
                <option value="Royal Mail">Royal Mail Tracked 24/48</option>
                <option value="DHL Express">DHL Express</option>
                <option value="Supplier Direct">Supplier Fleet Direct</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-tc-text-secondary uppercase mb-1">
                Tracking Number
              </label>
              <input
                type="text"
                required
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DPD-UK-882910"
                className="w-full h-9 px-2 bg-white border border-tc-border rounded text-xs text-tc-ink"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" size="sm" isLoading={loading}>
              Confirm Dispatch
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowTrackingPrompt(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
