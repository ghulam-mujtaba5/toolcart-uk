import React from 'react';
import Link from 'next/link';
import { getDb } from '@/lib/db';
import { ProductTable } from '@/components/admin/product-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, ShieldAlert } from 'lucide-react';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const db = getDb();
  const products = await db.products.getAll();

  // Fetch wholesale costs strictly on the server
  const wholesaleMap: Record<string, number> = {};
  for (const p of products) {
    const offer = await db.products.getWholesaleOffer(p.supplier_sku);
    if (offer) {
      wholesaleMap[p.supplier_sku] = offer.unit_cost_ex_vat_gbp;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Product Catalog Manager
            </h2>
            <Badge variant="neutral">{products.length} Quoted SKUs</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Supplier baseline imported from Status International (UK) Ltd. Wholesale margins and sellability review controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="sm" asChild>
            <Link href="/admin/import">
              <UploadCloud className="w-4 h-4 mr-1.5" />
              Batch Ingestion (CSV / JSON)
            </Link>
          </Button>
        </div>
      </div>

      {/* Direct Dispatch Governance Notice */}
      <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 leading-relaxed">
          <strong className="font-bold">Catalog Governance Rule:</strong> All 115 SKUs default to{' '}
          <code className="bg-amber-100/80 px-1 py-0.5 rounded font-mono font-bold text-amber-800">
            sellability_status: draft
          </code>
          . In accordance with Launch Gate 4, no products may be marked as approved or published to live
          storefront channels until a signed supplier direct-dispatch SLA agreement is on file.
        </div>
      </div>

      {/* Product Table */}
      <ProductTable products={products} wholesaleOffers={wholesaleMap} />
    </div>
  );
}
