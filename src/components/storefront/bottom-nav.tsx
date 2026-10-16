'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useCompare } from '@/context/compare-context';
import { Home, Search, Bot, Scale, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  onOpenAiAssistant?: () => void;
}

export function BottomNav({ onOpenAiAssistant }: BottomNavProps) {
  const pathname = usePathname();
  const { summary, openCart } = useCart();
  const { products: compareProducts, openCompare } = useCompare();

  const isHome = pathname === '/';
  const isSearch = pathname === '/search' || pathname?.startsWith('/tools') || pathname?.startsWith('/categories');
  const isKits = pathname?.startsWith('/projects');

  return (
    <nav
      aria-label="Mobile Navigation Dock"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-tc-border shadow-[0_-4px_12px_rgba(24,35,54,0.06)] pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="grid grid-cols-5 items-center justify-around max-w-lg mx-auto px-2">
        {/* 1. Home */}
        <Link
          href="/"
          aria-label="Home"
          className={cn(
            'flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg transition-colors select-none group',
            isHome ? 'text-tc-primary font-bold' : 'text-tc-text-secondary hover:text-tc-ink'
          )}
        >
          <div className="relative flex items-center justify-center w-6 h-6">
            <Home className={cn('w-5 h-5 transition-transform group-active:scale-90', isHome && 'stroke-[2.5]')} />
            {isHome && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-tc-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Home</span>
        </Link>

        {/* 2. Catalog / Search */}
        <Link
          href="/search"
          aria-label="Search and Browse Catalog"
          className={cn(
            'flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg transition-colors select-none group',
            isSearch ? 'text-tc-primary font-bold' : 'text-tc-text-secondary hover:text-tc-ink'
          )}
        >
          <div className="relative flex items-center justify-center w-6 h-6">
            <Search className={cn('w-5 h-5 transition-transform group-active:scale-90', isSearch && 'stroke-[2.5]')} />
            {isSearch && (
              <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-tc-primary" />
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Catalog</span>
        </Link>

        {/* 3. Hardware Advice (AI Assistant) */}
        <button
          type="button"
          onClick={onOpenAiAssistant}
          aria-label="Open Hardware Advice Assistant"
          className="flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg text-tc-text-secondary hover:text-tc-primary transition-colors select-none group active:scale-95"
        >
          <div className="relative flex items-center justify-center w-6 h-6">
            <div className="w-5 h-5 rounded-full bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary">
              <Bot className="w-3.5 h-3.5 stroke-[2.25]" />
            </div>
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Advice</span>
        </button>

        {/* 4. Compare Drawer */}
        <button
          type="button"
          onClick={openCompare}
          aria-label={`Open Product Compare, ${compareProducts.length} items`}
          className={cn(
            'flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg transition-colors select-none group relative active:scale-95',
            compareProducts.length > 0 ? 'text-tc-primary' : 'text-tc-text-secondary hover:text-tc-ink'
          )}
        >
          <div className="relative flex items-center justify-center w-6 h-6">
            <Scale className="w-5 h-5 transition-transform group-active:scale-90" />
            {compareProducts.length > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-tc-primary text-white text-[9px] font-bold tabular-nums">
                {compareProducts.length}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Compare</span>
        </button>

        {/* 5. Shopping Basket */}
        <button
          type="button"
          onClick={openCart}
          aria-label={`Open Basket, ${summary.total_items_count} items`}
          className={cn(
            'flex flex-col items-center justify-center min-h-[48px] py-1 px-1 rounded-lg transition-colors select-none group relative active:scale-95',
            summary.total_items_count > 0 ? 'text-tc-ink font-bold' : 'text-tc-text-secondary hover:text-tc-ink'
          )}
        >
          <div className="relative flex items-center justify-center w-6 h-6">
            <ShoppingCart className="w-5 h-5 transition-transform group-active:scale-90 text-tc-ink" />
            {summary.total_items_count > 0 && (
              <span className="absolute -top-1 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-tc-action-lime text-tc-ink text-[9px] font-extrabold border border-tc-ink tabular-nums">
                {summary.total_items_count}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Basket</span>
        </button>
      </div>
    </nav>
  );
}
