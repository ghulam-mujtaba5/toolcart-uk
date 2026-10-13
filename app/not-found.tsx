import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { NotFoundVector } from '@/components/ui/vectors';
import { Search, Home, ArrowLeft, Wrench, Shield, Zap, Paintbrush, HardHat, Ruler } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-tc-canvas tc-bg-blueprint flex flex-col justify-between font-body text-tc-graphite">
      {/* Brand Header */}
      <header className="border-b border-tc-border bg-white px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-tc-primary text-white font-heading font-black text-lg shadow-sm">
              TC
            </span>
            <div className="flex flex-col">
              <span className="font-heading font-extrabold text-lg text-tc-ink tracking-tight group-hover:text-tc-primary transition-colors">
                ToolCart<span className="text-tc-primary">UK</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-tc-text-secondary -mt-1">
                Industrial & DIY Hardware
              </span>
            </div>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-tc-primary hover:text-tc-primary-hover transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </header>

      {/* Main 404 Content */}
      <main role="main" className="flex-1 flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl bg-white rounded-xl tc-card-machined p-8 sm:p-12 shadow-sm text-center">
          <NotFoundVector className="w-64 h-40 sm:w-80 sm:h-48 mx-auto mb-6" />

          <div className="inline-flex items-center gap-2 rounded-full bg-tc-surface-soft border border-tc-primary/20 px-3.5 py-1 text-xs font-semibold text-tc-primary mb-6">
            <span className="inline-block h-2 w-2 rounded-full bg-tc-primary animate-pulse" />
            HTTP 404 • Specification Not Found
          </div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-tc-ink tracking-tight mb-4">
            Product or Page Not Found
          </h1>

          <p className="text-base text-tc-text-secondary max-w-lg mx-auto mb-8 leading-relaxed">
            The tool, trade specification, or hardware catalog page you requested is unavailable or has been relocated.
            Check the search index or browse verified UK trade categories below.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-10">
            <Button asChild variant="accent" size="lg" className="w-full sm:w-auto font-bold">
              <Link href="/search">
                <Search className="mr-2 h-4 w-4" />
                Search UK Catalog
              </Link>
            </Button>
            <Button asChild variant="primary" size="lg" className="w-full sm:w-auto">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Return to Homepage
              </Link>
            </Button>
          </div>

          {/* Quick Category Directory */}
          <div className="border-t border-tc-border/80 pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-tc-text-secondary mb-4">
              Popular Hardware Categories
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left">
              <Link
                href="/categories/tools"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <Wrench className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Hand Tools</span>
              </Link>
              <Link
                href="/categories/fixings"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <Shield className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Fixings & Hardware</span>
              </Link>
              <Link
                href="/categories/electrical"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <Zap className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Electrical & Tapes</span>
              </Link>
              <Link
                href="/categories/decorating"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <Paintbrush className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Decorating</span>
              </Link>
              <Link
                href="/categories/measuring"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <Ruler className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Measuring</span>
              </Link>
              <Link
                href="/categories/ppe"
                className="flex items-center gap-2 p-2.5 rounded-lg border border-tc-border hover:border-tc-primary hover:bg-tc-surface-soft transition-all text-xs font-semibold text-tc-ink"
              >
                <HardHat className="h-4 w-4 text-tc-primary flex-shrink-0" />
                <span>Workwear & PPE</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Accessible Footer Notice */}
      <footer className="border-t border-tc-border bg-white px-4 py-4 text-center text-xs text-tc-text-secondary sm:px-8">
        <p>ToolCart UK • Industrial & Trade Hardware Platform • Standard UK VAT 20%</p>
      </footer>
    </div>
  );
}
