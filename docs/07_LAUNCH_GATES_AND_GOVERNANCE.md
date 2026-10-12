# Go-live checklist, legal gates and responsibility model
Items here require decisions from founder(s), supplier or regulated advisers. The source quotation alone cannot establish these facts.

## Brand/IP
[ ] Official `.uk` + `.co.uk` availability checked at registrar; matching domain risk recorded.
[ ] UKIPO trademark search by legal adviser: identical/similar marks, Class 35 retail + appropriate tool/hardware classes; potential overseas ToolCart usages assessed.
[ ] Companies House name searched, signed ownership of domain, repo, brand, customer data agreed between founders.
[ ] Social handles secured only after name acceptable; authentic profile content.

## Merchant/payments
[ ] Seller of record verified, UK company/sole-trader structure reviewed, UK business bank/account and Stripe KYC approved; no fabricated UK residency/business records.
[ ] UK VAT establishment/registration and price display confirmed with accountant.
[ ] Terms, legal contact/address, complaints, delivery, statutory cancellations/returns, privacy, cookies and consumer compliance reviewed by UK professional.
[ ] UK GDPR/PECR consent management and cookie handling where required; PCI exposure minimised by Stripe.

## Supplier + goods
[ ] Signed direct-to-customer dispatch agreement + case/breakpack policy + shipping price card.
[ ] Supplier stock feed/API reliability and recheck strategy demonstrated, sample orders delivered.
[ ] Product images and brand content explicitly licensed; no copied competitor images.
[ ] Product compliance for UK sale verified as relevant; age-restricted blades, PPE FFP2, electrical testers, ladders and abrasive/cutting products separately gated.
[ ] Returns address, warranty, damaged parcel, incorrect item, recalls agreed; carrier restrictions for liquids/tools verified.

## Operations
[ ] Responsible individual assigned for daily payment-order-supplier reconciliation, stock errors, legal contact, cancellations, returns, chargebacks.
[ ] Email provider verified (DKIM SPF DMARC) and customer notification templates approved.
[ ] Backups restoration tested; Sentry, alerts, on-call, incident response configured.
[ ] Explicit delivery ETAs; correct carriage per postcode, parcel splits and remote regions.
[ ] Ten sandbox E2E cases, five real supplier samples; pass/record actual supplier SLA.
[ ] No price/stock mismatch across PDP, checkout, Merchant feed and supplier PO; no fabricated star ratings.

## KPI review cadence
Daily first month: new orders, payment capture pending, supplier confirmation SLA, rejection, refund, customer questions, stock-feed age. Weekly: contribution per order, abandoned checkout, search zero-result rate, checkout conversion, damaged/late deliveries, support time. Stop spend on unprofitable SKU/channel combinations. Only scale SKUs with reliable positive post-acquisition contribution and low incident rates.

## Official references
Companies House: https://www.gov.uk/limited-company-formation/choose-company-name
UK trademarks: https://www.gov.uk/search-for-trademark
Distance selling: https://www.gov.uk/online-and-distance-selling-for-businesses
ICO cookies: https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
General product safety: https://www.gov.uk/guidance/product-safety-advice-for-businesses
Medusa deployment: https://docs.medusajs.com/learn/deployment/general
