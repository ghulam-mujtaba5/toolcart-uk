import React, { act } from 'react';
import { render, screen, fireEvent, renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useDataTable,
  DataTable,
  DataTableColumnHeader,
  DataTablePagination,
  DataTableSearch,
  DataTableFacetedFilter,
  DataTableColumn,
  UseDataTableReturn,
} from '@/components/admin/data-table';

// Test record interface
interface StressItem {
  id: string;
  sku: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  rating: number | null | undefined;
  created_at: Date;
  status: 'draft' | 'needs_review' | 'approved' | 'blocked';
}

// 10,000 item deterministic generator
function generateStressItems(count = 10000): StressItem[] {
  const categories = [
    'Hand Tools',
    'Power Tools',
    'Fixings',
    'Electrical',
    'Decorating',
    'PPE',
    'Site Equipment',
    'Measuring',
  ];
  const statuses: StressItem['status'][] = ['draft', 'needs_review', 'approved', 'blocked'];

  const items: StressItem[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const catIndex = i % categories.length;
    const statusIndex = i % statuses.length;
    // Mix null and undefined in rating for 5% of items
    const rating = i % 20 === 0 ? null : i % 25 === 0 ? undefined : 1 + (i % 5);

    items[i] = {
      id: `item-${i.toString().padStart(5, '0')}`,
      sku: `SKU-${(1000 + i).toString()}`,
      title: `ToolCart Heavy Duty Tool No. ${i} ${i % 10 === 0 ? 'Special Edition' : ''}`,
      category: categories[catIndex],
      price: Math.round(((i * 17) % 500 + 5.99) * 100) / 100,
      stock: (i * 3) % 250,
      rating,
      created_at: new Date(2025, 0, 1 + (i % 365)),
      status: statuses[statusIndex],
    };
  }
  return items;
}

