import { Router, type IRouter } from 'express';
import { pool } from '@workspace/db';
import { getUncachableStripeClient } from '../stripeClient';
import { stripeStorage } from '../stripeStorage';
import { requireAuth } from '../middleware/auth';
import crypto from 'crypto';

const router: IRouter = Router();

// Ensure gift_codes table exists
export async function ensureGiftTable(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS gift_codes (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code        TEXT NOT NULL UNIQUE,
      interval    TEXT NOT NULL,
      stripe_session_id TEXT,
      gifter_email TEXT,
      recipient_email TEXT,
      redeemed_by UUID REFERENCES users(id),
      redeemed_at TIMESTAMP,
      expires_at  TIMESTAMP NOT NULL,
      created_at  TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);
}

// POST /api/stripe/gift-checkout — create a Stripe Checkout for a gift (no auth required)
router.post('/stripe/gift-checkout', async (req: any, res) => {
  try {
    const { priceId, recipientEmail, interval } = req.body as {
      priceId: string;
      recipientEmail: string;
      interval: string;
    };

    if (!priceId) { res.status(400).json({ error: 'priceId required' }); return; }
    if (!recipientEmail || !recipientEmail.includes('@')) {
      res.status(400).json({ error: 'Valid recipient email required' }); return;
    }
    if (!['week', 'month'].includes(interval)) {
      res.status(400).json({ error: 'interval must be week or month' }); return;
    }

    const stripe = await getUncachableStripeClient();
    const baseUrl = `https://${process.env.REPLIT_DOMAINS?.split(',')[0] ?? req.get('host')}`;

    // One-time payment for the gift
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'payment',
      success_url: `${baseUrl}/gift/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/gift`,
      metadata: {
        gift: 'true',
        interval,
        recipientEmail,
      },
    });

    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gift/confirm — called after successful gift checkout to generate the code
router.post('/gift/confirm', async (req: any, res) => {
  try {
    const { sessionId } = req.body as { sessionId: string };
    if (!sessionId) { res.status(400).json({ error: 'sessionId required' }); return; }

    // Check if this session already has a code
    const existing = await pool.query(
      'SELECT code FROM gift_codes WHERE stripe_session_id = $1',
      [sessionId]
    );
    if (existing.rows.length > 0) {
      res.json({ code: existing.rows[0].code });
      return;
    }

    const stripe = await getUncachableStripeClient();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      res.status(402).json({ error: 'Payment not completed' }); return;
    }
    if (session.metadata?.gift !== 'true') {
      res.status(400).json({ error: 'Not a gift session' }); return;
    }

    const interval = session.metadata.interval as string;
    const recipientEmail = session.metadata.recipientEmail as string;
    const gifterEmail = (session.customer_details?.email ?? null) as string | null;

    // Gift is valid for the chosen interval from redemption date
    const intervalMs = interval === 'week' ? 7 * 24 * 3600 * 1000 : 30 * 24 * 3600 * 1000;
    // expires_at here is the max deadline to redeem (90 days), not the access period
    const expiresAt = new Date(Date.now() + 90 * 24 * 3600 * 1000);

    // Generate a short, friendly code
    const code = crypto.randomBytes(5).toString('hex').toUpperCase();

    await pool.query(
      `INSERT INTO gift_codes (code, interval, stripe_session_id, gifter_email, recipient_email, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [code, interval, sessionId, gifterEmail, recipientEmail || null, expiresAt]
    );

    res.json({ code, interval, recipientEmail });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gift/:code — check gift code validity
router.get('/gift/:code', async (req: any, res) => {
  try {
    const { code } = req.params as { code: string };
    const result = await pool.query(
      `SELECT code, interval, recipient_email, redeemed_at, expires_at
       FROM gift_codes WHERE code = $1`,
      [code.toUpperCase()]
    );
    if (!result.rows.length) {
      res.status(404).json({ error: 'Gift code not found' }); return;
    }
    const gift = result.rows[0];
    if (gift.redeemed_at) {
      res.status(409).json({ error: 'Gift already redeemed' }); return;
    }
    if (new Date(gift.expires_at) < new Date()) {
      res.status(410).json({ error: 'Gift code has expired' }); return;
    }
    res.json({ valid: true, interval: gift.interval, recipientEmail: gift.recipient_email });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/gift/redeem — redeem a gift code (requires login)
router.post('/gift/redeem', requireAuth, async (req: any, res) => {
  try {
    const { code } = req.body as { code: string };
    if (!code) { res.status(400).json({ error: 'code required' }); return; }

    const result = await pool.query(
      `SELECT id, interval, recipient_email, redeemed_at, expires_at
       FROM gift_codes WHERE code = $1`,
      [code.toUpperCase()]
    );
    if (!result.rows.length) {
      res.status(404).json({ error: 'Gift code not found' }); return;
    }
    const gift = result.rows[0];

    if (gift.redeemed_at) {
      res.status(409).json({ error: 'Gift already redeemed' }); return;
    }
    if (new Date(gift.expires_at) < new Date()) {
      res.status(410).json({ error: 'Gift code has expired' }); return;
    }

    // Calculate access period from now
    const intervalMs = gift.interval === 'week'
      ? 7 * 24 * 3600 * 1000
      : 30 * 24 * 3600 * 1000;
    const giftExpiresAt = new Date(Date.now() + intervalMs);

    // Mark redeemed and grant access
    await pool.query(
      `UPDATE gift_codes SET redeemed_by = $1, redeemed_at = NOW() WHERE id = $2`,
      [req.session.userId, gift.id]
    );

    // Extend any existing gift_expires_at if user already has gift access
    await pool.query(
      `UPDATE users
       SET gift_expires_at = CASE
         WHEN gift_expires_at > NOW() THEN gift_expires_at + $1::interval
         ELSE $2
       END
       WHERE id = $3`,
      [gift.interval === 'week' ? '7 days' : '30 days', giftExpiresAt, req.session.userId]
    );

    res.json({ success: true, giftExpiresAt, interval: gift.interval });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
