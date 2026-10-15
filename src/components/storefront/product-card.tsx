'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PublicProductDTO } from '@/types/product';
import { useVAT } from '@/context/vat-context';
import { useCart } from '@/context/cart-context';
import { useCompare } from '@/context/compare-context';
import { StockRadarBadge } from '@/components/ui/stock-radar-badge';
import {
  IconToolbox,
  IconCaliper,
  IconTradeVerified,
  IconSpiritLevel,
  IconBolt,
  IconTapeMeasure,
} from '@/components/ui/trade-icons';
import { ShoppingCart, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: PublicProductDTO;
  className?: string;
}

function getCategoryTradeIcon(categorySlug: string) {
  switch (categorySlug) {
    case 'tools':
      return IconToolbox;
    case 'fixings':
      return IconBolt;
    case 'decorating':
      return IconSpiritLevel;
    case 'measuring':
      return IconCaliper;
    case 'ppe':
      return IconTradeVerified;
    default:
      return IconTapeMeasure;
  }
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { formatPriceDisplay } = useVAT();
  const { addItem } = useCart();
  const { isInCompare, addProduct, removeProduct, openCompare } = useCompare();

  const [isSnapped, setIsSnapped] = useState(false);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isCompared = isInCompare(product.id);
  const CategoryIcon = getCategoryTradeIcon(product.category_slug);

  const price = formatPriceDisplay(
    product.retail_price_inc_vat_gbp,
    product.retail_price_ex_vat_gbp
  );

  const handleCompareToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isCompared) {
      removeProduct(product.id);
    } else {
      addProduct(product);
      openCompare();
    }
  };

  const isOutOfStock = (product.stock_quantity ?? 0) <= 0 || product.availability_status === 'out_of_stock';

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    addItem(product, 1);

    setIsSnapped(true);
    if (snapTimeoutRef.current) {
      clearTimeout(snapTimeoutRef.current);
    }
    snapTimeoutRef.current = setTimeout(() => {
      setIsSnapped(false);
    }, 1800);
  };

  return (
    <div
      className={cn(
        'group bg-white rounded-card border border-tc-border hover:border-[#94A8C9] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden',
        className
      )}
    >
      <div>
        {/* Top Image & Badge Box */}
        <div className="relative bg-tc-surface-soft p-6 flex items-center justify-center border-b border-tc-border/60 aspect-4/3 overflow-hidden">
          {/* Live 24h Stock Freshness Radar Pulse Ring */}
          <div className="absolute top-2.5 left-2.5 z-10 max-w-[160px] sm:max-w-none">
            <StockRadarBadge
              status={product.availability_status}
              stockQuantity={product.stock_quantity}
              size="sm"
              className="max-w-[160px] sm:max-w-none"
            />
          </div>

          {/* Compare toggle button with precision caliper icon */}
          <button
            type="button"
            onClick={handleCompareToggle}
            aria-label={isCompared ? `Remove ${product.title} from compare` : `Add ${product.title} to compare`}
            className={cn(
              'absolute top-2.5 right-2.5 z-10 min-h-[44px] sm:min-h-[36px] px-2.5 py-1.5 rounded-md text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 shadow-2xs',
              isCompared
                ? 'bg-tc-primary text-white border-tc-primary'
                : 'bg-white text-tc-ink border-tc-border hover:border-tc-ink'
            )}
          >
            {isCompared ? (
              <Check className="w-3 h-3 text-white" />
            ) : (
              <IconCaliper size={16} className="text-tc-primary" />
            )}
            <span>Compare</span>
          </button>

          {/* Real Product Photography with Brand V3 Fallback */}
          <Link
            href={`/products/${product.slug}`}
            className="w-full h-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform p-2"
          >
            <div className="relative w-full h-36 sm:h-40 flex items-center justify-center">
              {product.images && product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white border border-[#C8D9F9] shadow-xs flex items-center justify-center text-tc-primary">
                  <CategoryIcon size={32} />
                </div>
              )}
            </div>
          </Link>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5 text-xs text-tc-text-secondary">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tc-primary">
              {product.brand}
            </span>
            <span className="text-tc-border-strong">•</span>
            <span className="font-mono text-[11px] text-tc-text-secondary">{product.supplier_sku}</span>
            <span className="text-tc-border-strong">•</span>
            <span className="truncate">{product.category}</span>
          </div>

          <Link href={`/products/${product.slug}`} className="block">
            <h3 className="font-heading font-bold text-sm sm:text-base text-tc-ink group-hover:text-tc-primary transition-colors line-clamp-2 leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Pack Breakdown & Lead Time */}
          <div className="mt-2.5 pt-2 border-t border-tc-border/40 text-xs text-tc-text-secondary flex flex-col gap-0.5">
            <span className="font-medium text-tc-ink">
              {product.units_per_pack > 1
                ? `Pack of ${product.units_per_pack}`
                : 'Single retail unit'}
              {' '}<span className="text-tc-text-secondary">({product.units_per_case} per case)</span>
            </span>
            <div className="flex items-center justify-between text-[11px] mt-0.5">
              <span className="text-tc-success font-semibold">
                {product.stock_quantity ? `${product.stock_quantity} units available` : 'In stock'}
              </span>
              <span>Dispatch: 2–3 business days</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing & Add to Basket Footer with Snap-to-Cart Tactile Button */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <div className="font-sans font-bold text-lg sm:text-xl text-tc-ink tabular-nums">
              {price.primaryText}
            </div>
            <div className="text-xs text-tc-text-secondary tabular-nums">
              {price.secondaryText}
            </div>
          </div>
        </div>

        {/* Snap-to-Cart Tactile Button */}
        <button
          type="button"
          onClick={handleAddCart}
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
            'relative w-full flex items-center justify-center gap-2 h-11 min-h-[44px] px-4 rounded-button text-xs sm:text-sm font-bold',
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
              <IconTradeVerified size={16} className="text-tc-ink" />
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
    </div>
  );
}
