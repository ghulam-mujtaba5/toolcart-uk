'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Wrench, Shield, Paintbrush, Ruler, HardHat, Package, BookOpen, Layers } from 'lucide-react';

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

  return (
    <nav
      aria-label="Product categories"
      className="bg-tc-primary text-white border-b border-tc-primary-hover shadow-xs overflow-x-auto scrollbar-none"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center lg:justify-between gap-1 sm:gap-2 py-2 text-xs sm:text-sm font-medium whitespace-nowrap">
          {NAV_LINKS.map((link) => {
            const isActive = pathname ? (pathname === link.href || pathname.startsWith(`${link.href}/`)) : false;
            const Icon = link.icon;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md transition-all text-white hover:text-white hover:bg-tc-primary-hover group',
                    isActive && 'bg-tc-primary-hover text-white font-bold ring-1 ring-white/30'
                  )}
                >
                  <Icon
                    className="w-5 h-5 shrink-0 text-tc-action-lime stroke-[2.25] group-hover:scale-110 transition-transform drop-shadow-xs"
                    aria-hidden="true"
                  />
                  <span className="font-semibold tracking-tight">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
