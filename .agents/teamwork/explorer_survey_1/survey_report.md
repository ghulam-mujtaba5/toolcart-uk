# ToolCart UK Revamp — Explorer 1 Survey Report
**CSS Architecture, Brand V3 Tokens, Blueprint CAD Patterns & Bespoke SVG Vector Scenes**
**Date**: 2026-10-13  
**Explorer ID**: `explorer_survey_1`  
**Parent Orchestrator**: `080a93ac-e184-4734-a107-f062151cd3dc`  
**Working Directory**: `e:\ToolCart\.agents\teamwork\explorer_survey_1`

---

## 1. Executive Summary & Verification Baseline

This investigation surveys the CSS architecture, Brand V3 token system, Tailwind configuration, page layouts, empty states, 404 page, trade headers, category headers, pure-CSS blueprint engineering patterns, and bespoke SVG vector scenes for the ToolCart UK Revamp.

### Verification Baseline Status
- **Vitest Unit/Integration/E2E Suites (`npm test`)**: **426 / 426 tests passing** (18 test suites, 0 failures).
- **Brand V3 Static Rule Validator (`python qa/check_static.py`)**: **PASS** (Zero retired copper, valid CSS vars, WCAG usage matrix validated).
- **TypeScript Typecheck (`npx tsc --noEmit`)**: **PASS** (Exit code 0, zero compilation errors).
- **Brand V3 Invariant Enforcement**:
  - Zero `#B84C32` (retired copper) in any source or stylesheet.
  - Zero purple, violet, lavender, or teal color classes or properties.
  - Action Lime `#DDF16A` strictly paired with dark Ink `#182336` text (12.66:1 contrast ratio; white on lime 1.25:1 is mathematically prohibited).
  - Secondary text on off-white surfaces (`#F7F8F5`, `#EAF0FF`) strictly uses accessible Steel Text `#596B70` (≥4.89:1) rather than Steel Grey `#66767A` (fails AA at 4.44:1).

---

## 2. Brand V3 Token System Audit

### Authoritative Files
1. `design/tokens.css`: The single source of truth for runtime CSS variables.
2. `design/tokens.json`: The machine-readable token contract.
3. `docs/02_BRAND_IDENTITY.md`: Authoritative visual guide and brand constraints.
4. `qa/contrast_matrix.csv` / `qa/contrast_matrix.json`: Mathematical WCAG 2.2 AA contrast ratios.

### Authoritative Palette Mapping

| Role | Token Name | HEX Value | Approved Application & Notes | WCAG Contrast |
|---|---|---|---|---|
| **Dark Foundation** | `--tc-ink` | `#182336` | Headings, dark borders, text on lime, primary wordmark | 15.76:1 on White |
| **Primary Brand** | `--tc-primary` | `#2450B8` | Primary buttons (with white text), search triggers, active state | 7.21:1 with White |
| **Primary Hover** | `--tc-primary-hover` | `#193F99` | Hovered primary buttons | 9.49:1 with White |
| **Signature Accent** | `--tc-action-lime` | `#DDF16A` | High-vis badges, secondary action (must have 2px Ink outline) | 12.66:1 with Ink |
| **Accent Hover** | `--tc-lime-hover` | `#CFDE53` | Hovered lime secondary action | 11.20:1 with Ink |
| **Canvas** | `--tc-canvas` | `#F7F8F5` | Default page background (Workshop White) | Base surface |
| **Editorial Neutral** | `--tc-chalk` | `#F7F5F1` | Editorial / warm content sections | Base surface |
| **Product Surface** | `--tc-surface` | `#FFFFFF` | Product cards, checkout cards, pure white surfaces | Base surface |
| **AI / Info Panel** | `--tc-surface-soft` | `#EAF0FF` | AI assistant drawer, tip cards, blueprint tinted panels | Base surface |
| **Editorial Accent** | `--tc-blue-light` | `#D7EFFF` | Occasional editorial accents (Cool Blue) | Non-brand |
| **Body Text** | `--tc-graphite` | `#252D30` | Default body copy, technical specifications | 13.16:1 on Canvas |
| **Secondary (White only)**| `--tc-steel-grey-on-white-only`| `#66767A`| Secondary text on pure white ONLY | 4.73:1 on White |
| **Accessible Secondary** | `--tc-text-secondary` | `#596B70` | Secondary text on Canvas (5.24:1) & AI/Cloud (4.89:1) | ≥4.89:1 |
| **Decorative Border** | `--tc-border` | `#D8E0E5` | Structural dividers that do not convey functional state | Subdued |
| **Functional Border** | `--tc-border-strong` | `#7C8A94` | Form inputs, interactive card outlines, machined borders | 3.55:1 on White |
| **Warning** | `--tc-warning` | `#B45309` | Warning banners and alerts only (never brand marketing) | 4.71:1 on Canvas |
| **Success** | `--tc-success` | `#176447` | Confirmed stock badges, successful transactions | 7.12:1 on White |
| **Error** | `--tc-error` | `#B42318` | Validation errors, failed supplier states | 6.57:1 on White |
| **Focus Ring** | `--tc-focus` | `#2450B8` | Accessible keyboard focus outline (3px outline-offset 2px) | 7.21:1 on White |