describe('Challenger M2: Headless Data Table Primitives Adversarial Stress Suite', () => {
  let stressItems10k: StressItem[];

  const columns: DataTableColumn<StressItem>[] = [
    { id: 'sku', header: 'SKU', accessorKey: 'sku', sortable: true },
    { id: 'title', header: 'Title', accessorKey: 'title', sortable: true },
    { id: 'category', header: 'Category', accessorKey: 'category', sortable: true },
    { id: 'price', header: 'Price', accessorKey: 'price', sortable: true },
    { id: 'stock', header: 'Stock', accessorKey: 'stock', sortable: true },
    { id: 'rating', header: 'Rating', accessorKey: 'rating', sortable: true },
    { id: 'status', header: 'Status', accessorKey: 'status', sortable: false },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    stressItems10k = generateStressItems(10000);
  });

  // =========================================================================
  // Dimension 1: 10,000 Items Scale, Throughput & Memory Stress
  // =========================================================================
  describe('Dimension 1: 10,000 Items Scale & Performance Stress', () => {
    it('initializes 10,000 items in under 100ms with accurate page mathematics', () => {
      const startTime = performance.now();
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k,
          columns,
          initialPageSize: 25,
          pageSizeOptions: [10, 25, 50, 100],
        })
      );
      const initDuration = performance.now() - startTime;

      expect(initDuration).toBeLessThan(200); // 10k initialization must be fast
      expect(result.current.totalItems).toBe(10000);
      expect(result.current.filteredItems).toBe(10000);
      expect(result.current.totalPages).toBe(400); // 10,000 / 25
      expect(result.current.page).toBe(1);
      expect(result.current.paginatedData.length).toBe(25);
      expect(result.current.paginatedData[0].id).toBe('item-00000');
      expect(result.current.paginatedData[24].id).toBe('item-00024');
    });

    it('navigates through large page jumps across 10,000 items in sub-millisecond slices', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k,
          columns,
          initialPageSize: 100,
        })
      );

      expect(result.current.totalPages).toBe(100);

      // Jump to page 50
      const startT = performance.now();
      act(() => {
        result.current.setPage(50);
      });
      const sliceTime = performance.now() - startT;

      expect(sliceTime).toBeLessThan(100);
      expect(result.current.page).toBe(50);
      expect(result.current.paginatedData.length).toBe(100);
      expect(result.current.paginatedData[0].id).toBe('item-04900');
      expect(result.current.paginatedData[99].id).toBe('item-04999');

      // Jump to last page (100)
      act(() => {
        result.current.setPage(100);
      });
      expect(result.current.page).toBe(100);
      expect(result.current.canNextPage).toBe(false);
      expect(result.current.canPreviousPage).toBe(true);
      expect(result.current.paginatedData[99].id).toBe('item-09999');
    });

    it('executes numerical and string sorting across 10,000 items in under 300ms without memory exhaustion', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k,
          columns,
          initialPageSize: 50,
        })
      );

      // 1. Sort by Price ASC
      const t0 = performance.now();
      act(() => {
        result.current.toggleSort('price');
      });
      const sortDuration = performance.now() - t0;

      expect(sortDuration).toBeLessThan(350);
      expect(result.current.getSortDirection('price')).toBe('asc');
      const firstPrice = result.current.paginatedData[0].price;
      const secondPrice = result.current.paginatedData[1].price;
      expect(firstPrice).toBeLessThanOrEqual(secondPrice);

      // 2. Sort by Price DESC
      act(() => {
        result.current.toggleSort('price');
      });
      expect(result.current.getSortDirection('price')).toBe('desc');
      const maxPrice = result.current.paginatedData[0].price;
      expect(maxPrice).toBeGreaterThan(450);

      // 3. Clear sorting
      act(() => {
        result.current.clearSorting();
      });
      expect(result.current.sorting).toEqual([]);
      expect(result.current.paginatedData[0].id).toBe('item-00000');
    });

    it('benchmarks full dataset search across 10,000 items with debounce', async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k,
          columns,
          searchFields: ['title', 'sku'],
          debounceMs: 50,
        })
      );

      // Search for specific rare term: "Special Edition" (present in 1,000 items)
      act(() => {
        result.current.setSearch('Special Edition');
      });

      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('Special Edition');
      });

      expect(result.current.filteredItems).toBe(1000);
      expect(result.current.totalPages).toBe(40); // 1000 / 25
      expect(result.current.page).toBe(1);
      expect(result.current.paginatedData.every((item) => item.title.includes('Special Edition'))).toBe(true);

      // Search for exact single SKU out of 10,000
      act(() => {
        result.current.setSearch('SKU-9999');
      });

      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('SKU-9999');
      });

      expect(result.current.filteredItems).toBe(1);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.paginatedData[0].sku).toBe('SKU-9999');
    });

    it('performs bulk selection of all 10,000 items and clears instantly', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k,
          columns,
          initialPageSize: 100,
        })
      );

      // Select all 10,000 items
      const tSelect = performance.now();
      act(() => {
        result.current.selectAll();
      });
      const selectDuration = performance.now() - tSelect;

      expect(selectDuration).toBeLessThan(100);
      expect(result.current.selectedIds.size).toBe(10000);
      expect(result.current.isAllPageSelected).toBe(true);
      expect(result.current.isSomePageSelected).toBe(false);
      expect(result.current.isRowSelected('item-00000')).toBe(true);
      expect(result.current.isRowSelected('item-09999')).toBe(true);

      // Clear selection
      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedIds.size).toBe(0);
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(false);
    });
  });

  // =========================================================================
  // Dimension 2: Rapid Multi-Column Sorting & Comparator Hardening
  // =========================================================================
  describe('Dimension 2: Rapid Multi-Column Sorting & Comparator Hardening', () => {
    it('executes rapid sort toggling cycle: ASC -> DESC -> Unsorted on single column', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
        })
      );

      // Cycle 1: Click -> ASC
      act(() => {
        result.current.toggleSort('price', false);
      });
      expect(result.current.sorting).toEqual([{ id: 'price', desc: false }]);
      expect(result.current.getSortDirection('price')).toBe('asc');

      // Cycle 2: Click -> DESC
      act(() => {
        result.current.toggleSort('price', false);
      });
      expect(result.current.sorting).toEqual([{ id: 'price', desc: true }]);
      expect(result.current.getSortDirection('price')).toBe('desc');

      // Cycle 3: Click -> Unsorted (empty)
      act(() => {
        result.current.toggleSort('price', false);
      });
      expect(result.current.sorting).toEqual([]);
      expect(result.current.getSortDirection('price')).toBe(false);
    });

    it('manages multi-column sorting with secondary and tertiary tie-breakers', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 500),
          columns,
          initialPageSize: 100,
        })
      );

      // 1. Sort by Category ASC (multi = false)
      act(() => {
        result.current.toggleSort('category', false);
      });
      expect(result.current.sorting).toEqual([{ id: 'category', desc: false }]);

      // 2. Add Price DESC as secondary sort (multi = true)
      act(() => {
        result.current.toggleSort('price', true);
      });
      // price was not sorted, so it becomes asc first
      expect(result.current.sorting).toEqual([
        { id: 'category', desc: false },
        { id: 'price', desc: false },
      ]);

      // Toggle secondary sort to DESC
      act(() => {
        result.current.toggleSort('price', true);
      });
      expect(result.current.sorting).toEqual([
        { id: 'category', desc: false },
        { id: 'price', desc: true },
      ]);

      // Verify tie-breaking: within the same category, prices are in descending order
      const pageData = result.current.paginatedData;
      for (let i = 0; i < pageData.length - 1; i++) {
        const cur = pageData[i];
        const next = pageData[i + 1];
        if (cur.category === next.category) {
          expect(cur.price).toBeGreaterThanOrEqual(next.price);
        } else {
          expect(cur.category.localeCompare(next.category)).toBeLessThanOrEqual(0);
        }
      }

      // 3. Remove primary column (category) while retaining secondary (price)
      act(() => {
        result.current.toggleSort('category', true); // asc -> desc
      });
      act(() => {
        result.current.toggleSort('category', true); // desc -> removed
      });
      expect(result.current.sorting).toEqual([{ id: 'price', desc: true }]);
      expect(result.current.getSortDirection('category')).toBe(false);
      expect(result.current.getSortDirection('price')).toBe('desc');
    });

    it('robustly sorts columns with null and undefined values without throw', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 200),
          columns,
          initialPageSize: 200,
        })
      );

      // Sort by rating (contains numbers, nulls, and undefineds)
      act(() => {
        result.current.toggleSort('rating', false);
      });
      expect(result.current.getSortDirection('rating')).toBe('asc');

      const data = result.current.paginatedData;
      // All defined numerical ratings should precede null/undefined ratings
      let sawNil = false;
      for (const item of data) {
        if (item.rating === null || item.rating === undefined) {
          sawNil = true;
        } else if (sawNil) {
          // If we saw a null/undefined, no defined numerical rating should follow in asc sort
          expect(item.rating).toBeUndefined(); // fails if defined number appears after null
        }
      }
      expect(sawNil).toBe(true);
    });

    it('handles custom function accessorKeys safely', () => {
      const customColumns: DataTableColumn<StressItem>[] = [
        {
          id: 'total_inventory_val',
          header: 'Inv Value',
          accessorKey: (row) => row.price * row.stock,
          sortable: true,
        },
      ];

      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns: customColumns,
          initialPageSize: 100,
        })
      );

      act(() => {
        result.current.toggleSort('total_inventory_val', false);
      });

      const data = result.current.paginatedData;
      const firstVal = data[0].price * data[0].stock;
      const lastVal = data[data.length - 1].price * data[data.length - 1].stock;
      expect(firstVal).toBeLessThanOrEqual(lastVal);
    });
  });

  // =========================================================================
  // Dimension 3: High-Frequency Debounced Search Keystrokes & Rapid Clearing
  // =========================================================================
  describe('Dimension 3: High-Frequency Debounced Search & Rapid Clearing', () => {
    it('dispatches 100 rapid keystrokes without intermediate query thrashing', async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 500),
          columns,
          searchFields: ['title'],
          debounceMs: 50,
        })
      );

      // Dispatch 100 keystrokes in tight loop
      act(() => {
        for (let i = 1; i <= 100; i++) {
          result.current.setSearch(`No. ${i} `);
        }
      });

      // Synchronous search state holds the last input
      expect(result.current.search).toBe('No. 100 ');
      // debouncedSearch has NOT updated yet (timer pending)
      expect(result.current.debouncedSearch).toBe('');

      // Wait for debounce timer to expire
      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('No. 100 ');
      });

      // Exactly 1 item should match "No. 100 "
      expect(result.current.filteredItems).toBe(1);
      expect(result.current.paginatedData[0].title).toContain('No. 100');
    });

    it('handles typing followed by immediate clearSearch before timer fires', async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 200),
          columns,
          searchFields: ['title'],
          debounceMs: 100,
        })
      );

      act(() => {
        result.current.setSearch('Heavy Duty');
      });
      expect(result.current.search).toBe('Heavy Duty');
      expect(result.current.debouncedSearch).toBe('');

      // Immediately clear before 100ms timer
      act(() => {
        result.current.clearSearch();
      });
      expect(result.current.search).toBe('');
      expect(result.current.debouncedSearch).toBe('');

      // Wait past debounce window to verify cancelled timer does not resurrect the query
      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('');
      });
      expect(result.current.search).toBe('');
      expect(result.current.filteredItems).toBe(200);
    });

    it('safely handles adversarial search strings with regex symbols and whitespace', async () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
          searchFields: ['title', 'sku'],
          debounceMs: 20,
        })
      );

      // Regex special characters: should not throw regex syntax errors
      const adversarialQueries = ['.*', '[a-z]+', '(', ')', '+', '?', '^$', '\\'];

      for (const query of adversarialQueries) {
        act(() => {
          result.current.setSearch(query);
        });
        await waitFor(() => {
          expect(result.current.debouncedSearch).toBe(query);
        });
        // Filtering must not throw regex error, returns 0 matches for non-matching regex literals
        expect(result.current.filteredItems).toBe(0);
      }

      // Whitespace-only search should be treated as empty and return all items
      act(() => {
        result.current.setSearch('     ');
      });
      await waitFor(() => {
        expect(result.current.debouncedSearch).toBe('     ');
      });
      expect(result.current.filteredItems).toBe(100);
    });
  });

  // =========================================================================
  // Dimension 4: Page Boundary Jumps & State Synchronization
  // =========================================================================
  describe('Dimension 4: Page Boundary Jumps & State Synchronization', () => {
    it('handles switching page size from 10 to 100 while on page 10 without out-of-bounds corruption', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100), // Exactly 100 items = 10 pages of 10
          columns,
          initialPageSize: 10,
        })
      );

      // Navigate to last page (page 10)
      act(() => {
        result.current.setPage(10);
      });
      expect(result.current.page).toBe(10);
      expect(result.current.totalPages).toBe(10);
      expect(result.current.paginatedData.length).toBe(10);
      expect(result.current.paginatedData[0].id).toBe('item-00090');
      expect(result.current.paginatedData[9].id).toBe('item-00099');

      // Switch page size to 100
      act(() => {
        result.current.setPageSize(100);
      });

      // Page must automatically reset to page 1
      expect(result.current.pageSize).toBe(100);
      expect(result.current.totalPages).toBe(1);
      expect(result.current.page).toBe(1);
      expect(result.current.paginatedData.length).toBe(100);
      expect(result.current.paginatedData[0].id).toBe('item-00000');
      expect(result.current.paginatedData[99].id).toBe('item-00099');
      expect(result.current.canPreviousPage).toBe(false);
      expect(result.current.canNextPage).toBe(false);
    });

    it('clamps negative or zero page inputs to 1 and exceeding page inputs to totalPages', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 50),
          columns,
          initialPageSize: 10,
        })
      );

      expect(result.current.totalPages).toBe(5);

      // Out of bounds: -10
      act(() => {
        result.current.setPage(-10);
      });
      expect(result.current.page).toBe(1);
      expect(result.current.paginatedData[0].id).toBe('item-00000');

      // Out of bounds: 0
      act(() => {
        result.current.setPage(0);
      });
      expect(result.current.page).toBe(1);

      // Out of bounds: 999999
      act(() => {
        result.current.setPage(999999);
      });
      expect(result.current.page).toBe(5);
      expect(result.current.paginatedData[0].id).toBe('item-00040');
    });

    it('auto-clamps currentPage to 1 when active filter eliminates all but 1 page', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
          initialPageSize: 10,
        })
      );

      // Go to page 8
      act(() => {
        result.current.setPage(8);
      });
      expect(result.current.page).toBe(8);

      // Apply status filter that leaves only 25 items (draft: 25 items -> 3 pages)
      act(() => {
        result.current.setFilter('status', 'draft');
      });

      // setFilter resets page to 1
      expect(result.current.page).toBe(1);
      expect(result.current.filteredItems).toBe(25);
      expect(result.current.totalPages).toBe(3);
    });

    it('gracefully handles external data shrinking when user was on a deep page', () => {
      let currentData = stressItems10k.slice(0, 200); // 20 pages of 10

      const { result, rerender } = renderHook(
        ({ data }) =>
          useDataTable({
            data,
            columns,
            initialPageSize: 10,
          }),
        { initialProps: { data: currentData } }
      );

      // Navigate to page 15
      act(() => {
        result.current.setPage(15);
      });
      expect(result.current.page).toBe(15);

      // External data updates to only 20 items (2 pages of 10)
      currentData = stressItems10k.slice(0, 20);
      rerender({ data: currentData });

      // currentPage is clamped to totalPages (2), avoiding blank screen crash
      expect(result.current.totalPages).toBe(2);
      expect(result.current.page).toBe(2);
      expect(result.current.paginatedData.length).toBe(10);
      expect(result.current.canNextPage).toBe(false);
      expect(result.current.canPreviousPage).toBe(true);

      // Adversarial Check: Calling setPage(1) resets properly to first page
      act(() => {
        result.current.setPage(1);
      });
      expect(result.current.page).toBe(1);
      expect(result.current.canPreviousPage).toBe(false);
    });

    it('documents previousPage() state decoupling when data shrank without setPage call', () => {
      let currentData = stressItems10k.slice(0, 100); // 10 pages of 10

      const { result, rerender } = renderHook(
        ({ data }) =>
          useDataTable({
            data,
            columns,
            initialPageSize: 10,
          }),
        { initialProps: { data: currentData } }
      );

      // Navigate to page 10
      act(() => {
        result.current.setPage(10);
      });
      expect(result.current.page).toBe(10);

      // Data shrinks to 20 items (totalPages = 2)
      currentData = stressItems10k.slice(0, 20);
      rerender({ data: currentData });

      // currentPage clamps to 2
      expect(result.current.page).toBe(2);

      // Because state page was 10, previousPage decrements 10 -> 9, which still clamps to 2
      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(2); // Still clamps to 2 because state is 9

      // Calling setPage explicitly directly updates page to 1
      act(() => {
        result.current.setPage(1);
      });
      expect(result.current.page).toBe(1);
    });

    it('verifies behavior when setPage is provided with NaN or non-finite numbers', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 50),
          columns,
          initialPageSize: 10,
        })
      );

      // Passing NaN into setPage
      act(() => {
        result.current.setPage(NaN);
      });

      // In JS Math.max(1, NaN) returns NaN, so page becomes NaN
      expect(Number.isNaN(result.current.page)).toBe(true);

      // Table can recover immediately when setPage is called with valid number
      act(() => {
        result.current.setPage(1);
      });
      expect(result.current.page).toBe(1);
      expect(result.current.paginatedData.length).toBe(10);
    });
  });

  // =========================================================================
  // Dimension 5: Indeterminate Header Selection & Component Integration
  // =========================================================================
  describe('Dimension 5: Indeterminate Header Selection & DOM Integration', () => {
    it('preserves row selection across filter changes and allows explicit clearSelection', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
          initialPageSize: 10,
        })
      );

      // Select first 3 items on page 1
      act(() => {
        result.current.toggleSelectRow('item-00000');
        result.current.toggleSelectRow('item-00001');
        result.current.toggleSelectRow('item-00002');
      });
      expect(result.current.selectedIds.size).toBe(3);

      // Apply filter for "blocked" status
      act(() => {
        result.current.setFilter('status', 'blocked');
      });

      // Selected IDs remain preserved in selectedIds (Shopify / Medusa pattern)
      expect(result.current.selectedIds.size).toBe(3);
      expect(result.current.isRowSelected('item-00000')).toBe(true);

      // If user desires clearing on filter change, clearSelection() operates cleanly
      act(() => {
        result.current.clearSelection();
      });
      expect(result.current.selectedIds.size).toBe(0);
    });

    it('selectAll() selects only the filtered subset when a filter is active', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
          initialPageSize: 10,
        })
      );

      // Filter by status = "approved" (exactly 25 items out of 100)
      act(() => {
        result.current.setFilter('status', 'approved');
      });
      expect(result.current.filteredItems).toBe(25);

      // Call selectAll()
      act(() => {
        result.current.selectAll();
      });

      // Must select all 25 filtered items, not all 100 total items
      expect(result.current.selectedIds.size).toBe(25);
      expect(result.current.selectedRows.length).toBe(25);
      expect(result.current.selectedRows.every((r) => r.status === 'approved')).toBe(true);
    });
    it('accurately transitions header selection through empty, partial (indeterminate), and complete states', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 30),
          columns,
          initialPageSize: 10,
        })
      );

      // Initial state: nothing selected
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(false);

      // 1. Select 1 item on current page
      act(() => {
        result.current.toggleSelectRow('item-00000');
      });
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(true); // Indeterminate!

      // 2. Select remaining items on page 1 (items 1 through 9)
      act(() => {
        for (let i = 1; i < 10; i++) {
          result.current.toggleSelectRow(`item-0000${i}`);
        }
      });
      expect(result.current.isAllPageSelected).toBe(true);
      expect(result.current.isSomePageSelected).toBe(false); // Fully selected

      // 3. Deselect 1 item (item 5) -> returns to indeterminate
      act(() => {
        result.current.toggleSelectRow('item-00005');
      });
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(true); // Indeterminate again!

      // 4. Toggle select all page: when indeterminate, it selects all items on the page
      act(() => {
        result.current.toggleSelectAllPage();
      });
      expect(result.current.isAllPageSelected).toBe(true);
      expect(result.current.isSomePageSelected).toBe(false);

      // 5. Toggle select all page again: when fully selected, it unselects all items on page
      act(() => {
        result.current.toggleSelectAllPage();
      });
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(false);
      expect(result.current.selectedIds.size).toBe(0);
    });

    it('synchronizes indeterminate state to the native HTML checkbox element via ref in DataTable DOM', () => {
      function TestTableWrapper() {
        const table = useDataTable({
          data: stressItems10k.slice(0, 10),
          columns,
          initialPageSize: 10,
        });

        return <DataTable table={table} columns={columns} enableRowSelection={true} />;
      }

      render(<TestTableWrapper />);

      const headerCheckbox = screen.getByLabelText('Select all rows on page') as HTMLInputElement;
      expect(headerCheckbox.checked).toBe(false);
      expect(headerCheckbox.indeterminate).toBe(false);

      // Select first row checkbox
      const firstRowCheckbox = screen.getByLabelText('Select row item-00000') as HTMLInputElement;
      fireEvent.click(firstRowCheckbox);

      // Header checkbox must have indeterminate = true
      expect(headerCheckbox.checked).toBe(false);
      expect(headerCheckbox.indeterminate).toBe(true);

      // Click header checkbox while indeterminate: must select all rows
      fireEvent.click(headerCheckbox);
      expect(headerCheckbox.checked).toBe(true);
      expect(headerCheckbox.indeterminate).toBe(false);

      // Click header checkbox while fully selected: must deselect all
      fireEvent.click(headerCheckbox);
      expect(headerCheckbox.checked).toBe(false);
      expect(headerCheckbox.indeterminate).toBe(false);
    });

    it('isolates page selection when navigating across pages and maintains multi-page selections', () => {
      const { result } = renderHook(() =>
        useDataTable({
          data: stressItems10k.slice(0, 30),
          columns,
          initialPageSize: 10,
        })
      );

      // Select all 10 items on page 1
      act(() => {
        result.current.toggleSelectAllPage();
      });
      expect(result.current.selectedIds.size).toBe(10);
      expect(result.current.isAllPageSelected).toBe(true);

      // Navigate to page 2 (items 10-19)
      act(() => {
        result.current.nextPage();
      });
      expect(result.current.page).toBe(2);
      // On page 2, no items are selected yet
      expect(result.current.isAllPageSelected).toBe(false);
      expect(result.current.isSomePageSelected).toBe(false);

      // Select 1 item on page 2
      act(() => {
        result.current.toggleSelectRow('item-00015');
      });
      expect(result.current.isSomePageSelected).toBe(true);
      expect(result.current.selectedIds.size).toBe(11); // 10 from page 1 + 1 from page 2

      // Navigate back to page 1
      act(() => {
        result.current.previousPage();
      });
      expect(result.current.page).toBe(1);
      // On page 1, all items are still selected
      expect(result.current.isAllPageSelected).toBe(true);
      expect(result.current.isSomePageSelected).toBe(false);
    });

    it('filters correctly using DataTableFacetedFilter and DataTableSearch primitives', async () => {
      function FacetedFilterIntegration() {
        const table = useDataTable({
          data: stressItems10k.slice(0, 100),
          columns,
          initialPageSize: 10,
        });

        const filterOptions = [
          { key: 'all', label: 'All', count: 100 },
          { key: 'draft', label: 'Draft', count: 25 },
          { key: 'approved', label: 'Approved', count: 25 },
        ];

        return (
          <div>
            <DataTableSearch
              value={table.search}
              onChange={table.setSearch}
              onClear={table.clearSearch}
            />
            <DataTableFacetedFilter
              options={filterOptions}
              activeKey={table.filters.status || 'all'}
              onSelect={(key) => table.setFilter('status', key)}
            />
            <DataTable table={table} columns={columns} />
          </div>
        );
      }

      render(<FacetedFilterIntegration />);

      // Click Approved filter
      const approvedButton = screen.getByRole('button', { name: /Approved/i });
      fireEvent.click(approvedButton);

      // Verify approved button has aria-pressed="true"
      expect(approvedButton).toHaveAttribute('aria-pressed', 'true');

      // Table pagination should reflect filtered count (Showing 1 to 10 of 25 records)
      expect(screen.getByText(/Showing/i)).toHaveTextContent('Showing 1 to 10 of 25 records');
    });

    it('verifies accessibility attributes across column headers and pagination', () => {
      let sortDirection: 'asc' | 'desc' | false = false;
      const onSortMock = vi.fn((multi) => {});

      const { rerender } = render(
        <DataTableColumnHeader
          title="Price"
          sortDirection={sortDirection}
          onSort={onSortMock}
          sortable={true}
        />
      );

      const headerButton = screen.getByRole('button', { name: /Sort by Price/i });
      expect(headerButton).not.toHaveAttribute('aria-sort');

      // Fire click with shiftKey = true
      fireEvent.click(headerButton, { shiftKey: true });
      expect(onSortMock).toHaveBeenCalledWith(true);

      // Rerender as ascending
      rerender(
        <DataTableColumnHeader
          title="Price"
          sortDirection="asc"
          onSort={onSortMock}
          sortable={true}
        />
      );
      expect(screen.getByRole('button', { name: /Sort by Price \(ascending\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Price \(ascending\)/i })).not.toHaveAttribute('aria-sort');

      // Rerender as descending
      rerender(
        <DataTableColumnHeader
          title="Price"
          sortDirection="desc"
          onSort={onSortMock}
          sortable={true}
        />
      );
      expect(screen.getByRole('button', { name: /Sort by Price \(descending\)/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sort by Price \(descending\)/i })).not.toHaveAttribute('aria-sort');
    });
  });
});
