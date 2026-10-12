# Organic search, AI discovery and acquisition plan

## Positioning
Google AI Mode/AI Overviews and conversational assistants are potential discovery **channels**; no known SEO platform guarantees recommendations or mentions. Google says indexed, snippet-eligible pages and standard helpful-content SEO are the foundation. OpenAI search crawler OAI-SearchBot may be allowed independently from training-oriented GPTBot controls.

## Technical SEO acceptance
- Crawlable server-rendered canonical product/category pages: unique descriptive URL, visible price/spec, no client-only critical information.
- Correct `Product`/`Offer`, `BreadcrumbList`, `Organization`, `WebSite`, shipping/returns structured data, accurate availability and price; test Rich Results.
- Canonical URL, redirects, sitemap index, robots rules, breadcrumbs, internal linking; product variants handled intentionally.
- Noindex personal account, basket, checkout, on-site search result pages, duplicate faceted filter combinations. Avoid accidentally blocking Googlebot, Bingbot or OAI-SearchBot for public content.
- Google Merchant Center feed from one authoritative product source: GTIN/MPN/brand, image URL, price, stock, delivery, return data matching site.
- Bing Webmaster Tools and IndexNow if supported as part of an evaluated deployment.
- Search Console and event analytics; measure clicks from AI referrals where UTM/referrer actually available, but don't conflate AI mentions with sales.

## Valuable content by product/project
- Wall plug and screw size cross-references (manufacturer-approved / tested).
- Brick vs plasterboard fixing guide with safety thresholds.
- Which paint brush/roller for wood stain, gloss or emulsion?
- Basic hand-tool starter sets, screwdrivers and hex key size comparisons.
- Hinge/bolt sizing and mounting guidance.
- Product equivalences only with documented compatibility; for safety-critical uses, tell customer to consult qualified expert.
- Build curated *project basket* pages with verified products, quantities, caveats and prices.
- Publish accurate brand landing pages and explain genuine distribution relationships; no misleading "authorised dealer" claims.
- Genuine product demonstration video and unique specifications/photos; AI-generated text edited by qualified human.

## Marketing phases
**Phase 1 (weeks 1–6):** SEO infrastructure, Merchant Center, technical content, 3–5 project pages, Search Console, brand handles, organic video tests. Keep low CAC; no large ad budget until fulfilment proven.
**Phase 2:** 5–10 creative variants/wk on TikTok/IG/YT shorts, product demonstration/repair comparisons, targeted Shopping or Search campaigns capped by max contribution margin after cost.
**Phase 3:** repeat-customer email under consent rules; basket cross-sells; eBay listings for exact EAN products with compliant suppliers and correct fees; Amazon and TikTok Shop once SLAs proven.
**Phase 4:** trade accounts, quoting, trade packs, repeat orders, brand partnerships, unique research/testing, PR/backlinks.

## Analytics event specification
`view_item`, `view_item_list`, `search`, `filter_apply`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info`, `purchase`, `refund`, `search_no_results`, `supplier_availability_unknown`, `shipping_quote_error`, `ai_chat_start`, `ai_product_recommended`, `ai_product_clicked`, `ai_basket_proposed`, `ai_assisted_purchase`, `return_initiated`.
Carry anonymised campaign and session attribution with lawful analytics implementation; protect PII. Dashboard: revenue net VAT, COGS, payment+carrier cost, contribution before/after CAC, AOV, conversion, repeat rate, feed success, customer cancellations, returns, content-to-product clicks, AI assist conversion.

## Experiments
A/B: natural-language search vs traditional search; bundle card vs cross-sell, inc VAT clear pricing, shipping threshold, product spec hierarchy, content guides to cart. Decision by contribution/order and customer satisfaction, not chat messages or impressions.

## Official references
https://developers.google.com/search/docs/appearance/ai-features
https://developers.google.com/search/docs/appearance/structured-data/product
https://developers.google.com/search/docs/appearance/site-names
https://developers.google.com/search/docs/fundamentals/using-gen-ai-content
https://developers.openai.com/api/docs/bots
