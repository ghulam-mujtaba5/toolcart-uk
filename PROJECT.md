# Project: ToolCart UK Platform

## Architecture
ToolCart UK is a production-grade, Vercel-deployable UK tools, DIY, and hardware e-commerce platform and Medusa-grade Admin Portal built using Next.js App Router (TypeScript + Tailwind CSS), Supabase (PostgreSQL + Auth + RLS), Cloudflare R2 (S3-compatible object storage), Resend (transactional email), and Stripe (test-mode checkout & webhooks).

### Architecture Principles & Layers
1. **Presentation Layer (Storefront & Admin)**:
   - Next.js App Router (`app/(storefront)/...` and `app/admin/...`).
   - Tailwind CSS configured directly from `design/tokens.css` with strict Brand V3 palette (Ink `#182336`, Cobalt `#2450B8`, Cobalt Deep `#193F99`, Action Lime `#DDF16A` with 2px Ink outline, Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF`, Graphite `#252D30`, Steel Text `#596B70`).
   - Typography: Manrope (headings) and IBM Plex Sans (body, UI, and tabular numerals `tabular-nums` for prices/dimensions/SKUs).
   - Zero tolerance on `#B84C32` copper, purple, or teal. Zero white text on lime.
   - Accessible UI primitives: Radix UI / shadcn style.
2. **Domain & Commerce Engine Layer**:
   - Supplier Order State Machine (`architecture/SUPPLIER_ORDER_STATE_MACHINE.md`): `cart_pending -> checkout_authorized -> supplier_order_pending -> supplier_accepted -> payment_captured -> dispatched -> delivered`, plus exceptional flows (`supplier_rejected`, `supplier_timeout`, `refund_pending`, `refunded`, etc.).
   - Idempotency control: PO key `order_id + supplier_id`, Stripe event idempotency.
   - Append-only audit log: `order_audit_logs`.
   - Catalog ingestion: Validates against `schemas/product_contract.schema.json`, normalizes Unicode ligatures (`fi`, `fl`, `Ø`), verifies case-vs-unit math (`case_cost == unit_cost * units_per_case`), ingests all 115 SKUs from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`.
3. **Security & Wholesale Isolation**:
   - Server-only storage of wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).
   - Row-Level Security (RLS) in PostgreSQL protecting wholesale tables from public access.
   - Public Storefront DTO (`PublicProductDTO`) strips wholesale pricing before serialization to client components or public `/api/store/*` routes.
4. **Data & Storage Layer**:
   - Supabase PostgreSQL schema with migrations (`supabase/migrations/*.sql`).
   - Zero-config local repository fallback (`src/lib/db/` loading from seed CSV/JSON) ensuring full functionality in CI and offline local builds.
5. **Adapters & Cloud Services**:
   - Cloudflare R2: `@aws-sdk/client-s3` with local filesystem fallback in `public/uploads/`.
   - Resend: Transactional emails (Order Confirmation, PO Dispatch, Tracking, Trade Approval) with sandbox/console log fallback.
   - Stripe: Test mode Elements and signed webhook listener with mock fallback.
   - SEO: Dynamic `sitemap.ts`, `robots.ts` (`STAGING_ONLY` aware), Schema.org JSON-LD (`Product`, `BreadcrumbList`, `Organization`).

---

## Feature Inventory
Every feature identified during the Survey phase is mapped to an implementation milestone.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Brand V3 Design Tokens | CSS variables imported from `design/tokens.css`, zero copper/purple/teal | M1 | survey_brand |
| 2 | Tailwind CSS Integration | Tailwind setup mapping theme variables to `--tc-*` tokens | M1 | survey_brand |
| 3 | Typography Configuration | Manrope headings and IBM Plex Sans body + `tabular-nums` | M1 | survey_brand |
| 4 | Accessible UI Primitives | Buttons (Cobalt primary, Lime accent with 2px Ink outline), Badges, Dialogs, Cards | M1 | survey_brand |
| 5 | Cross-Platform QA Scripts | Patch `qa/check_static.py` for Windows UTF-8 and dynamic paths | M1 | survey_env |
| 6 | Global VAT Toggle | Persistent Trade vs DIY (Inc VAT / Ex VAT) state/cookie | M2 | survey_brand |
| 7 | Homepage (`/`) | Hero, category grid, kit builders, customer promise card, AI finder trigger | M2 | survey_brand |
| 8 | Category & Search (`/search`, `/categories/[slug]`) | Lexical search + multi-attribute faceted filters, sort, URL sync | M2 | survey_brand |
| 9 | Product Detail (`/products/[slug]`) | Technical specs table, GTIN/MPN, pack breakdown, honest stock, compare trigger | M2 | survey_brand |
| 10 | Compare Product Drawer | Side-by-side spec comparison of up to 4 items | M2 | survey_brand |
| 11 | Project Baskets (`/projects`) | 3 curated kits (Electrical Consumables, Painting Prep, Site Torch) with 1-click add | M2 | survey_brand |
| 12 | UK Buying Guides (`/guides`, `/guides/[slug]`) | 5 original UK hardware guides with safety notes and product links | M2 | survey_brand |
| 13 | AI Product & Project Assistant | Cloud Blue + Cobalt drawer, grounded catalog tools, zero safety hallucination | M2 | survey_brand |
| 14 | Cart & Multi-Supplier Basket (`/basket`) | Slide-over and full basket with multi-supplier grouping and UK VAT math | M2 | survey_brand |
| 15 | Customer Checkout Flow (`/checkout`) | Guest checkout, address entry, UK VAT, Stripe Elements, delivery estimation | M2 | survey_brand |
| 16 | Trade Account Portal (`/trade`) | B2B trade account registration form (Companies House, VAT) | M2 | survey_brand |
| 17 | Customer Order Tracking (`/account/orders/[id]`) | Real-time state machine order timeline visualization | M2 | survey_brand |
| 18 | Product Contract Schema Validator | Schema validator implementing `schemas/product_contract.schema.json` | M3 | survey_commerce |
| 19 | 115 SKU CSV Catalog Importer | Batch importer for `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` with case math | M3 | survey_commerce |
| 20 | Unicode Ligature Normalization | Normalization of `ﬁ`, `ﬂ`, `Ø` in catalog text | M3 | survey_commerce |
| 21 | Nullable Carton Barcode Support | Support single-unit items with missing carton barcode | M3 | survey_commerce |
| 22 | Wholesale Cost Security Isolation | Strict server-side isolation of `unit_cost_ex_vat_gbp` and `case_cost_ex_vat_gbp` | M3 | survey_commerce |
| 23 | Supplier Order State Machine | All 13 states and transitions from `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` | M3 | survey_commerce |
| 24 | State Machine Idempotency | PO idempotency (`order_id + supplier_id`) and webhook deduplication | M3 | survey_commerce |
| 25 | Append-Only Audit Logging | `order_audit_logs` tracking state transitions, actor, timestamp, metadata | M3 | survey_commerce |
| 26 | Auto-Refund / Cancellation Engine | Automatic payment void/refund on supplier rejection or SLA timeout | M3 | survey_commerce |
| 27 | Margin & Pricing Engine | Category/supplier markups, retail price calculation, margin floor alerts | M3 | survey_commerce |
| 28 | Admin Dashboard (`/admin`) | KPI cards (SKUs, draft vs approved, active orders, stale feed alerts) | M3 | survey_commerce |
| 29 | Admin Product Manager (`/admin/products`, `[id]`) | Full product CRUD, spec editor, image licensing and compliance flags | M3 | survey_commerce |
| 30 | Admin Order Manager (`/admin/orders`, `[id]`) | Order state transitions, PO generation, tracking numbers, audit log view | M3 | survey_commerce |
| 31 | Admin Importer UI (`/admin/import`) | Interactive CSV/JSON importer with dry-run validation | M3 | survey_commerce |
| 32 | Admin Pricing & Margin UI (`/admin/pricing`) | Wholesale markup editor and low-margin alerts | M3 | survey_commerce |
| 33 | Admin Customers & Trade (`/admin/customers`) | Trade account approvals and customer directory | M3 | survey_commerce |
| 34 | Admin Settings & Gates (`/admin/settings`) | `STAGING_ONLY` gate, shipping rates, cloud status | M3 | survey_commerce |
| 35 | Supabase PostgreSQL Schema & RLS | 11 tables with RLS protecting wholesale costs | M4 | survey_commerce |
| 36 | Zero-Config Local Storage Fallback | File/in-memory fallback repository for local dev and CI builds | M4 | survey_commerce |
| 37 | Cloudflare R2 Storage Adapter | Media upload/signed URLs via `@aws-sdk/client-s3` with local fallback | M4 | survey_commerce |
| 38 | Resend Email Service | Brand V3 transactional email templates with sandbox/log fallback | M4 | survey_commerce |
| 39 | Stripe Payment Integration | PaymentIntent creation, webhook verification, test card support | M4 | survey_commerce |
| 40 | Dynamic SEO & Structured Data | `sitemap.ts`, `robots.ts` (staging aware), Schema.org JSON-LD | M4 | survey_commerce |
| 41 | E2E Testing Suite (Tiers 1-4) | Comprehensive opaque-box test suite published via `TEST_READY.md` | M5 | test_track |
| 42 | Adversarial Hardening (Tier 5) | White-box stress tests, security leak verification, boundary testing | M5 | test_track |
| 43 | Production Build & Lint Quality | `npm run build`, `npm run typecheck`, `npm run lint`, `npm test` passing | M5 | all |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Foundation & Brand V3 Design System | Next.js bootstrap, Tailwind tokens, typography, UI primitives, cross-platform QA check | None | IN_PROGRESS |
| M2 | Customer Storefront Experience | All storefront routes, VAT toggle, search/facets, PDP, compare, guides, basket, AI assistant | M1 | PLANNED |
| M3 | Commerce Engine, Catalog Seed & Admin Portal | 115 SKU catalog ingestion, state machine, wholesale isolation, audit logs, full `/admin` | M1 | PLANNED |
| M4 | Cloud Infrastructure & Service Adapters | Supabase schema/RLS + local fallback, Cloudflare R2, Resend, Stripe checkout, dynamic SEO | M2, M3 | PLANNED |
| M5 | Dual-Track E2E Test Suite & Hardening | 100% E2E test pass (Tiers 1-4), Tier 5 adversarial hardening, zero leaks, clean audit | M4, TEST_READY | PLANNED |

---

## Interface Contracts

### Product Domain Contracts (`src/types/product.ts`)
```typescript
export type SellabilityStatus = 'draft' | 'needs_review' | 'approved' | 'blocked';

// Public DTO: Safe for storefront and client components
export interface PublicProductDTO {
  id: string;
  slug: string;
  title: string;
  description: string;
  brand: string;
  gtin: string; // barcode EAN-13
  mpn?: string;
  supplier_sku: string;
  category: string;
  images: string[];
  retail_price_inc_vat_gbp: number;
  retail_price_ex_vat_gbp: number;
  units_per_pack: number;
  units_per_case: number;
  case_pack_description: string;
  specifications: Record<string, string>;
  compliance_verified: boolean;
  image_license_verified: boolean;
  availability_status: 'in_stock' | 'subject_to_confirmation' | 'out_of_stock';
  weight_grams?: number;
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
```

### Order & State Machine Contracts (`src/types/order.ts`)
```typescript
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
```

---

## Code Layout
```
e:\ToolCart\
├── app/
│   ├── (storefront)/
│   │   ├── page.tsx                          # Homepage
│   │   ├── search/page.tsx                   # Search discovery
│   │   ├── categories/[slug]/page.tsx        # Category PLP
│   │   ├── products/[slug]/page.tsx          # Product PDP
│   │   ├── projects/page.tsx                 # Project kits
│   │   ├── guides/page.tsx                   # Buying guides directory
│   │   ├── guides/[slug]/page.tsx            # Buying guide detail
│   │   ├── basket/page.tsx                   # Basket
│   │   ├── checkout/page.tsx                 # Checkout
│   │   ├── account/page.tsx                  # Customer account
│   │   ├── account/orders/[id]/page.tsx      # Order state tracking
│   │   └── trade/page.tsx                    # Trade account registration
│   ├── admin/
│   │   ├── page.tsx                          # KPI Dashboard
│   │   ├── products/page.tsx                 # Product manager
│   │   ├── products/[id]/page.tsx            # Product editor
│   │   ├── orders/page.tsx                   # Order operations
│   │   ├── orders/[id]/page.tsx              # Order fulfillment detail
│   │   ├── suppliers/page.tsx                # Supplier directory
│   │   ├── import/page.tsx                   # CSV/JSON Importer
│   │   ├── pricing/page.tsx                  # Margin & pricing engine
│   │   ├── customers/page.tsx                # Trade approvals
│   │   └── settings/page.tsx                 # Governance & settings
│   ├── api/
│   │   ├── store/
│   │   │   ├── products/route.ts             # Public products (sanitized DTO)
│   │   │   ├── cart/route.ts                 # Public basket operations
│   │   │   └── assistant/route.ts            # AI Assistant tool caller
│   │   ├── admin/
│   │   │   ├── import/route.ts               # Admin batch import
│   │   │   ├── orders/[id]/transition/route.ts # Order state transition
│   │   │   └── products/route.ts             # Admin product CRUD
│   │   └── webhooks/
│   │       ├── stripe/route.ts               # Stripe webhook
│   │       └── supplier/route.ts             # Supplier webhook
│   ├── layout.tsx
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
├── src/
│   ├── components/
│   │   ├── ui/                               # Radix/Tailwind primitives (Button, Input, Badge, Dialog)
│   │   ├── storefront/                       # Storefront components (Header, Footer, VATToggle, AIModal)
│   │   └── admin/                            # Admin layout & forms
│   ├── lib/
│   │   ├── db/                               # Database client & local seed fallback
│   │   ├── state-machine/                    # Supplier order state machine
│   │   ├── catalog/                          # Importer, validator, case math, Unicode normalizer
│   │   ├── pricing/                          # Margin engine & DTO sanitizers
│   │   ├── adapters/                         # Cloud adapters (R2, Resend, Stripe)
│   │   └── ai/                               # AI project assistant catalog tools
│   └── types/                                # TypeScript schemas & DTOs
├── supabase/
│   └── migrations/                           # SQL schema migrations & RLS policies
├── tests/
│   ├── brand/                                # Brand static & contrast tests
│   ├── security/                             # Wholesale cost leak tests
│   ├── catalog/                              # 115 SKU ingestion & case math tests
│   └── state-machine/                        # State machine transition & refund tests
├── qa/
│   ├── check_static.py                       # Cross-platform static validation script
│   └── contrast_matrix.json                  # Authoritative WCAG contrast matrix
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```
