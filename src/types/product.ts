export type SellabilityStatus = 'draft' | 'needs_review' | 'approved' | 'blocked';

export type AvailabilityStatus = 'in_stock' | 'subject_to_confirmation' | 'out_of_stock';

// Public DTO: Safe for storefront and client components (omits wholesale costs)
export interface PublicProductDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  gtin: string; // barcode EAN-13
  carton_barcode?: string;
  mpn?: string;
  supplier_sku: string;
  supplier_id: string;
  supplier_name: string;
  category: string;
  category_slug: string;
  images: string[];
  retail_price_inc_vat_gbp: number;
  retail_price_ex_vat_gbp: number;
  units_per_pack: number;
  units_per_case: number;
  case_pack_description: string;
  specifications: Record<string, string>;
  compliance_verified: boolean;
  image_license_verified: boolean;
  supplier_direct_dispatch_verified?: boolean;
  sellability_status?: SellabilityStatus;
  availability_status: AvailabilityStatus;
  stock_quantity?: number;
  weight_grams?: number;
  lead_time_days?: string;
}

// Private Wholesale Model: Strictly server-side
export interface WholesaleSupplierOffer {
  id: string;
  product_id: string;
  supplier_id: string;
  supplier_sku: string;
  unit_cost_ex_vat_gbp: number;
  case_cost_ex_vat_gbp: number;
  units_per_case: number;
  minimum_purchase_cases: number;
  stock_quantity: number;
  stock_freshness_timestamp: string;
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: AvailabilityStatus;
  sellability_status?: SellabilityStatus;
  inStockOnly?: boolean;
  complianceOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'title_asc' | 'title_desc' | 'relevance';
}

export interface ProductSearchResult {
  products: PublicProductDTO[];
  total: number;
  categories: { name: string; slug: string; count: number }[];
  brands: { name: string; count: number }[];
  didYouMean?: string;
}
