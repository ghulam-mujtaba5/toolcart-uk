# Remediation Report: Milestone 3 Commerce Engine & Admin Portal Review Findings

## 1. Observation

All five findings from Reviewer M3's handoff report (`e:\ToolCart\.agents\teamwork\reviewer_m3_1\handoff.md`) were investigated, addressed, and verified.

### Finding 1: Test-Specific Branching in Production Order Repository (Critical - Integrity Violation)
- **Direct observation before fix**:
  In `src/lib/db/repositories/order-repo.ts`:
  - Line 36 contained: `(id === 'ORD-2026-HAPPY' && o.order_number === 'TC-HAPPY')`
  - Lines 59–60 contained:
    ```typescript
    if (order.order_number === 'TC-HAPPY') {
      id = 'ORD-2026-HAPPY';
    } else {
      id = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    }
    ```
- **Remediation implemented**:
  - In `src/lib/db/repositories/order-repo.ts`:
    Removed all conditional branches referencing `TC-HAPPY` or `ORD-2026-HAPPY`.
    In `getById()`:
    ```typescript
    for (const o of this.ordersMap.values()) {
      if (o.id === id || o.order_number === id) {
        return o;
      }
    }
    ```
    In `create()`:
    ```typescript
    const id = order.id || `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    ```
  - In `tests/state-machine/state-machine.test.ts`:
    In `it('executes the full happy path...')`, updated `getDb().orders.create({...})` to explicitly pass `id: orderId` within the test payload:
    ```typescript
    const orderId = 'ORD-2026-HAPPY';
    await getDb().orders.create({
      id: orderId,
      order_number: 'TC-HAPPY',
      ...
    ```
- **Post-remediation grep verification**:
  Command executed:
  ```powershell
  python -c "import os, glob; [print(f, l) for f in glob.glob('src/**/*', recursive=True) if os.path.isfile(f) for l in open(f, encoding='utf-8', errors='ignore') if 'TC-HAPPY' in l or 'ORD-2026-HAPPY' in l]"
  ```
  Result: Zero occurrences in `src/`.

### Finding 2: Desynchronized `current_state` on Auto-Refund (Major)
- **Direct observation before fix**:
  In `src/lib/state-machine/engine.ts`:
  When `TRIGGER_AUTO_REFUND` executed, `db.orders.updateState(order.id, 'refund_pending', refundLog)` mutated the order in the database to `'refund_pending'`. However, line 91 returned `current_state: targetState` (`'supplier_rejected'`).
- **Remediation implemented**:
  In `src/lib/state-machine/engine.ts`:
  Tracked `let currentState: typeof targetState = targetState;`.
  When `TRIGGER_AUTO_REFUND` executes and updates the order to `'refund_pending'` in the database, `currentState = 'refund_pending'`.
  The returned `TransitionResult` now returns `current_state: currentState`, ensuring the returned value matches the actual persisted record in `db.orders`.
  In `tests/state-machine/state-machine.test.ts`:
  Asserted `expect(res.current_state).toBe('refund_pending');`.

### Finding 3: Webhook Idempotency Replay Failure on Compensated States (Major)
- **Direct observation before fix**:
  In `src/lib/state-machine/engine.ts`:
  The previous idempotency check only tested `if (previousState === targetState)`. When an order had auto-refunded to `refund_pending`, a retried `supplier_rejected` request had `previousState = 'refund_pending'` and `targetState = 'supplier_rejected'`. Because `previousState !== targetState`, DAG transition validation ran and failed with `Illegal transition from 'refund_pending' to 'supplier_rejected'`.
- **Remediation implemented**:
  In `src/lib/state-machine/engine.ts`:
  Added check for `req.idempotency_key` in `order.audit_logs`:
  ```typescript
  if (req.idempotency_key) {
    const matchingLog = order.audit_logs.find(
      (log) => log.metadata?.idempotency_key === req.idempotency_key
    );
    if (matchingLog) {
      return {
        success: true,
        order_id: order.id,
        previous_state: matchingLog.from_state,
        current_state: order.state,
        idempotent_replay: true,
        audit_log: matchingLog,
        side_effects_executed: ['IDEMPOTENT_NOOP'],
      };
    }
  }
  ```
  Added automated test in `tests/state-machine/state-machine.test.ts`:
  `it('handles idempotency replay on auto-compensated states without DAG error', ...)` verifies that retrying `supplier_rejected` with an existing idempotency key returns `{ idempotent_replay: true, current_state: 'refund_pending' }` without throwing.

### Finding 4: Carton Barcode Dropped on Ingestion Commit (Minor)
- **Direct observation before fix**:
  In `src/lib/catalog/importer.ts`:
  Line 96 parsed `const cartonBarcode = r.carton_barcode && ...`, but line 174 hardcoded `carton_barcode: undefined` when building `PublicProductDTO`.
- **Remediation implemented**:
  - In `src/lib/catalog/importer.ts`:
    Added `carton_barcode?: string;` to `RowValidationResult`.
    Preserved `carton_barcode: cartonBarcode || undefined` in `results.push`.
    In `PublicProductDTO`, set `carton_barcode: r.carton_barcode || undefined`.
  - Added automated test in `tests/catalog/catalog-ingestion.test.ts`:
    `it('preserves outer carton barcode when committing catalog rows', ...)` verifies that ingested and committed records retain `carton_barcode` in the product store.

### Finding 5: Incomplete Sample Catalog Loader Stub (Minor)
- **Direct observation before fix**:
  In `app/admin/import/importer-client.tsx`:
  Lines 18–37 contained commented stub code for `handleLoadSample`, and the function was not connected to any button.
- **Remediation implemented**:
  - In `src/lib/catalog/products.ts`:
    Exported `getBaselineCatalogCsvText(): string` which resolves and reads `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`.
  - In `app/api/admin/import/route.ts`:
    Added `GET` handler supporting `?loadSample=true` to return `{ csv_content: getBaselineCatalogCsvText() }`.
    Updated `POST` handler to support `?loadSample=true` as well as `{ load_sample: true }` in JSON body.
  - In `app/admin/import/importer-client.tsx`:
    Implemented `handleLoadSample` to fetch `/api/admin/import?loadSample=true`, load the CSV content into the editor, and display feedback with row count.
    Added "Load Baseline Sample" button in the Action Bar.
  - Added automated tests in `tests/catalog/catalog-ingestion.test.ts`:
    - `it('loads baseline sample catalog CSV text via getBaselineCatalogCsvText', ...)`
    - `it('serves sample catalog via GET and POST in /api/admin/import route', ...)`

---

## 2. Logic Chain

1. **Integrity Mandate Compliance**:
   - Production source code (`src/lib/db/repositories/order-repo.ts`) contained test-specific string matching (`TC-HAPPY` and `ORD-2026-HAPPY`).
   - Removing those conditions and allowing `db.orders.create()` to accept `order.id` (or fallback to a generated ID) ensures genuine production code.
   - Updating `tests/state-machine/state-machine.test.ts` to supply its own `id: orderId` ensures the test fixture is self-contained.
   - Verified that zero instances of `TC-HAPPY` or `ORD-2026-HAPPY` exist in `src/`.

2. **State Machine Synchronization**:
   - `executeOrderTransition()` initiates state change and executes side effects.
   - When `TRIGGER_AUTO_REFUND` triggers, it moves the DB record from `supplier_rejected` to `refund_pending`.
   - Returning `current_state: currentState` (`refund_pending`) synchronizes the returned `TransitionResult` with the DB state.

3. **Idempotency Replay on Compensated States**:
   - Suppliers and payment gateways frequently retry delivery of status callbacks.
   - By querying `order.audit_logs` for `metadata.idempotency_key === req.idempotency_key` before running DAG edge validation, retried requests for auto-compensated states return `{ idempotent_replay: true, current_state: order.state }`.

4. **Data Fidelity (Carton Barcode)**:
   - Outer carton barcodes are crucial for multi-unit cases and warehouse dispatch.
   - Storing `carton_barcode` in `RowValidationResult` and mapping `carton_barcode: r.carton_barcode || undefined` to `PublicProductDTO` ensures barcode preservation.

5. **Sample Catalog Ingestion UX**:
   - Providing `/api/admin/import?loadSample=true` allows admin operators to test ingestion of the authoritative 115 quoted SKUs with a single click.

---

## 3. Caveats

No caveats. All 5 findings were resolved, no new dependencies were added, and all modifications adhered strictly to Brand V3 and minimal-change principles.

---

## 4. Conclusion

All findings identified in Milestone 3 review have been completely remediated.
- Integrity violation resolved with 0 test fixtures in production code.
- State machine engine return state synchronized with database state on auto-refund.
- Idempotency replay supported for compensated states.
- Outer carton barcode preserved during catalog ingestion.
- Admin portal sample catalog loader implemented and wired.
- All 6 quality gates pass with zero errors.

---

## 5. Verification Method

To independently verify the entire remediation:

1. **Verify Absence of Hardcoded Test Identifiers**:
   ```powershell
   python -c "import os, glob; [print(f, l) for f in glob.glob('src/**/*', recursive=True) if os.path.isfile(f) for l in open(f, encoding='utf-8', errors='ignore') if 'TC-HAPPY' in l or 'ORD-2026-HAPPY' in l]"
   ```
   *Expected*: Zero occurrences.

2. **Run All 6 Quality Verification Suites**:
   - Gate 1: `python qa/check_static.py` -> exit code 0
   - Gate 2: `python -m pytest tests/brand/` -> 9 passed, exit code 0
   - Gate 3: `npm run typecheck` -> 0 type errors, exit code 0
   - Gate 4: `npm run lint` -> 0 warnings/errors, exit code 0
   - Gate 5: `npm test -- --run` -> 124 passed (11 test files), exit code 0
   - Gate 6: `npm run build` -> all 28 static/dynamic routes compiled, exit code 0
