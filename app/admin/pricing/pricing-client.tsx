'use client';

import React, { useState } from 'react';
import { MarkupRule } from '@/lib/db/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';
import {
  Percent,
  TrendingUp,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Save,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import { UK_VAT_RATE } from '@/lib/catalog/pricing';

interface PricingClientProps {
  initialRules: MarkupRule[];
  initialMarginFloor: number;
}

export function PricingClient({ initialRules, initialMarginFloor }: PricingClientProps) {
  const [rules, setRules] = useState<MarkupRule[]>(initialRules);
  const [marginFloor, setMarginFloor] = useState<number>(initialMarginFloor);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Margin simulator state
  const [simCost, setSimCost] = useState<string>('1.80');
  const [simCategory, setSimCategory] = useState<string>(initialRules[0]?.category_id || 'hand-tools');

  // Find active rule for simulation
  const selectedRule = rules.find((r) => r.category_id === simCategory) || rules[0];

  // Calculate simulation metrics
  const costNum = Math.max(0.01, parseFloat(simCost) || 0);
  let multiplier = 1.85;
  let activeTierLabel = 'Tier 2 (£1.00 – £3.00)';

  if (selectedRule) {
    if (costNum < 1.0) {
      multiplier = selectedRule.multiplier_under_1_pound;
      activeTierLabel = 'Tier 1 (< £1.00)';
    } else if (costNum <= 3.0) {
      multiplier = selectedRule.multiplier_1_to_3_pounds;
      activeTierLabel = 'Tier 2 (£1.00 – £3.00)';
    } else {
      multiplier = selectedRule.multiplier_over_3_pounds;
      activeTierLabel = 'Tier 3 (> £3.00)';
    }
  }

  const retailExVat = Math.round(costNum * multiplier * 100) / 100;
  const vatAmount = Math.round(retailExVat * UK_VAT_RATE * 100) / 100;
  const retailIncVat = Math.round((retailExVat + vatAmount) * 100) / 100;
  const grossProfit = Math.round((retailExVat - costNum) * 100) / 100;
  const grossMarginPercent = retailExVat > 0 ? ((retailExVat - costNum) / retailExVat) * 100 : 0;
  const categoryFloor = selectedRule?.margin_floor_percent ?? marginFloor;
  const isFloorViolated = grossMarginPercent < categoryFloor;

  const handleRuleChange = (
    categoryId: string,
    field: keyof Omit<MarkupRule, 'category_id' | 'category_name'>,
    value: number
  ) => {
    setRules((prev) =>
      prev.map((r) => (r.category_id === categoryId ? { ...r, [field]: value } : r))
    );
  };

  const handleSaveRule = async (categoryId: string) => {
    const targetRule = rules.find((r) => r.category_id === categoryId);
    if (!targetRule) return;

    try {
      setSavingId(categoryId);
      setFeedback(null);

      const res = await fetch(`/api/admin/pricing/rules/${categoryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          multiplier_under_1_pound: targetRule.multiplier_under_1_pound,
          multiplier_1_to_3_pounds: targetRule.multiplier_1_to_3_pounds,
          multiplier_over_3_pounds: targetRule.multiplier_over_3_pounds,
          margin_floor_percent: targetRule.margin_floor_percent,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update markup rule');
      }

      const data = await res.json();
      if (data.margin_floor !== undefined) {
        setMarginFloor(data.margin_floor);
      }
      setFeedback({
        type: 'success',
        message: `Successfully saved pricing rules for ${targetRule.category_name}.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Error updating rule',
      });
    } finally {
      setSavingId(null);
    }
  };

  const pricingTiers = [
    {
      tier: 'Consumables & Fixings (< £1.00)',
      costRange: 'Under £1.00 ex. VAT',
      multiplier: '2.20x',
      grossMargin: '54.5%',
      rationale: 'Absorbs pick-and-pack fulfillment costs on low-ticket consumables (screws, tape, fuses).',
      example: 'Cost £0.45 → Retail Ex £0.99 → Retail Inc £1.19',
    },
    {
      tier: 'Standard Hand Tools (£1.00 – £3.00)',
      costRange: '£1.00 to £3.00 ex. VAT',
      multiplier: '1.85x',
      grossMargin: '45.9%',
      rationale: 'Balanced commercial margin on popular trade items (pliers, screwdrivers, brushes).',
      example: 'Cost £1.80 → Retail Ex £3.33 → Retail Inc £4.00',
    },
    {
      tier: 'Site & Capital Equipment (> £3.00)',
      costRange: 'Over £3.00 ex. VAT',
      multiplier: '1.65x',
      grossMargin: '39.4%',
      rationale: 'Competitive trade pricing on high-ticket equipment while clearing the margin floor.',
      example: 'Cost £13.85 → Retail Ex £22.85 → Retail Inc £27.42',
    },
  ];

  return (
    <AdminErrorBoundary title="Pricing & Margin Control Engine">
      <div className="space-y-6">
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-heading font-extrabold text-xl text-tc-ink">
                Pricing &amp; Margin Control Engine
              </h2>
              <Badge variant="lime">Integer-Pence Precision</Badge>
            </div>
            <p className="text-xs text-tc-text-secondary mt-1">
              Server-side retail margin calculation tiers, category multipliers, and margin safety floor guard.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="success">Global Floor: {marginFloor}% Minimum</Badge>
          </div>
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

        {/* Live Margin Simulator & Floor Guard Workbench */}
        <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-tc-border pb-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-tc-primary" />
              <h3 className="font-heading font-bold text-base text-tc-ink">
                Live Margin Simulator &amp; Floor Verification
              </h3>
            </div>
            <span className="text-xs text-tc-text-secondary font-mono">
              Live Integer-Pence Simulation
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Input Controls */}
            <div className="lg:col-span-5 space-y-4 bg-tc-surface-soft p-4 rounded-xl border border-tc-border/60">
              <div>
                <label className="block text-xs font-bold text-tc-ink uppercase tracking-wider mb-1">
                  Wholesale Cost Price (Ex. VAT)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-tc-text-secondary">
                    £
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={simCost}
                    onChange={(e) => setSimCost(e.target.value)}
                    placeholder="1.80"
                    className="w-full h-10 pl-7 pr-3 bg-white border border-tc-border rounded-lg text-sm font-mono font-bold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-tc-ink uppercase tracking-wider mb-1">
                  Target Product Category
                </label>
                <select
                  value={simCategory}
                  onChange={(e) => setSimCategory(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-tc-border rounded-lg text-xs font-semibold text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                >
                  {rules.map((r) => (
                    <option key={r.category_id} value={r.category_id}>
                      {r.category_name} (Floor: {r.margin_floor_percent}%)
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-[11px] text-tc-text-secondary">
                Matched Rule: <strong className="text-tc-ink">{activeTierLabel}</strong> applying{' '}
                <strong className="text-tc-primary font-mono">{multiplier.toFixed(2)}x</strong> multiplier.
              </div>
            </div>

            {/* Simulated Retail Economics & Floor Status */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-tc-canvas border border-tc-border rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Retail Ex. VAT</span>
                <span className="font-heading font-extrabold text-lg text-tc-ink mt-0.5 block font-mono">
                  £{retailExVat.toFixed(2)}
                </span>
                <span className="text-[10px] text-tc-text-secondary">+20% VAT: £{vatAmount.toFixed(2)}</span>
              </div>

              <div className="p-3 bg-tc-canvas border border-tc-border rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Retail Inc. VAT</span>
                <span className="font-heading font-extrabold text-lg text-tc-primary mt-0.5 block font-mono">
                  £{retailIncVat.toFixed(2)}
                </span>
                <span className="text-[10px] text-tc-text-secondary">Storefront display</span>
              </div>

              <div className="p-3 bg-tc-canvas border border-tc-border rounded-lg">
                <span className="text-tc-text-secondary block font-medium">Gross Profit</span>
                <span className="font-heading font-extrabold text-lg text-tc-ink mt-0.5 block font-mono">
                  £{grossProfit.toFixed(2)}
                </span>
                <span className="text-[10px] text-tc-text-secondary">Per unit profit</span>
              </div>

              <div
                className={`p-3 rounded-lg border ${
                  isFloorViolated
                    ? 'bg-red-50 border-red-300 text-red-900'
                    : 'bg-green-50 border-green-300 text-green-900'
                }`}
              >
                <span className="block font-medium text-[11px]">Gross Margin %</span>
                <span className="font-heading font-extrabold text-lg mt-0.5 block font-mono">
                  {grossMarginPercent.toFixed(1)}%
                </span>
                <span className="text-[10px] font-bold block mt-0.5">
                  {isFloorViolated ? (
                    <span className="text-red-700 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Below {categoryFloor}% Floor
                    </span>
                  ) : (
                    <span className="text-green-700 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Clears {categoryFloor}% Floor
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tier Multipliers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingTiers.map((t, idx) => (
            <div
              key={idx}
              className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-tc-primary uppercase tracking-wider">
                    Tier {idx + 1}
                  </span>
                  <Badge variant="success">{t.grossMargin} Margin</Badge>
                </div>

                <h3 className="font-heading font-bold text-sm text-tc-ink mt-2">
                  {t.tier}
                </h3>
                <p className="text-xs text-tc-text-secondary font-mono mt-0.5">
                  {t.costRange}
                </p>

                <div className="mt-3 p-3 bg-tc-surface-soft rounded-lg text-center">
                  <span className="text-xs text-tc-text-secondary block">Markup Multiplier</span>
                  <span className="font-heading font-extrabold text-2xl text-tc-ink">
                    {t.multiplier}
                  </span>
                </div>

                <p className="text-xs text-tc-text-secondary mt-3 leading-relaxed">
                  {t.rationale}
                </p>
              </div>

              <div className="pt-3 border-t border-tc-border text-[11px] font-mono text-tc-ink bg-tc-canvas p-2.5 rounded">
                <span className="text-tc-text-secondary block font-sans font-bold mb-0.5">Example:</span>
                {t.example}
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Category Rules Table */}
        <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-tc-border flex items-center justify-between">
            <div>
              <h3 className="font-heading font-bold text-sm text-tc-ink">
                Category Margin Rules &amp; Floors
              </h3>
              <p className="text-xs text-tc-text-secondary">
                Edit category multipliers and margin floor percentages. Saved updates immediately govern retail catalog pricing.
              </p>
            </div>
            <Badge variant="neutral">{rules.length} Categories Configured</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-tc-border">
              <thead className="bg-[#182336] text-white">
                <tr>
                  <th className="py-3 px-4 font-bold uppercase text-[11px]">Category Name</th>
                  <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">&lt; £1.00 Multiplier</th>
                  <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">£1.00 – £3.00 Multiplier</th>
                  <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">&gt; £3.00 Multiplier</th>
                  <th className="py-3 px-4 font-bold uppercase text-[11px] text-center">Margin Floor %</th>
                  <th className="py-3 px-4 font-bold uppercase text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tc-border/60 bg-white">
                {rules.map((r) => {
                  const isSaving = savingId === r.category_id;
                  return (
                    <tr key={r.category_id} className="hover:bg-tc-surface-soft/60">
                      <td className="py-3 px-4 font-bold text-tc-ink">
                        {r.category_name}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.05"
                          min="1.0"
                          max="10.0"
                          value={r.multiplier_under_1_pound}
                          onChange={(e) =>
                            handleRuleChange(
                              r.category_id,
                              'multiplier_under_1_pound',
                              parseFloat(e.target.value) || 1.0
                            )
                          }
                          className="w-20 h-8 px-2 text-center font-mono font-bold text-tc-primary bg-white border border-tc-border rounded focus:outline-none focus:ring-1 focus:ring-tc-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.05"
                          min="1.0"
                          max="10.0"
                          value={r.multiplier_1_to_3_pounds}
                          onChange={(e) =>
                            handleRuleChange(
                              r.category_id,
                              'multiplier_1_to_3_pounds',
                              parseFloat(e.target.value) || 1.0
                            )
                          }
                          className="w-20 h-8 px-2 text-center font-mono font-bold text-tc-primary bg-white border border-tc-border rounded focus:outline-none focus:ring-1 focus:ring-tc-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <input
                          type="number"
                          step="0.05"
                          min="1.0"
                          max="10.0"
                          value={r.multiplier_over_3_pounds}
                          onChange={(e) =>
                            handleRuleChange(
                              r.category_id,
                              'multiplier_over_3_pounds',
                              parseFloat(e.target.value) || 1.0
                            )
                          }
                          className="w-20 h-8 px-2 text-center font-mono font-bold text-tc-primary bg-white border border-tc-border rounded focus:outline-none focus:ring-1 focus:ring-tc-primary"
                        />
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="number"
                            step="1"
                            min="10"
                            max="90"
                            value={r.margin_floor_percent}
                            onChange={(e) =>
                              handleRuleChange(
                                r.category_id,
                                'margin_floor_percent',
                                parseFloat(e.target.value) || 30
                              )
                            }
                            className="w-16 h-8 px-2 text-center font-mono font-bold text-tc-ink bg-white border border-tc-border rounded focus:outline-none focus:ring-1 focus:ring-tc-primary"
                          />
                          <span className="text-tc-text-secondary font-mono font-bold">%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="primary"
                          size="sm"
                          isLoading={isSaving}
                          onClick={() => handleSaveRule(r.category_id)}
                          className="text-xs h-8"
                        >
                          <Save className="w-3.5 h-3.5 mr-1" />
                          Save
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Safety Floor Governance Box */}
        <div className="p-4 bg-white border border-tc-border rounded-xl flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-tc-primary shrink-0 mt-0.5" />
          <div className="text-xs text-tc-ink leading-relaxed">
            <strong className="font-bold">Gross Margin Isolation Policy:</strong> All pricing rules execute server-side in{' '}
            <code className="text-tc-primary font-bold">src/lib/catalog/pricing.ts</code>. Wholesale costs are never transmitted
            in public storefront GraphQL/REST payloads. If wholesale quote prices rise, prices below the margin floor
            automatically trigger an administrative review requirement before storefront visibility.
          </div>
        </div>
      </div>
    </AdminErrorBoundary>
  );
}
