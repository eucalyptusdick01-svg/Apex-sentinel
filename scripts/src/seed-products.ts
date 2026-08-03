import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('Seeding Swept Sentinel Pro plans in Stripe...');

  // Find existing Pro product (list, not search — avoids index delay)
  const existing = await stripe.products.list({ limit: 20, active: true });
  const proPlan = existing.data.find((p) => p.name === 'Swept Sentinel Pro');

  let proId: string;

  if (proPlan) {
    console.log('Pro product already exists:', proPlan.id);
    proId = proPlan.id;
  } else {
    const pro = await stripe.products.create({
      name: 'Swept Sentinel Pro',
      description: 'All 173 real OSINT modules, unlimited runs, full threat intelligence suite.',
      metadata: { tier: 'pro', modules: '173', runs: 'unlimited' },
    });
    console.log('Created Pro product:', pro.id);
    proId = pro.id;
  }

  // Check existing prices on the product
  const existingPrices = await stripe.prices.list({ product: proId, active: true });
  const hasWeekly = existingPrices.data.some((p) => p.recurring?.interval === 'week');
  const hasMonthly = existingPrices.data.some((p) => p.recurring?.interval === 'month');

  if (hasWeekly) {
    const w = existingPrices.data.find((p) => p.recurring?.interval === 'week')!;
    console.log('Weekly price already exists:', w.id, `($${w.unit_amount! / 100}/wk)`);
  } else {
    const weekly = await stripe.prices.create({
      product: proId,
      unit_amount: 599,
      currency: 'usd',
      recurring: { interval: 'week' },
      metadata: { label: 'Pro Weekly' },
    });
    console.log('Created weekly price: $5.99/wk —', weekly.id);
  }

  if (hasMonthly) {
    const m = existingPrices.data.find((p) => p.recurring?.interval === 'month')!;
    console.log('Monthly price already exists:', m.id, `($${m.unit_amount! / 100}/mo)`);
  } else {
    const monthly = await stripe.prices.create({
      product: proId,
      unit_amount: 1999,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { label: 'Pro Monthly' },
    });
    console.log('Created monthly price: $19.99/mo —', monthly.id);
  }

  console.log('\nDone! Run the webhook sync or restart the API server to update the database.');
}

createProducts().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
