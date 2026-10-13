# M2.1 Investigation & Architectural Strategy Report: Storefront Shell, Navigation, Homepage, and Category & Search Discovery

## 1. Observation

### 1.1 Existing Workspace & Brand Baseline
- **Design Tokens**: `design/tokens.css` defines the authoritative single-source-of-truth palette:
  - Ink: `#182336` (`--tc-ink`)
  - Primary Cobalt: `#2450B8` (`--tc-primary`), Hover: `#193F99` (`--tc-primary-hover`)
  - Signature Accent Action Lime: `#DDF16A` (`--tc-action-lime`), Hover: `#CFDE53` (`--tc-lime-hover`)
  - Canvas: `#F7F8F5` (`--tc-canvas`)
  - Soft Surface / AI: `#EAF0FF` (`--tc-surface-soft`)
  - Graphite: `#252D30` (`--tc-graphite`)
  - Accessible Secondary Text: `#596B70` (`--tc-text-secondary`)
  - Pure-white-only Secondary Text: `#66767A` (`--tc-steel-grey-on-white-only`)
  - Functional Border: `#7C8A94` (`--tc-border-strong`)
  - Decorative Border: `#D8E0E5` (`--tc-border`)
- **Prohibitions**: Strict ban on retired copper (`#B84C32` / `--tc-copper`), purple, violet, lavender, and teal branding. White text on Action Lime is strictly prohibited due to severe WCAG failure (contrast ratio 1.25:1). Lime controls on light surfaces require a mandatory 2px solid Ink `#182336` border (`border-2 border-tc-ink`).
- **Typography**: `app/layout.tsx` (lines 5-17) imports Google fonts:
  - Headings: `Manrope` (weights 600, 700, 800) configured via `--font-heading`
  - Body/UI: `IBM_Plex_Sans` (weights 400, 500, 600, 700) configured via `--font-body`
  - Numerical alignment: `app/globals.css` (lines 35-39) provides `.tabular-nums` (`font-variant-numeric: tabular-nums`).
- **Tailwind Mapping**: `tailwind.config.ts` (lines 12-59) maps semantic tokens `brand`, `accent`, `ink`, `canvas`, `ai-surface`, `body-muted`, and `functional-outline`.
- **Existing UI Primitives**: Verified existing primitives in `src/components/ui/`:
  - `Button` (`src/components/ui/button.tsx`): supports `variant="primary"` (Cobalt, white text), `variant="accent"` (Lime, Ink text, 2px Ink border), `variant="outline"`, `variant="ghost"`, and `asChild`.
  - `SearchInput` (`src/components/ui/search-input.tsx`): supports clear button, accessible search icon, and 1.8px strong border.
  - `FilterPill` (`src/components/ui/filter-pill.tsx`): supports active state (`primary` Cobalt or `accent` Lime), count indicator, and dismiss icon.
  - `Badge` (`src/components/ui/badge.tsx`), `Card` (`src/components/ui/card.tsx`), `Dialog` (`src/components/ui/dialog.tsx`), `Drawer` (`src/components/ui/drawer.tsx`), `SpecTable` (`src/components/ui/spec-table.tsx`).
- **Supplier Catalog Baseline**:
  - `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` contains 115 rows from Status International (UK) Ltd.
  - All SKUs are prefixed with `ION` (e.g. `IONPVCMC5PKX6`, `IONSDRIVERS4P10`, `IONMT48MM1PKX24`, `ION16OZSCHAM1P6`).
  - Barcodes contain 13-digit EAN-13 GTINs (e.g. `5022822224834`) and 14-digit carton barcodes (`05022822228559`).
  - Text contains Unicode ligatures such as `\ufb02` (`fl` in `4 pc Screwdriver set - ﬂathead...`) and `Ø` (`\u00d8` in `Neon Tester - Ø3x140mm...`) that caused `cp1252` encoding errors when raw printed, proving normalization is required.
- **Reference Prototype**: `prototype/index.html` (lines 84-99) outlines the required DOM structure:
  - Top notice banner: "UI CONCEPT ONLY · NOT A LIVE STORE · TOOLCART BRAND NOT YET CLEARED"
  - Utility microbar: "Practical tools, hardware & help for the job"
  - Brand header with `TOOLCART` Manrope wordmark and Action Lime badge with Ink cart icon
  - Primary category sub-navigation bar in Cobalt `#2450B8`
  - Two-column hero with H1 "The right tools. The right advice.", Cobalt primary CTA, Action Lime secondary CTA
  - "Our Customer Promise" card with AI assistant prompt teaser
  - 6-category grid ("Hand tools", "Bits & accessories", "Fixings & security", "Decorating", "Measuring", "Workwear & safety")
  - Footer in Ink `#182336`.
- **Existing Test Suite Baseline**:
  - `vitest run`: 55 tests passed in 3 test files (`tests/brand/brand-compliance.test.ts`, `tests/ui/primitives.test.tsx`, `tests/adversarial/primitives-adversarial.test.tsx`).
  - `python qa/check_static.py`: Exited code 0 ("PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix").
  - `python -m pytest tests`: 9 tests passed in 0.20s.

---

## 2. Logic Chain

