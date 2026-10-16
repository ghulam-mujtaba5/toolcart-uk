'use client';

import React, { useState, useRef } from 'react';
import { PublicProductDTO } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useCompare } from '@/context/compare-context';
import {
  IconToolbox,
  IconBolt,
  IconCaliper,
} from '@/components/ui/trade-icons';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PdpActionsProps {
  product: PublicProductDTO;
}

export function PdpActions({ product }: PdpActionsProps) {
  const { addItem } = useCart();
  const { formatPriceDisplay } = useVAT();
  const { isInCompare, addProduct, removeProduct, openCompare } = useCompare();

  const [quantity, setQuantity] = useState(1);
  const [isCaseOrder, setIsCaseOrder] = useState(false);
  const [isSnapped, setIsSnapped] = useState(false);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCompared = isInCompare(product.id);

  const unitPrice = formatPriceDisplay(
    product.retail_price_inc_vat_gbp,
    product.retail_price_ex_vat_gbp
  );

  const caseMultiplier = isCaseOrder ? product.units_per_case : 1;
  const totalPrice = formatPriceDisplay(
    product.retail_price_inc_vat_gbp * quantity * caseMultiplier,
    product.retail_price_ex_vat_gbp * quantity * caseMultiplier
  );

  const isOutOfStock = (product.stock_quantity ?? 0) <= 0 || product.availability_status === 'out_of_stock';

  const handleAdd = () => {
    if (isOutOfStock) return;
    addItem(product, quantity, isCaseOrder);

    setIsSnapped(true);
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }
    snapTimeoutRef.current = setTimeout(() => {
      setIsSnapped(false);
    }, 1800);
  };

  const handleCompareToggle = () => {
    if (isCompared) {
      removeProduct(product.id);
    } else {
      addProduct(product);
      openCompare();
    }
  };

  return (
    <div className="space-y-6">
      {/* Pricing Container */}
      <div className="p-4 sm:p-5 rounded-xl bg-tc-canvas border border-tc-border space-y-1">
        <div className="flex items-baseline justify-between">
          <div className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tabular-nums">
            {totalPrice.primaryText}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-tc-action-lime text-tc-ink border-2 border-tc-ink">
            {isCaseOrder ? `Case of ${product.units_per_case}` : `Pack of ${product.units_per_pack}`}
          </span>
        </div>
        <div className="text-xs text-tc-text-secondary tabular-nums">
          {totalPrice.secondaryText}
        </div>
      </div>

      {/* Pack / Case Toggle Selector with Trade Duotone Icons */}
      <div className="p-4 rounded-xl bg-white border border-tc-border space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-tc-ink">
          <span className="flex items-center gap-1.5">
            <IconToolbox size={16} className="text-tc-primary" />
            Packaging Order Option
          </span>
          <span className="text-tc-primary font-mono text-[11px]">
            {product.units_per_case} packs per outer carton
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIsCaseOrder(false)}
            className={cn(
              'p-2.5 min-h-[44px] rounded-lg border text-left transition-all flex items-start gap-2',
              !isCaseOrder
                ? 'border-tc-primary bg-tc-surface-soft font-bold text-tc-primary shadow-xs'
                : 'border-tc-border hover:border-tc-ink text-tc-ink'
            )}
          >
            <IconToolbox size={16} className="shrink-0 mt-0.5 text-tc-primary" />
            <div>
              <div className="text-xs font-semibold">Retail Pack</div>
              <div className="text-[11px] text-tc-text-secondary mt-0.5 tabular-nums">
                {unitPrice.primaryText}
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsCaseOrder(true)}
            className={cn(
              'p-2.5 min-h-[44px] rounded-lg border text-left transition-all flex items-start gap-2',
              isCaseOrder
                ? 'border-tc-primary bg-tc-surface-soft font-bold text-tc-primary shadow-xs'
                : 'border-tc-border hover:border-tc-ink text-tc-ink'
            )}
          >
            <IconBolt size={16} className="shrink-0 mt-0.5 text-tc-primary" />
            <div className="flex-1">
              <div className="text-xs flex items-center justify-between">
                <span className="font-semibold">Full Outer Case</span>
                <span className="text-[10px] px-1 rounded bg-tc-primary/10 text-tc-primary font-bold">
                  Bulk
                </span>
              </div>
              <div className="text-[11px] text-tc-text-secondary mt-0.5 tabular-nums">
                {product.units_per_case} packs ({formatPriceDisplay(product.retail_price_inc_vat_gbp * product.units_per_case, product.retail_price_ex_vat_gbp * product.units_per_case).primaryText})
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Quantity Stepper & Snap-to-Cart Hero Button */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-tc-border-strong rounded-lg bg-white h-11">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="min-w-[44px] h-full flex items-center justify-center text-tc-text-secondary hover:text-tc-ink transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-3 text-sm font-bold text-tc-ink tabular-nums">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="min-w-[44px] h-full flex items-center justify-center text-tc-text-secondary hover:text-tc-ink transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Snap-to-Cart Tactile Button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isOutOfStock || isSnapped}
          aria-live="polite"
          aria-label={
            isOutOfStock
              ? `Out of Stock: ${product.title}`
              : isSnapped
              ? `Added to ToolCart: ${product.title}`
              : `Add to Basket: ${product.title}`
          }
          className={cn(
            'relative flex-1 flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-bold',
            'transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-tc-primary',
            isOutOfStock
              ? 'bg-tc-surface-soft text-tc-text-secondary cursor-not-allowed border border-tc-border'
              : 'active:scale-[0.94] active:translate-y-[2px] active:shadow-[inset_0_2px_4px_rgba(24,35,54,0.25)]',
            !isOutOfStock &&
              (isSnapped
                ? 'bg-tc-action-lime text-tc-ink border-2 border-tc-ink font-extrabold shadow-sm'
                : 'bg-tc-primary text-white hover:bg-tc-primary-hover shadow-xs')
          )}
          style={{
            transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Shockwave Particle Ring */}
          {isSnapped && (
            <span
              className="absolute inset-[-4px] rounded-button border-2 border-tc-action-lime animate-ping opacity-60 pointer-events-none motion-reduce:hidden"
              style={{ animationDuration: '0.6s' }}
            />
          )}

          {isOutOfStock ? (
            <span>Out of Stock</span>
          ) : isSnapped ? (
            <>
              <ShoppingCart className="w-5 h-5 text-tc-ink" />
              <span>Added to ToolCart!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>Add to Basket</span>
            </>
          )}
        </button>
      </div>

      {/* Compare Product Toggle Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCompareToggle}
          className={cn(
            'w-full min-h-[44px] py-2.5 px-4 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2',
            isCompared
              ? 'bg-tc-primary text-white border-tc-primary'
              : 'bg-white text-tc-ink border-tc-border hover:border-tc-ink'
          )}
        >
          {isCompared ? (
            <span>In Comparison List (Click to remove)</span>
          ) : (
            <>
              <IconCaliper size={16} className="text-tc-primary" />
              <span>Add to Compare (Side-by-side spec comparison)</span>
            </>
          )}
        </button>
      </div>

      {/* Reassurance Notice */}
      <div className="p-3.5 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] text-xs text-tc-ink space-y-1">
        <div className="font-bold text-tc-primary">
          UK Trade &amp; DIY Standards Assured
        </div>
        <p className="text-[11px] text-tc-text-secondary leading-snug">
          Direct dispatch from UK distribution facility. Transparent pack counts, genuine specifications, and standard 30-day returns.
        </p>
      </div>

      {/* Sticky Mobile Buy Bar (Visible on mobile/tablet viewports < lg) */}
      <div
        data-testid="pdp-sticky-buy-bar"
        className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-tc-border px-4 py-3 shadow-[0_-4px_16px_rgba(24,35,54,0.10)] pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-200"
      >
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase font-bold text-tc-text-secondary truncate">
            {isCaseOrder ? `Case of ${product.units_per_case}` : `Pack of ${product.units_per_pack}`}
          </div>
          <div className="font-heading font-extrabold text-base text-tc-ink tabular-nums leading-tight">
            {totalPrice.primaryText}
          </div>
          <div className="text-[10px] text-tc-text-secondary tabular-nums truncate">
            {totalPrice.secondaryText}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAdd}
          aria-live="polite"
          aria-label={isSnapped ? `Quick order placed: ${product.title}` : `Quick Order: ${product.title}`}
          className={cn(
            'relative shrink-0 flex items-center justify-center gap-2 h-11 px-5 rounded-button text-xs font-bold',
            'transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-tc-primary',
            'active:scale-[0.94] active:translate-y-[2px]',
            isSnapped
              ? 'bg-tc-action-lime text-tc-ink border-2 border-tc-ink font-extrabold shadow-sm'
              : 'bg-tc-primary text-white hover:bg-tc-primary-hover shadow-xs'
          )}
        >
          {isSnapped ? (
            <>
              <ShoppingCart className="w-4 h-4 text-tc-ink" />
              <span>Added!</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 text-white" />
              <span>Quick Order</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
