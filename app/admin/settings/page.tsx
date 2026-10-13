import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, CheckCircle2, Server, Key, Lock, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  const infraHealth = [
    {
      name: 'Stripe Payments',
      mode: 'Test Mode (Restricted)',
      status: 'active',
      badge: <Badge variant="lime">pk_test_...</Badge>,
      details: 'Live payments strictly blocked under STAGING_ONLY gating. Test cards only.',
    },
    {
      name: 'Supabase PostgreSQL',
      mode: 'Multi-Region & Local Fallback',
      status: 'active',
      badge: <Badge variant="success">Connected</Badge>,
      details: 'In-memory database store initialized with 115 baseline catalog records.',
    },
    {
      name: 'Cloudflare R2 Object Storage',
      mode: 'Bucket: toolcart-assets',
      status: 'active',
      badge: <Badge variant="success">Ready</Badge>,
      details: 'Account ID: 6c9035e2ddbac196ef20ce5bfd9469cd. Verified catalog image storage.',
    },
    {
      name: 'Resend Transactional Email',
      mode: 'Sandbox Log Mode',
      status: 'active',
      badge: <Badge variant="neutral">Sandbox</Badge>,
      details: 'Outbound dispatch emails routed to console and test sink.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              Governance &amp; Launch Gates Configuration
            </h2>
            <Badge variant="lime">STAGING_ONLY: ACTIVE</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Production release requirements, legal gating, and cloud service configuration status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-tc-error" />
          <span className="text-xs font-bold text-tc-error">
            Live Storefront Gated
          </span>
        </div>
      </div>

      {/* Launch Gate Gating Notice */}
      <div className="p-5 bg-white border-2 border-tc-ink rounded-xl shadow-xs space-y-3">
        <div className="flex items-center gap-2 text-tc-ink font-heading font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-tc-primary" />
          <span>Non-Negotiable Operating Rule: Staging Only Mode</span>
        </div>
        <p className="text-xs text-tc-text-secondary leading-relaxed">
          The ToolCart brand and catalog remain provisional. Do not purchase domains, register trademarks, send customer marketing emails, or enable live credit card processing without explicit founder authorization. Keep <code className="font-mono font-bold text-tc-ink bg-tc-canvas px-1.5 py-0.5 rounded border border-tc-border">STAGING_ONLY=true</code> enabled across all environment variables.
        </p>
      </div>

      {/* Cloud Infrastructure Health Cards */}
      <div className="space-y-4">
        <h3 className="font-heading font-bold text-sm text-tc-ink">
          Cloud Infrastructure &amp; Adapter Readiness
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infraHealth.map((item, idx) => (
            <div
              key={idx}
              className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tc-surface-soft text-tc-primary flex items-center justify-center">
                    <Server className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-tc-ink">{item.name}</h4>
                    <span className="text-xs text-tc-text-secondary">{item.mode}</span>
                  </div>
                </div>
                {item.badge}
              </div>

              <p className="text-xs text-tc-text-secondary pt-2 border-t border-tc-border/60">
                {item.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Brand Identity & Compliance Checklist */}
      <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
        <h3 className="font-heading font-bold text-sm text-tc-ink border-b border-tc-border pb-3">
          Brand V3 Token Compliance Audit
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-tc-surface-soft rounded-lg space-y-1">
            <span className="font-bold text-tc-ink block">Authorized Identity</span>
            <p className="text-tc-text-secondary leading-snug">
              Ink (#182336), Industrial Cobalt (#2450B8), Action Lime (#DDF16A), Workshop White (#F7F8F5).
            </p>
          </div>

          <div className="p-3 bg-tc-surface-soft rounded-lg space-y-1">
            <span className="font-bold text-tc-ink block">Retired Palette Scans</span>
            <p className="text-tc-text-secondary leading-snug">
              Strict compliance: only authoritative tokens from design/tokens.css are permitted.
            </p>
          </div>

          <div className="p-3 bg-tc-surface-soft rounded-lg space-y-1">
            <span className="font-bold text-tc-ink block">WCAG AA Contrast Rule</span>
            <p className="text-tc-text-secondary leading-snug">
              White text on Action Lime is strictly prohibited. Dark Ink text (#182336) with 2px outlines enforced.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
