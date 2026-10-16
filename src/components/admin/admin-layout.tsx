'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { AdminErrorBoundary } from './error-boundary';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User, Menu, Search } from 'lucide-react';
import { CommandPalette } from './command-palette';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Global Ctrl+K / Cmd+K listener to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generate readable breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbText = segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' > ');
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-tc-canvas font-body text-tc-ink antialiased">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-tc-canvas font-body text-tc-ink antialiased">
      {/* Brand V3 Sidebar (Desktop docked + Mobile slide-over drawer) */}
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-tc-border px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs gap-3">
          {/* Left: Mobile Menu Button & Breadcrumb Path */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={mobileOpen}
              className="lg:hidden min-h-[44px] min-w-[44px] p-2 -ml-2 rounded-lg text-tc-ink hover:bg-tc-surface-soft flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-primary shrink-0"
            >
              <Menu className="w-5 h-5 text-tc-ink" />
            </button>

            <div className="flex items-center gap-1.5 sm:gap-2 truncate">
              <span className="text-xs uppercase font-bold tracking-wider text-tc-text-secondary shrink-0">
                Portal
              </span>
              <span className="text-tc-text-secondary text-xs">/</span>
              <h1 className="text-xs sm:text-sm font-bold text-tc-ink tracking-tight font-heading truncate">
                {breadcrumbText || 'Dashboard'}
              </h1>
            </div>
          </div>

          {/* Center: Universal Command Palette Trigger */}
          <div className="flex-1 max-w-md mx-auto hidden sm:flex justify-center">
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Search admin portal (Ctrl+K)"
              className="w-full flex items-center justify-between gap-2.5 px-3.5 py-1.5 rounded-xl bg-tc-surface-soft border border-tc-border text-xs text-tc-text-secondary hover:text-tc-ink hover:border-tc-primary/40 hover:bg-white transition-all shadow-2xs group min-h-[38px]"
            >
              <div className="flex items-center gap-2 truncate">
                <Search className="w-3.5 h-3.5 text-tc-text-secondary group-hover:text-tc-primary shrink-0" />
                <span className="truncate">Quick search products, orders, SKUs...</span>
              </div>
              <kbd className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white border border-tc-border text-tc-text-secondary shadow-2xs shrink-0">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Right Header Badges & User Status */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Mobile Search Button */}
            <button
              type="button"
              onClick={() => setCommandPaletteOpen(true)}
              aria-label="Open search palette"
              className="sm:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg text-tc-ink hover:bg-tc-surface-soft flex items-center justify-center transition-colors"
            >
              <Search className="w-4 h-4 text-tc-ink" />
            </button>

            <Badge variant="lime" size="sm" className="font-bold tracking-wide hidden sm:inline-flex">
              STAGING_ONLY: ACTIVE
            </Badge>

            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-tc-surface-soft border border-tc-primary/20 text-xs text-tc-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Launch Gates Enforced</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-tc-border">
              <div className="w-8 h-8 rounded-full bg-tc-ink text-white flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-tc-ink leading-tight">
                  ops@toolcart.co.uk
                </span>
                <span className="text-[10px] text-tc-text-secondary">Commerce Ops Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0">
          <AdminErrorBoundary
            title="Admin Viewport Exception"
            fallbackMessage="An unexpected error occurred while rendering this view. You can retry the component or navigate using the admin sidebar."
          >
            {children}
          </AdminErrorBoundary>
        </main>
      </div>

      {/* Universal Command Palette Modal */}
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} />
    </div>
  );
}
