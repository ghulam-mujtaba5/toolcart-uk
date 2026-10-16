import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';

const TradeApplicationSchema = z.object({
  business_name: z.string().min(2, 'Company name is required'),
  contact_name: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid telephone number is required'),
  trade_type: z.string().min(2, 'Trade sector is required'),
  vat_number: z.string().optional(),
  company_number: z.string().min(2, 'Companies House registration number is required'),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const parsed = TradeApplicationSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const customer = await db.customers.create({
      company_name: parsed.data.business_name,
      contact_name: parsed.data.contact_name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      companies_house_number: parsed.data.company_number,
      vat_number: parsed.data.vat_number || undefined,
      status: 'pending',
      trade_tier: 'tier_1_5pct',
      credit_limit_gbp: 0,
    });

    return NextResponse.json(
      {
        success: true,
        customer,
        message: 'Trade application submitted successfully and pending review',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
