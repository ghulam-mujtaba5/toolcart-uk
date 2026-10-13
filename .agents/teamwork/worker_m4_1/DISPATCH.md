# Worker M4 Dispatch Log

Target: Milestone 4 (Cloud Infrastructure & Service Adapters Implementation)
Parent: 311a2f36-0bc9-4d2c-ad1b-812679b4333e
Blueprint: e:\ToolCart\.agents\teamwork\explorer_m4_1\handoff.md
## 2026-10-13T08:27:33Z

You are Worker M4 (Instance 1).
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m4_1`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.
Milestone 4 Explorer Blueprint: Read `e:\ToolCart\.agents\teamwork\explorer_m4_1\handoff.md`.

Mission:
Implement Milestone 4 (Cloud Infrastructure & Service Adapters) following the exact technical blueprints in `explorer_m4_1/handoff.md`:
1. Supabase PostgreSQL Schema & Migrations (`supabase/migrations/`):
   - Create `supabase/migrations/20261013000001_initial_schema.sql` (11 core tables: `suppliers`, `categories`, `products`, `product_specifications`, `wholesale_offers`, `orders`, `order_items`, `order_audit_logs`, `trade_customers`, `pricing_rules`, `storage_objects`).
   - Create `supabase/migrations/20261013000002_rls_policies.sql` (Row-Level Security enabling strict wholesale isolation: public read for sellable catalog, REVOKE public read on `wholesale_offers` and `pricing_rules`, only `service_role` can access wholesale data).
   - Create `src/lib/db/supabase.ts`: Supabase client integration helper with `isSupabaseConfigured()` and seamless fallback to `getDb()` (memory/seed store) when Supabase environment variables are missing or unconfigured.
   - Export Supabase client helpers in `src/lib/db/index.ts`.
2. Cloudflare R2 Object Storage Adapter (`src/lib/adapters/storage.ts`):
   - Implement S3 client using `@aws-sdk/client-s3` and `@aws-sdk/s3-request-presigner`.
   - Endpoint pattern: `https://${accountId}.r2.cloudflarestorage.com`. Default account ID: `6c9035e2ddbac196ef20ce5bfd9469cd`.
   - Implement `uploadFile(buffer, key, contentType)`, `getPublicUrl(key)`, `deleteFile(key)`.
   - Implement local fallback: When credentials are mock or missing, store files locally in `public/uploads/` (or memory) and return `/uploads/...` URLs without throwing errors.
3. Resend Transactional Email Adapter (`src/lib/adapters/email.ts`):
   - Implement Resend client using `resend` package.
   - Default sender: `ToolCart UK <onboarding@resend.dev>`.
   - Implement 4 Brand V3 responsive HTML email templates with text fallback:
     1. `OrderConfirmationEmail`: order number, items, UK VAT breakdown, delivery address.
     2. `SupplierPurchaseOrderEmail`: PO key, SKU, case quantity, delivery destination.
     3. `TrackingUpdateEmail`: carrier, tracking link, dispatch notice.
     4. `TradeApplicationDecisionEmail`: approval status, trade credit terms.
   - Strict Brand V3 palette in emails: Ink `#182336`, Cobalt `#2450B8`, Action Lime `#DDF16A` (with Ink text, zero white on lime), zero copper `#B84C32`, zero purple/teal.
   - Implement fallback: When `RESEND_API_KEY` is mock/missing, log email payloads and return `{ id: 'mock_email_id', success: true }`.
4. Stripe Test-Mode Integration (`src/lib/adapters/stripe.ts` & `app/api/webhooks/stripe/route.ts`):
   - Implement `src/lib/adapters/stripe.ts`: `createPaymentIntent(orderId, amountGbp, customerEmail)` with integer-pence GBP conversion (`Math.round(amountGbp * 100)`).
   - Implement `app/api/webhooks/stripe/route.ts`: Stripe webhook listener with signature verification (`stripe.webhooks.constructEvent`).
   - Automatically trigger Supplier Order State Machine transitions:
     - `payment_intent.succeeded` -> transitions order from `checkout_authorized` to `supplier_order_pending`.
     - `charge.refunded` -> transitions order to `refunded`.
   - Idempotency support for retried webhooks.
   - Fallback simulation when Stripe key is mock/missing.
5. Dynamic SEO & Structured Data:
   - Create `app/sitemap.ts`: Dynamic XML sitemap indexing all 115 products, 6 categories, 5 guides, 3 project kits, and storefront routes.
   - Create `app/robots.ts`: Checks `STAGING_ONLY` (defaults to true). When true, disallows all indexing (`User-agent: * Disallow: /`). When false, allows crawling and links `/sitemap.xml`.
   - Create `src/components/seo/json-ld.tsx`: Schema.org JSON-LD components for `Product`, `BreadcrumbList`, and `Organization`.
6. Environment Configuration (`.env.example` & `.env.local`):
   - Populate `.env.example` and `.env.local` with public placeholders, Supabase project ref `wuhgrawzxhsocbrribrw`, and Cloudflare account ID `6c9035e2ddbac196ef20ce5bfd9469cd`.
7. Adapter Test Suite (`tests/adapters/adapters.test.ts`):
   - Comprehensive tests for Storage adapter (R2 & local fallback), Email adapter (Resend & mock fallback), Stripe adapter (pence math, mock intent), Sitemap & Robots generators, and JSON-LD components.
8. Run all verification commands:
   - `python qa/check_static.py`
   - `python -m pytest tests/brand/`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
