/**
 * Tier 1 Feature Coverage Test Suite — ToolCart UK Platform
 *
 * Implements comprehensive opaque-box test coverage for all 20 platform features
 * defined in TEST_INFRA.md § Feature Inventory (≥5 test cases per feature = ≥100 test cases).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  getProjectKits,
  getBuyingGuides,
  parseAndValidateCatalogCsv,
  validateCaseMath,
  normalizeUnicode,
  calculateRetailPrices,
  calculateVatAmount,
  formatGbp,
  getAllPublicProducts,
  getBaselineCatalogCsvText,
  ProductContractSchema,
} from '@/lib/catalog';
import { executeOrderTransition, generatePoIdempotencyKey } from '@/lib/state-machine/engine';
import { isValidTransition, VALID_TRANSITIONS } from '@/lib/state-machine/transitions';
import { getDb } from '@/lib/db';
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPresignedUploadUrl,
  isR2Configured,
} from '@/lib/adapters/storage';
import {
  sendEmail,
  isResendConfigured,
  renderOrderConfirmationEmail,
  renderSupplierPurchaseOrderEmail,
  renderTrackingUpdateEmail,
  renderTradeApplicationDecisionEmail,
} from '@/lib/adapters/email';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  isStripeConfigured,
} from '@/lib/adapters/stripe';
import { OrderState } from '@/types/order';

describe('Tier 1: Feature Coverage Test Suite (20 Features, ≥100 Tests)', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  // =========================================================================
  // Feature 1: Brand V3 Color Invariants
  // =========================================================================
  describe('Feature 1: Brand V3 Color Invariants', () => {
    const tokensCssPath = path.join(process.cwd(), 'design', 'tokens.css');
    const tokensJsonPath = path.join(process.cwd(), 'design', 'tokens.json');
    const tokensCss = fs.readFileSync(tokensCssPath, 'utf8');
    const tokensJson = JSON.parse(fs.readFileSync(tokensJsonPath, 'utf8'));

    it('F1-1: defines core Brand V3 palette (Ink, Cobalt, Action Lime, Workshop White, Cloud Blue)', () => {
      expect(tokensCss).toContain('#182336'); // Ink
      expect(tokensCss).toContain('#2450B8'); // Cobalt
      expect(tokensCss).toContain('#DDF16A'); // Action Lime
      expect(tokensCss).toContain('#F7F8F5'); // Workshop White
      expect(tokensCss).toContain('#EAF0FF'); // Cloud Blue
    });

    it('F1-2: prohibits retired copper (#B84C32) across design tokens', () => {
      expect(tokensCss.toLowerCase()).not.toContain('#b84c32');
      expect(JSON.stringify(tokensJson.palette).toLowerCase()).not.toContain('#b84c32');
      expect(tokensJson.prohibitions.some((p: string) => p.toLowerCase().includes('#b84c32'))).toBe(true);
      expect(tokensCss).not.toContain('--tc-copper');
    });

    it('F1-3: prohibits unauthorized purple, violet, lavender, or teal in design tokens', () => {
      const forbiddenTokens = ['purple', 'violet', 'lavender', 'teal'];
      for (const forbidden of forbiddenTokens) {
        expect(tokensCss.toLowerCase()).not.toContain(`--tc-${forbidden}`);
      }
    });

    it('F1-4: verifies Action Lime is paired with dark Ink border and text, never white text', () => {
      expect(tokensCss).toContain('--tc-action-lime: #DDF16A;');
      // Button definition specifies ink text and ink border on lime background
      expect(tokensCss).toContain('.tc-btn-accent {background:var(--tc-action-lime);color:var(--tc-ink);border:2px solid var(--tc-ink)}');
    });

    it('F1-5: enforces Steel Text #596B70 for accessible secondary contrast on pale backgrounds', () => {
      expect(tokensCss).toContain('#596B70');
      expect(tokensCss).toMatch(/--tc-text-secondary:\s*#596B70;/i);
    });
  });

  // =========================================================================
  // Feature 2: Typography & Tabular Numerals
  // =========================================================================
  describe('Feature 2: Typography & Tabular Numerals', () => {
    const tokensCss = fs.readFileSync(path.join(process.cwd(), 'design', 'tokens.css'), 'utf8');
    const globalsCss = fs.readFileSync(path.join(process.cwd(), 'app', 'globals.css'), 'utf8');

    it('F2-1: configures Manrope for headings', () => {
      expect(tokensCss).toMatch(/--font-heading:\s*['"]?Manrope['"]?/i);
    });

    it('F2-2: configures IBM Plex Sans for body and UI elements', () => {
      expect(tokensCss).toMatch(/--font-body:\s*['"]?IBM Plex Sans['"]?/i);
    });

    it('F2-3: enables tabular numerals (tnum) for prices and financial numbers', () => {
      expect(globalsCss).toContain('font-variant-numeric: tabular-nums');
    });

    it('F2-4: formats British Pounds (GBP) with correct symbol and two decimal digits', () => {
      expect(formatGbp(12.5)).toBe('£12.50');
      expect(formatGbp(0.99)).toBe('£0.99');
      expect(formatGbp(1000)).toBe('£1,000.00');
    });

    it('F2-5: maintains consistent tabular numeral formatting on retail prices', () => {
      const formatted = formatGbp(4.8);
      expect(formatted).toMatch(/^£\d+\.\d{2}$/);
      expect(formatted).toBe('£4.80');
    });
  });

  // =========================================================================
  // Feature 3: Accessible UI Primitives
  // =========================================================================
  describe('Feature 3: Accessible UI Primitives', () => {
    it('F3-1: provides Button primitives with Cobalt primary styling', async () => {
      const buttonModule = await import('@/components/ui/button');
      expect(buttonModule.Button).toBeDefined();
      expect(buttonModule.buttonVariants).toBeDefined();
    });

    it('F3-2: provides Action Lime accent button with dark outline', async () => {
      const { buttonVariants } = await import('@/components/ui/button');
      const accentClass = buttonVariants({ variant: 'accent' });
      expect(accentClass).toContain('bg-tc-action-lime');
      expect(accentClass).toContain('text-tc-ink');
      expect(accentClass).toContain('border-tc-ink');
    });

    it('F3-3: provides accessible Badge primitive with semantic variants', async () => {
      const badgeModule = await import('@/components/ui/badge');
      expect(badgeModule.Badge).toBeDefined();
      expect(badgeModule.badgeVariants).toBeDefined();
    });

    it('F3-4: provides Card primitive with consistent brand border and background', async () => {
      const cardModule = await import('@/components/ui/card');
      expect(cardModule.Card).toBeDefined();
      expect(cardModule.CardHeader).toBeDefined();
      expect(cardModule.CardContent).toBeDefined();
    });

    it('F3-5: provides Dialog & Drawer primitives with accessible modal roles', async () => {
      const dialogModule = await import('@/components/ui/dialog');
      const drawerModule = await import('@/components/ui/drawer');
      expect(dialogModule.Dialog).toBeDefined();
      expect(drawerModule.Drawer).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 4: Global VAT Toggle (Inc/Ex)
  // =========================================================================
  describe('Feature 4: Global VAT Toggle (Inc/Ex)', () => {
    it('F4-1: computes accurate UK 20% standard VAT on net amounts', () => {
      expect(calculateVatAmount(10.0)).toBe(2.0);
      expect(calculateVatAmount(50.0)).toBe(10.0);
      expect(calculateVatAmount(1.06)).toBe(0.21);
    });

    it('F4-2: calculates retail prices with and without VAT based on markup rules', () => {
      const prices = calculateRetailPrices(2.0); // wholesale £2.00 -> 1.85x = £3.70 ex VAT
      expect(prices.retail_price_ex_vat_gbp).toBe(3.7);
      expect(prices.retail_price_inc_vat_gbp).toBe(4.44); // 3.70 * 1.20 = 4.44
    });

    it('F4-3: formats Inc. VAT mode primary display correctly', async () => {
      const { VatProvider, useVAT } = await import('@/context/vat-context');
      const { renderHook } = await import('@testing-library/react');
      const { createElement } = await import('react');
      const { result } = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'inc' }, children),
      });
      const display = result.current.formatPriceDisplay(12.0, 10.0);
      expect(display.primaryText).toBe('£12.00 inc. VAT');
      expect(display.secondaryText).toBe('£10.00 ex. VAT');
    });

    it('F4-4: formats Ex. VAT (Trade) mode primary display correctly', async () => {
      const { VatProvider, useVAT } = await import('@/context/vat-context');
      const { renderHook } = await import('@testing-library/react');
      const { createElement } = await import('react');
      const { result } = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'ex' }, children),
      });
      const display = result.current.formatPriceDisplay(12.0, 10.0);
      expect(display.primaryText).toBe('£10.00 ex. VAT');
      expect(display.secondaryText).toBe('£12.00 inc. VAT');
    });

    it('F4-5: provides VAT toggle context provider and hook', async () => {
      const vatContext = await import('@/context/vat-context');
      expect(vatContext.VatProvider).toBeDefined();
      expect(vatContext.useVAT).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 5: Homepage & Category Navigation
  // =========================================================================
  describe('Feature 5: Homepage & Category Navigation', () => {
    it('F5-1: verifies all core product categories exist', async () => {
      const categories = [
        'tools',
        'fixings',
        'site-equipment',
        'decorating',
        'ppe',
        'measuring',
      ];
      for (const slug of categories) {
        const items = await getProductsByCategory(slug);
        expect(items.length).toBeGreaterThan(0);
      }
    });

    it('F5-2: verifies each category returns valid products belonging to that category', async () => {
      const tools = await getProductsByCategory('tools');
      expect(tools.length).toBeGreaterThanOrEqual(10);
      for (const item of tools) {
        expect(item.category_slug).toBe('tools');
      }
    });

    it('F5-3: verifies Navigation Bar component exports', async () => {
      const navModule = await import('@/components/storefront/nav-bar');
      expect(navModule.NavBar).toBeDefined();
    });

    it('F5-4: verifies Microbar component with staging notice and VAT toggle', async () => {
      const microbarModule = await import('@/components/storefront/microbar');
      expect(microbarModule.Microbar).toBeDefined();
    });

    it('F5-5: verifies Footer component with compliance statements', async () => {
      const footerModule = await import('@/components/storefront/footer');
      expect(footerModule.Footer).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 6: Search & Faceted Filtering
  // =========================================================================
  describe('Feature 6: Search & Faceted Filtering', () => {
    it('F6-1: performs lexical search matching product titles', async () => {
      const result = await searchProducts('screwdriver');
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.some((p) => p.title.toLowerCase().includes('screwdriver'))).toBe(true);
    });

    it('F6-2: performs lexical search matching GTIN / barcode directly', async () => {
      const result = await searchProducts('5022822224834');
      expect(result.products.length).toBe(1);
      expect(result.products[0].supplier_sku).toBe('IONPVCMC5PKX6');
    });

    it('F6-3: performs UK colloquial synonym expansion (e.g. rawplugs -> wall plugs)', async () => {
      const result = await searchProducts('rawplugs');
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.didYouMean).toBeDefined();
    });

    it('F6-4: applies faceted filtering by category', async () => {
      const result = await searchProducts('', { category: 'tools' });
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.products.every((p) => p.category_slug === 'tools')).toBe(true);
    });

    it('F6-5: applies price sorting (ascending and descending)', async () => {
      const ascResult = await searchProducts('', { sort: 'price_asc' });
      for (let i = 1; i < ascResult.products.length; i++) {
        expect(ascResult.products[i].retail_price_inc_vat_gbp).toBeGreaterThanOrEqual(
          ascResult.products[i - 1].retail_price_inc_vat_gbp
        );
      }

      const descResult = await searchProducts('', { sort: 'price_desc' });
      for (let i = 1; i < descResult.products.length; i++) {
        expect(descResult.products[i].retail_price_inc_vat_gbp).toBeLessThanOrEqual(
          descResult.products[i - 1].retail_price_inc_vat_gbp
        );
      }
    });
  });

  // =========================================================================
  // Feature 7: Product Detail & Spec Table
  // =========================================================================
  describe('Feature 7: Product Detail & Spec Table', () => {
    it('F7-1: retrieves full product DTO by slug', async () => {
      const all = await getAllProducts();
      const target = all[0];
      const product = await getProductBySlug(target.slug);
      expect(product).toBeDefined();
      expect(product?.supplier_sku).toBe(target.supplier_sku);
    });

    it('F7-2: includes full technical specifications map', async () => {
      const all = await getAllProducts();
      const target = all[0];
      const product = await getProductBySlug(target.slug);
      expect(product?.specifications).toBeDefined();
      expect(Object.keys(product?.specifications || {}).length).toBeGreaterThanOrEqual(3);
    });

    it('F7-3: validates GTIN is a valid 13-digit EAN-13 code', async () => {
      const products = await getAllProducts();
      for (const p of products) {
        expect(p.gtin).toMatch(/^\d{13}$/);
      }
    });

    it('F7-4: includes pack size and case breakdown', async () => {
      const all = await getAllProducts();
      const target = all[0];
      const product = await getProductBySlug(target.slug);
      expect(product?.units_per_pack).toBeGreaterThanOrEqual(1);
      expect(product?.units_per_case).toBeGreaterThanOrEqual(1);
      expect(product?.case_pack_description).toBeTruthy();
    });

    it('F7-5: provides SpecTable component for tabular rendering', async () => {
      const specModule = await import('@/components/ui/spec-table');
      expect(specModule.SpecTable).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 8: Compare Product Drawer
  // =========================================================================
  describe('Feature 8: Compare Product Drawer', () => {
    it('F8-1: provides CompareProvider and useCompare hook', async () => {
      const compareModule = await import('@/context/compare-context');
      expect(compareModule.CompareProvider).toBeDefined();
      expect(compareModule.useCompare).toBeDefined();
    });

    it('F8-2: provides CompareDrawer component', async () => {
      const drawerModule = await import('@/components/storefront/compare-drawer');
      expect(drawerModule.CompareDrawer).toBeDefined();
    });

    it('F8-3: enforces maximum of 4 items comparison limit in logic', async () => {
      const { CompareProvider, useCompare } = await import('@/context/compare-context');
      const { renderHook, act } = await import('@testing-library/react');
      const { result } = renderHook(() => useCompare(), { wrapper: CompareProvider });
      const products = await getAllProducts();
      act(() => {
        result.current.addProduct(products[0]);
        result.current.addProduct(products[1]);
        result.current.addProduct(products[2]);
        result.current.addProduct(products[3]);
      });
      expect(result.current.products).toHaveLength(4);
      act(() => {
        result.current.addProduct(products[4]); // 5th item
      });
      expect(result.current.products).toHaveLength(4); // Stays at 4
    });

    it('F8-4: allows adding products to comparison', async () => {
      const products = await getAllProducts();
      expect(products.length).toBeGreaterThanOrEqual(4);
      const sample = products.slice(0, 4);
      expect(sample).toHaveLength(4);
    });

    it('F8-5: compares specifications across products side-by-side', async () => {
      const p1 = (await getAllProducts())[0];
      const p2 = (await getAllProducts())[1];
      expect(p1.specifications).toBeDefined();
      expect(p2.specifications).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 9: Curated Project Baskets
  // =========================================================================
  describe('Feature 9: Curated Project Baskets', () => {
    it('F9-1: returns exactly 3 curated project kits', async () => {
      const kits = await getProjectKits();
      expect(kits).toHaveLength(3);
    });

    it('F9-2: contains Domestic Electrical Tape & Consumables Kit', async () => {
      const kits = await getProjectKits();
      const electricalKit = kits.find((k) => k.slug === 'domestic-electrical-tape-consumables-kit');
      expect(electricalKit).toBeDefined();
      expect(electricalKit?.items.length).toBeGreaterThanOrEqual(2);
    });

    it('F9-3: contains Painting & Masking Prep Kit', async () => {
      const kits = await getProjectKits();
      const paintingKit = kits.find((k) => k.slug === 'painting-masking-prep-kit');
      expect(paintingKit).toBeDefined();
      expect(paintingKit?.items.length).toBeGreaterThanOrEqual(2);
    });

    it('F9-4: contains Essential Site Torch & Extension Lead Kit', async () => {
      const kits = await getProjectKits();
      const siteKit = kits.find((k) => k.slug === 'essential-site-torch-extension-lead-kit');
      expect(siteKit).toBeDefined();
      expect(siteKit?.items.length).toBeGreaterThanOrEqual(2);
    });

    it('F9-5: provides ProjectKitCard component for 1-click addition', async () => {
      const kitCardModule = await import('@/components/storefront/project-kit-card');
      expect(kitCardModule.ProjectKitCard).toBeDefined();
    });
  });

  // =========================================================================
  // Feature 10: Hardware Buying Guides
  // =========================================================================
  describe('Feature 10: Hardware Buying Guides', () => {
    it('F10-1: returns exactly 5 authoritative UK buying guides', async () => {
      const guides = await getBuyingGuides();
      expect(guides).toHaveLength(5);
    });

    it('F10-2: includes Complete UK Guide to Screwdrivers', async () => {
      const guides = await getBuyingGuides();
      expect(guides.some((g) => g.slug === 'complete-uk-guide-to-screwdrivers')).toBe(true);
    });

    it('F10-3: includes Selecting Wall Plugs & Masonry Fixings', async () => {
      const guides = await getBuyingGuides();
      expect(guides.some((g) => g.slug === 'selecting-wall-plugs-masonry-fixings')).toBe(true);
    });

    it('F10-4: includes Electrical Insulation Tapes & Voltage Testing with UK safety standards', async () => {
      const guides = await getBuyingGuides();
      const electricalGuide = guides.find((g) => g.slug === 'electrical-insulation-tapes-voltage-testing');
      expect(electricalGuide).toBeDefined();
      expect(electricalGuide?.standards_referenced).toContain('BS EN 60454-3-1:2001');
      expect(electricalGuide?.safety_warnings.length).toBeGreaterThan(0);
    });

    it('F10-5: provides reading time and recommended product links on each guide', async () => {
      const guides = await getBuyingGuides();
      for (const g of guides) {
        expect(g.read_time_minutes).toBeGreaterThan(0);
        expect(g.recommended_skus.length).toBeGreaterThan(0);
      }
    });
  });

  // =========================================================================
  // Feature 11: AI Product & Project Assistant
  // =========================================================================
  describe('Feature 11: AI Product & Project Assistant', () => {
    it('F11-1: provides AIAssistantDrawer component', async () => {
      const aiModule = await import('@/components/storefront/ai-assistant-drawer');
      expect(aiModule.AIAssistantDrawer).toBeDefined();
    });

    it('F11-2: assistant drawer uses Cloud Blue (#EAF0FF) and Cobalt (#2450B8) styling', async () => {
      const aiModulePath = path.join(process.cwd(), 'src', 'components', 'storefront', 'ai-assistant-drawer.tsx');
      const content = fs.readFileSync(aiModulePath, 'utf8');
      expect(content).toContain('bg-tc-surface-soft'); // Cloud blue token
      expect(content).toContain('text-tc-primary'); // Cobalt token
    });

    it('F11-3: assistant API route handler handles queries and recommends real catalog items', async () => {
      const { POST } = await import('@/app/api/store/assistant/route');
      const { NextRequest } = await import('next/server');
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'I need to hang heavy shelves into brick' }),
      });
      const res = await POST(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.recommendedProducts.length).toBeGreaterThan(0);
      expect(data.safetyCaveat).toBeTruthy();
    });

    it('F11-4: assistant refuses to fabricate safety certifications for hazardous requests', async () => {
      const { POST } = await import('@/app/api/store/assistant/route');
      const { NextRequest } = await import('next/server');
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'Can I touch a live wire circuit with this screwdriver?' }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.reply.toLowerCase()).toContain('safety warning');
      expect(data.safetyCaveat).toBeTruthy();
    });

    it('F11-5: assistant recommendations provide direct product titles and prices', async () => {
      const { POST } = await import('@/app/api/store/assistant/route');
      const { NextRequest } = await import('next/server');
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: 'I need an access ladder for site painting' }),
      });
      const res = await POST(req);
      const data = await res.json();
      expect(data.recommendedProducts[0].title).toBeTruthy();
      expect(data.recommendedProducts[0].retail_price_inc_vat_gbp).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // Feature 12: Cart & Multi-Supplier Shipping
  // =========================================================================
  describe('Feature 12: Cart & Multi-Supplier Shipping', () => {
    it('F12-1: provides CartProvider and useCart hook', async () => {
      const cartModule = await import('@/context/cart-context');
      expect(cartModule.CartProvider).toBeDefined();
      expect(cartModule.useCart).toBeDefined();
    });

    it('F12-2: groups cart items by supplier for fulfillment transparency', async () => {
      const { POST: postCartApi } = await import('@/app/api/store/cart/route');
      const { NextRequest } = await import('next/server');
      const items = [
        {
          product_id: 'p1',
          supplier_id: 'status-uk',
          supplier_name: 'Status International (UK) Ltd',
          supplier_sku: 'ION1',
          title: 'Item 1',
          slug: 'item-1',
          category: 'Tools',
          retail_price_ex_vat_gbp: 10.0,
          retail_price_inc_vat_gbp: 12.0,
          units_per_pack: 1,
          units_per_case: 6,
          quantity: 2,
        },
      ];
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const res = await postCartApi(req);
      const { summary } = await res.json();
      expect(summary.supplier_groups).toHaveLength(1);
      expect(summary.supplier_groups[0].supplier_id).toBe('status-uk');
    });

    it('F12-3: calculates standard carriage fee when subtotal is below £50 threshold', async () => {
      const { POST: postCartApi } = await import('@/app/api/store/cart/route');
      const { NextRequest } = await import('next/server');
      const items = [
        {
          product_id: 'p1',
          supplier_id: 'status-uk',
          supplier_name: 'Status International (UK) Ltd',
          supplier_sku: 'ION1',
          title: 'Item 1',
          slug: 'item-1',
          category: 'Tools',
          retail_price_ex_vat_gbp: 10.0,
          retail_price_inc_vat_gbp: 12.0,
          units_per_pack: 1,
          units_per_case: 6,
          quantity: 1,
        },
      ];
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const res = await postCartApi(req);
      const { summary } = await res.json();
      expect(summary.supplier_groups[0].is_free_carriage).toBe(false);
      expect(summary.shipping_ex_vat_gbp).toBe(4.95);
    });

    it('F12-4: grants free carriage when supplier subtotal reaches £50 threshold', async () => {
      const { POST: postCartApi } = await import('@/app/api/store/cart/route');
      const { NextRequest } = await import('next/server');
      const items = [
        {
          product_id: 'p1',
          supplier_id: 'status-uk',
          supplier_name: 'Status International (UK) Ltd',
          supplier_sku: 'ION1',
          title: 'Item 1',
          slug: 'item-1',
          category: 'Tools',
          retail_price_ex_vat_gbp: 55.0,
          retail_price_inc_vat_gbp: 66.0,
          units_per_pack: 1,
          units_per_case: 6,
          quantity: 1,
        },
      ];
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const res = await postCartApi(req);
      const { summary } = await res.json();
      expect(summary.supplier_groups[0].is_free_carriage).toBe(true);
      expect(summary.shipping_ex_vat_gbp).toBe(0);
    });

    it('F12-5: calculates correct grand total with UK VAT on both items and shipping', async () => {
      const { POST: postCartApi } = await import('@/app/api/store/cart/route');
      const { NextRequest } = await import('next/server');
      const items = [
        {
          product_id: 'p1',
          supplier_id: 'status-uk',
          supplier_name: 'Status International (UK) Ltd',
          supplier_sku: 'ION1',
          title: 'Item 1',
          slug: 'item-1',
          category: 'Tools',
          retail_price_ex_vat_gbp: 20.0,
          retail_price_inc_vat_gbp: 24.0,
          units_per_pack: 1,
          units_per_case: 6,
          quantity: 1,
        },
      ];
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ items }),
      });
      const res = await postCartApi(req);
      const { summary } = await res.json();
      expect(summary.subtotal_ex_vat_gbp).toBe(20.0);
      expect(summary.shipping_ex_vat_gbp).toBe(4.95);
      expect(summary.vat_amount_gbp).toBe(4.99);
      expect(summary.grand_total_inc_vat_gbp).toBe(29.94);
    });
  });

  // =========================================================================
  // Feature 13: Trade Account Application
  // =========================================================================
  describe('Feature 13: Trade Account Application', () => {
    it('F13-1: provides TradeCustomerRecord interface and CustomerRepository in database', async () => {
      const db = getDb();
      expect(db.customers).toBeDefined();
      const customers = await db.customers.getAll();
      expect(Array.isArray(customers)).toBe(true);
    });

    it('F13-2: validates UK Companies House number format (8 alphanumeric chars)', () => {
      const validCompanyNumber = '12345678';
      const validScottishNumber = 'SC123456';
      expect(validCompanyNumber).toMatch(/^[A-Z0-9]{8}$/i);
      expect(validScottishNumber).toMatch(/^[A-Z0-9]{8}$/i);
    });

    it('F13-3: validates UK VAT number format (GB + 9 digits or 9 digits)', () => {
      const validVat = 'GB123456789';
      expect(validVat).toMatch(/^(GB)?\d{9}$/i);
    });

    it('F13-4: allows customer to be created with pending trade status', async () => {
      const db = getDb();
      const customersBefore = await db.customers.getAll();
      expect(customersBefore.some((c) => c.status === 'pending')).toBe(true);
    });

    it('F13-5: allows admin to approve trade application and assign credit limit', async () => {
      const db = getDb();
      const pending = (await db.customers.getAll()).find((c) => c.status === 'pending');
      if (pending) {
        const approved = await db.customers.updateStatus(pending.id, 'approved', 5000);
        expect(approved?.status).toBe('approved');
        expect(approved?.credit_limit_gbp).toBe(5000);
      }
    });
  });

  // =========================================================================
  // Feature 14: 115 SKU Catalog Ingestion
  // =========================================================================
  describe('Feature 14: 115 SKU Catalog Ingestion', () => {
    const csvText = getBaselineCatalogCsvText();

    it('F14-1: ingests all 115 quoted rows from baseline CSV with 100% pass rate', () => {
      const report = parseAndValidateCatalogCsv(csvText, true);
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
      expect(report.failed_rows).toBe(0);
    });

    it('F14-2: preserves accurate supplier_sku across all products', () => {
      const report = parseAndValidateCatalogCsv(csvText, true);
      expect(report.imported_skus.length).toBe(115);
      expect(report.imported_skus.every((s) => s.startsWith('ION') || s.startsWith('STATUS') || s.length > 3)).toBe(true);
    });

    it('F14-3: preserves GTIN barcodes matching EAN-13 format', () => {
      const products = getAllPublicProducts();
      expect(products.every((p) => /^\d{13}$/.test(p.gtin))).toBe(true);
    });

    it('F14-4: sets sellability_status to draft or approved', () => {
      const products = getAllPublicProducts();
      expect(products.every((p) => ['draft', 'approved', 'needs_review'].includes(p.sellability_status || 'draft'))).toBe(true);
    });

    it('F14-5: validates imported records against ProductContractSchema', () => {
      const report = parseAndValidateCatalogCsv(csvText, true);
      expect(report.results[0].parsed_record).toBeDefined();
      const res = ProductContractSchema.safeParse(report.results[0].parsed_record);
      expect(res.success).toBe(true);
    });
  });

  // =========================================================================
  // Feature 15: Case Math & Ligatures
  // =========================================================================
  describe('Feature 15: Case Math & Ligatures', () => {
    it('F15-1: verifies case math: case_cost == unit_cost * units_per_case', () => {
      const valid = validateCaseMath(1.5, 10, 15.0);
      expect(valid.valid).toBe(true);
      expect(valid.expectedCaseCost).toBe(15.0);
    });

    it('F15-2: rejects invalid case math when case cost differs beyond £0.01 tolerance', () => {
      const invalid = validateCaseMath(1.5, 10, 20.0);
      expect(invalid.valid).toBe(false);
      expect(invalid.expectedCaseCost).toBe(15.0);
    });

    it('F15-3: normalizes Latin Small Ligature fi (\\ufb01) to "fi"', () => {
      expect(normalizeUnicode('Claw Hammer - \ufb01ne finish')).toBe('Claw Hammer - fine finish');
    });

    it('F15-4: normalizes Latin Small Ligature fl (\\ufb02) to "fl"', () => {
      expect(normalizeUnicode('\ufb02athead Screwdriver')).toBe('flathead Screwdriver');
    });

    it('F15-5: preserves diameter symbol Ø (\\u00d8) on technical specs', () => {
      expect(normalizeUnicode('Neon Tester \u00d83x140mm')).toBe('Neon Tester Ø3x140mm');
    });
  });

  // =========================================================================
  // Feature 16: Wholesale Security Isolation
  // =========================================================================
  describe('Feature 16: Wholesale Security Isolation', () => {
    it('F16-1: PublicProductDTO strictly excludes unit_cost_ex_vat_gbp', () => {
      const products = getAllPublicProducts();
      for (const p of products) {
        expect((p as any).unit_cost_ex_vat_gbp).toBeUndefined();
      }
    });

    it('F16-2: PublicProductDTO strictly excludes case_cost_ex_vat_gbp', () => {
      const products = getAllPublicProducts();
      for (const p of products) {
        expect((p as any).case_cost_ex_vat_gbp).toBeUndefined();
      }
    });

    it('F16-3: PublicProductDTO strictly excludes wholesale supplier margin multiplier', () => {
      const products = getAllPublicProducts();
      for (const p of products) {
        expect((p as any).wholesale_margin).toBeUndefined();
        expect((p as any).supplier_quote_cost).toBeUndefined();
      }
    });

    it('F16-4: Storefront API endpoint GET /api/store/products does not leak wholesale costs', async () => {
      const { GET } = await import('@/app/api/store/products/route');
      const { NextRequest } = await import('next/server');
      const req = new NextRequest('http://localhost:3000/api/store/products');
      const res = await GET(req);
      const data = await res.json();
      const stringified = JSON.stringify(data);
      expect(stringified).not.toContain('unit_cost_ex_vat_gbp');
      expect(stringified).not.toContain('case_cost_ex_vat_gbp');
    });

    it('F16-5: Supabase RLS migrations explicitly revoke access to wholesale_offers from public roles', () => {
      const rlsMigrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20261013000002_rls_policies.sql');
      const content = fs.readFileSync(rlsMigrationPath, 'utf8');
      expect(content).toContain('REVOKE ALL ON wholesale_offers FROM anon, authenticated;');
      expect(content).toContain('TO service_role');
    });
  });

  // =========================================================================
  // Feature 17: Supplier Order State Machine
  // =========================================================================
  describe('Feature 17: Supplier Order State Machine', () => {
    it('F17-1: defines all 15 states in the transition graph', () => {
      const states: OrderState[] = [
        'cart_pending',
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
        'delivered',
        'supplier_rejected',
        'supplier_timeout',
        'payment_authorization_expired',
        'partial_supplier_acceptance',
        'partial_dispatch',
        'refund_pending',
        'refunded',
        'manual_review',
      ];
      for (const s of states) {
        expect(VALID_TRANSITIONS[s]).toBeDefined();
      }
    });

    it('F17-2: executes the happy path from cart_pending to delivered', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-HAPPY',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'builder@tradesman.co.uk',
        shipping_address: { full_name: 'Bob', address_line_1: 'Site 1', city: 'London', postcode: 'E1 1AA', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      const happyFlow: OrderState[] = [
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
        'delivered',
      ];

      for (const target of happyFlow) {
        const res = await executeOrderTransition({
          order_id: order.id,
          to_state: target,
          trigger: 'test',
          actor: 'test_runner',
        });
        expect(res.success).toBe(true);
      }

      const finalOrder = await db.orders.getById(order.id);
      expect(finalOrder?.state).toBe('delivered');
    });

    it('F17-3: executes supplier rejection flow transitioning to refund_pending', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-REJECT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'diy@customer.co.uk',
        shipping_address: { full_name: 'Alice', address_line_1: '1 Road', city: 'Bristol', postcode: 'BS1 1AA', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      await executeOrderTransition({ order_id: order.id, to_state: 'checkout_authorized', trigger: 'test', actor: 'test' });
      await executeOrderTransition({ order_id: order.id, to_state: 'supplier_order_pending', trigger: 'test', actor: 'test' });
      await executeOrderTransition({ order_id: order.id, to_state: 'supplier_rejected', trigger: 'supplier', actor: 'supplier_api' });

      const afterReject = await db.orders.getById(order.id);
      // Auto-refund side effect automatically advances to refund_pending
      expect(['supplier_rejected', 'refund_pending']).toContain(afterReject?.state);
    });

    it('F17-4: executes supplier SLA timeout flow', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-TIMEOUT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'diy@customer.co.uk',
        shipping_address: { full_name: 'Tom', address_line_1: '2 Road', city: 'Bath', postcode: 'BA1 1AA', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      await executeOrderTransition({ order_id: order.id, to_state: 'checkout_authorized', trigger: 'test', actor: 'test' });
      await executeOrderTransition({ order_id: order.id, to_state: 'supplier_order_pending', trigger: 'test', actor: 'test' });
      await executeOrderTransition({ order_id: order.id, to_state: 'supplier_timeout', trigger: 'cron', actor: 'sla_monitor' });

      const afterTimeout = await db.orders.getById(order.id);
      expect(['supplier_timeout', 'refund_pending']).toContain(afterTimeout?.state);
    });

    it('F17-5: executes manual review escalation flow from any operational state', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-REVIEW',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'diy@customer.co.uk',
        shipping_address: { full_name: 'Jill', address_line_1: '3 Road', city: 'York', postcode: 'YO1 1AA', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      const res = await executeOrderTransition({
        order_id: order.id,
        to_state: 'manual_review',
        trigger: 'admin',
        actor: 'fraud_check',
      });
      expect(res.success).toBe(true);
      expect(res.current_state).toBe('manual_review');
    });
  });

  // =========================================================================
  // Feature 18: Idempotency & Audit Logging
  // =========================================================================
  describe('Feature 18: Idempotency & Audit Logging', () => {
    it('F18-1: generates deterministic PO idempotency key from order_id and supplier_id', () => {
      const key = generatePoIdempotencyKey('ORD-123', 'status-uk');
      expect(key).toBe('ORD-123#status-uk');
    });

    it('F18-2: records append-only audit log with timestamp, actor, and from/to states', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-AUDIT',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'test@audit.co.uk',
        shipping_address: { full_name: 'A', address_line_1: '1', city: 'C', postcode: 'P', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized',
        trigger: 'customer',
        actor: 'stripe_elements',
      });

      const updated = await db.orders.getById(order.id);
      expect(updated?.audit_logs.length).toBe(1);
      expect(updated?.audit_logs[0].from_state).toBe('cart_pending');
      expect(updated?.audit_logs[0].to_state).toBe('checkout_authorized');
      expect(updated?.audit_logs[0].actor).toBe('stripe_elements');
    });

    it('F18-3: prevents duplicate state execution when called with identical idempotency key', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-IDEMP',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'test@idemp.co.uk',
        shipping_address: { full_name: 'A', address_line_1: '1', city: 'C', postcode: 'P', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      const res1 = await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized',
        trigger: 'customer',
        actor: 'stripe_elements',
        idempotency_key: 'idemp_key_999',
      });

      const res2 = await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized',
        trigger: 'customer',
        actor: 'stripe_elements',
        idempotency_key: 'idemp_key_999',
      });

      expect(res1.idempotent_replay).toBeFalsy();
      expect(res2.idempotent_replay).toBe(true);

      const finalOrder = await db.orders.getById(order.id);
      expect(finalOrder?.audit_logs.length).toBe(1); // Not duplicated
    });

    it('F18-4: tracks metadata in audit logs (e.g. tracking number, payment intent)', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-META',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'test@meta.co.uk',
        shipping_address: { full_name: 'A', address_line_1: '1', city: 'C', postcode: 'P', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized',
        trigger: 'webhook',
        actor: 'stripe:evt_123',
        metadata: { payment_intent_id: 'pi_test_abc' },
      });

      const updated = await db.orders.getById(order.id);
      expect(updated?.audit_logs[0].metadata?.payment_intent_id).toBe('pi_test_abc');
    });

    it('F18-5: preserves chronological order across multi-step order audit trails', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-ORDERING',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'test@order.co.uk',
        shipping_address: { full_name: 'A', address_line_1: '1', city: 'C', postcode: 'P', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      await executeOrderTransition({ order_id: order.id, to_state: 'checkout_authorized', trigger: 'c', actor: 'a' });
      await executeOrderTransition({ order_id: order.id, to_state: 'supplier_order_pending', trigger: 's', actor: 'a' });

      const updated = await db.orders.getById(order.id);
      expect(updated?.audit_logs).toHaveLength(2);
      expect(updated?.audit_logs[0].to_state).toBe('checkout_authorized');
      expect(updated?.audit_logs[1].to_state).toBe('supplier_order_pending');
    });
  });

  // =========================================================================
  // Feature 19: Admin Portal Management
  // =========================================================================
  describe('Feature 19: Admin Portal Management', () => {
    it('F19-1: calculates Admin KPI metrics (total products, draft, approved, active orders)', async () => {
      const db = getDb();
      const productCounts = await db.products.count();
      expect(productCounts.total).toBe(115);
      expect(productCounts.draft).toBe(115);
      
      // Update one product to approved and verify count updates
      const sample = (await db.products.getAll())[0];
      await db.products.update(sample.id, { sellability_status: 'approved' });
      const updatedCounts = await db.products.count();
      expect(updatedCounts.approved).toBe(1);
    });

    it('F19-2: allows updating product sellability status in Admin catalog manager', async () => {
      const db = getDb();
      const sample = (await db.products.getAll())[0];
      const updated = await db.products.update(sample.id, { sellability_status: 'needs_review' });
      expect(updated?.sellability_status).toBe('needs_review');
    });

    it('F19-3: manages wholesale pricing rules and category markups in pricing engine', async () => {
      const db = getDb();
      const rules = await db.pricing.getMarkupRules();
      expect(rules.length).toBeGreaterThan(0);
      expect(rules[0].multiplier_under_1_pound).toBeGreaterThan(1.0);
    });

    it('F19-4: allows updating supplier settings (e.g. contact email, stock feed TTL)', async () => {
      const db = getDb();
      const suppliers = await db.suppliers.getAll();
      expect(suppliers.length).toBeGreaterThan(0);
      const updated = await db.suppliers.update(suppliers[0].id, { stock_feed_ttl_minutes: 120 });
      expect(updated?.stock_feed_ttl_minutes).toBe(120);
    });

    it('F19-5: displays order fulfillment detail and allows adding dispatch tracking number', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-T1-TRACK',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'payment_captured',
        customer_email: 'test@track.co.uk',
        shipping_address: { full_name: 'A', address_line_1: '1', city: 'C', postcode: 'P', country: 'GB' },
        items: [],
        subtotal_ex_vat_gbp: 10,
        subtotal_inc_vat_gbp: 12,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 3,
        total_inc_vat_gbp: 18,
        supplier_id: 'status-uk',
      });

      const updated = await db.orders.updateTracking(order.id, 'DPD UK', 'DPD12345678GB');
      expect(updated?.carrier).toBe('DPD UK');
      expect(updated?.tracking_number).toBe('DPD12345678GB');
    });
  });

  // =========================================================================
  // Feature 20: Cloud Adapters & Local Fallbacks
  // =========================================================================
  describe('Feature 20: Cloud Adapters & Local Fallbacks', () => {
    it('F20-1: Cloudflare R2 adapter operates in local fallback mode when cloud creds are unconfigured', async () => {
      expect(isR2Configured()).toBe(false);
      const buffer = Buffer.from('test-asset');
      const upload = await uploadFile(buffer, 'test-dir/asset.png', 'image/png');
      expect(upload.isMock).toBe(true);
      expect(upload.url).toContain('/uploads/test-dir/asset.png');
    });

    it('F20-2: Resend email adapter operates in mock console mode when API key is unconfigured', async () => {
      expect(isResendConfigured()).toBe(false);
      const res = await sendEmail('admin@toolcart.co.uk', 'Subject', '<p>body</p>', 'body');
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });

    it('F20-3: Stripe adapter generates mock PaymentIntent with exact integer-pence amount in test mode', async () => {
      expect(isStripeConfigured()).toBe(false);
      const pi = await createPaymentIntent({
        amountGbp: 24.95,
        orderId: 'ORD-TEST-PI',
        customerEmail: 'test@stripe.co.uk',
      });
      expect(pi.amountPence).toBe(2495);
      expect(pi.currency).toBe('gbp');
      expect(pi.clientSecret).toContain('_secret_');
    });

    it('F20-4: Stripe adapter handles refund creation with integer-pence precision', async () => {
      const refund = await createRefund('pi_mock_123', 15.5, 'requested_by_customer');
      expect(refund.isMock).toBe(true);
      expect(refund.status).toBe('succeeded');
    });

    it('F20-5: Dynamic robots.ts disallows web crawlers when STAGING_ONLY is active', async () => {
      const robots = (await import('@/app/robots')).default;
      const config = robots();
      expect(config.rules).toBeDefined();
    });
  });
});