### Typography & Radii
- **Heading Font**: `--font-heading: 'Manrope', system-ui, sans-serif` (600–800)
- **Body Font**: `--font-body: 'IBM Plex Sans', system-ui, sans-serif` (400–700)
- **Card Radius**: `--radius-card: 14px`
- **Button Radius**: `--radius-button: 10px`

### Codebase Anomaly Audit (To Remediate in Revamp)
1. `app/not-found.tsx`: Uses `bg-tc-cloud` on line 39 which is NOT defined in `tailwind.config.ts`. It falls back to default browser behavior. Must be replaced with `bg-tc-surface-soft` or `bg-[var(--tc-surface-soft)]`.
2. `app/(storefront)/trade/page.tsx`: Uses inline hardcoded `#E8F5E9` on line 89 instead of tokenized background.
3. `app/(storefront)/categories/[slug]/page.tsx`: Uses hardcoded `#C8D9F9` on line 102 instead of tokenized border variable.

---

## 3. CSS Architecture & Tailwind Configuration Audit

### Current `app/globals.css`
Currently contains:
```css
@import "../design/tokens.css";
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    background-color: var(--tc-canvas);
    color: var(--tc-graphite);
    font-family: var(--font-body);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-heading);
    color: var(--tc-ink);
    font-weight: 700;
  }
}

@layer utilities {
  .tc-btn-accent {
    background-color: var(--tc-action-lime);
    color: var(--tc-ink);
    border: 2px solid var(--tc-ink);
    border-radius: var(--radius-button);
  }
  .tc-btn-accent:hover {
    background-color: var(--tc-lime-hover);
  }
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
}
```

### Tailored Extension for Requirement R1
The pure-CSS engineering patterns (`.tc-bg-dots`, `.tc-bg-blueprint`, `.tc-card-machined`) are currently **absent** from `app/globals.css`. They must be added to `@layer utilities` in `app/globals.css`.

---

## 4. Pure-CSS Engineering Patterns Specification

These patterns provide high-impact 2026 industrial aesthetics with **zero runtime JavaScript overhead**, GPU-accelerated rendering, and zero network requests.

### 4.1 `.tc-bg-dots` (CAD Blueprint Dot Grid)
**Design Concept**: Represents a precision orthographic drafting pad. Subtle dot matrices establish geometric alignment without visual noise.

```css
/* CAD Blueprint Dot Grid (Pure CSS, 24px pitch, zero runtime overhead) */
.tc-bg-dots {
  background-image: radial-gradient(circle, rgba(36, 80, 184, 0.12) 1.25px, transparent 1.25px);
  background-size: 24px 24px;
  background-position: 0 0;
}

/* Dark-surface variant for Ink banners and hero headers */
.tc-bg-dots-dark {
  background-image: radial-gradient(circle, rgba(221, 241, 106, 0.16) 1.25px, transparent 1.25px);
  background-size: 24px 24px;
  background-position: 0 0;
}
```
- **Spacing**: 24px x 24px (standard 8pt grid alignment).
- **Dot Diameter**: 2.5px (radius 1.25px).
- **Coloration**: Cobalt (`#2450B8`) at 12% alpha on light surfaces (`--tc-canvas`, `--tc-surface-soft`). On dark surfaces (`--tc-ink`), Action Lime (`#DDF16A`) at 16% alpha.
- **Contrast Impact**: Background luminosity remains >94%, leaving text contrast ratio >12:1 for body copy.

### 4.2 `.tc-bg-blueprint` (CAD Blueprint Engineering Grid)
**Design Concept**: Orthogonal engineering drawing grid with dual-pitch major and minor grid lines (20px minor divisions, 100px major divisions).

```css
/* CAD Blueprint Engineering Grid (Dual-pitch orthogonal grid) */
.tc-bg-blueprint {
  background-color: var(--tc-canvas);
  background-image:
    linear-gradient(to right, rgba(36, 80, 184, 0.05) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(36, 80, 184, 0.05) 1px, transparent 1px),
    linear-gradient(to right, rgba(36, 80, 184, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(36, 80, 184, 0.12) 1px, transparent 1px);
  background-size:
    20px 20px,
    20px 20px,
    100px 100px,
    100px 100px;
  background-position: -1px -1px;
}

/* Dark blueprint variant for technical specs, CAD modals, and Admin views */
.tc-bg-blueprint-dark {
  background-color: var(--tc-ink);
  background-image:
    linear-gradient(to right, rgba(234, 240, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(234, 240, 255, 0.04) 1px, transparent 1px),
    linear-gradient(to right, rgba(221, 241, 106, 0.10) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(221, 241, 106, 0.10) 1px, transparent 1px);
  background-size:
    20px 20px,
    20px 20px,
    100px 100px,
    100px 100px;
  background-position: -1px -1px;
}
```
- **Minor Grid**: 20px intervals, 1px lines, 5% Cobalt opacity.
- **Major Grid**: 100px intervals, 1px lines, 12% Cobalt opacity.
- **Offsets**: `-1px -1px` to ensure sub-pixel edge alignment on high-DPI screens.

