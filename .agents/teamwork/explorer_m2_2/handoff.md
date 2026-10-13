# Architectural Investigation & Strategy Handoff Report: Customer Storefront Experience (PDP, Compare Drawer, Project Kits & Guides, AI Assistant)

**Agent**: Explorer M2 (Instance 2)  
**Working Directory**: `e:\ToolCart\.agents\teamwork\explorer_m2_2`  
**Target Milestone**: Milestone 2 (Customer Storefront Experience)  
**Parent Conversation ID**: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`  
**Date**: 2026-10-12  

---

## 1. Observation

### 1.1 Existing UI Primitives and Design System (Milestone 1 Baseline)
- **`src/components/ui/spec-table.tsx`**:
  - Line 78 confirms `tabular-nums` formatting is already implemented:
    ```tsx
    <td className={cn('w-2/3 text-tc-graphite font-normal tabular-nums align-top border-b border-tc-border/60', compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm')}>
      {spec.value}
    </td>
    ```
  - Supports `specs: SpecItem[] | Record<string, string | number | undefined | null>` and `striped={true}` alternating background with `bg-tc-canvas/60` and hover `bg-tc-surface-soft/40`.
- **`src/components/ui/drawer.tsx`**:
  - Lines 36 and 63-65 confirm drawer supports `side="bottom"` and `isAIPanel`:
    ```tsx
    side: {
      bottom: 'inset-x-0 bottom-0 max-h-[85vh] rounded-t-[20px] border-t border-tc-border data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom',
      ...
    }
    // isAIPanel styling:
    isAIPanel && 'bg-tc-surface-soft border-[#C8D9F9]'
    ```
- **`src/components/ui/badge.tsx`**:
  - Lines 17-30 establish authoritative high-contrast badges:
    - Lime: `bg-tc-action-lime text-tc-ink border-[1.5px] border-tc-ink shadow-sm`
    - Subtle Green: `bg-[#E8F5E9] text-tc-success border border-[#A3D9B5]`
    - Subtle Warning: `bg-[#FFF7E8] text-tc-warning border border-[#E8CB91]`
    - Subtle Danger: `bg-[#FEECEB] text-tc-error border border-[#FECDCA]`
- **`src/components/ui/button.tsx`**:
  - Lines 11-14 define authoritative CTA variants:
    - `primary`: `bg-tc-primary text-white border-2 border-tc-primary hover:bg-tc-primary-hover` (Cobalt `#2450B8` on White, WCAG 7.21:1)
    - `accent`: `bg-tc-action-lime text-tc-ink border-2 border-tc-ink hover:bg-tc-lime-hover` (Ink on Lime with 2px Ink outline, WCAG 12.66:1)

### 1.2 Design Tokens and Brand Invariants
- **`design/tokens.css`**:
  - Lines 2-26 define CSS variables:
    - `--tc-ink: #182336;`
    - `--tc-primary: #2450B8;`
    - `--tc-primary-hover: #193F99;`
    - `--tc-action-lime: #DDF16A;`
    - `--tc-lime-hover: #CFDE53;`
    - `--tc-canvas: #F7F8F5;`
    - `--tc-surface-soft: #EAF0FF;`
    - `--tc-graphite: #252D30;`
    - `--tc-text-secondary: #596B70;`
    - `--tc-border: #D8E0E5;`
    - `--font-heading: 'Manrope', system-ui, sans-serif;`
    - `--font-body: 'IBM Plex Sans', system-ui, sans-serif;`
  - Line 36: `.tc-ai-panel {background:var(--tc-surface-soft); color:var(--tc-ink)}`
  - Zero occurrences of retired copper `#B84C32`, `--tc-copper`, purple, or teal across all source files.

### 1.3 Baseline Catalog and Product Domain Model
- **`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`**:
  - Total 115 quoted items from Status International (UK) Ltd.
  - Line 2: `IONPVCMC5PKX6`: 10 Mtr Status PVC Electrical Tape Mixed Colours - 5 pk, GTIN: `5022822224834`, carton barcode: `05022822228559`, unit cost ex VAT: `1.06`, units per case: `6`, case cost ex VAT: `6.36`.
  - Line 10: `IONMT48MM1PKX24`: 20 Mtr Ionos Masking Tape 48mm - 1 pk, GTIN: `5022822224810`, unit cost: `0.56`, units per case: `24`.
  - Line 11: `IONMT23MM2PKX24`: 20 Mtr Ionos Masking Tape 23mm - 2 pk, GTIN: `5022822224827`, unit cost: `0.55`, units per case: `24`.
  - Line 23: `IONNEONTESTS1P10`: Neon Tester Ø3x140mm, test range: 200-250VAC, rated voltage 100V-500V 50Hz, GTIN: `5022822225640`, unit cost: `0.45`, units per case: `10`.
  - Line 36: `IONWPLUGS200P10`: Wall Plugs 200pcs (100x5mm, 60x6mm, 40x8mm) grey boxed, GTIN: `5022822225602`, unit cost: `1.27`, units per case: `10`.
  - Line 79: `IONDUSTMASK5P12`: Ionos dust mask FFP2 5 pack, GTIN: `5022822229532`, unit cost: `1.20`, units per case: `12`.
  - Line 111: `ION3SFLADDER1P1`: Ionos 3 step foldable ladder EN14183 standard 150KG max loading capacity, GTIN: `5022822229709`, unit cost: `13.85`, units per case: `1`.
- **`docs/04_COMMERCE_SUPPLIER_SPEC.md`**:
  - Lines 5-7: "The October 2026 quotation from Status International (UK) Ltd is a PRICE QUOTE for 115 IONOS/Status lines, not proof of direct shipping or stock... The quoted unit price represents each retail sales unit; units per case and cases multiply to supplier quantity. Never multiply pack contents as sold units."
  - Lines 18-24: "Sellability gate... Publish as purchasable ONLY if: exact SKU/GTIN validated; safety/age requirements satisfied; inventory current within policy; stale => 'Check availability' not 'In stock'."

### 1.4 Copy Deck & UX Directives
- **`docs/08_CONTENT_AND_COPY_DECK.md`**:
  - Line 35: Shipping status `Supplier check required`: "Availability will be confirmed before dispatch."
  - Line 36: `Available with delivery estimate`: "Delivery estimate calculated for your postcode."
  - Line 38: Pack label: "Pack of [verified count]".
  - Line 40: Compatibility caveat: "Check manufacturer guidance and your application before buying."
  - Lines 53-60: Content angles for 36-piece screwdriver set, wall plugs selection, masking tape widths, padlocks, tool identifiers (MPN, GTIN, SKU).
- **`docs/05_SEO_AI_DISCOVERY.md`**:
  - Lines 23-26: "AI assistant — safe v1: Flow: user question -> intent & dimension parsing -> deterministic product filters (material/size/brand/GTIN) -> authenticated internal inventory/price query -> grounded explanation -> 1-3 valid products + why + evidence -> request customer approval for basket proposal. No direct payment initiation, no invented delivery date, no unsafe definitive DIY load advice, no hidden sponsored ordering. Hand off uncertain high-stakes advice to qualified support."
  - Tools v1: `searchCatalog`, `getProductTechnicalSpecs`, `getAvailability`, `getShippingQuote`, `getProjectBundle`, `getOrderStatus`, `proposeBasket`.

### 1.5 Current Verification Baseline
- Running `npm test`: 55 passed (16 brand compliance, 14 UI primitives, 25 adversarial UI primitives).
- Running `npm run typecheck`: clean exit code 0.
- Running `npm run lint`: clean exit code 0 (0 warnings, 0 errors).
- Running `python qa/check_static.py`: PASS (CSS palette, references, retired-colour scan, DOM shape, JS syntax, WCAG usage matrix).
- Running `npm run build`: compiled and statically generated pages with zero errors.

---

## 2. Logic Chain

### 2.1 Product Detail Page (`/products/[slug]`)
1. **From Observation 1.3**: The catalog distinguishes `units_per_pack` (what is inside 1 consumer sales unit, e.g. 5 rolls of tape) and `units_per_case` (outer carton case packaging, e.g. 6 packs of 5 rolls = 30 rolls). In the past, hardware stores frequently suffer from customer disputes where a trade customer thinks they bought 6 individual rolls or 30 rolls.
   - **Inference**: PDP must have an explicit visual **Pack & Carton Breakdown Card** showing:
     - Retail Unit: "Retail Pack of 5 rolls" (what 1 quantity adds).
     - Outer Case: "Outer Carton of 6 retail packs (30 total rolls)".
     - Carton Barcode: Display ITF-14/EAN-14 where present.
     - Optional "Order by the Case" quick selector with bulk carton pricing.
2. **From Observation 1.1 & 1.2**: Brand rules require IBM Plex Sans with `tabular-nums` for all prices, dimensions, and specifications, and dual pricing depending on VAT toggle.
   - **Inference**: The PDP price container must subscribe to global VAT state (`useVAT()`).
     - DIY Mode: Primary large text is `£X.XX inc. VAT` with subtext `(£Y.YY ex. VAT)`.
     - Trade Mode: Primary large text is `£Y.YY ex. VAT` with subtext `(£X.XX inc. VAT)`.
     - Spec table must wrap all numeric dimensions, voltages, barcodes, and tolerances in `.tabular-nums`.
3. **From Observation 1.3 & 1.4**: Supplier quotes are NOT guaranteed live warehouse inventory; the platform must maintain operational honesty.
   - **Inference**: The stock status component on PDP must evaluate `availability_status` and freshness TTL:
     - Verified fresh feed: "Confirmed in stock" (Subtle green badge, `#E8F5E9`, text `#176447`).
     - Stale feed / unconfirmed supplier: "Subject to confirmation" (Subtle warning badge, `#FFF7E8`, text `#B45309`).
     - Blocked / out of stock: "Currently unavailable" (Subtle danger badge, `#FEECEB`, text `#B42318`).
     - Strict prohibition: Never display fake countdowns or "Only 2 left at this price".
4. **From Observation 1.3 & 1.4**: British hardware compliance mandates UKCA / CE marks and relevant British Standards (e.g., BS EN 60454 for electrical tape, BS 1363 for 13A plugs, BS EN 14183 for step ladders).
   - **Inference**: Render verified compliance badges directly adjacent to the product title/specifications.
5. **From Observation 1.1**: `spec-table.tsx` already supports `tabular-nums` and alternating striped layout.
   - **Inference**: Embed `SpecTable` directly on the PDP to display Brand, MPN, GTIN-13, SKU, Pack count, Outer case count, Weight, Dimensions, Materials, Safety compliance, and Supplier origin.
6. **From Observation 1.4**: PDP requires a "Compare Product" trigger button.
   - **Inference**: A button on the PDP header/action bar allows toggling whether this product is in the compare list (`useCompareStore`), opening the compare dock.

### 2.2 Compare Product Drawer
1. **From Observation 1.1**: `src/components/ui/drawer.tsx` supports `side="bottom"`.
   - **Inference**: Implement a sticky bottom dock (`CompareDock`) that remains docked at the bottom of the viewport whenever 1 to 4 items are in the comparison store. When clicked, it expands via `DrawerContent side="bottom"` to display the full comparison matrix.
2. **From Observation 1.3**: Different catalog items have different specifications (dimensions, pack counts, voltages, materials, compliance ratings).
   - **Inference**: The comparison table must align attributes in a 2D matrix:
     - Left column: Attribute names (Sticky on mobile horizontal scroll).
     - Columns 2 to 5: Compared products (up to 4 items).
     - Include a "Highlight Differences" toggle that computes row variance and highlights rows where specs diverge using `bg-tc-surface-soft/60`.
     - Each column includes: Remove item button (`X`), Thumbnail, Title link, Price (reactive to VAT toggle), Pack breakdown, Stock status, Spec rows with `tabular-nums`, and 1-click "Add to Basket" action.
     - Include a global "Clear All" action.

### 2.3 Project Baskets (`/projects`) & Buying Guides (`/guides`, `/guides/[slug]`)
1. **From Observation 1.3 & 1.4**: The catalog contains all necessary SKUs to create real, practical kits:
   - **Kit 1 (Domestic Electrical Tape & Consumables Kit)**: `IONPVCMC5PKX6` (5-pk mixed tape), `IONPVCBLK1PKX12` (black tape), `IONNEONTESTS1P10` (neon tester), `IONWPLIERS1P10` (wire cutters), `IONESDRIVERS1P6` (insulated screwdrivers).
   - **Kit 2 (Painting & Masking Prep Kit)**: `IONMT48MM1PKX24` (48mm masking tape), `IONMT23MM2PKX24` (23mm masking tape), `IONDUSTS1P24` (dust sheets), `IONA4SPAPER10P10` (sandpaper), `IONFBLADES4P10` (filling blades), `IONROLLTRAY41P10` (roller & tray), `IONPBRUSH5P10` (brushes).
   - **Kit 3 (Essential Site Torch & Extension Lead Kit)**: `IONTARPAULIN1P12` (tarpaulin), `IONRSTRAPS2P12` (ratchet straps), `IONTAPEM5M1P12` (5m tape measure), `IONWGLOVES1P10` (work gloves), plus Status 13A Extension Lead / Work Torch SKUs.
   - **Inference**: Provide `/projects` page with interactive kit cards featuring:
     - Itemized checklist with individual checkboxes (allowing customers to uncheck items they already possess).
     - Bundle total price inc/ex VAT with bundle discount indicator.
     - 1-click "Add All to Basket" button.
     - Crucial technical safety notices (e.g. neon tester domestic indicator limits; uncoiling extension leads under high load).
2. **From Observation 1.4**: `docs/08_CONTENT_AND_COPY_DECK.md` lists 5 essential UK technical buying guides:
   - **Guide 1 (`/guides/wall-plugs-fixings-guide`)**: UK color-coding standards (Yellow 5mm, Red 6mm, Brown 7-8mm), substrate differences (solid brick vs thermalite block vs hollow plasterboard), weight limits.
   - **Guide 2 (`/guides/masking-tape-decorating-prep`)**: 24mm vs 48mm widths, crepe paper tack levels, clean removal windows (<=24h).
   - **Guide 3 (`/guides/screwdriver-types-drive-standards`)**: Critical PH (Phillips) vs PZ (Pozidriv) geometry differences, cam-out prevention, VDE 1000V insulation.
   - **Guide 4 (`/guides/padlocks-security-weather-guide`)**: Open vs closed shackle, disc padlocks, cut resistance, thermoplastic weatherproofing for UK damp weather.
   - **Guide 5 (`/guides/gtin-mpn-sku-guide`)**: Exact tool matching via GTIN-13, MPN, and SKU for trade procurement.
   - **Inference**: Every guide page must include:
     - Technical author / reviewer badge (ToolCart UK Technical Standards Desk).
     - Prominent Safety Callout Box (Warning Amber `#B45309`).
     - Embedded catalog product cards with live pricing, stock badges, and 1-click "Add to Basket" buttons.
     - Rich Schema.org `Article`, `FAQPage`, and `BreadcrumbList` JSON-LD.

### 2.4 AI Product & Project Assistant (`tc-ai-panel` / modal)
1. **From Observation 1.1 & 1.2**: Brand tokens specify `.tc-ai-panel` with `bg-tc-surface-soft` (`#EAF0FF`), Cobalt `#2450B8` action buttons, and Ink `#182336` text. Absolutely zero copper, zero purple, zero teal.
   - **Inference**: The AI panel modal (`tc-ai-panel`) must be styled with Cloud Blue background (`#EAF0FF`), Ink typography, White user bubbles, Cobalt assistant action buttons, and Action Lime accents with 2px Ink outlines.
2. **From Observation 1.4**: `docs/05_SEO_AI_DISCOVERY.md` lines 23-26 specify that the assistant must operate via deterministic catalog tools and refuse unsafe advice.
   - **Inference**: Implement 5 server tools in `src/lib/ai/tools.ts`:
     - `searchCatalog`: Searches products by keyword, category, dimensions.
     - `getProductTechnicalSpecs`: Retrieves verified specs, pack quantities, compliance standards.
     - `getAvailability`: Returns current stock status, price inc/ex VAT, and freshness timestamp.
     - `getProjectBundle`: Retrieves curated or dynamically assembled project kits.
     - `proposeBasket`: Assembles a structured basket proposal with item cards and a user-confirmed "Add All to Basket" button.
3. **From Observation 1.3**: The catalog contains Neon Testers (`IONNEONTESTS1P10`), Ladders (`ION3SFLADDER1P1`), Wall Plugs (`IONWPLUGS200P10`), and Dust Masks (`IONDUSTMASK5P12`).
   - **Inference**: Strict safety guardrails must be encoded into the AI prompt and deterministic validator:
     - **Structural Load-Bearing**: Refuse to certify structural loads or overhead hanging. State that `IONWPLUGS200P10` is for light/medium domestic fixtures in solid masonry (10-25kg), not hollow plasterboard or heavy structural loads (>30kg). Refer to structural engineer.
     - **Electrical Tester Limits**: Explicitly state `IONNEONTESTS1P10` is a 200-250VAC domestic indicator only. Refuse to certify it for safe electrical isolation proving or high-voltage circuits. Mandate GS38 compliant two-pole tester and qualified electrician.
     - **PPE Ratings**: State `IONDUSTMASK5P12` is FFP2 for general non-toxic dust. Refuse to recommend for asbestos, lead paint heat stripping, or toxic fumes.
     - **Stock & Delivery**: Never fabricate next-day arrival; state "Subject to confirmation from supplier Status International UK Ltd".

---

## 3. Caveats
1. **Wholesale Cost Isolation**: The server-side product loader must never return `unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp` to public storefront routes (`/products/[slug]`, `/projects`, `/guides`, `/api/store/*`). All storefront views must exclusively receive `PublicProductDTO`.
2. **Supplier Stock Freshness**: The sample catalog data in `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` is an unverified price quote from Status International (UK) Ltd. The UI must honestly show "Subject to confirmation" unless explicitly approved by admin.
3. **Client-Side State Storage**: Compare drawer items (`toolcart_compare_items`) and Cart items should be stored in `localStorage` with SSR hydration guards (`useEffect` or `useSyncExternalStore`) to avoid hydration mismatch errors in Next.js App Router.
4. **No Autonomous Purchases**: The AI Assistant can propose baskets and show "Add to Basket" buttons, but it must NEVER initiate autonomous checkout, charge credit cards, or submit supplier orders without explicit user interaction.

---

## 4. Conclusion & Concrete Implementation Strategy

### 4.1 File & Component Map for Builders

```
app/
├── (storefront)/
│   ├── products/
│   │   └── [slug]/
│   │       └── page.tsx                     # PDP Server Component (SSR/SSG + SEO JSON-LD)
│   ├── projects/
│   │   └── page.tsx                         # Project Baskets Directory & Kit Configurator
│   ├── guides/
│   │   ├── page.tsx                         # Buying Guides Directory
│   │   └── [slug]/
│   │       └── page.tsx                     # Authoritative Guide Detail Page (with embedded SKUs)
│   └── layout.tsx                           # Mounts CompareDock, AI Assistant Drawer, Global VAT Context
└── api/
    └── store/
        └── assistant/
            └── route.ts                     # AI Assistant Tool-Calling Endpoint

src/
├── components/
│   └── storefront/
│       ├── pdp/
│       │   ├── product-gallery.tsx          # Image gallery with zoom & license tag
│       │   ├── product-price-card.tsx       # Dual VAT pricing, qty stepper, Add to Basket
│       │   ├── pack-breakdown-card.tsx      # Retail Unit vs Outer Case visual breakdown
│       │   ├── stock-freshness-badge.tsx    # Confirmed vs Subject to Confirmation badge
│       │   ├── compliance-badges.tsx        # UKCA, CE, BS EN badges with tooltips
│       │   └── product-spec-table.tsx       # SpecTable with tabular-nums
│       ├── compare/
│       │   ├── compare-dock.tsx             # Sticky dockable bottom bar (1-4 items)
│       │   ├── compare-sheet.tsx            # Slide-up comparison table with diff highlight
│       │   └── compare-button.tsx           # "Compare Product" trigger button
│       ├── projects/
│       │   ├── project-kit-card.tsx         # Curated kit card with item checklist
│       │   └── project-item-row.tsx         # Individual item toggle row in kit
│       ├── guides/
│       │   ├── guide-card.tsx               # Directory article preview card
│       │   ├── guide-author-badge.tsx       # Reviewer credentials & UK standards desk
│       │   ├── guide-product-callout.tsx    # In-article catalog SKU card with 1-click add
│       │   └── safety-warning-box.tsx       # High-visibility safety disclaimer box
│       └── ai/
│           ├── ai-assistant-drawer.tsx      # tc-ai-panel drawer (Cloud Blue + Cobalt)
│           ├── ai-message-bubble.tsx        # Chat transcript bubbles (markdown supported)
│           ├── ai-product-card.tsx          # Catalog product card embedded in chat
│           ├── ai-basket-proposal.tsx       # Proposed bundle card with "Add All" button
│           └── ai-starter-prompts.tsx       # Quick prompt starter chips
├── data/
│   ├── project-kits.ts                      # The 3 curated project kits data
│   └── buying-guides.ts                     # The 5 authoritative UK buying guides data
├── lib/
│   ├── store/
│   │   ├── compare-store.ts                 # Zustand / React state store for comparison
│   │   ├── cart-store.ts                    # Cart state store with multi-item add
│   │   └── vat-store.ts                     # Trade vs DIY VAT mode toggle store
│   └── ai/
│       ├── assistant-engine.ts              # Safety guardrails, prompt, intent routing
│       └── tools.ts                         # searchCatalog, getSpecs, getAvailability, proposeBasket
└── types/
    ├── compare.ts                           # CompareState, CompareItem
    ├── project.ts                           # ProjectKit, ProjectKitItem
    ├── guide.ts                             # BuyingGuide, GuideSection
    └── ai.ts                                # AIMessage, AIBasketProposal, AIToolCall
```

### 4.2 Exact Specification Details

#### 1. Product Detail Page (`/products/[slug]`)
- **Dual VAT Pricing Component**:
  - Formulas:
    - If `vatMode === 'inc'`: Primary = `£{retail_price_inc_vat_gbp.toFixed(2)} inc. VAT`, Secondary = `(£{retail_price_ex_vat_gbp.toFixed(2)} ex. VAT)`.
    - If `vatMode === 'ex'`: Primary = `£{retail_price_ex_vat_gbp.toFixed(2)} ex. VAT`, Secondary = `(£{retail_price_inc_vat_gbp.toFixed(2)} inc. VAT)`.
  - All numbers formatted with `tabular-nums` in `font-heading font-extrabold text-3xl text-tc-ink` and subtext in `font-body text-sm text-tc-text-secondary`.
- **Pack and Carton Breakdown Card**:
  - Container: `border border-tc-border rounded-card bg-white p-4 shadow-sm`.
  - Left column: Retail Unit Icon + "Retail Unit Pack: [units_per_pack] items" with note: "Adding 1 item to basket adds 1 retail pack".
  - Right column: Box/Carton Icon + "Outer Case Carton: [units_per_case] packs ([units_per_pack * units_per_case] total items)".
  - Carton Barcode: Display ITF-14 barcode string with `tabular-nums`.
- **Stock Freshness Indicator**:
  - If `availability_status === 'in_stock'`:
    - Badge: Subtle Success (`bg-[#E8F5E9] text-tc-success border border-[#A3D9B5]`) with label `Confirmed in stock`.
    - Subtext: "Supplier stock verified within last 60 minutes".
  - If `availability_status === 'subject_to_confirmation'`:
    - Badge: Subtle Warning (`bg-[#FFF7E8] text-tc-warning border border-[#E8CB91]`) with label `Subject to confirmation`.
    - Subtext: "Stock allocation confirmed with supplier prior to payment capture".
- **Compliance Badges**:
  - UKCA mark badge: `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border border-tc-ink bg-tc-canvas text-tc-ink`.
  - CE mark badge: matching styling.
  - Standard badge (e.g. `BS EN 60454`, `BS 1363`, `EN 14183`).
- **Technical Specification Table**:
  - Renders normalized specs via `<SpecTable specs={product.specifications} caption="Product Technical Specifications" />`.
  - Spec entries: Brand, MPN, GTIN-13 Barcode, Merchant SKU, Carton Barcode, Pack Quantity, Case Quantity, Length / Width / Height, Weight (g), Voltage / Power Rating, Standards / Directives.

#### 2. Compare Product Drawer
- **State Store (`src/lib/store/compare-store.ts`)**:
  - Max 4 items.
  - Methods: `add(product)`, `remove(productId)`, `clear()`, `toggleDrawer()`.
  - Persistence: `localStorage` key `'toolcart_compare'`.
- **Sticky Dock Bar**:
  - Fixed at `bottom-0 left-0 right-0 z-40 bg-white border-t border-tc-border shadow-lg py-3 px-6`.
  - Appears automatically when `items.length >= 1`.
  - Displays: "Comparing [N]/4 products" with mini thumbnail avatars and remove tags.
  - Buttons: "Compare Now" (Cobalt primary CTA) and "Clear All" (ghost button).
- **Full Comparison Drawer (`Drawer side="bottom"`)**:
  - Slides up to `max-h-[85vh]`.
  - Grid table:
    - Header: Product thumbnails, titles (links to PDP), dual prices, "Add to Basket" buttons, remove buttons.
    - Rows: Category, Brand, GTIN-13, MPN, SKU, Pack Size, Case Qty, Availability, Dimensions, Weight, Compliance Standards.
    - All numeric values have `tabular-nums`.
  - Difference Highlighting:
    - Checkbox "Highlight differences": when checked, compares values across columns; if values differ, the table row is styled with `bg-tc-surface-soft/60`.

#### 3. Project Baskets (`/projects`) & Buying Guides (`/guides`)
- **The 3 Curated Project Kits**:
  1. *Domestic Electrical Tape & Consumables Kit* (`IONPVCMC5PKX6`, `IONPVCBLK1PKX12`, `IONNEONTESTS1P10`, `IONWPLIERS1P10`, `IONESDRIVERS1P6`):
     - Interactive checklist: Each item has a checkbox and price.
     - Live total calculation (Inc & Ex VAT).
     - 1-click CTA: "Add Electrical Kit to Basket".
     - Safety Box: "BS EN 60454 compliant tape. Neon tester is a 200-250VAC single-phase DIY indicator only — NEVER replace GS38 safe isolation proving on live mains."
  2. *Painting & Masking Prep Kit* (`IONMT48MM1PKX24`, `IONMT23MM2PKX24`, `IONDUSTS1P24`, `IONA4SPAPER10P10`, `IONFBLADES4P10`, `IONROLLTRAY41P10`, `IONPBRUSH5P10`):
     - Interactive checklist with itemized costs.
     - 1-click CTA: "Add Painting Prep Kit to Basket".
     - Application tips: Surface cleaning, tape removal within 24h, filling knife angles.
  3. *Essential Site Torch & Extension Lead Kit* (`IONTARPAULIN1P12`, `IONRSTRAPS2P12`, `IONTAPEM5M1P12`, `IONWGLOVES1P10`, plus Status 13A Extension Lead / Work Torch SKUs):
     - 1-click CTA: "Add Site Kit to Basket".
     - Safety Warning: "Coiled cable safety: Always fully uncoil extension leads when operating loads exceeding 1000W to avoid thermal buildup."
- **The 5 UK Buying Guides**:
  1. `/guides/wall-plugs-fixings-guide`: Wall plug color codes, drill bit sizing, solid brick vs plasterboard, 5-25kg load limits.
  2. `/guides/masking-tape-decorating-prep`: 24mm vs 48mm widths, adhesion tack, clean removal windows.
  3. `/guides/screwdriver-types-drive-standards`: PH vs PZ drive geometry, stripping prevention, VDE 1000V insulation.
  4. `/guides/padlocks-security-weather-guide`: Shackle types, disc padlocks, cut resistance, weatherproof casing.
  5. `/guides/gtin-mpn-sku-guide`: GTIN-13 vs MPN vs SKU for tradespeople and procurement.
  - Every guide embeds relevant catalog SKUs with stock status and 1-click "Add to Basket" cards.

#### 4. AI Product & Project Assistant (`tc-ai-panel` / modal)
- **Visual Styling**:
  - Class: `.tc-ai-panel` from `design/tokens.css`.
  - Background: `var(--tc-surface-soft)` (`#EAF0FF`).
  - Container Border: `#C8D9F9`.
  - Typography: Manrope headings (`#182336`), IBM Plex Sans body (`#182336`), secondary text (`#596B70`).
  - Assistant bubbles: Pure white `#FFFFFF` with `#C8D9F9` border.
  - User bubbles: Cobalt `#2450B8` with white text.
  - Action buttons: Cobalt `#2450B8` (`variant="primary"`) and Lime `#DDF16A` (`variant="accent"` with 2px Ink outline).
  - Absolutely zero `#B84C32` copper, purple, or teal.
- **Tools**:
  - `searchCatalog`: Searches `PublicProductDTO` records.
  - `getProductTechnicalSpecs`: Queries verified specifications.
  - `getAvailability`: Returns real stock status and freshness timestamp.
  - `getProjectBundle`: Assembles curated kit items.
  - `proposeBasket`: Assembles proposed items into an interactive card with "Add All to Basket" button.
- **Strict Refusal Guardrails**:
  - Structural Loads: Refuse to certify structural loads (>30kg) or overhead hanging with standard plastic wall plugs.
  - Electrical Testing: State `IONNEONTESTS1P10` is a 200-250VAC DIY indicator only; refuse to certify for safe isolation proving or high-voltage circuits.
  - PPE Limits: State `IONDUSTMASK5P12` is FFP2; refuse to recommend for asbestos, lead paint, or chemical vapors.
  - Stock & Delivery: Disclose honest stock state ("Subject to confirmation from supplier Status International UK Ltd"); never promise guaranteed next-day delivery.

---

## 5. Verification Method

To independently verify the implementation once coded by builders:

1. **Brand & Contrast Compliance**:
   ```powershell
   npm run test tests/brand/brand-compliance.test.ts
   python qa/check_static.py
   ```
   *Expected outcome*: 0 occurrences of `#B84C32`, `--tc-copper`, purple, or teal. All contrast pairs pass WCAG AA.

2. **UI Component & Spec Table Verification**:
   ```powershell
   npm run test tests/ui/primitives.test.tsx
   npm run test tests/adversarial/primitives-adversarial.test.tsx
   ```
   *Expected outcome*: All component tests pass, verifying `tabular-nums` in `spec-table.tsx` and drawer functionality.

3. **Wholesale Cost Leak Security Check**:
   - Inspect network payloads on `/products/[slug]` and `/api/store/assistant`:
   - Verify that neither `unit_cost_ex_vat_gbp` nor `case_cost_ex_vat_gbp` appears in flight payloads, server component props, or client bundles.

4. **TypeScript & Lint Validation**:
   ```powershell
   npm run typecheck
   npm run lint
   ```
   *Expected outcome*: Code 0 with 0 errors.

5. **Production Build & Route Prerendering**:
   ```powershell
   npm run build
   ```
   *Expected outcome*: Successful static generation of `/products/[slug]`, `/projects`, `/guides`, `/guides/[slug]`.

6. **Responsive Viewport Verification**:
   - Inspect at 360px (mobile) and 1440px (desktop):
     - Compare dock: compact bar on mobile with horizontal scrollable table.
     - PDP: stacked layout on mobile, side-by-side gallery and price box on desktop.
     - AI modal: full-width on mobile (360px), slide-over panel (440px) on desktop.
