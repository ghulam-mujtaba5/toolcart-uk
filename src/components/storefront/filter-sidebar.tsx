'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSidebarProps {
  categories: { name: string; slug: string; count: number }[];
  brands: { name: string; count: number }[];
  className?: string;
}

export function FilterSidebar({ categories, brands, className }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleReset = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters =
    Boolean(currentCategory) ||
    Boolean(currentBrand) ||
    inStockOnly ||
    Boolean(minPrice) ||
    Boolean(maxPrice);

  return (
    <aside className={cn('bg-white p-5 rounded-card border border-tc-border space-y-6', className)}>
      <div className="flex items-center justify-between pb-4 border-b border-tc-border">
        <h3 className="font-heading font-bold text-base text-tc-ink">Filters</h3>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-tc-primary hover:underline flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider">Category</h4>
        <ul className="space-y-1.5 text-xs">
          <li>
            <button
              type="button"
              onClick={() => updateParam('category', null)}
              className={cn(
                'w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between',
                !currentCategory
                  ? 'bg-tc-surface-soft text-tc-primary font-bold'
                  : 'text-tc-text-secondary hover:text-tc-ink'
              )}
            >
              <span>All Categories</span>
            </button>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                onClick={() => updateParam('category', c.slug)}
                className={cn(
                  'w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between',
                  currentCategory === c.slug
                    ? 'bg-tc-surface-soft text-tc-primary font-bold'
                    : 'text-tc-text-secondary hover:text-tc-ink'
                )}
              >
                <span>{c.name}</span>
                <span className="text-[11px] font-mono text-tc-border-strong tabular-nums">
                  ({c.count})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Brands */}
      <div className="space-y-3 pt-4 border-t border-tc-border/60">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider">Brand</h4>
        <ul className="space-y-1.5 text-xs">
          <li>
            <button
              type="button"
              onClick={() => updateParam('brand', null)}
              className={cn(
                'w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between',
                !currentBrand
                  ? 'bg-tc-surface-soft text-tc-primary font-bold'
                  : 'text-tc-text-secondary hover:text-tc-ink'
              )}
            >
              <span>All Brands</span>
            </button>
          </li>
          {brands.map((b) => (
            <li key={b.name}>
              <button
                type="button"
                onClick={() => updateParam('brand', b.name)}
                className={cn(
                  'w-full text-left py-1.5 px-2 rounded-md transition-colors flex items-center justify-between',
                  currentBrand.toLowerCase() === b.name.toLowerCase()
                    ? 'bg-tc-surface-soft text-tc-primary font-bold'
                    : 'text-tc-text-secondary hover:text-tc-ink'
                )}
              >
                <span>{b.name}</span>
                <span className="text-[11px] font-mono text-tc-border-strong tabular-nums">
                  ({b.count})
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Availability */}
      <div className="space-y-3 pt-4 border-t border-tc-border/60">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider">Availability</h4>
        <label className="flex items-center gap-2 text-xs text-tc-ink cursor-pointer select-none">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
            className="rounded border-tc-border-strong text-tc-primary focus:ring-tc-primary h-4 w-4"
          />
          <span>Confirmed in stock only</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-tc-border/60">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider">Price (Inc. VAT)</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-tc-text-secondary">Min £</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParam('min_price', e.target.value || null)}
              className="w-full h-8 px-2 rounded border border-tc-border text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-tc-primary"
            />
          </div>
          <div>
            <span className="text-[10px] text-tc-text-secondary">Max £</span>
            <input
              type="number"
              placeholder="100"
              value={maxPrice}
              onChange={(e) => updateParam('max_price', e.target.value || null)}
              className="w-full h-8 px-2 rounded border border-tc-border text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-tc-primary"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
