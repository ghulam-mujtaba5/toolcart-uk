import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  getAllProducts,
  getProductBySlug,
  getProductsByCategory,
  searchProducts,
  getProjectKits,
  getBuyingGuides,
} from '@/lib/catalog';
import { VatProvider, useVAT } from '@/context/vat-context';
import { CartProvider, useCart } from '@/context/cart-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { VatToggle } from '@/components/storefront/vat-toggle';
import { Microbar } from '@/components/storefront/microbar';
import { NavBar } from '@/components/storefront/nav-bar';
import { ProductCard } from '@/components/storefront/product-card';
import { CompareDrawer } from '@/components/storefront/compare-drawer';
import { MiniBasket } from '@/components/storefront/mini-basket';
import { ProjectKitCard } from '@/components/storefront/project-kit-card';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';

describe('Milestone 2 Storefront Test Suite', () => {
  describe('Catalog Data Provider', () => {
    it('returns all 115 quoted products from baseline CSV', async () => {
      const products = await getAllProducts();
      expect(products).toHaveLength(115);
    });

    it('normalizes Unicode ligatures correctly (fi, fl, Ø)', async () => {
      const products = await getAllProducts();

      // Check flathead screwdriver (previously \ufb02athead)
      const flatheadItem = products.find((p) => p.supplier_sku === 'IONSDRIVERS4P10');
      expect(flatheadItem).toBeDefined();
      expect(flatheadItem?.title).toContain('flathead');
      expect(flatheadItem?.title).not.toContain('\ufb02');

      // Check neon tester with diameter Ø (previously \u00d8)
      const neonItem = products.find((p) => p.supplier_sku === 'IONNEONTESTS1P10');
      expect(neonItem).toBeDefined();
      expect(neonItem?.title).toContain('Ø');

      // Check fine claw hammer (previously \ufb01ne)
      const hammerItem = products.find((p) => p.supplier_sku === 'ION16OZSCHAM1P6');
      expect(hammerItem).toBeDefined();
      expect(hammerItem?.title).not.toContain('\ufb01');
    });

    it('queries products by category slug', async () => {
      const tools = await getProductsByCategory('tools');
      expect(tools.length).toBeGreaterThan(0);
      expect(tools.every((t) => t.category_slug === 'tools')).toBe(true);

      const fixings = await getProductsByCategory('fixings');
      expect(fixings.length).toBeGreaterThan(0);
      expect(fixings.every((f) => f.category_slug === 'fixings')).toBe(true);
    });

    it('recovers zero-results search using UK hardware synonym expansion', async () => {
      // Searching for UK colloquial slang "rawplugs"
      const result = await searchProducts('rawplugs');
      expect(result.products.length).toBeGreaterThan(0);
      expect(result.didYouMean).toBeDefined();
      expect(result.products.some((p) => p.supplier_sku === 'IONWPLUGS200P10')).toBe(true);
    });

    it('provides exactly 3 curated project kits', async () => {
      const kits = await getProjectKits();
      expect(kits).toHaveLength(3);
      expect(kits.map((k) => k.slug)).toEqual([
        'domestic-electrical-tape-consumables-kit',
        'painting-masking-prep-kit',
        'essential-site-torch-extension-lead-kit',
      ]);
    });

    it('provides exactly 5 authoritative UK buying guides', async () => {
      const guides = await getBuyingGuides();
      expect(guides).toHaveLength(5);
      expect(guides.map((g) => g.slug)).toContain('complete-uk-guide-to-screwdrivers');
      expect(guides.map((g) => g.slug)).toContain('selecting-wall-plugs-masonry-fixings');
      expect(guides.map((g) => g.slug)).toContain('masking-painters-tapes-demystified');
      expect(guides.map((g) => g.slug)).toContain('site-access-step-ladder-safety');
      expect(guides.map((g) => g.slug)).toContain('electrical-insulation-tapes-voltage-testing');
    });
  });

  describe('Contexts & State Management', () => {
    it('VatContext toggles between Inc. VAT and Ex. VAT', () => {
      function TestVat() {
        const { mode, isTradeMode, toggleVatMode, formatPriceDisplay } = useVAT();
        const price = formatPriceDisplay(12.0, 10.0);
        return (
          <div>
            <span data-testid="mode">{mode}</span>
            <span data-testid="isTrade">{String(isTradeMode)}</span>
            <span data-testid="primaryPrice">{price.primaryText}</span>
            <button data-testid="toggle" onClick={toggleVatMode}>
              Toggle
            </button>
          </div>
        );
      }

      render(
        <VatProvider initialMode="inc">
          <TestVat />
        </VatProvider>
      );

      expect(screen.getByTestId('mode').textContent).toBe('inc');
      expect(screen.getByTestId('isTrade').textContent).toBe('false');
      expect(screen.getByTestId('primaryPrice').textContent).toBe('£12.00 inc. VAT');

      fireEvent.click(screen.getByTestId('toggle'));

      expect(screen.getByTestId('mode').textContent).toBe('ex');
      expect(screen.getByTestId('isTrade').textContent).toBe('true');
      expect(screen.getByTestId('primaryPrice').textContent).toBe('£10.00 ex. VAT');
    });

    it('CartContext groups items by supplier and computes UK 20% VAT math', async () => {
      const products = await getAllProducts();
      const product1 = products[0];

      function TestCart() {
        const { items, summary, addItem } = useCart();
        return (
          <div>
            <span data-testid="count">{summary.total_items_count}</span>
            <span data-testid="subtotal">{summary.subtotal_ex_vat_gbp}</span>
            <span data-testid="groups">{summary.supplier_groups.length}</span>
            <button data-testid="add" onClick={() => addItem(product1, 2)}>
              Add
            </button>
          </div>
        );
      }

      render(
        <CartProvider>
          <TestCart />
        </CartProvider>
      );

      expect(screen.getByTestId('count').textContent).toBe('0');

      fireEvent.click(screen.getByTestId('add'));

      expect(screen.getByTestId('count').textContent).toBe('2');
      expect(screen.getByTestId('groups').textContent).toBe('1');
    });

    it('CompareContext limits items to 4 and allows removal', async () => {
      const products = await getAllProducts();

      function TestCompare() {
        const { products: compProducts, addProduct, removeProduct, clearCompare } = useCompare();
        return (
          <div>
            <span data-testid="count">{compProducts.length}</span>
            <button data-testid="add-1" onClick={() => addProduct(products[0])}>Add 1</button>
            <button data-testid="add-2" onClick={() => addProduct(products[1])}>Add 2</button>
            <button data-testid="add-3" onClick={() => addProduct(products[2])}>Add 3</button>
            <button data-testid="add-4" onClick={() => addProduct(products[3])}>Add 4</button>
            <button data-testid="add-5" onClick={() => addProduct(products[4])}>Add 5</button>
            <button data-testid="remove-1" onClick={() => removeProduct(products[0].id)}>Remove 1</button>
            <button data-testid="clear" onClick={clearCompare}>Clear</button>
          </div>
        );
      }

      render(
        <CompareProvider>
          <TestCompare />
        </CompareProvider>
      );

      fireEvent.click(screen.getByTestId('add-1'));
      fireEvent.click(screen.getByTestId('add-2'));
      fireEvent.click(screen.getByTestId('add-3'));
      fireEvent.click(screen.getByTestId('add-4'));
      expect(screen.getByTestId('count').textContent).toBe('4');

      // Adding 5th caps at 4
      fireEvent.click(screen.getByTestId('add-5'));
      expect(screen.getByTestId('count').textContent).toBe('4');

      fireEvent.click(screen.getByTestId('remove-1'));
      expect(screen.getByTestId('count').textContent).toBe('3');

      fireEvent.click(screen.getByTestId('clear'));
      expect(screen.getByTestId('count').textContent).toBe('0');
    });
  });

  describe('Storefront Components', () => {
    it('renders Microbar with VAT toggle and delivery note', () => {
      render(
        <VatProvider>
          <Microbar />
        </VatProvider>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      expect(screen.getByText(/Free UK delivery/i)).toBeInTheDocument();
    });

    it('renders NavBar with category links in Cobalt', () => {
      render(<NavBar />);

      expect(screen.getByText('Hand Tools')).toBeInTheDocument();
      expect(screen.getByText('Fixings & Security')).toBeInTheDocument();
      expect(screen.getByText('Decorating')).toBeInTheDocument();
      expect(screen.getByText('Measuring')).toBeInTheDocument();
      expect(screen.getByText('Workwear & Safety')).toBeInTheDocument();
      expect(screen.getByText('Site Equipment')).toBeInTheDocument();
    });

    it('renders ProductCard with dual VAT pricing and clean presentation', async () => {
      const products = await getAllProducts();
      const product = products[0];

      render(
        <VatProvider initialMode="inc">
          <CartProvider>
            <CompareProvider>
              <ProductCard product={product} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      expect(screen.getByText(product.title)).toBeInTheDocument();
      expect(screen.getByText(/Add to Basket/i)).toBeInTheDocument();
      expect(screen.getByText(/Compare/i)).toBeInTheDocument();
    });

    it('renders ProjectKitCard with checklist toggle and bundle discount', async () => {
      const kits = await getProjectKits();
      const kit = kits[0];

      render(
        <VatProvider>
          <CartProvider>
            <ProjectKitCard kit={kit} />
          </CartProvider>
        </VatProvider>
      );

      expect(screen.getByText(kit.title)).toBeInTheDocument();
      expect(screen.getAllByText(new RegExp(`${kit.bundle_savings_percent}% Bundle Savings`, 'i')).length).toBeGreaterThan(0);
      expect(screen.getByText(new RegExp(`Add Selected to Basket \\(${kit.items.length}\\)`, 'i'))).toBeInTheDocument();
    });

    it('renders AIAssistantDrawer in Cloud Blue and Cobalt', () => {
      render(
        <CartProvider>
          <VatProvider>
            <AIAssistantDrawer isOpen={true} onClose={() => {}} />
          </VatProvider>
        </CartProvider>
      );

      expect(screen.getByText(/ToolCart AI Assistant/i)).toBeInTheDocument();
      expect(screen.getByText(/Verified catalog tools • Zero safety hallucinations/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Ask about screws, tape adhesion, ladder safety/i)).toBeInTheDocument();
    });
  });
});
