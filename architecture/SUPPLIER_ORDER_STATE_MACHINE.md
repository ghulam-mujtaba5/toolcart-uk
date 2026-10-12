# Supplier-backed order state machine

`cart_pending` -> `checkout_authorized` -> `supplier_order_pending` -> `supplier_accepted` -> `payment_captured` -> `dispatched` -> `delivered`.

Exceptional paths: `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`.

- Quote != available; all purchasability from approved fresh supplier feed with a TTL set per source.
- Fetch latest stock BEFORE customer checkout completion. Use explicit supplier allocation with idempotency key (order ID + supplier ID).
- Payment capture timing must match payment provider authorisation window and supplier response; design timeout recovery.
- If supplier rejects, do not pretend order is accepted; cancel or offer informed alternative, and release/cancel/refund payment as applicable.
- If multi-supplier basket: clearly display shipment groups, carrier charges, lead times; preferably prioritise single-supplier bundles.
- Supplier direct-to-customer fulfilment requires agreement covering neutral branding, customer data, courier/returns, UK GDPR roles, parcel packing and quality.
- Record all transitions in append-only audit log. Signed webhooks and idempotent retries.
- Customer and staff notifications should distinguish confirmed stock, accepted order and actual dispatched parcel.
