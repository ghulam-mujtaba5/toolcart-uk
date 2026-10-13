# Milestone 5 Phase 2: Tier 5 Adversarial Coverage Hardening Report

**Agent:** Challenger M5 (`teamwork_preview_challenger`)  
**Roles:** Critic, Empirical Challenger  
**Date:** 2026-10-13  
**Working Directory:** `e:\ToolCart\.agents\teamwork\challenger_m5_1`  
**Parent Conversation ID:** `311a2f36-0bc9-4d2c-ad1b-812679b4333e`  
**Target Milestone:** Milestone 5 (Adversarial Coverage Hardening - Tier 5)  

---

## 1. Observation

All findings are based on white-box source code inspection and verified empirically through the dedicated test suite `tests/adversarial/tier5-adversarial-hardening.test.ts` (28 automated tests) and existing project quality suites:

### 1. Challenge 1: Stripe Webhook Mock Signature Bypass
- **File:** `app/api/webhooks/stripe/route.ts:16-23`
- **Code Quote:**
  ```typescript
  // Handle mock signature / simulation mode in dev and tests
  if (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock')) {
    try {
      event = JSON.parse(rawBody) as Stripe.Event;
    } catch {
      return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
  ```
- **Direct Observation:** There is zero check for `process.env.NODE_ENV !== 'production'` or `process.env.STAGING_ONLY === 'true'`. In `tests/adversarial/tier5-adversarial-hardening.test.ts`, when `process.env.NODE_ENV = 'production'` is simulated and a POST request is issued with `headers: { 'stripe-signature': 'mock_signature' }`, the endpoint returns HTTP 200 `{ received: true, event_type: "payment_intent.succeeded" }`, successfully bypassing Stripe signature verification.

### 2. Challenge 2: Local Storage Fallback Path Traversal
- **File:** `src/lib/adapters/storage.ts:55, 78-79, 134`
- **Code Quote:**
  ```typescript
  // Line 55:
  const sanitizedKey = key.replace(/^\/+/, '');
  ...
  // Line 78-79:
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  const targetPath = path.join(uploadDir, sanitizedKey);
  ...
  // Line 134:
  const targetPath = path.join(process.cwd(), 'public', 'uploads', sanitizedKey);
  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
  }
  ```
- **Direct Observation:** `key.replace(/^\/+/, '')` only removes leading forward slashes. Supplying traversal sequences such as `../../dangerous.txt` yields `sanitizedKey = '../../dangerous.txt'`. `path.resolve(path.join(uploadDir, sanitizedKey))` resolves to `path.resolve(process.cwd(), 'dangerous.txt')`, escaping the `public/uploads` directory. Furthermore, `deleteFile` lacks any boundary assertion (e.g. `targetPath.startsWith(uploadDir)`).

### 3. Challenge 3: Supabase RLS Policies for Orders & Wholesale Data
- **File:** `supabase/migrations/20261013000002_rls_policies.sql:75, 95-97, 119-121, 167`
- **Wholesale Isolation Observation (PASS):**
  Lines 75, 167:
  ```sql
  REVOKE ALL ON wholesale_offers FROM anon, authenticated;
  REVOKE ALL ON pricing_rules FROM anon, authenticated;
  ```
  Lines 78-82, 169-173: Exclusive access granted only `TO service_role`.
- **Order Injection Vulnerability Observation (GAP):**
  Lines 95-97:
  ```sql
  CREATE POLICY "Public create checkout orders"
      ON orders FOR INSERT
      WITH CHECK (true);
  ```
  Lines 119-121:
  ```sql
  CREATE POLICY "Public insert order items"
      ON order_items FOR INSERT
      WITH CHECK (true);
  ```
  Direct observation: Both policies use unconstrained `WITH CHECK (true)`. Anonymous clients can directly invoke PostgREST (`POST /rest/v1/orders`) with arbitrary states (e.g. `state: 'payment_captured'`) and insert line items with arbitrary prices. (Note: UPDATE and DELETE remain restricted as no public policies exist for them).

### 4. Challenge 4: Dynamic XML Sitemap Duplicate URL Detection
- **File:** `app/sitemap.ts:25-29, 80-86`
- **Code Quote:**
  ```typescript
  // Static Routes:
  {
    url: `${baseUrl}/projects`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
  },
  ...
  // Curated Project Kits:
  const kits = getStaticProjectKits();
  const kitRoutes: MetadataRoute.Sitemap = kits.map((kit) => ({
    url: `${baseUrl}/projects`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));
  ```
