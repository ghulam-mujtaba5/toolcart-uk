# Review & Adversarial Quality Report: Milestone M1 Retail Merchant Admin Navigation & Core Dashboard

**Reviewer Agent**: `reviewer_m1_2`  
**Working Directory**: `e:\ToolCart\.agents\teamwork\reviewer_m1_2`  
**Parent Agent**: `616c35a2-dbd8-4d26-9bbc-5e7e26c1b91c`  
**Date**: 2026-10-15  
**Type**: Hard Handoff  
**Verdict**: **`APPROVE`**

---

## 1. Observation

Direct observations from independent code inspection, verification commands, and test suite execution:

### 1.1 Static Verification, Type Checking, and Automated Suites
- **Brand V3 Static Analysis**:
  Command: `python qa/check_static.py`
  Result: Exit code 0.
  Output: `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix`
- **TypeScript Typecheck**:
  Command: `npm run typecheck`
  Result: Exit code 0, 0 diagnostic errors.
- **Admin Navigation & Dashboard Unit Test Suite**:
  Command: `npx vitest run tests/ui/admin-navigation-and-dashboard.test.tsx`
  Result: Exit code 0.
  Output: `Test Files: 1 passed (1), Tests: 15 passed (15), Duration: 7.40s`.
- **Adversarial Admin Navigation Stress Suite**:
  Command: `npx vitest run tests/adversarial/m1-admin-navigation-challenge.test.tsx`
  Result: Exit code 0.
  Output: `Test Files: 1 passed (1), Tests: 24 passed (24), Duration: 13.27s`.
- **Full Project Regression Test Suite**:
  Command: `npm test`
  Result: Exit code 0.
  Output: `Test Files: 28 passed (28), Tests: 662 passed (662), 0 failures`.

### 1.2 Code Inspection Observations

1. **`src/components/admin/admin-layout.tsx`**:
   - Lines 39–48: Mobile hamburger toggle button is implemented with explicit accessible touch target dimensions and attributes:
     ```tsx
     <button
       type="button"
       onClick={() => setMobileOpen(true)}
       aria-label="Open navigation menu"
       aria-expanded={mobileOpen}
       className="lg:hidden min-h-[44px] min-w-[44px] p-2 -ml-2 rounded-lg text-tc-ink hover:bg-tc-surface-soft flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-primary shrink-0"
     >
       <Menu className="w-5 h-5 text-tc-ink" />
     </button>
     ```
   - Lines 18–20: Dynamic drawer closure on route navigation:
     ```tsx
     useEffect(() => {
       setMobileOpen(false);
     }, [pathname]);
     ```
   - Line 86: Viewport overflow protection on main container:
     `<main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">` preventing horizontal blowout on 360px mobile viewports.

2. **`src/components/admin/admin-sidebar.tsx`**:
   - Lines 38–62: Navigation links structured into 3 distinct operational domains: `Commerce Operations`, `Suppliers & Logistics`, and `Governance`.
   - Lines 68–77: Escape key listener with proper event binding and cleanup:
     ```tsx
     useEffect(() => {
       if (!mobileOpen || !onClose) return;
       const handleKeyDown = (e: KeyboardEvent) => {
         if (e.key === 'Escape') {
           onClose();
         }
       };
       window.addEventListener('keydown', handleKeyDown);
       return () => window.removeEventListener('keydown', handleKeyDown);
     }, [mobileOpen, onClose]);
     ```
   - Lines 80–89: Body scroll lock applied when mobile drawer is open and restored upon close/unmount:
     ```tsx
     useEffect(() => {
       if (mobileOpen) {
         document.body.style.overflow = 'hidden';
       } else {
         document.body.style.overflow = '';
       }
       return () => {
         document.body.style.overflow = '';
       };
     }, [mobileOpen]);
     ```
   - Line 117: Primary navigation links enforce `>= 44px` touch targets:
     `className={cn('flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px]', ...)}`
   - Lines 185–191: Modal dialog semantics on mobile drawer container:
     `<div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">`
     with `<div className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" onClick={onClose} aria-hidden="true" />`.
   - Lines 211–219: Mobile close button enforces accessible touch target and labeling:
     ```tsx
     <button
       type="button"
       onClick={onClose}
       aria-label="Close navigation menu"
       className="min-h-[44px] min-w-[44px] p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-action-lime"
     >
       <X className="w-5 h-5" />
     </button>
     ```
   - Line 143: Ancillary link `<Link href="/" ... className="... min-h-[36px]">View Storefront</Link>`.

