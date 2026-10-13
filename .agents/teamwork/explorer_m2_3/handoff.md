# M2 Architecture & Implementation Strategy Handoff Report

**Agent**: Explorer M2 (Instance 3)  
**Parent Agent ID**: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`  
**Working Directory**: `e:\ToolCart\.agents\teamwork\explorer_m2_3`  
**Target Scope**:
1. Catalog Data Loader (`src/lib/catalog/`) & 115 SKUs
2. Cart & Mini-Basket (`/basket` & slide-over drawer) with multi-supplier grouping & UK 20% VAT math
3. Checkout Flow (`/checkout`) with guest flow, UK postcode validation, landed cost, and `STAGING_ONLY` Stripe integration
4. Trade Account Portal (`/trade`) with B2B registration and validation
5. Customer Account & Order Tracking (`/account`, `/account/orders/[id]`) with live state machine timeline visualization

---

## 1. Observation

### 1.1 Baseline Catalog CSV Analysis (`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`)
- **Row Count**: Exactly 115 quoted product rows (excluding header), all from supplier `"Status International (UK) Ltd"`.
- **Headers observed**:
  `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified`
- **Wholesale Price Range**:
  `unit_cost_ex_vat_gbp` ranges from minimum `£0.35` (`IONSBOLT1P12` Sliding Bolt) to maximum `£13.85` (`ION3SFLADDER1P1` 3-Step Ladder), with an average unit cost of `£1.50`.
- **Case Math Integrity**:
  Every single row satisfies `round(unit_cost_ex_vat_gbp * units_per_case, 2) == case_cost_ex_vat_gbp` (0 math mismatches across all 115 rows).
- **Nullable Carton Barcode**:
  Exactly 1 row (`ION3SFLADDER1P1` - 3 step foldable ladder) has an empty `carton_barcode` string because it is sold as a single bulky unit (`units_per_case: 1`).
- **Unicode Ligatures & Special Characters**:
  Direct inspection via Python regex analysis identified:
  - `\ufb01` (`ﬁ` Latin Small Ligature FI): **15 occurrences** (e.g. `ﬁne` in `ION16OZSCHAM1P6`, `IONA4SPAPER10P10`, `ﬁnish` in `IONBEHEXKEYS1P10`, `ION3WCHISEL1P6`, `ION12CROWBAR1P12`, `ﬁbreglass` in `IONRMALLET1P6`, `ION16OZBPHAM1P6`, `ﬁle` in `IONMFILESET1P12`, `IONSGFILESET1P6`).
  - `\ufb02` (`ﬂ` Latin Small Ligature FL): **5 occurrences** (e.g. `ﬂathead` in `IONSDRIVERS4P10`, `IONPSDRIVERS6P10`, `ﬂap` in `IONFWSPAD4P24`, `ﬂoat` in `IONCFLOAT1P6`).
  - `\u00d8` (`Ø` Latin Capital Letter O with Stroke / Diameter symbol): **1 occurrence** in `IONNEONTESTS1P10` (`Neon Tester - Ø3x140mm`).
- **Verification of Supplier Stock & Licensing Status in CSV**:
  In all 115 rows:
  - `supplier_stock_confirmed: UNVERIFIED`
  - `dropship_eligible: UNVERIFIED`
  - `photo_license_verified: UNVERIFIED`
  - `compliance_verified: UNVERIFIED`
  - `source_quote_is_inventory: NO`

### 1.2 Non-Negotiable Project Rules & Security Constraints
- **Wholesale Isolation Rule** (`AGENTS.md`, `PROJECT.md:18-21`):
  Wholesale prices (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) must remain strictly server-side. They must NEVER be exported in public Next.js bundles, serialized in `PublicProductDTO`, or returned in public `/api/store/*` responses.
- **Brand V3 Design Tokens** (`design/tokens.css`, `design/tokens.json`, `qa/contrast_matrix.json`):
  - Primary: Cobalt `#2450B8` (hover `#193F99`). White text on Cobalt = 7.21:1.
  - Accent: Action Lime `#DDF16A` with dark Ink `#182336` text and 2px Ink outline. Never white text on Lime.
  - Surface/Canvas: Workshop White `#F7F8F5`, Pure White `#FFFFFF`, Cloud Blue `#EAF0FF` (AI surfaces), Graphite `#252D30`.
  - Accessible secondary text on off-white/canvas: Steel Text `#596B70` (5.24:1 ratio >= 4.5).
  - Prohibited: Retired Copper `#B84C32`, purple/violet/lavender, teal.
- **State Machine Transitions** (`architecture/SUPPLIER_ORDER_STATE_MACHINE.md`):
  `cart_pending` -> `checkout_authorized` -> `supplier_order_pending` -> `supplier_accepted` -> `payment_captured` -> `dispatched` -> `delivered`.
  Exceptional states: `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`.
- **UK Tax & Multi-Supplier Rules** (`docs/04_COMMERCE_SUPPLIER_SPEC.md`):
  - Standard UK 20% VAT calculation applied to net subtotal and shipping carriage.
  - Multi-supplier baskets must disclose separate delivery groups, shipping fees, and lead times.

### 1.3 Existing UI Components & Infrastructure
- `src/components/ui/` contains tested Brand V3 primitives: `button.tsx`, `badge.tsx`, `card.tsx`, `dialog.tsx`, `drawer.tsx`, `input.tsx`, `search-input.tsx`, `spec-table.tsx`, `tabs.tsx`, `filter-pill.tsx`.
- All 55 existing tests pass in Vitest (`vitest run`).
- Static brand and contrast checks pass (`python qa/check_static.py`).
- Packages already installed in `package.json`:
  - `csv-parse` (`^5.5.6`)
  - `zod` (`^3.23.8`)
  - `@stripe/react-stripe-js` (`^2.8.1`), `@stripe/stripe-js` (`^4.9.0`), `stripe` (`^17.3.1`)
  - `@radix-ui/react-*` (dialog, drawer, tabs, checkbox, label)
  - `lucide-react` (`^0.460.0`)

---

## 2. Logic Chain

### 2.1 Catalog Data Loader Architecture (`src/lib/catalog/`)

#### Step 1: Normalization & Safe Ingestion
To eliminate encoding corruption across environments (as witnessed during Python cp1252 parsing):
- `normalizeUnicode(text: string): string` systematically maps:
  - `/\ufb01/g` -> `'fi'`
  - `/\ufb02/g` -> `'fl'`
  - `/\u00d8/g` -> `'Ø'`
  - Trims leading/trailing whitespace and normalizes unescaped quotes.
- `extractSpecs(description: string): Record<string, string>` extracts structured key-value specifications (e.g. Dimensions, Material, Pack Size, Voltage, Standard) by splitting on ` - ` tokens and parsing key technical parameters.

#### Step 2: Taxonomy & Category Mapping (115 SKUs -> 7 Hardware Categories)
Analyzing the 115 normalized descriptions yields a deterministic 7-category taxonomy:
1. `hand-tools` (**26 SKUs**): Pliers (`IONCPLIERS1P10`, `IONAPLIERS1P10`, `IONWPLIERS1P10`, `IONBPLIERS1P10`), Screwdrivers (`ION61SDRIVER1P10`, `IONSDRIVERS4P10`, `IONPSDRIVERS6P10`, `ION1CSDRIVER1P12`, `ION1FSDRIVER1P12`, `IONESDRIVERS1P6`, `ION36PCSDSET1P6`), Saws (`IONHANDSAW1P6`, `IONJHACKSAW1P10`, `IONSHACKSAW1P6`, `IONTSAW1P6`), Hammers (`ION16OZSCHAM1P6`, `ION8OZSCHAM1P10`, `IONRMALLET1P6`, `IONPINHAM1P12`, `ION16OZBPHAM1P6`), Wrenches/Spanners (`IONASPANNER1P10`, `IONSPANNERS1P10`), Knives (`IONFOLDKNIFE1P10`, `IONUKNIFE1P10`, `IONCKNIFE1P10`), Files & Chisels (`IONSGFILESET1P6`, `IONMFILESET1P12`, `ION3WCHISEL1P6`).
2. `bits-accessories` (**15 SKUs**): Drill bits (`IONMASODBSET1P12`, `IONMETADBSET1P12`, `IONWOODDBSET1P12`, `IONSTEPDBIT1P12`), Cutting & Sanding Discs (`IONCCUTDISC10P12`, `IONCMSDISC2P24`, `IONFWSPAD4P24`), Wire brushes (`IONCWBRUSH1P12`, `ION3WCBRUSH1P12`, `IONWIREBRUSH1P12`), Saw blades (`IONHSBLADE5P12`, `IONJHSBLADE1P24`, `IONKBLADEPK10P24`), Sockets (`ION14SOCKSET1P12`, `ION12SOCKSET1P6`).
3. `fixings-security` (**28 SKUs**): Padlocks (`IONBPLOCK1PK10`, `IONACPLOCK1PK10`, `IONWPPLOCK1PK6`, `IONDPLOCK1PK6`, `IONIHDPLOCK1PK6`), Sliding Bolts (`IONSBOLT1P12`, `ION5SBOLT1P12`, `ION5LSBOLT1P12`), Wall Plugs & Fasteners (`IONWPLUGS200P10`, `IONNABSET1P24`, `IONPASSET1P24`, `IONMNSET1P24`, `IONPHANGKIT1P10`), Clamps (`ION3PSCLAMP4P12`, `ION2GCLAMP1P12`).
4. `decorating` (**14 SKUs**): Paint brushes & Rollers (`IONPBRUSH5P10`, `IONROLLTRAY41P10`, `IONROLLTRAY91P10`, `IONFPBRUSH1P12`), Scrapers & Blades (`IONWSCRAPER21P10`, `IONWSCRAPER41P10`, `IONFBLADES4P10`), Sandpaper & Blocks (`IONA4SPAPER10P10`, `IONFSSBLOCK4P12`), Dust sheets (`IONDUSTS1P24`).
5. `measuring` (**3 SKUs**): Spirit levels (`IONSPIRITL1P10`, `ION5FSPIRITL1P4`), Tape measures (`IONTAPEM5M1P12`, `IONTAPEM10M1P6`), Metal ruler & Plumb bob (`IONMRULER1P24`, `IONPLUMBBOB1P12`).
6. `workwear-safety` (**8 SKUs**): Work gloves (`IONPVCGLOVE30P24`, `IONWGLOVES1P10`, `IONSGLOVES1P10`), Eye protection (`IONPEGOGGLES1P12`, `IONPEGLASSES1P12`), Dust masks & Ear plugs (`IONDUSTMASK5P12`, `IONEARPLUGS1P24`), Ladder (`ION3SFLADDER1P1`).
7. `tapes-consumables` (**21 SKUs**): PVC electrical tape rolls & packs (`IONPVCMC5PKX6`, `IONPVCBLU1PKX12`, `IONPVCRED1PKX12`, `IONPVCYAG1PKX12`, `IONPVCBWN1PKX12`, `IONPVCWHT1PKX12`, `IONPVCYLW1PKX12`, `IONPVCBLK1PKX12`), Masking & Cloth tapes (`IONMT48MM1PKX24`, `IONMT23MM2PKX24`, `IONCT48MM1PKX12`, `IONPT48MM6PKX6`), Ropes & Cords (`IONBCORD2P12`, `IONHDPPBR1P24`, `IONCPSTRING1P24`, `IONRSTRAPS2P12`, `IONTARPAULIN1P12`).

#### Step 3: Server-Side Retail Pricing Calculation & Wholesale Isolation
- Wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) are retained exclusively within server-side memory/database structures.
- Public retail price calculation model:
  - Wholesale cost < £1.00: markup multiplier `2.20` (minimum retail floor £1.49 ex-VAT).
  - Wholesale cost £1.00 – £3.00: markup multiplier `1.85`.
  - Wholesale cost > £3.00: markup multiplier `1.65`.
  - `retail_price_ex_vat_gbp = round(unit_cost_ex_vat_gbp * markup, 2)`
  - `retail_price_inc_vat_gbp = round(retail_price_ex_vat_gbp * 1.20, 2)`
- Security projection:
  `PublicProductDTO` omits `unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`, and supplier quotation margin data. Only public retail prices, technical specs, pack counts, and honest stock status are returned.

#### Step 4: Public API & Query Helpers
In `src/lib/catalog/index.ts`:
- `getAllProducts(): Promise<PublicProductDTO[]>`: returns all 115 cached DTOs.
- `getProductBySlug(slug: string): Promise<PublicProductDTO | null>`: finds product by URL slug.
- `getProductsByCategory(category: string): Promise<PublicProductDTO[]>`: filters by category slug.
- `searchProducts(query: string, filters?: ProductFilters): Promise<ProductSearchResult>`: instant lexical search matching title, SKU, barcode (GTIN-13), brand, with multi-attribute filtering (category, price range, availability).
- `getProjectKits(): Promise<ProjectKit[]>`: returns 3 pre-assembled hardware project kits linking exact catalog SKUs:
  1. Domestic Electrical Tape & Consumables Kit (5 SKUs)
  2. Painting & Masking Prep Kit (7 SKUs)
  3. Essential Site Torch & Maintenance Kit (7 SKUs)

---

### 2.2 Cart & Mini-Basket Strategy (`/basket` & slide-over drawer)

#### Step 1: Multi-Supplier Delivery Grouping Architecture
In ToolCart's supplier-backed dropship model, products can ship from distinct supplier distribution centres (e.g. Status International UK in West Yorkshire vs. future secondary suppliers/ToolCart hub).
- Line items in cart are partitioned by `supplier_id`.
- Each `SupplierDeliveryGroup` computes:
  - Group net subtotal: `sum(item.retail_price_ex_vat_gbp * item.quantity)`
  - Carriage fee: Flat rate `£4.95` ex VAT per supplier dispatch; **FREE carriage** on group subtotal >= `£50.00` ex VAT.
  - Distinct delivery ETA: e.g. "Status International UK (West Yorkshire Hub) — 2–3 Business Days".
- Total delivery charge is transparently aggregated across all active supplier groups with clear split-shipment notice to the customer.

#### Step 2: Accurate UK 20% Standard VAT Math
To avoid JavaScript floating-point rounding errors:
```typescript
export function calculateCartSummary(items: CartItem[]): CartSummary {
  const UK_VAT_RATE = 0.20;
  const groupsMap = new Map<string, CartItem[]>();

  for (const item of items) {
    const list = groupsMap.get(item.supplier_id) || [];
    list.push(item);
    groupsMap.set(item.supplier_id, list);
  }

  const supplier_groups: SupplierDeliveryGroup[] = [];
  let goods_subtotal_ex_vat_gbp = 0;
  let shipping_total_ex_vat_gbp = 0;

  for (const [supplierId, groupItems] of groupsMap.entries()) {
    const groupNet = groupItems.reduce(
      (sum, it) => sum + it.retail_price_ex_vat_gbp * it.quantity,
      0
    );
    const roundedGroupNet = Math.round(groupNet * 100) / 100;
    const isFree = roundedGroupNet >= 50.00;
    const shippingExVat = isFree ? 0 : 4.95;
    const shippingIncVat = Math.round(shippingExVat * (1 + UK_VAT_RATE) * 100) / 100;

    goods_subtotal_ex_vat_gbp += roundedGroupNet;
    shipping_total_ex_vat_gbp += shippingExVat;

    supplier_groups.push({
      supplier_id: supplierId,
      supplier_name: groupItems[0]?.supplier_name || 'UK Trade Supplier',
      dispatch_origin: groupItems[0]?.dispatch_origin || 'UK Distribution Centre',
      lead_time_days: groupItems[0]?.lead_time_days || '2–3 Business Days',
      items: groupItems,
      group_net_gbp: roundedGroupNet,
      shipping_ex_vat_gbp: shippingExVat,
      shipping_inc_vat_gbp: shippingIncVat,
      is_free_shipping: isFree,
      free_shipping_threshold_gbp: 50.00,
    });
  }

  goods_subtotal_ex_vat_gbp = Math.round(goods_subtotal_ex_vat_gbp * 100) / 100;
  shipping_total_ex_vat_gbp = Math.round(shipping_total_ex_vat_gbp * 100) / 100;

  const net_subtotal = Math.round((goods_subtotal_ex_vat_gbp + shipping_total_ex_vat_gbp) * 100) / 100;
  const vat_total_gbp = Math.round(net_subtotal * UK_VAT_RATE * 100) / 100;
  const total_landed_cost_gbp = Math.round((net_subtotal + vat_total_gbp) * 100) / 100;

  return {
    total_items_count: items.reduce((sum, it) => sum + it.quantity, 0),
    goods_subtotal_ex_vat_gbp,
    goods_subtotal_inc_vat_gbp: Math.round(goods_subtotal_ex_vat_gbp * (1 + UK_VAT_RATE) * 100) / 100,
    shipping_total_ex_vat_gbp,
    shipping_total_inc_vat_gbp: Math.round(shipping_total_ex_vat_gbp * (1 + UK_VAT_RATE) * 100) / 100,
    vat_total_gbp,
    total_landed_cost_gbp,
    supplier_groups,
    has_multiple_suppliers: supplier_groups.length > 1,
  };
}
```

#### Step 3: Mini-Basket Drawer & Page UX
- **Drawer (`MiniBasketDrawer`)**: Built with Radix `Drawer` (`side="right"`), accessible via Cart trigger in storefront header. Shows live counter, scrollable grouped items with pack counts, quantity increment/decrement buttons, Free Carriage threshold progress bar, and "Checkout" CTA.
- **Page (`/basket`)**: Full responsive layout at `360px` and `1440px`. Discloses split supplier origins, retail unit vs carton packaging, VAT breakdown, and guest checkout direct button.

---

### 2.3 Checkout Flow Strategy (`/checkout`)

#### Step 1: Guest Checkout (No Forced Registration)
- Customer provides Email and optional Phone for SMS dispatch alerts.
- Checkbox: "Save my details for future trade orders" allows optional account creation post-purchase without obstructing completion.

#### Step 2: UK Delivery Address & Postcode Validation
- Regex: `^[A-Z]{1,2}[0-9][A-Z0-9]?\s?[0-9][A-Z]{2}$` (case-insensitive, auto-formatted into standard UK outward + inward format `SW1A 1AA`).
- Highland/Island detection (`BT`, `IV`, `KW`, `HS`, `ZE`, `IM`, `GY`, `JE`) displays clear transit advisory ("Remote UK delivery zone: allow 2-3 additional courier days").

#### Step 3: Stripe Test-Mode Integration Gated by `STAGING_ONLY`
- Gated by `STAGING_ONLY=true`.
- Prominent staging indicator: "Staging Test Mode: Use Stripe test card `4242 4242 4242 4242`".
- Uses `@stripe/react-stripe-js` Elements with automatic fallback to a zero-config interactive card simulator if Stripe environment keys are absent.
- Provides 1-click test fill button ("Fill Test Card") for automated test suites and reviewers.
- Payment pre-authorizes without capturing until supplier accepts.

---

### 2.4 Trade Account Portal Strategy (`/trade`)

#### Step 1: B2B Trade Proposition
- Copy deck aligned: "Get the details right. Keep the job moving."
- Value props: Ex-VAT invoicing, case-volume discounts, priority supplier dispatch, dedicated trade hotline.

#### Step 2: Application Form & Validation
- Fields:
  - Company Name (required)
  - Companies House Number (validated regex: `^[0-9]{8}$|^[A-Z]{2}[0-9]{6}$`)
  - UK VAT Registration Number (validated regex: `^(GB)?([0-9]{9}|[0-9]{12})$`)
  - Trade Profession dropdown (Electrical Contractor, Plumbing & Heating, General Builder, Painting & Decorating, Facilities Management, Carpentry, Other)
  - Primary Contact (Name, Title, Trade Email, Phone)
  - Invoicing Address & UK Postcode
  - Estimated Monthly Spend Band (`<£500`, `£500–£2,000`, `£2,000–£10,000`, `>£10,000`)
  - Credit Terms Requested (Pay-as-you-go Ex-VAT vs 30-Day Credit Account)
  - Declaration of Authority & Terms Acceptance checkboxes
- Instant feedback on submission: Generates Application Reference `TC-TRADE-APP-XXXXXXXX`, informs of 24h review SLA, and enables instantaneous browsing in Trade Mode (Ex-VAT).

---

### 2.5 Customer Account & Order Tracking (`/account`, `/account/orders/[id]`)

#### Step 1: Customer Account Dashboard (`/account`)
- Orders overview with status badges, item counts, total landed cost, and direct tracking buttons.
- Quick VAT preference toggle (DIY Inc-VAT vs Trade Ex-VAT).
- Saved address cards.

#### Step 2: Order State Machine Timeline Visualization (`/account/orders/[id]`)
- Real-time visual progress stepper mapping the authoritative states:
  - Step 1: `checkout_authorized` (Order Placed & Pre-Authorized)
  - Step 2: `supplier_accepted` (Supplier Stock Allocated & PO Accepted)
  - Step 3: `dispatched` (Dispatched from West Yorkshire Hub — Carrier tracking assigned)
  - Step 4: `delivered` (Delivered & Verified)
- Exceptional state handling:
  - `supplier_rejected`: Renders warning badge & explanation: "Supplier stock could not be confirmed. Pre-authorization released with zero charge."
  - `refund_pending` / `refunded`: Shows timestamped audit refund status.
- Interactive Staging State Switcher:
  Allows reviewers and test runners to simulate transitions in real time (`Simulate Supplier Acceptance`, `Simulate Courier Dispatch`, `Simulate Delivery`, `Simulate Supplier Stock Rejection`) to verify all states visually.
- Landed cost summary with itemized lines, pack sizes, VAT breakdown, and printable VAT receipt action.

---

## 3. Caveats
- **Quote is not Live Inventory**: The 115 rows in `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` are a static price quote from Status International UK Ltd. In accordance with `AGENTS.md` and `docs/04_COMMERCE_SUPPLIER_SPEC.md`, all items default to `sellability_status: 'draft'` and `availability_status: 'subject_to_confirmation'` until supplier dispatch agreements are executed.
- **Single Supplier in Baseline Feed**: The baseline feed contains only Status International UK Ltd. The multi-supplier grouping architecture is designed to handle multiple supplier IDs dynamically (e.g. `status-international` vs `toolcart-hub` vs future partner feeds).
- **Stripe Live Credentials Gated**: In staging and CI environments, Stripe operates in test mode or local sandbox simulator. No real money or live card capture is enabled.

---

## 4. Conclusion
1. The **Catalog Data Loader** architecture cleanly normalizes all 115 SKUs (repairing 15 `\ufb01`, 5 `\ufb02`, and 1 `\u00d8` ligatures), handles the single-unit ladder with empty carton barcode, classifies items into 7 hardware categories, and strictly isolates wholesale costs from public DTOs.
2. The **Cart & Mini-Basket** design implements multi-supplier delivery grouping, integer-pence precision UK 20% VAT math, and responsive drawer/page views using Brand V3 components.
3. The **Checkout Flow** provides guest checkout, authoritative UK postcode formatting and validation, remote territory warnings, and `STAGING_ONLY` gated Stripe test card integration.
4. The **Trade Account Portal** provides a professional B2B onboarding experience with Companies House and UK VAT number validation.
5. The **Customer Account & Order Tracking** provides real-time state machine timeline visualization for all 13 states from `architecture/SUPPLIER_ORDER_STATE_MACHINE.md`, complete with staging simulation controls.

---

## 5. Verification Method

### 5.1 Verification Commands
- Run project test suite:
  ```powershell
  npm test
  ```
- Run static QA & Brand V3 contrast checks:
  ```powershell
  python qa/check_static.py
  ```
- Verify TypeScript compile and Next.js build:
  ```powershell
  npm run typecheck
  npm run build
  ```

### 5.2 Specific Files to Inspect
- CSV source: `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` (115 rows)
- Brand tokens: `design/tokens.css`
- UI primitives: `src/components/ui/button.tsx`, `src/components/ui/drawer.tsx`
- Implementation targets:
  - `src/types/product.ts`, `src/types/cart.ts`, `src/types/order.ts`, `src/types/checkout.ts`, `src/types/trade.ts`
  - `src/lib/catalog/normalizer.ts`, `src/lib/catalog/loader.ts`, `src/lib/catalog/pricing.ts`
  - `src/lib/cart/cart-context.tsx`, `src/lib/cart/vat-math.ts`
  - `app/(storefront)/basket/page.tsx`
  - `app/(storefront)/checkout/page.tsx`
  - `app/(storefront)/trade/page.tsx`
  - `app/(storefront)/account/page.tsx`
  - `app/(storefront)/account/orders/[id]/page.tsx`

### 5.3 Invalidation Conditions
- Any occurrence of wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) in `PublicProductDTO` or client flight payloads invalidates security compliance.
- Any floating-point rounding discrepancy in UK 20% VAT calculations invalidates tax compliance.
- Any white text on Action Lime `#DDF16A` or retired hex `#B84C32` invalidates Brand V3 compliance.
