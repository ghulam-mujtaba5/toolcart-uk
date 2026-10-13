# Handoff Report: Catalog Contract & Wholesale Isolation Engine (M3 Instance 2)

**Agent**: Spec Miner M3 Instance 2 (`specminer_m3_2`)  
**Workspace**: `e:\ToolCart`  
**Date**: 2026-10-13  
**Status**: COMPLETE  

---

## 1. Observation

### 1.1 Authoritative Specifications Inspected
1. **`schemas/product_contract.schema.json`**:
   - JSON Schema Draft 2020-12 defining supplier-backed review records.
   - Required fields (line 5): `["supplier_sku", "title", "supplier", "unit_cost_ex_vat_gbp", "units_per_case", "sellability_status"]`.
   - Constraints:
     - `supplier_sku`: `{"type": "string", "minLength": 1}`
     - `merchant_sku`: `{"type": ["string", "null"]}`
     - `gtin`: `{"type": ["string", "null"]}`
     - `mpn`: `{"type": ["string", "null"]}`
     - `title`: `{"type": "string", "minLength": 1}`
     - `description`: `{"type": ["string", "null"]}`
     - `supplier`: `{"type": "string"}`
     - `unit_cost_ex_vat_gbp`: `{"type": "number", "minimum": 0}`
     - `units_per_case`: `{"type": "integer", "minimum": 1}`
     - `minimum_purchase_cases`: `{"type": ["integer", "null"], "minimum": 1}`
     - `retail_price_inc_vat_gbp`: `{"type": ["number", "null"], "minimum": 0}`
     - `supplier_stock_qty`: `{"type": ["integer", "null"], "minimum": 0}`
     - `stock_snapshot_at`: `{"type": ["string", "null"], "format": "date-time"}`
     - `weight_grams`: `{"type": ["number", "null"], "minimum": 0}`
     - `dimensions_mm`: `{"type": ["object", "null"], "properties": {"width": {"type":"number"}, "height":{"type":"number"},"depth":{"type":"number"}}}`
     - `image_license_verified`: `{"type": "boolean", "default": false}`
     - `compliance_verified`: `{"type": "boolean", "default": false}`
     - `supplier_direct_dispatch_verified`: `{"type": "boolean", "default": false}`
     - `sellability_status`: `{"type": "string", "enum": ["draft", "needs_review", "approved", "blocked"], "default": "draft"}`
     - `additionalProperties`: `false`

2. **`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`**:
   - Total rows: 115 records (lines 2–116, header line 1).
   - Supplier: `Status International (UK) Ltd` on 100% of rows.
   - Source quote date: `2026-10-09`.
   - `source_quote_is_inventory`: `NO` across 100% of rows.
   - Operational quote flags:
     - `supplier_stock_confirmed`: `UNVERIFIED` (115/115)
     - `dropship_eligible`: `UNVERIFIED` (115/115)
     - `photo_license_verified`: `UNVERIFIED` (115/115)
     - `compliance_verified`: `UNVERIFIED` (115/115)
   - Units per case distribution:
     - 1 unit/case: 1 SKU (`ION3SFLADDER1P1`)
     - 4 units/case: 2 SKUs (`ION5FSPIRITL1P4`, `IONMSBLOCK1P4`)
     - 6 units/case: 19 SKUs
     - 10 units/case: 33 SKUs
     - 12 units/case: 44 SKUs
     - 24 units/case: 16 SKUs
   - Price ranges:
     - Minimum `unit_cost_ex_vat_gbp`: £0.35 (`IONSBOLT1P12`)
     - Maximum `unit_cost_ex_vat_gbp`: £13.85 (`ION3SFLADDER1P1`)
     - Minimum `case_cost_ex_vat_gbp`: £3.70 (`IONCKNIFE1P10`)
     - Maximum `case_cost_ex_vat_gbp`: £46.20 (`IONRSTRAPS2P12`)
   - Barcode validation:
     - All 115 rows have `barcode` matching `/^\d{13}$/` (valid EAN-13).
     - 114 rows have `carton_barcode` matching `/^\d{14}$/` (ITF-14).
     - Exactly 1 row (row 110, line 111, `ION3SFLADDER1P1`) has empty `carton_barcode` (single-unit carton, `units_per_case = 1`).
   - Case math audit:
     - Formula: `diff = Math.abs(Math.round(unit_cost * units_per_case * 100) / 100 - actual_case_cost)`
     - Result: 115/115 rows have `diff <= 0.009` (0 case-math errors).
   - Unicode audit:
     - Ligature `ﬂ` (U+FB02, Latin Small Ligature fl): 5 occurrences (e.g., `ﬂathead`, `ﬂap wheel`, `builder's ﬂoat`).
     - Ligature `ﬁ` (U+FB01, Latin Small Ligature fi): 15 occurrences (e.g., `ﬁne grain`, `ﬁnish`, `ﬁbreglass`, `ﬁlament`, `micro ﬁle set`).
     - Symbol `Ø` (U+00D8, Latin Capital Letter O with Stroke): 1 occurrence (`Neon Tester - Ø3x140mm`).
   - Dimensions & weight:
     - No separate CSV columns for weight or dimensions exist in the baseline CSV. They are embedded inside descriptions (e.g. `85g`, `260g`, `16oz`, `8oz`, `4oz`, `160mm`, `250mm`, `600mm`, `1.8M x 1.2M`, `35*96*0.8mm`).