- **Direct Observation:** Invoking `await sitemap()` generates 4 duplicate entries for `https://toolcart.co.uk/projects` (1 from `staticRoutes` and 3 from `kitRoutes`). Kit slugs are not appended to kit route URLs.

### 5. Challenge 5: Storefront Product Detail Page JSON-LD Audit
- **File:** `app/(storefront)/products/[slug]/page.tsx`
- **Direct Observation:** White-box search for `ProductJsonLd` in `app/(storefront)/products/[slug]/page.tsx` reveals 0 occurrences. `<ProductJsonLd product={product} />` is defined in `src/components/seo/json-ld.tsx` but is unmounted in the PDP tree.

### 6. Challenge 6: Deep Wholesale Cost Security Scan (PASS)
- **Files:** `src/types/product.ts`, `src/lib/catalog/products.ts`, `app/api/store/products/route.ts`, `app/(storefront)/`, `src/components/storefront/`
- **Direct Observation:**
  - `PublicProductDTO` defines zero wholesale cost properties.
  - All 115 products returned by `getAllPublicProducts()` have `unit_cost_ex_vat_gbp === undefined` and `case_cost_ex_vat_gbp === undefined`.
  - Serialized search results (`searchProducts('tape')`) and `/api/store/products` JSON bodies contain zero occurrences of `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp`.
  - Storefront components and pages have zero references to wholesale fields.

### 7. Challenge 7: Brand V3 Strictness & Color Invariant Scan (PASS)
- **Files:** `design/tokens.css`, `design/tokens.json`, `app/globals.css`, `src/lib/adapters/email.ts`, `src/components/`
- **Direct Observation:**
  - Zero retired copper (`#B84C32`, `--tc-copper`) across all project files.
  - Zero unauthorized Tailwind classes (`bg-purple-`, `text-teal-`, etc.) or inline hex styles.
  - Zero white text on Action Lime (`#DDF16A`).
  - All 4 Resend email templates strictly use Ink `#182336`, Cobalt `#2450B8`, Action Lime `#DDF16A` (with Ink text), and Steel Text `#596B70` on pale surfaces.
  - WCAG 2.2 AA contrast ratios verified:
    - White on Action Lime: 1.25:1 (FAIL WCAG AA < 4.5).
    - Ink on Action Lime: 12.66:1 (PASS WCAG AA >= 4.5).
    - Steel Text on Workshop White: 4.68:1 (PASS WCAG AA >= 4.5).
    - Steel Grey on Workshop White: 4.44:1 (FAIL WCAG AA < 4.5).

### 8. Automated Test Execution Commands & Outputs
- `npx vitest run tests/adversarial/tier5-adversarial-hardening.test.ts`:
  ```
  Test Files  1 passed (1)
       Tests  28 passed (28)
    Duration  5.67s
  Exit code: 0
  ```
- `npm test`:
  ```
  Test Files  18 passed (18)
       Tests  426 passed (426)
    Duration  24.56s
  Exit code: 0
  ```
- `python qa/check_static.py`:
  ```
  PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix
  Exit code: 0
  ```
- `python -m pytest tests/brand/`:
  ```
  collected 9 items
  tests\brand\test_brand_compliance.py .........                           [100%]
  ============================== 9 passed in 0.60s ==============================
  Exit code: 0
  ```
- `npm run typecheck`:
  ```
  > tsc --noEmit
  Exit code: 0 (0 errors)
  ```
- `npm run lint`:
  ```
  > next lint
  ✔ No ESLint warnings or errors
  Exit code: 0
  ```

---

## 2. Logic Chain

1. **Stripe Webhook Bypass Vulnerability (Challenge 1)**:
   - *Observation*: `route.ts:17` checks `signature === 'mock_signature'` without inspecting `NODE_ENV`.
   - *Logic*: In any deployment where `STRIPE_WEBHOOK_SECRET` is set, an attacker who supplies `stripe-signature: mock_signature` satisfies the `if` condition before Stripe's cryptographic verification (`stripe.webhooks.constructEvent`) is ever called. The attacker's payload is parsed directly, triggering order state machine transitions (`supplier_order_pending`) without actual financial authorization.
   - *Conclusion*: Critical vulnerability when deployed outside staging/mock test harnesses.

