'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { RotateCcw, SlidersHorizontal, X, Check } from 'lucide-react';
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

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const currentCategory = searchParams.get('category') || '';
  const currentBrand = searchParams.get('brand') || '';
  const inStockOnly = searchParams.get('in_stock') === 'true';
  const minPrice = searchParams.get('min_price') || '';
  const maxPrice = searchParams.get('max_price') || '';

  // Escape key and scroll lock for mobile filter drawer
  useEffect(() => {
    if (!isMobileDrawerOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileDrawerOpen]);

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

  const activeCount =
    (currentCategory ? 1 : 0) +
    (currentBrand ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (minPrice || maxPrice ? 1 : 0);

  // Filter content component reused between desktop sidebar and mobile drawer
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider font-heading">
          Category
        </h4>
        <ul className="space-y-1 text-xs">
          <li>
            <button
              type="button"
              onClick={() => updateParam('category', null)}
              className={cn(
                'w-full text-left min-h-[44px] py-2 px-3 rounded-lg transition-colors flex items-center justify-between',
                !currentCategory
                  ? 'bg-tc-surface-soft text-tc-primary font-bold shadow-2xs'
                  : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas'
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
                  'w-full text-left min-h-[44px] py-2 px-3 rounded-lg transition-colors flex items-center justify-between',
                  currentCategory === c.slug
                    ? 'bg-tc-surface-soft text-tc-primary font-bold shadow-2xs'
                    : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas'
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
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider font-heading">
          Brand
        </h4>
        <ul className="space-y-1 text-xs">
          <li>
            <button
              type="button"
              onClick={() => updateParam('brand', null)}
              className={cn(
                'w-full text-left min-h-[44px] py-2 px-3 rounded-lg transition-colors flex items-center justify-between',
                !currentBrand
                  ? 'bg-tc-surface-soft text-tc-primary font-bold shadow-2xs'
                  : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas'
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
                  'w-full text-left min-h-[44px] py-2 px-3 rounded-lg transition-colors flex items-center justify-between',
                  currentBrand.toLowerCase() === b.name.toLowerCase()
                    ? 'bg-tc-surface-soft text-tc-primary font-bold shadow-2xs'
                    : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas'
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
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider font-heading">
          Availability
        </h4>
        <label className="min-h-[44px] flex items-center gap-3 text-xs text-tc-ink cursor-pointer select-none px-1 rounded-lg hover:bg-tc-canvas transition-colors">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => updateParam('in_stock', e.target.checked ? 'true' : null)}
            className="rounded border-tc-border-strong text-tc-primary focus:ring-tc-primary h-5 w-5"
          />
          <span className="font-medium">Confirmed in stock only</span>
        </label>
      </div>

      {/* Price Range */}
      <div className="space-y-3 pt-4 border-t border-tc-border/60">
        <h4 className="text-xs font-bold text-tc-ink uppercase tracking-wider font-heading">
          Price (Inc. VAT)
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[11px] font-medium text-tc-text-secondary block mb-1">Min £</span>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => updateParam('min_price', e.target.value || null)}
              className="w-full h-11 min-h-[44px] px-3 rounded-lg border border-tc-border-strong text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
          </div>
          <div>
            <span className="text-[11px] font-medium text-tc-text-secondary block mb-1">Max £</span>
            <input
              type="number"
              placeholder="100"
              value={maxPrice}
              onChange={(e) => updateParam('max_price', e.target.value || null)}
              className="w-full h-11 min-h-[44px] px-3 rounded-lg border border-tc-border-strong text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Filter Trigger Bar (Visible on mobile/tablet < lg) */}
      <div className="lg:hidden w-full flex items-center justify-between gap-2.5 p-3 bg-white rounded-card border border-tc-border shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          aria-label="Open search filter drawer"
          className="min-h-[44px] flex-1 px-4 py-2 rounded-lg bg-tc-surface-soft text-tc-ink font-bold text-xs flex items-center justify-between border border-[#C8D9F9] hover:border-tc-primary transition-all active:scale-[0.98]"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-tc-primary" />
            <span>Filter Catalog</span>
          </span>
          {hasActiveFilters ? (
            <span className="px-2 py-0.5 rounded-full bg-tc-primary text-white text-[11px] font-mono font-bold">
              {activeCount} active
            </span>
          ) : (
            <span className="text-[11px] text-tc-text-secondary font-medium">All Filters</span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleReset}
            aria-label="Reset all active filters"
            className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-lg border border-tc-border text-tc-text-secondary hover:text-tc-error text-xs font-semibold flex items-center justify-center gap-1 transition-colors hover:bg-tc-canvas"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        )}
      </div>

      {/* Mobile Slide-Over Filter Drawer (Accessible Dialog) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start animate-in fade-in-50">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
            aria-hidden="true"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-drawer-title"
            className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-300"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-tc-border flex items-center justify-between bg-tc-canvas shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-tc-primary" />
                <h2 id="filter-drawer-title" className="font-heading font-extrabold text-base text-tc-ink">
                  Filter Catalog
                </h2>
                {hasActiveFilters && (
                  <span className="px-2 py-0.5 rounded-full bg-tc-primary text-white text-[11px] font-mono font-bold">
                    {activeCount}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="min-h-[44px] px-2 flex items-center text-xs text-tc-primary hover:underline font-semibold"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  aria-label="Close filter drawer"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-tc-text-secondary hover:text-tc-ink transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Filters Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {renderFilterContent()}
            </div>

            {/* Drawer Sticky Bottom Safe Area Footer */}
            <div className="p-4 border-t border-tc-border bg-white flex items-center gap-2.5 shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xs">
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleReset();
                    setIsMobileDrawerOpen(false);
                  }}
                  className="flex-1 min-h-[44px] text-xs font-bold"
                >
                  Reset All
                </Button>
              )}
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-1 min-h-[44px] text-xs font-bold"
              >
                Apply &amp; View
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Aside Sidebar (Visible on desktop >= lg) */}
      <aside className={cn('hidden lg:block bg-white p-5 rounded-card border border-tc-border space-y-6 shadow-xs', className)}>
        <div className="flex items-center justify-between pb-4 border-b border-tc-border">
          <h3 className="font-heading font-bold text-base text-tc-ink">Filters</h3>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleReset}
              className="min-h-[44px] px-2 flex items-center gap-1 text-xs text-tc-primary hover:underline font-semibold"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        {renderFilterContent()}
      </aside>
    </>
  );
}
