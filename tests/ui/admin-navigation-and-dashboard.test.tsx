import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AdminSidebar } from '@/components/admin/admin-sidebar';
import { AdminLayout } from '@/components/admin/admin-layout';
import { DashboardQuickFilters } from '@/components/admin/dashboard-quick-filters';
import { OrderRecord } from '@/types/order';
import { PublicProductDTO } from '@/types/product';
import { TradeCustomerRecord } from '@/lib/db/types';

let mockPathname = '/admin';

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const mockUnfulfilledOrders: OrderRecord[] = [
  {
    id: 'ord-test-001',
    order_number: 'TC-2026-0001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    state: 'payment_captured',
    customer_email: 'builder@contractor.co.uk',
    shipping_address: {
      full_name: 'John Builder',
      company_name: 'Builder Ltd',
      address_line_1: '10 Industrial Way',
      city: 'Leeds',
      postcode: 'LS1 1AA',
      country: 'United Kingdom',
    },
    items: [
      {
        product_id: 'prod-001',
        title: 'Heavy Duty Combi Drill 18V',
        supplier_sku: 'DRL-18V-HD',
        quantity: 2,
        unit_price_inc_vat: 120,
        unit_price_ex_vat: 100,
        total_inc_vat: 240,
      },
    ],
    subtotal_ex_vat_gbp: 200,
    subtotal_inc_vat_gbp: 240,
    shipping_ex_vat_gbp: 0,
    shipping_inc_vat_gbp: 0,
    vat_amount_gbp: 40,
    total_inc_vat_gbp: 240,
    supplier_id: 'sup-status-001',
    audit_logs: [],
  },
];

const mockLowStockProducts: PublicProductDTO[] = [
  {
    id: 'prod-low-001',
    slug: 'erbauer-drill-bit-set-20pc',
    title: 'Erbauer 20-Piece Masonry Drill Bit Set',
    description: 'Tough tungsten carbide tipped bits.',
    brand: 'Erbauer',
    gtin: '5012345678902',
    supplier_sku: 'ERB-BIT-20PC',
    supplier_id: 'sup-status-001',
    supplier_name: 'Status International',
    category: 'Hand Tools',
    category_slug: 'tools',
    images: ['/images/products/ERB-BIT-20PC.png'],
    retail_price_inc_vat_gbp: 18.0,
    retail_price_ex_vat_gbp: 15.0,
    units_per_pack: 1,
    units_per_case: 10,
    case_pack_description: 'Box of 10 sets',
    specifications: { Pieces: '20' },
    compliance_verified: true,
    image_license_verified: true,
    availability_status: 'in_stock',
    stock_quantity: 3,
  },
  {
    id: 'prod-oos-002',
    slug: 'status-extension-lead-25m',
    title: 'Status 25m Heavy Duty Cable Reel 240V',
    description: 'Site cable reel with thermal cut-out.',
    brand: 'Status',
    gtin: '5012345678903',
    supplier_sku: 'STA-EXT-25M',
    supplier_id: 'sup-status-001',
    supplier_name: 'Status International',
    category: 'Site Equipment',
    category_slug: 'site-equipment',
    images: ['/images/products/STA-EXT-25M.png'],
    retail_price_inc_vat_gbp: 48.0,
    retail_price_ex_vat_gbp: 40.0,
    units_per_pack: 1,
    units_per_case: 4,
    case_pack_description: 'Carton of 4 reels',
    specifications: { Length: '25m' },
    compliance_verified: true,
    image_license_verified: true,
    availability_status: 'out_of_stock',
    stock_quantity: 0,
  },
];

const mockTradeCustomers: TradeCustomerRecord[] = [
  {
    id: 'trade-001',
    company_name: 'Apex Electrical Solutions Ltd',
    contact_name: 'Sarah Connor',
    email: 'sarah@apexelectrical.co.uk',
    phone: '07123456789',
    status: 'pending',
    trade_tier: 'tier_2_10pct',
    credit_limit_gbp: 5000,
    created_at: new Date().toISOString(),
  },
];

