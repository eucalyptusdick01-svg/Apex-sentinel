import { getUncachableStripeClient } from './stripeClient';

async function createProducts() {
  const stripe = await getUncachableStripeClient();
  console.log('Creating Swept Sentinel subscription plans in Stripe...');

  // Pro Plan
  const existingPro = await stripe.products.search({ query: "name:'Swept Sentinel Pro' AND active:'true'" });
  if (existingPro.data.length > 0) {
    console.log('Pro plan already exists:', existingPro.data[0].id);
  } else {
    const pro = await stripe.products.create({
      name: 'Swept Sentinel Pro',
      description: 'All 141 real OSINT modules, unlimited runs, full threat intelligence suite.',
      metadata: { tier: 'pro', modules: '141', runs: 'unlimited' },
    });
    console.log('Created Pro product:', pro.id);

    const proMonthly = await stripe.prices.create({
      product: pro.id,
      unit_amount: 1900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { label: 'Pro Monthly' },
    });
    console.log('Created Pro monthly price: $19/mo —', proMonthly.id);

    const proYearly = await stripe.prices.create({
      product: pro.id,
      unit_amount: 15900,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { label: 'Pro Yearly' },
    });
    console.log('Created Pro yearly price: $159/yr —', proYearly.id);
  }

  // Enterprise Plan
  const existingEnt = await stripe.products.search({ query: "name:'Swept Sentinel Enterprise' AND active:'true'" });
  if (existingEnt.data.length > 0) {
    console.log('Enterprise plan already exists:', existingEnt.data[0].id);
  } else {
    const ent = await stripe.products.create({
      name: 'Swept Sentinel Enterprise',
      description: 'Everything in Pro plus API access, team accounts, and priority support.',
      metadata: { tier: 'enterprise', modules: '141', runs: 'unlimited', api_access: 'true' },
    });
    console.log('Created Enterprise product:', ent.id);

    const entMonthly = await stripe.prices.create({
      product: ent.id,
      unit_amount: 4900,
      currency: 'usd',
      recurring: { interval: 'month' },
      metadata: { label: 'Enterprise Monthly' },
    });
    console.log('Created Enterprise monthly price: $49/mo —', entMonthly.id);

    const entYearly = await stripe.prices.create({
      product: ent.id,
      unit_amount: 39900,
      currency: 'usd',
      recurring: { interval: 'year' },
      metadata: { label: 'Enterprise Yearly' },
    });
    console.log('Created Enterprise yearly price: $399/yr —', entYearly.id);
  }

  console.log('\nDone! Webhooks will sync products to the database automatically.');
}

createProducts().catch((err) => {
  console.error('Error:', err.message);
  process.exit(1);
});
