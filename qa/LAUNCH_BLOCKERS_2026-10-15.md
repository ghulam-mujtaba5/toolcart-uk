# ToolCart UK launch blockers — 15 October 2026

## Current release decision

**Do not launch or enable live checkout.** The repository is now a safer request-only catalogue prototype, but the required supplier, merchant, legal and operational evidence is not present.

## Fixed in this pass

- Draft supplier rows no longer become publicly priced, in-stock, compliant, licensed or direct-dispatch products.
- Storefront purchase controls are disabled for every unapproved draft record; existing local browser baskets are cleared.
- Cart API rejects unapproved products and does not calculate an order from browser-provided prices or supplier details.
- Product structured data does not publish an `Offer` unless a product is explicitly approved and in stock. Staging sitemaps are empty.
- Deployed admin APIs now fail closed until an admin token is configured; this must be replaced by a real authenticated admin session before launch.
- The AI shopping assistant and mock Stripe webhook path are disabled outside explicitly opted-in local development/test workflows.
- Checkout and trade-account capture are disabled; the Stripe adapter now fails closed unless it is configured or an explicitly opted-in local/test mock is used.
- Discovery and comparison remain available, but price/stock filters, basket, AI advice and purchase actions are removed from the active customer journey until their inputs are verified.
- Unverified product pages no longer claim UKCA/CE marks, a named facility, a delivery window, stock telemetry, or a returns policy.

## Founder / supplier actions required before any paid sale

1. **Supplier contract:** obtain written direct-to-customer fulfilment agreement, single-unit/case policy, returns address, data-processing roles, delivery zones, carriage card, order acceptance SLA, tracking process and neutral-branding terms.
2. **Catalogue evidence:** for each sellable SKU, record current supplier stock with a freshness policy, approved customer price, image/content licence, product compliance evidence, restricted-goods decision, and GTIN/SKU validation.
3. **Merchant and legal:** confirm seller of record, entity and Stripe KYC; obtain UK VAT pricing treatment; publish professionally reviewed terms, returns/cancellation, delivery, privacy, cookie and complaints details with a legal contact address.
4. **Security:** replace the transitional admin bearer-token gate with role-based authenticated admin access; keep server-side supplier costs private; configure production secrets only in the host.
5. **Operations:** test ten sandbox orders and five real supplier samples; rehearse stock rejection, timeout, partial dispatch, cancellation, refund and webhook retry paths; configure monitoring, backups and a daily reconciliation owner.
6. **Brand/IP:** complete `.uk`/`.co.uk`, UKIPO, Companies House and social-handle clearance before representing ToolCart as a trading brand.

## Minimum technical release gate

Enable a product only when its commercial decision, supplier offer, fresh stock snapshot, shipping quote, compliance record and licensed media are persisted server-side. At checkout, re-check stock and delivery, create an idempotent supplier allocation, and capture payment only according to the documented supplier-confirmation recovery policy. Do not make the current CSV-derived in-memory catalogue the production source of truth.
