import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { fulfillDomainClaim } from "@/lib/fulfillment";
import { recordTransaction } from "@/lib/revenue";
import type Stripe from "stripe";

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

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
      break;

    case "checkout.session.expired":
      await handleCheckoutExpired(event.data.object as Stripe.Checkout.Session);
      break;

    case "charge.dispute.created":
      await handleDisputeCreated(event.data.object as Stripe.Dispute);
      break;

    case "charge.dispute.updated":
      await handleDisputeUpdated(event.data.object as Stripe.Dispute);
      break;

    case "charge.dispute.closed":
      await handleDisputeClosed(event.data.object as Stripe.Dispute);
      break;

    case "charge.refunded":
      await handleChargeRefunded(event.data.object as Stripe.Charge);
      break;

    default:
      console.log(`[Stripe] Unhandled event type: ${event.type}`);
  }

  // Always return 200 to Stripe
  return NextResponse.json({ received: true });
}

// -----------------------------------------------------------------------------
// checkout.session.completed — core fulfillment flow
// -----------------------------------------------------------------------------

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { domain, walletAddress, fulfillment_status } = session.metadata || {};

  // Idempotency — don't fulfill twice
  if (fulfillment_status === "complete") return;

  if (!domain || !walletAddress) {
    console.error("[Stripe] Webhook missing metadata:", session.id);
    return;
  }

  console.log(`[Stripe] Fulfilling ${domain} for ${walletAddress}`);

  // Record the sale
  const grossAmount = session.amount_total ?? 0;
  const currency = session.currency ?? "usd";

  // Fetch Stripe fee from the balance transaction
  let stripeFee = 0;
  if (session.payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(session.payment_intent as string, {
        expand: ["latest_charge.balance_transaction"],
      });
      const charge = pi.latest_charge as Stripe.Charge | undefined;
      const bt = charge?.balance_transaction as Stripe.BalanceTransaction | undefined;
      if (bt?.fee) {
        stripeFee = bt.fee;
      }
    } catch (err) {
      console.error("[Stripe] Could not fetch balance transaction:", err);
    }
  }

  const netAmount = grossAmount - stripeFee;
  await recordTransaction({
    type: "sale",
    timestamp: new Date().toISOString(),
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent as string,
    domain,
    walletAddress,
    grossAmount,
    currency,
    stripeFee,
    netAmount,
    freenameShare: Math.round(netAmount * 0.65),
    agtShare: netAmount - Math.round(netAmount * 0.65),
    metadata: session.metadata ?? undefined,
  });

  // Fulfill the domain claim
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

// -----------------------------------------------------------------------------
// checkout.session.expired — customer abandoned checkout
// -----------------------------------------------------------------------------

async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  const { domain, walletAddress } = session.metadata || {};
  console.log(
    `[Stripe] Checkout expired: ${domain || "unknown"} (wallet: ${walletAddress || "unknown"}, session: ${session.id})`
  );
  // Future: trigger abandoned-cart email (#28)
}

// -----------------------------------------------------------------------------
// charge.dispute.created — chargeback filed against us
// -----------------------------------------------------------------------------

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const charge = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  console.error(
    `[Stripe] DISPUTE CREATED — amount: ${dispute.amount} ${dispute.currency}, reason: ${dispute.reason}, charge: ${charge}`
  );

  await recordTransaction({
    type: "dispute_created",
    timestamp: new Date().toISOString(),
    stripeDisputeId: dispute.id,
    stripePaymentIntentId:
      typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id,
    grossAmount: dispute.amount,
    currency: dispute.currency,
    reason: dispute.reason ?? undefined,
    disputeStatus: dispute.status,
  });

  // Future: send alert email to ops (#82)
}

// -----------------------------------------------------------------------------
// charge.dispute.updated — dispute status changed
// -----------------------------------------------------------------------------

async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  console.log(
    `[Stripe] Dispute updated: ${dispute.id} — status: ${dispute.status}, reason: ${dispute.reason}`
  );
  // Future: update dispute tracking record
}

// -----------------------------------------------------------------------------
// charge.dispute.closed — dispute resolved (won or lost)
// -----------------------------------------------------------------------------

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const won = dispute.status === "won";
  console.log(
    `[Stripe] Dispute closed: ${dispute.id} — ${won ? "WON" : "LOST"} (${dispute.amount} ${dispute.currency})`
  );

  await recordTransaction({
    type: "dispute_closed",
    timestamp: new Date().toISOString(),
    stripeDisputeId: dispute.id,
    stripePaymentIntentId:
      typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id,
    grossAmount: won ? 0 : dispute.amount, // only counts as loss if we lost
    currency: dispute.currency,
    reason: dispute.reason ?? undefined,
    disputeStatus: dispute.status,
  });
}

// -----------------------------------------------------------------------------
// charge.refunded — refund processed (full or partial)
// -----------------------------------------------------------------------------

async function handleChargeRefunded(charge: Stripe.Charge) {
  const refunded = charge.amount_refunded;
  console.log(
    `[Stripe] Charge refunded: ${charge.id} — ${refunded} ${charge.currency}`
  );

  // Find domain from payment intent metadata
  let domain: string | undefined;
  if (charge.payment_intent) {
    try {
      const pi = await stripe.paymentIntents.retrieve(
        typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent.id
      );
      domain = pi.metadata?.domain;
    } catch {
      // best-effort metadata lookup
    }
  }

  await recordTransaction({
    type: "refund",
    timestamp: new Date().toISOString(),
    stripePaymentIntentId:
      typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id,
    domain,
    grossAmount: refunded,
    currency: charge.currency,
    reason: "refund",
  });
}
