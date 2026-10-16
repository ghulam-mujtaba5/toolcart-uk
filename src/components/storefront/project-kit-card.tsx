'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ProjectKit } from '@/types/guides';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { Button } from '@/components/ui/button';
import {
  Check,
  ShoppingCart,
  Clock,
  Layers,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PublicProductDTO } from '@/types/product';

interface ProjectKitCardProps {
  kit: ProjectKit;
}

export function ProjectKitCard({ kit }: ProjectKitCardProps) {
  const { addItem, openCart } = useCart();
  const { formatPriceDisplay } = useVAT();

  // State: Set of selected item SKUs (all selected by default)
  const [selectedSkus, setSelectedSkus] = useState<Set<string>>(
    new Set(kit.items.map((i) => i.sku))
  );

  const toggleItem = (sku: string) => {
    setSelectedSkus((prev) => {
      const next = new Set(prev);
      if (next.has(sku)) {
        next.delete(sku);
      } else {
        next.add(sku);
      }
      return next;
    });
  };

  const selectedItems = kit.items.filter((i) => selectedSkus.has(i.sku));

  // Calculate raw sum of selected items
  const rawSumInc = selectedItems.reduce((acc, i) => acc + i.price_inc_vat * i.default_quantity, 0);
  const rawSumEx = selectedItems.reduce((acc, i) => acc + i.price_ex_vat * i.default_quantity, 0);

  // Apply bundle discount if all items are selected
  const isFullBundle = selectedItems.length === kit.items.length;
  const discountFactor = isFullBundle ? 1 - kit.bundle_savings_percent / 100 : 1;

  const bundleTotalInc = Math.round(rawSumInc * discountFactor * 100) / 100;
  const bundleTotalEx = Math.round(rawSumEx * discountFactor * 100) / 100;

  const priceDisplay = formatPriceDisplay(bundleTotalInc, bundleTotalEx);
  const rawPriceDisplay = formatPriceDisplay(rawSumInc, rawSumEx);

  const handleAddBundle = async () => {
    if (selectedItems.length === 0) return;

    for (const item of selectedItems) {
      // Mock DTO for cart addition
      const mockProduct: PublicProductDTO = {
        id: `prod_${item.sku.toLowerCase()}`,
        slug: item.product_slug,
        title: item.title,
        description: item.title,
        brand: item.title.includes('Status') ? 'Status' : 'Ionos',
        gtin: '5022822224834',
        supplier_sku: item.sku,
        supplier_id: 'status-uk',
        supplier_name: 'Status International (UK) Ltd',
        category: kit.category,
        category_slug: 'tools',
        images: [`/images/products/${item.sku}.png`],
        retail_price_inc_vat_gbp: item.price_inc_vat,
        retail_price_ex_vat_gbp: item.price_ex_vat,
        units_per_pack: item.units_per_pack,
        units_per_case: 1,
        case_pack_description: `Pack of ${item.units_per_pack}`,
        specifications: {},
        compliance_verified: true,
        image_license_verified: true,
        availability_status: 'in_stock',
      };
      addItem(mockProduct, item.default_quantity);
    }
    openCart();
  };

  return (
    <div className="bg-white rounded-card border border-tc-border overflow-hidden shadow-xs space-y-6 p-6 sm:p-8">
      {/* Kit Header with Illustration */}
      <div className="flex flex-col md:flex-row gap-6 pb-6 border-b border-tc-border items-start">
        {kit.image && (
          <div className="w-full md:w-56 h-40 shrink-0 rounded-xl overflow-hidden bg-tc-canvas border border-tc-border shadow-xs flex items-center justify-center p-2">
            <img
              src={kit.image}
              alt={kit.title}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs"
            />
          </div>
        )}
        <div className="space-y-3 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-tc-surface-soft border border-[#C8D9F9] text-tc-primary">
                {kit.badge}
              </span>
              <span className="text-xs text-tc-text-secondary flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {kit.estimated_time}
              </span>
            </div>

            <span className="text-xs font-extrabold text-tc-action-lime bg-tc-ink px-2.5 py-1 rounded border border-tc-ink">
              {kit.bundle_savings_percent}% Bundle Savings
            </span>
          </div>

          <h2 className="font-heading font-extrabold text-2xl text-tc-ink">
            {kit.title}
          </h2>

          <p className="text-xs sm:text-sm text-tc-graphite leading-relaxed">
            {kit.description}
          </p>
        </div>
      </div>

      {/* Checklist of Kit Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-tc-ink uppercase tracking-wider">
          <span>Kit Items ({selectedItems.length} of {kit.items.length} selected)</span>
          <span className="text-tc-text-secondary font-normal lowercase">
            Uncheck items you already own
          </span>
        </div>

        <ul className="divide-y divide-tc-border/60 border border-tc-border rounded-xl overflow-hidden">
          {kit.items.map((item) => {
            const isChecked = selectedSkus.has(item.sku);
            const itemPrice = formatPriceDisplay(item.price_inc_vat, item.price_ex_vat);

            return (
              <li
                key={item.sku}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onClick={() => toggleItem(item.sku)}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleItem(item.sku);
                  }
                }}
                className={cn(
                  'p-3.5 sm:p-4 flex items-center justify-between gap-4 cursor-pointer transition-colors outline-none focus-visible:ring-2 focus-visible:ring-tc-primary focus-visible:ring-inset',
                  isChecked ? 'bg-white hover:bg-tc-surface-soft/40' : 'bg-tc-canvas/60 opacity-60'
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      'w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0',
                      isChecked
                        ? 'bg-tc-primary border-tc-primary text-white'
                        : 'border-tc-border-strong bg-white'
                    )}
                  >
                    {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div className="w-10 h-10 rounded-lg bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/images/products/${item.sku}.png`}
                      alt={item.title}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-tc-ink truncate">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-tc-text-secondary mt-0.5">
                      <span className="font-mono">{item.sku}</span>
                      {item.badge && (
                        <>
                          <span>•</span>
                          <span className="text-tc-primary font-medium">{item.badge}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs sm:text-sm font-bold text-tc-ink tabular-nums">
                    {itemPrice.primaryText}
                  </span>
                  <div className="text-[10px] text-tc-text-secondary tabular-nums">
                    {itemPrice.secondaryText}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Instructions & Guidance Box */}
      <div className="p-4 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] space-y-2 text-xs">
        <p className="font-bold text-tc-primary">
          Trade Application &amp; HSE Steps
        </p>
        <ul className="list-disc pl-5 space-y-1 text-tc-graphite leading-relaxed">
          {kit.instructions.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ul>
      </div>

      {/* Pricing & Add Bundle Action */}
      <div className="pt-4 border-t border-tc-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading font-extrabold text-2xl text-tc-ink tabular-nums">
              {priceDisplay.primaryText}
            </span>
            {isFullBundle && (
              <span className="text-xs text-tc-text-secondary line-through tabular-nums">
                {rawPriceDisplay.primaryText}
              </span>
            )}
          </div>
          <p className="text-xs text-tc-text-secondary tabular-nums">
            {priceDisplay.secondaryText} {isFullBundle ? `(${kit.bundle_savings_percent}% bundle savings applied)` : ''}
          </p>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleAddBundle}
          disabled={selectedItems.length === 0}
          className="flex items-center justify-center gap-2 text-sm font-bold px-6"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add Selected to Basket ({selectedItems.length})</span>
        </Button>
      </div>
    </div>
  );
}
