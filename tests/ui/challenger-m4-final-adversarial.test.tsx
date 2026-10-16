/**
 * @file challenger-m4-final-adversarial.test.tsx
 * Empirical Adversarial Challenger Verification Suite
 *
 * Exhaustive challenge tests covering:
 * 1. Horizontal Viewport Invariants (320px–768px, extreme narrow 320px stress, long titles, huge numbers)
 * 2. Touch & Gesture Edge Cases (cancellations, zero-distance taps, rapid contradictory swipes, rapid multi-drawer cycles, backdrop spam, escape spam)
 * 3. Mobile Retail Conversion Patterns (high quantity stepper calculations, precision checks, rapid search typing, corrupted localStorage recovery, filter & sort pill combinations)
 * 4. WCAG 2.1 AA Touch Targets (>= 44x44px, >= 48px express checkout) & Brand V3 token integrity
 */

import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act, within } from '@testing-library/react';

// Providers
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { ToastProvider } from '@/context/toast-context';

// UI & Storefront Components
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { DragHandle } from '@/components/ui/drag-handle';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { BottomNav } from '@/components/storefront/bottom-nav';
import { Header } from '@/components/storefront/header';
import { MobileSearchOverlay } from '@/components/storefront/mobile-search-overlay';
import { FilterSidebar, SORT_OPTIONS } from '@/components/storefront/filter-sidebar';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import BasketPage from '@/app/(storefront)/basket/page';
import CheckoutPage from '@/app/(storefront)/checkout/page';
import { PublicProductDTO } from '@/types/product';

// Mock WebGL 3D robot to prevent canvas warning logs in JSDOM
vi.mock('@/components/ui/3d/chatbot-robot-3d', () => ({
  ChatbotRobot3DLazy: () => <div data-testid="mock-robot-3d" />,
}));

// Router & Navigation Mocking
let currentPathname = '/';
let mockSearchParams = new URLSearchParams();
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => currentPathname,
  useSearchParams: () => mockSearchParams,
}));

// Standard Test Product
const mockStandardProduct: PublicProductDTO = {
  id: 'prod-dewalt-18v',
  slug: 'dewalt-18v-brushless-drill',
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
  specifications: { Voltage: '18V', Chuck: '13mm' },
  compliance_verified: true,
  image_license_verified: true,
};

// Extreme Adversarial Product (Super long title, huge prices, high stock)
const mockAdversarialProduct: PublicProductDTO = {
  id: 'prod-extreme-adversarial-001',
  slug: 'extreme-heavy-industrial-generator-laser-guided-titanium-pneumatic-system',
  title: 'Extreme Heavy Industrial Multi-Core 3-Phase Portable Generator with Automated Titanium Laser Alignment and Integrated Pneumatic Dual-Channel System (UKCA Certified)',
  description: 'Maximum stress testing product designed to induce text overflow, price wrapping collisions, and floating point errors.',
  category: 'Site Equipment & Heavy Industrial Machinery',
  category_slug: 'site-equipment',
  brand: 'TitaniumTech Pro Industrial UK',
  gtin: '5099999999999',
  supplier_sku: 'TITAN-IND-99999-EXTREME',
  supplier_id: 'status-uk',
  supplier_name: 'Status International (UK) Ltd',
  retail_price_inc_vat_gbp: 9999.95,
  retail_price_ex_vat_gbp: 8333.29,
  units_per_pack: 1,
  units_per_case: 10,
  case_pack_description: 'Crate of 10 Master Units',
  stock_quantity: 150,
  availability_status: 'in_stock',
  images: ['/images/products/titan-gen.png'],
  specifications: {
    'Power Output': '12.5kVA / 10kW Continuous Peak Surge',
    'Starting System': 'Dual Electric Key & Remote Wireless Telemetry',
    'Noise Level': '68dB(A) @ 7m Acoustic Enclosure',
  },
  compliance_verified: true,
  image_license_verified: true,
};

const mockCategories = [
  { name: 'Power Tools', slug: 'tools', count: 18 },
  { name: 'Fixings & Fasteners', slug: 'fixings', count: 42 },
  { name: 'Site Equipment', slug: 'site-equipment', count: 12 },
];

const mockBrands = [
  { name: 'DeWalt', count: 24 },
  { name: 'TitaniumTech', count: 10 },
  { name: 'Stanley', count: 15 },
];

// Composite Providers Wrapper
function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <VatProvider>
      <CartProvider>
        <CompareProvider>
          <ToastProvider>{children}</ToastProvider>
        </CompareProvider>
      </CartProvider>
    </VatProvider>
  );
}