### 2.1 Storefront Shell & Navigation
1. **Hydration-Safe Global VAT Toggle**:
   - *Observation*: UK hardware customers are split between trade buyers (who evaluate costs Ex. VAT) and consumers/DIYers (who legally require Inc. VAT prices). The toggle must re-render all visible prices across the entire application instantly without page refresh, but must also be SSR-compatible without hydration layout shift.
   - *Logic*: Implement a `VatContext` (`src/context/vat-context.tsx`) backed by both client state and a persistent cookie (`toolcart_vat_mode=inc` or `ex`).
   - *SSR Strategy*: In Next.js App Router, `app/(storefront)/layout.tsx` reads `cookies().get('toolcart_vat_mode')?.value` server-side and passes `initialMode` to `<VatProvider initialMode={...}>`. This guarantees initial server HTML matches client state on hydration.
   - *Price Math*: UK Standard VAT rate is 20% (`VAT_RATE = 0.20`).
     - If base is `retail_price_ex_vat_gbp`, then `inc = ex * 1.20`.
     - When mode is `'inc'`: Primary display is `£XX.XX inc. VAT` (bold, large), Secondary subtext is `£YY.YY ex. VAT` (muted, smaller).
     - When mode is `'ex'`: Primary display is `£YY.YY ex. VAT` (bold, large), Secondary subtext is `£XX.XX inc. VAT` (muted, smaller).
     - All numbers use `tabular-nums` formatting to prevent layout jitter on toggle.

2. **Top Utility Microbar (`src/components/storefront/microbar.tsx`)**:
   - *Observation*: Brand status is provisional, and operational gates require plain disclosure of delivery limitations and staging status.
   - *Logic*: Build a 2-tier microbar:
     - Top Tier (Legal Notice): Ink `#182336` background, white text (`text-xs font-semibold py-1 px-4 text-center tracking-wider`), stating: "STAGING PROTOTYPE · TOOLCART BRAND PROVISIONAL · AVAILABILITY SUBJECT TO CONFIRMATION".
     - Bottom Tier (Utility Bar): Cloud Blue `#EAF0FF` background, Ink `#182336` / Steel Text `#596B70` text (`text-xs py-1.5 px-4`), containing:
       - Left: "UK Trade & DIY Hardware Supplies" • Delivery Policy Link (`/delivery`) • Customer Support Link (`/contact`)
       - Right: Global VAT Toggle (`VatToggle` component) • Trade Portal Link (`/trade`).
   - *Contrast Verification*: Text on Cloud Blue `#EAF0FF` must use Steel Text `#596B70` (contrast ratio 4.89:1 >= 4.5:1) or Ink `#182336` (contrast ratio 11.8:1 >= 4.5:1). Never Steel Grey `#66767A` (fails on Cloud Blue).

3. **Sticky Header (`src/components/storefront/header.tsx`)**:
   - *Observation*: Brand requires Manrope 850 wordmark, Action Lime badge with Ink cart icon, responsive search, basket drawer trigger, and category links.
   - *Logic*:
     - Container: `sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tc-border`.
     - Brand Wordmark: Link to `/`, containing:
       - Cart Badge: `div` styled as `w-9 h-9 rounded-lg bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center mr-2 shadow-sm`.
       - SVG Icon: Lucide `ShoppingCart` with stroke `#182336`, strokeWidth 2.5, size 18px.
       - Text: `TOOLCART` in `font-heading font-extrabold text-2xl lg:text-3xl tracking-[-0.04em] text-tc-ink`.
     - Search Bar: Prominent center search input using `SearchInput` component with live suggestions popover on typing, debounced navigation to `/search?q=...`.
     - Actions: AI Assistant trigger ("Ask ToolCart AI"), Trade Portal link, Account link, Basket drawer button with Action Lime count badge.
     - Mobile View (<768px): Hamburger button opening `MobileNav` slide-over drawer, compact brand wordmark, full-width search bar below or modal.

4. **Category Sub-Navigation Bar (`src/components/storefront/nav-bar.tsx`)**:
   - *Observation*: `prototype/index.html` lines 28-30 and `docs/03_UX_INFORMATION_ARCHITECTURE.md` prescribe a primary navigation bar in Cobalt `#2450B8`.
   - *Logic*: Render an accessible `<nav aria-label="Product categories">` with `bg-tc-primary text-white border-b border-tc-primary-hover shadow-xs`.
   - Links: `Tools`, `Bits & Accessories`, `Fixings & Security`, `Decorating`, `Measuring`, `Workwear & Safety`, `Tapes & Consumables`, `Shop by Job`, `Buying Guides`, `Trade`.
   - Contrast check: White text on Cobalt `#2450B8` is **7.21:1** (passes WCAG AAA).

