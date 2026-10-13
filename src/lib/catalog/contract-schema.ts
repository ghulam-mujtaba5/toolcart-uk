import { z } from 'zod';

export const ProductContractSchema = z
  .object({
    supplier_sku: z.string().min(1, 'supplier_sku is required'),
    merchant_sku: z.string().nullable().optional(),
    gtin: z.string().nullable().optional(),
    mpn: z.string().nullable().optional(),
    title: z.string().min(1, 'title is required'),
    description: z.string().nullable().optional(),
    supplier: z.string().min(1, 'supplier is required'),
    unit_cost_ex_vat_gbp: z.number().min(0, 'unit_cost_ex_vat_gbp must be >= 0'),
    units_per_case: z.number().int().min(1, 'units_per_case must be >= 1'),
    minimum_purchase_cases: z.number().int().min(1).nullable().optional(),
    retail_price_inc_vat_gbp: z.number().min(0).nullable().optional(),
    supplier_stock_qty: z.number().int().min(0).nullable().optional(),
    stock_snapshot_at: z.string().nullable().optional(),
    weight_grams: z.number().min(0).nullable().optional(),
    dimensions_mm: z
      .object({
        width: z.number().optional(),
        height: z.number().optional(),
        depth: z.number().optional(),
      })
      .nullable()
      .optional(),
    image_license_verified: z.boolean().default(false),
    compliance_verified: z.boolean().default(false),
    supplier_direct_dispatch_verified: z.boolean().default(false),
    sellability_status: z
      .enum(['draft', 'needs_review', 'approved', 'blocked'])
      .default('draft'),
  })
  .strict();

export type ProductContractRecord = z.infer<typeof ProductContractSchema>;
