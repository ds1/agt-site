import Stripe from "stripe";

// Lazy-initialized — only created when actually used at runtime, not at build time.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === "sk_test_PLACEHOLDER") {
      throw new Error("STRIPE_SECRET_KEY must be set to a real key in environment variables");
    }
    _stripe = new Stripe(key, { typescript: true });
  }
  return _stripe;
}

export default new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
