'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { CartItem, SupplierDeliveryGroup, CartSummary } from '@/types/cart';
import { PublicProductDTO } from '@/types/product';
import { UK_VAT_RATE } from '@/lib/catalog/pricing';

interface CartContextValue {
  items: CartItem[];
  summary: CartSummary;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addItem: (product: PublicProductDTO, quantity?: number, isCase?: boolean) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const STORAGE_KEY = 'toolcart_basket_v2';
const CARRIAGE_FEE_EX_VAT = 4.95;
const FREE_CARRIAGE_THRESHOLD_EX_VAT = 50.0;

function computeCartSummary(items: CartItem[]): CartSummary {
  const groupsMap = new Map<string, CartItem[]>();

  for (const item of items) {
    const list = groupsMap.get(item.supplier_id) || [];
    list.push(item);
    groupsMap.set(item.supplier_id, list);
  }

  const supplier_groups: SupplierDeliveryGroup[] = [];
  let totalSubtotalExPence = 0;
  let totalShippingExPence = 0;
  let totalItemsCount = 0;

  for (const [supplierId, groupItems] of groupsMap.entries()) {
    let groupExPence = 0;
    const supplierName = groupItems[0]?.supplier_name || 'Status International (UK) Ltd';

    for (const item of groupItems) {
      totalItemsCount += item.quantity;
      const itemPricePence = Math.round(item.retail_price_ex_vat_gbp * 100);
      groupExPence += itemPricePence * item.quantity;
    }

    const subtotalEx = groupExPence / 100;
    const subtotalInc = Math.round(groupExPence * (1 + UK_VAT_RATE)) / 100;

    const isFreeCarriage = subtotalEx >= FREE_CARRIAGE_THRESHOLD_EX_VAT;
    const carriageFeeEx = isFreeCarriage || groupItems.length === 0 ? 0 : CARRIAGE_FEE_EX_VAT;
    const carriageFeeInc = Math.round(carriageFeeEx * (1 + UK_VAT_RATE) * 100) / 100;

    totalSubtotalExPence += groupExPence;
    totalShippingExPence += Math.round(carriageFeeEx * 100);

    supplier_groups.push({
      supplier_id: supplierId,
      supplier_name: supplierName,
      items: groupItems,
      subtotal_ex_vat_gbp: subtotalEx,
      subtotal_inc_vat_gbp: subtotalInc,
      carriage_fee_ex_vat_gbp: carriageFeeEx,
      carriage_fee_inc_vat_gbp: carriageFeeInc,
      is_free_carriage: isFreeCarriage,
      free_carriage_threshold_gbp: FREE_CARRIAGE_THRESHOLD_EX_VAT,
      estimated_lead_time_days: '2-3 Business Days',
    });
  }

  const subtotal_ex_vat_gbp = totalSubtotalExPence / 100;
  const shipping_ex_vat_gbp = totalShippingExPence / 100;
  const netTotalPence = totalSubtotalExPence + totalShippingExPence;
  const vatPence = Math.round(netTotalPence * UK_VAT_RATE);
  const vat_amount_gbp = vatPence / 100;

  const grand_total_ex_vat_gbp = netTotalPence / 100;
  const grand_total_inc_vat_gbp = (netTotalPence + vatPence) / 100;

  const subtotal_inc_vat_gbp = Math.round(totalSubtotalExPence * (1 + UK_VAT_RATE)) / 100;
  const shipping_inc_vat_gbp = Math.round(totalShippingExPence * (1 + UK_VAT_RATE)) / 100;

  return {
    supplier_groups,
    total_items_count: totalItemsCount,
    subtotal_ex_vat_gbp,
    subtotal_inc_vat_gbp,
    shipping_ex_vat_gbp,
    shipping_inc_vat_gbp,
    vat_amount_gbp,
    grand_total_inc_vat_gbp,
    grand_total_ex_vat_gbp,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // Storage unavailable or invalid JSON
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage on updates
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Storage full or unavailable
    }
  }, [items, isHydrated]);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (product: PublicProductDTO, quantity: number = 1, isCase: boolean = false) => {
      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.product_id === product.id && i.is_case_quantity === isCase);
        if (existingIndex > -1) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            quantity: updated[existingIndex].quantity + quantity,
          };
          return updated;
        }

        const newItem: CartItem = {
          product_id: product.id,
          supplier_id: product.supplier_id || 'status-uk',
          supplier_name: product.supplier_name || 'Status International (UK) Ltd',
          supplier_sku: product.supplier_sku,
          title: product.title,
          slug: product.slug,
          image: product.images[0],
          category: product.category,
          retail_price_ex_vat_gbp: product.retail_price_ex_vat_gbp,
          retail_price_inc_vat_gbp: product.retail_price_inc_vat_gbp,
          units_per_pack: product.units_per_pack,
          units_per_case: product.units_per_case,
          quantity,
          is_case_quantity: isCase,
        };

        return [...prev, newItem];
      });

      setIsOpen(true);
    },
    []
  );

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.product_id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const summary = useMemo(() => computeCartSummary(items), [items]);

  const value: CartContextValue = {
    items,
    summary,
    isOpen,
    openCart,
    closeCart,
    toggleCart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
