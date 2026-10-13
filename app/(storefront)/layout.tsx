import React from 'react';
import { cookies } from 'next/headers';
import { VatProvider, VatMode } from '@/context/vat-context';
import { CartProvider } from '@/context/cart-context';
import { CompareProvider } from '@/context/compare-context';
import { StorefrontLayoutClient } from '@/components/storefront/storefront-layout-client';

export const dynamic = 'force-dynamic';

export default function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const initialVatMode = (cookieStore.get('toolcart_vat_mode')?.value as VatMode) || 'inc';

  return (
    <VatProvider initialMode={initialVatMode}>
      <CartProvider>
        <CompareProvider>
          <StorefrontLayoutClient>{children}</StorefrontLayoutClient>
        </CompareProvider>
      </CartProvider>
    </VatProvider>
  );
}
