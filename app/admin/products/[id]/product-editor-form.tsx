'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PublicProductDTO, WholesaleSupplierOffer, SellabilityStatus } from '@/types/product';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  ArrowLeft,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Image as ImageIcon,
  UploadCloud,
  Calculator,
  ShieldCheck,
  Boxes,
  Tag,
  ListTree,
  FileText,
} from 'lucide-react';
import Link from 'next/link';
import { formatGbp } from '@/lib/catalog/pricing';
import { ProductUpdateSchema } from '@/lib/schemas/product';

export interface ProductEditorFormProps {
  product: PublicProductDTO;
  wholesaleOffer: WholesaleSupplierOffer | null;
}

type TabType = 'general' | 'pricing' | 'inventory' | 'specs' | 'media' | 'compliance';

export function ProductEditorForm({ product, wholesaleOffer }: ProductEditorFormProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Form State: General
  const [title, setTitle] = useState(product.title);
  const [description, setDescription] = useState(product.description || '');
  const [category, setCategory] = useState(product.category || 'General');
  const [sellabilityStatus, setSellabilityStatus] = useState<SellabilityStatus>(
    product.sellability_status || 'draft'
  );

  // Form State: Pricing & VAT
  const [retailPriceIncVat, setRetailPriceIncVat] = useState<number>(product.retail_price_inc_vat_gbp);
  const [retailPriceExVat, setRetailPriceExVat] = useState<number>(
    product.retail_price_ex_vat_gbp || Number((product.retail_price_inc_vat_gbp / 1.2).toFixed(2))
  );

  // Form State: Inventory & Packaging
  const [stockQuantity, setStockQuantity] = useState<number>(product.stock_quantity ?? 100);
  const [unitsPerCase, setUnitsPerCase] = useState<number>(product.units_per_case || 1);
  const [gtin, setGtin] = useState(product.gtin || '');
  const [cartonBarcode, setCartonBarcode] = useState(product.carton_barcode || '');
  const [mpn, setMpn] = useState(product.mpn || product.supplier_sku);

  // Form State: Technical Specifications (Key-Value Array for UI)
  const [specsList, setSpecsList] = useState<Array<{ key: string; value: string }>>(() => {
    if (!product.specifications) return [];
    return Object.entries(product.specifications).map(([key, value]) => ({ key, value }));
  });
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Form State: Media Gallery
  const [images, setImages] = useState<string[]>(
    product.images && product.images.length > 0
      ? product.images
      : [`/images/products/${product.supplier_sku}.png`]
  );
  const [newImageUrl, setNewImageUrl] = useState('');

  // Form State: Compliance & Governance
  const [complianceVerified, setComplianceVerified] = useState(product.compliance_verified || false);
  const [imageLicenseVerified, setImageLicenseVerified] = useState(product.image_license_verified || false);
  const [directDispatchVerified, setDirectDispatchVerified] = useState(
    product.supplier_direct_dispatch_verified || false
  );

  // Wholesale cost (strictly server-side sourced offer)
  const unitCost = wholesaleOffer ? wholesaleOffer.unit_cost_ex_vat_gbp : 0;
  const grossMarginPct =
    retailPriceExVat > 0 ? ((retailPriceExVat - unitCost) / retailPriceExVat) * 100 : 0;

  // Handle Dual VAT calculations
  const handleIncVatChange = (val: number) => {
    setRetailPriceIncVat(val);
    const ex = Number((val / 1.2).toFixed(2));
    setRetailPriceExVat(ex);
  };

  const handleExVatChange = (val: number) => {
    setRetailPriceExVat(val);
    const inc = Number((val * 1.2).toFixed(2));
    setRetailPriceIncVat(inc);
  };

  // Specification helpers
  const addSpec = () => {
    if (!newSpecKey.trim()) return;
    setSpecsList((prev) => [...prev, { key: newSpecKey.trim(), value: newSpecValue.trim() }]);
    setNewSpecKey('');
    setNewSpecValue('');
  };

  const removeSpec = (index: number) => {
    setSpecsList((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSpec = (index: number, field: 'key' | 'value', text: string) => {
    setSpecsList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: text } : item))
    );
  };

  // Image helpers
  const addImage = () => {
    if (!newImageUrl.trim()) return;
    setImages((prev) => [...prev, newImageUrl.trim()]);
    setNewImageUrl('');
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const setPrimaryImage = (index: number) => {
    if (index === 0) return;
    setImages((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  };

  // Quick stock modifiers
  const adjustStock = (delta: number) => {
    setStockQuantity((prev) => Math.max(0, prev + delta));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    setFieldErrors({});

    // Build specs record
    const specsRecord: Record<string, string> = {};
    specsList.forEach((s) => {
      if (s.key.trim()) {
        specsRecord[s.key.trim()] = s.value.trim();
      }
    });

    const payload = {
      title,
      description,
      category,
      sellability_status: sellabilityStatus,
      gtin: gtin || null,
      carton_barcode: cartonBarcode || null,
      mpn: mpn || null,
      units_per_case: unitsPerCase,
      retail_price_inc_vat_gbp: Number(retailPriceIncVat.toFixed(2)),
      retail_price_ex_vat_gbp: Number(retailPriceExVat.toFixed(2)),
      stock_quantity: stockQuantity,
      specifications: specsRecord,
      images,
      compliance_verified: complianceVerified,
      image_license_verified: imageLicenseVerified,
      supplier_direct_dispatch_verified: directDispatchVerified,
    };

    // Client-side Zod validation
    const validation = ProductUpdateSchema.safeParse(payload);
    if (!validation.success) {
      const issues = validation.error.flatten().fieldErrors;
      setFieldErrors(issues as Record<string, string[]>);
      setFeedback({
        type: 'error',
        message: 'Please resolve form validation errors before saving.',
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
      {/* Header bar */}
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

      {/* Feedback Alert */}
      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`p-4 rounded-xl text-xs flex items-center justify-between border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="font-bold text-xs p-1"
          >
            &times;
          </button>
        </div>
      )}

      {/* Tab Navigation (Shopify Polaris style) */}
      <div className="bg-white border border-tc-border rounded-xl p-2 flex flex-wrap gap-1.5 shadow-xs">
        {[
          { key: 'general', label: 'General Info', icon: FileText },
          { key: 'pricing', label: 'Pricing & VAT', icon: Calculator },
          { key: 'inventory', label: 'Inventory & Barcodes', icon: Boxes },
          { key: 'specs', label: `Specifications (${specsList.length})`, icon: ListTree },
          { key: 'media', label: `Media Gallery (${images.length})`, icon: ImageIcon },
          { key: 'compliance', label: 'Compliance & SLA', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key as TabType)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-tc-ink text-white shadow-xs'
                  : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-surface-soft'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-tc-action-lime' : ''}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: General Info */}
      {activeTab === 'general' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-4">
          <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-2">
            General Product Information
          </h3>

          <div className="space-y-4 max-w-2xl">
            <div>
              <label htmlFor="product-title" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                Product Title <span className="text-tc-error">*</span>
              </label>
              <input
                id="product-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                required
              />
              {fieldErrors.title && (
                <p role="alert" aria-live="polite" className="text-[11px] text-tc-error mt-1">{fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="product-category" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Category
                </label>
                <input
                  id="product-category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="sellability-status-select" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Sellability Status
                </label>
                <select
                  id="sellability-status-select"
                  value={sellabilityStatus}
                  onChange={(e) => setSellabilityStatus(e.target.value as SellabilityStatus)}
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary font-bold"
                >
                  <option value="draft">Draft (Default, Launch Gated)</option>
                  <option value="needs_review">Needs Review</option>
                  <option value="approved">Approved (Live Storefront)</option>
                  <option value="blocked">Blocked</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="product-description" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                Description
              </label>
              <textarea
                id="product-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                className="w-full p-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white leading-relaxed"
                placeholder="Detailed commercial description..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing & Retail VAT */}
      {activeTab === 'pricing' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-tc-border pb-3">
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Retail Pricing &amp; Dual VAT Calculator
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Live bidirectional conversion with standard UK 20% VAT and wholesale margin floor verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="retail-price-inc-vat" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Retail Price (Inc. 20% VAT) <span className="text-tc-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-tc-text-secondary">£</span>
                  <input
                    id="retail-price-inc-vat"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={retailPriceIncVat}
                    onChange={(e) => handleIncVatChange(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 pl-7 pr-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                  />
                </div>
                {fieldErrors.retail_price_inc_vat_gbp && (
                  <p role="alert" aria-live="polite" className="text-[11px] text-tc-error mt-1">
                    {fieldErrors.retail_price_inc_vat_gbp[0]}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="retail-price-ex-vat" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Retail Price (Ex. VAT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-tc-text-secondary">£</span>
                  <input
                    id="retail-price-ex-vat"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={retailPriceExVat}
                    onChange={(e) => handleExVatChange(parseFloat(e.target.value) || 0)}
                    className="w-full h-10 pl-7 pr-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-tc-surface-soft border border-tc-border rounded-lg text-xs">
                <span className="text-tc-text-secondary">Calculated 20% VAT Amount: </span>
                <strong className="text-tc-ink font-mono font-bold">
                  {formatGbp(retailPriceIncVat - retailPriceExVat)}
                </strong>
              </div>
            </div>

            {/* Wholesale Margins (Server side data only) */}
            <div className="bg-tc-surface-soft border border-tc-border rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-tc-ink uppercase tracking-wider">
                  Wholesale Cost &amp; Margin Review
                </span>
                <Badge variant="neutral">Confidential</Badge>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-tc-border">
                  <span className="text-tc-text-secondary">Supplier Unit Cost (Ex. VAT):</span>
                  <span className="font-mono font-bold text-tc-ink">{formatGbp(unitCost)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-tc-border">
                  <span className="text-tc-text-secondary">Retail Margin per unit:</span>
                  <span className="font-mono font-bold text-tc-primary">
                    {formatGbp(Math.max(0, retailPriceExVat - unitCost))}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-tc-text-secondary">Gross Margin %:</span>
                  <span
                    className={`font-mono font-bold ${
                      grossMarginPct >= 20 ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {grossMarginPct.toFixed(1)}%
                  </span>
                </div>
              </div>

              <p className="text-[11px] text-tc-text-secondary italic">
                * Wholesale supplier pricing is quarantined strictly to this authenticated admin session and is never included in public storefront responses.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Inventory & Barcodes */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-tc-border pb-3">
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Stock Levels &amp; Barcode Identification
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Manage stock quantity with quick adjusters, packaging carton counts, and GS1 GTIN barcodes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="available-stock-qty" className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Available Stock Quantity
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="available-stock-qty"
                    type="number"
                    min="0"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-36 h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                  />
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStock(10)}
                      className="h-9 px-2.5 text-xs font-bold"
                    >
                      +10
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStock(50)}
                      className="h-9 px-2.5 text-xs font-bold"
                    >
                      +50
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => adjustStock(-10)}
                      className="h-9 px-2.5 text-xs font-bold"
                    >
                      -10
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setStockQuantity(0)}
                      className="h-9 px-2 text-xs text-red-600 hover:text-red-800"
                    >
                      Set OOS
                    </Button>
                  </div>
                </div>
                {fieldErrors.stock_quantity && (
                  <p className="text-[11px] text-red-600 mt-1">{fieldErrors.stock_quantity[0]}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Units Per Case
                </label>
                <input
                  type="number"
                  min="1"
                  value={unitsPerCase}
                  onChange={(e) => setUnitsPerCase(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-36 h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink font-bold tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  GTIN Barcode (EAN-13 / UPC)
                </label>
                <input
                  type="text"
                  value={gtin}
                  onChange={(e) => setGtin(e.target.value)}
                  placeholder="5022822000000"
                  className="w-full h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1">
                  Outer Carton Barcode (ITF-14)
                </label>
                <input
                  type="text"
                  value={cartonBarcode}
                  onChange={(e) => setCartonBarcode(e.target.value)}
                  placeholder="15022822000007"
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
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Technical Specifications */}
      {activeTab === 'specs' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-tc-border pb-3">
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Technical Specifications Editor
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Structured trade attributes (Voltage, IP rating, Lumens, Dimensions) displayed on the Product Details Page.
            </p>
          </div>

          {/* Add Specification Row */}
          <div className="p-4 bg-tc-surface-soft border border-tc-border rounded-xl flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Attribute Key (e.g. Lumens, IP Rating, Wattage)"
              value={newSpecKey}
              onChange={(e) => setNewSpecKey(e.target.value)}
              className="w-full sm:w-1/3 h-9 px-3 bg-white border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
            <input
              type="text"
              placeholder="Value (e.g. 806 lm, IP65, 9W)"
              value={newSpecValue}
              onChange={(e) => setNewSpecValue(e.target.value)}
              className="w-full sm:w-1/2 h-9 px-3 bg-white border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={addSpec}
              disabled={!newSpecKey.trim()}
              className="h-9 px-4 text-xs font-bold shrink-0 w-full sm:w-auto"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Specification
            </Button>
          </div>

          {/* Specs Table */}
          <div className="border border-tc-border rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs divide-y divide-tc-border">
              <thead className="bg-[#182336] text-white">
                <tr>
                  <th className="py-2.5 px-4 font-bold uppercase text-[11px] w-1/3">Specification Key</th>
                  <th className="py-2.5 px-4 font-bold uppercase text-[11px]">Value</th>
                  <th className="py-2.5 px-4 font-bold uppercase text-[11px] text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tc-border/60 bg-white">
                {specsList.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-tc-text-secondary">
                      No technical specifications added yet. Use the input bar above to add attributes.
                    </td>
                  </tr>
                ) : (
                  specsList.map((spec, idx) => (
                    <tr key={idx} className="hover:bg-tc-surface-soft/60">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={spec.key}
                          onChange={(e) => updateSpec(idx, 'key', e.target.value)}
                          className="w-full h-8 px-2 bg-transparent border-b border-transparent hover:border-tc-border focus:border-tc-primary focus:bg-white text-xs font-semibold text-tc-ink"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={spec.value}
                          onChange={(e) => updateSpec(idx, 'value', e.target.value)}
                          className="w-full h-8 px-2 bg-transparent border-b border-transparent hover:border-tc-border focus:border-tc-primary focus:bg-white text-xs text-tc-ink"
                        />
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => removeSpec(idx)}
                          className="p-1 text-tc-text-secondary hover:text-red-600 transition-colors"
                          aria-label={`Remove specification ${spec.key}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Media Gallery */}
      {activeTab === 'media' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-tc-border pb-3">
            <h3 className="font-heading font-bold text-sm text-tc-ink">Product Image Gallery</h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Manage product imagery, arrange primary thumbnail, and inspect high-resolution assets.
            </p>
          </div>

          {/* Add Image URL bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Image URI path (e.g. /images/products/SKU.png or https://...)"
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              className="w-full sm:flex-1 h-9 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addImage}
              disabled={!newImageUrl.trim()}
              className="h-9 px-4 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Image
            </Button>
          </div>

          {/* Image Previews Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {images.map((imgSrc, idx) => (
              <div
                key={idx}
                className="relative group border border-tc-border rounded-xl overflow-hidden bg-tc-surface-soft p-2 flex flex-col items-center justify-between"
              >
                <div className="w-full h-24 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imgSrc}
                    alt={`${title} - view ${idx + 1}`}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>

                <div className="w-full mt-2 pt-2 border-t border-tc-border flex items-center justify-between">
                  {idx === 0 ? (
                    <Badge variant="lime" className="text-[10px]">
                      Primary
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setPrimaryImage(idx)}
                      className="text-[10px] text-tc-primary font-bold hover:underline"
                    >
                      Set Primary
                    </button>
                  )}
                  {images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="text-tc-text-secondary hover:text-red-600 p-0.5"
                      aria-label="Remove image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Compliance & SLA */}
      {activeTab === 'compliance' && (
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
          <div className="border-b border-tc-border pb-3">
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Commercial Compliance &amp; Launch Gates
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Launch Gate 4 verification switches required before marking products as approved for live channels.
            </p>
          </div>

          <div className="space-y-4 max-w-2xl">
            <label className="flex items-start gap-3 p-4 bg-tc-canvas border border-tc-border rounded-xl cursor-pointer hover:bg-tc-surface-soft transition-colors">
              <input
                type="checkbox"
                checked={complianceVerified}
                onChange={(e) => setComplianceVerified(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary accent-tc-primary cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-tc-ink block">UKCA / CE Safety Declaration</span>
                <span className="text-tc-text-secondary">
                  Supplier has provided verified documentation confirming UKCA and CE electrical safety declarations.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-tc-canvas border border-tc-border rounded-xl cursor-pointer hover:bg-tc-surface-soft transition-colors">
              <input
                type="checkbox"
                checked={imageLicenseVerified}
                onChange={(e) => setImageLicenseVerified(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary accent-tc-primary cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-tc-ink block">Commercial Image Rights License</span>
                <span className="text-tc-text-secondary">
                  All promotional and pack images have confirmed merchant distribution licenses.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-4 bg-tc-canvas border border-tc-border rounded-xl cursor-pointer hover:bg-tc-surface-soft transition-colors">
              <input
                type="checkbox"
                checked={directDispatchVerified}
                onChange={(e) => setDirectDispatchVerified(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-tc-border text-tc-primary focus:ring-tc-primary accent-tc-primary cursor-pointer"
              />
              <div className="text-xs">
                <span className="font-bold text-tc-ink block">Signed Supplier Direct-Dispatch SLA</span>
                <span className="text-tc-text-secondary">
                  Supplier has formally signed 24h dispatch SLA and EDI dropship communication protocol.
                </span>
              </div>
            </label>
          </div>
        </div>
      )}
    </form>
  );
}
