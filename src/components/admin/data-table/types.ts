import React from 'react';

export type SortDirection = 'asc' | 'desc';

export interface ColumnSort {
  id: string;
  desc: boolean;
}

export interface DataTableColumn<T> {
  id: string;
  header: string | ((props: { column: DataTableColumn<T>; sortDirection: SortDirection | false }) => React.ReactNode);
  accessorKey?: keyof T | ((row: T) => any);
  sortable?: boolean;
  cell?: (props: { row: T; value: any; isSelected: boolean }) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

export interface UseDataTableOptions<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  getRowId?: (row: T) => string;
  initialPage?: number;
  initialPageSize?: number;
  pageSizeOptions?: number[];
  initialSorting?: ColumnSort[];
  searchFields?: (keyof T | ((row: T) => string))[];
  filterFns?: Record<string, (row: T, filterValue: string) => boolean>;
  debounceMs?: number;
}

export interface UseDataTableReturn<T> {
  // Data
  data: T[];
  paginatedData: T[];
  totalItems: number;
  filteredItems: number;

  // Sorting
  sorting: ColumnSort[];
  toggleSort: (columnId: string, multi?: boolean) => void;
  getSortDirection: (columnId: string) => SortDirection | false;
  clearSorting: () => void;

  // Search
  search: string;
  setSearch: (value: string) => void;
  debouncedSearch: string;
  clearSearch: () => void;

  // Filters
  filters: Record<string, string>;
  setFilter: (key: string, value: string) => void;
  clearFilters: () => void;

  // Pagination
  page: number;
  pageIndex: number;
  pageSize: number;
  pageSizeOptions: number[];
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  previousPage: () => void;
  nextPage: () => void;

  // Selection
  selectedIds: Set<string>;
  selectedRows: T[];
  isAllPageSelected: boolean;
  isSomePageSelected: boolean;
  toggleSelectRow: (id: string) => void;
  toggleSelectAllPage: () => void;
  selectAll: () => void;
  clearSelection: () => void;
  isRowSelected: (id: string) => boolean;
}
