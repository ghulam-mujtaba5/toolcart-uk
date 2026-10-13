import React from 'react';
import Link from 'next/link';
import { getProjectKits } from '@/lib/catalog';
import { ProjectKitCard } from '@/components/storefront/project-kit-card';
import { Layers, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage() {
  const kits = await getProjectKits();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Project Kits</span>
      </div>

      {/* Header Banner */}
      <div className="bg-white rounded-card border border-tc-border p-6 sm:p-8 space-y-4">
        <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-tc-primary uppercase tracking-wider font-mono">
          <Layers className="w-4 h-4" />
          <span>CURATED PROJECT BASKETS</span>
        </div>

        <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-tc-ink tracking-tight">
          Job-Ready Hardware Kits
        </h1>

        <p className="text-xs sm:text-sm text-tc-text-secondary max-w-2xl leading-relaxed">
          Pre-assembled multi-item kits designed to eliminate missed components. Each bundle features authentic Status International &amp; Ionos products with up to 18% bundle savings.
        </p>

        <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-tc-ink font-medium">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-tc-success" />
            1-Click bundle population
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-tc-success" />
            Checklist item customization
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-tc-primary" />
            Tested against British Standards
          </span>
        </div>
      </div>

      {/* Kit Cards Stack */}
      <div className="space-y-8">
        {kits.map((kit) => (
          <ProjectKitCard key={kit.id} kit={kit} />
        ))}
      </div>
    </div>
  );
}
