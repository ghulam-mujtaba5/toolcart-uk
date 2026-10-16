/**
 * @file m1-challenger-accessibility-and-brand.test.tsx
 * Empirical Challenger Verification Suite for Milestone 1.
 * Tests form input accessibility bindings, error announcements, and Brand V3 invariants.
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Context Providers
import { CartProvider, useCart } from '@/context/cart-context';
import { VatProvider } from '@/context/vat-context';
import { ToastProvider } from '@/context/toast-context';
import { PublicProductDTO } from '@/types/product';

// Target Components
import CheckoutPage from '@/app/(storefront)/checkout/page';
import TradePortalPage from '@/app/(storefront)/trade/page';
import { FilterSidebar } from '@/components/storefront/filter-sidebar';
import { Input } from '@/components/ui/input';

// Mock navigation
const mockPush = vi.fn();
const mockPathname = vi.fn(() => '/checkout');
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => mockPathname(),
  useSearchParams: () => mockSearchParams,
}));

const mockProduct: PublicProductDTO = {
  id: 'prod-001',
  slug: '12-inch-socket-set',
  title: '1/2 Inch Socket Set 24-Piece Metric',
  description: 'Heavy duty chrome vanadium metric socket set.',
  category: 'Tools',
  category_slug: 'tools',
  brand: 'Status',
  gtin: '5012345678901',
  supplier_sku: 'ION12SOCKSET1P6',
  supplier_id: 'status-uk',
  supplier_name: 'Status International',
  retail_price_inc_vat_gbp: 49.99,
  retail_price_ex_vat_gbp: 41.66,
  units_per_pack: 1,
  units_per_case: 6,
  case_pack_description: 'Case of 6',
  stock_quantity: 45,
  availability_status: 'in_stock',
  lead_time_days: '1 day',
  weight_grams: 2500,
  images: ['/images/products/ION12SOCKSET1P6.png'],
  specifications: { Material: 'Chrome Vanadium' },
  compliance_verified: true,
  image_license_verified: true,
};

// Helper component to seed cart items
function CartSeeder({ product }: { product: PublicProductDTO }) {
  const { addItem } = useCart();
  return (
    <button
      type="button"
      data-testid="seed-cart-btn"
      onClick={() => addItem(product, 1)}
    >
      Seed Cart
    </button>
  );
}

describe('Challenger Milestone 1: Empirical Accessibility & Brand V3 Verification', () => {
  // --------------------------------------------------------------------------
  // Dimension 1: Checkout Form Accessible Bindings & Postcode Error Handling
  // --------------------------------------------------------------------------
  describe('Dimension 1: Checkout Form (<label htmlFor> / id & ARIA Error Attributes)', () => {
    function renderCheckoutWithItem() {
      mockPathname.mockReturnValue('/checkout');
      render(
        <VatProvider>
          <CartProvider>
            <ToastProvider>
              <CartSeeder product={mockProduct} />
              <CheckoutPage />
            </ToastProvider>
          </CartProvider>
        </VatProvider>
      );
      fireEvent.click(screen.getByTestId('seed-cart-btn'));
    }

    it('all shipping and customer inputs in checkout form have valid id matching <label htmlFor>', () => {
      renderCheckoutWithItem();

      const expectedFields = [
        { id: 'checkout-email', labelPattern: /Email Address/i },
        { id: 'checkout-fullname', labelPattern: /Full Name/i },
        { id: 'checkout-company', labelPattern: /Company \/ Trade Name/i },
        { id: 'checkout-phone', labelPattern: /Mobile \/ Site Contact/i },
        { id: 'checkout-address1', labelPattern: /Address Line 1/i },
        { id: 'checkout-address2', labelPattern: /Address Line 2/i },
        { id: 'checkout-city', labelPattern: /Town \/ City/i },
        { id: 'checkout-postcode', labelPattern: /UK Postcode/i },
      ];

      for (const field of expectedFields) {
        const input = document.getElementById(field.id) as HTMLInputElement;
        expect(input, `Input with id="${field.id}" must exist`).not.toBeNull();

        const label = document.querySelector(`label[for="${field.id}"]`);
        expect(label, `Label with htmlFor="${field.id}" must exist`).not.toBeNull();
        expect(label?.textContent).toMatch(field.labelPattern);

        // Input should be findable via accessible name
        const accessibleInput = screen.getByLabelText(field.labelPattern);
        expect(accessibleInput).toBe(input);
      }
    });

    it('checkout postcode input validates format on blur, toggles aria-invalid, and links error via aria-describedby and role="alert"', () => {
      renderCheckoutWithItem();

      const postcodeInput = screen.getByLabelText(/UK Postcode/i) as HTMLInputElement;
      expect(postcodeInput.getAttribute('aria-invalid')).toBe('false');
      expect(postcodeInput.getAttribute('aria-describedby')).toBeNull();

      // Trigger blur with invalid postcode
      fireEvent.change(postcodeInput, { target: { value: 'INVALID_POSTCODE' } });
      fireEvent.blur(postcodeInput);

      // Verify aria-invalid is true
      expect(postcodeInput.getAttribute('aria-invalid')).toBe('true');
      expect(postcodeInput.getAttribute('aria-describedby')).toBe('checkout-postcode-error');

      // Verify error message announcement container
      const errorEl = document.getElementById('checkout-postcode-error');
      expect(errorEl).not.toBeNull();
      expect(errorEl?.getAttribute('role')).toBe('alert');
      expect(errorEl?.getAttribute('aria-live')).toBe('polite');
      expect(errorEl?.textContent).toContain('Please enter a valid UK postcode');

      // Fixing postcode clears error
      fireEvent.change(postcodeInput, { target: { value: 'SW1A 1AA' } });
      expect(postcodeInput.getAttribute('aria-invalid')).toBe('false');
      expect(document.getElementById('checkout-postcode-error')).toBeNull();
    });

    it('express checkout payment triggers provide accessible names and min-height touch dimensions', () => {
      renderCheckoutWithItem();

      const applePay = screen.getByTestId('express-apple-pay-btn');
      const googlePay = screen.getByTestId('express-google-pay-btn');
      const cardPay = screen.getByTestId('express-card-pay-btn');

      expect(applePay.getAttribute('aria-label')).toBe('Pay with Apple Pay');
      expect(googlePay.getAttribute('aria-label')).toBe('Pay with Google Pay');
      expect(cardPay.getAttribute('aria-label')).toBe('Pay with 1-Click Card');

      expect(applePay.className).toMatch(/min-h-\[(?:44|48)px\]/);
      expect(googlePay.className).toMatch(/min-h-\[(?:44|48)px\]/);
      expect(cardPay.className).toMatch(/min-h-\[(?:44|48)px\]/);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 2: Trade Portal Form Accessible Bindings & Alert States
  // --------------------------------------------------------------------------
  describe('Dimension 2: Trade Application Form (<label htmlFor> / id Bindings)', () => {
    it('all trade portal input and select elements have valid id matching <label htmlFor>', () => {
      render(<TradePortalPage />);

      const expectedTradeFields = [
        { id: 'trade-company-name', labelPattern: /Registered Company Name/i },
        { id: 'trade-companies-house', labelPattern: /Companies House Number/i },
        { id: 'trade-vat-number', labelPattern: /UK VAT Number/i },
        { id: 'trade-sector', labelPattern: /Primary Trade Sector/i },
        { id: 'trade-contact-name', labelPattern: /Primary Contact Name/i },
        { id: 'trade-contact-email', labelPattern: /Invoicing Email Address/i },
        { id: 'trade-contact-phone', labelPattern: /Contact Telephone/i },
      ];

      for (const field of expectedTradeFields) {
        const el = document.getElementById(field.id);
        expect(el, `Element with id="${field.id}" must exist`).not.toBeNull();

        const label = document.querySelector(`label[for="${field.id}"]`);
        expect(label, `Label with htmlFor="${field.id}" must exist`).not.toBeNull();
        expect(label?.textContent).toMatch(field.labelPattern);

        const accessibleEl = screen.getByLabelText(field.labelPattern);
        expect(accessibleEl).toBe(el);
      }
    });

    it('trade portal submit button uses Brand V3 Action Lime with dark Ink text', () => {
      render(<TradePortalPage />);

      const submitBtn = screen.getByRole('button', { name: /Submit Trade Application/i });
      expect(submitBtn).not.toBeNull();
      // Button must have text-tc-ink (never white text on lime)
      expect(submitBtn.className).toContain('text-tc-ink');
      expect(submitBtn.className).not.toContain('text-white');
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 3: FilterSidebar Price Range & Sort Accessibility
  // --------------------------------------------------------------------------
  describe('Dimension 3: FilterSidebar Price Range Accessibility', () => {
    const mockCategories = [
      { name: 'Hand Tools', slug: 'hand-tools', count: 12 },
      { name: 'Consumables', slug: 'consumables', count: 8 },
    ];
    const mockBrands = [
      { name: 'Status', count: 15 },
      { name: 'Stanley', count: 5 },
    ];

    it('price range inputs have matching labels, id attributes, and aria-labels', () => {
      render(
        <VatProvider>
          <FilterSidebar categories={mockCategories} brands={mockBrands} />
        </VatProvider>
      );

      const minInput = document.getElementById('filter-min-price') as HTMLInputElement;
      const maxInput = document.getElementById('filter-max-price') as HTMLInputElement;

      expect(minInput, 'filter-min-price input exists').not.toBeNull();
      expect(maxInput, 'filter-max-price input exists').not.toBeNull();

      const minLabel = document.querySelector('label[for="filter-min-price"]');
      const maxLabel = document.querySelector('label[for="filter-max-price"]');

      expect(minLabel, 'Min price label exists').not.toBeNull();
      expect(maxLabel, 'Max price label exists').not.toBeNull();

      expect(minInput.getAttribute('aria-label')).toBe('Minimum price in pounds');
      expect(maxInput.getAttribute('aria-label')).toBe('Maximum price in pounds');

      expect(screen.getByLabelText('Minimum price in pounds')).toBe(minInput);
      expect(screen.getByLabelText('Maximum price in pounds')).toBe(maxInput);
    });
  });

  // --------------------------------------------------------------------------
  // Dimension 4: Base Input Component Error & Accessibility
  // --------------------------------------------------------------------------
  describe('Dimension 4: Base Input Component WCAG Attributes', () => {
    it('sets aria-invalid="true", aria-describedby, and renders role="alert" with aria-live="polite"', () => {
      render(
        <Input
          id="test-postcode"
          label="Postal Code"
          error="Postcode is required"
        />
      );

      const input = screen.getByLabelText('Postal Code');
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe('test-postcode-error');

      const alert = screen.getByRole('alert');
      expect(alert.id).toBe('test-postcode-error');
      expect(alert.getAttribute('aria-live')).toBe('polite');
      expect(alert.textContent).toBe('Postcode is required');
    });

    it('generates consistent id when no explicit id is provided and links label properly', () => {
      render(<Input label="Company Name" error="Company name required" />);

      const input = screen.getByLabelText('Company Name') as HTMLInputElement;
      expect(input.id).toBeTruthy();
      expect(input.getAttribute('aria-invalid')).toBe('true');
      expect(input.getAttribute('aria-describedby')).toBe(`${input.id}-error`);

      const alert = screen.getByRole('alert');
      expect(alert.id).toBe(`${input.id}-error`);
    });
  });
});
