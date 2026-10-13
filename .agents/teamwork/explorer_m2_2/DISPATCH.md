## 2026-10-12T18:04:19Z
You are Explorer M2 (Instance 2).
Your working directory is: `e:\ToolCart\.agents\teamwork\explorer_m2_2`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.

Mission:
Investigate and design the exact implementation strategy for:
1. Product Detail Page (`/products/[slug]`):
   - Technical specification table with `tabular-nums` formatting.
   - GTIN-13 Barcode, MPN, merchant SKU.
   - Pack and carton breakdown (distinguishing retail unit pack from case quantity).
   - Dual pricing display (large Inc. VAT with subtext Ex. VAT or reversed based on VAT toggle).
   - Honest stock & supplier freshness indicator ("Confirmed in stock" vs "Subject to confirmation").
   - UKCA / CE compliance badges.
   - Quantity selector and Add to Basket action.
   - "Compare Product" trigger button adding item to compare drawer.
2. Compare Product Drawer:
   - Sticky dockable bottom drawer holding up to 4 items.
   - Side-by-side technical specification comparison table.
   - Remove item action, clear all, and add to basket from drawer.
3. Project Baskets (`/projects`) & Buying Guides (`/guides`, `/guides/[slug]`):
   - 3 curated project kits from `docs/08_CONTENT_AND_COPY_DECK.md`:
     1. Domestic Electrical Tape & Consumables Kit
     2. Painting & Masking Prep Kit
     3. Essential Site Torch & Extension Lead Kit
     With 1-click add-all-to-basket action.
   - 5 authoritative UK hardware buying guides with technical advice, safety disclaimers, and direct links to catalog SKUs.
4. AI Product & Project Assistant (`tc-ai-panel` / modal):
   - Styled strictly in Cloud Blue (`#EAF0FF`) and Cobalt (`#2450B8`), Ink text (`#182336`).
   - Grounded strictly in catalog tools (`searchCatalog`, `getProductTechnicalSpecs`, `getAvailability`).
   - Refuses to hallucinate structural load-bearing, electrical tester limits, or PPE ratings.
   - Proposes project baskets with user-confirmed "Add to Basket" buttons.

Scope boundaries:
- DO NOT implement or write source code files. You are strictly a read-only exploration agent.
- Output your strategy to `e:\ToolCart\.agents\teamwork\explorer_m2_2\handoff.md`.
- Keep `progress.md` updated.
- Message parent (`311a2f36-0bc9-4d2c-ad1b-812679b4333e`) when done.