2. **Directory Traversal Vulnerability (Challenge 2)**:
   - *Observation*: `storage.ts:55` strips only leading slashes with `key.replace(/^\/+/, '')`.
   - *Logic*: The string `../../dangerous.txt` does not begin with `/`, so `replace(/^\/+/, '')` leaves it unchanged. When combined with `path.join(process.cwd(), 'public', 'uploads', sanitizedKey)`, Node's `path.join` resolves `..` upward into the project root directory. Both `fs.writeFileSync` (in `uploadFile`) and `fs.unlinkSync` (in `deleteFile`) will read, write, or delete outside `public/uploads`.
   - *Conclusion*: CWE-22 Path Traversal vulnerability in local fallback mode.

3. **Supabase RLS Orders INSERT Permissiveness (Challenge 3)**:
   - *Observation*: `20261013000002_rls_policies.sql:95, 119` grants INSERT on `orders` and `order_items` with `WITH CHECK (true)`.
   - *Logic*: PostgREST evaluates PostgreSQL RLS policies directly for incoming REST calls using the public anonymous JWT. Because `WITH CHECK (true)` is unconditional, an anonymous caller can insert an order record with `state = 'payment_captured'` or order items with fraudulent pennies, bypassing the Next.js server-side state machine.
   - *Conclusion*: RLS policy for orders is overly permissive for public anonymous access.

4. **Sitemap Kit URL Redundancy (Challenge 4)**:
   - *Observation*: `app/sitemap.ts` maps `kits.map((kit) => ({ url: `${baseUrl}/projects`, ... }))`.
   - *Logic*: `staticRoutes` already defines `${baseUrl}/projects`. Each of the 3 kits is mapped to the identical URL `${baseUrl}/projects`. The resulting sitemap contains 4 identical `<loc>https://toolcart.co.uk/projects</loc>` elements.
   - *Conclusion*: Non-fatal SEO duplication issue.

5. **Missing PDP JSON-LD Structured Data (Challenge 5)**:
   - *Observation*: `app/(storefront)/products/[slug]/page.tsx` contains 0 imports or mounts of `ProductJsonLd`.
   - *Logic*: While `ProductJsonLd` is tested in isolation, Next.js server component rendering of `/products/[slug]` will not output the Schema.org Product structured data script tag to the DOM.
   - *Conclusion*: Missing integration of structured data on product detail pages.

6. **Wholesale Isolation Invariant (Challenge 6)**:
   - *Observation*: Automated scan across 115 products, public DTOs, store API routes, and storefront source code found 0 occurrences of wholesale cost properties.
   - *Logic*: Wholesale costs are strictly encapsulated in server-side maps and database schemas, fulfilling the security mandate in `docs/01_BUSINESS_AND_SUPPLIER_MODEL.md` and `AGENTS.md`.
   - *Conclusion*: Invariant verified and robust.

7. **Brand V3 Color Invariants (Challenge 7)**:
   - *Observation*: Automated scanners across CSS, templates, components, and pages found 0 occurrences of copper `#B84C32`, purple, or teal, and 0 white-on-lime pairings.
   - *Logic*: Mathematical contrast validation proves Action Lime cannot support white text (1.25:1 < 4.5:1), and all actionable controls strictly use Ink `#182336`.
   - *Conclusion*: Invariant verified and 100% compliant.

---

## 3. Caveats

1. **Review-Only Constraint Followed**:
   In strict accordance with the Challenger role constraints ("Review-only — do NOT modify implementation code. Report failures as findings — do NOT fix them yourself"), zero modifications were made to `app/api/webhooks/stripe/route.ts`, `src/lib/adapters/storage.ts`, `supabase/migrations/`, `app/sitemap.ts`, or `app/(storefront)/products/[slug]/page.tsx`. Only the adversarial test suite `tests/adversarial/tier5-adversarial-hardening.test.ts` was authored.
2. **Local Environment Simulation**:
   Supabase PostgreSQL RLS was audited against the migration SQL file (`20261013000002_rls_policies.sql`). Live cloud Supabase execution was simulated via the local memory DB engine.
3. **Cloud Adapter Gating**:
   Stripe and Cloudflare R2 adapters operated in local test/mock modes as mandated by `STAGING_ONLY=true`.

---

## 4. Conclusion & Prioritized Challenges

**Overall Assessment:** The platform has achieved exceptional coverage with 426 passing tests across 18 test suites and 100% Brand V3 compliance. However, white-box adversarial analysis has uncovered critical security and architectural gaps that must be remediated prior to production release.

### Prioritized Challenge Findings

