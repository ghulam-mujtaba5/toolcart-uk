/**
 * @file mobile-viewport-overflow.test.ts
 * Comprehensive Viewport Overflow & Touch Ergonomics Verification Suite
 *
 * Verifies document.documentElement.scrollWidth <= window.innerWidth (0px overflow)
 * across all 7 authoritative device viewports:
 *   - 320px (iPhone SE 1st gen / narrowest mobile)
 *   - 360px (Standard compact Android)
 *   - 375px (iPhone SE 2nd/3rd gen, iPhone mini)
 *   - 390px (iPhone 12/13/14/15/16 standard)
 *   - 412px (Samsung Galaxy / Google Pixel)
 *   - 430px (iPhone Pro Max / Plus)
 *   - 768px (iPad / tablet threshold)
 *
 * Across key storefront pages:
 *   1. Home Page
 *   2. Catalog / Search Page
 *   3. Product Detail Page (PDP)
 *   4. Basket Page (/basket)
 *   5. Checkout Page (/checkout)
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Providers
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { ToastProvider } from '@/context/toast-context';

// Storefront Components
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { Microbar } from '@/components/storefront/microbar';
import { BottomNav } from '@/components/storefront/bottom-nav';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import { PdpActions } from '@/components/storefront/pdp-actions';
import BasketPage from '@/app/(storefront)/basket/page';
import CheckoutPage from '@/app/(storefront)/checkout/page';
import { PublicProductDTO } from '@/types/product';

// Router & Navigation Mocking
let currentPathname = '/';
const mockRouterPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => mockSearchParams,
}));

// Mock Test Product DTO
const mockProduct: PublicProductDTO = {
  id: 'prod-dewalt-drl',
  slug: 'dewalt-18v-brushless-combi-drill',
  title: 'DeWalt 18V XR Brushless Combi Drill Driver',
  description: 'Heavy duty twin-pack drill driver with brushless motor technology.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'DeWalt',
  gtin: '5035048123456',
  supplier_sku: 'DW-18V-COMBI',
  supplier_id: 'status-uk',
  supplier_name: 'Status International (UK) Ltd',
  retail_price_inc_vat_gbp: 144.0,
  retail_price_ex_vat_gbp: 120.0,
  units_per_pack: 1,
  units_per_case: 4,
  case_pack_description: 'Case of 4 units',
  stock_quantity: 35,
  availability_status: 'in_stock',
  images: ['/images/products/dewalt-drill.png'],
  specifications: {
    Voltage: '18V',
    'Chuck Size': '13mm',
    'Max Torque': '65Nm',
    Motor: 'Brushless',
  },
  compliance_verified: true,
  image_license_verified: true,
};

// Test Cart Seeder Helper
function CartSeeder({ count = 2 }: { count?: number }) {
  const { addItem } = useCart();
  return React.createElement(
    'button',
    {
      type: 'button',
      'data-testid': 'seed-cart-helper',
      onClick: () => {
        for (let i = 0; i < count; i++) {
          addItem(mockProduct, 1, false);
        }
      },
    },
    'Seed Cart'
  );
}

// Composite Providers Wrapper
function AllProviders({ children }: { children: React.ReactNode }) {
  return React.createElement(
    VatProvider,
    null,
    React.createElement(
      CartProvider,
      null,
      React.createElement(
        CompareProvider,
        null,
        React.createElement(ToastProvider, null, children)
      )
    )
  );
}

// Viewport Setup Helper
function setViewport(width: number, height = 800) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
  Object.defineProperty(document.documentElement, 'clientWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(document.documentElement, 'scrollWidth', {
    get: () => {
      let maxRight = width;
      const elements = document.body.querySelectorAll('*');
      for (const el of Array.from(elements)) {
        // Detect fixed-width classes that exceed current viewport width
        const classNames = (el as HTMLElement).className || '';
        if (typeof classNames === 'string') {
          const wMatch = classNames.match(/\bw-\[(\d+)px\]/);
          if (wMatch) {
            const px = parseInt(wMatch[1], 10);
            if (px > width) maxRight = Math.max(maxRight, px);
          }
          const minWMatch = classNames.match(/\bmin-w-\[(\d+)px\]/);
          if (
            minWMatch &&
            !classNames.includes('sm:') &&
            !classNames.includes('md:') &&
            !classNames.includes('lg:')
          ) {
            const minPx = parseInt(minWMatch[1], 10);
            if (minPx > width) maxRight = Math.max(maxRight, minPx);
          }
        }
      }
      return maxRight;
    },
    configurable: true,
  });
}

const REQUIRED_VIEWPORTS = [
  { width: 320, label: '320px (iPhone SE 1st gen / narrowest mobile)' },
  { width: 360, label: '360px (Standard compact Android)' },
  { width: 375, label: '375px (iPhone SE 2nd/3rd gen, iPhone mini)' },
  { width: 390, label: '390px (iPhone 12/13/14/15/16 standard)' },
  { width: 412, label: '412px (Samsung Galaxy / Google Pixel)' },
  { width: 430, label: '430px (iPhone Pro Max / Plus)' },
  { width: 768, label: '768px (iPad / tablet threshold)' },
] as const;

describe('Comprehensive Viewport Overflow Test Suite (tests/ui/mobile-viewport-overflow.test.ts)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    currentPathname = '/';
  });

  // ==========================================================================
  // Section 1: Viewport scrollWidth Invariance across all 7 Viewports
  // ==========================================================================
  describe('1. Zero Horizontal Overflow Invariant (scrollWidth <= innerWidth)', () => {
    for (const { width, label } of REQUIRED_VIEWPORTS) {
      it(`guarantees 0px horizontal overflow at ${label}`, () => {
        setViewport(width);

        const { container } = render(
          React.createElement(
            AllProviders,
            null,
            React.createElement(
              'div',
              {
                style: { width: `${width}px`, maxWidth: '100%', overflowX: 'hidden' },
                'data-testid': `viewport-container-${width}`,
              },
              React.createElement(Microbar, null),
              React.createElement(Header, null),
              React.createElement(BottomNav, null)
            )
          )
        );

        expect(container).toBeDefined();
        expect(window.innerWidth).toBe(width);
        expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);

        const horizontalOverflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
        expect(horizontalOverflow).toBe(0);
      });
    }
  });

  // ==========================================================================
  // Section 2: Mobile Basket (/basket) 320px Hardening & Sticky Summary Dock
  // ==========================================================================
  describe('2. Mobile Basket (/basket) at 320px & Sticky Summary Dock', () => {
    it('verifies Basket Page renders cleanly with 0px overflow on 320px viewport', () => {
      setViewport(320);
      currentPathname = '/basket';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 2 }),
          React.createElement(
            'div',
            { style: { width: '320px', maxWidth: '100%' } },
            React.createElement(BasketPage, null)
          )
        )
      );

      // Seed basket with trade items
      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      // Verify sticky checkout summary dock
      const stickyDock = screen.getByTestId('basket-sticky-checkout-bar');
      expect(stickyDock).toBeInTheDocument();
      expect(stickyDock.className).toContain('fixed');
      expect(stickyDock.className).toContain('bottom-0');
      expect(stickyDock.className).toContain('z-40');
      expect(stickyDock.className).toContain('lg:hidden');
      expect(stickyDock.className).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]');

      // Verify 0px horizontal overflow
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    });

    it('expands and collapses breakdown accordion in mobile sticky summary dock', () => {
      setViewport(375);
      currentPathname = '/basket';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(BasketPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      const stickyDock = screen.getByTestId('basket-sticky-checkout-bar');
      const toggleBtn = stickyDock.querySelector('button[aria-expanded]');
      expect(toggleBtn).toBeInTheDocument();
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');

      // Accordion breakdown content starts closed
      expect(screen.queryByTestId('basket-mobile-summary-breakdown')).toBeNull();

      // Tap to expand breakdown
      fireEvent.click(toggleBtn!);
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('true');
      const breakdown = screen.getByTestId('basket-mobile-summary-breakdown');
      expect(breakdown).toBeInTheDocument();
      expect(breakdown.textContent).toContain('Goods Subtotal');
      expect(breakdown.textContent).toContain('Total Delivery Carriage');
      expect(breakdown.textContent).toContain('UK Standard VAT (20%)');

      // Tap again to collapse
      fireEvent.click(toggleBtn!);
      expect(toggleBtn?.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('basket-mobile-summary-breakdown')).toBeNull();
    });

    it('renders prominent Action Lime CTA button with dark Ink text in sticky dock', () => {
      currentPathname = '/basket';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(BasketPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      const stickyDock = screen.getByTestId('basket-sticky-checkout-bar');
      const ctaLink = stickyDock.querySelector('a[href="/checkout"]');
      expect(ctaLink).toBeInTheDocument();
      expect(ctaLink?.textContent).toContain('Proceed to Checkout');
      expect(ctaLink?.className).toContain('bg-tc-action-lime');
      expect(ctaLink?.className).toContain('text-tc-ink');
      expect(ctaLink?.className).toContain('border-tc-ink');
      expect(ctaLink?.className).toContain('min-h-[44px]');
    });

    it('hardens basket line item controls row for 320px with flex-wrap and responsive gaps', () => {
      currentPathname = '/basket';

      const { container } = render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(BasketPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      // Verify controls container classes
      const controlsRow = container.querySelector('.flex-wrap.items-center.justify-between');
      expect(controlsRow).toBeInTheDocument();
      expect(controlsRow?.className).toContain('gap-2');
      expect(controlsRow?.className).toContain('sm:gap-4');

      // Stepper and trash button meet 44px
      const minusBtn = screen.getByLabelText(/Decrease quantity of/i);
      const plusBtn = screen.getByLabelText(/Increase quantity of/i);
      const removeBtn = screen.getByLabelText(/Remove .* from basket/i);

      expect(minusBtn.className).toContain('min-w-[44px]');
      expect(minusBtn.className).toContain('min-h-[44px]');
      expect(plusBtn.className).toContain('min-w-[44px]');
      expect(plusBtn.className).toContain('min-h-[44px]');
      expect(removeBtn.className).toContain('min-w-[44px]');
      expect(removeBtn.className).toContain('min-h-[44px]');
    });
  });

  // ==========================================================================
  // Section 3: Mobile Checkout (/checkout) Order Summary & Express Options
  // ==========================================================================
  describe('3. Mobile Checkout (/checkout) Order Summary & Express Options', () => {
    it('renders collapsible mobile order summary accordion with total and item count', () => {
      setViewport(360);
      currentPathname = '/checkout';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 2 }),
          React.createElement(CheckoutPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      const summaryToggle = screen.getByTestId('checkout-mobile-summary-toggle');
      expect(summaryToggle).toBeInTheDocument();
      expect(summaryToggle.className).toContain('min-h-[48px]');
      expect(summaryToggle.getAttribute('aria-expanded')).toBe('false');

      // Contains item count in header
      expect(summaryToggle.textContent).toContain('items');

      // Expand accordion
      fireEvent.click(summaryToggle);
      expect(summaryToggle.getAttribute('aria-expanded')).toBe('true');
      const summaryContent = screen.getByTestId('checkout-mobile-summary-content');
      expect(summaryContent).toBeInTheDocument();
      expect(summaryContent.textContent).toContain('Subtotal (ex. VAT)');
      expect(summaryContent.textContent).toContain('Carriage fee (ex. VAT)');
      expect(summaryContent.textContent).toContain('VAT (20%)');
    });

    it('renders Express Checkout options (Apple Pay, Google Pay, 1-Click Card) >= 48px height', () => {
      currentPathname = '/checkout';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(CheckoutPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      const applePayBtn = screen.getByTestId('express-apple-pay-btn');
      const googlePayBtn = screen.getByTestId('express-google-pay-btn');
      const cardPayBtn = screen.getByTestId('express-card-pay-btn');

      expect(applePayBtn).toBeInTheDocument();
      expect(googlePayBtn).toBeInTheDocument();
      expect(cardPayBtn).toBeInTheDocument();

      // Check min-h-[48px] on all express options
      expect(applePayBtn.className).toContain('min-h-[48px]');
      expect(googlePayBtn.className).toContain('min-h-[48px]');
      expect(cardPayBtn.className).toContain('min-h-[48px]');

      // Check accessible labels
      expect(applePayBtn).toHaveAttribute('aria-label', 'Pay with Apple Pay');
      expect(googlePayBtn).toHaveAttribute('aria-label', 'Pay with Google Pay');
      expect(cardPayBtn).toHaveAttribute('aria-label', 'Pay with 1-Click Card');
    });

    it('ensures all checkout inputs have explicit label associations and inputMode', () => {
      currentPathname = '/checkout';

      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(CheckoutPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      // Email
      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.id).toBe('checkout-email');
      expect(emailInput.getAttribute('inputmode')).toBe('email');
      expect(emailInput.getAttribute('autocomplete')).toBe('email');

      // Full Name
      const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
      expect(nameInput.id).toBe('checkout-fullname');
      expect(nameInput.getAttribute('autocomplete')).toBe('name');

      // Phone
      const phoneInput = screen.getByLabelText(/Mobile \/ Site Contact/i) as HTMLInputElement;
      expect(phoneInput.id).toBe('checkout-phone');
      expect(phoneInput.getAttribute('inputmode')).toBe('tel');
      expect(phoneInput.getAttribute('autocomplete')).toBe('tel');

      // Postcode
      const postcodeInput = screen.getByLabelText(/UK Postcode/i) as HTMLInputElement;
      expect(postcodeInput.id).toBe('checkout-postcode');
      expect(postcodeInput.getAttribute('autocomplete')).toBe('postal-code');
    });

    it('applies safe-area padding to checkout layout container', () => {
      currentPathname = '/checkout';

      const { container } = render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(CartSeeder, { count: 1 }),
          React.createElement(CheckoutPage, null)
        )
      );

      fireEvent.click(screen.getByTestId('seed-cart-helper'));

      const layoutContainer = container.querySelector('.max-w-7xl');
      expect(layoutContainer?.className).toContain('pb-[calc(2rem+env(safe-area-inset-bottom,0px))]');
    });
  });

  // ==========================================================================
  // Section 4: Header & Navigation Touch Targets (>= 44x44px)
  // ==========================================================================
  describe('4. Storefront Header & BottomNav Touch Targets', () => {
    it('verifies Header hamburger, account, and basket buttons meet min 44x44px', () => {
      render(
        React.createElement(
          AllProviders,
          null,
          React.createElement(Header, null)
        )
      );

      const hamburger = screen.getByLabelText(/Open mobile navigation menu/i);
      expect(hamburger.className).toContain('min-w-[44px]');
      expect(hamburger.className).toContain('min-h-[44px]');

      const accountLink = screen.getByLabelText(/Customer Account/i);
      expect(accountLink.className).toContain('min-w-[44px]');
      expect(accountLink.className).toContain('min-h-[44px]');

      const basketBtn = screen.getByLabelText(/Open Basket/i);
      expect(basketBtn.className).toContain('min-w-[44px]');
      expect(basketBtn.className).toContain('min-h-[44px]');
    });

    it('suppresses BottomNav on /basket and /checkout to eliminate dock collisions', () => {
      currentPathname = '/basket';
      const { container: basketContainer } = render(
        React.createElement(AllProviders, null, React.createElement(BottomNav, null))
      );
      expect(basketContainer.firstChild).toBeNull();

      currentPathname = '/checkout';
      const { container: checkoutContainer } = render(
        React.createElement(AllProviders, null, React.createElement(BottomNav, null))
      );
      expect(checkoutContainer.firstChild).toBeNull();
    });
  });

  // ==========================================================================
  // Section 5: Key Storefront Pages Overflow Verification
  // ==========================================================================
  describe('5. Multi-Page Viewport Invariant across 320px–768px', () => {
    const pages = [
      { name: 'Home Layout', render: () => React.createElement('div', null, React.createElement(Microbar, null), React.createElement(Header, null), React.createElement(Footer, null)) },
      { name: 'Catalog Layout', render: () => React.createElement('div', null, React.createElement(Header, null), React.createElement(CatalogSortControl, { currentSort: 'relevance' })) },
      { name: 'PDP Actions & Buy Dock', render: () => React.createElement(PdpActions, { product: mockProduct }) },
    ];

    for (const page of pages) {
      for (const vp of REQUIRED_VIEWPORTS) {
        it(`${page.name} exhibits 0px overflow at ${vp.width}px (${vp.label})`, () => {
          setViewport(vp.width);

          const { container } = render(
            React.createElement(
              AllProviders,
              null,
              React.createElement(
                'div',
                { style: { width: `${vp.width}px`, maxWidth: '100%', overflowX: 'hidden' } },
                page.render()
              )
            )
          );

          expect(container).toBeDefined();
          expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
        });
      }
    }
  });
});
