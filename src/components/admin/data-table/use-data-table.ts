import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ColumnSort,
  SortDirection,
  UseDataTableOptions,
  UseDataTableReturn,
} from './types';

export function useDataTable<T>({
  data,
  columns,
  getRowId = (row: any) => row.id || String(row.id),
  initialPage = 1,
  initialPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  initialSorting = [],
  searchFields = [],
  filterFns = {},
  debounceMs = 300,
}: UseDataTableOptions<T>): UseDataTableReturn<T> {
  // Search state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Sorting state (multi-column support)
  const [sorting, setSorting] = useState<ColumnSort[]>(initialSorting);

  // Filters state
  const [filters, setFilters] = useState<Record<string, string>>({});

  // Pagination state
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Row selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 300ms Search Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, debounceMs);
    return () => clearTimeout(timer);
  }, [search, debounceMs]);

  // Toggle column sort
  const toggleSort = useCallback((columnId: string, multi: boolean = false) => {
    setSorting((prev) => {
      const existingIndex = prev.findIndex((s) => s.id === columnId);

      if (multi) {
        if (existingIndex >= 0) {
          const current = prev[existingIndex];
          if (!current.desc) {
            // asc -> desc
            const next = [...prev];
            next[existingIndex] = { id: columnId, desc: true };
            return next;
          } else {
            // desc -> remove
            return prev.filter((s) => s.id !== columnId);
          }
        } else {
          return [...prev, { id: columnId, desc: false }];
        }
      } else {
        if (existingIndex >= 0) {
          const current = prev[existingIndex];
          if (!current.desc) {
            return [{ id: columnId, desc: true }];
          } else {
            return [];
          }
        } else {
          return [{ id: columnId, desc: false }];
        }
      }
    });
  }, []);

  const getSortDirection = useCallback(
    (columnId: string): SortDirection | false => {
      const sort = sorting.find((s) => s.id === columnId);
      if (!sort) return false;
      return sort.desc ? 'desc' : 'asc';
    },
    [sorting]
  );

  const clearSorting = useCallback(() => {
    setSorting([]);
  }, []);

  const clearSearch = useCallback(() => {
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (value === '' || value === 'all') {
        const next = { ...prev };
        delete next[key];
        return next;
      }
      return { ...prev, [key]: value };
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setPage(1);
  }, []);

  // Filtered and Sorted Data
  const filteredAndSortedData = useMemo(() => {
    // 1. Filter by search
    let result = data.filter((row) => {
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim();
        const matches =
          searchFields.length > 0
            ? searchFields.some((field) => {
                const val = typeof field === 'function' ? field(row) : (row as any)[field];
                return val !== undefined && val !== null && String(val).toLowerCase().includes(query);
              })
            : Object.values(row as Record<string, any>).some(
                (val) => val !== undefined && val !== null && String(val).toLowerCase().includes(query)
              );
        if (!matches) return false;
      }

      // 2. Filter by faceted filter predicates
      for (const [key, filterValue] of Object.entries(filters)) {
        if (!filterValue || filterValue === 'all') continue;
        const customFilter = filterFns[key];
        if (customFilter) {
          if (!customFilter(row, filterValue)) return false;
        } else {
          const rowVal = (row as any)[key];
          if (rowVal === undefined || String(rowVal) !== filterValue) return false;
        }
      }

      return true;
    });

    // 3. Multi-column Sort
    if (sorting.length > 0) {
      result = [...result].sort((a, b) => {
        for (const { id: columnId, desc } of sorting) {
          const col = columns.find((c) => c.id === columnId);
          let valA: any;
          let valB: any;

          if (col?.accessorKey) {
            valA = typeof col.accessorKey === 'function' ? col.accessorKey(a) : (a as any)[col.accessorKey];
            valB = typeof col.accessorKey === 'function' ? col.accessorKey(b) : (b as any)[col.accessorKey];
          } else {
            valA = (a as any)[columnId];
            valB = (b as any)[columnId];
          }

          if (valA === valB) continue;
          if (valA === undefined || valA === null) return 1;
          if (valB === undefined || valB === null) return -1;

          let comparison = 0;
          if (typeof valA === 'number' && typeof valB === 'number') {
            comparison = valA - valB;
          } else if (valA instanceof Date && valB instanceof Date) {
            comparison = valA.getTime() - valB.getTime();
          } else {
            comparison = String(valA).localeCompare(String(valB));
          }

          if (comparison !== 0) {
            return desc ? -comparison : comparison;
          }
        }
        return 0;
      });
    }

    return result;
  }, [data, debouncedSearch, searchFields, filters, filterFns, sorting, columns]);

  // Pagination calculations
  const totalItems = data.length;
  const filteredItems = filteredAndSortedData.length;
  const totalPages = Math.max(1, Math.ceil(filteredItems / pageSize));
  const currentPage = Math.min(Math.max(1, page), totalPages);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedData.slice(start, start + pageSize);
  }, [filteredAndSortedData, currentPage, pageSize]);

  const canPreviousPage = currentPage > 1;
  const canNextPage = currentPage < totalPages;

  const previousPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(totalPages, prev + 1));
  }, [totalPages]);

  // Selection calculations
  const pageIds = useMemo(() => paginatedData.map(getRowId), [paginatedData, getRowId]);

  const isAllPageSelected = useMemo(() => {
    return pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  }, [pageIds, selectedIds]);

  const isSomePageSelected = useMemo(() => {
    return pageIds.some((id) => selectedIds.has(id)) && !isAllPageSelected;
  }, [pageIds, selectedIds, isAllPageSelected]);

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAllPage = useCallback(() => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, [isAllPageSelected, pageIds]);

  const selectAll = useCallback(() => {
    const allFilteredIds = filteredAndSortedData.map(getRowId);
    setSelectedIds(new Set(allFilteredIds));
  }, [filteredAndSortedData, getRowId]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isRowSelected = useCallback(
    (id: string) => {
      return selectedIds.has(id);
    },
    [selectedIds]
  );

  const selectedRows = useMemo(() => {
    return data.filter((row) => selectedIds.has(getRowId(row)));
  }, [data, selectedIds, getRowId]);

  return {
    data,
    paginatedData,
    totalItems,
    filteredItems,
    sorting,
    toggleSort,
    getSortDirection,
    clearSorting,
    search,
    setSearch,
    debouncedSearch,
    clearSearch,
    filters,
    setFilter,
    clearFilters,
    page: currentPage,
    pageIndex: currentPage - 1,
    pageSize,
    pageSizeOptions,
    totalPages,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
    canPreviousPage,
    canNextPage,
    previousPage,
    nextPage,
    selectedIds,
    selectedRows,
    isAllPageSelected,
    isSomePageSelected,
    toggleSelectRow,
    toggleSelectAllPage,
    selectAll,
    clearSelection,
    isRowSelected,
  };
}
