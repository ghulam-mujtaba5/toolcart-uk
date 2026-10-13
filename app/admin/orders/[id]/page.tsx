import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { OrderActionBar } from '@/components/admin/order-action-bar';
import { AuditTimeline } from '@/components/admin/audit-timeline';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Truck, MapPin, Mail, Hash } from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

export const revalidate = 0;

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getDb();
  const order = await db.orders.getById(params.id);

  if (!order) {
    notFound();
  }

  const poReference =
    order.supplier_po_reference || `PO-${order.supplier_id}-${order.order_number}`;
  const idempotencyKey = `${order.id}#${order.supplier_id}`;

  return (
    <div className="space-y-6">
      {/* Top Header bar with Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/orders">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Orders
            </Link>
          </Button>
          <div className="h-6 w-px bg-tc-border" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-base text-tc-ink">
                Order {order.order_number}
              </span>
              <span className="font-mono text-xs text-tc-text-secondary">({order.id})</span>
              <Badge variant="lime">{order.state}</Badge>
            </div>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Placed on {new Date(order.created_at).toLocaleString('en-GB')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="neutral">PO Key: {idempotencyKey}</Badge>
        </div>
      </div>

      {/* Interactive State Machine Action Controls */}
      <OrderActionBar order={order} />

      {/* Grid: Order PO Details & Customer Shipping */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2/3): PO Items & Dispatch Card */}
        <div className="lg:col-span-2 space-y-6">
          {/* Supplier PO Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-tc-border pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-tc-primary" />
                <h3 className="font-heading font-bold text-sm text-tc-ink">
                  Supplier Purchase Order ({poReference})
                </h3>
              </div>
              <Badge variant="neutral">Supplier: {order.supplier_id}</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs divide-y divide-tc-border">
                <thead className="bg-[#182336] text-white">
                  <tr>
                    <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Supplier SKU</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[11px]">Item Title</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[11px] text-center">Qty</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[11px] text-right">Price Ex. VAT</th>
                    <th className="py-2.5 px-3 font-bold uppercase text-[11px] text-right">Total Inc. VAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border/60 bg-white">
                  {order.items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-tc-text-secondary">
                        No product lines attached.
                      </td>
                    </tr>
                  ) : (
                    order.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-tc-surface-soft">
                        <td className="py-2.5 px-3 font-mono font-bold text-tc-primary">
                          {item.supplier_sku}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-tc-ink max-w-xs truncate">
                          {item.title}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-tc-ink">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-tc-text-secondary">
                          {formatGbp(item.unit_price_ex_vat)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-tc-ink">
                          {formatGbp(item.total_inc_vat)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-tc-border flex justify-end">
              <div className="w-64 space-y-1.5 text-xs">
                <div className="flex justify-between text-tc-text-secondary">
                  <span>Subtotal Ex. VAT:</span>
                  <span className="font-mono">{formatGbp(order.subtotal_ex_vat_gbp)}</span>
                </div>
                <div className="flex justify-between text-tc-text-secondary">
                  <span>UK VAT (20%):</span>
                  <span className="font-mono">{formatGbp(order.vat_amount_gbp)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm text-tc-ink pt-1 border-t border-tc-border">
                  <span>Order Total:</span>
                  <span className="font-mono text-tc-primary">{formatGbp(order.total_inc_vat_gbp)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Carrier & Tracking Details */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2 border-b border-tc-border pb-3">
              <Truck className="w-4 h-4 text-tc-primary" />
              <h3 className="font-heading font-bold text-sm text-tc-ink">
                Fulfillment Logistics &amp; Carrier Dispatch
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-tc-text-secondary block mb-1">Carrier Provider:</span>
                <span className="font-bold text-tc-ink text-sm">
                  {order.carrier || 'Standard Courier (Pending)'}
                </span>
              </div>
              <div>
                <span className="text-tc-text-secondary block mb-1">Carrier Tracking Number:</span>
                <span className="font-mono font-bold text-tc-ink text-sm">
                  {order.tracking_number || 'NOT_YET_DISPATCHED'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right (1/3): Shipping Address & Audit Timeline */}
        <div className="space-y-6">
          {/* Customer & Address Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-3 text-xs">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Customer &amp; Delivery Address
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                <div className="text-tc-ink leading-relaxed">
                  <strong className="block font-bold">
                    {order.shipping_address?.full_name}
                  </strong>
                  {order.shipping_address?.company_name && (
                    <span className="block text-tc-text-secondary font-semibold">
                      {order.shipping_address.company_name}
                    </span>
                  )}
                  <span>{order.shipping_address?.address_line_1}</span>
                  {order.shipping_address?.address_line_2 && (
                    <span className="block">{order.shipping_address.address_line_2}</span>
                  )}
                  <span className="block">
                    {order.shipping_address?.city}, {order.shipping_address?.postcode}
                  </span>
                  <span className="block text-tc-text-secondary">
                    {order.shipping_address?.country}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-tc-border">
                <Mail className="w-3.5 h-3.5 text-tc-text-secondary" />
                <span className="font-mono text-tc-ink">{order.customer_email}</span>
              </div>
            </div>
          </div>

          {/* Append-Only Audit Timeline */}
          <AuditTimeline logs={order.audit_logs} />
        </div>
      </div>
    </div>
  );
}