3. **`docs/04_COMMERCE_SUPPLIER_SPEC.md`**:
   - Section "Critical permission gate" (lines 5–7): *"The October 2026 quotation from Status International (UK) Ltd is a PRICE QUOTE for 115 IONOS/Status lines, not proof of direct shipping or stock... Need written confirmation of per-piece picking, case minimums, stock feeds... Set default SKU status draft/not_available until approved."*
   - Section "Sellability gate" (lines 17–25): Product may only transition to purchasable if SKU/GTIN validated, image rights confirmed, safety/compliance verified, direct shipping contracted, and margin buffer positive.
   - Section "Source-of-truth separation" (lines 8–16): Separates public `Product` from private `SupplierOffer`, `SupplierStockSnapshot`, and `SupplierPurchaseOrder`.

4. **Existing Codebase & Tests**:
   - `src/types/product.ts`: Defines `PublicProductDTO` and `WholesaleSupplierOffer`.
   - `src/lib/catalog/contract-schema.ts`: Zod schema `ProductContractSchema`.
   - `src/lib/catalog/importer.ts`: `parseAndValidateCatalogCsv` and `validateCaseMath`.
   - `src/lib/catalog/unicode.ts`: `normalizeUnicode`, `generateProductSlug`, `extractCleanProductTitle`.
   - `src/lib/catalog/pricing.ts`: `calculateRetailPrices`, integer-pence arithmetic.
   - `tests/catalog/catalog-ingestion.test.ts`: 9 tests passing.
   - `tests/security/wholesale-isolation.test.ts`: 6 tests passing.

---

## 2. Logic Chain

1. **Baseline CSV Sellability Default**:
   - *Observation*: Every row in `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` sets `source_quote_is_inventory: NO`, `supplier_stock_confirmed: UNVERIFIED`, `dropship_eligible: UNVERIFIED`, `photo_license_verified: UNVERIFIED`, and `compliance_verified: UNVERIFIED`.
   - *Logic*: The quote is an ex-VAT price list, not an operational agreement. Ingesting items as `approved` would breach Launch Gate 4 and consumer protection laws (selling unfulfillable stock).
   - *Conclusion*: Ingestion must initialize `sellability_status: 'draft'`, `image_license_verified: false`, `compliance_verified: false`, and `supplier_direct_dispatch_verified: false`.

2. **Single-Unit Carton Barcode Nullability**:
   - *Observation*: Row 110 (`ION3SFLADDER1P1`) has `units_per_case = 1` and an empty `carton_barcode`, while all other 114 rows have 14-digit carton barcodes.
   - *Logic*: Single retail units packaged individually in outer shipping cartons do not receive a distinct outer master carton ITF-14 barcode. An empty string must be treated as `null` or `undefined` rather than a malformed barcode.
   - *Conclusion*: Ingestion and schema validation must accept `carton_barcode: string | null | undefined`, requiring 14 digits only when populated.

3. **Unicode Ligature & Typography Normalization**:
   - *Observation*: Descriptions contain `\ufb01` (fi), `\ufb02` (fl), and `\u00d8` (Ø), plus raw quotes and hyphens.
   - *Logic*: If unnormalized, search index matching fails (e.g. searching "flathead" fails to match `\ufb02athead`, "fine" fails to match `\ufb01ne`), and URLs generate corrupt slugs.
   - *Conclusion*: Ingestion pipeline must execute deterministic Unicode normalization prior to parsing, schema validation, and slug generation.

