'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useVAT } from '@/context/vat-context';
import { PublicProductDTO } from '@/types/product';
import {
  Search,
  X,
  ArrowLeft,
  Clock,
  ChevronRight,
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
} from 'lucide-react';
import { IconToolbox } from '@/components/ui/trade-icons';
import { cn } from '@/lib/utils';

export interface MobileSearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

const CATEGORY_CHIPS = [
  { label: 'Hand Tools', href: '/tools', icon: Wrench },
  { label: 'Fixings & Screws', href: '/fixings', icon: Shield },
  { label: 'Painting & Decorating', href: '/decorating', icon: Paintbrush },
  { label: 'Measuring & Levels', href: '/measuring', icon: Ruler },
  { label: 'Workwear & PPE', href: '/ppe', icon: HardHat },
  { label: 'Site Equipment', href: '/site-equipment', icon: Package },
];

const DEFAULT_CUES = [
  '18V Brushless',
  'Masking Tape',
  'Drywall Screws',
  'Spirit Level',
  'Safety Goggles',
];

export function MobileSearchOverlay({
  isOpen,
  onClose,
  initialQuery = '',
}: MobileSearchOverlayProps) {
  const router = useRouter();
  const { formatPriceDisplay } = useVAT();

  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<PublicProductDTO[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('toolcart_recent_searches');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.slice(0, 5));
          return;
        }
      }
      setRecentSearches(DEFAULT_CUES);
    } catch {
      setRecentSearches(DEFAULT_CUES);
    }
  }, [isOpen]);

  // Autofocus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, initialQuery]);

  // Escape key and scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Debounced search autocomplete
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/store/products?q=${encodeURIComponent(query.trim())}&limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.products?.slice(0, 6) || []);
        }
      } catch {
        // Fallback gracefully on network error
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const saveSearchTerm = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed || typeof window === 'undefined') return;
    try {
      const existing = recentSearches.filter(
        (s) => s.toLowerCase() !== trimmed.toLowerCase()
      );
      const updated = [trimmed, ...existing].slice(0, 5);
      localStorage.setItem('toolcart_recent_searches', JSON.stringify(updated));
      setRecentSearches(updated);
    } catch {
      // Safe fallback
    }
  };

  const handleSearchSubmit = (searchTerm: string) => {
    const term = searchTerm.trim();
    if (!term) return;
    saveSearchTerm(term);
    onClose();
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  const handleClearHistory = () => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('toolcart_recent_searches');
      } catch {
        // Safe fallback
      }
    }
    setRecentSearches([]);
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      data-testid="mobile-search-overlay"
      className="fixed inset-0 z-50 md:hidden flex flex-col bg-white animate-in fade-in duration-200"
    >
      {/* Top Search Action Bar */}
      <div className="pt-[env(safe-area-inset-top,0px)] border-b border-tc-border px-3 py-2.5 bg-white flex items-center gap-2 shadow-xs shrink-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close search overlay"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tc-ink rounded-lg hover:bg-tc-canvas active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-5 h-5 stroke-[2.25]" />
        </button>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit(query);
          }}
          className="flex-1 relative flex items-center"
        >
          <Search className="w-4 h-4 text-tc-text-secondary absolute left-3.5 pointer-events-none stroke-[2.25]" />

          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 115 trade tools & hardware..."
            aria-label="Search catalog input"
            data-testid="mobile-search-overlay-input"
            className="w-full h-11 min-h-[44px] pl-10 pr-24 bg-tc-canvas border border-tc-border-strong rounded-lg text-sm text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white transition-all shadow-inner"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              data-testid="mobile-search-clear-btn"
              className="absolute right-14 min-w-[36px] min-h-[44px] flex items-center justify-center text-tc-text-secondary hover:text-tc-ink rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            aria-label="Execute search"
            className="absolute right-1.5 h-8 min-w-[50px] px-2.5 rounded-md bg-tc-primary text-white text-xs font-bold hover:bg-tc-primary-hover active:scale-95 transition-all flex items-center justify-center"
          >
            Search
          </button>
        </form>
      </div>

      {/* Scrollable Overlay Body */}
      <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 space-y-6 pb-[calc(2.5rem+env(safe-area-inset-bottom,0px))]">
        {/* Live Search Autocomplete Results */}
        {suggestions.length > 0 && (
          <div className="space-y-2" data-testid="mobile-search-live-results">
            <div className="flex items-center justify-between text-xs font-bold text-tc-primary uppercase tracking-wider">
              <span>Matching Products</span>
              <span className="font-mono text-[11px]">{suggestions.length} items</span>
            </div>

            <div className="divide-y divide-tc-border rounded-xl border border-tc-border bg-white overflow-hidden shadow-xs">
              {suggestions.map((product) => {
                const price = formatPriceDisplay(
                  product.retail_price_inc_vat_gbp,
                  product.retail_price_ex_vat_gbp
                );
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => {
                      saveSearchTerm(query || product.title);
                      onClose();
                      router.push(`/products/${product.slug}`);
                    }}
                    className="w-full min-h-[48px] p-3 text-left flex items-center gap-3 hover:bg-tc-canvas active:bg-tc-surface-soft transition-colors"
                  >
                    <div className="w-9 h-9 rounded-lg bg-tc-canvas border border-tc-border flex items-center justify-center shrink-0 text-tc-text-secondary">
                      <IconToolbox size={20} className="text-tc-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-tc-ink truncate">
                        {product.title}
                      </div>
                      <div className="text-[10px] text-tc-text-secondary truncate mt-0.5">
                        {product.category || 'Trade Tool'} • SKU {product.supplier_sku}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-xs font-bold text-tc-ink tabular-nums">
                        {price.primaryText}
                      </div>
                      <div className="text-[9px] text-tc-text-secondary tabular-nums">
                        {price.secondaryText}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state when query typed but no matches found */}
        {query.trim().length >= 2 && suggestions.length === 0 && !isLoading && (
          <div className="p-4 rounded-xl bg-tc-canvas border border-tc-border text-center space-y-1">
            <div className="text-xs font-bold text-tc-ink">No exact matches found</div>
            <p className="text-[11px] text-tc-text-secondary">
              Try searching a broader term, product SKU, or select a trade category below.
            </p>
          </div>
        )}

        {/* Recent Search History Cues */}
        {recentSearches.length > 0 && (
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-tc-text-secondary flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-tc-primary" />
                Recent Searches
              </span>
              <button
                type="button"
                onClick={handleClearHistory}
                aria-label="Clear recent searches history"
                className="text-xs text-tc-primary font-semibold hover:underline min-h-[36px] flex items-center px-1"
              >
                Clear History
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {recentSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setQuery(term);
                    handleSearchSubmit(term);
                  }}
                  data-testid="recent-search-chip"
                  className="min-h-[44px] px-3.5 py-2 rounded-full bg-tc-canvas border border-tc-border-strong text-xs font-semibold text-tc-ink hover:bg-tc-surface-soft hover:border-tc-primary active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Clock className="w-3 h-3 text-tc-text-secondary" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Category Tags */}
        <div className="space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-tc-text-secondary flex items-center gap-1.5">
            <IconToolbox size={16} className="text-tc-primary" />
            Quick Categories
          </span>

          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_CHIPS.map((cat) => {
              const Icon = cat.icon;
              return (
                <button
                  key={cat.href}
                  type="button"
                  onClick={() => {
                    onClose();
                    router.push(cat.href);
                  }}
                  data-testid="quick-category-tag"
                  className="min-h-[48px] p-2.5 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] hover:border-tc-primary hover:bg-white text-tc-ink text-xs font-bold flex items-center justify-between gap-2 active:scale-95 transition-all shadow-2xs group text-left"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-white border border-[#C8D9F9] flex items-center justify-center shrink-0 text-tc-primary group-hover:bg-tc-primary group-hover:text-white transition-colors">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="truncate">{cat.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-tc-text-secondary shrink-0 group-hover:text-tc-primary group-hover:translate-x-0.5 transition-all" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
