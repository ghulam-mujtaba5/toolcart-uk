'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Layers, 
  Wrench, 
  ShieldCheck, 
  SlidersHorizontal,
  PackageCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface AssemblyStep {
  stepNumber: number;
  title: string;
  tagline: string;
  description: string;
  specNote: string;
  badge: string;
  tradeBenefit: string;
  highlightCoordinates: { x: number; y: number };
}

interface KitItem {
  name: string;
  qty: string;
  standard: string;
}

interface AssemblyScene {
  id: 'electrical-kit' | 'masonry-bolt';
  name: string;
  subtitle: string;
  category: string;
  imageSrc: string;
  alt: string;
  targetKitAnchor?: string;
  includedItems?: KitItem[];
  steps: AssemblyStep[];
}

const ASSEMBLY_SCENES: AssemblyScene[] = [
  {
    id: 'electrical-kit',
    name: 'Curated Electrical Maintenance Kit',
    subtitle: 'Domestic Consumer Unit & Wiring Maintenance Pack-Out',
    category: 'JOB-READY KIT PACK-OUT',
    imageSrc: '/images/3d/assembly/kit-assembly-electrical.webp',
    alt: 'Visual Breakdown of the ToolCart Domestic Electrical & Consumables Kit',
    targetKitAnchor: '#kit-electrical-consumables',
    includedItems: [
      { name: '5-Roll BS EN 60454 Phase Marking Tape (Brown, Blue, Green/Yellow, Red, Black)', qty: '1 Pack (5x 10m)', standard: 'BS EN 60454-3-1' },
      { name: '1000V Insulated Slim Screwdriver Set (PZ1, PZ2, SL3, SL4)', qty: '1 Set (4 pcs)', standard: 'BS EN IEC 60900' },
      { name: 'Mains Neon Voltage Indicator Pen (200–250V AC)', qty: '1 Unit', standard: 'UKCA / CE' },
      { name: 'High-Leverage Carbon Steel Cable Shears', qty: '1 Unit', standard: 'DIN ISO 5746' },
      { name: 'Weather-Resistant 600D Heavy-Duty Contractor Tool Bag', qty: '1 Tote', standard: 'Site Rated' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Heavy-Duty Contractor Tote & Tool Partitioning',
        tagline: 'Rugged 600D water-resistant ballistic polyester with reinforced rubber base',
        description: 'Structured site tote keeps all essential wiring and diagnostic tools securely organized. Internal elastic loops and divided compartments prevent tool damage and ensure quick visual inventory before leaving the job site.',
        specNote: 'Heavy-duty 600D polyester with dual-stitched webbing carry handles',
        tradeBenefit: 'Prevents lost tools on site and speeds up call-out pack-down.',
        badge: 'Base Tote',
        highlightCoordinates: { x: 50, y: 75 }
      },
      {
        stepNumber: 2,
        title: 'Step 2: 1000V VDE Insulated Tools & Voltage Testing',
        tagline: 'Certified live-circuit safe tooling tested up to 10,000V AC',
        description: 'Individually tested VDE terminal screwdrivers (Pozi & Slotted) with dual-density ergonomic soft-grip handles ensure slip-free torque on consumer unit terminal blocks. Includes a 200–250V mains neon tester for fast circuit verification.',
        specNote: 'BS EN IEC 60900 certified for live working up to 1000V AC / 1500V DC',
        tradeBenefit: 'Eliminates electrical shock risk during panel commissioning.',
        badge: '1000V Tooling',
        highlightCoordinates: { x: 38, y: 35 }
      },
      {
        stepNumber: 3,
        title: 'Step 3: BS EN 60454 Phase Tapes & Cable Shears',
        tagline: 'Harmonised UK wiring colors: Brown Live, Blue Neutral, Green/Yellow Earth',
        description: 'Dielectric flame-retardant PVC electrical tape pack ensures rapid, compliant cable identification in compliance with 18th Edition wiring regulations. Paired with hardened carbon steel cable shears for clean wire trimming without conductor crushing.',
        specNote: 'BS EN 60454-3-1 flame-retardant self-extinguishing PVC (40kV/mm dielectric)',
        tradeBenefit: 'Guarantees 18th Edition BS 7671 electrical wiring compliance.',
        badge: 'Phase Tapes',
        highlightCoordinates: { x: 62, y: 22 }
      },
      {
        stepNumber: 4,
        title: 'Step 4: Complete Job-Ready Package Dispatch',
        tagline: 'All 5 trade essentials in a single parcel — saves 15% vs individual items',
        description: 'Complete maintenance solution pre-packaged and verified against trade quality benchmarks. One-click ordering eliminates missing site consumables, reduces trade van downtime, and arrives in 100% recyclable transit packaging.',
        specNote: 'Fully certified UK trade kit with guaranteed batch traceability',
        tradeBenefit: 'Saves 15% on trade pricing and eliminates missing consumable runs.',
        badge: 'Fully Packed',
        highlightCoordinates: { x: 50, y: 55 }
      }
    ]
  },
  {
    id: 'masonry-bolt',
    name: 'Masonry Substrate & Anchor Cross-Section',
    subtitle: 'Step-by-Step Installation: Red Brick, Nylon Expansion Plug & Coach Bolt',
    category: 'TECHNICAL FIXINGS CUTAWAY',
    imageSrc: '/images/3d/assembly/masonry-bolt-assembly.webp',
    alt: 'Technical Engineering Cutaway of Masonry Wall Plug and Coach Bolt Installation',
    includedItems: [
      { name: 'High-Tensile Grade 8.8 Hex Head Coach Bolt (Zinc Plated)', qty: 'Standard Pack', standard: 'BS 8539 / Grade 8.8' },
      { name: 'DIN 125 Form A Load-Spreading Steel Washer', qty: 'Standard Pack', standard: 'DIN 125' },
      { name: 'Virgin Polyamide Nylon Expansion Wall Plug (8mm x 50mm)', qty: 'Standard Pack', standard: 'Class A1 Fire Rated' },
      { name: 'Solid Red Brick Structural Substrate Guide', qty: 'Technical Spec', standard: 'BS 8539 Standard' }
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1: Clean Borehole Drilling & Dust Evacuation',
        tagline: '8mm SDS+ hammer-drilled borehole in structural clay masonry',
        description: 'Drill a uniform 60mm deep hole perpendicular to the brick face using an 8mm masonry drill bit. The chamber must be thoroughly cleared of dust with a blow pump or wire brush to ensure the anchor ribs establish full mechanical friction.',
        specNote: 'Calibrated for 8mm diameter drill bit and minimum 60mm embedment depth',
        tradeBenefit: 'Prevents dust compaction and anchor failure under tension.',
        badge: 'Borehole Prep',
        highlightCoordinates: { x: 28, y: 49 }
      },
      {
        stepNumber: 2,
        title: 'Step 2: Nylon Expansion Plug Insertion',
        tagline: 'Virgin polyamide nylon plug with directional anti-rotation fins',
        description: 'Push the heavy-duty expansion plug flush with the brick surface. Lateral locking fins bite into the borehole walls to prevent spinning during bolt driving, while the split shank prepares for dual-direction radial expansion.',
        specNote: 'Virgin polyamide nylon 6/6 formulation (operational from -40°C to +80°C)',
        tradeBenefit: 'Guarantees zero plug spin inside solid or perforated substrate.',
        badge: 'Plug Insertion',
        highlightCoordinates: { x: 44, y: 50 }
      },
      {
        stepNumber: 3,
        title: 'Step 3: Washer Seating & Coach Bolt Alignment',
        tagline: 'DIN 125 Form A load-distributing washer and Grade 8.8 hex bolt',
        description: 'Position the wide-diameter zinc-plated steel washer against the fixture face to distribute clamping pressure evenly. Align the high-tensile hex head coach bolt into the pilot sleeve, ensuring square perpendicular entry.',
        specNote: 'Grade 8.8 zinc-passivated steel hex head bolt with DIN 125 Form A washer',
        tradeBenefit: 'Prevents surface crush on fixtures and eliminates shear warping.',
        badge: 'Bolt Alignment',
        highlightCoordinates: { x: 74, y: 50 }
      },
      {
        stepNumber: 4,
        title: 'Step 4: Torque Compression & Mechanical Radial Lock',
        tagline: 'Full radial expansion achieving certified 3.2kN characteristic pull-out load',
        description: 'Torque applied to the hex head draws the tapered thread into the plug core, forcing the ribbed wings outward into the microscopic fissures of the brickwork. Creates an unyielding mechanical interlock rated for heavy wall fixtures.',
        specNote: 'Tested characteristic pull-out resistance up to 3.2kN in standard UK masonry (BS 8539)',
        tradeBenefit: 'Delivers reliable 3.2kN holding capacity for heavy installations.',
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
  const [activeTab, setActiveTab] = useState<'assembly' | 'contents'>('assembly');

  const scene = ASSEMBLY_SCENES.find((s) => s.id === activeSceneId) || ASSEMBLY_SCENES[0];
  const step = scene.steps[currentStepIdx];

  // Auto-play timer (pause when in contents tab or explicitly paused)
  useEffect(() => {
    if (!isPlaying || activeTab === 'contents') return;
    const interval = setInterval(() => {
      setCurrentStepIdx((prev) => (prev + 1) % scene.steps.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPlaying, activeTab, scene.steps.length]);

  const handleSceneChange = (id: 'electrical-kit' | 'masonry-bolt') => {
    setActiveSceneId(id);
    setCurrentStepIdx(0);
    setActiveTab('assembly');
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
            <span>Fixings Cutaway</span>
          </button>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Left: 3D Visualization Stage */}
        <div className="lg:col-span-7 relative bg-gradient-to-b from-[#F7F8F5] to-white p-6 sm:p-10 flex flex-col items-center justify-center min-h-[380px] sm:min-h-[460px] border-b lg:border-b-0 lg:border-r border-tc-border overflow-hidden">
          {/* Subtle Studio Grid */}
          <div className="absolute inset-0 bg-[radial-gradient(#2450B812_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-60" />

          {/* 3D Model Render Container */}
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
            {activeTab === 'assembly' && (
              <>
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
              </>
            )}
          </div>

          {/* Floating Stage Indicator Tag */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-tc-border shadow-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tc-primary animate-pulse" />
            <span className="font-mono text-[11px] font-bold text-tc-ink uppercase tracking-wider">
              {step.badge} · STEP {currentStepIdx + 1} OF 4
            </span>
          </div>

          {/* View Mode Switcher Pill */}
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md p-1 rounded-lg border border-tc-border shadow-xs flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('assembly')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded ${
                activeTab === 'assembly'
                  ? 'bg-tc-ink text-white'
                  : 'text-tc-text-secondary hover:text-tc-ink'
              }`}
            >
              Assembly Walkthrough
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('contents')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded flex items-center gap-1 ${
                activeTab === 'contents'
                  ? 'bg-tc-ink text-white'
                  : 'text-tc-text-secondary hover:text-tc-ink'
              }`}
            >
              <PackageCheck className="w-3 h-3" />
              <span>What&apos;s Included</span>
            </button>
          </div>
        </div>

        {/* Right: Interactive Step Guidance & Specs */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6 bg-white">
          {activeTab === 'assembly' ? (
            <div className="space-y-4">
              {/* Step Progress Track */}
              <div className="flex items-center gap-1.5">
                {scene.steps.map((s, idx) => (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => {
                      setCurrentStepIdx(idx);
                      setIsPlaying(false);
                    }}
                    aria-label={`Jump to assembly step ${idx + 1}: ${s.title}`}
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
                  ASSEMBLY STEP {currentStepIdx + 1} OF 4
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-tc-ink mt-2">
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

              {/* Trade Practical Benefit */}
              <div className="flex items-start gap-2 p-2.5 rounded-md bg-tc-action-lime/15 border border-tc-action-lime/40 text-tc-ink text-xs">
                <CheckCircle2 className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-tc-ink">Trade Advantage: </span>
                  <span className="text-tc-text-secondary font-medium">{step.tradeBenefit}</span>
                </div>
              </div>

              {/* Verified British Standard / Technical Callout */}
              <div className="p-3.5 rounded-lg bg-tc-surface-soft border border-tc-primary/20 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-tc-ink">
                  <ShieldCheck className="w-3.5 h-3.5 text-tc-primary" />
                  <span>UK Technical Specification:</span>
                </div>
                <p className="text-xs font-mono text-tc-ink/90 font-medium">
                  {step.specNote}
                </p>
              </div>
            </div>
          ) : (
            /* What's In The Box Panel */
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-tc-success/10 text-tc-success tracking-wider">
                  VERIFIED HARDWARE MANIFEST
                </span>
                <h3 className="font-heading font-extrabold text-lg sm:text-xl text-tc-ink mt-2">
                  Package Contents &amp; Compliance
                </h3>
                <p className="text-xs text-tc-text-secondary mt-1">
                  Every item in this kit is pre-verified against UK trade standards.
                </p>
              </div>

              <div className="divide-y divide-tc-border border border-tc-border rounded-lg overflow-hidden">
                {scene.includedItems?.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white hover:bg-tc-surface-soft transition-colors text-xs flex items-start justify-between gap-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold text-tc-ink">{item.name}</p>
                      <span className="inline-block text-[10px] font-mono font-medium text-tc-primary bg-tc-primary/10 px-1.5 py-0.5 rounded">
                        {item.standard}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-tc-text-secondary shrink-0 text-right">
                      {item.qty}
                    </span>
                  </div>
                ))}
              </div>

              {scene.targetKitAnchor && (
                <div className="pt-2">
                  <a
                    href={scene.targetKitAnchor}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-tc-primary hover:bg-tc-primary-hover text-white text-xs font-bold transition-all shadow-xs"
                  >
                    <span>View Full Kit &amp; Customise Items</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Interactive Playback Scrubber Controls */}
          {activeTab === 'assembly' && (
            <div className="pt-4 border-t border-tc-border flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-11 h-11 min-w-[44px] min-h-[44px] rounded-lg bg-tc-primary hover:bg-tc-primary-hover text-white flex items-center justify-center transition-all shadow-xs"
                  title={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
                  aria-label={isPlaying ? 'Pause walkthrough' : 'Play walkthrough'}
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
          )}
        </div>
      </div>
    </div>
  );
}