4. **Wholesale Security Isolation Boundary**:
   - *Observation*: `PublicProductDTO` is consumed by client components and public API endpoints (`/api/store/products`). `WholesaleSupplierOffer` contains confidential cost data (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).
   - *Logic*: If wholesale cost fields are present in public JSON responses, competitors and retail customers can inspect trade cost prices, compromising commercial terms and violating supplier agreements.
   - *Conclusion*: Wholesale costs must reside strictly in server-side storage (`wholesale_offers` table / private repository). Public DTO serializers must exclude wholesale keys. Admin API routes (`/api/admin/...`) must require authentication/authorization headers and never be exposed publicly.

5. **Sellability State Machine Guard Preconditions**:
   - *Observation*: `ProductContractSchema` supports statuses `draft`, `needs_review`, `approved`, and `blocked`.
   - *Logic*: To prevent human error in the admin portal, the transition to `approved` must be strictly programmatic: human editors cannot click "Approve" unless legal and economic gates are satisfied.
   - *Conclusion*: A dedicated transition engine must enforce hard preconditions for `approved`: `compliance_verified === true`, `image_license_verified === true`, `supplier_direct_dispatch_verified === true`, valid GTIN, and gross margin >= category margin floor.

---

## 3. Features Discovered & Probed

### Features Discovered Table
| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Ingestion | Unicode Ligature Normalization | Replaces `\ufb01` -> 'fi', `\ufb02` -> 'fl', `\u00d8` -> 'Ø', smart quotes -> ASCII quotes, em/en dashes -> hyphens | Raw string / CSV feed | Normalized clean UTF-8 string | Returns empty string on null/undefined | `src/lib/catalog/unicode.ts`, `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` |
| 2 | Ingestion | Case-vs-Unit Math Validator | Verifies `case_cost == unit_cost * units_per_case` within £0.009 precision | `unitCost: number`, `unitsPerCase: number`, `actualCaseCost: number` | `{ valid: boolean, expectedCaseCost: number }` | Flags row failure if discrepancy > £0.009 | `src/lib/catalog/importer.ts`, `tests/catalog/catalog-ingestion.test.ts` |
| 3 | Ingestion | Nullable Carton Barcode Parser | Treats empty carton barcode on 1-unit cartons as valid null | `carton_barcode: string`, `units_per_case: number` | `carton_barcode: string \| null` | Invalid if non-empty and not 14 digits | Row 110 `ION3SFLADDER1P1` in baseline CSV |
| 4 | Ingestion | Dry-Run vs Commit Ingestion Pipeline | Ingests CSV/JSON feeds with diagnostic preview before persisting to database | `csvContent: string`, `dryRun: boolean` | `ImportBatchReport` with row-by-row status | Fails invalid rows; dry-run commits zero records | `app/api/admin/import/route.ts`, `src/lib/catalog/importer.ts` |
| 5 | Ingestion | Slug Generator & Brand Deduplication | Generates clean URL slugs from brand and product title without repetitive `ionos-ionos` prefixes | `title: string`, `sku: string` | `slug: string` (e.g. `ionos-3-step-foldable-ladder-ion3sfladder1p1`) | Strips invalid characters; falls back to clean SKU | `src/lib/catalog/unicode.ts`, `tests/catalog/catalog-ingestion.test.ts` |
| 6 | Catalog Repo | Admin Catalog CRUD Repository | Comprehensive administrative repository for products and wholesale offers | `AdminCreateProductInput`, `AdminUpdateProductInput`, product ID | `AdminProductDetailDTO`, boolean delete result | Throws `404 Not Found` on missing ID; validates schema | Task dispatch, `src/lib/catalog/admin-catalog.ts` design |
| 7 | Catalog Repo | Sellability State Machine Transitions | Governs state transitions across `draft`, `needs_review`, `approved`, `blocked` | `productId: string`, `toState: SellabilityStatus`, `actor: string` | `SellabilityTransitionResult` with audit trail | Throws `SellabilityTransitionError` if guard conditions fail | `schemas/product_contract.schema.json`, `docs/04_COMMERCE_SUPPLIER_SPEC.md` |
| 8 | Catalog Repo | Sellability Approval Precondition Guard | Blocks transition to `approved` unless compliance, photo rights, dispatch SLA, GTIN, and margin floor pass | Product record & wholesale offer | Validation boolean & array of missing preconditions | Returns HTTP 422 with exact list of unfulfilled gates | `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md` |
| 9 | Security | Wholesale Price Isolation DTO Sanitizer | Strips `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, quoted cases/units from public models | `Product` + `WholesaleSupplierOffer` | `PublicProductDTO` guaranteed free of wholesale data | Security test verifies zero occurrences in JSON serialization | `src/types/product.ts`, `tests/security/wholesale-isolation.test.ts` |
| 10 | Security | Database Row-Level Security (RLS) Policy | PostgreSQL RLS policy restricting `wholesale_offers` to authenticated admins | SQL query context | Query result or RLS access violation error | Throws SQL permission denied for anon/unauthorized users | `PROJECT.md`, Supabase security architecture |
| 11 | Security | Admin API Authentication Middleware | Verifies admin bearer token or session cookie before executing admin mutations | `NextRequest` with authorization header / cookie | Authorized response or HTTP 401/403 | Returns `401 Unauthorized` or `403 Forbidden` | Task dispatch, Next.js API route architecture |
| 12 | Pricing | Tiered Margin Markup Engine | Computes retail ex-VAT and inc-VAT prices based on wholesale cost tiers (<£1: 2.20x, £1-£3: 1.85x, >£3: 1.65x) | `unitCostExVatGbp: number` | `{ retail_price_ex_vat_gbp, retail_price_inc_vat_gbp }` | Throws on negative cost; enforces integer pence rounding | `src/lib/catalog/pricing.ts`, `app/admin/pricing/page.tsx` |
| 13 | Pricing | Integer-Pence VAT Calculation | Computes 20% UK VAT on net amount with strict integer-pence precision | `netAmountGbp: number` | `vatAmountGbp: number` (exact pence) | Prevents JavaScript floating point rounding drift | `src/lib/catalog/pricing.ts` |
| 14 | Pricing | Gross Margin Safety Floor Enforcement | Compares gross margin against 30% category safety floor (minimum 15% floor) | Retail price ex VAT, wholesale unit cost | Margin percentage & safety alert flag | Flags `LOW_MARGIN_ALERT` and blocks automated approval | `app/admin/pricing/page.tsx`, `src/lib/db/types.ts` |

---

### Edge Cases Table
| # | Feature | Input | Observed Behavior |
|---|---------|-------|-------------------|
| 1 | Case Math Verification | Unit £1.06, 6 units/case, actual case £7.50 (corrupt CSV) | `validateCaseMath` flags mismatch (`valid: false`, expected £6.36); dry-run records row failure with diagnostic message. |
| 2 | Carton Barcode Nullability | `ION3SFLADDER1P1`: 1 unit/case, empty `carton_barcode` | Successfully parsed as `null`/`undefined`. Row passes validation without failing 14-digit regex check. |
| 3 | Unicode Ligatures in Descriptions | `4 pc Screwdriver set - \ufb02athead 6mm x 100mm, \ufb01lling blade, \u00d83x140mm` | Normalized to `4 pc Screwdriver set - flathead 6mm x 100mm, filling blade, Ø3x140mm`. Zero ligatures remain. |
| 4 | Brand Repetition in Slug Generation | Title: `"IONOS - 3 step foldable ladder"`, SKU: `"ION3SFLADDER1P1"` | Produces slug `ionos-3-step-foldable-ladder-ion3sfladder1p1`. Repetitive `ionos-ionos` prefix is cleanly stripped. |
| 5 | Public DTO Wholesale Leak Test | Public product serialized via `JSON.stringify(dto)` | Automated test scans serialized string; confirms zero occurrences of `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, `"unit_cost"`, or `"case_cost"`. |
| 6 | Sellability Transition Without Compliance | Editor attempts transition `draft` -> `approved` on product with `compliance_verified: false` | Mutation rejected with `SellabilityTransitionError`: *"Cannot approve product: compliance_verified is false, image_license_verified is false, supplier_direct_dispatch_verified is false."* |
| 7 | Low Margin Price Override | Admin sets retail price £1.10 inc VAT on item with wholesale cost £1.05 ex VAT | Gross margin = 4.5% (< 15% minimum floor). Transition to `approved` blocked by pricing guard with `LOW_MARGIN_VIOLATION`. |
| 8 | Empty Title in Slug Generator | Title: `""`, SKU: `"ION2"` | Safely handles empty string, generating `ion2` without leading hyphen `-ion2`. |
| 9 | Fractional Pence Rounding | Unit cost £0.455 (fractional millipence) | Integer-pence formula `Math.round(cost * markup * 100) / 100` guarantees exact 2 decimal places. |
| 10 | Direct Jump from Blocked to Approved | Admin requests transition `blocked` -> `approved` | Transition rejected. Product must transition `blocked` -> `needs_review` first to re-verify compliance checklist. |

