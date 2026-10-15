'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { OrderRecord } from '@/types/order';
import { PublicProductDTO } from '@/types/product';
import { TradeCustomerRecord } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Package,
  ShoppingBag,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Clock,
} from 'lucide-react';

export interface DashboardQuickFiltersProps {
  unfulfilledOrders: OrderRecord[];
  lowStockProducts: PublicProductDTO[];
  tradeCustomers: TradeCustomerRecord[];
  recentCustomerOrders: OrderRecord[];
  className?: string;
}

type ActiveTab = 'fulfillment' | 'low_stock' | 'customers';

export function DashboardQuickFilters({
  unfulfilledOrders,
  lowStockProducts,
  tradeCustomers,
  recentCustomerOrders,
  className,
}: DashboardQuickFiltersProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('fulfillment');

  const pendingTrade = tradeCustomers.filter((c) => c.status === 'pending');

  return (
    <div
      className={cn(
        'bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden',
        className
      )}
    >
      {/* Console Header & Tabs */}
      <div className="border-b border-tc-border bg-tc-canvas/50 px-4 sm:px-6 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
          <div>
            <h3 className="font-heading font-extrabold text-base text-tc-ink">
              Operational Triage Console
            </h3>
            <p className="text-xs text-tc-text-secondary">
              Real-time operational queue for dispatch, inventory alerts, and customer activity.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-tc-text-secondary">
              Priority Actions:
            </span>
            <Badge variant="lime" size="sm" className="font-bold">
              {unfulfilledOrders.length + lowStockProducts.length + pendingTrade.length} Pending
            </Badge>
          </div>
        </div>

        {/* Tab Controls */}
        <div
          role="tablist"
          aria-label="Operational triage sections"
          className="flex space-x-1 sm:space-x-2 border-b border-transparent overflow-x-auto"
        >
          {/* Tab 1: Needs Fulfillment */}
          <button
            type="button"
            role="tab"
            id="tab-fulfillment"
            aria-selected={activeTab === 'fulfillment'}
            aria-controls="panel-fulfillment"
            onClick={() => setActiveTab('fulfillment')}
            className={cn(
              'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[44px] whitespace-nowrap',
              activeTab === 'fulfillment'
                ? 'border-tc-primary text-tc-primary bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-tc-text-secondary hover:text-tc-ink hover:bg-tc-surface-soft/60'
            )}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Needs Fulfillment</span>
            <Badge
              variant={unfulfilledOrders.length > 0 ? 'lime' : 'neutral'}
              size="sm"
              className="ml-1 text-[10px]"
            >
              {unfulfilledOrders.length}
            </Badge>
          </button>

          {/* Tab 2: Low-Stock Alerts */}
          <button
            type="button"
            role="tab"
            id="tab-low-stock"
            aria-selected={activeTab === 'low_stock'}
            aria-controls="panel-low-stock"
            onClick={() => setActiveTab('low_stock')}
            className={cn(
              'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[44px] whitespace-nowrap',
              activeTab === 'low_stock'
                ? 'border-tc-primary text-tc-primary bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-tc-text-secondary hover:text-tc-ink hover:bg-tc-surface-soft/60'
            )}
          >
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Low-Stock Alerts</span>
            <Badge
              variant={lowStockProducts.length > 0 ? 'warning' : 'neutral'}
              size="sm"
              className="ml-1 text-[10px]"
            >
              {lowStockProducts.length}
            </Badge>
          </button>

          {/* Tab 3: Customer Activity */}
          <button
            type="button"
            role="tab"
            id="tab-customers"
            aria-selected={activeTab === 'customers'}
            aria-controls="panel-customers"
            onClick={() => setActiveTab('customers')}
            className={cn(
              'flex items-center gap-2 py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold border-b-2 transition-all min-h-[44px] whitespace-nowrap',
              activeTab === 'customers'
                ? 'border-tc-primary text-tc-primary bg-white rounded-t-lg shadow-2xs'
                : 'border-transparent text-tc-text-secondary hover:text-tc-ink hover:bg-tc-surface-soft/60'
            )}
          >
            <Users className="w-4 h-4 shrink-0" />
            <span>Customer Activity</span>
            {pendingTrade.length > 0 && (
              <Badge variant="warning" size="sm" className="ml-1 text-[10px]">
                {pendingTrade.length} New
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Tab Panels */}
      <div className="p-4 sm:p-6">
        {/* PANEL 1: Needs Fulfillment */}
        {activeTab === 'fulfillment' && (
          <div
            id="panel-fulfillment"
            role="tabpanel"
            aria-labelledby="tab-fulfillment"
            className="space-y-4"
          >
            {unfulfilledOrders.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-tc-surface-soft text-tc-success flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-tc-ink">
                  All Caught Up!
                </h4>
                <p className="text-xs text-tc-text-secondary max-w-sm">
                  There are no retail orders currently awaiting fulfillment or dispatch.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs divide-y divide-tc-border min-w-[600px]">
                  <thead className="bg-tc-ink text-white font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">Order</th>
                      <th className="py-3 px-4">Customer &amp; Location</th>
                      <th className="py-3 px-4">Items / Total</th>
                      <th className="py-3 px-4">State</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tc-border/60 bg-white">
                    {unfulfilledOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-tc-surface-soft/50 transition-colors">
                        <td className="py-3 px-4">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            className="font-mono font-bold text-tc-primary hover:underline"
                          >
                            {order.order_number}
                          </Link>
                          <span className="block text-[11px] text-tc-text-secondary">
                            {new Date(order.created_at).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-tc-ink block truncate max-w-[180px]">
                            {order.shipping_address?.full_name || order.customer_email}
                          </span>
                          <span className="text-[11px] text-tc-text-secondary">
                            {order.shipping_address?.city}, {order.shipping_address?.postcode}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-tc-ink">
                            £{order.total_inc_vat_gbp.toFixed(2)} inc. VAT
                          </span>
                          <span className="block text-[11px] text-tc-text-secondary">
                            {order.items?.length || 0} item{(order.items?.length || 0) === 1 ? '' : 's'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              order.state === 'payment_captured'
                                ? 'lime'
                                : order.state === 'supplier_accepted'
                                ? 'success'
                                : 'warning'
                            }
                            size="sm"
                          >
                            {order.state.replace(/_/g, ' ')}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button variant="secondary" size="sm" asChild>
                            <Link href={`/admin/orders/${order.id}`}>
                              Fulfill <ArrowRight className="w-3 h-3 ml-1" />
                            </Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: Low-Stock Alerts */}
        {activeTab === 'low_stock' && (
          <div
            id="panel-low-stock"
            role="tabpanel"
            aria-labelledby="tab-low-stock"
            className="space-y-4"
          >
            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-tc-surface-soft text-tc-success flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-heading font-bold text-sm text-tc-ink">
                  Stock Levels Healthy
                </h4>
                <p className="text-xs text-tc-text-secondary max-w-sm">
                  All products maintain healthy inventory levels (&gt;10 units in stock).
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full text-left text-xs divide-y divide-tc-border min-w-[600px]">
                  <thead className="bg-tc-ink text-white font-bold uppercase text-[11px]">
                    <tr>
                      <th className="py-3 px-4">SKU / Product</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Retail Price</th>
                      <th className="py-3 px-4">Inventory Level</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tc-border/60 bg-white">
                    {lowStockProducts.map((product) => {
                      const qty = product.stock_quantity ?? 0;
                      const isOutOfStock = qty <= 0 || product.availability_status === 'out_of_stock';

                      return (
                        <tr key={product.id} className="hover:bg-tc-surface-soft/50 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-mono font-bold text-tc-primary block">
                              {product.supplier_sku}
                            </span>
                            <span className="font-semibold text-tc-ink block truncate max-w-[220px]">
                              {product.title}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-tc-text-secondary">
                            <span className="px-2 py-0.5 rounded bg-tc-surface-soft text-[11px] font-medium border border-tc-border">
                              {product.category}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-tc-ink">
                            £{product.retail_price_inc_vat_gbp.toFixed(2)}
                            <span className="block text-[10px] text-tc-text-secondary font-normal">
                              £{product.retail_price_ex_vat_gbp.toFixed(2)} ex. VAT
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {isOutOfStock ? (
                              <Badge variant="danger" size="sm">
                                0 Units (Out of Stock)
                              </Badge>
                            ) : qty <= 5 ? (
                              <Badge variant="danger" size="sm">
                                {qty} Left (Critical)
                              </Badge>
                            ) : (
                              <Badge variant="warning" size="sm">
                                {qty} Units (Low)
                              </Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/admin/products/${product.id}`}>
                                Manage Stock <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: Customer Activity */}
        {activeTab === 'customers' && (
          <div
            id="panel-customers"
            role="tabpanel"
            aria-labelledby="tab-customers"
            className="space-y-6"
          >
            {/* Top Sub-section: Trade Account Applications */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-sm text-tc-ink">
                    B2B Trade Pro Applications
                  </h4>
                  <Badge variant="lime" size="sm">
                    {tradeCustomers.length} Total
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/admin/customers">
                    Manage Trade Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              {tradeCustomers.length === 0 ? (
                <div className="p-6 rounded-lg bg-tc-canvas/60 text-center text-xs text-tc-text-secondary">
                  No trade account applications registered yet.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-left text-xs divide-y divide-tc-border min-w-[550px]">
                    <thead className="bg-tc-ink text-white font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Company</th>
                        <th className="py-2.5 px-4">Contact</th>
                        <th className="py-2.5 px-4">Requested Tier</th>
                        <th className="py-2.5 px-4">Status</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tc-border/60 bg-white">
                      {tradeCustomers.slice(0, 5).map((cust) => (
                        <tr key={cust.id} className="hover:bg-tc-surface-soft/50 transition-colors">
                          <td className="py-2.5 px-4">
                            <span className="font-bold text-tc-ink block">
                              {cust.company_name}
                            </span>
                            <span className="text-[11px] text-tc-text-secondary">
                              Credit: £{cust.credit_limit_gbp?.toLocaleString('en-GB') || 0}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-medium text-tc-ink block">{cust.contact_name}</span>
                            <span className="text-[11px] text-tc-text-secondary">{cust.email}</span>
                          </td>
                          <td className="py-2.5 px-4">
                            <span className="font-mono text-xs font-semibold text-tc-primary">
                              {cust.trade_tier === 'tier_2_10pct' ? 'Tier 2 (10% Net 30)' : 'Tier 1 (5% Net 30)'}
                            </span>
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge
                              variant={
                                cust.status === 'approved'
                                  ? 'success'
                                  : cust.status === 'pending'
                                  ? 'warning'
                                  : 'danger'
                              }
                              size="sm"
                            >
                              {cust.status}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <Button variant="secondary" size="sm" asChild>
                              <Link href="/admin/customers">
                                Review <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom Sub-section: Recent Retail Customer Orders */}
            <div className="pt-4 border-t border-tc-border">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h4 className="font-heading font-bold text-sm text-tc-ink">
                    Recent Retail Customer Orders
                  </h4>
                  <Badge variant="neutral" size="sm">
                    {recentCustomerOrders.length} Recent
                  </Badge>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/admin/orders">
                    View All Orders <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </Button>
              </div>

              {recentCustomerOrders.length === 0 ? (
                <div className="p-6 rounded-lg bg-tc-canvas/60 text-center text-xs text-tc-text-secondary">
                  No orders recorded yet.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <table className="w-full text-left text-xs divide-y divide-tc-border min-w-[550px]">
                    <thead className="bg-tc-ink text-white font-bold uppercase text-[11px]">
                      <tr>
                        <th className="py-2.5 px-4">Order</th>
                        <th className="py-2.5 px-4">Customer Email</th>
                        <th className="py-2.5 px-4">Total (£ inc. VAT)</th>
                        <th className="py-2.5 px-4">Order State</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tc-border/60 bg-white">
                      {recentCustomerOrders.slice(0, 5).map((order) => (
                        <tr key={order.id} className="hover:bg-tc-surface-soft/50 transition-colors">
                          <td className="py-2.5 px-4 font-mono font-bold text-tc-primary">
                            <Link href={`/admin/orders/${order.id}`} className="hover:underline">
                              {order.order_number}
                            </Link>
                          </td>
                          <td className="py-2.5 px-4 text-tc-ink">
                            {order.customer_email}
                          </td>
                          <td className="py-2.5 px-4 font-mono font-bold text-tc-ink">
                            £{order.total_inc_vat_gbp.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-4">
                            <Badge variant="neutral" size="sm">
                              {order.state.replace(/_/g, ' ')}
                            </Badge>
                          </td>
                          <td className="py-2.5 px-4 text-right">
                            <Button variant="secondary" size="sm" asChild>
                              <Link href={`/admin/orders/${order.id}`}>
                                Details <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
