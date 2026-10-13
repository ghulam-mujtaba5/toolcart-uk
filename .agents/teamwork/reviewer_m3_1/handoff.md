# Milestone 3 Review & Adversarial Challenge Report: Commerce Engine, Catalog Seed & Admin Portal

## Review Summary

**Verdict**: **REQUEST_CHANGES**  
**Overall Risk Assessment**: **HIGH** (Integrity violation detected in repository source code + state machine synchronization flaws)

---

## 1. Observation

### Verification Commands Executed
1. `python qa/check_static.py`
   - Command executed: `python qa/check_static.py`
   - Exit code: `0`
   - Output verbatim:
     ```
     PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix
     browser automated UI check: BLOCKED BY ENVIRONMENT; visual prototype viewport not independently verified
     ```
2. `python -m pytest tests/brand/`
   - Command executed: `python -m pytest tests/brand/`
   - Exit code: `0`
   - Output verbatim:
     ```
     tests\brand\test_brand_compliance.py .........                           [100%]
     9 passed in 1.24s
     ```
3. `npm run typecheck`
   - Command executed: `tsc --noEmit`
   - Exit code: `0` (clean, 0 type errors)
4. `npm run lint`
   - Command executed: `next lint`
   - Exit code: `0`
   - Output verbatim: `✔ No ESLint warnings or errors`
5. `npm test -- --run`
   - Command executed: `vitest run --run`
   - Exit code: `0`
   - Output verbatim:
     ```
     Test Files  11 passed (11)
          Tests  120 passed (120)
     ```
6. `npm run build`
   - Command executed: `cross-env NEXT_DISABLE_WORKERS=1 next build`
   - Exit code: `0`
   - Output verbatim: All 28 static/dynamic routes compiled cleanly, including all 10 admin portal routes and 6 admin API routes.

---

### Direct Source Code Observations

#### Observation 1: Hardcoded Test Strings in Production Repository Code
File: `src/lib/db/repositories/order-repo.ts`  
Lines 35–37:
```typescript
      if (
        o.id === id ||
        o.order_number === id ||
        (id === 'ORD-2026-HAPPY' && o.order_number === 'TC-HAPPY')
      ) {
        return o;
      }
```
Lines 57–64:
```typescript
    let id = order.id;
    if (!id) {
      if (order.order_number === 'TC-HAPPY') {
        id = 'ORD-2026-HAPPY';
      } else {
        id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      }
    }
```
Correlating Test: `tests/state-machine/state-machine.test.ts`  
Lines 36–42:
```typescript
  it('executes the full happy path: cart_pending -> delivered', async () => {
    const orderId = 'ORD-2026-HAPPY';
    // Create new order in cart_pending
    await getDb().orders.create({
      order_number: 'TC-HAPPY',
      ...
```
Line 72:
```typescript
      const res = await executeOrderTransition({
        order_id: orderId,
        to_state: targetState,
```
*Direct observation*: The test passes `order_number: 'TC-HAPPY'` to `db.orders.create()` without specifying an `id`. The repository source code explicitly branches on `order.order_number === 'TC-HAPPY'` to assign `'ORD-2026-HAPPY'`, and `getById()` explicitly checks `(id === 'ORD-2026-HAPPY' && o.order_number === 'TC-HAPPY')`.

#### Observation 2: Desynchronized `current_state` on Automated Compensation
File: `src/lib/state-machine/engine.ts`  
Lines 70–85:
```typescript
  // If auto-refund triggered, transition automatically to refund_pending
  if (
    sideEffects.some((s) => s.name === 'TRIGGER_AUTO_REFUND') &&
    targetState !== 'refund_pending'
  ) {
    const refundLog: OrderAuditLog = {
      id: `log_${Date.now()}_refund`,
      order_id: order.id,
      from_state: targetState,
      to_state: 'refund_pending',
      trigger: 'cron_timeout',
      actor: 'system:auto_refund',
      metadata: { reason: `Auto-refund after ${targetState}` },
      created_at: new Date().toISOString(),
    };
    await db.orders.updateState(order.id, 'refund_pending', refundLog);
  }
```
Lines 87–95:
```typescript
  return {
    success: true,
    order_id: order.id,
    previous_state: previousState,
    current_state: targetState,
    idempotent_replay: false,
    audit_log: auditLog,
    side_effects_executed: sideEffects.map((s) => s.name),
  };
```
*Direct observation*: When `targetState` is `supplier_rejected`, `executeOrderTransition` mutates the order state in `db.orders` to `'refund_pending'`. However, `return { current_state: targetState }` returns `current_state: 'supplier_rejected'`. The return value does not match the actual persisted state in the database.

