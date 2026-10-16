'use client';

import React, { useState } from 'react';
import { SupplierRecord } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import {
  Truck,
  Clock,
  ShieldAlert,
  Mail,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Save,
} from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

interface SuppliersClientProps {
  initialSuppliers: SupplierRecord[];
}

export function SuppliersClient({ initialSuppliers }: SuppliersClientProps) {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>(initialSuppliers);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSyncMap, setLastSyncMap] = useState<Record<string, string>>({});

  const handleSyncFeed = async (supplierId: string) => {
    try {
      setSyncingId(supplierId);
      setFeedback(null);

      const res = await fetch(`/api/admin/suppliers/${supplierId}/sync`, {
        method: 'POST',
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to sync supplier feed');
      }

      const data = await res.json();
      setLastSyncMap((prev) => ({ ...prev, [supplierId]: 'Just now' }));
      setFeedback({
        type: 'success',
        message: data.message || `Feed for ${supplierId} synchronized successfully.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Feed sync failed',
      });
    } finally {
      setSyncingId(null);
    }
  };

  const handleToggleAgreement = async (supplier: SupplierRecord) => {
    const updatedStatus = !supplier.direct_dispatch_agreement_signed;
    try {
      setSavingId(supplier.id);
      setFeedback(null);

      const res = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          direct_dispatch_agreement_signed: updatedStatus,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update SLA agreement');
      }

      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === supplier.id ? { ...s, direct_dispatch_agreement_signed: updatedStatus } : s
        )
      );

      setFeedback({
        type: 'success',
        message: `SLA Agreement for ${supplier.name} marked as ${updatedStatus ? 'Signed' : 'Pending'}.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error updating SLA agreement',
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleUpdateField = (
    supplierId: string,
    field: keyof Omit<SupplierRecord, 'id' | 'name' | 'contact_email'>,
    value: unknown
  ) => {
    setSuppliers((prev) =>
      prev.map((s) => (s.id === supplierId ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveParameters = async (supplier: SupplierRecord) => {
    try {
      setSavingId(supplier.id);
      setFeedback(null);

      const res = await fetch(`/api/admin/suppliers/${supplier.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          carriage_paid_threshold_gbp: supplier.carriage_paid_threshold_gbp,
          standard_carriage_gbp: supplier.standard_carriage_gbp,
          stock_feed_ttl_minutes: supplier.stock_feed_ttl_minutes,
          lead_time_days: supplier.lead_time_days,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update supplier parameters');
      }

      setFeedback({
        type: 'success',
        message: `Parameters for ${supplier.name} saved successfully.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error updating parameters',
      });
    } finally {
      setSavingId(null);
    }
  };

  return (
    <AdminErrorBoundary title="Supplier Directory & SLA Controls">
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-xl text-tc-ink">
                Supplier Directory &amp; Carriage Terms
              </h2>
              <Badge variant="neutral">{suppliers.length} Configured Vendor</Badge>
            </div>
            <p className="text-xs text-tc-text-secondary mt-1">
              Supplier dropship integration parameters, stock feed TTL policies, and wholesale carriage thresholds.
            </p>
          </div>

          <Badge variant="lime">Launch Gate 4 Enforced</Badge>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            role="alert"
            className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
              feedback.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <div className="flex items-center gap-2 font-medium">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-red-600" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setFeedback(null)}
              className="text-xs underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Supplier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {suppliers.map((s) => {
            const isSyncing = syncingId === s.id;
            const isSaving = savingId === s.id;
            const lastSync = lastSyncMap[s.id] || 'Fresh (Active)';

            return (
              <div
                key={s.id}
                className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-tc-border pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-tc-primary text-white flex items-center justify-center font-bold text-lg font-heading">
                      SI
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-tc-ink">{s.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-tc-text-secondary mt-0.5">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{s.contact_email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {s.direct_dispatch_agreement_signed ? (
                      <Badge variant="success">SLA Signed</Badge>
                    ) : (
                      <Badge variant="warning">SLA Pending</Badge>
                    )}
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => handleToggleAgreement(s)}
                      className="text-[11px] underline font-bold text-tc-primary hover:opacity-80"
                    >
                      {s.direct_dispatch_agreement_signed ? 'Revoke SLA' : 'Sign SLA'}
                    </button>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-tc-surface-soft rounded-lg">
                    <span className="text-tc-text-secondary block font-medium">Quoted Catalog SKUs</span>
                    <span className="font-heading font-bold text-lg text-tc-ink mt-0.5 block">
                      {s.quoted_sku_count} lines
                    </span>
                    <span className="text-[10px] text-tc-text-secondary">Doc Date: {s.quote_doc_date}</span>
                  </div>

                  <div className="p-3 bg-tc-surface-soft rounded-lg flex flex-col justify-between">
                    <div>
                      <span className="text-tc-text-secondary block font-medium">Stock Feed TTL</span>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock className="w-4 h-4 text-tc-primary" />
                        <span className="font-heading font-bold text-lg text-tc-ink">
                          {s.stock_feed_ttl_minutes} min
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-tc-success font-semibold mt-1">
                      Feed Status: {lastSync}
                    </span>
                  </div>

                  <div className="p-3 bg-tc-surface-soft rounded-lg">
                    <label className="text-tc-text-secondary block font-medium mb-1">
                      Carriage Paid Floor (£)
                    </label>
                    <input
                      type="number"
                      step="5.00"
                      min="0"
                      value={s.carriage_paid_threshold_gbp}
                      onChange={(e) =>
                        handleUpdateField(
                          s.id,
                          'carriage_paid_threshold_gbp',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-2 bg-white border border-tc-border rounded text-sm font-mono font-bold text-tc-ink focus:outline-none focus:ring-1 focus:ring-tc-primary"
                    />
                    <span className="text-[10px] text-tc-text-secondary mt-1 block">
                      Ex. VAT free carriage
                    </span>
                  </div>

                  <div className="p-3 bg-tc-surface-soft rounded-lg">
                    <label className="text-tc-text-secondary block font-medium mb-1">
                      Standard Carriage (£)
                    </label>
                    <input
                      type="number"
                      step="0.50"
                      min="0"
                      value={s.standard_carriage_gbp}
                      onChange={(e) =>
                        handleUpdateField(
                          s.id,
                          'standard_carriage_gbp',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-2 bg-white border border-tc-border rounded text-sm font-mono font-bold text-tc-ink focus:outline-none focus:ring-1 focus:ring-tc-primary"
                    />
                    <span className="text-[10px] text-tc-text-secondary mt-1 block">
                      Lead Time: {s.lead_time_days}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-2 border-t border-tc-border">
                  <Button
                    variant="outline"
                    size="sm"
                    isLoading={isSyncing}
                    onClick={() => handleSyncFeed(s.id)}
                    className="text-xs h-9"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Sync Feed Now
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={isSaving}
                    onClick={() => handleSaveParameters(s)}
                    className="text-xs h-9"
                  >
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save Parameters
                  </Button>
                </div>

                {/* Governance Warning Box */}
                {!s.direct_dispatch_agreement_signed && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="leading-relaxed">
                      <strong>Supplier Dropship Gate:</strong> Direct dispatch contract has not yet been executed with
                      Status International (UK) Ltd. Inventory remains uncommitted and quotes are subject to warehouse verification.
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminErrorBoundary>
  );
}
