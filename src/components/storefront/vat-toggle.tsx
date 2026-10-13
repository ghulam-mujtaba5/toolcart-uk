'use client';

import React from 'react';
import { useVAT } from '@/context/vat-context';
import { cn } from '@/lib/utils';

interface VatToggleProps {
  className?: string;
}

export function VatToggle({ className }: VatToggleProps) {
  const { mode, setMode } = useVAT();

  return (
    <div
      role="radiogroup"
      aria-label="VAT Pricing Mode Toggle"
      className={cn(
        'inline-flex items-center p-0.5 rounded-full bg-white border border-tc-border shadow-xs text-xs font-medium',
        className
      )}
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'inc'}
        onClick={() => setMode('inc')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-150',
          mode === 'inc'
            ? 'bg-tc-primary text-white font-semibold shadow-xs'
            : 'text-tc-text-secondary hover:text-tc-ink'
        )}
      >
        Inc. VAT <span className="text-[10px] opacity-80">(DIY)</span>
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={mode === 'ex'}
        onClick={() => setMode('ex')}
        className={cn(
          'px-2.5 py-1 rounded-full transition-all duration-150',
          mode === 'ex'
            ? 'bg-tc-action-lime text-tc-ink font-bold border border-tc-ink shadow-xs'
            : 'text-tc-text-secondary hover:text-tc-ink'
        )}
      >
        Ex. VAT <span className="text-[10px] opacity-80">(Trade)</span>
      </button>
    </div>
  );
}
