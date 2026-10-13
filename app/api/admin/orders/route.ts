import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { OrderState } from '@/types/order';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const state = searchParams.get('state') as OrderState | null;
    const customerEmail = searchParams.get('customer_email') || undefined;

    const db = getDb();
    const orders = await db.orders.getAll({
      state: state || undefined,
      customer_email: customerEmail,
    });

    return NextResponse.json({ orders, total: orders.length });
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
    const db = getDb();

    if (!body.order_number || !body.customer_email || !body.items) {
      return NextResponse.json(
        { error: 'Missing required order fields: order_number, customer_email, items' },
        { status: 400 }
      );
    }

    const createdOrder = await db.orders.create({
      id: body.id,
      order_number: body.order_number,
      created_at: body.created_at || new Date().toISOString(),
      updated_at: body.updated_at || new Date().toISOString(),
      state: body.state || 'cart_pending',
      customer_email: body.customer_email,
      shipping_address: body.shipping_address,
      items: body.items,
      subtotal_ex_vat_gbp: body.subtotal_ex_vat_gbp || 0,
      subtotal_inc_vat_gbp: body.subtotal_inc_vat_gbp || 0,
      shipping_ex_vat_gbp: body.shipping_ex_vat_gbp || 0,
      shipping_inc_vat_gbp: body.shipping_inc_vat_gbp || 0,
      vat_amount_gbp: body.vat_amount_gbp || 0,
      total_inc_vat_gbp: body.total_inc_vat_gbp || 0,
      supplier_id: body.supplier_id || 'status-uk',
      supplier_po_reference: body.supplier_po_reference,
      carrier: body.carrier,
      tracking_number: body.tracking_number,
      audit_logs: body.audit_logs || [],
    });

    return NextResponse.json(createdOrder, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
