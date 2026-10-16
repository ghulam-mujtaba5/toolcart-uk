'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

export interface DragHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark';
  label?: string;
}

/**
 * DragHandle: Brand V3 tactile grab handle indicator for bottom sheets and drawers.
 * Provides accessible touch surface, centered grab pill, and tactile feedback.
 */
export function DragHandle({
  className,
  variant = 'light',
  label = 'Drag down to dismiss sheet',
  ...props
}: DragHandleProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      data-testid="sheet-drag-handle"
      className={cn(
        'w-full flex items-center justify-center py-2.5 cursor-grab active:cursor-grabbing touch-manipulation select-none shrink-0',
        className
      )}
      {...props}
    >
      <span
        className={cn(
          'w-12 h-1.5 rounded-full transition-all duration-150',
          variant === 'light'
            ? 'bg-tc-border-strong/60 sm:bg-slate-300 hover:bg-tc-border-strong'
            : 'bg-white/40 sm:bg-white/30 hover:bg-white/60'
        )}
      />
    </div>
  );
}
