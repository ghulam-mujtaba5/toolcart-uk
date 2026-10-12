# ToolCart / Antigravity repository instructions

This is a **handoff + prototype**, not a production-ready store. Read `START_HERE_AGENT.md`, `docs/02_BRAND_IDENTITY.md` and `qa/contrast_matrix.csv` before changing code. Follow `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md` and `.agents/rules/`.

## Non-negotiable
- Brand ToolCart remains **provisional**. Do not purchase domains, register marks, send emails or turn on live checkout without founder approval.
- **Brand V3:** Use `design/tokens.css` exclusively. No copper (#B84C32), purple/violet/lavender or teal branding. Ink/Cobalt/Action Lime are the identity; AI uses Cobalt + Cloud Blue. No white text on lime; on pale surfaces use accessible Steel Text #596B70.
- Never claim the supplier's quote represents available stock, live prices or approved dropshipping.
- Keep wholesale prices and trade terms strictly server-side. Do not export supplier cost data in public Next.js JS bundles.
- Do not copy competitor source code, logos, imagery, reviews or written product descriptions. Borrow UX patterns and create original assets.
- Never fabricate product images, ratings, stock, shipping dates or endorsements. Unknown stock => unavailable / request confirmation.
- Use Medusa v2, PostgreSQL (Supabase or Neon), Redis, Stripe test mode, Next.js/TypeScript. Medusa is not a serverless-only Vercel app.
- No production secret in code/agent logs or commits. No real orders until manual operational gates pass.
- Follow phased PRs. Run lint, typecheck, tests and viewport/accessibility checks after each feature. Report failures rather than silently skipping.

## Required order
1. Read docs, contracts, evidence and supplier sample CSV.
2. Create Next.js storefront/design system and static mock data. No true checkout.
3. Build Medusa locally/staging, import draft records only.
4. Implement supplier adapter/stock freshness and payment test flows.
5. SEO/structured data/AI assistance, carefully gated.
6. Obtain explicit release approval. Keep `STAGING_ONLY=true` default.
