import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import FreenameAPI, { FreenameRateLimitError, FreenameTimeoutError } from "@/lib/freename-api";
import { randomUUID } from "crypto";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { calculatePrice } from "@/lib/pricing";

const MOCK = process.env.MOCK_FREENAME === "true";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// In-memory store for mock sessions (dev only)
const mockSessions = new Map<string, { domain: string; walletAddress: string }>();
export { mockSessions };

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`checkout:${ip}`, 5);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Too many checkout attempts. Please wait a minute." },
      { status: 429 }
    );
  }

  try {
    const { domain, walletAddress, email, termsAccepted } = await request.json();

    if (!domain || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Domain and wallet address are required" },
        { status: 400 }
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        { success: false, error: "You must accept the Terms of Service to continue" },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const fullDomain = domain.toLowerCase().replace(/\.agt$/, "") + ".agt";

    // Mock mode — skip Stripe entirely
    if (MOCK) {
      const mockSessionId = `mock_sess_${randomUUID()}`;
      mockSessions.set(mockSessionId, { domain: fullDomain, walletAddress });
      return NextResponse.json({
        success: true,
        url: `${BASE_URL}/claim?session_id=${mockSessionId}`,
      });
    }

    const validEmail =
      typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? email
        : undefined;

    // Server-side price verification — don't trust the client
    const api = new FreenameAPI();
    const searchResult = await api.searchDomains(fullDomain);
    const resultData = searchResult?.data || searchResult;

    let freenameBasePrice = 0;
    let baseCurrency = "usd";

    if (resultData?.result) {
      const exactMatch = resultData.result.find(
        (r: { type: string }) => r.type === "EXACT_MATCH"
      );
      if (exactMatch?.elements?.length > 0) {
        const element = exactMatch.elements[0];
        if (element.availabilityStatus !== "AVAILABLE") {
          return NextResponse.json(
            { success: false, error: "Name is not available" },
            { status: 409 }
          );
        }
        const priceSource = element.domainPrice || element.price;
        if (priceSource?.amount) {
          freenameBasePrice = priceSource.amount;
          baseCurrency = (priceSource.currency || "USD").toLowerCase();
        }
      }
    }

    if (freenameBasePrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Could not determine price" },
        { status: 500 }
      );
    }

    // Apply pricing strategy (markup on Freename base price)
    const pricing = calculatePrice(freenameBasePrice, baseCurrency);

    // Enable Stripe Tax if configured (set STRIPE_TAX_ENABLED=true in env)
    const taxEnabled = process.env.STRIPE_TAX_ENABLED === "true";

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      ...(validEmail ? { customer_email: validEmail } : {}),
      ...(taxEnabled ? { automatic_tax: { enabled: true } } : {}),
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            unit_amount: pricing.amountCents,
            product_data: {
              name: fullDomain,
              description: `.agt agent name — minted as NFT on Polygon`,
              ...(taxEnabled ? { tax_code: "txcd_10000000" } : {}), // General digital goods
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        domain: fullDomain,
        walletAddress,
        fulfillment_status: "pending",
        freename_base_price: String(freenameBasePrice),
        customer_price: String(pricing.amount),
        markup_percent: String(pricing.markup),
        ...(validEmail ? { email: validEmail } : {}),
      },
      success_url: `${BASE_URL}/claim?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/claim?name=${encodeURIComponent(fullDomain.replace(/\.agt$/, ""))}&cancelled=true`,
    });

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof FreenameRateLimitError) {
      return NextResponse.json(
        { success: false, error: "Service is busy. Please try again in a moment." },
        { status: 429 }
      );
    }
    if (error instanceof FreenameTimeoutError) {
      return NextResponse.json(
        { success: false, error: "Could not verify domain availability. Please try again." },
        { status: 504 }
      );
    }
    // Don't leak internal error details to the client
    return NextResponse.json(
      { success: false, error: "Checkout failed. Please try again." },
      { status: 500 }
    );
  }
}
