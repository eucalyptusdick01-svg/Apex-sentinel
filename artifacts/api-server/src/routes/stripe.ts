import { Router, type IRouter } from 'express';
import { getUncachableStripeClient } from '../stripeClient';
import { stripeStorage } from '../stripeStorage';
import { requireAuth } from '../middleware/auth';

const router: IRouter = Router();

router.get('/stripe/plans', async (_req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const [productsRes, pricesRes] = await Promise.all([
      stripe.products.list({ active: true, limit: 100 }),
      stripe.prices.list({ active: true, limit: 100 }),
    ]);
    const productsMap = new Map<string, {
      id: string; name: string; description: string | null;
      metadata: Record<string, string>; prices: Array<{
        id: string; unit_amount: number; currency: string;
        recurring: { interval: string } | null;
      }>;
    }>();
    for (const product of productsRes.data) {
      productsMap.set(product.id, {
        id: product.id,
        name: product.name,
        description: product.description ?? null,
        metadata: product.metadata as Record<string, string>,
        prices: [],
      });
    }
    for (const price of pricesRes.data) {
      const productId = typeof price.product === 'string' ? price.product : price.product.id;
      productsMap.get(productId)?.prices.push({
        id: price.id,
        unit_amount: price.unit_amount ?? 0,
        currency: price.currency,
        recurring: price.recurring ? { interval: price.recurring.interval } : null,
      });
    }
    res.json({ plans: Array.from(productsMap.values()) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/checkout', requireAuth, async (req: any, res) => {
  try {
    const { priceId } = req.body as { priceId: string };
    if (!priceId) { res.status(400).json({ error: 'priceId required' }); return; }

    const stripe = await getUncachableStripeClient();
    const userInfo = await stripeStorage.getUserStripeInfo(req.session.userId as string);

    let customerId: string = userInfo?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: req.session.email as string,
        metadata: { userId: req.session.userId as string },
      });
      await stripeStorage.updateUserStripeInfo(req.session.userId as string, {
        stripeCustomerId: customer.id,
      });
      customerId = customer.id;
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? req.get('host')}`;
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/pricing`,
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stripe/portal', requireAuth, async (req: any, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const userInfo = await stripeStorage.getUserStripeInfo(req.session.userId as string);

    if (!userInfo?.stripe_customer_id) {
      res.status(400).json({ error: 'No active subscription found' }); return;
    }

    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? req.get('host')}`;
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: userInfo.stripe_customer_id as string,
      return_url: `${baseUrl}/dashboard`,
    });

    res.json({ url: portalSession.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/stripe/subscription', requireAuth, async (req: any, res) => {
  try {
    // Check gift access first
    const { pool } = await import('@workspace/db');
    const giftResult = await pool.query(
      'SELECT gift_expires_at FROM users WHERE id = $1',
      [req.session.userId as string]
    );
    const giftExpiresAt: Date | null = giftResult.rows[0]?.gift_expires_at ?? null;
    if (giftExpiresAt && new Date(giftExpiresAt) > new Date()) {
      res.json({ subscription: null, plan: 'pro', giftExpiresAt });
      return;
    }

    const userInfo = await stripeStorage.getUserStripeInfo(req.session.userId as string);
    if (!userInfo?.stripe_subscription_id) {
      res.json({ subscription: null, plan: 'free' }); return;
    }

    const stripe = await getUncachableStripeClient();
    const sub = await stripe.subscriptions.retrieve(userInfo.stripe_subscription_id as string);
    res.json({ subscription: sub, plan: sub?.status === 'active' ? 'pro' : 'free' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
