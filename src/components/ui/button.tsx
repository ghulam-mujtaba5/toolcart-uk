import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-focus focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 select-none font-body',
  {
    variants: {
      variant: {
        primary:
          'bg-tc-primary text-white border-2 border-tc-primary hover:bg-tc-primary-hover hover:border-tc-primary-hover active:bg-[#143380] focus-visible:ring-tc-ink',
        accent:
          'bg-tc-action-lime text-tc-ink border-2 border-tc-ink hover:bg-tc-lime-hover active:bg-[#C2D146] focus-visible:ring-tc-ink shadow-sm',
        secondary:
          'bg-tc-surface text-tc-ink border-2 border-tc-border-strong hover:bg-tc-canvas',
        ghost:
          'bg-transparent text-tc-ink border-2 border-transparent hover:bg-tc-surface-soft hover:text-tc-primary',
        outline:
          'bg-white text-tc-primary border-2 border-tc-primary hover:bg-tc-surface-soft hover:text-tc-primary-hover hover:border-tc-primary-hover',
        danger:
          'bg-tc-error text-white border-2 border-tc-error hover:bg-[#991B1B] active:bg-[#7F1D1D]',
      },
      size: {
        default: 'min-h-[44px] px-4 py-2 text-sm',
        sm: 'min-h-[44px] sm:min-h-[36px] px-3 py-1.5 text-xs rounded-[8px]',
        md: 'min-h-[44px] px-4 py-2 text-sm',
        lg: 'min-h-[50px] px-6 py-3 text-base',
        icon: 'h-[44px] w-[44px] p-0',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    if (asChild) {
      return (
        <Slot
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          aria-busy={isLoading || undefined}
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="sr-only">Loading</span>
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 inline-flex items-center">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
