'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { OrderRecord, OrderState } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatGbp } from '@/lib/catalog/pricing';
import {
  Search,
  ArrowRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Clock,
  CheckCircle,
  Truck,
  RotateCcw,
} from 'lucide-react';

export interface OrdersTableProps {
  orders: OrderRecord[];
}

type SortField = 'date' | 'total' | 'order_number';
type SortOrder = 'asc' | 'desc';

export function getOrderStateBadge(state: OrderState) {
  switch (state) {
    case 'delivered':
      return <Badge variant="success">Delivered</Badge>;
    case 'dispatched':
    case 'partial_dispatch':
      return <Badge variant="lime">Dispatched</Badge>;
    case 'payment_captured':
      return <Badge variant="success">Paid</Badge>;
    case 'supplier_accepted':
      return <Badge variant="lime">Supplier Accepted</Badge>;
    case 'supplier_order_pending':
    case 'checkout_authorized':
      return <Badge variant="warning">Action Required</Badge>;
    case 'supplier_rejected':
    case 'supplier_timeout':
    case 'payment_authorization_expired':
      return <Badge variant="danger">Failed</Badge>;
    case 'refund_pending':
      return <Badge variant="warning">Refund Pending</Badge>;
    case 'refunded':
      return <Badge variant="neutral">Refunded</Badge>;
    case 'manual_review':
      return <Badge variant="danger">Manual Review</Badge>;
    case 'cart_pending':
    default:
      return <Badge variant="neutral">{state}</Badge>;
  }
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const stateCounts = useMemo(() => {
    let needs_action = 0;
    let paid = 0;
    let dispatched = 0;
    let delivered = 0;
    let refunded = 0;

    orders.forEach((o) => {
      if (
        o.state === 'supplier_order_pending' ||
        o.state === 'checkout_authorized' ||
        o.state === 'manual_review'
      ) {
        needs_action++;
      } else if (o.state === 'payment_captured' || o.state === 'supplier_accepted') {
        paid++;
      } else if (o.state === 'dispatched' || o.state === 'partial_dispatch') {
        dispatched++;
      } else if (o.state === 'delivered') {
        delivered++;
      } else if (o.state === 'refunded' || o.state === 'refund_pending') {
        refunded++;
      }
    });

    return {
      all: orders.length,
      needs_action,
      paid,
      dispatched,
      delivered,
      refunded,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // State filter
        if (stateFilter === 'needs_action') {
          if (
            o.state !== 'supplier_order_pending' &&
            o.state !== 'checkout_authorized' &&
            o.state !== 'manual_review'
          )
            return false;
        } else if (stateFilter === 'paid') {
          if (o.state !== 'payment_captured' && o.state !== 'supplier_accepted') return false;
        } else if (stateFilter === 'dispatched') {
          if (o.state !== 'dispatched' && o.state !== 'partial_dispatch') return false;
        } else if (stateFilter === 'delivered') {
          if (o.state !== 'delivered') return false;
        } else if (stateFilter === 'refunded') {
          if (o.state !== 'refunded' && o.state !== 'refund_pending') return false;
        }

        // Search query
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchesNum = o.order_number.toLowerCase().includes(q);
          const matchesEmail = o.customer_email.toLowerCase().includes(q);
          const matchesName = (o.shipping_address?.full_name || '').toLowerCase().includes(q);
          if (!matchesNum && !matchesEmail && !matchesName) return false;
        }

        return true;
      })
      .sort((a, b) => {
        let comparison = 0;
        if (sortField === 'date') {
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        } else if (sortField === 'total') {
          comparison = a.total_inc_vat_gbp - b.total_inc_vat_gbp;
        } else if (sortField === 'order_number') {
          comparison = a.order_number.localeCompare(b.order_number);
        }
        return sortOrder === 'asc' ? comparison : -comparison;
      });
  }, [orders, stateFilter, search, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage, pageSize]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder(field === 'date' ? 'desc' : 'asc');
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

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="bg-white border border-tc-border rounded-xl p-4 shadow-xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-tc-border pb-3">
          {[
            { key: 'all', label: 'All Orders', count: stateCounts.all },
            { key: 'needs_action', label: 'Needs Action', count: stateCounts.needs_action },
            { key: 'paid', label: 'Paid', count: stateCounts.paid },
            { key: 'dispatched', label: 'Dispatched', count: stateCounts.dispatched },
            { key: 'delivered', label: 'Delivered', count: stateCounts.delivered },
            { key: 'refunded', label: 'Refunded', count: stateCounts.refunded },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStateFilter(tab.key);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                stateFilter === tab.key
                  ? 'bg-tc-ink text-white shadow-xs'
                  : 'bg-tc-canvas text-tc-text-secondary hover:text-tc-ink hover:bg-tc-border/40'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                  stateFilter === tab.key ? 'bg-white/20 text-white' : 'bg-tc-border text-tc-ink'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Pagination settings */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:max-w-md">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Order #, customer name, email..."
              className="w-full h-10 pl-9 pr-3 bg-tc-canvas border border-tc-border rounded-lg text-xs text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:bg-white"
            />
            <Search className="w-4 h-4 text-tc-text-secondary absolute left-3 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-tc-text-secondary uppercase">Show:</label>
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
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white">
              <tr>
                <th
                  onClick={() => handleSort('order_number')}
                  className="py-3.5 px-4 font-bold uppercase text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Order # {renderSortIcon('order_number')}
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 font-bold uppercase text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Date {renderSortIcon('date')}
                </th>
                <th className="py-3.5 px-4 font-bold uppercase text-[11px]">Customer</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[11px]">Items</th>
                <th
                  onClick={() => handleSort('total')}
                  className="py-3.5 px-4 font-bold uppercase text-[11px] cursor-pointer hover:bg-white/5 select-none"
                >
                  Total (Inc. VAT) {renderSortIcon('total')}
                </th>
                <th className="py-3.5 px-4 font-bold uppercase text-[11px] text-center">Status</th>
                <th className="py-3.5 px-4 font-bold uppercase text-[11px] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-tc-text-secondary">
                    No orders matching the active search or status filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-tc-surface-soft/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-tc-primary">
                      {o.order_number}
                    </td>
                    <td className="py-3.5 px-4 text-tc-text-secondary whitespace-nowrap">
                      {new Date(o.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-tc-ink">
                          {o.shipping_address?.full_name || 'Retail Customer'}
                        </span>
                        <span className="font-mono text-tc-text-secondary text-[11px]">
                          {o.customer_email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-tc-ink">
                      {o.items.length} {o.items.length === 1 ? 'item' : 'items'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-tc-ink tabular-nums">
                      {formatGbp(o.total_inc_vat_gbp)}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {getOrderStateBadge(o.state)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <Button variant="outline" size="sm" asChild className="h-7 text-xs px-2.5">
                        <Link href={`/admin/orders/${o.id}`}>
                          View Order
                          <ArrowRight className="w-3 h-3 ml-1" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="p-3.5 bg-tc-canvas border-t border-tc-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-tc-text-secondary">
          <span>
            Showing{' '}
            <strong className="text-tc-ink">
              {filteredOrders.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </strong>{' '}
            to{' '}
            <strong className="text-tc-ink">
              {Math.min(currentPage * pageSize, filteredOrders.length)}
            </strong>{' '}
            of <strong className="text-tc-ink">{filteredOrders.length}</strong> orders
          </span>

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
