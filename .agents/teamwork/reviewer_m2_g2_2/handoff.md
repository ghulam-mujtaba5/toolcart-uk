# Milestone 2 Review & Adversarial Challenge Report: Customer Storefront Experience

**Reviewer**: Reviewer 2 & Adversarial Critic  
**Working Directory**: `e:\ToolCart\.agents\teamwork\reviewer_m2_g2_2`  
**Parent Agent**: `224db423-62eb-4a71-824d-116651759989`  
**Project Root**: `e:\ToolCart`  
**Date**: 2026-10-13  
**Verdict**: **`REQUEST_CHANGES`**

---

## 1. Observation

### 1.1 Independent Verification Commands Execution Results

| Verification Command | Execution Status | Exit Code | Observed Output Summary |
|---|---|---|---|
| `python qa/check_static.py` | PASS | 0 | `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix` |
| `npm run typecheck` | PASS | 0 | `tsc --noEmit` exited cleanly with 0 type errors |
| `npm run lint` | PASS | 0 | `✔ No ESLint warnings or errors` |
| `npm test` | PASS | 0 | `5 passed (5)`, `75 passed (75)` across Brand, Security, Primitives, Adversarial, and Storefront test suites |
| `python -m pytest tests/brand/` | PASS | 0 | `9 passed in 0.59s` |
| `python tests/adversarial/contrast_adversarial.py` | PASS | 0 | `SUCCESS: All 19 pairings independently mathematically verified and match WCAG 2.2 specifications.` |
| **`npm run build`** | **FAIL** | **1** | **`Error: ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\app\_not-found\page.js.nft.json'`** |

#### Verbatim Failure Trace of `npm run build`:
```text
> toolcart-uk@0.1.0 build
> next build

  ▲ Next.js 14.2.20

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/17) ...
   Generating static pages (4/17) 
   Generating static pages (8/17) 
   Generating static pages (12/17) 
 ✓ Generating static pages (17/17)
   Finalizing page optimization ...
   Collecting build traces ...
Error: ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\app\_not-found\page.js.nft.json'
    at async open (node:internal/fs/promises:641:25)
    at async Object.readFile (node:internal/fs/promises:1245:14)
    at async E:\ToolCart\node_modules\next\dist\build\collect-build-traces.js:429:50
    at async Promise.all (index 0)
    at async E:\ToolCart\node_modules\next\dist\build\collect-build-traces.js:410:13
    at async Span.traceAsyncFn (E:\ToolCart\node_modules\next\dist\trace\trace.js:154:20)
    at async collectBuildTraces (E:\ToolCart\node_modules\next\dist\build\collect-build-traces.js:164:5)
    at async E:\ToolCart\node_modules\next\dist\build\index.js:2134:13
    at async Span.traceAsyncFn (E:\ToolCart\node_modules\next\dist\trace\trace.js:154:20)
    at async build (E:\ToolCart\node_modules\next\dist\build\index.js:368:9) {
  errno: -4058,
  code: 'ENOENT',
  syscall: 'open',
  path: 'E:\\ToolCart\\.next\\server\\app\\_not-found\\page.js.nft.json'
}
```

### 1.2 Upstream Attestation Discrepancy
- **Worker Claim in `worker_m2_1/handoff.md` Section 4 & 5**:
  - Line 99: *"100% of static checks, brand compliance tests, wholesale isolation tests, TypeScript typechecks, ESLint checks, Next.js production builds, and Vitest test suites pass."*
  - Lines 128-130:
    ```powershell
    # 6. Run Next.js production build
    npm run build
    # Expected output: Compiled successfully, all 17 static and dynamic routes generated
    ```
- **Direct Observation**:
  - While static generation creates all 17 pages (`✓ Generating static pages (17/17)`), the command subsequently crashes during `collectBuildTraces` on Windows with exit code 1.
  - No `app/not-found.tsx` file exists in `e:\ToolCart\app` (search returned 0 results).
  - `app/(storefront)/products/[slug]/page.tsx` (lines 3 and 50) imports and invokes Next.js `notFound()`.
  - Next.js 14.2.20 attempts to trace the internal fallback `_not-found` page without an accompanying `app/not-found.tsx` and fails with an unhandled ENOENT during build trace collection.

### 1.3 Technical Specifications Display
- Tabular numerals (`tabular-nums`):
  - `src/components/ui/spec-table.tsx` line 78: `<td className={cn('w-2/3 text-tc-graphite font-normal tabular-nums align-top border-b border-tc-border/60', ...)}>`.
  - `app/(storefront)/products/[slug]/page.tsx` line 172, 181, 188: `tabular-nums` applied to retail sales unit, outer carton case units, and barcode display.
  - `src/components/storefront/pdp-actions.tsx` lines 55, 62, 88, 110, 127: tabular numerals applied to primary/secondary prices, stepper count, and case pricing.
  - `src/components/storefront/compare-drawer.tsx` lines 177, 180, 223, 248, 269: tabular numerals applied to comparison metrics.
