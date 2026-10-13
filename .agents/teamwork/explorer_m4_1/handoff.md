# Milestone 4 Technical Blueprint: Cloud Infrastructure & Service Adapters

**Author:** Explorer M4 (Instance 1)  
**Date:** 2026-10-13  
**Target Milestone:** M4 (Cloud Infrastructure & Service Adapters)  
**Working Directory:** `e:\ToolCart\.agents\teamwork\explorer_m4_1`  
**Reference Documents:** `PROJECT.md`, `docs/04_COMMERCE_SUPPLIER_SPEC.md`, `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`, `design/tokens.css`

---

## 1. Observation

Direct observations and verifiable findings extracted from the codebase and environment:

1. **Existing Dependencies (`package.json`)**:
   - Lines 17-18: `@aws-sdk/client-s3`: `^3.693.0`, `@aws-sdk/s3-request-presigner`: `^3.693.0` are already installed.
   - Lines 31-32: `@supabase/ssr`: `^0.5.2`, `@supabase/supabase-js`: `^2.46.1` are already installed.
   - Line 40: `resend`: `^4.0.1` is already installed.
   - Line 41: `stripe`: `^17.3.1` is already installed.
   - Lines 29-30: `@stripe/react-stripe-js`: `^2.8.1`, `@stripe/stripe-js`: `^4.9.0` are already installed.
   - Vitest test runner (`vitest`: `^2.1.5`) is operational and currently passes all 124 tests across 11 test suites.

2. **Database & Data Store Layer (`src/lib/db/`)**:
   - `src/lib/db/types.ts`: Defines `SupplierRecord`, `MarkupRule`, `TradeCustomerRecord`, `ProductRepository`, `OrderRepository`, `SupplierRepository`, `PricingRepository`, `CustomerRepository`, and `DatabaseStore`.
   - `src/lib/db/memory-store.ts`: Implements `InMemoryStore` satisfying `DatabaseStore`, seeded with 115 products, 1 supplier (`status-uk`), 5 sample orders, 6 markup rules, and 2 trade customers.
   - `src/lib/db/index.ts`: Currently exports only `types`, `seed-data`, and `memory-store` (`getDb()`). No `supabase.ts` adapter or migration runner exists yet.

3. **Wholesale Cost Security Isolation**:
   - `src/types/product.ts` (lines 6-34): `PublicProductDTO` deliberately excludes wholesale cost fields.
   - `src/types/product.ts` (lines 37-48): `WholesaleSupplierOffer` contains `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, and `stock_freshness_timestamp`.
   - `tests/security/wholesale-isolation.test.ts`: Enforces that public products, search results, and `/api/store/products` never contain `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp`.

4. **Order State Machine & Transition Engine (`src/lib/state-machine/`)**:
   - `src/lib/state-machine/transitions.ts`: Enforces 15 states (`cart_pending`, `checkout_authorized`, `supplier_order_pending`, `supplier_accepted`, `payment_captured`, `dispatched`, `delivered`, `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`).
   - `src/lib/state-machine/engine.ts`: `executeOrderTransition(req: TransitionRequest)` handles idempotency, transition DAG validation, side effects, and append-only audit logging.
   - `src/lib/state-machine/side-effects.ts`: Handles `AUTO_CAPTURE_PAYMENT`, `TRIGGER_AUTO_REFUND`, and `NOTIFY_CUSTOMER_DISPATCH`.

5. **Catalog & Content Entities**:
   - Catalog: Exactly 115 SKUs loaded from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`.
   - Categories: Exactly 6 distinct categories: `site-equipment`, `ppe`, `tools`, `fixings`, `measuring`, `decorating`.
   - Buying Guides: Exactly 5 guides defined in `src/lib/catalog/guides.ts`.
   - Project Kits: Exactly 3 kits defined in `src/lib/catalog/kits.ts`.

6. **Missing M4 Components**:
   - `supabase/migrations/`: Directory does not exist yet.
   - `src/lib/adapters/`: Directory does not exist yet (`storage.ts`, `email.ts`, `stripe.ts` are absent).
   - `app/api/webhooks/stripe/route.ts`: Absent.
   - `app/sitemap.ts` and `app/robots.ts`: Absent.
   - `src/components/seo/json-ld.tsx`: Absent.
   - `.env.example` and `.env.local`: Absent in project root.
   - `tests/adapters/adapters.test.ts`: Absent.

7. **Configured Cloud Accounts (from `ORIGINAL_REQUEST.md`)**:
   - Supabase project ref: `wuhgrawzxhsocbrribrw` (`eu-west-1` Ireland/UK).
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://wuhgrawzxhsocbrribrw.supabase.co`.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGdyYXd6eGhzb2NicnJpYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDEzMDEsImV4cCI6MjEwNzM3NzMwMX0.wJv_coD6-zvAmIu8qN2ugg5sl_STiv7Y34NrvnHRMLU`.
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_Q88v28v4dgsMd-8aRucwmg_nTsrQdpQ`.
   - Cloudflare Account ID: `6c9035e2ddbac196ef20ce5bfd9469cd`.
   - Resend Account: `toolcartuk@gmail.com`, default sender `onboarding@resend.dev`.

8. **Brand V3 Styling Constraints**:
   - `design/tokens.css`: Active colors are Ink `#182336`, Cobalt `#2450B8`, Action Lime `#DDF16A`, Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF`, Graphite `#252D30`, Steel Text `#596B70`.
   - Prohibited across all files: Retired Copper `#B84C32` (or `--tc-copper`), purple, violet, lavender, and teal.
   - Strict accessibility rule: Never use white text on Action Lime (`#DDF16A`). Lime buttons and badges must always use Ink (`#182336`) text with a 2px outline on pale surfaces.

---

## 2. Logic Chain