5. **Footer (`src/components/storefront/footer.tsx`)**:
   - *Observation*: `prototype/index.html` line 74 and `docs/02_BRAND_IDENTITY.md` mandate Ink `#182336` background with verified legal, trade, and customer support links.
   - *Logic*: 5-column layout:
     - Col 1-2: Brand Overview, positioning ("The right tools. The right advice."), staging disclaimer.
     - Col 3: Product Categories (Hand Tools, Bits, Fixings, Decorating, Measuring, Workwear).
     - Col 4: Help & Advice (Buying Guides, Delivery & Fulfilment, Returns, Specifications, Support).
     - Col 5: Trade & Governance (Trade Accounts, VAT Invoicing, Terms of Sale, Privacy, UKCA Standards).
     - Bottom strip: Registered in England & Wales notice, VAT 20% notice, accessibility statement.
   - Text colors: Headings in White, body text in `#DFE8F6` / `#E1E7F0` (contrast > 12:1 against Ink).

---

### 2.2 Homepage (`/`) Architecture
1. **Hero Section (`src/components/storefront/hero-banner.tsx`)**:
   - *Observation*: Dispatch specifies 2-column hero: H1 "The right tools. The right advice.", Cobalt primary CTA "Shop tools & hardware", Action Lime secondary CTA with 2px Ink border "Help me choose".
   - *Logic*:
     - Grid: `grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center`.
     - Left Column:
       - Eyebrow: `TOOLS • HARDWARE • FIXINGS • TRADE` in `text-xs font-extrabold tracking-[0.15em] text-tc-primary uppercase`.
       - H1: `The right tools. The right advice.` in Manrope 800 (`font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-tc-ink tracking-tight`).
       - Lead Paragraph: "Shop hardware and everyday project supplies. Search by product or tell us what you're working on—we'll help you narrow it down." (Graphite `#252D30`, 17px).
       - Button Group:
         - Primary CTA: `<Button variant="primary" size="lg" asChild><Link href="/categories/tools">Shop tools & hardware</Link></Button>` (`bg-tc-primary text-white`).
         - Secondary CTA: `<Button variant="accent" size="lg" asChild><Link href="/projects">Help me choose</Link></Button>` (`bg-tc-action-lime text-tc-ink border-2 border-tc-ink`).
     - Right Column:
       - `PromiseCard`:
         - Surface: Cloud Blue `#EAF0FF` (`bg-tc-surface-soft border border-[#C8D9F9] rounded-card p-6 shadow-sm`).
         - Eyebrow: "OUR CUSTOMER PROMISE — PROPOSED" in Cobalt `#2450B8`.
         - Heading: "Less guesswork. Better choices." in Manrope 700.
         - Body: "Clear product sizes, pack quantities and relevant options help you make an informed choice before you order. Backed by verified UK supplier catalogues."
         - Trust Bullets: Verified specs (GTIN-13, MPN), Honest stock status ("Confirmed in stock" vs "Subject to confirmation"), Transparent delivery calculation.
         - Interactive AI prompt teaser: `bg-white/80 border border-[#C8D9F9] rounded-xl p-4 mt-4`, prompt "“I need fixings for a shelf—what should I check?”", button triggering the global AI Assistant drawer.

2. **6 Primary Category Grid (`src/components/storefront/category-grid.tsx`)**:
   - *Observation*: Dispatch specifies 6 primary categories matching supplier families:
     1. `Hand tools` (`/tools` / `/categories/tools`): Screwdrivers, pliers, hammers, saws.
     2. `Bits & accessories` (`/categories/bits-accessories`): Drill bits, driver sets, abrasives.
     3. `Fixings & security` (`/fixings` / `/categories/fixings-security`): Wall plugs, screws, bolts, padlocks.
     4. `Decorating` (`/decorating` / `/categories/decorating`): Brushes, rollers, trays, masking tape.
     5. `Measuring` (`/categories/measuring`): Tape measures, spirit levels, squares.
     6. `Workwear & safety` (`/ppe` / `/categories/workwear-safety`): Gloves, eye protection, site safety.
   - *Card Design*:
     - Surface: Pure White (`bg-white`), border `border-tc-border`, rounded `rounded-card`, hover `hover:border-[#94A8C9] hover:shadow-md transition-all`.
     - Icon container: Cloud Blue `#EAF0FF` rounded box (`w-14 h-14 rounded-xl flex items-center justify-center text-tc-primary`).
     - Typography: Title in Manrope 700 (`text-base text-tc-ink`), description in Steel Text `#596B70` (`text-xs`), item count tag.

3. **Project Kits Showcase Teaser (`src/components/storefront/project-teaser.tsx`)**:
   - *Observation*: `docs/08_CONTENT_AND_COPY_DECK.md` and R1 define 3 curated project kits:
     1. Domestic Electrical Tape & Consumables Kit (£14.50 inc. VAT)
     2. Painting & Masking Prep Kit (£18.95 inc. VAT)
     3. Essential Site Torch & Extension Lead Kit (£27.50 inc. VAT)
   - *Logic*: Render a teaser row with kit summary cards, pack breakdown, dual pricing, and "View Kit & Add to Basket" button linking to `/projects`.

4. **Interactive AI Product & Project Assistant Trigger**:
   - *Observation*: Users need a prominent trigger on homepage to get guided recommendations without safety hallucination.
   - *Logic*: Dedicated interactive banner + floating trigger button triggering the global AI Assistant drawer (`useAiAssistant().open()`).

---

