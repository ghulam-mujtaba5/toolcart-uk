# Progress: Worker M2 — High-Reliability Data Tables & Bulk Actions (R2)

Last visited: 2026-10-15T13:16:00Z
Status: IN_PROGRESS

## Phase 1: Investigation & Baseline Verification
- [x] Received dispatch instructions and verified constraints
- [x] Studied `SCOPE.md`, `explorer_admin_survey_2/handoff.md`, `ORIGINAL_REQUEST.md`, `design/tokens.css`
- [ ] Investigate existing codebase: `src/components/admin/product-table.tsx`, `app/admin/orders/page.tsx`, `app/admin/customers/customers-client.tsx`, `app/api/admin/products/bulk/route.ts`, database models & repositories
- [ ] Run current test suite, typecheck, and static check baseline

## Phase 2: Headless Data Table Primitives (`src/components/admin/data-table/`)
- [ ] Design and implement `useDataTable` hook supporting:
  - Multi-column sorting with toggle and visual indicators
  - 300ms debounced search
  - Faceted status filtering
  - Pagination controls (page size 10, 25, 50, 100)
  - Row selection with indeterminate state on header checkbox
- [ ] Implement UI subcomponents: `DataTable`, `DataTableColumnHeader`, `DataTablePagination`, `DataTableSearch`, `DataTableFacetedFilter`, `IndeterminateCheckbox`

## Phase 3: Product Table Upgrade & Bulk Actions
- [ ] Create `src/components/admin/bulk-action-bar.tsx` (docked bar showing selected count, status update, price adjustment, category assignment, stock adjustment)
- [ ] Refactor `src/components/admin/product-table.tsx` to use the data table primitive and integrate `BulkActionBar`
- [ ] Implement `app/api/admin/products/bulk/route.ts` handling `POST` with batch updates via `db.products` repository with clean TypeScript types

## Phase 4: Interactive Orders Table
- [ ] Create `src/components/admin/orders-table.tsx` with search, status filtering tabs, date/total sorting, pagination, and quick transition links
- [ ] Update `app/admin/orders/page.tsx` to render the interactive `OrdersTable`

## Phase 5: Customer Trade Approval Persistence
- [ ] Create `app/api/admin/customers/[id]/route.ts` handling `PUT` with `{ status, credit_limit_gbp }`
- [ ] Wire `handleStatusChange` in `app/admin/customers/customers-client.tsx` to persist changes with optimistic update & rollback

## Phase 6: Testing & Quality Verification
- [ ] Write tests in `tests/ui/admin-data-tables-and-bulk-actions.test.tsx`
- [ ] Run `npm test`
- [ ] Run `npm run typecheck`
- [ ] Run `python qa/check_static.py`
- [ ] Write handoff report `handoff.md` and message parent
