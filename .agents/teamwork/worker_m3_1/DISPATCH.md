## 2026-10-13T06:01:07Z
You are Worker M3 (Instance 1).
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m3_1`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.
Milestone 3 Explorer Blueprint: Read `e:\ToolCart\.agents\teamwork\explorer_m3_1\handoff.md`.

Mission:
Implement Milestone 3 (Commerce Engine, Catalog Seed & Admin Portal) following the exact blueprints in `explorer_m3_1/handoff.md`:
1. Supplier Order State Machine (`src/lib/state-machine/`):
   - Implement `types.ts`, `transitions.ts`, `side-effects.ts`, `engine.ts`, `index.ts`.
   - Implement all 15 states from `src/types/order.ts`, the transition validation DAG, idempotency using PO key `order_id + supplier_id`, auto payment capture on `supplier_accepted`, auto-refund on `supplier_rejected` / `supplier_timeout`, and append-only `order_audit_logs`.
2. Catalog Ingestion & Contract Schema Validator (`src/lib/catalog/`):
   - `contract-schema.ts`: Zod schema validating against `schemas/product_contract.schema.json`.
   - `importer.ts`: Batch CSV/JSON importer with case math verification (`case_cost == round(unit_cost * units_per_case, 2)`), dry-run diagnostics report, nullable carton barcode handling for single unit cartons.
   - `unicode.ts`: Unicode ligature (`\ufb01` -> `fi`, `\ufb02` -> `fl`, `\u00d8` -> `Ø`) and symbol normalizer.
   - `pricing.ts`: Margin control engine and retail pricing calculation.
3. Unified Repositories & Database Seed Store (`src/lib/db/`):
   - `types.ts`: Repository interfaces (`ProductRepository`, `OrderRepository`, `SupplierRepository`, `PricingRepository`, `CustomerRepository`).
   - `seed-data.ts`: Seed suppliers, trade customers, sample orders.
   - `memory-store.ts`: Global singleton in-memory database store (`globalThis.__toolcart_db__`) auto-seeding from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`, supporting mutations and `reset()`.
   - Repositories in `src/lib/db/repositories/`: `product-repo.ts`, `order-repo.ts`, `supplier-repo.ts`, `pricing-repo.ts`, `customer-repo.ts`.
   - `index.ts`: Unified export providing `getDb()`.
4. Admin Components (`src/components/admin/`):
   - `admin-layout.tsx`: Brand V3 sidebar, header, breadcrumbs, staging badge (`STAGING_ONLY: ACTIVE`).
   - `admin-sidebar.tsx`: Navigation links with Lucide icons.
   - `kpi-card.tsx`: Metric cards with trend indicators.
   - `product-table.tsx`: Data table with search, category filter, sellability status filter, compliance badges.
   - `order-action-bar.tsx`: Interactive transition buttons according to order state.
   - `audit-timeline.tsx`: Chronological append-only audit trail viewer.
   - `import-preview-table.tsx`: Dry-run validation diagnostics table.
5. Admin Portal Pages (`app/admin/`):
   - `app/admin/layout.tsx`: Root admin layout with AdminLayout component.
   - `app/admin/page.tsx`: KPI Dashboard (total SKUs, draft vs approved, active orders, feed status, Launch Gate checklist).
   - `app/admin/products/page.tsx`: Product directory with filters and status pills.
   - `app/admin/products/[id]/page.tsx`: Product editor with technical specs, licensing verification toggle, UKCA compliance toggle, sellability dropdown, margin calculator.
   - `app/admin/orders/page.tsx`: Order list with state badges.
   - `app/admin/orders/[id]/page.tsx`: Fulfillment console, state transition buttons, PO generator, carrier tracking number input, audit timeline.
   - `app/admin/suppliers/page.tsx`: Supplier directory with lead times, carriage terms, stock feed TTL indicator.
   - `app/admin/import/page.tsx`: Drag-and-drop CSV/JSON upload with dry-run schema validation diagnostics table and commit button.
   - `app/admin/pricing/page.tsx`: Category markups and low-margin warnings.
   - `app/admin/customers/page.tsx`: Trade account approval queue and credit limit management.
   - `app/admin/settings/page.tsx`: Launch gates governance (`STAGING_ONLY: ACTIVE`, cloud provider health).
6. Admin API Endpoints (`app/api/admin/`):
   - `POST /api/admin/import`: CSV/JSON batch import with `?dryRun=true|false`.
   - `GET / POST /api/admin/orders`: List and create orders.
   - `GET /api/admin/orders/[id]`: Get single order.
   - `POST /api/admin/orders/[id]/transition`: Execute state transition with idempotency.
   - `GET / POST /api/admin/products`: Product CRUD.
   - `GET / PUT / DELETE /api/admin/products/[id]`: Product detail CRUD.
7. Unit & Integration Test Suites:
   - `tests/state-machine/state-machine.test.ts`: Test all 15 states, valid transitions, invalid transition rejection, idempotency via PO key, auto-refund on rejection, audit logging.
   - `tests/catalog/catalog-ingestion.test.ts`: Test 115 SKU CSV import, case math checks, ligature normalization, dry-run error handling, nullable carton barcode.
8. Run all verification commands:
   - `python qa/check_static.py`
   - `python -m pytest tests/brand/`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`
