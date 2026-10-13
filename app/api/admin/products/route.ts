import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ProductFilters, SellabilityStatus } from '@/types/product';
import { ProductContractSchema } from '@/lib/catalog/contract-schema';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category') || undefined;
    const query = searchParams.get('query') || undefined;
    const sellability = searchParams.get('sellability') as SellabilityStatus | null;

    const filters: ProductFilters = {
      category,
      query,
      sellability_status: sellability || undefined,
    };

    const db = getDb();
    const products = await db.products.getAll(filters);

    // Fetch wholesale costs for admin context
    const wholesaleMap: Record<string, number> = {};
    for (const p of products) {
      const offer = await db.products.getWholesaleOffer(p.supplier_sku);
      if (offer) {
        wholesaleMap[p.supplier_sku] = offer.unit_cost_ex_vat_gbp;
      }
    }

    const counts = await db.products.count();

    return NextResponse.json({
      products,
      wholesale_costs: wholesaleMap,
      counts,
      total: products.length,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate contract
    const parsed = ProductContractSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Schema validation failed', details: parsed.error.errors },
        { status: 400 }
      );
    }

    const item = parsed.data;
    const db = getDb();

    const publicProduct = {
      id: `prod_${item.supplier_sku.toLowerCase()}`,
      slug: `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${item.supplier_sku.toLowerCase()}`,
      title: item.title,
      description: item.description || `High-grade trade hardware: ${item.title}`,
      brand: item.title.includes('Status') ? 'Status' : 'Ionos',
      gtin: item.gtin || '',
      mpn: item.mpn || item.supplier_sku,
      supplier_sku: item.supplier_sku,
      supplier_id: 'status-uk',
      supplier_name: item.supplier,
      category: 'Hand Tools',
      category_slug: 'hand-tools',
      images: [`/images/products/${item.supplier_sku.toLowerCase()}.svg`],
      retail_price_inc_vat_gbp: item.retail_price_inc_vat_gbp || 0,
      retail_price_ex_vat_gbp: (item.retail_price_inc_vat_gbp || 0) / 1.2,
      units_per_pack: 1,
      units_per_case: item.units_per_case,
      case_pack_description: `Case of ${item.units_per_case} units`,
      specifications: {},
      compliance_verified: item.compliance_verified,
      image_license_verified: item.image_license_verified,
      supplier_direct_dispatch_verified: item.supplier_direct_dispatch_verified,
      sellability_status: item.sellability_status,
      availability_status: 'in_stock' as const,
      lead_time_days: '2-3 business days',
    };

    const wholesaleOffer = {
      id: `offer_${item.supplier_sku.toLowerCase()}`,
      product_id: publicProduct.id,
      supplier_id: 'status-uk',
      supplier_sku: item.supplier_sku,
      unit_cost_ex_vat_gbp: item.unit_cost_ex_vat_gbp,
      case_cost_ex_vat_gbp: item.unit_cost_ex_vat_gbp * item.units_per_case,
      units_per_case: item.units_per_case,
      minimum_purchase_cases: item.minimum_purchase_cases || 1,
      stock_quantity: item.supplier_stock_qty || 0,
      stock_freshness_timestamp: new Date().toISOString(),
    };

    const created = await db.products.create(publicProduct, wholesaleOffer);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
