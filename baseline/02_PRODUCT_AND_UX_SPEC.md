# Storefront PRD: UK tools / hardware / DIY / trade supplies

## Brand and customer
Brand placeholder `BRAND`: no final legal/domain clearance yet. Position: **"The right supplies for the job, with helpful expert guidance."** Avoid promising lowest prices or instant delivery without evidence. Primary customers: UK homeowner/DIY, handyman, decorators/property maintenance; secondary trade buyers.

## Reference websites — borrow functional patterns, NOT pixel-perfect designs, code, logos or photos
- https://www.toolstation.com/ — broad taxonomy, prominent product search, delivery propositions, trade account, guides.
- https://www.screwfix.com/ — rapid search/order, collection availability, buying convenience, prominent service information; sophisticated competitor, **not inherently a poor site**.
- https://www.ironmongerydirect.co.uk/ — specialist specification & ironmongery taxonomy; inspect door hardware product filters.
- https://tradecounterdirect.com/collections/hand-tools-spanners-and-wrenches-spanners — filter facets for brand, price, stock; inc/ex VAT presentation; SKU, category counts.
- https://www.fixingsstore.com/spit-011346-sc9-collated-pins-50mm-for-steel-concrete-p370/p/25031 — pack size, bulk tiers, technical datasheet, compatibility, stock/delivery.
- https://www.wickes.co.uk/ — home improvement categories and project/how-to content.
- https://www.axminstertools.com/ — product learning/craft and technical education inspiration.

## Sitemap / routing
`/` home
`/shop` full catalogue
`/tools/hand-tools` and `/tools/measuring` etc.
`/fixings/bolts`, `/fixings/wall-plugs`
`/decorating/paint-brushes`, `/decorating/preparation`
`/security/locks-and-door-hardware`
`/brands/ionos`, future authorised brands
`/products/{descriptive-unique-slug}` (permanent canonical, 301 on change)
`/projects/{project-slug}` browse-by-job
`/guides/{editorially-reviewed-guide}`
`/search?q=` (normally noindex query URLs), `/basket`, `/checkout`, `/order-confirmation`
`/account/orders`, `/account/returns`, `/track-order`
`/delivery`, `/returns`, `/contact`, `/about`, `/privacy`, `/terms`, `/cookie-policy`, `/trade`

## Header
Mobile-first utility stripe: realistic delivery and UK service proposition. Logo, prominent predictive search accepting SKU/GTIN/terms/misspellings, account, wishlist (later), basket. Desktop categories as mega menu; mobile drill-down drawer with minimum tap targets. Search should suggest products, categories and guides; keyboard support; explicit zero-results recovery.

## Homepage sections
1. Clear value proposition and search: "What are you working on?"
2. Category cards: hand tools, fixings, decorating, measuring, workshop, door/security.
3. Verified in-stock/supplier-confirmed featured products (do not fabricate stock).
4. Task/shop-by-project cards: hang a shelf, secure a shed, decorate a room, assemble furniture.
5. Why buy: verified promises (supplier-backed availability, customer support, payment security).
6. Bundles and essential add-ons.
7. Genuinely useful guide previews, customer service / FAQs.
8. Newsletter only with compliant opt-in.

## PLP category template
SEO intro + breadcrumb; browseable facets: category, brand, price, pack quantity, size, materials, stock status, delivery class; optional tool type and compatible application. Show in-stock vs "available to order" distinctly. Mobile bottom sheet filters, active filter chips, sort by relevance/price and paginated or crawlable view. Avoid indexable faceted duplicates/crawl traps. Cards show image, full manufacturer/model title, spec differentiator, price inc VAT, unit/pack, expected despatch, add-to-basket or view options.

## Product detail (must be exact)
Gallery licensed images, SKU/GTIN/MPN, manufacturer/brand, pack definition, price inc VAT and ex VAT for trade users where legally suitable, availability class, postcode-based delivery promise if known, variants, qty, add-to-cart; specifications in tables; safety info and required warnings, manufacturer documentation, returns, item alternatives, compatible products, project content, reviews only if authentic. Attributes specific to category. Do not claim EN compliance without certificate. Avoid misleading "only 2 left" urgency on shared supplier stock.

## Cart/checkout
Guest checkout required; address autocomplete optional; show shipping **before final payment**; line-level source/split-shipment ETAs; VAT/total clearly shown; Stripe Payment Element and supported wallet methods; purchase policy check; consent separate from checkout; payment error recovery without double charge. Basket abandoned reminder only with lawful consent/basis; invalid stock re-validate and explain.

## Accessibility and performance acceptance
Core Web Vitals targets: LCP <=2.5s at p75, CLS <=0.1, INP <=200ms (targets, not guarantees). WCAG 2.2 AA objective; keyboard, contrast, alt text, price errors accessible. Server-render critical product details and prices; Next.js cached catalogue with cache invalidation when price/availability changes. Don't prebuild millions of SKUs. Keep purchase path lightweight even if AI service unavailable.

## Responsive UI components
`HeaderSearch`, `MegaMenu`, `Breadcrumbs`, `ProductCard`, `ProductGallery`, `PriceBlock`, `StockStatusBadge`, `DeliveryEstimate`, `AttributeFilters`, `ComparePanel`, `CompatibleAccessories`, `BundleBuilder`, `ProjectWizard`, `AIHelpDrawer`, `VATPriceToggle` (presentation only), `CheckoutSummary`, `ReturnsPortal`.

## MVP vs deferred
MVP: catalogue, search, facets for stocked pilot, cart, checkout, admin, order status, supplier confirmation workflow, reliable shipping, basic SEO/merchant feed, a constrained AI product assistant (read-only first).
Deferred: loyalty, trade credit, autonomous multi-supplier purchasing, advanced personalisation, seller marketplace, mobile app, cross-supplier route optimiser, native voice assistant.
