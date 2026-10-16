# Original User Request

## 2026-10-12T16:47:38Z

Build a complete, production-grade, Vercel-deployable UK tools, DIY, and hardware e-commerce platform and Medusa-grade Admin Portal for **ToolCart UK** in `e:\ToolCart` using **Next.js App Router (TypeScript + Tailwind CSS)**, **Supabase (PostgreSQL + Auth + RLS)**, **Cloudflare R2 (S3-compatible object storage)**, **Resend (transactional email)**, and **Stripe (test-mode checkout & webhooks)**. The platform must strictly enforce the **ToolCart V3 Final Brand Identity** (Industrial Cobalt `#2450B8`, Action Lime `#DDF16A`, Ink `#182336`, Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF` — zero copper `#B84C32`, purple, or teal), implement the full supplier-first commerce architecture (`schemas/product_contract.schema.json` and `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`), and seed all 115 quoted SKUs from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` with strict server-side separation of wholesale costs from public VAT-inclusive retail prices.

Working directory: e:\ToolCart
Integrity mode: development

Reference material in workspace:
- Brand & Design Tokens: `design/tokens.css`, `design/tokens.json`, `design/tailwind_mapping.md`, `docs/02_BRAND_IDENTITY.md`, `qa/contrast_matrix.json`, `qa/check_static.py`
- Commerce & Supplier Specs: `docs/04_COMMERCE_SUPPLIER_SPEC.md`, `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, `schemas/product_contract.schema.json`, `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`
- UX, SEO & Governance: `docs/03_UX_INFORMATION_ARCHITECTURE.md`, `docs/05_SEO_AI_DISCOVERY.md`, `docs/06_ENGINEERING_EXECUTION.md`, `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`, `docs/08_CONTENT_AND_COPY_DECK.md`, `prototype/index.html`

## Requirements

### R1. Brand V3 Design System & Customer Storefront (Vercel-Native Next.js App Router)
Build a complete, responsive, accessible storefront in Next.js App Router + TypeScript + Tailwind CSS + open-source UI primitives (Radix UI / shadcn-style components, Lucide icons) wired directly to `design/tokens.css` and `design/tokens.json`:
- **Strict Brand V3 Compliance**: Use Ink (`#182336`), Cobalt (`#2450B8`), Cobalt Deep (`#193F99`), Action Lime (`#DDF16A` with dark Ink `#182336` text and 2px dark outline on white — never white text on lime), Workshop White (`#F7F8F5`), Cloud Blue (`#EAF0FF`), Graphite (`#252D30`), and Steel Text (`#596B70`). Completely prohibit retired Copper (`#B84C32`), purple/violet/lavender, and teal across all CSS, components, and SVG assets. Typography must use **Manrope** (headings 600–800) and **IBM Plex Sans** (body/UI 400–700, tabular numerals for prices/specs/SKUs).
- **Complete Storefront Pages & Flows**:
  - **Homepage (`/`)**: Hero banner, Trade vs. DIY Mode (Inc. VAT / Ex. VAT global toggle persisted in state/cookie), featured categories, project kit builders, trust & fulfilment transparency banner, and interactive AI Project/Tool Finder trigger.
  - **Category & Search Discovery (`/categories/[slug]`, `/search`, `/tools`, `/fixings`, `/electrical`, `/decorating`, `/ppe`, `/site-equipment`)**: Instant lexical search + multi-attribute faceted filtering (brand, category, pack size, voltage/dimensions, availability status, price range), sorting, and URL query synchronization.
  - **Product Detail Pages (`/products/[slug]`)**: Full technical specification table, GTIN/Barcode, MPN, merchant SKU, pack/case quantity breakdown, VAT-inclusive & ex-VAT pricing display, honest stock & supplier freshness indicator, compliance/licensing badges, related products, and "Compare Product" drawer (side-by-side spec comparison of up to 4 tools/items).
  - **Project Baskets & Buying Guides (`/projects`, `/guides`, `/guides/[slug]`)**: At least 3 curated multi-item project baskets (e.g., Domestic Electrical Tape & Consumables Kit, Painting & Masking Prep Kit, Essential Site Torch & Extension Lead Kit) and 5 original UK hardware buying guides with one-click basket population.
  - **AI Product & Project Assistant**: Interactive drawer/modal styled in Cloud Blue (`#EAF0FF`) and Cobalt (`#2450B8`) that recommends catalog items and project kits based strictly on verified catalog specs, refusing to hallucinate electrical/structural/PPE safety certifications or unverified stock.
  - **Cart, Checkout & Customer Account (`/basket`, `/checkout`, `/account`, `/trade`)**: Slide-over mini-basket and full `/basket` page with multi-supplier delivery grouping, UK VAT calculation (20% standard rate), trade account application flow (`/trade`), customer order history & live state-machine tracking (`/account/orders/[id]`), and Stripe test-mode checkout gated by `STAGING_ONLY` / sellability checks so unverified `draft` quote items cannot trigger live charges without explicit admin approval.

### R2. Medusa-Grade Full-Featured Commerce Engine & Admin Portal (`/admin` + Server APIs)
Since deployment targets **Vercel exclusively**, implement the complete Medusa-equivalent commerce domain and Admin Portal natively inside the Next.js application (backed by Supabase PostgreSQL / Drizzle or Prisma ORM + local SQLite/JSON fallback so it works seamlessly both with live Supabase and zero-config local builds):
- **Comprehensive Admin Portal (`/admin`)**:
  - **Dashboard (`/admin`)**: KPI cards (Total SKUs, Approved vs. Draft SKUs, Active Orders, Pending Supplier Confirmations, Margin Overview, Stale Feed Alerts), recent order state transitions, and launch-gate checklist status (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`).
  - **Product & Catalog Manager (`/admin/products`, `/admin/products/[id]`)**: Full CRUD for products, variants, technical specs, categories, media licensing verification (`image_license_verified`), UKCA/CE compliance flags (`compliance_verified`), and sellability workflow transitions (`draft` → `needs_review` → `approved` → `blocked`).
  - **Supplier Catalog Importer & Feed Sync (`/admin/suppliers`, `/admin/import`)**: Interactive CSV/JSON importer & validator implementing `schemas/product_contract.schema.json`. Must ingest all 115 rows from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` (Status International UK Ltd), preserve `supplier_sku`, `barcode` (GTIN), `carton_barcode`, `unit_cost_ex_vat_gbp`, `units_per_case`, `case_cost_ex_vat_gbp`, and enforce case-vs-unit math validation (flagging or preventing unit/case pricing errors).
  - **Pricing & Margin Control Engine (`/admin/pricing`)**: Server-side-only wholesale cost storage (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) with configurable category/supplier markup rules to compute public `retail_price_inc_vat_gbp` and `retail_price_ex_vat_gbp`. **Strict Security Rule**: Wholesale cost fields must NEVER be serialized to public storefront pages, client components, or public `/api/store/*` responses.
  - **Supplier Order State Machine & Fulfilment (`/admin/orders`, `/admin/orders/[id]`)**: Full implementation of `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` supporting all states (`cart_pending`, `checkout_authorized`, `supplier_order_pending`, `supplier_accepted`, `payment_captured`, `dispatched`, `delivered`, plus exceptional states: `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`) with idempotency keys (`order_id + supplier_id`), append-only audit log (`order_audit_logs`), PO generation, tracking numbers, and refund/cancellation workflows.
  - **Customers, Trade Accounts & Promotions (`/admin/customers`, `/admin/discounts`, `/admin/settings`)**: Manage retail customers, B2B Trade Account approvals/tiers, discount codes, UK shipping zones/rates, and `STAGING_ONLY` / Launch Gate toggles.

### R3. Cloud Infrastructure & Service Adapters (Supabase, Cloudflare R2, Resend, Stripe, SEO)
- **Supabase Integration**: Full PostgreSQL schema & migrations (`supabase/migrations/*.sql`), server/client Supabase clients, Row-Level Security (RLS) policies protecting wholesale supplier tables, and automatic fallback seed store so the app runs out-of-the-box in CI/local environments even before cloud env vars are populated.
- **Cloudflare R2 Storage Adapter**: S3-compatible upload/signed-URL service (`@aws-sdk/client-s3`) for product images, compliance certificates, and supplier CSV feeds in `/admin/media` and `/admin/import`, with local filesystem/public fallback when R2 credentials are not set.
- **Resend Email Service**: Transactional HTML email templates (Brand V3 styled) and sender service for Order Confirmation, Supplier PO Dispatch, Shipment Tracking Notification, and Trade Account Approval, with automatic sandbox/log capture mode when `RESEND_API_KEY` is in test/dry-run mode.
- **SEO & AI Discovery (`docs/05_SEO_AI_DISCOVERY.md`)**: Dynamic `sitemap.ts`, `robots.ts` (respecting `STAGING_ONLY` noindex gate), Schema.org `Product`, `BreadcrumbList`, `FAQPage`, and `Organization` JSON-LD structured data, and OpenGraph metadata.

## Verification Resources

- `qa/check_static.py` and `qa/contrast_matrix.json` (existing Brand V3 static & WCAG verification suite in repo)
- `schemas/product_contract.schema.json` (authoritative JSON schema for supplier product import records)
- `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` (115 real supplier quote rows from Status International UK Ltd)
- `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` (authoritative state machine transitions)

## Acceptance Criteria

### Brand V3 & Accessibility Compliance
- [ ] Zero occurrences of retired hex `#B84C32`, `--tc-copper`, or unauthorized purple/violet/teal brand colors across all `.css`, `.ts`, `.tsx`, and `.html` files.
- [ ] `design/tokens.css` variables are imported and active in the Next.js app; all colour pairings in `qa/contrast_matrix.json` pass WCAG AA contrast verification, and `qa/check_static.py` continues to pass.
- [ ] Action Lime (`#DDF16A`) is never paired with white foreground text; all lime badges/buttons use Ink (`#182336`) text.

### Supplier Catalog, Security & Commerce Engine
- [ ] All 115 products from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` are parsed, validated against `schemas/product_contract.schema.json`, and seeded into the database/catalog with accurate `supplier_sku`, `gtin` (`barcode`), `units_per_case`, and `sellability_status`.
- [ ] Automated security test verifies that public storefront API endpoints (`/api/store/*`) and rendered storefront HTML/flight payloads never contain `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp`.
- [ ] Automated unit/integration tests verify the Supplier Order State Machine (`architecture/SUPPLIER_ORDER_STATE_MACHINE.md`), including happy path (`cart_pending` → `delivered`), `supplier_rejected` auto-cancellation/refund trigger, idempotency key enforcement, and append-only audit logging.

### Storefront, Admin Portal & Build Quality
- [ ] Storefront routes (`/`, `/search`, `/categories/[slug]`, `/products/[slug]`, `/projects`, `/guides`, `/basket`, `/checkout`, `/account`, `/trade`) and Admin Portal routes (`/admin`, `/admin/products`, `/admin/orders`, `/admin/suppliers`, `/admin/import`, `/admin/pricing`, `/admin/customers`, `/admin/settings`) render with zero runtime errors.
- [ ] Next.js production build (`npm run build`), TypeScript typecheck (`npm run typecheck`), linter (`npm run lint`), and automated test suite (`npm test`) all exit with code 0.
- [ ] Responsive layout and interactive flows (category filter, lexical search, VAT toggle, product comparison, basket calculation, AI Product Finder drawer, and Admin Portal product/order state transitions) are verified at both 360px mobile and 1440px desktop viewports.

## 2026-10-12T16:55:32Z

Cloud Services Browser Inspection Update for `e:\ToolCart`:
The browser inspector retrieved the live cloud account configurations for `toolcartuk@gmail.com`:

1. **Supabase (`eu-west-1` - Ireland/UK region)**:
   - Project Ref: `wuhgrawzxhsocbrribrw`
   - `NEXT_PUBLIC_SUPABASE_URL`: `https://wuhgrawzxhsocbrribrw.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1aGdyYXd6eGhzb2NicnJpYnJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE4MDEzMDEsImV4cCI6MjEwNzM3NzMwMX0.wJv_coD6-zvAmIu8qN2ugg5sl_STiv7Y34NrvnHRMLU`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_Q88v28v4dgsMd-8aRucwmg_nTsrQdpQ`

2. **Cloudflare R2**:
   - Account ID (`CLOUDFLARE_ACCOUNT_ID`): `6c9035e2ddbac196ef20ce5bfd9469cd`
   - Endpoint pattern: `https://6c9035e2ddbac196ef20ce5bfd9469cd.r2.cloudflarestorage.com`
   - R2 plan activation is pending on the account, so ensure the R2 storage adapter supports `CLOUDFLARE_ACCOUNT_ID=6c9035e2ddbac196ef20ce5bfd9469cd` and gracefully falls back to local/Supabase storage when R2 bucket credentials are not yet active.

3. **Resend (`toolcartuk` / `toolcartuk@gmail.com`)**:
   - Account: `toolcartuk@gmail.com`
   - Default sender before custom domain verification: `onboarding@resend.dev` (delivering to `toolcartuk@gmail.com`).

Please ensure `.env.example` and `.env.local` (gitignored) are configured with these non-secret public identifiers (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `RESEND_FROM_EMAIL=onboarding@resend.dev`, `ADMIN_NOTIFICATION_EMAIL=toolcartuk@gmail.com`, `STAGING_ONLY=true`), and that the data layer works seamlessly out-of-the-box with automatic local seeded storage fallback whenever `SUPABASE_SERVICE_ROLE_KEY` or `RESEND_API_KEY` are not yet set.



## 2026-10-13T16:36:41Z

Revamp ToolCart UK into a visually elite, modern trade & hardware e-commerce platform incorporating 2026 industrial design trends: CAD blueprint dot grids, machined tactile chamfers, adaptive duotone icons, lightweight Lottie trade animations, and responsive micro-interactions.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Brand V3 Vector Visual System & Blueprint CAD Foundations
- Implement pure-CSS engineering patterns (`.tc-bg-dots`, `.tc-bg-blueprint`, `.tc-card-machined`) in `app/globals.css` with zero runtime overhead.
- Design and integrate original, bespoke SVG vector scenes for:
  - Empty Basket / Empty Search (`Empty Tool Chest` with dashed tool silhouettes)
  - 404 Error page (measuring tape snapped / lost in workshop)
  - Trade Pro verification header (`Industrial Shield & Caliper` motif)
  - Category headers with subtle CAD wireframe accents for Hand Tools, Fixings, Decorating, Measuring, PPE, and Site Equipment.
- Strictly adhere to Brand V3 tokens (`design/tokens.css`): Industrial Cobalt (`#2450B8`), Action Lime (`#DDF16A` with dark Ink `#182336` text), Ink (`#182336`), Workshop White (`#F7F8F5`), Cloud Blue (`#EAF0FF`), and Steel Text (`#596B70`). Completely prohibit legacy copper, purple, or teal.

### R2. Adaptive Optical-Sized Duotone Icon System & Micro-Interactions
- Build an adaptive duotone SVG icon set (`src/components/ui/trade-icons.tsx`) supporting 4 optical sizes (16px, 20px, 24px, 32px) with Brand V3 duotone fills:
  - `IconToolbox`, `IconCaliper`, `IconTradeVerified`, `IconTapeMeasure`, `IconBolt`, `IconSpiritLevel`, `IconStockRadar`, `IconTruckFreight`.
- Implement mechanical micro-interactions:
  - "Snap-to-Cart" tactile button state with spring dampening curve (`cubic-bezier(0.34, 1.56, 0.64, 1)`) and celebratory checkmark burst.
  - SKU / GTIN / MPN 1-click copy badge with instant `#DDF16A` high-vis "COPIED" feedback.
  - Tactile physical rocker VAT switch with clear visual border and high-contrast pills.
  - Live 24h stock freshness radar pulse ring (`"Stock verified < 24h"`).

### R3. High-Impact Lightweight Lottie & Motion Graphics
- Add lightweight, accessible animation components (`src/components/motion/`):
  - **Cart Feedback**: Celebratory toolbox lock / tool chest snap when an item is added to the basket.
  - **Order State Machine Stepper**: Animated fulfillment checkpoints on `/account/orders/[id]` and `/admin/orders/[id]` (package sealed -> logistics truck dispatch -> delivered checkmark).
  - **AI Assistant**: Floating scanner pulse and blueprint radar waves when ToolCart AI is analyzing specifications.
  - **Trade Pro Application**: Success ribbon and industrial approval stamp animation upon trade account application.
  - **Empty States**: Animated idle tool chest and measuring tape recoil.
- All animations must use `@dotlottie/react-player` or inline animated SVGs, remaining under 150KB total and honoring `prefers-reduced-motion`.

### R4. Storefront & Admin Portal Visual Polishing
- Elevate product cards, PDPs, and category pages with machined chamfers, hover-depth elevations, and floating spec chips.
- Upgrade the Admin Portal (`/admin`) dashboard with industrial metric gauges, live order state badges, and supplier feed health cards.
- Ensure 100% WCAG AA contrast compliance across all interactive elements, dark/light contrast pairs, and mobile viewports (360px & 1440px).

## Verification Resources

- Existing automated test suites: `npm test` (all 426 tests must remain green)
- Brand V3 static validator: `qa/check_static.py`
- Color contrast matrix: `qa/contrast_matrix.json`
- Next.js build and TypeScript typecheck: `npm run build && npx tsc --noEmit`

## Acceptance Criteria

### Visual & Brand Integrity
- [ ] Zero occurrences of retired copper `#B84C32`, purple, or teal in any new or modified file.
- [ ] Action Lime `#DDF16A` is strictly paired with dark Ink `#182336` text.
- [ ] All custom SVG vectors and duotone icons render cleanly at 360px mobile and 1440px desktop without clipping or layout shifts (CLS < 0.05).

### Motion & Performance Quality
- [ ] All animated components gracefully disable motion when `prefers-reduced-motion: reduce` is detected.
- [ ] Total motion assets bundle footprint is strictly under 150KB gzip, with lazy-loading applied to non-critical animations.
- [ ] Interactive buttons (Snap-to-Cart, Copy SKU, VAT rocker) respond in under 50ms with zero UI lag.

### Codebase & Deployment
- [ ] All 426+ existing unit, integration, and security tests pass (`npm test`).
- [ ] TypeScript typecheck (`npx tsc --noEmit`) and Next.js production build (`npm run build`) exit with code 0.
- [ ] Changes committed to GitHub (`master`) and deployed to live Vercel production (`https://toolcart-uk.vercel.app`).


## 2026-10-13T19:28:15Z

Execute live Supabase PostgreSQL migrations and seed all 115 quoted products, configure Cloudflare R2 object storage to host the 115 extracted product photos, and activate live Resend transactional emails with Brand V3 templates for order confirmations and trade account approvals.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Live Supabase PostgreSQL Schema Migration & Catalog Seeding
- Apply the full database migration (`supabase/migrations/20261012_001_initial_schema.sql` or equivalent) to Supabase project `wuhgrawzxhsocbrribrw` using Supabase CLI / direct Postgres connection.
- Create authoritative tables: `products`, `variants`, `suppliers`, `orders`, `order_audit_logs`, `trade_accounts`, and `pricing_rules`.
- Seed all 115 quoted products from `src/lib/catalog/products.ts` directly into the Supabase database with their full technical specifications, EAN-13 barcodes, stock quantities, and Brand V3 categories.
- Enforce Row-Level Security (RLS) policies so public clients cannot query supplier wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).
- Ensure graceful zero-crash fallback to in-memory repositories if the cloud connection is ever offline or in CI test mode.

### R2. Cloudflare R2 Object Storage & Catalog Asset Hosting
- Connect the Cloudflare R2 S3-compatible client (`@aws-sdk/client-s3`) using Account `6c9035e2ddbac196ef20ce5bfd9469cd`.
- Ensure bucket `toolcart-assets` / `toolcart-media` is initialized, and upload all 115 extracted product photos from `public/images/products/*.png`.
- Wire the media adapter so product cards and PDPs can serve image URLs from R2 with instant fallback to local assets.

### R3. Live Resend Transactional Email Engine
- Connect the Resend client with API Key `re_He8Pb7UD_...`.
- Wire live email triggers:
  - Order Confirmation email sent to customer upon order placement with Brand V3 styling and UK 20% VAT integer-pence summary.
  - Supplier Purchase Order notification email sent to supplier contact upon state transition to `supplier_order_pending`.
  - Trade Pro welcome/approval email sent upon application submission or approval.
- Add an interactive test email dispatch trigger in `/admin/settings` to allow testing email delivery with 1 click.

### R4. Verification, Test Suite & Live Production Deployment
- Verify all existing and new tests pass with zero regressions (`npm test`).
- Run `python qa/check_static.py` to ensure 100% Brand V3 compliance (zero copper `#B84C32`, purple, or teal; Action Lime strictly with dark Ink text).
- Commit all changes to GitHub (`ghulam-mujtaba5/toolcart-uk`) on `master` and deploy to live Vercel production (`https://toolcart-uk.vercel.app`).

## Verification Resources

- Supabase project credentials in `.env.local` (`wuhgrawzxhsocbrribrw`)
- Cloudflare R2 credentials in `.env.local`
- Resend API key in `.env.local`
- Automated test suites: `npm test` (all 571 tests must remain green)
- Brand V3 static validator: `qa/check_static.py`
- Production Next.js build: `npm run build && npx tsc --noEmit`

## Acceptance Criteria

### Database & Storage
- [ ] Supabase PostgreSQL database tables exist in project `wuhgrawzxhsocbrribrw` and contain all 115 quoted products.
- [ ] Server-side RLS policies are active; public `/api/store/products` API never exposes wholesale cost data.
- [ ] Cloudflare R2 client successfully uploads and verifies product image assets.

### Transactional Email
- [ ] Resend transactional email service successfully dispatches test emails without errors.
- [ ] Brand V3 email templates render cleanly with integer-pence calculations.

### Quality & Deployment
- [ ] All 571+ existing unit, integration, and security tests continue to pass (`npm test`).
- [ ] TypeScript typecheck (`npx tsc --noEmit`) and Next.js production build (`npm run build`) exit with code 0.
- [ ] Successfully deployed to live Vercel production (`https://toolcart-uk.vercel.app`).


## 2026-10-14T09:49:51Z

Comprehensive audit and remediation of all bugs, incomplete features, UI/UX defects, wholesale data leaks, and Brand V3 / WCAG AA compliance issues across the ToolCart UK e-commerce storefront and admin portal.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Comprehensive Storefront & Admin Portal Defect Audit
Audit all pages and user flows across the ToolCart application (Homepage, Product Detail Pages, Catalog Search & Facets, Compare Drawer, MiniBasket, Checkout Mock Flow, Trade Pro Portal, and Admin Portal). Identify and log all functional bugs, broken state transitions, missing empty/error states, and unhandled boundary inputs.

### R2. Systematic Code Remediation & Defect Resolution
Implement clean, robust fixes for all discovered defects. Ensure complete lifecycle handling for interactive components (Snap-to-Cart buttons, 1-click SKU copy badges, tactile VAT switches, radar pulse indicators, and responsive navigation drawers).

### R3. Brand V3 Invariants & WCAG AA Accessibility Enforcement
Strictly uphold ToolCart Brand V3 tokens defined in `design/tokens.css` (Industrial Cobalt `#2450B8`, Action Lime `#DDF16A`, Ink `#182336`, Steel Text `#596B70`, Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF`). Prohibit white text on Action Lime, copper, purple, or unauthorized gradients. Ensure full WCAG AA contrast compliance and responsiveness across 360px mobile and 1440px desktop viewports.

### R4. Wholesale Data Isolation & Commercial Safety
Ensure wholesale supplier costs, margin formulas, and supplier trade terms remain strictly server-side and are never exposed in client bundles or public Next.js payload. Maintain `STAGING_ONLY=true` and Stripe test mode invariants.

### R5. Automated Verification & Zero-Regression Gate
Verify all fixes by running the entire test suite and build pipelines. Ensure no existing tests break and write regression tests for newly resolved issues where applicable.

## Acceptance Criteria

### Automated Verification Gates
- [ ] All unit and integration test suites pass cleanly (`npm test`) with zero failures
- [ ] Brand V3 static checks pass (`python qa/check_static.py`) with zero violations
- [ ] TypeScript typecheck passes (`npm run typecheck`) with zero errors
- [ ] Next.js production build completes successfully (`npm run build`) with zero errors

### Functional & Quality Standards
- [ ] All storefront interactive elements (cart toggles, copy badges, search filters, modal drawers) function without console errors or runtime crashes
- [ ] Responsive layouts render cleanly at 360px and 1440px without horizontal overflow or clipped text
- [ ] Wholesale supplier pricing is 100% isolated to server-side routes and absent from client DOM/bundles
- [ ] Comprehensive verification report summarizing all audited areas, resolved defects, and test evidence is generated


## 2026-10-14T15:11:21Z

Live Browser Auditor report received from https://toolcart-uk.vercel.app with CRITICAL blockers and high-priority fixes:

1. [CRITICAL 500 ERROR]: All Catalog, Search, and Category routes (/search, /tools, /fixings, /decorating, /measuring, /ppe, /site-equipment) crash with Next.js Server Component render exception (Digest: 1307636131). Must be resolved immediately.
2. [ROUTING & 404s]:
   - Add redirects/rewrites in next.config.mjs: /catalog -> /search, /categories -> /, and singular /product/:slug -> /products/:slug.
   - Guides route (/guides/[slug]) redirects to / instead of rendering content.
3. [ACCESSIBILITY & WCAG AA]:
   - Inactive VAT switch toggle button contrast is 3.3:1 (#77868b on #edf0f5). Darken to #596B70 or #252D30 to achieve >= 4.5:1.
   - Mobile navigation drawer close button missing aria-label="Close menu".
   - Align button aria-label with visible text (WCAG 2.5.3 Label in Name), e.g. "Add to Basket: [Product Title]".
   - SKU copy badge touch target height is 20px (increase touch padding).
4. [BRAND V3 FOOTER]:
   - Footer logo div <div class="bg-tc-action-lime"> inherits color: rgb(255, 255, 255) from parent footer; ensure explicit text-tc-ink or dark styling on container.

Please incorporate these findings directly into PROJECT.md and the worker remediation pipeline.


## 2026-10-15T12:07:45Z

Build a resilient, production-grade retail merchant Admin Portal for ToolCart UK inspired by Medusa v2 and Shopify Polaris architecture patterns, optimized for retail e-commerce management (catalog, pricing, retail orders, customer support, and inventory tracking) with robust error boundaries and zero portal breakages.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Retail Merchant Admin Navigation & Core Dashboard
- Centralized administrative dashboard optimized for retail operations (sales velocity, gross revenue, active retail orders, stock alerts, average order value).
- Polished, responsive layout adhering strictly to ToolCart Brand V3 (`design/tokens.css`): Industrial Cobalt `#2450B8`, Action Lime `#DDF16A` accents, Ink `#182336`, Workshop White `#F7F8F5`, Steel Text `#596B70`.
- Quick-filter views for retail orders needing fulfillment, low-stock alerts, and recent customer activity.

### R2. High-Reliability Data Tables & Bulk Actions (Shopify / Medusa Pattern)
- Accessible TanStack Table / headless primitives with multi-column sorting, debounce search, status filtering, pagination, and row selection.
- Bulk actions for products (publish/draft status, retail price adjustments, category assignments, stock adjustments).
- Order management workflow with status transitions (pending, paid, fulfilling, dispatched, delivered, refunded) and complete timeline audit trails.

### R3. Retail Product & Inventory Editor
- Full product & variant editing interface with retail VAT calculation display (Inc. VAT / Ex. VAT preview), barcode/SKU management, and media gallery management.
- Real-time input sanitization with Zod schema validation to eliminate NaN values, invalid prices, or broken state submissions.
- Optimistic UI updates with rollback and accessible toast feedback on mutation failures.

### R4. Zero-Crash Error Boundaries & Fault Tolerance
- Granular React Error Boundaries wrapping table views, forms, and detail panels so an isolated failure never crashes the administrative portal.
- Graceful recovery states and clear actionable error fallbacks with reload/retry mechanisms.
- Wholesale supplier cost confidentiality preserved strictly server-side with zero exposure in client bundles.

## Acceptance Criteria

### Functionality & Usability
- [ ] Admin dashboard, products list, product editor, orders list, order detail, and settings pages render without runtime errors.
- [ ] Product status, retail pricing, and inventory mutations succeed with validation and immediate UI feedback.
- [ ] Order fulfillment and status transition workflows execute reliably with audit log updates.
- [ ] Error boundaries catch injected component errors and present recovery actions without unmounting the layout.

### Code Quality & Brand Integrity
- [ ] All automated tests pass (`npm test`) without regressions.
- [ ] Brand V3 static compliance check (`python qa/check_static.py`) passes with 0 violations.
- [ ] TypeScript compilation (`npm run typecheck`) and Next.js build (`npm run build`) pass cleanly.
- [ ] Wholesale cost isolation tests (`tests/security/wholesale-isolation.test.ts`) pass with zero client leakage.

## 2026-10-15T12:57:49Z

This is a single self-contained fix; keep it small and focused. Continue and finalize the mobile-first responsive adaptation and modern web guidelines compliance for ToolCart UK.
Rounds 0, 1, and 2 are already implemented and hardened: all core storefront layouts (Header, Navigation Drawer, Filter Drawer, PDP Sticky Buy Bar, MiniBasket, and Compare Drawer) have been refactored for 360px-1440px viewports with >= 44x44px touch targets, iOS zoom prevention (text-base sm:text-xs), and Brand V3 token integrity. 662 tests are currently passing with 0 typecheck errors and 0 static violations.
Execute the final verification, independent victory audit, and summary report.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Final Mobile-First Responsive Verification
Verify all storefront templates across 360px, 390px, 768px, and 1440px viewports with zero horizontal overflow, clipped content, or broken layouts.

### R2. Touch Ergonomics & Accessibility Sign-Off
Confirm all interactive controls (buttons, inputs, quantity steppers, drawer close triggers) meet or exceed the 44x44px minimum touch target requirement, with safe-area padding for mobile home indicators.

### R3. Quality Gates & Final Reporting
Execute full test suites (`npm test`), static checks (`python qa/check_static.py`), and TypeScript validation (`npm run typecheck`), delivering the final victory report and project documentation updates.


## 2026-10-15T19:38:27Z

Use a multi-agent finishing team to execute complete, high-value final polish and launch-readiness hardening across the ToolCart store (storefront and merchant admin portal), strictly adhering to Brand V3 tokens, WCAG AA contrast, responsive mobile/desktop layouts, and staging safety guardrails.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Storefront & Customer Journey Final Polish
Polish and verify the end-to-end storefront user experience:
- Strictly apply Brand V3 design tokens (design/tokens.css, design/tokens.json) across Home, Catalog, PDP, Cart/Drawer, and Checkout placeholder.
- Enforce authoritative colors: Ink (#182336), Cobalt (#2450B8), Action Lime (#DDF16A), Workshop White (#F7F8F5), Cloud Blue (#EAF0FF), Graphite (#252D30), and accessible Steel Text (#596B70) on pale surfaces.
- Zero usage of prohibited palette elements: No copper (#B84C32), purple/violet/lavender, teal branding, or white text on Action Lime.
- Guarantee clean responsive layouts without horizontal scrollbars or element collisions at 360px (mobile) and 1440px (desktop).

### R2. Merchant Admin Portal & Bulk Data Actions Polish
Complete and polish the retail merchant admin portal:
- Verify data table sorting, filtering, row selection, pagination, and the floating BulkActionBar.
- Ensure batch status updates, inventory changes, and pricing adjustments execute correctly and gracefully handle adversarial or null payloads.
- Preserve authenticated admin API boundaries and ensure unauthorized access fails closed.

### R3. Commerce Governance, Safety & Wholesale Price Isolation
Enforce all prototype governance and launch blocker remediation rules:
- Keep STAGING_ONLY=true active by default with prominent staging disclaimers.
- Keep live checkout disabled and fail-closed for unapproved supplier draft records.
- Protect wholesale costs and trade terms strictly server-side — ensure zero supplier cost or wholesale margin data is leaked into client-side Next.js JavaScript bundles or public API responses.
- Maintain provisional brand notices (domain and trademark remain unverified).

### R4. Automated Quality, Adversarial QA & Zero Regressions
- Execute complete test suites (npm test -- --run), linting, and typechecking (npx tsc --noEmit).
- Ensure all 798+ tests pass with zero regressions across unit, UI, micro-interaction, adapter, security, and adversarial suites.

## Acceptance Criteria

### Design System & Visual Integrity
- [ ] No prohibited color hex codes (#B84C32, purple, violet, teal) in code or stylesheets.
- [ ] Accessible Steel Text (#596B70) used on pale surfaces instead of legacy steel grey.
- [ ] All interactive elements pass WCAG AA contrast ratios (>= 4.5:1 for body text, >= 3:1 for large text/icons).

### Responsive Viewports
- [ ] Header, mobile navigation drawer, product grid, PDP spec tables, and admin data table display cleanly at 360px viewport width without horizontal clipping or scrollbar leakage.
- [ ] Desktop layout at 1440px renders full sidebar docking, clear typography hierarchy, and appropriate whitespace.

### Security & Commerce Guardrails
- [ ] Public customer bundles and client responses contain no supplier cost / trade pricing fields.
- [ ] Live payment capture remains disabled in staging.
- [ ] Admin API routes require authorization headers and fail closed.

### Verification Suite
- [ ] npm test -- --run exits with code 0 and 100% passing tests.
- [ ] npx tsc --noEmit and npm run lint report 0 errors and 0 warnings.
- [ ] Verification log generated confirming all checks completed.


## 2026-10-15T20:18:52Z

Deliver an end-to-end mobile-adaptive transformation for the ToolCart storefront across iOS Safari and Android Chrome, resolving visual clutter, correcting layout and sizing defects on the home screen, and establishing an app-grade touch experience.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Mobile Screen De-cluttering & Visual Hierarchy
Transform the home screen and primary storefront landing views for mobile screens (360px–430px):
- Rationalize vertical screen estate: replace cumbersome single-column card stacks with compact 2-column mobile grids or fluid swipeable carousels.
- Streamline the top announcement bar, utility microbar, and hero section so key shopping actions and product discovery appear immediately without excessive scrolling.
- Balance typographical scale, card padding, and asset aspect ratios so text never truncates awkwardly or collides on small displays.
- Strictly adhere to Brand V3 tokens (Ink #182336, Cobalt #2450B8, Action Lime #DDF16A, Workshop White #F7F8F5, Cloud Blue #EAF0FF; no copper, purple, or unapproved palettes).

### R2. Mobile Navigation & Native Touch Ergonomics (iOS & Android)
Provide an app-like navigation and touch interaction architecture:
- Implement an ergonomic bottom navigation bar (Home, Catalog/Search, Advice, Compare/Kits, Basket) with active state indicators and badge counters.
- Support device safe-area insets (`env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`) to prevent content clipping under iOS dynamic islands/home indicators and Android navigation bars.
- Ensure all interactive elements (buttons, filter chips, drawer toggles, quantity selectors) provide comfortable touch targets satisfying WCAG 2.1 AA (minimum 44×44px hit areas).

### R3. Responsive Drawers, Modals & Fluid Viewport Integrity
Harden all mobile overlays and interactive drawers (Mini-Basket, Compare Drawer, Hardware Advice Assistant, Filter Sidebar, Mobile Navigation):
- Eliminate horizontal overflow (`scrollWidth === clientWidth`) across 360px, 390px, 412px, and 768px viewports.
- Prevent background body scrolling and rubber-band layout shifts when drawers or modal sheets are active.
- Ensure swipe gestures and tap-outside dismissals work reliably on both touch and pointer devices.

## Acceptance Criteria

### Viewport & Layout Integrity
- [ ] Automated viewport checks confirm zero horizontal scrollbar overflow (`document.documentElement.scrollWidth <= window.innerWidth`) at 360px, 390px, 412px, and 768px.
- [ ] Safe-area padding is applied to fixed/sticky elements ensuring no UI overlaps with native device indicators.

### Visual Polish & Hierarchy
- [ ] Above-the-fold content on mobile loads cleanly with immediate product discovery cues.
- [ ] Category navigation and featured hardware cards render in compact, balanced mobile configurations without vertical bloating.
- [ ] All storefront components comply with Brand V3 color tokens and pass WCAG AA contrast standards.

### Touch & Accessibility Standards
- [ ] All interactive touch targets measure at least 44×44px.
- [ ] All automated test suites (`npm run test:ui`, `npm run test:storefront`, brand compliance, responsive tests) pass cleanly with zero regressions.


## 2026-10-16T12:41:40Z

Build and deliver a high-polish, production-grade merchant Admin Portal experience for ToolCart UK matching top-tier e-commerce platforms (Shopify Polaris, Medusa v2, Saleor), with heavy emphasis on elite frontend UI/UX, workflow ergonomics, keyboard-driven velocity, data safety, and zero-breakage error recovery.

Working directory: e:\ToolCart
Integrity mode: development

## Requirements

### R1. Shopify Polaris-Style Contextual Save Bar & Form Safety (UI/UX Level)
- Detect unsaved form dirty states across product details, pricing simulator, and governance settings.
- Implement a floating/docked accessible contextual save bar with smooth mount transitions, "Discard", and "Save changes" (`Ctrl+S`/`Cmd+S` keyboard shortcut) that warns and prevents accidental route navigation data loss.
- Granular Zod schema validation with inline field error guidance, auto-focus on first error, and optimistic UI updates with accessible toast notifications.

### R2. Global Command Palette & Quick Search (Ctrl+K / Cmd+K)
- Universal command palette dialog accessible from anywhere via `Ctrl+K` / `Cmd+K` or clicking the search bar in the top navigation header.
- Instant search across catalog SKUs, product titles, order numbers, customer names, and admin views with keyboard navigation (Up/Down arrow keys, Enter to navigate, Esc to close).
- Quick action shortcuts (e.g. "Create Product", "Export Orders", "View Low Stock", "View Storefront", "Sign Out").

### R3. Advanced Table Ergonomics & Batch CSV Operations (Shopify / Medusa Pattern)
- Direct client-side and server-side CSV export for filtered or selected products and orders with customizable column selections.
- Multi-row bulk actions with interactive selection count, batch status toggle (Draft / Published / Archived), and confirmation dialogs.
- Low-stock visual alert indicators and filter tab with 1-click supplier restocking draft generator.

### R4. Complete Timeline Audit Logs & Activity Feed
- Order timeline visualization showing state machine progression, actor attribution (admin/system/supplier webhook), timestamps, and transition metadata.
- Activity feed widget on the main dashboard showing recent merchant updates and supplier dispatch actions.

### R5. Elite Brand V3 Polish & Accessibility (WCAG AAA)
- Strict adherence to ToolCart Brand V3 tokens (`design/tokens.css`): Industrial Cobalt `#2450B8`, Action Lime `#DDF16A` (dark text only), Ink `#182336`, Workshop White `#F7F8F5`, Steel Text `#596B70`.
- Minimum 44x44px touch targets on mobile/tablet viewports, responsive drawer navigation, and robust error boundaries preventing component-level failures from crashing the admin portal shell.

## Acceptance Criteria

### Functionality & Usability
- [ ] Contextual save bar appears whenever product, pricing, or settings forms are dirtied and blocks accidental navigation.
- [ ] Command palette opens on `Ctrl+K`/`Cmd+K` and keyboard-navigates to matching products, orders, and subpages.
- [ ] CSV export downloads valid formatted CSV files with active filters applied.
- [ ] Low-stock notification center surfaces all SKUs below reorder threshold with 1-click PO draft action.
- [ ] Order detail page renders visual timeline audit log with actor attribution.

### Code Quality & Brand Integrity
- [ ] 100% test pass rate across unit, integration, and security suites (`npm test`) with zero regressions.
- [ ] Strict Brand V3 compliance (`design/tokens.css`, `python qa/check_static.py`) with 0 violations.
- [ ] TypeScript compilation (`npm run typecheck`) and Next.js build (`npm run build`) pass cleanly.
- [ ] Wholesale cost confidentiality strictly preserved server-side with zero leakage in client bundles.
