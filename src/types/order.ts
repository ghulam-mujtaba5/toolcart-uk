export type OrderState =
  | 'cart_pending'
  | 'checkout_authorized'
  | 'supplier_order_pending'
  | 'supplier_accepted'
  | 'payment_captured'
  | 'dispatched'
  | 'delivered'
  | 'supplier_rejected'
  | 'supplier_timeout'
  | 'payment_authorization_expired'
  | 'partial_supplier_acceptance'
  | 'partial_dispatch'
  | 'refund_pending'
  | 'refunded'
  | 'manual_review';

export interface OrderAuditLog {
  id: string;
  order_id: string;
  from_state: OrderState;
  to_state: OrderState;
  trigger: string;
  actor: string;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface OrderItem {
  product_id: string;
  title: string;
  supplier_sku: string;
  quantity: number;
  unit_price_inc_vat: number;
  unit_price_ex_vat: number;
  total_inc_vat: number;
}

export interface CustomerAddress {
  full_name: string;
  company_name?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
}

export interface OrderRecord {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  state: OrderState;
  customer_email: string;
  shipping_address: CustomerAddress;
  items: OrderItem[];
  subtotal_ex_vat_gbp: number;
  subtotal_inc_vat_gbp: number;
  shipping_ex_vat_gbp: number;
  shipping_inc_vat_gbp: number;
  vat_amount_gbp: number;
  total_inc_vat_gbp: number;
  supplier_id: string;
  supplier_po_reference?: string;
  carrier?: string;
  tracking_number?: string;
  audit_logs: OrderAuditLog[];
}
