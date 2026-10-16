'use client';

import React from 'react';
import Link from 'next/link';
import { useCompare } from '@/context/compare-context';
import { useVAT } from '@/context/vat-context';
import { useCart } from '@/context/cart-context';
import { Button } from '@/components/ui/button';
import { X, ChevronUp, ChevronDown, ShoppingCart, Check, SlidersHorizontal, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CompareDrawer() {
  const {
    products,
    isOpen,
    openCompare,
    closeCompare,
    removeProduct,
    clearCompare,
    highlightDifferences,
    toggleHighlightDifferences,
  } = useCompare();

  const { formatPriceDisplay } = useVAT();
  const { addItem } = useCart();

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCompare();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCompare]);

  if (products.length === 0) return null;

  // Extract all unique specification keys across comparing products
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => Object.keys(p.specifications || {})))
  );

  return (
    <>
      {/* Docked Floating Bottom Bar (visible when closed or minimized) */}
      {!isOpen && (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] md:bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-1/2 -translate-x-1/2 z-40 bg-tc-ink text-white px-3.5 sm:px-4 py-2 rounded-full shadow-2xl border-2 border-tc-action-lime flex items-center gap-2 sm:gap-4 animate-in slide-in-from-bottom-4 max-w-[calc(100vw-2rem)]">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-tc-action-lime text-tc-ink font-bold text-xs flex items-center justify-center shrink-0">
              {products.length}
            </span>
            <span className="text-xs sm:text-sm font-semibold truncate">
              Comparing {products.length} {products.length === 1 ? 'item' : 'items'}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-white/20">
            {products.map((p) => (
              <span
                key={p.id}
                className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono truncate max-w-[100px]"
                title={p.title}
              >
                {p.supplier_sku}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="accent"
              size="sm"
              onClick={openCompare}
              className="text-xs min-h-[44px] sm:min-h-[36px] px-3.5"
            >
              <span>View Specs</span>
              <ChevronUp className="w-3.5 h-3.5 ml-1" />
            </Button>
            <button
              type="button"
              onClick={clearCompare}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-white/70 hover:text-white transition-colors"
              title="Clear comparison list"
              aria-label="Clear all compared products"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Expanded Modal / Bottom Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs animate-in fade-in-50">
          <div
            className="fixed inset-0"
            onClick={closeCompare}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="compare-drawer-title"
            className="relative bg-white rounded-t-2xl shadow-2xl max-h-[88vh] flex flex-col border-t border-tc-border animate-in slide-in-from-bottom-8 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-tc-ink text-white p-4 sm:px-6 sm:py-4 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <h2 id="compare-drawer-title" className="font-heading font-extrabold text-sm sm:text-lg">
                  Side-by-Side Product Comparison
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-tc-action-lime text-tc-ink font-bold shrink-0">
                  {products.length} / 4 Products
                </span>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 order-last sm:order-none w-full sm:w-auto justify-between sm:justify-start">
                <button
                  type="button"
                  onClick={toggleHighlightDifferences}
                  className={cn(
                    'text-xs font-semibold min-h-[44px] sm:min-h-[36px] px-3 py-1.5 rounded-md border flex items-center justify-center gap-1.5 transition-colors flex-1 sm:flex-initial',
                    highlightDifferences
                      ? 'bg-tc-primary text-white border-tc-primary'
                      : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                  )}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Highlight Differences</span>
                </button>

                <button
                  type="button"
                  onClick={clearCompare}
                  className="text-xs text-white/70 hover:text-white underline min-h-[44px] flex items-center px-2 shrink-0"
                >
                  Clear All
                </button>
              </div>

              <button
                type="button"
                onClick={closeCompare}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                aria-label="Close comparison drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Comparison Matrix Table */}
            <div className="overflow-x-auto overflow-y-auto p-4 sm:p-6 max-h-[calc(88vh-72px)] pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-tc-border">
                    <th className="p-3 w-44 font-heading font-bold text-tc-text-secondary text-xs uppercase tracking-wider shrink-0 sticky left-0 bg-white">
                      Attribute
                    </th>
                    {products.map((p) => {
                      const price = formatPriceDisplay(
                        p.retail_price_inc_vat_gbp,
                        p.retail_price_ex_vat_gbp
                      );
                      return (
                        <th key={p.id} className="p-3 min-w-[220px] max-w-[260px] align-top bg-tc-canvas/40">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <span className="text-[11px] font-mono font-bold text-tc-primary">
                              {p.supplier_sku}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeProduct(p.id)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tc-text-secondary hover:text-tc-error p-1"
                              title="Remove from compare"
                              aria-label={`Remove ${p.title} from compare`}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="w-full h-24 rounded-lg bg-white border border-tc-border mb-2 flex items-center justify-center p-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/images/products/${p.supplier_sku}.png`}
                              alt={p.title}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>

                          <Link
                            href={`/products/${p.slug}`}
                            onClick={closeCompare}
                            className="font-heading font-bold text-sm text-tc-ink hover:text-tc-primary transition-colors line-clamp-2 mb-2"
                          >
                            {p.title}
                          </Link>

                          <div className="mb-3">
                            <div className="text-base font-bold text-tc-ink tabular-nums">
                              {price.primaryText}
                            </div>
                            <div className="text-xs text-tc-text-secondary tabular-nums">
                              {price.secondaryText}
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => addItem(p, 1)}
                            className="w-full text-xs flex items-center justify-center gap-1.5"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            <span>Add to Basket</span>
                          </Button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border/60">
                  {/* Brand Row */}
                  <tr>
                    <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">Brand</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-xs text-tc-graphite">
                        {p.brand}
                      </td>
                    ))}
                  </tr>

                  {/* Category Row */}
                  <tr>
                    <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">Category</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-xs text-tc-graphite">
                        {p.category}
                      </td>
                    ))}
                  </tr>

                  {/* Pack Breakdown */}
                  <tr>
                    <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">Pack Breakdown</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-xs text-tc-graphite tabular-nums">
                        {p.case_pack_description}
                      </td>
                    ))}
                  </tr>

                  {/* Stock Availability */}
                  <tr>
                    <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">Stock Status</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-xs font-semibold">
                        {p.availability_status === 'in_stock' ? (
                          <span className="text-tc-success">Confirmed in stock</span>
                        ) : (
                          <span className="text-tc-warning">Subject to confirmation</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* GTIN / Barcode */}
                  <tr>
                    <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">EAN-13 GTIN</td>
                    {products.map((p) => (
                      <td key={p.id} className="p-3 text-xs font-mono tabular-nums text-tc-graphite">
                        {p.gtin}
                      </td>
                    ))}
                  </tr>

                  {/* Dynamic Technical Specs Rows */}
                  {allSpecKeys.map((key) => {
                    const values = products.map((p) => p.specifications?.[key] || '—');
                    const hasVariation = new Set(values).size > 1;

                    return (
                      <tr
                        key={key}
                        className={cn(
                          highlightDifferences && hasVariation && 'bg-tc-surface-soft/60 font-semibold'
                        )}
                      >
                        <td className="p-3 font-semibold text-xs text-tc-ink sticky left-0 bg-white">
                          {key}
                        </td>
                        {products.map((p) => (
                          <td key={p.id} className="p-3 text-xs text-tc-graphite tabular-nums">
                            {p.specifications?.[key] || '—'}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
