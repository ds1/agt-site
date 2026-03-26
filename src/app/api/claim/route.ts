import { NextResponse } from "next/server";

/**
 * Direct claim endpoint — DISABLED.
 *
 * Domain registration now requires payment via Stripe Checkout.
 * Fulfillment is handled by the Stripe webhook at /api/webhooks/stripe.
 *
 * This route is kept to return a clear error if anything still calls it.
 */
export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: "Direct claims are disabled. Use /api/checkout to start a payment session.",
    },
    { status: 403 }
  );
}
