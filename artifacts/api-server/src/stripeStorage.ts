import { pool } from '@workspace/db';

export class StripeStorage {
  async getProduct(productId: string) {
    const result = await pool.query(
      'SELECT * FROM stripe.products WHERE id = $1',
      [productId]
    );
    return result.rows[0] ?? null;
  }

  async listProductsWithPrices() {
    const result = await pool.query(`
      WITH active_products AS (
        SELECT id, name, description, metadata, active
        FROM stripe.products
        WHERE active = true
        ORDER BY name
      )
      SELECT
        p.id AS product_id,
        p.name AS product_name,
        p.description AS product_description,
        p.active AS product_active,
        p.metadata AS product_metadata,
        pr.id AS price_id,
        pr.unit_amount,
        pr.currency,
        pr.recurring,
        pr.active AS price_active,
        pr.metadata AS price_metadata
      FROM active_products p
      LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
      ORDER BY p.name, pr.unit_amount
    `);
    return result.rows;
  }

  async getSubscription(subscriptionId: string) {
    const result = await pool.query(
      'SELECT * FROM stripe.subscriptions WHERE id = $1',
      [subscriptionId]
    );
    return result.rows[0] ?? null;
  }

  async getCustomer(customerId: string) {
    const result = await pool.query(
      'SELECT * FROM stripe.customers WHERE id = $1',
      [customerId]
    );
    return result.rows[0] ?? null;
  }

  async getUserStripeInfo(userId: string) {
    const result = await pool.query(
      'SELECT stripe_customer_id, stripe_subscription_id FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0] ?? null;
  }

  async updateUserStripeInfo(userId: string, info: { stripeCustomerId?: string; stripeSubscriptionId?: string }) {
    const updates: string[] = [];
    const values: string[] = [];
    let idx = 1;
    if (info.stripeCustomerId !== undefined) {
      updates.push(`stripe_customer_id = $${idx++}`);
      values.push(info.stripeCustomerId);
    }
    if (info.stripeSubscriptionId !== undefined) {
      updates.push(`stripe_subscription_id = $${idx++}`);
      values.push(info.stripeSubscriptionId);
    }
    if (!updates.length) return;
    values.push(userId);
    await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );
  }
}

export const stripeStorage = new StripeStorage();