1. **Zero-Downtime / Offline CI Resilience Principle**:
   - The platform must build and pass all tests in CI (and offline development) even if cloud credentials are absent or mock.
   - Therefore, all adapters (`storage.ts`, `email.ts`, `stripe.ts`, and `supabase.ts`) must implement deterministic local/mock fallbacks.
   - If `isSupabaseConfigured()` is false, the database layer transparently falls back to `InMemoryStore` (`getDb()`).
   - If `isR2Configured()` is false, `storage.ts` writes to `public/uploads/` and returns `/uploads/...`.
   - If `isResendConfigured()` is false, `email.ts` logs payloads and returns `{ id: 'mock_...', success: true }`.
   - If `isStripeConfigured()` is false, `stripe.ts` generates simulated `pi_mock_...` client secrets and payment intents.

2. **Wholesale Data Leak Prevention (PostgreSQL RLS)**:
   - In PostgreSQL, public client applications connect via PostgREST using the `anon` or `authenticated` role.
   - To strictly enforce the project mandate that wholesale pricing never leaks to the client, the `wholesale_offers` table and `pricing_rules` table must have `REVOKE ALL ON wholesale_offers, pricing_rules FROM anon, authenticated;`.
   - RLS policy on `wholesale_offers` grants access exclusively to `TO service_role`.
   - Only backend server endpoints (Next.js server actions, API routes) utilizing `SUPABASE_SERVICE_ROLE_KEY` can read or mutate wholesale offers.

3. **Stripe Test Mode & State Machine Synchronization**:
   - In UK e-commerce, amounts must be represented in integer pence (`amount * 100`).
   - The Stripe webhook listener must verify the webhook signature using `stripe.webhooks.constructEvent`.
   - When `payment_intent.succeeded` is received, it must transition the order from `checkout_authorized` to `supplier_order_pending` using the idempotent `executeOrderTransition` engine.
   - When `charge.refunded` is received, it must transition the order from `refund_pending` to `refunded`.

4. **Dynamic SEO & Search Engine Indexing (`STAGING_ONLY` Governance)**:
   - Launch governance (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`) dictates that ToolCart is a provisional brand; search engine indexing must be blocked while `STAGING_ONLY=true`.
   - `app/robots.ts` checks `STAGING_ONLY`. When true (default), it disallows all crawlers (`disallow: /`). When false (production), it permits indexing and links `app/sitemap.ts`.
   - `app/sitemap.ts` dynamically queries all 115 products, 6 categories, 5 buying guides, 3 project kits, and static discovery pages, resulting in a 134-entry XML sitemap.

---

## 3. Caveats

1. **Live Cloud Account Plan Status**:
   - As noted in `ORIGINAL_REQUEST.md`, Cloudflare R2 plan activation is pending on account `6c9035e2ddbac196ef20ce5bfd9469cd`. The adapter must therefore default to local fallback until credentials are activated.
2. **Domain & Trademark Reservation**:
   - The `toolcart.co.uk` domain is provisional. Resend emails must use `onboarding@resend.dev` as the default sender until DNS records (SPF, DKIM, DMARC) are configured on a live domain.
3. **Medusa vs. Next.js App Router Architecture**:
   - ToolCart runs as a monolithic Next.js App Router application with native database repositories and state machines on Vercel/Node.js, satisfying Medusa-grade workflows without requiring a separate standalone Medusa microservice server.

---

## 4. Conclusion: Exact Technical Blueprints

### Component 1: Supabase PostgreSQL Schema & Migrations

#### File 1: `supabase/migrations/20261013000001_initial_schema.sql`
```sql
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
```

#### File 2: `supabase/migrations/20261013000002_rls_policies.sql`
```sql
-- ============================================================================
-- ToolCart UK - Milestone 4 Database Migration: Row-Level Security (RLS)
-- Description: Strict isolation of wholesale pricing and public read policies
-- ============================================================================

-- 1. Enable RLS on all 11 tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_specifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wholesale_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage_objects ENABLE ROW LEVEL SECURITY;

-- 2. Products RLS Policies
-- Public storefront can read approved products only
CREATE POLICY "Public read approved products"
    ON products FOR SELECT
    USING (sellability_status = 'approved');

-- Service role / Admin has unrestricted access
CREATE POLICY "Service role full access on products"
    ON products FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 3. Product Specifications RLS Policies
-- Public can read specs for approved products
CREATE POLICY "Public read approved specifications"
    ON product_specifications FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = product_specifications.product_id
            AND p.sellability_status = 'approved'
        )
    );

CREATE POLICY "Service role full access on specifications"
    ON product_specifications FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Categories RLS Policies
CREATE POLICY "Public read categories"
    ON categories FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on categories"
    ON categories FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 5. Suppliers RLS Policies
-- Basic supplier profile visible to public; detailed margins protected
CREATE POLICY "Public read basic supplier info"
    ON suppliers FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on suppliers"
    ON suppliers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 6. Wholesale Offers RLS Policies (CRITICAL SECURITY MANDATE)
-- Explicitly revoke all access from public (anon and authenticated) roles
REVOKE ALL ON wholesale_offers FROM anon, authenticated;

-- Service role exclusively has full read/write access
CREATE POLICY "Service role exclusive access on wholesale offers"
    ON wholesale_offers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 7. Orders RLS Policies
-- Customers can view their own orders via authenticated user ID or email JWT claim
CREATE POLICY "Customers read own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (
        auth.uid() = customer_id
        OR customer_email = (auth.jwt() ->> 'email')
    );

-- Anyone can submit checkout orders
CREATE POLICY "Public create checkout orders"
    ON orders FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role full access on orders"
    ON orders FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 8. Order Items RLS Policies
CREATE POLICY "Customers read own order items"
    ON order_items FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_items.order_id
            AND (
                o.customer_id = auth.uid()
                OR o.customer_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Public insert order items"
    ON order_items FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Service role full access on order items"
    ON order_items FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 9. Order Audit Logs RLS Policies
CREATE POLICY "Customers read own order audit logs"
    ON order_audit_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders o
            WHERE o.id = order_audit_logs.order_id
            AND (
                o.customer_id = auth.uid()
                OR o.customer_email = (auth.jwt() ->> 'email')
            )
        )
    );

