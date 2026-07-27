import { getUncachableStripeClient } from './stripeClient';

async function addWeeklyPrice() {
  const stripe = await getUncachableStripeClient();

  // Find the Pro plan
  const existing = await stripe.products.search({ query: "name:'Swept Sentinel Pro' AND active:'true'" });
  if (existing.data.length === 0) {
    console.error('Pro plan not found — run seed-products first.');
    process.exit(1);
  }

  const pro = existing.data[0];
  console.log('Found Pro product:', pro.id);

  // Check if weekly price already exists
  const prices = await stripe.prices.list({ product: pro.id, active: true });
  const existing_weekly = prices.data.find(p => p.recurring?.interval === 'week');
  if (existing_weekly) {
    console.log('Weekly price already exists:', existing_weekly.id, '— skipping.');
    process.exit(0);
  }

  const weekly = await stripe.prices.create({
    product: pro.id,
    unit_amount: 599,
    currency: 'usd',
    recurring: { interval: 'week' },
    metadata: { label: 'Pro Weekly' },
  });

  console.log('Created Pro weekly price: $5.99/wk —', weekly.id);
}

addWeeklyPrice().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