### 2.3 Category & Search Discovery Architecture
1. **Search & Category Route System**:
   - `/search`: Main search results page (`?q=...&category=...&brand=...&sort=...&min_price=...&max_price=...`).
   - `/categories/[slug]`: Specific Category PLP (`slug` = `tools`, `bits-accessories`, `fixings-security`, `decorating`, `measuring`, `workwear-safety`, `tapes-consumables`).
   - Aliases: Dedicated routes `/tools`, `/fixings`, `/electrical`, `/decorating`, `/ppe`, `/site-equipment` that render the catalog discovery interface with preset category filters.

2. **Instant Lexical Search Engine (`src/lib/search/search-engine.ts`)**:
   - *Observation*: Users search by diverse terms: tool names ("screwdriver"), brand names ("Ionos"), supplier SKUs ("IONSDRIVERS4P10"), and 13-digit EAN barcodes ("5022822224834"). Text contains ligatures (`\ufb02`, `\ufb01`, `Ø`).
   - *Logic*:
     - Normalization: String lowercased, ligatures replaced (`ﬁ`->`fi`, `ﬂ`->`fl`, `Ø`->`Ø`), punctuation cleaned.
     - Multi-Field Match Scoring:
       - Exact GTIN-13 / EAN-13 barcode match: Score = 1000
       - Exact Carton Barcode match: Score = 900
       - Exact SKU match: Score = 800
       - Partial SKU match: Score = 400
       - Full Title match: Score = 200
       - Title token match: Score = 50 * matching token count
       - Description token match: Score = 10 * matching token count
       - Brand match: Score = 100
     - Results sorted by score descending, with secondary sort by title.

3. **Multi-Attribute Faceted Filtering (`src/components/storefront/facet-filters.tsx`)**:
   - *Facets Supported*:
     - **Category**: Hand tools, Bits & accessories, Fixings & security, Decorating, Measuring, Workwear & safety, Tapes & consumables.
     - **Brand**: Ionos, Status International.
     - **Pack Size**: 1 pk, 2 pk, 4 pk, 5 pk, 6 pk, 10 pk, 12 pk, 24 pk, Assortment (100+ pcs).
     - **Availability Status**: `in_stock` ("Confirmed in stock"), `subject_to_confirmation` ("Subject to confirmation").
     - **Price Range**: Min and Max price filters (calculated based on active VAT mode).
   - *Dynamic Facet Counts*: Every facet option displays count `(N)` representing matching products if that facet were selected alongside current other filters.
   - *Active Filter Chips*: Selected filters render above the grid as `FilterPill` elements with remove `(x)` actions + "Clear all" button.

4. **URL Query Synchronization (`useQuerySync`)**:
   - All filter selections, search queries, sort orders, and pagination synchronize with URL query parameters:
     `/search?q=tape&category=decorating&pack_size=24+pk&sort=price_asc`
   - Uses `useRouter()`, `usePathname()`, and `useSearchParams()` with shallow updates (`router.replace(url, { scroll: false })`) to enable bookmarking, browser back/forward buttons, and shareable URLs without full page reloads.

5. **Zero-Results State & UK Hardware Synonym Recovery (`src/components/storefront/zero-results.tsx` & `src/lib/search/synonyms.ts`)**:
   - *Observation*: Hardware shoppers frequently search using UK colloquialisms, brand eponyms, or alternate spellings: e.g. "sellotape" (for packaging tape), "duck tape" or "gaffer tape" (for cloth tape), "rawplug" or "rawlplug" (for wall plugs), "spirit level" / "bubble level", "allen key" (for hex key), "voltage tester" (for neon tester).
   - *Logic*:
     - When search returns 0 products, the query is analyzed against `HARDWARE_SYNONYM_MAP`.
     - If matched, display:
       - Heading: "We couldn't find any direct matches for '`[query]`'."
       - Suggestion Banner: "Did you mean: **[suggested synonym]**?" with a 1-click link to `/search?q=[suggested synonym]`.
       - Popular Category quick-browse buttons (6 primary categories).
       - AI Assistant Prompt: "Not sure what product fits your task? Ask ToolCart AI for help."

6. **Product Card in Discovery Grid (`src/components/storefront/product-card.tsx`)**:
   - Surface: Pure White (`bg-white`) on Workshop White (`bg-tc-canvas`).
   - Image visual: Verified image thumbnail or high-fidelity category fallback SVG.
   - Badges: Category pill, UKCA/CE compliance badge (if verified), and stock status badge:
     - `in_stock`: Confirmed in stock (`bg-emerald-50 text-emerald-800 border border-emerald-200`)
     - `subject_to_confirmation`: Subject to confirmation (`bg-amber-50 text-amber-800 border border-amber-200`)
   - Identifiers: SKU and GTIN-13 barcode rendered in `tabular-nums` (`text-xs text-tc-text-secondary`).
   - Pricing: Dual display reflecting active VAT mode:
     - When `vatMode === 'inc'`: **£XX.XX inc. VAT** (large, bold) / £YY.YY ex. VAT (subtext).
     - When `vatMode === 'ex'`: **£YY.YY ex. VAT** (large, bold) / £XX.XX inc. VAT (subtext).
   - CTAs: "View Details" linking to `/products/[slug]`, and "Compare" toggle triggering the comparison drawer.

