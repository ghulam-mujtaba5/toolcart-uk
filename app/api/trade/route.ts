import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { parseJsonBody } from '@/lib/api/parse-json-body';

const TradeApplicationSchema = z.object({
  business_name: z.string().min(2, 'Company name is required').max(255, 'Company name cannot exceed 255 characters'),
  contact_name: z.string().min(2, 'Contact name is required').max(255, 'Contact name cannot exceed 255 characters'),
  email: z.string().email('Valid email is required').max(255, 'Email cannot exceed 255 characters'),
  phone: z.string().min(5, 'Valid telephone number is required').max(50, 'Telephone number cannot exceed 50 characters'),
  trade_type: z.string().min(2, 'Trade sector is required').max(255, 'Trade sector cannot exceed 255 characters'),
  vat_number: z.string().max(255).optional(),
  company_number: z.string().min(2, 'Companies House registration number is required').max(255, 'Companies House registration number cannot exceed 255 characters'),
});

export async function POST(request: NextRequest) {
  try {
    const parseResult = await parseJsonBody(request, TradeApplicationSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const { data: parsedData } = parseResult;

    const db = getDb();
    const customer = await db.customers.create({
      company_name: parsedData.business_name,
      contact_name: parsedData.contact_name,
      email: parsedData.email,
      phone: parsedData.phone,
      companies_house_number: parsedData.company_number,
      vat_number: parsedData.vat_number || undefined,
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
