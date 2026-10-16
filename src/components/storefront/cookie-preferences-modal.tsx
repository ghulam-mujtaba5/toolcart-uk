'use client';

import React, { useState, useEffect, useId } from 'react';
import Link from 'next/link';
import { X, ShieldCheck, Check, SlidersHorizontal, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useCookieConsent } from '@/context/cookie-consent-context';
import { TOOLCART_COOKIE_DEFINITIONS, CookieCategory } from '@/types/cookie-consent';

export function CookiePreferencesModal() {
  const {
    consent,
    isPreferencesOpen,
    closePreferences,
    saveCustomConsent,
    acceptAll,
    rejectNonEssential,
  } = useCookieConsent();

  const titleId = useId();
  const descId = useId();

  // Local draft state for toggles inside the modal
  const [functional, setFunctional] = useState<boolean>(consent.functional);
  const [analytics, setAnalytics] = useState<boolean>(consent.analytics);
  const [marketing, setMarketing] = useState<boolean>(consent.marketing);
  const [showCookieTable, setShowCookieTable] = useState<boolean>(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<CookieCategory | 'all'>('all');

  // Synchronise draft state when modal opens
  useEffect(() => {
    if (isPreferencesOpen) {
      setFunctional(consent.functional);
      setAnalytics(consent.analytics);
      setMarketing(consent.marketing);
    }
  }, [isPreferencesOpen, consent]);

  // Handle Escape key to close modal
  useEffect(() => {
    if (!isPreferencesOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreferences();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPreferencesOpen, closePreferences]);

  if (!isPreferencesOpen) return null;

  const handleSave = () => {
    saveCustomConsent({
      functional,
      analytics,
      marketing,
    });
  };

  const filteredCookies =
    activeCategoryFilter === 'all'
      ? TOOLCART_COOKIE_DEFINITIONS
      : TOOLCART_COOKIE_DEFINITIONS.filter((c) => c.category === activeCategoryFilter);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-tc-ink/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-card border-2 border-tc-ink shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-tc-ink text-white px-5 sm:px-6 py-4 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center shrink-0">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 id={titleId} className="font-heading font-extrabold text-lg sm:text-xl text-white tracking-tight">
                Privacy &amp; Cookie Preferences
              </h2>
              <p className="text-xs text-[#DFE8F6]">ToolCart UK statutory PECR &amp; UK GDPR settings</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            aria-label="Close cookie preferences modal"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 transition-colors focus-visible:outline-2 focus-visible:outline-tc-action-lime"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-tc-graphite text-sm">
          <p id={descId} className="text-xs sm:text-sm text-tc-graphite leading-relaxed">
            We use strictly necessary cookies to keep your trade basket active and persist your preferred UK VAT view.
            With your explicit permission, we and our verified UK telemetry services also set functional, performance,
            and project recommendation cookies. Choose your preferences below or read our{' '}
            <Link
              href="/cookies"
              onClick={closePreferences}
              className="text-tc-primary font-semibold underline underline-offset-2 hover:text-tc-primary-hover"
            >
              UK Cookie Policy
            </Link>
            .
          </p>

          {/* Preferences Categories */}
          <div className="space-y-4">
            {/* Category 1: Strictly Necessary */}
            <div className="p-4 rounded-xl border border-tc-border bg-tc-canvas/60">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-tc-primary shrink-0" />
                    <span className="font-heading font-bold text-sm text-tc-ink">Strictly Necessary Cookies</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-tc-ink text-white">
                      Always Active
                    </span>
                  </div>
                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    Essential for the secure operation of ToolCart UK. Enables basket persistence (`toolcart_cart_id`),
                    trade vs. retail VAT preference toggle (`toolcart_vat_mode`), trade account authentication, and CSRF protection.
                    These cannot be disabled.
                  </p>
                </div>
              </div>
            </div>

            {/* Category 2: Functional & Trade Preferences */}
            <div className="p-4 rounded-xl border border-tc-border bg-white hover:border-tc-border-strong transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-tc-primary shrink-0" />
                    <span className="font-heading font-bold text-sm text-tc-ink">
                      Functional &amp; Trade Preferences
                    </span>
                  </div>
                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    Remembers your verified trade discount tier, recently viewed tools for site referencing, active
                    hardware compare drawer selections, and delivery postcode estimators.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={functional}
                  onClick={() => setFunctional(!functional)}
                  aria-label="Toggle Functional and Trade Preferences cookies"
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 ${
                    functional
                      ? 'bg-tc-action-lime border-tc-ink'
                      : 'bg-tc-canvas border-tc-border-strong'
                  } focus-visible:outline-2 focus-visible:outline-tc-primary focus-visible:outline-offset-2`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-tc-ink shadow-md ring-0 transition duration-200 ease-in-out ${
                      functional ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category 3: Analytics & Performance */}
            <div className="p-4 rounded-xl border border-tc-border bg-white hover:border-tc-border-strong transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-tc-ink">
                      Analytics &amp; Site Diagnostics
                    </span>
                  </div>
                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    Helps us monitor UK store performance, measure Core Web Vitals, identify missing catalog search terms,
                    and diagnose checkout bottlenecks. All telemetry is aggregated and privacy-pseudonymised.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(!analytics)}
                  aria-label="Toggle Analytics and Site Diagnostics cookies"
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 ${
                    analytics
                      ? 'bg-tc-action-lime border-tc-ink'
                      : 'bg-tc-canvas border-tc-border-strong'
                  } focus-visible:outline-2 focus-visible:outline-tc-primary focus-visible:outline-offset-2`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-tc-ink shadow-md ring-0 transition duration-200 ease-in-out ${
                      analytics ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Category 4: Marketing & Personalised Trade Recommendations */}
            <div className="p-4 rounded-xl border border-tc-border bg-white hover:border-tc-border-strong transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-heading font-bold text-sm text-tc-ink">
                      Personalised Trade Recommendations
                    </span>
                  </div>
                  <p className="text-xs text-tc-text-secondary leading-relaxed">
                    Enables tailored tool packs, relevant fixing suggestions for electrical and plumbing projects, and
                    notifies you of trade supply re-stock events matching your previous orders.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={marketing}
                  onClick={() => setMarketing(!marketing)}
                  aria-label="Toggle Personalised Trade Recommendations cookies"
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out border-2 ${
                    marketing
                      ? 'bg-tc-action-lime border-tc-ink'
                      : 'bg-tc-canvas border-tc-border-strong'
                  } focus-visible:outline-2 focus-visible:outline-tc-primary focus-visible:outline-offset-2`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-tc-ink shadow-md ring-0 transition duration-200 ease-in-out ${
                      marketing ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Collapsible Cookie Inventory Table */}
          <div className="border border-tc-border rounded-xl p-3 bg-tc-canvas/40">
            <button
              type="button"
              onClick={() => setShowCookieTable(!showCookieTable)}
              className="w-full flex items-center justify-between text-left text-xs font-bold text-tc-ink font-heading py-1"
            >
              <span className="flex items-center gap-1.5">
                <span>View Registered Cookie Details ({TOOLCART_COOKIE_DEFINITIONS.length} items)</span>
              </span>
              {showCookieTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCookieTable && (
              <div className="mt-3 pt-3 border-t border-tc-border space-y-3">
                {/* Category Filter Pills */}
                <div className="flex flex-wrap gap-1.5 text-[11px]">
                  {(['all', 'necessary', 'functional', 'analytics', 'marketing'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-md capitalize font-medium border transition-colors ${
                        activeCategoryFilter === cat
                          ? 'bg-tc-ink text-white border-tc-ink'
                          : 'bg-white text-tc-graphite border-tc-border hover:border-tc-ink'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="overflow-x-auto max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-tc-border-strong text-tc-ink font-bold">
                        <th className="py-1.5 pr-2">Cookie Name</th>
                        <th className="py-1.5 pr-2">Category</th>
                        <th className="py-1.5 pr-2">Duration</th>
                        <th className="py-1.5">Purpose</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tc-border">
                      {filteredCookies.map((c) => (
                        <tr key={c.name} className="hover:bg-white/60">
                          <td className="py-1.5 pr-2 font-mono font-medium text-tc-ink">{c.name}</td>
                          <td className="py-1.5 pr-2 capitalize text-tc-text-secondary">{c.category}</td>
                          <td className="py-1.5 pr-2 text-tc-text-secondary whitespace-nowrap">{c.expiry}</td>
                          <td className="py-1.5 text-tc-graphite">{c.purpose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer with Actions */}
        <div className="bg-tc-canvas p-4 sm:p-5 border-t border-tc-border flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={rejectNonEssential}
            className="w-full sm:w-auto px-4 py-2.5 rounded-button text-xs font-bold text-tc-ink border-2 border-tc-ink bg-white hover:bg-tc-canvas transition-colors focus-visible:outline-2 focus-visible:outline-tc-ink min-h-[44px]"
          >
            Reject Non-Essential
          </button>
          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2.5 rounded-button text-xs font-bold bg-tc-action-lime text-tc-ink border-2 border-tc-ink hover:bg-tc-lime-hover transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-tc-ink min-h-[44px] flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save My Preferences</span>
            </button>
            <button
              type="button"
              onClick={acceptAll}
              className="w-full sm:w-auto px-4 py-2.5 rounded-button text-xs font-bold bg-tc-primary text-white border-2 border-tc-primary hover:bg-tc-primary-hover hover:border-tc-primary-hover transition-colors shadow-xs focus-visible:outline-2 focus-visible:outline-tc-primary min-h-[44px]"
            >
              Accept All Cookies
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