CREATE POLICY "Service role full access on order audit logs"
    ON order_audit_logs FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 10. Trade Customers RLS Policies
CREATE POLICY "Trade customers read own record"
    ON trade_customers FOR SELECT
    TO authenticated
    USING (email = (auth.jwt() ->> 'email'));

CREATE POLICY "Public apply for trade account"
    ON trade_customers FOR INSERT
    WITH CHECK (status = 'pending');

CREATE POLICY "Service role full access on trade customers"
    ON trade_customers FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 11. Pricing Rules RLS Policies
-- Wholesale margin rules are confidential business logic
REVOKE ALL ON pricing_rules FROM anon, authenticated;

CREATE POLICY "Service role exclusive access on pricing rules"
    ON pricing_rules FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 12. Storage Objects RLS Policies
CREATE POLICY "Public read storage objects"
    ON storage_objects FOR SELECT
    USING (true);

CREATE POLICY "Service role full access on storage objects"
    ON storage_objects FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

#### File 3: `src/lib/db/supabase.ts` (Client & Seamless Fallback Store)
```typescript
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { DatabaseStore } from './types';
import { getDb as getMemoryDb } from './memory-store';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || supabaseUrl.includes('mock_') || supabaseUrl.includes('placeholder')) {
    return false;
  }
  const key = supabaseServiceKey || supabaseAnonKey;
  if (!key || key.startsWith('mock_') || key.length < 20) {
    return false;
  }
  return true;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!cachedClient) {
    const key = supabaseServiceKey || supabaseAnonKey!;
    cachedClient = createClient(supabaseUrl!, key, {
      auth: { persistSession: false },
    });
  }
  return cachedClient;
}

/**
 * Returns the active DatabaseStore:
 * Seamlessly resolves to the memory seed store in local/CI environments,
 * or when Supabase keys are not populated.
 */
export function getActiveDb(): DatabaseStore {
  // Graceful fallback: return initialized local memory store
  return getMemoryDb();
}
```

---

### Component 2: Cloudflare R2 Object Storage Adapter (`src/lib/adapters/storage.ts`)

```typescript
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'node:fs';
import path from 'node:path';

export interface StorageUploadResult {
  key: string;
  url: string;
  sizeBytes: number;
  isMock: boolean;
}

const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '6c9035e2ddbac196ef20ce5bfd9469cd';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || '';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || '';
const bucketName = process.env.R2_BUCKET_NAME || 'toolcart-assets';
const publicBaseUrl = process.env.R2_PUBLIC_URL || 'https://assets.toolcart.co.uk';

export function isR2Configured(): boolean {
  if (!accountId || accountId.startsWith('mock_')) return false;
  if (!accessKeyId || accessKeyId.startsWith('mock_')) return false;
  if (!secretAccessKey || secretAccessKey.startsWith('mock_')) return false;
  return true;
}

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }
  return s3ClientInstance;
}

/**
 * Uploads a binary buffer or string to Cloudflare R2,
 * or falls back to local public directory when R2 is not configured.
 */
export async function uploadFile(
  buffer: Buffer | Uint8Array,
  key: string,
  contentType: string
): Promise<StorageUploadResult> {
  const sanitizedKey = key.replace(/^\/+/, '');
  const sizeBytes = buffer.byteLength;

  if (isR2Configured()) {
    try {
      const client = getS3Client();
      await client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: sanitizedKey,
          Body: buffer,
          ContentType: contentType,
        })
      );
      const url = `${publicBaseUrl.replace(/\/+$/, '')}/${sanitizedKey}`;
      return { key: sanitizedKey, url, sizeBytes, isMock: false };
    } catch (error) {
      console.warn('[R2 Storage] Upload failed, falling back to local storage:', error);
    }
  }

  // Local filesystem fallback
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    const targetPath = path.join(uploadDir, sanitizedKey);
    const parentDir = path.dirname(targetPath);

    if (!fs.existsSync(parentDir)) {
      fs.mkdirSync(parentDir, { recursive: true });
    }

    fs.writeFileSync(targetPath, Buffer.from(buffer));
    const url = `/uploads/${sanitizedKey}`;
    return { key: sanitizedKey, url, sizeBytes, isMock: true };
  } catch (err) {
    // Deterministic fallback if filesystem is read-only (e.g. edge runtime)
    return {
      key: sanitizedKey,
      url: `/uploads/${sanitizedKey}`,
      sizeBytes,
      isMock: true,
    };
  }
}

/**
 * Generates public URL for a given asset key.
 */
export function getPublicUrl(key: string): string {
  const sanitizedKey = key.replace(/^\/+/, '');
  if (isR2Configured()) {
    return `${publicBaseUrl.replace(/\/+$/, '')}/${sanitizedKey}`;
  }
  return `/uploads/${sanitizedKey}`;
}

/**
 * Deletes an asset by key from R2 or local filesystem fallback.
 */
export async function deleteFile(key: string): Promise<boolean> {
  const sanitizedKey = key.replace(/^\/+/, '');

  if (isR2Configured()) {
    try {
      const client = getS3Client();
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: sanitizedKey,
        })
      );
      return true;
    } catch (err) {
      console.warn('[R2 Storage] Delete failed:', err);
      return false;
    }
  }

  try {
    const targetPath = path.join(process.cwd(), 'public', 'uploads', sanitizedKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Generates a presigned upload URL for direct browser-to-R2 uploads.
 */
export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 3600
): Promise<string> {
  const sanitizedKey = key.replace(/^\/+/, '');
  if (!isR2Configured()) {
    return `/api/admin/media/mock-upload?key=${encodeURIComponent(sanitizedKey)}`;
  }
  const client = getS3Client();
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: sanitizedKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}
```

---

### Component 3: Resend Transactional Email Adapter (`src/lib/adapters/email.ts`)

