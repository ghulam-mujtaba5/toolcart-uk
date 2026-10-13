'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wrench, Shield, Paintbrush, Ruler, HardHat, Package, BookOpen, Layers } from 'lucide-react';

const NAV_LINKS = [
  { href: '/tools', label: 'Hand Tools', icon: Wrench },
  { href: '/fixings', label: 'Fixings & Security', icon: Shield },
  { href: '/decorating', label: 'Decorating', icon: Paintbrush },
  { href: '/measuring', label: 'Measuring', icon: Ruler },
  { href: '/ppe', label: 'Workwear & Safety', icon: HardHat },
  { href: '/site-equipment', label: 'Site Equipment', icon: Package },
  { href: '/projects', label: 'Project Kits', icon: Layers },
  { href: '/guides', label: 'Buying Guides', icon: BookOpen },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Product categories"
      className="bg-tc-primary text-white border-b border-tc-primary-hover shadow-xs overflow-x-auto scrollbar-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-1 sm:gap-2 py-1.5 text-xs sm:text-sm font-medium whitespace-nowrap">
          {NAV_LINKS.map((link) => {
            const isActive = pathname ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors text-white/90 hover:text-white hover:bg-tc-primary-hover',
                    isActive && 'bg-tc-primary-hover text-white font-bold ring-1 ring-white/30'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" />
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
