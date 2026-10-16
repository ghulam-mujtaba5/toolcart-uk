import React, { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { searchProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryPageProps {
  params: {
    slug: string;
  } | Promise<{
    slug: string;
  }>;
  searchParams?: {
    q?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  } | Promise<{
    q?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  }>;
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
  electrical: {
    title: 'Electrical & Cable Management',
    description: 'BS EN 60454 certified electrical insulation tapes, neon voltage testers, insulated screwdrivers, and site electrical consumables.',
  },
  'electrical-tapes': {
    title: 'Electrical & Cable Management',
    description: 'BS EN 60454 certified electrical insulation tapes, neon voltage testers, insulated screwdrivers, and site electrical consumables.',
  },
  'electrical-lighting': {
    title: 'Electrical & Cable Management',
    description: 'BS EN 60454 certified electrical insulation tapes, neon voltage testers, insulated screwdrivers, and site electrical consumables.',
  },
};

const CATEGORY_IMAGES: Record<string, string> = {
  tools: '/images/3d/categories/tools.webp',
  'hand-tools': '/images/3d/categories/tools.webp',
  fixings: '/images/3d/categories/fixings.webp',
  'fixings-security': '/images/3d/categories/fixings.webp',
  decorating: '/images/3d/categories/decorating.webp',
  measuring: '/images/3d/categories/measuring.webp',
  ppe: '/images/3d/categories/ppe.webp',
  'workwear-safety': '/images/3d/categories/ppe.webp',
  'site-equipment': '/images/3d/categories/site-equipment.webp',
  electrical: '/images/kits/electrical-kit.webp',
  'electrical-tapes': '/images/kits/electrical-kit.webp',
  'electrical-lighting': '/images/kits/electrical-kit.webp',
};

const CATEGORY_PROMOS: Record<string, { image: string; title: string; subtitle: string; link: string; linkText: string; badge: string }> = {
  decorating: {
    image: '/images/promos/promo-decorating-1600x650.webp',
    title: 'Trade Surface Preparation & Painting',
    subtitle: 'Crepe paper masking tapes, pure bristle sets, and heavy polythene floor protection.',
    link: '/decorating',
    linkText: 'Explore Decorating Range',
    badge: 'TRADE SURFACE PREP',
  },
  measuring: {
    image: '/images/promos/promo-measuring-1600x650.webp',
    title: 'Precision Metric Measurement & Levels',
    subtitle: '5m/10m high-contrast tapes, 3-vial spirit levels, and stainless steel rules.',
    link: '/categories/measuring',
    linkText: 'Explore Measuring Range',
    badge: 'CLASS II ACCURACY',
  },
  ppe: {
    image: '/images/promos/promo-safety-1600x650.webp',
    title: 'Workwear & EN166 Site Safety',
    subtitle: 'FFP2 dust filtration, abrasion-resistant grip gloves, and certified site eye protection.',
    link: '/ppe',
    linkText: 'Explore PPE & Safety',
    badge: 'EN166 CERTIFIED',
  },
  'workwear-safety': {
    image: '/images/promos/promo-safety-1600x650.webp',
    title: 'Workwear & EN166 Site Safety',
    subtitle: 'FFP2 dust filtration, abrasion-resistant grip gloves, and certified site eye protection.',
    link: '/ppe',
    linkText: 'Explore PPE & Safety',
    badge: 'EN166 CERTIFIED',
  },
};

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const resolvedParams = (await Promise.resolve(params)) || { slug: '' };
  const resolvedSearchParams = (await Promise.resolve(searchParams)) || {};

  const catSlug = (resolvedParams.slug || '').toLowerCase().trim();
  const meta = CATEGORY_META[catSlug];

  // Hard 404 response on any unknown category slug
  if (!meta) {
    notFound();
  }

  const brand = resolvedSearchParams.brand;
  const minPrice =
    resolvedSearchParams.min_price && !isNaN(Number(resolvedSearchParams.min_price)) && Number(resolvedSearchParams.min_price) >= 0
      ? parseFloat(resolvedSearchParams.min_price)
      : undefined;
  const maxPrice =
    resolvedSearchParams.max_price && !isNaN(Number(resolvedSearchParams.max_price)) && Number(resolvedSearchParams.max_price) >= 0
      ? parseFloat(resolvedSearchParams.max_price)
      : undefined;
  const inStockOnly = resolvedSearchParams.in_stock === 'true';
  const sort = (resolvedSearchParams.sort as any) || 'relevance';

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
      <div className="bg-white rounded-card tc-card-machined p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 overflow-hidden">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-tc-primary font-mono">
              CATEGORY ARCHIVE
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-tc-surface-soft text-tc-primary font-bold border border-tc-primary/20">
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

        {/* Category Hero Image, CAD Accent & Sort */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0">
          {CATEGORY_IMAGES[catSlug] && (
            <div className="w-36 h-24 sm:w-48 sm:h-28 rounded-xl overflow-hidden bg-tc-canvas border border-tc-border shadow-xs shrink-0 hidden sm:flex items-center justify-center p-2">
              <img
                src={CATEGORY_IMAGES[catSlug]}
                alt={meta?.title || catSlug}
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
          )}
          {/* Sort via Client Component */}
          <Suspense fallback={<div className="h-9 w-32 bg-tc-canvas rounded-lg animate-pulse" />}>
            <CatalogSortControl currentSort={sort} />
          </Suspense>
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
        <div className="lg:col-span-3 space-y-6">
          {CATEGORY_PROMOS[catSlug] && (
            <div className="relative rounded-2xl overflow-hidden border border-tc-border shadow-xs group">
              <div className="relative aspect-[16/10] sm:aspect-[24/8] min-h-[170px] sm:min-h-[200px]">
                <img
                  src={CATEGORY_PROMOS[catSlug].image}
                  alt={CATEGORY_PROMOS[catSlug].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-tc-ink/95 via-tc-ink/80 sm:via-tc-ink/60 to-transparent flex items-center p-5 sm:p-8">
                  <div className="max-w-md sm:max-w-lg space-y-2">
                    <span className="inline-block text-[10px] sm:text-[11px] font-extrabold tracking-wider text-tc-action-lime uppercase font-mono">
                      {CATEGORY_PROMOS[catSlug].badge}
                    </span>
                    <h3 className="font-heading font-extrabold text-base sm:text-2xl text-white tracking-tight leading-snug">
                      {CATEGORY_PROMOS[catSlug].title}
                    </h3>
                    <p className="text-xs sm:text-sm text-tc-canvas/90 leading-relaxed hidden sm:block">
                      {CATEGORY_PROMOS[catSlug].subtitle}
                    </p>
                    <div className="pt-2">
                      <Button
                        variant="accent"
                        size="sm"
                        asChild
                        className="text-xs font-bold bg-tc-action-lime hover:bg-tc-lime-hover text-tc-ink border border-tc-ink shadow-xs h-9 px-4"
                      >
                        <Link href={CATEGORY_PROMOS[catSlug].link}>
                          {CATEGORY_PROMOS[catSlug].linkText} →
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {result.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-card tc-card-machined p-10 sm:p-12 text-center space-y-4">
              <h3 className="font-heading font-bold text-lg text-tc-ink">
                No products found matching active filters
              </h3>
              <p className="text-xs text-tc-text-secondary max-w-md mx-auto">
                No items match your selected brand, price range, or stock filters in this category. Reset your filters or browse all tools.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <Link
                  href={`/categories/${catSlug}`}
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg bg-tc-primary text-white text-xs font-semibold hover:bg-tc-primary-hover active:scale-95 transition-all"
                >
                  Clear active filters
                </Link>
                <Link
                  href="/tools"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 py-2 rounded-lg bg-white border border-tc-border-strong text-tc-ink text-xs font-semibold hover:bg-tc-canvas active:scale-95 transition-all"
                >
                  Browse all tools
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
