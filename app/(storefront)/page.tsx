import React from 'react';
import Link from 'next/link';
import { getAllProducts, getProjectKits, getBuyingGuides } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { TradeSpecifierHero } from '@/components/storefront/trade-specifier-hero';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
  ArrowRight,
  BookOpen,
  Layers,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const CATEGORIES = [
  {
    name: 'Hand Tools',
    slug: 'tools',
    description: 'Screwdrivers, pliers, hammers, saws, spanners & chisels.',
    icon: Wrench,
    itemCount: '44 items',
    image: '/images/3d/categories/tools.webp',
  },
  {
    name: 'Fixings & Security',
    slug: 'fixings',
    description: 'Padlocks, steel bolts, wall plugs, clips & hardware.',
    icon: Shield,
    itemCount: '22 items',
    image: '/images/3d/categories/fixings.webp',
  },
  {
    name: 'Decorating',
    slug: 'decorating',
    description: 'Paint brushes, rollers, masking tapes, scrapers & sandpapers.',
    icon: Paintbrush,
    itemCount: '15 items',
    image: '/images/3d/categories/decorating.webp',
  },
  {
    name: 'Measuring',
    slug: 'measuring',
    description: '5m/10m tape measures, spirit levels, metal rulers & plumb bobs.',
    icon: Ruler,
    itemCount: '5 items',
    image: '/images/3d/categories/measuring.webp',
  },
  {
    name: 'Workwear & Safety',
    slug: 'ppe',
    description: 'EN166 eye protection, dust masks, ear plugs & safety gloves.',
    icon: HardHat,
    itemCount: '10 items',
    image: '/images/3d/categories/ppe.webp',
  },
  {
    name: 'Site Equipment',
    slug: 'site-equipment',
    description: 'EN14183 step ladders, heavy tarpaulins, ropes & ratchet straps.',
    icon: Package,
    itemCount: '19 items',
    image: '/images/3d/categories/site-equipment.webp',
  },
];

