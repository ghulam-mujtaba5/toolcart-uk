import { PublicProductDTO, ProductFilters, ProductSearchResult } from '@/types/product';
import { ProjectKit, BuyingGuide } from '@/types/guides';
import { getAllPublicProducts, getPublicProductBySlug, getPublicProductsByCategory } from './products';
import { getStaticProjectKits } from './kits';
import { getStaticBuyingGuides } from './guides';
import { expandQueryWithSynonyms } from './synonyms';

export * from './unicode';
export * from './pricing';
export * from './contract-schema';
export * from './importer';
export * from './products';
export * from './kits';
export * from './guides';
export * from './synonyms';

/**
 * Retrieves all 115 public product DTOs.
 */
export async function getAllProducts(): Promise<PublicProductDTO[]> {
  return getAllPublicProducts();
}

/**
 * Retrieves a single product by URL slug.
 */
export async function getProductBySlug(slug: string): Promise<PublicProductDTO | null> {
  return getPublicProductBySlug(slug);
}

/**
 * Retrieves products filtered by category slug.
 */
export async function getProductsByCategory(category: string): Promise<PublicProductDTO[]> {
  return getPublicProductsByCategory(category);
}

/**
 * Performs lexical search, synonym expansion, multi-attribute faceted filtering, and sorting.
 */
export async function searchProducts(
  query: string = '',
  filters: ProductFilters = {}
): Promise<ProductSearchResult> {
  const allProducts = getAllPublicProducts();
  const cleanQuery = query.trim().toLowerCase();

  function matchProduct(p: PublicProductDTO, q: string): boolean {
    if (!q) return true;
    const tokens = q.split(/\s+/).filter(Boolean);
    const haystack = [
      p.title,
      p.supplier_sku,
      p.gtin,
      p.carton_barcode || '',
      p.brand,
      p.category,
      p.description,
      ...Object.values(p.specifications),
    ]
      .join(' ')
      .toLowerCase();

    return tokens.every((token) => haystack.includes(token));
  }

  let matchedProducts = allProducts.filter((p) => matchProduct(p, cleanQuery));
  let didYouMean: string | undefined;

  // Zero-results UK synonym recovery
  if (matchedProducts.length === 0 && cleanQuery) {
    const synonyms = expandQueryWithSynonyms(cleanQuery);
    for (const syn of synonyms) {
      if (syn !== cleanQuery) {
        const synMatches = allProducts.filter((p) => matchProduct(p, syn));
        if (synMatches.length > 0) {
          matchedProducts = synMatches;
          didYouMean = syn;
          break;
        }
      }
    }
  }

  // Apply filters
  let filtered = matchedProducts;

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    if (cat === 'electrical' || cat === 'electrical-tapes' || cat === 'electrical-lighting') {
      filtered = filtered.filter(
        (p) =>
          p.category_slug.toLowerCase() === 'electrical' ||
          p.category.toLowerCase() === 'electrical' ||
          p.title.toLowerCase().includes('electrical') ||
          p.title.toLowerCase().includes('electrician') ||
          p.title.toLowerCase().includes('neon tester') ||
          (p.category_slug.toLowerCase() === 'site-equipment' && p.title.toLowerCase().includes('pvc electrical tape'))
      );
    } else {
      const aliasMap: Record<string, string> = {
        'hand-tools': 'tools',
        'bits-accessories': 'tools',
        'fixings-security': 'fixings',
        'workwear-safety': 'ppe',
        'tapes-consumables': 'site-equipment',
      };
      const target = aliasMap[cat] || cat;
      filtered = filtered.filter((p) => p.category_slug.toLowerCase() === target || p.category.toLowerCase() === target);
    }
  }

  if (filters.brand) {
    const brand = filters.brand.toLowerCase();
    filtered = filtered.filter((p) => p.brand.toLowerCase() === brand);
  }

  if (filters.minPrice !== undefined && !isNaN(Number(filters.minPrice))) {
    filtered = filtered.filter((p) => p.retail_price_inc_vat_gbp >= (filters.minPrice ?? 0));
  }

  if (filters.maxPrice !== undefined && !isNaN(Number(filters.maxPrice))) {
    filtered = filtered.filter((p) => p.retail_price_inc_vat_gbp <= (filters.maxPrice ?? Infinity));
  }

  if (filters.inStockOnly) {
    filtered = filtered.filter((p) => p.availability_status === 'in_stock');
  }

  if (filters.complianceOnly) {
    filtered = filtered.filter((p) => p.compliance_verified);
  }

  // Apply sorting
  const sort = filters.sort || 'relevance';
  filtered.sort((a, b) => {
    if (sort === 'price_asc') {
      return a.retail_price_inc_vat_gbp - b.retail_price_inc_vat_gbp;
    }
    if (sort === 'price_desc') {
      return b.retail_price_inc_vat_gbp - a.retail_price_inc_vat_gbp;
    }
    if (sort === 'title_asc') {
      return a.title.localeCompare(b.title);
    }
    if (sort === 'title_desc') {
      return b.title.localeCompare(a.title);
    }
    // Relevance: exact SKU or title match comes first
    if (cleanQuery) {
      const aExact = a.supplier_sku.toLowerCase() === cleanQuery || a.title.toLowerCase().startsWith(cleanQuery);
      const bExact = b.supplier_sku.toLowerCase() === cleanQuery || b.title.toLowerCase().startsWith(cleanQuery);
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
    }
    return 0;
  });

  // Calculate faceted categories & brands
  const categoryCounts = new Map<string, { name: string; slug: string; count: number }>();
  const brandCounts = new Map<string, number>();

  for (const p of matchedProducts) {
    const existingCat = categoryCounts.get(p.category_slug) || {
      name: p.category,
      slug: p.category_slug,
      count: 0,
    };
    existingCat.count += 1;
    categoryCounts.set(p.category_slug, existingCat);

    brandCounts.set(p.brand, (brandCounts.get(p.brand) || 0) + 1);
  }

  return {
    products: filtered,
    total: filtered.length,
    categories: Array.from(categoryCounts.values()),
    brands: Array.from(brandCounts.entries()).map(([name, count]) => ({ name, count })),
    didYouMean,
  };
}

/**
 * Retrieves the 3 pre-assembled project kits.
 */
export async function getProjectKits(): Promise<ProjectKit[]> {
  return getStaticProjectKits();
}

/**
 * Retrieves a single project kit by slug.
 */
export async function getProjectKitBySlug(slug: string): Promise<ProjectKit | null> {
  const kits = getStaticProjectKits();
  return kits.find((k) => k.slug.toLowerCase() === slug.toLowerCase()) || null;
}

/**
 * Retrieves the 5 authoritative UK buying guides.
 */
export async function getBuyingGuides(): Promise<BuyingGuide[]> {
  return getStaticBuyingGuides();
}

/**
 * Retrieves a single buying guide by slug.
 */
export async function getBuyingGuideBySlug(slug: string): Promise<BuyingGuide | null> {
  const guides = getStaticBuyingGuides();
  return guides.find((g) => g.slug.toLowerCase() === slug.toLowerCase()) || null;
}
