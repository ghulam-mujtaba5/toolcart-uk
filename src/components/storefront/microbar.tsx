'use client';

import React from 'react';
import Link from 'next/link';
import { VatToggle } from './vat-toggle';
import { ShieldAlert, Truck } from 'lucide-react';

export function Microbar() {
  return (
    <div className="w-full text-xs font-sans">
      {/* Top Governance / Provisional Brand Notice */}
      <div className="bg-tc-ink text-white py-1 px-4 text-center tracking-wide font-medium flex items-center justify-center gap-2">
        <ShieldAlert className="w-3.5 h-3.5 text-tc-action-lime shrink-0" />
        <span className="font-mono text-[10px] sm:text-xs">
          STAGING PROTOTYPE · TOOLCART BRAND PROVISIONAL
          <span className="hidden sm:inline"> · AVAILABILITY SUBJECT TO SUPPLIER CONFIRMATION</span>
        </span>
      </div>

      {/* Utility Microbar */}
      <div className="bg-tc-surface-soft border-b border-[#C8D9F9] py-1 px-3 sm:py-1.5 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-[11px] sm:text-xs">
          {/* Left: Store promise & delivery note */}
          <div className="flex items-center gap-2 sm:gap-3 text-tc-text-secondary truncate">
            <span className="font-semibold text-tc-ink shrink-0 hidden sm:inline">UK Trade &amp; DIY Supplies</span>
            <span className="font-semibold text-tc-ink shrink-0 sm:hidden">UK Trade</span>
            <span className="hidden md:inline text-tc-border-strong">•</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Truck className="w-3 h-3 text-tc-primary" />
              Free UK delivery over £50 ex. VAT
            </span>
            <span className="hidden lg:inline text-tc-border-strong">•</span>
            <span className="hidden lg:inline">Direct UK Distribution</span>
          </div>

          {/* Right: VAT Mode Switcher & Quick Navigation */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[11px] text-tc-text-secondary hidden sm:inline">Pricing:</span>
              <VatToggle />
            </div>
            <Link
              href="/trade"
              className="text-tc-primary hover:text-tc-primary-hover font-semibold text-[11px] sm:text-xs underline-offset-2 hover:underline shrink-0"
            >
              Trade<span className="hidden sm:inline"> Accounts</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
