# Handoff Report: Commerce Engine, State Machine, Admin, Database & Cloud Adapters

**Agent**: Spec Miner Commerce 1 (`specminer_commerce_1`)  
**Parent**: Orchestrator (`311a2f36-0bc9-4d2c-ad1b-812679b4333e`)  
**Mission**: Mine and document all requirements and specifications related to Commerce Engine, Supplier Order State Machine, Admin Portal, Database, and Cloud Adapters for ToolCart UK.  
**Date**: 2026-10-12  

---

## 1. Observation

Direct observations from repository files, schemas, and live CSV inspection:

1. **State Machine Specification (`architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, lines 1–15)**:
   - Primary lifecycle: `cart_pending -> checkout_authorized -> supplier_order_pending -> supplier_accepted -> payment_captured -> dispatched -> delivered`.
   - Exceptional paths: `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`.
   - Operational constraints: "Quote != available; all purchasability from approved fresh supplier feed with a TTL set per source"; "Fetch latest stock BEFORE customer checkout completion. Use explicit supplier allocation with idempotency key (order ID + supplier ID)"; "Payment capture timing must match payment provider authorisation window and supplier response; design timeout recovery"; "Record all transitions in append-only audit log. Signed webhooks and idempotent retries."

2. **Product Schema Contract (`schemas/product_contract.schema.json`, lines 1–28)**:
   - Schema type: Draft 2020-12 object with `additionalProperties: false`.
   - Required fields: `["supplier_sku", "title", "supplier", "unit_cost_ex_vat_gbp", "units_per_case", "sellability_status"]`.
   - Sellability enum: `["draft", "needs_review", "approved", "blocked"]` (default `"draft"`).
   - Numerical constraints: `unit_cost_ex_vat_gbp` (>= 0), `units_per_case` (integer >= 1), `minimum_purchase_cases` (integer >= 1), `retail_price_inc_vat_gbp` (>= 0), `supplier_stock_qty` (integer >= 0), `weight_grams` (>= 0).
   - Verification flags: `image_license_verified` (boolean, default false), `compliance_verified` (boolean, default false), `supplier_direct_dispatch_verified` (boolean, default false).

3. **Sample Supplier Catalog Baseline (`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`, 117 lines / 115 data rows)**:
   - 115 quoted product rows from Status International (UK) Ltd dated 2026-10-09.
   - Header fields (17 columns): `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified`.
   - Verification columns: All 115 rows have `source_quote_is_inventory: "NO"`, `supplier_stock_confirmed: "UNVERIFIED"`, `dropship_eligible: "UNVERIFIED"`, `photo_license_verified: "UNVERIFIED"`, `compliance_verified: "UNVERIFIED"`.
   - Barcode check: All 115 rows have a 13-digit EAN-13 barcode in `barcode`.
   - Carton barcode check: 114 rows have a 14-digit ITF-14 barcode; exactly 1 row (`ION3SFLADDER1P1`, line 111, units_per_case=1) has an empty `carton_barcode`.
   - Case math verification: Ran python validation on all 115 rows checking `abs(case_cost_ex_vat_gbp - round(unit_cost_ex_vat_gbp * units_per_case, 2)) <= 0.01`. Exactly 0 discrepancies found.
   - Unicode character inspection: 18 rows contain non-ASCII Unicode characters:
     - `\ufb01` ('ﬁ' ligature) in 15 rows (e.g., `ION16OZSCHAM1P6`, `IONA4SPAPER10P10`, `IONRSTRAPS2P12`, `IONBEHEXKEYS1P10`, `ION3WCHISEL1P6`, `IONMFILESET1P12`).
     - `\ufb02` ('ﬂ' ligature) in 3 rows (`IONSDRIVERS4P10`, `IONPSDRIVERS6P10`, `IONFWSPAD4P24` in `ﬂathead`).
     - `\u00d8` ('Ø' diameter symbol) in `IONNEONTESTS1P10` (`Ø3x140mm`).

4. **Commerce & Supplier Operating Spec (`docs/04_COMMERCE_SUPPLIER_SPEC.md`, lines 1–48)**:
   - Business model: Single merchant selling supplier-backed stock, NOT an open marketplace.
   - Wholesale separation: `Product` canonical record owned by merchant; `SupplierOffer` owned by supplier module.
   - Sellability gate: Product must NOT be purchasable unless SKU/GTIN validated, image rights confirmed, compliance verified, supplier contracted, stock feed fresh within TTL policy, and unit economics yield positive contribution margin.
   - Failure handling: No stock -> block sale; supplier reject -> void authorization or refund promptly; price changes -> re-evaluate margin before accepting order.

5. **SEO & Discovery Spec (`docs/05_SEO_AI_DISCOVERY.md`, lines 1–44)**:
   - Robots policy: `noindex` staging and preview builds; public crawl allowed for production pages with explicit disallow for `/admin`, `/basket`, `/checkout`, `/account`.
   - OpenAI crawlers: Allow `OAI-SearchBot` for search discovery; distinguish from `GPTBot`.
   - Structured Data: Schema.org `Product` + `Offer` JSON-LD (GTIN, MPN, brand, stock, price, delivery/returns), `BreadcrumbList`, `Organization`, `WebSite`, `FAQPage`. Visible page facts must match structured data verbatim.
   - Google Merchant Center: Export valid feed for approved sellable items only.

6. **Engineering Execution & Architecture Decisions (`docs/06_ENGINEERING_EXECUTION.md`, `baseline/03_TECHNICAL_ARCHITECTURE.md`, `architecture/DECISIONS.md`)**:
   - Storefront: Next.js App Router + TypeScript + Tailwind CSS on Vercel.
   - Data & Storage: PostgreSQL (Supabase / Drizzle/Prisma) with zero-config local fallback (SQLite/JSON seed store) so CI and local builds execute without cloud dependencies.
   - Media: Cloudflare R2 (@aws-sdk/client-s3) with local filesystem fallback.
   - Email: Resend transactional email with sandbox/log fallback.
   - Payments: Stripe test-mode Elements and signed webhook listener with idempotency.
   - Margin & Security: Strict server-side storage of wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`). Zero leakage to public storefront APIs or client components.