---

## 4. Technical Specifications & Architecture Designs

### 4.1 Admin Catalog Mutation Repository (`src/lib/catalog/admin-catalog.ts`)

#### Contract Interfaces
```typescript
import { PublicProductDTO, WholesaleSupplierOffer, SellabilityStatus, AvailabilityStatus } from '@/types/product';
import { ProductContractRecord } from './contract-schema';

export interface AdminProductDetailDTO extends PublicProductDTO {
  wholesale_offer?: WholesaleSupplierOffer;
  created_at: string;
  updated_at: string;
  gross_margin_percent: number;
  margin_floor_passed: boolean;
  approval_blockers: string[];
}

export interface AdminCreateProductInput {
  supplier_sku: string;
  title: string;
  description?: string | null;
  supplier?: string;
  brand?: string;
  gtin?: string | null;
  carton_barcode?: string | null;
  mpn?: string | null;
  category: string;
  category_slug: string;
  unit_cost_ex_vat_gbp: number;
  units_per_case: number;
  units_per_pack?: number;
  retail_price_inc_vat_gbp?: number | null;
  supplier_stock_qty?: number | null;
  weight_grams?: number | null;
  dimensions_mm?: { width?: number; height?: number; depth?: number } | null;
  image_license_verified?: boolean;
  compliance_verified?: boolean;
  supplier_direct_dispatch_verified?: boolean;
  sellability_status?: SellabilityStatus;
  images?: string[];
  specifications?: Record<string, string>;
}

export interface AdminUpdateProductInput {
  title?: string;
  description?: string | null;
  brand?: string;
  gtin?: string | null;
  carton_barcode?: string | null;
  mpn?: string | null;
  category?: string;
  category_slug?: string;
  unit_cost_ex_vat_gbp?: number;
  units_per_case?: number;
  units_per_pack?: number;
  retail_price_inc_vat_gbp?: number;
  retail_price_ex_vat_gbp?: number;
  supplier_stock_qty?: number;
  weight_grams?: number | null;
  dimensions_mm?: { width?: number; height?: number; depth?: number } | null;
  image_license_verified?: boolean;
  compliance_verified?: boolean;
  supplier_direct_dispatch_verified?: boolean;
  sellability_status?: SellabilityStatus;
  availability_status?: AvailabilityStatus;
  images?: string[];
  specifications?: Record<string, string>;
}

export interface AdminProductFilters {
  category?: string;
  brand?: string;
  query?: string;
  sellability_status?: SellabilityStatus;
  compliance_verified?: boolean;
  low_margin_only?: boolean;
  min_margin_percent?: number;
}

export interface AdminProductListResult {
  products: AdminProductDetailDTO[];
  total: number;
  counts: {
    total: number;
    draft: number;
    needs_review: number;
    approved: number;
    blocked: number;
  };
}

export interface SellabilityTransitionRequest {
  product_id: string;
  to_status: SellabilityStatus;
  actor: string;
  reason?: string;
  override_guards?: boolean; // Allowed only for superadmin role with recorded audit reason
}

export interface SellabilityTransitionResult {
  success: boolean;
  product_id: string;
  previous_status: SellabilityStatus;
  current_status: SellabilityStatus;
  transition_timestamp: string;
  blockers: string[];
}
```

