import * as React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onClear?: () => void;
  isLoading?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, value, onChange, onClear, isLoading, placeholder = 'Search catalog, SKUs, MPNs, or tools...', disabled, onKeyDown, ...props }, ref) => {
    const hasValue = value !== undefined && value !== null && String(value).length > 0;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && hasValue && onClear) {
        e.preventDefault();
        onClear();
      }
      onKeyDown?.(e);
    };

    return (
      <div className="relative w-full">
        <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center text-tc-text-secondary">
          <Search className="h-4 w-4" aria-hidden="true" />
        </div>
        <input
          type="search"
          role="searchbox"
          ref={ref}
          value={value ?? ''}
          onChange={onChange}
          disabled={disabled}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            'w-full bg-white text-tc-ink font-body text-sm rounded-[var(--radius-button)]',
            'border-[1.8px] border-tc-border-strong pl-10 pr-10 py-2.5 min-h-[44px]',
            'placeholder:text-tc-text-secondary transition-colors',
            'focus:outline-none focus:border-tc-primary focus:ring-2 focus:ring-tc-primary/20',
            'disabled:bg-tc-canvas disabled:text-tc-border-strong disabled:cursor-not-allowed',
            '[&::-webkit-search-cancel-button]:hidden', // hide native webkit clear button in favor of accessible custom one
            className
          )}
          {...props}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-tc-primary" aria-label="Searching" />
          )}
          {!isLoading && hasValue && onClear && (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="rounded p-1 text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas focus:outline-none focus-visible:ring-2 focus-visible:ring-tc-focus"
              aria-label="Clear search input"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = 'SearchInput';

export { SearchInput };
