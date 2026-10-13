# Dispatch: Worker M2 (Adaptive Duotone Icons & Tactile Micro-Interactions)

- Working Directory: `e:\ToolCart\.agents\teamwork\worker_m2_1`
- Original Request: `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (read section `## 2026-10-13T16:36:41Z`)
- Project Root: `e:\ToolCart`
- Explorer Report: `e:\ToolCart\.agents\teamwork\explorer_survey_2\survey_report.md`
- Scope Document: `e:\ToolCart\PROJECT.md`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 2 Objectives:
1. **Adaptive Optical-Sized Duotone Icon System (`src/components/ui/trade-icons.tsx`)**:
   Implement an adaptive duotone SVG icon set supporting 4 optical sizes (16px, 20px, 24px, 32px):
   - `IconToolbox`
   - `IconCaliper`
   - `IconTradeVerified`
   - `IconTapeMeasure`
   - `IconBolt`
   - `IconSpiritLevel`
   - `IconStockRadar`
   - `IconTruckFreight`
   Design with primary outline structure (`currentColor` or `var(--tc-primary)`) and secondary duotone tint layer with opacity (0.15 - 0.25). Clean props: `size?: 16 | 20 | 24 | 32`, `className?: string`, `aria-hidden?: boolean`, `aria-label?: string`.

2. **Mechanical Micro-Interactions**:
   - **Snap-to-Cart tactile button**: Mechanical depression on click, spring curve `cubic-bezier(0.34, 1.56, 0.64, 1)`, celebratory checkmark transition upon adding item to basket. Update `src/components/storefront/product-card.tsx` and `src/components/storefront/pdp-actions.tsx`.
   - **SKU/GTIN/MPN 1-Click Copy Badge (`src/components/ui/copy-badge.tsx`)**: Technical identifier badge with 1-click clipboard copy (`navigator.clipboard` with fallback) and instant Action Lime `#DDF16A` high-vis copied feedback and `aria-live="polite"`. Integrate into PDP `app/(storefront)/products/[slug]/page.tsx` and spec table.
   - **Tactile Rocker VAT Switch (`src/components/storefront/tactile-vat-rocker.tsx`)**: Realistic industrial mechanical rocker switch (Inc/Ex VAT toggle) with physical depression groove and tactile switch feel. Replace or wrap `src/components/storefront/vat-toggle.tsx` cleanly.
   - **Live 24h Stock Freshness Radar Pulse Ring (`src/components/ui/stock-radar-badge.tsx`)**: Harmonic multi-ring radar pulse wave indicating genuine stock freshness (<24h supply chain feed). Integrate into `ProductCard` and PDP.

3. **Storefront Wiring**:
   Integrate these icons and micro-interactions across:
   - `src/components/storefront/product-card.tsx`
   - `src/components/storefront/pdp-actions.tsx`
   - `app/(storefront)/products/[slug]/page.tsx`
   - `src/components/storefront/header.tsx`
   - `src/components/storefront/mini-basket.tsx`

4. **Testing & Quality Gates**:
   - Add unit tests for icons in `tests/ui/trade-icons.test.tsx` (all 8 icons, all 4 optical sizes, duotone paths, accessibility).
   - Add unit tests for micro-interactions in `tests/ui/micro-interactions.test.tsx` (copy badge clipboard feedback, VAT rocker keyboard toggles, stock radar badge).
   - Run `npm test` and ensure all 443+ tests pass.
   - Run `python qa/check_static.py` and ensure 0 violations (no copper, no purple, no teal, no white on lime).
   - Run `npx tsc --noEmit` and ensure clean exit code 0.
   - Write your handoff report to `e:\ToolCart\.agents\teamwork\worker_m2_1\handoff.md` with full command outputs.


## 2026-10-13T18:12:15Z
Sender: 080a93ac-e184-4734-a107-f062151cd3dc
You are Worker M2 for Milestone 2 of the ToolCart UK Revamp.
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m2_1`
Read your instructions in `e:\ToolCart\.agents\teamwork\worker_m2_1\DISPATCH.md` and read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (section `## 2026-10-13T16:36:41Z`).
Read the detailed survey specifications at `e:\ToolCart\.agents\teamwork\explorer_survey_2\survey_report.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
- `src/components/ui/trade-icons.tsx`
- `src/components/ui/copy-badge.tsx`
- `src/components/ui/stock-radar-badge.tsx`
- `src/components/storefront/tactile-vat-rocker.tsx`
- `src/components/storefront/product-card.tsx`
- `src/components/storefront/pdp-actions.tsx`
- `src/components/storefront/header.tsx`
- `src/components/storefront/mini-basket.tsx`
- `src/components/storefront/vat-toggle.tsx`
- `app/(storefront)/products/[slug]/page.tsx`
- `tests/ui/trade-icons.test.tsx`
- `tests/ui/micro-interactions.test.tsx`

Implement the 8 adaptive duotone icons across 4 optical sizes, the Snap-to-Cart tactile button, the 1-click SKU/GTIN copy badge with Action Lime feedback, the tactile rocker VAT switch, and the 24h stock freshness radar ring. Integrate them into the storefront components.
Run all tests (`npm test`), static brand check (`python qa/check_static.py`), and TypeScript typechecking (`npx tsc --noEmit`).
Report all results in `e:\ToolCart\.agents\teamwork\worker_m2_1\handoff.md` and send a message when done.
