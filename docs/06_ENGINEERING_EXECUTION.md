# Engineering execution, acceptance gates and agent implementation instructions
## Architecture decision record
Storefront Next.js App Router + TypeScript + Tailwind, hosting Vercel Pro/commercial plan. Medusa v2 (products/cart/checkout/orders/admin) on separate persistent Node server and worker, PostgreSQL Supabase or Neon, Redis, S3/R2-compatible licensed media, Stripe test then live if approved UK legal merchant, Sentry error reporting, email service with SPF/DKIM/DMARC. Choose UI components with keyboard navigation. Prefer Medusa official Next.js starter as integration reference rather than rewriting orders/refunds. Avoid parallel custom ecommerce database that conflicts with Medusa.

## Repo skeleton
```
apps/storefront/app/{(marketing),tools,fixings,decorating,products/[slug],guides,projects,basket,checkout,account,trade}/
apps/storefront/components/{header,search,category,product,cart,assistant,footer}/
apps/storefront/lib/{commerce,analytics,seo,formatters,brand}/
apps/commerce/src/modules/{supplier,availability,product-evidence,price-control}/
apps/commerce/src/workflows/{supplier-quote,supplier-order,shipment,compensate-order}/
packages/design/{tokens,components}/
packages/contracts/{supplier-csv,order-status,ai-tools,analytics}/
packages/test-fixtures/{supplier-quotes,checkout-stubs}/
docs/{ADRs,security,launch}
```

## Sequential 2-week sprints (indicative, not guaranteed)
**Sprint 0 - Risk reduction:** Brand/merchant placeholder, supplier interview and sample parcel, price/fulfilment SLA signed, 15 actual verified product records, design tokens, architecture ADR. GO to production impossible without signed terms.
**Sprint 1 - Usable browse:** repos, CI, staging, token system, responsive header/search, 6 category pages, product cards, accurate attributes, product data importer -> draft state, media rights fields.
**Sprint 2 - Commerce:** Medusa Admin, product variants, carts, guest checkout, Stripe test payments/webhooks, VAT presentation and actual delivery quote API, terms and returns, transaction email simulation.
**Sprint 3 - Supplier operations:** feed sync with validation/dry-run, per-offer cost/stock TTL, supplier booking/PO, retries and idempotency, tracking, cancellation/return/refund controls, alerting on stale feeds.
**Sprint 4 - SEO/go-live:** SSR, JSON-LD, sitemap, Merchant Center staging audits, mobile speed, accessibility, help guides, analytics, backups/restore test, penetration basics, 10 real non-customer test orders, approved launch.
**Sprint 5 - Assisted shopping / growth:** safe AI product finder, 3 validated project baskets, compare product specs, 5 original guides, monitored acquisition experiments, email support; no marketplaces without operational KPI gate.

## Non-negotiable test matrix
- Supplier feed 10,000+ rows -> parse validation and report errors; rows with missing GTIN possible but require review; prevent duplicate SKUs.
- Case vs pack correctness: IONOS 36-piece screwdriver set quote unit £3.60 ex VAT; `Units per Case = 6`. Import as 6 retail units for one case, NOT 216 screwdrivers.
- Price changed between view and checkout -> price refresh and explicit re-confirmation.
- Stock API returns stale/unavailable -> disable checkout or display waiting; do not silently oversell.
- Payment captured but supplier PO rejected -> automatic incident + refund/void workflow and customer notification.
- Signed Stripe webhooks are idempotent and order not duplicated on retries.
- Guest can view own confirmed order securely via authenticated token, cannot enumerate others.
- Accessibility: keyboard search/filter/cart, focus visible, input labels, dialogs; responsive 360–1440 px.
- Security: CSRF appropriate, endpoint authorization, rate limiting, input limits, log redaction, admin roles, no supplier credentials exposed.
- Performance targets (engineering goals, not user-tested reality): LCP <=2.5 s P75 mobile, INP <=200 ms P75, CLS <=0.1 P75, 404/empty states. Audit actual Core Web Vitals.
- End-to-end: browsing, add-to-cart, shipping quote, payment auth, supplier confirmation, partial failure, fulfillment, return/refund, expired auth and abandoned basket.

## Definition of done for each PR
Code, test evidence, screenshots mobile+desktop, risk notes, source links on claims, feature flags, observation/rollback, docs for non-obvious workflows. `npm test`, lint, build pass. Never merge large supplier-flow changes without failure scenario integration tests.

## What NOT to implement as launch requirements
Third-party seller onboarding/open marketplace, native mobile app, fully autonomous AI purchasing, dynamic competitor-price scraping, 100k AI-generated location pages, customer loyalty points, microservices explosion, multi-currency checkout, FBA sync, fancy 3D configurators. This is a single-merchant store with supplier-direct fulfilment.
