# BRIEFING — 2026-10-13T07:49:30Z

## Mission
Discover and document complete specifications for Catalog Contract & Wholesale Isolation Engine (M3 Instance 2), including baseline catalog verification, admin catalog mutation repository, sellability transitions, ingestion pipeline, and wholesale security isolation.

## 🔒 My Identity
- Archetype: Specification Miner
- Roles: Specification Miner, Domain Investigator, Security & Contract Analyst
- Working directory: e:\ToolCart\.agents\teamwork\specminer_m3_2
- Original parent: 224db423-62eb-4a71-824d-116651759989
- Milestone: M3 (Catalog Contract & Wholesale Isolation Engine)

## 🔒 Key Constraints
- Specification Miner only: probe authoritative sources and document; do NOT implement project code.
- Wholesale costs (unit_cost_ex_vat_gbp, case_cost_ex_vat_gbp) must strictly remain server-side and never leak into client bundles or public /api/store/... endpoints.
- Respect brand tokens: Industrial Cobalt #2450B8, Action Lime #DDF16A, Ink #182336, Workshop White #F7F8F5, Cloud Blue #EAF0FF, Graphite #252D30, Steel Text #596B70. No Copper, no purple, no white text on lime.
- Never claim supplier quotes represent live stock or approved dropshipping. Unknown stock => unavailable.
- Follow phased PR rules, Medusa v2 / Next.js / TypeScript architecture, and STAGING_ONLY gating.

## Current Parent
- Conversation ID: 224db423-62eb-4a71-824d-116651759989
- Updated: 2026-10-13T07:31:00Z

## Task Summary
- **What to build**: Specification report covering catalog JSON schema compliance, 115 CSV rows audit, admin catalog repository design (CRUD, state machine), ingestion pipeline, and wholesale isolation boundaries.
- **Success criteria**: 100% verification of baseline catalog against schema; clear contract for admin-catalog.ts; clear sellability transition matrix; formal margin & markup calculation formulas; exhaustive wholesale leakage prevention model.
- **Interface contracts**: `schemas/product_contract.schema.json`, `PROJECT.md`
- **Code layout**: `e:\ToolCart\PROJECT.md`

## Key Decisions Made
- Audited 100% of 115 CSV rows in `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`: confirmed 0 case-math errors, 115 valid EAN-13 barcodes, exactly 1 single-unit item with null carton barcode (`ION3SFLADDER1P1`), 21 Unicode ligatures/symbols identified (`ﬁ`, `ﬂ`, `Ø`).
- Identified that all 115 rows have unverified stock, dropship, photo, and compliance flags in the quote; thus all items MUST ingest as `draft`.
- Formulated the exact sellability transition guard matrix: `draft` -> `needs_review` -> `approved` -> `blocked`, requiring compliance, photo rights, and margin floor checks before `approved`.
- Designed full `admin-catalog.ts` interface, mutation repository, and ingestion pipeline with dry-run support.
- Defined wholesale security isolation with PostgreSQL RLS policy, server-only DTO separation, and margin tier formulas.

## Artifact Index
- `e:\ToolCart\.agents\teamwork\specminer_m3_2\DISPATCH.md` — Incoming dispatch log
- `e:\ToolCart\.agents\teamwork\specminer_m3_2\BRIEFING.md` — Agent state and situational memory
- `e:\ToolCart\.agents\teamwork\specminer_m3_2\progress.md` — Liveness heartbeat and progress tracking
- `e:\ToolCart\.agents\teamwork\specminer_m3_2\handoff.md` — Final 5-component handoff report

## Loaded Skills
- None
