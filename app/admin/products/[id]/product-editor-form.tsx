'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicProductDTO, WholesaleSupplierOffer, SellabilityStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Save, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { formatGbp } from '@/lib/catalog/pricing';

export interface ProductEditorFormProps {
  product: PublicProductDTO;
  wholesaleOffer: WholesaleSupplierOffer | null;
}

export function ProductEditorForm({ product, wholesaleOffer }: ProductEditorFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description);
  const [sellabilityStatus, setSellabilityStatus] = useState<SellabilityStatus>(
    product.sellability_status || 'draft'
  );
  const [gtin, setGtin] = useState(product.gtin || '');
  const [cartonBarcode, setCartonBarcode] = useState(product.carton_barcode || '');
  const [mpn, setMpn] = useState(product.mpn || product.supplier_sku);
  const [unitsPerCase, setUnitsPerCase] = useState(product.units_per_case);
  const [retailPriceIncVat, setRetailPriceIncVat] = useState(product.retail_price_inc_vat_gbp);
  const [complianceVerified, setComplianceVerified] = useState(product.compliance_verified);
  const [imageLicenseVerified, setImageLicenseVerified] = useState(product.image_license_verified);
  const [directDispatchVerified, setDirectDispatchVerified] = useState(
    product.supplier_direct_dispatch_verified || false
  );

  // Wholesale cost
  const unitCost = wholesaleOffer ? wholesaleOffer.unit_cost_ex_vat_gbp : 0;
  const retailPriceExVat = retailPriceIncVat / 1.2;
  const grossMarginPct =
    retailPriceExVat > 0 ? ((retailPriceExVat - unitCost) / retailPriceExVat) * 100 : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          sellability_status: sellabilityStatus,
          gtin,
          carton_barcode: cartonBarcode || undefined,
          mpn,
          units_per_case: unitsPerCase,
          retail_price_inc_vat_gbp: retailPriceIncVat,
          retail_price_ex_vat_gbp: retailPriceExVat,
          compliance_verified: complianceVerified,
          image_license_verified: imageLicenseVerified,
          supplier_direct_dispatch_verified: directDispatchVerified,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to update product');
      }

      setFeedback({ type: 'success', message: 'Product updated successfully.' });
      router.refresh();
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error updating product',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Top Header bar with Back button and Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Catalog
            </Link>
          </Button>
          <div className="h-6 w-px bg-tc-border" />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-sm text-tc-primary">
                {product.supplier_sku}
              </span>
              <Badge
                variant={
                  sellabilityStatus === 'approved'
                    ? 'success'
                    : sellabilityStatus === 'needs_review'
                    ? 'warning'
                    : sellabilityStatus === 'blocked'
                    ? 'danger'
                    : 'neutral'
                }
              >
                {sellabilityStatus}
              </Badge>
            </div>
            <p className="text-xs text-tc-text-secondary truncate max-w-lg mt-0.5">
              {product.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" variant="primary" size="sm" isLoading={loading}>
            <Save className="w-4 h-4 mr-1.5" />
            Save Changes
          </Button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <Check className="w-4 h-4 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Core Attributes & Barcodes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Core Info Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Product Information
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Product Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    disabled
                    value={product.category}
                    className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-text-secondary cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                    Brand
                  </label>
                  <input
                    type="text"
                    disabled
                    value={product.brand}
                    className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-text-secondary cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Barcodes & Logistics Packaging Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Barcodes &amp; Outer Packaging
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Retail Unit GTIN (EAN-13)
                </label>
                <input
                  type="text"
                  value={gtin}
                  onChange={(e) => setGtin(e.target.value)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Outer Carton Barcode (ITF-14 / EAN)
                </label>
                <input
                  type="text"
                  value={cartonBarcode}
                  onChange={(e) => setCartonBarcode(e.target.value)}
                  placeholder="Nullable for single unit cartons"
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Manufacturer Part Number (MPN)
                </label>
                <input
                  type="text"
                  value={mpn}
                  onChange={(e) => setMpn(e.target.value)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Units Per Outer Case
                </label>
                <input
                  type="number"
                  min={1}
                  value={unitsPerCase}
                  onChange={(e) => setUnitsPerCase(parseInt(e.target.value, 10) || 1)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Structured Specifications
            </h3>

            {Object.keys(product.specifications || {}).length === 0 ? (
              <p className="text-xs text-tc-text-secondary">
                No structured specs extracted from catalog line.
              </p>
            ) : (
              <div className="border border-tc-border rounded-lg overflow-hidden">
                <table className="w-full text-xs divide-y divide-tc-border">
                  <tbody className="divide-y divide-tc-border/60">
                    {Object.entries(product.specifications).map(([key, val]) => (
                      <tr key={key} className="hover:bg-tc-surface-soft">
                        <td className="py-2 px-3 font-semibold text-tc-ink bg-tc-canvas w-1/3">
                          {key}
                        </td>
                        <td className="py-2 px-3 text-tc-text-secondary font-mono">{val}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Governance, Pricing Calculator & Compliance */}
        <div className="space-y-6">
          {/* Sellability Governance Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Sellability Status
            </h3>

            <div>
              <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1.5">
                Catalog Status Review
              </label>
              <select
                value={sellabilityStatus}
                onChange={(e) => setSellabilityStatus(e.target.value as SellabilityStatus)}
                className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-semibold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
              >
                <option value="draft">Draft (Quotation Only - Safe)</option>
                <option value="needs_review">Needs Review (Specs Incomplete)</option>
                <option value="approved">Approved (Live Storefront)</option>
                <option value="blocked">Blocked (Supplier Issue / Compliance Failure)</option>
              </select>
            </div>

            <div className="p-3 bg-tc-surface-soft rounded-lg text-[11px] text-tc-text-secondary leading-relaxed">
              <strong>Launch Gate 4 Note:</strong> Products must remain in <em>draft</em> until signed direct
              dispatch documentation is approved.
            </div>
          </div>

          {/* Pricing & Margin Calculator Card */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Wholesale &amp; Margin Calculator
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Wholesale Unit Cost (ex. VAT)
                </label>
                <div className="flex items-center gap-2">
                  <div className="h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono font-bold text-tc-ink flex items-center flex-1">
                    {formatGbp(unitCost)}
                  </div>
                  <Badge variant="lime" size="sm">Admin</Badge>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Retail Price Inc. VAT (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={retailPriceIncVat}
                  onChange={(e) => setRetailPriceIncVat(parseFloat(e.target.value) || 0)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono font-bold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div className="pt-2 border-t border-tc-border space-y-2 text-xs">
                <div className="flex justify-between items-center text-tc-text-secondary">
                  <span>Retail Price Ex. VAT:</span>
                  <span className="font-mono font-bold text-tc-ink">{formatGbp(retailPriceExVat)}</span>
                </div>
                <div className="flex justify-between items-center text-tc-text-secondary">
                  <span>Gross Margin %:</span>
                  <Badge variant={grossMarginPct >= 30 ? 'success' : 'danger'}>
                    {grossMarginPct.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Compliance & Verification Toggles */}
          <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
            <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
              Verification Toggles
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={imageLicenseVerified}
                  onChange={(e) => setImageLicenseVerified(e.target.checked)}
                  className="mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary"
                />
                <div>
                  <span className="font-bold text-tc-ink block">Photo License Verified</span>
                  <span className="text-[11px] text-tc-text-secondary">
                    Status International photo licensing confirmed.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceVerified}
                  onChange={(e) => setComplianceVerified(e.target.checked)}
                  className="mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary"
                />
                <div>
                  <span className="font-bold text-tc-ink block">UKCA / CE Declaration</span>
                  <span className="text-[11px] text-tc-text-secondary">
                    UK Declaration of Conformity on file.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={directDispatchVerified}
                  onChange={(e) => setDirectDispatchVerified(e.target.checked)}
                  className="mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary"
                />
                <div>
                  <span className="font-bold text-tc-ink block">Direct Dispatch Signed</span>
                  <span className="text-[11px] text-tc-text-secondary">
                    Dropship &amp; carrier agreement signed with supplier.
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
