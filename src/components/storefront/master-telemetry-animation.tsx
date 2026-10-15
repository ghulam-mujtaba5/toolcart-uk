'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Radio,
  Zap,
  Clock,
  Layers,
  ChevronRight,
  Sparkles,
  RotateCw,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function MasterTelemetryAnimation() {
  const [activeTab, setActiveTab] = useState<'radar' | 'emblem' | 'standards'>('radar');
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [radarPulse, setRadarPulse] = useState(0);
  const [isInspecting, setIsInspecting] = useState(false);
  const [activeStandard, setActiveStandard] = useState(0);

  // Simulated live telemetry heartbeat counter
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarPulse((prev) => (prev + 1) % 100);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 12, ry: px * 14 });
  };

  const STANDARDS = [
    {
      code: 'BS EN IEC 60900',
      label: '1000V AC VDE Dielectric Isolation',
      desc: 'Submerged 10,000V individual flashover immersion testing for live electrical work.',
      badge: 'Electrical Safety',
    },
    {
      code: 'BS EN 14183:2003',
      label: '150KG Duty Rated Trade Access',
      desc: 'Tested lateral slip resistance, anti-deflection spreaders, and platform stability.',
      badge: 'Site Working at Height',
    },
    {
      code: 'BS 8539:2012',
      label: 'Masonry Anchor Substrate Pairing',
      desc: 'Verified expansion plug holding force in solid brick, thermalite, and aerated block.',
      badge: 'Fixings & Structural',
    },
    {
      code: 'BS EN 60454-3',
      label: 'Self-Extinguishing Flame Retardant PVC',
      desc: 'Harmonised UK phase-marking tape dielectric withstand rated up to 1000V.',
      badge: 'Wiring Regulations',
    },
  ];

  return (
    <section className="bg-tc-ink text-white py-14 overflow-hidden relative border-y border-tc-graphite">
      {/* Background Subtle Grid Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #EAF0FF 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Strip */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tc-primary/20 border border-tc-primary/40 text-xs font-mono font-bold text-tc-action-lime mb-3">
              <span className="w-2 h-2 rounded-full bg-tc-action-lime animate-ping" />
              <span>INTELLIGENT TRADE TELEMETRY ENGINE</span>
            </div>
            <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
              Real-Time Stock Radar &amp; 3D Hardware Spec Engine
            </h2>
            <p className="text-xs sm:text-sm text-[#DFE8F6]/80 max-w-2xl mt-1">
              Interactive visual telemetry verified against UK supplier EDI feeds. Zero phantom stock, true carton math, and certified British Standards testing.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-tc-graphite/60 border border-white/10 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'radar'
                  ? 'bg-tc-primary text-white font-bold shadow-xs'
                  : 'text-[#DFE8F6]/70 hover:text-white'
              )}
            >
              <Radio className="w-3.5 h-3.5 text-tc-action-lime" />
              <span>Live Stock Radar</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('emblem')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'emblem'
                  ? 'bg-tc-primary text-white font-bold shadow-xs'
                  : 'text-[#DFE8F6]/70 hover:text-white'
              )}
            >
              <Sparkles className="w-3.5 h-3.5 text-tc-action-lime" />
              <span>3D Toolbox Inspection</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('standards')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all',
                activeTab === 'standards'
                  ? 'bg-tc-primary text-white font-bold shadow-xs'
                  : 'text-[#DFE8F6]/70 hover:text-white'
              )}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-tc-action-lime" />
              <span>BS / EN Matrix</span>
            </button>
          </div>
        </div>

        {/* Main Stage Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left Visual Interactive Canvas (7 Cols) */}
          <div
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
            className="lg:col-span-7 rounded-2xl bg-gradient-to-br from-[#1E2C42] via-[#152033] to-[#0D1424] border border-white/15 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl"
            style={{
              perspective: '1000px',
            }}
          >
            {/* Ambient Radial Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-tc-primary/20 rounded-full blur-3xl pointer-events-none" />

            {/* Top Canvas Bar */}
            <div className="flex items-center justify-between text-xs text-[#DFE8F6]/80 border-b border-white/10 pb-4 relative z-10">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tc-action-lime animate-pulse" />
                <span className="font-mono font-bold tracking-wider text-tc-action-lime">
                  {activeTab === 'radar' && 'STATUS_UK_TELEMETRY // FEED_ACTIVE'}
                  {activeTab === 'emblem' && 'TOOLCART_3D_PBR_ENGINE // V3.2'}
                  {activeTab === 'standards' && 'BRITISH_STANDARDS // VERIFIED_MATRIX'}
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#DFE8F6]/60">
                PULSE_TICK: #{1042 + radarPulse}
              </span>
            </div>

            {/* Center Dynamic Visual Display */}
            <div
              className="py-8 flex items-center justify-center relative min-h-[300px]"
              style={{
                transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
                transition: 'transform 0.15s ease-out',
              }}
            >
              {/* Tab 1: Live Stock Freshness Radar */}
              {activeTab === 'radar' && (
                <div className="relative flex flex-col items-center">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                    {/* Animated Sonar Ping Waves */}
                    <div className="absolute inset-0 rounded-full border border-tc-action-lime/30 animate-ping opacity-25" />
                    <div className="absolute inset-4 rounded-full border border-tc-primary/50 animate-pulse" />
                    <div className="absolute inset-10 rounded-full border border-tc-action-lime/40" />

                    {/* 3D Claymorphic Radar Dish */}
                    <img
                      src="/images/3d/features/stock-freshness-radar.webp"
                      alt="Stock Freshness Telemetry Radar"
                      className="w-48 h-48 sm:w-56 sm:h-56 object-contain relative z-10 drop-shadow-[0_20px_25px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Telemetry Badge Below */}
                  <div className="mt-4 px-4 py-1.5 rounded-full bg-tc-ink/80 border border-tc-action-lime/40 text-xs font-mono font-bold text-tc-action-lime flex items-center gap-2 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-tc-action-lime" />
                    <span>24h TTL Supplier Freshness Window Active</span>
                  </div>
                </div>
              )}

              {/* Tab 2: 3D Master Brand Logo & Toolbox */}
              {activeTab === 'emblem' && (
                <div className="relative flex flex-col items-center">
                  <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-3xl bg-tc-primary/10 border border-white/10 -rotate-3" />
                    <div className="absolute inset-0 rounded-3xl bg-tc-action-lime/10 border border-tc-action-lime/20 rotate-3" />

                    {/* Master 3D Brand Logo */}
                    <img
                      src="/images/brand/logo-toolcart.webp"
                      alt="ToolCart Master 3D Toolbox"
                      className={cn(
                        'w-52 h-52 sm:w-60 sm:h-60 object-contain relative z-10 drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)] transition-all duration-500',
                        isInspecting ? 'scale-110 rotate-6' : 'group-hover:scale-105'
                      )}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsInspecting(!isInspecting)}
                    className="mt-4 px-4 py-1.5 rounded-full bg-tc-primary hover:bg-tc-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
                  >
                    <RotateCw className={cn('w-3.5 h-3.5', isInspecting && 'animate-spin')} />
                    <span>{isInspecting ? 'Reset Perspective' : 'Inspect 3D Tolerances'}</span>
                  </button>
                </div>
              )}

              {/* Tab 3: British Standards Matrix View */}
              {activeTab === 'standards' && (
                <div className="w-full max-w-md space-y-3 relative z-10">
                  <div className="p-4 rounded-xl bg-white/10 border border-tc-action-lime/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-tc-action-lime">
                        {STANDARDS[activeStandard].code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-tc-action-lime text-tc-ink font-bold">
                        {STANDARDS[activeStandard].badge}
                      </span>
                    </div>
                    <h4 className="font-heading font-bold text-sm text-white">
                      {STANDARDS[activeStandard].label}
                    </h4>
                    <p className="text-xs text-[#DFE8F6]/80 leading-relaxed">
                      {STANDARDS[activeStandard].desc}
                    </p>
                  </div>

                  {/* Standard Selector Tabs */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2">
                    {STANDARDS.map((std, idx) => (
                      <button
                        key={std.code}
                        type="button"
                        onClick={() => setActiveStandard(idx)}
                        className={cn(
                          'p-2 rounded-lg text-center font-mono text-[11px] font-bold border transition-all',
                          activeStandard === idx
                            ? 'bg-tc-primary text-white border-tc-action-lime'
                            : 'bg-white/5 border-white/10 text-[#DFE8F6]/60 hover:bg-white/10'
                        )}
                      >
                        STD 0{idx + 1}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls / Metrics */}
            <div className="border-t border-white/10 pt-4 grid grid-cols-3 gap-2 text-center text-xs relative z-10">
              <div className="p-2 rounded-lg bg-white/5">
                <span className="block text-[10px] text-[#DFE8F6]/60 uppercase font-mono">Quoted SKUs</span>
                <span className="font-heading font-extrabold text-white text-sm sm:text-base">115 Lines</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="block text-[10px] text-[#DFE8F6]/60 uppercase font-mono">Stock Freshness</span>
                <span className="font-heading font-extrabold text-tc-action-lime text-sm sm:text-base">99.8% Live</span>
              </div>
              <div className="p-2 rounded-lg bg-white/5">
                <span className="block text-[10px] text-[#DFE8F6]/60 uppercase font-mono">British Stds</span>
                <span className="font-heading font-extrabold text-white text-sm sm:text-base">100% Tested</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Value Propositions with 3D Icons (5 Cols) */}
          <div className="lg:col-span-5 space-y-3.5 flex flex-col justify-between">
            {/* Feature 1: Clear Specifications */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-tc-primary/60 transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <img
                  src="/images/3d/icons/icon-specs.webp"
                  alt="Clear Specifications"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-tc-action-lime transition-colors">
                  Clear Specifications
                </h3>
                <p className="text-xs text-[#DFE8F6]/75 mt-0.5 leading-snug">
                  EAN-13 GTIN, MPN &amp; certified ratings
                </p>
              </div>
            </div>

            {/* Feature 2: Trade & DIY Direct */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-tc-primary/60 transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <img
                  src="/images/3d/icons/icon-trade-diy.webp"
                  alt="Trade & DIY Direct"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-tc-action-lime transition-colors">
                  Trade &amp; DIY Direct
                </h3>
                <p className="text-xs text-[#DFE8F6]/75 mt-0.5 leading-snug">
                  Tactile UK VAT rocker &amp; net terms
                </p>
              </div>
            </div>

            {/* Feature 3: Project Guidance */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-tc-primary/60 transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <img
                  src="/images/3d/icons/icon-project-guidance.webp"
                  alt="Project Guidance"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-tc-action-lime transition-colors">
                  Project Guidance
                </h3>
                <p className="text-xs text-[#DFE8F6]/75 mt-0.5 leading-snug">
                  UK buying guides &amp; curated project kits
                </p>
              </div>
            </div>

            {/* Feature 4: Verified Pack Options */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-tc-primary/60 transition-all flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                <img
                  src="/images/3d/icons/icon-pack-options.webp"
                  alt="Verified Pack Options"
                  className="w-full h-full object-contain drop-shadow-sm"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-sm text-white group-hover:text-tc-action-lime transition-colors">
                  Verified Pack Options
                </h3>
                <p className="text-xs text-[#DFE8F6]/75 mt-0.5 leading-snug">
                  Transparent unit vs carton quantities
                </p>
              </div>
            </div>

            {/* Quick Action Link */}
            <div className="pt-2">
              <Button
                variant="accent"
                size="md"
                className="w-full flex items-center justify-center gap-2 font-bold text-tc-ink"
                asChild
              >
                <Link href="/projects">
                  <span>Explore Curated Trade Kits &amp; Guides</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
