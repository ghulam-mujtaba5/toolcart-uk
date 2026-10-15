import { z } from 'zod';

export const SellabilityStatusEnum = z.enum(['draft', 'needs_review', 'approved', 'blocked']);

export const ProductUpdateSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters long').optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  sellability_status: SellabilityStatusEnum.optional(),
  gtin: z.string().optional().nullable(),
  carton_barcode: z.string().optional().nullable(),
  mpn: z.string().optional().nullable(),
  units_per_case: z.number().int().positive('Units per case must be at least 1').optional(),
  retail_price_inc_vat_gbp: z
    .number()
    .positive('Retail price must be greater than zero')
    .refine((val) => Number(val.toFixed(2)) === val, {
      message: 'Retail price cannot have more than 2 decimal places',
    })
    .optional(),
  retail_price_ex_vat_gbp: z.number().positive().optional(),
  stock_quantity: z.number().int().nonnegative('Stock quantity cannot be negative').optional(),
  specifications: z.record(z.string(), z.string()).optional(),
  images: z.array(z.string()).optional(),
  compliance_verified: z.boolean().optional(),
  image_license_verified: z.boolean().optional(),
  supplier_direct_dispatch_verified: z.boolean().optional(),
  unit_cost_ex_vat_gbp: z.number().positive().optional(), // strictly server-side
});

export type ProductUpdateInput = z.infer<typeof ProductUpdateSchema>;

export const BulkProductActionSchema = z.object({
  product_ids: z.array(z.string()).min(1, 'At least one product must be selected'),
  action: z.enum(['status', 'price_adjust', 'stock_adjust']),
  payload: z.object({
    status: SellabilityStatusEnum.optional(),
    price_percentage_change: z.number().optional(), // e.g. +5 for +5% or -10 for -10%
    price_fixed_change_gbp: z.number().optional(),
    stock_delta: z.number().int().optional(),
    stock_exact: z.number().int().nonnegative().optional(),
  }),
});

export type BulkProductActionInput = z.infer<typeof BulkProductActionSchema>;
