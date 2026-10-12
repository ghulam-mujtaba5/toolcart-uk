# Supplier-first operating model

## Fulfilment choices (priority order)
**A — Supplier-direct dropship (preferred only if supplier explicitly supports it).** Store takes order; supplier confirms/allocates stock and ships direct. Negotiate neutral/branded packaging, tracking and no competing supplier promotions. Supplier invoices seller of record. Single-order carriage and pick fees must be documented.
**B — Supplier-to-partner dispatch.** Supplier sends goods to partner/merchant consolidation point; partner ships to buyer. This can rescue suppliers without direct dispatch, but two shipping legs may make low-value orders unprofitable. Prefer daily consolidated inbound deliveries.
**C — Owned buffer stock.** Buy repeat sellers after measured velocity proves it; use for fast dispatch, multi-item bundles and delivery SLA control.
**D — Marketplaces.** Sales channels are orthogonal to stock ownership. Before activating Amazon/eBay/TikTok, confirm the specific platform's dropship/fulfilment and performance policies.

## Critical nuance: inventory isn't purchase commitment
- `supplier_qty` = last reported total at supplier, shared with other retailers; not guaranteed allocated to us.
- `available_to_promise` should account for safety buffer, feed age, supplier reliability, MOQ, restricted delivery zones and ability to reserve.
- If API reservations aren't possible, avoid a "guaranteed available" promise. Display **"Available to order — dispatch estimate X–Y working days"** only when SLA verified.
- Manual/CSV supplier feeds have limited freshness. Feed stale -> suspend instant purchase or mark awaiting confirmation.
- Sell only verified suppliers' eligible SKUs with physical UK stock, valid UK shipping route and returned/defective goods plan.

## Suggested operational state machine
`PENDING_PAYMENT → PAYMENT_AUTHORISED → SUPPLIER_CONFIRMATION_PENDING → SUPPLIER_CONFIRMED → PURCHASE_ORDER_SENT → SUPPLIER_ACCEPTED → DISPATCHED → DELIVERED`
Exceptions: `SUPPLIER_REJECTED`, `PARTIALLY_AVAILABLE`, `PRICE_CHANGED`, `PAYMENT_FAILED`, `CANCEL_REQUESTED`, `LOST_IN_TRANSIT`, `RETURN_REQUESTED`, `RETURN_RECEIVED`, `REFUND_PENDING`, `REFUNDED`.
These are **custom operational states** alongside Medusa's standard order/payment/fulfilment states; don't replace Medusa core order state carelessly.

## Supplier order orchestration (safe MVP)
1. Customer checks out; server revalidates listed item and latest supplier availability snapshot.
2. Authorise payment (when enabled/appropriate); preserve idempotency key.
3. Create order and mark `supplier_confirmation_pending`; never claim dispatched.
4. Submit supplier PO only after human approval in MVP unless reliable supplier order API exists; secure vendor cost snapshot.
5. Supplier accepts and supplies expected despatch date. Capture payment according to gateway authorization window, terms and merchant risk procedures. If unable to fulfil, void/release authorisation or refund promptly.
6. Supplier returns carrier/tracking; independently validate format and email customer; do not create fake tracking.
7. Reconcile invoice vs ordered cost, supplier payments, returns and customer delivery.
8. Audit every action, retry webhooks idempotently; send exceptions to dashboard + founder alert.

## Supplier feed contract (CSV/API)
Minimum fields: supplier_id, supplier_sku, gtin, stock_qty, current_unit_cost_ex_vat_gbp, minimum_order_qty, case_qty, available_to_dropship, dispatch_lead_days, cut_off_time, parcel_weight_g, length_mm, width_mm, height_mm, location, restricted_postcodes, last_modified_utc.
Optional: product title, manufacturer, brand, compliant product media, safety docs, warranty, packaging charge, outbound carriage cost.
Refresh rates: start 30–60 min if allowed, else match supplier SLA; a no-feed supplier requires manual verification. Record `feed_received_at`, `feed_age`, missing SKU, price drift, negative stock and validation errors. Never use an undocumented feed interval as a promised SLA.

## Product source vs supplier offers
One catalog item may have several offers. Catalog entity `product` (title/GTIN/specs/images/legal data), `variant` (sku/pack/size); supplier offers are distinct (`supplier_sku`, cost, stock, dispatch, min order, fee). Supplier priority decision based on all-in cost, proven on-time service and availability, not lowest unit cost alone.

## Multi-supplier basket routing
- Group by supplier and fulfilment route.
- Present one accurate shipping fee/ETA or split-shipment messaging **before payment**.
- If the basket spans 2 suppliers, cost each outbound parcel; avoid offering free shipping based only on cart value.
- Delay shipping offer until postcode/weights available. Exclude restricted/oversize items.
- Never book two suppliers for a single line unless deliberately split and customer informed.

## Pricing and profitability formula (VAT-registered scenario only)
`customer_gross = item_price_inc_vat + delivery_fee_inc_vat`
`net_revenue = customer_gross / (1 + VAT_rate)` (assuming all lines same VAT rate)
`order_contribution = net_revenue - landed_product_cost_ex_vat - supplier_pick_pack_ship_ex_vat - payment_fee - return_allowance - support_variable_cost - CAC`
When seller is **not VAT registered**, do not use the above VAT-recovery assumption. Ask UK accountant to model merchant tax status.
Set automatic pricing rules with price floor + competitor guardrail; no auto repricing below contribution margin threshold. Include chargebacks, damaged/missing items, carrier surcharge and cross-border postcode exceptions in reserve budget.

## Commercial contract checklist
Legal seller, stock ownership, product compliance, product photo usage, EAN/GTIN permission, RRP/MAP conditions, supplier service levels, blind dispatch, tracking API, customer data privacy agreement, invoices and VAT, returns and restocking, claims, neutral packaging, lost parcels, product recall procedures, after-sales warranties, charge/payment timing, off-cycle price changes, temporary out-of-stock and termination.

## Supplier KPIs (first 60 days)
Feed accuracy, acceptance rate, ordered-vs-invoiced cost variance, dispatch-on-time %, tracking completeness %, supplier cancellations %, lost/damaged %, return authorization time, gross contribution/order and refund time. Suggested initial **pilot gates** (management targets, not industry norms): acceptance >=98%, dispatch within promised window >=95%, listing stock mismatch <2%, zero undisclosed split shipping, zero unhandled stuck payments.
