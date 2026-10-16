'use client';

import React from 'react';
import Link from 'next/link';
import { Cookie } from 'lucide-react';
import { useCookieConsent } from '@/context/cookie-consent-context';

export function Footer() {
  const { openPreferences } = useCookieConsent();

  return (
    <footer className="bg-tc-ink text-white border-t border-tc-graphite pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-sm">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-tc-action-lime text-tc-ink border border-tc-ink p-1 shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <img
                  src="/images/brand/logo-toolcart.webp"
                  alt="ToolCart 3D Logo"
                  className="w-full h-full object-contain drop-shadow-xs"
                />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white group-hover:text-tc-action-lime transition-colors">
                TOOLCART
              </span>
            </Link>
            <p className="text-xs text-[#DFE8F6] leading-relaxed">
              The right tools. The right advice. Direct UK distribution of trade-quality hardware, fixings, consumables, and site gear.
            </p>
            <p className="pt-2 text-xs text-[#DFE8F6] font-medium">
              Direct UK Hardware Distribution
            </p>
          </div>

          {/* Column 2: Hardware Categories */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Hardware Catalog
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]">
              <li>
                <Link href="/tools" className="hover:text-tc-action-lime transition-colors">
                  Hand Tools &amp; Bits
                </Link>
              </li>
              <li>
                <Link href="/fixings" className="hover:text-tc-action-lime transition-colors">
                  Fixings &amp; Wall Plugs
                </Link>
              </li>
              <li>
                <Link href="/decorating" className="hover:text-tc-action-lime transition-colors">
                  Painting &amp; Masking
                </Link>
              </li>
              <li>
                <Link href="/measuring" className="hover:text-tc-action-lime transition-colors">
                  Measuring &amp; Spirit Levels
                </Link>
              </li>
              <li>
                <Link href="/ppe" className="hover:text-tc-action-lime transition-colors">
                  Workwear &amp; Eye Protection
                </Link>
              </li>
              <li>
                <Link href="/site-equipment" className="hover:text-tc-action-lime transition-colors">
                  Site Tarpaulins &amp; Ladders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Advice & Curated Kits */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Project Solutions
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]">
              <li>
                <Link href="/projects" className="hover:text-tc-action-lime transition-colors">
                  Curated Project Kits
                </Link>
              </li>
              <li>
                <Link href="/guides" className="hover:text-tc-action-lime transition-colors">
                  All UK Buying Guides
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/complete-uk-guide-to-screwdrivers"
                  className="hover:text-tc-action-lime transition-colors"
                >
                  Screwdriver &amp; VDE Standards
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/selecting-wall-plugs-masonry-fixings"
                  className="hover:text-tc-action-lime transition-colors"
                >
                  Masonry Wall Plug Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/guides/site-access-step-ladder-safety"
                  className="hover:text-tc-action-lime transition-colors"
                >
                  EN 14183 Step Ladder Safety
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Trade & Orders */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Trade &amp; Orders
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]">
              <li>
                <Link href="/trade" className="hover:text-tc-action-lime transition-colors">
                  Trade Account Registration
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-tc-action-lime transition-colors">
                  Customer Account &amp; Orders
                </Link>
              </li>
              <li>
                <Link href="/basket" className="hover:text-tc-action-lime transition-colors">
                  Shopping Basket
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-tc-action-lime transition-colors">
                  Secure Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Compliance & Legal Standards */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              UK Standards
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]">
              <li>UKCA &amp; CE Certified Hardware</li>
              <li>1000V VDE &amp; British Standards</li>
              <li>EN 14183 150KG Duty Rated</li>
              <li>256-Bit SSL Encrypted Checkout</li>
              <li className="pt-2 border-t border-white/10 flex flex-col gap-1.5 text-[11px]">
                <Link href="/cookies" className="hover:text-tc-action-lime transition-colors">
                  UK Cookie Policy &amp; Disclosures
                </Link>
                <Link href="/privacy" className="hover:text-tc-action-lime transition-colors">
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

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#DFE8F6]">
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
            <Link href="/trade" className="hover:text-tc-action-lime transition-colors">
              Trade Terms
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/cookies" className="hover:text-tc-action-lime transition-colors">
              Cookies
            </Link>
            <span className="text-white/30">•</span>
            <Link href="/privacy" className="hover:text-tc-action-lime transition-colors">
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
            <Link href="/checkout" className="hover:text-tc-action-lime transition-colors">
              Secure Checkout
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
