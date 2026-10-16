import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import { useSwipeToDismiss } from '@/hooks/use-swipe-to-dismiss';
import { DragHandle } from '@/components/ui/drag-handle';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { Header } from '@/components/storefront/header';
import { BottomNav } from '@/components/storefront/bottom-nav';
import { ProductCard } from '@/components/storefront/product-card';
import { Button, buttonVariants } from '@/components/ui/button';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

let mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => '/tools',
}));

const mockProduct: PublicProductDTO = {
  id: 'prod-touch-001',
  slug: 'dewalt-combi-drill-18v',
  title: 'DeWalt 18V XR Brushless Combi Drill',
  description: 'High performance brushless combi drill for construction and site trade.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'DeWalt',
  gtin: '5012345678902',
  supplier_sku: 'DEW-DCD796',
  supplier_id: 'sup-status-001',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 150.0,
  retail_price_ex_vat_gbp: 125.0,
  units_per_pack: 1,
  units_per_case: 4,
  case_pack_description: 'Box of 4',
  stock_quantity: 25,
  availability_status: 'in_stock',
  lead_time_days: '2 days',
  weight_grams: 1600,
  images: ['/images/products/DEW-DCD796.png'],
  specifications: { Voltage: '18V', Chuck: '13mm', Torque: '70Nm' },
  compliance_verified: true,
  image_license_verified: true,
};

