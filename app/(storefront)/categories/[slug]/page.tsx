import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { ArrowUpDown, ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams: {
    q?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  };
}

const CATEGORY_META: Record<string, { title: string; description: string }> = {
  tools: {
    title: 'Hand Tools & Accessories',
    description: 'High-torque screwdrivers, precision sets, drop-forged carbon steel pliers, hacksaws, claw hammers, and tool accessories.',
  },
  'hand-tools': {
    title: 'Hand Tools & Accessories',
    description: 'High-torque screwdrivers, precision sets, drop-forged carbon steel pliers, hacksaws, claw hammers, and tool accessories.',
  },
  fixings: {
    title: 'Fixings, Fasteners & Security',
    description: 'Solid brass padlocks, security sliding bolts, multi-size wall plug packs, clamps, and hardware accessories.',
  },
  'fixings-security': {
    title: 'Fixings, Fasteners & Security',
    description: 'Solid brass padlocks, security sliding bolts, multi-size wall plug packs, clamps, and hardware accessories.',
  },
  decorating: {
    title: 'Painting & Decorating Supplies',
    description: 'Pure bristle paint brushes, 4" and 9" roller sets, precision masking tapes, wallpaper scrapers, and polythene dust sheets.',
  },
  measuring: {
    title: 'Measuring & Leveling Tools',
    description: '5m and 10m high-contrast metric tape measures, 3-vial spirit levels, stainless steel rulers, and plumb bobs.',
  },
  ppe: {
    title: 'Workwear & Site Safety (PPE)',
    description: 'EN166 rated protective eye goggles, FFP2 particulate dust masks, heavy-duty work gloves, and ear plugs.',
  },
  'workwear-safety': {
    title: 'Workwear & Site Safety (PPE)',
    description: 'EN166 rated protective eye goggles, FFP2 particulate dust masks, heavy-duty work gloves, and ear plugs.',
  },
  'site-equipment': {
    title: 'Site Equipment & Consumables',
    description: 'EN14183 150KG 3-step foldable ladders, heavy-duty waterproof tarpaulins, ratchet tie-downs, and BS EN 60454 electrical tape.',
  },
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const catSlug = params.slug.toLowerCase();
  const meta = CATEGORY_META[catSlug];

  const brand = searchParams.brand;
  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined;
  const inStockOnly = searchParams.in_stock === 'true';
  const sort = (searchParams.sort as any) || 'relevance';

  const result = await searchProducts('', {
    category: catSlug,
    brand,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <Link href="/categories/tools" className="hover:text-tc-ink">Categories</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">{meta?.title || catSlug}</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-card border border-tc-border p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-tc-primary font-mono">
              CATEGORY ARCHIVE
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-tc-surface-soft text-tc-primary font-bold border border-[#C8D9F9]">
              {result.total} {result.total === 1 ? 'Product' : 'Products'}
            </span>
          </div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
            {meta?.title || catSlug.toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-tc-text-secondary mt-1 max-w-2xl leading-relaxed">
            {meta?.description || 'Trade-quality products backed by verified UK supplier quotes.'}
          </p>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="text-xs text-tc-text-secondary font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <form method="GET">
            {brand && <input type="hidden" name="brand" value={brand} />}
            <select
              name="sort"
              defaultValue={sort}
              onChange={(e) => e.target.form?.submit()}
              className="h-9 px-3 rounded-lg border border-tc-border bg-white text-xs text-tc-ink font-semibold focus:outline-none focus:ring-2 focus:ring-tc-primary"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="title_asc">Name: A to Z</option>
            </select>
          </form>
        </div>
      </div>

      {/* Active Filter Chips */}
      <SearchFilterChips />

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar categories={result.categories} brands={result.brands} />
        </div>

        {/* Products */}
        <div className="lg:col-span-3">
          {result.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-card border border-tc-border p-12 text-center text-xs text-tc-text-secondary">
              No products found matching the active filters in this category.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
