## 2026-10-13T08:16:55Z
From: 311a2f36-0bc9-4d2c-ad1b-812679b4333e (Parent)
Priority: MESSAGE_PRIORITY_HIGH

You are Explorer M4 (Instance 1).
Your working directory is: `e:\ToolCart\.agents\teamwork\explorer_m4_1`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.
Inspect existing codebase:
- `src/lib/db/` (existing memory store and repositories from M3)
- `src/types/` (domain models)
- `docs/04_COMMERCE_SUPPLIER_SPEC.md`
- `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`

Mission:
Investigate and design the exact technical blueprint for Milestone 4 (Cloud Infrastructure & Service Adapters):
1. Supabase PostgreSQL Schema & Migrations (`supabase/migrations/*.sql`):
   - Design complete PostgreSQL DDL migrations for all 11 core tables:
     `products`, `product_specifications`, `categories`, `suppliers`, `wholesale_offers`, `orders`, `order_items`, `order_audit_logs`, `trade_customers`, `pricing_rules`, `storage_objects`.
   - Implement Row-Level Security (RLS) policies:
     - Public read for sellable products, categories, public specifications.
     - Strict RESTRICTION on `wholesale_offers` and wholesale cost columns: anon/authenticated public users CANNOT SELECT wholesale costs or supplier margin terms. Only `service_role` or authorized admin role can read.
     - Orders readable only by owning customer or admin `service_role`.
   - Provide automated SQL migration runner / verification script or integration helper in `src/lib/db/supabase.ts` that gracefully connects if `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided, while cleanly falling back to `getDb()` memory/seed store if absent.
2. Cloudflare R2 Object Storage Adapter (`src/lib/adapters/storage.ts`):
   - Design S3-compatible client using `@aws-sdk/client-s3` (or `@aws-sdk/s3-request-presigner`).
   - S3 endpoint URL formatting for Cloudflare R2: `https://<CLOUDFLARE_ACCOUNT_ID>.r2.cloudflarestorage.com/<BUCKET_NAME>`.
   - Account ID: `6c9035e2ddbac196ef20ce5bfd9469cd`.
   - Operations: `uploadFile(buffer, key, contentType)`, `getPublicUrl(key)`, `deleteFile(key)`.
   - Implement local fallback: When R2 keys (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`) are mock or missing, store files locally in `public/uploads/` or return deterministic local mock URLs (`/uploads/...`) so builds, tests, and local dev never fail.
3. Resend Transactional Email Adapter (`src/lib/adapters/email.ts`):
   - Design email delivery client using `resend` SDK.
   - Default sender: `ToolCart UK <onboarding@resend.dev>` or `orders@toolcart.co.uk`.
   - Design 4 Brand V3 responsive email templates (HTML + text fallback):
     1. `OrderConfirmationEmail` (Order number, items, UK VAT breakdown, delivery address, carrier timeframe).
     2. `SupplierPurchaseOrderEmail` (PO key, SKU, case quantity, delivery destination).
     3. `TrackingUpdateEmail` (Carrier tracking link, dispatch status).
     4. `TradeApplicationDecisionEmail` (Approval/rejection, trade credit limits).
   - Brand styling: Ink `#182336`, Cobalt `#2450B8`, Action Lime accents (Ink text), zero copper/purple/teal.
   - Sandbox/Mock Fallback: If `RESEND_API_KEY` is missing or mock, log email payload to console or return `{ id: 'mock-email-id', success: true }` without crashing.
4. Stripe Test-Mode Integration (`src/lib/adapters/stripe.ts` & `app/api/webhooks/stripe/route.ts`):
   - PaymentIntent creation with integer-pence amounts (e.g. £19.99 -> 1999) and currency `'gbp'`.
   - Metadata attaching `order_id` and customer email.
   - Webhook listener in `app/api/webhooks/stripe/route.ts` verifying Stripe signature (`stripe.webhooks.constructEvent`) when secret is provided.
   - Automatic integration with Supplier Order State Machine:
     - `payment_intent.succeeded` -> triggers transition from `checkout_authorized` -> `supplier_order_pending`.
     - `charge.refunded` -> triggers `refunded`.
   - Mock/Test Fallback: If `STRIPE_SECRET_KEY` is not set or starts with `mock_`, provide test-mode simulated intents.
5. Dynamic SEO & Structured Data:
   - `app/sitemap.ts`: Generates dynamic XML sitemap indexing all 115 products, 6 categories, 5 guides, 3 project kits.
   - `app/robots.ts`: Respects `STAGING_ONLY`. When `STAGING_ONLY=true` (or default), disallows all crawlers (`User-agent: * Disallow: /`). When production, allows index with sitemap URL.
   - JSON-LD Schema components in `src/components/seo/json-ld.tsx` for `Product`, `BreadcrumbList`, `Organization` complying with schema.org specifications.
6. Environment Configuration (`.env.example` & `.env.local`):
   - Populate with safe defaults, public placeholders, and known identifiers (Cloudflare account ID, Supabase project ref `wuhgrawzxhsocbrribrw`, etc.).
7. Adapter Test Suites:
   - Design `tests/adapters/adapters.test.ts` testing Storage fallback, Email fallback, Stripe mock/simulation, and SEO sitemap/robots generators.

Scope boundaries:
- DO NOT implement or write source code files. You are strictly a read-only exploration agent.
- Output your comprehensive blueprint to `e:\ToolCart\.agents\teamwork\explorer_m4_1\handoff.md`.
- Keep `e:\ToolCart\.agents\teamwork\explorer_m4_1\progress.md` updated.
- When done, send a message to parent (`311a2f36-0bc9-4d2c-ad1b-812679b4333e`) with link to handoff.md.
