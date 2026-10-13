import React from 'react';
import { ImporterClient } from './importer-client';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Catalog Ingestion & Schema Validator | ToolCart Admin',
  description: 'Batch intake CSV/JSON validator for supplier catalogs with case math checks and ligature normalization.',
};

export default function AdminImportPage() {
  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Supplier Catalog Ingestion &amp; Contract Validator
            </h2>
            <Badge variant="lime">Zod + Draft 2020-12</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Automated Unicode ligature normalization, case-vs-unit pack math validation, and nullable carton barcode intake.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-tc-primary" />
          <span className="text-xs text-tc-text-secondary font-medium">
            Wholesale Isolation Enforced
          </span>
        </div>
      </div>

      <ImporterClient />
    </div>
  );
}
