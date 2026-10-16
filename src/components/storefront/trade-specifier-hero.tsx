'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Truck,
  Clock,
  ShieldCheck,
  Layers,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const TRUST_PILLARS = [
  {
    icon: Truck,
    title: 'Free UK Delivery Over £50',
    subtitle: 'ex. VAT · Royal Mail Tracked 24 & DPD',
  },
  {
    icon: Clock,
    title: 'Same-Day Dispatch',
    subtitle: 'Order before 4:00 PM Mon–Fri',
  },
  {
    icon: Layers,
    title: 'Direct Trade Pricing',
    subtitle: 'Bulk carton savings · Live Inc/Ex VAT',
  },
  {
    icon: ShieldCheck,
    title: 'British Standards Verified',
    subtitle: 'BS EN & UKCA rated hardware',
  },
];

const QUICK_CATEGORIES = [
  { name: 'Hand Tools', slug: 'tools', icon: Wrench },
  { name: 'Fixings', slug: 'fixings', icon: Shield },
  { name: 'Decorating', slug: 'decorating', icon: Paintbrush },
  { name: 'Measuring', slug: 'measuring', icon: Ruler },
  { name: 'Workwear & PPE', slug: 'ppe', icon: HardHat },
  { name: 'Site Equipment', slug: 'site-equipment', icon: Package },
];

export function TradeSpecifierHero() {
  return (
    <section className="bg-white border-b border-tc-border overflow-hidden">
      {/* 1. Clean 4-Pillar Trust Strip (UK Standard Pattern) */}
      <div className="bg-tc-surface-soft border-b border-tc-border/80 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {TRUST_PILLARS.map((p, idx) => {
            const Icon = p.icon;
            return (
              <div key={idx} className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#C8D9F9] flex items-center justify-center shrink-0 text-tc-primary shadow-2xs">
                  <Icon className="w-4 h-4 stroke-[2]" />
                </div>
                <div className="min-w-0">
                  <p className="font-heading font-bold text-xs text-tc-ink truncate">
                    {p.title}
                  </p>
                  <p className="text-[11px] text-tc-text-secondary truncate hidden sm:block">
                    {p.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Hero Stage: Clean, Authoritative, High-Converting */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Authoritative Copy & Navigation (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tc-surface-soft border border-tc-border text-xs font-semibold text-tc-ink">
              <span className="w-2 h-2 rounded-full bg-tc-success animate-pulse" />
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-tc-primary">
                BRITISH TRADE HARDWARE DIRECT
              </span>
              <span className="text-tc-border">|</span>
              <span className="text-tc-text-secondary text-[11px]">115 SKUs In Stock</span>
            </div>

            {/* Headline */}
            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tc-ink tracking-tight leading-[1.12]">
              The Hardware Standard <br className="hidden sm:inline" />
              <span className="text-tc-primary">for British Trades.</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-tc-graphite max-w-xl leading-relaxed">
              Trade-grade hand tools, certified fixings, and site consumables. Guaranteed British Standards, transparent pack counts, and tracked next-day delivery to UK sites and workshops.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                asChild
                className="bg-tc-primary hover:bg-tc-primary-hover text-white min-h-[48px] px-6 text-sm font-bold shadow-xs"
              >
                <Link href="/tools" className="flex items-center gap-2">
                  <span>Browse Full Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                asChild
                className="border-tc-ink text-tc-ink hover:bg-tc-canvas min-h-[48px] px-6 text-sm font-bold"
              >
                <Link href="/projects">
                  <span>Curated Project Kits</span>
                </Link>
              </Button>

              <Link
                href="/trade"
                className="text-xs font-bold text-tc-primary hover:underline ml-2"
              >
                Open Trade Account →
              </Link>
            </div>

            {/* Quick 1-Tap Category Pills */}
            <div className="pt-4 border-t border-tc-border/70">
              <p className="text-[11px] font-mono uppercase tracking-wider text-tc-text-secondary mb-2.5 font-bold">
                Quick Category Jump:
              </p>
              <div className="flex flex-wrap gap-2">
                {QUICK_CATEGORIES.map((cat) => {
                  const CatIcon = cat.icon;
                  return (
                    <Link
                      key={cat.slug}
                      href={`/${cat.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tc-canvas hover:bg-white border border-tc-border text-xs font-medium text-tc-ink transition-colors hover:border-tc-primary hover:shadow-2xs"
                    >
                      <CatIcon className="w-3.5 h-3.5 text-tc-primary" />
                      <span>{cat.name}</span>
                    </Link>
                  );
                })}
              </div>
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
                <div className="absolute inset-0 bg-gradient-to-t from-tc-ink/80 via-transparent to-transparent" />

                {/* Floating Assurance Badges */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs border border-tc-border px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1.5 text-[11px] font-bold text-tc-ink font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-tc-success" />
                  <span>100% Physical UK Stock</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3">
                  <p className="font-mono text-[10px] font-bold text-tc-action-lime uppercase tracking-wider">
                    CERTIFIED TRADE SPECIFICATION
                  </p>
                  <p className="font-heading font-bold text-base leading-snug text-white">
                    VDE 1000V · BS 8539 · EN 14183 Rated
                  </p>
                </div>
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
                    <p className="font-bold text-tc-ink leading-tight">4:00 PM Cut-off</p>
                    <p className="text-[11px] text-tc-text-secondary">Royal Mail Tracked 24</p>
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
