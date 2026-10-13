import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { NextRequest } from 'next/server';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Domain imports
import { POST as stripeWebhookPost } from '@/app/api/webhooks/stripe/route';
import { GET as getProductsApi } from '@/app/api/store/products/route';
import { getPublicUrl, isR2Configured, uploadFile, deleteFile } from '@/lib/adapters/storage';
import {
  renderOrderConfirmationEmail,
  renderSupplierPurchaseOrderEmail,
  renderTrackingUpdateEmail,
  renderTradeApplicationDecisionEmail,
} from '@/lib/adapters/email';
import {
  getAllPublicProducts,
  getProductBySlug,
  searchProducts,
  getPublicProductsByCategory,
} from '@/lib/catalog';
import sitemap from '@/app/sitemap';
import { ProductJsonLd } from '@/components/seo/json-ld';
import { PublicProductDTO } from '@/types/product';
import { getDb } from '@/lib/db';

describe('Tier 5 Adversarial Coverage Hardening Suite', () => {
  const PROJECT_ROOT = path.resolve(__dirname, '../..');

  beforeEach(async () => {
    await getDb().reset();
  });

  // =========================================================================
  // Challenge 1: Stripe Webhook Mock Signature Bypass & Environment Isolation
  // =========================================================================
  describe('Challenge 1: Stripe Webhook Mock Signature Bypass & Environment Isolation', () => {
    const routeFilePath = path.join(PROJECT_ROOT, 'app/api/webhooks/stripe/route.ts');

    it('white-box audit confirms route source enforces NODE_ENV and STAGING_ONLY gating for mock_signature', () => {
      const source = fs.readFileSync(routeFilePath, 'utf-8');
      
      // Look for check of NODE_ENV and STAGING_ONLY in route.ts
      const hasNodeEnvCheck = source.includes('NODE_ENV');
      const hasStagingOnlyCheck = source.includes('STAGING_ONLY');

      // Hardening verification: Both NODE_ENV and STAGING_ONLY are strictly checked in the route
      expect(hasNodeEnvCheck).toBe(true);
      expect(hasStagingOnlyCheck).toBe(true);

      // Verify the gated condition exists:
      expect(source).toContain("const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.STAGING_ONLY === 'true';");
      expect(source).toContain("if (isDevOrTest && (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock')))");
    });

    it('empirically verifies mock_signature bypass is strictly rejected in production when staging is false', async () => {
      const originalNodeEnv = process.env.NODE_ENV;
      const originalStagingOnly = process.env.STAGING_ONLY;
      try {
        // Simulate production environment with STAGING_ONLY=false
        (process.env as any).NODE_ENV = 'production';
        (process.env as any).STAGING_ONLY = 'false';

        const payload = {
          id: 'evt_adversarial_prod_bypass_001',
          object: 'event',
          api_version: '2024-11-20.acacia',
          created: Math.floor(Date.now() / 1000),
          type: 'payment_intent.succeeded',
          data: {
            object: {
              id: 'pi_adversarial_fake',
              amount_received: 9999,
              currency: 'gbp',
              metadata: { order_id: 'non_existent_adversarial_order' },
            },
          },
        };

        const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'stripe-signature': 'mock_signature', // Forged bypass signature
          },
          body: JSON.stringify(payload),
        });

        const res = await stripeWebhookPost(req);

        // In production mode without staging, mock_signature is rejected with 400
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.error).toBeDefined();
      } finally {
        (process.env as any).NODE_ENV = originalNodeEnv;
        (process.env as any).STAGING_ONLY = originalStagingOnly;
      }
    });

    it('verifies non-mock invalid signatures without a webhook secret are parsed in dev fallback', async () => {
      // In local dev without real webhook secret (or with whsec_mock prefix), route parses body gracefully
      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'mock_signature',
        },
        body: JSON.stringify({
          id: 'evt_sim_noop',
          type: 'charge.updated',
        }),
      });

      const res = await stripeWebhookPost(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);
    });

    it('validates robust rejection of corrupt non-JSON bodies', async () => {
      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'stripe-signature': 'mock_signature',
        },
        body: '<<<NOT_JSON_PAYLOAD>>>',
      });

      const res = await stripeWebhookPost(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid JSON payload');
    });
  });

  // =========================================================================
  // Challenge 2: Local Storage Fallback Path Traversal & Key Sanitization
  // =========================================================================
  describe('Challenge 2: Local Storage Fallback Path Traversal & Key Sanitization', () => {
    const storageFilePath = path.join(PROJECT_ROOT, 'src/lib/adapters/storage.ts');

    it('white-box audit confirms path.normalize and bounds verification prevent traversal', () => {
      const source = fs.readFileSync(storageFilePath, 'utf-8');

      // Verify presence of path normalization and directory traversal neutralization
      expect(source).toContain('path.normalize');
      expect(source).toContain('targetPath.startsWith(uploadDir)');
      expect(source).toContain('Invalid path traversal asset key');
    });

    it('proves that path traversal attacks throw Invalid path traversal asset key error', async () => {
      const buffer = Buffer.from('adversarial');
      await expect(uploadFile(buffer, '..', 'text/plain')).rejects.toThrow('Invalid path traversal asset key');
      await expect(deleteFile('..')).rejects.toThrow('Invalid path traversal asset key');
    });

    it('audits deleteFile implementation has targetPath.startsWith bounds verification', () => {
      const source = fs.readFileSync(storageFilePath, 'utf-8');
      const deleteSection = source.slice(source.indexOf('export async function deleteFile'));
      expect(deleteSection).toContain('targetPath.startsWith(uploadDir)');
    });

    it('verifies getPublicUrl reflects the key deterministically', () => {
      const traversalKey = 'sub/uploads/test.png';
      const url = getPublicUrl(traversalKey);
      expect(url).toContain('/uploads/sub/uploads/test.png');
    });
  });

  // =========================================================================
  // Challenge 3: Supabase RLS Policies for Orders & Wholesale Data
  // =========================================================================
  describe('Challenge 3: Supabase RLS Policies for Orders & Wholesale Data', () => {
    const rlsFilePath = path.join(PROJECT_ROOT, 'supabase/migrations/20261013000002_rls_policies.sql');
    let rlsSql: string;

    beforeEach(() => {
      rlsSql = fs.readFileSync(rlsFilePath, 'utf-8');
    });

    it('verifies wholesale_offers has strict REVOKE ALL and service_role exclusive access', () => {
      // Mandate: Wholesale offers must be completely inaccessible to anon and authenticated
      expect(rlsSql).toMatch(/REVOKE ALL ON wholesale_offers FROM anon, authenticated;/);
      expect(rlsSql).toMatch(/CREATE POLICY "Service role exclusive access on wholesale offers"[\s\S]*?ON wholesale_offers FOR ALL\s+TO service_role/);
    });

    it('verifies pricing_rules has strict REVOKE ALL and service_role exclusive access', () => {
      // Mandate: Margin rules must be completely inaccessible to anon and authenticated
      expect(rlsSql).toMatch(/REVOKE ALL ON pricing_rules FROM anon, authenticated;/);
      expect(rlsSql).toMatch(/CREATE POLICY "Service role exclusive access on pricing rules"[\s\S]*?ON pricing_rules FOR ALL\s+TO service_role/);
    });

    it('verifies orders INSERT policy restricts anonymous insertion to state = cart_pending', () => {
      const orderInsertMatch = rlsSql.match(
        /CREATE POLICY "Public create checkout orders"\s+ON orders FOR INSERT\s+WITH CHECK \(state = 'cart_pending'\);/
      );
      expect(orderInsertMatch).not.toBeNull();
      expect(rlsSql).toMatch(/ON orders FOR INSERT[\s\S]*?WITH CHECK \([^\)]*state\s*=\s*'cart_pending'/);
    });

    it('identifies architectural gap: order_items INSERT policy permits anonymous insertion with unconstrained WITH CHECK (true)', () => {
      const itemInsertMatch = rlsSql.match(
        /CREATE POLICY "Public insert order items"\s+ON order_items FOR INSERT\s+WITH CHECK \(true\);/
      );
      expect(itemInsertMatch).not.toBeNull();
    });

    it('confirms public UPDATE and DELETE on orders and order_items are denied by default', () => {
      // Public roles should NOT have UPDATE or DELETE policies on orders
      expect(rlsSql).not.toMatch(/ON orders FOR UPDATE\s+TO (anon|public)/i);
      expect(rlsSql).not.toMatch(/ON orders FOR DELETE\s+TO (anon|public)/i);
      expect(rlsSql).not.toMatch(/ON order_items FOR UPDATE\s+TO (anon|public)/i);
      expect(rlsSql).not.toMatch(/ON order_items FOR DELETE\s+TO (anon|public)/i);
    });
  });

  // =========================================================================
  // Challenge 4: Dynamic XML Sitemap Duplicate URL Detection
  // =========================================================================
  describe('Challenge 4: Dynamic XML Sitemap Unique URLs Verification', () => {
    it('verifies kitRoutes maps to distinct kit query URLs eliminating duplicate /projects entries', async () => {
      const entries = await sitemap();
      expect(entries.length).toBeGreaterThanOrEqual(130);

      // Extract all URLs pointing to exactly /projects (without query params)
      const projectUrls = entries.filter((e) => {
        const clean = e.url.replace(/\/+$/, '');
        return clean.endsWith('/projects');
      });

      // Static routes creates exactly 1 entry for /projects
      expect(projectUrls.length).toBe(1);

      // Project kits are mapped with ?kit=
      const kitUrls = entries.filter((e) => e.url.includes('/projects?kit='));
      expect(kitUrls.length).toBe(3);
    });

    it('audits app/sitemap.ts code confirming kitRoutes maps to unique kit URLs', () => {
      const sitemapSource = fs.readFileSync(path.join(PROJECT_ROOT, 'app/sitemap.ts'), 'utf-8');
      
      // Look at kitRoutes section:
      expect(sitemapSource).toContain('// 5. 3 Curated Project Kits');
      expect(sitemapSource).toContain('url: `${baseUrl}/projects?kit=${kit.slug}`');
    });

    it('verifies all sitemap entries (products, categories, guides, kits) are 100% unique', async () => {
      const entries = await sitemap();
      const allUrls = entries.map((e) => e.url);
      const uniqueUrls = new Set(allUrls);

      expect(allUrls.length).toBe(uniqueUrls.size);
      expect(allUrls.length).toBeGreaterThanOrEqual(125);
    });
  });

  // =========================================================================
  // Challenge 5: Storefront Product Detail Page JSON-LD Structured Data Audit
  // =========================================================================
  describe('Challenge 5: Storefront Product Detail Page JSON-LD Structured Data Audit', () => {
    const pdpFilePath = path.join(PROJECT_ROOT, 'app/(storefront)/products/[slug]/page.tsx');

    it('white-box scan confirms ProductJsonLd is mounted in the PDP page component', () => {
      const pdpSource = fs.readFileSync(pdpFilePath, 'utf-8');

      // Check whether ProductJsonLd component is imported
      const importsProductJsonLd = pdpSource.includes('ProductJsonLd');
      // Check whether <ProductJsonLd is rendered
      const mountsProductJsonLd = pdpSource.includes('<ProductJsonLd');

      // Hardening verification: ProductJsonLd is mounted in PDP
      expect(importsProductJsonLd).toBe(true);
      expect(mountsProductJsonLd).toBe(true);
    });

    it('confirms ProductJsonLd component is fully implemented and produces valid Schema.org markup', () => {
      const mockProduct: PublicProductDTO = {
        id: 'prod_test_001',
        slug: 'test-screwdriver-1000v',
        title: 'Insulated 1000V Screwdriver',
        description: 'VDE certified electricians screwdriver',
        brand: 'Ionos',
        gtin: '5012345678901',
        supplier_sku: 'IONSCRW1000V',
        supplier_id: 'status-uk',
        supplier_name: 'Status International (UK) Ltd',
        category: 'Hand Tools',
        category_slug: 'tools',
        images: ['/images/products/test.svg'],
        retail_price_inc_vat_gbp: 12.0,
        retail_price_ex_vat_gbp: 10.0,
        units_per_pack: 1,
        units_per_case: 10,
        case_pack_description: 'Pack of 1 (10 packs per carton)',
        specifications: { Voltage: '1000V' },
        compliance_verified: true,
        image_license_verified: true,
        availability_status: 'in_stock',
      };

      const html = renderToStaticMarkup(React.createElement(ProductJsonLd, { product: mockProduct }));
      expect(html).toContain('application/ld+json');
      expect(html).toContain('"@context":"https://schema.org"');
      expect(html).toContain('"@type":"Product"');
      expect(html).toContain('"name":"Insulated 1000V Screwdriver"');
      expect(html).toContain('"price":"12.00"');
      expect(html).toContain('"priceCurrency":"GBP"');
      expect(html).toContain('https://schema.org/InStock');
    });
  });

  // =========================================================================
  // Challenge 6: Deep Wholesale Cost Security Scan
  // =========================================================================
  describe('Challenge 6: Deep Wholesale Cost Security Scan', () => {
    it('verifies PublicProductDTO type contract strictly omits wholesale cost fields', () => {
      const typesSource = fs.readFileSync(path.join(PROJECT_ROOT, 'src/types/product.ts'), 'utf-8');
      
      // Locate PublicProductDTO interface block
      const dtoStart = typesSource.indexOf('export interface PublicProductDTO');
      const dtoEnd = typesSource.indexOf('export interface WholesaleSupplierOffer');
      const dtoSection = typesSource.slice(dtoStart, dtoEnd);

      expect(dtoSection).not.toContain('unit_cost_ex_vat_gbp');
      expect(dtoSection).not.toContain('case_cost_ex_vat_gbp');
      expect(dtoSection).not.toContain('wholesale');
    });

    it('verifies all 115 products in public catalog omit wholesale fields and clean JSON serialization', () => {
      const products = getAllPublicProducts();
      expect(products).toHaveLength(115);

      for (const product of products) {
        expect((product as any).unit_cost_ex_vat_gbp).toBeUndefined();
        expect((product as any).case_cost_ex_vat_gbp).toBeUndefined();

        const json = JSON.stringify(product);
        expect(json).not.toContain('unit_cost_ex_vat_gbp');
        expect(json).not.toContain('case_cost_ex_vat_gbp');
      }
    });

    it('verifies searchProducts results and category listings never leak wholesale costs', async () => {
      const searchRes = await searchProducts('tape');
      expect(searchRes.products.length).toBeGreaterThan(0);

      const serializedSearch = JSON.stringify(searchRes);
      expect(serializedSearch).not.toContain('unit_cost_ex_vat_gbp');
      expect(serializedSearch).not.toContain('case_cost_ex_vat_gbp');

      const categoryProducts = await getPublicProductsByCategory('tools');
      expect(categoryProducts.length).toBeGreaterThan(0);
      const serializedCat = JSON.stringify(categoryProducts);
      expect(serializedCat).not.toContain('unit_cost_ex_vat_gbp');
      expect(serializedCat).not.toContain('case_cost_ex_vat_gbp');
    });

    it('verifies /api/store/products HTTP route response body never contains wholesale cost strings', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/products?q=ladder');
      const res = await getProductsApi(req);

      expect(res.status).toBe(200);
      const json = await res.json();
      const stringified = JSON.stringify(json);

      expect(stringified).not.toContain('unit_cost_ex_vat_gbp');
      expect(stringified).not.toContain('case_cost_ex_vat_gbp');
      expect(stringified).not.toContain('unit_cost');
      expect(stringified).not.toContain('case_cost');
    });

    it('scans all storefront files in app/(storefront) and src/components/storefront for zero wholesale occurrences', () => {
      function collectFiles(dir: string): string[] {
        let results: string[] = [];
        if (!fs.existsSync(dir)) return results;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            results = results.concat(collectFiles(fullPath));
          } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            results.push(fullPath);
          }
        }
        return results;
      }

      const storefrontFiles = [
        ...collectFiles(path.join(PROJECT_ROOT, 'app/(storefront)')),
        ...collectFiles(path.join(PROJECT_ROOT, 'src/components/storefront')),
      ];

      expect(storefrontFiles.length).toBeGreaterThan(15);

      const leaks: string[] = [];
      for (const file of storefrontFiles) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.includes('unit_cost_ex_vat_gbp') || content.includes('case_cost_ex_vat_gbp')) {
          leaks.push(file);
        }
      }

      expect(leaks).toEqual([]);
    });
  });

  // =========================================================================
  // Challenge 7: Brand V3 Strictness & Color Invariant Verification
  // =========================================================================
  describe('Challenge 7: Brand V3 Strictness & Color Invariant Verification', () => {
    function getAllSourceFiles(): string[] {
      const extensions = ['.ts', '.tsx', '.css'];
      const targetDirs = ['src', 'app', 'design'];
      const excludedDirs = ['node_modules', '.next', '.git', '.agents', 'dist'];

      let files: string[] = [];

      function walk(dir: string) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.isDirectory()) {
            if (!excludedDirs.includes(entry.name)) {
              walk(path.join(dir, entry.name));
            }
          } else if (entry.isFile()) {
            if (extensions.some((ext) => entry.name.endsWith(ext))) {
              files.push(path.join(dir, entry.name));
            }
          }
        }
      }

      for (const dir of targetDirs) {
        walk(path.join(PROJECT_ROOT, dir));
      }
      return files;
    }

    it('confirms ZERO retired copper (#B84C32 / --tc-copper) across all source files', () => {
      const files = getAllSourceFiles();
      expect(files.length).toBeGreaterThan(40);

      const violations: string[] = [];
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (content.toLowerCase().includes('#b84c32') || content.includes('--tc-copper')) {
          violations.push(path.relative(PROJECT_ROOT, file));
        }
      }

      expect(violations).toEqual([]);
    });

    it('confirms ZERO unauthorized purple, violet, lavender, or teal classes or inline hex in components', () => {
      const files = getAllSourceFiles().filter((f) => !f.endsWith('.css'));
      const prohibitedRegex = /\b(?:bg|text|border|ring)-(?:purple|violet|lavender|teal)-/i;
      const violations: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        if (prohibitedRegex.test(content)) {
          violations.push(path.relative(PROJECT_ROOT, file));
        }
      }

      expect(violations).toEqual([]);
    });

    it('confirms ZERO white text on Action Lime (#DDF16A) in components and templates', () => {
      const files = getAllSourceFiles();
      const violations: string[] = [];

      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, idx) => {
          const hasLimeBg =
            line.includes('bg-tc-action-lime') ||
            line.includes('var(--tc-action-lime)') ||
            line.toLowerCase().includes('#ddf16a');
          const hasWhiteText =
            line.includes('text-white') ||
            line.toLowerCase().includes('color:#fff') ||
            line.toLowerCase().includes('color: #fff') ||
            line.toLowerCase().includes('color:#ffffff');

          if (hasLimeBg && hasWhiteText && !line.includes('border-tc-action-lime')) {
            violations.push(`${path.relative(PROJECT_ROOT, file)}:${idx + 1}`);
          }
        });
      }

      expect(violations).toEqual([]);
    });

    it('verifies Resend email templates strictly use Brand V3 tokens and Steel Text #596B70', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html: html1 } = renderOrderConfirmationEmail(sampleOrder);
      const { html: html2 } = renderSupplierPurchaseOrderEmail(sampleOrder, 'PO-TEST-1');
      const { html: html3 } = renderTrackingUpdateEmail(sampleOrder, 'DX Express', 'DX123456GB');
      const { html: html4 } = renderTradeApplicationDecisionEmail('Smith Electrical Ltd', 'approved', 5000, 'tier_2_10pct');

      const allEmails = [html1, html2, html3, html4];

      for (const html of allEmails) {
        // Zero copper
        expect(html.toLowerCase()).not.toContain('#b84c32');
        // Zero purple/teal
        expect(html.toLowerCase()).not.toContain('purple');
        expect(html.toLowerCase()).not.toContain('teal');
        // Action lime is paired with Ink #182336, never white
        if (html.includes('#DDF16A') || html.includes('#ddf16a')) {
          expect(html).toContain('#182336');
        }
        // Secondary text on pale cards uses Steel Text #596B70
        expect(html).toContain('#596B70');
      }
    });

    it('mathematically verifies WCAG 2.2 AA contrast ratios for Lime, Ink, and Steel Text', () => {
      function srgbToLinear(c: number): number {
        return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      }

      function getRelativeLuminance(hex: string): number {
        const clean = hex.replace('#', '');
        const r = srgbToLinear(parseInt(clean.slice(0, 2), 16) / 255);
        const g = srgbToLinear(parseInt(clean.slice(2, 4), 16) / 255);
        const b = srgbToLinear(parseInt(clean.slice(4, 6), 16) / 255);
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      }

      function getContrastRatio(hex1: string, hex2: string): number {
        const l1 = getRelativeLuminance(hex1);
        const l2 = getRelativeLuminance(hex2);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return (lighter + 0.05) / (darker + 0.05);
      }

      // White on Action Lime: FAILS WCAG AA (< 4.5)
      const whiteOnLime = getContrastRatio('#FFFFFF', '#DDF16A');
      expect(Math.round(whiteOnLime * 100) / 100).toBe(1.25);
      expect(whiteOnLime).toBeLessThan(4.5);

      // Ink on Action Lime: PASSES WCAG AA (>= 4.5)
      const inkOnLime = getContrastRatio('#182336', '#DDF16A');
      expect(Math.round(inkOnLime * 100) / 100).toBe(12.66);
      expect(inkOnLime).toBeGreaterThanOrEqual(4.5);

      // Steel Text #596B70 on Workshop White #F7F8F5: PASSES WCAG AA (>= 4.5)
      const steelTextOnWhite = getContrastRatio('#596B70', '#F7F8F5');
      expect(steelTextOnWhite).toBeGreaterThanOrEqual(4.5);

      // Steel Grey #66767A on Workshop White #F7F8F5: FAILS WCAG AA (< 4.5)
      const steelGreyOnWhite = getContrastRatio('#66767A', '#F7F8F5');
      expect(steelGreyOnWhite).toBeLessThan(4.5);
    });
  });
});
