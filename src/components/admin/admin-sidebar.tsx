'use client';

import React, { useEffect } from 'react';
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
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdminSidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Commerce Operations',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/admin/products', label: 'Products', icon: Package },
      { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
      { href: '/admin/customers', label: 'Trade Accounts', icon: Users },
    ],
  },
  {
    title: 'Suppliers & Logistics',
    items: [
      { href: '/admin/suppliers', label: 'Suppliers', icon: Truck },
      { href: '/admin/import', label: 'Catalog Import', icon: UploadCloud },
      { href: '/admin/pricing', label: 'Pricing & Margins', icon: Percent },
    ],
  },
  {
    title: 'Governance',
    items: [
      { href: '/admin/settings', label: 'Governance & Gates', icon: Settings },
    ],
  },
];

export function AdminSidebar({ mobileOpen = false, onClose, className }: AdminSidebarProps) {
  const pathname = usePathname();

  // Close mobile drawer on Escape key press
  useEffect(() => {
    if (!mobileOpen || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen, onClose]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const renderNavContent = (isMobile: boolean = false) => (
    <div className="flex-1 flex flex-col justify-between overflow-y-auto">
      <nav className="py-4 px-3 space-y-5" aria-label="Admin Navigation">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[10px] font-extrabold uppercase tracking-wider text-tc-action-lime/90 font-heading">
              {group.title}
            </h2>
            <div className="space-y-1 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin'
                    ? pathname === '/admin'
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      if (isMobile && onClose) {
                        onClose();
                      }
                    }}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-all min-h-[44px]',
                      isActive
                        ? 'bg-tc-primary text-white border-l-4 border-tc-action-lime shadow-inner'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-tc-action-lime' : 'text-white/70'
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-white/10 space-y-3 bg-black/20">
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-xs text-white/90 font-medium transition-colors min-h-[36px]"
        >
          <span>View Storefront</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/70" />
        </Link>
        <div className="text-[11px] text-white/60 leading-tight px-1">
          <p className="font-semibold text-white/90">ToolCart Engine v2.0</p>
          <p className="text-[10px]">Staging Environment: Active</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Docked Sidebar (Hidden on mobile < lg) */}
      <aside
        className={cn(
          'hidden lg:flex lg:w-64 lg:shrink-0 bg-tc-ink text-white flex-col min-h-screen border-r border-white/10',
          className
        )}
      >
        {/* Brand Logo Header */}
        <div className="h-16 flex items-center px-6 border-b border-white/10 gap-3 shrink-0">
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

        {renderNavContent(false)}
      </aside>

      {/* Mobile Slide-Over Drawer (< lg) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex" role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Surface */}
          <div className="relative w-72 max-w-[85vw] bg-tc-ink text-white flex flex-col shadow-2xl z-10 min-h-screen animate-in slide-in-from-left duration-200">
            {/* Drawer Header with Close Button */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-md bg-tc-action-lime border-2 border-tc-ink flex items-center justify-center shrink-0">
                  <Wrench className="w-4 h-4 text-tc-ink" />
                </div>
                <div className="flex flex-col">
                  <span className="font-heading font-extrabold text-sm tracking-tight text-white leading-none">
                    TOOLCART
                  </span>
                  <span className="text-[9px] font-bold text-tc-action-lime tracking-widest uppercase">
                    Admin Console
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close navigation menu"
                className="min-h-[44px] min-w-[44px] p-2 -mr-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-action-lime"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
