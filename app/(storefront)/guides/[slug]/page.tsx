import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBuyingGuideBySlug, getBuyingGuides, getAllProducts } from '@/lib/catalog';
import { ProductCard } from '@/components/storefront/product-card';
import {
  BookOpen,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

interface GuideDetailPageProps {
  params: {
    slug: string;
  } | Promise<{
    slug: string;
  }>;
}

export default async function GuideDetailPage({ params }: GuideDetailPageProps) {
  const resolvedParams = (await Promise.resolve(params)) || { slug: '' };
  const rawSlug = resolvedParams.slug || '';

  let guide = await getBuyingGuideBySlug(rawSlug);

  // Fallback if accessed via template placeholder '/guides/[slug]' or '%5Bslug%5D' or empty
  if (!guide && (rawSlug === '[slug]' || rawSlug === '%5Bslug%5D' || !rawSlug)) {
    const allGuides = await getBuyingGuides();
    guide = allGuides[0] || null;
  }

  if (!guide) {
    notFound();
  }

  const allProducts = await getAllProducts();
  const recommendedProducts = allProducts.filter((p) =>
    guide.recommended_skus.includes(p.supplier_sku)
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary truncate">
        <Link href="/" className="hover:text-tc-ink shrink-0">Home</Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-tc-ink shrink-0">Buying Guides</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold truncate">{guide.title}</span>
      </div>

      {/* Guide Header */}
      <div className="space-y-4 border-b border-tc-border pb-8">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="px-2.5 py-0.5 rounded-full bg-tc-primary/10 text-tc-primary font-bold uppercase tracking-wider">
            {guide.category}
          </span>
          <span className="text-tc-text-secondary flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {guide.read_time_minutes} min read
          </span>
          <span className="text-tc-border-strong">•</span>
          <span className="text-tc-text-secondary font-medium">Published: {guide.published_date}</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-tc-ink tracking-tight leading-tight">
          {guide.title}
        </h1>

        <p className="text-sm sm:text-base text-tc-graphite leading-relaxed">
          {guide.meta_description}
        </p>

        {/* Referenced Standards */}
        {guide.standards_referenced.length > 0 && (
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-tc-ink">Standards Referenced:</span>
            {guide.standards_referenced.map((std) => (
              <span
                key={std}
                className="px-2 py-0.5 rounded bg-tc-canvas border border-tc-border text-[11px] font-mono font-semibold text-tc-primary"
              >
                {std}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Guide Hero Illustration */}
      {guide.hero_image && (
        <div className="w-full aspect-[16/9] sm:aspect-[21/9] rounded-2xl overflow-hidden bg-tc-canvas border border-tc-border shadow-xs">
          <img
            src={guide.hero_image}
            alt={guide.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Safety Warning Callout */}
      {guide.safety_warnings.length > 0 && (
        <div className="p-5 rounded-2xl bg-[#FFF7E8] border border-[#E8CB91] space-y-3">
          <div className="flex items-center gap-2 text-tc-ink font-bold text-sm">
            <ShieldAlert className="w-5 h-5 text-tc-warning" />
            <span>MANDATORY UK HEALTH &amp; SAFETY WARNINGS</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-tc-ink pl-5 list-disc leading-relaxed">
            {guide.safety_warnings.map((w, idx) => (
              <li key={idx}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Key Takeaways Card */}
      {guide.key_takeaways.length > 0 && (
        <div className="p-6 rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] space-y-3">
          <h2 className="font-heading font-extrabold text-base text-tc-ink flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-tc-primary" />
            <span>Key Trade Takeaways</span>
          </h2>
          <ul className="space-y-2 text-xs sm:text-sm text-tc-graphite pl-5 list-disc leading-relaxed">
            {guide.key_takeaways.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Guide Content Sections */}
      <div className="space-y-8">
        {guide.sections.map((section, idx) => (
          <div key={idx} className="space-y-3 bg-white p-6 sm:p-8 rounded-card border border-tc-border shadow-xs">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              {section.title}
            </h2>
            <p className="text-xs sm:text-sm text-tc-graphite leading-relaxed">
              {section.content}
            </p>

            {section.tip && (
              <div className="p-3.5 rounded-xl bg-tc-canvas border border-tc-border text-xs text-tc-ink flex items-start gap-2.5 mt-3">
                <Lightbulb className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-tc-primary">Trade Pro Tip: </span>
                  {section.tip}
                </div>
              </div>
            )}

            {section.warning && (
              <div className="p-3.5 rounded-xl bg-[#FEECEB] border border-[#FECDCA] text-xs text-tc-error flex items-start gap-2.5 mt-3">
                <AlertTriangle className="w-4 h-4 text-tc-error shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Caution: </span>
                  {section.warning}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Recommended Catalog Products */}
      {recommendedProducts.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-tc-border">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-tc-primary uppercase tracking-wider mb-1 font-mono">
              <ShieldCheck className="w-4 h-4" />
              <span>TESTED HARDWARE</span>
            </div>
            <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-tc-ink">
              Recommended Products for this Guide
            </h2>
            <p className="text-xs text-tc-text-secondary mt-1">
              Exact quoted items meeting the specifications and British Standards referenced above.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {recommendedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Footer Return Link */}
      <div className="pt-6 border-t border-tc-border flex justify-between items-center text-xs">
        <Link
          href="/guides"
          className="text-tc-primary font-bold hover:underline flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Buying Guides</span>
        </Link>
        <Link
          href="/projects"
          className="text-tc-ink font-semibold hover:text-tc-primary"
        >
          Explore Curated Project Kits →
        </Link>
      </div>
    </div>
  );
}