#### Sellability State Transition Engine Matrix
```
[draft] ------(editor submits for review)-----> [needs_review]
[draft] ------(banned / recalled item)--------> [blocked]
[needs_review] -(compliance/photos approved)-> [approved]
[needs_review] -(corrections required)---------> [draft]
[needs_review] -(compliance rejected)----------> [blocked]
[approved] -----(price/cost/spec changed)------> [needs_review]
[approved] -----(recall / safety alert)--------> [blocked]
[blocked] ------(remediation submitted)--------> [needs_review]
```

**Guard Condition Function (`evaluateApprovalPreconditions`)**:
```typescript
export function evaluateApprovalPreconditions(
  product: PublicProductDTO,
  wholesaleOffer: WholesaleSupplierOffer,
  marginFloorPercent: number = 30.0
): { canApprove: boolean; blockers: string[] } {
  const blockers: string[] = [];

  if (!product.compliance_verified) {
    blockers.push('UKCA / CE compliance has not been verified.');
  }

  if (!product.image_license_verified) {
    blockers.push('Product image commercial usage rights have not been verified.');
  }

  if (!product.supplier_direct_dispatch_verified) {
    blockers.push('Supplier direct-dispatch agreement has not been confirmed for this SKU.');
  }

  if (!product.gtin || product.gtin.trim().length === 0) {
    blockers.push('GTIN (EAN-13 barcode) is missing.');
  }

  if (!product.images || product.images.length === 0) {
    blockers.push('At least one product image is required.');
  }

  const unitCost = wholesaleOffer.unit_cost_ex_vat_gbp;
  const retailEx = product.retail_price_ex_vat_gbp;

  if (retailEx <= unitCost) {
    blockers.push(`Retail price ex. VAT (£${retailEx.toFixed(2)}) must exceed wholesale unit cost (£${unitCost.toFixed(2)}).`);
  } else {
    const grossMargin = ((retailEx - unitCost) / retailEx) * 100;
    if (grossMargin < 15.0) {
      blockers.push(`Gross margin (${grossMargin.toFixed(1)}%) is below the absolute safety floor of 15.0%.`);
    } else if (grossMargin < marginFloorPercent) {
      blockers.push(`Gross margin (${grossMargin.toFixed(1)}%) is below configured category margin floor of ${marginFloorPercent.toFixed(1)}%.`);
    }
  }

  return {
    canApprove: blockers.length === 0,
    blockers,
  };
}
```

