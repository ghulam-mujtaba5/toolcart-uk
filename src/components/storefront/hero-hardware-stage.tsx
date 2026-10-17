'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ShieldCheck, Info, CheckCircle2 } from 'lucide-react';

interface Hotspot {
  id: string;
  x: number; // percentage from left
  y: number; // percentage from top
  label: string;
  detail: string;
}

interface AssemblyConfig {
  id: string;
  tabLabel: string;
  standardBadge: string;
  standardSub: string;
  gtin: string;
  imageSrc: string;
  imageAlt: string;
  hotspots: Hotspot[];
}

const ASSEMBLIES: AssemblyConfig[] = [
  {
    id: 'electrical',
    tabLabel: 'Electrical Kit',
    standardBadge: 'BS EN IEC 60900',
    standardSub: '1000V Live Working Certified',
    gtin: 'GTIN-13: 5060781290412',
    imageSrc: '/images/3d/assembly/kit-assembly-electrical.webp',
    imageAlt: 'ToolCart UK 3D Claymorphic Electrical Contractor Kit Assembly',
    hotspots: [
      {
        id: 'tape',
        x: 28,
        y: 16,
        label: 'Dielectric Phase Tape',
        detail: 'BS EN 60454 · Flame-retardant 10kV dielectric PVC rolls',
      },
      {
        id: 'vde',
        x: 34,
        y: 31,
        label: '1000V VDE Insulated Handles',
        detail: 'Individually proof-tested to 10,000V AC under load',
      },
      {
        id: 'tester',
        x: 48,
        y: 38,
        label: 'Cat III Digital Tester',
        detail: 'Optical & acoustic live-line continuity indication',
      },
      {
        id: 'shears',
        x: 64,
        y: 27,
        label: 'Drop-Forged Steel Jaws',
        detail: 'Induction-hardened high-leverage cable shears',
      },
      {
        id: 'tote',
        x: 50,
        y: 78,
        label: 'Reinforced Site Tote',
        detail: 'Moulded waterproof base & ballistic polymer body',
      },
    ],
  },
  {
    id: 'masonry',
    tabLabel: 'Masonry Anchor',
    standardBadge: 'BS 8539',
    standardSub: 'Heavy-Duty Substrate Fixings',
    gtin: 'GTIN-13: 5060781290887',
    imageSrc: '/images/3d/assembly/masonry-bolt-assembly.webp',
    imageAlt: 'ToolCart UK 3D Brick Substrate Cutaway with Expansion Plug and Bolt',
    hotspots: [
      {
        id: 'brick',
        x: 24,
        y: 48,
        label: 'Class A1 Substrate Cutaway',
        detail: 'Engineering brick section with radial load dispersion',
      },
      {
        id: 'plug',
        x: 48,
        y: 50,
        label: 'Ribbed High-Tension Plug',
        detail: 'Anti-rotation fins with 4-way expansion wings',
      },
      {
        id: 'washer',
        x: 66,
        y: 50,
        label: 'DIN 125A BZP Washer',
        detail: 'Passivated zinc anti-vibration pressure seal',
      },
      {
        id: 'bolt',
        x: 82,
        y: 50,
        label: 'Grade 8.8 High-Tensile Bolt',
        detail: 'Drop-forged carbon steel with deep rolled thread',
      },
    ],
  },
  {
    id: 'cart',
    tabLabel: 'Trade Dispatch Cart',
    standardBadge: 'BS EN 13155',
    standardSub: 'Zero Site Downtime Standard',
    gtin: 'GTIN-13: 5060781290993',
    imageSrc: '/images/brand/logo-toolcart.webp',
    imageAlt: 'ToolCart UK 3D Industrial Mobile Tool Trolley Cart',
    hotspots: [
      {
        id: 'grip',
        x: 78,
        y: 22,
        label: 'Action-Lime Ergonomic Grip',
        detail: 'High-visibility safety pull bar with non-slip coating',
      },
      {
        id: 'latches',
        x: 52,
        y: 42,
        label: 'Tamper-Evident Latches',
        detail: 'Dual heavy-gauge reinforced padlock hasp',
      },
      {
        id: 'drawers',
        x: 52,
        y: 58,
        label: 'Ball-Bearing Slide Drawers',
        detail: '45kg rated full-extension trade storage compartments',
      },
      {
        id: 'casters',
        x: 44,
        y: 88,
        label: 'Heavy-Duty Rubber Casters',
        detail: '360° total-lock swivel shock absorption wheels',
      },
    ],
  },
];

