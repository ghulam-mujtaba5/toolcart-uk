'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  SlidersHorizontal
} from 'lucide-react';

interface AssemblyStep {
  title: string;
  tagline: string;
  description: string;
  specNote: string;
  badge: string;
  highlightCoordinates: { x: number; y: number }; // Percentage from top-left
}

interface AssemblyScene {
  id: 'electrical-kit' | 'masonry-bolt';
  name: string;
  subtitle: string;
  category: string;
  imageSrc: string;
  alt: string;
  steps: AssemblyStep[];
}

const ASSEMBLY_SCENES: AssemblyScene[] = [
  {
    id: 'electrical-kit',
    name: 'Curated Trade Kit Pack-Out',
    subtitle: 'Domestic Electrical & Trade Consumables Kit Assembly',
    category: 'BUNDLE VISUALIZATION',
    imageSrc: '/images/3d/assembly/kit-assembly-electrical.webp',
    alt: '3D Claymorphic Chronological Assembly of Domestic Electrical Kit',
    steps: [
      {
        title: 'Stage 1: Heavy-Duty Base & Tote Geometry',
        tagline: 'Structural Worksite Cobalt Tote with Dark Ink Base',
        description: 'Chunky 3D claymorphic open contractor caddy bag anchored with internal elastic tool retention bands and Action Lime #DDF16A dual-stitched webbing handles.',
        specNote: 'BS EN 60454 / BS 7671 UK trade standard retention spacing',
        badge: 'Base Frame',
        highlightCoordinates: { x: 50, y: 75 }
      },
      {
        title: 'Stage 2: 1000V VDE Insulated Tool Trajectory',
        tagline: 'Precision Screwdrivers & Voltage Detection Pen In-Flight',
        description: 'VDE certified slimline cross-head and slotted screwdrivers glide downward along dotted trajectory axes directly into ergonomic handle sleeves.',
        specNote: '1000V AC insulated dual-density soft-grip clay handles',
        badge: 'Insulated Tools',
        highlightCoordinates: { x: 38, y: 35 }
      },
      {
        title: 'Stage 3: Consumables & Harmonic UK Tape Integration',
        tagline: 'BS EN 60454 PVC Tapes & Terminal Blocks Floating to Bay',
        description: 'Harmonised UK phase electrical tapes (Cobalt Blue, Action Lime Earth stripe, Dark Ink Neutral) stack neatly over terminal partition trays.',
        specNote: 'Self-extinguishing flame-retardant electrical tape grade',
        badge: 'Consumables',
        highlightCoordinates: { x: 62, y: 22 }
      },
      {
        title: 'Stage 4: Complete Job-Ready Package Lock-In',
        tagline: '100% Seeded, Pre-Audited UK Hardware Kit',
        description: 'All components seamlessly assembled and ready for dispatch. Eliminates missing site consumables and saves 18% versus individual open-stock sourcing.',
        specNote: 'Verified Status & Ionos trade hardware bundle',
        badge: 'Fully Packed',
        highlightCoordinates: { x: 50, y: 55 }
      }
    ]
  },
  {
    id: 'masonry-bolt',
    name: 'Substrate & Anchor Engineering Assembly',
    subtitle: 'Red Brick Masonry, Nylon Wall Plug & Coach Bolt Cutaway',
    category: 'TECHNICAL FIXINGS CUTAWAY',
    imageSrc: '/images/3d/assembly/masonry-bolt-assembly.webp',
    alt: '3D Claymorphic Cross-Section Masonry Wall Plug and Coach Bolt Assembly',
    steps: [
      {
        title: 'Stage 1: Precision Substrate Preparation',
        tagline: 'Solid Red Brick Masonry & 8mm Drilled Borehole',
        description: 'Clean cylindrical core drilled into structural clay brickwork. Cutaway view illustrates uniform borehole depth and dust-cleared chamber ready for insertion.',
        specNote: 'Calibrated for 8mm masonry drill bit and 60mm anchor depth',
        badge: 'Borehole Prep',
        highlightCoordinates: { x: 28, y: 49 }
      },
      {
        title: 'Stage 2: Action Lime Expansion Plug Insertion',
        tagline: 'High-Tensile Ribbed Nylon Anchor Sliding In-Axis',
        description: 'Action Lime #DDF16A expansion plug slides along the technical central guide axis. Directional anti-rotation fins prevent spinning inside hollow or solid substrate.',
        specNote: 'Virgin polyamide nylon 6/6 formulation (-40°C to +80°C)',
        badge: 'Plug Insertion',
        highlightCoordinates: { x: 44, y: 50 }
      },
      {
        title: 'Stage 3: Steel Washer & Hex Coach Bolt Alignment',
        tagline: 'Zinc-Plated Steel Washer & Dark Ink Bolt Alignment',
        description: 'Heavy-duty steel load-spreading washer seats against the fixture face while the Dark Ink hex head coach bolt threads accurately onto the pilot guide.',
        specNote: 'Grade 8.8 high-tensile steel hex head with DIN 125 washer',
        badge: 'Bolt Threading',
        highlightCoordinates: { x: 74, y: 50 }
      },
      {
        title: 'Stage 4: Torque Anchor Compression & Lock',
        tagline: 'Full Radial Expansion Achieving Maximum Shear Load',
        description: 'Torque applied to bolt drives tapered shank into the split anchor body, forcing lateral ribbed wings into substrate pores for unyielding mechanical lock.',
        specNote: 'Tested pull-out resistance up to 3.2kN in standard UK masonry',
        badge: 'Anchor Locked',
        highlightCoordinates: { x: 38, y: 50 }
      }
    ]
  }
];

