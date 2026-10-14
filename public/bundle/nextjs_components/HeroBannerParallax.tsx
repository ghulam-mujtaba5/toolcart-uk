'use client';
import React, { useState } from 'react';

/**
 * ToolCart UK — Double-Text-Free Ultra-Wide Parallax Hero Banner
 * Uses the clean 4:1 / 21:9 studio background image with live HTML copy on the left
 */
export function ToolCartPromoBanner({
  bannerUrl = '/images/banner_4x1_surface_prep_decorating.jpg',
}: {
  bannerUrl?: string;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 8;
    setOffset({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setOffset({ x: 0, y: 0 })}
      className="relative w-full overflow-hidden rounded-2xl bg-[#0F172A] shadow-xl border border-slate-800"
      style={{ aspectRatio: '21 / 8', maxHeight: '340px' }}
    >
      <div
        className="absolute inset-0 bg-cover bg-right transition-transform duration-300 ease-out"
        style={{
          backgroundImage: `url(${bannerUrl})`,
          transform: `scale(1.04) translate(${offset.x}px, ${offset.y}px)`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/90 to-transparent w-3/4 pointer-events-none" />
      <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-12 max-w-2xl">
        <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#BEF264] mb-2">
          <span className="h-2 w-2 rounded-full bg-[#BEF264] animate-pulse" />
          TRADE SURFACE PREPARATION
        </span>
        <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
          Precision Masking &amp; Surface Protection
        </h2>
        <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed">
          Save on professional crepe paper masking tapes, pure bristle brushes, and heavy polythene
          dust sheets. Tested for sharp paint cutoff lines without plaster peeling.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="/decorating"
            className="px-5 py-2.5 rounded-lg bg-[#BEF264] hover:bg-[#d9f99d] text-slate-950 font-semibold text-sm transition-all shadow-md"
          >
            Explore Decorating Range
          </a>
          <a
            href="/guides/masking-tapes"
            className="px-5 py-2.5 rounded-lg bg-slate-900/70 hover:bg-slate-800 text-white border border-slate-600 font-medium text-sm transition-all"
          >
            Read Tape Guide →
          </a>
        </div>
      </div>
    </section>
  );
}
