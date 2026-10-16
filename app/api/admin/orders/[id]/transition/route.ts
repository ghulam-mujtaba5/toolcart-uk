import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { executeOrderTransition } from '@/lib/state-machine/engine';
import { StateTrigger } from '@/lib/state-machine/types';
import { OrderState } from '@/types/order';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth } from '@/lib/auth/admin';

const TransitionBodySchema = z.object({
  to_state: z.enum([
    'cart_pending',
    'checkout_authorized',
    'supplier_order_pending',
    'supplier_accepted',
    'payment_captured',
    'dispatched',
    'delivered',
    'supplier_rejected',
    'supplier_timeout',
    'payment_authorization_expired',
    'partial_supplier_acceptance',
    'partial_dispatch',
    'refund_pending',
    'refunded',
    'manual_review',
  ]),
  trigger: z.string().optional().default('admin'),
  actor: z.string().optional().default('admin:ops@toolcart.co.uk'),
  metadata: z.record(z.unknown()).optional().default({}),
  idempotency_key: z.string().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = requireAdminAuth(request);
  if (!auth.success) return auth.response;

  try {
    const { id } = params;
    const parseResult = await parseJsonBody(request, TransitionBodySchema);
    if (!parseResult.success) {
      return parseResult.response;
    }

    const body = parseResult.data;
    const targetState = body.to_state as OrderState;
    const trigger = (body.trigger || 'admin') as StateTrigger;
    const actor = body.actor || 'admin:ops@toolcart.co.uk';
    const metadata = (body.metadata || {}) as Record<string, unknown>;
    const idempotencyKey = body.idempotency_key;

    const result = await executeOrderTransition({
      order_id: id,
      to_state: targetState,
      trigger,
      actor,
      metadata,
      idempotency_key: idempotencyKey,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'State transition error';

    if (message.includes('not found')) {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    if (message.includes('Illegal transition')) {
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
