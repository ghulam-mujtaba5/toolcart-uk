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
  Sparkles,
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
  },
  {
    name: 'Fixings & Security',
    slug: 'fixings',
    description: 'Brass padlocks, bolts, wall plugs, clips & hardware.',
    icon: Shield,
    itemCount: '22 items',
  },
  {
    name: 'Decorating',
    slug: 'decorating',
    description: 'Paint brushes, rollers, masking tapes, scrapers & sandpapers.',
    icon: Paintbrush,
    itemCount: '15 items',
  },
  {
    name: 'Measuring',
    slug: 'measuring',
    description: '5m/10m tape measures, spirit levels, metal rulers & plumb bobs.',
    icon: Ruler,
    itemCount: '5 items',
  },
  {
    name: 'Workwear & Safety',
    slug: 'ppe',
    description: 'EN166 eye protection, dust masks, ear plugs & safety gloves.',
    icon: HardHat,
    itemCount: '10 items',
  },
  {
    name: 'Site Equipment',
    slug: 'site-equipment',
    description: 'EN14183 step ladders, heavy tarpaulins, ropes & ratchet straps.',
    icon: Package,
    itemCount: '19 items',
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
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tc-surface-soft border border-[#C8D9F9] text-xs font-extrabold tracking-wider text-tc-primary uppercase">
                <ShieldCheck className="w-4 h-4 text-tc-primary" />
                <span>Verified UK Supplier Catalog · 115 SKUs Quoted</span>
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

              {/* Trust Indicators */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-tc-text-secondary font-medium">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tc-success" />
                  No inflated multi-pack claims
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-tc-success" />
                  24h Stock freshness TTL
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-tc-primary" />
                  Free delivery over £50 ex. VAT
                </span>
              </div>
            </div>

            {/* Right Column: Customer Promise Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold tracking-wider text-tc-primary uppercase font-mono">
                    OUR CUSTOMER PROMISE
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary font-bold">
                    ToolCart V3
                  </span>
                </div>

                <h2 className="font-heading font-extrabold text-2xl text-tc-ink leading-tight">
                  Less guesswork. Better choices.
                </h2>

                <p className="text-xs sm:text-sm text-tc-graphite leading-relaxed">
                  Clear product sizes, pack quantities and relevant options help you make an informed choice before you order. Backed directly by verified UK supplier quotes.
                </p>

                <div className="space-y-2.5 pt-2 text-xs text-tc-ink">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                    <span><strong>Verified Specs:</strong> Full EAN-13 GTIN, MPN, carton pack breakdown.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                    <span><strong>Honest Availability:</strong> We distinguish &quot;Confirmed in stock&quot; from &quot;Subject to confirmation&quot;.</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                    <span><strong>Transparent Dispatch:</strong> Multi-supplier freight calculation with integer-pence UK 20% VAT math.</span>
                  </div>
                </div>

                {/* AI Assistant Teaser */}
                <div className="mt-4 p-4 rounded-xl bg-white border border-[#C8D9F9] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-tc-primary">
                    <Sparkles className="w-4 h-4 text-tc-primary" />
                    <span>Try our AI Project Finder</span>
                  </div>
                  <p className="text-xs text-tc-graphite italic">
                    &quot;I need fixings for a heavy shelf on a brick wall—what should I check?&quot;
                  </p>
                  <Button variant="outline" size="sm" asChild className="w-full text-xs mt-2 border-tc-primary text-tc-primary hover:bg-tc-surface-soft">
                    <Link href="/search?q=wall+plugs">Ask About Shelf Fixings →</Link>
                  </Button>
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
              Browse our 6 comprehensive trade categories containing all 115 quoted lines.
            </p>
          </div>
          <Link
            href="/search"
            className="text-xs sm:text-sm font-bold text-tc-primary hover:underline flex items-center gap-1"
          >
            <span>View all 115 products</span>
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
                className="group p-6 rounded-card bg-white border border-tc-border hover:border-[#94A8C9] hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary mb-4 group-hover:scale-105 transition-transform">
                    <Icon className="w-6 h-6 stroke-[2]" />
                  </div>
                  <h3 className="font-heading font-bold text-lg text-tc-ink group-hover:text-tc-primary transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-tc-text-secondary mt-1.5 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-tc-border/60 flex items-center justify-between text-xs font-semibold text-tc-primary">
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

      {/* Curated Project Kits Teaser */}
      <section className="bg-tc-surface-soft border-y border-[#C8D9F9] py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-tc-primary uppercase tracking-wider mb-2">
                <Layers className="w-4 h-4" />
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
                className="bg-white rounded-card border border-tc-border p-6 shadow-sm flex flex-col justify-between"
              >
                <div className="space-y-3">
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
                    <span>{kit.items.length} verified products included</span>
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
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-tc-primary uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
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
              <div className="space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-tc-primary">
                  {guide.category} • {guide.read_time_minutes} min read
                </span>
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
