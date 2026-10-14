# Project: ToolCart UK Comprehensive Defect Audit & Systematic Remediation

## Architecture
ToolCart UK is a Next.js 14 / TypeScript e-commerce platform for UK tradespeople (builders, electricians, plumbers). The architecture combines:
- **Design Tokens**: Pure CSS variables in `design/tokens.css` enforcing Brand V3:
  - Primary Industrial Cobalt: `#2450B8`
  - Action Lime Accent: `#DDF16A` (paired strictly with dark Ink `#182336` text for 12.66:1 contrast)
  - Ink (Primary Dark / Headings): `#182336`
  - Canvas (Workshop White): `#F7F8F5`
  - Surface Soft (Cloud Blue): `#EAF0FF`
  - Secondary Text (Steel Text): `#596B70`
  - Border Strong: `#7C8A94`
  - Prohibited: Copper `#B84C32`, purple/violet/lavender, teal, white text on lime.
- **CSS Engineering Foundations**: Pure-CSS patterns in `app/globals.css`:
  - `.tc-bg-dots`: 24px pitch CAD dot grid with 12% opacity cobalt dots.
  - `.tc-bg-blueprint`: 20px minor / 100px major orthogonal engineering grid.
  - `.tc-card-machined`: Machined tactile chamfers with metallic highlights and hover depth.
- **Iconography**: `src/components/ui/trade-icons.tsx` providing 8 trade icons across 4 optical sizes (16, 20, 24, 32px) using primary outlines and secondary duotone tints.
- **Micro-Interactions**: Snap-to-Cart spring physics button, 1-click SKU/GTIN copy badge with `#DDF16A` feedback, tactile rocker VAT switch, 24h stock freshness radar.
- **Motion System**: Inline animated SVGs in `src/components/motion/` (<15KB total footprint, zero external runtime, honoring `prefers-reduced-motion`).
- **Storefront & Admin Portal**: Polished product cards with spec chips and chamfers, administrative dial gauges, live order state badges, and supplier feed health cards.

