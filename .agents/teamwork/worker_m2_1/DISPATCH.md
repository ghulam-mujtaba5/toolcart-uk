## 2026-10-12T18:13:30Z
You are Worker M2 (Instance 1).
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m2_1`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.
Milestone 2 Explorer Blueprints:
- Read `e:\ToolCart\.agents\teamwork\explorer_m2_1\handoff.md` (Shell, Navigation, Home, Search, Categories)
- Read `e:\ToolCart\.agents\teamwork\explorer_m2_2\handoff.md` (PDP, Compare Drawer, Kits, Guides, AI Assistant)
- Read `e:\ToolCart\.agents\teamwork\explorer_m2_3\handoff.md` (Catalog Loader for 115 SKUs, Cart, Checkout, Trade, Account)

Mission:
Implement Milestone 2 (Customer Storefront Experience):
1. Implement Catalog Data Provider in `src/lib/catalog/`:
   - Parse `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` (all 115 quoted rows from Status International UK Ltd).
   - Normalize Unicode ligatures (`\ufb01` -> `fi`, `\ufb02` -> `fl`, `\u00d8` -> `Ø`).
   - Map records into `PublicProductDTO` (`src/types/product.ts`), strictly omitting wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).
   - Provide query functions: `getAllProducts()`, `getProductBySlug(slug)`, `getProductsByCategory(category)`, `searchProducts(query, filters)`, `getProjectKits()`, `getBuyingGuides()`.
   - Implement data for 3 project kits and 5 UK buying guides.
2. Implement Contexts in `src/context/`:
   - `VatContext`: Persistent trade vs DIY toggle (`Inc. VAT` / `Ex. VAT`) using cookie `toolcart_vat_mode` with SSR hydration safety.
   - `CartContext`: Cart items, quantity, slide-over drawer toggle, multi-supplier delivery grouping, UK 20% VAT calculation with integer-pence precision.
   - `CompareContext`: Up to 4 products for side-by-side spec comparison in sticky bottom drawer.
3. Implement Storefront Components in `src/components/storefront/`:
   - Header with `TOOLCART` Manrope 850 wordmark, Action Lime badge with Ink cart icon, search bar with live autocomplete flyout, mini-basket trigger, mobile nav drawer.
   - Utility microbar (VAT toggle, delivery policy, customer notice).
   - Subnav bar (Cobalt `#2450B8` with category links).
   - Footer (Ink `#182336` 5-column layout).
   - ProductCard (with pack breakdown, dual VAT prices, honest stock badge, Add to Basket, Compare toggle).
   - FilterSidebar & SearchFilterChips.
   - CompareDrawer (sticky dockable bottom drawer with side-by-side spec table and 1-click add to basket).
   - MiniBasket (slide-over drawer with multi-supplier shipping grouping).
   - AIModal / AIAssistantDrawer (`tc-ai-panel` styled in Cloud Blue `#EAF0FF` + Cobalt `#2450B8` + Ink text, grounded in catalog tools, refusing safety hallucinations).
4. Implement Storefront Pages in `app/(storefront)/`:
   - Homepage (`/`): Hero banner, customer promise in Cloud Blue `#EAF0FF`, category grid (6 categories), project kit teasers, AI assistant trigger.
   - Search & Category (`/search`, `/categories/[slug]` and category shortcuts `/tools`, `/fixings`, `/decorating`, `/measuring`, `/ppe`, `/site-equipment`): Instant search, multi-faceted filtering, sorting, zero-results UK synonym recovery.
   - Product Detail (`/products/[slug]`): Technical spec table with `tabular-nums`, GTIN/MPN, pack breakdown, dual VAT pricing, honest stock badge, UKCA/CE badges, Compare trigger.
   - Project Baskets (`/projects`): 3 curated kits with 1-click bundle add.
   - Buying Guides (`/guides`, `/guides/[slug]`): 5 authoritative UK buying guides with safety notes and product links.
   - Basket (`/basket`): Full basket page with multi-supplier grouping, UK 20% VAT breakdown.
   - Checkout (`/checkout`): Guest checkout, address entry with UK postcode validation, landed cost summary, Stripe test mode simulation.
   - Trade Portal (`/trade`): B2B registration form (Companies House, VAT).
   - Customer Account & Order Tracking (`/account`, `/account/orders/[id]`): Visual order timeline stepper covering all 13 states from `SUPPLIER_ORDER_STATE_MACHINE.md` with interactive state simulation.
5. Implement Public Store APIs in `app/api/store/`:
   - `products/route.ts` (returning sanitized `PublicProductDTO[]`, strictly hiding wholesale costs).
   - `cart/route.ts`.
   - `assistant/route.ts` (catalog tool runner).
6. Implement Test Suites:
   - `tests/storefront/storefront.test.tsx` (routing, search, VAT toggle, compare drawer, kits, guides, AI modal).
   - `tests/security/wholesale-isolation.test.ts` (automated test verifying `/api/store/*` and storefront components never leak `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp`).
7. Run all verification commands:
   - `python qa/check_static.py`
   - `python -m pytest tests/brand/`
   - `npm run typecheck`
   - `npm run lint`
   - `npm run build`
   - `npm test`