export function HeroHardwareStage() {
  const [activeTab, setActiveTab] = useState<string>('electrical');
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const cardRef = useRef<HTMLDivElement>(null);

  const currentAssembly = ASSEMBLIES.find((a) => a.id === activeTab) || ASSEMBLIES[0];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;
    setTilt({ x: rotateX, y: rotateY });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0 });
  }, []);

  return (
    <div className="relative w-full max-w-md lg:max-w-lg mx-auto aspect-square flex items-center justify-center select-none">
      {/* Ambient glow backing in Brand V3 Cobalt & Action Lime */}
      <div className="absolute inset-0 bg-gradient-to-tr from-tc-cobalt/25 via-tc-cobalt/10 to-tc-action-lime/15 rounded-3xl filter blur-2xl transform scale-95 pointer-events-none" />

      {/* 3D Perspective Tilt Wrapper */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative w-full h-full rounded-2xl border border-white/15 bg-tc-ink/80 backdrop-blur-md p-4 sm:p-5 shadow-2xl flex flex-col justify-between overflow-hidden"
      >
        {/* Technical HUD Top Bar */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3 z-20">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-tc-action-lime animate-pulse shrink-0 shadow-[0_0_8px_#DDF16A]" />
            <span className="text-[11px] font-mono uppercase tracking-wider text-tc-action-lime font-bold truncate">
              {currentAssembly.standardBadge}
            </span>
            <span className="hidden sm:inline-block text-[10px] text-white/50 font-mono">
              · {currentAssembly.standardSub}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 pl-2">
            <ShieldCheck className="w-3.5 h-3.5 text-tc-action-lime" />
            <span className="text-[10px] font-mono text-[#DFE8F6]/80 uppercase tracking-widest tabular-nums">
              {currentAssembly.gtin}
            </span>
          </div>
        </div>

        {/* 3D Asset Stage Canvas with Gentle Floating Animation */}
        <div className="relative flex-1 flex items-center justify-center my-1 overflow-hidden">
          {/* Subtle radial light highlight behind the model */}
          <div className="absolute inset-0 bg-radial from-white/10 to-transparent opacity-60 pointer-events-none" />

          {/* Floating 3D Model */}
          <div className="relative w-full h-full flex items-center justify-center p-2 animate-[tc-float_5s_ease-in-out_infinite]">
            <Image
              src={currentAssembly.imageSrc}
              alt={currentAssembly.imageAlt}
              fill
              priority
              sizes="(max-width: 768px) 320px, 480px"
              className="object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.65)] transition-all duration-500 transform hover:scale-105"
            />

            {/* Interactive Hotspot Pins */}
            {currentAssembly.hotspots.map((hs) => {
              const isOpen = activeHotspot === hs.id;
              return (
                <div
                  key={hs.id}
                  style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveHotspot(isOpen ? null : hs.id);
                    }}
                    onMouseEnter={() => setActiveHotspot(hs.id)}
                    aria-label={`Inspect ${hs.label}`}
                    className="relative group p-1.5 focus:outline-none"
                  >
                    {/* Pulsing ring */}
                    <span className="absolute inset-0 rounded-full bg-tc-action-lime/40 animate-ping" />
                    {/* Center beacon */}
                    <span className="relative flex items-center justify-center w-5 h-5 rounded-full bg-tc-ink border-2 border-tc-action-lime text-tc-action-lime shadow-lg hover:scale-125 transition-transform">
                      <span className="w-1.5 h-1.5 rounded-full bg-tc-action-lime" />
                    </span>
                  </button>

                  {/* Hotspot Spec Tooltip Card */}
                  {isOpen && (
                    <div
                      className={`absolute ${
                        hs.y > 60 ? 'bottom-full mb-2' : 'top-full mt-2'
                      } ${
                        hs.x > 60 ? 'right-0' : 'left-0'
                      } w-52 sm:w-60 bg-tc-ink/95 border border-tc-action-lime/60 rounded-lg p-2.5 shadow-2xl backdrop-blur-lg z-40 text-left pointer-events-auto animate-in fade-in zoom-in-95 duration-150`}
                    >
                      <div className="flex items-center gap-1.5 text-tc-action-lime text-[11px] font-mono font-bold uppercase tracking-wide">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{hs.label}</span>
                      </div>
                      <p className="text-[11px] text-[#DFE8F6] font-body mt-1 leading-snug">
                        {hs.detail}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Hint Overlay: click to inspect specs */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 text-[10px] font-mono text-[#DFE8F6]/60 bg-black/40 px-2 py-0.5 rounded pointer-events-none backdrop-blur-xs">
            <Info className="w-3 h-3 text-tc-action-lime" />
            <span>Interactive Spec Hotspots</span>
          </div>
        </div>

        {/* Interactive Tab Switcher */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 z-20">
          {ASSEMBLIES.map((assembly) => {
            const isSelected = activeTab === assembly.id;
            return (
              <button
                key={assembly.id}
                type="button"
                onClick={() => {
                  setActiveTab(assembly.id);
                  setActiveHotspot(null);
                }}
                className={`py-2 px-1.5 rounded-lg border text-center transition-all duration-200 text-xs font-mono font-bold tracking-tight uppercase ${
                  isSelected
                    ? 'bg-white/15 border-tc-action-lime text-tc-action-lime shadow-[0_0_12px_rgba(221,241,106,0.18)] scale-[1.02]'
                    : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/20'
                }`}
              >
                {assembly.tabLabel}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