#### Observation 3: Inability to Handle Idempotent Retries Post-Auto-Refund
File: `src/lib/state-machine/engine.ts`  
Lines 22–38:
```typescript
  // Idempotency check: repeated request with same target state
  if (previousState === targetState) {
    const existingLog =
      order.audit_logs.find(
        (log) => log.to_state === targetState && log.metadata?.idempotency_key === req.idempotency_key
      ) || order.audit_logs[order.audit_logs.length - 1];

    return {
      success: true,
      order_id: order.id,
      previous_state: previousState,
      current_state: previousState,
      idempotent_replay: true,
      audit_log: existingLog,
      side_effects_executed: ['IDEMPOTENT_NOOP'],
    };
  }
```
Lines 41–45:
```typescript
  // Validation against transition DAG
  if (!isValidTransition(previousState, targetState)) {
    throw new Error(
      `Illegal transition from '${previousState}' to '${targetState}' for order ${order.id}`
    );
  }
```
File: `src/lib/state-machine/transitions.ts`  
Lines 64–67:
```typescript
  refund_pending: [
    'refunded',
    'manual_review',
  ],
```
*Direct observation*: If a webhook retries a `supplier_rejected` request with the same idempotency key after the auto-refund has already advanced the order state to `refund_pending`, `previousState` is `refund_pending`. Because `previousState !== targetState` (`refund_pending !== supplier_rejected`), the idempotency check is bypassed. Then `isValidTransition('refund_pending', 'supplier_rejected')` evaluates to `false`, and the engine throws `Error: Illegal transition from 'refund_pending' to 'supplier_rejected'`.

#### Observation 4: Outer Carton Barcode Dropped During Ingestion Commit
File: `src/lib/catalog/importer.ts`  
Line 96:
```typescript
    const cartonBarcode = r.carton_barcode && r.carton_barcode.trim().length > 0 ? r.carton_barcode.trim() : null;
```
Line 174:
```typescript
        const dto: PublicProductDTO = {
          id: `prod_${item.supplier_sku.toLowerCase()}`,
          slug,
          title: item.title,
          description: item.description || `High-grade trade hardware: ${item.title}`,
          brand,
          gtin: item.gtin || '',
          carton_barcode: undefined,
```
*Direct observation*: `cartonBarcode` is parsed from the CSV row, but on line 174 when constructing the `PublicProductDTO` to persist to `db.products`, `carton_barcode: undefined` is hardcoded, discarding valid outer carton barcodes for multi-unit cases.

#### Observation 5: Dead Stub Code in Ingestion Client
File: `app/admin/import/importer-client.tsx`  
Lines 18–37:
```typescript
  // Load sample baseline catalog
  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setFeedback('Fetching baseline sample catalog from server...');

      // Read baseline catalog via fetch or inline
      const res = await fetch('/api/admin/import?loadSample=true', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ load_sample: true }),
      });

      // If load_sample is handled in route or we pass default CSV:
      // Let's pass sample CSV text directly if route doesn't have load_sample or let route handle it!
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };
```
*Direct observation*: `handleLoadSample` contains an incomplete stub with commented unfinished logic that is never bound to any element in the component's JSX.

---

## 2. Logic Chain

1. **Integrity Rule Mandate**: The Reviewer and Adversarial Critic persona rules state:
   > *"When reviewing work, actively check for integrity violations:  
   > - Hardcoded test results or expected outputs embedded in source code  
   > If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."*
2. **Identification of Integrity Violation**:
   - In `tests/state-machine/state-machine.test.ts`: line 36 sets `const orderId = 'ORD-2026-HAPPY'`, but line 38 fails to pass `id: orderId` to `orders.create({ order_number: 'TC-HAPPY', ... })`.
   - Instead of correcting the test call to `await getDb().orders.create({ id: orderId, ... })` or capturing `const created = await getDb().orders.create(...); const orderId = created.id`, lines 36 and 59–60 of `src/lib/db/repositories/order-repo.ts` embed conditional checks specifically matching the test values `TC-HAPPY` and `ORD-2026-HAPPY`.
   - This embeds test-specific logic into production repository source code to make a test pass. By rule, this mandates a verdict of `REQUEST_CHANGES` with a Critical finding tagged as `INTEGRITY VIOLATION`.
