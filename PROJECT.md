# Project: ToolCart UK Modern Trade Platform Revamp

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

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | CSS CAD Dot Grid (`.tc-bg-dots`) | Pure-CSS 24px pitch CAD engineering dot pattern | M1 | ORIGINAL_REQUEST R1 |
| 2 | CSS Blueprint Grid (`.tc-bg-blueprint`) | Pure-CSS 20px/100px orthogonal engineering grid | M1 | ORIGINAL_REQUEST R1 |
| 3 | CSS Machined Chamfer (`.tc-card-machined`) | CNC chamfered border effect with metallic highlight & depth | M1 | ORIGINAL_REQUEST R1 |
| 4 | Bespoke Empty Tool Chest Vector | 3-tier steel cantilever chest with foam cutouts for empty states | M1 | ORIGINAL_REQUEST R1 |
| 5 | Bespoke Snapped Tape Measure 404 Vector | Tape measure casing with blade snapped at 404mm for not-found | M1 | ORIGINAL_REQUEST R1 |
| 6 | Bespoke Trade Pro Caliper Hero Vector | Vernier caliper clamped on Net-30 trade verification crest | M1 | ORIGINAL_REQUEST R1 |
| 7 | Bespoke Category CAD Wireframe Accents | 6 technical wireframe motifs for product category banners | M1 | ORIGINAL_REQUEST R1 |
| 8 | Storefront Vector Integration | Embed vectors in Basket, Search, 404, Trade, Categories | M1 | ORIGINAL_REQUEST R1 |
| 9 | Token Remediation & Cleanup | Fix untokenized `bg-tc-cloud`, `#E8F5E9`, and hardcoded borders | M1 | Survey Finding |
| 10 | Adaptive Duotone Trade Icon Set | 8 bespoke icons across 4 optical sizes (16/20/24/32px) in `trade-icons.tsx` | M2 | ORIGINAL_REQUEST R2 |
| 11 | Snap-to-Cart Tactile Button | Button with spring depression, checkmark burst, and tactile click feel | M2 | ORIGINAL_REQUEST R2 |
| 12 | SKU/GTIN 1-Click Copy Badge | Technical spec badge with instant `#DDF16A` high-vis copied feedback | M2 | ORIGINAL_REQUEST R2 |
| 13 | Tactile Rocker VAT Switch | Realistic mechanical switch for Inc/Ex VAT toggle with tactile groove | M2 | ORIGINAL_REQUEST R2 |
| 14 | 24h Stock Freshness Radar Ring | Multi-ring harmonic radar pulse indicating live warehouse stock | M2 | ORIGINAL_REQUEST R2 |
| 15 | Storefront Icon & Micro-Interaction Wiring | Integrate icons and controls into ProductCard, PDP, Header, MiniBasket | M2 | ORIGINAL_REQUEST R2 |
| 16 | Lightweight Motion Architecture | Inline animated SVGs in `src/components/motion/` (<15KB total, <150KB limit) | M3 | ORIGINAL_REQUEST R3 |
| 17 | Cart Feedback Motion | Dynamic mechanical drop-in and badge pulse animation | M3 | ORIGINAL_REQUEST R3 |
| 18 | Order State Machine Stepper | 15-state DAG stepper with animated progress line and milestone pulse | M3 | ORIGINAL_REQUEST R3 |
| 19 | AI Assistant Scanner Waves | Radar wave scanning motion for AI Assistant widget | M3 | ORIGINAL_REQUEST R3 |
| 20 | Trade Pro Stamp Motion | Industrial ink approval stamp seal animation | M3 | ORIGINAL_REQUEST R3 |
| 21 | Empty States Motion | Gentle technical floating tool illustration animation | M3 | ORIGINAL_REQUEST R3 |
| 22 | Reduced Motion Accessibility | Full `prefers-reduced-motion` compliance across all animations | M3 | ORIGINAL_REQUEST R3 |
| 23 | Admin Metric Dial Gauges | Radial/arc industrial gauges for revenue, margin, orders | M4 | ORIGINAL_REQUEST R4 |
| 24 | Admin Live Order State Badges | Real-time state badges with status indicators | M4 | ORIGINAL_REQUEST R4 |
| 25 | Admin Supplier Feed Health Cards | Stock TTL countdown and carriage paid threshold monitoring | M4 | ORIGINAL_REQUEST R4 |
| 26 | Storefront Machined Polishing | Chamfered product cards, floating spec chips, elevation on hover | M4 | ORIGINAL_REQUEST R4 |
| 27 | WCAG AA Contrast Compliance | Full verification of 100% WCAG AA compliance at 360px & 1440px | M4 | ORIGINAL_REQUEST R4 |
| 28 | Full Automated Verification Gate | Ensure all 426 tests pass (`npm test`) | M5 | Acceptance Criteria |
| 29 | Brand V3 Static Gate | Zero violations in `python qa/check_static.py` | M5 | Acceptance Criteria |
| 30 | Production Build & Typecheck Gate | Clean exit in `npm run build` and `npx tsc --noEmit` | M5 | Acceptance Criteria |
| 31 | Git Commit & Live Vercel Deploy | Production deployment to https://toolcart-uk.vercel.app | M5 | Acceptance Criteria |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | CSS Foundations & Bespoke SVGs | Features 1–9: Pure-CSS patterns, bespoke SVG vectors, storefront embedding, token cleanup | None | DONE |
| M2 | Adaptive Icons & Micro-Interactions | Features 10–15: 8 duotone trade icons (4 optical sizes), Snap-to-Cart, copy badge, VAT rocker, radar pulse | M1 | IN_PROGRESS |
| M3 | Motion System & Admin Portal Visuals | Features 16–25: 5 motion components (<15KB), `useReducedMotion`, Admin dials/gauges, order state badges, supplier cards | M2 | PLANNED |
| M4 | Storefront Polishing & WCAG Audit | Features 26–27: Chamfered cards, floating spec chips, responsive 360/1440px layout & WCAG AA checks | M3 | PLANNED |
| M5 | E2E Verification, Build & Vercel Deploy | Features 28–31: 426 tests pass, static check, build, typecheck, git commit & Vercel live deploy | M4 | PLANNED |

