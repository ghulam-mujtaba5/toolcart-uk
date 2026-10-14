import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface FilterPillProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  count?: number;
  variant?: 'primary' | 'accent';
  onRemove?: () => void;
}

const FilterPill = React.forwardRef<HTMLButtonElement, FilterPillProps>(
  (
    {
      className,
      active = false,
      count,
      variant = 'primary',
      onRemove,
      children,
      onClick,
      disabled,
      ...props
    },
    ref
  ) => {
    if (onRemove && active) {
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all select-none font-body',
            'min-h-[32px] focus-within:ring-2 focus-within:ring-tc-focus focus-within:ring-offset-1',
            variant === 'primary' &&
              'bg-tc-primary text-white border-[1.5px] border-tc-primary shadow-sm hover:bg-tc-primary-hover hover:border-tc-primary-hover',
            variant === 'accent' &&
              'bg-tc-action-lime text-tc-ink border-2 border-tc-ink shadow-sm hover:bg-tc-lime-hover',
            className
          )}
        >
          <button
            ref={ref}
            type="button"
            aria-pressed={true}
            disabled={disabled}
            onClick={onClick}
            className={cn(
              'inline-flex items-center pl-3 pr-1 py-1.5 focus-visible:outline-none text-xs font-semibold font-body rounded-l-full',
              variant === 'primary' ? 'text-white' : 'text-tc-ink'
            )}
            {...props}
          >
            <span>{children}</span>
            {count !== undefined && (
              <span
                className={cn(
                  'ml-1.5 tabular-nums text-[11px] font-medium opacity-85',
                  variant === 'primary' ? 'text-white' : 'text-tc-ink'
                )}
              >
                ({count})
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.stopPropagation();
                e.preventDefault();
                onRemove();
              }
            }}
            className={cn(
              'pr-2.5 pl-1 py-1.5 rounded-r-full transition-colors focus-visible:outline-none inline-flex items-center justify-center',
              variant === 'primary'
                ? 'hover:bg-tc-primary-hover hover:text-white text-white'
                : 'hover:bg-tc-ink/10 text-tc-ink'
            )}
            aria-label="Remove filter"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      );
    }

    return (
      <button
        ref={ref}
        type="button"
        aria-pressed={active}
        disabled={disabled}
        onClick={onClick}
        className={cn(
          'inline-flex items-center justify-center rounded-full text-xs font-semibold transition-all select-none font-body',
          'px-3 py-1.5 min-h-[32px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-focus focus-visible:ring-offset-1',
          'disabled:opacity-50 disabled:pointer-events-none',
          !active &&
            'bg-white text-tc-ink border-[1.5px] border-tc-border-strong hover:bg-tc-canvas hover:border-[#94A8C9]',
          active &&
            variant === 'primary' &&
            'bg-tc-primary text-white border-[1.5px] border-tc-primary shadow-sm hover:bg-tc-primary-hover hover:border-tc-primary-hover',
          active &&
            variant === 'accent' &&
            'bg-tc-action-lime text-tc-ink border-2 border-tc-ink shadow-sm hover:bg-tc-lime-hover',
          className
        )}
        {...props}
      >
        <span>{children}</span>
        {count !== undefined && (
          <span
            className={cn(
              'ml-1.5 tabular-nums text-[11px] font-medium opacity-85',
              active && variant === 'primary' ? 'text-white' : 'text-tc-ink'
            )}
          >
            ({count})
          </span>
        )}
      </button>
    );
  }
);
FilterPill.displayName = 'FilterPill';

export { FilterPill };
