'use client';

import React from 'react';
import Link from 'next/link';
import { PublicProductDTO } from '@/types/product';
import { useVAT } from '@/context/vat-context';
import { useCart } from '@/context/cart-context';
import { useCompare } from '@/context/compare-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Check, Plus, Wrench, Shield, Paintbrush, Ruler, HardHat, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: PublicProductDTO;
  className?: string;
}

function getCategoryIcon(categorySlug: string) {
  switch (categorySlug) {
    case 'tools':
      return Wrench;
    case 'fixings':
      return Shield;
    case 'decorating':
      return Paintbrush;
    case 'measuring':
      return Ruler;
    case 'ppe':
      return HardHat;
    default:
      return Package;
  }
}

export function ProductCard({ product, className }: ProductCardProps) {
  const { formatPriceDisplay } = useVAT();
  const { addItem } = useCart();
  const { isInCompare, addProduct, removeProduct, openCompare } = useCompare();

  const isCompared = isInCompare(product.id);
  const Icon = getCategoryIcon(product.category_slug);

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

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
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
          {/* Honest stock badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            {product.availability_status === 'in_stock' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#E8F5E9] text-tc-success border border-[#A3D9B5]">
                Confirmed in stock
              </span>
            ) : product.availability_status === 'subject_to_confirmation' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FFF7E8] text-tc-warning border border-[#E8CB91]">
                Subject to confirmation
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEECEB] text-tc-error border border-[#FECDCA]">
                Unavailable
              </span>
            )}
          </div>

          {/* Compare toggle button */}
          <button
            type="button"
            onClick={handleCompareToggle}
            aria-label={isCompared ? `Remove ${product.title} from compare` : `Add ${product.title} to compare`}
            className={cn(
              'absolute top-2.5 right-2.5 z-10 px-2 py-1 rounded-md text-[11px] font-bold border transition-colors flex items-center gap-1 shadow-2xs',
              isCompared
                ? 'bg-tc-primary text-white border-tc-primary'
                : 'bg-white text-tc-ink border-tc-border hover:border-tc-ink'
            )}
          >
            {isCompared ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
            <span>Compare</span>
          </button>

          {/* Real Product Photography with Brand V3 Fallback */}
          <Link href={`/products/${product.slug}`} className="w-full h-full flex flex-col items-center justify-center group-hover:scale-105 transition-transform p-2">
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
                  <Icon className="w-9 h-9 sm:w-11 sm:h-11 stroke-[1.75]" />
                </div>
              )}
            </div>
            <span className="mt-2 text-[10px] uppercase font-mono font-bold text-tc-text-secondary tracking-widest">
              {product.supplier_sku}
            </span>
          </Link>
        </div>

        {/* Content Box */}
        <div className="p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-tc-primary">
              {product.brand}
            </span>
            <span className="text-tc-border-strong">•</span>
            <span className="text-xs text-tc-text-secondary truncate">{product.category}</span>
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

      {/* Pricing & Add to Basket Footer */}
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

        <Button
          variant="primary"
          size="sm"
          onClick={handleAddCart}
          className="w-full flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold"
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Add to Basket</span>
        </Button>
      </div>
    </div>
  );
}
