# UK Hardware Store — Developer & Founder Handoff
**Prepared:** 12 October 2026 | **Business:** supplier-backed UK DIY/hardware/trade supplies | **Brand:** NOT YET CLEARED

## Decision record (do not silently change)
- Source of product costs: Status International (UK) Ltd quote 09 Oct 2026, 115 lines, £1,567.95 ex VAT. Not a signed fulfilment/stock agreement. PDF included separately in conversation.
- Primary fulfilment: *supplier-confirmed* stock, preferably direct dispatch under our brand. A separate merchant/partner dispatch route if direct dispatch unavailable. We are seller of record; wholesaler is fulfilment partner.
- Frontend: Next.js (TypeScript, App Router), production host Vercel **Pro** or another commercial host, UK-focused GBP storefront.
- Commerce: Medusa v2, self-hosted persistent Node.js server and worker; Medusa Admin for order, product, returns management.
- Database: PostgreSQL (Supabase Pro for production is simplest of Supabase/Appwrite/Turso; Neon is alternative). Redis mandatory for recommended production architecture. **Do not substitute Turso SQLite for Medusa PostgreSQL.**
- Payments: Medusa Stripe provider; use payment-authorisation then confirmation/capture workflow with documented failure handling. Don't store raw cards.
- Catalog source of truth: merchant-owned canonical SKU/GTIN catalog + Medusa commerce records; supplier offers & inventory separately, never overwrite merchant-authored SEO data with each feed.
- Images: manufacturer/wholesaler images used only after rights granted; no scraping/appropriating competitors' product photos.
- Brand: placeholder `BRAND`; trademark, company name and .co.uk/.uk must be cleared before production.
- Never advertise "in stock", "dispatch today", "next day" on the basis of an unverified supplier spreadsheet.

## Decision gates before accepting public payments
1. Signed trading/partner arrangement: seller of record, product cost validity, direct dispatch, blind packaging, SLA, tracking, cancellation, returns address, warranty, stock feed, credit, agreed data transfer.
2. UK legal merchant setup + bank + Stripe verification, VAT advice for actual seller location, age restricted / PPE / electrical product compliance.
3. Real sample orders to UK addresses; test supplier failures, full/partial refund, return, shipping charge, tax and abandoned checkout.
4. Live carrier quote by weight/dimensions/postcode and packaging route; per-SKU contribution >= internal target after customer acquisition.
5. Backend, backups, secrets, disaster recovery and monitoring configured; no free commercial use of Vercel Hobby.

## Package contents
- `01_BUSINESS_AND_SUPPLIER_MODEL.md`: commercial operating agreement checklist, inventory-to-order processes, exception handling.
- `02_PRODUCT_AND_UX_SPEC.md`: navigation, page templates, design inspiration and acceptance requirements.
- `03_TECHNICAL_ARCHITECTURE.md`: Medusa + Next.js + Postgres + Redis services, API contracts, data model, event flow, AI safeguards.
- `04_SEO_GEO_AND_GROWTH.md`: search/AI discovery, content, analytics, experimentation, marketplace later.
- `05_ROADMAP_AND_QA.md`: sprint-by-sprint backlog, launch gates and functional tests.
- `06_SUPPLIER_QUESTIONNAIRE.md`: send to supplier and record answers before go-live.
- `07_COMPETITOR_UX_MATRIX.csv`: researched site patterns and evidence URLs.
- `08_ENGINEERING_BACKLOG.csv`: assignable user stories with dependencies and acceptance checks.
- `09_ENV_EXAMPLE.txt`: environment variable keys, no actual secrets.
- `10_SAMPLE_SUPPLIER_CATALOG.csv`: supplier quote source data, *not* confirmed stock.
- Separate workbook `UK_Hardware_Supplier_First_Financial_Model.xlsx`: editable example economics & cost scenarios.

## Realistic build order
**Supplier account & data first → catalogue → browse/search → cart → reliable payment/order → supplier-confirm → dispatch/refunds → SEO/feed → AI-assisted discovery → paid acquisition → marketplaces.**
Do not build a general third-party marketplace in MVP; selling products from multiple wholesalers is still a single-merchant ecommerce operation.

## Sources (official or live merchant pages)
- Medusa deployment: https://docs.medusajs.com/learn/deployment/general
- Medusa overview: https://docs.medusajs.com/learn/deployment
- Supabase: https://supabase.com/pricing
- Turso: https://turso.tech/pricing
- Appwrite: https://appwrite.io/pricing
- Neon: https://neon.com/blog/neon-free-plan-1-gb-per-project
- Vercel commercial rule: https://vercel.com/docs/limits/fair-use-guidelines
- Google AI search guidance: https://developers.google.com/search/docs/appearance/ai-features
- UK VAT thresholds: https://www.gov.uk/how-vat-works/vat-thresholds
- Stripe UK pricing: https://stripe.com/gb/pricing

## Work authorization
This is a design specification, not an automatic authorization to open accounts, purchase domains, purchase stock, collect real payments, or contact suppliers. These actions require the designated owner's approval and credentials.
