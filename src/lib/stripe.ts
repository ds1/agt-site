import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY && process.env.MOCK_FREENAME !== "true") {
  throw new Error("STRIPE_SECRET_KEY must be set in .env.local");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  typescript: true,
});

export default stripe;
