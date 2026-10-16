import React, { useRef, useEffect } from 'react';
import { DataTableColumn, UseDataTableReturn } from './types';
import { DataTableColumnHeader } from './data-table-column-header';
import { DataTablePagination } from './data-table-pagination';

export interface DataTableProps<T> {
  table: UseDataTableReturn<T>;
  columns: DataTableColumn<T>[];
  enableRowSelection?: boolean;
  getRowId?: (row: T) => string;
  emptyMessage?: string;
  itemLabel?: string;
  className?: string;
}

export function DataTable<T>({
  table,
  columns,
  enableRowSelection = true,
  getRowId = (row: any) => row.id || String(row.id),
  emptyMessage = 'No matching records found.',
  itemLabel = 'records',
  className = '',
}: DataTableProps<T>) {
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Synchronize indeterminate property on the header checkbox
  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = table.isSomePageSelected;
    }
  }, [table.isSomePageSelected]);

  return (
    <div className={`bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs divide-y divide-tc-border">
          <thead className="bg-[#182336] text-white">
            <tr>
              {enableRowSelection && (
                <th scope="col" className="w-10 px-4 py-3.5 text-center">
                  <span className="sr-only">Select all on current page</span>
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={table.isAllPageSelected}
                    onChange={table.toggleSelectAllPage}
                    aria-label="Select all rows on page"
                    className="w-4 h-4 rounded border-tc-border text-tc-primary focus:ring-2 focus:ring-tc-action-lime cursor-pointer accent-tc-primary"
                  />
                </th>
              )}

              {columns.map((column) => {
                const sortDir = table.getSortDirection(column.id);
                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={`py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] ${
                      column.align === 'center'
                        ? 'text-center'
                        : column.align === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${column.headerClassName || ''}`}
                  >
                    {typeof column.header === 'function' ? (
                      column.header({ column, sortDirection: sortDir })
                    ) : (
                      <DataTableColumnHeader
                        title={column.header}
                        sortDirection={sortDir}
                        sortable={column.sortable}
                        onSort={(multi) => table.toggleSort(column.id, multi)}
                      />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-tc-border/60 bg-white">
            {table.paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (enableRowSelection ? 1 : 0)}
                  className="py-12 text-center text-tc-text-secondary"
                >
                  <p className="font-semibold text-sm text-tc-ink">{emptyMessage}</p>
                  <p className="text-xs text-tc-text-secondary mt-1">
                    Try adjusting your search query or clearing active filters.
                  </p>
                </td>
              </tr>
            ) : (
              table.paginatedData.map((row) => {
                const rowId = getRowId(row);
                const isSelected = table.isRowSelected(rowId);

                return (
                  <tr
                    key={rowId}
                    className={`transition-colors ${
                      isSelected ? 'bg-tc-surface-soft/80' : 'hover:bg-tc-surface-soft/40'
                    }`}
                  >
                    {enableRowSelection && (
                      <td className="w-10 px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => table.toggleSelectRow(rowId)}
                          aria-label={`Select row ${rowId}`}
                          className="w-4 h-4 rounded border-tc-border text-tc-primary focus:ring-2 focus:ring-tc-action-lime cursor-pointer accent-tc-primary"
                        />
                      </td>
                    )}

                    {columns.map((column) => {
                      const value = column.accessorKey
                        ? typeof column.accessorKey === 'function'
                          ? column.accessorKey(row)
                          : (row as any)[column.accessorKey]
                        : (row as any)[column.id];

                      return (
                        <td
                          key={column.id}
                          className={`py-3 px-4 text-tc-ink ${
                            column.align === 'center'
                              ? 'text-center'
                              : column.align === 'right'
                              ? 'text-right'
                              : 'text-left'
                          } ${column.className || ''}`}
                        >
                          {column.cell ? column.cell({ row, value, isSelected }) : String(value ?? '')}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <DataTablePagination
        page={table.page}
        pageSize={table.pageSize}
        totalPages={table.totalPages}
        totalFilteredItems={table.filteredItems}
        pageSizeOptions={table.pageSizeOptions}
        canPreviousPage={table.canPreviousPage}
        canNextPage={table.canNextPage}
        onPageChange={table.setPage}
        onPageSizeChange={table.setPageSize}
        itemLabel={itemLabel}
      />
    </div>
  );
}
