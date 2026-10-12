# Technical implementation architecture

## Recommended baseline
- `apps/storefront`: Next.js App Router + TypeScript + Tailwind/shadcn, hosted on Vercel **Pro** for commercial sales.
- `apps/commerce`: Medusa v2 API/Admin, persistent Node.js host with server+worker; avoid treating Vercel serverless functions as Medusa's production host.
- `PostgreSQL`: Supabase Postgres (or Neon managed Postgres alternative). Medusa owns commerce tables/ORM. Custom supplier tables in Medusa module migrations, not uncontrolled direct mutations to core tables.
- `Redis`: managed Redis for event bus, workflow engine, locks, caches and session as per Medusa documentation.
- `Object storage`: S3-compatible (R2/S3) for product images and product-safety docs; prevent public disclosure of private invoice/customer files.
- `Search`: Postgres FTS initially for small catalogue; Typesense/Meilisearch when facets/synonyms/large scale justify. Semantic embeddings only for recommendation fallback, not truth/stock.
- `Email`: transaction email via reputable provider (Resend/SendGrid/SES) with SPF, DKIM and DMARC; do not send from a developer Gmail.
- `Logging`: Sentry and structured logs, audit of order state, no raw card data, redact addresses and secret keys.
- `AI`: server-side tool-calling model, product search & metadata; response grounded in published catalog, never invent compatibility/price/stock or finalise purchases without buyer action.

## Architecture diagram
```text
UK browser & Google/AI crawlers
       | HTTPS
   Vercel Pro (Next.js storefront & SSR)
       | API + signed publishable key / auth
   Medusa API + Admin [persistent Node service]
       +--- Medusa commerce modules ---- PostgreSQL (Supabase/Neon)
       +--- Event/worker/locks --------- Redis
       +--- Product media ------------- S3/R2
       +--- Stripe provider ----------- Stripe webhooks
       +--- Fulfilment connector ------ Supplier A CSV/SFTP/API/manual
       +--- Transactional notifications-- Email provider
       +--- Search sync -------------- Search index
       +--- AI tool endpoints --------- LLM provider
```

## Database entity sketch: supplier overlay
`Suppliers(id, name, dispatch_mode, vat_number?, country, currency, SLA_days, payment_terms, return_policy_ref, feed_endpoint_secret_ref, is_active)`
`SupplierOffers(id, supplier_id, product_variant_id, supplier_sku, unit_cost_ex_vat, currency, case_qty, min_order_qty, pick_fee_ex_vat, shipping_fee_basis, feed_seen_at)`
`SupplierStockSnapshots(id, supplier_offer_id, reported_qty, reserved_qty_if_supported, feed_seen_at, expires_at, availability_status)`
`SupplierPurchaseOrders(id, medusa_order_id, supplier_id, external_po_id, state, total_cost, supplier_confirmed_at, dispatch_deadline, idempotency_key)`
`SupplierOrderLines(id, supplier_po_id, medusa_line_id, requested_qty, accepted_qty, cost_snapshot, supplier_line_ref)`
`SupplierTracking(id, supplier_po_id, carrier, tracking_number, tracking_url_verified, shipped_at, last_event_at)`
`ProductTechnicalAttributes(variant_id, taxonomy, dimensions, materials, allowed_uses, contraindications, doc_links, source_evidence, reviewed_at)`
`SyncRuns(supplier_id, source, started_at, completed_at, records_read, accepted, rejected, feed_hash, error_summary)`
`OrderAudit(id, medusa_order_id, event_type, from_state, to_state, actor, timestamp, correlation_id)`

## API contracts (model; routes to implement, not built-in Medusa endpoints)
`GET /store/supplier-availability?variant_id=...&qty=...&postcode=...` -> `{state: "confirmed"|"estimated"|"unknown"|"unavailable", available_to_order, dispatch_estimate, source_age_minutes}`; never expose supplier commercial rates.
`POST /admin/supplier-feeds/{supplier_id}/sync` -> admin auth, job ID, async.
`GET /admin/supplier-feeds/{supplier_id}/runs` -> sync status and errors.
`POST /admin/orders/{id}/supplier-submit` -> admin-only, idempotency required, back-office action log.
`POST /webhooks/suppliers/{supplier_id}` -> HMAC verify, timestamp tolerance, idempotency event ID, no unauthenticated order mutation.
`GET /store/ai/search` (or server action) -> product lookup & grounded FAQ; rate limited.
`POST /store/ai/propose-basket` -> proposal only; user must confirm any cart mutation.
`GET /feeds/google/products.xml` -> public Merchant feed; excludes restricted/mispriced/unavailable items.

## Supplier selection decision
1. Merchant offer is eligible only if regulatory docs, fulfilment and current cost confirmed.
2. Reject expired snapshots for instant dispatch claims; treat unknown as awaiting supplier confirmation.
3. Compute landed item cost plus pick, dispatch, postage, return allowance, payment fees, bundle allocation and CAC.
4. Prefer supplier with expected on-time quality and profitable contribution; supplier API reservation preferred.
5. Group same-supplier basket and measure any multi-supplier parcel penalties before promise.
6. Cache read only, recheck immediately pre-payment; handle race condition even after recheck.

## Security and data protection
Production secrets only server-side env/secret manager. Stripe webhook signature mandatory. RBAC: staff cannot see all credentials; restrict purchase authorisation. Validate inputs with Zod; CSRF/auth protections as applicable; customer order lookups must verify identity, not just guessable order ID. Separate staging vs production Stripe keys. Avoid storing unnecessary sensitive customer data in LLM logs; retain PII per UK legal assessment. Backups tested by actual restoration. Accessibility tested. Supplier CSV inputs sanitized before import.

## CI/CD and observability
GitHub PR -> lint/typecheck/unit tests -> playwright smoke on preview -> approval -> production deployment. Staging never sends real supplier POs or charges cards. Alert on stock feed stale, supplier rejection, queue failures, 5xx spikes, payment auth uncaptured near expiry, undelivered after SLA, unexpected negative contribution. Immutable order logs + reconciliation report. Provider SDK versions pinned to compatible patched releases.

## Source references
https://docs.medusajs.com/learn/deployment/general
https://docs.medusajs.com/resources/commerce-modules/inventory
https://docs.medusajs.com/resources/commerce-modules/payment
https://supabase.com/pricing
https://neon.com/blog/neon-free-plan-1-gb-per-project
https://vercel.com/docs/limits/fair-use-guidelines
