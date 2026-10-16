import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { BottomNav } from '@/components/storefront/bottom-nav';
import { Header } from '@/components/storefront/header';
import { MobileSearchOverlay } from '@/components/storefront/mobile-search-overlay';
import { FilterSidebar, SORT_OPTIONS } from '@/components/storefront/filter-sidebar';
import { VatProvider } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

let mockPathname = '/';
let mockSearchParams = new URLSearchParams();
const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
  usePathname: () => mockPathname,
}));

const mockProduct: PublicProductDTO = {
  id: 'prod-dewalt-18v-drill',
  slug: 'dewalt-18v-brushless-drill',
  title: 'DeWalt 18V XR Brushless Combi Drill',
  description: 'High performance brushless hammer drill driver for professional tradespeople.',
  category: 'Power Tools',
  category_slug: 'tools',
  brand: 'DeWalt',
  supplier_sku: 'DW-18V-XR-01',
  supplier_id: 'dewalt-uk',
  supplier_name: 'DeWalt UK',
  gtin: '5035048123456',
  units_per_pack: 1,
  units_per_case: 4,
  case_pack_description: 'Box of 4 drills',
  specifications: {},
  compliance_verified: true,
  image_license_verified: true,
  retail_price_inc_vat_gbp: 144.0,
  retail_price_ex_vat_gbp: 120.0,
  availability_status: 'in_stock',
  stock_quantity: 25,
  images: ['/images/products/dewalt-drill.webp'],
};

const mockOutOfStockProduct: PublicProductDTO = {
  ...mockProduct,
  id: 'prod-out-of-stock-01',
  slug: 'out-of-stock-tool',
  title: 'Out of Stock SDS Drill',
  availability_status: 'out_of_stock',
  stock_quantity: 0,
};

const mockCategories = [
  { name: 'Power Tools', slug: 'tools', count: 18 },
  { name: 'Fixings & Fasteners', slug: 'fixings', count: 42 },
  { name: 'Painting & Decorating', slug: 'decorating', count: 15 },
];

const mockBrands = [
  { name: 'DeWalt', count: 24 },
  { name: 'Erbauer', count: 12 },
  { name: 'Makita', count: 19 },
];

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <VatProvider>
      <CartProvider>
        <CompareProvider>{ui}</CompareProvider>
      </CartProvider>
    </VatProvider>
  );
}

