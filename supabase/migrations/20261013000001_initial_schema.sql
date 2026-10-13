-- ============================================================================
-- ToolCart UK - Milestone 4 Database Migration: Core Schema
-- Description: 11 core tables, foreign keys, constraints, and indexes
-- ============================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    quoted_sku_count INTEGER NOT NULL DEFAULT 0,
    quote_doc_date TEXT NOT NULL,
    stock_feed_ttl_minutes INTEGER NOT NULL DEFAULT 60,
    feed_last_synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    direct_dispatch_agreement_signed BOOLEAN NOT NULL DEFAULT false,
    lead_time_days TEXT NOT NULL DEFAULT '2-3 business days',
    carriage_paid_threshold_gbp NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    standard_carriage_gbp NUMERIC(10, 2) NOT NULL DEFAULT 7.50,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Products Table (Public Sellable Catalog)
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    brand TEXT NOT NULL,
    gtin TEXT NOT NULL,
    carton_barcode TEXT,
    mpn TEXT,
    supplier_sku TEXT UNIQUE NOT NULL,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    supplier_name TEXT NOT NULL,
    category TEXT NOT NULL,
    category_slug TEXT NOT NULL,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    retail_price_inc_vat_gbp NUMERIC(10, 2) NOT NULL,
    retail_price_ex_vat_gbp NUMERIC(10, 2) NOT NULL,
    units_per_pack INTEGER NOT NULL DEFAULT 1,
    units_per_case INTEGER NOT NULL DEFAULT 1,
    case_pack_description TEXT NOT NULL DEFAULT '',
    compliance_verified BOOLEAN NOT NULL DEFAULT false,
    image_license_verified BOOLEAN NOT NULL DEFAULT false,
    supplier_direct_dispatch_verified BOOLEAN NOT NULL DEFAULT false,
    sellability_status TEXT NOT NULL DEFAULT 'draft' CHECK (sellability_status IN ('draft', 'needs_review', 'approved', 'blocked')),
    availability_status TEXT NOT NULL DEFAULT 'in_stock' CHECK (availability_status IN ('in_stock', 'subject_to_confirmation', 'out_of_stock')),
    weight_grams INTEGER,
    lead_time_days TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Product Specifications Table
CREATE TABLE IF NOT EXISTS product_specifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    spec_key TEXT NOT NULL,
    spec_value TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (product_id, spec_key)
);

-- 5. Wholesale Offers Table (STRICT SERVER-ONLY SECURITY ISOLATION)
CREATE TABLE IF NOT EXISTS wholesale_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
    supplier_sku TEXT UNIQUE NOT NULL,
    unit_cost_ex_vat_gbp NUMERIC(10, 4) NOT NULL,
    case_cost_ex_vat_gbp NUMERIC(10, 4) NOT NULL,
    units_per_case INTEGER NOT NULL DEFAULT 1,
    minimum_purchase_cases INTEGER NOT NULL DEFAULT 1,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    stock_freshness_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    customer_email TEXT NOT NULL,
    state TEXT NOT NULL DEFAULT 'cart_pending' CHECK (state IN (
        'cart_pending', 'checkout_authorized', 'supplier_order_pending',
        'supplier_accepted', 'payment_captured', 'dispatched', 'delivered',
        'supplier_rejected', 'supplier_timeout', 'payment_authorization_expired',
        'partial_supplier_acceptance', 'partial_dispatch', 'refund_pending',
        'refunded', 'manual_review'
    )),
    shipping_address JSONB NOT NULL,
    subtotal_ex_vat_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal_inc_vat_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_ex_vat_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_inc_vat_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    vat_amount_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    total_inc_vat_gbp NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    supplier_id TEXT NOT NULL REFERENCES suppliers(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    supplier_po_reference TEXT,
    carrier TEXT,
    tracking_number TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    title TEXT NOT NULL,
    supplier_sku TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_inc_vat NUMERIC(10, 2) NOT NULL,
    unit_price_ex_vat NUMERIC(10, 2) NOT NULL,
    total_inc_vat NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Order Audit Logs Table (Append-Only Event Ledger)
CREATE TABLE IF NOT EXISTS order_audit_logs (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_state TEXT NOT NULL,
    to_state TEXT NOT NULL,
    trigger TEXT NOT NULL,
    actor TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. Trade Customers Table (B2B Trade Accounts)
CREATE TABLE IF NOT EXISTS trade_customers (
    id TEXT PRIMARY KEY,
    company_name TEXT NOT NULL,
    companies_house_number TEXT,
    vat_number TEXT,
    contact_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    trade_tier TEXT NOT NULL DEFAULT 'tier_1_5pct' CHECK (trade_tier IN ('tier_1_5pct', 'tier_2_10pct')),
    credit_limit_gbp NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Pricing & Margin Rules Table
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT UNIQUE NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    category_name TEXT NOT NULL,
    multiplier_under_1_pound NUMERIC(6, 3) NOT NULL DEFAULT 2.200,
    multiplier_1_to_3_pounds NUMERIC(6, 3) NOT NULL DEFAULT 1.850,
    multiplier_over_3_pounds NUMERIC(6, 3) NOT NULL DEFAULT 1.650,
    margin_floor_percent NUMERIC(5, 2) NOT NULL DEFAULT 30.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 11. Storage Objects Table (Cloudflare R2 Asset Registry)
CREATE TABLE IF NOT EXISTS storage_objects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    bucket TEXT NOT NULL DEFAULT 'toolcart-assets',
    content_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    public_url TEXT NOT NULL,
    uploaded_by TEXT DEFAULT 'admin',
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-frequency queries
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_slug ON products(category_slug);
CREATE INDEX IF NOT EXISTS idx_products_supplier_sku ON products(supplier_sku);
CREATE INDEX IF NOT EXISTS idx_products_sellability ON products(sellability_status);
CREATE INDEX IF NOT EXISTS idx_product_specs_product_id ON product_specifications(product_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_offers_product_id ON wholesale_offers(product_id);
CREATE INDEX IF NOT EXISTS idx_wholesale_offers_supplier_sku ON wholesale_offers(supplier_sku);
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_state ON orders(state);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_audit_logs_order_id ON order_audit_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_trade_customers_email ON trade_customers(email);
CREATE INDEX IF NOT EXISTS idx_storage_objects_key ON storage_objects(key);