export default async function StorefrontHomePage() {
  const allProducts = await getAllProducts();
  const kits = await getProjectKits();
  const guides = await getBuyingGuides();

  // Featured selection: 4 diverse items across categories
  const featuredSkus = ['IONPVCMC5PKX6', 'ION3SFLADDER1P1', 'IONWPLUGS200P10', 'IONSDRIVERS4P10'];
  const featuredProducts = allProducts.filter((p) => featuredSkus.includes(p.supplier_sku));

  return (
    <div className="space-y-8 sm:space-y-16 pb-12 sm:pb-16">
      {/* Bespoke Industrial Trade Specifier Hero */}
      <TradeSpecifierHero />

      {/* 6 Primary Category Grid */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1.5 mb-5 sm:mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-tc-ink tracking-tight">
              Hardware Categories
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-0.5 sm:mt-1">
              Browse our core trade hardware categories for tools, fixings, decorating, measuring, safety, and site supplies.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View full catalog</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group rounded-card bg-white border border-tc-border hover:border-[#94A8C9] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-tc-canvas border-b border-tc-border overflow-hidden flex items-center justify-center p-2 sm:p-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                    />
                  </div>

                  <div className="p-3 sm:p-5">
                    <div className="flex items-center gap-2 sm:gap-2.5">
                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shrink-0 group-hover:bg-tc-primary group-hover:text-white transition-colors">
                        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2]" />
                      </div>
                      <h3 className="font-heading font-bold text-xs sm:text-lg text-tc-ink group-hover:text-tc-primary transition-colors leading-snug truncate">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs text-tc-text-secondary mt-2 leading-relaxed hidden sm:block">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="px-3 sm:px-5 pb-3 sm:pb-5 pt-2 sm:pt-3 border-t border-tc-border/60 flex items-center justify-between text-[11px] sm:text-xs font-semibold text-tc-primary">
                  <span className="font-mono text-[10px] sm:text-xs text-tc-text-secondary">{cat.itemCount}</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span className="hidden sm:inline">Explore category</span>
                    <span className="sm:hidden">Explore</span> →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-5 sm:mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-tc-ink tracking-tight">
              Featured Hardware
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-0.5 sm:mt-1">
              Popular trade items with verified pack quantities and honest inventory indicators.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>See full range</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Mid-Page Promo Banner */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-tc-border shadow-sm group">
          <div className="relative aspect-[16/10] sm:aspect-[24/8] min-h-[180px] sm:min-h-[220px]">
            <img
              src="/images/promos/promo-decorating-1600x650.webp"
              alt="Decorating & Surface Preparation Promotion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-tc-ink/90 via-tc-ink/75 sm:via-tc-ink/65 to-transparent flex items-center p-4 sm:p-10">
              <div className="max-w-xl space-y-2 sm:space-y-3">
                <span className="text-[10px] sm:text-[11px] font-extrabold tracking-wider text-tc-action-lime uppercase font-mono">
                  TRADE SURFACE PREPARATION
                </span>
                <h2 className="font-heading font-extrabold text-lg sm:text-3xl text-white tracking-tight leading-snug">
                  Precision Masking &amp; Surface Protection
                </h2>
                <p className="text-xs sm:text-sm text-tc-canvas leading-relaxed hidden sm:block">
                  Save on professional crepe paper masking tapes, pure bristle brushes, and heavy polythene dust sheets. Tested for sharp paint cutoff lines without plaster peeling.
                </p>
                <div className="pt-1.5 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3">
                  <Button variant="accent" size="sm" asChild className="text-xs h-9">
                    <Link href="/decorating">Explore Decorating Range</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="bg-white/10 text-white border-white/30 hover:bg-white/20 text-xs h-9">
                    <Link href="/guides/masking-painters-tapes-demystified">Read Tape Guide →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Curated Project Kits Teaser */}
      <section className="bg-tc-surface-soft border-y border-[#C8D9F9] py-8 sm:py-14">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-extrabold text-tc-primary uppercase tracking-wider mb-2">
                <div className="w-6 h-6 rounded-md bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shadow-2xs">
                  <Layers className="w-3.5 h-3.5 stroke-[2.25]" />
                </div>
                <span>Job-Ready Bundles</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
                Curated Project Kits
              </h2>
              <p className="text-xs sm:text-sm text-tc-graphite mt-1">
                Everything you need for common jobs in one bundle with bundle savings.
              </p>
            </div>
            <Button variant="accent" size="sm" asChild>
              <Link href="/projects" className="flex items-center gap-1.5">
                <span>View all kits</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 md:grid-cols-3 sm:overflow-visible scrollbar-none">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none bg-white rounded-card border border-tc-border p-4 sm:p-6 shadow-sm flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-3 sm:space-y-4">
                  {kit.image && (
                    <div className="w-full h-36 sm:h-44 rounded-xl overflow-hidden bg-tc-canvas border border-tc-border flex items-center justify-center p-2">
                      <img
                        src={kit.image}
                        alt={kit.title}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary">
                      {kit.badge}
                    </span>
                    <span className="text-[11px] sm:text-xs font-extrabold text-tc-action-lime bg-tc-ink px-2 py-0.5 rounded border border-tc-ink">
                      Save {kit.bundle_savings_percent}%
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base sm:text-lg text-tc-ink leading-snug">
                    {kit.title}
                  </h3>

                  <p className="text-xs text-tc-text-secondary leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {kit.tagline}
                  </p>

                  <div className="pt-1 sm:pt-2 text-[11px] sm:text-xs text-tc-ink font-semibold flex items-center gap-2">
                    <span>{kit.items.length} trade items</span>
                    <span>•</span>
                    <span className="text-tc-text-secondary">{kit.estimated_time}</span>
                  </div>
                </div>

                <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-tc-border/60 flex items-center justify-between">
                  <Link
                    href="/projects"
                    className="text-xs font-bold text-tc-primary hover:underline flex items-center gap-1"
                  >
                    <span>View kit contents &amp; add</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UK Buying Guides Teaser */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-5 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-tc-primary uppercase tracking-wider mb-1.5 sm:mb-2">
              <div className="w-6 h-6 rounded-md bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 stroke-[2.25]" />
              </div>
              <span>Technical Advice</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-3xl text-tc-ink tracking-tight">
              UK Hardware Buying Guides
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-0.5 sm:mt-1">
              Authoritative advice on British Standards, VDE insulation, and load safety.
            </p>
          </div>
          <Link
            href="/guides"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>All 5 guides</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Link>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-2 -mx-3 px-3 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible scrollbar-none">
          {guides.slice(0, 3).map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="w-[82vw] max-w-[320px] shrink-0 snap-center sm:w-auto sm:max-w-none group bg-white rounded-card border border-tc-border p-4 sm:p-6 hover:border-[#94A8C9] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3 sm:space-y-4">
                {guide.hero_image && (
                  <div className="w-full h-32 sm:h-36 rounded-lg overflow-hidden bg-tc-canvas border border-tc-border">
                    <img
                      src={guide.hero_image}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-tc-primary">
                    {guide.category} • {guide.read_time_minutes} min read
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-tc-ink group-hover:text-tc-primary transition-colors leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-tc-text-secondary line-clamp-2 sm:line-clamp-3 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>

              <div className="mt-4 sm:mt-5 pt-3 border-t border-tc-border/60 flex items-center justify-between text-xs font-semibold text-tc-primary">
                <span>Read technical guide</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
