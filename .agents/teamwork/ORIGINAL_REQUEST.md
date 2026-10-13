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
