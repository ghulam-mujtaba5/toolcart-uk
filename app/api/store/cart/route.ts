import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CartItem, CartSummary, SupplierDeliveryGroup } from '@/types/cart';
import { UK_VAT_RATE } from '@/lib/catalog/pricing';
import { parseJsonBody } from '@/lib/api/parse-json-body';

export const dynamic = 'force-dynamic';

const CARRIAGE_FEE_EX_VAT = 4.95;
const FREE_CARRIAGE_THRESHOLD_EX_VAT = 50.0;

const CartItemInputSchema = z
  .object({
    product_id: z.string().optional(),
    productId: z.string().optional(),
    supplier_id: z.string().optional().default('status-uk'),
    supplier_name: z.string().optional().default('Status International (UK) Ltd'),
    supplier_sku: z.string().optional().default(''),
    title: z.string().optional().default(''),
    slug: z.string().optional().default(''),
    category: z.string().optional().default('Tools'),
    retail_price_ex_vat_gbp: z
      .number()
      .refine((val) => Number.isFinite(val) && !isNaN(val) && val >= 0, {
        message: 'retail_price_ex_vat_gbp must be a finite, non-negative number',
      }),
    retail_price_inc_vat_gbp: z.number().optional(),
    units_per_pack: z.number().optional().default(1),
    units_per_case: z.number().optional().default(1),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(1000, 'Quantity cannot exceed 1000'),
    is_case_quantity: z.boolean().optional(),
  })
  .refine(
    (item) => Boolean((item.product_id && item.product_id.trim().length > 0) || (item.productId && item.productId.trim().length > 0)),
    { message: 'Item must have a non-empty product_id or productId' }
  );

const CartPayloadSchema = z.object({
  items: z.array(CartItemInputSchema).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const parseResult = await parseJsonBody(req, CartPayloadSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const rawItems = parseResult.data.items || [];
    const items: CartItem[] = rawItems.map((item) => ({
      product_id: item.product_id || item.productId || '',
      supplier_id: item.supplier_id || 'status-uk',
      supplier_name: item.supplier_name || 'Status International (UK) Ltd',
      supplier_sku: item.supplier_sku || '',
      title: item.title || '',
      slug: item.slug || '',
      category: item.category || 'Tools',
      retail_price_ex_vat_gbp: item.retail_price_ex_vat_gbp,
      retail_price_inc_vat_gbp:
        item.retail_price_inc_vat_gbp ??
        Math.round(item.retail_price_ex_vat_gbp * (1 + UK_VAT_RATE) * 100) / 100,
      units_per_pack: item.units_per_pack ?? 1,
      units_per_case: item.units_per_case ?? 1,
      quantity: item.quantity,
      is_case_quantity: item.is_case_quantity,
    }));

    const groupsMap = new Map<string, CartItem[]>();

    for (const item of items) {
      const list = groupsMap.get(item.supplier_id) || [];
      list.push(item);
      groupsMap.set(item.supplier_id, list);
    }

    const supplier_groups: SupplierDeliveryGroup[] = [];
    let totalSubtotalExPence = 0;
    let totalShippingExPence = 0;
    let totalItemsCount = 0;

    for (const [supplierId, groupItems] of groupsMap.entries()) {
      let groupExPence = 0;
      const supplierName = groupItems[0]?.supplier_name || 'Status International (UK) Ltd';

      for (const item of groupItems) {
        totalItemsCount += item.quantity;
        const itemPricePence = Math.round(item.retail_price_ex_vat_gbp * 100);
        groupExPence += itemPricePence * item.quantity;
      }

      const subtotalEx = groupExPence / 100;
      const subtotalInc = Math.round(groupExPence * (1 + UK_VAT_RATE)) / 100;

      const isFreeCarriage = subtotalEx >= FREE_CARRIAGE_THRESHOLD_EX_VAT;
      const carriageFeeEx = isFreeCarriage || groupItems.length === 0 ? 0 : CARRIAGE_FEE_EX_VAT;
      const carriageFeeInc = Math.round(carriageFeeEx * (1 + UK_VAT_RATE) * 100) / 100;

      totalSubtotalExPence += groupExPence;
      totalShippingExPence += Math.round(carriageFeeEx * 100);

      supplier_groups.push({
        supplier_id: supplierId,
        supplier_name: supplierName,
        items: groupItems,
        subtotal_ex_vat_gbp: subtotalEx,
        subtotal_inc_vat_gbp: subtotalInc,
        carriage_fee_ex_vat_gbp: carriageFeeEx,
        carriage_fee_inc_vat_gbp: carriageFeeInc,
        is_free_carriage: isFreeCarriage,
        free_carriage_threshold_gbp: FREE_CARRIAGE_THRESHOLD_EX_VAT,
        estimated_lead_time_days: '2-3 Business Days',
      });
    }

    const subtotal_ex_vat_gbp = totalSubtotalExPence / 100;
    const shipping_ex_vat_gbp = totalShippingExPence / 100;
    const netTotalPence = totalSubtotalExPence + totalShippingExPence;
    const vatPence = Math.round(netTotalPence * UK_VAT_RATE);
    const vat_amount_gbp = vatPence / 100;

    const grand_total_ex_vat_gbp = netTotalPence / 100;
    const grand_total_inc_vat_gbp = (netTotalPence + vatPence) / 100;

    const summary: CartSummary = {
      supplier_groups,
      total_items_count: totalItemsCount,
      subtotal_ex_vat_gbp,
      subtotal_inc_vat_gbp: Math.round(totalSubtotalExPence * (1 + UK_VAT_RATE)) / 100,
      shipping_ex_vat_gbp,
      shipping_inc_vat_gbp: Math.round(totalShippingExPence * (1 + UK_VAT_RATE)) / 100,
      vat_amount_gbp,
      grand_total_inc_vat_gbp,
      grand_total_ex_vat_gbp,
    };

    return NextResponse.json({ summary });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to calculate basket summary', message: error.message },
      { status: 500 }
    );
  }
}