### 4.3 `.tc-card-machined` (Machined Tactile Chamfer Card)
**Design Concept**: Evokes CNC-milled aluminum / anodized steel tooling fixtures with crisp metallic chamfer edges, tactile inset reliefs, and mechanical micro-interaction hover depth.

```css
/* Machined Tactile Chamfer Card */
.tc-card-machined {
  position: relative;
  background-color: var(--tc-surface);
  border: 1px solid var(--tc-border-strong);
  border-radius: 10px;
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.85),
    inset 0 -1px 0 0 rgba(24, 35, 54, 0.04),
    0 2px 6px -1px rgba(24, 35, 54, 0.05),
    0 1px 3px 0 rgba(24, 35, 54, 0.03);
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.2s ease;
}

/* Precision machined index notch / caliper tick mark */
.tc-card-machined::before {
  content: "";
  position: absolute;
  top: 0;
  left: 20px;
  width: 28px;
  height: 2.5px;
  background-color: var(--tc-primary);
  border-radius: 0 0 2px 2px;
  pointer-events: none;
  transition: width 0.2s ease, background-color 0.2s ease;
}

.tc-card-machined:hover {
  border-color: var(--tc-primary);
  box-shadow:
    inset 0 1px 0 0 rgba(255, 255, 255, 0.95),
    0 8px 24px -4px rgba(24, 35, 54, 0.10),
    0 3px 8px -2px rgba(36, 80, 184, 0.08);
  transform: translateY(-2px);
}

.tc-card-machined:hover::before {
  width: 48px;
  background-color: var(--tc-primary);
}

/* 45-degree Precision Chamfered Corner Polygon (Alternative or Accent Modifier) */
.tc-chamfer-corner {
  clip-path: polygon(
    0 12px,
    12px 0,
    calc(100% - 12px) 0,
    100% 12px,
    100% calc(100% - 12px),
    calc(100% - 12px) 100%,
    12px 100%,
    0 calc(100% - 12px)
  );
}
```

---

## 5. Specification of Bespoke SVG Vector Scenes

To eliminate generic placeholder icons and elevate the platform to 2026 industrial design standards, four bespoke SVG vector scenes must be created as React components in `src/components/ui/vectors/`.

### 5.1 Scene 1: Empty Tool Chest (`EmptyToolChestVector`)
- **Target File**: `src/components/ui/vectors/empty-tool-chest-vector.tsx`
- **Used In**:
  - `app/(storefront)/basket/page.tsx` (lines 57–73)
  - `src/components/storefront/mini-basket.tsx` (lines 63–77)
  - `app/(storefront)/search/page.tsx` (lines 116–135)
- **ViewBox & Aspect Ratio**: `viewBox="0 0 320 220"`, `width="100%"`, max-width 260px–320px.
- **Visual Design & Narrative**:
  1. **Cantilever Steel Tool Chest**: Heavy-duty industrial tool chest in orthographic isometric 2.5D view.
  2. **Open Lid & Hinge Assembly**: Top lid opened back at 105 degrees, revealing heavy-duty piano hinge and gas strut support.
  3. **High-Density CNC Foam Inlay**: Precision molded tool tray (`fill="#EAF0FF"` / Cloud Blue with `#D8E0E5` bevel).
  4. **Dashed Tool Silhouettes (The "Empty" Concept)**:
     - **Open-End / Ring Combination Spanner**: Dashed silhouette (`stroke="#7C8A94" stroke-dasharray="4 3" stroke-width="1.5"`).
     - **Heavy-Duty Screwdriver**: Dashed knurled handle and hex bolster outline.
     - **Socket Inserts**: Three circular cutouts with dashed borders and metric labels (`10mm`, `13mm`, `17mm`).
  5. **Tactile Hardware Details**:
     - Industrial toggle draw-latch in Action Lime (`#DDF16A` with `#182336` border).
     - Heavy-duty extruded aluminum drawer pull handle with knurled grip texture.
     - Ball-bearing drawer slide track indicators in Cobalt (`#2450B8`).
  6. **Drop Shadow & Surface**: Soft ellipse shadow (`fill="#182336" fill-opacity="0.06"`).

