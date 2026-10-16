import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth/admin';

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const db = getDb();
    const rules = await db.pricing.getMarkupRules();
    const marginFloor = await db.pricing.getMarginFloor();

    return NextResponse.json({ rules, margin_floor: marginFloor }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