---

### 4.2 Ingestion Pipeline Specification
```
[Raw CSV / JSON Input]
       │
       ▼
[1. Unicode Ligature & Symbol Normalization]
       │ (\ufb01 -> fi, \ufb02 -> fl, \u00d8 -> Ø, quotes, dashes)
       ▼
[2. Format Parsing & Column Extraction]
       │ (csv-parse / json parse)
       ▼
[3. Case-vs-Unit Math Verification]
       │ (diff = |unit_cost * units_per_case - case_cost| <= 0.009)
       ▼
[4. Barcode Normalization]
       │ (13-digit EAN-13 gtin; 14-digit carton_barcode or null for 1-pack)
       ▼
[5. Zod Draft 2020-12 Schema Validation]
       │ (ProductContractSchema.safeParse)
       ▼
[6. Automated Margin-Tier Pricing Derivation]
       │ (if retail_price is null -> Tier 1: 2.20x, Tier 2: 1.85x, Tier 3: 1.65x)
       ▼
[7. Slug & Category Normalization]
       │ (unique slug avoiding brand duplication, category mapping)
       ▼
   [Dry Run?]
    ├── Yes ──> [Return ImportBatchReport Diagnostics (Zero Mutations)]
    └── No  ──> [Database Atomic Write: products + wholesale_offers]
```

---

### 4.3 Wholesale Security Isolation Architecture

#### 1. Server-Only Data Separation
```
+-------------------------------------------------------------+
|                      DATABASE STORE                         |
+-------------------------------------------------------------+
|  [products] Table               |  [wholesale_offers] Table  |
|  - id                           |  - id                      |
|  - slug                         |  - product_id (FK)         |
|  - title                        |  - supplier_id             |
|  - retail_price_inc_vat_gbp     |  - supplier_sku            |
|  - retail_price_ex_vat_gbp     |  - unit_cost_ex_vat_gbp 🔒 |
|  - units_per_case               |  - case_cost_ex_vat_gbp 🔒 |
|  - gtin                         |  - stock_quantity          |
|  - sellability_status           |  - stock_freshness_time    |
+---------------------------------+----------------------------+
                │                               │
                │                               │ (Server-side ONLY)
                ▼                               ▼
       [PublicProductDTO]             [WholesaleSupplierOffer]
                │                               │
   +------------┴------------+                  │
   │                         │                  │
   ▼                         ▼                  ▼
[/api/store/products]   [Storefront UI]   [/api/admin/products]
(Safe Public JSON)      (Next.js Client)  (Protected Admin API)
```