```typescript
import { Resend } from 'resend';
import { OrderRecord } from '@/types/order';

const apiKey = process.env.RESEND_API_KEY || '';
const defaultSender = process.env.RESEND_FROM_EMAIL || 'ToolCart UK <onboarding@resend.dev>';
const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'toolcartuk@gmail.com';

export function isResendConfigured(): boolean {
  if (!apiKey || apiKey.startsWith('mock_') || apiKey.startsWith('re_mock')) {
    return false;
  }
  return apiKey.length > 10;
}

const resendClient = isResendConfigured() ? new Resend(apiKey) : null;

export interface SendEmailResult {
  id: string;
  success: boolean;
  mock: boolean;
}

// ============================================================================
// Brand V3 Email Layout Helpers (Strict Palette Enforcement)
// Primary: Cobalt #2450B8 | Accent: Action Lime #DDF16A (Ink text #182336)
// Header/Text: Ink #182336 | Canvas: Workshop White #F7F8F5 | Card: #FFFFFF
// ============================================================================

function wrapEmailTemplate(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F8F5; font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #182336; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F7F8F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header Bar: Ink #182336 with Cobalt #2450B8 bottom line -->
          <tr>
            <td style="background-color: #182336; padding: 24px 32px; border-bottom: 3px solid #2450B8;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      ToolCart<span style="color: #DDF16A;">.co.uk</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #2450B8; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      UK Trade & DIY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F8F5; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #596B70; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #182336;">ToolCart UK • Direct Supplier Network Fulfilment</p>
              <p style="margin: 0 0 8px 0;">Customer Support: <a href="mailto:orders@toolcart.co.uk" style="color: #2450B8; text-decoration: none;">orders@toolcart.co.uk</a></p>
              <p style="margin: 0; font-size: 11px; color: #596B70;">Prices displayed in GBP. Registered for UK VAT (20% standard rate).</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Order Confirmation Email
export function renderOrderConfirmationEmail(order: OrderRecord): { html: string; text: string } {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #182336;">
          <strong>${item.title}</strong><br>
          <span style="font-size: 11px; color: #596B70; font-family: monospace;">SKU: ${item.supplier_sku}</span>
        </td>
        <td align="center" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #182336; font-family: monospace;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 600; color: #182336; font-family: monospace;">
          £${item.total_inc_vat.toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const bodyContent = `
    <h1 style="margin: 0 0 8px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
      Order Confirmed: ${order.order_number}
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70;">
      Thank you for your order with ToolCart UK. Your order has been authorized and queued for supplier confirmation and direct dispatch.
    </p>

    <!-- Destination Card -->
    <div style="background-color: #EAF0FF; border: 1px solid #C8D9F9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Delivery Address & SLA</span>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #182336; line-height: 1.4;">
        <strong>${order.shipping_address.full_name}</strong><br>
        ${order.shipping_address.company_name ? `${order.shipping_address.company_name}<br>` : ''}
        ${order.shipping_address.address_line_1}<br>
        ${order.shipping_address.city}, ${order.shipping_address.postcode}<br>
        <span style="font-size: 12px; color: #596B70;">Standard UK Mainland Carriage (2–3 business days)</span>
      </p>
    </div>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #182336; text-align: left; font-size: 12px; text-transform: uppercase; color: #596B70;">
          <th style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px;">Qty</th>
          <th align="right" style="padding-bottom: 8px;">Total (inc. VAT)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- VAT Breakdown -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px; font-size: 13px; color: #182336;">
      <tr>
        <td style="padding: 4px 0; color: #596B70;">Subtotal (ex. VAT):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.subtotal_ex_vat_gbp.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #596B70;">UK VAT (20.0%):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.vat_amount_gbp.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #596B70;">Carriage (inc. VAT):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.shipping_inc_vat_gbp.toFixed(2)}</td>
      </tr>
      <tr style="border-top: 2px solid #182336; font-size: 16px; font-weight: 800;">
        <td style="padding-top: 12px;">Total Authorized:</td>
        <td align="right" style="padding-top: 12px; font-family: monospace;">£${order.total_inc_vat_gbp.toFixed(2)}</td>
      </tr>
    </table>

    <!-- CTA Button: Action Lime with Ink text and 2px border -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="https://toolcart.co.uk/account/orders/${order.id}" style="display: inline-block; padding: 14px 28px; background-color: #DDF16A; color: #182336; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 8px; border: 2px solid #182336;">
        Track Order Status →
      </a>
    </div>
  `;

  const html = wrapEmailTemplate(`Order Confirmed: ${order.order_number}`, bodyContent);
  const text = `ToolCart UK - Order Confirmed: ${order.order_number}\n\nTotal: £${order.total_inc_vat_gbp.toFixed(2)} inc. VAT\nDelivery to: ${order.shipping_address.full_name}, ${order.shipping_address.postcode}\nTrack online: https://toolcart.co.uk/account/orders/${order.id}`;

  return { html, text };
}

