import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';

export function isStripeConfigured(): boolean {
  if (!stripeSecretKey || stripeSecretKey.startsWith('mock_') || stripeSecretKey.startsWith('sk_test_mock')) {
    return false;
  }
  return stripeSecretKey.length > 20;
}

let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeInstance) {
    stripeInstance = new Stripe(stripeSecretKey, {
      apiVersion: '2024-11-20.acacia' as any,
    });
  }
  return stripeInstance;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
  amountPence: number;
  currency: string;
  isMock: boolean;
}

/**
 * Creates a Stripe PaymentIntent with integer pence and attaches order metadata.
 */
export async function createPaymentIntent(params: {
  orderId: string;
  amountGbp: number;
  customerEmail: string;
  metadata?: Record<string, string>;
}): Promise<PaymentIntentResult> {
  // Convert GBP to integer-pence: £19.99 -> 1999 pence
  const amountPence = Math.round(params.amountGbp * 100);

  if (!isStripeConfigured()) {
    const mockId = `pi_mock_${params.orderId}_${Date.now().toString().slice(-4)}`;
    return {
      clientSecret: `${mockId}_secret_test`,
      paymentIntentId: mockId,
      amountPence,
      currency: 'gbp',
      isMock: true,
    };
  }

  const stripe = getStripe();
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountPence,
    currency: 'gbp',
    receipt_email: params.customerEmail,
    metadata: {
      order_id: params.orderId,
      customer_email: params.customerEmail,
      ...(params.metadata || {}),
    },
    automatic_payment_methods: { enabled: true },
  });

  return {
    clientSecret: paymentIntent.client_secret || '',
    paymentIntentId: paymentIntent.id,
    amountPence,
    currency: 'gbp',
    isMock: false,
  };
}

/**
 * Retrieves a PaymentIntent by ID.
 */
export async function retrievePaymentIntent(
  id: string
): Promise<Stripe.PaymentIntent | { id: string; status: string; isMock: boolean }> {
  if (!isStripeConfigured() || id.startsWith('pi_mock_')) {
    return { id, status: 'succeeded', isMock: true };
  }
  const stripe = getStripe();
  return stripe.paymentIntents.retrieve(id);
}

/**
 * Creates a refund in integer-pence.
 */
export async function createRefund(
  paymentIntentId: string,
  amountGbp?: number,
  reason?: Stripe.RefundCreateParams.Reason
): Promise<{ id: string; status: string; isMock: boolean }> {
  if (!isStripeConfigured() || paymentIntentId.startsWith('pi_mock_')) {
    return { id: `re_mock_${Date.now()}`, status: 'succeeded', isMock: true };
  }
  const stripe = getStripe();
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amountGbp ? Math.round(amountGbp * 100) : undefined,
    reason,
  });
  return { id: refund.id, status: refund.status || 'succeeded', isMock: false };
}
