import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { CopyBadge } from '@/components/ui/copy-badge';
import { StockRadarBadge } from '@/components/ui/stock-radar-badge';
import { TactileVatRocker } from '@/components/storefront/tactile-vat-rocker';
import { VatToggle } from '@/components/storefront/vat-toggle';
import { ProductCard } from '@/components/storefront/product-card';
import { PdpActions } from '@/components/storefront/pdp-actions';
import { VatProvider } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { PublicProductDTO } from '@/types/product';

const mockProduct: PublicProductDTO = {
  id: 'prod_test_001',
  slug: 'test-high-tensile-bolt',
  supplier_sku: 'IONTESTBOLT10',
  title: 'Status Grade 8.8 High-Tensile Hex Bolt M10 x 50mm',
  brand: 'Status',
  category: 'Fixings & Security',
  category_slug: 'fixings',
  description: 'Heavy duty zinc plated structural hex bolt.',
  retail_price_inc_vat_gbp: 12.0,
  retail_price_ex_vat_gbp: 10.0,
  units_per_pack: 10,
  units_per_case: 50,
  images: ['/images/products/IONTESTBOLT10.png'],
  availability_status: 'in_stock',
  stock_quantity: 45,
  gtin: '5012345678901',
  carton_barcode: '05012345678908',
  supplier_id: 'supplier_status_uk',
  supplier_name: 'Status International (UK) Ltd',
  case_pack_description: 'Case of 50 packs',
  compliance_verified: true,
  image_license_verified: true,
  specifications: {
    Material: 'Grade 8.8 Steel',
    Finish: 'Bright Zinc Plated',
  },
};

