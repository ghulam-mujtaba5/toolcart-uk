'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, PackageCheck, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TradeSpecifierHero() {
  return (
    <section className="bg-white border-b border-tc-border overflow-hidden">
      {/* Hero Stage: Clean, Authoritative, High-Converting */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          {/* Left Column: Authoritative Copy (7 cols) */}
          <div className="lg:col-span-7 space-y-4 sm:space-y-6">
            <div className="text-xs font-mono font-bold tracking-wider uppercase text-tc-primary">
              Direct UK Trade Hardware &amp; Supplies
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl lg:text-5xl text-tc-ink tracking-tight leading-[1.15]">
              The Hardware Standard <br className="hidden sm:inline" />
              <span className="text-tc-primary">for British Trades.</span>
            </h1>

            {/* Subtext */}
            <p className="text-xs sm:text-base text-tc-graphite max-w-xl leading-relaxed">
              Trade-grade hand tools, certified fixings, and site consumables. Guaranteed British Standards, transparent pack counts, and tracked next-day delivery to UK sites and workshops.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="bg-tc-primary hover:bg-tc-primary-hover text-white min-h-[44px] sm:min-h-[48px] px-6 text-xs sm:text-sm font-bold shadow-xs"
              >
                <Link href="/search" className="flex items-center gap-2">
                  <span>Browse Full Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-tc-ink text-tc-ink hover:bg-tc-canvas min-h-[44px] sm:min-h-[48px] px-6 text-xs sm:text-sm font-bold"
              >
                <Link href="/trade">
                  <span>Open Trade Account</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Column: Clean Hardware Showcase Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border border-tc-border bg-white shadow-md group">
              {/* Product Visual */}
              <div className="relative aspect-[4/3] w-full bg-tc-canvas">
                <Image
                  src="/images/hero/hero-workbench.webp"
                  alt="ToolCart Verified UK Trade Hardware Workbench"
                  fill
                  className="object-cover group-hover:scale-102 transition-transform duration-500"
                  priority
                />
              </div>

              {/* Bottom Quick Feature Highlights */}
              <div className="p-4 bg-white grid grid-cols-2 gap-3 text-xs border-t border-tc-border">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-tc-primary shrink-0" />
                  <div>
                    <p className="font-bold text-tc-ink leading-tight">Exact GTIN Counts</p>
                    <p className="text-[11px] text-tc-text-secondary">No mystery blister packs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-tc-primary shrink-0" />
                  <div>
                    <p className="font-bold text-tc-ink leading-tight">Same-Day Dispatch</p>
                    <p className="text-[11px] text-tc-text-secondary">Orders before 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
