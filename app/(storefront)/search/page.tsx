import React, { Suspense } from 'react';
import Link from 'next/link';
import { searchProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import { EmptyToolChestVector } from '@/components/ui/vectors';
import { Search, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams?: {
    q?: string;
    category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  } | Promise<{
    q?: string;
    category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = (await Promise.resolve(searchParams)) || {};
  const query = resolvedSearchParams.q || '';
  const category = resolvedSearchParams.category;
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

  const result = await searchProducts(query, {
    category,
    brand,
    minPrice,
    maxPrice,
    inStockOnly,
    sort,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb / Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tc-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-tc-text-secondary mb-1">
            <Link href="/" className="hover:text-tc-ink">Home</Link>
            <span>/</span>
            <span className="text-tc-ink font-semibold">Search Catalog</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight flex items-baseline gap-3">
            {query ? `Search: “${query}”` : category ? `Category: ${category}` : 'All Catalog Products'}
            <span className="text-sm font-normal text-tc-text-secondary tabular-nums">
              ({result.total} {result.total === 1 ? 'result' : 'results'})
            </span>
          </h1>
        </div>

        {/* Sort Controls via Client Component */}
        <Suspense fallback={<div className="h-9 w-32 bg-tc-canvas rounded-lg animate-pulse" />}>
          <CatalogSortControl currentSort={sort} />
        </Suspense>
      </div>

      {/* Zero-Results UK Synonym Notice */}
      {result.didYouMean && (
        <div className="p-4 rounded-xl bg-tc-surface-soft border border-tc-primary/20 flex items-center gap-3 text-xs sm:text-sm text-tc-ink">
          <AlertCircle className="w-5 h-5 text-tc-primary shrink-0" />
          <div>
            Zero direct matches found for &quot;<span className="font-semibold">{query}</span>&quot;. Showing results for UK hardware synonym: &quot;<span className="font-bold text-tc-primary">{result.didYouMean}</span>&quot;.
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      <SearchFilterChips />

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left: Filter Sidebar */}
        <div className="lg:col-span-1">
          <FilterSidebar categories={result.categories} brands={result.brands} />
        </div>

        {/* Right: Product Grid or Zero Results */}
        <div className="lg:col-span-3">
          {result.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {result.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-card tc-card-machined p-10 sm:p-12 text-center space-y-4">
              <div className="w-48 h-36 mx-auto flex items-center justify-center">
                <img
                  src="/images/states/no-results.webp"
                  alt="No matching hardware products"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-heading font-bold text-lg text-tc-ink">
                No matching hardware products
              </h3>
              <p className="text-xs text-tc-text-secondary max-w-md mx-auto">
                Try searching for broader keywords like &quot;screwdriver&quot;, &quot;pliers&quot;, &quot;masking tape&quot;, or browse by category.
              </p>
              <div className="pt-2">
                <Link
                  href="/search"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-tc-primary text-white text-xs font-semibold hover:bg-tc-primary-hover"
                >
                  View all products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
