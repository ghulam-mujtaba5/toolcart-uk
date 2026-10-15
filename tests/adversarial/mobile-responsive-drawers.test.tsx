import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { Header } from '@/components/storefront/header';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { Button } from '@/components/ui/button';
import { CatalogSortControl } from '@/components/storefront/catalog-sort-control';
import { ProductCard } from '@/components/storefront/product-card';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { ChronologicalAssemblyAnimation } from '@/components/storefront/chronological-assembly-animation';
import { Navigation } from '@/components/storefront/navigation';
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
    mockSearchParams = new URLSearchParams();
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

  describe('Feature 6: iOS Safari Auto-Zoom Suppression & Extended Mobile Touch Targets', () => {
    it('Header mobile search input enforces text-base sm:text-xs to prevent iOS auto-zoom, and button meets 44px minimum touch target', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const searchInput = screen.getByPlaceholderText(/Search 115 trade tools & hardware.../i);
      expect(searchInput.className).toContain('text-base');
      expect(searchInput.className).toContain('sm:text-xs');
      expect(searchInput.className).toContain('min-h-[44px]');

      // Mobile search submit button must meet 44px height and min-w-[60px]
      const form = searchInput.closest('form');
      const submitBtn = form?.querySelector('button[type="submit"]');
      expect(submitBtn?.className).toContain('min-h-[44px]');
      expect(submitBtn?.className).toContain('min-w-[60px]');
    });

    it('CatalogSortControl select element enforces 44px touch target on mobile and text-base to prevent auto-zoom', () => {
      render(<CatalogSortControl currentSort="relevance" />);

      const select = screen.getByLabelText(/Sort products/i);
      expect(select.className).toContain('min-h-[44px]');
      expect(select.className).toContain('sm:min-h-[36px]');
      expect(select.className).toContain('text-base');
      expect(select.className).toContain('sm:text-xs');
    });

    it('ProductCard compare button enforces min-h-[44px] on mobile with sm:min-h-[36px] on desktop', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const compareBtn = screen.getByRole('button', { name: new RegExp(`Add ${mockProduct.title} to compare`, 'i') });
      expect(compareBtn.className).toContain('min-h-[44px]');
      expect(compareBtn.className).toContain('sm:min-h-[36px]');
    });

    it('FilterSidebar price inputs enforce text-base sm:text-xs to prevent iOS auto-zoom', () => {
      render(
        <FilterSidebar
          categories={mockCategories}
          brands={mockBrands}
        />
      );

      const minInput = screen.getByPlaceholderText('0');
      const maxInput = screen.getByPlaceholderText('100');

      expect(minInput.className).toContain('text-base');
      expect(minInput.className).toContain('sm:text-xs');
      expect(maxInput.className).toContain('text-base');
      expect(maxInput.className).toContain('sm:text-xs');
    });

    it('AIAssistantDrawer prompt input enforces text-base sm:text-xs, Grounded badge is present, and starter chips meet min-h-[44px] sm:min-h-[36px]', () => {
      render(
        <VatProvider>
          <CartProvider>
            <AIAssistantDrawer isOpen={true} onClose={vi.fn()} />
          </CartProvider>
        </VatProvider>
      );

      // Verify Grounded badge and canonical subtitle
      expect(screen.getByText('Grounded')).toBeInTheDocument();
      expect(screen.getByText('Verified catalog tools • Zero safety hallucinations')).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/Ask about screws, tape adhesion, ladder safety/i);
      expect(input.className).toContain('text-base');
      expect(input.className).toContain('sm:text-xs');

      const starterChips = screen.getAllByRole('button', { name: /I need fixings for a shelf/i });
      expect(starterChips.length).toBeGreaterThan(0);
      expect(starterChips[0].className).toContain('min-h-[44px]');
      expect(starterChips[0].className).toContain('sm:min-h-[36px]');
    });
  });

  describe('Feature 7: Mobile Drawer Accessibility & Backdrop Semantics', () => {
    it('Header mobile menu backdrop includes aria-hidden="true"', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));
      const backdrop = container.querySelector('.bg-black\\/50');
      expect(backdrop).not.toBeNull();
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');
    });

    it('Header mobile menu Advice & Solutions links have min-h-[44px]', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));

      const projectKitsLink = screen.getByText('Project Kits').closest('a');
      const buyingGuidesLink = screen.getByText('UK Buying Guides').closest('a');
      const tradePortalLink = screen.getByText('Trade Portal').closest('a');

      expect(projectKitsLink?.className).toContain('min-h-[44px]');
      expect(buyingGuidesLink?.className).toContain('min-h-[44px]');
      expect(tradePortalLink?.className).toContain('min-h-[44px]');
    });

    it('SearchFilterChips clear all button meets min-h-[44px] sm:min-h-[36px] touch target', () => {
      mockSearchParams = new URLSearchParams('category=tools');
      render(<SearchFilterChips />);
      const clearBtn = screen.getByRole('button', { name: /Clear all/i });
      expect(clearBtn.className).toContain('min-h-[44px]');
      expect(clearBtn.className).toContain('sm:min-h-[36px]');
    });

    it('Header mobile menu renders canonical Hardware Advice banner and Get Hardware Advice trigger with 44px touch target', () => {
      const handleOpenAi = vi.fn();
      render(
        <VatProvider>
          <CartProvider>
            <Header onOpenAiAssistant={handleOpenAi} />
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));

      // Verify canonical banner copy inside mobile drawer
      const drawer = screen.getByRole('dialog', { name: /Mobile navigation menu/i });
      expect(within(drawer).getByText('Hardware Advice')).toBeInTheDocument();
      expect(within(drawer).getByText(/Need help choosing sizes, pack counts, or BS ratings\?/i)).toBeInTheDocument();

      const launchBtn = within(drawer).getByRole('button', { name: /Get Hardware Advice/i });
      expect(launchBtn).toBeInTheDocument();
      expect(launchBtn.className).toContain('min-h-[44px]');

      // Click launches finder and closes mobile menu
      fireEvent.click(launchBtn);
      expect(handleOpenAi).toHaveBeenCalledTimes(1);
    });

    it('Navigation component mobile menu renders accessible backdrop and 44px links', () => {
      const { container } = render(<Navigation />);

      fireEvent.click(screen.getByLabelText(/Open mobile navigation menu/i));

      const backdrop = container.querySelector('.bg-black\\/50');
      expect(backdrop).not.toBeNull();
      expect(backdrop).toHaveAttribute('aria-hidden', 'true');

      const drawer = screen.getByRole('dialog', { name: /Mobile navigation menu/i });
      const handToolsLink = within(drawer).getByText('Hand Tools').closest('a');
      expect(handToolsLink?.className).toContain('min-h-[44px]');
    });
  });

  describe('Feature 8: Viewport Wrap, Compare Drawer & Interactive Animation Touch Targets', () => {
    function CompareDrawerOpener() {
      const { addProduct, openCompare } = useCompare();
      return (
        <button
          type="button"
          onClick={() => {
            addProduct(mockProduct);
            openCompare();
          }}
        >
          Open Compare Test
        </button>
      );
    }

    it('CompareDrawer header adapts to mobile viewports with flex-wrap and enforces 44px touch targets', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <CompareDrawerOpener />
              <CompareDrawer />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      fireEvent.click(screen.getByRole('button', { name: 'Open Compare Test' }));

      // Compare drawer dialog is open
      const dialog = screen.getByRole('dialog', { name: /Side-by-Side Product Comparison/i });
      expect(dialog).toBeInTheDocument();

      // Header container has flex-wrap to prevent horizontal overflow on 360px screens
      const header = dialog.querySelector('.bg-tc-ink');
      expect(header?.className).toContain('flex-wrap');

      // Highlight differences button meets 44px min-h on mobile with sm:min-h-[36px] on desktop
      const highlightBtn = screen.getByRole('button', { name: /Highlight Differences/i });
      expect(highlightBtn.className).toContain('min-h-[44px]');
      expect(highlightBtn.className).toContain('sm:min-h-[36px]');

      // Close button meets 44x44px touch target
      const closeBtn = screen.getByRole('button', { name: /Close comparison drawer/i });
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');

      // Clear all button meets 44px min-h
      const clearBtn = screen.getByRole('button', { name: /Clear All/i });
      expect(clearBtn.className).toContain('min-h-[44px]');
    });

    it('ChronologicalAssemblyAnimation step scrubber and playback controls meet touch target guidelines', () => {
      render(<ChronologicalAssemblyAnimation />);

      // Play/Pause button meets 44x44px touch target
      const playPauseBtn = screen.getByRole('button', { name: /Pause walkthrough|Play walkthrough/i });
      expect(playPauseBtn.className).toContain('min-w-[44px]');
      expect(playPauseBtn.className).toContain('min-h-[44px]');

      // Restart button meets 44x44px touch target
      const restartBtn = screen.getByRole('button', { name: /Restart assembly sequence/i });
      expect(restartBtn.className).toContain('min-w-[44px]');
      expect(restartBtn.className).toContain('min-h-[44px]');

      // Step scrubber progress buttons meet min-h-[36px] touch target
      // Two buttons match "Jump to assembly step 1" — pick the numeric scrubber (min-w-[36px])
      const step1Btns = screen.getAllByRole('button', { name: /Jump to assembly step 1/i });
      const step1Btn = step1Btns.find((btn) => btn.className.includes('min-w-[36px]'));
      expect(step1Btn?.className).toContain('min-h-[36px]');

      // Scene selector buttons meet 44px on mobile
      const electricalKitBtn = screen.getByRole('button', { name: /Electrical Kit/i });
      expect(electricalKitBtn.className).toContain('min-h-[44px]');
    });
  });
});
