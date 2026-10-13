# Dispatch: Worker M1 (CSS Foundations & Bespoke SVGs)

- Working Directory: `e:\ToolCart\.agents\teamwork\worker_m1_1`
- Original Request: `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (read section `## 2026-10-13T16:36:41Z`)
- Project Root: `e:\ToolCart`
- Explorer Report: `e:\ToolCart\.agents\teamwork\explorer_survey_1\survey_report.md`
- Scope Document: `e:\ToolCart\PROJECT.md`

## Mandatory Integrity Warning:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Milestone 1 Objectives:
1. **CSS Engineering Patterns (`app/globals.css`)**:
   Implement pure-CSS zero-runtime engineering patterns adhering strictly to Brand V3:
   - `.tc-bg-dots`: 24px pitch CAD dot pattern using radial gradient (`var(--tc-primary)` / `#2450B8` at ~12% opacity on canvas).
   - `.tc-bg-blueprint`: Dual-pitch 20px minor / 100px major orthogonal engineering grid using linear gradients with subtle opacity.
   - `.tc-card-machined`: Machined tactile chamfer effect with 1px border (`var(--tc-border-strong)` / `#7C8A94`), inset metallic reflection (`inset 0 1px 0 rgba(255,255,255,0.8)`), and subtle hover elevation.
   - Keep all existing classes intact (e.g., `.tc-btn-accent`, `.tabular-nums`).

2. **Bespoke Brand V3 SVG Vector Scenes (`src/components/ui/vectors/`)**:
   Create bespoke React SVG vector components using exact Brand V3 palette (`#182336`, `#2450B8`, `#DDF16A` paired with `#182336`, `#F7F8F5`, `#EAF0FF`, `#596B70`, `#7C8A94`):
   - `src/components/ui/vectors/empty-tool-chest-vector.tsx`: 3-tier cantilever chest with open lid, foam cutout, and dashed silhouettes of spanner, screwdriver, and sockets.
   - `src/components/ui/vectors/not-found-vector.tsx`: Heavy-duty bi-material tape measure casing, blade snapped at "404mm", uncoiled spring recoil, and technical dimension callout.
   - `src/components/ui/vectors/trade-pro-vector.tsx`: Precision vernier caliper jaws clamped onto a verified industrial trade crest (measuring 30.00mm for Net 30 trade credit).
   - `src/components/ui/vectors/category-cad-accents.tsx`: 6 bespoke technical wireframe motifs for Hand Tools, Fixings, Decorating, Measuring, PPE, and Site Equipment.
   - Create an index file `src/components/ui/vectors/index.ts` exporting all vector components.

3. **Storefront Integration**:
   Integrate these vector scenes and CAD patterns into:
   - `app/not-found.tsx`: Replace generic placeholder with `<NotFoundVector />`. Fix untokenized `bg-tc-cloud` with `bg-tc-surface-soft`.
   - `app/(storefront)/basket/page.tsx` & `src/components/storefront/mini-basket.tsx`: Replace generic shopping bag on empty state with `<EmptyToolChestVector />`.
   - `app/(storefront)/search/page.tsx`: Integrate `<EmptyToolChestVector />` when query returns 0 results.
   - `app/(storefront)/trade/page.tsx`: Integrate `<TradeProHeroVector />` in the Trade Pro hero card. Replace untokenized `#E8F5E9` with tokenized styling.
   - `app/(storefront)/categories/[slug]/page.tsx`: Integrate `<CategoryCadAccents />` in category hero headers. Replace hardcoded `#C8D9F9` border.

4. **Verification**:
   - Run `npm test` and ensure all 426 tests pass. Add unit tests for the new vector components in `tests/ui/vector-scenes.test.tsx`.
   - Run `python qa/check_static.py` and verify 0 violations (0 copper, 0 purple, 0 teal, 0 white-on-lime).
   - Run `npx tsc --noEmit` and verify 0 TypeScript errors.
   - Write your handoff report to `e:\ToolCart\.agents\teamwork\worker_m1_1\handoff.md` with full command outputs.


## 2026-10-13T17:02:24Z
From: 080a93ac-e184-4734-a107-f062151cd3dc
Content: You are Worker M1 for the ToolCart UK Revamp project.
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m1_1`
Read your instructions in `e:\ToolCart\.agents\teamwork\worker_m1_1\DISPATCH.md` and read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (section `## 2026-10-13T16:36:41Z`).
Also read the detailed Explorer survey specifications at `e:\ToolCart\.agents\teamwork\explorer_survey_1\survey_report.md`.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Your write ownership:
- `app/globals.css`
- `src/components/ui/vectors/*`
- `app/not-found.tsx`
- `app/(storefront)/basket/page.tsx`
- `src/components/storefront/mini-basket.tsx`
- `app/(storefront)/search/page.tsx`
- `app/(storefront)/trade/page.tsx`
- `app/(storefront)/categories/[slug]/page.tsx`
- `tests/ui/vector-scenes.test.tsx`

Implement the CSS patterns, create the bespoke SVG vector scenes, integrate them into the storefront pages, fix untokenized classes, run tests (`npm test`), static brand verification (`python qa/check_static.py`), and TypeScript typechecking (`npx tsc --noEmit`).
Report all results in `e:\ToolCart\.agents\teamwork\worker_m1_1\handoff.md` and notify via send_message when done.
