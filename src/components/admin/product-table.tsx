'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PublicProductDTO, SellabilityStatus } from '@/types/product';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Search,
  ShieldCheck,
  Camera,
  Edit,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckSquare,
  Square,
  MinusSquare,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  PackageCheck,
  Layers,
  X,
} from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';
import { BulkActionBar } from './bulk-action-bar';

export interface ProductTableProps {
  products: PublicProductDTO[];
  wholesaleOffers?: Record<string, number>; // map supplier_sku -> unit_cost_ex_vat_gbp
}

type SortField = 'title' | 'supplier_sku' | 'category' | 'retail_price' | 'stock';
type SortOrder = 'asc' | 'desc';

export function ProductTable({ products: initialProducts, wholesaleOffers = {} }: ProductTableProps) {
  const router = useRouter();
  const [products, setProducts] = useState<PublicProductDTO[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Sorting
  const [sortField, setSortField] = useState<SortField>('supplier_sku');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Row Selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  // Bulk Action State
  const [isBulkExecuting, setIsBulkExecuting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Synchronize when initialProducts changes
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // 300ms Debounced Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new query
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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

  // Filtered & Sorted list
  const filteredProducts = useMemo(() => {
    const filtered = products.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }
      const currentStatus = p.sellability_status || 'draft';
      if (statusFilter !== 'all' && currentStatus !== statusFilter) {
        return false;
      }
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSku = p.supplier_sku.toLowerCase().includes(q);
        const matchesGtin = p.gtin && p.gtin.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSku && !matchesGtin) {
          return false;
        }
      }
      return true;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'title') {
        comparison = a.title.localeCompare(b.title);
      } else if (sortField === 'supplier_sku') {
        comparison = a.supplier_sku.localeCompare(b.supplier_sku);
      } else if (sortField === 'category') {
        comparison = a.category.localeCompare(b.category);
      } else if (sortField === 'retail_price') {
        comparison = a.retail_price_inc_vat_gbp - b.retail_price_inc_vat_gbp;
      } else if (sortField === 'stock') {
        comparison = (a.stock_quantity || 0) - (b.stock_quantity || 0);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [products, selectedCategory, statusFilter, debouncedSearch, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Header Checkbox Indeterminate state management
  const pageIds = useMemo(() => paginatedProducts.map((p) => p.id), [paginatedProducts]);
  const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));
  const isSomePageSelected = pageIds.some((id) => selectedIds.has(id)) && !isAllPageSelected;

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = isSomePageSelected;
    }
  }, [isSomePageSelected]);

  const toggleSelectAllPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllPageSelected) {
        pageIds.forEach((id) => next.delete(id));
      } else {
        pageIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-white/50 ml-1 inline" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-tc-action-lime ml-1 inline" />
    ) : (
      <ArrowDown className="w-3 h-3 text-tc-action-lime ml-1 inline" />
    );
  };

  // Bulk Actions
  const executeBulkAction = async (
    action: 'status' | 'price_adjust' | 'stock_adjust' | 'category',
    payload: any
  ) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;

    setIsBulkExecuting(true);
    setToastMessage(null);

    try {
      const res = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_ids: ids, action, payload }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to execute bulk action');
      }

      const result = await res.json();

      // Optimistic update of local state
      setProducts((prev) =>
        prev.map((p) => {
          if (!selectedIds.has(p.id)) return p;
          if (action === 'status' && payload.status) {
            return { ...p, sellability_status: payload.status };
          }
          if (action === 'category' && payload.category) {
            return {
              ...p,
              category: payload.category,
              category_slug: payload.category.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            };
          }
          if (action === 'price_adjust') {
            let newPrice = p.retail_price_inc_vat_gbp;
            if (payload.price_percentage_change !== undefined) {
              newPrice = Number((newPrice * (1 + payload.price_percentage_change / 100)).toFixed(2));
            } else if (payload.price_fixed_change_gbp !== undefined) {
              newPrice = Math.max(0.01, Number((newPrice + payload.price_fixed_change_gbp).toFixed(2)));
            }
            return {
              ...p,
              retail_price_inc_vat_gbp: newPrice,
              retail_price_ex_vat_gbp: Number((newPrice / 1.2).toFixed(2)),
            };
          }
          if (action === 'stock_adjust') {
            let newStock: number = p.stock_quantity ?? 0;
            if (payload.stock_exact !== undefined) {
              newStock = Math.max(0, payload.stock_exact);
            } else if (payload.stock_delta !== undefined) {
              newStock = Math.max(0, newStock + payload.stock_delta);
            }
            return {
              ...p,
              stock_quantity: newStock,
              availability_status: newStock > 0 ? 'in_stock' : 'out_of_stock',
            };
          }
          return p;
        })
      );

      setToastMessage({
        type: 'success',
        text: `Successfully updated ${result.updated_count} product(s).`,
      });
      clearSelection();
      router.refresh();
    } catch (err: unknown) {
      setToastMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Error executing bulk action',
      });
    } finally {
      setIsBulkExecuting(false);
    }
  };

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
    <div className="space-y-4 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role={toastMessage.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`p-3 rounded-lg text-xs font-semibold flex items-center justify-between border shadow-sm ${
            toastMessage.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span>{toastMessage.text}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-tc-ink font-bold hover:opacity-70 p-1"
            aria-label="Dismiss message"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

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
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
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

        {/* Search, Category Filter & Page Size */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search SKU, title, or GTIN (300ms debounce)..."
              className="w-full h-10 pl-9 pr-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
            />
            <Search className="w-4 h-4 text-tc-text-secondary absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-tc-text-secondary uppercase shrink-0">
                Category:
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setPage(1);
                }}
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

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-tc-text-secondary uppercase shrink-0">
                Show:
              </label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="h-10 px-2 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Docked Bulk Actions Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        isExecuting={isBulkExecuting}
        categories={categories}
        onStatusChange={(status) => executeBulkAction('status', { status })}
        onPriceAdjust={(params) => executeBulkAction('price_adjust', params)}
        onStockAdjust={(params) => executeBulkAction('stock_adjust', params)}
        onCategoryAssign={(category) => executeBulkAction('category', { category })}
        onClearSelection={clearSelection}
      />

      {/* Product Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white">
              <tr>
                <th className="py-3.5 px-3 w-10 text-center">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={isAllPageSelected}
                    onChange={toggleSelectAllPage}
                    aria-label="Select all products on page"
                    className="w-4 h-4 rounded border-tc-border text-tc-primary focus:ring-tc-primary cursor-pointer accent-tc-primary"
                  />
                </th>
                <th
                  onClick={() => handleSort('supplier_sku')}
                  className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  SKU & Title {renderSortIcon('supplier_sku')}
                </th>
                <th
                  onClick={() => handleSort('category')}
                  className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Category {renderSortIcon('category')}
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px]">Barcode GTIN</th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px]">Pack / Case</th>
                <th
                  onClick={() => handleSort('retail_price')}
                  className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Retail Price {renderSortIcon('retail_price')}
                </th>
                <th
                  onClick={() => handleSort('stock')}
                  className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Stock {renderSortIcon('stock')}
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-right">
                  Wholesale Cost
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Compliance
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-center">
                  Status
                </th>
                <th className="py-3.5 px-3 font-bold uppercase tracking-wider text-[11px] text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {paginatedProducts.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-tc-text-secondary">
                    No products matched the current search, category, or status filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const wholesaleCost = wholesaleOffers[p.supplier_sku];
                  const isSelected = selectedIds.has(p.id);

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? 'bg-tc-surface-soft/80' : 'hover:bg-tc-surface-soft/40'
                      }`}
                    >
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(p.id)}
                          aria-label={`Select product ${p.supplier_sku}`}
                          className="w-4 h-4 rounded border-tc-border text-tc-primary focus:ring-tc-primary cursor-pointer accent-tc-primary"
                        />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-lg bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-1">
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
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-tc-text-secondary whitespace-nowrap">
                        {p.category}
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-tc-text-secondary whitespace-nowrap">
                        {p.gtin || '—'}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-medium text-tc-ink">
                          {p.units_per_case} / case
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-tc-ink tabular-nums">
                            {formatGbp(p.retail_price_inc_vat_gbp)}{' '}
                            <span className="text-[10px] font-normal text-tc-text-secondary">inc</span>
                          </span>
                          <span className="text-[10px] text-tc-text-secondary tabular-nums">
                            {formatGbp(p.retail_price_ex_vat_gbp)} ex
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`font-bold tabular-nums text-xs ${
                            (p.stock_quantity || 0) <= 5 ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {p.stock_quantity ?? 0}
                        </span>
                        <span className="text-[10px] text-tc-text-secondary ml-1">units</span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
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
                      <td className="py-3 px-3 text-center whitespace-nowrap">
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
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {renderStatusBadge(p.sellability_status)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
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

        {/* Pagination & Footer info bar */}
        <div className="p-3.5 bg-tc-canvas border-t border-tc-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-tc-text-secondary">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-tc-ink">
                {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
              </strong>{' '}
              to{' '}
              <strong className="text-tc-ink">
                {Math.min(currentPage * pageSize, filteredProducts.length)}
              </strong>{' '}
              of <strong className="text-tc-ink">{filteredProducts.length}</strong> matching products
            </span>
            {selectedIds.size > 0 && (
              <span className="text-tc-primary font-bold">
                ({selectedIds.size} selected)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8 px-2.5 text-xs bg-white text-tc-ink border-tc-border"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" />
              Previous
            </Button>
            <span className="text-xs font-semibold px-2 text-tc-ink">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-2.5 text-xs bg-white text-tc-ink border-tc-border"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