---

## 3. Caveats
1. **Catalog Data Dependency**: The Storefront Shell and Discovery components depend on `PublicProductDTO` and loader helpers from `src/lib/catalog/` (owned by Explorer M2.3). The interfaces specified here are drop-in compatible with `schemas/product_contract.schema.json` and `src/types/product.ts`.
2. **AI Modal & Compare Drawer Integration**: The trigger buttons designed for the Storefront Shell (AI Assistant button and Compare checkboxes) dispatch events / hooks to the AI Modal and Compare Drawer (owned by Explorer M2.2). The state contracts are decoupled via React Context / custom events.
3. **Checkout Gating**: As established by `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`, quick-add and cart buttons must respect `STAGING_ONLY=true` and `sellability_status === 'draft'` so no live financial commitments are executed without founder sign-off.
4. **Font Loading**: `app/layout.tsx` loads `Manrope` and `IBM_Plex_Sans` via `next/font/google`. In offline/airgapped environments, font fallbacks (`system-ui`, `Arial`, `sans-serif`) are properly declared in Tailwind theme and `tokens.css`.

---

## 4. Conclusion & Concrete Implementation Specification

### 4.1 File Inventory for Milestone 2.1
The following files must be authored in the implementation phase:

| Path | Purpose | Key Exports / Responsibilities |
|---|---|---|
| `src/context/vat-context.tsx` | Global VAT state & cookie persistence | `VatProvider`, `useVat()`, `VatMode` (`'inc' \| 'ex'`) |
| `src/lib/utils/currency.ts` | Currency and VAT price calculation | `formatGbp()`, `calculateVatPrices()`, `getVatDisplay()` |
| `src/lib/search/synonyms.ts` | UK hardware synonyms & spell correction | `HARDWARE_SYNONYM_MAP`, `getSynonymSuggestion()` |
| `src/lib/search/search-engine.ts` | Lexical search, GTIN/SKU matching, faceting | `executeLexicalSearch()`, `calculateFacetCounts()`, `sortProducts()` |
| `src/components/storefront/vat-toggle.tsx` | Accessible segmented toggle switch | `VatToggle` component (`role="radiogroup"`) |
| `src/components/storefront/microbar.tsx` | Top utility microbar & merchant notice | `Microbar` component with delivery links & staging badge |
| `src/components/storefront/header.tsx` | Sticky header with Manrope 850 & Lime badge | `StorefrontHeader` with search, cart badge, and nav triggers |
| `src/components/storefront/nav-bar.tsx` | Category sub-navigation bar in Cobalt | `StorefrontNavBar` with 10 primary category links |
| `src/components/storefront/mobile-nav.tsx` | Mobile slide-over navigation drawer | `MobileNavDrawer` with touch targets >= 44px |
| `src/components/storefront/footer.tsx` | Ink `#182336` footer with trust/legal links | `StorefrontFooter` with 5 columns and copyright bar |
| `src/components/storefront/hero-banner.tsx` | 2-column hero with H1, Cobalt & Lime CTAs | `HeroBanner` with H1 and two prominent CTAs |
| `src/components/storefront/promise-card.tsx` | Cloud Blue `#EAF0FF` Customer Promise card | `PromiseCard` with transparency bullets and AI prompt |
| `src/components/storefront/category-grid.tsx` | 6 primary category cards | `CategoryGrid` with icons, descriptions, and link tags |
| `src/components/storefront/project-teaser.tsx` | 3 curated project kits preview row | `ProjectTeaser` with kits from Content Deck |
| `src/components/storefront/product-card.tsx` | Discovery product card with dual VAT price | `ProductCard` with stock badge, GTIN, and compare button |
| `src/components/storefront/facet-filters.tsx` | Multi-attribute faceted filter sidebar/drawer | `FacetFilters` with dynamic counts and `FilterPill` chips |
| `src/components/storefront/zero-results.tsx` | 0-results state with synonym suggestions | `ZeroResultsState` with did-you-mean prompts |
| `src/components/storefront/search-bar.tsx` | Search input with live suggestion flyout | `SearchBar` with debounced input and keyboard navigation |
| `app/(storefront)/layout.tsx` | Storefront layout wrapping shell & VAT context | Server component reading VAT cookie and rendering shell |
| `app/(storefront)/page.tsx` | Comprehensive Homepage implementation | Assembles Hero, Promise, Categories, Kits, Guides, AI Trigger |
| `app/(storefront)/search/page.tsx` | Search Discovery page with URL query sync | Faceted search view with sidebar, sort, and product grid |
| `app/(storefront)/categories/[slug]/page.tsx` | Dynamic Category PLP | Category listing with category-specific breadcrumb and filters |
| `app/(storefront)/tools/page.tsx` | Shortcut alias for Hand Tools | Wraps Category PLP for `tools` |
| `app/(storefront)/fixings/page.tsx` | Shortcut alias for Fixings & Security | Wraps Category PLP for `fixings-security` |
| `app/(storefront)/electrical/page.tsx` | Shortcut alias for Electrical & Tapes | Wraps Category PLP for `electrical` |
| `app/(storefront)/decorating/page.tsx` | Shortcut alias for Decorating | Wraps Category PLP for `decorating` |
| `app/(storefront)/ppe/page.tsx` | Shortcut alias for PPE & Workwear | Wraps Category PLP for `workwear-safety` |
| `app/(storefront)/site-equipment/page.tsx` | Shortcut alias for Site Equipment | Wraps Category PLP for `site-equipment` |