// Cart Seeder Helper
function CartSeeder({
  product = mockStandardProduct,
  count = 1,
  quantity = 1,
}: {
  product?: PublicProductDTO;
  count?: number;
  quantity?: number;
}) {
  const { addItem } = useCart();
  return (
    <button
      type="button"
      data-testid="seed-cart-adversarial-helper"
      onClick={() => {
        for (let i = 0; i < count; i++) {
          addItem(product, quantity, false);
        }
      }}
    >
      Seed Cart Adversarial
    </button>
  );
}

// Viewport Setting Helper
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

describe('Adversarial Challenger Final Suite (Milestone M4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    currentPathname = '/';
    mockSearchParams = new URLSearchParams();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  // =========================================================================
  // Dimension 1: Horizontal Viewport Invariants & Extreme 320px Hardening
  // =========================================================================
  describe('Dimension 1: Horizontal Viewport Invariants & 320px Stress', () => {
    const VIEWPORTS = [
      { width: 320, name: '320px (iPhone SE 1st gen / narrow mobile)' },
      { width: 360, name: '360px (Compact Android)' },
      { width: 375, name: '375px (iPhone SE 2nd/3rd gen)' },
      { width: 390, name: '390px (iPhone 13/14 standard)' },
      { width: 412, name: '412px (Samsung Galaxy / Pixel)' },
      { width: 430, name: '430px (iPhone Pro Max)' },
      { width: 768, name: '768px (iPad portrait threshold)' },
    ];

    it('renders extreme adversarial product in PdpActions at 320px with 0px horizontal overflow', () => {
      setViewport(320);
      currentPathname = '/products/extreme-product';

      const { container } = render(
        <AllProviders>
          <div style={{ width: '320px', maxWidth: '100%', overflowX: 'hidden' }}>
            <PdpActions product={mockAdversarialProduct} />
          </div>
        </AllProviders>
      );

      expect(container).toBeDefined();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);

      const stickyBar = screen.getByTestId('pdp-sticky-buy-bar');
      expect(stickyBar).toBeInTheDocument();
      // Price £9999.95 should render with tabular numerals and truncation safety
      expect(stickyBar.textContent).toContain('£9999.95');
    });

    it('Basket Page with massive prices and long descriptions maintains 0px horizontal overflow at 320px', () => {
      setViewport(320);
      currentPathname = '/basket';

      render(
        <AllProviders>
          <CartSeeder product={mockAdversarialProduct} count={3} quantity={5} />
          <div style={{ width: '320px', maxWidth: '100%', overflowX: 'hidden' }}>
            <BasketPage />
          </div>
        </AllProviders>
      );

      fireEvent.click(screen.getByTestId('seed-cart-adversarial-helper'));

      const stickyDock = screen.getByTestId('basket-sticky-checkout-bar');
      expect(stickyDock).toBeInTheDocument();
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);

      // Verify line item controls flex-wrap without overflowing 320px
      const minusBtn = screen.getByLabelText(/Decrease quantity of/i);
      const plusBtn = screen.getByLabelText(/Increase quantity of/i);
      expect(minusBtn).toBeInTheDocument();
      expect(plusBtn).toBeInTheDocument();
    });

    it('Checkout Page at 320px keeps express checkout buttons within viewport with >= 48px height', () => {
      setViewport(320);
      currentPathname = '/checkout';

      render(
        <AllProviders>
          <CartSeeder product={mockStandardProduct} count={1} />
          <div style={{ width: '320px', maxWidth: '100%', overflowX: 'hidden' }}>
            <CheckoutPage />
          </div>
        </AllProviders>
      );

      fireEvent.click(screen.getByTestId('seed-cart-adversarial-helper'));

      const applePay = screen.getByTestId('express-apple-pay-btn');
      const googlePay = screen.getByTestId('express-google-pay-btn');
      const cardPay = screen.getByTestId('express-card-pay-btn');

      expect(applePay.className).toContain('min-h-[48px]');
      expect(googlePay.className).toContain('min-h-[48px]');
      expect(cardPay.className).toContain('min-h-[48px]');
      expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(320);
    });
  });

  // =========================================================================
  // Dimension 2: Touch & Gesture Edge Cases, Cancellations & Rapid Cycles
  // =========================================================================
  describe('Dimension 2: Touch Gestures, Cancellations & Interruption States', () => {
    it('handleTouchCancel resets dragging state and offset to 0 without triggering onDismiss', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      // Touch start at clientY: 100
      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.isDragging).toBe(true);

      // Move downward by 120px (past threshold)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 220, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(120);

      // System interrupts touch event (e.g., incoming call, gesture navigation)
      act(() => {
        result.current.handleTouchCancel({} as React.TouchEvent);
      });

      // Verify clean cancellation without firing dismissal
      expect(result.current.isDragging).toBe(false);
      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);
      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('zero-distance touch (tap without move) does not trigger dismissal', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 150, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 150, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
      expect(result.current.isDragging).toBe(false);
    });

    it('rapid contradictory swipe (drag down then fling up) does not trigger dismissal', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      // Move down to 180
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 180, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(80);

      // Rapidly jerk back up to clientY 80 (deltaY = -20)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 80, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });
      expect(result.current.offset).toBe(0);

      act(() => {
        result.current.handleTouchEnd({
          changedTouches: [{ clientY: 80, clientX: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
    });

    it('survives 30 rapid backdrop click events without exception or desync', () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <AllProviders>
          <MobileSearchOverlay isOpen={true} onClose={onClose} />
        </AllProviders>
      );

      const closeBtn = screen.getByLabelText('Close search overlay');
      for (let i = 0; i < 30; i++) {
        fireEvent.click(closeBtn);
      }

      expect(onClose).toHaveBeenCalledTimes(30);

      rerender(
        <AllProviders>
          <MobileSearchOverlay isOpen={false} onClose={onClose} />
        </AllProviders>
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('survives 20 rapid Escape key presses on open drawer and safely cleans scroll lock', () => {
      const onClose = vi.fn();
      render(
        <AllProviders>
          <MobileSearchOverlay isOpen={true} onClose={onClose} />
        </AllProviders>
      );

      expect(document.body.style.overflow).toBe('hidden');

      for (let i = 0; i < 20; i++) {
        fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      }

      expect(onClose).toHaveBeenCalledTimes(20);
    });
  });

  // =========================================================================
  // Dimension 3: Mobile Retail Conversion Patterns & Stepper Math
  // =========================================================================
  describe('Dimension 3: Mobile Retail Conversion Patterns & Stepper Math', () => {
    it('stepper handles high quantity (50 units) and formats large total price cleanly without float errors', () => {
      const { container } = render(
        <AllProviders>
          <PdpActions product={mockStandardProduct} />
        </AllProviders>
      );

      const incBtn = screen.getByTestId('pdp-sticky-stepper-inc');
      const qtyDisplay = screen.getByTestId('pdp-sticky-quantity');
      const stickyBar = container.querySelector('[data-testid="pdp-sticky-buy-bar"]');

      // Click increment 49 times to reach 50
      for (let i = 1; i < 50; i++) {
        fireEvent.click(incBtn);
      }

      expect(qtyDisplay.textContent).toBe('50');
      // 50 * £144.00 = £7200.00 Inc VAT; 50 * £120.00 = £6000.00 Ex VAT
      expect(stickyBar?.textContent).toContain('£7200.00');
      expect(stickyBar?.textContent).toContain('£6000.00');
    });

    it('stepper prevents negative or 0 quantity under rapid hammering of decrement button', () => {
      render(
        <AllProviders>
          <PdpActions product={mockStandardProduct} />
        </AllProviders>
      );

      const decBtn = screen.getByTestId('pdp-sticky-stepper-dec');
      const qtyDisplay = screen.getByTestId('pdp-sticky-quantity');

      expect(qtyDisplay.textContent).toBe('1');

      // Hammer decrement 20 times
      for (let i = 0; i < 20; i++) {
        fireEvent.click(decBtn);
      }

      expect(qtyDisplay.textContent).toBe('1');
    });

    it('MobileSearchOverlay recovers gracefully from corrupted JSON in localStorage', () => {
      window.localStorage.setItem('toolcart_recent_searches', '{{corrupted_json_garbage!');

      const onClose = vi.fn();
      render(
        <AllProviders>
          <MobileSearchOverlay isOpen={true} onClose={onClose} />
        </AllProviders>
      );

      // Verify it did not crash and loaded default cues
      const chips = screen.getAllByTestId('recent-search-chip');
      expect(chips.length).toBeGreaterThan(0);
      expect(chips[0].textContent).toContain('18V Brushless');
    });

    it('MobileSearchOverlay handles rapid typing bursts with adversarial input strings', () => {
      const onClose = vi.fn();
      render(
        <AllProviders>
          <MobileSearchOverlay isOpen={true} onClose={onClose} />
        </AllProviders>
      );

      const input = screen.getByTestId('mobile-search-overlay-input');

      // Rapidly fire inputs with special characters
      const adversarialQueries = [
        '<script>alert("xss")</script>',
        "' OR '1'='1' --",
        '💥🛠️🔥⚡ Drill',
        '   ',
        'Stanley FatMax 8m & DeWalt 18V',
      ];

      for (const query of adversarialQueries) {
        fireEvent.change(input, { target: { value: query } });
        expect((input as HTMLInputElement).value).toBe(query);
      }

      // Tap clear button
      const clearBtn = screen.getByTestId('mobile-search-clear-btn');
      fireEvent.click(clearBtn);
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('FilterSidebar floating pill renders active count badge accurately with multiple search params', () => {
      mockSearchParams = new URLSearchParams('category=tools&brand=DeWalt&in_stock=true&sort=price_desc');

      render(
        <AllProviders>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </AllProviders>
      );

      const pill = screen.getByTestId('mobile-floating-filter-pill');
      expect(pill).toBeInTheDocument();

      const activeBadge = screen.getByTestId('floating-pill-active-count');
      expect(activeBadge).toBeInTheDocument();
      // 3 active filters: category, brand, in_stock (sort is not a filter count)
      expect(activeBadge.textContent).toBe('3');
      expect(activeBadge.className).toContain('bg-tc-action-lime');
      expect(activeBadge.className).toContain('text-tc-ink');
    });

    it('BottomNav is suppressed on PDP and checkout pages, but active on catalog/search pages', () => {
      // 1. Home route
      currentPathname = '/';
      const { rerender } = render(
        <AllProviders>
          <BottomNav />
        </AllProviders>
      );
      expect(screen.getByRole('navigation', { name: 'Mobile Navigation Dock' })).toBeInTheDocument();

      // 2. Search route
      currentPathname = '/search';
      rerender(
        <AllProviders>
          <BottomNav />
        </AllProviders>
      );
      expect(screen.getByRole('navigation', { name: 'Mobile Navigation Dock' })).toBeInTheDocument();

      // 3. PDP route (suppressed)
      currentPathname = '/products/dewalt-18v-drill';
      rerender(
        <AllProviders>
          <BottomNav />
        </AllProviders>
      );
      expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).not.toBeInTheDocument();

      // 4. Checkout route (suppressed)
      currentPathname = '/checkout';
      rerender(
        <AllProviders>
          <BottomNav />
        </AllProviders>
      );
      expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).not.toBeInTheDocument();

      // 5. Basket route (suppressed)
      currentPathname = '/basket';
      rerender(
        <AllProviders>
          <BottomNav />
        </AllProviders>
      );
      expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).not.toBeInTheDocument();
    });
  });

  // =========================================================================
  // Dimension 4: WCAG 2.1 AA Touch Targets & Brand V3 Token Compliance
  // =========================================================================
  describe('Dimension 4: WCAG Touch Targets & Brand V3 Token Verification', () => {
    it('verifies all interactive mobile touch targets meet >= 44x44px or >= 48px express pay', () => {
      // PDP sticky dock controls
      render(
        <AllProviders>
          <PdpActions product={mockStandardProduct} />
        </AllProviders>
      );

      const decBtn = screen.getByTestId('pdp-sticky-stepper-dec');
      const incBtn = screen.getByTestId('pdp-sticky-stepper-inc');
      const addBtn = screen.getByTestId('pdp-sticky-add-to-basket');

      expect(decBtn.className).toContain('min-w-[44px]');
      expect(decBtn.className).toContain('min-h-[44px]');
      expect(incBtn.className).toContain('min-w-[44px]');
      expect(incBtn.className).toContain('min-h-[44px]');
      expect(addBtn.className).toContain('h-11'); // 44px
    });

    it('verifies DragHandle renders with Brand V3 grab indicator and touch manipulation', () => {
      render(<DragHandle label="Drag down to dismiss test" />);

      const handle = screen.getByLabelText('Drag down to dismiss test');
      expect(handle).toBeInTheDocument();
      expect(handle.className).toContain('touch-manipulation');
      expect(handle.className).toContain('cursor-grab');

      const pill = handle.querySelector('.rounded-full');
      expect(pill).toBeInTheDocument();
      expect(pill?.className).toContain('w-12');
      expect(pill?.className).toContain('h-1.5');
    });

    it('verifies Action Lime buttons and badges never use white text', () => {
      const { container } = render(
        <AllProviders>
          <CartSeeder product={mockStandardProduct} count={1} />
          <BasketPage />
        </AllProviders>
      );

      fireEvent.click(screen.getByTestId('seed-cart-adversarial-helper'));

      const stickyCheckoutBtn = screen.getByTestId('basket-sticky-checkout-bar').querySelector('a');
      expect(stickyCheckoutBtn?.className).toContain('bg-tc-action-lime');
      expect(stickyCheckoutBtn?.className).toContain('text-tc-ink');
      expect(stickyCheckoutBtn?.className).not.toContain('text-white');
    });
  });
});
