'use client';

import React, { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';

export interface CopyBadgeProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string;
  label?: string; // e.g. "SKU", "EAN-13", "MPN", "GTIN"
  displayValue?: string; // Optional custom display text, defaults to value
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  timeoutMs?: number; // Default 1500ms
}

export function CopyBadge({
  value,
  label,
  displayValue,
  size = 'sm',
  className,
  timeoutMs = 1500,
  onClick,
  onKeyDown,
  ...rest
}: CopyBadgeProps) {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const shownText = displayValue ?? value;

  const handleCopy = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
        } else if (typeof document !== 'undefined') {
          // Fallback for non-secure / iframe contexts
          const textArea = document.createElement('textarea');
          textArea.value = value;
          textArea.style.position = 'fixed';
          textArea.style.left = '-9999px';
          textArea.style.top = '0';
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
        }
        setCopied(true);

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          setCopied(false);
        }, timeoutMs);
      } catch (err) {
        // Fallback silently if clipboard is unavailable
        console.warn('Clipboard copy failed:', err);
      }
    },
    [value, timeoutMs]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleCopy(e);
    }
    onKeyDown?.(e);
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-[10px] gap-1',
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-2.5 py-1 text-sm gap-2',
  }[size];

  const iconSizeClasses = {
    xs: 'w-2.5 h-2.5',
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }[size];

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      aria-label={
        copied
          ? `${label ? `${label} ` : ''}${value} copied to clipboard`
          : `Copy ${label ? `${label} ` : ''}${value} to clipboard`
      }
      aria-live="polite"
      onClick={(e) => {
        handleCopy(e);
        onClick?.(e);
      }}
      onKeyDown={handleKeyDown}
      className={cn(
        'inline-flex items-center justify-center min-h-[44px] min-w-[44px] font-mono rounded-md font-semibold select-none cursor-pointer',
        'transition-all duration-180 ease-out outline-none focus-visible:ring-2 focus-visible:ring-tc-primary',
        sizeClasses,
        copied
          ? 'bg-tc-action-lime text-tc-ink border-2 border-tc-ink font-extrabold shadow-sm scale-100'
          : 'bg-white text-tc-ink border border-tc-border hover:bg-tc-canvas hover:border-tc-border-strong shadow-2xs',
        className
      )}
      {...rest}
    >
      {copied ? (
        <>
          <Check className={cn(iconSizeClasses, 'text-tc-ink stroke-[3] shrink-0')} />
          <span>
            {label && <span className="opacity-80">{label}: </span>}
            <span className="font-extrabold">{shownText}</span>
            <span className="ml-1 uppercase text-[9px] tracking-wider px-1 py-0.5 bg-tc-ink text-white rounded font-bold">
              COPIED
            </span>
          </span>
        </>
      ) : (
        <>
          <Copy className={cn(iconSizeClasses, 'text-tc-text-secondary shrink-0')} />
          <span>
            {label && <span className="text-tc-text-secondary font-medium mr-1">{label}:</span>}
            <span className="text-tc-ink font-bold tabular-nums">{shownText}</span>
          </span>
        </>
      )}
    </button>
  );
}
