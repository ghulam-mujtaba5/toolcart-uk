'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavBar } from '@/components/storefront/nav-bar';
import {
  X,
  Menu,
  Wrench,
  Shield,
  Paintbrush,
  Ruler,
  HardHat,
  Package,
  Layers,
  BookOpen,
} from 'lucide-react';
import { IconToolbox } from '@/components/ui/trade-icons';

export interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  React.useEffect(() => {
    if (!mobileOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <div className={cn('relative', mobileOpen ? 'z-50' : '', className)}>
      <div className="flex items-center justify-between md:hidden p-3 bg-tc-primary text-white">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-tc-action-lime text-tc-ink flex items-center justify-center">
            <IconToolbox size={16} className="text-tc-ink" />
          </div>
          <span className="font-heading font-bold text-sm">ToolCart Navigation</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open mobile navigation menu"
          className="min-w-[44px] min-h-[44px] flex items-center justify-center p-2 rounded text-white hover:bg-tc-primary-hover"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <NavBar />

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation menu"
            className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto pb-[calc(1.5rem+env(safe-area-inset-bottom))]"
          >
            <div className="flex items-center justify-between pb-4 border-b border-tc-border">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center">
                  <IconToolbox size={16} className="text-tc-ink" />
                </div>
                <span className="font-heading font-extrabold text-lg text-tc-ink">TOOLCART</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-tc-text-secondary hover:text-tc-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-1">
              {[
                { href: '/tools', label: 'Hand Tools', icon: Wrench },
                { href: '/fixings', label: 'Fixings & Security', icon: Shield },
                { href: '/decorating', label: 'Decorating', icon: Paintbrush },
                { href: '/measuring', label: 'Measuring', icon: Ruler },
                { href: '/ppe', label: 'Workwear & Safety', icon: HardHat },
                { href: '/site-equipment', label: 'Site Equipment', icon: Package },
                { href: '/projects', label: 'Project Kits', icon: Layers },
                { href: '/guides', label: 'Buying Guides', icon: BookOpen },
              ].map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between min-h-[44px] py-2.5 px-3 rounded-lg text-sm font-semibold text-tc-ink hover:bg-tc-canvas group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-tc-surface-soft border border-[#C8D9F9] flex items-center justify-center text-tc-primary group-hover:bg-tc-primary group-hover:text-white transition-colors">
                        <Icon className="w-4.5 h-4.5 stroke-[2]" />
                      </div>
                      <span>{link.label}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigation;
