import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import { fulfillDomainClaim } from "@/lib/fulfillment";
import { recordTransaction } from "@/lib/revenue";
import { log } from "@/lib/logger";
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
    log.error("webhook.signature_invalid", { error: String(err) });
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
      log.info("webhook.unhandled_event", { type: event.type });
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
    log.error("webhook.missing_metadata", { sessionId: session.id });
    return;
  }

  log.info("webhook.fulfilling", { domain, walletAddress, sessionId: session.id });

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
      log.warn("webhook.balance_transaction_fetch_failed", { sessionId: session.id, error: String(err) });
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
      log.info("webhook.fulfilled", { domain, zoneUuid: result.zoneUuid, sessionId: session.id });
    } else {
      await stripe.checkout.sessions.update(session.id, {
        metadata: {
          ...session.metadata,
          fulfillment_status: "failed",
          fulfillment_error: result.error || "Unknown error",
        },
      });
      log.critical("webhook.fulfillment_failed", { domain, error: result.error, sessionId: session.id });

      // Auto-refund on fulfillment failure
      if (session.payment_intent) {
        try {
          await stripe.refunds.create({
            payment_intent: session.payment_intent as string,
            reason: "requested_by_customer",
          });
          log.info("webhook.auto_refund", { domain, sessionId: session.id });
        } catch (refundErr) {
          log.critical("webhook.auto_refund_failed", { domain, sessionId: session.id, error: String(refundErr) });
        }
      }
    }
  } catch (error) {
    log.critical("webhook.fulfillment_crash", { domain, sessionId: session.id, error: String(error) });
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
  log.info("webhook.checkout_expired", { domain, walletAddress, sessionId: session.id });
}

// -----------------------------------------------------------------------------
// charge.dispute.created — chargeback filed against us
// -----------------------------------------------------------------------------

async function handleDisputeCreated(dispute: Stripe.Dispute) {
  const charge = typeof dispute.charge === "string" ? dispute.charge : dispute.charge?.id;
  const piId =
    typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;

  log.critical("webhook.dispute_created", {
    disputeId: dispute.id,
    chargeId: charge,
    paymentIntentId: piId,
    amount: dispute.amount,
    currency: dispute.currency,
    reason: dispute.reason,
    status: dispute.status,
    evidenceDueBy: dispute.evidence_details?.due_by
      ? new Date(dispute.evidence_details.due_by * 1000).toISOString()
      : null,
    stripeUrl: `https://dashboard.stripe.com/disputes/${dispute.id}`,
  });

  await recordTransaction({
    type: "dispute_created",
    timestamp: new Date().toISOString(),
    stripeDisputeId: dispute.id,
    stripePaymentIntentId: piId,
    grossAmount: dispute.amount,
    currency: dispute.currency,
    reason: dispute.reason ?? undefined,
    disputeStatus: dispute.status,
  });
}

// -----------------------------------------------------------------------------
// charge.dispute.updated — dispute status changed
// -----------------------------------------------------------------------------

async function handleDisputeUpdated(dispute: Stripe.Dispute) {
  log.info("webhook.dispute_updated", { disputeId: dispute.id, status: dispute.status, reason: dispute.reason });
}

// -----------------------------------------------------------------------------
// charge.dispute.closed — dispute resolved (won or lost)
// -----------------------------------------------------------------------------

async function handleDisputeClosed(dispute: Stripe.Dispute) {
  const won = dispute.status === "won";
  log.info("webhook.dispute_closed", { disputeId: dispute.id, outcome: won ? "won" : "lost", amount: dispute.amount, currency: dispute.currency });

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
  log.info("webhook.charge_refunded", { chargeId: charge.id, amount: refunded, currency: charge.currency });

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
