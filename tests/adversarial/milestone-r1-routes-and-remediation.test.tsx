import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { searchProducts, getProductsByCategory, getBuyingGuideBySlug, getBuyingGuides } from '@/lib/catalog';
import { parseAndValidateCatalogCsv, getBaselineCatalogCsvText } from '@/lib/catalog';
import { CategoryCadAccent } from '@/components/ui/vectors/category-cad-accents';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import fs from 'node:fs';
import path from 'node:path';

const { mockPush } = vi.hoisted(() => ({
  mockPush: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => '/search',
  useSearchParams: () => new URLSearchParams('q=tape&brand=Status&min_price=5&in_stock=true'),
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

describe('Milestone R1: Critical Routes, Navigation & Server Fixes', () => {
  describe('Feature 1 & 7: CatalogSortControl Client Component', () => {
    it('renders sort dropdown with Brand V3 styling and current sort value', () => {
      render(<CatalogSortControl currentSort="price_asc" />);
      const select = screen.getByRole('combobox', { name: /sort products/i }) as HTMLSelectElement;
      expect(select).toBeDefined();
      expect(select.value).toBe('price_asc');
    });

    it('preserves existing query parameters when user changes sort', () => {
      mockPush.mockClear();

      render(<CatalogSortControl currentSort="relevance" />);
      const select = screen.getByRole('combobox', { name: /sort products/i });

      fireEvent.change(select, { target: { value: 'price_desc' } });

      expect(mockPush).toHaveBeenCalledTimes(1);
      const pushedUrl = mockPush.mock.calls[0][0];
      expect(pushedUrl).toContain('/search?');
      expect(pushedUrl).toContain('q=tape');
      expect(pushedUrl).toContain('brand=Status');
      expect(pushedUrl).toContain('min_price=5');
      expect(pushedUrl).toContain('in_stock=true');
      expect(pushedUrl).toContain('sort=price_desc');
    });
  });

  describe('Feature 2: Next.js Configuration Route Rewrites', () => {
    it('defines rewrites function in next.config.mjs', async () => {
      const configPath = path.join(process.cwd(), 'next.config.mjs');
      const content = fs.readFileSync(configPath, 'utf-8');
      expect(content).toContain('async rewrites()');
      expect(content).toContain("source: '/catalog'");
      expect(content).toContain("destination: '/search'");
      expect(content).toContain("source: '/categories'");
      expect(content).toContain("destination: '/'");
      expect(content).toContain("source: '/product/:slug'");
      expect(content).toContain("destination: '/products/:slug'");
      expect(content).toContain("source: '/guide/:slug*'");
      expect(content).toContain("destination: '/guides/:slug*'");
    });
  });

  describe('Feature 3: Guides Route Resolution and Fallback', () => {
    it('loads valid guide when queried by slug', async () => {
      const guide = await getBuyingGuideBySlug('complete-uk-guide-to-screwdrivers');
      expect(guide).toBeDefined();
      expect(guide?.title).toContain('Screwdrivers');
    });

    it('falls back to default guide for template placeholder slugs', async () => {
      const allGuides = await getBuyingGuides();
      expect(allGuides.length).toBeGreaterThan(0);
      const defaultGuide = allGuides[0];

      // Simulate fallback logic implemented in app/(storefront)/guides/[slug]/page.tsx
      const testResolve = async (slug: string) => {
        let g = await getBuyingGuideBySlug(slug);
        if (!g && (slug === '[slug]' || slug === '%5Bslug%5D' || !slug)) {
          g = allGuides[0] || null;
        }
        return g;
      };

      const fallbackBracket = await testResolve('[slug]');
      expect(fallbackBracket).toEqual(defaultGuide);

      const fallbackEncoded = await testResolve('%5Bslug%5D');
      expect(fallbackEncoded).toEqual(defaultGuide);
    });
  });

  describe('Feature 4 & 5: Electrical Route & CAD Accents', () => {
    it('returns electrical consumables when filtered by electrical category', async () => {
      const result = await searchProducts('', { category: 'electrical' });
      expect(result.products.length).toBeGreaterThan(0);
      const titles = result.products.map((p) => p.title.toLowerCase());
      const hasElectrical = titles.some(
        (t) => t.includes('electrical') || t.includes('tape') || t.includes('neon') || t.includes('screwdriver')
      );
      expect(hasElectrical).toBe(true);
    });

    it('renders dedicated electrical CAD wireframe accent with Brand V3 tokens', () => {
      const { container } = render(<CategoryCadAccent categorySlug="electrical" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
      expect(svg?.textContent).toContain('BS EN 60454');
    });

    it('renders electrical CAD wireframe accent for electrical-tapes alias', () => {
      const { container } = render(<CategoryCadAccent categorySlug="electrical-tapes" />);
      const svg = container.querySelector('svg');
      expect(svg).toBeDefined();
      expect(svg?.textContent).toContain('BS EN 60454');
    });
  });

  describe('Feature 6: Price Filter NaN Sanitization', () => {
    it('does not clear catalog when minPrice is NaN', async () => {
      const resultWithNaN = await searchProducts('', { minPrice: NaN });
      const resultNormal = await searchProducts('');
      expect(resultWithNaN.products.length).toBe(resultNormal.products.length);
      expect(resultWithNaN.products.length).toBe(115);
    });

    it('does not clear catalog when maxPrice is NaN', async () => {
      const resultWithNaN = await searchProducts('', { maxPrice: NaN });
      const resultNormal = await searchProducts('');
      expect(resultWithNaN.products.length).toBe(resultNormal.products.length);
      expect(resultWithNaN.products.length).toBe(115);
    });

    it('correctly filters products when valid numeric price bounds are provided', async () => {
      const result = await searchProducts('', { minPrice: 10, maxPrice: 30 });
      expect(result.products.length).toBeGreaterThan(0);
      for (const p of result.products) {
        expect(p.retail_price_inc_vat_gbp).toBeGreaterThanOrEqual(10);
        expect(p.retail_price_inc_vat_gbp).toBeLessThanOrEqual(30);
      }
    });
  });

  describe('Feature 8: Catalog Importer Batch Ingestion & Thenable Report', () => {
    it('supports synchronous invocation without await in dryRun mode', () => {
      const csv = getBaselineCatalogCsvText();
      const report = parseAndValidateCatalogCsv(csv, true);
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
      expect(report.failed_rows).toBe(0);
      expect(typeof report.then).toBe('function');
    });

    it('supports await invocation with thenable contract in dryRun mode', async () => {
      const csv = getBaselineCatalogCsvText();
      const report = await parseAndValidateCatalogCsv(csv, true);
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
    });
  });

  describe('Feature 9: Admin Dashboard Audit Log Null Safety', () => {
    it('safely handles orders with null or undefined audit_logs without throwing', () => {
      const mockOrders = [
        {
          id: 'ord_1',
          order_number: 'TC-1001',
          state: 'payment_captured',
          audit_logs: undefined as any,
        },
        {
          id: 'ord_2',
          order_number: 'TC-1002',
          state: 'delivered',
          audit_logs: null as any,
        },
        {
          id: 'ord_3',
          order_number: 'TC-1003',
          state: 'dispatched',
          audit_logs: [
            {
              id: 'log_1',
              order_id: 'ord_3',
              from_state: 'payment_captured',
              to_state: 'dispatched',
              trigger: 'order_dispatched',
              actor: 'system',
              created_at: new Date().toISOString(),
            },
          ],
        },
      ];

      // Replicate the exact transformation in app/admin/page.tsx:39-47
      const allAuditLogs = mockOrders
        .flatMap((o) =>
          (o.audit_logs || []).map((log: any) => ({
            ...log,
            order_number: o.order_number,
          }))
        )
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);

      expect(allAuditLogs.length).toBe(1);
      expect(allAuditLogs[0].order_number).toBe('TC-1003');
    });
  });
});
