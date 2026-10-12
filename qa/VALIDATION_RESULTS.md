# ToolCart Brand V3 — validation record

- Source of colour truth: `design/tokens.json` and `design/tokens.css`.
- 19 mathematically calculated WCAG contrast combinations in `qa/contrast_matrix.csv` and `qa/contrast_matrix.json`. All intended usage combinations meet the documented AA threshold. The four explicitly unsafe combinations are marked DO NOT USE.
- Static HTML prototype: checked for retired hex variables, CSS reference existence, basic DOM structure and JavaScript syntax (Node.js `--check`). Passed.
- DOCX: rendered to 6 pages and reviewed as PNG images; a low-contrast swatch caption was corrected and re-rendered.
- Automated headless browser: **not verified**, because Chromium navigation to file:// and localhost returned ERR_BLOCKED_BY_ADMINISTRATOR. Re-run actual viewport/interaction screenshots in Antigravity; do not claim browser QA passed.
- Palette preferences are user-provided. Pinterest 2026 trend data is contextual external evidence. No representative UK consumer colour-preference research or conversion A/B test has been performed.
- ToolCart remains a proposed trading name, not a verified UK trademark/registrable domain.
