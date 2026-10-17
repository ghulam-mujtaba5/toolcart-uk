'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TradeSpecifierHero() {
  return (
    <section className="relative bg-tc-ink text-white border-b border-tc-graphite overflow-hidden">
      {/* Full-Bleed Panoramic Photographic Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero/hero-craftsman-bench.webp"
          alt="ToolCart British Craftsman Workbench with Certified Trade Tools and Fixings"
          fill
          priority
          sizes="100vw"
          className="object-cover object-right lg:object-center opacity-95"
        />
        {/* Dual Responsive Ambient Gradient Overlay:
            On mobile: top-to-bottom dark vignette for text readability.
            On desktop (md+): rich left-to-right dark ink overlay revealing the real craftsman workbench on the right. */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-tc-ink via-tc-ink/95 via-50% to-tc-ink/20 md:to-transparent" />
        <div className="absolute inset-0 bg-tc-ink/35 md:bg-transparent" />
      </div>

      {/* Hero Content Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-28">
        <div className="max-w-2xl space-y-6">
          {/* Master Headline */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
            Proper kit. Trade prices. <br />
            <span className="text-tc-action-lime">On time, every time.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#DFE8F6] max-w-xl leading-relaxed font-body">
            No inflated counter markups, no flimsy tools, and no missing fixings. Certified BS EN &amp; UKCA hardware, guaranteed exact pack counts, and tracked next-day delivery straight to site or doorstep.
          </p>

          {/* 4 Conversion & Trust Pillars with Bespoke 3D Claymorphic Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm text-[#DFE8F6] font-medium">
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/3d/icons/icon-specs.webp"
                alt="BS EN & UKCA Certified"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>BS EN &amp; UKCA Certified Specs</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/3d/icons/icon-pack-options.webp"
                alt="Exact GTIN-13 Pack Counts"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>Exact GTIN-13 Pack Counts</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/3d/icons/icon-kits.webp"
                alt="Free Tracked 24 over £50"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>Free Tracked 24 over £50 ex. VAT</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Image
                src="/images/3d/icons/icon-trade-diy.webp"
                alt="30-Day Trade Credit & DIY Direct"
                width={24}
                height={24}
                className="w-6 h-6 object-contain shrink-0"
              />
              <span>30-Day Trade Credit &amp; DIY Direct</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-4">
            <Button
              variant="accent"
              size="lg"
              asChild
              className="bg-tc-action-lime hover:bg-tc-lime-hover text-tc-ink border-2 border-tc-ink font-heading font-extrabold text-xs sm:text-sm uppercase tracking-wider px-6 h-12 shadow-md active:scale-95"
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
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 backdrop-blur-xs font-heading font-bold text-xs sm:text-sm uppercase tracking-wider px-6 h-12 active:scale-95"
            >
              <Link href="/trade">
                <span>Open Trade Account</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
