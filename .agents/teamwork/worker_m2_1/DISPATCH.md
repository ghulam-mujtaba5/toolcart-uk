# DISPATCH — Worker M2: High-Reliability Data Tables & Bulk Actions (R2)

## Mission
Implement Milestone M2 (High-Reliability Data Tables & Bulk Actions) in `e:\ToolCart`.

## Reference Materials
- `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically timestamp `2026-10-15T12:07:45Z`)
- `e:\ToolCart\.agents\teamwork\orchestrator_admin_1\SCOPE.md`
- `e:\ToolCart\.agents\teamwork\explorer_admin_survey_2\handoff.md`
- `design/tokens.css`

## Files Owned
- `src/components/admin/product-table.tsx`
- `src/components/admin/data-table/` (reusable data table primitives/hooks)
- `src/components/admin/bulk-action-bar.tsx`
- `app/api/admin/products/bulk/route.ts`
- `app/admin/orders/page.tsx` & `src/components/admin/orders-table.tsx`
- `app/admin/customers/customers-client.tsx` & `app/api/admin/customers/[id]/route.ts`
- `tests/ui/admin-data-tables-and-bulk-actions.test.tsx` (new tests)

## Scope of Work
1. **Headless / TanStack Data Table Suite**:
   - Build a robust, accessible data table primitive (`src/components/admin/data-table/`) supporting:
     - Multi-column sorting (sort direction toggle, visual indicator, aria-sort).
     - Debounced search (300ms debounce using existing React hooks).
     - Faceted status filtering (draft, needs_review, approved, blocked; pending, paid, etc.).
     - Pagination controls with page size selector (10, 25, 50, 100) and page jump/next/prev buttons.
     - Row selection with indeterminate state on header checkbox and "Select all" banner.
2. **Product Table Upgrade & Bulk Actions**:
   - Refactor `src/components/admin/product-table.tsx` to use the data table primitive with row selection checkboxes.
   - Implement floating/docked `src/components/admin/bulk-action-bar.tsx` showing count of selected items and bulk action dropdown:
     - Publish/Draft status updates (`approved`, `draft`, `needs_review`, `blocked`).
     - Retail price adjustments (percentage or fixed amount with margin checks).
     - Category assignments.
     - Stock adjustments.
   - Implement `app/api/admin/products/bulk/route.ts` handling `POST` with batch updates via `db.products` repository. Ensure clean TypeScript types (fix any existing TS errors in this route).
3. **Interactive Orders Table**:
   - Convert `app/admin/orders/page.tsx` from static HTML table to interactive client `OrdersTable` (`src/components/admin/orders-table.tsx`).
   - Add status filtering tabs, customer/order search, sorting by date and total, pagination, and quick transition links to `/admin/orders/[id]`.
4. **Customer Trade Approval Persistence**:
   - Create `app/api/admin/customers/[id]/route.ts` handling `PUT` with `{ status, credit_limit_gbp }` persisting to `CustomerRepository` / `db.customers`.
   - Wire `handleStatusChange` in `app/admin/customers/customers-client.tsx` to call `PUT /api/admin/customers/[id]` with optimistic updates and error rollback.
5. **Brand V3 & Wholesale Confidentiality**:
   - Strictly adhere to `design/tokens.css` (zero copper/purple/teal).
   - Ensure wholesale costs remain strictly confined to server-side admin routes and are NEVER exposed to storefront bundles or public APIs.
6. **Verification**:
   - Write unit/integration tests in `tests/ui/admin-data-tables-and-bulk-actions.test.tsx`.
   - Run `npm test`, `npm run typecheck`, and `python qa/check_static.py`. Ensure all 3 exit with code 0!

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output Requirements
Write progress to `e:\ToolCart\.agents\teamwork\worker_m2_1\progress.md` and handoff report to `e:\ToolCart\.agents\teamwork\worker_m2_1\handoff.md`. Send message to parent `616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c` when complete.


## 2026-10-15T13:13:39Z
[Message] sender=616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c
Mission: Implement Milestone M2 (High-Reliability Data Tables & Bulk Actions).
1. Create reusable data table primitives/hooks in src/components/admin/data-table/ with multi-column sorting, 300ms debounced search, status filtering, pagination (10/25/50/100), and row selection with indeterminate header checkbox.
2. Upgrade src/components/admin/product-table.tsx with row selection and docking BulkActionBar (src/components/admin/bulk-action-bar.tsx).
3. Implement POST /api/admin/products/bulk/route.ts handling batch status/price/category/stock updates via db.products, ensuring zero TypeScript compilation errors.
4. Upgrade app/admin/orders/page.tsx to an interactive OrdersTable (src/components/admin/orders-table.tsx) with search, status filtering, pagination, and quick transition links.
5. Create PUT /api/admin/customers/[id]/route.ts and wire customers-client.tsx to persist customer trade approvals.
6. Write unit tests in tests/ui/admin-data-tables-and-bulk-actions.test.tsx.
7. Run tests: npm test, npm run typecheck, python qa/check_static.py.
8. Write progress to e:\ToolCart\.agents\teamwork\worker_m2_1\progress.md and handoff report to e:\ToolCart\.agents\teamwork\worker_m2_1\handoff.md.
