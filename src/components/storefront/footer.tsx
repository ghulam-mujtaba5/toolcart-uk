'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cookie,
  ChevronDown,
  ArrowUp,
  ShieldCheck,
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
          <div className="flex items-center gap-2 text-xs text-[#DFE8F6]">
            <span className="font-heading font-bold text-white">ToolCart UK</span>
            <span className="text-white/30 hidden sm:inline">•</span>
            <span className="text-[#DFE8F6]/80 hidden sm:inline">Trade hardware &amp; consumables direct to site</span>
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

        {/* Trade Value Pillars Strip with 3D Claymorphic Icons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pb-8 border-b border-white/10 text-xs">
          <Link
            href="/tools"
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-tc-action-lime/60 hover:bg-white/[0.08] transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <img
                src="/images/3d/icons/icon-specs.webp"
                alt="Clear Specifications"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-white text-sm group-hover:text-tc-action-lime transition-colors">
                Clear Specifications
              </p>
              <p className="text-[11px] text-[#DFE8F6]/85 mt-0.5 leading-snug">
                GTIN-13 barcodes &amp; BS EN ratings
              </p>
            </div>
          </Link>

          <Link
            href="/trade"
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-tc-action-lime/60 hover:bg-white/[0.08] transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <img
                src="/images/3d/icons/icon-trade-diy.webp"
                alt="Trade & DIY Direct"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-white text-sm group-hover:text-tc-action-lime transition-colors">
                Trade &amp; DIY Direct
              </p>
              <p className="text-[11px] text-[#DFE8F6]/85 mt-0.5 leading-snug">
                Ex. VAT toggle &amp; 30-day trade credit
              </p>
            </div>
          </Link>

          <Link
            href="/projects"
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-tc-action-lime/60 hover:bg-white/[0.08] transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <img
                src="/images/3d/icons/icon-project-guidance.webp"
                alt="Project Guidance"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-white text-sm group-hover:text-tc-action-lime transition-colors">
                Project Guidance
              </p>
              <p className="text-[11px] text-[#DFE8F6]/85 mt-0.5 leading-snug">
                Curated kits &amp; technical advice
              </p>
            </div>
          </Link>

          <Link
            href="/trade"
            className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-tc-action-lime/60 hover:bg-white/[0.08] transition-all flex items-center gap-3.5 group"
          >
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15 p-1 shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <img
                src="/images/3d/icons/icon-pack-options.webp"
                alt="Verified Pack Options"
                className="w-full h-full object-contain drop-shadow-sm"
              />
            </div>
            <div className="min-w-0">
              <p className="font-heading font-bold text-white text-sm group-hover:text-tc-action-lime transition-colors">
                Verified Pack Options
              </p>
              <p className="text-[11px] text-[#DFE8F6]/85 mt-0.5 leading-snug">
                Unit, pack &amp; master carton savings
              </p>
            </div>
          </Link>
        </div>

        {/* 5-Column Grid with Mobile Accordions (< md) & Static Desktop Columns (>= md) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-sm">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="inline-block group" aria-label="ToolCart Home">
              <div className="w-20 h-20 sm:w-24 sm:h-24 transition-transform group-hover:scale-105">
                <img
                  src="/images/brand/logo-toolcart.webp"
                  alt="ToolCart Logo"
                  className="w-full h-full object-contain drop-shadow-md"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-tc-action-lime transition-colors">
                  TOOLCART
                </span>
                <span className="bg-tc-action-lime text-tc-ink text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded">
                  UK
                </span>
              </div>
            </Link>
            <p className="text-xs text-[#DFE8F6] leading-relaxed">
              The right tools. The right advice. Direct UK distribution of trade-quality hardware, fixings, consumables, and site gear.
            </p>
            <div className="pt-1 text-xs text-[#DFE8F6] font-medium flex items-center gap-1.5">
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

