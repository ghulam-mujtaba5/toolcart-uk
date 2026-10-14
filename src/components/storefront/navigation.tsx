'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { NavBar } from '@/components/storefront/nav-bar';
import { X, Menu } from 'lucide-react';
import { IconToolbox } from '@/components/ui/trade-icons';

export interface NavigationProps {
  className?: string;
}

export function Navigation({ className }: NavigationProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className={cn('relative', className)}>
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
          className="p-1 rounded text-white hover:bg-tc-primary-hover"
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
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl flex flex-col p-5 overflow-y-auto">
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
                className="p-1 rounded-md text-tc-text-secondary hover:text-tc-ink"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="py-4 space-y-1">
              {[
                { href: '/tools', label: 'Hand Tools' },
                { href: '/fixings', label: 'Fixings & Security' },
                { href: '/decorating', label: 'Decorating' },
                { href: '/measuring', label: 'Measuring' },
                { href: '/ppe', label: 'Workwear & Safety' },
                { href: '/site-equipment', label: 'Site Equipment' },
                { href: '/projects', label: 'Project Kits' },
                { href: '/guides', label: 'Buying Guides' },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg text-sm font-semibold text-tc-ink hover:bg-tc-canvas"
                >
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Navigation;
