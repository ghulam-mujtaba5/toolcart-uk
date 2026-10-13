import { PublicProductDTO, WholesaleSupplierOffer, ProductFilters } from '@/types/product';
import { OrderRecord, OrderState, OrderAuditLog } from '@/types/order';

export interface SupplierRecord {
  id: string;
  name: string;
  contact_email: string;
  quoted_sku_count: number;
  quote_doc_date: string;
  stock_feed_ttl_minutes: number;
  feed_last_synced_at: string;
  direct_dispatch_agreement_signed: boolean;
  lead_time_days: string;
  carriage_paid_threshold_gbp: number;
  standard_carriage_gbp: number;
}

export interface MarkupRule {
  category_id: string;
  category_name: string;
  multiplier_under_1_pound: number;
  multiplier_1_to_3_pounds: number;
  multiplier_over_3_pounds: number;
  margin_floor_percent: number;
}

export interface TradeCustomerRecord {
  id: string;
  company_name: string;
  companies_house_number?: string;
  vat_number?: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  trade_tier: 'tier_1_5pct' | 'tier_2_10pct';
  credit_limit_gbp: number;
  created_at: string;
}

export interface ProductRepository {
  getAll(filters?: ProductFilters): Promise<PublicProductDTO[]>;
  getById(id: string): Promise<PublicProductDTO | null>;
  getBySlug(slug: string): Promise<PublicProductDTO | null>;
  getBySupplierSku(sku: string): Promise<PublicProductDTO | null>;
  create(product: PublicProductDTO, wholesaleOffer: WholesaleSupplierOffer): Promise<PublicProductDTO>;
  update(id: string, updates: Partial<PublicProductDTO>): Promise<PublicProductDTO | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<{ total: number; approved: number; draft: number; needs_review: number; blocked: number }>;
  getWholesaleOffer(supplierSku: string): Promise<WholesaleSupplierOffer | null>;
  updateWholesaleOffer(supplierSku: string, updates: Partial<WholesaleSupplierOffer>): Promise<WholesaleSupplierOffer | null>;
}

export interface OrderRepository {
  getAll(filters?: { state?: OrderState; customer_email?: string }): Promise<OrderRecord[]>;
  getById(id: string): Promise<OrderRecord | null>;
  getByOrderNumber(orderNumber: string): Promise<OrderRecord | null>;
  create(order: Omit<OrderRecord, 'id' | 'audit_logs'> & { id?: string; audit_logs?: OrderAuditLog[] }): Promise<OrderRecord>;
  updateState(orderId: string, newState: OrderState, auditLog: OrderAuditLog): Promise<OrderRecord | null>;
  updateTracking(orderId: string, carrier: string, trackingNumber: string): Promise<OrderRecord | null>;
}

export interface SupplierRepository {
  getAll(): Promise<SupplierRecord[]>;
  getById(id: string): Promise<SupplierRecord | null>;
  update(id: string, updates: Partial<SupplierRecord>): Promise<SupplierRecord | null>;
}

export interface PricingRepository {
  getMarkupRules(): Promise<MarkupRule[]>;
  updateMarkupRule(categoryId: string, updates: Partial<MarkupRule>): Promise<MarkupRule | null>;
  getMarginFloor(): Promise<number>;
}

export interface CustomerRepository {
  getAll(): Promise<TradeCustomerRecord[]>;
  getById(id: string): Promise<TradeCustomerRecord | null>;
  updateStatus(id: string, status: 'approved' | 'rejected' | 'pending', creditLimitGbp?: number): Promise<TradeCustomerRecord | null>;
}

export interface DatabaseStore {
  products: ProductRepository;
  orders: OrderRepository;
  suppliers: SupplierRepository;
  pricing: PricingRepository;
  customers: CustomerRepository;
  reset(): Promise<void>;
}
