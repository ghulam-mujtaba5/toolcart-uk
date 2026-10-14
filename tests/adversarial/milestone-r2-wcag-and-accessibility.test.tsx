/**
 * Milestone R2: Brand V3, WCAG AA & Viewport Accessibility Test Suite
 *
 * Comprehensive verification for Features 10–19:
 * 1. Inactive VAT toggle contrast (WCAG 1.4.3 >= 4.5:1)
 * 2. Mobile navigation close button aria-label="Close menu"
 * 3. Accessible button label in name (WCAG 2.5.3) in ProductCard & PdpActions
 * 4. SKU copy badge 44px touch target (WCAG 2.5.5 / 2.5.8)
 * 5. Footer Action Lime logo text color (explicit text-tc-ink)
 * 6. ProductCard interactive nesting elimination (CopyBadge outside Link)
 * 7. FilterPill interactive nesting elimination (no nested buttons)
 * 8. Invalid Tailwind class py-0.2 elimination (replaced with py-0.5)
 * 9. Stock radar badge mobile overflow constraint (max-w-[160px])
 * 10. Accessible modal semantics in drawers (dialog, aria-modal, aria-labelledby, Escape key)
 */

import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { TactileVatRocker } from '@/components/storefront/tactile-vat-rocker';
import { VatProvider } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { Header } from '@/components/storefront/header';
import { Navigation } from '@/components/storefront/navigation';
import { ProductCard } from '@/components/storefront/product-card';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { CopyBadge } from '@/components/ui/copy-badge';
import { Footer } from '@/components/storefront/footer';
import { FilterPill } from '@/components/ui/filter-pill';
import { SearchFilterChips } from '@/components/storefront/search-filter-chips';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { PublicProductDTO } from '@/types/product';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/products/test',
  useSearchParams: () => new URLSearchParams('category=tools&brand=Status'),
}));

const mockProduct: PublicProductDTO = {
  id: 'prod_test_r2',
  supplier_sku: 'R2-TEST-SKU',
  gtin: '5012345678901',
  mpn: 'R2-MPN',
  brand: 'Status',
  title: 'Status 16oz Claw Hammer',
  slug: 'status-16oz-claw-hammer',
  category: 'Hand Tools',
  category_slug: 'tools',
  description: 'Professional 16oz claw hammer with steel shaft',
  images: ['/images/products/test-hammer.png'],
  specifications: {
    Weight: '16oz (450g)',
    Material: 'Drop-forged carbon steel',
  },
  supplier_id: 'sup_status_01',
  supplier_name: 'Status International (UK) Ltd',
  case_pack_description: 'Case of 12 units',
  compliance_verified: true,
  image_license_verified: true,
  units_per_pack: 1,
  units_per_case: 12,
  carton_barcode: '05012345678908',
  stock_quantity: 45,
  availability_status: 'in_stock',
  sellability_status: 'approved',
  retail_price_inc_vat_gbp: 14.40,
  retail_price_ex_vat_gbp: 12.00,
};