---

### 4.2 Exact Code & Component Specifications

#### A. VAT Context & Cookie Persistence (`src/context/vat-context.tsx`)
```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type VatMode = 'inc' | 'ex';

interface VatContextValue {
  vatMode: VatMode;
  setVatMode: (mode: VatMode) => void;
  toggleVatMode: () => void;
}

const VatContext = createContext<VatContextValue | undefined>(undefined);

export function VatProvider({
  initialMode = 'inc',
  children,
}: {
  initialMode?: VatMode;
  children: React.ReactNode;
}) {
  const [vatMode, setVatModeState] = useState<VatMode>(initialMode);

  const setVatMode = (mode: VatMode) => {
    setVatModeState(mode);
    if (typeof document !== 'undefined') {
      document.cookie = `toolcart_vat_mode=${mode}; path=/; max-age=31536000; SameSite=Lax`;
    }
  };

  const toggleVatMode = () => {
    setVatMode(vatMode === 'inc' ? 'ex' : 'inc');
  };

  return (
    <VatContext.Provider value={{ vatMode, setVatMode, toggleVatMode }}>
      {children}
    </VatContext.Provider>
  );
}

export function useVat() {
  const context = useContext(VatContext);
  if (!context) {
    throw new Error('useVat must be used within a VatProvider');
  }
  return context;
}
```

#### B. Currency & VAT Math Helper (`src/lib/utils/currency.ts`)
```typescript
import { VatMode } from '@/context/vat-context';

export const UK_VAT_RATE = 0.20;

export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function calculateVatPrices(priceExVat: number, priceIncVat?: number) {
  const ex = Number(priceExVat.toFixed(2));
  const inc = priceIncVat !== undefined ? Number(priceIncVat.toFixed(2)) : Number((ex * (1 + UK_VAT_RATE)).toFixed(2));
  return { ex, inc };
}

export function getPriceDisplay(
  priceExVat: number,
  vatMode: VatMode,
  priceIncVat?: number
) {
  const { ex, inc } = calculateVatPrices(priceExVat, priceIncVat);
  if (vatMode === 'inc') {
    return {
      primaryPrice: formatGbp(inc),
      primaryLabel: 'inc. VAT',
      secondaryPrice: formatGbp(ex),
      secondaryLabel: 'ex. VAT',
      mainAmount: inc,
    };
  }
  return {
    primaryPrice: formatGbp(ex),
    primaryLabel: 'ex. VAT',
    secondaryPrice: formatGbp(inc),
    secondaryLabel: 'inc. VAT',
    mainAmount: ex,
  };
}
```

#### C. VAT Toggle UI Component (`src/components/storefront/vat-toggle.tsx`)
```typescript
'use client';

import React from 'react';
import { useVat } from '@/context/vat-context';
import { cn } from '@/lib/utils';

export function VatToggle({ className }: { className?: string }) {
  const { vatMode, setVatMode } = useVat();

  return (
    <div
      role="radiogroup"
      aria-label="VAT Pricing Mode"
      className={cn(
        'inline-flex items-center rounded-full bg-tc-canvas p-0.5 border border-tc-border-strong text-xs font-semibold select-none',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={vatMode === 'inc'}
        onClick={() => setVatMode('inc')}
        className={cn(
          'rounded-full px-2.5 py-1 transition-all',
          vatMode === 'inc'
            ? 'bg-tc-ink text-white shadow-xs font-bold'
            : 'text-tc-text-secondary hover:text-tc-ink'
        )}
      >
        Inc. VAT
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={vatMode === 'ex'}
        onClick={() => setVatMode('ex')}
        className={cn(
          'rounded-full px-2.5 py-1 transition-all',
          vatMode === 'ex'
            ? 'bg-tc-ink text-white shadow-xs font-bold'
            : 'text-tc-text-secondary hover:text-tc-ink'
        )}
      >
        Ex. VAT <span className="text-[10px] uppercase font-normal opacity-80">(Trade)</span>
      </button>
    </div>
  );
}
```

