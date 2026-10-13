# Milestone 2 Adversarial Challenge Report: Customer Storefront Experience

**Agent**: Challenger 1 (Instance 1)  
**Working Directory**: `e:\ToolCart\.agents\teamwork\challenger_m2_g2_1`  
**Parent Agent**: `224db423-62eb-4a71-824d-116651759989`  
**Project Root**: `e:\ToolCart`  
**Timestamp**: 2026-10-13T06:12:00Z  

---

## 1. Observation

### 1.1 Empirical Command Execution & Verification Results

1. **Brand V3 Static & WCAG Contrast Check**:
   - Command: `python qa/check_static.py`
   - Exit code: `0`
   - Output:
     ```
     PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix
     browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified
     ```

2. **Python Brand Compliance Suite**:
   - Command: `python -m pytest tests/`
   - Exit code: `0`
   - Output: `9 passed in 0.48s` (all 9 brand token and retired colour assertions passing).

3. **TypeScript Typecheck**:
   - Command: `npm run typecheck`
   - Exit code: `0`
   - Output: `tsc --noEmit` exited with 0 errors.

4. **Next.js ESLint**:
   - Command: `npm run lint`
   - Exit code: `1` (FAIL)
   - Verbatim Error:
     ```
     ./src/lib/catalog/importer.ts
     60:3  Error: Definition for rule '@typescript-eslint/no-explicit-any' was not found.  @typescript-eslint/no-explicit-any
     ```

5. **Automated Vitest Test Suite (including Adversarial Stress Harness)**:
   - Command: `npm test`
   - Exit code: `0`
   - Output:
     ```
     Test Files  9 passed (9)
          Tests  105 passed (105)
       Duration  10.26s
     ```
   - Includes 19 newly written adversarial stress tests in `tests/adversarial/m2-storefront-adversarial.test.ts` covering catalog parsing, unicode ligatures, nullable barcodes, wholesale parameter attacks, regex injections, UK synonym queries, multi-supplier carriage splitting, and 50-iteration integer penny VAT fuzzing.

6. **Next.js Production Build**:
   - Command: `npm run build` (default execution in Windows shell)
   - Exit code: `1` (FAIL)
   - Verbatim Error:
     ```
     Error: ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\pages-manifest.json'
         at async open (node:internal/fs/promises:641:25)
         at async Object.readFile (node:internal/fs/promises:1245:14)
         at async readManifest (E:\ToolCart\node_modules\next\dist\build\index.js:165:23)
         at async E:\ToolCart\node_modules\next\dist\build\index.js:1043:35
     ```
   - Empirical Isolation: When executed with worker processes disabled:
     - Command: `$env:NEXT_DISABLE_WORKERS="1"; npm run build`
     - Exit code: `0` (Compiled successfully, all 17 static and dynamic storefront routes generated: `/`, `/search`, `/categories/[slug]`, `/products/[slug]`, `/basket`, `/checkout`, `/account`, `/trade`, etc.).

---

### 1.2 Catalog Ingestion & Edge-Case Findings

1. **Quoted SKUs and Ligatures**:
   - Source CSV: `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` contains exactly 115 product rows.
   - All 115 rows ingest into `PublicProductDTO` with zero unhandled exceptions.
   - Unicode ligatures (`\ufb01` -> `'fi'`, `\ufb02` -> `'fl'`) and diameter symbol (`\u00d8` -> `'Ø'`) are correctly cleaned or preserved.
   - Single-unit bulky ladder `ION3SFLADDER1P1` has an empty carton barcode string in CSV; correctly handled with `carton_barcode: undefined` and fallback spec `'Single Unit Carton (No outer code)'`.

2. **URL Slug Generation Defect (`ionos-ionos-<sku>`)**:
   - File: `src/lib/catalog/products.ts`, line 222:
     ```typescript
     const cleanTitle = normalizedDesc.split(' - ')[0] || normalizedDesc;
     const slug = generateProductSlug(`${brand} ${cleanTitle}`, r.supplier_sku);
     ```
   - In `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`, 23 product rows begin with the supplier brand name `IONOS - ` (e.g. `IONOS - 3 step foldable ladder...`, `IONOS - foam sanding block set...`, `IONOS - rubber mallet...`).
   - For these 23 products, `normalizedDesc.split(' - ')[0]` evaluates to `'IONOS'`. With `brand = 'Ionos'`, `generateProductSlug` is invoked with `'Ionos IONOS'`.
   - Result: URL slugs are generated as `ionos-ionos-ion3sfladder1p1`, `ionos-ionos-ionrmallet1p6`, etc., discarding the descriptive product name from both the URL slug and SEO routing.
   - Similarly, items beginning with length prefix (e.g. `10 Mtr - Status - PVC Electrical Tape`) generate `status-10-mtr-ionpvcmc5pkx6`.

