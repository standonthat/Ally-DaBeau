// Runs on Netlify's servers, never in the browser. Your Stripe secret key is
// read from an environment variable (set in Netlify site settings), so it's
// never exposed to site visitors.
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ---- Edit these to match what you actually sell ----
const PRODUCTS = {
  'tee-raw-edge':      { name: 'Raw-edge tee',        amount: 3800 },
  'hoodie-overdyed':   { name: 'Overdyed hoodie',      amount: 7400 },
  'jacket-patchwork':  { name: 'Patchwork jacket',     amount: 15600 },
};

const SUBSCRIPTIONS = {
  'tier-listener': { name: 'Listener membership', amount: 300,  interval: 'month' },
  'tier-regular':  { name: 'Regular membership',  amount: 800,  interval: 'month' },
  'tier-patron':   { name: 'Patron membership',   amount: 2000, interval: 'month' },
};
// ------------------------------------------------------

const SITE_URL = process.env.URL || 'http://localhost:8888';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { mode, id, amountCents } = body;

  try {
    let session;

    if (mode === 'subscription') {
      const tier = SUBSCRIPTIONS[id];
      if (!tier) return { statusCode: 400, body: JSON.stringify({ error: 'Unknown membership tier' }) };

      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: tier.name },
            unit_amount: tier.amount,
            recurring: { interval: tier.interval },
          },
          quantity: 1,
        }],
        success_url: `${SITE_URL}/subscribe.html?status=success`,
        cancel_url: `${SITE_URL}/subscribe.html?status=cancelled`,
      });

    } else if (mode === 'payment' && id === 'donation') {
      const amount = parseInt(amountCents, 10);
      if (!amount || amount < 100) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Minimum donation is $1.' }) };
      }
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: 'One-time support' },
            unit_amount: amount,
          },
          quantity: 1,
        }],
        success_url: `${SITE_URL}/support.html?status=success`,
        cancel_url: `${SITE_URL}/support.html?status=cancelled`,
      });

    } else if (mode === 'payment') {
      const product = PRODUCTS[id];
      if (!product) return { statusCode: 400, body: JSON.stringify({ error: 'Unknown product' }) };

      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: 'usd',
            product_data: { name: product.name },
            unit_amount: product.amount,
          },
          quantity: 1,
        }],
        shipping_address_collection: { allowed_countries: ['US', 'CA'] },
        success_url: `${SITE_URL}/shop.html?status=success`,
        cancel_url: `${SITE_URL}/shop.html?status=cancelled`,
      });

    } else {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid mode' }) };
    }

    return { statusCode: 200, body: JSON.stringify({ url: session.url }) };

  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Stripe error, please try again.' }) };
  }
};
