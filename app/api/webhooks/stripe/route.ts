import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { executeOrderTransition } from '@/lib/state-machine/engine';
import { getDb } from '@/lib/db';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('stripe-signature') || '';

    let event: Stripe.Event;

    // Handle mock signature / simulation mode in dev and tests
    const isDevOrTest = process.env.NODE_ENV !== 'production' || process.env.STAGING_ONLY === 'true';
    if (isDevOrTest && (signature === 'mock_signature' || !webhookSecret || webhookSecret.startsWith('whsec_mock'))) {
      try {
        event = JSON.parse(rawBody) as Stripe.Event;
      } catch {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
      }
    } else {
      try {
        const stripe = new Stripe(stripeSecretKey || 'sk_live_placeholder', { apiVersion: '2024-11-20.acacia' as any });
        event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Signature verification failed';
        console.error('[Stripe Webhook Error]', errorMsg);
        return NextResponse.json({ error: errorMsg }, { status: 400 });
      }
    }

    const db = getDb();

    // Event 1: payment_intent.succeeded -> Advance state machine to supplier_order_pending
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const orderId = paymentIntent.metadata?.order_id;

      if (orderId) {
        const order = await db.orders.getById(orderId);
        if (order) {
          if (order.state === 'cart_pending') {
            await executeOrderTransition({
              order_id: order.id,
              to_state: 'checkout_authorized',
              trigger: 'customer',
              actor: `stripe:${event.id}`,
              metadata: { payment_intent_id: paymentIntent.id },
              idempotency_key: `stripe_auth_${event.id}`,
            });
          }

          const currentOrder = await db.orders.getById(orderId);
          if (currentOrder && currentOrder.state === 'checkout_authorized') {
            await executeOrderTransition({
              order_id: order.id,
              to_state: 'supplier_order_pending',
              trigger: 'webhook',
              actor: `stripe:${event.id}`,
              metadata: {
                payment_intent_id: paymentIntent.id,
                amount_received: paymentIntent.amount_received,
                currency: paymentIntent.currency,
              },
              idempotency_key: `stripe_evt_${event.id}`,
            });
          }
        }
      }
    }

    // Event 2: charge.refunded -> Advance state machine to refunded
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge;
      const orderId = charge.metadata?.order_id;

      if (orderId) {
        const order = await db.orders.getById(orderId);
        if (order && order.state === 'refund_pending') {
          await executeOrderTransition({
            order_id: order.id,
            to_state: 'refunded',
            trigger: 'webhook',
            actor: `stripe:${event.id}`,
            metadata: {
              charge_id: charge.id,
              amount_refunded: charge.amount_refunded,
            },
            idempotency_key: `stripe_ref_${event.id}`,
          });
        }
      }
    }

    return NextResponse.json({ received: true, event_type: event.type }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