3. **Leading Hyphen in `generateProductSlug` on Empty Title**:
   - File: `src/lib/catalog/unicode.ts`, line 24-31:
     ```typescript
     export function generateProductSlug(title: string, sku: string): string {
       const cleanTitle = normalizeUnicode(title)
         .toLowerCase()
         .replace(/[^a-z0-9]+/g, '-')
         .replace(/^-+|-+$/g, '');
       const cleanSku = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
       return `${cleanTitle}-${cleanSku}`;
     }
     ```
   - When `title` is empty or contains only punctuation, `cleanTitle` is `""`. The returned string is `"-${cleanSku}"` (e.g. `"-ion2"`), generating an invalid leading hyphen.

---

### 1.3 Wholesale Cost Isolation Challenge Results

1. **Public DTO Verification**:
   - Across all 115 `PublicProductDTO` objects in `getAllPublicProducts()`, properties `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, `quoted_cases`, and `quoted_units` are strictly `undefined`.
   - Serialized `JSON.stringify(product)` across all 115 products contains zero occurrences of `"unit_cost"` or `"case_cost"`.

2. **Public API Endpoint Hostile Probing**:
   - Route `/api/store/products` probed with adversarial query parameters:
     - `?include=wholesale`
     - `?fields=unit_cost_ex_vat_gbp,case_cost_ex_vat_gbp`
     - `?debug=true&show_cost=1`
     - `?admin=1&secret=1`
     - `?_getServerWholesaleOffer=true`
     - `?slug=ionos-ionos-ion3sfladder1p1&wholesale=1`
   - All requests returned sanitized public JSON payloads with zero cost leakage.

3. **AI Assistant and Basket Probing**:
   - Route `/api/store/assistant` probed with explicit prompts requesting supplier wholesale costs; recommended products returned exclusively sanitized `PublicProductDTO` objects.
   - Client bundles scanned across `app/(storefront)` and `src/components/storefront`; zero imports or occurrences of `_getServerWholesaleOffer` or wholesale pricing keys found.

---

### 1.4 Search, Filter, Cart & VAT Precision Edge Cases

1. **Search & Lexical Stress**:
   - Empty queries (`""`, whitespace, tabs) return the full 115 catalog items cleanly.
   - Regex meta-characters (`.*`, `[a-z]+`, `\d+`, `??++`, `{1,3}`) and injection strings (`<script>`, `' OR '1'='1`) execute without throwing exceptions.
   - UK synonym matching successfully recovers trade colloquialisms (`rawplugs` -> `IONWPLUGS200P10`, `stepladder` -> `ION3SFLADDER1P1`, `spanners` -> `IONSPANNERS1P10`).
   - Multi-attribute filters with contradictory criteria (e.g. minPrice £100, maxPrice £10) return 0 items cleanly.
   - Sorting by `price_asc`, `price_desc`, and `title_asc` is mathematically verified.

2. **Cart & Split Carriage Rules**:
   - 0 items: subtotal £0.00, carriage £0.00, VAT £0.00, grand total £0.00.
   - Single item under £50 threshold (£10.00 ex VAT): carriage is £4.95 ex VAT (£5.94 inc VAT), grand total is £17.94 inc VAT.
   - Exact boundary: subtotal £50.00 ex VAT triggers `is_free_carriage: true` (£0.00 carriage); subtotal £49.99 ex VAT triggers `is_free_carriage: false` (£4.95 carriage).
   - Multi-supplier split carriage:
     - Supplier A (£30.00 < £50.00 -> £4.95) and Supplier B (£60.00 >= £50.00 -> £0.00) yields total shipping of £4.95 ex VAT.
     - Supplier A (£20.00 < £50.00) and Supplier B (£30.00 < £50.00) yields total shipping of £9.90 ex VAT (£4.95 + £4.95).
   - VAT rounding: Fuzz testing across 50 random pricing combinations confirmed zero floating-point penny drift.

---

## 2. Logic Chain

1. **From Observation 1.1.6 to Build Failure Conclusion**:
   - *Observation*: Default `npm run build` fails with `ENOENT: no such file or directory, open 'E:\ToolCart\.next\server\pages-manifest.json'`. Setting `$env:NEXT_DISABLE_WORKERS="1"` results in exit code 0 and successful generation of all 17 routes.
   - *Logic*: In Next.js 14 on Windows, the parallel webpack compiler workers exhibit an asynchronous file write synchronization race condition with the main build process. Without `NEXT_DISABLE_WORKERS=1` in environment or `next.config.js`, standard developer and CI builds on Windows fail.

2. **From Observation 1.1.4 to Lint Failure Conclusion**:
   - *Observation*: `npm run lint` fails with `Definition for rule '@typescript-eslint/no-explicit-any' was not found` in `src/lib/catalog/importer.ts:60:3`.
   - *Logic*: `.eslintrc.json` is configured with `next/core-web-vitals` and does not register `@typescript-eslint` plugin rules. Placing an explicit disable directive for an unregistered plugin rule causes ESLint to throw a fatal error.

3. **From Observation 1.2.2 to Slug Quality Conclusion**:
   - *Observation*: 23 products in the catalog have slugs like `ionos-ionos-ion3sfladder1p1` because `split(' - ')[0]` matches the brand prefix `'IONOS'`.
   - *Logic*: Naive string splitting on `' - '` without accounting for descriptions formatted as `BRAND - PRODUCT TITLE - ATTRIBUTES` strips the product name and duplicates the brand. This undermines URL readability and SEO keyword value.

4. **From Observation 1.2.3 to Slug Leading Hyphen Conclusion**:
   - *Observation*: `generateProductSlug('', 'ION2')` outputs `'-ion2'`.
   - *Logic*: Concatenating `${cleanTitle}-${cleanSku}` when `cleanTitle` is an empty string creates an illegal leading delimiter.

5. **From Observation 1.3 to Wholesale Isolation Approval**:
   - *Observation*: Exhaustive parameter injection and client bundle scanning revealed zero wholesale cost fields.
   - *Logic*: The server-side isolation boundary in `src/lib/catalog/products.ts` and `PublicProductDTO` is robust and secure against client extraction.

---

## 3. Caveats

- Live Stripe payment charging is intentionally operating in test simulation mode (`pm_card_visa`) in accordance with project governance (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`).
- Multi-supplier delivery was tested with simulated split supplier items, since all 115 sample rows currently originate from a single supplier (`Status International (UK) Ltd`).