#### [Critical / Security] Challenge 1: Stripe Webhook Mock Signature Bypass in Production
- **Location:** `app/api/webhooks/stripe/route.ts:16-23`
- **Assumption Challenged:** That mock signature handling is restricted to dev/test environments.
- **Attack Scenario:** External caller sends POST with header `stripe-signature: mock_signature` and forged `payment_intent.succeeded` JSON body to `/api/webhooks/stripe`. The route accepts the payload without Stripe cryptographic verification.
- **Blast Radius:** Critical financial risk; unauthorized state machine advancement to `supplier_order_pending`.
- **Recommended Mitigation:**
  ```typescript
  const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.STAGING_ONLY === 'true';
  if (isDevOrTest && (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock'))) {
    ...
  }
  ```

#### [High / Security] Challenge 2: Directory Traversal in Local Storage Fallback
- **Location:** `src/lib/adapters/storage.ts:55, 78-79, 134`
- **Assumption Challenged:** That `key.replace(/^\/+/, '')` prevents path traversal.
- **Attack Scenario:** Caller supplies `../../target.ext` as asset key. `path.join(uploadDir, sanitizedKey)` resolves outside `public/uploads`, allowing arbitrary file write or deletion.
- **Blast Radius:** High risk of arbitrary file overwrite or deletion on server filesystem.
- **Recommended Mitigation:**
  ```typescript
  const normalizedKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
  const targetPath = path.resolve(uploadDir, normalizedKey);
  if (!targetPath.startsWith(uploadDir)) {
    throw new Error('Invalid path traversal asset key');
  }
  ```

#### [Medium / Security] Challenge 3: Overly Permissive Anonymous RLS Insert on Orders
- **Location:** `supabase/migrations/20261013000002_rls_policies.sql:95-97, 119-121`
- **Assumption Challenged:** That anonymous checkout requires unconstrained `WITH CHECK (true)`.
- **Attack Scenario:** Attacker calls Supabase PostgREST directly (`POST /rest/v1/orders`) using public anon key, inserting order with `state: 'dispatched'` or forged item prices.
- **Blast Radius:** Order state tampering and database integrity violation.
- **Recommended Mitigation:**
  Constrain anonymous insert policy:
  ```sql
  CREATE POLICY "Public create checkout orders"
      ON orders FOR INSERT
      WITH CHECK (state = 'cart_pending');
  ```
  Or revoke anonymous INSERT completely and handle order creation strictly server-side via `service_role`.

#### [Low / Quality] Challenge 4: Duplicate URLs in Dynamic Sitemap for Project Kits
- **Location:** `app/sitemap.ts:80-86`
- **Assumption Challenged:** That each item in `kitRoutes` points to a distinct URL.
- **Attack Scenario:** Googlebot / search crawlers find 4 duplicate entries for `${baseUrl}/projects`.
- **Blast Radius:** Minor SEO deduplication / crawl budget warning.
- **Recommended Mitigation:**
  Map kit routes to `${baseUrl}/projects?kit=${kit.slug}` or deduplicate the URLs array.

#### [Medium / SEO] Challenge 5: Missing ProductJsonLd Mount on Storefront PDP
- **Location:** `app/(storefront)/products/[slug]/page.tsx`
- **Assumption Challenged:** That Schema.org structured data is active on product detail pages.
- **Attack Scenario:** Search engines crawl PDP pages but do not find Schema.org Product structured data tags.
- **Blast Radius:** Loss of rich search snippets (pricing, availability, GTIN-13) in search results.
- **Recommended Mitigation:**
  Mount `<ProductJsonLd product={product} />` in `app/(storefront)/products/[slug]/page.tsx`.

---

## 5. Verification Method

To independently verify all findings and test suites:

1. **Run Tier 5 Adversarial Hardening Suite (28 tests)**:
   ```powershell
   npx vitest run tests/adversarial/tier5-adversarial-hardening.test.ts
   ```
   *Expected Result:* 28 passed (28), duration ~5s, exit code 0.

2. **Run Full Test Suite (18 test suites, 426 tests)**:
   ```powershell
   npm test
   ```
   *Expected Result:* 18 test files passed, 426 tests passed, exit code 0.

3. **Run Static QA & Brand Compliance**:
   ```powershell
   python qa/check_static.py
   python -m pytest tests/brand/
   ```
   *Expected Result:* Static checks PASS; 9 pytest tests pass, exit code 0.

4. **Run TypeScript & ESLint Checks**:
   ```powershell
   npm run typecheck
   npm run lint
   ```
   *Expected Result:* 0 TypeScript errors, 0 ESLint warnings, exit code 0.
