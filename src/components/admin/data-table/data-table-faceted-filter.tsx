import React from 'react';

export interface FacetedFilterOption {
  key: string;
  label: string;
  count?: number;
}

export interface DataTableFacetedFilterProps {
  options: FacetedFilterOption[];
  activeKey: string;
  onSelect: (key: string) => void;
  className?: string;
  ariaLabel?: string;
}

export function DataTableFacetedFilter({
  options,
  activeKey,
  onSelect,
  className = '',
  ariaLabel = 'Filter options',
}: DataTableFacetedFilterProps) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={`flex flex-wrap items-center gap-2 border-b border-tc-border pb-3 ${className}`}
    >
      {options.map((option) => {
        const isActive = activeKey === option.key || (!activeKey && option.key === 'all');
        return (
          <button
            key={option.key}
            type="button"
            onClick={() => onSelect(option.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-primary ${
              isActive
                ? 'bg-tc-ink text-white shadow-xs'
                : 'bg-tc-canvas text-tc-text-secondary hover:text-tc-ink hover:bg-tc-border/40'
            }`}
            aria-pressed={isActive}
          >
            <span>{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] tabular-nums font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-tc-border text-tc-ink'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
