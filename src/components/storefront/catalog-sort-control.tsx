'use client';

import React from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ArrowUpDown } from 'lucide-react';

export interface CatalogSortControlProps {
  currentSort: string;
}

export function CatalogSortControl({ currentSort }: CatalogSortControlProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSortChange = (newSort: string) => {
    const params = new URLSearchParams(searchParams ? searchParams.toString() : '');
    params.set('sort', newSort);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
      <span className="text-xs text-tc-text-secondary font-medium flex items-center gap-1">
        <ArrowUpDown className="w-3.5 h-3.5" />
        Sort:
      </span>
      <select
        name="sort"
        value={currentSort}
        onChange={(e) => handleSortChange(e.target.value)}
        className="h-11 min-h-[44px] sm:h-9 sm:min-h-[36px] px-3 rounded-lg border border-tc-border bg-white text-base sm:text-xs text-tc-ink font-semibold focus:outline-none focus:ring-2 focus:ring-tc-primary cursor-pointer"
        aria-label="Sort products"
      >
        <option value="relevance">Relevance</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="title_asc">Name: A to Z</option>
        <option value="title_desc">Name: Z to A</option>
      </select>
    </div>
  );
}
