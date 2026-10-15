import React from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { ProductEditorForm } from './product-editor-form';
import { AdminErrorBoundary } from '@/components/admin/error-boundary';

export const revalidate = 0;

export default async function AdminProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const db = getDb();
  const product = await db.products.getById(params.id);

  if (!product) {
    notFound();
  }

  const wholesaleOffer = await db.products.getWholesaleOffer(product.supplier_sku);

  return (
    <AdminErrorBoundary
      title="Error Loading Product Editor"
      fallbackMessage="An unexpected error occurred while loading this product editor form. Your product data remains intact."
    >
      <ProductEditorForm product={product} wholesaleOffer={wholesaleOffer} />
    </AdminErrorBoundary>
  );
}
