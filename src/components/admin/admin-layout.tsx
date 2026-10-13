'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, User } from 'lucide-react';

export interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();

  // Generate readable breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbText = segments
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' > ');

  return (
    <div className="flex min-h-screen bg-tc-canvas font-body text-tc-ink antialiased">
      {/* Brand V3 Sidebar */}
      <AdminSidebar />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-tc-border px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          {/* Breadcrumb Path */}
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-tc-text-secondary">
              Portal
            </span>
            <span className="text-tc-text-secondary text-xs">/</span>
            <h1 className="text-sm font-bold text-tc-ink tracking-tight font-heading">
              {breadcrumbText || 'Dashboard'}
            </h1>
          </div>

          {/* Right Header Badges & User Status */}
          <div className="flex items-center gap-4">
            <Badge variant="lime" size="md" className="font-bold tracking-wide">
              STAGING_ONLY: ACTIVE
            </Badge>

            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-tc-surface-soft border border-[#C8D9F9] text-xs text-tc-primary font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Launch Gates Enforced</span>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-tc-border">
              <div className="w-8 h-8 rounded-full bg-tc-ink text-white flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4 text-white" />
              </div>
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-tc-ink leading-tight">
                  ops@toolcart.co.uk
                </span>
                <span className="text-[10px] text-tc-text-secondary">Commerce Ops Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Main Content Area */}
        <main className="flex-1 p-6 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
