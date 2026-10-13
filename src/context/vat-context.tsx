'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type VatMode = 'inc' | 'ex';

interface VatContextValue {
  mode: VatMode;
  isTradeMode: boolean; // true when mode is 'ex'
  setMode: (mode: VatMode) => void;
  toggleVatMode: () => void;
  formatPriceDisplay: (priceIncVat: number, priceExVat: number) => {
    primaryText: string;
    secondaryText: string;
    primaryAmount: number;
    secondaryAmount: number;
    primaryLabel: string;
    secondaryLabel: string;
  };
}

const VatContext = createContext<VatContextValue | undefined>(undefined);

const COOKIE_NAME = 'toolcart_vat_mode';

interface VatProviderProps {
  children?: React.ReactNode;
  initialMode?: VatMode;
}

export function VatProvider({ children, initialMode = 'inc' }: VatProviderProps) {
  const [mode, setModeState] = useState<VatMode>(initialMode);

  // Sync with cookie on client mount if initialMode was not provided or to ensure freshness
  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const match = cookies.find((row) => row.startsWith(`${COOKIE_NAME}=`));
    if (match) {
      const val = match.split('=')[1];
      if (val === 'inc' || val === 'ex') {
        setModeState(val);
      }
    }
  }, []);

  const setMode = useCallback((newMode: VatMode) => {
    setModeState(newMode);
    try {
      document.cookie = `${COOKIE_NAME}=${newMode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {
      // Ignore in environments where document.cookie is restricted
    }
  }, []);

  const toggleVatMode = useCallback(() => {
    setMode(mode === 'inc' ? 'ex' : 'inc');
  }, [mode, setMode]);

  const formatPriceDisplay = useCallback(
    (priceIncVat: number, priceExVat: number) => {
      const isTrade = mode === 'ex';
      if (isTrade) {
        return {
          primaryText: `£${priceExVat.toFixed(2)} ex. VAT`,
          secondaryText: `£${priceIncVat.toFixed(2)} inc. VAT`,
          primaryAmount: priceExVat,
          secondaryAmount: priceIncVat,
          primaryLabel: 'ex. VAT',
          secondaryLabel: 'inc. VAT',
        };
      }
      return {
        primaryText: `£${priceIncVat.toFixed(2)} inc. VAT`,
        secondaryText: `£${priceExVat.toFixed(2)} ex. VAT`,
        primaryAmount: priceIncVat,
        secondaryAmount: priceExVat,
        primaryLabel: 'inc. VAT',
        secondaryLabel: 'ex. VAT',
      };
    },
    [mode]
  );

  const value: VatContextValue = {
    mode,
    isTradeMode: mode === 'ex',
    setMode,
    toggleVatMode,
    formatPriceDisplay,
  };

  return <VatContext.Provider value={value}>{children}</VatContext.Provider>;
}

export function useVAT(): VatContextValue {
  const context = useContext(VatContext);
  if (!context) {
    throw new Error('useVAT must be used within a VatProvider');
  }
  return context;
}
