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
        <span>
          STAGING PROTOTYPE · TOOLCART BRAND PROVISIONAL · AVAILABILITY SUBJECT TO SUPPLIER CONFIRMATION
        </span>
      </div>

      {/* Utility Microbar */}
      <div className="bg-tc-surface-soft border-b border-[#C8D9F9] py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          {/* Left: Store promise & delivery note */}
          <div className="flex items-center gap-3 text-tc-text-secondary text-[11px] sm:text-xs">
            <span className="font-semibold text-tc-ink">UK Trade & DIY Hardware Supplies</span>
            <span className="hidden md:inline text-tc-border-strong">•</span>
            <span className="hidden md:inline-flex items-center gap-1">
              <Truck className="w-3 h-3 text-tc-primary" />
              Free UK delivery over £50 ex. VAT
            </span>
            <span className="hidden lg:inline text-tc-border-strong">•</span>
            <span className="hidden lg:inline">24h Supplier Stock Freshness TTL</span>
          </div>

          {/* Right: VAT Mode Switcher & Quick Navigation */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-tc-text-secondary hidden sm:inline">Pricing:</span>
              <VatToggle />
            </div>
            <Link
              href="/trade"
              className="text-tc-primary hover:text-tc-primary-hover font-semibold text-[11px] sm:text-xs underline-offset-2 hover:underline"
            >
              Trade Accounts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
