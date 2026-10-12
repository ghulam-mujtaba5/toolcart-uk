import * as React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'success' | 'warning' | 'danger' | 'neutral';
  subtle?: boolean;
  size?: 'sm' | 'md';
}

const badgeVariants = {
  base: 'inline-flex items-center font-body font-semibold uppercase tracking-wider rounded-full select-none justify-center',
  sizes: {
    sm: 'px-2 py-0.5 text-[10px] leading-tight',
    md: 'px-2.5 py-1 text-xs leading-normal',
  },
  solid: {
    lime: 'bg-tc-action-lime text-tc-ink border-[1.5px] border-tc-ink shadow-sm',
    success: 'bg-tc-success text-white border border-transparent',
    warning: 'bg-tc-warning text-white border border-transparent',
    danger: 'bg-tc-error text-white border border-transparent',
    neutral: 'bg-tc-ink text-white border border-transparent',
  },
  subtle: {
    // Lime badge is always high-contrast with dark Ink text & outline
    lime: 'bg-tc-action-lime text-tc-ink border-[1.5px] border-tc-ink shadow-sm',
    success: 'bg-[#E8F5E9] text-tc-success border border-[#A3D9B5]',
    warning: 'bg-[#FFF7E8] text-tc-warning border border-[#E8CB91]',
    danger: 'bg-[#FEECEB] text-tc-error border border-[#FECDCA]',
    neutral: 'bg-tc-surface-soft text-tc-ink border border-[#C8D9F9]',
  },
};

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'neutral', subtle = false, size = 'md', ...props }, ref) => {
    const styleMap = subtle ? badgeVariants.subtle : badgeVariants.solid;
    return (
      <span
        ref={ref}
        className={cn(
          badgeVariants.base,
          badgeVariants.sizes[size],
          styleMap[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Badge.displayName = 'Badge';

export { Badge, badgeVariants };