describe('Milestone 2: Specialized Mobile E-Commerce UX Patterns', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = '/';
    mockSearchParams = new URLSearchParams();
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
      document.body.style.overflow = '';
    }
  });

  describe('1. Sticky PDP Action Dock (pdp-actions.tsx)', () => {
    it('renders sticky buy bar with fixed bottom positioning, z-40, and safe-area padding', () => {
      const { container } = renderWithProviders(<PdpActions product={mockProduct} />);

      const stickyBar = container.querySelector('[data-testid="pdp-sticky-buy-bar"]');
      expect(stickyBar).not.toBeNull();
      expect(stickyBar?.className).toContain('fixed');
      expect(stickyBar?.className).toContain('bottom-0');
      expect(stickyBar?.className).toContain('lg:hidden');
      expect(stickyBar?.className).toContain('z-40');
      expect(stickyBar?.className).toContain('pb-[calc(0.75rem+env(safe-area-inset-bottom))]');
    });

    it('displays active price (Inc. VAT and Ex. VAT) honoring global pricing state', () => {
      const { container } = renderWithProviders(<PdpActions product={mockProduct} />);
      const stickyBar = container.querySelector('[data-testid="pdp-sticky-buy-bar"]');
      expect(stickyBar).not.toBeNull();

      // Primary inc-VAT price: £144.00, secondary ex-VAT price: £120.00
      expect(stickyBar?.textContent).toContain('£144.00');
      expect(stickyBar?.textContent).toContain('£120.00');
    });

    it('features an inline quantity stepper with minimum 44x44px touch targets', () => {
      renderWithProviders(<PdpActions product={mockProduct} />);

      const decBtn = screen.getByTestId('pdp-sticky-stepper-dec');
      const incBtn = screen.getByTestId('pdp-sticky-stepper-inc');
      const qtyDisplay = screen.getByTestId('pdp-sticky-quantity');

      expect(decBtn).toBeInTheDocument();
      expect(incBtn).toBeInTheDocument();
      expect(decBtn.className).toContain('min-w-[44px]');
      expect(decBtn.className).toContain('min-h-[44px]');
      expect(incBtn.className).toContain('min-w-[44px]');
      expect(incBtn.className).toContain('min-h-[44px]');
      expect(qtyDisplay.textContent).toBe('1');
    });

    it('stepper increments and decrements quantity and updates displayed price', () => {
      const { container } = renderWithProviders(<PdpActions product={mockProduct} />);

      const incBtn = screen.getByTestId('pdp-sticky-stepper-inc');
      const decBtn = screen.getByTestId('pdp-sticky-stepper-dec');
      const qtyDisplay = screen.getByTestId('pdp-sticky-quantity');
      const stickyBar = container.querySelector('[data-testid="pdp-sticky-buy-bar"]');

      // Increment to 2
      fireEvent.click(incBtn);
      expect(qtyDisplay.textContent).toBe('2');
      // 144 * 2 = 288.00
      expect(stickyBar?.textContent).toContain('£288.00');

      // Increment to 3
      fireEvent.click(incBtn);
      expect(qtyDisplay.textContent).toBe('3');
      expect(stickyBar?.textContent).toContain('£432.00');

      // Decrement back to 2
      fireEvent.click(decBtn);
      expect(qtyDisplay.textContent).toBe('2');
      expect(stickyBar?.textContent).toContain('£288.00');

      // Decrement to 1 (lower bound check)
      fireEvent.click(decBtn);
      expect(qtyDisplay.textContent).toBe('1');
      fireEvent.click(decBtn);
      expect(qtyDisplay.textContent).toBe('1');
    });

    it('prominent 1-tap "Add to Basket" button triggers cart addition and Brand V3 Action Lime snap state', async () => {
      renderWithProviders(<PdpActions product={mockProduct} />);

      const addBtn = screen.getByTestId('pdp-sticky-add-to-basket');
      expect(addBtn).toBeInTheDocument();
      expect(addBtn.className).toContain('h-11');
      expect(addBtn.className).toContain('bg-tc-primary');
      expect(addBtn.textContent).toContain('Add to Basket');

      // 1-Tap Click
      fireEvent.click(addBtn);

      // Snap state triggers with Brand V3 Action Lime and dark Ink text
      expect(addBtn.className).toContain('bg-tc-action-lime');
      expect(addBtn.className).toContain('text-tc-ink');
      expect(addBtn.textContent).toContain('Added!');
    });

    it('disables "Add to Basket" button when product is out of stock', () => {
      renderWithProviders(<PdpActions product={mockOutOfStockProduct} />);

      const addBtn = screen.getByTestId('pdp-sticky-add-to-basket');
      expect(addBtn).toBeDisabled();
      expect(addBtn.textContent).toContain('Out of Stock');
      expect(addBtn.className).toContain('cursor-not-allowed');
    });
  });

  describe('2. BottomNav Route Suppression (bottom-nav.tsx)', () => {
    it('renders BottomNav on standard routes (/ and /search)', () => {
      mockPathname = '/';
      const { rerender } = renderWithProviders(<BottomNav />);
      expect(screen.getByRole('navigation', { name: 'Mobile Navigation Dock' })).toBeInTheDocument();

      mockPathname = '/search';
      rerender(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <BottomNav />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );
      expect(screen.getByRole('navigation', { name: 'Mobile Navigation Dock' })).toBeInTheDocument();
    });

    it('suppresses BottomNav on PDP routes (/products/[slug]) to prevent collision with sticky dock', () => {
      mockPathname = '/products/dewalt-18v-brushless-drill';
      const { container } = renderWithProviders(<BottomNav />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).not.toBeInTheDocument();
    });

    it('suppresses BottomNav on checkout route (/checkout) so checkout action bar is unobstructed', () => {
      mockPathname = '/checkout';
      const { container } = renderWithProviders(<BottomNav />);
      expect(container.firstChild).toBeNull();
      expect(screen.queryByRole('navigation', { name: 'Mobile Navigation Dock' })).not.toBeInTheDocument();
    });
  });

  describe('3. Mobile Search Overlay (mobile-search-overlay.tsx & header.tsx)', () => {
    it('opens MobileSearchOverlay when mobile search input is tapped/focused in Header', () => {
      renderWithProviders(<Header />);

      const mobileInput = screen.getAllByPlaceholderText(/Search 115 trade tools & hardware.../i)[0];
      fireEvent.focus(mobileInput);

      const overlay = screen.getByRole('dialog', { name: 'Search Catalog' });
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveAttribute('aria-modal', 'true');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('provides clear button (X) when query is typed, and clears input on tap', () => {
      renderWithProviders(<MobileSearchOverlay isOpen={true} onClose={vi.fn()} />);

      const input = screen.getByTestId('mobile-search-overlay-input');
      expect(screen.queryByTestId('mobile-search-clear-btn')).not.toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Combi Drill' } });
      expect((input as HTMLInputElement).value).toBe('Combi Drill');

      const clearBtn = screen.getByTestId('mobile-search-clear-btn');
      expect(clearBtn).toBeInTheDocument();

      fireEvent.click(clearBtn);
      expect((input as HTMLInputElement).value).toBe('');
    });

    it('renders 6 Brand V3 quick category chips with 44px+ touch targets and navigates on tap', () => {
      const handleClose = vi.fn();
      renderWithProviders(<MobileSearchOverlay isOpen={true} onClose={handleClose} />);

      const categoryTags = screen.getAllByTestId('quick-category-tag');
      expect(categoryTags.length).toBe(6);

      // Check expected category chips
      const tagLabels = categoryTags.map((t) => t.textContent);
      expect(tagLabels.some((l) => l?.includes('Hand Tools'))).toBe(true);
      expect(tagLabels.some((l) => l?.includes('Fixings & Screws'))).toBe(true);
      expect(tagLabels.some((l) => l?.includes('Painting & Decorating'))).toBe(true);
      expect(tagLabels.some((l) => l?.includes('Measuring & Levels'))).toBe(true);
      expect(tagLabels.some((l) => l?.includes('Workwear & PPE'))).toBe(true);
      expect(tagLabels.some((l) => l?.includes('Site Equipment'))).toBe(true);

      // Click first category chip
      fireEvent.click(categoryTags[0]);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/tools');
    });

    it('loads and displays recent search cues from localStorage and clears them on request', () => {
      window.localStorage.setItem(
        'toolcart_recent_searches',
        JSON.stringify(['Masonry Drill', 'Insulation Tape', 'VDE Pliers'])
      );

      const handleClose = vi.fn();
      renderWithProviders(<MobileSearchOverlay isOpen={true} onClose={handleClose} />);

      const recentChips = screen.getAllByTestId('recent-search-chip');
      expect(recentChips.length).toBe(3);
      expect(recentChips[0].textContent).toContain('Masonry Drill');

      // Tapping a recent search chip triggers search navigation
      fireEvent.click(recentChips[0]);
      expect(handleClose).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith('/search?q=Masonry%20Drill');

      // Clear history button
      const clearHistoryBtn = screen.getByRole('button', { name: /Clear recent searches history/i });
      fireEvent.click(clearHistoryBtn);
      expect(screen.queryAllByTestId('recent-search-chip').length).toBe(0);
      expect(window.localStorage.getItem('toolcart_recent_searches')).toBeNull();
    });

    it('closes mobile search overlay on Escape key press and restores body scroll', () => {
      const handleClose = vi.fn();
      const { rerender } = renderWithProviders(
        <MobileSearchOverlay isOpen={true} onClose={handleClose} />
      );

      expect(document.body.style.overflow).toBe('hidden');
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);

      rerender(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <MobileSearchOverlay isOpen={false} onClose={handleClose} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );
      expect(document.body.style.overflow).toBe('');
    });

    it('closes mobile search overlay on Back / Close button tap', () => {
      const handleClose = vi.fn();
      renderWithProviders(<MobileSearchOverlay isOpen={true} onClose={handleClose} />);

      const closeBtn = screen.getByLabelText('Close search overlay');
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');

      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. Mobile Filter & Sort Floating Pill (filter-sidebar.tsx)', () => {
    it('renders floating filter pill positioned above BottomNav (fixed, z-30, lg:hidden)', () => {
      renderWithProviders(<FilterSidebar categories={mockCategories} brands={mockBrands} />);

      const pill = screen.getByTestId('mobile-floating-filter-pill');
      expect(pill).toBeInTheDocument();
      expect(pill.className).toContain('fixed');
      expect(pill.className).toContain('bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))]');
      expect(pill.className).toContain('z-30');
      expect(pill.className).toContain('lg:hidden');
      expect(pill.className).toContain('bg-tc-ink');
    });

    it('features distinct Filters and Sort By segments meeting 44px touch targets', () => {
      renderWithProviders(<FilterSidebar categories={mockCategories} brands={mockBrands} />);

      const filterSegment = screen.getByTestId('floating-pill-filter-btn');
      const sortSegment = screen.getByTestId('floating-pill-sort-btn');

      expect(filterSegment).toBeInTheDocument();
      expect(sortSegment).toBeInTheDocument();
      expect(filterSegment.className).toContain('min-h-[44px]');
      expect(sortSegment.className).toContain('min-h-[44px]');
      expect(filterSegment.textContent).toContain('Filters');
      expect(sortSegment.textContent).toContain('Relevance');
    });

    it('displays active filter count badge in Brand V3 Action Lime (#DDF16A)', () => {
      mockSearchParams = new URLSearchParams('category=tools&brand=DeWalt&in_stock=true');
      renderWithProviders(<FilterSidebar categories={mockCategories} brands={mockBrands} />);

      const badge = screen.getByTestId('floating-pill-active-count');
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe('3');
      expect(badge.className).toContain('bg-tc-action-lime');
      expect(badge.className).toContain('text-tc-ink');
    });

    it('tapping Filters segment opens mobile filter sheet with both filter options and sort radio controls', () => {
      renderWithProviders(<FilterSidebar categories={mockCategories} brands={mockBrands} />);

      const filterBtn = screen.getByTestId('floating-pill-filter-btn');
      fireEvent.click(filterBtn);

      const dialog = screen.getByRole('dialog', { name: /Filter Catalog/i });
      expect(dialog).toBeInTheDocument();

      // Verify Sort By section is present inside drawer
      const sortSection = screen.getByTestId('mobile-drawer-sort-section');
      expect(sortSection).toBeInTheDocument();
      expect(sortSection.textContent).toContain('Sort By');

      // Verify radio options for all sort modes
      const radioGroup = screen.getByRole('radiogroup', { name: 'Sort options' });
      expect(radioGroup).toBeInTheDocument();

      const radioOptions = screen.getAllByRole('radio');
      expect(radioOptions.length).toBe(SORT_OPTIONS.length);

      // Verify filter categories are simultaneously present inside dialog
      expect(within(dialog).getByRole('button', { name: /All Categories/i })).toBeInTheDocument();
    });

    it('selecting a sort radio control updates URL parameter via router.push', () => {
      renderWithProviders(<FilterSidebar categories={mockCategories} brands={mockBrands} />);

      // Open drawer via Sort By segment on floating pill
      const sortPillBtn = screen.getByTestId('floating-pill-sort-btn');
      fireEvent.click(sortPillBtn);

      const priceAscRadio = screen.getByRole('radio', { name: /Price: Low to High/i });
      fireEvent.click(priceAscRadio);

      expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('sort=price_asc'));
    });
  });
});
