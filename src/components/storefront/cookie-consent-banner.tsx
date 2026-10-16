'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, SlidersHorizontal, Cookie, Check } from 'lucide-react';
import { useCookieConsent } from '@/context/cookie-consent-context';

export function CookieConsentBanner() {
  const {
    isBannerOpen,
    hasConsented,
    acceptAll,
    rejectNonEssential,
    openPreferences,
  } = useCookieConsent();

  return (
    <>
      {/* Floating Re-Open Consent Pill / Trigger (Always available to satisfy UK ICO requirement) */}
      {hasConsented && !isBannerOpen && (
        <button
          type="button"
          onClick={openPreferences}
          aria-label="Open UK cookie preferences"
          className="hidden md:flex fixed bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] left-[calc(1rem+env(safe-area-inset-left,0px))] z-40 bg-white text-tc-ink border-2 border-tc-ink rounded-full px-3 py-2 text-xs font-bold shadow-lg hover:bg-tc-surface-soft hover:border-tc-primary items-center gap-2 transition-all focus-visible:outline-2 focus-visible:outline-tc-primary group"
        >
          <div className="w-5 h-5 rounded-full bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center shrink-0">
            <Cookie className="w-3 h-3" />
          </div>
          <span className="hidden sm:inline font-heading">Cookie Preferences</span>
          <span className="sm:hidden font-heading">Cookies</span>
        </button>
      )}

      {/* Main Cookie Consent Banner */}
      {isBannerOpen && (
        <div
          role="region"
          aria-label="UK Cookie and Privacy Consent"
          className="fixed bottom-0 inset-x-0 z-50 p-3 sm:p-4 md:p-6 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pointer-events-none animate-in slide-in-from-bottom duration-300"
        >
          <div className="max-w-4xl mx-auto bg-white rounded-card border-2 border-tc-ink shadow-2xl p-4 sm:p-6 pointer-events-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              {/* Text Information */}
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-tc-action-lime text-tc-ink border border-tc-ink flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <h3 className="font-heading font-extrabold text-base text-tc-ink tracking-tight">
                    ToolCart UK Cookie &amp; Privacy Notice
                  </h3>
                  <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tc-surface-soft text-tc-primary border border-tc-primary/20">
                    PECR &amp; UK GDPR Compliant
                  </span>
                </div>
                <p className="text-xs text-tc-graphite leading-relaxed">
                  We use strictly necessary cookies to keep your hardware basket active and persist your preferred UK VAT view
                  (Inc. vs Ex. VAT). With your permission, we also use functional and analytics cookies to measure site speed and
                  personalise trade recommendations. You can adjust your consent anytime or read our{' '}
                  <Link
                    href="/cookies"
                    className="text-tc-primary font-semibold underline underline-offset-2 hover:text-tc-primary-hover"
                  >
                    UK Cookie Policy
                  </Link>
                  .
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0">
                <button
                  type="button"
                  onClick={openPreferences}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-button text-xs font-bold text-tc-ink border-2 border-tc-ink bg-white hover:bg-tc-canvas transition-colors flex items-center justify-center gap-1.5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-tc-ink"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-tc-primary" />
                  <span>Customise</span>
                </button>

                <button
                  type="button"
                  onClick={rejectNonEssential}
                  className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-button text-xs font-bold text-tc-ink border-2 border-tc-ink bg-white hover:bg-tc-canvas transition-colors min-h-[44px] focus-visible:outline-2 focus-visible:outline-tc-ink"
                >
                  Reject Non-Essential
                </button>

                <button
                  type="button"
                  onClick={acceptAll}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-button text-xs font-bold bg-tc-primary text-white border-2 border-tc-primary hover:bg-tc-primary-hover hover:border-tc-primary-hover transition-colors shadow-xs min-h-[44px] flex items-center justify-center gap-1.5 focus-visible:outline-2 focus-visible:outline-tc-primary"
                >
                  <Check className="w-4 h-4" />
                  <span>Accept All</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
