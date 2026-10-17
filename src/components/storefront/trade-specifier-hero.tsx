'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ShieldCheck, CheckCircle2, Truck, FileText } from 'lucide-react';
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
            On desktop (md+): rich left-to-right dark ink overlay, revealing the sunlit garden workshop on the right. */}
        <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-tc-ink via-tc-ink/95 via-50% to-tc-ink/30 md:to-transparent" />
        <div className="absolute inset-0 bg-tc-ink/35 md:bg-transparent" />
      </div>

      {/* Hero Content Stage */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-24">
        <div className="max-w-2xl space-y-5 sm:space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tc-action-lime/15 border border-tc-action-lime/40 text-tc-action-lime text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-tc-action-lime animate-pulse" />
            <span>Direct UK Hardware Supply · DIY &amp; Trade</span>
          </div>

          {/* Master Headline */}
          <h1 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.12]">
            The Hardware Standard <br />
            <span className="text-tc-action-lime">for British Homes &amp; Trades.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base lg:text-lg text-[#DFE8F6] max-w-xl leading-relaxed font-body">
            Trade-grade hand tools, certified fixings, and home renovation consumables. Guaranteed British Standards, transparent pack counts, and tracked next-day delivery to your door.
          </p>

          {/* 4 Conversion & Trust Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-xs text-[#DFE8F6]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-tc-action-lime shrink-0" />
              <span>BS EN IEC &amp; UKCA Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-tc-action-lime shrink-0" />
              <span>Exact GTIN-13 Pack Counts</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-tc-action-lime shrink-0" />
              <span>Free Tracked 24 over £50 ex. VAT</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-tc-action-lime shrink-0" />
              <span>30-Day Trade Credit &amp; DIY Direct</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
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

        {/* Quick Category Jump Bar */}
        <div className="mt-10 sm:mt-14 pt-6 border-t border-white/15">
          <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-tc-action-lime mb-3">
            Popular DIY &amp; Trade Categories
          </p>
          <div className="flex flex-wrap gap-2 sm:gap-2.5">
            {[
              { name: 'Hand Tools', href: '/tools' },
              { name: 'Fixings & Wall Plugs', href: '/fixings' },
              { name: 'Painting & Decorating', href: '/decorating' },
              { name: 'Measuring & Levels', href: '/measuring' },
              { name: 'Safety & PPE', href: '/ppe' },
              { name: 'Site Tarpaulins & Ladders', href: '/site-equipment' },
              { name: 'Job-Ready Project Kits', href: '/projects' },
            ].map((cat) => (
              <Link
                key={cat.href}
                href={cat.href}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 hover:border-tc-action-lime text-[#DFE8F6] hover:text-white text-xs font-semibold border border-white/15 transition-all active:scale-95 backdrop-blur-xs"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
