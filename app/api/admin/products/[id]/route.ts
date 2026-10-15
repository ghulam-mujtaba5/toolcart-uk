import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ProductUpdateSchema } from '@/lib/schemas/product';
import { PublicProductDTO } from '@/types/product';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();
    const product = await db.products.getById(id);

    if (!product) {
      return NextResponse.json({ error: `Product ${id} not found` }, { status: 404 });
    }

    const wholesaleOffer = await db.products.getWholesaleOffer(product.supplier_sku);

    return NextResponse.json(
      {
        product,
        wholesale_offer: wholesaleOffer,
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const rawBody = await request.json();

    const parseResult = ProductUpdateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const body = parseResult.data;
    const db = getDb();

    const existing = await db.products.getById(id);
    if (!existing) {
      return NextResponse.json({ error: `Product ${id} not found` }, { status: 404 });
    }

    const { unit_cost_ex_vat_gbp, gtin, carton_barcode, mpn, ...dtoUpdates } = body;
    const cleanUpdates: Partial<PublicProductDTO> = {
      ...dtoUpdates,
      ...(gtin !== undefined && gtin !== null ? { gtin } : {}),
      ...(carton_barcode !== undefined && carton_barcode !== null ? { carton_barcode } : {}),
      ...(mpn !== undefined && mpn !== null ? { mpn } : {}),
    };

    const updated = await db.products.update(id, cleanUpdates);

    if (unit_cost_ex_vat_gbp !== undefined) {
      await db.products.updateWholesaleOffer(existing.supplier_sku, {
        unit_cost_ex_vat_gbp,
      });
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();

    const success = await db.products.delete(id);
    if (!success) {
      return NextResponse.json({ error: `Product ${id} not found` }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
