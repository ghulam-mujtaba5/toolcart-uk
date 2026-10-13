'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { Button } from '@/components/ui/button';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';

export default function BasketPage() {
  const { items, summary, updateQuantity, removeItem, clearCart } = useCart();
  const { isTradeMode, formatPriceDisplay } = useVAT();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Shopping Basket</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-tc-border pb-5">
        <div>
          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight flex items-center gap-3">
            <span>Shopping Basket</span>
            <span className="text-sm font-normal text-tc-text-secondary tabular-nums">
              ({summary.total_items_count} items)
            </span>
          </h1>
          <p className="text-xs text-tc-text-secondary mt-1">
            Supplier-grouped dispatch with transparent UK VAT and carriage calculations.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearCart}
            className="text-xs text-tc-text-secondary hover:text-tc-error underline flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Entire Basket</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-white rounded-card border border-tc-border p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-tc-surface-soft mx-auto flex items-center justify-center text-tc-primary">
            <ShoppingBag className="w-8 h-8 opacity-60" />
          </div>
          <h2 className="font-heading font-bold text-xl text-tc-ink">
            Your basket is currently empty
          </h2>
          <p className="text-xs text-tc-text-secondary leading-relaxed">
            Discover trade tools, screwdrivers, fixings, and consumables seeded directly from verified UK suppliers.
          </p>
          <div className="pt-2">
            <Button variant="primary" asChild>
              <Link href="/tools">Explore Hardware Catalog</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Supplier Delivery Groups */}
          <div className="lg:col-span-8 space-y-6">
            {summary.supplier_groups.map((group) => {
              const shortfallEx = Math.max(0, group.free_carriage_threshold_gbp - group.subtotal_ex_vat_gbp);
              return (
                <div
                  key={group.supplier_id}
                  className="bg-white rounded-card border border-tc-border overflow-hidden shadow-xs"
                >
                  {/* Supplier Header */}
                  <div className="p-4 bg-tc-surface-soft border-b border-[#C8D9F9] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-mono font-bold text-tc-primary tracking-wider">
                        DISPATCH HUB
                      </span>
                      <h2 className="font-heading font-bold text-sm sm:text-base text-tc-ink">
                        {group.supplier_name}
                      </h2>
                    </div>

                    <div className="text-xs text-right">
                      <span className="text-tc-primary font-semibold flex items-center gap-1 sm:justify-end">
                        <Truck className="w-3.5 h-3.5" />
                        ETA: {group.estimated_lead_time_days}
                      </span>
                      <span className="text-[11px] text-tc-text-secondary mt-0.5 block">
                        {group.is_free_carriage ? (
                          <span className="text-tc-success font-semibold">
                            ✓ FREE UK delivery qualified
                          </span>
                        ) : (
                          <span>
                            Add <strong className="tabular-nums font-mono">£{shortfallEx.toFixed(2)} ex. VAT</strong> for free shipping
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Items Table / List */}
                  <div className="divide-y divide-tc-border/60 p-4">
                    {group.items.map((item) => {
                      const itemPrice = formatPriceDisplay(
                        item.retail_price_inc_vat_gbp,
                        item.retail_price_ex_vat_gbp
                      );
                      const lineTotal = formatPriceDisplay(
                        item.retail_price_inc_vat_gbp * item.quantity,
                        item.retail_price_ex_vat_gbp * item.quantity
                      );

                      return (
                        <div
                          key={`${item.product_id}_${item.is_case_quantity}`}
                          className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div className="flex items-start gap-3.5 flex-1 min-w-0">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-1.5">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/images/products/${item.supplier_sku}.png`}
                                alt={item.title}
                                className="max-h-full max-w-full object-contain"
                                loading="lazy"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Link
                                href={`/products/${item.slug}`}
                                className="font-heading font-bold text-sm sm:text-base text-tc-ink hover:text-tc-primary transition-colors"
                              >
                                {item.title}
                              </Link>

                            <div className="flex flex-wrap items-center gap-3 text-xs text-tc-text-secondary mt-1">
                              <span className="font-mono">{item.supplier_sku}</span>
                              <span>•</span>
                              <span>
                                {item.is_case_quantity
                                  ? `Full Outer Case (${item.units_per_case} packs)`
                                  : `Pack of ${item.units_per_pack}`}
                              </span>
                              <span>•</span>
                              <span className="text-tc-ink font-semibold tabular-nums">
                                {itemPrice.primaryText} each
                              </span>
                            </div>
                          </div>
                        </div>

                          {/* Controls & Line Total */}
                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="flex items-center border border-tc-border rounded-lg bg-tc-canvas h-9">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                className="px-2.5 text-tc-text-secondary hover:text-tc-ink h-full"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2 text-xs font-bold text-tc-ink tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                className="px-2.5 text-tc-text-secondary hover:text-tc-ink h-full"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right min-w-[90px]">
                              <div className="font-sans font-bold text-sm sm:text-base text-tc-ink tabular-nums">
                                {lineTotal.primaryText}
                              </div>
                              <div className="text-[10px] text-tc-text-secondary tabular-nums">
                                {lineTotal.secondaryText}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.product_id)}
                              className="text-tc-text-secondary hover:text-tc-error p-1"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Group Carriage Subtotal Bar */}
                  <div className="p-3.5 bg-tc-canvas border-t border-tc-border/60 flex items-center justify-between text-xs">
                    <span className="text-tc-text-secondary">
                      Carriage fee for this dispatch:
                    </span>
                    <span className="font-bold tabular-nums">
                      {group.is_free_carriage
                        ? 'FREE (£0.00)'
                        : isTradeMode
                        ? `£${group.carriage_fee_ex_vat_gbp.toFixed(2)} ex. VAT`
                        : `£${group.carriage_fee_inc_vat_gbp.toFixed(2)} inc. VAT`}
                    </span>
                  </div>
                </div>
              );
            })}

            <div className="pt-2">
              <Link
                href="/tools"
                className="text-xs font-semibold text-tc-primary hover:underline flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Continue shopping for trade hardware</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Landed Cost & VAT Summary */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-card border border-tc-border p-6 shadow-sm space-y-5">
              <h2 className="font-heading font-extrabold text-lg text-tc-ink border-b border-tc-border pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-tc-text-secondary">
                  <span>Goods Subtotal (ex. VAT)</span>
                  <span className="tabular-nums font-mono">£{summary.subtotal_ex_vat_gbp.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-tc-text-secondary">
                  <span>Total Delivery Carriage (ex. VAT)</span>
                  <span className="tabular-nums font-mono">£{summary.shipping_ex_vat_gbp.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-tc-text-secondary">
                  <span>UK Standard VAT (20%)</span>
                  <span className="tabular-nums font-mono">£{summary.vat_amount_gbp.toFixed(2)}</span>
                </div>

                <div className="pt-3 border-t border-tc-border flex justify-between items-baseline">
                  <div>
                    <span className="font-heading font-extrabold text-base text-tc-ink">
                      Grand Total
                    </span>
                    <p className="text-[11px] text-tc-text-secondary">
                      {isTradeMode ? 'Excluding VAT' : 'Including 20% UK VAT'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-heading font-extrabold text-xl text-tc-ink tabular-nums">
                      £{isTradeMode
                        ? summary.grand_total_ex_vat_gbp.toFixed(2)
                        : summary.grand_total_inc_vat_gbp.toFixed(2)}
                    </div>
                    <div className="text-[11px] text-tc-text-secondary tabular-nums">
                      {isTradeMode
                        ? `(£${summary.grand_total_inc_vat_gbp.toFixed(2)} inc. VAT)`
                        : `(£${summary.grand_total_ex_vat_gbp.toFixed(2)} ex. VAT)`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Button
                  variant="accent"
                  size="lg"
                  asChild
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold"
                >
                  <Link href="/checkout">
                    <span>Proceed to Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>

                <div className="p-3 rounded-lg bg-tc-surface-soft border border-[#C8D9F9] text-[11px] text-tc-ink space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-tc-primary">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Launch Gate Staging Notice</span>
                  </div>
                  <p className="text-tc-text-secondary leading-snug">
                    Checkout operates in test mode. No live charges will be placed without trade approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
