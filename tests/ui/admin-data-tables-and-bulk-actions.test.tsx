import React from 'react';
import { render, screen, fireEvent, waitFor, within, renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Primitives and components under test
import {
  useDataTable,
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableSearch,
  DataTableFacetedFilter,
  DataTableColumn,
} from '@/components/admin/data-table';
import { BulkActionBar } from '@/components/admin/bulk-action-bar';
import { ProductTable } from '@/components/admin/product-table';
import { OrdersTable } from '@/components/admin/orders-table';
import { CustomersClient } from '@/app/admin/customers/customers-client';
import { POST as bulkProductPost } from '@/app/api/admin/products/bulk/route';
import { PUT as customerPut } from '@/app/api/admin/customers/[id]/route';

import { PublicProductDTO } from '@/types/product';
import { OrderRecord } from '@/types/order';
import { TradeCustomerRecord } from '@/lib/db/types';

// Mock next/navigation
const mockRefresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: mockRefresh,
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => '/admin/products',
  notFound: vi.fn(),
}));

// Mock Database
const mockProductStore = new Map<string, any>();
const mockCustomerStore = new Map<string, any>();

vi.mock('@/lib/db', () => ({
  getDb: () => ({
    products: {
      getById: vi.fn(async (id: string) => mockProductStore.get(id) || null),
      update: vi.fn(async (id: string, updates: any) => {
        const existing = mockProductStore.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...updates };
        mockProductStore.set(id, updated);
        return updated;
      }),
    },
    customers: {
      getById: vi.fn(async (id: string) => mockCustomerStore.get(id) || null),
      updateStatus: vi.fn(async (id: string, status: string, credit_limit_gbp?: number) => {
        const existing = mockCustomerStore.get(id);
        if (!existing) return null;
        const updated = {
          ...existing,
          status,
          ...(credit_limit_gbp !== undefined ? { credit_limit_gbp } : {}),
        };
        mockCustomerStore.set(id, updated);
        return updated;
      }),
    },
  }),
}));

// Mock Email Adapter
vi.mock('@/lib/adapters/email', () => ({
  renderTradeApplicationDecisionEmail: vi.fn(() => ({
    html: '<p>Decision email</p>',
    text: 'Decision email',
  })),
  sendEmail: vi.fn(async () => ({ success: true, id: 'msg_123' })),
}));

// Test Datasets
interface TestItem {
  id: string;
  name: string;
  category: string;
  price: number;
  status: 'active' | 'archived';
}

const sampleItems: TestItem[] = [
  { id: '1', name: 'Hammer Drill 18V', category: 'Power Tools', price: 120.0, status: 'active' },
  { id: '2', name: 'Impact Driver Brushless', category: 'Power Tools', price: 145.0, status: 'active' },
  { id: '3', name: 'Masonry Drill Bit Set', category: 'Accessories', price: 15.5, status: 'active' },
  { id: '4', name: 'Claw Hammer 16oz', category: 'Hand Tools', price: 18.0, status: 'archived' },
  { id: '5', name: 'Digital Multimeter', category: 'Testing', price: 45.0, status: 'active' },
];

const mockProducts: PublicProductDTO[] = [
  {
    id: 'prod-001',
    slug: 'status-9w-led-bulb',
    brand: 'Status',
    supplier_id: 'sup-status',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-001',
    title: 'Status 9W LED Bulb Warm White',
    description: 'Energy efficient bulb',
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
    compliance_verified: true,
    image_license_verified: true,
    specifications: { Lumens: '806 lm' },
  },
  {
    id: 'prod-002',
    slug: 'heavy-duty-fixings-50pk',
    brand: 'Ionos',
    supplier_id: 'sup-status',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-002',
    title: 'Heavy Duty Plasterboard Fixings 50pk',
    description: 'Wall anchors pack',
    category: 'Fixings',
    category_slug: 'fixings',
    images: ['/images/products/fixings.png'],
    units_per_pack: 50,
    units_per_case: 5,
    case_pack_description: 'Case of 5 packs',
    availability_status: 'in_stock',
    retail_price_inc_vat_gbp: 12.0,
    retail_price_ex_vat_gbp: 10.0,
    stock_quantity: 4,
    sellability_status: 'approved',
    gtin: '5022822000002',
    compliance_verified: true,
    image_license_verified: true,
    specifications: { Material: 'Zinc Alloy' },
  },
  {
    id: 'prod-003',
    slug: 'double-socket-white',
    brand: 'Status',
    supplier_id: 'sup-status',
    supplier_name: 'Status International',
    supplier_sku: 'SKU-003',
    title: '13A Double Switched Socket White',
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
    stock_quantity: 100,
    sellability_status: 'needs_review',
    gtin: '5022822000003',
    compliance_verified: false,
    image_license_verified: false,
    specifications: { Voltage: '230V' },
  },
];

