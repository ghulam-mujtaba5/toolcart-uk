import React from 'react';
import Link from 'next/link';
import { getAllProducts, getProjectKits, getBuyingGuides } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import { Button } from '@/components/ui/button';
import {
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
  ArrowRight,
  CheckCircle2,
  Truck,
  BookOpen,
  Layers,
  ShieldCheck,
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
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 2-Column Hero Section */}
      <section className="bg-white border-b border-tc-border pt-10 pb-14 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Heading, Lead & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tc-surface-soft border border-[#C8D9F9] text-xs font-semibold text-tc-primary shadow-xs">
                <ShieldCheck className="w-4 h-4 text-tc-primary" />
                <span>Direct UK Trade Hardware &amp; Supplies</span>
              </div>

              <h1 className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl text-tc-ink tracking-tight leading-[1.08]">
                The right tools.{' '}
                <span className="text-tc-primary">The right advice.</span>
              </h1>

              <p className="text-base sm:text-lg text-tc-graphite max-w-2xl leading-relaxed">
                Shop verified trade hardware and everyday project supplies. Search by exact specification or tell us what you are working on—we will help you narrow it down without guesswork.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button variant="primary" size="lg" asChild>
                  <Link href="/tools" className="flex items-center gap-2">
                    <span>Shop tools & hardware</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
                <Button variant="accent" size="lg" asChild>
                  <Link href="/projects">Help me choose</Link>
                </Button>
              </div>

              {/* Trust Indicators with 3D Claymorphic Emblems */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-tc-text-secondary font-medium">
                <span className="flex items-center gap-2">
                  <img
                    src="/images/3d/trust/honest-pack-counts.webp"
                    alt="Honest pack counts"
                    className="w-6 h-6 object-contain drop-shadow-xs"
                  />
                  No inflated multi-pack claims
                </span>
                <span className="flex items-center gap-2">
                  <img
                    src="/images/3d/trust/stock-freshness-ttl.webp"
                    alt="24h Stock freshness TTL"
                    className="w-6 h-6 object-contain drop-shadow-xs"
                  />
                  Daily stock freshness checks
                </span>
                <span className="flex items-center gap-2">
                  <img
                    src="/images/3d/trust/free-freight-delivery.webp"
                    alt="Free delivery over £50"
                    className="w-6 h-6 object-contain drop-shadow-xs"
                  />
                  Free delivery over £50 ex. VAT
                </span>
              </div>
            </div>

            {/* Right Column: Hero Visual & Customer Promise Card */}
            <div className="lg:col-span-5 space-y-5">
              {/* Hero Workbench Visual */}
              <div className="relative rounded-2xl overflow-hidden border border-[#C8D9F9] shadow-md group">
                <div className="aspect-[16/9] w-full bg-tc-canvas overflow-hidden">
                  <img
                    src="/images/hero/hero-workbench.webp"
                    alt="ToolCart Professional Trade Workbench"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>

              {/* Customer Promise Card */}
              <div className="rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-wider text-tc-primary uppercase font-mono">
                    OUR CUSTOMER PROMISE
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary font-bold">
                    ToolCart Standards
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-tc-ink leading-tight">
                  Less guesswork. Better choices.
                </h2>

                <p className="text-xs text-tc-graphite leading-relaxed">
                  Clear product sizes, pack quantities and relevant options help you make an informed choice before you order.
                </p>

                {/* Technical Specification & Fixing Matcher */}
                <div className="mt-2 p-3.5 rounded-xl bg-white border border-[#C8D9F9] flex gap-3.5 items-center shadow-xs">
                  <div className="w-10 h-10 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shrink-0 shadow-2xs">
                    <Wrench className="w-5 h-5 text-tc-primary stroke-[2]" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-tc-primary">
                      <span>Trade Fixings &amp; Hardware Matcher</span>
                    </div>
                    <p className="text-[11px] text-tc-graphite italic truncate">
                      &quot;Need masonry fixings or drywall plugs?&quot;
                    </p>
                    <Link
                      href="/search?q=wall+plugs"
                      className="inline-block text-[11px] font-bold text-tc-primary hover:underline"
                    >
                      Find Matching Wall Plugs &amp; Fixings →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6 Primary Category Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
              Hardware Categories
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-1">
              Browse our core trade hardware categories for tools, fixings, decorating, measuring, safety, and site supplies.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>View full catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/${cat.slug}`}
                className="group rounded-card bg-white border border-tc-border hover:border-[#94A8C9] hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden"
              >
                <div>
                  <div className="relative aspect-[16/10] w-full bg-tc-canvas border-b border-tc-border overflow-hidden flex items-center justify-center p-3">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                    />
                    <div className="absolute top-3 left-3 w-11 h-11 rounded-xl bg-white/95 backdrop-blur-xs border border-tc-border-strong flex items-center justify-center text-tc-primary shadow-sm group-hover:bg-tc-primary group-hover:text-white transition-all">
                      <Icon className="w-6 h-6 stroke-[2.25]" />
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shrink-0 group-hover:bg-tc-primary group-hover:text-white transition-colors">
                        <Icon className="w-4 h-4 stroke-[2]" />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-tc-ink group-hover:text-tc-primary transition-colors">
                        {cat.name}
                      </h3>
                    </div>
                    <p className="text-xs text-tc-text-secondary mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-3 border-t border-tc-border/60 flex items-center justify-between text-xs font-semibold text-tc-primary">
                  <span className="font-mono text-tc-text-secondary">{cat.itemCount}</span>
                  <span className="group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Explore category →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
              Featured Hardware
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-1">
              Popular trade items with verified pack quantities and honest inventory indicators.
            </p>
          </div>
          <Link
            href="/tools"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>See full range</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Mid-Page Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden border border-tc-border shadow-sm group">
          <div className="relative aspect-[21/9] sm:aspect-[24/8] min-h-[220px]">
            <img
              src="/images/promos/promo-decorating-1600x650.webp"
              alt="Decorating & Surface Preparation Promotion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-tc-ink/90 via-tc-ink/65 to-transparent flex items-center p-6 sm:p-10">
              <div className="max-w-xl space-y-3">
                <span className="text-[11px] font-extrabold tracking-wider text-tc-action-lime uppercase font-mono">
                  TRADE SURFACE PREPARATION
                </span>
                <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
                  Precision Masking &amp; Surface Protection
                </h2>
                <p className="text-xs sm:text-sm text-tc-canvas leading-relaxed hidden sm:block">
                  Save on professional crepe paper masking tapes, pure bristle brushes, and heavy polythene dust sheets. Tested for sharp paint cutoff lines without plaster peeling.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button variant="accent" size="sm" asChild>
                    <Link href="/decorating">Explore Decorating Range</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild className="bg-white/10 text-white border-white/30 hover:bg-white/20">
                    <Link href="/guides/masking-painters-tapes-demystified">Read Tape Guide →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Curated Project Kits Teaser */}
      <section className="bg-tc-surface-soft border-y border-[#C8D9F9] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {kits.map((kit) => (
              <div
                key={kit.id}
                className="bg-white rounded-card border border-tc-border p-6 shadow-sm flex flex-col justify-between overflow-hidden"
              >
                <div className="space-y-4">
                  {kit.image && (
                    <div className="w-full h-44 rounded-xl overflow-hidden bg-tc-canvas border border-tc-border flex items-center justify-center p-2">
                      <img
                        src={kit.image}
                        alt={kit.title}
                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300 drop-shadow-xs"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary">
                      {kit.badge}
                    </span>
                    <span className="text-xs font-extrabold text-tc-action-lime bg-tc-ink px-2 py-0.5 rounded border border-tc-ink">
                      Save {kit.bundle_savings_percent}%
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-tc-ink leading-snug">
                    {kit.title}
                  </h3>

                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    {kit.tagline}
                  </p>

                  <div className="pt-2 text-xs text-tc-ink font-semibold flex items-center gap-2">
                    <span>{kit.items.length} trade items included</span>
                    <span>•</span>
                    <span className="text-tc-text-secondary">{kit.estimated_time}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-tc-border/60 flex items-center justify-between">
                  <Link
                    href="/projects"
                    className="text-xs font-bold text-tc-primary hover:underline flex items-center gap-1"
                  >
                    <span>View kit contents & add</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* UK Buying Guides Teaser */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-extrabold text-tc-primary uppercase tracking-wider mb-2">
              <div className="w-6 h-6 rounded-md bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 stroke-[2.25]" />
              </div>
              <span>Technical Advice</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
              UK Hardware Buying Guides
            </h2>
            <p className="text-xs sm:text-sm text-tc-text-secondary mt-1">
              Authoritative advice on British Standards, VDE insulation, and load safety.
            </p>
          </div>
          <Link
            href="/guides"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>All 5 guides</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guides.slice(0, 3).map((guide) => (
            <Link
              key={guide.id}
              href={`/guides/${guide.slug}`}
              className="group bg-white rounded-card border border-tc-border p-6 hover:border-[#94A8C9] hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-4">
                {guide.hero_image && (
                  <div className="w-full h-36 rounded-lg overflow-hidden bg-tc-canvas border border-tc-border">
                    <img
                      src={guide.hero_image}
                      alt={guide.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-tc-primary">
                    {guide.category} • {guide.read_time_minutes} min read
                  </span>
                </div>
                <h3 className="font-heading font-bold text-base text-tc-ink group-hover:text-tc-primary transition-colors leading-snug">
                  {guide.title}
                </h3>
                <p className="text-xs text-tc-text-secondary line-clamp-3 leading-relaxed">
                  {guide.excerpt}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-tc-border/60 flex items-center justify-between text-xs font-semibold text-tc-primary">
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