## Feature Inventory & Defect Remediation
| # | Defect / Feature | Description | Milestone | Source |
|---|------------------|-------------|-----------|--------|
| 1 | Catalog & Search 500 Crash | Fix Next.js Server Component render exception on /search, /tools, /fixings, etc. | R1 | Parent Auditor |
| 2 | Routing Redirects & Rewrites | Add rewrites in next.config.mjs: /catalog -> /search, /categories -> /, /product/:slug -> /products/:slug | R1 | Parent Auditor |
| 3 | Guides Route Fix | Fix /guides/[slug] redirecting to /; ensure content renders cleanly | R1 | Parent Auditor |
| 4 | Missing /electrical Route | Create /electrical shortcut route and fix dead link in app/not-found.tsx | R1 | Explorer 1 |
| 5 | Soft-404 on Invalid Categories | Return notFound() on non-existent category slugs in categories/[slug]/page.tsx | R1 | Explorer 1 |
| 6 | Price Filter NaN Sanitization | Sanitize min_price and max_price in search & catalog filtering to prevent NaN catalog clearing | R1 | Explorer 1 |
| 7 | Sort Form Parameter Preservation | Preserve all active filters (min_price, max_price, in_stock) on sort dropdown submission | R1 | Explorer 1 |
| 8 | Catalog Batch Ingestion Promise Fix | Await db.products.create in src/lib/catalog/importer.ts | R1 | Explorer 2 |
| 9 | Admin Dashboard Audit Log Null Safety | Add (o.audit_logs \|\| []).map null guard in app/admin/page.tsx | R1 | Explorer 2 |
| 10 | Inactive VAT Toggle Contrast | Darken inactive VAT rocker button from #77868b to #596B70 / #252D30 for >= 4.5:1 contrast | R2 | Parent Auditor |
| 11 | Mobile Navigation Close Aria-Label | Add aria-label="Close menu" to mobile navigation drawer close button | R2 | Parent Auditor |
| 12 | Accessible Button Label in Name | Align button aria-label with visible text (WCAG 2.5.3), e.g. "Add to Basket: [Title]" | R2 | Parent Auditor |
| 13 | SKU Copy Badge 44px Touch Target | Increase touch padding/target on SKU copy badge to >= 44px | R2 | Parent Auditor |
| 14 | Footer Lime Logo Text Color | Add explicit text-tc-ink to footer logo div <div class="bg-tc-action-lime"> | R2 | Parent Auditor |
| 15 | ProductCard Interactive Nesting | Move CopyBadge outside Next.js <Link> to eliminate invalid HTML button-in-anchor nesting | R2 | Explorer 1 |
| 16 | FilterPill Interactive Nesting | Replace inner <span role="button"> with non-nested remove button pattern | R2 | Explorer 1 |
| 17 | Invalid Tailwind Spacing py-0.2 | Fix py-0.2 in copy-badge.tsx and product-table.tsx to py-0.5 | R2 | Explorer 1 |
| 18 | Stock Radar Badge Mobile Overflow | Constrain badge with max-w and shorten text to prevent overlapping Compare button on 360px | R2 | Explorer 1 |
| 19 | Accessible Modal Semantics in Drawers | Add role="dialog", aria-modal="true", and Escape key listener to MiniBasket, Compare, and AI drawers | R2 | Explorer 1 |
| 20 | Cart Composite Key Collision | Support (productId, isCase) composite keys in cart-context removeItem and updateQuantity | R3 | Explorer 1 |
| 21 | Pack vs Case Pricing & Stepper | Align cart item quantity semantics so case orders display cases and increment properly | R3 | Explorer 1 |
| 22 | Out-of-Stock Disabled Guards | Disable "Add to Basket" when stock is 0 or availability_status is out_of_stock | R3 | Explorer 1 |
| 23 | ProjectKitCard Real DTO & Images | Use real catalog DTOs and correct .png image paths in ProjectKitCard | R3 | Explorer 1 |
| 24 | CompareDrawer Null Spec Guard | Safeguard Object.keys(p.specifications \|\| {}) against null/undefined in CompareDrawer | R3 | Explorer 1 |
| 25 | FilterSidebar Price Input Debounce | Add debounce to price range inputs in FilterSidebar to prevent unthrottled router pushes | R3 | Explorer 1 |
| 26 | FilterSidebar Dynamic VAT Label | Match Price filter label to active global VAT mode ("Price (Inc. VAT)" / "Price (Ex. VAT)") | R3 | Explorer 1 |
| 27 | Bespoke SVG Vector Integration | Embed bespoke CAD SVGs in not-found, basket, and trade pages | R3 | Explorer 1 |
| 28 | Trade Pro Application Persistence | Implement POST /api/trade, CustomerRepository.create, and add phone input field | R3 | Explorer 2 |
| 29 | Admin Trade Approval Persistence | Implement PUT /api/admin/customers/[id] and trigger renderTradeApplicationDecisionEmail | R3 | Explorer 2 |
| 30 | Storefront Checkout Order Persistence | Wire checkout form submission to create real orders in db.orders and display in /account/orders/[id] | R3 | Explorer 2 |
| 31 | Full Automated Verification Gate | Ensure all unit and integration tests pass cleanly (npm test) | R4 | Acceptance Criteria |
| 32 | Brand V3 Static Check Gate | Ensure zero violations in python qa/check_static.py | R4 | Acceptance Criteria |
| 33 | TypeScript & Build Gate | Ensure npm run typecheck and npm run build pass with zero errors | R4 | Acceptance Criteria |
| 34 | Wholesale Data Isolation Attestation | Verify wholesale costs remain 100% server-side | R4 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| R1 | Critical Routes, Navigation & Server Fixes | Features 1–9: Fix 500 render crash, next.config rewrites, guides fix, /electrical, soft-404, NaN filter, sort params, batch importer, dashboard null safety | None | DONE |
| R2 | Brand V3, WCAG AA & Viewport Accessibility | Features 10–19: VAT switch contrast, close aria-label, label in name, copy badge 44px target, footer logo ink text, HTML nesting fixes, py-0.2 fix, radar 360px overflow, modal dialogs | R1 | DONE |
| R3 | Interactive UI Lifecycle, Cart & Persistence | Features 20–30: Cart composite keys, pack/case stepper, out-of-stock guard, project kit DTO, compare null guard, filter debounce & VAT label, vector integration, Trade Pro persistence, Admin trade approval, checkout DB order | R2 | PLANNED |
| R4 | Automated Verification & Zero-Regression Gate | Features 31–34: Full test suite (npm test), brand check (python qa/check_static.py), typecheck, production build, wholesale isolation, final report | R3 | PLANNED |

## Interface Contracts
### `src/context/cart-context.tsx`
- Cart item identifier: `key = ${productId}:${isCase ? 'case' : 'pack'}`
- Signatures:
  - `removeItem(productId: string, isCase?: boolean): void`
  - `updateQuantity(productId: string, quantity: number, isCase?: boolean): void`

### `app/api/trade/route.ts` & `src/lib/db/types.ts`
- `CustomerRepository.create(record: Omit<TradeCustomerRecord, 'id' | 'created_at'>): Promise<TradeCustomerRecord>`
- Endpoint: `POST /api/trade` accepts `{ business_name, contact_name, email, phone, trade_type, vat_number?, company_number? }`
- Endpoint: `PUT /api/admin/customers/[id]` accepts `{ status: 'approved' | 'rejected' | 'pending', credit_limit_gbp? }` and triggers `renderTradeApplicationDecisionEmail`.

### `next.config.mjs`
- Rewrites:
  - `/catalog` -> `/search`
  - `/categories` -> `/`
  - `/product/:slug` -> `/products/:slug`

## Code Layout
- `app/globals.css` — Core CSS variables, utilities, CAD grid and machined card classes
- `app/(storefront)/` — Storefront routes (search, categories, products, guides, basket, checkout, trade, account)
- `app/admin/` — Admin Portal routes (dashboard, products, orders, customers, pricing, suppliers, import, settings)
- `src/components/storefront/` — Storefront interactive components (product card, mini basket, filter sidebar, etc.)
- `src/components/ui/` — UI primitives (buttons, badges, trade icons, copy badge, tactile VAT rocker, etc.)
- `src/context/` — State providers (cart context, etc.)
- `src/lib/` — Domain logic, catalog, adapters (email, stripe, storage), database repositories
- `tests/` — Automated test suites (brand, e2e, adapters, adversarial, ui, security)
