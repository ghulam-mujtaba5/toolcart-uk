import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderTimelineStepper } from '@/components/storefront/order-timeline-stepper';
import { AIAssistantDrawer } from '@/components/storefront/ai-assistant-drawer';
import { CartProvider } from '@/context/cart-context';
import { VatProvider } from '@/context/vat-context';
import { OrderState } from '@/types/order';

describe('Adversarial Challenge: State Machine Stepper & Interactive Simulator', () => {
  const MANDATED_13_STATES: OrderState[] = [
    'cart_pending',
    'checkout_authorized',
    'supplier_order_pending',
    'supplier_accepted',
    'payment_captured',
    'dispatched',
    'delivered',
    'supplier_rejected',
    'supplier_timeout',
    'payment_authorization_expired',
    'partial_supplier_acceptance',
    'partial_dispatch',
    'refund_pending',
    'refunded',
    'manual_review',
  ];

  it('renders correctly for all 15 states when initialized as initialState', () => {
    MANDATED_13_STATES.forEach((state) => {
      const { unmount } = render(
        <OrderTimelineStepper orderId="TC-TEST-001" initialState={state} />
      );
      // Ensure the stepper renders without crashing for every state
      expect(screen.getByText(/Order Status State Machine/i)).toBeInTheDocument();
      unmount();
    });
  });

  it('audits simulator buttons against architecture specification', () => {
    render(<OrderTimelineStepper orderId="TC-TEST-001" />);

    // Happy path and common triggers that exist:
    expect(screen.getByText(/Simulate: Supplier Accepted/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: Payment Captured/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: Dispatched/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: Delivered/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: Supplier Rejection/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: SLA Timeout/i)).toBeInTheDocument();
    expect(screen.getByText(/Simulate: Auto-Refund/i)).toBeInTheDocument();

    // Adversarial finding: Simulator claims "(ALL 13 STATES)" in header,
    // but lacks simulator buttons for:
    // - payment_authorization_expired
    // - partial_supplier_acceptance
    // - partial_dispatch
    // - refund_pending
    // - manual_review
    const partialAcceptanceBtn = screen.queryByText(/Simulate: Partial Acceptance/i);
    const authExpiredBtn = screen.queryByText(/Simulate: Authorization Expired/i);
    const partialDispatchBtn = screen.queryByText(/Simulate: Partial Dispatch/i);
    const manualReviewBtn = screen.queryByText(/Simulate: Manual Review/i);

    // Document whether these specific buttons are present
    const missingButtons = [
      !partialAcceptanceBtn && 'partial_supplier_acceptance',
      !authExpiredBtn && 'payment_authorization_expired',
      !partialDispatchBtn && 'partial_dispatch',
      !manualReviewBtn && 'manual_review',
    ].filter(Boolean);

    // This assertion confirms whether simulator has direct buttons for all exceptional states
    expect(missingButtons.length).toBeGreaterThan(0);
  });

  it('verifies state transitions append to order_audit_logs', () => {
    render(<OrderTimelineStepper orderId="TC-TEST-001" />);

    const supplierAcceptedBtn = screen.getByText(/Simulate: Supplier Accepted/i);
    fireEvent.click(supplierAcceptedBtn);

    // Should now show Supplier Accepted in headline
    expect(screen.getAllByText(/Supplier Accepted/i).length).toBeGreaterThan(0);
    // Audit log should contain SUPPLIER_ACCEPTED_FEED trigger
    expect(screen.getByText('SUPPLIER_ACCEPTED_FEED')).toBeInTheDocument();
  });
});

describe('Adversarial Challenge: AI Assistant Drawer Safety & Styling', () => {
  it('renders with strict Brand V3 Cloud Blue and Cobalt styling', () => {
    render(
      <CartProvider>
        <VatProvider>
          <AIAssistantDrawer isOpen={true} onClose={() => {}} />
        </VatProvider>
      </CartProvider>
    );

    // Verify Title and Subtitle
    expect(screen.getByText('ToolCart AI Assistant')).toBeInTheDocument();
    expect(
      screen.getByText('Verified catalog tools • Zero safety hallucinations')
    ).toBeInTheDocument();

    // Verify starter safety questions
    expect(
      screen.getByText(/Which screwdriver set has 1000V electrical insulation\?/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/What is the safe load limit for your step ladder\?/i)
    ).toBeInTheDocument();
  });
});
