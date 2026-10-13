import React from 'react';
import Link from 'next/link';
import { getBuyingGuides } from '@/lib/catalog';
import { BookOpen, Clock, ArrowRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GuidesDirectoryPage() {
  const guides = await getBuyingGuides();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">UK Buying Guides</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-card border border-tc-border p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-tc-primary uppercase tracking-wider font-mono">
          <BookOpen className="w-4 h-4" />
          <span>TECHNICAL SPECIFICATION GUIDES</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-tc-ink tracking-tight">
          Authoritative UK Hardware Guides
        </h1>

        <p className="text-xs sm:text-sm text-tc-text-secondary max-w-2xl leading-relaxed">
          Comprehensive trade guidance referencing British Standards (BS 7671, BS EN 14183, BS 8539, BS EN 60454), HSE regulations, and correct material pairing to prevent site injury and installation failure.
        </p>
      </div>

      {/* Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <Link
            key={guide.id}
            href={`/guides/${guide.slug}`}
            className="group bg-white rounded-card border border-tc-border p-6 hover:border-[#94A8C9] hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold uppercase tracking-wider text-tc-primary">
                  {guide.category}
                </span>
                <span className="text-tc-text-secondary flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {guide.read_time_minutes} min read
                </span>
              </div>

              <h2 className="font-heading font-extrabold text-lg text-tc-ink group-hover:text-tc-primary transition-colors leading-snug">
                {guide.title}
              </h2>

              <p className="text-xs text-tc-graphite leading-relaxed line-clamp-3">
                {guide.excerpt}
              </p>

              {/* Safety warning preview */}
              {guide.safety_warnings.length > 0 && (
                <div className="p-3 rounded-lg bg-[#FFF7E8] border border-[#E8CB91] text-[11px] text-tc-ink flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-tc-warning shrink-0 mt-0.5" />
                  <span className="line-clamp-2">{guide.safety_warnings[0]}</span>
                </div>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-tc-border/60 flex items-center justify-between text-xs font-bold text-tc-primary">
              <span>Read complete guide</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
