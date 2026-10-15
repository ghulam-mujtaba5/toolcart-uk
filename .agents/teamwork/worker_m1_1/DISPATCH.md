# DISPATCH — Worker M1: Navigation & Retail Operational Dashboard

## Mission
Implement Milestone M1 (Retail Merchant Admin Navigation & Core Dashboard) in `e:\ToolCart`.

## Reference Materials
- `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (specifically timestamp `2026-10-15T12:07:45Z`)
- `e:\ToolCart\.agents\teamwork\orchestrator_admin_1\SCOPE.md`
- `e:\ToolCart\.agents\teamwork\explorer_admin_survey_1\handoff.md`
- `design/tokens.css` and `docs/02_BRAND_IDENTITY.md`

## Files Owned
- `src/components/admin/admin-layout.tsx`
- `src/components/admin/admin-sidebar.tsx`
- `app/admin/page.tsx`
- `src/components/admin/dashboard-quick-filters.tsx` (or dashboard operational triage components)

## Scope of Work
1. **Responsive Navigation & Mobile Drawer**:
   - In `src/components/admin/admin-layout.tsx`: Add mobile drawer open/close state, mobile hamburger toggle button in the header (visible on `< lg`), accessible close button, and tokenized styling.
   - In `src/components/admin/admin-sidebar.tsx`: Support responsive drawer mode on mobile screens (slide-over with backdrop, `fixed inset-y-0 left-0 z-50` with transition), and desktop docking (`hidden lg:flex lg:w-64`). Group nav links into "Commerce Operations", "Suppliers & Logistics", and "Governance".
   - Ensure clean 360px mobile viewport rendering without horizontal overflow.
2. **Retail Operational KPI Cards**:
   - In `app/admin/page.tsx`: Replace supplier feed cards with the 5 retail operational KPIs:
     - **Sales Velocity**: Calculated as retail orders per day over past 7 days (or total retail orders if <7 days), with trend indicator.
     - **Gross Revenue**: Sum of all retail order totals formatted in GBP (£ inc. VAT).
     - **Active Retail Orders**: Count of orders in active fulfillment states (`pending`, `checkout_authorized`, `supplier_order_pending`, `supplier_accepted`, `payment_captured`, `dispatched`).
     - **Stock Alerts**: Count of products with `stock_quantity <= 10` or `availability_status === 'out_of_stock'`.
     - **Average Order Value (AOV)**: Average order value in GBP (`orders.length > 0 ? grossRevenue / orders.length : 0`).
   - Include safe division guards (`orders.length > 0`) to prevent NaN or divide-by-zero on clean databases.
3. **Operational Triage Quick-Filters (`DashboardQuickFilters`)**:
   - Build a 3-tab operational triage console in `src/components/admin/dashboard-quick-filters.tsx` and integrate it into `app/admin/page.tsx`:
     - **Needs Fulfillment Tab**: Retail orders awaiting dispatch with quick action links to `/admin/orders/[id]`.
     - **Low-Stock Alerts Tab**: Products needing replenishment with stock level badges and links to `/admin/products/[id]`.
     - **Customer Activity Tab**: Recent trade account applications and retail customer orders.
4. **Brand V3 Tokenization**:
   - Strictly adhere to `design/tokens.css`: Industrial Cobalt (`#2450B8`), Action Lime (`#DDF16A` with dark Ink `#182336` text), Ink (`#182336`), Workshop White (`#F7F8F5`), Steel Text (`#596B70`).
   - Zero occurrences of retired copper `#B84C32`, purple, or teal.
5. **Verification**:
   - Run `npm test`, `npm run typecheck`, and `python qa/check_static.py`.
   - Ensure all tests pass with zero regressions.

## MANDATORY INTEGRITY WARNING
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Output Requirements
Write your progress to `e:\ToolCart\.agents\teamwork\worker_m1_1\progress.md` and your final report to `e:\ToolCart\.agents\teamwork\worker_m1_1\handoff.md`. Include test commands, build results, and viewport verification. When complete, send a message to parent `616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c`.