#### React Component Specification
```tsx
// src/components/ui/vectors/empty-tool-chest-vector.tsx
import React from 'react';

interface EmptyToolChestVectorProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function EmptyToolChestVector({
  className = 'w-56 h-40 sm:w-64 sm:h-44 mx-auto',
}: EmptyToolChestVectorProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="chest-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="#2450B8" fillOpacity="0.15" />
        </pattern>
      </defs>

      {/* Background blueprint alignment frame */}
      <rect x="20" y="20" width="280" height="180" rx="8" fill="url(#chest-grid)" stroke="#EAF0FF" strokeWidth="1" />

      {/* Tool chest shadow */}
      <ellipse cx="160" cy="195" rx="110" ry="12" fill="#182336" fillOpacity="0.06" />

      {/* Main Chest Body Base */}
      <rect x="50" y="90" width="220" height="95" rx="6" fill="#182336" stroke="#2450B8" strokeWidth="2" />
      <rect x="54" y="94" width="212" height="40" rx="4" fill="#252D30" stroke="#7C8A94" strokeWidth="1" />
      <rect x="54" y="138" width="212" height="42" rx="4" fill="#252D30" stroke="#7C8A94" strokeWidth="1" />

      {/* Drawer Pull Handles */}
      <rect x="110" y="108" width="100" height="8" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="1.5" />
      <rect x="110" y="152" width="100" height="8" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="1.5" />

      {/* Open Lid (Isometric angle) */}
      <path d="M50 90 L80 32 L240 32 L270 90 Z" fill="#2450B8" stroke="#182336" strokeWidth="2" />
      <path d="M58 88 L85 38 L235 38 L262 88 Z" fill="#193F99" />

      {/* Lid Gas Struts */}
      <line x1="68" y1="90" x2="88" y2="44" stroke="#DDF16A" strokeWidth="2" strokeLinecap="round" />
      <line x1="252" y1="90" x2="232" y2="44" stroke="#DDF16A" strokeWidth="2" strokeLinecap="round" />

      {/* CNC Foam Inlay Tray */}
      <rect x="64" y="52" width="192" height="34" rx="3" fill="#EAF0FF" stroke="#7C8A94" strokeWidth="1" />

      {/* Dashed Tool Silhouettes */}
      {/* 1. Spanner silhouette */}
      <path
        d="M80 69 H140 M80 65 L72 69 L80 73 M140 65 L148 69 L140 73"
        stroke="#7C8A94"
        strokeWidth="1.75"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* 2. Screwdriver silhouette */}
      <rect x="156" y="65" width="46" height="8" rx="2" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <line x1="202" y1="69" x2="222" y2="69" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* 3. Empty Socket Cutouts */}
      <circle cx="232" cy="69" r="4.5" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
      <circle cx="244" cy="69" r="4.5" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

      {/* High-Vis Action Lime Mechanical Latch */}
      <rect x="150" y="86" width="20" height="12" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
      <circle cx="160" cy="92" r="2" fill="#182336" />
    </svg>
  );
}
```

---

### 5.2 Scene 2: 404 Snapped Measuring Tape (`NotFoundVector`)
- **Target File**: `src/components/ui/vectors/not-found-vector.tsx`
- **Used In**: `app/not-found.tsx` (central hero illustration)
- **ViewBox & Aspect Ratio**: `viewBox="0 0 360 220"`, `width="100%"`, max-width 360px.
- **Visual Design & Narrative**:
  1. **Impact-Resistant Tape Measure Case**:
     - Tough dual-density case: Dark Ink `#182336` core with Industrial Cobalt `#2450B8` shock-absorbing overmold.
     - Action Lime `#DDF16A` thumb thumb-lock rocker button with tactile grip ribs.
     - Belt clip and stainless steel rivet details.
  2. **Extended Steel Rule Snapped at 404mm**:
     - High-vis metric yellow/lime-toned steel blade extending horizontally from the tape mouth.
     - Clean jagged fracture / snap line precisely at the `404` graduation mark.
     - Blade markings: Black metric millimeter hash marks, centimeter numbers (`10`, `20`, `30` ... `404mm`).
     - Snapped tip of the blade floating with a slight angle and broken curl.
  3. **Exposed Spring Leaf Recoil**:
     - Spiral spring coil peeking out of the casing aperture (`stroke="#7C8A94"`).
  4. **Workshop Environment Accessories**:
     - Carpenter's hex pencil lying diagonally across the table.
     - Measurement callout dimension line: `|--- SPECIFICATION UNLOCATED: 404 ---|`.
     - Faint CAD blueprint coordinate grid behind the scene.

