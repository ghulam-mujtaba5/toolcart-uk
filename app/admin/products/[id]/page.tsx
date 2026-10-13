import React from 'react';
import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { ProductEditorForm } from './product-editor-form';

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

  return <ProductEditorForm product={product} wholesaleOffer={wholesaleOffer} />;
}
