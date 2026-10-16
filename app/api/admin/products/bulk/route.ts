import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { BulkProductActionSchema } from '@/lib/schemas/product';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth } from '@/lib/auth/admin';

export async function POST(request: NextRequest) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const parseResult = await parseJsonBody(request, BulkProductActionSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { product_ids, action, payload } = parseResult.data;
    const db = getDb();
    let updatedCount = 0;
    const uniqueProductIds = Array.from(new Set(product_ids));

    for (const id of uniqueProductIds) {
      const product = await db.products.getById(id);
      if (!product) continue;

      if (action === 'status' && payload.status) {
        await db.products.update(id, {
          sellability_status: payload.status,
        });
        updatedCount++;
      } else if (action === 'price_adjust') {
        let newIncPrice = product.retail_price_inc_vat_gbp;
        if (payload.price_percentage_change !== undefined) {
          newIncPrice = Number(Math.max(0.01, newIncPrice * (1 + payload.price_percentage_change / 100)).toFixed(2));
        } else if (payload.price_fixed_change_gbp !== undefined) {
          newIncPrice = Number(Math.max(0.01, newIncPrice + payload.price_fixed_change_gbp).toFixed(2));
        }
        const newExPrice = Number((newIncPrice / 1.2).toFixed(2));
        await db.products.update(id, {
          retail_price_inc_vat_gbp: newIncPrice,
          retail_price_ex_vat_gbp: newExPrice,
        });
        updatedCount++;
      } else if (action === 'stock_adjust') {
        let newStock = product.stock_quantity ?? 0;
        if (payload.stock_exact !== undefined) {
          newStock = Math.max(0, payload.stock_exact);
        } else if (payload.stock_delta !== undefined) {
          newStock = Math.max(0, newStock + payload.stock_delta);
        }
        await db.products.update(id, {
          stock_quantity: newStock,
          availability_status: newStock > 0 ? 'in_stock' : 'out_of_stock',
        });
        updatedCount++;
      } else if (action === 'category' && payload.category) {
        const catSlug = payload.category.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await db.products.update(id, {
          category: payload.category,
          category_slug: catSlug,
        });
        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        success: true,
        updated_count: updatedCount,
        message: `Successfully updated ${updatedCount} products.`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