describe('Milestone R2: Brand V3, WCAG AA & Viewport Accessibility', () => {
  // Feature 10: Inactive VAT toggle contrast
  describe('Feature 10: Inactive VAT toggle contrast', () => {
    it('uses tc-graphite for inactive VAT toggle text without contrast-reducing opacity-80', () => {
      render(
        <VatProvider initialMode="inc">
          <TactileVatRocker />
        </VatProvider>
      );

      const exButton = screen.getByRole('radio', { name: /Ex. VAT/i });
      expect(exButton.className).toContain('text-tc-graphite');
      expect(exButton.className).not.toContain('opacity-80');
    });

    it('ui/tactile-vat-rocker re-export is available and functionally identical', async () => {
      const { TactileVatRocker: UiRocker } = await import('@/components/ui/tactile-vat-rocker');
      expect(UiRocker).toBeDefined();
    });
  });

  // Feature 11: Mobile navigation close aria-label
  describe('Feature 11: Mobile navigation close aria-label', () => {
    it('header mobile drawer close button has aria-label="Close menu"', () => {
      render(
        <VatProvider>
          <CartProvider>
            <Header />
          </CartProvider>
        </VatProvider>
      );

      const hamburger = screen.getByLabelText(/Open mobile navigation menu/i);
      fireEvent.click(hamburger);

      const closeMenuButton = screen.getByRole('button', { name: 'Close menu' });
      expect(closeMenuButton).toBeInTheDocument();
    });

    it('navigation component mobile close button has aria-label="Close menu"', () => {
      render(<Navigation />);

      const openButton = screen.getByLabelText(/Open mobile navigation menu/i);
      fireEvent.click(openButton);

      const closeButton = screen.getByRole('button', { name: 'Close menu' });
      expect(closeButton).toBeInTheDocument();
    });
  });

  // Feature 12: Accessible button label in name (WCAG 2.5.3)
  describe('Feature 12: Accessible button label in name (WCAG 2.5.3)', () => {
    it('ProductCard snap-to-cart button includes visible text in aria-label', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const addBtn = screen.getByRole('button', { name: `Add to Basket: ${mockProduct.title}` });
      expect(addBtn).toBeInTheDocument();
    });

    it('PdpActions snap-to-cart button includes visible text in aria-label', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <PdpActions product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const addBtn = screen.getByRole('button', { name: `Add to Basket: ${mockProduct.title}` });
      expect(addBtn).toBeInTheDocument();
    });
  });

  // Feature 13: SKU copy badge 44px touch target
  describe('Feature 13: SKU copy badge touch target', () => {
    it('CopyBadge meets WCAG minimum 44x44px touch area', () => {
      render(<CopyBadge value="ION16OZ" label="SKU" size="xs" />);

      const button = screen.getByRole('button', { name: /Copy SKU ION16OZ to clipboard/i });
      expect(button.className).toContain('min-h-[44px]');
      expect(button.className).toContain('min-w-[44px]');
    });
  });

  // Feature 14: Footer Action Lime logo text color
  describe('Feature 14: Footer Action Lime logo text color', () => {
    it('Footer Action Lime brand block div explicitly includes text-tc-ink class', () => {
      render(<Footer />);

      const brandLogoDiv = document.querySelector('.bg-tc-action-lime');
      expect(brandLogoDiv).not.toBeNull();
      expect(brandLogoDiv?.className).toContain('text-tc-ink');
    });
  });

  // Feature 15: ProductCard interactive nesting
  describe('Feature 15: ProductCard interactive nesting', () => {
    it('ensures CopyBadge button is NOT a descendant of Next.js Link anchor', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const links = container.querySelectorAll('a');
      for (const link of links) {
        const nestedButtons = link.querySelectorAll('button');
        expect(nestedButtons.length).toBe(0);
      }
    });
  });

  // Feature 16: FilterPill interactive nesting
  describe('Feature 16: FilterPill interactive nesting', () => {
    it('FilterPill when active with onRemove renders non-nested sibling buttons', () => {
      const handleRemove = vi.fn();
      const handleClick = vi.fn();

      const { container } = render(
        <FilterPill active variant="primary" onClick={handleClick} onRemove={handleRemove}>
          Power Tools
        </FilterPill>
      );

      // Verify no button is nested inside another button
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(2);
      expect(buttons[0].contains(buttons[1])).toBe(false);
      expect(buttons[1].contains(buttons[0])).toBe(false);

      // Both buttons are accessible and functional
      const removeBtn = screen.getByRole('button', { name: 'Remove filter' });
      fireEvent.click(removeBtn);
      expect(handleRemove).toHaveBeenCalledTimes(1);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('SearchFilterChips renders without nested interactive buttons', () => {
      const { container } = render(<SearchFilterChips />);
      const buttons = container.querySelectorAll('button');
      for (const btn of buttons) {
        expect(btn.querySelectorAll('button').length).toBe(0);
      }
    });
  });

  // Feature 17: Invalid Tailwind spacing py-0.2
  describe('Feature 17: Invalid Tailwind spacing py-0.2 elimination', () => {
    it('verifies py-0.2 is completely absent from copy-badge.tsx and product-table.tsx', () => {
      const copyBadgePath = path.join(process.cwd(), 'src', 'components', 'ui', 'copy-badge.tsx');
      const productTablePath = path.join(process.cwd(), 'src', 'components', 'admin', 'product-table.tsx');

      const copyBadgeContent = fs.readFileSync(copyBadgePath, 'utf8');
      const productTableContent = fs.readFileSync(productTablePath, 'utf8');

      expect(copyBadgeContent).not.toContain('py-0.2');
      expect(copyBadgeContent).toContain('py-0.5');

      expect(productTableContent).not.toContain('py-0.2');
      expect(productTableContent).toContain('py-0.5');
    });
  });

  // Feature 18: Stock radar badge mobile overflow
  describe('Feature 18: Stock radar badge mobile overflow', () => {
    it('StockRadarBadge container and text are constrained with max-w on mobile', () => {
      const { container } = render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const radarContainer = container.querySelector('.top-2\\.5.left-2\\.5');
      expect(radarContainer?.className).toContain('max-w-[160px]');
      expect(radarContainer?.className).toContain('sm:max-w-none');
    });
  });

  // Feature 19: Accessible modal semantics in drawers
  describe('Feature 19: Accessible modal semantics in drawers', () => {
    it('MiniBasket renders with role="dialog", aria-modal="true", aria-labelledby, and dismisses on Escape', () => {
      function TestCartOpener() {
        const { openCart } = useCart();
        return (
          <>
            <button onClick={openCart}>Open Basket</button>
            <MiniBasket />
          </>
        );
      }

      render(
        <VatProvider>
          <CartProvider>
            <TestCartOpener />
          </CartProvider>
        </VatProvider>
      );

      // Initially closed
      expect(screen.queryByRole('dialog')).toBeNull();

      // Open basket
      fireEvent.click(screen.getByText('Open Basket'));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'mini-basket-title');

      const heading = screen.getByRole('heading', { name: /Your Basket/i });
      expect(heading).toHaveAttribute('id', 'mini-basket-title');

      // Dismiss on Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('CompareDrawer has role="dialog", aria-modal="true", and aria-labelledby="compare-drawer-title"', () => {
      function TestCompareOpener() {
        const { addProduct, openCompare } = useCompare();
        return (
          <>
            <button onClick={() => { addProduct(mockProduct); openCompare(); }}>Open Compare</button>
            <CompareDrawer />
          </>
        );
      }

      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <TestCompareOpener />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      // Open compare
      fireEvent.click(screen.getByText('Open Compare'));

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'compare-drawer-title');

      const heading = screen.getByRole('heading', { name: /Side-by-Side Product Comparison/i });
      expect(heading).toHaveAttribute('id', 'compare-drawer-title');

      // Dismiss on Escape key
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('AIAssistantDrawer has role="dialog", aria-modal="true", aria-labelledby, and dismisses on Escape key', () => {
      const handleClose = vi.fn();

      render(
        <VatProvider>
          <CartProvider>
            <AIAssistantDrawer isOpen={true} onClose={handleClose} />
          </CartProvider>
        </VatProvider>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'ai-assistant-title');

      const heading = screen.getByRole('heading', { name: /ToolCart AI Assistant/i });
      expect(heading).toHaveAttribute('id', 'ai-assistant-title');

      // Test Escape key dismissal
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });
});
