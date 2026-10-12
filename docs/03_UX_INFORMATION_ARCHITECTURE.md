# Storefront information architecture and page templates
## Primary navigation (source-aligned, expand when catalogue supports)
`Tools` / `Bits & Accessories` / `Fixings & Security` / `Decorating` / `Measuring` / `Workwear & Safety` / `Tapes & Consumables` / `Shop by Job` / `Brands` / `Trade`
Do not show non-existent categories as populated. Optional automotive becomes visible only after supplier-authorised live SKUs exist.

## Home page, in order
1. Utility strip: customer support, delivery policy link, VAT/legal merchant info (no unverified next-day promise).
2. Sticky header: logo; category menu; large prominent search (products, SKU, GTIN, synonyms); account; basket; accessible mobile drawer.
3. Hero: "The right tools. The right advice." Two CTAs: `Shop tools & hardware`, `Help me find the right product` (AI disabled until trusted).
4. Six active category cards, data-backed.
5. "Shop by job": Hang a shelf / Decorate a room / Secure a door / Set up a tool kit; only publish project pages with real validated bundle suggestions.
6. "Popular with customers": label only if analytics supports it. Before first sales use "Explore the range".
7. Buying guides: searchable, reviewed by person named in author bio if true.
8. "Why shop with us": only proven claims; supplier-led delivery and order support explained plainly.
9. Newsletter form with documented consent handling; footer with verified company details, delivery, refunds, privacy/cookies, contact, payment logos only when available.

## Product listing (PLP)
Breadcrumbs + 1 H1 + short category intro. Cards show image, precise product title incl pack size, price inc VAT (+ ex VAT toggle for trade), key dimension, verified stock state, delivery estimate if available, call to action. Desktop sidebar filter; mobile drawer with apply button; multi-select facets, clear all and applied chips; sort relevance, price low/high, newest, best-selling only if data validates.

Category facets by type: tape -> width/length/colour; screw/bolt -> diameter/length/material/pack; paint -> volume/finish/application; saw -> blade size/teeth/application; gloves -> size/material/certification; bits -> diameter/shank/material. Never invent missing attributes.

## Product details (PDP)
Left: licensed photos including package/dimensions, zoom. Right: product name, brand, GTIN, technical size, pack count, GBP price inc VAT, availability (confirmed/subject-to-confirmation/unavailable), shipping quote and expected date (confirmed only), quantity, add to basket if sellable. Below: spec table, what’s included, compatibility warnings (from source), downloadable manuals, returns, support, alternatives, project cross-sell. Review section appears only after authentic reviews have been collected.

## Product search
Autosuggest products, categories, SKUs and spelling variants. 0-results recovery: product synonym suggestions, browse relevant category, question about project, contact support; don't synthesize nonexistent product. Precision priority for technical inventory; don’t rely on embeddings for numeric dimensions.

## Basket and checkout
Persistent basket summary with line-item total, VAT included/ex VAT breakdown where appropriate, shipping by postcode, delivery group by supplier, true final total BEFORE payment, discount validation, guest checkout, address verification. One supplier group can reduce split-shipment cost. Don't display "order confirmed" until payment and order creation succeed. Supplier rejected -> order issue workflow and customer notification/refund or substitution only with permission.

## AI shopping assistant UX
Entry: "What are you working on?" Ask category + material + dimensions + intended load if relevant. Show 1–3 catalog matches with why, source facts and stock/price timestamps. Offer basket proposal; customer confirms add. Unknown safety/compatibility => honest no-recommendation, refer to verified manual or professional. Logs event `ai_recommendation_selected`, never claim increased conversion until measured.

## Responsive acceptance
360px through widescreen; keyboard-only and screen reader flow; touch target >=44px; focus visible; checkout tests with font scaling. No unnecessary carousel or auto-playing videos. Largest contentful image optimized with descriptive alt; no layout shift on image load.