## Interface Contracts
### `app/globals.css` ↔ Components
- Classes:
  - `.tc-bg-dots`: Radial gradient background for CAD engineering grid.
  - `.tc-bg-blueprint`: Linear gradient background for technical blueprint grid.
  - `.tc-card-machined`: Border and shadow styles creating CNC chamfer and metallic bevel.

### `src/components/ui/vectors/` ↔ Storefront Pages
- Components:
  - `EmptyToolChestVector`: React SVG component accepting `{ className?: string }`.
  - `NotFoundVector`: React SVG component accepting `{ className?: string }`.
  - `TradeProHeroVector`: React SVG component accepting `{ className?: string }`.
  - `CategoryCadAccent`: React SVG component accepting `{ categorySlug: string, className?: string }`.

### `src/components/ui/trade-icons.tsx` ↔ Storefront & Admin
- Props:
  - `size?: 16 | 20 | 24 | 32` (optical size)
  - `className?: string`
  - `aria-hidden?: boolean`
  - `aria-label?: string`
- Exported Icons:
  - `IconToolbox`, `IconCaliper`, `IconTradeVerified`, `IconTapeMeasure`, `IconBolt`, `IconSpiritLevel`, `IconStockRadar`, `IconTruckFreight`

### `src/components/motion/` ↔ UI Components
- Components:
  - `CartFeedbackMotion({ active: boolean, className?: string })`
  - `OrderStateStepperMotion({ currentState: string, steps: OrderStep[], className?: string })`
  - `AIAssistantScannerMotion({ scanning: boolean, className?: string })`
  - `TradeProStampMotion({ approved: boolean, className?: string })`
  - `EmptyStatesMotion({ type: 'cart' | 'search' | 'generic', className?: string })`
  - Hook: `useReducedMotion(): boolean`

## Code Layout
- `app/globals.css` — Core CSS variables, utilities, CAD grid and machined card classes
- `src/components/ui/vectors/` — Bespoke Brand V3 SVG vector scenes
- `src/components/ui/trade-icons.tsx` — Adaptive optical-sized duotone SVG icons
- `src/components/ui/copy-badge.tsx` — 1-click technical identifier copy badge
- `src/components/ui/stock-radar-badge.tsx` — 24h harmonic stock radar indicator
- `src/components/storefront/tactile-vat-rocker.tsx` — Heavy-duty mechanical VAT switch
- `src/components/motion/` — Lightweight inline animated SVGs and `useReducedMotion` hook
- `src/components/admin/` — Admin gauges, order state badges, and supplier feed health cards
- `tests/` — Automated test suites (unit, integration, adversarial, viewport)