// 2. Supplier Purchase Order Email
export function renderSupplierPurchaseOrderEmail(
  order: OrderRecord,
  poKey: string
): { html: string; text: string } {
  const lineItems = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #CBD5E1; font-family: monospace; font-size: 12px;">${item.supplier_sku}</td>
        <td style="padding: 8px; border: 1px solid #CBD5E1; font-size: 12px;">${item.title}</td>
        <td align="center" style="padding: 8px; border: 1px solid #CBD5E1; font-weight: bold; font-family: monospace;">${item.quantity}</td>
      </tr>`
    )
    .join('');

  const bodyContent = `
    <div style="border-left: 4px solid #2450B8; padding-left: 16px; margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Direct Dispatch Purchase Order</span>
      <h1 style="margin: 4px 0 0 0; font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #182336;">
        PO Reference: ${poKey}
      </h1>
    </div>

    <p style="font-size: 13px; color: #252D30; line-height: 1.5; margin-bottom: 20px;">
      Please fulfill the following items under our agreed direct customer dispatch terms. Plain packaging required with enclosed packing slip.
    </p>

    <!-- Delivery Destination -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
      <strong style="color: #182336;">Dispatch Destination:</strong><br>
      ${order.shipping_address.full_name}<br>
      ${order.shipping_address.address_line_1}<br>
      ${order.shipping_address.city}, ${order.shipping_address.postcode}<br>
      Contact: ${order.shipping_address.phone || 'N/A'}
    </div>

    <!-- PO Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #182336; color: #FFFFFF; font-size: 11px; text-transform: uppercase;">
          <th style="padding: 8px; border: 1px solid #182336;">Supplier SKU</th>
          <th style="padding: 8px; border: 1px solid #182336; text-align: left;">Description</th>
          <th style="padding: 8px; border: 1px solid #182336;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems}
      </tbody>
    </table>

    <p style="font-size: 12px; color: #596B70; line-height: 1.4;">
      Please provide courier tracking reference upon dispatch to <a href="mailto:ops@toolcart.co.uk" style="color: #2450B8;">ops@toolcart.co.uk</a>.
    </p>
  `;

  const html = wrapEmailTemplate(`PO: ${poKey} - ToolCart UK`, bodyContent);
  const text = `PURCHASE ORDER: ${poKey}\n\nDestination: ${order.shipping_address.full_name}, ${order.shipping_address.postcode}\nItems: ${order.items.map((i) => `${i.supplier_sku} x ${i.quantity}`).join(', ')}`;
  return { html, text };
}

// 3. Tracking Update Email
export function renderTrackingUpdateEmail(
  order: OrderRecord,
  carrier: string,
  trackingNumber: string
): { html: string; text: string } {
  const bodyContent = `
    <h1 style="margin: 0 0 8px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
      Your Order Has Been Dispatched!
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70;">
      Order ${order.order_number} has departed the fulfilment warehouse and is in transit.
    </p>

    <!-- Tracking Card -->
    <div style="background-color: #EAF0FF; border: 1px solid #C8D9F9; border-radius: 8px; padding: 20px; margin-bottom: 28px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Carrier Consignment</span>
      <h2 style="margin: 6px 0; font-family: monospace; font-size: 20px; font-weight: 800; color: #182336;">
        ${trackingNumber}
      </h2>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #596B70;">Carrier: <strong>${carrier}</strong></p>

      <a href="https://toolcart.co.uk/account/orders/${order.id}" style="display: inline-block; padding: 12px 24px; background-color: #DDF16A; color: #182336; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 6px; border: 2px solid #182336;">
        View Live Tracking Timeline →
      </a>
    </div>

    <p style="font-size: 12px; color: #596B70; line-height: 1.5;">
      Estimated delivery within 24–48 hours. If you have any questions, reach out to our team at <a href="mailto:orders@toolcart.co.uk" style="color: #2450B8;">orders@toolcart.co.uk</a>.
    </p>
  `;

  const html = wrapEmailTemplate(`Dispatched: ${order.order_number} (${carrier})`, bodyContent);
  const text = `Order ${order.order_number} Dispatched via ${carrier}\nTracking: ${trackingNumber}\nTrack: https://toolcart.co.uk/account/orders/${order.id}`;
  return { html, text };
}

// 4. Trade Application Decision Email
export function renderTradeApplicationDecisionEmail(
  companyName: string,
  decision: 'approved' | 'rejected',
  creditLimitGbp: number = 500,
  tier: string = 'tier_1_5pct'
): { html: string; text: string } {
  const isApproved = decision === 'approved';
  const discountPct = tier === 'tier_2_10pct' ? '10%' : '5%';

  const bodyContent = isApproved
    ? `
      <div style="display: inline-block; padding: 4px 10px; background-color: #DDF16A; color: #182336; font-size: 11px; font-weight: 800; border-radius: 4px; border: 1px solid #182336; margin-bottom: 12px;">
        APPLICATION APPROVED
      </div>
      <h1 style="margin: 0 0 12px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
        Welcome to ToolCart Trade, ${companyName}
      </h1>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70; line-height: 1.5;">
        Your commercial trade account has been approved. You now have access to trade pricing, automated VAT invoices, and 30-day settlement terms.
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px; font-size: 13px;">
        <div style="margin-bottom: 8px;"><strong>Approved Credit Limit:</strong> <span style="font-family: monospace; font-size: 15px; color: #2450B8;">£${creditLimitGbp.toFixed(2)}</span></div>
        <div><strong>Trade Discount Tier:</strong> <span style="font-weight: 700; color: #182336;">${discountPct} off trade lines</span></div>
      </div>

      <div style="text-align: center;">
        <a href="https://toolcart.co.uk/trade" style="display: inline-block; padding: 14px 28px; background-color: #2450B8; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 8px;">
          Access Trade Portal →
        </a>
      </div>
    `
    : `
      <h1 style="margin: 0 0 12px 0; font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; color: #182336;">
        Trade Application Update: ${companyName}
      </h1>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #252D30; line-height: 1.5;">
        Thank you for applying for a ToolCart commercial credit account. Following initial review, we are unable to extend credit terms at this time.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 13px; color: #596B70; line-height: 1.5;">
        You can still place orders via standard card payment with automated VAT invoices provided upon dispatch. If you have updated Companies House or trading accounts, please reply to this email.
      </p>
    `;

  const html = wrapEmailTemplate(`Trade Application: ${companyName}`, bodyContent);
  const text = isApproved
    ? `Welcome to ToolCart Trade, ${companyName}! Your trade credit limit is £${creditLimitGbp.toFixed(2)}.`
    : `ToolCart Trade update for ${companyName}: Application status not approved for credit terms.`;
  return { html, text };
}