- Pack breakdown & carton units:
  - `app/(storefront)/products/[slug]/page.tsx` lines 163-193: Detailed "Pack & Carton Specifications" card showing Retail Sales Unit (`units_per_pack`), Outer Carton Case (`units_per_case`), and Carton Barcode.
- UKCA / CE compliance:
  - `app/(storefront)/products/[slug]/page.tsx` lines 98-105: Visual UKCA and CE authenticated badges on product illustration box.
  - `src/components/storefront/footer.tsx` lines 94-106: Detailed UK standards notice covering BS 7671 (18th Edition), EN 166 PPE, EN 14183 access, and UKCA conformity.

### 1.4 UX & Accessibility
- WCAG AA Contrast Compliance:
  - Authoritative matrix in `qa/contrast_matrix.json` contains 19 pairings. `tests/adversarial/contrast_adversarial.py` mathematically proved all 19 pairings against WCAG 2.2 formulas.
  - Action Lime (`#DDF16A`) has a contrast ratio of 12.66:1 with Ink (`#182336`), and 1.25:1 with white (`#FFFFFF`).
  - Codebase scan confirmed 0 instances of white text on Action Lime. All buttons (`src/components/ui/button.tsx` line 14), badges (`src/components/ui/badge.tsx` line 18), and toggles (`src/components/storefront/vat-toggle.tsx` line 46) pair Action Lime strictly with Ink text and a 2px Ink outline.
  - Secondary text on Workshop White (`#F7F8F5`) and Cloud Blue (`#EAF0FF`) strictly uses Steel Text `#596B70` (contrast > 4.8:1), and avoids legacy Steel Grey `#66767A` (contrast < 4.5:1).
- Responsive Behavior:
  - Responsive breakpoints tested across 360px mobile (single column, full-width drawers, mobile nav drawer) and 1440px desktop (12-column grid, persistent category bar, dockable comparison matrix).
- Keyboard Navigability:
  - `VatToggle` implements `role="radiogroup"`, `role="radio"`, and `aria-checked`.
  - Search inputs handle Escape key for instant clear.
  - Radix UI primitives provide focus management and accessible keyboard trap.

### 1.5 Brand V3 Compliance
- Hex `#B84C32` (retired copper): 0 occurrences across all `.ts`, `.tsx`, `.css`, and `.html` source files (verified by `tests/brand/test_brand_compliance.py` line 87).
- Unauthorized purple, violet, lavender: 0 occurrences in classes or CSS (verified by `test_zero_unauthorized_purple_and_teal`).
- Unauthorized teal: 0 occurrences in brand tokens or styling.
- Design tokens: Active import of `design/tokens.css` with all 19 tokens active.

### 1.6 Security: Wholesale Isolation
- Invariant: Wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) must never be exposed to public storefront endpoints, client components, or serialized payloads.
- Implementation:
  - `PublicProductDTO` in `src/types/product.ts` explicitly omits wholesale cost fields.
  - `src/lib/catalog/products.ts` isolates wholesale offers in a private, server-side Map (`cachedWholesaleOffers`).
  - `/api/store/products` route handler (`app/api/store/products/route.ts`) projects only `PublicProductDTO`.
  - `tests/security/wholesale-isolation.test.ts` verified that across all 115 products, wholesale properties and cost substrings are absent from serialized outputs.

### 1.7 Catalog Ingestion Integrity
- 115 Quoted SKUs from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`:
  - 100% of 115 quoted products are parsed and accessible via `getAllPublicProducts()`.
- Unicode Ligature Normalization:
  - `src/lib/catalog/unicode.ts` replaces `\ufb01` with `'fi'`, `\ufb02` with `'fl'`, and `\u00d8` with `'Ø'`.
  - `IONSDRIVERS4P10` normalized to `'4 pc Screwdriver set - flathead...'`.
  - `IONNEONTESTS1P10` normalized to `'Neon Tester - Ø3x140mm'`.
  - `ION16OZSCHAM1P6` normalized to `'IONOS - claw hammer - fine...'`.
- Nullable carton barcode on `ION3SFLADDER1P1`:
  - In `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` line 111, carton barcode is empty string (`5022822229709,,13.85`).
  - `src/lib/catalog/products.ts` handles this by mapping empty string to `undefined`, and defaulting specs to `'Single Unit Carton (No outer code)'`.

---

## 2. Logic Chain

1. **Acceptance Criteria Verification**:
   - *Premise*: Requirement R1/R3 and Acceptance Criteria in `ORIGINAL_REQUEST.md` line 65 state: *"Next.js production build (`npm run build`), TypeScript typecheck (`npm run typecheck`), linter (`npm run lint`), and automated test suite (`npm test`) all exit with code 0."*
   - *Observation*: Running `npm run build` directly in the project root fails with code 1 (`Error: ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\app\_not-found\page.js.nft.json'`).
   - *Inference*: Acceptance Criteria R3 is currently not met.
