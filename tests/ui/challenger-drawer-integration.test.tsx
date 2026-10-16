import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { useState } from 'react';
import { render, screen, fireEvent, within, act } from '@testing-library/react';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { Header } from '@/components/storefront/header';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

// Mock WebGL 3D robot to prevent canvas warning logs in JSDOM
vi.mock('@/components/ui/3d/chatbot-robot-3d', () => ({
  ChatbotRobot3DLazy: () => <div data-testid="mock-robot-3d" />,
}));

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
  id: 'prod-challenger-001',
  slug: 'stanley-fatmax-tape-measure-8m',
  title: 'Stanley FatMax 8m Tape Measure',
  description: 'Industrial tape measure with BladeArmor coating and 4m standout.',
  category: 'Measuring Tools',
  category_slug: 'tools',
  brand: 'Stanley',
  gtin: '5012345678999',
  supplier_sku: 'STA-FM-8M',
  supplier_id: 'sup-status-001',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 24.0,
  retail_price_ex_vat_gbp: 20.0,
  units_per_pack: 1,
  units_per_case: 12,
  case_pack_description: 'Box of 12',
  stock_quantity: 80,
  availability_status: 'in_stock',
  lead_time_days: '2 days',
  weight_grams: 450,
  images: ['/images/products/STA-FM-8M.png'],
  specifications: { Length: '8m', Width: '32mm', Standout: '4m' },
  compliance_verified: true,
  image_license_verified: true,
};

const mockCategories = [
  { name: 'Power Tools', slug: 'tools', count: 15 },
  { name: 'Measuring Tools', slug: 'measuring', count: 8 },
];

const mockBrands = [
  { name: 'Stanley', count: 12 },
  { name: 'DeWalt', count: 20 },
];

