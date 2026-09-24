# Stand On That! — starter site

A static site (shop, membership subscriptions, one-time support, content page)
wired up to Stripe Checkout through a Netlify serverless function, so no
secret key ever touches the browser.

## 1. Get a Stripe account
Sign up at https://dashboard.stripe.com/register. You can build and test
everything in **test mode** before ever going live — no real card is needed.

## 2. Get your Stripe secret key
Dashboard → Developers → API keys → copy the **Secret key**
(starts with `sk_test_...` in test mode, `sk_live_...` when you go live).
Never put this key in any HTML/JS file — it only belongs in Netlify's
environment variables (next step).

## 3. Deploy to Netlify
1. Push this folder to a GitHub repo.
2. In Netlify: "Add new site" → "Import an existing project" → pick the repo.
3. Build settings: publish directory `.`, functions directory `netlify/functions`
   (already set in `netlify.toml`, so you can usually just click deploy).
4. Site settings → Environment variables → add:
   - `STRIPE_SECRET_KEY` = your secret key from step 2

## 4. Connect your GoDaddy domain
Netlify → Domain settings → Add a domain → follow the DNS instructions
(usually a CNAME for `www` and/or A records for the root domain). Add those
records in GoDaddy's DNS panel for the domain. HTTPS is issued automatically
once DNS is verified.

## 5. Edit what you're actually selling
- **Products**: edit the `PRODUCTS` object in
  `netlify/functions/create-checkout.js` (source of truth for price — the
  browser only ever sends an *id*, never an amount, except for donations)
  and the matching cards in `shop.html`.
- **Membership tiers**: same idea, in the `SUBSCRIPTIONS` object and
  `subscribe.html`.
- **Donation amounts**: edit the buttons directly in `support.html`.
- **Videos**: replace the placeholder boxes in `content.html` with YouTube
  `<iframe>` embeds.

## 6. Test before going live
In test mode, use Stripe's test card `4242 4242 4242 4242`, any future
expiry date, any CVC. Full checkout flow, including subscriptions, works
end-to-end in test mode.

## 7. Go live
Dashboard → toggle out of test mode → copy your **live** secret key →
update the `STRIPE_SECRET_KEY` environment variable in Netlify → redeploy.
Also activate your Stripe account (business details, bank account for
payouts) if you haven't already — required before you can accept real
payments.

## Local development (optional)
```
npm install -g netlify-cli
npm install
netlify dev
```
This runs the site and the function locally at http://localhost:8888.
