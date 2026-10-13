import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderState } from '@/types/order';
import { formatGbp } from '@/lib/catalog/pricing';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export const revalidate = 0;

function getOrderStateBadge(state: OrderState) {
  switch (state) {
    case 'delivered':
      return <Badge variant="success">Delivered</Badge>;
    case 'dispatched':
    case 'partial_dispatch':
      return <Badge variant="lime">Dispatched</Badge>;
    case 'payment_captured':
      return <Badge variant="success">Paid</Badge>;
    case 'supplier_accepted':
      return <Badge variant="lime">Supplier Accepted</Badge>;
    case 'supplier_order_pending':
    case 'checkout_authorized':
      return <Badge variant="warning">Action Required</Badge>;
    case 'supplier_rejected':
    case 'supplier_timeout':
    case 'payment_authorization_expired':
      return <Badge variant="danger">Failed</Badge>;
    case 'refund_pending':
      return <Badge variant="warning">Refund Pending</Badge>;
    case 'refunded':
      return <Badge variant="neutral">Refunded</Badge>;
    case 'manual_review':
      return <Badge variant="danger">Manual Review</Badge>;
    case 'cart_pending':
    default:
      return <Badge variant="neutral">{state}</Badge>;
  }
}

export default async function AdminOrdersPage() {
  const db = getDb();
  const orders = await db.orders.getAll();

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Order Operations &amp; Fulfillment
            </h2>
            <Badge variant="neutral">{orders.length} Orders</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Supplier dropship order state machine tracking and automated compensation console.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="lime">Idempotency Gated</Badge>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white">
              <tr>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Order #</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Date</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Customer</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Supplier ID</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Items</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Total (Inc. VAT)</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Status</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-tc-text-secondary">
                    No orders currently in the database store.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-tc-surface-soft/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-tc-primary">
                      {o.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-tc-text-secondary whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="flex flex-col">
                        <span className="font-semibold text-tc-ink truncate">
                          {o.shipping_address?.full_name || 'Customer'}
                        </span>
                        <span className="text-[11px] text-tc-text-secondary truncate">
                          {o.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-tc-text-secondary whitespace-nowrap">
                      {o.supplier_id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-tc-ink">
                        {o.items?.length || 0} lines
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-tc-ink tabular-nums whitespace-nowrap">
                      {formatGbp(o.total_inc_vat_gbp)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getOrderStateBadge(o.state)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="h-8 text-xs px-3"
                      >
                        <Link href={`/admin/orders/${o.id}`}>
                          Fulfill &amp; Manage
                          <ArrowRight className="w-3.5 h-3.5 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