#### D. Header Specification (`src/components/storefront/header.tsx`)
```tsx
// Key elements:
// 1. Manrope 850 wordmark:
<Link href="/" className="flex items-center gap-2 group select-none">
  <div className="w-9 h-9 rounded-lg bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
    <ShoppingCart className="w-5 h-5 text-tc-ink stroke-[2.5]" />
  </div>
  <span className="font-heading font-[850] text-2xl lg:text-3xl tracking-[-0.04em] text-tc-ink">
    TOOLCART
  </span>
</Link>

// 2. Search bar with SearchInput:
<div className="flex-1 max-w-xl mx-4 hidden md:block">
  <SearchBar />
</div>

// 3. Actions:
<div className="flex items-center gap-3">
  <Button variant="outline" size="sm" asChild className="hidden lg:inline-flex">
    <Link href="/trade">Trade Portal</Link>
  </Button>
  <Button variant="ghost" size="sm" onClick={openAiAssistant} className="hidden sm:inline-flex items-center gap-1.5 text-tc-primary">
    <Sparkles className="w-4 h-4" />
    <span>Ask ToolCart AI</span>
  </Button>
  <Link href="/basket" className="relative p-2 rounded-lg text-tc-ink hover:bg-tc-surface-soft transition-colors" aria-label="View basket">
    <ShoppingBag className="w-6 h-6" />
    {itemCount > 0 && (
      <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] rounded-full bg-tc-action-lime border border-tc-ink text-tc-ink font-bold text-[11px] flex items-center justify-center tabular-nums px-1">
        {itemCount}
      </span>
    )}
  </Link>
</div>
```

#### E. Two-Column Hero Specification (`src/components/storefront/hero-banner.tsx`)
```tsx
<section className="bg-tc-canvas border-b border-tc-border py-12 lg:py-16">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12 items-center">
      {/* Left Column */}
      <div>
        <span className="text-xs font-extrabold tracking-[0.15em] text-tc-primary uppercase">
          TOOLS • HARDWARE • FIXINGS • TRADE
        </span>
        <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-tc-ink tracking-tight mt-3 leading-[1.1]">
          The right tools.<br />The right advice.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-tc-graphite max-w-xl leading-relaxed">
          Shop hardware and everyday project supplies. Search by product or tell us what you're working on—we'll help you narrow it down.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button variant="primary" size="lg" asChild>
            <Link href="/categories/tools">Shop tools &amp; hardware</Link>
          </Button>
          <Button variant="accent" size="lg" asChild>
            <Link href="/projects">Help me choose</Link>
          </Button>
        </div>
      </div>

      {/* Right Column: Promise Card */}
      <PromiseCard />
    </div>
  </div>
</section>
```

#### F. Customer Promise Card Specification (`src/components/storefront/promise-card.tsx`)
```tsx
<aside className="rounded-card border border-[#C8D9F9] bg-tc-surface-soft p-6 lg:p-8 shadow-sm">
  <span className="text-xs font-bold tracking-wider text-tc-primary uppercase">
    OUR CUSTOMER PROMISE — PROPOSED
  </span>
  <h2 className="font-heading text-2xl font-bold text-tc-ink mt-2">
    Less guesswork. Better choices.
  </h2>
  <p className="mt-2 text-sm text-tc-graphite leading-relaxed">
    Clear product sizes, pack quantities and relevant options help you make an informed choice before you order. Backed by verified UK supplier catalogues.
  </p>

  <ul className="mt-4 space-y-2 text-xs text-tc-text-secondary font-medium">
    <li className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0" />
      <span>Verified supplier catalog specs (GTIN-13, MPN, pack units)</span>
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0" />
      <span>Honest availability: Confirmed in stock vs Subject to confirmation</span>
    </li>
    <li className="flex items-center gap-2">
      <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0" />
      <span>Transparent carriage and multi-supplier dispatch grouping</span>
    </li>
  </ul>

  {/* AI Teaser Box */}
  <div className="mt-5 rounded-xl border border-[#C8D9F9] bg-white/90 p-4">
    <strong className="block text-xs font-bold text-tc-primary">
      Ask ToolCart (Planned AI Assistant)
    </strong>
    <p className="mt-1 text-xs text-tc-ink italic">
      “I need fixings for a shelf—what should I check?”
    </p>
    <button
      type="button"
      onClick={triggerAiAssistant}
      className="mt-3 text-xs font-bold text-tc-primary flex items-center gap-1 hover:underline"
    >
      Start project query →
    </button>
  </div>
</aside>
```

