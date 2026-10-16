import React from 'react';
import { Search, X } from 'lucide-react';

export interface DataTableSearchProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export function DataTableSearch({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  className = '',
  id = 'data-table-search-input',
}: DataTableSearchProps) {
  return (
    <div className={`relative w-full sm:max-w-md ${className}`}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-8 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white transition-colors"
      />
      <Search
        className="w-4 h-4 text-tc-text-secondary absolute left-3 top-3 pointer-events-none"
        aria-hidden="true"
      />
      {value && (
        <button
          type="button"
          onClick={() => {
            if (onClear) onClear();
            else onChange('');
          }}
          className="absolute right-2.5 top-2.5 p-0.5 text-tc-text-secondary hover:text-tc-ink rounded focus:outline-none focus:ring-2 focus:ring-tc-primary"
          aria-label="Clear search input"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
