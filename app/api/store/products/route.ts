import { NextRequest, NextResponse } from 'next/server';
import { getAllProducts, getProductBySlug, searchProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Single product lookup
    const slug = searchParams.get('slug');
    if (slug) {
      const product = await getProductBySlug(slug);
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({ product });
    }

    const query = searchParams.get('q') || '';
    const category = searchParams.get('category') || undefined;
    const brand = searchParams.get('brand') || undefined;

    const minPriceRaw = searchParams.get('min_price');
    const parsedMin = minPriceRaw !== null ? parseFloat(minPriceRaw) : NaN;
    const minPrice = !isNaN(parsedMin) && parsedMin >= 0 ? parsedMin : undefined;

    const maxPriceRaw = searchParams.get('max_price');
    const parsedMax = maxPriceRaw !== null ? parseFloat(maxPriceRaw) : NaN;
    const maxPrice = !isNaN(parsedMax) && parsedMax >= 0 ? parsedMax : undefined;

    const inStockOnly = searchParams.get('in_stock') === 'true';
    const sort = (searchParams.get('sort') as any) || 'relevance';

    const limitRaw = searchParams.get('limit');
    let limit: number | undefined;
    if (limitRaw !== null) {
      const parsedLimit = parseInt(limitRaw, 10);
      if (!isNaN(parsedLimit)) {
        limit = Math.max(1, Math.min(100, parsedLimit));
      }
    }

    const offsetRaw = searchParams.get('offset');
    let offset = 0;
    if (offsetRaw !== null) {
      const parsedOffset = parseInt(offsetRaw, 10);
      if (!isNaN(parsedOffset)) {
        offset = Math.max(0, parsedOffset);
      }
    }

    const result = await searchProducts(query, {
      category,
      brand,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
    });

    const products =
      limit !== undefined
        ? result.products.slice(offset, offset + limit)
        : offset > 0
        ? result.products.slice(offset)
        : result.products;

    return NextResponse.json({
      products,
      total: result.total,
      categories: result.categories,
      brands: result.brands,
      didYouMean: result.didYouMean,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve catalog products', message: error.message },
      { status: 500 }
    );
  }
}
