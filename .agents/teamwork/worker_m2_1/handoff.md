# Milestone 2 Implementation Handoff Report: Customer Storefront Experience

**Worker**: Worker M2 (Instance 1)  
**Working Directory**: `e:\ToolCart\.agents\teamwork\worker_m2_1`  
**Parent Agent**: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`  
**Project Root**: `e:\ToolCart`  
**Date**: 2026-10-12  

---

## 1. Observation

### 1.1 Ingestion & Normalization of Baseline Supplier Catalog
- Quoted Supplier Catalog File: `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`
  - Total records: Exactly 115 quoted product rows (excluding header) from supplier `"Status International (UK) Ltd"`.
  - Quoted SKU prefix: All 115 items start with `ION` (e.g. `IONPVCMC5PKX6`, `ION3SFLADDER1P1`, `IONWPLUGS200P10`).
  - Barcode fields: All rows contain 13-digit EAN-13 GTINs; 114 rows contain 14-digit carton barcodes; exactly 1 row (`ION3SFLADDER1P1` 3-Step Ladder) has an empty carton barcode string because it is sold as a single bulky carton unit (`units_per_case: 1`).
  - Unicode Ligatures observed in source CSV:
    - `\ufb01` (`ﬁ` Latin Small Ligature FI): 15 occurrences (e.g. `ﬁne` in `ION16OZSCHAM1P6`, `IONA4SPAPER10P10`).
    - `\ufb02` (`ﬂ` Latin Small Ligature FL): 5 occurrences (e.g. `ﬂathead` in `IONSDRIVERS4P10`, `IONPSDRIVERS6P10`).
    - `\u00d8` (`Ø` Latin Capital Letter O with Stroke / Diameter): 1 occurrence in `IONNEONTESTS1P10` (`Neon Tester - Ø3x140mm`).
  - Ingestion Normalization: Implemented `src/lib/catalog/unicode.ts` mapping `\ufb01` -> `'fi'`, `\ufb02` -> `'fl'`, `\u00d8` -> `'Ø'`. Tested and confirmed 100% clean string outputs.

### 1.2 Wholesale Cost Security Isolation
- CSV Wholesale Costs: `unit_cost_ex_vat_gbp` ranges from £0.35 to £13.85; `case_cost_ex_vat_gbp` ranges from £4.20 to £31.38.
- Security Invariant: `PublicProductDTO` in `src/types/product.ts` and `src/lib/catalog/products.ts` projects public retail prices only:
  - Wholesale cost < £1.00: 2.20x markup (e.g. £0.64 cost -> £1.41 ex. VAT / £1.69 inc. VAT).
  - Wholesale cost £1.00 – £3.00: 1.85x markup (e.g. £1.06 cost -> £1.96 ex. VAT / £2.35 inc. VAT).
  - Wholesale cost > £3.00: 1.65x markup (e.g. £13.85 cost -> £22.85 ex. VAT / £27.42 inc. VAT).
- Security Test: `tests/security/wholesale-isolation.test.ts` verified that across all 115 products, `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, and wholesale substrings are completely absent from public DTOs, serialized JSON, and `/api/store/products` HTTP responses.

### 1.3 State Management & Contexts
- `src/context/vat-context.tsx`: Provides `useVAT()`, persistent cookie `toolcart_vat_mode` (`inc` vs `ex`), dual price formatting (`formatPriceDisplay`), and SSR hydration safety via `initialMode` from `cookies().get('toolcart_vat_mode')`.
- `src/context/cart-context.tsx`: Provides `useCart()`, multi-supplier delivery grouping (`SupplierDeliveryGroup`), carriage rules (£4.95 ex. VAT per supplier dispatch; FREE carriage on group subtotal >= £50.00 ex. VAT), and integer-pence precision UK 20% VAT math (`calculateCartSummary`).
- `src/context/compare-context.tsx`: Provides `useCompare()`, side-by-side comparison matrix for up to 4 products with difference highlighting and 1-click basket addition.

### 1.4 Storefront Component & Page Architecture
- Components in `src/components/storefront/`:
  - `Header`: Manrope wordmark, Action Lime badge with Ink cart icon, search bar with live autocomplete flyout, mini-basket trigger, mobile nav drawer.
  - `Microbar`: Top staging disclaimer + utility microbar with `VatToggle` and trade link.
  - `NavBar`: Cobalt `#2450B8` navigation bar with category links.
  - `Footer`: Ink `#182336` 5-column layout with UK standards, advice, and compliance notices.
  - `ProductCard`: Pack breakdown, dual VAT display, honest stock badge, Add to Basket, Compare toggle.
  - `FilterSidebar` & `SearchFilterChips`: Multi-attribute faceted filtering by category, brand, price, and stock status.
  - `CompareDrawer`: Sticky dockable bottom drawer with side-by-side comparison table.
  - `MiniBasket`: Slide-over drawer with multi-supplier shipping grouping.
  - `AIAssistantDrawer`: Styled in Cloud Blue `#EAF0FF` + Cobalt `#2450B8` + Ink text, grounded in catalog tools with strict safety warnings.
  - `ProjectKitCard`: Interactive checklist with custom item selection and bundle discount calculation.
  - `OrderTimelineStepper`: Full visual stepper and interactive simulator covering all 13 states from `SUPPLIER_ORDER_STATE_MACHINE.md`.
