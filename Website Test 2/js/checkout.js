// Calls our own serverless function, which talks to Stripe using the secret key.
// The browser never sees or handles a secret key.
async function startCheckout(payload, buttonEl) {
  const statusEl = document.getElementById('status');
  const originalText = buttonEl ? buttonEl.textContent : '';
  if (buttonEl) { buttonEl.disabled = true; buttonEl.textContent = 'Loading...'; }
  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'status-msg'; }

  try {
    const res = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok || !data.url) {
      throw new Error(data.error || 'Could not start checkout.');
    }
    window.location.href = data.url; // Stripe-hosted checkout page
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = err.message || 'Something went wrong. Please try again.';
      statusEl.className = 'status-msg err';
    }
    if (buttonEl) { buttonEl.disabled = false; buttonEl.textContent = originalText; }
  }
}
