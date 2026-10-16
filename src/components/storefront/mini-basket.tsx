'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { Button } from '@/components/ui/button';
import { DragHandle } from '@/components/ui/drag-handle';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { EmptyToolChestVector } from '@/components/ui/vectors';
import { IconTruckFreight, IconTradeVerified, IconToolbox } from '@/components/ui/trade-icons';
import { CopyBadge } from '@/components/ui/copy-badge';
import { X, Plus, Minus, ArrowRight, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MiniBasket() {
  const { items, summary, isOpen, closeCart, updateQuantity, removeItem, clearCart } = useCart();
  const { isTradeMode, formatPriceDisplay } = useVAT();

  const { sheetRef, style, dragHandleProps } = useSwipeToDismiss({
    onDismiss: closeCart,
    threshold: 80,
    direction: 'down',
  });

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-Over Drawer Container */}
      <div
        ref={sheetRef}
        style={style}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mini-basket-title"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right-full duration-300"
      >
        {/* Tactile Grab Handle */}
        <div className="bg-tc-canvas pt-1 border-b border-tc-border/40 flex justify-center">
          <DragHandle {...dragHandleProps} />
        </div>

        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-tc-border flex items-center justify-between bg-tc-canvas shrink-0">
          <div className="flex items-center gap-2">
            <IconToolbox size={20} className="text-tc-primary" />
            <h2 id="mini-basket-title" className="font-heading font-extrabold text-base sm:text-lg text-tc-ink">
              Your Basket
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-tc-action-lime text-tc-ink font-bold text-xs border border-tc-ink tabular-nums">
              {summary.total_items_count} items
            </span>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button
                type="button"
                onClick={clearCart}
                className="min-h-[44px] px-2 flex items-center text-xs text-tc-text-secondary hover:text-tc-error underline"
              >
                Clear
              </button>
            )}
            <button
              type="button"
              onClick={closeCart}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-md text-tc-text-secondary hover:text-tc-ink transition-colors"
              aria-label="Close basket drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body: Line Items & Supplier Delivery Grouping */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 sm:p-5 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-48 h-36 mx-auto flex items-center justify-center">
                <img
                  src="/images/states/empty-cart.webp"
                  alt="Empty Tool Basket"
                  className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(24,35,54,0.12)] hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div>
                <p className="font-heading font-bold text-base text-tc-ink">Your basket is empty</p>
                <p className="text-xs text-tc-text-secondary mt-1">
                  Explore our verified UK trade hardware catalog to get started.
                </p>
              </div>
              <Button variant="primary" size="sm" asChild onClick={closeCart}>
                <Link href="/tools">Shop Tools & Hardware</Link>
              </Button>
            </div>
          ) : (
            summary.supplier_groups.map((group) => {
              const shortfallEx = Math.max(0, group.free_carriage_threshold_gbp - group.subtotal_ex_vat_gbp);
              return (
                <div
                  key={group.supplier_id}
                  className="rounded-card border border-tc-border bg-white overflow-hidden shadow-xs"
                >
                  {/* Supplier Group Header */}
                  <div className="p-3 bg-tc-surface-soft border-b border-tc-primary/20 flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-tc-ink">{group.supplier_name}</span>
                      <span className="text-[11px] font-medium text-tc-primary flex items-center gap-1.5">
                        <IconTruckFreight size={16} className="text-tc-primary" />
                        {group.estimated_lead_time_days}
                      </span>
                    </div>

                    {/* Free delivery threshold indicator */}
                    <div className="text-[11px] text-tc-text-secondary pt-0.5">
                      {group.is_free_carriage ? (
                        <span className="text-tc-success font-semibold flex items-center gap-1.5">
                          <IconTradeVerified size={16} className="text-tc-success" />
                          Qualified for FREE UK delivery
                        </span>
                      ) : (
                        <span>
                          Add <span className="font-bold tabular-nums">£{shortfallEx.toFixed(2)} ex. VAT</span> for FREE shipping
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Group Items */}
                  <ul className="divide-y divide-tc-border/60">
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
                        <li key={`${item.product_id}_${item.is_case_quantity}`} className="p-3.5 space-y-2">
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-12 h-12 rounded-lg bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-1">
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
                                onClick={closeCart}
                                className="font-heading font-bold text-xs sm:text-sm text-tc-ink hover:text-tc-primary line-clamp-2"
                              >
                                {item.title}
                              </Link>
                              <div className="text-[11px] text-tc-text-secondary mt-1 flex flex-wrap items-center gap-2">
                                <CopyBadge value={item.supplier_sku} size="xs" label="SKU" />
                                <span>•</span>
                                <span>
                                  {item.is_case_quantity
                                    ? `Case of ${item.units_per_case}`
                                    : `Pack of ${item.units_per_pack}`}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => removeItem(item.product_id, item.is_case_quantity)}
                              className="min-w-[44px] min-h-[44px] flex items-center justify-center text-tc-text-secondary hover:text-tc-error"
                              title="Remove item"
                              aria-label={`Remove ${item.title} from basket`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Quantity & Price Controls */}
                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center border border-tc-border rounded-md bg-tc-canvas h-11">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity - 1, item.is_case_quantity)}
                                className="min-w-[44px] h-full flex items-center justify-center text-tc-text-secondary hover:text-tc-ink transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-2.5 text-xs font-bold text-tc-ink tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.product_id, item.quantity + 1, item.is_case_quantity)}
                                className="min-w-[44px] h-full flex items-center justify-center text-tc-text-secondary hover:text-tc-ink transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-right">
                              <div className="text-xs sm:text-sm font-bold text-tc-ink tabular-nums">
                                {lineTotal.primaryText}
                              </div>
                              <div className="text-[10px] text-tc-text-secondary tabular-nums">
                                {itemPrice.primaryText} each
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>

                  {/* Group Carriage Subtotal */}
                  <div className="p-2.5 bg-tc-canvas text-xs flex items-center justify-between border-t border-tc-border/60">
                    <span className="text-tc-text-secondary">Dispatch carriage fee:</span>
                    <span className="font-bold tabular-nums">
                      {group.is_free_carriage
                        ? 'FREE'
                        : isTradeMode
                        ? `£${group.carriage_fee_ex_vat_gbp.toFixed(2)} ex. VAT`
                        : `£${group.carriage_fee_inc_vat_gbp.toFixed(2)} inc. VAT`}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer: Taxes & Actions */}
        {items.length > 0 && (
          <div className="p-4 sm:p-5 border-t border-tc-border bg-white space-y-3 shrink-0 pb-[calc(1.25rem+env(safe-area-inset-bottom))]">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-tc-text-secondary">
                <span>Net Subtotal (ex. VAT)</span>
                <span className="tabular-nums font-mono">£{summary.subtotal_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-tc-text-secondary">
                <span>Delivery Carriage (ex. VAT)</span>
                <span className="tabular-nums font-mono">£{summary.shipping_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-tc-text-secondary">
                <span>UK Standard VAT (20%)</span>
                <span className="tabular-nums font-mono">£{summary.vat_amount_gbp.toFixed(2)}</span>
              </div>

              <div className="pt-2 border-t border-tc-border flex justify-between items-baseline">
                <div>
                  <span className="font-heading font-extrabold text-sm sm:text-base text-tc-ink">
                    Grand Total
                  </span>
                  <p className="text-[10px] text-tc-text-secondary">
                    {isTradeMode ? 'Excluding VAT' : 'Including 20% VAT'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-heading font-extrabold text-lg sm:text-xl text-tc-ink tabular-nums">
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

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button variant="outline" size="sm" asChild onClick={closeCart}>
                <Link href="/basket">View Full Basket</Link>
              </Button>
              <Button
                variant="accent"
                size="sm"
                asChild
                onClick={closeCart}
                className="flex items-center justify-center gap-1.5"
              >
                <Link href="/checkout">
                  <span>Checkout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
