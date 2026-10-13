'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Truck,
  UploadCloud,
  Percent,
  Users,
  Settings,
  Wrench,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
  { href: '/admin/import', label: 'Catalog Import', icon: UploadCloud },
  { href: '/admin/pricing', label: 'Pricing & Margins', icon: Percent },
  { href: '/admin/customers', label: 'Trade Accounts', icon: Users },
  { href: '/admin/settings', label: 'Governance & Gates', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 bg-tc-ink text-white flex flex-col min-h-screen border-r border-[#252D30]">
      {/* Brand Logo Header */}
      <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3">
        <div className="w-7 h-7 rounded-md bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center shrink-0">
          <Wrench className="w-4 h-4 text-tc-ink" />
        </div>
        <div className="flex flex-col">
          <span className="font-heading font-extrabold text-base tracking-tight text-white leading-none">
            TOOLCART
          </span>
          <span className="text-[10px] font-bold text-tc-action-lime tracking-widest uppercase">
            Admin Console
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all',
                isActive
                  ? 'bg-tc-primary text-white border-l-4 border-tc-action-lime shadow-inner'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-tc-action-lime' : 'text-white/70')} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-[#131C2C]">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-xs text-white/90 font-medium transition-colors"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/70" />
        </Link>
        <div className="text-[11px] text-[#A5B3B8] leading-tight px-1">
          <p className="font-semibold text-white/90">ToolCart Engine v2.0</p>
          <p className="text-[10px]">Staging Environment: Active</p>
        </div>
      </div>
    </aside>
  );
}
