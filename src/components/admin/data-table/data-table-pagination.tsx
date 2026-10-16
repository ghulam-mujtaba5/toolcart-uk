import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataTablePaginationProps {
  page: number;
  pageSize: number;
  totalPages: number;
  totalFilteredItems: number;
  pageSizeOptions?: number[];
  canPreviousPage: boolean;
  canNextPage: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  itemLabel?: string;
  className?: string;
}

export function DataTablePagination({
  page,
  pageSize,
  totalPages,
  totalFilteredItems,
  pageSizeOptions = [10, 25, 50, 100],
  canPreviousPage,
  canNextPage,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
  className = '',
}: DataTablePaginationProps) {
  const startItem = totalFilteredItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalFilteredItems);

  return (
    <div
      role="navigation"
      aria-label="Table pagination"
      className={`p-3.5 bg-tc-canvas border-t border-tc-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-tc-text-secondary ${className}`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span>
          Showing <strong className="text-tc-ink tabular-nums">{startItem}</strong> to{' '}
          <strong className="text-tc-ink tabular-nums">{endItem}</strong> of{' '}
          <strong className="text-tc-ink tabular-nums">{totalFilteredItems}</strong> {itemLabel}
        </span>

        <div className="flex items-center gap-1.5">
          <label htmlFor="data-table-page-size" className="text-xs font-bold uppercase text-tc-text-secondary">
            Show:
          </label>
          <select
            id="data-table-page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 px-2 bg-white border border-tc-border rounded-lg text-xs font-semibold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
            aria-label="Rows per page"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canPreviousPage}
          onClick={() => onPageChange(page - 1)}
          className="min-h-[36px] h-9 px-3 text-xs bg-white text-tc-ink border-tc-border disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
          Previous
        </Button>
        <span className="text-xs font-semibold px-2 text-tc-ink tabular-nums">
          Page {page} of {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canNextPage}
          onClick={() => onPageChange(page + 1)}
          className="min-h-[36px] h-9 px-3 text-xs bg-white text-tc-ink border-tc-border disabled:opacity-40"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5 ml-1" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
