'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { useVAT } from '@/context/vat-context';
import { useToast } from '@/context/toast-context';
import { Button } from '@/components/ui/button';
import {
  Lock,
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  User,
  ArrowLeft,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart } = useCart();
  const { isTradeMode } = useVAT();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [postcode, setPostcode] = useState('');
  const [phone, setPhone] = useState('');

  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false);
  const [postcodeError, setPostcodeError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState('');

  const handlePostcodeBlur = () => {
    if (!postcode.trim()) {
      setPostcodeError('UK postcode is required');
    } else if (!UK_POSTCODE_REGEX.test(postcode.trim())) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA, LS1 4DY)');
    } else {
      setPostcodeError('');
    }
  };

  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!UK_POSTCODE_REGEX.test(postcode.trim())) {
      setPostcodeError('Please enter a valid UK postcode (e.g. SW1A 1AA, LS1 4DY)');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError(null);

    const generatedOrderNumber = `TC-${Date.now().toString().slice(-6)}`;

    try {
      const payload = {
        order_number: generatedOrderNumber,
        customer_email: email,
        shipping_address: {
          full_name: fullName,
          company_name: undefined,
          address_line_1: addressLine1,
          address_line_2: addressLine2 || undefined,
          city,
          postcode: postcode.toUpperCase(),
          country: 'United Kingdom',
        },
        items: items.map((i) => ({
          supplier_sku: i.supplier_sku,
          title: i.title,
          quantity: i.quantity,
          unit_price_ex_vat: i.retail_price_ex_vat_gbp,
          unit_price_inc_vat: i.retail_price_inc_vat_gbp,
          total_ex_vat: Math.round(i.retail_price_ex_vat_gbp * i.quantity * 100) / 100,
          total_inc_vat: Math.round(i.retail_price_inc_vat_gbp * i.quantity * 100) / 100,
          is_case: i.is_case_quantity,
          units_per_outer: i.units_per_case,
        })),
        subtotal_ex_vat_gbp: summary.subtotal_ex_vat_gbp,
        subtotal_inc_vat_gbp: summary.subtotal_inc_vat_gbp,
        shipping_ex_vat_gbp: summary.shipping_ex_vat_gbp,
        shipping_inc_vat_gbp: summary.shipping_inc_vat_gbp,
        vat_amount_gbp: summary.vat_amount_gbp,
        total_inc_vat_gbp: summary.grand_total_inc_vat_gbp,
        supplier_id: items[0]?.supplier_id || 'status-uk',
        state: 'checkout_authorized',
      };

      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to authorize order');
      }

      const createdOrder = await res.json();
      const confirmedNumber = createdOrder.order_number || generatedOrderNumber;
      setCreatedOrderId(confirmedNumber);
      setIsSuccess(true);
      clearCart();
      showToast({
        title: 'Order Authorized',
        message: `Quotation order #${confirmedNumber} authorized successfully in test mode.`,
        type: 'success',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Order authorization failed';
      setCheckoutError(msg);
      showToast({
        title: 'Checkout Error',
        message: msg,
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-36 h-36 mx-auto flex items-center justify-center">
          <img
            src="/images/states/order-success.webp"
            alt="Order Authorized Successfully"
            className="w-full h-full object-contain"
          />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-tc-primary uppercase tracking-wider font-mono">
            STAGING ORDER AUTHORIZED
          </span>
          <h1 className="font-heading font-extrabold text-3xl text-tc-ink">
            Order #{createdOrderId} Received
          </h1>
          <p className="text-sm text-tc-text-secondary max-w-md mx-auto">
            Your quotation order has been authorized in staging mode. A confirmation has been logged to your account timeline.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-tc-border text-left text-xs space-y-3">
          <div className="flex justify-between border-b border-tc-border pb-2">
            <span className="text-tc-text-secondary">Customer:</span>
            <span className="font-bold text-tc-ink">{fullName} ({email})</span>
          </div>
          <div className="flex justify-between border-b border-tc-border pb-2">
            <span className="text-tc-text-secondary">Delivery Postcode:</span>
            <span className="font-mono font-bold text-tc-ink">{postcode.toUpperCase()}</span>
          </div>
          <div className="flex justify-between border-b border-tc-border pb-2">
            <span className="text-tc-text-secondary">Payment Method:</span>
            <span className="font-semibold text-tc-primary">Stripe Test Mode (pm_card_visa)</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="font-bold text-tc-ink">Total Authorized:</span>
            <span className="font-heading font-extrabold text-base text-tc-ink tabular-nums">
              £{summary.grand_total_inc_vat_gbp.toFixed(2)} inc. VAT
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" asChild>
            <Link href={`/account/orders/${createdOrderId}`}>
              Track Order State Machine →
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="font-heading font-bold text-2xl text-tc-ink">
          No items in basket to checkout
        </h1>
        <p className="text-xs text-tc-text-secondary">
          Please add products to your basket before proceeding to checkout.
        </p>
        <Button variant="primary" asChild>
          <Link href="/tools">Shop Tools</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-[calc(2rem+env(safe-area-inset-bottom,0px))]">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/basket" className="hover:text-tc-ink flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Basket</span>
        </Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Checkout</span>
      </div>

      {/* Collapsible Mobile Order Summary Accordion (< lg) */}
      <div className="lg:hidden bg-white rounded-card border border-tc-border overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
          className="w-full p-4 min-h-[48px] flex items-center justify-between text-left text-xs bg-tc-surface-soft hover:bg-tc-surface-soft/80 transition-colors"
          aria-expanded={isMobileSummaryOpen}
          aria-controls="mobile-order-summary-details"
          data-testid="checkout-mobile-summary-toggle"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-tc-primary" />
            <span className="font-bold text-tc-ink">
              {isMobileSummaryOpen ? 'Hide order summary' : 'Show order summary'}
            </span>
            <span className="text-[11px] text-tc-text-secondary font-mono">
              ({summary.total_items_count} item{summary.total_items_count === 1 ? '' : 's'})
            </span>
            {isMobileSummaryOpen ? (
              <ChevronUp className="w-4 h-4 text-tc-text-secondary" />
            ) : (
              <ChevronDown className="w-4 h-4 text-tc-text-secondary" />
            )}
          </div>
          <div className="font-heading font-extrabold text-sm text-tc-ink tabular-nums">
            £{summary.grand_total_inc_vat_gbp.toFixed(2)}
          </div>
        </button>

        {isMobileSummaryOpen && (
          <div
            id="mobile-order-summary-details"
            data-testid="checkout-mobile-summary-content"
            className="p-4 border-t border-tc-border space-y-4 animate-in slide-in-from-top-2 duration-200"
          >
            {/* Items list */}
            <div className="space-y-3 max-h-56 overflow-y-auto divide-y divide-tc-border/40">
              {items.map((i) => (
                <div key={i.product_id} className="pt-2 first:pt-0 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-10 h-10 rounded bg-tc-canvas border border-tc-border flex items-center justify-center shrink-0 p-1">
                      <img src={`/images/products/${i.supplier_sku}.png`} alt={i.title} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-tc-ink truncate text-[11px]">{i.title}</p>
                      <p className="text-[10px] text-tc-text-secondary font-mono">Qty: {i.quantity} • {i.supplier_sku}</p>
                    </div>
                  </div>
                  <span className="font-mono tabular-nums font-bold text-tc-ink shrink-0">
                    £{(i.retail_price_inc_vat_gbp * i.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cost breakdown */}
            <div className="pt-3 border-t border-tc-border space-y-1.5 text-xs text-tc-text-secondary">
              <div className="flex justify-between">
                <span>Subtotal (ex. VAT)</span>
                <span className="font-mono tabular-nums">£{summary.subtotal_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Carriage fee (ex. VAT)</span>
                <span className="font-mono tabular-nums">£{summary.shipping_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>VAT (20%)</span>
                <span className="font-mono tabular-nums">£{summary.vat_amount_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-tc-ink pt-1.5 border-t border-tc-border text-sm">
                <span>Total Due (inc. VAT)</span>
                <span className="font-mono tabular-nums">£{summary.grand_total_inc_vat_gbp.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Guest Address & Payment Form */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handlePlaceOrder} className="space-y-6">
            {/* Express 1-Tap Mobile Checkout */}
            <div className="bg-white rounded-card border border-tc-border p-4 sm:p-5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-tc-ink flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-tc-primary fill-tc-primary" />
                  Express 1-Tap Checkout
                </span>
                <span className="text-[10px] text-tc-text-secondary font-mono">Test Sandbox</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  data-testid="express-apple-pay-btn"
                  aria-label="Pay with Apple Pay"
                  onClick={() => {
                    setEmail('trade-pro@express.co.uk');
                    setFullName('Express Tradesperson');
                    setAddressLine1('1 Express Way');
                    setCity('London');
                    setPostcode('EC1A 1BB');
                    setPhone('07700 900111');
                    showToast({
                      title: 'Apple Pay Details Filled',
                      message: 'Verified mock delivery address filled for 1-tap test checkout',
                      type: 'info',
                    });
                  }}
                  className="h-12 min-h-[48px] min-h-[44px] rounded-lg bg-black text-white hover:bg-neutral-800 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="text-sm font-semibold tracking-tight">Pay</span>
                </button>
                <button
                  type="button"
                  data-testid="express-google-pay-btn"
                  aria-label="Pay with Google Pay"
                  onClick={() => {
                    setEmail('contractor@gpay.co.uk');
                    setFullName('Google Pay Contractor');
                    setAddressLine1('2 Industrial Lane');
                    setCity('Manchester');
                    setPostcode('M1 1AA');
                    setPhone('07700 900222');
                    showToast({
                      title: 'Google Pay Details Filled',
                      message: 'Verified mock delivery address filled for 1-tap test checkout',
                      type: 'info',
                    });
                  }}
                  className="h-12 min-h-[48px] min-h-[44px] rounded-lg border border-tc-border bg-white text-tc-ink hover:bg-tc-canvas active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span className="font-bold">G</span><span className="font-medium text-tc-graphite">Pay</span>
                </button>
                <button
                  type="button"
                  data-testid="express-card-pay-btn"
                  aria-label="Pay with 1-Click Card"
                  onClick={() => {
                    setEmail('trade-pro@express.co.uk');
                    setFullName('Express Tradesperson');
                    setAddressLine1('1 Express Way');
                    setCity('London');
                    setPostcode('EC1A 1BB');
                    setPhone('07700 900111');
                    showToast({
                      title: '1-Click Card Details Filled',
                      message: 'Verified mock delivery address filled for test checkout',
                      type: 'info',
                    });
                  }}
                  className="h-12 min-h-[48px] min-h-[44px] rounded-lg bg-tc-surface-soft text-tc-primary border border-tc-primary/30 hover:bg-tc-surface-soft/80 active:scale-95 transition-all text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-4 h-4 text-tc-primary" />
                  <span>1-Click Card</span>
                </button>
              </div>
            </div>

            {/* Step 1: Customer Contact */}
            <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs space-y-4">
              <h2 className="font-heading font-bold text-base text-tc-ink flex items-center gap-2">
                <User className="w-4 h-4 text-tc-primary" />
                <span>1. Customer &amp; Invoicing Details</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="checkout-email" className="block text-tc-text-secondary mb-1">Email Address *</label>
                  <input
                    id="checkout-email"
                    type="email"
                    required
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tradesperson@company.co.uk"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-fullname" className="block text-tc-text-secondary mb-1">Full Name *</label>
                  <input
                    id="checkout-fullname"
                    type="text"
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-company" className="block text-tc-text-secondary mb-1">Company / Trade Name (Optional)</label>
                  <input
                    id="checkout-company"
                    type="text"
                    autoComplete="organization"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Acme Electrical Ltd"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-phone" className="block text-tc-text-secondary mb-1">Mobile / Site Contact *</label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="07700 900077"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Shipping Address & UK Postcode Validation */}
            <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs space-y-4">
              <h2 className="font-heading font-bold text-base text-tc-ink flex items-center gap-2">
                <Truck className="w-4 h-4 text-tc-primary" />
                <span>2. UK Delivery Address</span>
              </h2>

              <div className="space-y-4 text-xs">
                <div>
                  <label htmlFor="checkout-address1" className="block text-tc-text-secondary mb-1">Address Line 1 *</label>
                  <input
                    id="checkout-address1"
                    type="text"
                    required
                    autoComplete="street-address"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="12 Commercial Way, Unit 4"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>

                <div>
                  <label htmlFor="checkout-address2" className="block text-tc-text-secondary mb-1">Address Line 2 (Optional)</label>
                  <input
                    id="checkout-address2"
                    type="text"
                    autoComplete="address-line2"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Industrial Estate"
                    className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="checkout-city" className="block text-tc-text-secondary mb-1">Town / City *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Leeds"
                      className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong text-base sm:text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                    />
                  </div>

                  <div>
                    <label htmlFor="checkout-postcode" className="block text-tc-text-secondary mb-1">UK Postcode *</label>
                    <input
                      id="checkout-postcode"
                      type="text"
                      required
                      autoComplete="postal-code"
                      autoCapitalize="characters"
                      value={postcode}
                      aria-invalid={Boolean(postcodeError)}
                      aria-describedby={postcodeError ? 'checkout-postcode-error' : undefined}
                      onChange={(e) => {
                        setPostcode(e.target.value);
                        if (postcodeError) setPostcodeError('');
                      }}
                      onBlur={handlePostcodeBlur}
                      placeholder="LS1 4DY"
                      className="w-full h-11 min-h-[44px] px-3.5 rounded-lg border border-tc-border-strong uppercase text-base sm:text-xs font-mono font-bold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                    />
                    {postcodeError && (
                      <p id="checkout-postcode-error" role="alert" aria-live="polite" className="text-[11px] text-tc-error mt-1 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {postcodeError}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Stripe Test Mode Payment */}
            <div className="bg-white rounded-card border border-tc-border p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-base text-tc-ink flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-tc-primary" />
                  <span>3. Stripe Payment (Test Mode Simulation)</span>
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-tc-action-lime text-tc-ink border border-tc-ink">
                  STAGING_ONLY
                </span>
              </div>

              <div className="p-4 rounded-xl bg-tc-surface-soft border border-[#C8D9F9] space-y-3 text-xs">
                <div className="flex items-center gap-2 text-tc-ink font-semibold">
                  <Lock className="w-4 h-4 text-tc-primary" />
                  <span>Test Card: 4242 •••• •••• 4242 (Stripe Test Elements)</span>
                </div>
                <p className="text-tc-text-secondary text-[11px] leading-relaxed">
                  Checkout operates under test sandbox authorization. Real credit cards are never charged.
                </p>
              </div>

              {checkoutError && (
                <div role="alert" className="p-3 bg-tc-surface-danger border border-[#FECDD3] rounded-lg text-xs text-tc-error">
                  <strong>Authorization Error:</strong> {checkoutError}
                </div>
              )}

              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={isSubmitting}
                className="w-full min-h-[48px] text-sm sm:text-base font-bold flex items-center justify-center gap-2 text-tc-ink"
              >
                {isSubmitting ? (
                  <span>Authorizing Supplier Order...</span>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Authorize Quotation Order (£{summary.grand_total_inc_vat_gbp.toFixed(2)})</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* Right Column: Landed Cost & Supplier Dispatch Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-card border border-tc-border p-6 shadow-sm space-y-5">
            <h2 className="font-heading font-bold text-base text-tc-ink border-b border-tc-border pb-3">
              Order Landed Cost Breakdown
            </h2>

            {/* Grouped item previews */}
            <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
              {summary.supplier_groups.map((group) => (
                <div key={group.supplier_id} className="text-xs space-y-2">
                  <div className="flex justify-between font-bold text-tc-primary border-b border-tc-border/40 pb-1">
                    <span>{group.supplier_name}</span>
                    <span className="font-mono">Carriage: £{group.carriage_fee_ex_vat_gbp.toFixed(2)}</span>
                  </div>
                  {group.items.map((i) => (
                    <div key={i.product_id} className="flex items-center justify-between text-tc-ink pl-1 gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded bg-tc-surface-soft border border-tc-border flex items-center justify-center shrink-0 p-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={`/images/products/${i.supplier_sku}.png`}
                            alt={i.title}
                            className="max-h-full max-w-full object-contain"
                            loading="lazy"
                          />
                        </div>
                        <span className="truncate max-w-[190px] text-[11px] font-medium">
                          {i.quantity}x {i.title}
                        </span>
                      </div>
                      <span className="font-mono tabular-nums text-tc-text-secondary text-xs shrink-0">
                        £{(i.retail_price_inc_vat_gbp * i.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-tc-border space-y-2 text-xs">
              <div className="flex justify-between text-tc-text-secondary">
                <span>Goods Subtotal (ex. VAT)</span>
                <span className="font-mono tabular-nums">£{summary.subtotal_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-tc-text-secondary">
                <span>Shipping Carriage (ex. VAT)</span>
                <span className="font-mono tabular-nums">£{summary.shipping_ex_vat_gbp.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-tc-text-secondary">
                <span>UK Standard VAT (20%)</span>
                <span className="font-mono tabular-nums">£{summary.vat_amount_gbp.toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-tc-border flex justify-between items-baseline">
                <span className="font-heading font-extrabold text-base text-tc-ink">
                  Total Payable
                </span>
                <span className="font-heading font-extrabold text-xl text-tc-ink tabular-nums">
                  £{summary.grand_total_inc_vat_gbp.toFixed(2)} inc. VAT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