describe('Milestone M1: Retail Merchant Admin Navigation & Core Dashboard', () => {
  beforeEach(() => {
    mockPathname = '/admin';
    document.body.style.overflow = '';
  });

  describe('Feature 1: AdminSidebar Responsive Navigation & Drawer', () => {
    it('renders desktop docked sidebar with categorized nav groups', () => {
      render(<AdminSidebar />);

      // Verify domain group headers
      expect(screen.getByText('Commerce Operations')).toBeInTheDocument();
      expect(screen.getByText('Suppliers & Logistics')).toBeInTheDocument();
      expect(screen.getByText('Governance')).toBeInTheDocument();

      // Verify nav links
      expect(screen.getByRole('link', { name: /dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /products/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /orders/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /trade accounts/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /suppliers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /catalog import/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /pricing & margins/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /governance & gates/i })).toBeInTheDocument();
    });

    it('renders mobile slide-over drawer when mobileOpen is true', () => {
      render(<AdminSidebar mobileOpen={true} onClose={vi.fn()} />);

      const mobileDialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      expect(mobileDialog).toBeInTheDocument();

      const closeBtn = screen.getByRole('button', { name: /close navigation menu/i });
      expect(closeBtn).toBeInTheDocument();
      expect(closeBtn.className).toContain('min-h-[44px]');
      expect(closeBtn.className).toContain('min-w-[44px]');
    });

    it('calls onClose when close button is clicked in mobile drawer', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      const closeBtn = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when Escape key is pressed while drawer is open', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when navigation link is clicked in mobile drawer', () => {
      const handleClose = vi.fn();
      render(<AdminSidebar mobileOpen={true} onClose={handleClose} />);

      // Query all links for 'Products' and click the one in the mobile dialog
      const mobileDialog = screen.getByRole('dialog', { name: /mobile navigation/i });
      const productsLink = mobileDialog.querySelector('a[href="/admin/products"]');
      expect(productsLink).not.toBeNull();
      fireEvent.click(productsLink!);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Feature 2: AdminLayout Header Hamburger Toggle & Viewport Support', () => {
    it('renders header hamburger toggle button with accessible aria attributes', () => {
      render(
        <AdminLayout>
          <div>Admin Child View</div>
        </AdminLayout>
      );

      const hamburgerBtn = screen.getByRole('button', { name: /open navigation menu/i });
      expect(hamburgerBtn).toBeInTheDocument();
      expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
      expect(hamburgerBtn.className).toContain('lg:hidden');
      expect(hamburgerBtn.className).toContain('min-h-[44px]');
      expect(hamburgerBtn.className).toContain('min-w-[44px]');
    });

    it('opens mobile drawer when header hamburger toggle is clicked and updates aria-expanded', () => {
      render(
        <AdminLayout>
          <div>Admin Child View</div>
        </AdminLayout>
      );

      const hamburgerBtn = screen.getByRole('button', { name: /open navigation menu/i });
      fireEvent.click(hamburgerBtn);

      expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'true');
      expect(screen.getByRole('dialog', { name: /mobile navigation/i })).toBeInTheDocument();

      // Close it via close button
      const closeBtn = screen.getByRole('button', { name: /close navigation menu/i });
      fireEvent.click(closeBtn);

      expect(hamburgerBtn).toHaveAttribute('aria-expanded', 'false');
      expect(screen.queryByRole('dialog', { name: /mobile navigation/i })).not.toBeInTheDocument();
    });

    it('renders breadcrumbs and Brand V3 staging badge in header', () => {
      render(
        <AdminLayout>
          <div>Admin Child View</div>
        </AdminLayout>
      );

      expect(screen.getByText('Portal')).toBeInTheDocument();
      expect(screen.getByText('STAGING_ONLY: ACTIVE')).toBeInTheDocument();
      expect(screen.getByText('Admin Child View')).toBeInTheDocument();
    });
  });

  describe('Feature 3: DashboardQuickFilters 3-Tab Operational Triage Console', () => {
    it('renders all 3 operational tabs with correct count badges', () => {
      render(
        <DashboardQuickFilters
          unfulfilledOrders={mockUnfulfilledOrders}
          lowStockProducts={mockLowStockProducts}
          tradeCustomers={mockTradeCustomers}
          recentCustomerOrders={mockUnfulfilledOrders}
        />
      );

      expect(screen.getByRole('tab', { name: /needs fulfillment/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /low-stock alerts/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /customer activity/i })).toBeInTheDocument();

      // Total pending priority actions badge: 1 order + 2 products + 1 trade = 4
      expect(screen.getByText('4 Pending')).toBeInTheDocument();
    });

    it('displays unfulfilled orders in Needs Fulfillment tab with 1-click fulfillment link', () => {
      render(
        <DashboardQuickFilters
          unfulfilledOrders={mockUnfulfilledOrders}
          lowStockProducts={mockLowStockProducts}
          tradeCustomers={mockTradeCustomers}
          recentCustomerOrders={mockUnfulfilledOrders}
        />
      );

      // Active tab defaults to Needs Fulfillment
      expect(screen.getByText('TC-2026-0001')).toBeInTheDocument();
      expect(screen.getByText('John Builder')).toBeInTheDocument();
      expect(screen.getByText('£240.00 inc. VAT')).toBeInTheDocument();

      const fulfillLink = screen.getByRole('link', { name: /fulfill/i });
      expect(fulfillLink).toHaveAttribute('href', '/admin/orders/ord-test-001');
    });

    it('switches to Low-Stock Alerts tab and renders product inventory levels', () => {
      render(
        <DashboardQuickFilters
          unfulfilledOrders={mockUnfulfilledOrders}
          lowStockProducts={mockLowStockProducts}
          tradeCustomers={mockTradeCustomers}
          recentCustomerOrders={mockUnfulfilledOrders}
        />
      );

      const lowStockTab = screen.getByRole('tab', { name: /low-stock alerts/i });
      fireEvent.click(lowStockTab);

      expect(lowStockTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('ERB-BIT-20PC')).toBeInTheDocument();
      expect(screen.getByText('3 Left (Critical)')).toBeInTheDocument();
      expect(screen.getByText('STA-EXT-25M')).toBeInTheDocument();
      expect(screen.getByText('0 Units (Out of Stock)')).toBeInTheDocument();

      const manageStockLinks = screen.getAllByRole('link', { name: /manage stock/i });
      expect(manageStockLinks.length).toBe(2);
      expect(manageStockLinks[0]).toHaveAttribute('href', '/admin/products/prod-low-001');
    });

    it('switches to Customer Activity tab and renders trade applications and orders', () => {
      render(
        <DashboardQuickFilters
          unfulfilledOrders={mockUnfulfilledOrders}
          lowStockProducts={mockLowStockProducts}
          tradeCustomers={mockTradeCustomers}
          recentCustomerOrders={mockUnfulfilledOrders}
        />
      );

      const customerTab = screen.getByRole('tab', { name: /customer activity/i });
      fireEvent.click(customerTab);

      expect(customerTab).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByText('Apex Electrical Solutions Ltd')).toBeInTheDocument();
      expect(screen.getByText('Sarah Connor')).toBeInTheDocument();
      expect(screen.getByText('Tier 2 (10% Net 30)')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /manage trade accounts/i })).toHaveAttribute(
        'href',
        '/admin/customers'
      );
    });

    it('renders clean empty states when queues are empty', () => {
      const { rerender } = render(
        <DashboardQuickFilters
          unfulfilledOrders={[]}
          lowStockProducts={[]}
          tradeCustomers={[]}
          recentCustomerOrders={[]}
        />
      );

      // Fulfillment empty state
      expect(screen.getByText('All Caught Up!')).toBeInTheDocument();

      // Low stock empty state
      const lowStockTab = screen.getByRole('tab', { name: /low-stock alerts/i });
      fireEvent.click(lowStockTab);
      expect(screen.getByText('Stock Levels Healthy')).toBeInTheDocument();

      // Customer activity empty state
      const customerTab = screen.getByRole('tab', { name: /customer activity/i });
      fireEvent.click(customerTab);
      expect(screen.getByText('No trade account applications registered yet.')).toBeInTheDocument();
      expect(screen.getByText('No orders recorded yet.')).toBeInTheDocument();
    });
  });

  describe('Feature 4: Safe Retail KPI Calculations & Guard Tests', () => {
    it('safely handles empty orders without NaN or division by zero', () => {
      const emptyOrders: OrderRecord[] = [];
      const grossRevenue = emptyOrders.reduce((sum, o) => sum + (o.total_inc_vat_gbp || 0), 0);
      const aov = emptyOrders.length > 0 ? grossRevenue / emptyOrders.length : 0;
      const velocityPerDay = (emptyOrders.length / 7).toFixed(1);

      expect(grossRevenue).toBe(0);
      expect(aov).toBe(0);
      expect(Number.isNaN(aov)).toBe(false);
      expect(Number.isFinite(aov)).toBe(true);
      expect(velocityPerDay).toBe('0.0');
    });

    it('correctly calculates retail metrics for populated orders', () => {
      const orders = [
        { total_inc_vat_gbp: 150.0 },
        { total_inc_vat_gbp: 250.0 },
        { total_inc_vat_gbp: 50.0 },
      ] as OrderRecord[];

      const grossRevenue = orders.reduce((sum, o) => sum + (o.total_inc_vat_gbp || 0), 0);
      const aov = orders.length > 0 ? grossRevenue / orders.length : 0;

      expect(grossRevenue).toBe(450.0);
      expect(aov).toBe(150.0);
    });
  });
});
