'use client';

import React, { useState } from 'react';
import { TradeCustomerRecord } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Building2, Mail, Phone, ShieldCheck } from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

export interface CustomersClientProps {
  initialCustomers: TradeCustomerRecord[];
}

export function CustomersClient({ initialCustomers }: CustomersClientProps) {
  const [customers, setCustomers] = useState<TradeCustomerRecord[]>(initialCustomers);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleStatusChange = async (
    id: string,
    newStatus: 'approved' | 'rejected' | 'pending'
  ) => {
    setLoadingId(id);
    setErrorMessage(null);
    setSuccessMessage(null);
    const previous = [...customers];

    // Optimistic update
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update customer status');
      }

      setSuccessMessage(`Account status successfully updated to ${newStatus}.`);
    } catch (err: unknown) {
      // Rollback on failure
      setCustomers(previous);
      setErrorMessage(err instanceof Error ? err.message : 'Error updating trade customer');
    } finally {
      setLoadingId(null);
    }
  };

  const pending = customers.filter((c) => c.status === 'pending');
  const approved = customers.filter((c) => c.status === 'approved');

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div
          role="alert"
          aria-live="assertive"
          className="p-3 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg flex items-center justify-between"
        >
          <span>{errorMessage}</span>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-red-700 hover:text-red-900 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}
      {successMessage && (
        <div
          role="status"
          aria-live="polite"
          className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center justify-between"
        >
          <span>{successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-2"
          >
            &times;
          </button>
        </div>
      )}

      {/* Pending Applications Section */}
      <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-tc-border pb-3">
          <div>
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Trade Account Approval Queue
            </h3>
            <p className="text-xs text-tc-text-secondary">
              Review B2B trade applications, Companies House numbers, and 30-day net credit limits.
            </p>
          </div>
          <Badge variant="warning">{pending.length} Pending Review</Badge>
        </div>

        {pending.length === 0 ? (
          <p className="py-6 text-center text-xs text-tc-text-secondary">
            No pending trade account applications awaiting review.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((c) => (
              <div
                key={c.id}
                className="p-4 bg-tc-surface-soft border border-tc-border rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-tc-ink">{c.company_name}</span>
                    <Badge variant="warning">Pending</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-tc-text-secondary">
                    <span>Contact: {c.contact_name}</span>
                    <span>•</span>
                    <span className="font-mono">{c.email}</span>
                    <span>•</span>
                    <span>Tel: {c.phone}</span>
                    {c.companies_house_number && (
                      <>
                        <span>•</span>
                        <span>CRN: {c.companies_house_number}</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs text-tc-primary font-semibold mt-1">
                    Requested Credit Limit: {formatGbp(c.credit_limit_gbp)} (30-day Net Terms)
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={loadingId === c.id}
                    onClick={() => handleStatusChange(c.id, 'approved')}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Approve Trade Account
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={loadingId === c.id}
                    onClick={() => handleStatusChange(c.id, 'rejected')}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Approved Accounts Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-tc-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Approved Trade Credit Accounts
            </h3>
            <p className="text-xs text-tc-text-secondary">
              Active accounts eligible for B2B trade discount tiers and invoicing.
            </p>
          </div>
          <Badge variant="neutral">{approved.length} Active Accounts</Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white">
              <tr>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Company Name</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Contact</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">VAT / CRN</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px]">Trade Tier</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-right">Credit Limit</th>
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {approved.map((c) => (
                <tr key={c.id} className="hover:bg-tc-surface-soft/60">
                  <td className="py-3.5 px-4 font-bold text-tc-ink">
                    {c.company_name}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-tc-ink">{c.contact_name}</span>
                      <span className="text-[11px] text-tc-text-secondary">{c.email}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-tc-text-secondary">
                    {c.vat_number || c.companies_house_number || '—'}
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant={c.trade_tier === 'tier_2_10pct' ? 'lime' : 'neutral'}>
                      {c.trade_tier === 'tier_2_10pct' ? 'Tier 2 (10% Off)' : 'Tier 1 (5% Off)'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-tc-ink tabular-nums">
                    {formatGbp(c.credit_limit_gbp)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant="success">Approved</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
