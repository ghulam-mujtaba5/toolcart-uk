## 2026-10-13T07:30:33Z

You are Spec Miner M3 Instance 2 for the Catalog Contract & Wholesale Isolation Engine of ToolCart UK.
Your working directory is: `e:\ToolCart\.agents\teamwork\specminer_m3_2`
Project root: `e:\ToolCart`

Read the authoritative files first:
1. `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY: read this first!)
2. `e:\ToolCart\PROJECT.md`
3. `schemas/product_contract.schema.json`
4. `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`

Your tasks:
1. Thoroughly analyze `schemas/product_contract.schema.json` and the baseline catalog:
   - Verify all 115 CSV rows against the schema constraints (case vs unit math: `case_cost == unit_cost * units_per_case`, barcode regex, dimensions, weight, compliance flags).
   - Design the admin catalog mutation repository (`src/lib/catalog/admin-catalog.ts`):
     - Support full CRUD: create, read, update, delete/archive.
     - Support sellability status transitions: `draft` -> `needs_review` -> `approved` -> `blocked`.
     - Ingestion pipeline: validate CSV/JSON feed, normalize Unicode, check price math, update catalog.
   - Wholesale Security Isolation:
     - Design strict server-only storage for wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`).
     - Margin control formulas and markup tier calculations.
     - Ensure admin API routes (`/api/admin/...`) require authentication/role checks, and never leak wholesale costs into public storefront endpoints (`/api/store/...`).
2. Produce a detailed specification report with exact data contracts, validation functions, and security boundaries.
3. Write your report to `e:\ToolCart\.agents\teamwork\specminer_m3_2\handoff.md` and send your completion message back to parent.
