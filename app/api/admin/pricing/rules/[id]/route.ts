import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth } from '@/lib/auth/admin';

const UpdateRuleSchema = z.object({
  multiplier_under_1_pound: z.number().min(1.0, 'Multiplier must be at least 1.0x').max(10.0, 'Multiplier must be at most 10.0x').optional(),
  multiplier_1_to_3_pounds: z.number().min(1.0, 'Multiplier must be at least 1.0x').max(10.0, 'Multiplier must be at most 10.0x').optional(),
  multiplier_over_3_pounds: z.number().min(1.0, 'Multiplier must be at least 1.0x').max(10.0, 'Multiplier must be at most 10.0x').optional(),
  margin_floor_percent: z.number().min(10.0, 'Margin floor must be at least 10%').max(90.0, 'Margin floor must be at most 90%').optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = params;
    const parseResult = await parseJsonBody(request, UpdateRuleSchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const db = getDb();
    const updatedRule = await db.pricing.updateMarkupRule(id, parseResult.data);

    if (!updatedRule) {
      return NextResponse.json({ error: `Category rule ${id} not found` }, { status: 404 });
    }

    const newMarginFloor = await db.pricing.getMarginFloor();

    return NextResponse.json(
      {
        rule: updatedRule,
        margin_floor: newMarginFloor,
        message: `Markup rules updated for category ${updatedRule.category_name}`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
