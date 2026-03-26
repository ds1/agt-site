import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { fulfillDomainClaim } from "@/lib/fulfillment";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { domain, walletAddress, fulfillment_status } = session.metadata || {};

    // Idempotency — don't fulfill twice
    if (fulfillment_status === "complete") {
      return NextResponse.json({ received: true });
    }

    if (!domain || !walletAddress) {
      console.error("Webhook missing metadata:", session.id);
      return NextResponse.json({ received: true });
    }

    console.log(`[Stripe] Fulfilling ${domain} for ${walletAddress}`);

    try {
      const result = await fulfillDomainClaim(domain, walletAddress);

      if (result.success) {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            fulfillment_status: "complete",
            zoneUuid: result.zoneUuid || "",
          },
        });
        console.log(`[Stripe] Fulfilled ${domain} — zone ${result.zoneUuid}`);
      } else {
        await stripe.checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            fulfillment_status: "failed",
            fulfillment_error: result.error || "Unknown error",
          },
        });
        console.error(`[Stripe] Fulfillment failed for ${domain}:`, result.error);

        // Auto-refund on fulfillment failure
        if (session.payment_intent) {
          try {
            await stripe.refunds.create({
              payment_intent: session.payment_intent as string,
              reason: "requested_by_customer",
            });
            console.log(`[Stripe] Auto-refunded payment for ${domain}`);
          } catch (refundErr) {
            console.error(`[Stripe] Refund failed for ${domain}:`, refundErr);
          }
        }
      }
    } catch (error) {
      console.error(`[Stripe] Fulfillment error for ${domain}:`, error);
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...session.metadata,
          fulfillment_status: "failed",
          fulfillment_error: error instanceof Error ? error.message : "Fulfillment crashed",
        },
      });
    }
  }

  // Always return 200 to Stripe
  return NextResponse.json({ received: true });
}
