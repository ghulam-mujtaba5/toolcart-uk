import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  searchProducts,
  getAllProducts,
  parseAndValidateCatalogCsv,
  getBaselineCatalogCsvText,
} from '@/lib/catalog';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import SearchPage from '@/app/(storefront)/search/page';
import CategoryPage from '@/app/(storefront)/categories/[slug]/page';
import AdminDashboardPage from '@/app/admin/page';
import { VatProvider } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { getDb } from '@/lib/db';
import { OrderRecord } from '@/types/order';

// Mock navigation for Next.js
const { mockPush, mockSearchParams, mockPathname } = vi.hoisted(() => ({
  mockPush: vi.fn(),
  mockSearchParams: { current: new URLSearchParams() },
  mockPathname: { current: '/search' },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => mockPathname.current,
  useSearchParams: () => mockSearchParams.current,
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <VatProvider>
      <CartProvider>
        <CompareProvider>{ui}</CompareProvider>
      </CartProvider>
    </VatProvider>
  );
}

describe('Challenger R1-2 Adversarial Stress Test Suite', () => {
  beforeEach(async () => {
    mockPush.mockClear();
    mockSearchParams.current = new URLSearchParams();
    mockPathname.current = '/search';
    const db = getDb();
    await db.reset();
  });

  // =========================================================================
  // 1. STRESS TEST: Price Filter Sanitization
  // =========================================================================
  describe('1. Price Filter Sanitization & Boundary Stress', () => {
    it('returns all 115 products when minPrice is NaN', async () => {
      const result = await searchProducts('', { minPrice: NaN });
      expect(result.products).toHaveLength(115);
      expect(result.total).toBe(115);
    });

    it('returns all 115 products when maxPrice is NaN', async () => {
      const result = await searchProducts('', { maxPrice: NaN });
      expect(result.products).toHaveLength(115);
      expect(result.total).toBe(115);
    });

    it('returns all 115 products when both minPrice and maxPrice are NaN', async () => {
      const result = await searchProducts('', { minPrice: NaN, maxPrice: NaN });
      expect(result.products).toHaveLength(115);
      expect(result.total).toBe(115);
    });

    it('returns all 115 products when minPrice is negative', async () => {
      const result = await searchProducts('', { minPrice: -50 });
      expect(result.products).toHaveLength(115);
    });

    it('returns all 115 products when minPrice is 0', async () => {
      const result = await searchProducts('', { minPrice: 0 });
      expect(result.products).toHaveLength(115);
    });

    it('handles non-numeric string values coerced into minPrice/maxPrice without clearing catalog', async () => {
      const resultAbcMin = await searchProducts('', { minPrice: 'abc' as any });
      expect(resultAbcMin.products).toHaveLength(115);

      const resultAbcMax = await searchProducts('', { maxPrice: 'abc' as any });
      expect(resultAbcMax.products).toHaveLength(115);

      const resultNullMin = await searchProducts('', { minPrice: 'null' as any });
      expect(resultNullMin.products).toHaveLength(115);

      const resultWhitespace = await searchProducts('', { minPrice: '   ' as any });
      expect(resultWhitespace.products).toHaveLength(115);
    });

    it('SearchPage server component handles min_price=NaN and max_price=NaN gracefully', async () => {
      const pageJsx = await SearchPage({ searchParams: { min_price: 'NaN', max_price: 'NaN' } });
      const { unmount } = renderWithProviders(pageJsx);
      expect(screen.getByText('(115 results)')).toBeDefined();
      unmount();
    });

    it('SearchPage server component handles min_price=abc and max_price=xyz gracefully', async () => {
      const pageJsx = await SearchPage({ searchParams: { min_price: 'abc', max_price: 'xyz' } });
      const { unmount } = renderWithProviders(pageJsx);
      expect(screen.getByText('(115 results)')).toBeDefined();
      unmount();
    });

    it('SearchPage server component handles whitespace min_price and max_price gracefully', async () => {
      const pageJsx = await SearchPage({ searchParams: { min_price: '   ', max_price: '   ' } });
      const { unmount } = renderWithProviders(pageJsx);
      expect(screen.getByText('(115 results)')).toBeDefined();
      unmount();
    });

    it('SearchPage server component handles negative min_price and max_price gracefully', async () => {
      const pageJsx = await SearchPage({ searchParams: { min_price: '-10', max_price: '-50' } });
      const { unmount } = renderWithProviders(pageJsx);
      expect(screen.getByText('(115 results)')).toBeDefined();
      unmount();
    });

    it('SearchPage server component handles literal "null" and "undefined" strings gracefully', async () => {
      const pageJsx = await SearchPage({ searchParams: { min_price: 'null', max_price: 'undefined' } });
      const { unmount } = renderWithProviders(pageJsx);
      expect(screen.getByText('(115 results)')).toBeDefined();
      unmount();
    });

    it('CategoryPage server component handles adversarial min_price and max_price query strings gracefully', async () => {
      const pageJsx = await CategoryPage({
        params: { slug: 'tools' },
        searchParams: { min_price: 'NaN', max_price: 'abc' },
      });
      const { container, unmount } = renderWithProviders(pageJsx);
      expect(container.textContent).toContain('Hand Tools & Accessories');
      unmount();
    });
  });

  // =========================================================================
  // 2. STRESS TEST: Sort Form State Preservation
  // =========================================================================
  describe('2. Sort State Preservation Across Multiple Transitions', () => {
    it('preserves extensive complex query parameters across sequential sort transitions', () => {
      mockPathname.current = '/search';
      mockSearchParams.current = new URLSearchParams(
        'q=claw+hammer&category=tools&brand=Status&min_price=10.50&max_price=99.99&in_stock=true&custom_tag=pro'
      );

      const { rerender } = render(<CatalogSortControl currentSort="relevance" />);
      const select = screen.getByRole('combobox', { name: /sort products/i }) as HTMLSelectElement;

      // 1st Transition: price_asc
      fireEvent.change(select, { target: { value: 'price_asc' } });
      expect(mockPush).toHaveBeenCalledTimes(1);
      let pushedUrl = mockPush.mock.calls[0][0];
      expect(pushedUrl).toContain('/search?');
      expect(pushedUrl).toContain('q=claw+hammer');
      expect(pushedUrl).toContain('category=tools');
      expect(pushedUrl).toContain('brand=Status');
      expect(pushedUrl).toContain('min_price=10.50');
      expect(pushedUrl).toContain('max_price=99.99');
      expect(pushedUrl).toContain('in_stock=true');
      expect(pushedUrl).toContain('custom_tag=pro');
      expect(pushedUrl).toContain('sort=price_asc');

      // Update mockSearchParams to reflect new state
      mockSearchParams.current = new URLSearchParams(pushedUrl.split('?')[1]);
      rerender(<CatalogSortControl currentSort="price_asc" />);

      // 2nd Transition: price_desc
      fireEvent.change(select, { target: { value: 'price_desc' } });
      expect(mockPush).toHaveBeenCalledTimes(2);
      pushedUrl = mockPush.mock.calls[1][0];
      expect(pushedUrl).toContain('sort=price_desc');
      expect(pushedUrl).not.toContain('sort=price_asc');
      expect(pushedUrl).toContain('q=claw+hammer');
      expect(pushedUrl).toContain('min_price=10.50');

      // Update mockSearchParams to reflect new state
      mockSearchParams.current = new URLSearchParams(pushedUrl.split('?')[1]);
      rerender(<CatalogSortControl currentSort="price_desc" />);

      // 3rd Transition: title_asc
      fireEvent.change(select, { target: { value: 'title_asc' } });
      expect(mockPush).toHaveBeenCalledTimes(3);
      pushedUrl = mockPush.mock.calls[2][0];
      expect(pushedUrl).toContain('sort=title_asc');
      expect(pushedUrl).not.toContain('sort=price_desc');
      expect(pushedUrl).toContain('brand=Status');
      expect(pushedUrl).toContain('max_price=99.99');

      // 4th Transition: title_desc
      mockSearchParams.current = new URLSearchParams(pushedUrl.split('?')[1]);
      rerender(<CatalogSortControl currentSort="title_asc" />);
      fireEvent.change(select, { target: { value: 'title_desc' } });
      expect(mockPush).toHaveBeenCalledTimes(4);
      pushedUrl = mockPush.mock.calls[3][0];
      expect(pushedUrl).toContain('sort=title_desc');
      expect(pushedUrl).toContain('in_stock=true');
      expect(pushedUrl).toContain('custom_tag=pro');
    });

    it('works cleanly when initial searchParams is empty', () => {
      mockPathname.current = '/categories/decorating';
      mockSearchParams.current = new URLSearchParams('');

      render(<CatalogSortControl currentSort="relevance" />);
      const select = screen.getByRole('combobox', { name: /sort products/i });

      fireEvent.change(select, { target: { value: 'price_asc' } });
      expect(mockPush).toHaveBeenCalledWith('/categories/decorating?sort=price_asc');
    });
  });

  // =========================================================================
  // 3. STRESS TEST: Importer Batch Async Safety
  // =========================================================================
  describe('3. Importer Batch Ingestion Async Safety & Persistence', () => {
    it('executes parseAndValidateCatalogCsv(sampleCsv, false) with await and verifies DB commitment', async () => {
      const db = getDb();
      await db.reset();

      const csv = getBaselineCatalogCsvText();

      // Execute with dryRun = false using await
      const report = await parseAndValidateCatalogCsv(csv, false);

      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
      expect(report.failed_rows).toBe(0);
      expect(report.dry_run).toBe(false);

      // Verify all products were committed to the DB store upon resolution
      const allDbProducts = await db.products.getAll();
      expect(allDbProducts.length).toBeGreaterThanOrEqual(115);

      // Verify specific product and wholesale offer in DB
      const sampleSku = 'IONSDRIVERS4P10';
      const dbProduct = await db.products.getBySupplierSku(sampleSku);
      expect(dbProduct).toBeDefined();
      expect(dbProduct?.supplier_sku).toBe(sampleSku);

      const wholesaleOffer = await db.products.getWholesaleOffer(sampleSku);
      expect(wholesaleOffer).toBeDefined();
      expect(wholesaleOffer?.unit_cost_ex_vat_gbp).toBeGreaterThan(0);
    });

    it('synchronous callers receive report properties immediately without error', () => {
      const csv = getBaselineCatalogCsvText();

      // Non-awaited invocation with dryRun = false
      const reportSync = parseAndValidateCatalogCsv(csv, false);

      // Synchronous property access
      expect(reportSync.total_rows).toBe(115);
      expect(reportSync.passed_rows).toBe(115);
      expect(reportSync.failed_rows).toBe(0);
      expect(reportSync.dry_run).toBe(false);
      expect(typeof (reportSync as any).then).toBe('function');
    });

    it('asynchronously awaits dryRun = true and ensures dryRun report without side-effect DB insertions', async () => {
      const csv = getBaselineCatalogCsvText();

      const reportSync = parseAndValidateCatalogCsv(csv, true);
      expect(typeof reportSync.then).toBe('function');

      const report = await reportSync;
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
      expect(report.dry_run).toBe(true);
    });

    it('handles mixed valid and invalid rows during dryRun=false without promise rejection', async () => {
      const mixedCsv = `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified
Status International (UK) Ltd,2026-10-09,NO,1,VALIDTEST1,Valid Test Screwdriver,5022822224834,05022822228559,1.50,10,15.00,1,10,UNVERIFIED,UNVERIFIED,UNVERIFIED,UNVERIFIED
Status International (UK) Ltd,2026-10-09,NO,1,INVALIDTEST2,Invalid Math Screwdriver,5022822224919,05022822228627,1.00,10,999.00,1,10,UNVERIFIED,UNVERIFIED,UNVERIFIED,UNVERIFIED`;

      const report = await parseAndValidateCatalogCsv(mixedCsv, false);
      expect(report.total_rows).toBe(2);
      expect(report.passed_rows).toBe(1);
      expect(report.failed_rows).toBe(1);

      const db = getDb();
      const validProduct = await db.products.getBySupplierSku('VALIDTEST1');
      expect(validProduct).toBeDefined();

      const invalidProduct = await db.products.getBySupplierSku('INVALIDTEST2');
      expect(invalidProduct).toBeNull();
    });
  });

  // =========================================================================
  // 4. STRESS TEST: Admin Dashboard Audit Log Null Safety
  // =========================================================================
  describe('4. Admin Dashboard Audit Log Null Safety', () => {
    it('renders AdminDashboardPage when orders have audit_logs: null, undefined, or empty', async () => {
      const db = getDb();
      await db.reset();

      // Clear existing orders and populate with adversarial audit_logs values
      const ordersRepo = db.orders;
      const initialOrdersList = await ordersRepo.getAll();
      for (const o of initialOrdersList) {
        // Manipulate existing orders directly in the repository map
        (o as any).audit_logs = null;
      }

      // Add specific adversarial orders
      const defaultAddress = {
        full_name: 'Test Customer',
        address_line_1: '123 High Street',
        city: 'London',
        postcode: 'SW1A 1AA',
        country: 'GB',
      };

      const adversarialOrders: OrderRecord[] = [
        {
          id: 'ord_null_logs',
          order_number: 'TC-NULL',
          customer_email: 'test@example.co.uk',
          state: 'checkout_authorized',
          supplier_id: 'status-uk',
          items: [],
          shipping_address: defaultAddress,
          subtotal_ex_vat_gbp: 50,
          subtotal_inc_vat_gbp: 60,
          shipping_ex_vat_gbp: 0,
          shipping_inc_vat_gbp: 0,
          vat_amount_gbp: 10,
          total_inc_vat_gbp: 60,
          audit_logs: null as any,
          created_at: '2026-10-14T10:00:00Z',
          updated_at: '2026-10-14T10:00:00Z',
        },
        {
          id: 'ord_undef_logs',
          order_number: 'TC-UNDEF',
          customer_email: 'test@example.co.uk',
          state: 'supplier_order_pending',
          supplier_id: 'status-uk',
          items: [],
          shipping_address: defaultAddress,
          subtotal_ex_vat_gbp: 100,
          subtotal_inc_vat_gbp: 120,
          shipping_ex_vat_gbp: 0,
          shipping_inc_vat_gbp: 0,
          vat_amount_gbp: 20,
          total_inc_vat_gbp: 120,
          audit_logs: undefined as any,
          created_at: '2026-10-14T11:00:00Z',
          updated_at: '2026-10-14T11:00:00Z',
        },
        {
          id: 'ord_empty_logs',
          order_number: 'TC-EMPTY',
          customer_email: 'test@example.co.uk',
          state: 'payment_captured',
          supplier_id: 'status-uk',
          items: [],
          shipping_address: defaultAddress,
          subtotal_ex_vat_gbp: 80,
          subtotal_inc_vat_gbp: 96,
          shipping_ex_vat_gbp: 0,
          shipping_inc_vat_gbp: 0,
          vat_amount_gbp: 16,
          total_inc_vat_gbp: 96,
          audit_logs: [],
          created_at: '2026-10-14T12:00:00Z',
          updated_at: '2026-10-14T12:00:00Z',
        },
        {
          id: 'ord_valid_logs',
          order_number: 'TC-VALID',
          customer_email: 'test@example.co.uk',
          state: 'delivered',
          supplier_id: 'status-uk',
          items: [],
          shipping_address: defaultAddress,
          subtotal_ex_vat_gbp: 150,
          subtotal_inc_vat_gbp: 180,
          shipping_ex_vat_gbp: 0,
          shipping_inc_vat_gbp: 0,
          vat_amount_gbp: 30,
          total_inc_vat_gbp: 180,
          audit_logs: [
            {
              id: 'log_valid_1',
              order_id: 'ord_valid_logs',
              from_state: 'dispatched',
              to_state: 'delivered',
              trigger: 'delivery_confirmed',
              actor: 'courier_webhook',
              created_at: '2026-10-14T13:00:00Z',
            },
          ],
          created_at: '2026-10-14T13:00:00Z',
          updated_at: '2026-10-14T13:00:00Z',
        },
      ];

      for (const order of adversarialOrders) {
        await ordersRepo.create(order);
      }

      // Render AdminDashboardPage
      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      expect(container).toBeDefined();
      expect(screen.getByText('Commerce Engine & Operations Dashboard')).toBeDefined();
      expect(screen.getByText('TC-VALID')).toBeDefined();
      expect(screen.getByText('delivery_confirmed')).toBeDefined();

      unmount();
    });

    it('renders cleanly when all orders have null audit_logs and allAuditLogs is empty', async () => {
      const db = getDb();
      await db.reset();

      const ordersRepo = db.orders;
      const initialOrdersList = await ordersRepo.getAll();
      for (const o of initialOrdersList) {
        (o as any).audit_logs = null;
      }

      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      expect(container).toBeDefined();
      expect(screen.getByText('Recent State Transitions Feed')).toBeDefined();
      unmount();
    });
  });
});