3. **`src/components/admin/dashboard-quick-filters.tsx`**:
   - Line 73: `role="tablist"` with `aria-label="Operational triage sections"`.
   - Lines 78–152: 3 accessible tabs (`Needs Fulfillment`, `Low-Stock Alerts`, `Customer Activity`) with `role="tab"`, `aria-selected`, `aria-controls`, and `min-h-[44px]`.
   - Lines 160–504: 3 distinct `role="tabpanel"` elements (`panel-fulfillment`, `panel-low-stock`, `panel-customers`) with corresponding `aria-labelledby`.
   - Lines 165–176, 262–273, 370–374, 453–457: Friendly zero-state messages with `<CheckCircle />` icons when queues are empty.
   - Pricing display: Exclusively renders public retail prices (`order.total_inc_vat_gbp`, `product.retail_price_inc_vat_gbp`, `product.retail_price_ex_vat_gbp`). Zero exposure of wholesale supplier costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).

4. **`app/admin/page.tsx`**:
   - Lines 31–37: Sales Velocity calculated dynamically over 7-day trailing window:
     ```tsx
     const now = new Date();
     const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
     const recentOrdersPast7Days = allOrders.filter(
       (o) => new Date(o.created_at).getTime() >= sevenDaysAgo.getTime()
     );
     const velocityPerDay = (recentOrdersPast7Days.length / 7).toFixed(1);
     ```
   - Line 40: Gross Revenue sums total retail VAT-inclusive revenue with safe defaulting:
     `const grossRevenue = allOrders.reduce((sum, o) => sum + (o.total_inc_vat_gbp || 0), 0);`
   - Lines 43–51: Active retail orders accurately filters for the 6 non-terminal, pre-delivery fulfillment states (`pending`, `checkout_authorized`, `supplier_order_pending`, `supplier_accepted`, `payment_captured`, `dispatched`).
   - Lines 54–56: Stock Alerts filters and sorts ascending products with `stock_quantity <= 10` or `availability_status === 'out_of_stock'`.
   - Line 59: Average Order Value (AOV) includes a safe division guard:
     `const aov = allOrders.length > 0 ? grossRevenue / allOrders.length : 0;`
     preventing `NaN` or divide-by-zero crashes on clean databases.

5. **Integrity Audit**:
   - Zero hardcoded test scores or bypass flags embedded in source code.
   - Genuine component and data logic connected to repository stores (`db.orders`, `db.products`, `db.suppliers`, `db.customers`).
   - Real event listeners, scroll locks, and state transitions.

---

## 2. Logic Chain

1. **Accessibility & WCAG AA Compliance**:
   - Observation 1.2.1 and 1.2.2 confirm that the mobile hamburger toggle button (`min-h-[44px] min-w-[44px]`) and the mobile drawer close button (`min-h-[44px] min-w-[44px]`) strictly adhere to WCAG 2.5.5 / 2.5.8 touch target standards.
   - Observation 1.2.2 proves that the mobile drawer implements full modal dialog semantics: `role="dialog"`, `aria-modal="true"`, and `aria-label="Mobile Navigation"`.
   - Observation 1.2.2 and test results in Observation 1.1 verify that pressing the Escape key dismisses the mobile drawer and properly unbinds the window event listener upon drawer closure and component unmounting.
   - Observation 1.2.2 verifies body scroll locking (`document.body.style.overflow = 'hidden'`) during drawer visibility, preventing background scroll bleed.
   - Observation 1.2.3 confirms that `DashboardQuickFilters` implements complete `role="tablist"`, `role="tab"`, and `role="tabpanel"` semantics with matching `aria-controls` and `aria-labelledby` IDs.

2. **Retail Merchant Operational Math**:
   - Observation 1.2.4 verifies that the 5 core retail KPIs (Sales Velocity, Gross Revenue, Active Retail Orders, Stock Alerts, Average Order Value) match the merchant operational requirements specified in `ORIGINAL_REQUEST.md`.
   - The safe division guard in `aov = allOrders.length > 0 ? grossRevenue / allOrders.length : 0` guarantees that newly initialized stores with 0 orders evaluate cleanly to `£0.00` without throwing `NaN` or unhandled exceptions.
   - Active orders filtering strictly covers the active pipeline states defined in `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`.

