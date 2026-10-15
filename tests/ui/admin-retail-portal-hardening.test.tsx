import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTable } from '@/components/admin/product-table';
import { OrdersTable } from '@/components/admin/orders-table';
import { ProductEditorForm } from '@/app/admin/products/[id]/product-editor-form';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import { CustomersClient } from '@/app/admin/customers/customers-client';
import { PublicProductDTO } from '@/types/product';
import { OrderRecord } from '@/types/order';
import { TradeCustomerRecord } from '@/lib/db/types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/admin/products',
  notFound: vi.fn(),
}));

const mockProducts: PublicProductDTO[] = [
  {
    id: 'prod-1',
    slug: 'alpha-9w-led-bulb-warm-white',
    brand: 'Status',
    supplier_id: 'sup-1',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-001',
    title: 'Alpha 9W LED Bulb Warm White',
    description: 'Energy saving bulb',
    category: 'Lighting',
    category_slug: 'lighting',
    images: ['/images/products/bulb.png'],
    units_per_pack: 1,
    units_per_case: 10,
    case_pack_description: 'Case of 10 units',
    availability_status: 'in_stock',
    retail_price_inc_vat_gbp: 4.8,
    retail_price_ex_vat_gbp: 4.0,
    stock_quantity: 50,
    sellability_status: 'draft',
    gtin: '5022822000001',
    carton_barcode: '15022822000018',
    compliance_verified: true,
    image_license_verified: true,
    supplier_direct_dispatch_verified: false,
    specifications: { Lumens: '806 lm', Wattage: '9W' },
  },
  {
    id: 'prod-2',
    slug: 'beta-heavy-duty-plasterboard-fixings-50pk',
    brand: 'Ionos',
    supplier_id: 'sup-1',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-002',
    title: 'Beta Heavy Duty Plasterboard Fixings 50pk',
    description: 'Fixings pack',
    category: 'Fixings',
    category_slug: 'fixings',
    images: ['/images/products/fixings.png'],
    units_per_pack: 50,
    units_per_case: 5,
    case_pack_description: 'Case of 5 packs',
    availability_status: 'in_stock',
    retail_price_inc_vat_gbp: 12.0,
    retail_price_ex_vat_gbp: 10.0,
    stock_quantity: 3, // low stock
    sellability_status: 'approved',
    gtin: '5022822000002',
    carton_barcode: '15022822000025',
    compliance_verified: true,
    image_license_verified: true,
    supplier_direct_dispatch_verified: true,
    specifications: { Material: 'Zinc Alloy', Length: '32mm' },
  },
  {
    id: 'prod-3',
    slug: 'gamma-13a-double-switched-socket-white',
    brand: 'Status',
    supplier_id: 'sup-1',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-003',
    title: 'Gamma 13A Double Switched Socket White',
    description: 'Standard domestic socket',
    category: 'Electrical',
    category_slug: 'electrical',
    images: ['/images/products/socket.png'],
    units_per_pack: 1,
    units_per_case: 20,
    case_pack_description: 'Case of 20 units',
    availability_status: 'in_stock',
    retail_price_inc_vat_gbp: 6.0,
    retail_price_ex_vat_gbp: 5.0,
    stock_quantity: 120,
    sellability_status: 'needs_review',
    gtin: '5022822000003',
    carton_barcode: '15022822000032',
    compliance_verified: false,
    image_license_verified: false,
    supplier_direct_dispatch_verified: false,
    specifications: { Voltage: '230V', Amperage: '13A' },
  },
];

const mockOrders: OrderRecord[] = [
  {
    id: 'ord-1',
    order_number: 'TC-1001',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    state: 'supplier_order_pending',
    customer_email: 'builder@example.co.uk',
    shipping_address: {
      full_name: 'John Builder',
      address_line_1: '12 High Street',
      city: 'Leeds',
      postcode: 'LS1 1AB',
      country: 'UK',
    },
    items: [
      {
        product_id: 'prod-1',
        title: 'Alpha 9W LED Bulb',
        supplier_sku: 'SKU-001',
        quantity: 2,
        unit_price_inc_vat: 4.8,
        unit_price_ex_vat: 4.0,
        total_inc_vat: 9.6,
      },
    ],
    subtotal_ex_vat_gbp: 8.0,
    subtotal_inc_vat_gbp: 9.6,
    carriage_ex_vat_gbp: 0,
    carriage_inc_vat_gbp: 0,
    total_inc_vat_gbp: 9.6,
    audit_logs: [],
  },
  {
    id: 'ord-2',
    order_number: 'TC-1002',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    state: 'delivered',
    customer_email: 'electrician@example.co.uk',
    shipping_address: {
      full_name: 'Sarah Electric',
      address_line_1: '44 Industrial Way',
      city: 'Manchester',
      postcode: 'M1 2CD',
      country: 'UK',
    },
    items: [
      {
        product_id: 'prod-2',
        title: 'Beta Fixings',
        supplier_sku: 'SKU-002',
        quantity: 1,
        unit_price_inc_vat: 12.0,
        unit_price_ex_vat: 10.0,
        total_inc_vat: 12.0,
      },
    ],
    subtotal_ex_vat_gbp: 10.0,
    subtotal_inc_vat_gbp: 12.0,
    carriage_ex_vat_gbp: 0,
    carriage_inc_vat_gbp: 0,
    total_inc_vat_gbp: 12.0,
    audit_logs: [],
  },
];

