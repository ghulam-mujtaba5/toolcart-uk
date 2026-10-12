# Roadmap and launch QA — supplier-backed UK hardware

## Estimated calendar (solo skilled developer, realistic planning ranges)
**Week 0–1 — gates:** supplier meeting/sample orders, legal merchant/VAT/payments eligibility, domain/brand trademark checks, select 20–50 low-risk SKUs, get image rights and product data.
**Week 1–2 — foundation:** Next.js storefront + Medusa backend/admin/Postgres/Redis locally; staging; deploy pipeline; CSV importer; variant/GTIN mapping; SKU taxonomy; purchase cost.
**Week 3–4 — sellable MVP:** catalogue, search/filter, pages, basket, Medusa Stripe, VAT/delivery policies, order emails, manual supplier confirmation queue, cancellation/refund admin, guest checkout.
**Week 5–6 — hardening:** UK postcodes, shipping quotes, supplier feed ingestion with staleness/price drift, event audit, safe status messaging, 5–10 test deliveries, automated tests/security and backups.
**Week 7–8 — discovery launch:** Search Console, Merchant Center product feed, 3–5 in-depth guides, core web vitals, analytics, limited organic launch with support coverage.
**Weeks 9–12 — optimise:** search synonyms, bundles, reviewed AI assistant, customer feedback, paid ads test only if positive unit economics, evaluate marketplace pilot.
Longer if backend/dependency unfamiliar, supplier provides no automation, or merchant registration delays. NOT a launch promise.

## Hard launch gates — all must pass
1. Live contract and legal seller established, payment processor approved.
2. Reliable UK supplier fulfilment capacity demonstrated by sample orders, trackable parcels, returns location and contact.
3. Exact selected SKUs/GTINs, pack sizes, prices, VAT, media rights, safety info, weights and dimensions validated.
4. Supplier invoice economics inclusive of pick/pack/carriage are known and model shows acceptable contribution.
5. Card checkout, 3DS, partial refund, full refund, failed webhook, supplier cancellation, split basket and oversize postcode tested.
6. Site accessibility and mobile purchase path, cookie/privacy, legal policies, business identity, proper support email confirmed.
7. Error monitoring, admin permissions, backups & restoration verified; no real keys in Git.
8. Search and product feeds reflect availability: no false “in stock” claims.

## Test matrix
Functional: price/stock cannot change undetected on checkout; variants and pack quantity; out of stock; manual supplier confirmation; tax rates; shipping by postcode; multi-supplier split; currency GBP; discount stacking; coupon abuse; idempotent Stripe webhooks; refunds after settlement; failed payment and abandoned checkout.
Security: admin RBAC; user-only order access; replayed webhooks; invalid barcode injection; CSV formula injection; supplier credentials leak; rate-limit search and AI; nonpublic docs and invoices access.
SEO: crawl as logged-out user, canonical product slugs, price/stock JSON-LD parity, product feed rejection monitoring, Search Console indexing, 404/redirect, category pagination & robots.
Operation: missing supplier SKU, feed stale, price increase, short shipment, no tracking, wrong item, courier lost parcel, customer address correction, chargeback, product recall.
Load: critical flows stable at expected traffic; no goal of 100k users based on prior site's non-ecommerce analytics.

## Acceptance criteria for initial launch
- User can search and buy actual items with accurate prices & dispatch commitments.
- Admin can view paid orders and submit supplier POs with role-based authorization.
- Supplier rejects an item: merchant receives alert, refunds/voids payment and customer gets prompt explanation.
- Completed order has traceable payment, source, supplier cost, shipping fee and tracking.
- All customer-facing inventory phrases come from validated source freshness.
- No order can silently be marked paid or shipped without gateway/dispatch evidence.
- All content/AI recommendations cannot put regulated or incompatible items into basket without required safeguards.