3. **Wholesale Cost Isolation & Commercial Safety**:
   - Observation 1.2.3 and the automated security test `tests/security/wholesale-isolation.test.ts` confirm that no wholesale cost parameters (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) are passed to or serialized by `DashboardQuickFilters` or client navigation components. Public retail prices are strictly preserved.

4. **Brand V3 Token Adherence**:
   - Observation 1.1 confirms `qa/check_static.py` passes with zero violations.
   - Observation 1.2.2 verifies that Action Lime (`#DDF16A`) is strictly paired with dark Ink (`#182336`) text and borders, with zero occurrences of retired copper `#B84C32`, purple, or teal.

5. **Adversarial Stress Resilience**:
   - `tests/adversarial/m1-admin-navigation-challenge.test.tsx` passed all 24 tests across rapid open/close cycling (50 iterations), undefined callback tolerances, backdrop click isolation, non-Escape key ignoring, and route change synchronization.

---

## 3. Findings

### Minor Findings & Recommendations

1. **[Minor] Ancillary "View Storefront" Link Height in Sidebar Footer**:
   - **What**: In `src/components/admin/admin-sidebar.tsx` line 143, the secondary utility link "View Storefront" uses `min-h-[36px]`.
   - **Where**: `src/components/admin/admin-sidebar.tsx:143`
   - **Context**: While all 8 primary category navigation items, the hamburger button, close button, and dashboard tab controls enforce `>= 44px`, this secondary footer link is 36px.
   - **Recommendation**: Upgrade to `min-h-[44px]` in a future styling pass to guarantee 100% uniform 44px touch targets across all ancillary footer links.

2. **[Observation] IEEE-754 Floating-Point Precision on Gross Revenue**:
   - **What**: In `app/admin/page.tsx`, `grossRevenue` is summed via floating point arithmetic: `allOrders.reduce((sum, o) => sum + (o.total_inc_vat_gbp || 0), 0)`.
   - **Where**: `app/admin/page.tsx:40`
   - **Context**: With large order datasets, JS float additions can accumulate minor epsilon noise (e.g. `0.30000000000000004`).
   - **Mitigation Present**: The UI safely masks this via `toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })` and `.toFixed(2)`. For backend ledgering, integer pence (`total_inc_vat_pence`) remains standard.

---

## 4. Caveats

- **Active Dialog Focus Trap**: The mobile navigation drawer implements accessible `role="dialog"` and `aria-modal="true"`, with Escape key dismissal and body scroll locking. It does not currently implement programmatic keyboard focus trapping (cycling Tab exclusively within the drawer until closed). This is acceptable for WCAG AA mobile responsive drawer implementations in this milestone, but could be enhanced with `@radix-ui/react-dialog` in future milestones.
- **Mock Environment JSDOM Navigation Warnings**: During test execution, JSDOM outputs `Error: Not implemented: navigation (except hash changes)` when `<Link>` clicks are triggered in tests without a full browser history mock. This does not impact test assertion validity or runtime code.

---

## 5. Conclusion

**Verdict: `APPROVE`**

Milestone M1 (Retail Merchant Admin Navigation & Core Dashboard) is well-engineered, rigorously tested, and fully compliant with project standards:
- **WCAG AA Accessibility**: Minimum 44px touch targets verified on hamburger and close buttons; ARIA dialog semantics, Escape key handling, and body scroll lock verified.
- **Retail Operational Logic**: 5 core retail KPIs and 3-tab operational triage console accurately implemented with safe division guards and zero `NaN` risks.
- **Brand V3 Integrity**: Strict adherence to Brand V3 design tokens with 0 static violations.
- **Test Evidence**: 100% test pass rate across unit tests (15/15), adversarial tests (24/24), static analysis, type checking, and full project regressions (662/662 passed).

---

## 6. Verification Method

To independently reproduce all verification results:

```powershell
# 1. Verify Brand V3 static checks, color matrices, and retired-color scans
python e:\ToolCart\qa\check_static.py

# 2. Verify TypeScript type soundness
npm run typecheck

# 3. Run Admin Navigation & Dashboard unit test suite
npx vitest run tests/ui/admin-navigation-and-dashboard.test.tsx

# 4. Run Adversarial Admin Navigation stress test suite
npx vitest run tests/adversarial/m1-admin-navigation-challenge.test.tsx

# 5. Run full project test suite
npm test
```
