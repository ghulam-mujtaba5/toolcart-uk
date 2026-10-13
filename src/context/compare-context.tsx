'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { PublicProductDTO } from '@/types/product';

interface CompareContextValue {
  products: PublicProductDTO[];
  isOpen: boolean;
  highlightDifferences: boolean;
  openCompare: () => void;
  closeCompare: () => void;
  toggleCompare: () => void;
  addProduct: (product: PublicProductDTO) => void;
  removeProduct: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  toggleHighlightDifferences: () => void;
}

const CompareContext = createContext<CompareContextValue | undefined>(undefined);

const MAX_COMPARE_PRODUCTS = 4;

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<PublicProductDTO[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [highlightDifferences, setHighlightDifferences] = useState<boolean>(false);

  const openCompare = useCallback(() => setIsOpen(true), []);
  const closeCompare = useCallback(() => setIsOpen(false), []);
  const toggleCompare = useCallback(() => setIsOpen((prev) => !prev), []);

  const addProduct = useCallback((product: PublicProductDTO) => {
    setProducts((prev) => {
      if (prev.some((p) => p.id === product.id)) {
        return prev;
      }
      if (prev.length >= MAX_COMPARE_PRODUCTS) {
        return prev;
      }
      return [...prev, product];
    });
  }, []);

  const removeProduct = useCallback((productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  }, []);

  const clearCompare = useCallback(() => {
    setProducts([]);
    setIsOpen(false);
  }, []);

  const isInCompare = useCallback(
    (productId: string) => {
      return products.some((p) => p.id === productId);
    },
    [products]
  );

  const toggleHighlightDifferences = useCallback(() => {
    setHighlightDifferences((prev) => !prev);
  }, []);

  const value: CompareContextValue = {
    products,
    isOpen,
    highlightDifferences,
    openCompare,
    closeCompare,
    toggleCompare,
    addProduct,
    removeProduct,
    clearCompare,
    isInCompare,
    toggleHighlightDifferences,
  };

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare(): CompareContextValue {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}
