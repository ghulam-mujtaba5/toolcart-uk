'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
  BookOpen,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/tools', label: 'Hand Tools', icon: Wrench, image: '/images/3d/categories/tools.webp' },
  { href: '/fixings', label: 'Fixings & Security', icon: Shield, image: '/images/3d/categories/fixings.webp' },
  { href: '/decorating', label: 'Decorating', icon: Paintbrush, image: '/images/3d/categories/decorating.webp' },
  { href: '/measuring', label: 'Measuring', icon: Ruler, image: '/images/3d/categories/measuring.webp' },
  { href: '/ppe', label: 'Workwear & Safety', icon: HardHat, image: '/images/3d/categories/ppe.webp' },
  { href: '/site-equipment', label: 'Site Equipment', icon: Package, image: '/images/3d/categories/site-equipment.webp' },
  { href: '/projects', label: 'Project Kits', icon: Layers, image: '/images/3d/icons/icon-kits.webp' },
  { href: '/guides', label: 'Buying Guides', icon: BookOpen, image: '/images/3d/icons/icon-guides.webp' },
];

export function NavBar() {
  const pathname = usePathname();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll boundary state to show/hide indicators and scroll arrows
  const checkScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  // Auto-scroll active category into center view on mount or route change
  useEffect(() => {
    if (activeLinkRef.current && scrollContainerRef.current) {
      if (typeof activeLinkRef.current.scrollIntoView === 'function') {
        activeLinkRef.current.scrollIntoView({
          behavior: 'smooth',
          inline: 'center',
          block: 'nearest',
        });
      }
      const timer = setTimeout(checkScroll, 350);
      return () => clearTimeout(timer);
    }
  }, [pathname, checkScroll]);

  const handleScrollStep = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollAmount = direction === 'left' ? -220 : 220;
    if (typeof el.scrollBy === 'function') {
      el.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    } else {
      el.scrollLeft += scrollAmount;
    }
    setTimeout(checkScroll, 300);
  };

  return (
    <nav
      aria-label="Product categories"
      className="relative bg-tc-primary text-white border-b border-tc-primary-hover shadow-xs"
    >
      {/* Left scroll affordance & button */}
      {canScrollLeft && (
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 bottom-0 z-10 flex items-center pl-1 pr-4 bg-gradient-to-r from-tc-primary via-tc-primary/90 to-transparent pointer-events-none"
        >
          <button
            type="button"
            onClick={() => handleScrollStep('left')}
            data-testid="navbar-scroll-left-btn"
            aria-label="Scroll categories left"
            className="pointer-events-auto p-1.5 rounded-full bg-tc-primary-hover/90 text-white hover:text-tc-action-lime hover:bg-tc-primary-hover border border-white/20 shadow-md backdrop-blur-xs transition-transform active:scale-90"
          >
            <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* Main horizontally scrollable container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        data-testid="navbar-scroll-container"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 overflow-x-auto scrollbar-none touch-pan-x overscroll-x-contain scroll-smooth snap-x snap-mandatory"
      >
        <ul className="flex items-center lg:justify-between gap-1 sm:gap-2 py-2 text-xs sm:text-sm font-medium whitespace-nowrap min-w-max">
          {NAV_LINKS.map((link) => {
            const isActive = pathname ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
            const Icon = link.icon;
            return (
              <li key={link.href} className="snap-start">
                <Link
                  ref={isActive ? activeLinkRef : undefined}
                  href={link.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-lg transition-all text-white/90 hover:text-white hover:bg-tc-primary-hover active:scale-95 group',
                    isActive &&
                      'bg-tc-primary-hover text-white font-bold ring-1 ring-tc-action-lime/60 shadow-xs'
                  )}
                >
                  <Icon
                    className={cn(
                      'w-4.5 h-4.5 shrink-0 stroke-[2.25] transition-transform drop-shadow-xs group-hover:scale-110',
                      isActive ? 'text-tc-action-lime scale-105' : 'text-tc-action-lime/90'
                    )}
                    aria-hidden="true"
                  />
                  <span className="font-semibold tracking-tight">{link.label}</span>
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-1 left-3.5 right-3.5 h-[2.5px] bg-tc-action-lime rounded-full shadow-[0_0_8px_rgba(221,241,106,0.6)]"
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Right scroll affordance & button */}
      {canScrollRight && (
        <div
          aria-hidden="true"
          className="absolute right-0 top-0 bottom-0 z-10 flex items-center pr-1 pl-4 bg-gradient-to-l from-tc-primary via-tc-primary/90 to-transparent pointer-events-none"
        >
          <button
            type="button"
            onClick={() => handleScrollStep('right')}
            data-testid="navbar-scroll-right-btn"
            aria-label="Scroll categories right"
            className="pointer-events-auto p-1.5 rounded-full bg-tc-primary-hover/90 text-white hover:text-tc-action-lime hover:bg-tc-primary-hover border border-white/20 shadow-md backdrop-blur-xs transition-transform active:scale-90"
          >
            <ChevronRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      )}
    </nav>
  );
}
