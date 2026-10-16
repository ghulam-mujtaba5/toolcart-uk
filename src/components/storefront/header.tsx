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
  User,
  ShieldCheck,
  ChevronRight,
  BookOpen,
  Layers,
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatbotRobot3DLazy } from '@/components/ui/3d';
import { Button } from '@/components/ui/button';
import { DragHandle } from '@/components/ui/drag-handle';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { PublicProductDTO } from '@/types/product';
import { IconToolbox, IconStockRadar, IconTradeVerified } from '@/components/ui/trade-icons';
import { MobileSearchOverlay } from '@/components/storefront/mobile-search-overlay';

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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const flyoutRef = useRef<HTMLDivElement>(null);

  const {
    sheetRef: mobileNavRef,
    style: mobileNavStyle,
    dragHandleProps: mobileNavDragProps,
  } = useSwipeToDismiss({
    onDismiss: () => setIsMobileMenuOpen(false),
    threshold: 80,
    direction: 'right',
  });

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

  // Escape key and scroll lock for mobile menu
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpenFlyout(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <header
      className={cn(
        'sticky top-0 bg-white/95 border-b border-tc-border pt-[env(safe-area-inset-top,0px)]',
        isMobileMenuOpen ? 'z-50' : 'z-40 backdrop-blur-md'
      )}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16 sm:h-20">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            aria-label="Open mobile navigation menu"
            className="md:hidden min-w-[44px] min-h-[44px] p-2 rounded-lg text-tc-ink hover:bg-tc-canvas transition-colors flex items-center justify-center shrink-0"
          >
            <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Brand Wordmark & Action Lime Cart Badge with 3D Master Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3 shrink-0 group">
            <div className="w-9 h-9 sm:w-11 sm:h-11 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 overflow-hidden p-0.5 sm:p-1 shrink-0">
              <img
                src="/images/brand/logo-toolcart.webp"
                alt="ToolCart 3D Logo"
                className="w-full h-full object-contain drop-shadow-xs"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl tracking-[-0.04em] text-tc-ink leading-none">
                TOOLCART
              </span>
              <span className="text-[8px] sm:text-[10px] uppercase tracking-widest text-tc-primary font-mono font-extrabold mt-0.5 sm:mt-1">
                UK Trade Direct
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
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-tc-text-secondary absolute left-3.5 top-3.5 pointer-events-none stroke-[2.25]"
              />

              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setIsOpenFlyout(false);
                  }}
                  aria-label="Clear search query"
                  className="absolute right-14 top-1 h-9 min-w-[44px] min-h-[44px] sm:min-w-[36px] sm:min-h-[36px] sm:top-1.5 sm:h-8 flex items-center justify-center text-tc-text-secondary hover:text-tc-ink rounded p-1 transition-colors active:scale-95"
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

          {/* Action Controls: Hardware Advice, Account, Mini-Basket */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Hardware Advice Trigger with 3D Robot */}
            {onOpenAiAssistant && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAiAssistant}
                className="hidden md:inline-flex items-center gap-2 border-[#C8D9F9] bg-white hover:bg-tc-surface-soft text-tc-ink hover:text-tc-primary hover:border-tc-primary transition-all shadow-xs group px-3 h-10"
                aria-label="Open Hardware Advice assistant"
              >
                <div className="w-6 h-6 shrink-0 relative flex items-center justify-center">
                  <ChatbotRobot3DLazy size={24} className="w-full h-full drop-shadow-xs" />
                </div>
                <span className="font-semibold text-xs text-tc-ink group-hover:text-tc-primary">
                  Hardware Advice
                </span>
              </Button>
            )}

            {/* Customer Account */}
            <Link
              href="/account"
              aria-label="Customer Account & Orders"
              className="min-w-[44px] min-h-[44px] p-1.5 sm:px-3 sm:py-2 rounded-lg text-tc-ink hover:bg-tc-canvas hover:text-tc-primary transition-colors flex items-center justify-center gap-2 group shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-tc-canvas border border-tc-border flex items-center justify-center text-tc-ink group-hover:text-tc-primary group-hover:border-tc-primary/40 group-hover:bg-tc-surface-soft transition-all shadow-2xs">
                <User className="w-4.5 h-4.5 stroke-[2.25] group-hover:scale-110 transition-transform" />
              </div>
              <span className="hidden sm:inline text-xs font-bold text-tc-ink group-hover:text-tc-primary transition-colors">
                Account
              </span>
            </Link>

            {/* Mini Basket Drawer Trigger */}
            <button
              type="button"
              onClick={openCart}
              aria-label={`Open Basket, ${summary.total_items_count} items`}
              className="relative min-w-[44px] min-h-[44px] p-1.5 sm:px-3.5 sm:py-2 rounded-lg bg-tc-ink text-white hover:bg-tc-graphite transition-all flex items-center justify-center gap-2.5 shadow-xs group active:scale-95 shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white group-hover:bg-white/20 transition-all">
                <ShoppingCart className="w-4.5 h-4.5 stroke-[2.25] text-white group-hover:scale-110 transition-transform" />
              </div>
              <span className="hidden sm:inline text-xs font-bold tracking-tight">Basket</span>

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
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (query.trim()) {
                handleSearchSubmit(e);
              } else {
                setIsMobileSearchOpen(true);
              }
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsMobileSearchOpen(true)}
              onClick={() => setIsMobileSearchOpen(true)}
              placeholder="Search 115 trade tools & hardware..."
              className="w-full h-11 min-h-[44px] pl-10 pr-24 bg-tc-canvas border border-tc-border-strong rounded-lg text-base sm:text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary cursor-pointer"
            />
            <Search className="w-4 h-4 text-tc-text-secondary absolute left-3.5 top-3.5 pointer-events-none stroke-[2.25]" />
            <button
              type="submit"
              onClick={() => {
                if (!query.trim()) {
                  setIsMobileSearchOpen(true);
                }
              }}
              aria-label="Search"
              className="absolute right-0 inset-y-0 h-full min-h-[44px] min-w-[60px] px-3.5 rounded-r-lg bg-tc-primary text-white text-xs font-semibold hover:bg-tc-primary-hover flex items-center justify-center active:scale-95 transition-all"
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
            aria-hidden="true"
          />

          <div
            ref={mobileNavRef}
            style={mobileNavStyle}
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto overscroll-y-contain pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            {/* Tactile Grab Handle */}
            <div className="pb-2 flex justify-center">
              <DragHandle label="Drag to dismiss navigation menu" {...mobileNavDragProps} />
            </div>

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
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-tc-text-secondary hover:text-tc-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              <p className="text-[11px] font-bold text-tc-text-secondary uppercase tracking-wider mb-2">
                Categories
              </p>
              {[
                { href: '/tools', label: 'Hand Tools', icon: Wrench },
                { href: '/fixings', label: 'Fixings & Security', icon: Shield },
                { href: '/decorating', label: 'Decorating', icon: Paintbrush },
                { href: '/measuring', label: 'Measuring', icon: Ruler },
                { href: '/ppe', label: 'Workwear & Safety', icon: HardHat },
                { href: '/site-equipment', label: 'Site Equipment', icon: Package },
              ].map((c) => {
                const Icon = c.icon;
                return (
                  <Link
                    key={c.href}
                    href={c.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-tc-ink hover:bg-tc-canvas group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary group-hover:bg-tc-primary group-hover:text-white transition-colors">
                        <Icon className="w-4.5 h-4.5 stroke-[2]" />
                      </div>
                      <span>{c.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-tc-border-strong group-hover:text-tc-primary transition-colors" />
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-tc-border space-y-2">
              <p className="text-[11px] font-bold text-tc-text-secondary uppercase tracking-wider mb-2">
                Advice & Solutions
              </p>
              <Link
                href="/projects"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <Layers className="w-4 h-4 text-tc-primary" />
                <span>Project Kits</span>
              </Link>
              <Link
                href="/guides"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <BookOpen className="w-4 h-4 text-tc-primary" />
                <span>UK Buying Guides</span>
              </Link>
              <Link
                href="/trade"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 min-h-[44px] py-2 px-3 rounded-lg text-sm text-tc-ink hover:bg-tc-canvas"
              >
                <ShieldCheck className="w-4 h-4 text-tc-primary" />
                <span>Trade Portal</span>
              </Link>
            </div>

            {onOpenAiAssistant && (
              <div className="mt-4 p-3.5 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-[#C8D9F9] p-0.5 shrink-0 flex items-center justify-center shadow-xs overflow-visible">
                  <ChatbotRobot3DLazy
                    size={48}
                    className="w-full h-full drop-shadow-md"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-tc-primary mb-0.5">Hardware Advice</p>
                  <p className="text-[11px] text-tc-graphite mb-2">
                    Need help choosing sizes, pack counts, or BS ratings?
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full text-xs min-h-[44px]"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenAiAssistant();
                    }}
                  >
                    Get Hardware Advice
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dedicated Mobile Search Overlay */}
      <MobileSearchOverlay
        isOpen={isMobileSearchOpen}
        onClose={() => setIsMobileSearchOpen(false)}
        initialQuery={query}
      />
    </header>
  );
}
