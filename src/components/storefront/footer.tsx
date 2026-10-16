'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cookie,
  ChevronDown,
  ArrowUp,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { useCookieConsent } from '@/context/cookie-consent-context';
import { cn } from '@/lib/utils';

export function Footer() {
  const { openPreferences } = useCookieConsent();

  // Mobile accordion state for collapsible navigation on small viewports (< md)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    catalog: false,
    solutions: false,
    trade: false,
    standards: false,
  });

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-tc-ink text-white border-t border-tc-graphite pt-10 sm:pt-14 pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Utility Row: Brand Reassurance & Ergonomic Back to Top */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-center gap-3 text-xs text-[#DFE8F6]">
            <span className="w-2 h-2 rounded-full bg-tc-action-lime text-tc-ink animate-pulse shrink-0" />
            <span className="font-heading font-bold text-white">UK Trade Distribution Network</span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="text-white/70 hidden sm:inline">Trade counter speeds delivered direct to site</span>
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            aria-label="Back to top of page"
            data-testid="footer-back-to-top-btn"
            className="w-full sm:w-auto px-4 py-2 rounded-button bg-white/5 hover:bg-white/10 active:scale-95 border border-white/15 text-xs font-bold text-white flex items-center justify-center gap-2 min-h-[44px] transition-all hover:border-tc-action-lime group"
          >
            <span>Back to Top</span>
            <ArrowUp className="w-4 h-4 text-tc-action-lime group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* Trade Trust Badges Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pb-8 border-b border-white/10 text-xs">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Truck className="w-4 h-4 text-tc-action-lime shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Free UK Delivery</p>
              <p className="text-[11px] text-[#DFE8F6]">On orders over £50 ex. VAT</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-tc-action-lime shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Direct Trade Supply</p>
              <p className="text-[11px] text-[#DFE8F6]">VAT invoices &amp; 30-day terms</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-tc-action-lime shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">UKCA &amp; CE Certified</p>
              <p className="text-[11px] text-[#DFE8F6]">1000V VDE tested hardware</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-tc-action-lime shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-white">Encrypted Checkout</p>
              <p className="text-[11px] text-[#DFE8F6]">256-Bit SSL trade gateway</p>
            </div>
          </div>
        </div>

        {/* Master Brand Showcase — Single Dedicated Logo Placement at Bigger Size */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-white/[0.08] via-white/[0.04] to-transparent border border-white/15 backdrop-blur-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-tc-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-tc-action-lime/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            {/* Left: Bigger 3D Brand Logo with Action Lime Branding Accent */}
            <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-2xl sm:rounded-3xl bg-tc-action-lime text-tc-ink border-2 border-tc-ink p-2 sm:p-3 flex items-center justify-center shadow-xl transition-transform duration-300 group-hover:scale-105 overflow-hidden">
                  <img
                    src="/images/brand/logo-toolcart.webp"
                    alt="ToolCart Official 3D Brand Logo"
                    className="w-full h-full object-contain drop-shadow-[0_8px_16px_rgba(0,0,0,0.35)] transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* 3D Master Emblem Tag */}
                <div className="absolute -bottom-2 -right-1 bg-tc-ink text-tc-action-lime border border-tc-action-lime/40 text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded shadow-md">
                  Master Emblem
                </div>
              </div>

              {/* Center: Brand Typography & Authority */}
              <div className="space-y-3 max-w-xl">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3">
                  <span className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl tracking-tight text-white">
                    TOOLCART
                  </span>
                  <span className="bg-tc-action-lime text-tc-ink text-[11px] sm:text-xs font-mono font-extrabold uppercase px-3 py-1 rounded-full border border-tc-ink tracking-wider">
                    UK Trade Direct
                  </span>
                </div>
                <p className="text-sm sm:text-base text-[#DFE8F6] leading-relaxed font-body">
                  The right tools. The right advice. Direct UK distribution of trade-quality hardware, fixings, consumables, and site gear with verified stock telemetry.
                </p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-[#DFE8F6]/85 pt-1">
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-tc-action-lime text-tc-ink inline-block" />
                    Trade &amp; Consumer Distribution
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-tc-action-lime text-tc-ink inline-block" />
                    BS EN IEC &amp; UKCA Standards
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium">
                    <span className="w-2 h-2 rounded-full bg-tc-action-lime text-tc-ink inline-block" />
                    Direct Site Dispatch
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Trade Action CTA Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full sm:w-auto md:w-56 shrink-0">
              <Link
                href="/trade"
                className="w-full text-center px-5 py-3 rounded-xl bg-tc-action-lime text-tc-ink font-heading font-bold text-xs uppercase tracking-wider hover:bg-tc-action-lime-hover transition-all shadow-md active:scale-95 border border-tc-ink flex items-center justify-center min-h-[44px]"
              >
                Open Trade Account
              </Link>
              <Link
                href="/guides"
                className="w-full text-center px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-heading font-bold text-xs uppercase tracking-wider transition-all border border-white/20 active:scale-95 flex items-center justify-center min-h-[44px]"
              >
                UK Technical Guides
              </Link>
            </div>
          </div>
        </div>

        {/* 5-Column Grid with Mobile Accordions (< md) & Static Desktop Columns (>= md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-sm">
          {/* Column 1: Trade Network */}
          <div className="lg:col-span-1 space-y-4">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Trade Direct
            </p>
            <p className="text-xs text-[#DFE8F6] leading-relaxed">
              Direct trade supply for UK contractors, tradespeople, and serious DIYers. Guaranteed pack quantities and certified trade hardware.
            </p>
            <div className="pt-2 text-xs text-[#DFE8F6] font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-tc-action-lime shrink-0" />
              <span>Direct UK Hardware Distribution</span>
            </div>
          </div>

          {/* Column 2: Hardware Categories */}
          <div className="space-y-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('catalog')}
              aria-expanded={Boolean(openSections.catalog)}
              aria-controls="footer-section-catalog"
              data-testid="footer-accordion-toggle-catalog"
              className="w-full flex items-center justify-between py-3 md:hidden text-left border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider font-heading min-h-[44px] active:text-tc-action-lime transition-colors"
            >
              <span>Hardware Catalog</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-tc-action-lime transition-transform duration-200',
                  openSections.catalog && 'rotate-180'
                )}
              />
            </button>

            {/* Desktop Static Header */}
            <p className="hidden md:block text-xs font-bold text-white uppercase tracking-wider font-heading">
              Hardware Catalog
            </p>

            {/* Links List */}
            <ul
              id="footer-section-catalog"
              className={cn(
                'space-y-1 md:space-y-2 text-xs text-[#DFE8F6] pt-1 md:pt-0',
                openSections.catalog ? 'block' : 'hidden md:block'
              )}
            >
              <li>
                <Link href="/tools" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Hand Tools &amp; Bits
                </Link>
              </li>
              <li>
                <Link href="/fixings" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Fixings &amp; Wall Plugs
                </Link>
              </li>
              <li>
                <Link href="/decorating" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Painting &amp; Masking
                </Link>
              </li>
              <li>
                <Link href="/measuring" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Measuring &amp; Spirit Levels
                </Link>
              </li>
              <li>
                <Link href="/ppe" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Workwear &amp; Eye Protection
                </Link>
              </li>
              <li>
                <Link href="/site-equipment" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Site Tarpaulins &amp; Ladders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Advice & Curated Kits */}
          <div className="space-y-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('solutions')}
              aria-expanded={Boolean(openSections.solutions)}
              aria-controls="footer-section-solutions"
              data-testid="footer-accordion-toggle-solutions"
              className="w-full flex items-center justify-between py-3 md:hidden text-left border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider font-heading min-h-[44px] active:text-tc-action-lime transition-colors"
            >
              <span>Project Solutions</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-tc-action-lime transition-transform duration-200',
                  openSections.solutions && 'rotate-180'
                )}
              />
            </button>

            {/* Desktop Static Header */}
            <p className="hidden md:block text-xs font-bold text-white uppercase tracking-wider font-heading">
              Project Solutions
            </p>

            {/* Links List */}
            <ul
              id="footer-section-solutions"
              className={cn(
                'space-y-1 md:space-y-2 text-xs text-[#DFE8F6] pt-1 md:pt-0',
                openSections.solutions ? 'block' : 'hidden md:block'
              )}
            >
              <li>
                <Link href="/projects" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Curated Project Kits
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  All UK Buying Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/complete-uk-guide-to-screwdrivers"
                  className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center"
                >
                  Screwdriver &amp; VDE Standards
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/selecting-wall-plugs-masonry-fixings"
                  className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center"
                >
                  Masonry Wall Plug Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/site-access-step-ladder-safety"
                  className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center"
                >
                  EN 14183 Step Ladder Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trade & Orders */}
          <div className="space-y-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('trade')}
              aria-expanded={Boolean(openSections.trade)}
              aria-controls="footer-section-trade"
              data-testid="footer-accordion-toggle-trade"
              className="w-full flex items-center justify-between py-3 md:hidden text-left border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider font-heading min-h-[44px] active:text-tc-action-lime transition-colors"
            >
              <span>Trade &amp; Orders</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-tc-action-lime transition-transform duration-200',
                  openSections.trade && 'rotate-180'
                )}
              />
            </button>

            {/* Desktop Static Header */}
            <p className="hidden md:block text-xs font-bold text-white uppercase tracking-wider font-heading">
              Trade &amp; Orders
            </p>

            {/* Links List */}
            <ul
              id="footer-section-trade"
              className={cn(
                'space-y-1 md:space-y-2 text-xs text-[#DFE8F6] pt-1 md:pt-0',
                openSections.trade ? 'block' : 'hidden md:block'
              )}
            >
              <li>
                <Link href="/trade" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Trade Account Registration
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Customer Account &amp; Orders
                </Link>
              </li>
              <li>
                <Link href="/basket" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Shopping Basket
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Secure Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Compliance & Legal Standards */}
          <div className="space-y-3">
            {/* Mobile Accordion Header */}
            <button
              type="button"
              onClick={() => toggleSection('standards')}
              aria-expanded={Boolean(openSections.standards)}
              aria-controls="footer-section-standards"
              data-testid="footer-accordion-toggle-standards"
              className="w-full flex items-center justify-between py-3 md:hidden text-left border-b border-white/10 text-xs font-bold text-white uppercase tracking-wider font-heading min-h-[44px] active:text-tc-action-lime transition-colors"
            >
              <span>UK Standards &amp; Policy</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 text-tc-action-lime transition-transform duration-200',
                  openSections.standards && 'rotate-180'
                )}
              />
            </button>

            {/* Desktop Static Header */}
            <p className="hidden md:block text-xs font-bold text-white uppercase tracking-wider font-heading">
              UK Standards
            </p>

            {/* Links List */}
            <ul
              id="footer-section-standards"
              className={cn(
                'space-y-1 md:space-y-2 text-xs text-[#DFE8F6] pt-1 md:pt-0',
                openSections.standards ? 'block' : 'hidden md:block'
              )}
            >
              <li className="min-h-[36px] md:min-h-0 flex items-center">UKCA &amp; CE Certified Hardware</li>
              <li className="min-h-[36px] md:min-h-0 flex items-center">1000V VDE &amp; British Standards</li>
              <li className="min-h-[36px] md:min-h-0 flex items-center">EN 14183 150KG Duty Rated</li>
              <li className="min-h-[36px] md:min-h-0 flex items-center">256-Bit SSL Encrypted Checkout</li>
              <li className="pt-2 border-t border-white/10 flex flex-col gap-1 text-[11px]">
                <Link href="/cookies" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  UK Cookie Policy &amp; Disclosures
                </Link>
                <Link href="/privacy" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 flex items-center">
                  Privacy Policy &amp; Data Rights
                </Link>
                <button
                  type="button"
                  onClick={openPreferences}
                  className="text-left text-tc-action-lime hover:underline font-semibold focus-visible:outline-2 focus-visible:outline-tc-action-lime min-h-[44px] inline-flex items-center"
                >
                  Manage Cookie Preferences
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip: Legal disclaimers & Trade details */}
        <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#DFE8F6]">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
            <p>© 2026 ToolCart UK Ltd. All rights reserved.</p>
            <span className="hidden sm:inline text-white/30">•</span>
            <p>Direct trade distribution for UK tradespeople and DIYers.</p>
            <span className="hidden sm:inline text-white/30">•</span>
            <p className="text-white/70 italic">ToolCart UK is a provisional demonstration platform. Staging and prototype only.</p>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-3.5 gap-y-2 text-xs text-[#DFE8F6]">
            <span>Prices shown in Inc. &amp; Ex. VAT</span>
            <span className="text-white/30">•</span>
            <Link href="/trade" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 inline-flex items-center px-1">
              Trade Terms
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/cookies" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 inline-flex items-center px-1">
              Cookies
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/privacy" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 inline-flex items-center px-1">
              Privacy
            </Link>
            <span className="text-white/30">•</span>
            <button
              type="button"
              onClick={openPreferences}
              className="hover:text-tc-action-lime transition-colors underline-offset-2 font-medium min-h-[44px] inline-flex items-center px-1"
            >
              Cookie Settings
            </button>
            <span className="text-white/30">•</span>
            <Link href="/checkout" className="hover:text-tc-action-lime transition-colors min-h-[44px] md:min-h-0 inline-flex items-center px-1">
              Secure Checkout
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

