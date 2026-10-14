'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import {
  ShoppingCart,
  Search,
  X,
  Menu,
  Sparkles,
  User,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PublicProductDTO } from '@/types/product';
import { IconToolbox, IconStockRadar, IconTradeVerified } from '@/components/ui/trade-icons';

interface HeaderProps {
  onOpenAiAssistant?: () => void;
}

export function Header({ onOpenAiAssistant }: HeaderProps) {
  const router = useRouter();
  const { summary, openCart } = useCart();
  const { formatPriceDisplay } = useVAT();

  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PublicProductDTO[]>([]);
  const [isOpenFlyout, setIsOpenFlyout] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Debounced search autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsOpenFlyout(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/store/products?q=${encodeURIComponent(query.trim())}&limit=5`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products?.slice(0, 5) || []);
          setIsOpenFlyout(true);
        }
      } catch {
        // Fallback gracefully on network error
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside flyout to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (flyoutRef.current && !flyoutRef.current.contains(e.target as Node)) {
        setIsOpenFlyout(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpenFlyout(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-tc-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16 sm:h-20">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className="md:hidden p-2 rounded-lg text-tc-ink hover:bg-tc-canvas transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Brand Wordmark & Action Lime Cart Badge with IconToolbox Trade Emblem */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <IconToolbox size={24} className="text-tc-ink" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-2xl sm:text-3xl tracking-[-0.04em] text-tc-ink leading-none">
                TOOLCART
              </span>
              <span className="text-[9px] uppercase tracking-widest text-tc-text-secondary font-bold font-sans">
                UK Hardware Direct
              </span>
            </div>
          </Link>

          {/* Center Search Bar with Live Autocomplete Flyout */}
          <div ref={flyoutRef} className="hidden md:flex flex-1 max-w-xl mx-4 relative">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setIsOpenFlyout(true)}
                placeholder="Search tools, fixings, tapes, or enter SKU / GTIN-13..."
                aria-label="Search catalog"
                className="w-full h-11 pl-10 pr-20 bg-tc-canvas border border-tc-border-strong rounded-lg text-sm text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white transition-all shadow-inner"
              />
              <Search className="w-4 h-4 text-tc-text-secondary absolute left-3.5 top-3.5 pointer-events-none" />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setIsOpenFlyout(false);
                  }}
                  className="absolute right-12 top-3 text-tc-text-secondary hover:text-tc-ink p-0.5"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                className="absolute right-1.5 top-1.5 h-8 px-3 rounded-md bg-tc-primary text-white text-xs font-semibold hover:bg-tc-primary-hover transition-colors"
              >
                Search
              </button>
            </form>

            {/* Live Autocomplete Flyout */}
            {isOpenFlyout && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-tc-border rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-50 slide-in-from-top-2">
                <div className="p-2 border-b border-tc-border bg-tc-surface-soft text-[11px] font-bold text-tc-primary uppercase tracking-wider flex items-center justify-between">
                  <span>Catalog Matches</span>
                  <span>{suggestions.length} items found</span>
                </div>

                {suggestions.length > 0 ? (
                  <ul className="divide-y divide-tc-border/60">
                    {suggestions.map((item) => {
                      const price = formatPriceDisplay(
                        item.retail_price_inc_vat_gbp,
                        item.retail_price_ex_vat_gbp
                      );
                      return (
                        <li key={item.id}>
                          <Link
                            href={`/products/${item.slug}`}
                            onClick={() => setIsOpenFlyout(false)}
                            className="flex items-center justify-between p-3 hover:bg-tc-canvas transition-colors group"
                          >
                            <div className="flex-1 min-w-0 pr-4">
                              <p className="text-sm font-semibold text-tc-ink group-hover:text-tc-primary truncate">
                                {item.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-tc-text-secondary mt-0.5">
                                <span className="font-mono">{item.supplier_sku}</span>
                                <span>•</span>
                                <span>{item.category}</span>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-bold text-tc-ink tabular-nums">
                                {price.primaryText}
                              </p>
                              <p className="text-[10px] text-tc-text-secondary tabular-nums">
                                {price.secondaryText}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                    <li className="p-2 bg-tc-canvas text-center">
                      <button
                        type="button"
                        onClick={handleSearchSubmit}
                        className="text-xs font-semibold text-tc-primary hover:underline"
                      >
                        View all results for &quot;{query}&quot; →
                      </button>
                    </li>
                  </ul>
                ) : (
                  <div className="p-4 text-center text-xs text-tc-text-secondary">
                    No exact products found. Press Enter to search with UK synonym expansion.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Controls: AI Assistant, Account, Mini-Basket */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Finder trigger with duotone radar accent */}
            {onOpenAiAssistant && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAiAssistant}
                className="hidden lg:inline-flex items-center gap-1.5 border-tc-primary/40 text-tc-primary hover:bg-tc-surface-soft"
              >
                <IconStockRadar size={16} className="text-tc-primary" />
                <span>Ask ToolCart AI</span>
              </Button>
            )}

            {/* Customer Account */}
            <Link
              href="/account"
              aria-label="Customer Account & Orders"
              className="p-2 rounded-lg text-tc-ink hover:bg-tc-canvas transition-colors flex items-center gap-1"
            >
              <User className="w-5 h-5 text-tc-ink" />
              <span className="hidden xl:inline text-xs font-semibold">Account</span>
            </Link>

            {/* Mini Basket Drawer Trigger */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open Basket, ${summary.total_items_count} items`}
              className="relative p-2 sm:px-3 sm:py-2 rounded-lg bg-tc-ink text-white hover:bg-tc-graphite transition-all flex items-center gap-2 shadow-xs group active:scale-95"
            >
              <ShoppingCart className="w-5 h-5 text-white stroke-[2]" />
              <span className="hidden sm:inline text-xs font-bold">Basket</span>

              {summary.total_items_count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 sm:static sm:top-auto sm:right-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-tc-action-lime text-tc-ink text-xs font-extrabold border border-tc-ink tabular-nums shadow-xs animate-in zoom-in-75 duration-200">
                  {summary.total_items_count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Row */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 115 trade tools & hardware..."
              className="w-full h-10 pl-9 pr-16 bg-tc-canvas border border-tc-border-strong rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary"
            />
            <Search className="w-4 h-4 text-tc-text-secondary absolute left-3 top-3 pointer-events-none" />
            <button
              type="submit"
              className="absolute right-1 top-1 h-8 px-2.5 rounded bg-tc-primary text-white text-[11px] font-semibold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Slide-Over Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-tc-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-tc-action-lime border border-tc-ink flex items-center justify-center">
                  <IconToolbox size={16} className="text-tc-ink" />
                </div>
                <span className="font-heading font-extrabold text-lg text-tc-ink">TOOLCART</span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                aria-label="Close menu"
                className="p-1 rounded-md text-tc-text-secondary hover:text-tc-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              <p className="text-[11px] font-bold text-tc-text-secondary uppercase tracking-wider mb-2">
                Categories
              </p>
              {[
                { href: '/tools', label: 'Hand Tools' },
                { href: '/fixings', label: 'Fixings & Security' },
                { href: '/decorating', label: 'Decorating' },
                { href: '/measuring', label: 'Measuring' },
                { href: '/ppe', label: 'Workwear & Safety' },
                { href: '/site-equipment', label: 'Site Equipment' },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-tc-ink hover:bg-tc-canvas"
                >
                  <span>{c.label}</span>
                  <ChevronRight className="w-4 h-4 text-tc-border-strong" />
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-tc-border space-y-2">
              <p className="text-[11px] font-bold text-tc-text-secondary uppercase tracking-wider mb-2">
                Advice & Solutions
              </p>
              <Link
                href="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <Layers className="w-4 h-4 text-tc-primary" />
                <span>Project Kits</span>
              </Link>
              <Link
                href="/guides"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <BookOpen className="w-4 h-4 text-tc-primary" />
                <span>UK Buying Guides</span>
              </Link>
              <Link
                href="/trade"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <ShieldCheck className="w-4 h-4 text-tc-primary" />
                <span>Trade Portal</span>
              </Link>
            </div>

            {onOpenAiAssistant && (
              <div className="mt-6 p-4 rounded-xl bg-tc-surface-soft border border-[#C8D9F9]">
                <p className="text-xs font-bold text-tc-primary mb-1">ToolCart AI Assistant</p>
                <p className="text-[11px] text-tc-ink mb-3">
                  Ask about verified specifications, pack quantities, and project tooling.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAiAssistant();
                  }}
                >
                  Launch Assistant
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
