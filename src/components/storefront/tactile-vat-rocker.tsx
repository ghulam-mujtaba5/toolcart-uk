'use client';

import React from 'react';
import { useVAT } from '@/context/vat-context';
import { cn } from '@/lib/utils';

export interface TactileVatRockerProps {
  className?: string;
  size?: 'sm' | 'md';
}

export function TactileVatRocker({ className, size = 'sm' }: TactileVatRockerProps) {
  const { mode, setMode } = useVAT();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setMode('inc');
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setMode('ex');
    }
  };

  const isInc = mode === 'inc';
  const isEx = mode === 'ex';

  return (
    <div
      role="radiogroup"
      aria-label="VAT Pricing Mode Toggle"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center p-1 rounded-full border-2 border-tc-ink bg-[#EDF0F5]',
        'shadow-[inset_0_2px_4px_rgba(24,35,54,0.18)] select-none outline-none focus-visible:ring-2 focus-visible:ring-tc-primary',
        'transition-transform duration-150 active:scale-[0.98]',
        className
      )}
    >
      {/* Inc. VAT (DIY) Rocker Button */}
      <button
        type="button"
        role="radio"
        aria-checked={isInc}
        tabIndex={isInc ? 0 : -1}
        onClick={() => setMode('inc')}
        className={cn(
          'relative rounded-full transition-all duration-200 select-none cursor-pointer',
          'flex items-center justify-center font-body',
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
          isInc
            ? 'bg-tc-primary text-white font-bold shadow-md transform scale-100 z-10'
            : 'text-tc-text-secondary hover:text-tc-ink hover:bg-black/5 opacity-80'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <span>Inc. VAT</span>
        <span className={cn('ml-1 text-[10px] font-normal', isInc ? 'text-white/90' : 'text-tc-text-secondary')}>
          (DIY)
        </span>
      </button>

      {/* Ex. VAT (Trade) Rocker Button */}
      <button
        type="button"
        role="radio"
        aria-checked={isEx}
        tabIndex={isEx ? 0 : -1}
        onClick={() => setMode('ex')}
        className={cn(
          'relative rounded-full transition-all duration-200 select-none cursor-pointer',
          'flex items-center justify-center font-body',
          size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-1.5 text-sm',
          isEx
            ? 'bg-tc-action-lime text-tc-ink font-extrabold border-2 border-tc-ink shadow-md transform scale-100 z-10'
            : 'text-tc-text-secondary hover:text-tc-ink hover:bg-black/5 opacity-80'
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
      >
        <span>Ex. VAT</span>
        <span className={cn('ml-1 text-[10px] font-bold', isEx ? 'text-tc-ink/90' : 'text-tc-text-secondary')}>
          (Trade)
        </span>
      </button>
    </div>
  );
}
