import { NextRequest, NextResponse } from 'next/server';
import { executeOrderTransition } from '@/lib/state-machine/engine';
import { StateTrigger } from '@/lib/state-machine/types';
import { OrderState } from '@/types/order';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    if (!body.to_state) {
      return NextResponse.json(
        { error: 'Missing required field: to_state' },
        { status: 400 }
      );
    }

    const targetState = body.to_state as OrderState;
    const trigger = (body.trigger || 'admin') as StateTrigger;
    const actor = body.actor || 'admin:ops@toolcart.co.uk';
    const metadata = body.metadata || {};
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
