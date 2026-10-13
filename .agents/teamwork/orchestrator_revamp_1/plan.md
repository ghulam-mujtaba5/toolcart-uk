# ToolCart UK Modern Trade Platform Revamp Plan

## Objective
Elevate ToolCart UK to an elite, modern trade & hardware e-commerce platform incorporating 2026 industrial design trends (CAD blueprint dot grids, machined chamfers, optical duotone icons, lightweight Lottie motion, admin polish, 100% test & Brand V3 compliance, Vercel deployment).

## Phase 0: Survey & Architecture Discovery
- Spawn 3 parallel Explorers:
  - Explorer 1 (CSS/Brand Foundations & Layouts): Analyze `app/globals.css`, `design/tokens.css`, `tailwind.config.*`, layout components, and empty/error states.
  - Explorer 2 (Component System, Icons & Micro-Interactions): Analyze `src/components/`, product cards, cart interactions, VAT rocker, copy badges, stock indicators.
  - Explorer 3 (Motion/Lottie, Admin Portal & Testing Pipeline): Analyze `@dotlottie` or animation setup, `/admin` pages, tests (`npm test`, `qa/check_static.py`, build).
- Consolidate into `PROJECT.md` Feature Inventory & Architecture.

## Milestone 1 (M1): CSS Foundations, Blueprint Grids, Chamfers & Bespoke SVGs
- Pure-CSS patterns (`.tc-bg-dots`, `.tc-bg-blueprint`, `.tc-card-machined`) in `app/globals.css`.
- Bespoke Brand V3 SVG vector scenes: Empty Basket / Search, 404 Error page, Trade Pro verification header, Category headers with CAD accents.
- Strict token compliance: Ink `#182336`, Cobalt `#2450B8`, Action Lime `#DDF16A` (with Ink text), Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF`, Steel Text `#596B70`. Zero copper/purple/teal.

## Milestone 2 (M2): Adaptive Optical Duotone Icons & Micro-Interactions
- Adaptive duotone icon set (`src/components/ui/trade-icons.tsx`) with 4 optical sizes (16, 20, 24, 32px):
  - `IconToolbox`, `IconCaliper`, `IconTradeVerified`, `IconTapeMeasure`, `IconBolt`, `IconSpiritLevel`, `IconStockRadar`, `IconTruckFreight`.
- Mechanical micro-interactions:
  - Snap-to-Cart tactile button with mechanical press feedback.
  - SKU/GTIN/MPN 1-click copy badge with instant `#DDF16A` feedback.
  - Tactile rocker VAT switch.
  - 24h stock freshness radar pulse ring.

## Milestone 3 (M3): High-Impact Lightweight Motion Graphics & Lottie
- Animation components in `src/components/motion/`:
  - Cart feedback, Order state machine stepper, AI assistant radar/scanner, Trade Pro stamp, Empty states.
  - Bundle size strictly <150KB, honoring `prefers-reduced-motion`.

## Milestone 4 (M4): Storefront & Admin Portal Visual Polishing
- Storefront polish: Chamfers, hover elevations, floating spec chips on product cards, PDP, category listings.
- Admin portal (`/admin`): Industrial metric gauges, live order state badges, supplier feed health cards.
- WCAG AA contrast compliance at 360px and 1440px viewports.

## Milestone 5 (M5): E2E Verification, Static Audit, Build & Vercel Deployment
- 426 existing automated tests pass (`npm test`).
- `qa/check_static.py` passes with 0 violations.
- `npm run build` and `npx tsc --noEmit` pass cleanly.
- Git commit & push, verify live Vercel production deployment (`https://toolcart-uk.vercel.app`).
