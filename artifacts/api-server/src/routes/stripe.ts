import { Router, type IRouter } from 'express';
import { getUncachableStripeClient } from '../stripeClient';
import { stripeStorage } from '../stripeStorage';
import { requireAuth } from '../middleware/auth';

const router: IRouter = Router();

router.get('/stripe/plans', async (_req, res) => {
  try {
    const rows = await stripeStorage.listProductsWithPrices();
    const productsMap = new Map<string, {
      id: string; name: string; description: string | null;
      metadata: Record<string, string> | null; prices: Array<{
        id: string; unit_amount: number; currency: string;
        recurring: { interval: string } | null;
      }>;
    }>();
    for (const row of rows) {
      if (!productsMap.has(row.product_id as string)) {
        productsMap.set(row.product_id as string, {
          id: row.product_id as string,
          name: row.product_name as string,
          description: row.product_description as string | null,
          metadata: row.product_metadata as Record<string, string> | null,
          prices: [],
        });
      }
      if (row.price_id) {
        productsMap.get(row.product_id as string)!.prices.push({
          id: row.price_id as string,
          unit_amount: row.unit_amount as number,
          currency: row.currency as string,
          recurring: row.recurring as { interval: string } | null,
        });
      }
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
    const userInfo = await stripeStorage.getUserStripeInfo(req.session.userId as string);
    if (!userInfo?.stripe_subscription_id) {
      res.json({ subscription: null, plan: 'free' }); return;
    }

    const sub = await stripeStorage.getSubscription(userInfo.stripe_subscription_id as string);
    res.json({ subscription: sub, plan: sub?.status === 'active' ? 'pro' : 'free' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
