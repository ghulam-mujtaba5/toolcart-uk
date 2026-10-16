import React from 'react';
import { getDb } from '@/lib/db';
import { PricingClient } from './pricing-client';

export const revalidate = 0;

export const metadata = {
  title: 'Pricing & Margin Control Engine | ToolCart Admin',
  description: 'Manage category markups, tier multipliers, and margin safety floor rules.',
};

export default async function AdminPricingPage() {
  const db = getDb();
  const rules = await db.pricing.getMarkupRules();
  const marginFloor = await db.pricing.getMarginFloor();

  return <PricingClient initialRules={rules} initialMarginFloor={marginFloor} />;
}
