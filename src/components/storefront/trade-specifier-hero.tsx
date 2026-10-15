'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useVAT } from '@/context/vat-context';
import { useCart } from '@/context/cart-context';
import { PublicProductDTO } from '@/types/product';
import { 
  ShieldCheck, 
  Clock, 
  Truck, 
  PackageCheck, 
  Layers, 
  ArrowRight, 
  ShoppingCart, 
  Check, 
  AlertTriangle,
  BadgePercent,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroProductPreset {
  sku: string;
  shortName: string;
  category: string;
  image: string;
  bsStandard: string;
  unitPackLabel: string;
  caseCount: number;
  cartonCount: number;
  unitPriceEx: number;
  unitPriceInc: number;
  casePriceEx: number;
  casePriceInc: number;
  cartonPriceEx: number;
  cartonPriceInc: number;
  caseSavingPercent: number;
  cartonSavingPercent: number;
  productDtoStub: Partial<PublicProductDTO>;
}

const HERO_PRESETS: HeroProductPreset[] = [
  {
    sku: 'IONPVCMC5PKX6',
    shortName: '10m BS EN 60454 PVC Phase Tape (5-Pack)',
    category: 'Electrical Consumables',
    image: '/images/3d/categories/decorating.webp',
    bsStandard: 'BS EN 60454-3-1',
    unitPackLabel: '5 Rolls (10m x 19mm)',
    caseCount: 6,
    cartonCount: 24,
    unitPriceEx: 1.58,
    unitPriceInc: 1.90,
    casePriceEx: 8.53,
    casePriceInc: 10.24,
    cartonPriceEx: 30.34,
    cartonPriceInc: 36.41,
    caseSavingPercent: 10,
    cartonSavingPercent: 20,
    productDtoStub: {
      id: 'prod_IONPVCMC5PKX6',
      title: '10 Mtr PVC Electrical Tape - Mixed Colours (5-Pack)',
      supplier_sku: 'IONPVCMC5PKX6',
      slug: '10-mtr-status-pvc-electrical-tape-mixed-colours-5-pk',
      retail_price_ex_vat_gbp: 1.58,
      retail_price_inc_vat_gbp: 1.90,
      units_per_case: 6,
      category_slug: 'electrical',
      supplier_id: 'status_international'
    }
  },
  {
    sku: 'IONWPLUGS200P10',
    shortName: 'Heavy-Duty Ribbed Wall Plugs (Box of 200)',
    category: 'Masonry Fixings',
    image: '/images/3d/categories/fixings.webp',
    bsStandard: 'BS 8539 Rated',
    unitPackLabel: '200 Plugs (Assorted 5/6/8mm)',
    caseCount: 10,
    cartonCount: 40,
    unitPriceEx: 1.91,
    unitPriceInc: 2.29,
    casePriceEx: 17.19,
    casePriceInc: 20.63,
    cartonPriceEx: 61.12,
    cartonPriceInc: 73.34,
    caseSavingPercent: 10,
    cartonSavingPercent: 20,
    productDtoStub: {
      id: 'prod_IONWPLUGS200P10',
      title: 'Wall Plugs - 200pcs Assorted (5mm, 6mm, 8mm)',
      supplier_sku: 'IONWPLUGS200P10',
      slug: 'wall-plugs-200pcs-100x5mm-60x6mm-40x8mm-grey',
      retail_price_ex_vat_gbp: 1.91,
      retail_price_inc_vat_gbp: 2.29,
      units_per_case: 10,
      category_slug: 'fixings',
      supplier_id: 'status_international'
    }
  },
  {
    sku: 'IONESDRIVERS1P6',
    shortName: '1000V VDE Insulated Screwdriver Set (6-Pc)',
    category: 'Certified Hand Tools',
    image: '/images/3d/categories/tools.webp',
    bsStandard: 'BS EN IEC 60900',
    unitPackLabel: '6-Piece Insulated VDE Set',
    caseCount: 6,
    cartonCount: 18,
    unitPriceEx: 6.00,
    unitPriceInc: 7.20,
    casePriceEx: 32.40,
    casePriceInc: 38.88,
    cartonPriceEx: 86.40,
    cartonPriceInc: 103.68,
    caseSavingPercent: 10,
    cartonSavingPercent: 20,
    productDtoStub: {
      id: 'prod_IONESDRIVERS1P6',
      title: 'Electricians Screwdriver Set - 1000V Insulated (6-Piece)',
      supplier_sku: 'IONESDRIVERS1P6',
      slug: 'electricians-screwdriver-set-insulated-handles-6-piece',
      retail_price_ex_vat_gbp: 6.00,
      retail_price_inc_vat_gbp: 7.20,
      units_per_case: 6,
      category_slug: 'tools',
      supplier_id: 'status_international'
    }
  }
];

export function TradeSpecifierHero() {
  const { isTradeMode, toggleVatMode, setMode } = useVAT();
  const { addItem, openCart } = useCart();

  const [selectedSku, setSelectedSku] = useState('IONPVCMC5PKX6');
  const [tier, setTier] = useState<'unit' | 'case' | 'carton'>('unit');
  const [isAdded, setIsAdded] = useState(false);

  // Live dispatch countdown to 4:00 PM UK time
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      // Calculate target at 16:00:00 local time
      const target = new Date();
      target.setHours(16, 0, 0, 0);

      let diffMs = target.getTime() - now.getTime();
      if (diffMs <= 0) {
        // Target next day 16:00
        target.setDate(target.getDate() + 1);
        diffMs = target.getTime() - now.getTime();
      }

      const totalSec = Math.floor(diffMs / 1000);
      const hours = Math.floor((totalSec % 86400) / 3600);
      const minutes = Math.floor((totalSec % 3600) / 60);
      const seconds = totalSec % 60;
      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const activePreset = useMemo(
    () => HERO_PRESETS.find((p) => p.sku === selectedSku) || HERO_PRESETS[0],
    [selectedSku]
  );

  // Current calculation based on VAT mode and tier
  const pricing = useMemo(() => {
    let priceEx = activePreset.unitPriceEx;
    let priceInc = activePreset.unitPriceInc;
    let qtyTotal = 1;
    let savingPct = 0;
    let tierLabel = 'Single Trade Pack';

    if (tier === 'case') {
      priceEx = activePreset.casePriceEx;
      priceInc = activePreset.casePriceInc;
      qtyTotal = activePreset.caseCount;
      savingPct = activePreset.caseSavingPercent;
      tierLabel = `Trade Case (${activePreset.caseCount} Packs)`;
    } else if (tier === 'carton') {
      priceEx = activePreset.cartonPriceEx;
      priceInc = activePreset.cartonPriceInc;
      qtyTotal = activePreset.cartonCount;
      savingPct = activePreset.cartonSavingPercent;
      tierLabel = `Master Carton (${activePreset.cartonCount} Packs)`;
    }

    const unitEquivalentEx = priceEx / qtyTotal;
    const unitEquivalentInc = priceInc / qtyTotal;

    return {
      displayPrice: isTradeMode ? priceEx : priceInc,
      vatLabel: isTradeMode ? 'ex. VAT' : 'inc. VAT',
      secondaryPrice: isTradeMode ? priceInc : priceEx,
      secondaryLabel: isTradeMode ? 'inc. VAT' : 'ex. VAT',
      unitEquivalent: isTradeMode ? unitEquivalentEx : unitEquivalentInc,
      savingPct,
      qtyTotal,
      tierLabel
    };
  }, [activePreset, tier, isTradeMode]);

  const handleAddToCart = () => {
    if (activePreset.productDtoStub) {
      const isCase = tier !== 'unit';
      const quantity = tier === 'carton' ? 4 : 1; // 4 cases for carton or 1
      addItem(activePreset.productDtoStub as PublicProductDTO, quantity, isCase);
      setIsAdded(true);
      setTimeout(() => {
        setIsAdded(false);
        openCart();
      }, 600);
    }
  };

  return (
    <section className="bg-white border-b border-tc-border overflow-hidden">
      {/* 1. Top Industrial Trade Assurance Command Strip */}
      <div className="bg-tc-ink text-white border-b border-tc-ink/20 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 text-xs">
          {/* Pillar 1 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tc-primary/20 border border-tc-primary/40 flex items-center justify-center shrink-0 text-tc-action-lime">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">Honest Pack Counts &amp; Case Pricing</p>
              <p className="text-[11px] text-gray-400">Zero mystery blister packs · GS1 UK GTIN-13 batch verified</p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tc-action-lime/20 border border-tc-action-lime/40 flex items-center justify-center shrink-0 text-tc-action-lime">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-bold text-white tracking-tight">Live Verified Inventory</p>
                <span className="inline-block w-2 h-2 rounded-full bg-tc-success animate-pulse" />
              </div>
              <p className="text-[11px] text-gray-400">115/115 SKUs physically in stock · Zero phantom backorders</p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-tc-primary/20 border border-tc-primary/40 flex items-center justify-center shrink-0 text-tc-action-lime">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-white tracking-tight">Free UK Delivery Over £50 ex. VAT</p>
              <p className="text-[11px] text-gray-400">Next-day tracked dispatch via Royal Mail 24 &amp; DPD</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Asymmetric Hero Stage */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          
          {/* Left 7 Columns: Command Center & Interactive Pack Specifier */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              {/* Top Eyebrow with UK Trade Indicator */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-tc-surface-soft border border-tc-border text-xs font-semibold text-tc-ink">
                <span className="w-2 h-2 rounded-full bg-tc-primary" />
                <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-tc-primary">
                  BRITISH TRADE HARDWARE DIRECT
                </span>
                <span className="text-tc-border">|</span>
                <span className="text-tc-text-secondary text-[11px]">Zero Site Downtime Standard</span>
              </div>

              {/* Bold Authoritative Headline */}
              <h1 className="font-heading font-extrabold text-3xl sm:text-4xl lg:text-5xl text-tc-ink tracking-tight leading-[1.12]">
                The Hardware Standard <br className="hidden sm:inline" />
                <span className="text-tc-primary">for British Trades.</span>
              </h1>

              {/* Sub-headline */}
              <p className="text-sm sm:text-base text-tc-graphite max-w-xl leading-relaxed">
                Direct trade pricing, transparent carton margins, and verified British Standards. 
                Exact GTIN-13 pack counts engineered to keep UK electricians, builders, and serious renovators on schedule.
              </p>
            </div>

            {/* Interactive Live Hardware Specifier Box */}
            <div className="bg-tc-surface-soft border border-tc-border rounded-xl p-5 sm:p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-tc-border/80 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-tc-primary/10 text-tc-primary tracking-wider">
                    INTERACTIVE SPECIFIER
                  </span>
                  <h3 className="font-heading font-bold text-base text-tc-ink mt-1">
                    Direct Trade Pack &amp; Margin Calculator
                  </h3>
                </div>

                {/* Live Ex-VAT / Inc-VAT Rocker Switch */}
                <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-lg border border-tc-border shadow-xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setMode('ex')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      isTradeMode
                        ? 'bg-tc-ink text-white shadow-xs'
                        : 'text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    Ex. VAT (Trade)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('inc')}
                    className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                      !isTradeMode
                        ? 'bg-tc-ink text-white shadow-xs'
                        : 'text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    Inc. VAT (Retail)
                  </button>
                </div>
              </div>

              {/* Trade Item Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {HERO_PRESETS.map((p) => (
                  <button
                    key={p.sku}
                    type="button"
                    onClick={() => setSelectedSku(p.sku)}
                    className={`p-2.5 rounded-lg border text-left transition-all flex flex-col justify-between min-h-[68px] ${
                      selectedSku === p.sku
                        ? 'bg-white border-tc-primary shadow-xs ring-1 ring-tc-primary'
                        : 'bg-white/70 border-tc-border hover:bg-white text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold text-tc-primary uppercase truncate">
                      {p.category}
                    </span>
                    <span className="text-xs font-bold text-tc-ink line-clamp-1 mt-0.5">
                      {p.shortName}
                    </span>
                    <span className="text-[10px] font-mono text-tc-text-secondary mt-1">
                      {p.bsStandard}
                    </span>
                  </button>
                ))}
              </div>

              {/* Tier Switcher: Single Unit vs Case vs Carton */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-tc-ink">Select Supply Format:</span>
                  {pricing.savingPct > 0 && (
                    <span className="inline-flex items-center gap-1 font-bold text-tc-success font-mono text-[11px] bg-tc-success/10 px-2 py-0.5 rounded">
                      <BadgePercent className="w-3.5 h-3.5" />
                      Save {pricing.savingPct}% vs Single Pack
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-white p-1 rounded-lg border border-tc-border">
                  <button
                    type="button"
                    onClick={() => setTier('unit')}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all text-center flex flex-col items-center ${
                      tier === 'unit'
                        ? 'bg-tc-primary text-white shadow-xs'
                        : 'text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    <span>Single Pack</span>
                    <span className="text-[10px] opacity-80 font-normal">1 Unit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('case')}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all text-center flex flex-col items-center ${
                      tier === 'case'
                        ? 'bg-tc-primary text-white shadow-xs'
                        : 'text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    <span>Site Case</span>
                    <span className="text-[10px] opacity-80 font-normal">{activePreset.caseCount} Packs</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTier('carton')}
                    className={`py-2 px-2 text-xs font-bold rounded-md transition-all text-center flex flex-col items-center ${
                      tier === 'carton'
                        ? 'bg-tc-primary text-white shadow-xs'
                        : 'text-tc-text-secondary hover:text-tc-ink'
                    }`}
                  >
                    <span>Master Carton</span>
                    <span className="text-[10px] opacity-80 font-normal">{activePreset.cartonCount} Packs</span>
                  </button>
                </div>
              </div>

              {/* Price Calculation & Add to Basket Row */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-baseline gap-2">
                    <span className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink">
                      £{pricing.displayPrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-tc-text-secondary">
                      {pricing.vatLabel}
                    </span>
                    <span className="text-xs text-tc-text-secondary/70">
                      (£{pricing.secondaryPrice.toFixed(2)} {pricing.secondaryLabel})
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-tc-text-secondary">
                    Equates to <strong className="text-tc-ink font-bold">£{pricing.unitEquivalent.toFixed(3)}</strong> / pack count · {activePreset.bsStandard}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleAddToCart}
                    className="min-h-[44px] flex-1 sm:flex-none flex items-center justify-center gap-2 bg-tc-primary hover:bg-tc-primary-hover text-white shadow-xs font-bold text-xs"
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4 text-tc-action-lime" />
                        <span>Added to Basket</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add {pricing.tierLabel}</span>
                      </>
                    )}
                  </Button>

                  <Button variant="outline" size="lg" asChild className="min-h-[44px] text-xs font-bold">
                    <Link href={`/products/${activePreset.productDtoStub.slug}`}>
                      Inspect SKU
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Direct Link Row to Primary Catalogs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Button variant="primary" size="lg" asChild>
                <Link href="/tools" className="flex items-center gap-2">
                  <span>Explore Full 115-SKU Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/projects">Curated Project Kits</Link>
              </Button>
            </div>
          </div>

          {/* Right 5 Columns: Site Downtime Shield & UK Dispatch Telemetry */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            
            {/* Live UK Dispatch Countdown Hub Card */}
            <div className="bg-tc-ink text-white rounded-xl p-5 sm:p-6 space-y-4 border border-tc-ink/20 shadow-md">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-tc-action-lime animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-tc-action-lime">
                    SAME-DAY DISPATCH CUT-OFF
                  </span>
                </div>
                <span className="text-[10px] font-mono text-gray-400">UK Hub</span>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-2">
                <div className="bg-white/10 rounded-lg p-2.5 text-center min-w-[54px]">
                  <span className="font-mono font-extrabold text-2xl text-white">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] font-mono uppercase text-gray-400 mt-0.5">Hours</span>
                </div>
                <span className="font-mono font-bold text-xl text-tc-action-lime">:</span>
                <div className="bg-white/10 rounded-lg p-2.5 text-center min-w-[54px]">
                  <span className="font-mono font-extrabold text-2xl text-white">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] font-mono uppercase text-gray-400 mt-0.5">Mins</span>
                </div>
                <span className="font-mono font-bold text-xl text-tc-action-lime">:</span>
                <div className="bg-white/10 rounded-lg p-2.5 text-center min-w-[54px]">
                  <span className="font-mono font-extrabold text-2xl text-white">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="block text-[9px] font-mono uppercase text-gray-400 mt-0.5">Secs</span>
                </div>
                <div className="ml-auto text-right text-xs">
                  <span className="block font-bold text-white">7:30 AM Site Ready</span>
                  <span className="text-[11px] text-gray-400">Royal Mail Tracked 24</span>
                </div>
              </div>

              <div className="pt-2 text-xs text-gray-300 flex items-center justify-between border-t border-white/10">
                <span>Free Tracked Carriage over £50</span>
                <span className="font-bold text-tc-action-lime">115 SKUs Ready</span>
              </div>
            </div>

            {/* White-Hat Site Downtime Loss-Prevention Shield */}
            <div className="bg-white rounded-xl border border-tc-border p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-tc-error/10 border border-tc-error/30 flex items-center justify-center shrink-0 text-tc-error mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-heading font-bold text-sm text-tc-ink">
                    The True Cost of Missing Fixings
                  </h4>
                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    UK trade site downtime averages <strong className="text-tc-ink font-bold">£85/hour per operative</strong> when work stalls for missing hardware or uncertified consumables.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-tc-surface-soft border border-tc-border space-y-2">
                <p className="text-[11px] font-bold text-tc-ink flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-tc-primary" />
                  <span>ToolCart Verified Standards Guarantee:</span>
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-tc-text-secondary">
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tc-success shrink-0" />
                    <span>BS 7671 (Electrical)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tc-success shrink-0" />
                    <span>BS EN IEC 60900 (1000V)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tc-success shrink-0" />
                    <span>BS 8539 (Anchor Pull)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tc-success shrink-0" />
                    <span>BS EN 14183 (150kg)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Hardware Workbench Cutaway Card */}
            <div className="relative rounded-xl overflow-hidden border border-tc-border bg-tc-canvas aspect-[16/7] shadow-xs group">
              <Image
                src="/images/hero/hero-workbench.webp"
                alt="ToolCart Verified UK Trade Hardware Workbench"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tc-ink/80 via-transparent to-transparent flex items-end p-4">
                <div className="text-white text-xs">
                  <p className="font-mono text-[10px] font-bold text-tc-action-lime uppercase tracking-wider">
                    AUTHENTIC TRADE INVENTORY
                  </p>
                  <p className="font-bold text-sm">Every screw, driver, and roll verified in the UK.</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