describe('Milestone 1: Native Touch Gestures & Mobile Sheet Ergonomics', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    mockSearchParams = new URLSearchParams();
  });

  describe('1. useSwipeToDismiss Hook Unit Tests', () => {
    it('initializes with default offset 0, isDragging false, and spring transition', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80 })
      );

      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.style.transform).toBe('translateY(0px)');
      expect(result.current.style.transition).toContain('transform 0.25s');
    });

    it('tracks downward dragging (deltaY > 0) with no transition while dragging', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.isDragging).toBe(true);

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 150, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(50);
      expect(result.current.translateY).toBe(50);
      expect(result.current.style.transform).toBe('translateY(50px)');
      expect(result.current.style.transition).toBe('none');
    });

    it('resists upward dragging (deltaY <= 0) and sets offset to 0', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 40, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(0);
      expect(result.current.translateY).toBe(0);

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });

    it('triggers onDismiss when downward drag exceeds threshold on touchEnd', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 190, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(90);

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
      expect(result.current.offset).toBe(0);
      expect(result.current.isDragging).toBe(false);
    });

    it('resets smoothly and does not trigger onDismiss when drag is below threshold', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'down' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 135, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(35);

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).not.toHaveBeenCalled();
      expect(result.current.offset).toBe(0);
      expect(result.current.isDragging).toBe(false);
      expect(result.current.style.transform).toBe('translateY(0px)');
    });

    it('triggers onDismiss when downward flick velocity exceeds velocityThreshold', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({
          onDismiss,
          threshold: 120,
          velocityThreshold: 0.5,
          direction: 'down',
        })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      // Quick move 60px (< 120px threshold)
      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 160, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('supports direction="right" for slide-over drawers', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, direction: 'right' })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientX: 50, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientX: 160, clientY: 100 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.translateX).toBe(110);
      expect(result.current.style.transform).toBe('translateX(110px)');

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('does not track or dismiss when enabled is false', () => {
      const onDismiss = vi.fn();
      const { result } = renderHook(() =>
        useSwipeToDismiss({ onDismiss, threshold: 80, enabled: false })
      );

      act(() => {
        result.current.handleTouchStart({
          touches: [{ clientY: 100, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.isDragging).toBe(false);

      act(() => {
        result.current.handleTouchMove({
          touches: [{ clientY: 300, clientX: 50 }],
        } as unknown as React.TouchEvent);
      });

      expect(result.current.offset).toBe(0);

      act(() => {
        result.current.handleTouchEnd();
      });

      expect(onDismiss).not.toHaveBeenCalled();
    });
  });

  describe('2. DragHandle Component Unit Tests', () => {
    it('renders with accessibility attributes, role="button", and testid', () => {
      render(<DragHandle />);

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();
      expect(handle).toHaveAttribute('role', 'button');
      expect(handle).toHaveAttribute('tabIndex', '0');
      expect(handle).toHaveAttribute('aria-label', 'Drag down to dismiss sheet');
      expect(handle.className).toContain('cursor-grab');
      expect(handle.className).toContain('touch-manipulation');
    });

    it('renders custom accessible label when provided', () => {
      render(<DragHandle label="Swipe down to close compare panel" />);

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toHaveAttribute('aria-label', 'Swipe down to close compare panel');
    });

    it('renders light variant pill with Brand V3 token styling', () => {
      const { container } = render(<DragHandle variant="light" />);

      const pill = container.querySelector('span');
      expect(pill?.className).toContain('w-12');
      expect(pill?.className).toContain('h-1.5');
      expect(pill?.className).toContain('rounded-full');
      expect(pill?.className).toContain('bg-tc-border-strong/60');
    });

    it('renders dark variant pill with translucent white styling on dark headers', () => {
      const { container } = render(<DragHandle variant="dark" />);

      const pill = container.querySelector('span');
      expect(pill?.className).toContain('bg-white/40');
    });
  });

  describe('3. CompareDrawer Touch Gestures & Overscroll Containment', () => {
    function CompareOpener() {
      const { addProduct, openCompare } = useCompare();
      return (
        <button
          type="button"
          onClick={() => {
            addProduct(mockProduct);
            openCompare();
          }}
        >
          Open Compare
        </button>
      );
    }

    it('renders DragHandle with dark variant in drawer header', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareOpener />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare' }));

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();
      const pill = handle.querySelector('span');
      expect(pill?.className).toContain('bg-white/40');
    });

    it('table scroll container specifies overscroll-y-contain', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareOpener />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare' }));

      const dialog = screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i });
      const scrollContainer = dialog.querySelector('.overflow-y-auto');
      expect(scrollContainer?.className).toContain('overscroll-y-contain');
    });

    it('swiping down on DragHandle past threshold dismisses CompareDrawer', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareOpener />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare' }));
      expect(screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i })).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 210, clientX: 100 }] });
      fireEvent.touchEnd(handle);

      expect(screen.queryByRole('dialog', { name: /Side-by-Side Product Comparison/i })).not.toBeInTheDocument();
    });

    it('small downward touch (< 80px) does not dismiss CompareDrawer', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareOpener />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare' }));
      const handle = screen.getByTestId('sheet-drag-handle');

      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 130, clientX: 100 }] });
      fireEvent.touchEnd(handle);

      expect(screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i })).toBeInTheDocument();
    });
  });

  describe('4. MiniBasket Touch Gestures & Overscroll Containment', () => {
    function CartOpener() {
      const { addItem } = useCart();
      return (
        <button type="button" onClick={() => addItem(mockProduct, 1)}>
          Open Cart
        </button>
      );
    }

    it('renders DragHandle at the top of the basket drawer', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CartOpener />
            <MiniBasket />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Cart' }));

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();
    });

    it('line items container specifies overscroll-y-contain', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CartOpener />
            <MiniBasket />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Cart' }));

      const dialog = screen.getByRole('dialog', { name: /Your Basket/i });
      const lineItemsContainer = dialog.querySelector('.overflow-y-auto');
      expect(lineItemsContainer?.className).toContain('overscroll-y-contain');
    });

    it('swiping down on MiniBasket DragHandle past threshold dismisses basket', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CartOpener />
            <MiniBasket />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Cart' }));
      expect(screen.getByRole('dialog', { name: /Your Basket/i })).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 220, clientX: 100 }] });
      fireEvent.touchEnd(handle);

      expect(screen.queryByRole('dialog', { name: /Your Basket/i })).not.toBeInTheDocument();
    });
  });

  describe('5. FilterSidebar Touch Gestures & Micro-Interactions', () => {
    const mockCategories = [
      { name: 'Power Tools', slug: 'tools', count: 12 },
    ];
    const mockBrands = [{ name: 'DeWalt', count: 16 }];

    it('renders DragHandle when mobile filter drawer opens', () => {
      render(
        <FilterSidebar categories={mockCategories} brands={mockBrands} />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();
    });

    it('filter items scroll container contains overscroll-y-contain', () => {
      render(
        <FilterSidebar categories={mockCategories} brands={mockBrands} />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));

      const dialog = screen.getByRole('dialog', { name: /Filter Catalog/i });
      const scrollContainer = dialog.querySelector('.overflow-y-auto');
      expect(scrollContainer?.className).toContain('overscroll-y-contain');
    });

    it('swiping down on filter drawer DragHandle past threshold dismisses filter drawer', () => {
      render(
        <FilterSidebar categories={mockCategories} brands={mockBrands} />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      expect(screen.getByRole('dialog', { name: /Filter Catalog/i })).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 200, clientX: 100 }] });
      fireEvent.touchEnd(handle);

      expect(screen.queryByRole('dialog', { name: /Filter Catalog/i })).not.toBeInTheDocument();
    });

    it('category and brand filter buttons have active:scale-[0.98] press states', () => {
      render(
        <FilterSidebar categories={mockCategories} brands={mockBrands} />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));

      const catBtns = screen.getAllByRole('button', { name: /All Categories/i });
      expect(catBtns[0].className).toContain('active:scale-[0.98]');

      const brandBtns = screen.getAllByRole('button', { name: /All Brands/i });
      expect(brandBtns[0].className).toContain('active:scale-[0.98]');
    });
  });

  describe('6. AIAssistantDrawer Touch Gestures & Overscroll Containment', () => {
    it('renders DragHandle and overscroll-y-contain in message history', () => {
      const handleClose = vi.fn();
      render(
        <VatProvider>
          <CartProvider>
            <AIAssistantDrawer isOpen={true} onClose={handleClose} />
          </CartProvider>
        </VatProvider>
      );

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();

      const dialog = screen.getByRole('dialog', { name: /ToolCart AI Assistant/i });
      const messageContainer = dialog.querySelector('.overflow-y-auto');
      expect(messageContainer?.className).toContain('overscroll-y-contain');
    });

    it('swiping down on AIAssistantDrawer DragHandle past threshold invokes onClose', () => {
      const handleClose = vi.fn();
      render(
        <VatProvider>
          <CartProvider>
            <AIAssistantDrawer isOpen={true} onClose={handleClose} />
          </CartProvider>
        </VatProvider>
      );

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientY: 100, clientX: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 210, clientX: 100 }] });
      fireEvent.touchEnd(handle);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('7. Header Mobile Navigation Drawer Touch Gestures & Overscroll', () => {
    it('renders DragHandle with custom label in mobile navigation menu', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));

      const handle = screen.getByTestId('sheet-drag-handle');
      expect(handle).toBeInTheDocument();
      expect(handle).toHaveAttribute('aria-label', 'Drag to dismiss navigation menu');

      const menuDialog = screen.getByRole('dialog', { name: /Mobile navigation menu/i });
      expect(menuDialog.className).toContain('overscroll-y-contain');
    });

    it('swiping right past threshold dismisses mobile navigation menu', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      expect(screen.getByRole('dialog', { name: /Mobile navigation menu/i })).toBeInTheDocument();

      const handle = screen.getByTestId('sheet-drag-handle');
      fireEvent.touchStart(handle, { touches: [{ clientX: 50, clientY: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientX: 180, clientY: 100 }] });
      fireEvent.touchEnd(handle);

      expect(screen.queryByRole('dialog', { name: /Mobile navigation menu/i })).not.toBeInTheDocument();
    });
  });

  describe('8. Active Touch Micro-Interactions (active:scale-[0.98])', () => {
    it('Button base variants include active:scale-[0.98]', () => {
      const classes = buttonVariants();
      expect(classes).toContain('active:scale-[0.98]');
    });

    it('ProductCard container includes active:scale-[0.98]', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const card = container.firstChild as HTMLElement;
      expect(card.className).toContain('active:scale-[0.98]');
    });

    it('BottomNav tabs include active:scale-[0.98]', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <BottomNav />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const homeLink = screen.getByLabelText('Home');
      expect(homeLink.className).toContain('active:scale-[0.98]');

      const searchLink = screen.getByLabelText('Search and Browse Catalog');
      expect(searchLink.className).toContain('active:scale-[0.98]');

      const adviceBtn = screen.getByLabelText('Open Hardware Advice Assistant');
      expect(adviceBtn.className).toContain('active:scale-[0.98]');

      const compareBtn = screen.getByLabelText(/Open Product Compare/i);
      expect(compareBtn.className).toContain('active:scale-[0.98]');

      const basketBtn = screen.getByLabelText(/Open Basket/i);
      expect(basketBtn.className).toContain('active:scale-[0.98]');
    });
  });
});