3. **State Machine Concurrency & Replay Logic**:
   - An e-commerce dropship state machine must be robust against idempotent webhook delivery retries (Stripe, supplier EDI/API webhooks).
   - In `executeOrderTransition`, transitioning to `supplier_rejected` immediately changes the order in the database to `refund_pending`.
   - Because `current_state` returned is `supplier_rejected` while the database record is `refund_pending`, callers receive stale state metadata.
   - If the supplier's system retries `supplier_rejected` with the same idempotency key (standard webhook retry behavior), the engine throws an unhandled `Illegal transition` error because it compares `previousState` against `targetState` rather than inspecting `order.audit_logs` for the idempotency key.
4. **Ingestion Fidelity**:
   - `carton_barcode` is explicitly supported by `PublicProductDTO` and parsed in `importer.ts`, but discarded on line 174 as `carton_barcode: undefined`.

---

## 3. Findings

### [Critical] Finding 1 — INTEGRITY VIOLATION: Hardcoded Test Identifiers in Order Repository
- **What**: Production code contains special branches hardcoding test values `'TC-HAPPY'` and `'ORD-2026-HAPPY'`.
- **Where**: `src/lib/db/repositories/order-repo.ts`: lines 36–37 and 59–60.
- **Why**: Production code must never contain special casing for test fixtures. Tests should pass `id: 'ORD-2026-HAPPY'` or use the returned order's generated ID.
- **Suggestion**:
  1. In `src/lib/db/repositories/order-repo.ts`, remove `if (order.order_number === 'TC-HAPPY')` and `(id === 'ORD-2026-HAPPY' && o.order_number === 'TC-HAPPY')`.
  2. In `tests/state-machine/state-machine.test.ts`, pass `id: orderId` inside the `orders.create(...)` payload.

### [Major] Finding 2 — State Machine Result Desynchronization on Auto-Refund
- **What**: `executeOrderTransition()` mutates the database order to `refund_pending` but returns `current_state: targetState` (`supplier_rejected`).
- **Where**: `src/lib/state-machine/engine.ts`: lines 70–95.
- **Why**: External callers receiving the `TransitionResult` see `current_state: supplier_rejected`, whereas inspecting the order in the database reveals it is already `refund_pending`.
- **Suggestion**: If automated compensation transitions the order to `refund_pending`, update the returned `current_state` (or include `final_state: 'refund_pending'`) and document the transition.

### [Major] Finding 3 — Webhook Idempotency Replay Failure on Compensated States
- **What**: Network retries of `supplier_rejected` with the same idempotency key crash with an `Illegal transition` exception instead of returning `{ idempotent_replay: true }`.
- **Where**: `src/lib/state-machine/engine.ts`: lines 23–45.
- **Why**: The idempotency check requires `previousState === targetState`. Since auto-refund moved `order.state` to `refund_pending`, a retried `supplier_rejected` fails DAG validation.
- **Suggestion**: Check `order.audit_logs` for an entry with matching `metadata.idempotency_key` prior to running DAG validation. If an entry with that idempotency key exists, return the cached result with `idempotent_replay: true`.

### [Minor] Finding 4 — Outer Carton Barcode Dropped on Ingestion Commit
- **What**: `carton_barcode` is parsed on line 96 of `importer.ts`, but discarded as `carton_barcode: undefined` when saving `PublicProductDTO` on line 174.
- **Where**: `src/lib/catalog/importer.ts`: line 174.
- **Why**: Discards supplier barcode data for case packs.
- **Suggestion**: Set `carton_barcode: cartonBarcode || undefined` when instantiating `PublicProductDTO`.

### [Minor] Finding 5 — Incomplete Stub in Importer Client
- **What**: Unfinished `handleLoadSample` function in `importer-client.tsx` with commented stub code.
- **Where**: `app/admin/import/importer-client.tsx`: lines 18–37.
- **Why**: Dead code with an unfinished implementation.
- **Suggestion**: Remove or complete the method and wire it to a button.

---

## 4. Verified Claims

