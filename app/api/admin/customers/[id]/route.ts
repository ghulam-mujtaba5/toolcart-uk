import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { renderTradeApplicationDecisionEmail, sendEmail } from '@/lib/adapters/email';
import { z } from 'zod';

const UpdateCustomerStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'pending']),
  credit_limit_gbp: z.number().nonnegative().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const db = getDb();
    const customer = await db.customers.getById(id);

    if (!customer) {
      return NextResponse.json({ error: `Customer ${id} not found` }, { status: 404 });
    }

    return NextResponse.json(customer, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const rawBody = await request.json();

    const parseResult = UpdateCustomerStatusSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          issues: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { status, credit_limit_gbp } = parseResult.data;
    const db = getDb();

    const existing = await db.customers.getById(id);
    if (!existing) {
      return NextResponse.json({ error: `Customer ${id} not found` }, { status: 404 });
    }

    const updated = await db.customers.updateStatus(id, status, credit_limit_gbp);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update customer status' }, { status: 500 });
    }

    // Trigger transactional email notification on decision
    if (status === 'approved' || status === 'rejected') {
      try {
        const { html, text } = renderTradeApplicationDecisionEmail(
          updated.company_name,
          status,
          updated.credit_limit_gbp,
          updated.trade_tier
        );
        const subject =
          status === 'approved'
            ? `ToolCart Trade Account Approved: ${updated.company_name}`
            : `ToolCart Trade Application Update: ${updated.company_name}`;
        await sendEmail(updated.email, subject, html, text);
      } catch (emailErr) {
        console.error('[Trade Decision Email Error]', emailErr);
      }
    }

    return NextResponse.json(updated, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
