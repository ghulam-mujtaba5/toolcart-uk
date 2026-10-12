# Architecture decisions — source of truth

1. **Next.js App Router + TypeScript + Tailwind** for customer-facing UX and SEO. Vercel commercial plan for production, Hobby staging only where terms allow.
2. **Medusa v2** for commerce, orders, returns/refunds, inventory and admin on a persistent Node host with worker.
3. **PostgreSQL** for Medusa. Supabase or Neon offer managed Postgres; Turso SQLite is not a drop-in Medusa database. Redis for Medusa modules/workflows as required.
4. **Supplier adapter service:** costs/availability on private server side; products draft until approved; source freshness TTL and safety buffer; supplier location != owned warehouse location; split shipments are explicit.
5. **Payments:** Stripe test mode at first; authoritative signed webhook and idempotent refunds/capture; real merchant legal/business status pending. No raw card data in app.
6. **Images:** supplier/manufacturer-licensed asset URLs or placeholder pending written rights; do not scrape/copy competitor product photos.
7. **AI:** retrieval uses verified catalogue/stock and approved documents; cannot infer electrical, PPE, structural, or other safety-critical suitability from hallucinated advice. No unverified stock, delivery or pricing.
8. **Search:** lexical + facets first, add semantic search only after measured need; never sacrifice category URL crawlability.
9. **SEO:** accurate product Schema.org/merchant feeds, canonical and sitemap, index public store only, noindex staging; no guaranteed AI citations.
10. **Security:** RBAC, secrets vault, webhook signature verification, rate limit, audit log, DPA, data-retention policy, cookie consent as required.