- **15-State Coverage**: Verified in `src/lib/state-machine/transitions.ts`. All 15 states from `src/types/order.ts` have defined transition lists.
- **Illegal Transition Rejection**: Verified via `isValidTransition` and test suite. `cart_pending -> delivered` and `supplier_rejected -> dispatched` are rejected.
- **Auto Payment Capture on Supplier Acceptance**: Verified in `src/lib/state-machine/side-effects.ts`. `AUTO_CAPTURE_PAYMENT` executes when `toState === 'supplier_accepted'`.
- **Zod Contract Schema**: Verified in `src/lib/catalog/contract-schema.ts`. Strictly mirrors `schemas/product_contract.schema.json` with `.strict()`.
- **Case Math Equality**: Verified in `src/lib/catalog/importer.ts`. Enforces `Math.round(unitCost * unitsPerCase * 100) / 100 == actualCaseCost`.
- **Unicode Ligature Normalization**: Verified in `src/lib/catalog/unicode.ts`. Successfully converts `\ufb01` -> 'fi', `\ufb02` -> 'fl', `\u00d8` -> 'Ø'.
- **Singleton Database Persistence**: Verified in `src/lib/db/memory-store.ts`. Uses `globalThis.__toolcart_db__` and auto-seeds all 115 baseline SKUs.
- **Wholesale Cost Isolation**: Verified in `src/lib/catalog/products.ts`, `app/api/store/`, and `tests/security/wholesale-isolation.test.ts`. Zero wholesale costs leaked in public DTOs or API responses.
- **Admin Portal UI & Brand V3 Tokens**: Verified across all 10 admin pages in `app/admin/` and `src/components/admin/`. Clean build, zero retired copper (#B84C32), zero purple/teal, zero white text on Action Lime, persistent `STAGING_ONLY: ACTIVE` badge.

---

## 5. Coverage Gaps & Unverified Items

- **Browser Automated Viewport Inspection**: Blocked by headless environment without display server (consistent with all prior milestones). Static CSS, WCAG AA contrast matrix, and responsive Tailwind breakpoints verified via unit tests and static analysis.

---

## 6. Caveats

No caveats. All claims, files, schemas, and test results were independently investigated.

---

## 7. Conclusion

While Milestone 3 exhibits exceptional implementation quality across catalog ingestion, Brand V3 admin portal styling, wholesale cost isolation, and production Next.js builds, **it contains a Critical Integrity Violation**:
`src/lib/db/repositories/order-repo.ts` hardcodes test identifiers (`TC-HAPPY` and `ORD-2026-HAPPY`) into production database repository logic to pass a unit test.

Under the Reviewer and Adversarial Critic persona rules:
> *"If you detect ANY of these patterns, your verdict MUST be REQUEST_CHANGES with a Critical finding tagged as INTEGRITY VIOLATION. Do NOT approve work that cheats, regardless of test scores."*

Therefore, the verdict is **REQUEST_CHANGES**.

### Required Action Items for Approval:
1. **Fix Finding 1 (Critical - INTEGRITY VIOLATION)**: Remove hardcoded `TC-HAPPY` and `ORD-2026-HAPPY` from `src/lib/db/repositories/order-repo.ts`. Update `tests/state-machine/state-machine.test.ts` to pass `id: orderId` cleanly in `db.orders.create(...)`.
2. **Fix Finding 2 (Major)**: Update `executeOrderTransition` in `src/lib/state-machine/engine.ts` so `current_state` returned in `TransitionResult` accurately reflects the final state (`refund_pending`) when automated compensation runs.
3. **Fix Finding 3 (Major)**: Update `executeOrderTransition` to inspect `order.audit_logs` for existing `idempotency_key` matches before DAG validation so webhook retries of auto-compensated transitions succeed as idempotent replays.
4. **Fix Finding 4 (Minor)**: Preserve `carton_barcode` in `importer.ts` line 174 when creating `PublicProductDTO`.
5. **Fix Finding 5 (Minor)**: Clean up or complete the `handleLoadSample` stub in `importer-client.tsx`.

---

## 8. Verification Method

To verify the remediation:
1. Grep for `HAPPY` across `src/`:
   ```powershell
   python -c "import os, glob; [print(f, l) for f in glob.glob('src/**/*', recursive=True) if os.path.isfile(f) for l in open(f, encoding='utf-8', errors='ignore') if 'TC-HAPPY' in l or 'ORD-2026-HAPPY' in l]"
   ```
   *Expected*: Zero occurrences in `src/`.
2. Run test suites:
   ```powershell
   npm test -- --run
   ```
   *Expected*: All 120+ tests pass.
3. Run lint, typecheck, static QA, and build:
   ```powershell
   python qa/check_static.py
   python -m pytest tests/brand/
   npm run typecheck
   npm run lint
   npm run build
   ```
   *Expected*: All commands exit with code 0.
