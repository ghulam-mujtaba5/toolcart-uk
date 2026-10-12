# ToolCart / Tailwind v4 palette mapping (v3)
`design/tokens.css` is authoritative; import it once in your app global CSS.

```css
@import "tailwindcss";
@import "./tokens.css";
@theme inline {
  --color-brand: var(--tc-primary);
  --color-brand-hover: var(--tc-primary-hover);
  --color-accent: var(--tc-action-lime);
  --color-ink: var(--tc-ink);
  --color-canvas: var(--tc-canvas);
  --color-ai-surface: var(--tc-surface-soft);
  --color-body-muted: var(--tc-text-secondary);
  --color-functional-outline: var(--tc-border-strong);
}
```
Use `text-white bg-brand` for main CTA. Use `text-ink bg-accent border-2 border-ink` for accent controls. **Never white text on lime.**
Manrope headings and IBM Plex Sans body; host fonts according to licensing and operational requirements, don't include font binaries in source ZIP.