export function ChronologicalAssemblyAnimation() {
  const [activeSceneId, setActiveSceneId] = useState<'electrical-kit' | 'masonry-bolt'>('electrical-kit');
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scene = ASSEMBLY_SCENES.find((s) => s.id === activeSceneId) || ASSEMBLY_SCENES[0];
  const step = scene.steps[currentStepIdx];

  // Auto-play timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % scene.steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, scene.steps.length]);

  const handleSceneChange = (id: 'electrical-kit' | 'masonry-bolt') => {
    setActiveSceneId(id);
    setCurrentStepIdx(0);
  };

  return (
    <div className="bg-white rounded-card border border-tc-border overflow-hidden shadow-xs">
      {/* Top Header Bar */}
      <div className="p-4 sm:p-6 bg-tc-surface-soft border-b border-tc-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-mono font-extrabold text-tc-primary uppercase tracking-wider mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>{scene.category}</span>
          </div>
          <h2 className="font-heading font-extrabold text-lg sm:text-xl text-tc-ink">
            {scene.name}
          </h2>
          <p className="text-xs text-tc-text-secondary mt-0.5">
            {scene.subtitle}
          </p>
        </div>

        {/* Scene Switcher Buttons */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-white p-1 rounded-lg border border-tc-border">
          <button
            type="button"
            onClick={() => handleSceneChange('electrical-kit')}
            className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSceneId === 'electrical-kit'
                ? 'bg-tc-primary text-white shadow-xs'
                : 'text-tc-text-secondary hover:text-tc-ink'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Electrical Kit</span>
          </button>
          <button
            type="button"
            onClick={() => handleSceneChange('masonry-bolt')}
            className={`min-h-[44px] sm:min-h-[36px] px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeSceneId === 'masonry-bolt'
                ? 'bg-tc-primary text-white shadow-xs'
                : 'text-tc-text-secondary hover:text-tc-ink'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Substrate & Bolt</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Left: 3D Visualization Canvas Stage */}
        <div className="lg:col-span-7 relative bg-gradient-to-b from-[#F7F8F5] to-white p-6 sm:p-10 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] border-b lg:border-b-0 lg:border-r border-tc-border overflow-hidden">
          {/* Subtle Studio Lighting Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2450B812_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

          {/* 3D Model Render Container with CSS Assembly Transforms */}
          <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center transition-all duration-700 ease-out">
            <Image
              src={scene.imageSrc}
              alt={scene.alt}
              fill
              className="object-contain drop-shadow-[0_18px_30px_rgba(24,35,54,0.14)] select-none transition-transform duration-700 ease-out"
              style={{
                transform: `scale(${1 + currentStepIdx * 0.02}) translateY(${currentStepIdx === 3 ? '-2px' : '0px'})`
              }}
              priority
            />

            {/* Pulsing Assembly Target Ring */}
            <div
              className="absolute w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-tc-action-lime bg-tc-action-lime/30 animate-ping pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: `${step.highlightCoordinates.x}%`,
                top: `${step.highlightCoordinates.y}%`
              }}
            />
            <div
              className="absolute w-4 h-4 -ml-2 -mt-2 rounded-full bg-tc-action-lime border-2 border-tc-ink shadow-md pointer-events-none transition-all duration-700 ease-out"
              style={{
                left: `${step.highlightCoordinates.x}%`,
                top: `${step.highlightCoordinates.y}%`
              }}
            />
          </div>

          {/* Floating Stage Indicator Tag */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-tc-border shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tc-primary animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-tc-ink uppercase tracking-wider">
              {step.badge} · STEP {currentStepIdx + 1} OF 4
            </span>
          </div>
        </div>

        {/* Right: Chronological Step Scrubber & Technical Specs */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          <div className="space-y-4">
            {/* Step Badges Row */}
            <div className="flex items-center gap-1.5">
              {scene.steps.map((s, idx) => (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    setIsPlaying(false);
                  }}
                  aria-label={`Jump to assembly stage ${idx + 1}: ${s.title}`}
                  className="flex-1 min-h-[36px] py-1.5 flex items-center group cursor-pointer focus:outline-none"
                  title={s.title}
                >
                  <span
                    className={`w-full h-2 rounded-full transition-all ${
                      idx === currentStepIdx
                        ? 'bg-tc-primary shadow-xs'
                        : idx < currentStepIdx
                        ? 'bg-tc-action-lime'
                        : 'bg-tc-border group-hover:bg-tc-border-strong'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Step Details Header */}
            <div className="pt-2">
              <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-tc-primary/10 text-tc-primary tracking-wider">
                CHRONOLOGICAL ASSEMBLY STAGE {currentStepIdx + 1}
              </span>
              <h3 className="font-heading font-extrabold text-xl text-tc-ink mt-2">
                {step.title}
              </h3>
              <p className="text-xs font-semibold text-tc-primary mt-1">
                {step.tagline}
              </p>
            </div>

            {/* Step Description */}
            <p className="text-xs sm:text-sm text-tc-text-secondary leading-relaxed">
              {step.description}
            </p>

            {/* Verified British Standard / Technical Callout */}
            <div className="p-3.5 rounded-lg bg-tc-surface-soft border border-tc-primary/20 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-tc-ink">
                <ShieldCheck className="w-3.5 h-3.5 text-tc-primary" />
                <span>UK Technical Specification:</span>
              </div>
              <p className="text-xs font-mono text-tc-ink/80">
                {step.specNote}
              </p>
            </div>
          </div>

          {/* Interactive Playback Scrubber Controls */}
          <div className="pt-4 border-t border-tc-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-tc-primary hover:bg-tc-primary-hover text-white flex items-center justify-center transition-all shadow-xs"
                title={isPlaying ? 'Pause animation' : 'Play animation'}
                aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentStepIdx(0);
                  setIsPlaying(true);
                }}
                className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg border border-tc-border hover:bg-tc-surface-soft text-tc-ink flex items-center justify-center transition-all"
                title="Restart assembly sequence"
                aria-label="Restart assembly sequence"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Step Jump Buttons */}
            <div className="flex items-center gap-1.5">
              {scene.steps.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setCurrentStepIdx(idx);
                    setIsPlaying(false);
                  }}
                  aria-label={`Jump to assembly step ${idx + 1}`}
                  className={`min-w-[36px] min-h-[44px] sm:min-h-[36px] px-2 rounded-md font-mono text-xs font-bold transition-all flex items-center justify-center ${
                    idx === currentStepIdx
                      ? 'bg-tc-ink text-white shadow-xs'
                      : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-surface-soft border border-tc-border/60'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
