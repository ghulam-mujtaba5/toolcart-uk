# START HERE — ToolCart Antigravity v3
**Working name: ToolCart; no UK trademark/domain clearance.** Complete supplier-first UK hardware store handoff with original purple-free Worksite Cobalt + Action Lime identity.

## QUICK START IN GOOGLE ANTIGRAVITY
1. Unzip this folder into your new project workspace. Open the folder in Antigravity.
2. Antigravity automatically reads root `AGENTS.md` and `.agents/rules/*.md` (its official rules system).
3. Paste the text from `AGENT_KICKOFF_PROMPT.txt` into your agent chat.
4. Begin **Phase 0 + Phase 1 STAGING ONLY**; never auto-enable production payments.
5. Review `docs/`, `architecture/`, `reference/`, `design/`, `prototype/`, `schemas/`, `data/` and `handoff/`.

## BUILD GOAL
A UK ecommerce storefront for tools, DIY and hardware with **supplier-backed inventory as the default**. Custom Next.js on a commercial-capable host + Medusa commerce/Admin on a persistent host + managed PostgreSQL + Redis. Product browsing, technical specs, search/filter, basket, test checkout, admin order management, supplier adapter, SEO and eventually an AI shopping assistant.

## RULES
The product quote does NOT establish supplier stock, consumer prices or dropshipping agreement. Seed the 115 quoted SKUs as DRAFT. Never expose wholesale costs to customers. No real prices in public prototype. Stock checks and delivered cost must be established before any real checkout.

## PALETTE CHANGE
The OLD deep-teal background and OLD violet AI highlight are retired. `design/tokens.css` now uses Ink, Cobalt and restrained Action Lime, with Workshop White/Cloud Blue surfaces. Use the approved lime only for limited brand accent, with dark Ink text; AI uses Cobalt and Cloud Blue.

## FIRST ACCEPTANCE PR
- Responsive accessible shell and design tokens
- Search bar, navigation, draft category listing + product pages with honest missing-data treatment
- Non-functional/disabled checkout on mock screens
- Product import via draft-only CSV mapping to verified SKU/GTIN, no public supplier cost
- Basic CI, tests, visual screenshots and clear readiness checklist
- Architecture decision document and list of required partner inputs

DO NOT claim a fully working production ecommerce site was delivered. See `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`.


BRAND V3 OVERRIDE: `docs/02_BRAND_IDENTITY.md`, `design/tokens.css`, `design/tokens.json`, and `ToolCart_Final_Colour_Brand_Guide_V3.docx` supersede any older references. Preserve chosen HEX values. No Copper, purple or teal. Run `qa/contrast_matrix.csv` accessibility checks and test real storefront viewports.
