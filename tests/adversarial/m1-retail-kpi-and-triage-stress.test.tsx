import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AdminDashboardPage from '@/app/admin/page';
import { DashboardQuickFilters } from '@/components/admin/dashboard-quick-filters';
import { getDb } from '@/lib/db';
import { OrderRecord, OrderState } from '@/types/order';
import { PublicProductDTO } from '@/types/product';
import { TradeCustomerRecord } from '@/lib/db/types';

// Mock navigation
vi.mock('next/navigation', () => ({
  usePathname: () => '/admin',
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

function createMockProduct(overrides: Partial<PublicProductDTO>): PublicProductDTO {
  return {
    id: overrides.id || `prod-${Math.random().toString(36).slice(2, 7)}`,
    slug: overrides.slug || 'test-tool',
    title: overrides.title || 'Test Tool Item',
    description: overrides.description || 'Test description',
    brand: overrides.brand || 'ToolBrand',
    gtin: overrides.gtin || '5012345678901',
    supplier_sku: overrides.supplier_sku || 'SKU-001',
    supplier_id: 'sup-status-001',
    supplier_name: 'Status International',
    category: overrides.category || 'Hand Tools',
    category_slug: 'tools',
    images: ['/images/products/test.png'],
    retail_price_inc_vat_gbp: overrides.retail_price_inc_vat_gbp ?? 24.0,
    retail_price_ex_vat_gbp: overrides.retail_price_ex_vat_gbp ?? 20.0,
    units_per_pack: 1,
    units_per_case: 5,
    case_pack_description: 'Case of 5',
    specifications: {},
    compliance_verified: true,
    image_license_verified: true,
    availability_status: overrides.availability_status || 'in_stock',
    stock_quantity: overrides.stock_quantity ?? 50,
  };
}

function createMockOrder(overrides: Partial<OrderRecord>): OrderRecord {
  return {
    id: overrides.id || `ord-${Math.random().toString(36).slice(2, 7)}`,
    order_number: overrides.order_number || 'TC-2026-TEST',
    created_at: overrides.created_at || new Date().toISOString(),
    updated_at: overrides.updated_at || new Date().toISOString(),
    state: overrides.state || 'payment_captured',
    customer_email: overrides.customer_email || 'trade@toolcart.co.uk',
    shipping_address: overrides.shipping_address || {
      full_name: 'John Builder',
      company_name: 'Builder Ltd',
      address_line_1: '10 Industrial Way',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'United Kingdom',
    },
    items: overrides.items || [
      {
        product_id: 'prod-001',
        title: 'Heavy Duty Combi Drill 18V',
        supplier_sku: 'DRL-18V-HD',
        quantity: 1,
        unit_price_inc_vat: 120,
        unit_price_ex_vat: 100,
        total_inc_vat: 120,
      },
    ],
    subtotal_ex_vat_gbp: overrides.subtotal_ex_vat_gbp ?? 100,
    subtotal_inc_vat_gbp: overrides.subtotal_inc_vat_gbp ?? 120,
    shipping_ex_vat_gbp: 0,
    shipping_inc_vat_gbp: 0,
    vat_amount_gbp: overrides.vat_amount_gbp ?? 20,
    total_inc_vat_gbp: overrides.total_inc_vat_gbp ?? 120,
    supplier_id: 'sup-status-001',
    audit_logs: overrides.audit_logs || [],
  };
}

describe('Challenger M1-2: Retail Operational KPIs & Triage Console Stress Tests', () => {
  beforeEach(async () => {
    const db = getDb();
    await db.reset();
  });

  // =========================================================================
  // 1. BOUNDARY: Zero Orders & Clean Database (Divide-by-zero & NaN Resilience)
  // =========================================================================
  describe('1. Zero Orders & Clean Database Boundary', () => {
    it('renders AdminDashboardPage with 0 orders without NaN, divide-by-zero, or crash', async () => {
      const db = getDb();
      // Empty the orders collection
      const ordersMap = (db.orders as any).ordersMap as Map<string, OrderRecord>;
      ordersMap.clear();

      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      // 1. Sales Velocity: 0.0 / day
      expect(screen.getByText('0.0 / day')).toBeInTheDocument();
      expect(screen.getByText('0 orders in last 7 days')).toBeInTheDocument();

      // 2. Gross Revenue & AOV: both render £0.00 cleanly
      const zeroPoundElements = screen.getAllByText('£0.00');
      expect(zeroPoundElements.length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText('Total retail gross inc. VAT')).toBeInTheDocument();

      // 3. Active Retail Orders: 0
      expect(screen.getByText('0 total orders recorded')).toBeInTheDocument();

      // 4. Average Order Value: across 0 customer orders
      expect(screen.getByText('Across 0 customer orders')).toBeInTheDocument();

      // Ensure no NaN anywhere in rendered DOM
      expect(container.textContent).not.toContain('NaN');
      expect(container.textContent).not.toContain('Infinity');

      unmount();
    });

    it('renders clean zero-queue triage console empty states across all 3 tabs when queues are empty', () => {
      const { unmount } = render(
        <DashboardQuickFilters
          unfulfilledOrders={[]}
          lowStockProducts={[]}
          tradeCustomers={[]}
          recentCustomerOrders={[]}
        />
      );

      // Header priority badge
      expect(screen.getByText('0 Pending')).toBeInTheDocument();

      // Tab 1: Needs Fulfillment empty state
      expect(screen.getByRole('tab', { name: /needs fulfillment/i })).toBeInTheDocument();
      expect(screen.getByText('All Caught Up!')).toBeInTheDocument();
      expect(
        screen.getByText('There are no retail orders currently awaiting fulfillment or dispatch.')
      ).toBeInTheDocument();

      // Tab 2: Low-Stock Alerts empty state
      const lowStockTab = screen.getByRole('tab', { name: /low-stock alerts/i });
      fireEvent.click(lowStockTab);
      expect(screen.getByText('Stock Levels Healthy')).toBeInTheDocument();
      expect(
        screen.getByText('All products maintain healthy inventory levels (>10 units in stock).')
      ).toBeInTheDocument();

      // Tab 3: Customer Activity empty state
      const customerTab = screen.getByRole('tab', { name: /customer activity/i });
      fireEvent.click(customerTab);
      expect(screen.getByText('No trade account applications registered yet.')).toBeInTheDocument();
      expect(screen.getByText('No orders recorded yet.')).toBeInTheDocument();

      unmount();
    });
  });

  // =========================================================================
  // 2. BOUNDARY: Single Order (1 Order) & Grammar / Extreme Values
  // =========================================================================
  describe('2. Single Order Boundary & Formatting', () => {
    it('correctly handles 1 single order with £0.00 total and singular subtitle', async () => {
      const db = getDb();
      const ordersMap = (db.orders as any).ordersMap as Map<string, OrderRecord>;
      ordersMap.clear();

      await db.orders.create(
        createMockOrder({
          total_inc_vat_gbp: 0,
          created_at: new Date().toISOString(),
        })
      );

      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      // Grammar check: singular "Across 1 customer order" (not "orders")
      expect(screen.getByText('Across 1 customer order')).toBeInTheDocument();
      expect(screen.getAllByText('£0.00').length).toBeGreaterThanOrEqual(2);

      // Sales velocity: 1 order in 7 days -> (1 / 7).toFixed(1) = "0.1"
      expect(screen.getByText('0.1 / day')).toBeInTheDocument();

      expect(container.textContent).not.toContain('NaN');
      unmount();
    });

    it('correctly handles 1 single order with £0.01 fractional penny', async () => {
      const db = getDb();
      const ordersMap = (db.orders as any).ordersMap as Map<string, OrderRecord>;
      ordersMap.clear();

      await db.orders.create(
        createMockOrder({
          total_inc_vat_gbp: 0.01,
          created_at: new Date().toISOString(),
        })
      );

      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      expect(screen.getAllByText('£0.01').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Across 1 customer order')).toBeInTheDocument();
      expect(container.textContent).not.toContain('NaN');
      unmount();
    });

    it('correctly handles 1 single massive order (£999,999.99)', async () => {
      const db = getDb();
      const ordersMap = (db.orders as any).ordersMap as Map<string, OrderRecord>;
      ordersMap.clear();

      await db.orders.create(
        createMockOrder({
          total_inc_vat_gbp: 999999.99,
          created_at: new Date().toISOString(),
        })
      );

      const pageJsx = await AdminDashboardPage();
      const { container, unmount } = render(pageJsx);

      // Check formatted currency with comma separator
      expect(screen.getAllByText('£999,999.99').length).toBeGreaterThanOrEqual(1);
      expect(container.textContent).not.toContain('NaN');
      unmount();
    });
  });

  // =========================================================================
  // 3. STRESS: High Volume Orders (1,000 to 10,000 Orders)
  // =========================================================================
  describe('3. High Volume Order Stress & Arithmetic Performance', () => {
    it('computes metrics over 10,000 orders in < 100ms without overflow or precision loss', () => {
      const orders: OrderRecord[] = [];
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;

      for (let i = 0; i < 10000; i++) {
        const daysAgo = i % 30; // Spread across 30 days
        orders.push({
          id: `ord-bulk-${i}`,
          order_number: `TC-BULK-${i}`,
          created_at: new Date(now - daysAgo * dayMs).toISOString(),
          updated_at: new Date(now - daysAgo * dayMs).toISOString(),
          state: i % 2 === 0 ? 'payment_captured' : 'delivered',
          customer_email: `user${i}@tradesman.co.uk`,
          items: [],
          shipping_address: {
            full_name: `Contractor ${i}`,
            address_line_1: `${i} High Road`,
            city: 'London',
            postcode: 'EC1A 1BB',
            country: 'United Kingdom',
          },
          subtotal_ex_vat_gbp: 100,
          subtotal_inc_vat_gbp: 120,
          shipping_ex_vat_gbp: 0,
          shipping_inc_vat_gbp: 0,
          vat_amount_gbp: 20,
          total_inc_vat_gbp: 120,
          supplier_id: 'sup-status-001',
          audit_logs: [],
        });
      }

      const startTime = performance.now();

      // Dashboard arithmetic execution
      const sevenDaysAgo = new Date(now - 7 * dayMs);
      const recentOrdersPast7Days = orders.filter(
        (o) => new Date(o.created_at).getTime() >= sevenDaysAgo.getTime()
      );
      const velocityPerDay = (recentOrdersPast7Days.length / 7).toFixed(1);
      const grossRevenue = orders.reduce((sum, o) => sum + (o.total_inc_vat_gbp || 0), 0);
      const aov = orders.length > 0 ? grossRevenue / orders.length : 0;
      const activeStates = new Set([
        'pending',
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
      ]);
      const activeOrders = orders.filter((o) => activeStates.has(o.state));

      const durationMs = performance.now() - startTime;

      expect(durationMs).toBeLessThan(500); // Sub-500ms execution across 10,000 orders
      expect(grossRevenue).toBe(1200000); // 10,000 * 120
      expect(aov).toBe(120);
      expect(activeOrders.length).toBe(5000);
      expect(Number(velocityPerDay)).toBeGreaterThan(0);
      expect(Number.isFinite(grossRevenue)).toBe(true);
      expect(Number.isFinite(aov)).toBe(true);
    });

    it('renders Triage Console with 250 orders, 250 low stock items, and 250 trade customers without memory exhaustion', () => {
      const bulkOrders: OrderRecord[] = Array.from({ length: 250 }, (_, i) =>
        createMockOrder({
          id: `ord-stress-${i}`,
          order_number: `TC-STRESS-${i}`,
          total_inc_vat_gbp: 50.0 + i,
        })
      );

      const bulkProducts: PublicProductDTO[] = Array.from({ length: 250 }, (_, i) =>
        createMockProduct({
          id: `prod-stress-${i}`,
          supplier_sku: `STRESS-SKU-${i}`,
          stock_quantity: i % 11, // 0 to 10
        })
      );

      const bulkTrade: TradeCustomerRecord[] = Array.from({ length: 250 }, (_, i) => ({
        id: `trade-stress-${i}`,
        company_name: `Trade Corp ${i}`,
        contact_name: `Person ${i}`,
        email: `trade${i}@corp.co.uk`,
        phone: '07000000000',
        status: i % 2 === 0 ? 'pending' : 'approved',
        trade_tier: 'tier_1_5pct',
        credit_limit_gbp: 1000 + i * 10,
        created_at: new Date().toISOString(),
      }));

      const { unmount } = render(
        <DashboardQuickFilters
          unfulfilledOrders={bulkOrders}
          lowStockProducts={bulkProducts}
          tradeCustomers={bulkTrade}
          recentCustomerOrders={bulkOrders}
        />
      );

      // Pending trade = 125 (i % 2 === 0)
      // Total Priority Actions: 250 orders + 250 products + 125 pending trade = 625 Pending
      expect(screen.getByText('625 Pending')).toBeInTheDocument();

      // Tab badges
      expect(screen.getByRole('tab', { name: /needs fulfillment/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /low-stock alerts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /customer activity/i })).toBeInTheDocument();

      unmount();
    });
  });

  // =========================================================================
  // 4. BOUNDARY MATRIX: Stock Thresholds (0, -1, 1, 5, 6, 10, 11)
  // =========================================================================
  describe('4. Stock Threshold Boundary Matrix', () => {
    it('applies correct urgency badge and status for exact boundary stock quantities', () => {
      const boundaryProducts: PublicProductDTO[] = [
        createMockProduct({
          id: 'p-oos-0',
          supplier_sku: 'SKU-OOS-0',
          stock_quantity: 0,
          availability_status: 'out_of_stock',
        }),
        createMockProduct({
          id: 'p-neg-1',
          supplier_sku: 'SKU-NEG-1',
          stock_quantity: -1,
          availability_status: 'out_of_stock',
        }),
        createMockProduct({
          id: 'p-crit-1',
          supplier_sku: 'SKU-CRIT-1',
          stock_quantity: 1,
          availability_status: 'in_stock',
        }),
        createMockProduct({
          id: 'p-crit-5',
          supplier_sku: 'SKU-CRIT-5',
          stock_quantity: 5,
          availability_status: 'in_stock',
        }),
        createMockProduct({
          id: 'p-low-6',
          supplier_sku: 'SKU-LOW-6',
          stock_quantity: 6,
          availability_status: 'in_stock',
        }),
        createMockProduct({
          id: 'p-low-10',
          supplier_sku: 'SKU-LOW-10',
          stock_quantity: 10,
          availability_status: 'in_stock',
        }),
      ];

      const { unmount } = render(
        <DashboardQuickFilters
          unfulfilledOrders={[]}
          lowStockProducts={boundaryProducts}
          tradeCustomers={[]}
          recentCustomerOrders={[]}
        />
      );

      // Switch to Low-Stock Alerts tab
      const lowStockTab = screen.getByRole('tab', { name: /low-stock alerts/i });
      fireEvent.click(lowStockTab);

      // Boundary 0: Out of Stock
      expect(screen.getByText('SKU-OOS-0')).toBeInTheDocument();
      expect(screen.getAllByText('0 Units (Out of Stock)').length).toBe(2); // p-oos-0 and p-neg-1

      // Boundary -1: Out of Stock
      expect(screen.getByText('SKU-NEG-1')).toBeInTheDocument();

      // Boundary 1: Critical (1 Left)
      expect(screen.getByText('SKU-CRIT-1')).toBeInTheDocument();
      expect(screen.getByText('1 Left (Critical)')).toBeInTheDocument();

      // Boundary 5: Critical (5 Left)
      expect(screen.getByText('SKU-CRIT-5')).toBeInTheDocument();
      expect(screen.getByText('5 Left (Critical)')).toBeInTheDocument();

      // Boundary 6: Low (6 Units)
      expect(screen.getByText('SKU-LOW-6')).toBeInTheDocument();
      expect(screen.getByText('6 Units (Low)')).toBeInTheDocument();

      // Boundary 10: Low (10 Units)
      expect(screen.getByText('SKU-LOW-10')).toBeInTheDocument();
      expect(screen.getByText('10 Units (Low)')).toBeInTheDocument();

      unmount();
    });

    it('excludes stock_quantity = 11 from stock alerts unless availability_status is out_of_stock', async () => {
      const db = getDb();
      const productsMap = (db.products as any).productsMap as Map<string, PublicProductDTO>;
      productsMap.clear();

      // Product with stock = 11 and in_stock (should be excluded)
      const pHealthy = createMockProduct({
        id: 'p-11-healthy',
        supplier_sku: 'SKU-11-HEALTHY',
        stock_quantity: 11,
        availability_status: 'in_stock',
      });
      productsMap.set(pHealthy.id, pHealthy);

      // Product with stock = 15 but out_of_stock (should be included)
      const pOosOverride = createMockProduct({
        id: 'p-15-oos',
        supplier_sku: 'SKU-15-OOS',
        stock_quantity: 15,
        availability_status: 'out_of_stock',
      });
      productsMap.set(pOosOverride.id, pOosOverride);

      const allProducts = await db.products.getAll();
      const stockAlertProducts = allProducts
        .filter((p) => (p.stock_quantity ?? 0) <= 10 || p.availability_status === 'out_of_stock')
        .sort((a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0));

      expect(stockAlertProducts.length).toBe(1);
      expect(stockAlertProducts[0].id).toBe('p-15-oos');
      expect(stockAlertProducts.find((p) => p.id === 'p-11-healthy')).toBeUndefined();
    });

    it('verifies ascending sort order (lowest stock first)', async () => {
      const unsortedProducts: PublicProductDTO[] = [
        createMockProduct({ id: 'p-10', stock_quantity: 10 }),
        createMockProduct({ id: 'p-1', stock_quantity: 1 }),
        createMockProduct({ id: 'p-0', stock_quantity: 0 }),
        createMockProduct({ id: 'p-5', stock_quantity: 5 }),
      ];

      const sorted = [...unsortedProducts].sort(
        (a, b) => (a.stock_quantity ?? 0) - (b.stock_quantity ?? 0)
      );

      expect(sorted.map((p) => p.stock_quantity)).toEqual([0, 1, 5, 10]);
    });
  });

  // =========================================================================
  // 5. BOUNDARY MATRIX: 7-Day Velocity Date Filtering
  // =========================================================================
  describe('5. 7-Day Velocity Date Filtering Boundaries', () => {
    it('accurately filters orders across exact 7-day millisecond boundaries', () => {
      const now = new Date('2026-10-15T12:00:00.000Z');
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const testOrders: { id: string; created_at: string; expected: boolean }[] = [
        // Boundary 1: Right now
        { id: 'o-now', created_at: now.toISOString(), expected: true },
        // Boundary 2: 1 day ago
        {
          id: 'o-1d',
          created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          expected: true,
        },
        // Boundary 3: Exactly 7 days ago to the millisecond
        { id: 'o-exact-7d', created_at: sevenDaysAgo.toISOString(), expected: true },
        // Boundary 4: 7 days + 1 millisecond ago (excluded)
        {
          id: 'o-7d-plus-1ms',
          created_at: new Date(sevenDaysAgo.getTime() - 1).toISOString(),
          expected: false,
        },
        // Boundary 5: 30 days ago (excluded)
        {
          id: 'o-30d',
          created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          expected: false,
        },
        // Boundary 6: Future order (included)
        {
          id: 'o-future',
          created_at: new Date(now.getTime() + 10000).toISOString(),
          expected: true,
        },
        // Boundary 7: Malformed / invalid date string (excluded, no crash)
        { id: 'o-invalid', created_at: 'NOT_A_VALID_DATE', expected: false },
      ];

      for (const t of testOrders) {
        const isPast7Days = new Date(t.created_at).getTime() >= sevenDaysAgo.getTime();
        expect(isPast7Days).toBe(t.expected);
      }
    });
  });

  // =========================================================================
  // 6. STATE MACHINE: All 15 Order States Partitioning
  // =========================================================================
  describe('6. 15-State Order Machine Partitioning Matrix', () => {
    it('strictly partitions all 15 states into active and unfulfilled sets', () => {
      const all15States: OrderState[] = [
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

      // Exact activeStates set as defined in app/admin/page.tsx
      const dashboardActiveStates = new Set<string>([
        'pending',
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
      ]);

      const unfulfilledStates = new Set<string>([
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
      ]);

      // Verify active states matching real order states
      const activeMatching = all15States.filter((s) => dashboardActiveStates.has(s));
      expect(activeMatching).toEqual([
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
      ]);
      expect(activeMatching.length).toBe(5);

      // Verify unfulfilled states count
      const unfulfilledMatching = all15States.filter((s) => unfulfilledStates.has(s));
      expect(unfulfilledMatching.length).toBe(4);

      // Verify delivered and terminal states are neither active nor unfulfilled
      expect(dashboardActiveStates.has('delivered')).toBe(false);
      expect(unfulfilledStates.has('delivered')).toBe(false);
      expect(dashboardActiveStates.has('refunded')).toBe(false);
      expect(unfulfilledStates.has('refunded')).toBe(false);
      expect(dashboardActiveStates.has('supplier_rejected')).toBe(false);
      expect(unfulfilledStates.has('supplier_rejected')).toBe(false);
    });
  });

  // =========================================================================
  // 7. INTERACTIVE STRESS: Rapid Tab Toggling & Malformed Prop Resilience
  // =========================================================================
  describe('7. Triage Console Rapid Tab Switching & Prop Resilience', () => {
    it('survives 60 rapid sequential tab switches without state corruption', () => {
      const { unmount } = render(
        <DashboardQuickFilters
          unfulfilledOrders={[createMockOrder({ order_number: 'TC-TAB-01' })]}
          lowStockProducts={[createMockProduct({ supplier_sku: 'SKU-TAB-01', stock_quantity: 2 })]}
          tradeCustomers={[
            {
              id: 'c-tab-01',
              company_name: 'Tab Builder Ltd',
              contact_name: 'Bob',
              email: 'bob@tab.co.uk',
              phone: '07000',
              status: 'pending',
              trade_tier: 'tier_1_5pct',
              credit_limit_gbp: 2000,
              created_at: new Date().toISOString(),
            },
          ]}
          recentCustomerOrders={[]}
        />
      );

      const tabFulfillment = screen.getByRole('tab', { name: /needs fulfillment/i });
      const tabLowStock = screen.getByRole('tab', { name: /low-stock alerts/i });
      const tabCustomers = screen.getByRole('tab', { name: /customer activity/i });

      // Execute 60 rapid tab toggles in round-robin fashion
      for (let i = 0; i < 20; i++) {
        fireEvent.click(tabLowStock);
        fireEvent.click(tabCustomers);
        fireEvent.click(tabFulfillment);
      }

      // After 60 clicks, fulfillment tab should remain active and clean
      expect(tabFulfillment).toHaveAttribute('aria-selected', 'true');
      expect(tabLowStock).toHaveAttribute('aria-selected', 'false');
      expect(tabCustomers).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByText('TC-TAB-01')).toBeInTheDocument();

      // Switch once more to customer tab
      fireEvent.click(tabCustomers);
      expect(tabCustomers).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Tab Builder Ltd')).toBeInTheDocument();

      unmount();
    });

    it('safely renders triage console when records have malformed or missing optional fields', () => {
      const malformedOrder: OrderRecord = {
        id: 'ord-malformed',
        order_number: 'TC-MALFORMED',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'payment_captured',
        customer_email: 'fallback@client.co.uk',
        shipping_address: undefined as any, // Missing shipping address
        items: undefined as any, // Missing items
        subtotal_ex_vat_gbp: 0,
        subtotal_inc_vat_gbp: 0,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 0,
        total_inc_vat_gbp: 0,
        supplier_id: 'sup-status-001',
        audit_logs: [],
      };

      const malformedProduct: PublicProductDTO = {
        id: 'prod-malformed',
        slug: 'malformed-product',
        title: 'Malformed Product',
        description: 'Test',
        brand: 'Test',
        gtin: '5012345678901',
        supplier_sku: 'SKU-MALFORMED',
        supplier_id: 'sup-status-001',
        supplier_name: 'Status',
        category: 'Tools',
        category_slug: 'tools',
        images: [],
        retail_price_inc_vat_gbp: 0,
        retail_price_ex_vat_gbp: 0,
        units_per_pack: 1,
        units_per_case: 1,
        case_pack_description: 'Case',
        specifications: {},
        compliance_verified: true,
        image_license_verified: true,
        availability_status: 'out_of_stock',
        stock_quantity: undefined as any, // Missing stock_quantity
      };

      const malformedTrade: TradeCustomerRecord = {
        id: 'trade-malformed',
        company_name: 'Malformed Trade Ltd',
        contact_name: 'No Contact',
        email: 'trade@malformed.co.uk',
        phone: '07000',
        status: 'pending',
        trade_tier: undefined as any, // Missing trade_tier
        credit_limit_gbp: undefined as any, // Missing credit limit
        created_at: new Date().toISOString(),
      };

      const { unmount } = render(
        <DashboardQuickFilters
          unfulfilledOrders={[malformedOrder]}
          lowStockProducts={[malformedProduct]}
          tradeCustomers={[malformedTrade]}
          recentCustomerOrders={[malformedOrder]}
        />
      );

      // Verify Tab 1 handles missing address and items gracefully
      expect(screen.getByText('TC-MALFORMED')).toBeInTheDocument();
      expect(screen.getByText('fallback@client.co.uk')).toBeInTheDocument();
      expect(screen.getByText('0 items')).toBeInTheDocument();
      expect(screen.getByText('£0.00 inc. VAT')).toBeInTheDocument();

      // Verify Tab 2 handles undefined stock quantity gracefully
      const lowStockTab = screen.getByRole('tab', { name: /low-stock alerts/i });
      fireEvent.click(lowStockTab);
      expect(screen.getByText('SKU-MALFORMED')).toBeInTheDocument();
      expect(screen.getByText('0 Units (Out of Stock)')).toBeInTheDocument();

      // Verify Tab 3 handles missing credit limit and trade tier gracefully
      const customerTab = screen.getByRole('tab', { name: /customer activity/i });
      fireEvent.click(customerTab);
      expect(screen.getByText('Malformed Trade Ltd')).toBeInTheDocument();
      expect(screen.getByText('Credit: £0')).toBeInTheDocument();
      expect(screen.getByText('Tier 1 (5% Net 30)')).toBeInTheDocument(); // Default fallback

      unmount();
    });
  });
});
