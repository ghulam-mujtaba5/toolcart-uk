'use client';

import React, { useState } from 'react';
import { PublicProductDTO } from '@/types/product';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useCompare } from '@/context/compare-context';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Check, Plus, Minus, Layers, ShieldCheck } from 'lucide-react';
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

  const handleAdd = () => {
    addItem(product, quantity * caseMultiplier, isCaseOrder);
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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-tc-action-lime text-tc-ink border border-tc-ink">
            {isCaseOrder ? `Case of ${product.units_per_case}` : `Pack of ${product.units_per_pack}`}
          </span>
        </div>
        <div className="text-xs text-tc-text-secondary tabular-nums">
          {totalPrice.secondaryText}
        </div>
      </div>

      {/* Pack / Case Toggle Selector */}
      <div className="p-4 rounded-xl bg-white border border-tc-border space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-tc-ink">
          <span>Packaging Order Option</span>
          <span className="text-tc-primary font-mono text-[11px]">
            {product.units_per_case} packs per outer carton
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setIsCaseOrder(false)}
            className={cn(
              'p-2.5 rounded-lg border text-left transition-all',
              !isCaseOrder
                ? 'border-tc-primary bg-tc-surface-soft font-bold text-tc-primary shadow-xs'
                : 'border-tc-border hover:border-tc-ink text-tc-ink'
            )}
          >
            <div className="text-xs">Retail Pack</div>
            <div className="text-[11px] text-tc-text-secondary mt-0.5 tabular-nums">
              {unitPrice.primaryText}
            </div>
          </button>

          <button
            type="button"
            onClick={() => setIsCaseOrder(true)}
            className={cn(
              'p-2.5 rounded-lg border text-left transition-all',
              isCaseOrder
                ? 'border-tc-primary bg-tc-surface-soft font-bold text-tc-primary shadow-xs'
                : 'border-tc-border hover:border-tc-ink text-tc-ink'
            )}
          >
            <div className="text-xs flex items-center justify-between">
              <span>Full Outer Case</span>
              <span className="text-[10px] px-1 rounded bg-tc-primary/10 text-tc-primary">
                Bulk
              </span>
            </div>
            <div className="text-[11px] text-tc-text-secondary mt-0.5 tabular-nums">
              {product.units_per_case} packs ({formatPriceDisplay(product.retail_price_inc_vat_gbp * product.units_per_case, product.retail_price_ex_vat_gbp * product.units_per_case).primaryText})
            </div>
          </button>
        </div>
      </div>

      {/* Quantity Stepper & Add to Basket */}
      <div className="flex items-center gap-3">
        <div className="flex items-center border border-tc-border-strong rounded-lg bg-white h-11">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 text-tc-text-secondary hover:text-tc-ink h-full transition-colors"
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
            className="px-3 text-tc-text-secondary hover:text-tc-ink h-full transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <Button
          variant="primary"
          size="lg"
          onClick={handleAdd}
          className="flex-1 flex items-center justify-center gap-2 h-11 text-sm font-bold"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Basket</span>
        </Button>
      </div>

      {/* Compare Product Toggle Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleCompareToggle}
          className={cn(
            'w-full py-2.5 px-4 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-2',
            isCompared
              ? 'bg-tc-primary text-white border-tc-primary'
              : 'bg-white text-tc-ink border-tc-border hover:border-tc-ink'
          )}
        >
          {isCompared ? (
            <>
              <Check className="w-4 h-4" />
              <span>In Comparison List (Click to remove)</span>
            </>
          ) : (
            <>
              <Layers className="w-4 h-4 text-tc-primary" />
              <span>Add to Compare (Side-by-side spec comparison)</span>
            </>
          )}
        </button>
      </div>

      {/* Reassurance Notice */}
      <div className="p-3.5 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] text-xs text-tc-ink space-y-1">
        <div className="font-bold flex items-center gap-1.5 text-tc-primary">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Commercial Quote Baseline</span>
        </div>
        <p className="text-[11px] text-tc-text-secondary leading-snug">
          Quotation record from Status International (UK) Ltd. Shipped from West Yorkshire distribution facility under standard trade terms.
        </p>
      </div>
    </div>
  );
}