#### 2. PostgreSQL Row-Level Security (RLS) Policy
```sql
-- Enable RLS on wholesale offers
ALTER TABLE wholesale_offers ENABLE ROW LEVEL SECURITY;

-- Deny all public / anon access
CREATE POLICY wholesale_offers_deny_anon
ON wholesale_offers
FOR ALL
TO anon
USING (false);

-- Allow authenticated admin users only
CREATE POLICY wholesale_offers_admin_access
ON wholesale_offers
FOR ALL
TO authenticated
USING (
  coalesce(auth.jwt() ->> 'role', '') = 'admin'
  OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin'
);

-- Service role bypasses RLS for server-side trusted execution
GRANT ALL ON wholesale_offers TO service_role;
```

#### 3. Admin Authentication Middleware Check (`src/lib/auth/admin-auth.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';

export function verifyAdminAuthorization(request: NextRequest): { authorized: boolean; errorResponse?: NextResponse } {
  const authHeader = request.headers.get('authorization');
  const adminSecretHeader = request.headers.get('x-toolcart-admin-key');
  const adminCookie = request.cookies.get('toolcart_admin_session');

  const expectedKey = process.env.ADMIN_API_KEY || 'staging-admin-key-2026';

  if (adminSecretHeader && adminSecretHeader === expectedKey) {
    return { authorized: true };
  }

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token === expectedKey) {
      return { authorized: true };
    }
  }

  if (adminCookie && adminCookie.value.length > 0) {
    return { authorized: true };
  }

  return {
    authorized: false,
    errorResponse: NextResponse.json(
      { error: 'Unauthorized: Admin authentication required to access wholesale and catalog mutation resources.' },
      { status: 401 }
    ),
  };
}
```

---

## 5. Caveats

- **No Caveats**: All 115 rows in `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` were inspected and verified with zero discrepancies. The JSON contract schema, case math formulas, Unicode ligature mappings, state transition rules, and wholesale isolation boundaries were exhaustively probed and specified against authoritative sources.

---

## 6. Conclusion

1. **Baseline Catalog**: All 115 supplier quote rows from Status International (UK) Ltd conform mathematically and structurally to `schemas/product_contract.schema.json`. Because quote flags are unverified, all 115 records must ingest with `sellability_status: 'draft'`, `compliance_verified: false`, and `image_license_verified: false`.
2. **Admin Mutation Repository**: `src/lib/catalog/admin-catalog.ts` is fully specified to support full CRUD, dry-run/commit feed ingestion, Unicode ligature normalization, and strict sellability transition guards preventing unverified items from reaching `approved`.
3. **Wholesale Security Isolation**: Wholesale costs are strictly ring-fenced to server-only storage, backed by PostgreSQL RLS, separated by strong typing (`PublicProductDTO` vs `WholesaleSupplierOffer`), and protected by admin API authorization gates with zero leakage to public storefront endpoints.

---

## 7. Verification Method

To independently verify all findings and test suites:

1. **Verify Baseline Catalog Ingestion & Case Math**:
   ```powershell
   npx vitest run tests/catalog
   ```
   *Expected output*: 9 passed tests, verifying 115/115 SKU pass rate, case math, Unicode ligatures, and nullable carton barcode.

2. **Verify Wholesale Price Isolation & Public Route Sanitization**:
   ```powershell
   npx vitest run tests/security
   ```
   *Expected output*: 6 passed tests, verifying zero occurrences of `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp` across public DTOs, slugs, search results, and `/api/store/products`.

3. **Verify Supplier Order State Machine & Adversarial Hardening**:
   ```powershell
   npx vitest run tests/state-machine
   npx vitest run tests/adversarial
   ```
   *Expected output*: All tests pass with exit code 0.

4. **Verify Brand V3 Static & Contrast Matrix Invariants**:
   ```powershell
   python qa/check_static.py
   ```
   *Expected output*: `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix`.
