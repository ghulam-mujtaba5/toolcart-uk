import React from 'react';
import { ImporterClient } from './importer-client';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Truck, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Catalog Feeds & Ingestion Center | ToolCart Admin',
  description: 'Manage UK distributor catalog feeds, automated pricing sync, and batch inventory imports.',
};

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Supplier Feeds &amp; Catalog Ingestion
            </h2>
            <Badge variant="lime">Launch Ready</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Automated UK distributor synchronization, case pack validation, and wholesale margin controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tc-surface-soft border border-tc-primary/20 text-xs font-semibold text-tc-primary">
            <Truck className="w-3.5 h-3.5" />
            <span>Status International (UK) Active</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Wholesale Isolation Guarded</span>
          </div>
        </div>
      </div>

      <ImporterClient />
    </div>
  );
}
