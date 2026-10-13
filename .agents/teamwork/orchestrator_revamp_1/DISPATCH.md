## 2026-10-13T16:40:36Z
You are the Project Orchestrator for ToolCart UK.

Your working directory is: `e:\ToolCart\.agents\teamwork\orchestrator_revamp_1`
Your project root is: `e:\ToolCart`
Your authoritative user request is located at: `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` under section `## 2026-10-13T16:36:41Z`.

### Mission:
Revamp ToolCart UK into a visually elite, modern trade & hardware e-commerce platform incorporating 2026 industrial design trends: CAD blueprint dot grids, machined tactile chamfers, adaptive duotone icons, lightweight Lottie trade animations, and responsive micro-interactions.

### Requirements to fulfill:
1. **R1. Brand V3 Vector Visual System & Blueprint CAD Foundations**:
   - Pure-CSS engineering patterns (`.tc-bg-dots`, `.tc-bg-blueprint`, `.tc-card-machined`) in `app/globals.css`.
   - Original bespoke SVG vector scenes for Empty Basket / Search, 404 Error page, Trade Pro verification header, and Category headers with subtle CAD wireframe accents.
   - Strict Brand V3 token compliance (`design/tokens.css`): Industrial Cobalt `#2450B8`, Action Lime `#DDF16A` (paired strictly with dark Ink `#182336` text), Ink `#182336`, Workshop White `#F7F8F5`, Cloud Blue `#EAF0FF`, Steel Text `#596B70`. Zero copper `#B84C32`, purple, or teal.
2. **R2. Adaptive Optical-Sized Duotone Icon System & Micro-Interactions**:
   - Adaptive duotone SVG icon set (`src/components/ui/trade-icons.tsx`) supporting 4 optical sizes (16px, 20px, 24px, 32px): `IconToolbox`, `IconCaliper`, `IconTradeVerified`, `IconTapeMeasure`, `IconBolt`, `IconSpiritLevel`, `IconStockRadar`, `IconTruckFreight`.
   - Mechanical micro-interactions: Snap-to-Cart tactile button, SKU/GTIN/MPN 1-click copy badge with instant `#DDF16A` high-vis feedback, tactile rocker VAT switch, live 24h stock freshness radar pulse ring.
3. **R3. High-Impact Lightweight Lottie & Motion Graphics**:
   - Animation components in `src/components/motion/`: Cart Feedback, Order State Machine Stepper, AI Assistant scanner/radar waves, Trade Pro Application stamp, Empty States.
   - Use `@dotlottie/react-player` or inline animated SVGs, strictly under 150KB total bundle size, honoring `prefers-reduced-motion`.
4. **R4. Storefront & Admin Portal Visual Polishing**:
   - Machined chamfers, hover-depth elevations, floating spec chips on product cards, PDPs, category pages.
   - Admin Portal (`/admin`) dashboard with industrial metric gauges, live order state badges, supplier feed health cards.
   - 100% WCAG AA contrast compliance across all interactive elements and viewports (360px & 1440px).

### Verification & Acceptance:
- All 426 existing automated tests must remain passing (`npm test`).
- Brand V3 static validator: `qa/check_static.py` passes with zero violations.
- Next.js build and TypeScript typecheck pass cleanly: `npm run build` and `npx tsc --noEmit`.
- Changes committed and deployed to live Vercel production (`https://toolcart-uk.vercel.app`).
