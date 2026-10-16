import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PricingClient } from '@/app/admin/pricing/pricing-client';
import { SuppliersClient } from '@/app/admin/suppliers/suppliers-client';
import { MarkupRule, SupplierRecord } from '@/lib/db/types';

const mockRules: MarkupRule[] = [
  {
    category_id: 'hand-tools',
    category_name: 'Hand Tools',
    multiplier_under_1_pound: 2.2,
    multiplier_1_to_3_pounds: 1.85,
    multiplier_over_3_pounds: 1.65,
    margin_floor_percent: 30,
  },
  {
    category_id: 'fixings',
    category_name: 'Fixings & Fasteners',
    multiplier_under_1_pound: 2.5,
    multiplier_1_to_3_pounds: 2.0,
    multiplier_over_3_pounds: 1.75,
    margin_floor_percent: 35,
  },
];

const mockSuppliers: SupplierRecord[] = [
  {
    id: 'status-uk',
    name: 'Status International (UK) Ltd',
    contact_email: 'dropship@statusinternational.co.uk',
    lead_time_days: '2-3 Business Days',
    carriage_paid_threshold_gbp: 50.0,
    standard_carriage_gbp: 4.95,
    quoted_sku_count: 115,
    quote_doc_date: '2026-03-15',
    stock_feed_ttl_minutes: 60,
    feed_last_synced_at: '2026-03-15T10:00:00Z',
    direct_dispatch_agreement_signed: false,
  },
];

describe('Admin Pricing & Margin Control Engine (PricingClient)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders initial pricing tiers, simulator, and category table', () => {
    render(<PricingClient initialRules={mockRules} initialMarginFloor={30} />);

    expect(screen.getByText('Pricing & Margin Control Engine')).toBeInTheDocument();
    expect(screen.getByText('Global Floor: 30% Minimum')).toBeInTheDocument();
    expect(screen.getByText('Live Margin Simulator & Floor Verification')).toBeInTheDocument();
    expect(screen.getByText('Hand Tools')).toBeInTheDocument();
    expect(screen.getByText('Fixings & Fasteners')).toBeInTheDocument();
  });

  it('computes live retail prices and margin percentage in the simulator', async () => {
    render(<PricingClient initialRules={mockRules} initialMarginFloor={30} />);

    const costInput = screen.getByPlaceholderText('1.80');
    expect(costInput).toBeInTheDocument();

    // Cost 1.80 * 1.85 = 3.33 retail ex. VAT
    expect(screen.getByText('£3.33')).toBeInTheDocument();
    // Gross margin: (3.33 - 1.80) / 3.33 = 45.9%
    expect(screen.getByText('45.9%')).toBeInTheDocument();
    expect(screen.getByText(/Clears 30% Floor/i)).toBeInTheDocument();
  });

  it('invokes PATCH API when saving category markup rule updates', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        rule: { ...mockRules[0], multiplier_1_to_3_pounds: 1.95 },
        margin_floor: 30,
        message: 'Markup rules updated for category Hand Tools',
      }),
    });
    global.fetch = fetchMock;

    render(<PricingClient initialRules={mockRules} initialMarginFloor={30} />);

    const saveButtons = screen.getAllByRole('button', { name: /save/i });
    expect(saveButtons.length).toBeGreaterThan(0);

    fireEvent.click(saveButtons[0]);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/pricing/rules/hand-tools',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });

    expect(
      await screen.findByText('Successfully saved pricing rules for Hand Tools.')
    ).toBeInTheDocument();
  });
});

describe('Supplier Dropship & SLA Controls (SuppliersClient)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders supplier information and SLA pending badge', () => {
    render(<SuppliersClient initialSuppliers={mockSuppliers} />);

    expect(screen.getByText('Status International (UK) Ltd')).toBeInTheDocument();
    expect(screen.getByText('dropship@statusinternational.co.uk')).toBeInTheDocument();
    expect(screen.getByText('SLA Pending')).toBeInTheDocument();
    expect(screen.getByText('115 lines')).toBeInTheDocument();
  });

  it('triggers feed synchronization on Sync Feed Now button click', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        message: 'Inventory & price feed for Status International (UK) Ltd synchronized successfully.',
      }),
    });
    global.fetch = fetchMock;

    render(<SuppliersClient initialSuppliers={mockSuppliers} />);

    const syncBtn = screen.getByRole('button', { name: /sync feed now/i });
    fireEvent.click(syncBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/api/admin/suppliers/status-uk/sync', {
        method: 'POST',
      });
    });

    expect(
      await screen.findByText(
        'Inventory & price feed for Status International (UK) Ltd synchronized successfully.'
      )
    ).toBeInTheDocument();
    expect(screen.getByText('Feed Status: Just now')).toBeInTheDocument();
  });

  it('toggles SLA agreement status via API call', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        supplier: { ...mockSuppliers[0], direct_dispatch_agreement_signed: true },
      }),
    });
    global.fetch = fetchMock;

    render(<SuppliersClient initialSuppliers={mockSuppliers} />);

    const signSlaBtn = screen.getByRole('button', { name: /sign sla/i });
    fireEvent.click(signSlaBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/admin/suppliers/status-uk',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ direct_dispatch_agreement_signed: true }),
        })
      );
    });

    expect(
      await screen.findByText(/SLA Agreement for Status International \(UK\) Ltd marked as Signed/i)
    ).toBeInTheDocument();
  });
});
