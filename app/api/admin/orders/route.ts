import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { OrderState } from '@/types/order';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth } from '@/lib/auth/admin';

const OrderStateEnum = z.enum([
  'cart_pending',
  'checkout_authorized',
  'supplier_order_pending',
  'supplier_accepted',
  'payment_captured',
  'dispatched',
  'delivered',
  'supplier_rejected',
  'supplier_timeout',
  'payment_authorization_expired',
  'partial_supplier_acceptance',
  'partial_dispatch',
  'refund_pending',
  'refunded',
  'manual_review',
]);

const OrderItemSchema = z.object({
  product_id: z.string().optional().default(''),
  title: z.string().default(''),
  supplier_sku: z.string().default(''),
  quantity: z.number().int().min(1, 'Item quantity must be at least 1'),
  unit_price_inc_vat: z.number().nonnegative().default(0),
  unit_price_ex_vat: z.number().nonnegative().default(0),
  total_inc_vat: z.number().nonnegative().default(0),
});

const CreateOrderSchema = z.object({
  id: z.string().optional(),
  order_number: z.string().min(1, 'Order number is required'),
  customer_email: z.string().email('Valid customer email is required'),
  items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
  state: OrderStateEnum.default('cart_pending'),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  shipping_address: z.any().optional(),
  subtotal_ex_vat_gbp: z.number().nonnegative().default(0),
  subtotal_inc_vat_gbp: z.number().nonnegative().default(0),
  shipping_ex_vat_gbp: z.number().nonnegative().default(0),
  shipping_inc_vat_gbp: z.number().nonnegative().default(0),
  vat_amount_gbp: z.number().nonnegative().default(0),
  total_inc_vat_gbp: z.number().nonnegative().default(0),
  supplier_id: z.string().default('status-uk'),
  supplier_po_reference: z.string().optional(),
  carrier: z.string().optional(),
  tracking_number: z.string().optional(),
  audit_logs: z.array(z.any()).default([]),
});

export async function GET(request: NextRequest) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

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
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const parseResult = await parseJsonBody(request, CreateOrderSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const body = parseResult.data;
    const db = getDb();

    const createdOrder = await db.orders.create({
      id: body.id,
      order_number: body.order_number,
      created_at: body.created_at || new Date().toISOString(),
      updated_at: body.updated_at || new Date().toISOString(),
      state: (body.state || 'cart_pending') as OrderState,
      customer_email: body.customer_email,
      shipping_address: body.shipping_address,
      items: (body.items || []).map((it) => ({
        product_id: it.product_id || it.supplier_sku || 'prod_unknown',
        quantity: it.quantity,
        title: it.title || '',
        supplier_sku: it.supplier_sku || '',
        unit_price_inc_vat: it.unit_price_inc_vat ?? 0,
        unit_price_ex_vat: it.unit_price_ex_vat ?? 0,
        total_inc_vat: it.total_inc_vat ?? 0,
      })),
      subtotal_ex_vat_gbp: body.subtotal_ex_vat_gbp ?? 0,
      subtotal_inc_vat_gbp: body.subtotal_inc_vat_gbp ?? 0,
      shipping_ex_vat_gbp: body.shipping_ex_vat_gbp ?? 0,
      shipping_inc_vat_gbp: body.shipping_inc_vat_gbp ?? 0,
      vat_amount_gbp: body.vat_amount_gbp ?? 0,
      total_inc_vat_gbp: body.total_inc_vat_gbp ?? 0,
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