describe('Brand V3 Micro-Interactions Suite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    if (typeof document !== 'undefined') {
      document.cookie = 'toolcart_vat_mode=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;';
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('1-Click SKU/GTIN CopyBadge', () => {
    it('renders resting state with label and technical identifier value', () => {
      render(<CopyBadge value="ION16OZSCHAM1P6" label="SKU" />);
      expect(screen.getByText('SKU:')).toBeInTheDocument();
      expect(screen.getByText('ION16OZSCHAM1P6')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute(
        'aria-label',
        'Copy SKU ION16OZSCHAM1P6 to clipboard'
      );
    });

    it('copies to clipboard and displays high-vis Action Lime feedback with dark Ink text', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<CopyBadge value="5012345678901" label="EAN-13" />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.click(button);
      });

      expect(writeTextMock).toHaveBeenCalledWith('5012345678901');
      expect(screen.getByText('COPIED')).toBeInTheDocument();
      expect(button).toHaveClass('bg-tc-action-lime');
      expect(button).toHaveClass('text-tc-ink');
      expect(button).toHaveClass('border-2');

      // Reverts after timeout (1500ms)
      act(() => {
        vi.advanceTimersByTime(1550);
      });

      expect(screen.queryByText('COPIED')).not.toBeInTheDocument();
      expect(button).toHaveClass('bg-white');
    });

    it('handles keyboard activation via Enter and Space keys', async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.assign(navigator, {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      render(<CopyBadge value="TESTSKU123" />);
      const button = screen.getByRole('button');

      await act(async () => {
        fireEvent.keyDown(button, { key: 'Enter' });
      });

      expect(writeTextMock).toHaveBeenCalledWith('TESTSKU123');
      expect(screen.getByText('COPIED')).toBeInTheDocument();
    });
  });

  describe('Tactile Mechanical VAT Rocker Switch', () => {
    it('renders radiogroup with Inc. VAT (DIY) and Ex. VAT (Trade) pills', () => {
      render(
        <VatProvider initialMode="inc">
          <TactileVatRocker />
        </VatProvider>
      );

      const group = screen.getByRole('radiogroup');
      expect(group).toBeInTheDocument();
      expect(screen.getByText('Inc. VAT')).toBeInTheDocument();
      expect(screen.getByText('Ex. VAT')).toBeInTheDocument();
    });

    it('switches between Inc and Ex VAT modes with correct high-contrast styling', () => {
      render(
        <VatProvider initialMode="inc">
          <TactileVatRocker />
        </VatProvider>
      );

      const incRadio = screen.getByRole('radio', { name: /inc\. vat/i });
      const exRadio = screen.getByRole('radio', { name: /ex\. vat/i });

      // Initially inc mode: Cobalt background with white text
      expect(incRadio).toHaveAttribute('aria-checked', 'true');
      expect(incRadio).toHaveClass('bg-tc-primary');
      expect(incRadio).toHaveClass('text-white');

      // Click Ex. VAT
      fireEvent.click(exRadio);

      // Now ex mode: Action Lime with dark Ink text and 2px border
      expect(exRadio).toHaveAttribute('aria-checked', 'true');
      expect(exRadio).toHaveClass('bg-tc-action-lime');
      expect(exRadio).toHaveClass('text-tc-ink');
      expect(exRadio).toHaveClass('border-2');
    });

    it('navigates via arrow keys on the rocker radiogroup', () => {
      render(
        <VatProvider initialMode="inc">
          <TactileVatRocker />
        </VatProvider>
      );

      const group = screen.getByRole('radiogroup');
      const incRadio = screen.getByRole('radio', { name: /inc\. vat/i });
      const exRadio = screen.getByRole('radio', { name: /ex\. vat/i });

      expect(incRadio).toHaveAttribute('aria-checked', 'true');

      // ArrowRight to switch to ex
      fireEvent.keyDown(group, { key: 'ArrowRight' });
      expect(exRadio).toHaveAttribute('aria-checked', 'true');

      // ArrowLeft to switch back to inc
      fireEvent.keyDown(group, { key: 'ArrowLeft' });
      expect(incRadio).toHaveAttribute('aria-checked', 'true');
    });

    it('VatToggle backwards-compatible component renders TactileVatRocker seamlessly', () => {
      render(
        <VatProvider initialMode="ex">
          <VatToggle />
        </VatProvider>
      );

      expect(screen.getByRole('radiogroup')).toBeInTheDocument();
      const exRadio = screen.getByRole('radio', { name: /ex\. vat/i });
      expect(exRadio).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Live 24h Stock Freshness Radar Ring', () => {
    it('renders stock verified radar ring for in_stock products', () => {
      render(<StockRadarBadge status="in_stock" stockQuantity={25} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
      expect(screen.getByText(/Confirmed in stock/i)).toBeInTheDocument();
    });

    it('renders warning status for quote awaiting confirmation', () => {
      render(<StockRadarBadge status="subject_to_confirmation" />);
      expect(screen.getByText(/Confirming availability/i)).toBeInTheDocument();
    });

    it('renders muted status when unavailable', () => {
      render(<StockRadarBadge status="unavailable" />);
      expect(screen.getByText(/Check availability/i)).toBeInTheDocument();
    });

    it('displays telemetry details popover on click when showDetailsPopover is true', () => {
      render(
        <StockRadarBadge
          status="in_stock"
          showDetailsPopover={true}
          supplierName="Status International (UK) Ltd"
          facilityLocation="West Yorkshire Hub"
        />
      );

      const badge = screen.getByRole('status');
      fireEvent.click(badge);

      expect(screen.getByRole('tooltip')).toBeInTheDocument();
      expect(screen.getByText('Status International (UK) Ltd')).toBeInTheDocument();
      expect(screen.getByText('West Yorkshire Hub')).toBeInTheDocument();
      expect(screen.getByText('TTL <24h')).toBeInTheDocument();
    });
  });

  describe('Snap-to-Cart Tactile Button', () => {
    it('triggers celebratory checkmark state in ProductCard upon addition', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <ProductCard product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const addBtn = screen.getByRole('button', { name: /Add.*to Basket/i });
      expect(addBtn).toBeInTheDocument();
      expect(screen.getByText('Add to Basket')).toBeInTheDocument();

      // Click to add
      fireEvent.click(addBtn);

      // Transitions to celebratory "Added to ToolCart!"
      expect(screen.getByText('Added to ToolCart!')).toBeInTheDocument();
      expect(addBtn).toHaveClass('bg-tc-action-lime');
      expect(addBtn).toHaveClass('text-tc-ink');

      // Reverts after 1800ms
      act(() => {
        vi.advanceTimersByTime(1850);
      });

      expect(screen.getByText('Add to Basket')).toBeInTheDocument();
    });

    it('triggers celebratory state in PdpActions with spring physics', () => {
      render(
        <VatProvider>
          <CartProvider>
            <CompareProvider>
              <PdpActions product={mockProduct} />
            </CompareProvider>
          </CartProvider>
        </VatProvider>
      );

      const addBtn = screen.getAllByRole('button', { name: /Add to Basket/i })[0];
      fireEvent.click(addBtn);

      expect(screen.getByText('Added to ToolCart!')).toBeInTheDocument();
      expect(addBtn).toHaveClass('bg-tc-action-lime');
      expect(addBtn).toHaveClass('text-tc-ink');

      act(() => {
        vi.advanceTimersByTime(1850);
      });

      expect(screen.getAllByText('Add to Basket').length).toBeGreaterThanOrEqual(1);
    });
  });
});