// Helper trigger wrapper for CompareDrawer
function CompareDrawerTestHarness({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { addProduct, openCompare } = useCompare();
  React.useEffect(() => {
    addProduct(mockProduct);
    if (defaultOpen) {
      openCompare();
    }
  }, [addProduct, openCompare, defaultOpen]);

  return <CompareDrawer />;
}

// Helper trigger wrapper for MiniBasket
function MiniBasketTestHarness({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const { addItem } = useCart();
  React.useEffect(() => {
    if (defaultOpen) {
      addItem(mockProduct, 1);
    }
  }, [addItem, defaultOpen]);

  return <MiniBasket />;
}

// Helper trigger wrapper for AIAssistantDrawer
function AIAssistantTestHarness({ initialOpen = true }: { initialOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  return (
    <CartProvider>
      <div>
        <button type="button" onClick={() => setIsOpen(true)}>
          Open AI Drawer
        </button>
        <AIAssistantDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
      </div>
    </CartProvider>
  );
}

describe('Challenger M1.2: Adversarial Drawer Accessibility & DOM Integration', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    mockSearchParams = new URLSearchParams();
  });

  describe('Section 1: DragHandle Accessibility & DOM Semantics across all 5 drawers', () => {
    it('1.1 CompareDrawer renders DragHandle with accessible label and valid role', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareDrawerTestHarness />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label');
      expect(dragHandle.getAttribute('aria-label')).toMatch(/drag/i);
      // Valid interactive or presentation role
      const role = dragHandle.getAttribute('role');
      expect(['button', 'presentation', 'none']).toContain(role);
      expect(dragHandle).toHaveAttribute('tabIndex', '0');
    });

    it('1.2 MiniBasket renders DragHandle with accessible label and valid role', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestHarness />
          </CartProvider>
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label');
      expect(dragHandle.getAttribute('aria-label')).toMatch(/drag/i);
      const role = dragHandle.getAttribute('role');
      expect(['button', 'presentation', 'none']).toContain(role);
      expect(dragHandle).toHaveAttribute('tabIndex', '0');
    });

    it('1.3 FilterSidebar renders DragHandle with accessible label when mobile drawer is open', () => {
      render(
        <VatProvider>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      const dragHandle = screen.getByTestId('sheet-drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label');
      expect(dragHandle.getAttribute('aria-label')).toMatch(/drag/i);
      const role = dragHandle.getAttribute('role');
      expect(['button', 'presentation', 'none']).toContain(role);
    });

    it('1.4 AIAssistantDrawer renders DragHandle with accessible label and valid role', () => {
      render(
        <VatProvider>
          <AIAssistantTestHarness />
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label');
      expect(dragHandle.getAttribute('aria-label')).toMatch(/drag/i);
      const role = dragHandle.getAttribute('role');
      expect(['button', 'presentation', 'none']).toContain(role);
    });

    it('1.5 Header mobile nav menu renders DragHandle with custom descriptive accessible label', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      const dragHandle = screen.getByTestId('sheet-drag-handle');
      expect(dragHandle).toBeInTheDocument();
      expect(dragHandle).toHaveAttribute('aria-label', 'Drag to dismiss navigation menu');
      const role = dragHandle.getAttribute('role');
      expect(['button', 'presentation', 'none']).toContain(role);
    });
  });

  describe('Section 2: Internal Scroll Container Overscroll Containment (overscroll-behavior-y: contain)', () => {
    it('2.1 CompareDrawer matrix scroll container contains overscroll-y-contain', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareDrawerTestHarness />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i });
      const scrollable = dialog.querySelector('.overscroll-y-contain');
      expect(scrollable).not.toBeNull();
      expect(scrollable?.className).toContain('overflow-y-auto');
    });

    it('2.2 MiniBasket line items container contains overscroll-y-contain', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestHarness />
          </CartProvider>
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog', { name: /Your Basket/i });
      const scrollable = dialog.querySelector('.overscroll-y-contain');
      expect(scrollable).not.toBeNull();
      expect(scrollable?.className).toContain('overflow-y-auto');
    });

    it('2.3 FilterSidebar filter list container contains overscroll-y-contain', () => {
      render(
        <VatProvider>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      const dialog = screen.getByRole('dialog', { name: /Filter Catalog/i });
      const scrollable = dialog.querySelector('.overscroll-y-contain');
      expect(scrollable).not.toBeNull();
      expect(scrollable?.className).toContain('overflow-y-auto');
    });

    it('2.4 AIAssistantDrawer chat messages container contains overscroll-y-contain', () => {
      render(
        <VatProvider>
          <AIAssistantTestHarness />
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog', { name: /ToolCart AI Assistant/i });
      const scrollable = dialog.querySelector('.overscroll-y-contain');
      expect(scrollable).not.toBeNull();
      expect(scrollable?.className).toContain('overflow-y-auto');
    });

    it('2.5 Header mobile navigation drawer container contains overscroll-y-contain', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      const dialog = screen.getByRole('dialog', { name: /Mobile navigation menu/i });
      expect(dialog.className).toContain('overscroll-y-contain');
      expect(dialog.className).toContain('overflow-y-auto');
    });
  });

  describe('Section 3: WAI-ARIA Modal Dialog Semantics across all 5 drawers', () => {
    it('3.1 CompareDrawer has role="dialog", aria-modal="true", and resolvable aria-labelledby', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareDrawerTestHarness />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('compare-drawer-title');
      const titleElem = document.getElementById(labelledBy!);
      expect(titleElem).not.toBeNull();
      expect(titleElem?.textContent).toContain('Side-by-Side Product Comparison');
    });

    it('3.2 MiniBasket has role="dialog", aria-modal="true", and resolvable aria-labelledby', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestHarness />
          </CartProvider>
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('mini-basket-title');
      const titleElem = document.getElementById(labelledBy!);
      expect(titleElem).not.toBeNull();
      expect(titleElem?.textContent).toContain('Your Basket');
    });

    it('3.3 FilterSidebar has role="dialog", aria-modal="true", and resolvable aria-labelledby', () => {
      render(
        <VatProvider>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('filter-drawer-title');
      const titleElem = document.getElementById(labelledBy!);
      expect(titleElem).not.toBeNull();
      expect(titleElem?.textContent).toContain('Filter Catalog');
    });

    it('3.4 AIAssistantDrawer has role="dialog", aria-modal="true", and resolvable aria-labelledby', () => {
      render(
        <VatProvider>
          <AIAssistantTestHarness />
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      const labelledBy = dialog.getAttribute('aria-labelledby');
      expect(labelledBy).toBe('ai-assistant-title');
      const titleElem = document.getElementById(labelledBy!);
      expect(titleElem).not.toBeNull();
      expect(titleElem?.textContent).toContain('ToolCart AI Assistant');
    });

    it('3.5 Header mobile nav has role="dialog", aria-modal="true", and explicit aria-label', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Mobile navigation menu');
    });
  });

  describe('Section 4: Dismissal via Backdrop Click and Escape Key alongside Touch Swipes', () => {
    describe('4.1 CompareDrawer dismissal methods & scroll unlock', () => {
      it('dismisses via backdrop click and clears body scroll lock', () => {
        const { container } = render(
          <VatProvider>
            <CartProvider>
              <CompareProvider>
                <CompareDrawerTestHarness />
              </CompareProvider>
            </CartProvider>
          </VatProvider>
        );

        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Backdrop is the sibling with aria-hidden="true"
        const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via Escape key press and clears body scroll lock', () => {
        render(
          <VatProvider>
            <CartProvider>
              <CompareProvider>
                <CompareDrawerTestHarness />
              </CompareProvider>
            </CartProvider>
          </VatProvider>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via touch swipe down on DragHandle', () => {
        render(
          <VatProvider>
            <CartProvider>
              <CompareProvider>
                <CompareDrawerTestHarness />
              </CompareProvider>
            </CartProvider>
          </VatProvider>
        );

        const dragHandle = screen.getByTestId('sheet-drag-handle');
        fireEvent.touchStart(dragHandle, {
          touches: [{ clientX: 200, clientY: 100 }],
        });
        fireEvent.touchMove(dragHandle, {
          touches: [{ clientX: 200, clientY: 210 }], // deltaY = 110 > 80
        });
        fireEvent.touchEnd(dragHandle, {
          changedTouches: [{ clientX: 200, clientY: 210 }],
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });
    });

    describe('4.2 MiniBasket dismissal methods & scroll unlock', () => {
      it('dismisses via backdrop click and clears body scroll lock', () => {
        const { container } = render(
          <VatProvider>
            <CartProvider>
              <MiniBasketTestHarness />
            </CartProvider>
          </VatProvider>
        );

        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via Escape key press and clears body scroll lock', () => {
        render(
          <VatProvider>
            <CartProvider>
              <MiniBasketTestHarness />
            </CartProvider>
          </VatProvider>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via touch swipe down on DragHandle', () => {
        render(
          <VatProvider>
            <CartProvider>
              <MiniBasketTestHarness />
            </CartProvider>
          </VatProvider>
        );

        const dragHandle = screen.getByTestId('sheet-drag-handle');
        fireEvent.touchStart(dragHandle, {
          touches: [{ clientX: 200, clientY: 100 }],
        });
        fireEvent.touchMove(dragHandle, {
          touches: [{ clientX: 200, clientY: 200 }],
        });
        fireEvent.touchEnd(dragHandle, {
          changedTouches: [{ clientX: 200, clientY: 200 }],
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });
    });

    describe('4.3 FilterSidebar dismissal methods & scroll unlock', () => {
      it('dismisses via backdrop click and clears body scroll lock', () => {
        const { container } = render(
          <VatProvider>
            <FilterSidebar categories={mockCategories} brands={mockBrands} />
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via Escape key press and clears body scroll lock', () => {
        render(
          <VatProvider>
            <FilterSidebar categories={mockCategories} brands={mockBrands} />
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via touch swipe down on DragHandle', () => {
        render(
          <VatProvider>
            <FilterSidebar categories={mockCategories} brands={mockBrands} />
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
        const dragHandle = screen.getByTestId('sheet-drag-handle');

        fireEvent.touchStart(dragHandle, {
          touches: [{ clientX: 150, clientY: 100 }],
        });
        fireEvent.touchMove(dragHandle, {
          touches: [{ clientX: 150, clientY: 220 }],
        });
        fireEvent.touchEnd(dragHandle, {
          changedTouches: [{ clientX: 150, clientY: 220 }],
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });
    });

    describe('4.4 AIAssistantDrawer dismissal methods & scroll unlock', () => {
      it('dismisses via backdrop click and clears body scroll lock', () => {
        const { container } = render(
          <VatProvider>
            <AIAssistantTestHarness />
          </VatProvider>
        );

        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via Escape key press and clears body scroll lock', () => {
        render(
          <VatProvider>
            <AIAssistantTestHarness />
          </VatProvider>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via touch swipe down on DragHandle', () => {
        render(
          <VatProvider>
            <AIAssistantTestHarness />
          </VatProvider>
        );

        const dragHandle = screen.getByTestId('sheet-drag-handle');
        fireEvent.touchStart(dragHandle, {
          touches: [{ clientX: 200, clientY: 100 }],
        });
        fireEvent.touchMove(dragHandle, {
          touches: [{ clientX: 200, clientY: 230 }],
        });
        fireEvent.touchEnd(dragHandle, {
          changedTouches: [{ clientX: 200, clientY: 230 }],
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });
    });

    describe('4.5 Header mobile menu dismissal methods & scroll unlock', () => {
      it('dismisses via backdrop click and clears body scroll lock', () => {
        const { container } = render(
          <VatProvider>
            <CartProvider>
              <Header />
            </CartProvider>
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
        expect(document.body.style.overflow).toBe('hidden');
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
        expect(backdrop).not.toBeNull();
        fireEvent.click(backdrop!);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via Escape key press and clears body scroll lock', () => {
        render(
          <VatProvider>
            <CartProvider>
              <Header />
            </CartProvider>
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(document.body.style.overflow).toBe('hidden');

        fireEvent.keyDown(window, { key: 'Escape' });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });

      it('dismisses via touch swipe right on DragHandle (since drawer opens from right)', () => {
        render(
          <VatProvider>
            <CartProvider>
              <Header />
            </CartProvider>
          </VatProvider>
        );

        fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
        const dragHandle = screen.getByTestId('sheet-drag-handle');

        fireEvent.touchStart(dragHandle, {
          touches: [{ clientX: 200, clientY: 100 }],
        });
        fireEvent.touchMove(dragHandle, {
          touches: [{ clientX: 310, clientY: 100 }], // deltaX = 110 > 80
        });
        fireEvent.touchEnd(dragHandle, {
          changedTouches: [{ clientX: 310, clientY: 100 }],
        });

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(document.body.style.overflow).toBe('');
      });
    });
  });

  describe('Section 5: Adversarial Stress Testing & Boundary Scenarios', () => {
    it('5.1 Upward drag on bottom sheets resists displacement and does NOT dismiss', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestHarness />
          </CartProvider>
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');
      const dialog = screen.getByRole('dialog');

      // Drag upwards (clientY goes from 300 to 100 -> deltaY = -200)
      fireEvent.touchStart(dragHandle, {
        touches: [{ clientX: 200, clientY: 300 }],
      });
      fireEvent.touchMove(dragHandle, {
        touches: [{ clientX: 200, clientY: 100 }],
      });

      // Transform must stay translateY(0px) to prevent upward modal tear
      expect(dialog.style.transform).toBe('translateY(0px)');

      fireEvent.touchEnd(dragHandle, {
        changedTouches: [{ clientX: 200, clientY: 100 }],
      });

      // Dialog must remain open
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('5.2 Sub-threshold downward drag smoothly springs back without dismiss', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareDrawerTestHarness />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');
      const dialog = screen.getByRole('dialog');

      // Drag down by 30px (threshold is 80px)
      fireEvent.touchStart(dragHandle, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(dragHandle, {
        touches: [{ clientX: 200, clientY: 130 }],
      });
      expect(dialog.style.transform).toBe('translateY(30px)');

      // Release without flick
      fireEvent.touchEnd(dragHandle, {
        changedTouches: [{ clientX: 200, clientY: 130 }],
      });

      // Must reset to 0px and remain open
      expect(dialog.style.transform).toBe('translateY(0px)');
      expect(dialog.style.transition).toContain('transform 0.25s');
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('5.3 Drag gesture interrupted by immediate Escape key cleanly dismisses and unmounts', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestHarness />
          </CartProvider>
        </VatProvider>
      );

      const dragHandle = screen.getByTestId('sheet-drag-handle');

      // Start drag
      fireEvent.touchStart(dragHandle, {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      fireEvent.touchMove(dragHandle, {
        touches: [{ clientX: 200, clientY: 140 }],
      });

      // User presses Escape mid-drag
      fireEvent.keyDown(window, { key: 'Escape' });

      // Dialog unmounted and body scroll restored
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });

    it('5.4 Rapid Escape key presses when no drawer is open do not crash or corrupt document overflow', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      // Fire 10 rapid Escape key presses
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(window, { key: 'Escape' });
      }

      expect(document.body.style.overflow).toBe('');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('5.5 Sequential open and close across different drawers cleanly isolates state and scroll locks', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <Header />
              <CompareDrawerTestHarness defaultOpen={false} />
              <MiniBasketTestHarness defaultOpen={false} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      // Initially no dialog and overflow is ''
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');

      // 1. Open mobile menu
      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      expect(screen.getByRole('dialog', { name: /Mobile navigation menu/i })).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');

      // Close mobile menu via Escape
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');

      // 2. Open MiniBasket via cart toggle
      const cartToggle = screen.getByLabelText(/Open Basket/i);
      fireEvent.click(cartToggle);
      expect(screen.getByRole('dialog', { name: /Your Basket/i })).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');

      // Close MiniBasket via backdrop
      const backdrop = container.querySelector('.fixed.inset-0[aria-hidden="true"]');
      expect(backdrop).not.toBeNull();
      fireEvent.click(backdrop!);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });
  });
});
