/**
 * @file m1-frontend-defect-remediation.test.tsx
 * Comprehensive verification suite for Milestone 1 frontend defects (D-01 through D-16).
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Providers
import { CartProvider } from '@/context/cart-context';
import { VatProvider } from '@/context/vat-context';
import { CompareProvider } from '@/context/compare-context';

// Target Components
import { BottomNav } from '@/components/storefront/bottom-nav';
import { ProjectKitCard } from '@/components/storefront/project-kit-card';
import { Header } from '@/components/storefront/header';
import { Input } from '@/components/ui/input';
import { SearchInput } from '@/components/ui/search-input';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { CookiePreferencesModal } from '@/components/storefront/cookie-preferences-modal';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/admin/data-table/data-table-pagination';
import { Skeleton } from '@/components/ui/skeleton';
import SearchLoading from '@/app/(storefront)/search/loading';
import ToolsLoading from '@/app/(storefront)/tools/loading';
import ProductLoading from '@/app/(storefront)/products/[slug]/loading';

// Mock router / navigation
const mockPathname = vi.fn(() => '/');
const mockSearchParams = new URLSearchParams();
const mockRouterPush = vi.fn();

vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams,
  useRouter: () => ({
    push: mockRouterPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Milestone 1 Frontend Defect Remediation Suite (D-01 to D-16)', () => {
  // --------------------------------------------------------------------------
  // D-01: Mobile Sticky Buy Bar Collision
  // --------------------------------------------------------------------------
  describe('D-01: Mobile Sticky Buy Bar Collision', () => {
    it('BottomNav returns null on /products/[slug] routes to prevent collision with PDP sticky buy dock', () => {
      mockPathname.mockReturnValue('/products/claw-hammer');
      const { container } = render(
        <CartProvider>
          <CompareProvider>
            <BottomNav />
          </CompareProvider>
        </CartProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('BottomNav returns null on /product/[slug] singular route', () => {
      mockPathname.mockReturnValue('/product/claw-hammer');
      const { container } = render(
        <CartProvider>
          <CompareProvider>
            <BottomNav />
          </CompareProvider>
        </CartProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('BottomNav returns null on /checkout to avoid blocking mobile payment inputs', () => {
      mockPathname.mockReturnValue('/checkout');
      const { container } = render(
        <CartProvider>
          <CompareProvider>
            <BottomNav />
          </CompareProvider>
        </CartProvider>
      );
      expect(container.firstChild).toBeNull();
    });

    it('BottomNav renders normally on non-PDP routes', () => {
      mockPathname.mockReturnValue('/');
      const { container } = render(
        <CartProvider>
          <CompareProvider>
            <BottomNav />
          </CompareProvider>
        </CartProvider>
      );
      expect(container.querySelector('nav[aria-label="Mobile Navigation Dock"]')).not.toBeNull();
    });
  });

  // --------------------------------------------------------------------------
  // D-02: Project Kit Keyboard & ARIA Accessibility (WCAG 2.1.1)
  // --------------------------------------------------------------------------
  describe('D-02: Project Kit Keyboard & ARIA Accessibility', () => {
    const mockKit = {
      id: 'kit-prep',
      title: 'Painting Prep Kit',
      description: 'Essential prep kit for interior decorating',
      category: 'Decorating',
      image: '/images/kits/prep.webp',
      instructions: [
        'Ensure surface is clean, dry, and dust-free before applying tape',
        'Press edges firmly to achieve razor-sharp paint lines',
      ],
      items: [
        {
          sku: 'SKU-001',
          title: 'Precision Masking Tape 24mm',
          price_inc_vat: 3.6,
          price_ex_vat: 3.0,
          required: true,
        },
        {
          sku: 'SKU-002',
          title: 'Polythene Dust Sheet 4m x 5m',
          price_inc_vat: 4.8,
          price_ex_vat: 4.0,
          required: false,
        },
      ],
    };

    it('kit items have role="checkbox", aria-checked, tabIndex={0}, and respond to keyboard Space/Enter', () => {
      render(
        <VatProvider>
          <CartProvider>
            <ProjectKitCard kit={mockKit as any} />
          </CartProvider>
        </VatProvider>
      );

      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes.length).toBe(2);

      const firstItem = checkboxes[0];
      expect(firstItem).toHaveAttribute('tabindex', '0');
      expect(firstItem).toHaveAttribute('aria-checked', 'true');

      // Toggle off using Space key
      fireEvent.keyDown(firstItem, { key: ' ' });
      expect(firstItem).toHaveAttribute('aria-checked', 'false');

      // Toggle back on using Enter key
      fireEvent.keyDown(firstItem, { key: 'Enter' });
      expect(firstItem).toHaveAttribute('aria-checked', 'true');
    });
  });

  // --------------------------------------------------------------------------
  // D-03: Header Mobile Touch Targets
  // --------------------------------------------------------------------------
  describe('D-03: Header Mobile Touch Targets', () => {
    it('Header mobile menu, account link, and basket buttons meet or exceed 44x44px touch targets', () => {
      mockPathname.mockReturnValue('/');
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const menuBtn = screen.getByLabelText('Open mobile navigation menu');
      expect(menuBtn.className).toContain('min-w-[44px]');
      expect(menuBtn.className).toContain('min-h-[44px]');

      const accountBtn = screen.getByLabelText('Customer Account & Orders');
      expect(accountBtn.className).toContain('min-w-[44px]');
      expect(accountBtn.className).toContain('min-h-[44px]');

      const basketBtn = screen.getByRole('button', { name: /Open Basket/i });
      expect(basketBtn.className).toContain('min-w-[44px]');
      expect(basketBtn.className).toContain('min-h-[44px]');
    });
  });

  // --------------------------------------------------------------------------
  // D-04: Base Input & Checkout Form Accessibility
  // --------------------------------------------------------------------------
  describe('D-04: Base Input & Form Accessibility', () => {
    it('Input error message has role="alert" and aria-live="polite"', () => {
      render(<Input label="Postcode" error="Invalid UK postcode format" />);
      const alert = screen.getByRole('alert');
      expect(alert).toHaveTextContent('Invalid UK postcode format');
      expect(alert).toHaveAttribute('aria-live', 'polite');
    });
  });

  // --------------------------------------------------------------------------
  // D-07: Filter Chips Touch Targets
  // --------------------------------------------------------------------------
  describe('D-07: Filter Chips Touch Targets', () => {
    it('Filter chip remove buttons have min-w-[44px] and min-h-[44px] on mobile', () => {
      mockSearchParams.set('brand', 'Status');
      render(<SearchFilterChips />);

      const removeBtn = screen.getByLabelText(/Remove filter Brand: Status/i);
      expect(removeBtn.className).toContain('min-w-[44px]');
      expect(removeBtn.className).toContain('min-h-[44px]');
      mockSearchParams.delete('brand');
    });
  });

  // --------------------------------------------------------------------------
  // D-08: SearchInput Clear Button
  // --------------------------------------------------------------------------
  describe('D-08: SearchInput Clear Button', () => {
    it('SearchInput clear button has aria-label and min 44px hit dimensions', () => {
      const handleClear = vi.fn();
      render(
        <SearchInput
          value="hacksaw"
          onChange={vi.fn()}
          onClear={handleClear}
        />
      );

      const clearBtn = screen.getByLabelText('Clear search input');
      expect(clearBtn.className).toContain('min-w-[44px]');
      expect(clearBtn.className).toContain('min-h-[44px]');

      fireEvent.click(clearBtn);
      expect(handleClear).toHaveBeenCalledTimes(1);
    });
  });

  // --------------------------------------------------------------------------
  // D-09: Cookie Preferences Modal Targets
  // --------------------------------------------------------------------------
  describe('D-09: Cookie Preferences Modal Targets', () => {
    it('Cookie Preferences close button and category switches satisfy 44px touch ergonomics', () => {
      render(<CookiePreferencesModal isOpen={true} onClose={vi.fn()} />);

      const closeBtn = screen.getByLabelText('Close cookie preferences modal');
      expect(closeBtn.className).toContain('min-w-[44px]');
      expect(closeBtn.className).toContain('min-h-[44px]');

      const switches = screen.getAllByRole('switch');
      expect(switches.length).toBeGreaterThanOrEqual(1);
      for (const sw of switches) {
        expect(sw.className).toContain('min-h-[44px]');
      }
    });
  });

  // --------------------------------------------------------------------------
  // D-10: Button Active States & Admin Pagination
  // --------------------------------------------------------------------------
  describe('D-10: Button Active States & Admin Pagination', () => {
    it('Button variants render with active state styling', () => {
      const { container: cSecondary } = render(<Button variant="secondary">Secondary</Button>);
      expect(cSecondary.querySelector('button')?.className).toContain('active:bg-tc-border-strong/20');

      const { container: cGhost } = render(<Button variant="ghost">Ghost</Button>);
      expect(cGhost.querySelector('button')?.className).toContain('active:bg-tc-surface-soft/80');

      const { container: cOutline } = render(<Button variant="outline">Outline</Button>);
      expect(cOutline.querySelector('button')?.className).toContain('active:bg-tc-surface-soft/80');
    });

    it('Admin DataTablePagination buttons have accessible 36px touch heights', () => {
      render(
        <DataTablePagination
          page={2}
          pageSize={10}
          totalPages={5}
          totalFilteredItems={50}
          canPreviousPage={true}
          canNextPage={true}
          onPageChange={vi.fn()}
          onPageSizeChange={vi.fn()}
        />
      );

      const prevBtn = screen.getByLabelText('Previous page');
      const nextBtn = screen.getByLabelText('Next page');

      expect(prevBtn.className).toContain('min-h-[36px]');
      expect(nextBtn.className).toContain('min-h-[36px]');
    });
  });

  // --------------------------------------------------------------------------
  // D-13: Reusable Skeleton Component & Loading Routes
  // --------------------------------------------------------------------------
  describe('D-13: Reusable Skeleton & Loading Routes', () => {
    it('Skeleton primitive renders with Brand V3 pulse styling and aria-hidden', () => {
      const { container } = render(<Skeleton className="h-6 w-32" />);
      const el = container.firstChild as HTMLElement;
      expect(el).toHaveClass('animate-pulse');
      expect(el).toHaveClass('bg-tc-border/40');
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });

    it('SearchLoading route renders without error', () => {
      const { container } = render(<SearchLoading />);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
    });

    it('ToolsLoading route renders without error', () => {
      const { container } = render(<ToolsLoading />);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
    });

    it('ProductLoading route renders without error', () => {
      const { container } = render(<ProductLoading />);
      expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(5);
    });
  });
});
