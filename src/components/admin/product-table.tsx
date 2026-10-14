'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { PublicProductDTO, SellabilityStatus } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, ShieldCheck, Camera, Edit } from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

export interface ProductTableProps {
  products: PublicProductDTO[];
  wholesaleOffers?: Record<string, number>; // map supplier_sku -> unit_cost_ex_vat_gbp
}

export function ProductTable({ products, wholesaleOffers = {} }: ProductTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  // Status counts
  const statusCounts = useMemo(() => {
    let draft = 0;
    let needs_review = 0;
    let approved = 0;
    let blocked = 0;

    products.forEach((p) => {
      const s = p.sellability_status || 'draft';
      if (s === 'approved') approved++;
      else if (s === 'needs_review') needs_review++;
      else if (s === 'blocked') blocked++;
      else draft++;
    });

    return {
      all: products.length,
      draft,
      needs_review,
      approved,
      blocked,
    };
  }, [products]);

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Status filter
      const currentStatus = p.sellability_status || 'draft';
      if (statusFilter !== 'all' && currentStatus !== statusFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSku = p.supplier_sku.toLowerCase().includes(q);
        const matchesGtin = p.gtin && p.gtin.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSku && !matchesGtin) {
          return false;
        }
      }

      return true;
    });
  }, [products, selectedCategory, statusFilter, search]);

  const renderStatusBadge = (status: SellabilityStatus = 'draft') => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Approved</Badge>;
      case 'needs_review':
        return <Badge variant="warning">Needs Review</Badge>;
      case 'blocked':
        return <Badge variant="danger">Blocked</Badge>;
      case 'draft':
      default:
        return <Badge variant="neutral">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-tc-border rounded-xl p-4 shadow-xs space-y-4">
        {/* Status Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-tc-border pb-3">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'draft', label: 'Draft', count: statusCounts.draft },
            { key: 'needs_review', label: 'Needs Review', count: statusCounts.needs_review },
            { key: 'approved', label: 'Approved', count: statusCounts.approved },
            { key: 'blocked', label: 'Blocked', count: statusCounts.blocked },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? 'bg-tc-ink text-white shadow-xs'
                  : 'bg-tc-canvas text-tc-text-secondary hover:text-tc-ink hover:bg-tc-border/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  statusFilter === tab.key ? 'bg-white/20 text-white' : 'bg-tc-border text-tc-ink'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by SKU, title, or GTIN..."
              className="w-full h-10 pl-9 pr-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
            />
            <Search className="w-4 h-4 text-tc-text-secondary absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-tc-text-secondary uppercase shrink-0">
              Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Product Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white">
              <tr>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">SKU & Title</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Category</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Barcode GTIN</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Pack / Case</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px]">Retail Price</th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                  Wholesale Cost
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">
                  Compliance
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-center">
                  Status
                </th>
                <th className="py-3.5 px-4 font-bold uppercase tracking-wider text-[11px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-tc-text-secondary">
                    No products matched the current search and status filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const wholesaleCost = wholesaleOffers[p.supplier_sku];

                  return (
                    <tr key={p.id} className="hover:bg-tc-surface-soft/60 transition-colors">
                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-1">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={`/images/products/${p.supplier_sku}.png`}
                              alt={p.title}
                              className="max-h-full max-w-full object-contain"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-mono font-bold text-tc-primary text-[11px]">
                              {p.supplier_sku}
                            </span>
                            <span className="font-semibold text-tc-ink line-clamp-1">{p.title}</span>
                            <span className="text-[10px] text-tc-success font-semibold mt-0.5">
                              {p.stock_quantity ? `${p.stock_quantity} in stock` : 'In stock'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-tc-text-secondary whitespace-nowrap">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-tc-text-secondary whitespace-nowrap">
                        {p.gtin || '—'}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-medium text-tc-ink">
                          {p.units_per_case} / case
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-tc-ink tabular-nums">
                            {formatGbp(p.retail_price_inc_vat_gbp)} <span className="text-[10px] font-normal text-tc-text-secondary">inc</span>
                          </span>
                          <span className="text-[10px] text-tc-text-secondary tabular-nums">
                            {formatGbp(p.retail_price_ex_vat_gbp)} ex
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {wholesaleCost !== undefined ? (
                          <div className="inline-flex flex-col items-end">
                            <span className="font-mono font-bold text-tc-ink tabular-nums">
                              {formatGbp(wholesaleCost)}
                            </span>
                            <span className="text-[9px] uppercase tracking-wider text-tc-primary font-bold">
                              Admin Only
                            </span>
                          </div>
                        ) : (
                          <span className="text-tc-text-secondary">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {p.compliance_verified ? (
                            <span title="UKCA / CE Declaration Verified" className="text-tc-success">
                              <ShieldCheck className="w-4 h-4" />
                            </span>
                          ) : (
                            <span title="Compliance Unverified" className="text-tc-text-secondary">
                              <ShieldCheck className="w-4 h-4 opacity-40" />
                            </span>
                          )}
                          {p.image_license_verified ? (
                            <span title="Supplier Photo License Confirmed" className="text-tc-primary">
                              <Camera className="w-4 h-4" />
                            </span>
                          ) : (
                            <span title="Photo License Unverified" className="text-tc-text-secondary">
                              <Camera className="w-4 h-4 opacity-40" />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {renderStatusBadge(p.sellability_status)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          asChild
                          className="h-7 text-xs px-2.5"
                        >
                          <Link href={`/admin/products/${p.id}`}>
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-3 bg-tc-canvas border-t border-tc-border flex items-center justify-between text-xs text-tc-text-secondary">
          <span>
            Showing <strong className="text-tc-ink">{filteredProducts.length}</strong> of{' '}
            <strong className="text-tc-ink">{products.length}</strong> products
          </span>
          <span className="text-[11px]">Catalog data sourced from Status International (UK) Ltd baseline</span>
        </div>
      </div>
    </div>
  );
}