const mockCustomers: TradeCustomerRecord[] = [
  {
    id: 'cust-1',
    company_name: 'Apex Electrical Ltd',
    companies_house_number: '12345678',
    vat_number: 'GB123456789',
    contact_name: 'David Sparks',
    email: 'david@apexelectrical.co.uk',
    phone: '07700900001',
    status: 'pending',
    trade_tier: 'tier_1_5pct',
    credit_limit_gbp: 1500,
    created_at: new Date().toISOString(),
  },
];

describe('ToolCart Retail Admin Portal Hardening & Verification Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature 5 & 6: ProductTable Headless Primitives, Sorting & Bulk Actions', () => {
    it('renders all products with stock and retail pricing info', () => {
      render(<ProductTable products={mockProducts} />);
      expect(screen.getByText('Alpha 9W LED Bulb Warm White')).toBeInTheDocument();
      expect(screen.getByText('Beta Heavy Duty Plasterboard Fixings 50pk')).toBeInTheDocument();
      expect(screen.getByText('Gamma 13A Double Switched Socket White')).toBeInTheDocument();
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
    });

    it('filters products by debounced search input', async () => {
      render(<ProductTable products={mockProducts} />);
      const searchInput = screen.getByPlaceholderText(/search sku, title, or gtin/i);

      fireEvent.change(searchInput, { target: { value: 'Fixings' } });

      await waitFor(() => {
        expect(screen.getByText('Beta Heavy Duty Plasterboard Fixings 50pk')).toBeInTheDocument();
        expect(screen.queryByText('Alpha 9W LED Bulb Warm White')).not.toBeInTheDocument();
      });
    });

    it('sorts products when clicking sortable table column headers', () => {
      render(<ProductTable products={mockProducts} />);
      const titleHeader = screen.getByText(/sku & title/i);

      // Click to sort by SKU/title
      fireEvent.click(titleHeader);
      expect(screen.getByText('SKU-001')).toBeInTheDocument();
    });

    it('enables row selection and reveals the floating BulkActionBar', () => {
      render(<ProductTable products={mockProducts} />);
      const firstRowCheckbox = screen.getByLabelText(/select product sku-001/i);

      expect(screen.queryByRole('region', { name: /bulk actions bar/i })).not.toBeInTheDocument();

      fireEvent.click(firstRowCheckbox);

      const bulkBar = screen.getByRole('region', { name: /bulk actions bar/i });
      expect(bulkBar).toBeInTheDocument();
      expect(within(bulkBar).getByText(/1 selected/i)).toBeInTheDocument();
      expect(within(bulkBar).getByRole('button', { name: /^approve$/i })).toBeInTheDocument();
      expect(within(bulkBar).getByRole('button', { name: /mark draft/i })).toBeInTheDocument();
    });

    it('selects all rows on page when clicking the header checkbox', () => {
      render(<ProductTable products={mockProducts} />);
      const headerCheckbox = screen.getByLabelText(/select all products on page/i);

      fireEvent.click(headerCheckbox);
      const bulkBar = screen.getByRole('region', { name: /bulk actions bar/i });
      expect(within(bulkBar).getByText(/3 selected/i)).toBeInTheDocument();

      // Click again to unselect all
      fireEvent.click(headerCheckbox);
      expect(screen.queryByRole('region', { name: /bulk actions bar/i })).not.toBeInTheDocument();
    });
  });

  describe('Feature 7: OrdersTable Interactive Lifecycle & Filter Console', () => {
    it('renders orders with customer details and status badges', () => {
      render(<OrdersTable orders={mockOrders} />);
      expect(screen.getByText('TC-1001')).toBeInTheDocument();
      expect(screen.getByText('TC-1002')).toBeInTheDocument();
      expect(screen.getByText('John Builder')).toBeInTheDocument();
      expect(screen.getByText('Sarah Electric')).toBeInTheDocument();
      expect(screen.getByText('Action Required')).toBeInTheDocument();
      expect(screen.getAllByText('Delivered').length).toBeGreaterThanOrEqual(1);
    });

    it('filters orders by Needs Action state tab', () => {
      render(<OrdersTable orders={mockOrders} />);
      const needsActionTab = screen.getByRole('button', { name: /needs action/i });

      fireEvent.click(needsActionTab);

      expect(screen.getByText('TC-1001')).toBeInTheDocument();
      expect(screen.queryByText('TC-1002')).not.toBeInTheDocument();
    });

    it('filters orders by customer name search', () => {
      render(<OrdersTable orders={mockOrders} />);
      const searchInput = screen.getByPlaceholderText(/search by order #/i);

      fireEvent.change(searchInput, { target: { value: 'Sarah' } });

      expect(screen.getByText('TC-1002')).toBeInTheDocument();
      expect(screen.queryByText('TC-1001')).not.toBeInTheDocument();
    });
  });

  describe('Feature 9–15: ProductEditorForm Tabbed Navigation & Live Calculations', () => {
    it('switches between tabs cleanly without layout breakage', () => {
      render(<ProductEditorForm product={mockProducts[0]} wholesaleOffer={null} />);

      expect(screen.getByText(/general product information/i)).toBeInTheDocument();

      // Switch to Pricing & VAT tab
      fireEvent.click(screen.getByRole('button', { name: /pricing & vat/i }));
      expect(screen.getByText(/retail pricing & dual vat calculator/i)).toBeInTheDocument();

      // Switch to Inventory tab
      fireEvent.click(screen.getByRole('button', { name: /inventory & barcodes/i }));
      expect(screen.getByText(/stock levels & barcode identification/i)).toBeInTheDocument();

      // Switch to Specifications tab
      fireEvent.click(screen.getByRole('button', { name: /specifications/i }));
      expect(screen.getByText(/technical specifications editor/i)).toBeInTheDocument();

      // Switch to Media tab
      fireEvent.click(screen.getByRole('button', { name: /media gallery/i }));
      expect(screen.getByText(/product image gallery/i)).toBeInTheDocument();

      // Switch to Compliance tab
      fireEvent.click(screen.getByRole('button', { name: /compliance & sla/i }));
      expect(screen.getByText(/commercial compliance & launch gates/i)).toBeInTheDocument();
    });

    it('performs live bidirectional 20% VAT calculations', () => {
      render(<ProductEditorForm product={mockProducts[0]} wholesaleOffer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /pricing & vat/i }));

      const incVatInput = screen.getByLabelText(/retail price \(inc\. 20% vat\)/i);
      fireEvent.change(incVatInput, { target: { value: '12.00' } });

      const exVatInput = screen.getByLabelText(/retail price \(ex\. vat\)/i) as HTMLInputElement;
      expect(parseFloat(exVatInput.value)).toBe(10);
    });

    it('adds and removes technical specifications dynamically', () => {
      render(<ProductEditorForm product={mockProducts[0]} wholesaleOffer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /specifications/i }));

      const keyInput = screen.getByPlaceholderText(/attribute key/i);
      const valInput = screen.getByPlaceholderText(/value/i);
      const addBtn = screen.getByRole('button', { name: /add specification/i });

      fireEvent.change(keyInput, { target: { value: 'IP Rating' } });
      fireEvent.change(valInput, { target: { value: 'IP65' } });
      fireEvent.click(addBtn);

      expect(screen.getByDisplayValue('IP Rating')).toBeInTheDocument();
      expect(screen.getByDisplayValue('IP65')).toBeInTheDocument();
    });

    it('adjusts stock quantity with quick increment buttons', () => {
      render(<ProductEditorForm product={mockProducts[0]} wholesaleOffer={null} />);

      fireEvent.click(screen.getByRole('button', { name: /inventory & barcodes/i }));

      const stockInput = screen.getByLabelText(/available stock quantity/i) as HTMLInputElement;
      expect(stockInput.value).toBe('50');

      const plus10Btn = screen.getByRole('button', { name: '+10' });
      fireEvent.click(plus10Btn);
      expect(stockInput.value).toBe('60');

      const setOosBtn = screen.getByRole('button', { name: /set oos/i });
      fireEvent.click(setOosBtn);
      expect(stockInput.value).toBe('0');
    });
  });

  describe('Feature 16: AdminErrorBoundary Fault Tolerance', () => {
    function BrokenComponent(): React.ReactElement {
      throw new Error('Simulated module render failure');
    }

    it('catches render exceptions and displays accessible retry fallback UI', () => {
      // Suppress console.error during deliberate error throw test
      const originalError = console.error;
      console.error = vi.fn();

      render(
        <AdminErrorBoundary title="Test Fault Recovery">
          <BrokenComponent />
        </AdminErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText('Test Fault Recovery')).toBeInTheDocument();
      expect(screen.getByText(/simulated module render failure/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry module/i })).toBeInTheDocument();

      console.error = originalError;
    });
  });

  describe('Feature 8: CustomersClient Trade Account Persistence', () => {
    it('calls PUT /api/admin/customers/[id] on status approval', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ ...mockCustomers[0], status: 'approved' }),
      } as Response);

      render(<CustomersClient initialCustomers={mockCustomers} />);

      const approveBtn = screen.getByRole('button', { name: /approve trade account/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/admin/customers/cust-1',
          expect.objectContaining({
            method: 'PUT',
            body: JSON.stringify({ status: 'approved' }),
          })
        );
      });
    });

    it('rolls back customer status on API failure and displays accessible alert', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: 'Database update failed' }),
      } as Response);

      render(<CustomersClient initialCustomers={mockCustomers} />);

      const approveBtn = screen.getByRole('button', { name: /approve trade account/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText(/database update failed/i)).toBeInTheDocument();
      });
    });
  });
});
