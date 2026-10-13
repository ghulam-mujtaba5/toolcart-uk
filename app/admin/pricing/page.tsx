import React from 'react';
import { getDb } from '@/lib/db';
import { Badge } from '@/components/ui/badge';
import { Percent, TrendingUp, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { formatGbp, UK_VAT_RATE } from '@/lib/catalog/pricing';

export const revalidate = 0;

export default async function AdminPricingPage() {
  const db = getDb();
  const rules = await db.pricing.getMarkupRules();
  const marginFloor = await db.pricing.getMarginFloor();

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
      rationale: 'Balanced commercial margin on popular trade trade items (pliers, screwdrivers, brushes).',
      example: 'Cost £1.80 → Retail Ex £3.33 → Retail Inc £4.00',
    },
    {
      tier: 'Site & Capital Equipment (> £3.00)',
      costRange: 'Over £3.00 ex. VAT',
      multiplier: '1.65x',
      grossMargin: '39.4%',
      rationale: 'Competitive trade pricing on high-ticket equipment while clearing the 30% margin floor.',
      example: 'Cost £13.85 → Retail Ex £22.85 → Retail Inc £27.42',
    },
  ];

  return (
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
            Server-side retail margin calculation tiers, category multipliers, and 30% gross margin safety floor.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success">Floor: {marginFloor}% Minimum</Badge>
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

      {/* Category Rules Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-tc-border flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-sm text-tc-ink">
              Category Margin Rules &amp; Floors
            </h3>
            <p className="text-xs text-tc-text-secondary">
              Applied automatically across the 115 quoted baseline hardware lines.
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
                <th className="py-3 px-4 font-bold uppercase text-[11px] text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {rules.map((r) => (
                <tr key={r.category_id} className="hover:bg-tc-surface-soft/60">
                  <td className="py-3 px-4 font-bold text-tc-ink">
                    {r.category_name}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-tc-primary">
                    {r.multiplier_under_1_pound.toFixed(2)}x
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-tc-primary">
                    {r.multiplier_1_to_3_pounds.toFixed(2)}x
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-tc-primary">
                    {r.multiplier_over_3_pounds.toFixed(2)}x
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Badge variant="success">{r.margin_floor_percent}%</Badge>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="inline-flex items-center gap-1 text-tc-success text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
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
          in public storefront GraphQL/REST payloads. If wholesale quote prices rise, prices below the 30% margin floor
          automatically trigger an administrative review requirement before storefront visibility.
        </div>
      </div>
    </div>
  );
}