---

## 4. Conclusion & Verdict

**Verdict**: `REQUEST_CHANGES`

While the core storefront user experience, Brand V3 compliance, wholesale security isolation, search filtering, and split-carriage VAT arithmetic are well-engineered, the following items must be resolved:

1. **Fix Next.js Build Worker Configuration on Windows**:
   - Configure `package.json` build script or create `next.config.js` to ensure builds run reliably without crashing on Windows worker race conditions (e.g. cross-platform `NEXT_DISABLE_WORKERS=1` or `next.config.js` webpack configuration).
2. **Fix ESLint Rule Definition in `src/lib/catalog/importer.ts`**:
   - Replace `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with standard `// eslint-disable-next-line @typescript-eslint/no-explicit-any` removal or type as `Record<string, string>`.
3. **Fix Catalog Slug Generation for Brand-Prefixed Descriptions**:
   - Update `src/lib/catalog/products.ts` line 222 so that descriptions starting with `IONOS - ` or measurements (e.g. `10 Mtr - `) extract the actual product name (e.g. `3 step foldable ladder`, `foam sanding block set`) rather than generating repetitive `ionos-ionos-<sku>` slugs.
4. **Fix Leading Hyphen in `generateProductSlug` on Empty Title**:
   - In `src/lib/catalog/unicode.ts`, ensure `cleanTitle ? `${cleanTitle}-${cleanSku}` : cleanSku` is used.

---

## 5. Verification Method

To independently verify all findings and test suites:

```powershell
# 1. Run Brand V3 static QA
python qa/check_static.py
# Expected output: PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix

# 2. Run Python Brand compliance test suite
python -m pytest tests/
# Expected output: 9 passed

# 3. Run TypeScript typecheck
npm run typecheck
# Expected output: tsc --noEmit exits with code 0

# 4. Verify ESLint (reproduces lint finding)
npm run lint
# Expected output: Fails at src/lib/catalog/importer.ts:60:3

# 5. Run full Vitest suite (105 tests including adversarial suite)
npm test
# Expected output: 9 test files passed, 105 passed (100%)

# 6. Verify Next.js production build (reproduces Windows worker race condition)
npm run build
# Expected output: Fails with ENOENT pages-manifest.json

# 7. Verify Next.js build with worker mitigation
$env:NEXT_DISABLE_WORKERS="1"; npm run build
# Expected output: Compiled successfully, all 17 routes generated
```
