import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  User,
  Package,
  Building2,
  Clock,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const SAMPLE_ORDERS = [
  {
    id: 'TC-948201',
    date: '2026-10-11',
    status: 'dispatched',
    statusLabel: 'Dispatched from Hub',
    itemsCount: 4,
    totalIncVat: 28.5,
    supplier: 'Status International (UK) Ltd',
  },
  {
    id: 'TC-942104',
    date: '2026-10-08',
    status: 'delivered',
    statusLabel: 'Delivered',
    itemsCount: 7,
    totalIncVat: 64.2,
    supplier: 'Status International (UK) Ltd',
  },
];

export default function CustomerAccountPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Customer Account</span>
      </div>

      {/* Header Profile Box */}
      <div className="bg-white rounded-card border border-tc-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary font-heading font-extrabold text-xl">
            TC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-extrabold text-2xl text-tc-ink">
                Demo Contractor Account
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary font-bold">
                Trade Customer
              </span>
            </div>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              contractor@toolcart-staging.co.uk • Leeds, UK
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/trade">Trade Verification Status</Link>
          </Button>
        </div>
      </div>

      {/* Orders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-tc-border pb-3">
          <h2 className="font-heading font-extrabold text-xl text-tc-ink flex items-center gap-2">
            <Package className="w-5 h-5 text-tc-primary" />
            <span>Recent Orders &amp; Fulfillment Tracking</span>
          </h2>
          <span className="text-xs text-tc-text-secondary">
            Click any order to view the live 13-state timeline
          </span>
        </div>

        {SAMPLE_ORDERS.length > 0 ? (
          <div className="bg-white rounded-card border border-tc-border divide-y divide-tc-border/60 shadow-xs overflow-hidden">
            {SAMPLE_ORDERS.map((order) => (
              <div
                key={order.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-tc-canvas/40 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-heading font-bold text-base text-tc-ink">
                      Order #{order.id}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-tc-surface-soft text-tc-primary border border-[#C8D9F9]">
                      {order.statusLabel}
                    </span>
                  </div>
                  <div className="text-xs text-tc-text-secondary flex items-center gap-2">
                    <span>Placed on {order.date}</span>
                    <span>•</span>
                    <span>{order.itemsCount} items</span>
                    <span>•</span>
                    <span>Supplier: {order.supplier}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-5">
                  <span className="font-heading font-extrabold text-base text-tc-ink tabular-nums">
                    £{order.totalIncVat.toFixed(2)} inc. VAT
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/account/orders/${order.id}`} className="flex items-center gap-1.5 text-xs font-semibold">
                      <span>Track State Machine</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-card border border-tc-border p-12 text-center space-y-3">
            <Package className="w-10 h-10 text-tc-text-secondary mx-auto" />
            <h3 className="font-heading font-bold text-base text-tc-ink">No orders found</h3>
            <p className="text-xs text-tc-text-secondary max-w-sm mx-auto">
              You haven&apos;t placed any trade orders yet. Browse our verified tool catalog to get started.
            </p>
            <div className="pt-2">
              <Button variant="primary" size="sm" asChild>
                <Link href="/tools">Browse Tools</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