#### React Component Specification
```tsx
// src/components/ui/vectors/not-found-vector.tsx
import React from 'react';

export function NotFoundVector({ className = 'w-64 h-40 sm:w-80 sm:h-48 mx-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="notfound-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2450B8" strokeWidth="0.5" strokeOpacity="0.12" />
        </pattern>
      </defs>

      {/* Blueprint Grid Canvas */}
      <rect x="10" y="10" width="340" height="200" rx="10" fill="#F7F8F5" stroke="#D8E0E5" strokeWidth="1" />
      <rect x="10" y="10" width="340" height="200" rx="10" fill="url(#notfound-grid)" />

      {/* Soft Contact Shadow */}
      <ellipse cx="140" cy="180" rx="90" ry="10" fill="#182336" fillOpacity="0.07" />
      <ellipse cx="270" cy="180" rx="50" ry="6" fill="#182336" fillOpacity="0.05" />

      {/* Tape Measure Housing */}
      <rect x="40" y="70" width="105" height="100" rx="18" fill="#182336" stroke="#2450B8" strokeWidth="2.5" />
      <path d="M45 78 C45 74 135 74 135 78 L140 162 C140 166 45 166 45 162 Z" fill="#2450B8" fillOpacity="0.25" />

      {/* Tape Overmold Grip Ribs */}
      <rect x="36" y="92" width="8" height="14" rx="2" fill="#2450B8" />
      <rect x="36" y="112" width="8" height="14" rx="2" fill="#2450B8" />
      <rect x="36" y="132" width="8" height="14" rx="2" fill="#2450B8" />

      {/* Action Lime Thumb Lock Switch */}
      <rect x="75" y="52" width="32" height="20" rx="4" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
      <line x1="83" y1="58" x2="83" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="91" y1="58" x2="91" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="99" y1="58" x2="99" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />

      {/* Center Metallic Badge */}
      <circle cx="92" cy="120" r="24" fill="#252D30" stroke="#7C8A94" strokeWidth="2" />
      <text x="92" y="123" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
        TC-5M
      </text>
      <text x="92" y="133" fill="#DDF16A" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        CLASS II
      </text>

      {/* Extended Tape Blade (Attached Section) */}
      <path
        d="M145 136 L232 136 L230 144 L233 148 L228 154 L145 154 Z"
        fill="#DDF16A"
        stroke="#182336"
        strokeWidth="1.5"
      />
      {/* Millimeter Graduations */}
      <line x1="155" y1="136" x2="155" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="165" y1="136" x2="165" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="175" y1="136" x2="175" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="185" y1="136" x2="185" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="195" y1="136" x2="195" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="205" y1="136" x2="205" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="215" y1="136" x2="215" y2="142" stroke="#182336" strokeWidth="1" />

      {/* Numbers on Attached Blade */}
      <text x="165" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">380</text>
      <text x="185" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">390</text>
      <text x="205" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">400</text>

      {/* Fractured Snapped Tape Tip (Broken Off Section) */}
      <g transform="translate(242, 138) rotate(12)">
        <path
          d="M0 0 L60 0 L60 18 L0 18 L4 12 L0 6 Z"
          fill="#DDF16A"
          stroke="#182336"
          strokeWidth="1.5"
        />
        {/* Fractured 404 label */}
        <text x="22" y="13" fill="#B42318" fontSize="10" fontWeight="900" fontFamily="monospace">
          404!
        </text>
        {/* Riveted End Hook */}
        <path d="M60 0 L64 0 L64 24 L58 24 L58 18 Z" fill="#182336" />
        <circle cx="56" cy="6" r="1.5" fill="#FFFFFF" />
        <circle cx="56" cy="12" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Snapped Coil Spring Ejected */}
      <path
        d="M142 142 Q150 120 162 126 T176 112"
        fill="none"
        stroke="#7C8A94"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {/* Dimension Line Error Callout */}
      <g transform="translate(145, 172)">
        <line x1="0" y1="0" x2="160" y2="0" stroke="#2450B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M0 -3 L0 3 M160 -3 L160 3" stroke="#2450B8" strokeWidth="1.5" />
        <text x="80" y="-4" fill="#2450B8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          ERR: CUT AT 404mm
        </text>
      </g>
    </svg>
  );
}
```

---

### 5.3 Scene 3: Trade Pro Industrial Shield & Caliper (`TradeProHeroVector`)
- **Target File**: `src/components/ui/vectors/trade-pro-vector.tsx`
- **Used In**: `app/(storefront)/trade/page.tsx` (hero banner right/top motif)
- **ViewBox & Aspect Ratio**: `viewBox="0 0 340 220"`, `width="100%"`, max-width 320px–360px.
- **Visual Design & Narrative**:
  1. **Precision Vernier Caliper**:
     - Main beam crafted in brushed steel tones (`#596B70` and `#EAF0FF`) with laser-etched metric graduations.
     - Fixed outer jaw and sliding vernier jaw with fine-adjustment thumb screw.
     - Locking thumbscrew on top rail.
     - Vernier scale plate with 0.02mm resolution indices.
  2. **Industrial Certified Trade Shield**:
     - Hexagonal/chamfered heavy crest in Industrial Cobalt (`#2450B8`).
     - Inner border in Action Lime (`#DDF16A` with `#182336` line).
     - British trade certification kite-mark / gear motif at center.
     - Caliper jaws clamped exactly around the shield flanks, measuring `30.00mm` (representing 30-Day Net Trade terms).
  3. **Technical CAD Markings**:
     - Dimension lines: `|--- TOLERANCE ±0.00mm ---|`.
     - Inspection badge: `TRADE APPROVED`.

