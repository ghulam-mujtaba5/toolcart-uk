# BRIEFING — 2026-10-12T18:46:00Z

## Mission
Implement Milestone 2: Customer Storefront Experience for ToolCart with complete catalog data provider, state contexts, components, pages, APIs, and tests.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: e:\ToolCart\.agents\teamwork\worker_m2_1
- Original parent: 311a2f36-0bc9-4d2c-ad1b-812679b4333e
- Milestone: Milestone 2 (Customer Storefront Experience)

## 🔒 Key Constraints
- Brand V3: Use design/tokens.css exclusively. No copper (#B84C32), purple/violet/lavender or teal branding. Ink (#182336), Cobalt (#2450B8), Action Lime (#DDF16A), Workshop White (#F7F8F5), Cloud Blue (#EAF0FF), Graphite (#252D30).
- No white text on lime; on pale surfaces use accessible Steel Text #596B70.
- AI assistant uses Cobalt + Cloud Blue with Ink text.
- Never claim supplier quote represents available stock, live prices or approved dropshipping. Unknown stock => unavailable / request confirmation.
- Keep wholesale prices and trade terms strictly server-side. Do not export supplier cost data (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) in public Next.js JS bundles or APIs.
- Strict honest stock badge: 24h stock freshness TTL.
- UK 20% VAT calculations with integer-pence precision and dual VAT display.
- Pass `python qa/check_static.py`, `python -m pytest tests/brand/`, `npm run typecheck`, `npm run lint`, `npm run build`, `npm test`.
- No cheating, no fake mocks. Full real implementations.

## Current Parent
- Conversation ID: 311a2f36-0bc9-4d2c-ad1b-812679b4333e
- Updated: 2026-10-12T18:46:00Z

## Task Summary
- **What to build**: Full Milestone 2 storefront experience including catalog loader for 115 SKUs from baseline CSV, contexts (VAT, Cart, Compare), storefront UI components, all storefront pages (`/`, `/search`, `/categories/[slug]`, `/products/[slug]`, `/projects`, `/guides`, `/guides/[slug]`, `/basket`, `/checkout`, `/trade`, `/account`), public store APIs, and test suites.
- **Success criteria**: All pages render cleanly, contracts strictly met, wholesale isolation verified, all builds, lint, static checks, and tests pass.
- **Interface contracts**: `PROJECT.md`, `src/types/product.ts`, `docs/`
- **Code layout**: `src/lib/catalog/`, `src/context/`, `src/components/storefront/`, `app/(storefront)/`, `app/api/store/`, `tests/`

## Key Decisions Made
- Normalised all Unicode ligatures (`\ufb01` -> `fi`, `\ufb02` -> `fl`, `\u00d8` -> `Ø`) in catalog ingestion.
- Wholesale pricing kept strictly server-side in internal offers map; `PublicProductDTO` projects only retail prices.
- Multi-supplier delivery carriage rules implemented with integer-pence precision UK 20% VAT math.
- Complete visual timeline stepper and simulator created for all 13 states from `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`.

## Artifact Index
- `handoff.md` — Final handoff report
- `progress.md` — Liveness and task tracking
- `DISPATCH.md` — Assigned instructions

## Change Tracker
- **Files modified**:
  - `src/types/product.ts`, `src/types/cart.ts`, `src/types/order.ts`, `src/types/guides.ts`
  - `src/lib/catalog/` (`unicode.ts`, `pricing.ts`, `products.ts`, `kits.ts`, `guides.ts`, `synonyms.ts`, `index.ts`)
  - `src/context/` (`vat-context.tsx`, `cart-context.tsx`, `compare-context.tsx`, `index.ts`)
  - `src/components/storefront/` (`vat-toggle.tsx`, `microbar.tsx`, `nav-bar.tsx`, `header.tsx`, `footer.tsx`, `product-card.tsx`, `filter-sidebar.tsx`, `search-filter-chips.tsx`, `compare-drawer.tsx`, `mini-basket.tsx`, `ai-assistant-drawer.tsx`, `pdp-actions.tsx`, `project-kit-card.tsx`, `order-timeline-stepper.tsx`, `storefront-layout-client.tsx`, `index.ts`)
  - `app/(storefront)/` (`layout.tsx`, `page.tsx`, `search/page.tsx`, `categories/[slug]/page.tsx`, `products/[slug]/page.tsx`, `projects/page.tsx`, `guides/page.tsx`, `guides/[slug]/page.tsx`, `basket/page.tsx`, `checkout/page.tsx`, `trade/page.tsx`, `account/page.tsx`, `account/orders/[id]/page.tsx`, shortcuts: `tools`, `fixings`, `decorating`, `measuring`, `ppe`, `site-equipment`)
  - `app/api/store/` (`products/route.ts`, `cart/route.ts`, `assistant/route.ts`)
  - `tests/` (`storefront/storefront.test.tsx`, `security/wholesale-isolation.test.ts`)
  - `vitest.config.ts` (alias ordering)
- **Build status**: PASS (`next build` exited code 0, 17/17 pages generated)
- **Pending issues**: None

## Quality Status
- **Build/test result**: All 75 tests passing in Vitest, 9/9 passing in pytest, QA static pass, Next.js build pass.
- **Lint status**: 0 ESLint warnings, 0 errors.
- **Tests added/modified**: 20 new tests added (14 storefront integration tests + 6 wholesale security isolation tests).

## Loaded Skills
- None
