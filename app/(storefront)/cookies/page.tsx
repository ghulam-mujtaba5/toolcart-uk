import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ShieldCheck, Cookie, Lock, SlidersHorizontal, ArrowLeft, ExternalLink } from 'lucide-react';
import { TOOLCART_COOKIE_DEFINITIONS } from '@/types/cookie-consent';
import { CookiePolicyClientActions } from './cookie-policy-client-actions';

export const metadata: Metadata = {
  title: 'UK Cookie & Privacy Policy | ToolCart UK',
  description:
    'Comprehensive UK PECR and UK GDPR cookie statement for ToolCart UK. Complete breakdown of strictly necessary, functional, and analytics cookies.',
};

export default function CookiesPolicyPage() {
  const necessaryCookies = TOOLCART_COOKIE_DEFINITIONS.filter((c) => c.category === 'necessary');
  const functionalCookies = TOOLCART_COOKIE_DEFINITIONS.filter((c) => c.category === 'functional');
  const analyticsCookies = TOOLCART_COOKIE_DEFINITIONS.filter((c) => c.category === 'analytics');
  const marketingCookies = TOOLCART_COOKIE_DEFINITIONS.filter((c) => c.category === 'marketing');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 text-tc-graphite">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tc-primary hover:text-tc-primary-hover transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Hardware Catalog</span>
        </Link>
      </nav>

      {/* Hero Header */}
      <div className="bg-white rounded-card border-2 border-tc-ink p-6 sm:p-8 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center shrink-0">
                <Cookie className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-tc-primary font-heading">
                UK Regulatory Transparency
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
              Cookie Policy &amp; Statutory Disclosures
            </h1>
            <p className="text-sm text-tc-text-secondary">
              Compliant with the Privacy and Electronic Communications Regulations (PECR) and UK General Data Protection Regulation (UK GDPR).
            </p>
          </div>

          <CookiePolicyClientActions />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10">
        {/* Section 1: Introduction */}
        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">1. What Are Cookies and How ToolCart UK Uses Them</h2>
          <p className="text-sm text-tc-graphite leading-relaxed">
            Cookies and local storage technologies are small text files placed on your computer or mobile device when you visit websites.
            At <strong>ToolCart UK Ltd</strong>, we use cookies to ensure our digital trade catalog works reliably, to maintain your active
            hardware basket across visits, to remember your preferred VAT display mode (Inc. VAT vs Ex. VAT), and to measure platform performance
            for continuous improvements.
          </p>
          <p className="text-sm text-tc-graphite leading-relaxed">
            Under UK PECR regulations enforced by the Information Commissioner’s Office (ICO), cookies that are not strictly essential for the
            delivery of our services require your explicit, informed, and unambiguous opt-in consent before being placed on your device.
          </p>
        </section>

        {/* Section 2: Categories of Cookies */}
        <section className="space-y-6">
          <h2 className="font-heading font-extrabold text-xl text-tc-ink">2. Categories of Cookies We Operate</h2>

          {/* Necessary */}
          <div className="bg-white rounded-card border border-tc-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-tc-primary" />
                <h3 className="font-heading font-bold text-base text-tc-ink">Strictly Necessary Cookies</h3>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-md bg-tc-ink text-white">
                Exempt from Opt-In
              </span>
            </div>
            <p className="text-sm text-tc-graphite leading-relaxed">
              These cookies are technically indispensable to provide you with basic eCommerce functionality. They enable session management,
              CSRF protection, basket persistence during multi-page browsing, and persistence of your VAT preference. They cannot be turned off
              without breaking core store features.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tc-border-strong text-tc-ink font-bold">
                    <th className="py-2 pr-3">Cookie Name</th>
                    <th className="py-2 pr-3">Storage Type</th>
                    <th className="py-2 pr-3">Lifespan</th>
                    <th className="py-2">Operational Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border">
                  {necessaryCookies.map((c) => (
                    <tr key={c.name} className="hover:bg-tc-canvas/50">
                      <td className="py-2 pr-3 font-mono font-medium text-tc-ink">{c.name}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.type}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.expiry}</td>
                      <td className="py-2 text-tc-graphite">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Functional */}
          <div className="bg-white rounded-card border border-tc-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-tc-primary" />
              <h3 className="font-heading font-bold text-base text-tc-ink">Functional &amp; Trade Preferences</h3>
            </div>
            <p className="text-sm text-tc-graphite leading-relaxed">
              These cookies allow our website to remember choices you make (such as trade discount tiers, comparison drawer items, or
              recently viewed fixings) to provide a richer, tailored experience on your job sites.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tc-border-strong text-tc-ink font-bold">
                    <th className="py-2 pr-3">Cookie Name</th>
                    <th className="py-2 pr-3">Storage Type</th>
                    <th className="py-2 pr-3">Lifespan</th>
                    <th className="py-2">Operational Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border">
                  {functionalCookies.map((c) => (
                    <tr key={c.name} className="hover:bg-tc-canvas/50">
                      <td className="py-2 pr-3 font-mono font-medium text-tc-ink">{c.name}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.type}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.expiry}</td>
                      <td className="py-2 text-tc-graphite">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Analytics */}
          <div className="bg-white rounded-card border border-tc-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-tc-primary" />
              <h3 className="font-heading font-bold text-base text-tc-ink">Analytics &amp; Performance Telemetry</h3>
            </div>
            <p className="text-sm text-tc-graphite leading-relaxed">
              These cookies enable us to measure aggregate store visits, understand search term trends (e.g. searching for VDE screwdrivers vs.
              hammer drills), monitor page load times, and diagnose client errors. All IP addresses are truncated to safeguard personal privacy.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tc-border-strong text-tc-ink font-bold">
                    <th className="py-2 pr-3">Cookie Name</th>
                    <th className="py-2 pr-3">Storage Type</th>
                    <th className="py-2 pr-3">Lifespan</th>
                    <th className="py-2">Operational Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border">
                  {analyticsCookies.map((c) => (
                    <tr key={c.name} className="hover:bg-tc-canvas/50">
                      <td className="py-2 pr-3 font-mono font-medium text-tc-ink">{c.name}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.type}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.expiry}</td>
                      <td className="py-2 text-tc-graphite">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Marketing */}
          <div className="bg-white rounded-card border border-tc-border p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Cookie className="w-5 h-5 text-tc-primary" />
              <h3 className="font-heading font-bold text-base text-tc-ink">Personalised Trade Recommendations</h3>
            </div>
            <p className="text-sm text-tc-graphite leading-relaxed">
              These cookies track hardware categories relevant to your trade to provide tailored project kit recommendations and trade stock
              reorder alerts. We never sell your personal contact information to third-party data brokers.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-tc-border-strong text-tc-ink font-bold">
                    <th className="py-2 pr-3">Cookie Name</th>
                    <th className="py-2 pr-3">Storage Type</th>
                    <th className="py-2 pr-3">Lifespan</th>
                    <th className="py-2">Operational Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tc-border">
                  {marketingCookies.map((c) => (
                    <tr key={c.name} className="hover:bg-tc-canvas/50">
                      <td className="py-2 pr-3 font-mono font-medium text-tc-ink">{c.name}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.type}</td>
                      <td className="py-2 pr-3 text-tc-text-secondary">{c.expiry}</td>
                      <td className="py-2 text-tc-graphite">{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Section 3: How to Manage or Withdraw Consent */}
        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">3. How to Withdraw or Alter Your Consent</h2>
          <p className="text-sm text-tc-graphite leading-relaxed">
            In compliance with the ICO guidance, you can modify or withdraw your cookie preferences at any time with the same ease as giving
            them. You may click the &quot;Cookie Preferences&quot; button located in the footer of any page, click the floating shield button in the
            bottom corner of your screen, or use the interactive button at the top of this policy page.
          </p>
          <p className="text-sm text-tc-graphite leading-relaxed">
            You can also control cookies directly through your web browser settings. Most modern browsers (Google Chrome, Mozilla Firefox, Apple
            Safari, Microsoft Edge) provide settings to block all cookies or notify you when a cookie is set. Note that disabling strictly
            necessary cookies in your browser settings will prevent you from completing orders or holding items in your basket.
          </p>
        </section>

        {/* Section 4: Contact Information */}
        <section className="bg-white rounded-card border border-tc-border p-6 space-y-3">
          <h2 className="font-heading font-bold text-lg text-tc-ink">4. Data Protection &amp; Contact Information</h2>
          <p className="text-sm text-tc-graphite leading-relaxed">
            If you have questions regarding ToolCart UK&apos;s privacy practices, cookie controls, or wish to exercise your rights under the UK GDPR
            (such as the right to access, rectify, or erase your personal data), please contact our Data Compliance team:
          </p>
          <div className="p-4 rounded-xl bg-tc-canvas border border-tc-border text-xs sm:text-sm space-y-1">
            <p><strong>ToolCart UK Ltd — Data Privacy &amp; Compliance</strong></p>
            <p>Email: <span className="font-mono text-tc-primary">privacy@toolcart.co.uk</span></p>
            <p>Address: ToolCart UK Direct Distribution Hub, United Kingdom</p>
            <p className="pt-2 text-tc-text-secondary">
              You also have the right to lodge a complaint with the UK Information Commissioner’s Office (ICO) at{' '}
              <a
                href="https://ico.org.uk"
                target="_blank"
                rel="noreferrer noopener"
                className="text-tc-primary underline inline-flex items-center gap-1"
              >
                ico.org.uk <ExternalLink className="w-3 h-3" />
              </a>
              .
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