#### React Component Specification
```tsx
// src/components/ui/vectors/trade-pro-vector.tsx
import React from 'react';

export function TradeProHeroVector({ className = 'w-64 h-44 sm:w-80 sm:h-52 mx-auto' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 340 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="tradepro-cad" width="16" height="16" patternUnits="userSpaceOnUse">
          <line x1="0" y1="16" x2="16" y2="0" stroke="#2450B8" strokeWidth="0.5" strokeOpacity="0.08" />
        </pattern>
      </defs>

      {/* Engineering Drawing Frame */}
      <rect x="12" y="12" width="316" height="196" rx="8" fill="#F7F8F5" stroke="#7C8A94" strokeWidth="1" strokeDasharray="6 3" />
      <rect x="12" y="12" width="316" height="196" rx="8" fill="url(#tradepro-cad)" />

      {/* Verification Shield (Centered, clamped by caliper) */}
      <g transform="translate(130, 60)">
        {/* Outer Shield Outline */}
        <path
          d="M40 0 L75 18 L75 65 C75 92 40 108 40 108 C40 108 5 92 5 65 L5 18 Z"
          fill="#182336"
          stroke="#2450B8"
          strokeWidth="2.5"
        />
        {/* Inner Lime Accent Inset */}
        <path
          d="M40 8 L68 22 L68 62 C68 84 40 98 40 98 C40 98 12 84 12 62 L12 22 Z"
          fill="#2450B8"
          stroke="#DDF16A"
          strokeWidth="1.5"
        />
        {/* Certified Trade Emblem: Gear + Tick */}
        <circle cx="40" cy="50" r="16" fill="#182336" stroke="#DDF16A" strokeWidth="1.5" />
        <path d="M33 50 L38 55 L48 44" stroke="#DDF16A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <text x="40" y="80" fill="#FFFFFF" fontSize="6.5" fontWeight="900" textAnchor="middle" letterSpacing="0.5">
          VERIFIED
        </text>
      </g>

      {/* Vernier Caliper Assembly */}
      {/* 1. Main Caliper Beam */}
      <rect x="30" y="44" width="280" height="20" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="2" />
      {/* Metric Scale Graduations */}
      {Array.from({ length: 26 }).map((_, i) => (
        <line
          key={i}
          x1={40 + i * 10}
          y1={44}
          x2={40 + i * 10}
          y2={i % 5 === 0 ? 56 : 50}
          stroke="#182336"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
        />
      ))}

      {/* 2. Fixed Jaw (Left side, touching shield at x=135) */}
      <path
        d="M30 44 L30 160 L45 160 L45 110 L135 70 L135 44 Z"
        fill="#182336"
        stroke="#2450B8"
        strokeWidth="2"
      />
      {/* Ground measuring surface contact line */}
      <line x1="135" y1="64" x2="135" y2="120" stroke="#DDF16A" strokeWidth="2" />

      {/* 3. Sliding Vernier Vernier Jaw (Right side, touching shield at x=205) */}
      <g transform="translate(195, 36)">
        {/* Vernier Frame */}
        <rect x="0" y="0" width="45" height="36" rx="3" fill="#FFFFFF" stroke="#182336" strokeWidth="2" />
        {/* Thumbscrew */}
        <rect x="18" y="-8" width="10" height="8" rx="1" fill="#7C8A94" stroke="#182336" strokeWidth="1" />
        {/* Vernier Subdivisions */}
        <line x1="5" y1="28" x2="5" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="15" y1="28" x2="15" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="25" y1="28" x2="25" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="35" y1="28" x2="35" y2="36" stroke="#182336" strokeWidth="1" />
        {/* Sliding Outside Jaw */}
        <path d="M10 36 L10 128 L22 128 L22 76 L10 36 Z" fill="#182336" stroke="#2450B8" strokeWidth="2" />
        {/* Measuring Contact Face */}
        <line x1="10" y1="42" x2="10" y2="128" stroke="#DDF16A" strokeWidth="2" />
      </g>

      {/* Engineering Callouts & Tolerances */}
      <g transform="translate(135, 175)">
        <line x1="0" y1="0" x2="70" y2="0" stroke="#2450B8" strokeWidth="1.5" />
        <path d="M0 -4 L0 4 M70 -4 L70 4" stroke="#2450B8" strokeWidth="1.5" />
        <text x="35" y="-6" fill="#182336" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="monospace">
          30.00mm (NET 30)
        </text>
      </g>

      {/* High-Vis Trade Stamp */}
      <g transform="translate(250, 155)">
        <rect x="0" y="0" width="70" height="24" rx="4" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
        <text x="35" y="16" fill="#182336" fontSize="8.5" fontWeight="900" textAnchor="middle" fontFamily="sans-serif">
          UK TRADE PRO
        </text>
      </g>
    </svg>
  );
}
```

---

### 5.4 Scene 4: Category CAD Wireframe Accents (`CategoryCadAccents`)
- **Target File**: `src/components/ui/vectors/category-cad-accents.tsx`
- **Used In**: `app/(storefront)/categories/[slug]/page.tsx` (header banner backdrop/accent)
- **ViewBox & Aspect Ratio**: `viewBox="0 0 260 120"`, `width="100%"`, max-width 240px.
- **Category Specific Designs**:

| Category Slug | Motifs & Engineering Features | Wireframe Details |
|---|---|---|
| `tools` / `hand-tools` | Drop-forged combination spanner & high-torque screwdriver | Centerline pitch, 15° jaw offset angle, knurled grip, dimensional arcs `R14` |
| `fixings` / `fixings-security` | High-tensile hex bolt (M10), thread profile pitch, solid brass padlock | 60° thread flank angle, chamfered hex head, hardened shackle arc |
| `decorating` | 9" roller cage frame, angled sash brush, precision tape roll | Wireframe cage roller wire, bristle ferrule, tape core `Ø76mm` callout |
| `measuring` | 3-vial box-beam spirit level, metric rule graduations | Horizontal vial with center bubble bubble line, 45° vial, plumb plumb line |
| `ppe` / `workwear-safety` | EN166 ballistic safety goggles, FFP2 particulate respirator | Lens contour, side brow shield vents, filter exhalation valve grid |
| `site-equipment` | EN14183 3-step platform ladder, heavy-duty ratchet strap | A-frame truss structure, ribbed step treads, ratchet cam mechanism |

