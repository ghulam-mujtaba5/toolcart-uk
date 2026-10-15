# BRIEFING — 2026-10-15T13:13:39Z

## Mission
Implement Milestone M2 (High-Reliability Data Tables & Bulk Actions) in e:\ToolCart: reusable data table primitive (src/components/admin/data-table/), product table upgrade with row selection and docking BulkActionBar, POST /api/admin/products/bulk route, interactive OrdersTable with search/filters/pagination, PUT /api/admin/customers/[id] route with client wiring, and comprehensive test suite.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\ToolCart\.agents\teamwork\worker_m2_1
- Original parent: 080a93ac-e184-4734-a107-f062151cd3dc
- Milestone: Milestone 2 Revamp (Adaptive Duotone Icons & Tactile Micro-Interactions)
- Current Milestone: Milestone M2 (High-Reliability Data Tables & Bulk Actions - R2)
- Current Parent: 616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c

## 🔒 Key Constraints
- Brand V3: Use design/tokens.css exclusively. No copper (#B84C32), purple/violet/lavender or teal branding. Ink (#182336), Cobalt (#2450B8), Action Lime (#DDF16A), Workshop White (#F7F8F5), Cloud Blue (#EAF0FF), Graphite (#252D30).
- Action Lime (#DDF16A) must ALWAYS be paired with dark Ink (#182336) text and 2px dark outline on white. Never white text on lime.
- On pale surfaces use accessible Steel Text #596B70.
- Respect prefers-reduced-motion: reduce for all animations.
- Mandatory integrity: No fake mocks, genuine implementations.
- Zero Brand V3 static check violations (`python qa/check_static.py`).
- TypeScript clean (`npx tsc --noEmit` / `npm run typecheck`).
- All tests pass (`npm test`).
- Wholesale supplier costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) strictly server-side, never leaked to storefront bundles or public APIs.
- Launch Gate 4 governance respected.

## Current Parent
- Conversation ID: 616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c
- Updated: 2026-10-15T13:13:39Z

## Task Summary
- **What to build**:
  1. `src/components/admin/data-table/`: Reusable headless/generic data table primitives & hook (`useDataTable`, `DataTable`, `DataTablePagination`, `DataTableColumnHeader`, `DataTableSearch`, `DataTableFacetedFilter`) supporting multi-column sorting, 300ms debounced search, faceted status filtering, pagination (10/25/50/100), and row selection with indeterminate header checkbox.
  2. `src/components/admin/bulk-action-bar.tsx` and refactored `src/components/admin/product-table.tsx`: Row selection checkboxes, docking bulk action toolbar for publish/draft status, price adjustments, category assignments, stock adjustments.
  3. `app/api/admin/products/bulk/route.ts`: POST endpoint executing batch updates via `db.products` repository with zero TypeScript errors.
  4. `src/components/admin/orders-table.tsx` and updated `app/admin/orders/page.tsx`: Interactive client table with search, status filtering, sorting, pagination, and quick transition links.
  5. `app/api/admin/customers/[id]/route.ts`: PUT endpoint persisting trade customer status/credit limits, wired into `app/admin/customers/customers-client.tsx` with optimistic updates.
  6. Unit and integration tests in `tests/ui/admin-data-tables-and-bulk-actions.test.tsx`.
- **Success criteria**: All tests pass (`npm test`), TypeScript check passes (`npm run typecheck`), Brand V3 static checks pass (`python qa/check_static.py`).

## Key Decisions Made
- Build a robust zero-dependency headless React hook + accessible Radix/HTML primitives in `src/components/admin/data-table/` to avoid adding heavy unverified external dependencies, while fully supporting the required interface contracts.
- Ensure wholesale costs remain completely isolated.

## Artifact Index
- `handoff.md` — Final handoff report
- `progress.md` — Liveness and task tracking
- `DISPATCH.md` — Assigned instructions

## Change Tracker
- **Files modified**: [TBD]
- **Build status**: [Pending]
- **Pending issues**: None

## Quality Status
- **Build/test result**: [Pending]
- **Lint status**: [Pending]
- **Tests added/modified**: [TBD]

## Loaded Skills
- None