- Pages in `app/(storefront)/`:
  - `/`: Two-column hero, Customer Promise card, 6-category grid, featured products, project kits, buying guides.
  - `/search`: Lexical search with zero-results UK synonym recovery (e.g. `rawplugs` -> `wall plugs`).
  - `/categories/[slug]` and shortcuts (`/tools`, `/fixings`, `/decorating`, `/measuring`, `/ppe`, `/site-equipment`).
  - `/products/[slug]`: Spec sheet with `tabular-nums`, pack & carton breakdown card, related products.
  - `/projects`: 3 job-ready project kits with 1-click bundle add.
  - `/guides`, `/guides/[slug]`: 5 authoritative UK buying guides referencing BS EN standards.
  - `/basket`: Full basket page with multi-supplier delivery breakdown.
  - `/checkout`: Guest flow with UK postcode regex validation and Stripe test mode simulation.
  - `/trade`: B2B trade account registration form.
  - `/account`, `/account/orders/[id]`: Account overview and order fulfillment state tracking.

---

## 2. Logic Chain

1. **Catalog Integrity & Normalization**:
   - *Observation*: Source CSV contains typography ligatures (`\ufb01`, `\ufb02`, `\u00d8`) that caused encoding issues in Windows environments.
   - *Logic*: Ingesting raw strings through `normalizeUnicode` before CSV parsing guarantees consistent, human-readable titles across all platforms.
2. **Wholesale Price Isolation**:
   - *Observation*: Project rules forbid leaking wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) in client bundles or public APIs.
   - *Logic*: All 115 supplier rows are parsed into private server-side records. Public APIs and client components receive exclusively `PublicProductDTO` where wholesale fields are omitted at the type and object level.
3. **UK VAT Math & Hydration Safety**:
   - *Observation*: UK hardware customers switch between DIY (Inc. VAT) and Trade (Ex. VAT). SSR mismatches cause layout shift if VAT state is only in client memory.
   - *Logic*: `VatProvider` reads the initial mode from `toolcart_vat_mode` cookie in `app/(storefront)/layout.tsx` during server render, matching the client state upon mount. All calculations use integer-pence arithmetic to eliminate floating-point drift.
4. **Multi-Supplier Delivery Grouping**:
   - *Observation*: In a supplier-backed model, products may ship from distinct vendor distribution hubs with distinct freight fees and lead times.
   - *Logic*: `CartSummary` partitions line items by `supplier_id`, computing carriage (£4.95 ex. VAT) and free delivery thresholds (£50.00 ex. VAT) per supplier group.
5. **State Machine Conformance**:
   - *Observation*: `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` mandates 13 states including happy path and failure/cancellation branches.
   - *Logic*: `OrderTimelineStepper` visually represents the fulfillment lifecycle, and provides an interactive simulator to verify state transitions and append-only audit logging.

---

## 3. Caveats

- **External Live Services**: Per project launch gates (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`), Stripe operates in test simulation mode (`pm_card_visa`), and live payments are gated.
- **Product Photography**: Status International product images use Brand V3 vector SVG illustrations and structured category artwork pending live Cloudflare R2 bucket activation.
- No other caveats.

---

## 4. Conclusion

Milestone 2 (Customer Storefront Experience) is complete and fully functional:
- All 115 products from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` are seeded with normalized Unicode ligatures.
- Wholesale costs are isolated strictly to server-side structures.
- All contexts (`VatContext`, `CartContext`, `CompareContext`) are implemented and tested.
- All storefront components and pages render cleanly with zero errors.
- 100% of static checks, brand compliance tests, wholesale isolation tests, TypeScript typechecks, ESLint checks, Next.js production builds, and Vitest test suites pass.

---

## 5. Verification Method

To independently verify the implementation, execute the following commands in `e:\ToolCart`:

```powershell
# 1. Run Brand V3 static QA and WCAG AA contrast check
python qa/check_static.py
# Expected output: PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix

# 2. Run Python Brand compliance test suite
python -m pytest tests/brand/
# Expected output: 9 passed

# 3. Run TypeScript typecheck
npm run typecheck
# Expected output: Exit code 0 (no type errors)

# 4. Run Next.js ESLint
npm run lint
# Expected output: No ESLint warnings or errors

# 5. Run full Vitest test suite (Brand, UI primitives, Wholesale security, Storefront integration)
npm test
# Expected output: 5 test files passed, 75 passed (100%)

# 6. Run Next.js production build
npm run build
# Expected output: Compiled successfully, all 17 static and dynamic routes generated
```