#### React Component Specification
```tsx
// src/components/ui/vectors/category-cad-accents.tsx
import React from 'react';

interface CategoryCadAccentProps {
  categorySlug: string;
  className?: string;
}

export function CategoryCadAccent({ categorySlug, className = 'w-48 h-24 opacity-60' }: CategoryCadAccentProps) {
  const normSlug = categorySlug.toLowerCase();

  switch (normSlug) {
    case 'tools':
    case 'hand-tools':
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Spanner CAD wireframe */}
          <path d="M30 60 L160 60" stroke="#2450B8" strokeWidth="1" strokeDasharray="6 3" />
          <path d="M35 48 H150 V72 H35 Z" stroke="#7C8A94" strokeWidth="1.5" />
          <path d="M35 48 C20 48 10 52 10 60 C10 68 20 72 35 72 L45 66 L45 54 Z" stroke="#2450B8" strokeWidth="2" />
          {/* Screwdriver CAD wireframe */}
          <line x1="80" y1="20" x2="220" y2="20" stroke="#7C8A94" strokeWidth="1.5" />
          <rect x="80" y="14" width="50" height="12" rx="2" stroke="#2450B8" strokeWidth="1.5" />
          <polygon points="220,17 230,20 220,23" fill="#2450B8" />
          {/* Dimension Arc */}
          <path d="M25 40 A15 15 0 0 1 45 40" stroke="#2450B8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="35" y="36" fill="#2450B8" fontSize="7" fontFamily="monospace">15°</text>
        </svg>
      );

    case 'fixings':
    case 'fixings-security':
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Hex Bolt M10 Wireframe */}
          <polygon points="40,30 60,30 70,47 60,65 40,65 30,47" stroke="#2450B8" strokeWidth="2" fill="none" />
          <rect x="70" y="38" width="90" height="18" stroke="#7C8A94" strokeWidth="1.5" />
          {/* Thread pitch ridges */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={80 + i * 9} y1={38} x2={85 + i * 9} y2={56} stroke="#2450B8" strokeWidth="1.5" />
          ))}
          {/* Heavy Padlock Wireframe */}
          <rect x="175" y="45" width="50" height="42" rx="4" stroke="#182336" strokeWidth="2" fill="none" />
          <path d="M185 45 V30 C185 20 215 20 215 30 V45" stroke="#2450B8" strokeWidth="2" fill="none" />
          <circle cx="200" cy="62" r="4" fill="#2450B8" />
          <line x1="200" y1="66" x2="200" y2="74" stroke="#2450B8" strokeWidth="2" />
        </svg>
      );

    case 'decorating':
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Paint Roller Wireframe */}
          <rect x="30" y="20" width="80" height="30" rx="3" stroke="#2450B8" strokeWidth="2" fill="none" />
          <line x1="110" y1="35" x2="135" y2="35" stroke="#7C8A94" strokeWidth="2" />
          <path d="M135 35 V75 H120 V105" stroke="#7C8A94" strokeWidth="2" fill="none" />
          <rect x="114" y="85" width="12" height="25" rx="2" stroke="#182336" strokeWidth="1.5" />
          {/* Sash Brush Ferrule */}
          <rect x="160" y="40" width="45" height="20" stroke="#2450B8" strokeWidth="1.5" />
          <path d="M160 60 C160 85 205 85 205 60 Z" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Tape Core Callout */}
          <circle cx="182" cy="20" r="14" stroke="#2450B8" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="182" y="23" fill="#2450B8" fontSize="7" textAnchor="middle" fontFamily="monospace">Ø76</text>
        </svg>
      );

    case 'measuring':
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Spirit Level Box Beam */}
          <rect x="20" y="40" width="200" height="36" rx="4" stroke="#182336" strokeWidth="2" fill="none" />
          {/* Horizontal Level Vial */}
          <rect x="100" y="48" width="40" height="20" rx="4" stroke="#2450B8" strokeWidth="1.5" fill="#EAF0FF" />
          <circle cx="120" cy="58" r="4" fill="#DDF16A" stroke="#182336" strokeWidth="1" />
          <line x1="114" y1="48" x2="114" y2="68" stroke="#182336" strokeWidth="1" />
          <line x1="126" y1="48" x2="126" y2="68" stroke="#182336" strokeWidth="1" />
          {/* 45° Vial */}
          <g transform="translate(50, 48) rotate(45 10 10)">
            <rect x="0" y="5" width="20" height="10" rx="2" stroke="#2450B8" strokeWidth="1" />
          </g>
          {/* Millimeter Scale */}
          {Array.from({ length: 21 }).map((_, i) => (
            <line key={i} x1={25 + i * 9.5} y1={40} x2={25 + i * 9.5} y2={i % 5 === 0 ? 47 : 44} stroke="#7C8A94" strokeWidth="1" />
          ))}
        </svg>
      );

    case 'ppe':
    case 'workwear-safety':
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Safety Goggles Contour */}
          <path
            d="M30 45 C40 30 90 30 100 45 C110 55 110 75 90 75 C70 75 40 75 30 45 Z"
            stroke="#2450B8"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M130 45 C140 30 190 30 200 45 C210 55 210 75 190 75 C170 75 140 75 130 45 Z"
            stroke="#2450B8"
            strokeWidth="2"
            fill="none"
          />
          <path d="M100 45 C115 42 115 42 130 45" stroke="#182336" strokeWidth="2" />
          {/* EN166 Marking */}
          <text x="115" y="88" fill="#2450B8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
            EN166 • 1F CE
          </text>
        </svg>
      );

    case 'site-equipment':
    default:
      return (
        <svg viewBox="0 0 240 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          {/* Stepladder A-Frame Truss */}
          <line x1="40" y1="105" x2="85" y2="20" stroke="#182336" strokeWidth="2.5" />
          <line x1="130" y1="105" x2="85" y2="20" stroke="#182336" strokeWidth="2.5" />
          {/* Platform Top */}
          <rect x="75" y="16" width="20" height="8" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
          {/* Ladder Rungs */}
          <line x1="53" y1="80" x2="117" y2="80" stroke="#2450B8" strokeWidth="2" />
          <line x1="64" y1="58" x2="106" y2="58" stroke="#2450B8" strokeWidth="2" />
          <line x1="74" y1="38" x2="96" y2="38" stroke="#2450B8" strokeWidth="2" />
          {/* Spreader Bar */}
          <line x1="58" y1="70" x2="112" y2="70" stroke="#7C8A94" strokeWidth="1" strokeDasharray="3 2" />
          {/* Ratchet Cam Motif */}
          <circle cx="180" cy="55" r="18" stroke="#2450B8" strokeWidth="2" fill="none" />
          <circle cx="180" cy="55" r="8" fill="#182336" />
          <rect x="176" y="25" width="8" height="15" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
        </svg>
      );
  }
}
```

