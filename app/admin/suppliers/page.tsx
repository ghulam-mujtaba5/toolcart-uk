import React from 'react';
import { getDb } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Truck, Clock, ShieldAlert, Mail, Package, FileCheck } from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

export const revalidate = 0;

export default async function AdminSuppliersPage() {
  const db = getDb();
  const suppliers = await db.suppliers.getAll();

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Supplier Directory &amp; Carriage Terms
            </h2>
            <Badge variant="neutral">{suppliers.length} Configured Vendor</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Supplier dropship integration parameters, stock feed TTL policies, and wholesale carriage thresholds.
          </p>
        </div>

        <Badge variant="lime">Launch Gate 4 Enforced</Badge>
      </div>

      {/* Supplier Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {suppliers.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-tc-border pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-tc-primary text-white flex items-center justify-center font-bold text-lg font-heading">
                  SI
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-tc-ink">{s.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-tc-text-secondary mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{s.contact_email}</span>
                  </div>
                </div>
              </div>

              <div>
                {s.direct_dispatch_agreement_signed ? (
                  <Badge variant="success">SLA Signed</Badge>
                ) : (
                  <Badge variant="warning">SLA Pending</Badge>
                )}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-tc-surface-soft rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Quoted Catalog SKUs</span>
                <span className="font-heading font-bold text-lg text-tc-ink mt-0.5 block">
                  {s.quoted_sku_count} lines
                </span>
                <span className="text-[10px] text-tc-text-secondary">Doc Date: {s.quote_doc_date}</span>
              </div>

              <div className="p-3 bg-tc-surface-soft rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Stock Feed TTL</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-4 h-4 text-tc-primary" />
                  <span className="font-heading font-bold text-lg text-tc-ink">
                    {s.stock_feed_ttl_minutes} min
                  </span>
                </div>
                <span className="text-[10px] text-tc-success font-semibold">Feed Status: Fresh</span>
              </div>

              <div className="p-3 bg-tc-surface-soft rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Carriage Paid Floor</span>
                <span className="font-heading font-bold text-lg text-tc-ink mt-0.5 block">
                  {formatGbp(s.carriage_paid_threshold_gbp)}
                </span>
                <span className="text-[10px] text-tc-text-secondary">Ex. VAT free carriage</span>
              </div>

              <div className="p-3 bg-tc-surface-soft rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Standard Carriage</span>
                <span className="font-heading font-bold text-lg text-tc-ink mt-0.5 block">
                  {formatGbp(s.standard_carriage_gbp)}
                </span>
                <span className="text-[10px] text-tc-text-secondary">Lead Time: {s.lead_time_days}</span>
              </div>
            </div>

            {/* Governance Warning Box */}
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong>Supplier Dropship Gate:</strong> Direct dispatch contract has not yet been executed with
                Status International (UK) Ltd. Inventory remains uncommitted and quotes are subject to warehouse verification.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
