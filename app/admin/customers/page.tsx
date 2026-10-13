import React from 'react';
import { getDb } from '@/lib/db';
import { CustomersClient } from './customers-client';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck } from 'lucide-react';

export const revalidate = 0;

export default async function AdminCustomersPage() {
  const db = getDb();
  const customers = await db.customers.getAll();

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-tc-border rounded-xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              B2B Trade Accounts &amp; Credit Governance
            </h2>
            <Badge variant="lime">Launch Gate 9</Badge>
          </div>
          <p className="text-xs text-tc-text-secondary mt-1">
            Manual vetting queue for trade discounts, Companies House CRN checks, and credit limits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-tc-primary" />
          <span className="text-xs text-tc-text-secondary font-medium">
            30-Day Net Term Control
          </span>
        </div>
      </div>

      <CustomersClient initialCustomers={customers} />
    </div>
  );
}
