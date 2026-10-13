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
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined;
    const inStockOnly = searchParams.get('in_stock') === 'true';
    const sort = (searchParams.get('sort') as any) || 'relevance';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    const result = await searchProducts(query, {
      category,
      brand,
      minPrice,
      maxPrice,
      inStockOnly,
      sort,
    });

    const products = limit ? result.products.slice(0, limit) : result.products;

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
