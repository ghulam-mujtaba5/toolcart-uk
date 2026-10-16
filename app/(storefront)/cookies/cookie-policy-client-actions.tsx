'use client';

import React from 'react';
import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { useCookieConsent } from '@/context/cookie-consent-context';

export function CookiePolicyClientActions() {
  const { openPreferences, resetConsent } = useCookieConsent();

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full sm:w-auto">
      <button
        type="button"
        onClick={openPreferences}
        className="px-4 py-2.5 rounded-button text-xs font-bold bg-tc-action-lime text-tc-ink border-2 border-tc-ink hover:bg-tc-lime-hover transition-colors shadow-xs flex items-center justify-center gap-2 min-h-[44px] focus-visible:outline-2 focus-visible:outline-tc-ink"
      >
        <SlidersHorizontal className="w-4 h-4" />
        <span>Manage Preferences</span>
      </button>

      <button
        type="button"
        onClick={resetConsent}
        className="px-3.5 py-2.5 rounded-button text-xs font-bold text-tc-ink border-2 border-tc-ink bg-white hover:bg-tc-canvas transition-colors flex items-center justify-center gap-1.5 min-h-[44px] focus-visible:outline-2 focus-visible:outline-tc-ink"
      >
        <RotateCcw className="w-3.5 h-3.5 text-tc-text-secondary" />
        <span>Reset Choices</span>
      </button>
    </div>
  );
}
