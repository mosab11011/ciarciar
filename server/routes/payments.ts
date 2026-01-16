import express from 'express';
import Stripe from 'stripe';
import { PaymentModel } from '../models/Payment';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, limit, offset } = req.query as { status?: any; limit?: any; offset?: any };
    const data = await PaymentModel.list({ status, limit: limit ? Number(limit) : undefined, offset: offset ? Number(offset) : undefined });
    res.json({ success: true, data });
  } catch (e) {
    console.error('Error listing payments:', e);
    res.status(500).json({ success: false, error: 'Failed to list payments' });
  }
});

router.get('/stats', async (_req, res) => {
  try {
    const data = await PaymentModel.stats();
    res.json({ success: true, data });
  } catch (e) {
    console.error('Error getting payments stats:', e);
    res.status(500).json({ success: false, error: 'Failed to get payments stats' });
  }
});

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY');
  }
  return new Stripe(key, { apiVersion: '2024-06-20' });
}

function isZeroDecimal(currency: string) {
  const zeroDecimal = new Set(['BIF','CLP','DJF','GNF','JPY','KMF','KRW','MGA','PYG','RWF','UGX','VND','VUV','XAF','XOF','XPF']);
  return zeroDecimal.has(currency.toUpperCase());
}

function toUnitAmount(amount: number, currency: string): number {
  return isZeroDecimal(currency) ? Math.round(amount) : Math.round(amount * 100);
}

router.post('/checkout-session', async (req, res) => {
  try {
    const { amount, amount_cents, currency = 'USD', description = null, metadata = {}, customer_email = null, success_url, cancel_url, payment_method_types } = req.body || {};

    if ((amount === undefined || amount === null) && (amount_cents === undefined || amount_cents === null)) {
      return res.status(400).json({ success: false, error: 'amount or amount_cents is required' });
    }

    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
      return res.status(400).json({ success: false, error: 'Valid 3-letter ISO currency is required' });
    }

    const ua = String(req.headers['user-agent'] || '');
    const origin = (req.headers.origin as string) || `${req.protocol}://${req.get('host')}`;

    const computedAmount = amount_cents !== undefined && amount_cents !== null
      ? Number(amount_cents)
      : toUnitAmount(Number(amount), currency);

    if (!Number.isFinite(computedAmount) || computedAmount < 50) {
      return res.status(400).json({ success: false, error: 'Invalid amount' });
    }

    // Validate and sanitize payment method types (allow-list)
    const allowed = new Set([
      'card','sepa_debit','sofort','giropay','ideal','bancontact','eps','p24','grabpay','alipay'
    ]);
    const methods = Array.isArray(payment_method_types) && payment_method_types.length
      ? payment_method_types.filter((m: string) => allowed.has(String(m)))
      : ['card'];

    // Create local payment record first
    const local = await PaymentModel.create({
      provider: 'stripe',
      amount: computedAmount,
      currency,
      description,
      customer_email,
      metadata,
    });

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: methods as any,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || 'Payment',
            },
            unit_amount: computedAmount,
          },
          quantity: 1,
        },
      ],
      success_url: success_url && typeof success_url === 'string' ? success_url : `${origin}/checkout?status=success&session_id={CHECKOUT_SESSION_ID}&pid=${local.id}`,
      cancel_url: cancel_url && typeof cancel_url === 'string' ? cancel_url : `${origin}/checkout?status=cancel&pid=${local.id}`,
      customer_email: customer_email || undefined,
      metadata: { ...metadata, local_payment_id: local.id },
    });

    await PaymentModel.attachProviderRefs(local.id, { sessionId: session.id, intentId: session.payment_intent ? String(session.payment_intent) : null });

    return res.json({ success: true, sessionId: session.id, url: session.url, localPaymentId: local.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({ success: false, error: 'Failed to create checkout session' });
  }
});

// Webhook for Stripe events (must be raw body)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'] as string | undefined;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return res.status(500).send('Webhook not configured');
  }

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, sig || '', webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await PaymentModel.updateByProviderRefs({
          provider_session_id: session.id,
          provider_payment_intent_id: session.payment_intent ? String(session.payment_intent) : null,
          status: 'paid',
          customer_email: (session.customer_details && session.customer_details.email) || null,
        });
        break;
      }
      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        await PaymentModel.updateByProviderRefs({ provider_session_id: session.id, status: 'canceled' });
        break;
      }
      case 'payment_intent.succeeded': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await PaymentModel.updateByProviderRefs({ provider_payment_intent_id: intent.id, status: 'paid' });
        break;
      }
      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent;
        await PaymentModel.updateByProviderRefs({ provider_payment_intent_id: intent.id, status: 'failed' });
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        if (charge.payment_intent) {
          await PaymentModel.updateByProviderRefs({ provider_payment_intent_id: String(charge.payment_intent), status: 'refunded' });
        }
        break;
      }
      default:
        break;
    }

    res.json({ received: true });
  } catch (e) {
    console.error('Webhook handling failed:', e);
    res.status(500).send('Webhook handling failed');
  }
});

router.get('/confirm', async (req, res) => {
  try {
    const { session_id } = req.query as { session_id?: string };
    if (!session_id) return res.status(400).json({ success: false, error: 'session_id is required' });
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

    if (session.payment_status === 'paid') {
      await PaymentModel.updateByProviderRefs({ provider_session_id: session.id, status: 'paid', provider_payment_intent_id: session.payment_intent ? String(session.payment_intent) : null, customer_email: (session.customer_details && session.customer_details.email) || null });
    }

    return res.json({ success: true, payment_status: session.payment_status, session });
  } catch (e) {
    console.error('Confirm session failed:', e);
    return res.status(500).json({ success: false, error: 'Failed to confirm session' });
  }
});

export default router;
