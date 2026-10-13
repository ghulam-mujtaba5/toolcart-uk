# E2E Test Infra: ToolCart UK Modern Trade Revamp

## Test Philosophy
- Opaque-box, requirement-driven, Brand V3 token integrity, accessibility, and zero regression.
- Methodology: Category-Partition + Boundary Value Analysis + Pairwise Combinatorial Testing + Real-World Workload Testing.

## Test Runner & Environment
- Test Runner: Vitest (`npm test` / `npx vitest run`)
- Static Compliance: `python qa/check_static.py`
- TypeScript Typecheck: `npx tsc --noEmit`
- Production Build: `npm run build`

## Feature Test Mapping
| # | Feature | Test Target | Verification Type |
|---|---------|-------------|-------------------|
| 1 | CAD Dot Grid (`.tc-bg-dots`) | `tests/brand/brand-compliance.test.ts` | CSS class definition & contrast |
| 2 | Blueprint Grid (`.tc-bg-blueprint`) | `tests/brand/brand-compliance.test.ts` | CSS class definition & contrast |
| 3 | Machined Chamfer (`.tc-card-machined`) | `tests/brand/brand-compliance.test.ts` | CSS class definition & contrast |
| 4 | Bespoke SVG Vectors | `tests/ui/vector-scenes.test.tsx` | Component rendering, viewBox, SVG elements |
| 5 | Adaptive Duotone Icons | `tests/ui/trade-icons.test.tsx` | 4 optical sizes, duotone layers, accessibility |
| 6 | Tactile Micro-Interactions | `tests/ui/micro-interactions.test.tsx` | Click physics, clipboard copy, VAT toggle |
| 7 | Motion Graphics | `tests/motion/motion-components.test.tsx` | Render, SVG structure, `prefers-reduced-motion` |
| 8 | Admin Dial Gauges & Badges | `tests/admin/admin-components.test.tsx` | Value bounds, status mapping, accessibility |
| 9 | Brand V3 Static Invariants | `qa/check_static.py` | Zero copper/purple/teal, Action Lime paired with Ink |
| 10 | Existing Regressions | Entire Vitest suite | All 426 baseline tests pass |

## Coverage Thresholds
- All 426 existing tests MUST remain 100% green.
- Brand V3 static validator MUST exit code 0 with zero warnings.
- Build and typecheck MUST exit code 0 with zero errors.
- Shared first load JS MUST remain well below 150 kB budget.
