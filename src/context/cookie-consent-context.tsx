'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  CookieConsentPreferences,
  CONSENT_COOKIE_NAME,
  CONSENT_VERSION,
  DEFAULT_CONSENT_PREFERENCES,
  ACCEPT_ALL_PREFERENCES,
  REJECT_NON_ESSENTIAL_PREFERENCES,
} from '@/types/cookie-consent';

interface CookieConsentContextType {
  consent: CookieConsentPreferences;
  hasConsented: boolean;
  isBannerOpen: boolean;
  isPreferencesOpen: boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  saveCustomConsent: (custom: { functional: boolean; analytics: boolean; marketing: boolean }) => void;
  openPreferences: () => void;
  closePreferences: () => void;
  resetConsent: () => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

function parseCookie(cookieString: string, name: string): string | null {
  const match = cookieString.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

function writeCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  const maxAge = days * 24 * 60 * 60;
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [consent, setConsent] = useState<CookieConsentPreferences>(DEFAULT_CONSENT_PREFERENCES);
  const [hasConsented, setHasConsented] = useState<boolean>(false);
  const [isBannerOpen, setIsBannerOpen] = useState<boolean>(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize consent on client mount
  useEffect(() => {
    try {
      let rawConsent: string | null = null;
      if (typeof document !== 'undefined') {
        rawConsent = parseCookie(document.cookie, CONSENT_COOKIE_NAME);
      }
      if (!rawConsent && typeof window !== 'undefined' && window.localStorage) {
        rawConsent = window.localStorage.getItem(CONSENT_COOKIE_NAME);
      }

      if (rawConsent) {
        const parsed = JSON.parse(rawConsent) as Partial<CookieConsentPreferences>;
        if (parsed.version === CONSENT_VERSION) {
          setConsent({
            necessary: true,
            functional: Boolean(parsed.functional),
            analytics: Boolean(parsed.analytics),
            marketing: Boolean(parsed.marketing),
            version: CONSENT_VERSION,
            timestamp: parsed.timestamp || new Date().toISOString(),
          });
          setHasConsented(true);
          setIsBannerOpen(false);
          setIsInitialized(true);
          return;
        }
      }
    } catch {
      // In case of corrupt cookie/localStorage, fallback to prompting consent
    }

    // No valid consent recorded -> display banner
    setHasConsented(false);
    setIsBannerOpen(true);
    setIsInitialized(true);
  }, []);

  // Listen for global custom event to reopen preferences from anywhere
  useEffect(() => {
    const handleOpenEvent = () => {
      setIsPreferencesOpen(true);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('open-cookie-preferences', handleOpenEvent);
      return () => {
        window.removeEventListener('open-cookie-preferences', handleOpenEvent);
      };
    }
  }, []);

  const persistConsent = useCallback((newPreferences: CookieConsentPreferences) => {
    try {
      const serialised = JSON.stringify(newPreferences);
      writeCookie(CONSENT_COOKIE_NAME, serialised, 365);
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(CONSENT_COOKIE_NAME, serialised);
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('toolcart-consent-updated', { detail: newPreferences })
        );
      }
    } catch {
      // Storage access blocked or restricted
    }
    setConsent(newPreferences);
    setHasConsented(true);
    setIsBannerOpen(false);
    setIsPreferencesOpen(false);
  }, []);

  const acceptAll = useCallback(() => {
    const fullConsent: CookieConsentPreferences = {
      ...ACCEPT_ALL_PREFERENCES,
      timestamp: new Date().toISOString(),
    };
    persistConsent(fullConsent);
  }, [persistConsent]);

  const rejectNonEssential = useCallback(() => {
    const minimalConsent: CookieConsentPreferences = {
      ...REJECT_NON_ESSENTIAL_PREFERENCES,
      timestamp: new Date().toISOString(),
    };
    persistConsent(minimalConsent);
  }, [persistConsent]);

  const saveCustomConsent = useCallback(
    (custom: { functional: boolean; analytics: boolean; marketing: boolean }) => {
      const customPreferences: CookieConsentPreferences = {
        necessary: true,
        functional: Boolean(custom.functional),
        analytics: Boolean(custom.analytics),
        marketing: Boolean(custom.marketing),
        version: CONSENT_VERSION,
        timestamp: new Date().toISOString(),
      };
      persistConsent(customPreferences);
    },
    [persistConsent]
  );

  const openPreferences = useCallback(() => {
    setIsPreferencesOpen(true);
  }, []);

  const closePreferences = useCallback(() => {
    setIsPreferencesOpen(false);
  }, []);

  const resetConsent = useCallback(() => {
    try {
      if (typeof document !== 'undefined') {
        document.cookie = `${CONSENT_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
      }
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(CONSENT_COOKIE_NAME);
      }
    } catch {
      // Ignored
    }
    setConsent(DEFAULT_CONSENT_PREFERENCES);
    setHasConsented(false);
    setIsBannerOpen(true);
    setIsPreferencesOpen(false);
  }, []);

  // Avoid hydration mismatch by rendering cleanly until initialized
  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        hasConsented,
        isBannerOpen: isInitialized && isBannerOpen,
        isPreferencesOpen,
        acceptAll,
        rejectNonEssential,
        saveCustomConsent,
        openPreferences,
        closePreferences,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
}

const NOOP_COOKIE_CONTEXT: CookieConsentContextType = {
  consent: DEFAULT_CONSENT_PREFERENCES,
  hasConsented: true,
  isBannerOpen: false,
  isPreferencesOpen: false,
  acceptAll: () => {},
  rejectNonEssential: () => {},
  saveCustomConsent: () => {},
  openPreferences: () => {},
  closePreferences: () => {},
  resetConsent: () => {},
};

export function useCookieConsent(): CookieConsentContextType {
  const context = useContext(CookieConsentContext);
  return context || NOOP_COOKIE_CONTEXT;
}
