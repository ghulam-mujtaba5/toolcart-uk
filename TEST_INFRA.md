# E2E Test Infra: ToolCart UK Platform

## Test Philosophy
- Opaque-box, requirement-driven. No dependency on implementation design.
- Methodology: Category-Partition + Boundary Value Analysis (BVA) + Pairwise Combinatorial Testing + Real-World Workload Testing.
- Strict enforcement of Brand V3 color invariants, wholesale cost security isolation, 115 SKU catalog ingestion integrity, and Supplier Order State Machine correctness.

## Feature Inventory & Test Coverage Mapping
| # | Feature | Source (Requirement) | Tier 1 (Coverage) | Tier 2 (Boundaries) | Tier 3 (Pairwise) | Tier 4 (Workloads) |
|---|---------|---------------------|:-----------------:|:-------------------:|:-----------------:|:------------------:|
| 1 | Brand V3 Color Invariants | `docs/02_BRAND_IDENTITY.md` | ≥5 checks | ≥5 boundary/invalid | Pairwise with UI | App styling |
| 2 | Typography & Tabular Numerals | `design/tokens.css` | ≥5 checks | ≥5 edge fonts | Pairwise with tables | Spec sheets |
| 3 | Accessible UI Primitives | Radix / `tokens.css` | ≥5 checks | ≥5 focus/disabled | Pairwise with forms | Checkout & drawer |
| 4 | Global VAT Toggle (Inc/Ex) | `docs/03_UX_INFORMATION_ARCHITECTURE.md` | ≥5 checks | ≥5 cookie/state edges | Pairwise with PDP/Cart | B2B & DIY modes |
| 5 | Homepage & Category Navigation | `prototype/index.html` | ≥5 checks | ≥5 viewport edges | Pairwise with search | User discovery |
| 6 | Search & Faceted Filtering | `docs/03_UX_INFORMATION_ARCHITECTURE.md` | ≥5 checks | ≥5 zero/empty/symbol | Pairwise with categories | Product finder |
| 7 | Product Detail & Spec Table | `schemas/product_contract.schema.json` | ≥5 checks | ≥5 missing optional specs | Pairwise with compare | Technical evaluation |
| 8 | Compare Product Drawer | `ORIGINAL_REQUEST.md` R1 | ≥5 checks | ≥5 limit (0 to >4 items) | Pairwise with PDP | Side-by-side spec check |
| 9 | Curated Project Baskets | `docs/08_CONTENT_AND_COPY_DECK.md` | ≥5 checks | ≥5 stock status edges | Pairwise with cart | 1-click bundle order |
| 10 | Hardware Buying Guides | `docs/08_CONTENT_AND_COPY_DECK.md` | ≥5 checks | ≥5 slug 404/edge | Pairwise with products | Editorial education |
| 11 | AI Product & Project Assistant | `docs/05_SEO_AI_DISCOVERY.md` | ≥5 checks | ≥5 safety prompt attacks | Pairwise with catalog | Intelligent tool finder |
| 12 | Cart & Multi-Supplier Shipping | `docs/04_COMMERCE_SUPPLIER_SPEC.md` | ≥5 checks | ≥5 empty/multi-origin edges | Pairwise with checkout | Split fulfillment basket |
| 13 | Trade Account Application | `docs/04_COMMERCE_SUPPLIER_SPEC.md` | ≥5 checks | ≥5 invalid VAT/company | Pairwise with admin | B2B onboarding |
| 14 | 115 SKU Catalog Ingestion | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` | ≥5 checks | ≥5 malformed CSV edges | Pairwise with DB | Full baseline catalog |
| 15 | Case Math & Ligatures | `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv` | ≥5 checks | ≥5 tolerance/character edges | Pairwise with search | Unicode & math integrity |
| 16 | Wholesale Security Isolation | `AGENTS.md`, `ORIGINAL_REQUEST.md` R2 | ≥5 checks | ≥5 API/RSC leak probes | Pairwise with routes | Confidential cost guard |
| 17 | Supplier Order State Machine | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` | ≥5 checks | ≥5 invalid/exceptional transitions | Pairwise with payment | Full order lifecycle |
| 18 | Idempotency & Audit Logging | `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` | ≥5 checks | ≥5 duplicate payload bursts | Pairwise with webhooks | Tamper-proof trail |
| 19 | Admin Portal Management | `ORIGINAL_REQUEST.md` R2 | ≥5 checks | ≥5 unauthorized/boundary inputs | Pairwise with DB | Backoffice operations |
| 20 | Cloud Adapters & Local Fallbacks | `ORIGINAL_REQUEST.md` R3 | ≥5 checks | ≥5 missing credentials edges | Pairwise with services | Zero-config resilience |

## Test Architecture
- Test Framework: Vitest / Node test runner + Python pytest static suite (`qa/check_static.py`).
- Test Case Directory: `tests/e2e/`, `tests/brand/`, `tests/security/`, `tests/catalog/`, `tests/state-machine/`.
- Execution Command: `npm test` and `python qa/check_static.py`.

## Real-World Application Scenarios (Tier 4)
| # | Scenario | Features Exercised | Complexity |
|---|----------|--------------------|------------|
| 1 | Trade Electrician Purchasing Consumables | VAT toggle (Ex VAT), Lexical Search, Tape Kit, Trade Account, Checkout | High |
| 2 | DIY Homeowner Shelf-Hanging Project | Buying Guide (Wall Plugs), Compare Drawer, AI Assistant, Single Pack Order | High |
| 3 | Full Supplier Catalog Ingestion & Margin Review | 115 CSV rows import, Case math validation, Wholesale isolation, Admin pricing | High |
| 4 | Supplier Rejection & Automated Refund Flow | Order placement, PO generation, Supplier Reject webhook, Stripe refund, Audit log | High |
| 5 | Multi-Supplier Cart with Split Fulfillment | Cart with 2 suppliers, Split delivery calculation, Multiple POs, State tracking | High |
| 6 | Brand V3 Integrity & Static Compliance Sweep | Zero copper/purple/teal scan, Contrast matrix WCAG AA, Tabular numbers, Outline check | High |

## Coverage Thresholds
- Tier 1: ≥5 per feature across 20 features (≥100 test cases)
- Tier 2: ≥5 boundary/negative per feature across 20 features (≥100 test cases)
- Tier 3: Pairwise coverage of major feature interactions (≥20 test cases)
- Tier 4: ≥6 realistic end-to-end application scenarios
- **Total Minimum Threshold: ≥226 automated test assertions / test cases**.
