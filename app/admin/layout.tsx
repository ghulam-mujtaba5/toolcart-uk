import React from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';

export const metadata = {
  title: 'ToolCart Admin Portal | Commerce Engine & Governance',
  description: 'Merchant operations, catalog review, and supplier order state machine dashboard.',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