---

## 6. Implementation Architecture for Downstream Workers

### Target Changes Summary

1. **`app/globals.css`**:
   - Append `.tc-bg-dots`, `.tc-bg-dots-dark`, `.tc-bg-blueprint`, `.tc-bg-blueprint-dark`, `.tc-card-machined`, and `.tc-chamfer-corner` inside `@layer utilities`.
2. **New Vector Components (`src/components/ui/vectors/`)**:
   - Create `src/components/ui/vectors/empty-tool-chest-vector.tsx`
   - Create `src/components/ui/vectors/not-found-vector.tsx`
   - Create `src/components/ui/vectors/trade-pro-vector.tsx`
   - Create `src/components/ui/vectors/category-cad-accents.tsx`
   - Create `src/components/ui/vectors/index.ts` re-exporting all vectors.
3. **`app/not-found.tsx`**:
   - Add `.tc-bg-blueprint` to page container.
   - Replace pulsing dot / simple header with `NotFoundVector`.
   - Apply `.tc-card-machined` to central card.
   - Fix `bg-tc-cloud` bug -> change to `bg-tc-surface-soft`.
4. **`app/(storefront)/basket/page.tsx` & `src/components/storefront/mini-basket.tsx`**:
   - Replace `<ShoppingBag className="w-8 h-8 opacity-60" />` in empty states with `<EmptyToolChestVector />`.
   - Wrap container in `.tc-card-machined`.
5. **`app/(storefront)/search/page.tsx`**:
   - Replace generic search icon in zero-results state with `<EmptyToolChestVector />`.
6. **`app/(storefront)/trade/page.tsx`**:
   - Upgrade hero card to `.tc-card-machined`.
   - Incorporate `TradeProHeroVector` alongside hero headline.
   - Replace un-tokenized `#E8F5E9` with tokenized styling.
7. **`app/(storefront)/categories/[slug]/page.tsx`**:
   - Incorporate `CategoryCadAccent` in category archive header banner.
   - Replace hardcoded border `#C8D9F9` with tokenized styling.

---

## 7. Verification Matrix for Downstream Implementers

| Check | Tool / Command | Passing Condition |
|---|---|---|
| **Vitest Tests** | `npm test` | All 426 tests pass with 0 failures |
| **Static Brand V3** | `python qa/check_static.py` | PASS, zero retired copper or unauthorized colors |
| **Storefront Scan** | `npx vitest run tests/adversarial/brand-v3-storefront-scan.test.ts` | Zero forbidden colors, no white text on lime |
| **TypeScript** | `npx tsc --noEmit` | Clean typecheck, 0 errors |
| **Next.js Build** | `npm run build` | Successful production build |
| **Responsive Viewports** | Vitest responsive suite | Responsive at 360px and 1440px viewports |
