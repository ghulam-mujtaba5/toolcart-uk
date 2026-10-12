# Supplier-first commerce: operational workflows, data model, and money controls
## In scope
A **single merchant** selling supplier-backed stock, NOT a third-party open marketplace. Suppliers are private fulfilment partners; they do not receive customer funds directly unless a legally reviewed agreement says otherwise. Store owns customer service and consumer duties. Payments, tax, catalogue and customer records in Medusa backed by PostgreSQL; supplier overlay in Medusa custom modules. Seller of record must be established before going live.

## Critical permission gate
The October 2026 quotation from Status International (UK) Ltd is a PRICE QUOTE for 115 IONOS/Status lines, not proof of direct shipping or stock. Its line prices are ex VAT and usually case-based. The quoted `unit price` represents each retail sales unit; `units per case` and `cases` multiply to supplier quantity. Never multiply pack contents as sold units. Need written confirmation of per-piece picking, case minimums, stock feeds, order acceptance times, cost of dispatch, packaging branding, UK customer tracking, returns, credit limits, stock reservation, SKU/GTIN licences/photos, product compliance docs.

## Source-of-truth separation
`Product` (canonical title, GTIN, MPN, attributes, licensed images, compliance and editorial text) owned by merchant.
`SupplierOffer` (supplier_id, supplier_sku, variant_id, case_qty, minimum_qty, cost_ex_vat, currency, service_level, source_timestamp, is_eligible).
`SupplierStockSnapshot` (supplier_offer_id, available, on_order, as_of, stale_at, confidence, reservation_supported).
`SupplierShippingRate` (zone/postcode, weight_band, parcels, carriage_ex_vat, pick_pack_ex_vat, direct_dispatch_eligible, hazardous restrictions).
`SupplierPurchaseOrder` and `SupplierPurchaseOrderLine` (idempotent, order mapping, costs/time, state, delivery group).
`ComplianceRecord` (GTIN, product class, supplier declaration, safety docs, reviewed_by, date, resale_allowed).
`CommercialDecision` (variant, channel, target selling price, margin after fulfillment/payment/returns/CAC, published_allowed, reason).

## Sellability gate
Publish as purchasable ONLY if:
1. exact SKU/GTIN and price validated; image rights confirmed;
2. safety/age/transport requirements satisfied;
3. supplier contracted and item allowed to ship directly;
4. inventory current within policy (e.g. <=15 min API, <=2 h CSV — example targets to negotiate); stale => `Check availability` not `In stock`;
5. delivered-price scenario supports positive contribution/required buffer;
6. serviceable postcode and legal merchant checkout configured.

## Checkout / supplier order state machine
`cart` -> `availability_check` -> `quoted_delivery` -> `payment_authorized` -> `merchant_order_pending_supplier` -> `supplier_PO_submitted` -> {`supplier_confirmed` OR `supplier_rejected`} -> `payment_capture` (subject to payment-provider authorization rules) -> `supplier_dispatched` -> `in_transit` -> `delivered` -> optional `return_requested` -> `return_received` -> `refund_issued`.
Note: model real payment authorisation windows and commerce-provider API compatibility; do **not** assume supplier confirmation always arrives before auth expiry. Need compensation/refund for partial/failed orders and real supplier shipping cutoffs.

## Failure handling table
- Supplier reports no stock before payment: block sale; suggest alternatives with permission.
- Supplier rejects after authorisation: void/release authorization; if captured, refund; notify buyer promptly; record reason and merchant cost.
- Multi-supplier basket: calculate per-supplier shipping + ETA; disclose split shipping; prefer one supplier when economical; no hidden post-payment surcharge.
- Supplier sends wrong item or no tracking: operations ticket / supplier SLA escalation / customer update; merchant remains responsible.
- Stale supplier feed: inventory unknown; suppress "in stock" product offer and Merchant feed availability till reconciled.
- Price changes: margin gate must re-evaluate before accepting order; never alter agreed price post-payment unilaterally.
- Refund webhook duplicate: idempotency, reconciliation report; handle part refunds and returns.

## Contribution formula
Customer payment inc VAT / appropriate VAT factor => merchant revenue ex VAT (VAT status may vary). Subtract ex-VAT product cost, supplier shipping, pick/pack, payment charges, predicted returns+damage, channel fee, CAC, other per-order service cost. Tax-deductibility/VAT recovery depends on actual seller status; validate with UK accountant.
SKU is not auto-approved simply because difference between cost and retail is large. Quote is not an offer to ship singles. Set default SKU status `draft/not_available` until approved.

## Customer promises
Only promise verified courier SLA and a truthful delivery window, supplier-direct shipping disclosure as appropriate, full contact details, cancellation rights, returns. Do not show courier logos as a claim until agreements exist. Explain if goods may be shipped in more than one parcel.

## Supplier onboarding playbook
CSV/email intake -> validate schema, GTIN/check digit, units/case, price/currency, compliance docs -> normalise -> manual review -> add to draft -> test availability -> place one test drop-ship order -> measure actual dispatch time/cost/packaging/tracking/return -> approve for paid catalogue. Owner signs approval log.
