import React from 'react';
import Link from 'next/link';
import { searchProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { Search, AlertCircle, ArrowUpDown } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    brand?: string;
    min_price?: string;
    max_price?: string;
    in_stock?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const category = searchParams.category;
  const brand = searchParams.brand;
  const minPrice = searchParams.min_price ? parseFloat(searchParams.min_price) : undefined;
  const maxPrice = searchParams.max_price ? parseFloat(searchParams.max_price) : undefined;
  const inStockOnly = searchParams.in_stock === 'true';
  const sort = (searchParams.sort as any) || 'relevance';

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

        {/* Sort Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-tc-text-secondary font-medium flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5" />
            Sort:
          </span>
          <form method="GET">
            {query && <input type="hidden" name="q" value={query} />}
            {category && <input type="hidden" name="category" value={category} />}
            {brand && <input type="hidden" name="brand" value={brand} />}
            {searchParams.in_stock && <input type="hidden" name="in_stock" value={searchParams.in_stock} />}
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
              <option value="title_desc">Name: Z to A</option>
            </select>
          </form>
        </div>
      </div>

      {/* Zero-Results UK Synonym Notice */}
      {result.didYouMean && (
        <div className="p-4 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] flex items-center gap-3 text-xs sm:text-sm text-tc-ink">
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
            <div className="bg-white rounded-card border border-tc-border p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-tc-surface-soft mx-auto flex items-center justify-center text-tc-primary">
                <Search className="w-6 h-6 opacity-60" />
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
                  View all 115 products
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