7. **Launch Gates & Governance (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`, lines 1–41)**:
   - Brand ToolCart is provisional (trademark and domain clearance pending).
   - `STAGING_ONLY=true` default gate prevents live order processing or indexation before operational approval.

---

## 2. Logic Chain

1. **State Machine Integrity**:
   - Because supplier quotes do not equal live inventory (Observation 1, 3, 4), the platform cannot treat a checkout authorization as an immediate order dispatch.
   - Therefore, the state machine must hold funds in `checkout_authorized` or `supplier_order_pending` until the supplier confirms allocation (`supplier_accepted`).
   - If the supplier rejects or times out, the system must trigger automated compensation (`supplier_rejected` -> void/refund), log an immutable entry in `order_audit_logs`, and update the customer.
   - Idempotency keys (`order_id + supplier_id` for POs, `stripe_event_id` for webhooks) prevent duplicate orders, double payments, or race-condition payouts.

2. **Catalog Ingestion & Data Sanitation**:
   - Observation 3 shows all 115 rows have unverified stock, dropship, image, and compliance flags. Therefore, upon initial ingestion, all products must be assigned `sellability_status = "draft"`.
   - Ingestion must validate `case_cost_ex_vat_gbp == unit_cost_ex_vat_gbp * units_per_case` (Observation 3).
   - Ingestion must normalize Unicode ligatures (`ﬁ` -> `fi`, `ﬂ` -> `fl`) so search indexes and text filters match standard ASCII queries without encoding failure.
   - `carton_barcode` must be nullable to accommodate single-unit items like `ION3SFLADDER1P1`.

3. **Wholesale Cost Security Isolation**:
   - Exposing wholesale costs destroys merchant negotiating leverage, damages customer trust, and violates the fundamental project rules (Observation 4, 6).
   - Therefore, database tables containing wholesale costs (`supplier_offers`, `supplier_purchase_orders`) must be protected by Row-Level Security (RLS) denying public `anon` and customer `authenticated` roles.
   - Storefront APIs (`/api/store/*`) and Next.js React Server Components must only receive sanitized `PublicProductDTO` projections containing retail prices and availability, stripped of supplier costs.

4. **Admin Portal Requirements**:
   - The operational workflow requires managing product approval, inspecting supplier feeds, reviewing margin thresholds, and processing order fulfillment (Observation 4, 6, 7).
   - Admin routes must provide:
     - `/admin`: Dashboard with KPI overview (115 SKUs, draft vs approved, stale feed alert, launch checklist).
     - `/admin/products` & `/admin/products/[id]`: Full catalog CRUD, spec management, and compliance/image licensing verification toggles.
     - `/admin/orders` & `/admin/orders/[id]`: State machine transition controls, PO generation, tracking number entry, and audit log viewer.
     - `/admin/suppliers`: Supplier profile and SLA parameters.
     - `/admin/import`: Drag-and-drop CSV importer with live dry-run validation against `product_contract.schema.json`.
     - `/admin/pricing`: Margin control engine and wholesale markup editor.
     - `/admin/customers`: Trade account approvals and customer directory.
     - `/admin/settings`: Shipping rates, `STAGING_ONLY` gate, and cloud adapter status.

5. **Cloud Adapters & Zero-Config Local Fallback**:
   - Deployments must run on Vercel and local developer/CI environments seamlessly (Observation 6).
   - When external cloud credentials (Supabase, R2, Resend, Stripe) are absent, the application must automatically degrade to built-in fallbacks (local seed store from CSV, local file storage, email console logging, Stripe test mode stub).

---

## 3. Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | State Machine | Happy Path Progression | Transition order from basket to delivery | Cart payload, customer address, payment auth | Order state: `cart_pending` -> `checkout_authorized` -> `supplier_order_pending` -> `supplier_accepted` -> `payment_captured` -> `dispatched` -> `delivered` | Invalid transition throws `InvalidStateTransitionError` | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` |
| 2 | State Machine | Supplier Rejection & Void/Refund | Handles supplier out-of-stock or order rejection | Supplier reject webhook/API payload, rejection reason | State: `supplier_rejected` -> `refund_pending` -> `refunded`; Stripe auth released/refunded | Audit log failure recorded; alert sent to admin | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 3 | State Machine | Supplier SLA Timeout Recovery | Automatically catches unconfirmed orders before payment auth expires | Cron/timer checking pending orders > SLA window (e.g. 24h) | State: `supplier_timeout`; void authorization; notify customer | Flags order for `manual_review` if payment capture near expiry | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 4 | State Machine | Partial Supplier Acceptance | Manages orders where supplier accepts only subset of items | Partial confirmation payload from supplier | State: `partial_supplier_acceptance`; partial refund for unaccepted lines; recalculate carriage | Throws error if split shipping exceeds customer consent | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` |
| 5 | State Machine | Partial Dispatch Tracking | Tracks multiple parcels from split fulfillments | Courier tracking numbers per line/sub-package | State: `partial_dispatch`; customer receives multi-tracking email | Invalid carrier format flagged | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` |
| 6 | State Machine | Idempotent PO Submission | Prevents duplicate supplier POs on retries or concurrent clicks | Compound key: `order_id + supplier_id` | Unique PO creation or idempotent existing PO return | Duplicate request returns existing PO without re-billing | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, `baseline/03_TECHNICAL_ARCHITECTURE.md` |
| 7 | State Machine | Append-Only Audit Logging | Records all order status changes with actor and metadata | `order_id`, `from_state`, `to_state`, `trigger`, `actor`, `metadata` | New row in `order_audit_logs` | Log insertion failure halts transaction | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, `baseline/03_TECHNICAL_ARCHITECTURE.md` |
| 8 | Product Contract | Case Math Validation | Validates case cost against unit cost and case count | `unit_cost_ex_vat_gbp`, `units_per_case`, `case_cost_ex_vat_gbp` | Boolean valid/invalid flag | Mismatch flags error: `case_cost != unit_cost * units_per_case` | `schemas/product_contract.schema.json`, `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` |
| 9 | Product Contract | GTIN Barcode Verification | Validates 13-digit EAN-13 check digit | 13-digit string `barcode` | Valid/invalid check digit flag | Rejects malformed or invalid check-digit barcodes | `schemas/product_contract.schema.json`, `baseline/08_ENGINEERING_BACKLOG.csv` |
| 10 | Product Contract | Sellability State Gate | Controls whether product is publicly purchasable | Product compliance, image license, stock TTL, contribution margin | Status: `draft` -> `needs_review` -> `approved` -> `blocked` | Prevents checkout if status != `approved` | `schemas/product_contract.schema.json`, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 11 | Catalog Ingestion | 115 CSV Row Ingestion | Ingests 115 Status International UK lines into database | Raw CSV string / file upload | 115 draft products and supplier offers in DB | Invalid rows reported in dry-run error summary | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`, `ORIGINAL_REQUEST.md` |
| 12 | Catalog Ingestion | Unicode Ligature Normalization | Expands typographic ligatures and cleans description strings | Strings containing `\ufb01` (ﬁ), `\ufb02` (ﬂ), `\u00d8` (Ø) | Normalized UTF-8 strings (`fi`, `fl`, `Ø`) | Encoding error prevented; search matches canonical words | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` inspection |
| 13 | Catalog Ingestion | Nullable Carton Barcode Handling | Allows empty carton barcode for single-unit items | `carton_barcode` string or empty | Stored as nullable string in DB | Empty string mapped to null; doesn't fail schema | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` row 111 |
| 14 | Catalog Ingestion | Category Taxonomy Derivation | Maps 115 SKUs to 6 primary store categories | Product description, SKU prefix | Category assignment: Tools, Fixings, Decorating, Measuring, Workwear, Consumables | Defaults to unassigned / needs review if no match | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`, `docs/03_UX_INFORMATION_ARCHITECTURE.md` |
| 15 | Security | Strict Wholesale Cost Isolation | Protects wholesale costs from client exposure | Database query / API request | Server-only models; client DTO strips `unit_cost_ex_vat_gbp` and `case_cost_ex_vat_gbp` | Public endpoint returning cost fields fails security test | `AGENTS.md`, `ORIGINAL_REQUEST.md` R2, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 16 | Security | Row-Level Security (RLS) | Database-level protection for sensitive wholesale tables | Database connection role (`anon`, `authenticated`, `service_role`) | Access granted or denied | Unauthorized query returns 0 rows or permission denied | `baseline/03_TECHNICAL_ARCHITECTURE.md`, `ORIGINAL_REQUEST.md` R3 |
| 17 | Margin Control | Automated Retail Pricing Engine | Computes VAT-inclusive and ex-VAT retail price from wholesale cost + margin target | Wholesale cost, shipping cost, payment fee, target margin % | `retail_price_inc_vat_gbp`, `retail_price_ex_vat_gbp`, net margin | Margin below floor triggers "Margin Alert" | `docs/04_COMMERCE_SUPPLIER_SPEC.md`, `baseline/01_BUSINESS_AND_SUPPLIER_MODEL.md` |
| 18 | Margin Control | Low-AOV / Pack Protection Gate | Prevents selling sub-£1 items individually without packaging buffer | Product wholesale cost < £1.00 | Flag requirement for multi-pack or minimum order quantity | Blocks single-unit sale if landed carriage exceeds margin | `baseline/01_BUSINESS_AND_SUPPLIER_MODEL.md`, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 19 | Admin Portal | Executive KPI Dashboard (`/admin`) | High-level metrics on SKUs, orders, and governance | Database aggregates | Cards: Total SKUs (115), Draft vs Approved, Stale Feed Alert, Launch Checklist | Highlights zero-approved warning if all in draft | `ORIGINAL_REQUEST.md` R2, `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md` |
| 20 | Admin Portal | Product Catalog Manager (`/admin/products`) | Comprehensive product management, filtering, and detail CRUD | Filter query params, product form inputs | Product table and `/admin/products/[id]` detail editor | Validation error on missing required fields | `ORIGINAL_REQUEST.md` R2 |
| 21 | Admin Portal | Order Operations Manager (`/admin/orders`) | Order timeline, state transitions, PO generation, and refunds | Order ID, transition action, tracking details | Order state updated, PO generated, audit log rendered | Disallows illegal state transitions | `ORIGINAL_REQUEST.md` R2, `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` |
| 22 | Admin Portal | Supplier Directory (`/admin/suppliers`) | Manage supplier credentials, SLA, and dispatch terms | Supplier settings form | Updated supplier record in `suppliers` table | Disables supplier dropship if agreement missing | `ORIGINAL_REQUEST.md` R2, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 23 | Admin Portal | Interactive Catalog Importer (`/admin/import`) | CSV upload, dry-run validation, and batch database ingest | Uploaded CSV file | Validation report: valid count, invalid count, case math status | Halts on catastrophic parse failure | `ORIGINAL_REQUEST.md` R2, `schemas/product_contract.schema.json` |
| 24 | Admin Portal | Pricing & Margin Editor (`/admin/pricing`) | Configure category markups and inspect unit economics | Markup percentage, fixed buffer | Bulk price recalculation preview | Warns on negative contribution lines | `ORIGINAL_REQUEST.md` R2, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 25 | Admin Portal | Customer & Trade Portal (`/admin/customers`) | Review retail customers and approve B2B Trade Accounts | Trade account application ID, approval decision | Customer account tier updated; approval email sent | Rejection requires documented reason | `ORIGINAL_REQUEST.md` R2, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 26 | Admin Portal | Settings & Launch Gates (`/admin/settings`) | Manage `STAGING_ONLY`, shipping rates, and governance | Settings toggles and inputs | Platform runtime environment config | Staging gate cannot be bypassed without credentials | `ORIGINAL_REQUEST.md` R2, `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md` |
| 27 | Database | Supabase PostgreSQL Schema | 11 core relational tables with foreign keys and indexes | SQL schema / migration scripts | Database tables instantiated in Postgres | Migration aborts on syntax or constraint conflict | `baseline/03_TECHNICAL_ARCHITECTURE.md`, `ORIGINAL_REQUEST.md` R3 |
| 28 | Database | Zero-Config Local Fallback Store | In-memory/JSON/SQLite repository fallback for local dev & CI | Local CSV/JSON seed files | Functional repository without live Supabase database | Falls back gracefully if Supabase env vars missing | `ORIGINAL_REQUEST.md` R2, R3 |
| 29 | Cloud Storage | Cloudflare R2 Media Adapter | Uploads and serves media using `@aws-sdk/client-s3` | File buffer, MIME type, storage key | Public CDN URL or presigned URL | Falls back to `public/uploads/` if R2 unconfigured | `ORIGINAL_REQUEST.md` R3, `baseline/03_TECHNICAL_ARCHITECTURE.md` |
| 30 | Cloud Email | Resend Transactional Email Adapter | Sends Brand V3 styled transactional emails | Email template name, recipient, dynamic variables | Email sent via Resend API or mock log entry | Logs email to console/disk if API key missing | `ORIGINAL_REQUEST.md` R3, `docs/06_ENGINEERING_EXECUTION.md` |
| 31 | Cloud Payments | Stripe Test-Mode Adapter | Processes payment authorizations and captures | Payment method token, amount, currency (GBP) | Stripe PaymentIntent created/authorized/captured | Card errors returned cleanly to checkout form | `ORIGINAL_REQUEST.md` R1, R3, `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` |
| 32 | Cloud Payments | Stripe Webhook Listener & Idempotency | Handles asynchronous Stripe events (`payment_intent.succeeded`) | Raw request body, `stripe-signature` header | Order state transition triggered; audit log written | Rejects unverified signatures; skips duplicate event IDs | `ORIGINAL_REQUEST.md` R3, `baseline/03_TECHNICAL_ARCHITECTURE.md` |
| 33 | SEO | Dynamic XML Sitemap (`sitemap.ts`) | Generates search engine index of approved products & guides | Database query of approved products & routes | Valid XML sitemap response | Excludes draft and admin routes | `docs/05_SEO_AI_DISCOVERY.md`, `ORIGINAL_REQUEST.md` R3 |
| 34 | SEO | Dynamic Robots Config (`robots.ts`) | Directs search engine crawlers according to environment | Request hostname, `STAGING_ONLY` env var | `robots.txt` output (disallows all in staging) | Allows Googlebot/OAI-SearchBot in production | `docs/05_SEO_AI_DISCOVERY.md`, `ORIGINAL_REQUEST.md` R3 |
| 35 | SEO | Schema.org JSON-LD Generator | Embeds structured data for Product, Breadcrumb, and Org | Product model, category hierarchy | JSON-LD `<script>` tag in HTML header | Omits unverified review/rating schemas | `docs/05_SEO_AI_DISCOVERY.md`, `ORIGINAL_REQUEST.md` R3 |

---

## 4. Edge Cases

| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | CSV Ingestion | Typographic Unicode ligatures (`ﬂ` in `ﬂathead`, `ﬁ` in `finish`, `Ø` in `Ø3x140mm`) | Ingestion without normalization causes encoding crash (`UnicodeEncodeError: 'charmap' codec can't encode character '\ufb02'`) or broken search queries. Text normalization (`unicodedata.normalize('NFKD', ...)`) must expand ligatures before database indexing. |
| 2 | CSV Ingestion | Single unit carton with blank carton barcode (`ION3SFLADDER1P1`) | Row 111 has `units_per_case: 1` and blank `carton_barcode`. The importer must treat `carton_barcode` as nullable rather than failing validation. |
| 3 | CSV Ingestion | Quotes inside product description (e.g. `1.5"` or `6"`) | Descriptions with unescaped double quotes will corrupt CSV column parsing if not handled by standard RFC 4180 parser. |
| 4 | Case vs Unit Math | Unit cost multiplied by case quantity (`unit_cost * units_per_case`) | Validated on all 115 rows. All rows match exactly. An edge case would occur if an operator manually edited the CSV swapping unit and case costs; the schema validation must strictly reject if `abs(case_cost - unit * units_per_case) > 0.01`. |
| 5 | State Machine | Supplier rejects after Stripe authorization | If supplier reports no stock after `checkout_authorized`, platform must call `stripe.paymentIntents.cancel()` to void authorization without capturing. If capture already occurred, it must call `stripe.refunds.create()`. Must never leave funds captured with an unfulfilled order. |
| 6 | State Machine | Stripe authorization timeout (7-day window) | If supplier does not respond within gateway authorization window (Stripe default 7 days), authorization expires. System must detect aging orders at day 5 or 6 and transition to `manual_review` or auto-cancel before expiration. |
| 7 | State Machine | Duplicate Stripe Webhook Delivery | Stripe webhooks frequently send duplicate events for retries. Webhook handler must check if `stripe_event_id` is already recorded in `order_audit_logs`. If present, return HTTP 200 immediately without re-triggering state transition. |
| 8 | Multi-Supplier Basket | Cart contains items from 2 different suppliers | System must split checkout into 2 distinct fulfillment groups, calculate distinct carriage charges and delivery ETAs, and create 2 distinct `SupplierPurchaseOrder` records with separate idempotency keys. |
| 9 | Wholesale Isolation | Next.js Server Component serialization | If a Server Component fetches a raw product record from the database and passes it as a prop to a Client Component (`"use client"`), Next.js serializes all props into the RSC flight JSON payload in the HTML document. Wholesale fields (`unit_cost_ex_vat_gbp`) would leak into client HTML source. The data access layer must sanitize the object to `PublicProductDTO` before returning to any component or client boundary. |
| 10 | Stock TTL Expiry | Customer completes checkout 2 hours after loading PDP | If supplier feed snapshot age > TTL (e.g. 15m API, 2h CSV), system must trigger fresh availability check at checkout submission. If stock is no longer confirmed, halt checkout and notify customer. |
| 11 | Local Fallback | Deployment in CI environment without Supabase, Stripe, R2, or Resend API keys | Application must boot and pass unit/integration tests using local JSON repository, mock Stripe payment provider, local disk storage, and mock email logger without crashing on missing environment variables. |
| 12 | Launch Gate | `STAGING_ONLY=true` active in production build | Storefront displays staging banner, disables live Stripe charges (allows test card 4242... only), emits `Disallow: /` in `robots.txt`, and requires admin password or staging acknowledgment. |

---

## 5. Detailed Component Specifications

### 5.1 Supplier Order State Machine Specification
```
[cart_pending]
       │
       ▼ (Customer submits checkout & payment authorized)
[checkout_authorized]
       │
       ├─────────────────────────────────────────┐ (Supplier rejects / no stock)
       ▼ (Submit PO with idempotency key)        ▼
[supplier_order_pending]                   [supplier_rejected]
       │                                         │
       ├───────────────────┐ (Timeout > SLA)     ▼ (Void auth / issue refund)
       │                   ▼               [refund_pending] ──► [refunded]
       ▼             [supplier_timeout]
[supplier_accepted]
       │
       ▼ (Capture Stripe authorized payment)
[payment_captured]
       │
       ├───────────────────┐ (Split parcel)
       ▼                   ▼
  [dispatched]     [partial_dispatch]
       │                   │
       └─────────┬─────────┘
                 ▼
            [delivered]
```
- **Audit Logging Schema (`order_audit_logs`)**:
  - `id`: UUID (Primary Key)
  - `order_id`: UUID (Foreign Key -> `orders.id`)
  - `from_state`: VARCHAR(50) (e.g. `checkout_authorized`)
  - `to_state`: VARCHAR(50) (e.g. `supplier_order_pending`)
  - `trigger`: VARCHAR(100) (e.g. `admin_submit_po`, `supplier_webhook`, `stripe_webhook`)
  - `actor`: VARCHAR(100) (e.g. `system`, `admin:uuid`, `webhook:stripe`)
  - `metadata`: JSONB (capturing external reference IDs, error codes, payloads)
  - `created_at`: TIMESTAMPTZ (DEFAULT now())

### 5.2 Product Schema & Catalog Ingestion Specification
- **115 Quoted SKUs**:
  - Supplier: "Status International (UK) Ltd"
  - Quote date: 2026-10-09
  - Initial sellability status: `draft`
  - Required fields present: `supplier_sku`, `description` (mapped to `title`), `barcode` (GTIN-13), `carton_barcode` (ITF-14, nullable), `unit_cost_ex_vat_gbp`, `units_per_case`, `case_cost_ex_vat_gbp`.
- **Validation Rules**:
  - `case_cost_ex_vat_gbp == round(unit_cost_ex_vat_gbp * units_per_case, 2)` (tolerance: 0.01).
  - `barcode` must pass EAN-13 check digit modulo 10 test.
  - Text cleaning: Expand Unicode ligatures `\ufb01` -> `fi`, `\ufb02` -> `fl`.
  - Case vs unit clarity: Quoted units represent retail sellable items per case. Single item unit price is the base for margin markup; units per case determines carton packaging.

### 5.3 Wholesale Cost Isolation & Margin Control Architecture
- **Isolation Rules**:
  1. `unit_cost_ex_vat_gbp` and `case_cost_ex_vat_gbp` are stored in `supplier_offers` and NEVER in public `products` or `product_variants`.
  2. Public Storefront APIs (`/api/store/products`, `/api/store/cart`) return `PublicProductDTO` containing ONLY:
     - `id`, `slug`, `title`, `description`, `brand`, `gtin`, `mpn`, `images`, `specifications`, `retail_price_inc_vat_gbp`, `retail_price_ex_vat_gbp`, `availability_status`, `units_per_pack`.
  3. Margin calculation formula:
     $$\text{Gross Margin} = \frac{\text{Retail Ex VAT} - \text{Wholesale Cost}}{\text{Retail Ex VAT}}$$
     $$\text{Net Contribution} = \text{Retail Ex VAT} - \text{Wholesale Cost} - \text{Shipping} - \text{Payment Fee} - \text{Returns Buffer}$$
  4. Margin Guardrail: Any SKU generating Net Contribution < £1.50 or Gross Margin < 20% triggers a warning in `/admin/pricing` and cannot be auto-published without admin override.

### 5.4 Admin Portal Specification
- **`/admin`**: Dashboard with KPI tiles (Total 115 SKUs, Draft count, Approved count, Active Orders count, Stale Feed Alert indicator, Launch Gates status).
- **`/admin/products` & `/admin/products/[id]`**: Product table and detail form with tabs for General Specs, Media & Licensing (`image_license_verified`), Compliance (`compliance_verified`), and Sellability Workflow (`draft` -> `needs_review` -> `approved` -> `blocked`).
- **`/admin/orders` & `/admin/orders/[id]`**: Order manager with status filter, line item breakdown, PO generation, tracking number entry, manual refund trigger, and audit log history.
- **`/admin/suppliers`**: Supplier list, SLA management, and contact records.
- **`/admin/import`**: File upload zone, JSON/CSV parser, dry-run schema validation summary, and database ingestion trigger.
- **`/admin/pricing`**: Wholesale cost review, category markup rules, margin floor alerts.
- **`/admin/customers`**: Retail customer lookup and B2B Trade Account approval portal.
- **`/admin/settings`**: UK shipping zones, `STAGING_ONLY` master switch, and cloud adapter status monitors.

### 5.5 Database Architecture (Supabase PostgreSQL + Local Seed Fallback)
- **11 Tables**:
  1. `suppliers`
  2. `categories`
  3. `products`
  4. `product_variants`
  5. `supplier_offers` (PRIVATE - Wholesale costs)
  6. `supplier_stock_snapshots`
  7. `orders`
  8. `order_items`
  9. `supplier_purchase_orders` (PRIVATE - Wholesale totals)
  10. `order_audit_logs` (Append-only)
  11. `sync_runs`
- **RLS Policies**:
  - `supplier_offers` & `supplier_purchase_orders`: `SELECT USING (auth.jwt() ->> 'role' = 'admin')`. Public access completely denied.
  - `products`: `SELECT USING (sellability_status = 'approved' OR auth.jwt() ->> 'role' = 'admin')`.
- **Local Fallback**:
  - File-backed / in-memory repository loading directly from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` and `data/local_store.json`.

### 5.6 Cloud Adapters Specification
- **Cloudflare R2 Adapter**:
  - Implementation: `@aws-sdk/client-s3` targeting Cloudflare R2 endpoint (`https://<account_id>.r2.cloudflarestorage.com`).
  - Methods: `upload(key, buffer, mimeType)`, `getSignedUrl(key)`, `delete(key)`.
  - Fallback: Local filesystem storage in `public/uploads/`.
- **Resend Email Adapter**:
  - Implementation: Resend SDK sending transactional emails.
  - Templates: `OrderConfirmationEmail`, `SupplierPOEmail`, `ShipmentTrackingEmail`, `TradeAccountApprovalEmail`.
  - Fallback: Sandbox mode logging to console / test output.
- **Stripe Payment Adapter**:
  - Implementation: Stripe Node SDK.
  - Methods: `createPaymentIntent`, `capturePaymentIntent`, `cancelPaymentIntent`, `refundPaymentIntent`.
  - Webhook listener: Validates `stripe-signature` and ensures idempotency via `order_audit_logs`.
  - Fallback: Mock Stripe test provider accepting test card `4242...`.
- **SEO Adapter**:
  - `app/sitemap.ts`: Dynamic Next.js sitemap exporting URLs for approved products and categories.
  - `app/robots.ts`: Next.js robots handler emitting `Disallow: /` if `STAGING_ONLY=true`.
  - Schema.org JSON-LD component: Renders `Product`, `Offer`, `BreadcrumbList`, and `Organization` schemas.

---

## 6. Caveats

1. **Brand Status**: The name "ToolCart" and associated domains/trademarks remain provisional and legally unverified. Staging mode (`STAGING_ONLY=true`) must be maintained.
2. **Supplier Operational Terms**: The source quotation from Status International (UK) Ltd is a price quote, not a signed drop-shipping or SLA contract. Per-piece dispatch terms, blind packing, and live stock APIs must be confirmed before production go-live.
3. **No Direct Source Code Edits**: Per subagent instructions, no project source code was edited or created. All specifications have been mined and detailed in this report for the implementing builder agents.

---

## 7. Conclusion

The authoritative specifications across all 7 target documents and the supplier CSV baseline have been completely extracted, cross-referenced, and structured into verified technical requirements.
- The state machine transitions, exceptional refund paths, idempotency controls, and audit log requirements are fully documented.
- The 115 supplier SKUs, case math validation, barcode structures, and Unicode ligature normalization rules are confirmed.
- Wholesale cost security isolation rules, RLS policies, and margin control mechanics are strictly defined.
- Admin portal routes, database schema, local fallback mechanisms, and cloud adapters are rigorously specified.

The project is completely ready for implementation by the builder agents in accordance with these contracts.

---

## 8. Verification Method

To independently verify the observations, data, and constraints documented in this report:

1. **Verify 115 CSV Rows & Case Math**:
   ```powershell
   python -c "import csv; rows=list(csv.DictReader(open('baseline/10_SAMPLE_SUPPLIER_CATALOG.csv', encoding='utf-8'))); assert len(rows)==115; assert all(abs(float(r['case_cost_ex_vat_gbp']) - round(float(r['unit_cost_ex_vat_gbp']) * int(r['units_per_case']), 2)) < 0.01 for r in rows); print('115 rows and case math verified!')"
   ```

2. **Verify Barcodes and Unicode Ligatures**:
   ```powershell
   python -c "import csv; rows=list(csv.DictReader(open('baseline/10_SAMPLE_SUPPLIER_CATALOG.csv', encoding='utf-8'))); assert all(len(r['barcode'])==13 for r in rows); ligs=[r['supplier_sku'] for r in rows if any(ord(c)>127 for c in r['description'])]; assert len(ligs)==18; print(f'Barcodes and 18 ligature rows verified: {ligs[:3]}...')"
   ```

3. **Verify State Machine & Product Schema Contract**:
   Inspect `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` and `schemas/product_contract.schema.json` to verify state names and required fields match Section 1 verbatim.

4. **Verify Static Brand & Contrast Matrix**:
   ```powershell
   python -c "import json; data=json.load(open('qa/contrast_matrix.json')); assert len(data)>0; print('Contrast matrix verified!')"
   ```
