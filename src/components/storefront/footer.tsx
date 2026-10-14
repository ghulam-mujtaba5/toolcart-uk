'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, ShieldCheck, CheckCircle2, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-tc-ink text-white border-t border-tc-graphite pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Value Proposition Strip with Site Icons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-12 mb-12 border-b border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-2 shrink-0 flex items-center justify-center">
              <img
                src="/brand/07_Site_Icons/clear-specifications.svg"
                alt="Clear specifications"
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-white">Clear Specifications</p>
              <p className="text-[11px] text-[#DFE8F6]/70 mt-0.5">EAN-13 GTIN, MPN &amp; certified ratings</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-2 shrink-0 flex items-center justify-center">
              <img
                src="/brand/07_Site_Icons/trade-diy.svg"
                alt="Trade & DIY"
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-white">Trade &amp; DIY Direct</p>
              <p className="text-[11px] text-[#DFE8F6]/70 mt-0.5">Tactile UK VAT rocker &amp; net terms</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-2 shrink-0 flex items-center justify-center">
              <img
                src="/brand/07_Site_Icons/project-guidance.svg"
                alt="Project guidance"
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-white">Project Guidance</p>
              <p className="text-[11px] text-[#DFE8F6]/70 mt-0.5">UK buying guides &amp; AI project finder</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/20 p-2 shrink-0 flex items-center justify-center">
              <img
                src="/brand/07_Site_Icons/product-options.svg"
                alt="Product options"
                className="w-full h-full object-contain filter invert"
              />
            </div>
            <div>
              <p className="font-heading font-bold text-xs text-white">Verified Pack Options</p>
              <p className="text-[11px] text-[#DFE8F6]/70 mt-0.5">Transparent unit vs carton quantities</p>
            </div>
          </div>
        </div>

        {/* 5-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-white/10 text-sm">
          {/* Column 1: Brand & Identity */}
          <div className="lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-tc-action-lime text-tc-ink border-2 border-tc-ink flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-tc-ink stroke-[2.5]" />
              </div>
              <span className="font-heading font-extrabold text-xl tracking-tight text-white">
                TOOLCART
              </span>
            </Link>
            <p className="text-xs text-[#DFE8F6]/80 leading-relaxed">
              The right tools. The right advice. Direct UK distribution of trade-quality hardware, fixings, consumables, and site gear.
            </p>
            <div className="pt-2 text-xs text-tc-action-lime font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Staging Prototype · Brand Provisional</span>
            </div>
          </div>

          {/* Column 2: Hardware Categories */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Hardware Catalog
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]/80">
              <li>
                <Link href="/tools" className="hover:text-tc-action-lime transition-colors">
                  Hand Tools & Bits
                </Link>
              </li>
              <li>
                <Link href="/fixings" className="hover:text-tc-action-lime transition-colors">
                  Fixings & Wall Plugs
                </Link>
              </li>
              <li>
                <Link href="/decorating" className="hover:text-tc-action-lime transition-colors">
                  Painting & Masking
                </Link>
              </li>
              <li>
                <Link href="/measuring" className="hover:text-tc-action-lime transition-colors">
                  Measuring & Spirit Levels
                </Link>
              </li>
              <li>
                <Link href="/ppe" className="hover:text-tc-action-lime transition-colors">
                  Workwear & Eye Protection
                </Link>
              </li>
              <li>
                <Link href="/site-equipment" className="hover:text-tc-action-lime transition-colors">
                  Site Tarpaulins & Ladders
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Advice & Curated Kits */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Project Solutions
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]/80">
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
                  Screwdriver & VDE Standards
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

          {/* Column 4: Trade & Customer Service */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              Trade & Orders
            </p>
            <ul className="space-y-2 text-xs text-[#DFE8F6]/80">
              <li>
                <Link href="/trade" className="hover:text-tc-action-lime transition-colors">
                  Trade Account Registration
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-tc-action-lime transition-colors">
                  Customer Account & Orders
                </Link>
              </li>
              <li>
                <Link href="/basket" className="hover:text-tc-action-lime transition-colors">
                  Multi-Supplier Basket
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
            <ul className="space-y-2 text-xs text-[#DFE8F6]/80">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-tc-action-lime" />
                <span>UKCA & CE Verified Stock</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-tc-action-lime" />
                <span>BS EN 60454 Dielectric Tapes</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-tc-action-lime" />
                <span>BS EN 14183 150KG Ladders</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-tc-action-lime" />
                <span>Stripe Test Mode Isolation</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#DFE8F6]/60">
          <p>© 2026 ToolCart UK Ltd (Provisional Prototype). All rights reserved.</p>
          <p>
            Standard UK VAT charged at 20% on all retail sales. Quotation baseline: Status International (UK) Ltd.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-tc-action-lime font-bold">Brand V3 Final</span>
            <span>WCAG 2.2 AA Accessible</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