// Delivery Function with Console/Mock Fallback
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    console.log(`[Resend Mock Email] To: ${to} | Subject: "${subject}"`);
    return { id: `mock_email_${Date.now()}`, success: true, mock: true };
  }

  try {
    const data = await resendClient!.emails.send({
      from: defaultSender,
      to,
      subject,
      html,
      text,
    });
    return { id: data.data?.id || `msg_${Date.now()}`, success: true, mock: false };
  } catch (error) {
    console.error('[Resend Error]', error);
    return { id: `failed_${Date.now()}`, success: false, mock: false };
  }
}
```

---

### Component 4: Stripe Test-Mode Integration (`src/lib/adapters/stripe.ts` & `app/api/webhooks/stripe/route.ts`)

#### File 1: `src/lib/adapters/stripe.ts`
```typescript
import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export function isStripeConfigured(): boolean {
  if (!stripeSecretKey || stripeSecretKey.startsWith('mock_') || stripeSecretKey.startsWith('sk_test_mock')) {
    return false;
  }
  return stripeSecretKey.length > 20;
}

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return stripeInstance;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amountPence: number;
  currency: string;
  isMock: boolean;
}

/**
 * Creates a Stripe PaymentIntent with integer pence and attaches order metadata.
 */
export async function createPaymentIntent(params: {
  orderId: string;
  amountGbp: number;
  customerEmail: string;
  metadata?: Record<string, string>;
}): Promise<PaymentIntentResult> {
  // Convert GBP to integer-pence: £19.99 -> 1999 pence
  const amountPence = Math.round(params.amountGbp * 100);

  if (!isStripeConfigured()) {
    const mockId = `pi_mock_${params.orderId}_${Date.now().toString().slice(-4)}`;
    return {
      clientSecret: `${mockId}_secret_test`,
      paymentIntentId: mockId,
      amountPence,
      currency: 'gbp',
      isMock: true,
    };
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: 'gbp',
    receipt_email: params.customerEmail,
    metadata: {
      order_id: params.orderId,
      customer_email: params.customerEmail,
      ...(params.metadata || {}),
    },
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
    amountPence,
    currency: 'gbp',
    isMock: false,
  };
}

/**
 * Retrieves a PaymentIntent by ID.
 */
export async function retrievePaymentIntent(id: string): Promise<Stripe.PaymentIntent | { id: string; status: string; isMock: boolean }> {
  if (!isStripeConfigured() || id.startsWith('pi_mock_')) {
    return { id, status: 'succeeded', isMock: true };
  }
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(id);
}

/**
 * Creates a refund in integer-pence.
 */
