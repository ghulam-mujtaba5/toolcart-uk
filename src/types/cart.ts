export interface CartItem {
  product_id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_sku: string;
  title: string;
  slug: string;
  image?: string;
  category: string;
  retail_price_ex_vat_gbp: number;
  retail_price_inc_vat_gbp: number;
  units_per_pack: number;
  units_per_case: number;
  quantity: number;
  is_case_quantity?: boolean;
}

export interface SupplierDeliveryGroup {
  supplier_id: string;
  supplier_name: string;
  items: CartItem[];
  subtotal_ex_vat_gbp: number;
  subtotal_inc_vat_gbp: number;
  carriage_fee_ex_vat_gbp: number;
  carriage_fee_inc_vat_gbp: number;
  is_free_carriage: boolean;
  free_carriage_threshold_gbp: number;
  estimated_lead_time_days: string;
}

export interface CartSummary {
  supplier_groups: SupplierDeliveryGroup[];
  total_items_count: number;
  subtotal_ex_vat_gbp: number;
  subtotal_inc_vat_gbp: number;
  shipping_ex_vat_gbp: number;
  shipping_inc_vat_gbp: number;
  vat_amount_gbp: number;
  grand_total_inc_vat_gbp: number;
  grand_total_ex_vat_gbp: number;
}