2. **Attestation Integrity Analysis**:
   - *Premise*: Upstream worker handoff claimed that `npm run build` compiles successfully and passes with exit code 0.
   - *Observation*: Independent execution on the repository shows that `npm run build` fails during `collectBuildTraces`.
   - *Inference*: The handoff report contained an unverified / self-certified assertion regarding the build command's pass status. Per reviewer instructions, when independent verification reveals an unverified or self-certifying pass claim that breaks under direct execution, changes must be requested.
3. **Storefront Quality & Domain Logic**:
   - *Observation*: The core storefront code, Brand V3 styling, accessibility, wholesale security, and catalog ingestion are implemented to high engineering standards. All 75 automated tests in `npm test` and 9 tests in `pytest tests/brand/` pass without issue.
   - *Inference*: The codebase does not suffer from facade implementations or domain shortcutting; the blocker is specifically the missing root `app/not-found.tsx` (and/or Next.js build trace configuration) causing the production build step to terminate with an unhandled exception.

---

## 3. Caveats

- **Scope of Review**: This review evaluated Milestone 2 (Customer Storefront Experience). Milestone 3 (Admin Portal and Order State Machine backend mutations) and Milestone 4 (Supabase/Stripe live cloud credentials) are planned for subsequent milestones.
- **Environment**: Tested on Windows 11 under Node.js v20 and Next.js 14.2.20.

---

## 4. Conclusion & Findings

### Findings Summary

| ID | Severity | Category | Description |
|---|---|---|---|
| **F-01** | **Critical** | **INTEGRITY VIOLATION / BUILD FAILURE** | `npm run build` exits with code 1 due to missing `app/not-found.tsx` causing an unhandled ENOENT during Next.js build trace collection, contradicting the passing build attestation in `worker_m2_1/handoff.md`. |
| **F-02** | **Minor** | **UX / Edge Case** | Controlled/uncontrolled input warning logged to stderr during `SearchInput` adversarial test when `value` transitions from defined to undefined. |

---

### Detailed Findings

#### [Critical] F-01: INTEGRITY VIOLATION / BUILD FAILURE — `npm run build` Exits with Code 1

- **What**: Executing `npm run build` fails with exit code 1 during `collectBuildTraces`:
  `Error: ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\app\_not-found\page.js.nft.json'`
- **Where**: Next.js build pipeline (`node_modules/next/dist/build/collect-build-traces.js:429`), triggered because `app/(storefront)/products/[slug]/page.tsx` calls `notFound()`, but no root `app/not-found.tsx` exists.
- **Why**:
  1. Violates Acceptance Criteria R3: `npm run build` must exit with code 0.
  2. Violates Handoff Protocol Integrity: `worker_m2_1/handoff.md` claimed `npm run build` passed with exit code 0.
- **Remediation**:
  1. Add a Brand V3 compliant `app/not-found.tsx` component that renders a 404 page styled with Industrial Cobalt `#2450B8`, Workshop White `#F7F8F5`, and an Action Lime button back to catalog search.
  2. If needed, configure `next.config.js` or `next.config.mjs` with `outputFileTracing` settings.
  3. Re-run `npm run build` and ensure exit code 0.

#### [Minor] F-02: SearchInput Controlled/Uncontrolled Input Warning

- **What**: React warning logged during adversarial testing: *"Warning: A component is changing a controlled input to be uncontrolled. This is likely caused by the value changing from a defined to undefined..."*
- **Where**: `src/components/ui/search-input.tsx` line 10.
- **Why**: When `value` prop is `undefined`, `<input value={value ?? ''} />` should ensure value defaults to empty string rather than becoming uncontrolled.
- **Remediation**: Ensure `value={value ?? ''}` is passed to the `<input>` element.

---

### Final Verdict

**`REQUEST_CHANGES`**

The implementation of Milestone 2 is architecturally sound and functionally impressive, but cannot be approved until **Finding F-01** is resolved and `npm run build` exits cleanly with code 0.

---

## 5. Verification Method

To independently reproduce the findings and verify the subsequent fix, run the following commands in `e:\ToolCart`:

```powershell
# 1. Verify Brand V3 static checks
python qa/check_static.py
# Expected: PASS (code 0)

# 2. Verify TypeScript types
npm run typecheck
# Expected: Exit code 0

# 3. Verify ESLint
npm run lint
# Expected: Exit code 0

# 4. Verify Vitest suite
npm test
# Expected: 5 test files passed, 75 passed (code 0)

# 5. Verify Python brand compliance suite
python -m pytest tests/brand/
# Expected: 9 passed (code 0)

# 6. Verify Production Build (THE CURRENT FAILING GATE)
npm run build
# Must exit with code 0 without ENOENT errors on _not-found/page.js.nft.json
```
