'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Package,
  ShoppingBag,
  Truck,
  UploadCloud,
  Percent,
  Users,
  Settings,
  LayoutDashboard,
  ExternalLink,
  ArrowRight,
  X,
  Plus,
  AlertTriangle,
  Command,
} from 'lucide-react';
import { PublicProductDTO } from '@/types/product';
import { OrderRecord } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

interface PaletteAction {
  id: string;
  title: string;
  category: 'Actions' | 'Navigation';
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

const STATIC_ACTIONS: PaletteAction[] = [
  { id: 'act-new-product', title: 'Add New Product Record', category: 'Actions', href: '/admin/products/new', icon: Plus },
  { id: 'act-import-catalog', title: 'Batch Catalog Ingestion (CSV / JSON)', category: 'Actions', href: '/admin/import', icon: UploadCloud },
  { id: 'act-pricing-sim', title: 'Open Pricing & Margin Simulator', category: 'Actions', href: '/admin/pricing', icon: Percent },
  { id: 'act-low-stock', title: 'View Low-Stock Alerts & Restock Queue', category: 'Actions', href: '/admin/products?stock=low', icon: AlertTriangle },
  { id: 'nav-dashboard', title: 'Operations Dashboard', category: 'Navigation', href: '/admin', icon: LayoutDashboard },
  { id: 'nav-products', title: 'Product Catalog Manager', category: 'Navigation', href: '/admin/products', icon: Package },
  { id: 'nav-orders', title: 'Retail Orders State Machine', category: 'Navigation', href: '/admin/orders', icon: ShoppingBag },
  { id: 'nav-trade', title: 'Trade Accounts & Applications', category: 'Navigation', href: '/admin/customers', icon: Users },
  { id: 'nav-suppliers', title: 'Supplier Health & Direct-Dispatch SLA', category: 'Navigation', href: '/admin/suppliers', icon: Truck },
  { id: 'nav-settings', title: 'Launch Gates & System Governance', category: 'Navigation', href: '/admin/settings', icon: Settings },
  { id: 'nav-storefront', title: 'View Public Storefront', category: 'Navigation', href: '/', icon: ExternalLink, external: true },
];

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState<PublicProductDTO[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input when opened
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Fetch search data on query change
  useEffect(() => {
    if (!open) return;
    if (!query.trim()) {
      setProducts([]);
      setOrders([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const [prodRes, orderRes] = await Promise.all([
          fetch(`/api/admin/products?query=${encodeURIComponent(query.trim())}`).then((r) =>
            r.ok ? r.json() : { products: [] }
          ),
          fetch(`/api/admin/orders`).then((r) => (r.ok ? r.json() : { orders: [] })),
        ]);

        setProducts((prodRes.products || []).slice(0, 5));

        const q = query.trim().toLowerCase();
        const matchedOrders = (orderRes.orders || [])
          .filter(
            (o: OrderRecord) =>
              o.order_number?.toLowerCase().includes(q) ||
              o.customer_email?.toLowerCase().includes(q) ||
              o.id?.toLowerCase().includes(q)
          )
          .slice(0, 4);

        setOrders(matchedOrders);
      } catch {
        // Safe fallback
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, open]);

  // Combined flat list of items for keyboard navigation
  const filteredActions = useMemo(() => {
    if (!query.trim()) return STATIC_ACTIONS;
    const q = query.toLowerCase();
    return STATIC_ACTIONS.filter((a) => a.title.toLowerCase().includes(q));
  }, [query]);

  const allItems = useMemo(() => {
    const items: Array<{
      type: 'action' | 'product' | 'order';
      id: string;
      title: string;
      subtitle?: string;
      href: string;
      external?: boolean;
      badge?: string;
    }> = [];

    // Products first if searching
    products.forEach((p) => {
      items.push({
        type: 'product',
        id: `p-${p.id}`,
        title: p.title,
        subtitle: `SKU: ${p.supplier_sku} • £${p.retail_price_inc_vat_gbp.toFixed(2)} inc. VAT`,
        href: `/admin/products/${p.id}`,
        badge: p.sellability_status,
      });
    });

    // Orders next if searching
    orders.forEach((o) => {
      items.push({
        type: 'order',
        id: `o-${o.id}`,
        title: `Order ${o.order_number || o.id.slice(0, 8)}`,
        subtitle: `${o.customer_email} • £${(o.total_inc_vat_gbp || 0).toFixed(2)}`,
        href: `/admin/orders/${o.id}`,
        badge: o.state,
      });
    });

    // Actions & navigation
    filteredActions.forEach((a) => {
      items.push({
        type: 'action',
        id: a.id,
        title: a.title,
        subtitle: a.category,
        href: a.href,
        external: a.external,
      });
    });

    return items;
  }, [products, orders, filteredActions]);

  // Handle keyboard arrow navigation
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (allItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (allItems.length || 1)) % (allItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allItems[selectedIndex];
        if (selected) {
          onClose();
          if (selected.external) {
            window.open(selected.href, '_blank');
          } else {
            router.push(selected.href);
          }
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, allItems, selectedIndex, router, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Universal Admin Search"
    >
      <div
        className="w-full max-w-2xl bg-white border border-tc-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="h-14 px-4 border-b border-tc-border flex items-center gap-3 bg-tc-canvas">
          <Search className="w-5 h-5 text-tc-primary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type to search products, orders, SKUs, or actions..."
            className="w-full bg-transparent text-sm text-tc-ink placeholder:text-tc-text-secondary focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-tc-text-secondary hover:text-tc-ink"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-tc-border text-tc-text-secondary shadow-2xs">
            ESC to close
          </kbd>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-tc-border/40 space-y-2">
          {loading && (
            <div className="py-8 text-center text-xs text-tc-text-secondary flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-tc-primary/30 border-t-tc-primary rounded-full animate-spin" />
              Searching database index...
            </div>
          )}

          {!loading && allItems.length === 0 && (
            <div className="py-12 text-center text-xs text-tc-text-secondary">
              No matching products, orders, or admin commands found.
            </div>
          )}

          {/* Group 1: Products */}
          {products.length > 0 && (
            <div className="pt-1">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-tc-text-secondary font-mono">
                Matching Products ({products.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {products.map((p) => {
                  const itemIndex = allItems.findIndex((it) => it.id === `p-${p.id}`);
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/admin/products/${p.id}`);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors min-h-[44px]',
                        isSelected ? 'bg-tc-surface-soft text-tc-ink border border-tc-primary/30' : 'hover:bg-tc-surface-soft text-tc-ink'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-tc-canvas border border-tc-border flex items-center justify-center shrink-0">
                          <Package className="w-4 h-4 text-tc-primary" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-bold truncate leading-tight">{p.title}</p>
                          <p className="text-[11px] text-tc-text-secondary truncate mt-0.5">
                            SKU: <span className="font-mono font-medium">{p.supplier_sku}</span> • £{p.retail_price_inc_vat_gbp.toFixed(2)} inc. VAT
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="neutral" size="sm" className="capitalize text-[10px]">
                          {p.sellability_status}
                        </Badge>
                        <ArrowRight className="w-3.5 h-3.5 text-tc-text-secondary" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 2: Orders */}
          {orders.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-tc-text-secondary font-mono">
                Matching Orders ({orders.length})
              </div>
              <div className="space-y-0.5 mt-1">
                {orders.map((o) => {
                  const itemIndex = allItems.findIndex((it) => it.id === `o-${o.id}`);
                  const isSelected = itemIndex === selectedIndex;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push(`/admin/orders/${o.id}`);
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors min-h-[44px]',
                        isSelected ? 'bg-tc-surface-soft text-tc-ink border border-tc-primary/30' : 'hover:bg-tc-surface-soft text-tc-ink'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-tc-canvas border border-tc-border flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4 text-tc-ink" />
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-bold truncate leading-tight font-mono">
                            {o.order_number || o.id}
                          </p>
                          <p className="text-[11px] text-tc-text-secondary truncate mt-0.5">
                            {o.customer_email} • £{(o.total_inc_vat_gbp || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="lime" size="sm" className="text-[10px]">
                          {o.state.replace(/_/g, ' ')}
                        </Badge>
                        <ArrowRight className="w-3.5 h-3.5 text-tc-text-secondary" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Group 3: Actions & Navigation */}
          {filteredActions.length > 0 && (
            <div className="pt-2">
              <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-tc-text-secondary font-mono">
                {query.trim() ? 'Actions & Destinations' : 'Suggested Shortcuts'}
              </div>
              <div className="space-y-0.5 mt-1">
                {filteredActions.map((a) => {
                  const itemIndex = allItems.findIndex((it) => it.id === a.id);
                  const isSelected = itemIndex === selectedIndex;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        onClose();
                        if (a.external) {
                          window.open(a.href, '_blank');
                        } else {
                          router.push(a.href);
                        }
                      }}
                      onMouseEnter={() => setSelectedIndex(itemIndex)}
                      className={cn(
                        'w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors min-h-[44px]',
                        isSelected ? 'bg-tc-surface-soft text-tc-ink border border-tc-primary/30' : 'hover:bg-tc-surface-soft text-tc-ink'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-tc-canvas border border-tc-border flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-tc-primary" />
                        </div>
                        <span className="text-xs font-semibold text-tc-ink">{a.title}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-tc-text-secondary">
                        {a.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation Hints */}
        <div className="px-4 py-2.5 border-t border-tc-border bg-tc-canvas flex items-center justify-between text-[11px] text-tc-text-secondary">
          <div className="flex items-center gap-3">
            <span>
              Use <kbd className="font-mono font-bold">↑</kbd> <kbd className="font-mono font-bold">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono font-bold">↵</kbd> to select
            </span>
          </div>
          <span className="font-semibold text-tc-primary">ToolCart Commerce OS</span>
        </div>
      </div>
    </div>
  );
}
