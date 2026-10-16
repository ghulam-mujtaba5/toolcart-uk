import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

const UpdateSupplierSchema = z.object({
  direct_dispatch_agreement_signed: z.boolean().optional(),
  stock_feed_ttl_minutes: z.number().min(1).max(1440).optional(),
  carriage_paid_threshold_gbp: z.number().min(0).optional(),
  standard_carriage_gbp: z.number().min(0).optional(),
  lead_time_days: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const json = await request.json();
    const parsed = UpdateSupplierSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const updated = await db.suppliers.update(id, parsed.data);

    if (!updated) {
      return NextResponse.json({ error: `Supplier ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(
      {
        supplier: updated,
        message: `Supplier ${updated.name} updated successfully`,
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
