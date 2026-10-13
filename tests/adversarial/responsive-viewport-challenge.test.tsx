import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Header } from '@/components/storefront/header';
import { Footer } from '@/components/storefront/footer';
import { OrderTimelineStepper } from '@/components/storefront/order-timeline-stepper';
import { VatProvider } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe('Adversarial Challenge: Responsive & Mobile Viewport Behavior (360px vs 1440px)', () => {
  it('Header provides dedicated mobile menu and mobile search input for 360px viewports', () => {
    render(
      <VatProvider>
        <CartProvider>
          <Header />
        </CartProvider>
      </VatProvider>
    );

    // Mobile Hamburger button has md:hidden class
    const hamburgerBtn = screen.getByLabelText(/Open mobile navigation menu/i);
    expect(hamburgerBtn).toBeInTheDocument();
    expect(hamburgerBtn.className).toContain('md:hidden');

    // Mobile search row has md:hidden class
    const mobileSearchInputs = screen.getAllByPlaceholderText(/Search 115 trade tools & hardware.../i);
    expect(mobileSearchInputs.length).toBeGreaterThan(0);

    // Desktop search bar has hidden md:flex
    const desktopSearch = screen.getByPlaceholderText(/Search tools, fixings, tapes, or enter SKU/i);
    expect(desktopSearch.closest('.hidden.md\\:flex')).not.toBeNull();

    // Clicking mobile menu opens the mobile drawer
    fireEvent.click(hamburgerBtn);
    expect(screen.getByText('Trade Portal')).toBeInTheDocument();
    expect(screen.getByText('Project Kits')).toBeInTheDocument();
  });

  it('OrderTimelineStepper handles narrow 360px mobile viewports with horizontal scroll safety', () => {
    const { container } = render(
      <OrderTimelineStepper orderId="TC-MOBILE-360" />
    );

    // Stepper must have overflow-x-auto to prevent mobile horizontal blow-out at 360px
    const stepperScrollContainer = container.querySelector('.overflow-x-auto');
    expect(stepperScrollContainer).not.toBeNull();

    // Responsive flex wrapping on the state status card
    const statusCard = container.querySelector('.sm\\:flex-row');
    expect(statusCard).not.toBeNull();
  });

  it('Footer adapts grid columns responsively (grid-cols-1 md:grid-cols-2 lg:grid-cols-5)', () => {
    const { container } = render(<Footer />);

    const footerGrid = container.querySelector('.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-5');
    expect(footerGrid).not.toBeNull();
  });
});
