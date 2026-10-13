## 2026-10-13T14:08:53Z

You are Worker M5 (`teamwork_preview_worker`).
Your working directory is: `e:\ToolCart\.agents\teamwork\worker_m5_1`
Project root: `e:\ToolCart`
Parent conversation ID: `311a2f36-0bc9-4d2c-ad1b-812679b4333e`

Authoritative User Request: Read `e:\ToolCart\.agents\teamwork\ORIGINAL_REQUEST.md`.
Master Project Scope: Read `e:\ToolCart\PROJECT.md`.
Challenger M5 Hardening Blueprint: Read `e:\ToolCart\.agents\teamwork\challenger_m5_1\handoff.md`.

Mission:
Implement all 5 remediations identified in Challenger M5's report to harden the platform:
1. Fix Stripe Webhook Signature Gating (`app/api/webhooks/stripe/route.ts`):
   Gate mock signature handling strictly with `const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.STAGING_ONLY === 'true'; if (isDevOrTest && (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock')))` so that in production mode, mock signature bypass is prohibited and `stripe.webhooks.constructEvent` is strictly enforced.
2. Fix Local Storage Fallback Path Traversal (`src/lib/adapters/storage.ts`):
   In `uploadFile` and `deleteFile`, sanitize `key` against directory traversal:
   ```typescript
   const cleanKey = path.normalize(key).replace(/^(\.\.[\/\\])+/, '').replace(/^[\/\\]+/, '');
   const targetPath = path.resolve(uploadDir, cleanKey);
   if (!targetPath.startsWith(uploadDir)) {
     throw new Error('Invalid path traversal asset key');
   }
   ```
   Apply to both `uploadFile` and `deleteFile`.
3. Harden Supabase RLS Order Creation Policy (`supabase/migrations/20261013000002_rls_policies.sql`):
   In the "Public create checkout orders" policy, restrict anonymous INSERT to `WITH CHECK (state = 'cart_pending')` rather than unconstrained `WITH CHECK (true)`, preventing anonymous insertion of arbitrary order states.
4. Deduplicate Sitemap Project Kit URLs (`app/sitemap.ts`):
   Map project kits to `${baseUrl}/projects?kit=${kit.slug}` instead of duplicate `${baseUrl}/projects`, ensuring each sitemap entry has a unique, distinct URL.
5. Mount Schema.org Structured Data on PDP (`app/(storefront)/products/[slug]/page.tsx`):
   Import `ProductJsonLd` from `@/components/seo/json-ld` and mount `<ProductJsonLd product={product} />` inside the product detail page JSX tree.
6. Verify and Execute:
   Run the full test and build verification suite and ensure 100% pass:
   - `python qa/check_static.py`
   - `python -m pytest tests/brand/`
   - `npm run typecheck`
   - `npm run lint`
   - `npm test`
   - `npm run build`

Write ownership:
- `app/api/webhooks/stripe/route.ts`
- `src/lib/adapters/storage.ts`
- `supabase/migrations/20261013000002_rls_policies.sql`
- `app/sitemap.ts`
- `app/(storefront)/products/[slug]/page.tsx`
- `tests/*`
