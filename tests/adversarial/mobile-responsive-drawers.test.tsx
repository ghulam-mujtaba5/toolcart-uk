import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { Header } from '@/components/storefront/header';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { Button } from '@/components/ui/button';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/tools',
}));

const mockCategories = [
  { name: 'Power Tools', slug: 'tools', count: 12 },
  { name: 'Fixings & Fasteners', slug: 'fixings', count: 24 },
];

const mockBrands = [
  { name: 'Erbauer', count: 8 },
  { name: 'DeWalt', count: 16 },
];

const mockProduct: PublicProductDTO = {
  id: 'prod-test-mobile-001',
  slug: 'erbauer-cordless-drill-18v',
  title: 'Erbauer 18V Brushless Combi Drill',
  description: 'Heavy duty combi drill for trade use.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'Erbauer',
  gtin: '5012345678901',
  supplier_sku: 'ERB-DRL-18V',
  supplier_id: 'sup-status-001',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 120.0,
  retail_price_ex_vat_gbp: 100.0,
  units_per_pack: 1,
  units_per_case: 5,
  case_pack_description: 'Box of 5',
  stock_quantity: 42,
  availability_status: 'in_stock',
  lead_time_days: '2 days',
  weight_grams: 1800,
  images: ['/images/products/ERB-DRL-18V.png'],
  specifications: { Voltage: '18V', Chuck: '13mm' },
  compliance_verified: true,
  image_license_verified: true,
};

describe('Adversarial Suite: Mobile-Responsive Drawers & Touch Target Ergonomics', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
  });

  describe('Feature 1: FilterSidebar Mobile Drawer & Touch Targets', () => {
    it('renders mobile filter trigger with 44px minimum touch target', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      const filterTrigger = screen.getByLabelText(/Open search filter drawer/i);
      expect(filterTrigger).toBeInTheDocument();
      expect(filterTrigger.className).toContain('min-h-[44px]');
      expect(filterTrigger.closest('.lg\\:hidden')).not.toBeNull();
    });

    it('opens mobile filter dialog drawer on trigger click with aria-modal and dialog semantics', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      const filterTrigger = screen.getByLabelText(/Open search filter drawer/i);
      fireEvent.click(filterTrigger);

      const dialog = screen.getByRole('dialog', { name: /Filter Catalog/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('closes mobile filter drawer on close button click and restores scroll', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      const closeBtn = screen.getByLabelText(/Close filter drawer/i);
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');

      fireEvent.click(closeBtn);
      expect(screen.queryByRole('dialog', { name: /Filter Catalog/i })).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });

    it('closes mobile filter drawer on Escape key press', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      expect(screen.getByRole('dialog', { name: /Filter Catalog/i })).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(screen.queryByRole('dialog', { name: /Filter Catalog/i })).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });

    it('mobile drawer footer contains safe-area inset and 44px action buttons', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      fireEvent.click(screen.getByLabelText(/Open search filter drawer/i));
      const applyBtn = screen.getByRole('button', { name: /Apply & View/i });

      expect(applyBtn.className).toContain('min-h-[44px]');
      expect(applyBtn.parentElement?.className).toContain('pb-[calc(1.25rem+env(safe-area-inset-bottom))]');
    });

    it('desktop aside layout has hidden lg:block class', () => {
      const { container } = render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      const desktopAside = container.querySelector('aside.hidden.lg\\:block');
      expect(desktopAside).not.toBeNull();
    });
  });

  describe('Feature 2: PDP Sticky Mobile Buy Bar & Ergonomics', () => {
    it('renders sticky buy bar with fixed bottom positioning and safe area insets', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <PdpActions product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const stickyBar = container.querySelector('[data-testid="pdp-sticky-buy-bar"]');
      expect(stickyBar).not.toBeNull();
      expect(stickyBar?.className).toContain('fixed');
      expect(stickyBar?.className).toContain('bottom-0');
      expect(stickyBar?.className).toContain('lg:hidden');
      expect(stickyBar?.className).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom))]');
    });

    it('PDP stepper buttons and compare button have 44px touch targets', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <PdpActions product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const decBtn = screen.getByLabelText('Decrease quantity');
      const incBtn = screen.getByLabelText('Increase quantity');

      expect(decBtn.className).toContain('min-w-[44px]');
      expect(decBtn.className).toContain('h-full');
      expect(incBtn.className).toContain('min-w-[44px]');
      expect(incBtn.className).toContain('h-full');

      const compareBtn = screen.getByRole('button', { name: /Add to Compare/i });
      expect(compareBtn.className).toContain('min-h-[44px]');
    });
  });

  describe('Feature 3: Header Mobile Menu Dialog & Touch Targets', () => {
    it('mobile hamburger button meets 44px touch target requirement', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const hamburger = screen.getByLabelText(/Open mobile navigation menu/i);
      expect(hamburger.className).toContain('min-w-[44px]');
      expect(hamburger.className).toContain('min-h-[44px]');
    });

    it('opening mobile menu locks body scroll and handles Escape key', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const hamburger = screen.getByLabelText(/Open mobile navigation menu/i);
      fireEvent.click(hamburger);

      const menuDialog = screen.getByRole('dialog', { name: /Mobile navigation menu/i });
      expect(menuDialog).toBeInTheDocument();
      expect(document.body.style.overflow).toBe('hidden');

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog', { name: /Mobile navigation menu/i })).not.toBeInTheDocument();
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Feature 4: MiniBasket Drawer Touch Targets & Safe Area', () => {
    function MiniBasketTestWrapper() {
      const { addItem } = useCart();
      return (
        <div>
          <button
            type="button"
            onClick={() => addItem(mockProduct, 2)}
          >
            Add To Cart Trigger
          </button>
          <MiniBasket />
        </div>
      );
    }

    it('mini basket drawer close button meets 44x44px touch target', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestWrapper />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add To Cart Trigger' }));

      const closeBtn = screen.getByRole('button', { name: /Close basket drawer/i });
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');
    });

    it('mini basket quantity steppers meet 44x44px touch target', () => {
      render(
        <VatProvider>
          <CartProvider>
            <MiniBasketTestWrapper />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Add To Cart Trigger' }));

      const minusBtn = screen.getByLabelText('Decrease quantity');
      const plusBtn = screen.getByLabelText('Increase quantity');

      expect(minusBtn.className).toContain('min-w-[44px]');
      expect(minusBtn.className).toContain('h-full');
      expect(plusBtn.className).toContain('min-w-[44px]');
      expect(plusBtn.className).toContain('h-full');
    });
  });

  describe('Feature 5: UI Button Primitive Touch Targets', () => {
    it('Button size="sm" enforces min-h-[44px] on mobile with sm:min-h-[36px] on desktop', () => {
      const { container } = render(
        <Button size="sm">Small Action</Button>
      );
      const btn = container.querySelector('button');
      expect(btn?.className).toContain('min-h-[44px]');
      expect(btn?.className).toContain('sm:min-h-[36px]');
    });

    it('Button size="default" enforces min-h-[44px]', () => {
      const { container } = render(
        <Button size="default">Default Action</Button>
      );
      const btn = container.querySelector('button');
      expect(btn?.className).toContain('min-h-[44px]');
    });
  });
});
