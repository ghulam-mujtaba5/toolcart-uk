'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { IconStockRadar } from '@/components/ui/trade-icons';

export type StockAvailabilityStatus =
  | 'in_stock'
  | 'subject_to_confirmation'
  | 'unavailable'
  | (string & {});

export interface StockRadarBadgeProps {
  status?: StockAvailabilityStatus;
  stockQuantity?: number | null;
  feedTimestamp?: string | Date;
  supplierName?: string;
  facilityLocation?: string;
  size?: 'sm' | 'md';
  showDetailsPopover?: boolean;
  className?: string;
}

export function StockRadarBadge({
  status = 'in_stock',
  stockQuantity,
  supplierName = 'Status International (UK) Ltd',
  facilityLocation = 'West Yorkshire Hub',
  size = 'sm',
  showDetailsPopover = false,
  className,
}: StockRadarBadgeProps) {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const isAvailable = status === 'in_stock';
  const isPending = status === 'subject_to_confirmation';

  // Label configuration based on status
  let labelText = 'Stock verified < 24h';
  let badgeTone = 'success';

  if (isAvailable) {
    labelText = 'Stock verified < 24h • Confirmed in stock';
    badgeTone = 'success';
  } else if (isPending) {
    labelText = 'Stock quote > 24h • Confirming';
    badgeTone = 'warning';
  } else {
    labelText = 'Subject to supplier confirmation';
    badgeTone = 'muted';
  }

  const toneClasses = {
    success: 'bg-white/90 text-tc-ink border-tc-border/80 backdrop-blur-xs',
    warning: 'bg-[#FFF7E8] text-tc-warning border-[#E8CB91]',
    muted: 'bg-[#F2F4F7] text-tc-text-secondary border-tc-border',
  }[badgeTone];

  const dotClasses = {
    success: 'bg-tc-success',
    warning: 'bg-tc-warning',
    muted: 'bg-[#98A2B3]',
  }[badgeTone];

  return (
    <div className="relative inline-block">
      <div
        role="status"
        aria-label={`Stock telemetry: ${labelText}`}
        onMouseEnter={() => showDetailsPopover && setIsPopoverOpen(true)}
        onMouseLeave={() => showDetailsPopover && setIsPopoverOpen(false)}
        onClick={() => showDetailsPopover && setIsPopoverOpen((prev) => !prev)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full border shadow-2xs font-semibold select-none max-w-full',
          'transition-all duration-150',
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
          toneClasses,
          showDetailsPopover ? 'cursor-pointer hover:shadow-xs' : 'cursor-default',
          className
        )}
      >
        {/* Status Indicator Dot */}
        <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotClasses)} />
        </span>

        {/* Status Text */}
        <span className="tabular-nums font-medium tracking-tight truncate max-w-[140px] sm:max-w-none">{labelText}</span>
      </div>

      {/* Interactive Telemetry Popover */}
      {showDetailsPopover && isPopoverOpen && (
        <div
          role="tooltip"
          className="absolute left-0 top-full mt-2 w-64 p-3 bg-white rounded-xl border border-tc-border shadow-xl z-50 text-xs text-tc-ink animate-in fade-in-50 zoom-in-95"
        >
          <div className="flex items-center justify-between pb-2 border-b border-tc-border/60">
            <span className="font-heading font-bold text-tc-ink flex items-center gap-1.5">
              <IconStockRadar size={16} className="text-tc-primary" />
              Stock Telemetry
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-tc-canvas font-bold text-tc-text-secondary">
              TTL &lt;24h
            </span>
          </div>

          <div className="mt-2.5 space-y-1.5 text-[11px]">
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">Supplier Feed:</span>
              <span className="font-semibold text-right">{supplierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">Hub Facility:</span>
              <span className="font-medium">{facilityLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">Dispatch SLA:</span>
              <span className="font-medium text-tc-success">2–3 business days</span>
            </div>
          </div>

          <p className="mt-2 pt-2 border-t border-tc-border/60 text-[10px] text-tc-text-secondary leading-tight">
            Automated stock verification synced directly from supplier quotation feeds.
          </p>
        </div>
      )}
    </div>
  );
}
