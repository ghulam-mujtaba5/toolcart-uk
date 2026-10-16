import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Lock, ExternalLink, ArrowLeft } from 'lucide-react';
import { CookiePolicyClientActions } from '../cookies/cookie-policy-client-actions';

export const metadata: Metadata = {
  title: 'Privacy Policy | ToolCart UK',
  description:
    'ToolCart UK Privacy Policy and statutory data processing notice in accordance with the UK Data Protection Act 2018 and UK GDPR.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-tc-graphite">
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tc-primary hover:text-tc-primary-hover transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hardware Catalog</span>
        </Link>
      </nav>

      <div className="bg-white rounded-card border-2 border-tc-ink p-6 sm:p-8 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-tc-primary font-heading">
                UK GDPR &amp; Data Protection
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
              Privacy Policy &amp; Data Rights
            </h1>
            <p className="text-sm text-tc-text-secondary">
              How ToolCart UK protects and processes your data across trade orders, quotes, and web browsing.
            </p>
          </div>
          <CookiePolicyClientActions />
        </div>
      </div>

      <div className="space-y-8">
        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">1. Data Controller Overview</h2>
          <p className="text-sm leading-relaxed">
            ToolCart UK Ltd operates this digital hardware marketplace. We take data protection seriously and adhere to
            the UK General Data Protection Regulation (UK GDPR) and Data Protection Act 2018. For questions about your
            personal data or to exercise your rights, contact{' '}
            <span className="font-mono text-tc-primary">privacy@toolcart.co.uk</span>.
          </p>
        </section>

        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">2. Information We Collect</h2>
          <ul className="list-disc list-inside space-y-2 text-sm leading-relaxed">
            <li>
              <strong>Trade Account &amp; Order Data:</strong> Company name, VAT number, billing/delivery addresses, contact name, and purchase history.
            </li>
            <li>
              <strong>Payment Data:</strong> All payments are tokenized securely through Stripe. ToolCart UK never stores full card numbers.
            </li>
            <li>
              <strong>Digital Browsing &amp; Cookies:</strong> Session tokens, basket ID, VAT display preferences, and consented telemetry. See our{' '}
              <Link href="/cookies" className="text-tc-primary underline font-semibold">
                dedicated Cookie Policy
              </Link>{' '}
              for granular disclosures.
            </li>
          </ul>
        </section>

        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">3. Your Rights Under UK Law</h2>
          <p className="text-sm leading-relaxed">
            You have the right to request access to your personal information, rectification of inaccurate details, erasure (&apos;right to be forgotten&apos;),
            data portability, and the right to object to or restrict processing. You can manage your cookie consent at any time using the preferences button.
          </p>
        </section>
      </div>
    </div>
  );
}