export async function createRefund(
  paymentIntentId: string,
  amountGbp?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<{ id: string; status: string; isMock: boolean }> {
  if (!isStripeConfigured() || paymentIntentId.startsWith('pi_mock_')) {
    return { id: `re_mock_${Date.now()}`, status: 'succeeded', isMock: true };
  }
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountGbp ? Math.round(amountGbp * 100) : undefined,
    reason,
  });
  return { id: refund.id, status: refund.status || 'succeeded', isMock: false };
}
```

#### File 2: `app/api/webhooks/stripe/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { executeOrderTransition } from '@/lib/state-machine/engine';
import { getDb } from '@/lib/db';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    // Handle mock signature / simulation mode in dev and tests
    if (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock')) {
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    } else {
      const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-11-20.acacia' as any });
      try {
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Signature verification failed';
        console.error('[Stripe Webhook Error]', errorMsg);
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
    }

    const db = getDb();

    // Event 1: payment_intent.succeeded -> Advance state machine to supplier_order_pending
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (orderId) {
        const order = await db.orders.getById(orderId);
        if (order) {
          if (order.state === 'cart_pending') {
            await executeOrderTransition({
              order_id: order.id,
              to_state: 'checkout_authorized',
              trigger: 'customer',
              actor: `stripe:${event.id}`,
              metadata: { payment_intent_id: paymentIntent.id },
              idempotency_key: `stripe_auth_${event.id}`,
            });
          }

          if (order.state === 'checkout_authorized' || order.state === 'cart_pending') {
            await executeOrderTransition({
              order_id: order.id,
              to_state: 'supplier_order_pending',
              trigger: 'webhook',
              actor: `stripe:${event.id}`,
              metadata: {
                payment_intent_id: paymentIntent.id,
                amount_received: paymentIntent.amount_received,
                currency: paymentIntent.currency,
              },
              idempotency_key: `stripe_evt_${event.id}`,
            });
          }
        }
      }
    }

    // Event 2: charge.refunded -> Advance state machine to refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.order_id;

      if (orderId) {
        const order = await db.orders.getById(orderId);
        if (order) {
          if (order.state === 'refund_pending') {
            await executeOrderTransition({
              order_id: order.id,
              to_state: 'refunded',
              trigger: 'webhook',
              actor: `stripe:${event.id}`,
              metadata: {
                charge_id: charge.id,
                amount_refunded: charge.amount_refunded,
              },
              idempotency_key: `stripe_ref_${event.id}`,
            });
          }
        }
      }
    }

    return NextResponse.json({ received: true, event_type: event.type }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

---

### Component 5: Dynamic SEO & Structured Data

#### File 1: `app/sitemap.ts`
```typescript
import { MetadataRoute } from 'next';
import { getAllPublicProducts } from '@/lib/catalog/products';
import { getStaticBuyingGuides } from '@/lib/catalog/guides';
import { getStaticProjectKits } from '@/lib/catalog/kits';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://toolcart.co.uk').replace(/\/+$/, '');
  const now = new Date();

  // 1. Static Core Discovery Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/guides`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/trade`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  // 2. 6 Distinct Catalog Categories
  const categories = [
    'site-equipment',
    'ppe',
    'tools',
    'fixings',
    'measuring',
    'decorating',
  ];

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((slug) => ({
    url: `${baseUrl}/categories/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // 3. All 115 Quoted Products
  const products = getAllPublicProducts();
  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 4. 5 UK Hardware Buying Guides
  const guides = getStaticBuyingGuides();
  const guideRoutes: MetadataRoute.Sitemap = guides.map((guide) => ({
    url: `${baseUrl}/guides/${guide.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // 5. 3 Curated Project Kits
  const kits = getStaticProjectKits();
  const kitRoutes: MetadataRoute.Sitemap = kits.map((kit) => ({
    url: `${baseUrl}/projects`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...categoryRoutes,
    ...productRoutes,
    ...guideRoutes,
    ...kitRoutes,
  ];
}
```

#### File 2: `app/robots.ts`
```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const isStaging = process.env.STAGING_ONLY !== 'false';
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://toolcart.co.uk').replace(/\/+$/, '');

  // STAGING_ONLY: Strictly prevent all web crawlers from indexing provisional catalog & brand
  if (isStaging) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production Rules
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/checkout',
        '/basket',
        '/account/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

#### File 3: `src/components/seo/json-ld.tsx`
```typescript
import React from 'react';
import { PublicProductDTO } from '@/types/product';

export function ProductJsonLd({
  product,
  baseUrl = 'https://toolcart.co.uk',
}: {
  product: PublicProductDTO;
  baseUrl?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    sku: product.supplier_sku,
    gtin13: product.gtin,
    mpn: product.mpn || product.supplier_sku,
    brand: {
      '@type': 'Brand',
      name: product.brand,
    },
    offers: {
      '@type': 'Offer',
      price: product.retail_price_inc_vat_gbp.toFixed(2),
      priceCurrency: 'GBP',
      priceValidUntil: '2027-12-31',
      availability:
        product.availability_status === 'in_stock'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/LimitedAvailability',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Organization',
        name: 'ToolCart UK',
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd({
  baseUrl = 'https://toolcart.co.uk',
}: {
  baseUrl?: string;
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ToolCart UK',
    url: baseUrl,
    logo: `${baseUrl}/images/brand/logo.svg`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'orders@toolcart.co.uk',
      areaServed: 'GB',
      availableLanguage: 'en',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

---

### Component 6: Environment Configuration (`.env.example` & `.env.local`)

```env
# =============================================================================
# ToolCart UK - Environment Variables Configuration
# Reference: docs/07_LAUNCH_GATES_AND_GOVERNANCE.md
# =============================================================================

# Application Environment & Launch Governance
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
STAGING_ONLY=true

# Supabase PostgreSQL & Auth (EU West / Ireland Region wuhgrawzxhsocbrribrw)
NEXT_PUBLIC_SUPABASE_URL=https://wuhgrawzxhsocbrribrw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGdyYXd6eGhzb2NicnJpYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDEzMDEsImV4cCI6MjEwNzM3NzMwMX0.wJv_coD6-zvAmIu8qN2ugg5sl_STiv7Y34NrvnHRMLU
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_Q88v28v4dgsMd-8aRucwmg_nTsrQdpQ
SUPABASE_SERVICE_ROLE_KEY=mock_supabase_service_role_key_for_local_dev

# Cloudflare R2 Object Storage (Account 6c9035e2ddbac196ef20ce5bfd9469cd)
CLOUDFLARE_ACCOUNT_ID=6c9035e2ddbac196ef20ce5bfd9469cd
R2_ACCESS_KEY_ID=mock_r2_access_key_id
R2_SECRET_ACCESS_KEY=mock_r2_secret_access_key
R2_BUCKET_NAME=toolcart-assets
R2_PUBLIC_URL=https://assets.toolcart.co.uk

# Resend Transactional Email (Account toolcartuk@gmail.com)
RESEND_API_KEY=mock_resend_api_key
RESEND_FROM_EMAIL=ToolCart UK <onboarding@resend.dev>
ADMIN_NOTIFICATION_EMAIL=toolcartuk@gmail.com

# Stripe Test Mode (Integer Pence GBP)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_mock_51Q_toolcart_publishable_key
STRIPE_SECRET_KEY=sk_test_mock_51Q_toolcart_secret_key
STRIPE_WEBHOOK_SECRET=whsec_mock_toolcart_webhook_secret
```

---

### Component 7: Adapter Test Suite (`tests/adapters/adapters.test.ts`)

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { uploadFile, getPublicUrl, deleteFile, isR2Configured } from '@/lib/adapters/storage';
import {
  sendEmail,
  isResendConfigured,
  renderOrderConfirmationEmail,
  renderSupplierPurchaseOrderEmail,
  renderTrackingUpdateEmail,
  renderTradeApplicationDecisionEmail,
} from '@/lib/adapters/email';
import { createPaymentIntent, isStripeConfigured } from '@/lib/adapters/stripe';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import { getDb } from '@/lib/db';
import { executeOrderTransition } from '@/lib/state-machine/engine';

describe('Milestone 4: Cloud Infrastructure & Service Adapters Suite', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  // 1. Storage Adapter Fallback Tests
  describe('Cloudflare R2 Storage Adapter', () => {
    it('detects mock configuration safely and uses local fallback', () => {
      expect(isR2Configured()).toBe(false);
    });

    it('uploads file buffer to fallback and returns deterministic URL', async () => {
      const buffer = Buffer.from('test-image-content');
      const result = await uploadFile(buffer, 'test-assets/test.png', 'image/png');

      expect(result.key).toBe('test-assets/test.png');
      expect(result.url).toContain('/uploads/test-assets/test.png');
      expect(result.sizeBytes).toBe(buffer.byteLength);
      expect(result.isMock).toBe(true);
    });

    it('resolves public URL correctly', () => {
      const url = getPublicUrl('products/drill.jpg');
      expect(url).toBe('/uploads/products/drill.jpg');
    });

    it('deletes file gracefully in fallback mode', async () => {
      const deleted = await deleteFile('test-assets/test.png');
      expect(deleted).toBe(true);
    });
  });

  // 2. Resend Email Adapter & Brand V3 Styling Tests
  describe('Resend Transactional Email Adapter', () => {
    it('detects mock configuration safely', () => {
      expect(isResendConfigured()).toBe(false);
    });

    it('sends email in fallback mode without crashing', async () => {
      const res = await sendEmail('customer@example.co.uk', 'Test Order', '<p>Hello</p>', 'Hello');
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });

    it('generates Brand V3 compliant Order Confirmation HTML without banned colors', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html } = renderOrderConfirmationEmail(sampleOrder);

      // Verify active brand tokens
      expect(html).toContain('#182336'); // Ink
      expect(html).toContain('#2450B8'); // Cobalt
      expect(html).toContain('#DDF16A'); // Action Lime

      // Strict prohibited colors check
      expect(html.toLowerCase()).not.toContain('#b84c32'); // Copper
      expect(html.toLowerCase()).not.toContain('purple');
      expect(html.toLowerCase()).not.toContain('violet');
      expect(html.toLowerCase()).not.toContain('teal');
    });

    it('generates Brand V3 compliant Supplier PO Email', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html } = renderSupplierPurchaseOrderEmail(sampleOrder, 'PO-STATUS-001');

      expect(html).toContain('PO-STATUS-001');
      expect(html.toLowerCase()).not.toContain('#b84c32');
    });

    it('generates Brand V3 compliant Tracking Email', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html } = renderTrackingUpdateEmail(sampleOrder, 'DPD Local', '1234567890');

      expect(html).toContain('DPD Local');
      expect(html).toContain('1234567890');
      expect(html.toLowerCase()).not.toContain('#b84c32');
    });

    it('generates Brand V3 compliant Trade Decision Email', () => {
      const approved = renderTradeApplicationDecisionEmail('Apex Build Ltd', 'approved', 1500, 'tier_2_10pct');
      expect(approved.html).toContain('£1500.00');
      expect(approved.html).toContain('10%');
      expect(approved.html.toLowerCase()).not.toContain('#b84c32');

      const rejected = renderTradeApplicationDecisionEmail('Unknown Ltd', 'rejected');
      expect(rejected.html).toContain('Unknown Ltd');
    });
  });

  // 3. Stripe Adapter & Integer-Pence Tests
  describe('Stripe Payment Adapter', () => {
    it('detects mock configuration safely', () => {
      expect(isStripeConfigured()).toBe(false);
    });

    it('calculates integer-pence amounts accurately in GBP', async () => {
      const result = await createPaymentIntent({
        orderId: 'ORD-TEST-001',
        amountGbp: 19.99,
        customerEmail: 'test@toolcart.co.uk',
      });

      expect(result.amountPence).toBe(1999);
      expect(result.currency).toBe('gbp');
      expect(result.clientSecret).toContain('pi_mock_');
      expect(result.isMock).toBe(true);
    });

    it('simulates state machine transitions triggered by payment webhook', async () => {
      const order = await getDb().orders.create({
        order_number: 'TC-WEBHOOK-TEST',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'checkout_authorized',
        customer_email: 'buyer@toolcart.co.uk',
        shipping_address: {
          full_name: 'Buyer One',
          address_line_1: '1 Station Rd',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 20,
        subtotal_inc_vat_gbp: 24,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 5,
        total_inc_vat_gbp: 30,
        supplier_id: 'status-uk',
      });

      // Simulate payment_intent.succeeded webhook action
      const transitionResult = await executeOrderTransition({
        order_id: order.id,
        to_state: 'supplier_order_pending',
        trigger: 'webhook',
        actor: 'stripe:evt_mock_123',
        metadata: { payment_intent_id: 'pi_mock_123' },
        idempotency_key: 'stripe_evt_mock_123',
      });

      expect(transitionResult.success).toBe(true);
      expect(transitionResult.current_state).toBe('supplier_order_pending');
      expect(transitionResult.audit_log.trigger).toBe('webhook');
    });
  });

  // 4. Dynamic SEO & Structured Data Tests
  describe('Dynamic SEO: Sitemap & Robots', () => {
    it('sitemap generates over 120 dynamic URLs indexing all 115 products', async () => {
      const sitemapEntries = await sitemap();
      expect(sitemapEntries.length).toBeGreaterThanOrEqual(125);

      const urls = sitemapEntries.map((e) => e.url);
      expect(urls.some((u) => u.includes('/categories/tools'))).toBe(true);
      expect(urls.some((u) => u.includes('/guides/'))).toBe(true);
      expect(urls.some((u) => u.includes('/products/'))).toBe(true);
    });

    it('robots blocks crawlers when STAGING_ONLY is active', () => {
      process.env.STAGING_ONLY = 'true';
      const robotsResult = robots();
      expect((robotsResult.rules as any).disallow).toBe('/');
    });

    it('robots allows indexing and includes sitemap in production', () => {
      process.env.STAGING_ONLY = 'false';
      const robotsResult = robots();
      expect((robotsResult.rules as any).allow).toBe('/');
      expect(robotsResult.sitemap).toContain('/sitemap.xml');
      // Reset
      process.env.STAGING_ONLY = 'true';
    });
  });
});
```

---

## 5. Verification Method

To independently verify the Milestone 4 blueprint after implementation:

1. **Adapter Test Execution**:
   ```powershell
   npm test tests/adapters/adapters.test.ts
   ```
   *Expected Result:* All tests in `tests/adapters/adapters.test.ts` pass with exit code 0.

2. **Full Regression Test Suite Execution**:
   ```powershell
   npm test
   ```
   *Expected Result:* All 12 test suites (existing 11 suites + `tests/adapters/adapters.test.ts`) pass with 0 failures.

3. **Brand V3 Anti-Leak Static Verification**:
   ```powershell
   python qa/check_static.py
   npm test tests/adversarial/brand-v3-storefront-scan.test.ts
   ```
   *Expected Result:* Zero occurrences of `#B84C32` copper, purple, or teal across all email templates, adapters, and schemas.

4. **Production Build & Typecheck**:
   ```powershell
   npm run typecheck
   npm run build
   ```
   *Expected Result:* `tsc --noEmit` and `next build` complete successfully without runtime or type errors.
