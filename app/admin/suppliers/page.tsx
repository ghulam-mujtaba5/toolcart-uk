import React from 'react';
import { getDb } from '@/lib/db';
import { SuppliersClient } from './suppliers-client';

export const revalidate = 0;

export const metadata = {
  title: 'Supplier Directory & Carriage Terms | ToolCart Admin',
  description: 'Manage supplier dropship parameters, stock feed TTL policies, and wholesale carriage thresholds.',
};

export default async function AdminSuppliersPage() {
  const db = getDb();
  const suppliers = await db.suppliers.getAll();

  return <SuppliersClient initialSuppliers={suppliers} />;
}