const mockOrders: OrderRecord[] = [
  {
    id: 'ord-101',
    order_number: 'TC-101',
    created_at: new Date('2026-10-15T10:00:00Z').toISOString(),
    updated_at: new Date('2026-10-15T10:00:00Z').toISOString(),
    state: 'supplier_order_pending',
    customer_email: 'mark@yorkshirebuilders.co.uk',
    shipping_address: {
      full_name: 'Mark York',
      company_name: 'Yorkshire Builders Ltd',
      address_line_1: '10 Industrial Estate',
      city: 'Leeds',
      postcode: 'LS1 4DY',
      country: 'UK',
    },
    items: [
      {
        product_id: 'prod-001',
        title: 'Status 9W LED Bulb Warm White',
        supplier_sku: 'SKU-001',
        quantity: 5,
        unit_price_inc_vat: 4.8,
        unit_price_ex_vat: 4.0,
        total_inc_vat: 24.0,
      },
    ],
    subtotal_ex_vat_gbp: 20.0,
    subtotal_inc_vat_gbp: 24.0,
    shipping_ex_vat_gbp: 4.95,
    shipping_inc_vat_gbp: 5.94,
    vat_amount_gbp: 4.99,
    total_inc_vat_gbp: 29.94,
    supplier_id: 'sup-status',
    audit_logs: [],
  },
  {
    id: 'ord-102',
    order_number: 'TC-102',
    created_at: new Date('2026-10-14T09:00:00Z').toISOString(),
    updated_at: new Date('2026-10-14T15:00:00Z').toISOString(),
    state: 'delivered',
    customer_email: 'lisa@northspark.co.uk',
    shipping_address: {
      full_name: 'Lisa Spark',
      company_name: 'North Spark Electrical',
      address_line_1: '25 High Street',
      city: 'Sheffield',
      postcode: 'S1 2EF',
      country: 'UK',
    },
    items: [
      {
        product_id: 'prod-002',
        title: 'Heavy Duty Fixings',
        supplier_sku: 'SKU-002',
        quantity: 2,
        unit_price_inc_vat: 12.0,
        unit_price_ex_vat: 10.0,
        total_inc_vat: 24.0,
      },
    ],
    subtotal_ex_vat_gbp: 20.0,
    subtotal_inc_vat_gbp: 24.0,
    shipping_ex_vat_gbp: 0,
    shipping_inc_vat_gbp: 0,
    vat_amount_gbp: 4.0,
    total_inc_vat_gbp: 24.0,
    supplier_id: 'sup-status',
    audit_logs: [],
  },
];

const mockCustomers: TradeCustomerRecord[] = [
  {
    id: 'cust-trade-1',
    company_name: 'Pennine Construction Ltd',
    contact_name: 'Dave Pennine',
    email: 'dave@pennine.co.uk',
    phone: '0113 555 0199',
    trade_tier: 'tier_1_5pct',
    credit_limit_gbp: 2500,
    status: 'pending',
    created_at: '2026-10-10T12:00:00Z',
  },
  {
    id: 'cust-trade-2',
    company_name: 'Apex Electrical Services Ltd',
    contact_name: 'Helen Apex',
    email: 'helen@apexelectrical.co.uk',
    phone: '0161 555 0244',
    trade_tier: 'tier_2_10pct',
    credit_limit_gbp: 10000,
    status: 'approved',
    created_at: '2026-09-01T08:00:00Z',
  },
];