#### G. Lexical Search & Facet Engine (`src/lib/search/search-engine.ts`)
```typescript
import { PublicProductDTO } from '@/types/product';
import { VatMode } from '@/context/vat-context';
import { HARDWARE_SYNONYM_MAP } from './synonyms';

export interface FilterState {
  query?: string;
  category?: string[];
  brand?: string[];
  pack_size?: string[];
  availability?: string[];
  min_price?: number;
  max_price?: number;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc';
}

export function normalizeSearchText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/\u00d8/g, 'Ø')
    .replace(/[^\w\sØ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function executeLexicalSearch(
  products: PublicProductDTO[],
  filters: FilterState,
  vatMode: VatMode
): { items: PublicProductDTO[]; totalCount: number; synonymSuggestion?: string } {
  const rawQuery = (filters.query || '').trim();
  const normQuery = normalizeSearchText(rawQuery);
  const tokens = normQuery ? normQuery.split(' ').filter(Boolean) : [];

  // Check synonym map if no products match
  let synonymSuggestion: string | undefined;
  if (normQuery && HARDWARE_SYNONYM_MAP[normQuery]) {
    synonymSuggestion = HARDWARE_SYNONYM_MAP[normQuery];
  }

  // 1. Scoring & Query Filtering
  let scored = products.map((product) => {
    let score = 0;
    if (!tokens.length) {
      return { product, score: 1 };
    }

    const gtin = product.gtin ? product.gtin.trim() : '';
    const sku = (product.supplier_sku || '').toLowerCase();
    const title = normalizeSearchText(product.title);
    const desc = normalizeSearchText(product.description || '');
    const brand = (product.brand || '').toLowerCase();

    // Exact GTIN barcode match
    if (gtin && rawQuery === gtin) score += 1000;
    // Exact SKU match
    if (sku && rawQuery.toLowerCase() === sku) score += 800;
    else if (sku && sku.includes(rawQuery.toLowerCase())) score += 400;

    // Title token matches
    for (const t of tokens) {
      if (title.includes(t)) score += 50;
      if (desc.includes(t)) score += 10;
      if (brand.includes(t)) score += 100;
    }

    if (title.includes(normQuery)) score += 200;

    return { product, score };
  });

  if (tokens.length > 0) {
    scored = scored.filter((s) => s.score > 0);
  }

  // 2. Facet Filtering
  let filtered = scored.map((s) => s.product);

  if (filters.category && filters.category.length > 0) {
    filtered = filtered.filter((p) => filters.category!.includes(p.category.toLowerCase()));
  }
  if (filters.brand && filters.brand.length > 0) {
    filtered = filtered.filter((p) => filters.brand!.includes(p.brand.toLowerCase()));
  }
  if (filters.availability && filters.availability.length > 0) {
    filtered = filtered.filter((p) => filters.availability!.includes(p.availability_status));
  }
  if (filters.min_price !== undefined) {
    filtered = filtered.filter((p) => {
      const price = vatMode === 'inc' ? p.retail_price_inc_vat_gbp : p.retail_price_ex_vat_gbp;
      return price >= filters.min_price!;
    });
  }
  if (filters.max_price !== undefined) {
    filtered = filtered.filter((p) => {
      const price = vatMode === 'inc' ? p.retail_price_inc_vat_gbp : p.retail_price_ex_vat_gbp;
      return price <= filters.max_price!;
    });
  }

  // 3. Sorting
  const sortMode = filters.sort || (tokens.length ? 'relevance' : 'name_asc');
  filtered.sort((a, b) => {
    const priceA = vatMode === 'inc' ? a.retail_price_inc_vat_gbp : a.retail_price_ex_vat_gbp;
    const priceB = vatMode === 'inc' ? b.retail_price_inc_vat_gbp : b.retail_price_ex_vat_gbp;

    if (sortMode === 'price_asc') return priceA - priceB;
    if (sortMode === 'price_desc') return priceB - priceA;
    if (sortMode === 'name_asc') return a.title.localeCompare(b.title);
    if (sortMode === 'name_desc') return b.title.localeCompare(a.title);
    if (sortMode === 'relevance') {
      const scoreA = scored.find((s) => s.product.id === a.id)?.score || 0;
      const scoreB = scored.find((s) => s.product.id === b.id)?.score || 0;
      return scoreB - scoreA;
    }
    return 0;
  });

  return { items: filtered, totalCount: filtered.length, synonymSuggestion };
}
```

---

## 5. Verification Method

### 5.1 Independent Test Commands
Once the implementation is populated, verify compliance using:

1. **Brand Static & WCAG Consistency**:
   ```powershell
   python qa/check_static.py
   ```
   *Expected output*: `PASS: CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix`.

2. **Unit & Component Tests**:
   ```powershell
   npm test
   ```
   *Expected output*: 100% test pass on Vitest test suite (`tests/brand/brand-compliance.test.ts`, `tests/ui/primitives.test.tsx`, `tests/adversarial/primitives-adversarial.test.tsx`, and new storefront shell tests).

3. **Python Compliance Tests**:
   ```powershell
   python -m pytest tests
   ```
   *Expected output*: 9 passed in 0.20s.

4. **Next.js Production Build & Typecheck**:
   ```powershell
   npm run typecheck
   npm run build
   ```
   *Expected output*: Code 0, zero TypeScript errors, successful static page generation.

### 5.2 Files to Inspect
- `src/context/vat-context.tsx`: Verify cookie reading and state dispatch.
- `src/components/storefront/vat-toggle.tsx`: Verify accessibility attributes (`role="radiogroup"`, `aria-checked`).
- `src/components/storefront/header.tsx`: Verify Manrope 850 wordmark and Action Lime badge with 2px Ink border.
- `src/components/storefront/hero-banner.tsx`: Verify H1, Cobalt primary CTA, and Action Lime secondary CTA with 2px Ink outline.
- `src/components/storefront/promise-card.tsx`: Verify Cloud Blue background and Cobalt headings.
- `src/components/storefront/category-grid.tsx`: Verify 6 category cards matching catalog families.
- `app/(storefront)/search/page.tsx`: Verify URL query synchronization, facets, and 0-results synonym suggestions.

### 5.3 Invalidation Conditions
- Any occurrence of `#B84C32`, `--tc-copper`, or unapproved purple/teal.
- Any pairing of white text on Action Lime (`#DDF16A`).
- Any price display that does not re-render upon toggling VAT mode.
- Failure to find products when querying exact GTIN-13 barcodes or SKUs.
- Hydration error on page load caused by mismatched initial VAT mode.
