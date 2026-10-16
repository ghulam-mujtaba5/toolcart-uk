/**
 * @file storefront-mobile-ux-feedback.test.tsx
 * Comprehensive verification suite for mobile trade/retail UX patterns,
 * tactile feedback, sticky checkout docks, express mobile payment,
 * and WCAG AA touch ergonomics on ToolCart UK.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '@/context/toast-context';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { Footer } from '@/components/storefront/footer';
import BasketPage from '@/app/(storefront)/basket/page';
import CheckoutPage from '@/app/(storefront)/checkout/page';
import { PublicProductDTO } from '@/types/product';

let mockSearchParams = new URLSearchParams();
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/tools',
}));

const mockProduct: PublicProductDTO = {
  id: 'prod-mob-001',
  slug: 'dewalt-drill-mob',
  title: 'DeWalt 18V Brushless Combi Drill',
  description: 'Pro combi drill for construction and electrical contractors.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'DeWalt',
  gtin: '5012345678901',
  supplier_sku: 'DEW-MOB-01',
  supplier_id: 'sup-status-001',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 180.0,
  retail_price_ex_vat_gbp: 150.0,
  units_per_pack: 1,
  units_per_case: 2,
  case_pack_description: 'Box of 2',
  stock_quantity: 12,
  availability_status: 'in_stock',
  lead_time_days: '1 day',
  weight_grams: 1750,
  images: ['/images/products/DEW-MOB-01.png'],
  specifications: { Voltage: '18V', Chuck: '13mm' },
  compliance_verified: true,
  image_license_verified: true,
};

// Test harness helper to seed cart items
function CartSeeder({ product, count = 1 }: { product: PublicProductDTO; count?: number }) {
  const { addItem } = useCart();
  return (
    <button
      type="button"
      data-testid="seed-cart-btn"
      onClick={() => {
        for (let i = 0; i < count; i++) {
          addItem(product, 1);
        }
      }}
    >
      Seed Cart
    </button>
  );
}

describe('Storefront Mobile E-Commerce UX & Feedback Suite', () => {
  beforeEach(() => {
    mockSearchParams = new URLSearchParams();
    vi.clearAllMocks();
  });

  // --------------------------------------------------------------------------
  // 1. Toast Notification & Tactile Feedback System
  // --------------------------------------------------------------------------
  describe('1. Global Toast Notification & Feedback System', () => {
    function ToastTriggerComponent() {
      const { showToast } = useToast();
      return (
        <div>
          <button
            type="button"
            data-testid="trigger-success-toast"
            onClick={() =>
              showToast({
                title: 'Added to Basket',
                message: 'DeWalt 18V Combi Drill added.',
                type: 'success',
                action: {
                  label: 'View Basket',
                  onClick: vi.fn(),
                },
              })
            }
          >
            Add Item
          </button>
          <button
            type="button"
            data-testid="trigger-error-toast"
            onClick={() =>
              showToast({
                title: 'Order Validation Error',
                message: 'Please check your delivery address.',
                type: 'error',
              })
            }
          >
            Trigger Error
          </button>
        </div>
      );
    }

    it('renders toast notification with title, message, and Brand V3 styling', () => {
      render(
        <ToastProvider>
          <ToastTriggerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger-success-toast'));

      expect(screen.getByText('Added to Basket')).toBeDefined();
      expect(screen.getByText('DeWalt 18V Combi Drill added.')).toBeDefined();
      expect(screen.getByText('View Basket')).toBeDefined();
    });

    it('renders toast with accessible close button satisfying 44px touch ergonomics', () => {
      render(
        <ToastProvider>
          <ToastTriggerComponent />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('trigger-success-toast'));

      const closeBtn = screen.getByLabelText('Dismiss notification');
      expect(closeBtn).toBeDefined();
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');

      // Dismissing removes the toast
      fireEvent.click(closeBtn);
      expect(screen.queryByText('Added to Basket')).toBeNull();
    });

    it('provides safe fallback when useToast is called outside of ToastProvider', () => {
      function IsolatedComponent() {
        const { showToast } = useToast();
        return (
          <button
            type="button"
            onClick={() => showToast({ title: 'Isolated test' })}
          >
            Safe Click
          </button>
        );
      }

      // Should not throw context exception
      expect(() => render(<IsolatedComponent />)).not.toThrow();
    });
  });

  // --------------------------------------------------------------------------
  // 2. Mobile Basket Sticky Checkout Dock
  // --------------------------------------------------------------------------
  describe('2. Mobile Basket Sticky Checkout Dock (/basket)', () => {
    it('renders basket-sticky-checkout-bar on handheld viewports when basket has items', () => {
      render(
        <VatProvider>
          <CartProvider>
            <ToastProvider>
              <CartSeeder product={mockProduct} count={2} />
              <BasketPage />
            </ToastProvider>
          </CartProvider>
        </VatProvider>
      );

      // Seed basket
      fireEvent.click(screen.getByTestId('seed-cart-btn'));

      // Sticky checkout dock should be visible
      const stickyDock = screen.getByTestId('basket-sticky-checkout-bar');
      expect(stickyDock).toBeDefined();
      expect(stickyDock.className).toContain('fixed');
      expect(stickyDock.className).toContain('lg:hidden');

      // Check grand total display
      expect(stickyDock.textContent).toContain('Grand Total');
      expect(stickyDock.textContent).toContain('Checkout');

      // Verify checkout button touch ergonomics
      const checkoutLink = stickyDock.querySelector('a');
      expect(checkoutLink?.getAttribute('href')).toBe('/checkout');
      expect(checkoutLink?.className).toContain('min-h-[44px]');
    });
  });

  // --------------------------------------------------------------------------
  // 3. Mobile Checkout Collapsible Summary & Express 1-Tap
  // --------------------------------------------------------------------------
  describe('3. Mobile Checkout Accordion & Express 1-Tap (/checkout)', () => {
    it('renders collapsible order summary accordion with aria-expanded toggle on mobile', () => {
      render(
        <VatProvider>
          <CartProvider>
            <ToastProvider>
              <CartSeeder product={mockProduct} count={1} />
              <CheckoutPage />
            </ToastProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByTestId('seed-cart-btn'));

      const summaryToggle = screen.getByTestId('checkout-mobile-summary-toggle');
      expect(summaryToggle).toBeDefined();
      expect(summaryToggle.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('checkout-mobile-summary-content')).toBeNull();

      // Tap accordion to expand
      fireEvent.click(summaryToggle);
      expect(summaryToggle.getAttribute('aria-expanded')).toBe('true');
      expect(screen.getByTestId('checkout-mobile-summary-content')).toBeDefined();

      // Tap again to collapse
      fireEvent.click(summaryToggle);
      expect(summaryToggle.getAttribute('aria-expanded')).toBe('false');
      expect(screen.queryByTestId('checkout-mobile-summary-content')).toBeNull();
    });

    it('renders 1-tap express checkout simulation buttons (Apple Pay & Google Pay)', () => {
      render(
        <VatProvider>
          <CartProvider>
            <ToastProvider>
              <CartSeeder product={mockProduct} count={1} />
              <CheckoutPage />
            </ToastProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByTestId('seed-cart-btn'));

      const applePayBtn = screen.getByTestId('express-apple-pay-btn');
      const googlePayBtn = screen.getByTestId('express-google-pay-btn');

      expect(applePayBtn).toBeDefined();
      expect(googlePayBtn).toBeDefined();
      expect(applePayBtn.className).toContain('min-h-[44px]');
      expect(googlePayBtn.className).toContain('min-h-[44px]');

      // Click Apple Pay to simulate express wallet autofill
      fireEvent.click(applePayBtn);

      // Verify guest fields got populated
      const emailInput = screen.getByLabelText(/Email Address/i) as HTMLInputElement;
      expect(emailInput.value).toBe('trade-pro@express.co.uk');

      const nameInput = screen.getByLabelText(/Full Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Express Tradesperson');
    });
  });

  // --------------------------------------------------------------------------
  // 4. Catalog Mobile Floating Filter & Sort Pill
  // --------------------------------------------------------------------------
  describe('4. Catalog Mobile Floating Filter Pill', () => {
    it('renders floating filter pill and opens mobile drawer on tap', () => {
      const categories = [{ name: 'Power Tools', slug: 'tools', count: 12 }];
      const brands = [{ name: 'DeWalt', count: 12 }];

      render(
        <VatProvider>
          <FilterSidebar categories={categories} brands={brands} />
        </VatProvider>
      );

      const floatingPill = screen.getByTestId('mobile-floating-filter-pill');
      expect(floatingPill).toBeDefined();
      expect(floatingPill.className).toContain('fixed');
      expect(floatingPill.className).toContain('lg:hidden');

      const filterBtn = screen.getByTestId('floating-pill-filter-btn');
      expect(filterBtn.className).toContain('min-h-[44px]');

      // Open drawer via pill
      fireEvent.click(filterBtn);

      // Mobile drawer should be rendered
      expect(screen.getByTestId('mobile-filter-drawer')).toBeDefined();
      expect(screen.getByTestId('mobile-drawer-sort-section')).toBeDefined();
    });
  });

  // --------------------------------------------------------------------------
  // 5. Mobile Adaptive Footer & Accordions
  // --------------------------------------------------------------------------
  describe('5. Mobile Adaptive Footer & Accordions', () => {
    it('renders Back to Top button with smooth scroll on tap', () => {
      const scrollToSpy = vi.fn();
      window.scrollTo = scrollToSpy;

      render(
        <VatProvider>
          <Footer />
        </VatProvider>
      );

      const backToTopBtn = screen.getByTestId('footer-back-to-top-btn');
      expect(backToTopBtn).toBeDefined();
      expect(backToTopBtn.className).toContain('min-h-[44px]');

      fireEvent.click(backToTopBtn);
      expect(scrollToSpy).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
    });

    it('renders collapsible accordion toggles for mobile with aria-expanded', () => {
      render(
        <VatProvider>
          <Footer />
        </VatProvider>
      );

      const catalogToggle = screen.getByTestId('footer-accordion-toggle-catalog');
      expect(catalogToggle).toBeDefined();
      expect(catalogToggle.getAttribute('aria-expanded')).toBe('false');

      // Expand catalog accordion
      fireEvent.click(catalogToggle);
      expect(catalogToggle.getAttribute('aria-expanded')).toBe('true');

      // Collapse catalog accordion
      fireEvent.click(catalogToggle);
      expect(catalogToggle.getAttribute('aria-expanded')).toBe('false');
    });

    it('guarantees safe-area bottom padding to prevent BottomNav occlusion', () => {
      const { container } = render(
        <VatProvider>
          <Footer />
        </VatProvider>
      );

      const footer = container.querySelector('footer');
      expect(footer).toBeDefined();
      expect(footer?.className).toContain('pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))]');
    });
  });

  describe('6. Mobile Category Navigation Bar (NavBar)', () => {
    it('renders all 8 trade categories with min-h-[44px] touch targets', async () => {
      const { NavBar } = await import('@/components/storefront/nav-bar');
      const { container } = render(<NavBar />);

      const categories = [
        'Hand Tools',
        'Fixings & Security',
        'Decorating',
        'Measuring',
        'Workwear & Safety',
        'Site Equipment',
        'Project Kits',
        'Buying Guides',
      ];

      for (const cat of categories) {
        const link = screen.getByText(cat);
        expect(link).toBeInTheDocument();
        const anchor = link.closest('a');
        expect(anchor).toBeDefined();
        expect(anchor?.className).toContain('min-h-[44px]');
      }

      const scrollContainer = container.querySelector('[data-testid="navbar-scroll-container"]');
      expect(scrollContainer).toBeDefined();
      expect(scrollContainer?.className).toContain('overflow-x-auto');
      expect(scrollContainer?.className).toContain('touch-pan-x');
      expect(scrollContainer?.className).toContain('overscroll-x-contain');
      expect(scrollContainer?.className).toContain('snap-x');
    });

    it('marks current route as aria-current="page" with Action Lime indicator', async () => {
      const { NavBar } = await import('@/components/storefront/nav-bar');
      const { container } = render(<NavBar />);

      // mockPathname is '/tools'
      const handToolsLink = screen.getByText('Hand Tools').closest('a');
      expect(handToolsLink).toBeDefined();
      expect(handToolsLink?.getAttribute('aria-current')).toBe('page');
      expect(handToolsLink?.className).toContain('ring-tc-action-lime');

      // Non-active links do not have aria-current
      const fixingsLink = screen.getByText('Fixings & Security').closest('a');
      expect(fixingsLink?.getAttribute('aria-current')).toBeNull();
    });

    it('supports horizontal scrollBy stepping', async () => {
      const { NavBar } = await import('@/components/storefront/nav-bar');
      const { container } = render(<NavBar />);

      const scrollContainer = container.querySelector('[data-testid="navbar-scroll-container"]') as HTMLElement;
      expect(scrollContainer).toBeDefined();

      const scrollBySpy = vi.fn();
      scrollContainer.scrollBy = scrollBySpy;

      // Mock scroll boundaries so right button renders
      Object.defineProperty(scrollContainer, 'scrollWidth', { value: 1000, configurable: true });
      Object.defineProperty(scrollContainer, 'clientWidth', { value: 390, configurable: true });
      Object.defineProperty(scrollContainer, 'scrollLeft', { value: 0, configurable: true });

      // Trigger scroll event to update indicators
      fireEvent.scroll(scrollContainer);

      const rightBtn = screen.getByTestId('navbar-scroll-right-btn');
      expect(rightBtn).toBeInTheDocument();
      fireEvent.click(rightBtn);
      expect(scrollBySpy).toHaveBeenCalledWith({ left: 220, behavior: 'smooth' });
    });
  });
});