describe('Milestone M2: High-Reliability Data Tables & Bulk Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockProductStore.clear();
    mockCustomerStore.clear();

    mockProducts.forEach((p) => mockProductStore.set(p.id, { ...p }));
    mockCustomers.forEach((c) => mockCustomerStore.set(c.id, { ...c }));
  });

  // =========================================================================
  // 1. Reusable Headless Data Table Hook (useDataTable)
  // =========================================================================
  describe('1. useDataTable Headless Hook', () => {
    const columns: DataTableColumn<TestItem>[] = [
      { id: 'name', header: 'Name', accessorKey: 'name', sortable: true },
      { id: 'category', header: 'Category', accessorKey: 'category', sortable: true },
      { id: 'price', header: 'Price', accessorKey: 'price', sortable: true },
      { id: 'status', header: 'Status', accessorKey: 'status' },
    ];

    it('initializes with default pagination, sorting, and search states', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: sampleItems,
          columns,
          initialPageSize: 2,
          pageSizeOptions: [2, 5, 10],
        })
      );

      expect(result.current.totalItems).toBe(5);
      expect(result.current.filteredItems).toBe(5);
      expect(result.current.totalPages).toBe(3);
      expect(result.current.page).toBe(1);
      expect(result.current.pageSize).toBe(2);
      expect(result.current.paginatedData.length).toBe(2);
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.search).toBe('');
      expect(result.current.debouncedSearch).toBe('');
    });

    it('handles pagination navigation and page size adjustments', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: sampleItems,
          columns,
          initialPageSize: 2,
        })
      );

      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(2);
      expect(result.current.paginatedData[0].name).toBe('Masonry Drill Bit Set');

      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(1);

      act(() => {
        result.current.setPageSize(5);
      });
      expect(result.current.pageSize).toBe(5);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.page).toBe(1);
    });

    it('debounces search by 300ms and filters data matching query', async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: sampleItems,
          columns,
          searchFields: ['name', 'category'],
          debounceMs: 50,
        })
      );

      act(() => {
        result.current.setSearch('Hammer');
      });

      expect(result.current.search).toBe('Hammer');
      expect(result.current.debouncedSearch).toBe('');

      // Wait for debounce timer to fire
      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('Hammer');
      });

      expect(result.current.filteredItems).toBe(2);
      expect(result.current.paginatedData.map((d) => d.name)).toEqual([
        'Hammer Drill 18V',
        'Claw Hammer 16oz',
      ]);
    });

    it('supports column sorting ascending, descending, and clearing', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: sampleItems,
          columns,
          initialPageSize: 10,
        })
      );

      // 1. Sort by price asc
      act(() => {
        result.current.toggleSort('price');
      });
      expect(result.current.getSortDirection('price')).toBe('asc');
      expect(result.current.paginatedData[0].name).toBe('Masonry Drill Bit Set'); // 15.5
      expect(result.current.paginatedData[4].name).toBe('Impact Driver Brushless'); // 145.0

      // 2. Toggle to desc
      act(() => {
        result.current.toggleSort('price');
      });
      expect(result.current.getSortDirection('price')).toBe('desc');
      expect(result.current.paginatedData[0].name).toBe('Impact Driver Brushless'); // 145.0

      // 3. Toggle to unsorted
      act(() => {
        result.current.toggleSort('price');
      });
      expect(result.current.getSortDirection('price')).toBe(false);
    });

    it('manages row selection, select-all page, and indeterminate calculation', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: sampleItems,
          columns,
          initialPageSize: 3,
        })
      );

      // Select first row
      act(() => {
        result.current.toggleSelectRow('1');
      });
      expect(result.current.selectedIds.has('1')).toBe(true);
      expect(result.current.isSomePageSelected).toBe(true);
      expect(result.current.isAllPageSelected).toBe(false);

      // Select all on current page (items 1, 2, 3)
      act(() => {
        result.current.toggleSelectAllPage();
      });
      expect(result.current.isAllPageSelected).toBe(true);
      expect(result.current.isSomePageSelected).toBe(false);
      expect(result.current.selectedIds.size).toBe(3);

      // Deselect all on current page
      act(() => {
        result.current.toggleSelectAllPage();
      });
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(false);

      // Select all across entire dataset
      act(() => {
        result.current.selectAll();
      });
      expect(result.current.selectedIds.size).toBe(5);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedIds.size).toBe(0);
    });
  });

  // =========================================================================
  // 2. Data Table UI Primitives
  // =========================================================================
  describe('2. Data Table UI Primitives Component Suite', () => {
    it('renders DataTableColumnHeader with accessible aria-sort and click handler', () => {
      const onSort = vi.fn();
      const { rerender } = render(
        <DataTableColumnHeader title="Retail Price" sortDirection={false} onSort={onSort} />
      );

      const button = screen.getByRole('button', { name: /sort by retail price/i });
      expect(button).not.toHaveAttribute('aria-sort');

      fireEvent.click(button);
      expect(onSort).toHaveBeenCalledTimes(1);

      // Ascending
      rerender(<DataTableColumnHeader title="Retail Price" sortDirection="asc" onSort={onSort} />);
      expect(screen.getByRole('button', { name: /sort by retail price \(ascending\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by retail price \(ascending\)/i })).not.toHaveAttribute('aria-sort');

      // Descending
      rerender(<DataTableColumnHeader title="Retail Price" sortDirection="desc" onSort={onSort} />);
      expect(screen.getByRole('button', { name: /sort by retail price \(descending\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sort by retail price \(descending\)/i })).not.toHaveAttribute('aria-sort');
    });

    it('renders DataTablePagination with range description and disabled bounds', () => {
      const onPageChange = vi.fn();
      const onPageSizeChange = vi.fn();

      render(
        <DataTablePagination
          page={1}
          pageSize={25}
          totalPages={4}
          totalFilteredItems={88}
          canPreviousPage={false}
          canNextPage={true}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          itemLabel="tools"
        />
      );

      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getAllByText('25').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('88')).toBeInTheDocument();
      expect(screen.getByText('Page 1 of 4')).toBeInTheDocument();

      const prevBtn = screen.getByRole('button', { name: /previous page/i });
      const nextBtn = screen.getByRole('button', { name: /next page/i });
      expect(prevBtn).toBeDisabled();
      expect(nextBtn).toBeEnabled();

      fireEvent.click(nextBtn);
      expect(onPageChange).toHaveBeenCalledWith(2);

      const select = screen.getByRole('combobox', { name: /rows per page/i });
      fireEvent.change(select, { target: { value: '50' } });
      expect(onPageSizeChange).toHaveBeenCalledWith(50);
    });

    it('renders DataTableSearch with clear trigger and accessible label', () => {
      const onChange = vi.fn();
      const onClear = vi.fn();

      const { rerender } = render(
        <DataTableSearch
          value=""
          onChange={onChange}
          onClear={onClear}
          placeholder="Filter catalog items..."
        />
      );

      const input = screen.getByPlaceholderText('Filter catalog items...');
      fireEvent.change(input, { target: { value: 'Drill' } });
      expect(onChange).toHaveBeenCalledWith('Drill');

      // When value is provided, clear button should appear
      rerender(
        <DataTableSearch
          value="Drill"
          onChange={onChange}
          onClear={onClear}
          placeholder="Filter catalog items..."
        />
      );

      const clearBtn = screen.getByRole('button', { name: /clear search input/i });
      fireEvent.click(clearBtn);
      expect(onClear).toHaveBeenCalledTimes(1);
    });

    it('renders DataTableFacetedFilter tabs with counts and selection triggers', () => {
      const onSelect = vi.fn();
      const options = [
        { key: 'all', label: 'All', count: 115 },
        { key: 'approved', label: 'Approved', count: 80 },
        { key: 'draft', label: 'Draft', count: 25 },
        { key: 'needs_review', label: 'Needs Review', count: 10 },
      ];

      render(
        <DataTableFacetedFilter
          options={options}
          activeKey="approved"
          onSelect={onSelect}
          ariaLabel="Status filters"
        />
      );

      const approvedBtn = screen.getByRole('button', { name: /approved 80/i });
      expect(approvedBtn).toHaveAttribute('aria-pressed', 'true');

      const draftBtn = screen.getByRole('button', { name: /draft 25/i });
      expect(draftBtn).toHaveAttribute('aria-pressed', 'false');

      fireEvent.click(draftBtn);
      expect(onSelect).toHaveBeenCalledWith('draft');
    });
  });

  // =========================================================================
  // 3. BulkActionBar Component
  // =========================================================================
  describe('3. BulkActionBar Floating Dock & Operations', () => {
    it('returns null when selectedCount is 0', () => {
      const { container } = render(
        <BulkActionBar
          selectedCount={0}
          onStatusChange={vi.fn()}
          onPriceAdjust={vi.fn()}
          onStockAdjust={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('renders docked bar when selectedCount > 0 and handles quick status actions', () => {
      const onStatusChange = vi.fn();
      const onClearSelection = vi.fn();

      render(
        <BulkActionBar
          selectedCount={4}
          onStatusChange={onStatusChange}
          onPriceAdjust={vi.fn()}
          onStockAdjust={vi.fn()}
          onClearSelection={onClearSelection}
        />
      );

      const bar = screen.getByRole('region', { name: /bulk actions bar/i });
      expect(bar).toBeInTheDocument();
      expect(within(bar).getByText('4 selected')).toBeInTheDocument();

      // Click Approve
      const approveBtn = within(bar).getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveBtn);
      expect(onStatusChange).toHaveBeenCalledWith('approved');

      // Click Mark Draft
      const draftBtn = within(bar).getByRole('button', { name: /mark draft/i });
      fireEvent.click(draftBtn);
      expect(onStatusChange).toHaveBeenCalledWith('draft');

      // Click Needs Review
      const reviewBtn = within(bar).getByRole('button', { name: /needs review/i });
      fireEvent.click(reviewBtn);
      expect(onStatusChange).toHaveBeenCalledWith('needs_review');

      // Click Cancel / Deselect
      const cancelBtn = within(bar).getByRole('button', { name: /clear selection/i });
      fireEvent.click(cancelBtn);
      expect(onClearSelection).toHaveBeenCalledTimes(1);
    });

    it('opens and submits percentage and fixed price adjustments', () => {
      const onPriceAdjust = vi.fn();

      render(
        <BulkActionBar
          selectedCount={2}
          onStatusChange={vi.fn()}
          onPriceAdjust={onPriceAdjust}
          onStockAdjust={vi.fn()}
          onClearSelection={vi.fn()}
        />
      );

      const bar = screen.getByRole('region', { name: /bulk actions bar/i });
      const adjustPriceBtn = within(bar).getByRole('button', { name: /adjust price/i });
      fireEvent.click(adjustPriceBtn);

      const priceInput = screen.getByLabelText(/price adjustment value/i);
      fireEvent.change(priceInput, { target: { value: '8' } });

      const applyBtn = screen.getByRole('button', { name: /apply price update/i });
      fireEvent.click(applyBtn);

      expect(onPriceAdjust).toHaveBeenCalledWith({ price_percentage_change: 8 });
    });

    it('opens and submits stock adjustment with exact quantity', () => {
      const onStockAdjust = vi.fn();

      render(
        <BulkActionBar
          selectedCount={3}
          onStatusChange={vi.fn()}
          onPriceAdjust={vi.fn()}
          onStockAdjust={onStockAdjust}
          onClearSelection={vi.fn()}
        />
      );

      const bar = screen.getByRole('region', { name: /bulk actions bar/i });
      const adjustStockBtn = within(bar).getByRole('button', { name: /adjust stock/i });
      fireEvent.click(adjustStockBtn);

      const stockInput = screen.getByLabelText(/stock adjustment value/i);
      fireEvent.change(stockInput, { target: { value: '75' } });

      const applyBtn = screen.getByRole('button', { name: /apply stock update/i });
      fireEvent.click(applyBtn);

      expect(onStockAdjust).toHaveBeenCalledWith({ stock_exact: 75 });
    });

    it('opens and submits category reassignment when categories are supplied', () => {
      const onCategoryAssign = vi.fn();

      render(
        <BulkActionBar
          selectedCount={5}
          categories={['Lighting', 'Fixings', 'Electrical']}
          onStatusChange={vi.fn()}
          onPriceAdjust={vi.fn()}
          onStockAdjust={vi.fn()}
          onCategoryAssign={onCategoryAssign}
          onClearSelection={vi.fn()}
        />
      );

      const bar = screen.getByRole('region', { name: /bulk actions bar/i });
      const assignCatBtn = within(bar).getByRole('button', { name: /assign category/i });
      fireEvent.click(assignCatBtn);

      const select = screen.getByLabelText(/select category to assign/i);
      fireEvent.change(select, { target: { value: 'Electrical' } });

      const applyBtn = screen.getByRole('button', { name: /apply category/i });
      fireEvent.click(applyBtn);

      expect(onCategoryAssign).toHaveBeenCalledWith('Electrical');
    });
  });

  // =========================================================================
  // 4. ProductTable Integration & Bulk Workflow
  // =========================================================================
  describe('4. ProductTable Integration with Bulk Operations', () => {
    it('selects multiple rows and sends batch status update', async () => {
      global.fetch = vi.fn(async () => ({
        ok: true,
        json: async () => ({ success: true, updated_count: 2 }),
      })) as any;

      render(<ProductTable products={mockProducts} />);

      // Select first row checkbox
      const check1 = screen.getByLabelText(/select product sku-001/i);
      fireEvent.click(check1);

      // Select second row checkbox
      const check2 = screen.getByLabelText(/select product sku-002/i);
      fireEvent.click(check2);

      const bulkBar = screen.getByRole('region', { name: /bulk actions bar/i });
      expect(within(bulkBar).getByText('2 selected')).toBeInTheDocument();

      // Click Approve in bulk bar
      const approveBtn = within(bulkBar).getByRole('button', { name: /^approve$/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/admin/products/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            product_ids: ['prod-001', 'prod-002'],
            action: 'status',
            payload: { status: 'approved' },
          }),
        });
      });

      // Verifies toast feedback
      await waitFor(() => {
        expect(screen.getByText(/successfully updated 2 product\(s\)/i)).toBeInTheDocument();
      });
    });

    it('renders error toast when bulk API call rejects', async () => {
      global.fetch = vi.fn(async () => ({
        ok: false,
        json: async () => ({ error: 'Database mutation timeout' }),
      })) as any;

      render(<ProductTable products={mockProducts} />);

      const check1 = screen.getByLabelText(/select product sku-001/i);
      fireEvent.click(check1);

      const bulkBar = screen.getByRole('region', { name: /bulk actions bar/i });
      const draftBtn = within(bulkBar).getByRole('button', { name: /mark draft/i });
      fireEvent.click(draftBtn);

      await waitFor(() => {
        expect(screen.getByText(/database mutation timeout/i)).toBeInTheDocument();
      });
    });
  });

  // =========================================================================
  // 5. POST /api/admin/products/bulk Route Handler
  // =========================================================================
  describe('5. POST /api/admin/products/bulk API Endpoint', () => {
    it('executes status update on multiple products', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: ['prod-001', 'prod-003'],
          action: 'status',
          payload: { status: 'approved' },
        }),
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(2);

      // Verify db updates
      const p1 = mockProductStore.get('prod-001');
      const p3 = mockProductStore.get('prod-003');
      expect(p1.sellability_status).toBe('approved');
      expect(p3.sellability_status).toBe('approved');
    });

    it('executes price percentage adjustment calculation', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: ['prod-001'],
          action: 'price_adjust',
          payload: { price_percentage_change: 10 }, // 4.80 + 10% = 5.28
        }),
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001');
      expect(p1.retail_price_inc_vat_gbp).toBe(5.28);
      expect(p1.retail_price_ex_vat_gbp).toBe(4.4);
    });

    it('executes category reassignment', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: ['prod-001'],
          action: 'category',
          payload: { category: 'Smart Lighting' },
        }),
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001');
      expect(p1.category).toBe('Smart Lighting');
      expect(p1.category_slug).toBe('smart-lighting');
    });

    it('executes stock adjustment exact and delta', async () => {
      // 1. Exact stock
      const reqExact = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: ['prod-001'],
          action: 'stock_adjust',
          payload: { stock_exact: 125 },
        }),
      });

      const resExact = await bulkProductPost(reqExact);
      expect(resExact.status).toBe(200);
      expect(mockProductStore.get('prod-001').stock_quantity).toBe(125);
      expect(mockProductStore.get('prod-001').availability_status).toBe('in_stock');

      // 2. Delta stock
      const reqDelta = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: ['prod-001'],
          action: 'stock_adjust',
          payload: { stock_delta: -25 },
        }),
      });

      const resDelta = await bulkProductPost(reqDelta);
      expect(resDelta.status).toBe(200);
      expect(mockProductStore.get('prod-001').stock_quantity).toBe(100);
    });

    it('returns 400 Bad Request on invalid schema payload', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_ids: [], // empty product_ids violates .min(1)
          action: 'invalid_action',
          payload: {},
        }),
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });
  });

  // =========================================================================
  // 6. Interactive OrdersTable Lifecycle & Filter Console
  // =========================================================================
  describe('6. Interactive OrdersTable Component', () => {
    it('renders orders with order numbers, customer names, and state badges', () => {
      render(<OrdersTable orders={mockOrders} />);

      expect(screen.getByText('TC-101')).toBeInTheDocument();
      expect(screen.getByText('TC-102')).toBeInTheDocument();
      expect(screen.getByText('Mark York')).toBeInTheDocument();
      expect(screen.getByText('Lisa Spark')).toBeInTheDocument();

      // State badges
      expect(screen.getByText('Action Required')).toBeInTheDocument();
      expect(screen.getAllByText('Delivered').length).toBeGreaterThanOrEqual(1);

      // Links to order detail page
      const viewLinks = screen.getAllByRole('link', { name: /view order/i });
      expect(viewLinks[0]).toHaveAttribute('href', '/admin/orders/ord-101');
      expect(viewLinks[1]).toHaveAttribute('href', '/admin/orders/ord-102');
    });

    it('filters orders by Needs Action state tab', () => {
      render(<OrdersTable orders={mockOrders} />);

      const needsActionTab = screen.getByRole('button', { name: /needs action/i });
      fireEvent.click(needsActionTab);

      expect(screen.getByText('TC-101')).toBeInTheDocument();
      expect(screen.queryByText('TC-102')).not.toBeInTheDocument();
    });

    it('searches orders by customer email and order number', () => {
      render(<OrdersTable orders={mockOrders} />);

      const searchInput = screen.getByPlaceholderText(/search by order #/i);
      fireEvent.change(searchInput, { target: { value: 'lisa@northspark' } });

      expect(screen.getByText('TC-102')).toBeInTheDocument();
      expect(screen.queryByText('TC-101')).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // 7. Customer Trade Approval Persistence (API & Client)
  // =========================================================================
  describe('7. Customer Trade Approval Persistence & Client Wiring', () => {
    it('PUT /api/admin/customers/[id] persists status and credit limit', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/customers/cust-trade-1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          credit_limit_gbp: 5000,
        }),
      });

      const res = await customerPut(req, { params: { id: 'cust-trade-1' } });
      expect(res.status).toBe(200);

      const customer = mockCustomerStore.get('cust-trade-1');
      expect(customer.status).toBe('approved');
      expect(customer.credit_limit_gbp).toBe(5000);
    });

    it('CustomersClient updates trade customer status optimistically and rolls back on failure', async () => {
      // Mock failure response
      global.fetch = vi.fn(async () => ({
        ok: false,
        json: async () => ({ error: 'Unable to update customer approval record' }),
      })) as any;

      render(<CustomersClient initialCustomers={mockCustomers} />);

      // Find approve button for pending customer Dave Pennine
      const approveBtn = screen.getByRole('button', { name: /approve/i });
      fireEvent.click(approveBtn);

      // Verifies error message displayed after rollback
      await waitFor(() => {
        expect(screen.getByText(/unable to update customer approval record/i)).toBeInTheDocument();
      });
    });
  });
});
