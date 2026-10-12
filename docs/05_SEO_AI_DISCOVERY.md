# SEO, AI search, and product discovery implementation
**Truth:** custom Next.js does not guarantee recommendations by Google AI Mode, ChatGPT, Claude or Gemini. External citations/discovery are editorial and algorithmic, not purchasable by adding a metadata file.

## Technical requirements
- UK en-GB, GBP, correct VAT display/merchant contact/address and customer policy pages.
- SSR/SSG usable HTML product pages, canonical, title, description, breadcrumb, 200/404 lifecycle, reliable robots.txt and sitemap indexes; crawl only validated sellable products.
- Product+Offer JSON-LD (visible facts must match), GTIN, MPN, brand, stock, price, delivery/returns; variants via ProductGroup when appropriate; breadcrumb/schema. No fake reviews, rating or availability.
- Merchant Center structured feed: item_id, title, description, link, licensed image_link, GTIN, brand, condition, GBP price inc VAT, availability, shipping & returns settings. Check feed vs visible PDP vs Medusa at publish time. Google free listings may show on Search, Shopping, Images, Lens, YouTube, Gemini, but not guaranteed.
- Search Console and Bing Webmaster Tools verified; measure index coverage and errors. Noindex staging and preview builds; remove only for verified production pages.
- Accessible semantic buttons/forms, labels, landmarks, predictable cart steps, since agents can interact with well-labelled controls.

## ChatGPT search crawler
OpenAI describes independent user agents `OAI-SearchBot` (Search) and `GPTBot` (training). Allow OAI-SearchBot on public content if desired. Decide GPTBot training separately. Don't block Googlebot/Bingbot via firewall or over-restrictive robots. Analyse ChatGPT referrals e.g. utm_source=chatgpt.com where present.

## Suggested route structure
`/tools/`, `/tools/screwdrivers/`, `/tools/saws/`, `/fixings/`, `/decorating/`, `/measuring/`, `/safety/`, `/brands/ionos/`, `/guides/`, `/projects/`, `/products/{human-slug}/`, `/trade/`, `/delivery/`, `/returns/`, `/contact/`.
Never generate thousands of low-quality keyword pages. Category routes must match actual available inventory. Avoid indexable facets with massive duplicate URL combinations: canonicalise according to SEO policy.

## Editorial growth flywheel
Candidate guides built on real product facts and original practical instruction: "Which wall plug size do I need?", "What's included in this screwdriver set?", "Paint roller nap and surface guide", "Choosing a hacksaw blade", "How to understand tape measure widths". A guide must contain clear limits and warnings; qualified review on structural/electrical/safety-related advice. Product knowledge should support recommending bundles, not fabricated performance test results.
Use original customer questions, verified manufacturer manuals, product specs, and anonymised support enquiries as sources. Cite/attribute underlying manufacturer docs where appropriate. Avoid wholesale copying.

## AI assistant — safe v1
Flow: user question -> intent & dimension parsing -> deterministic product filters (material/size/brand/GTIN) -> authenticated internal inventory/price query -> optionally retrieval over manuals -> grounded explanation -> 1-3 valid products + `why` + evidence -> request customer approval for basket proposal. No direct payment initiation, no invented delivery date, no unsafe definitive DIY load advice, no hidden sponsored ordering. Hand off uncertain high-stakes advice to qualified support.
Tools v1: searchCatalog, getProductTechnicalSpecs, getAvailability, getShippingQuote, getProjectBundle, getOrderStatus (auth required), proposeBasket (confirm required). No autonomous purchases.

## Analytics events / warehouse
`search_submitted`, `search_zero_results`, `filter_applied`, `product_viewed`, `product_added`, `basket_viewed`, `delivery_quote_viewed`, `checkout_started`, `payment_failed`, `purchase`, `supplier_po_confirmed`, `supplier_po_rejected`, `shipped`, `delivered`, `return_requested`, `refund_completed`, `ai_chat_started`, `ai_product_shown`, `ai_product_clicked`, `ai_basket_proposal`, `ai_assisted_purchase`.
Event payloads: session/referrer source, canonical SKU, supplier fulfilment group id (internally), basket value, consent, device, error reason, marketing channel. Avoid PII and full chat transcripts by default. Attribute AI-assisted purchase within an agreed lookback window, avoid asserting causation. Run an A/B test before claiming AI improves conversion.

## Acceptance testing
- Google Rich Results Test + Merchant Center feed diagnostics, manually review 10 variants and edge cases.
- Request HTML without JS; ensure title, description, price and availability visible in initial HTML for a published PDP.
- Robots allowed for production pages, explicitly disallowed for admin, cart/order/private paths as appropriate; staging `noindex` and access controls.
- Track search impressions/clicks and ChatGPT referral separately. Google AI Mode exposure cannot presently be assumed as its own dedicated trackable query stream.

## Sources
Google AI features: https://developers.google.com/search/docs/appearance/ai-features
Google merchant listing: https://developers.google.com/search/docs/appearance/structured-data/merchant-listing
Google variants: https://developers.google.com/search/docs/appearance/structured-data/product-variants
Merchant Center free listings: https://support.google.com/merchants/answer/13889434
OpenAI crawlers: https://developers.openai.com/api/docs/bots
ChatGPT publishers: https://help.openai.com/en/articles/12627856-publishers-and-developers-faq
