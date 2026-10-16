import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { SortDirection } from './types';

export interface DataTableColumnHeaderProps {
  title: string;
  sortDirection: SortDirection | false;
  onSort?: (multi?: boolean) => void;
  className?: string;
  sortable?: boolean;
}

export function DataTableColumnHeader({
  title,
  sortDirection,
  onSort,
  className = '',
  sortable = true,
}: DataTableColumnHeaderProps) {
  if (!sortable || !onSort) {
    return (
      <span className={`font-bold uppercase tracking-wider text-[11px] ${className}`}>
        {title}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => onSort(e.shiftKey)}
      aria-label={`Sort by ${title}${sortDirection ? ` (${sortDirection}ending)` : ''}`}
      className={`group inline-flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] select-none hover:text-tc-action-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-action-lime rounded transition-colors ${className}`}
    >
      <span>{title}</span>
      {sortDirection === 'asc' && (
        <ArrowUp className="w-3.5 h-3.5 text-tc-action-lime shrink-0" aria-hidden="true" />
      )}
      {sortDirection === 'desc' && (
        <ArrowDown className="w-3.5 h-3.5 text-tc-action-lime shrink-0" aria-hidden="true" />
      )}
      {!sortDirection && (
        <ArrowUpDown
          className="w-3.5 h-3.5 text-white/40 group-hover:text-white/80 shrink-0 transition-colors"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
