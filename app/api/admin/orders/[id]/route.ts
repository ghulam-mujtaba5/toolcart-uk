import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAdminAuth } from '@/lib/auth/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = params;
    const db = getDb();
    const order = await db.orders.getById(id);

    if (!order) {
      return NextResponse.json({ error: `Order ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
