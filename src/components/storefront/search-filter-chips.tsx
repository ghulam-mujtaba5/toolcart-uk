'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { X } from 'lucide-react';

export function SearchFilterChips() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeChips: { key: string; label: string; value: string }[] = [];

  const category = searchParams.get('category');
  if (category) {
    activeChips.push({ key: 'category', label: `Category: ${category}`, value: category });
  }

  const brand = searchParams.get('brand');
  if (brand) {
    activeChips.push({ key: 'brand', label: `Brand: ${brand}`, value: brand });
  }

  const inStock = searchParams.get('in_stock');
  if (inStock === 'true') {
    activeChips.push({ key: 'in_stock', label: 'In Stock Only', value: 'true' });
  }

  const minPrice = searchParams.get('min_price');
  if (minPrice) {
    activeChips.push({ key: 'min_price', label: `Min £${minPrice}`, value: minPrice });
  }

  const maxPrice = searchParams.get('max_price');
  if (maxPrice) {
    activeChips.push({ key: 'max_price', label: `Max £${maxPrice}`, value: maxPrice });
  }

  if (activeChips.length === 0) return null;

  const removeChip = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    const params = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) params.set('q', q);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-tc-text-secondary font-medium">Active filters:</span>
      {activeChips.map((chip) => (
        <span
          key={chip.key}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-tc-surface-soft text-tc-primary border border-[#C8D9F9]"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => removeChip(chip.key)}
            className="hover:text-tc-ink transition-colors p-0.5"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={clearAll}
        className="text-xs text-tc-primary hover:underline ml-1 font-semibold"
      >
        Clear all
      </button>
    </div>
  );
}
