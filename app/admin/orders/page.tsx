import React from 'react';
import { getDb } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { OrdersTable } from '@/components/admin/orders-table';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';

export const revalidate = 0;

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
            Retail order state machine tracking, supplier dropship fulfillment, and automated refund console.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="lime">Idempotency Gated</Badge>
        </div>
      </div>

      {/* Interactive Orders Table wrapped in Error Boundary */}
      <AdminErrorBoundary
        title="Error Displaying Orders"
        fallbackMessage="An unexpected issue occurred while loading retail orders. Underlying database records are preserved."
      >
        <OrdersTable orders={orders} />
      </AdminErrorBoundary>
    </div>
  );
}
