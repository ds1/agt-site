import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import FreenameAPI from "@/lib/freename-api";
import { randomUUID } from "crypto";

const MOCK = process.env.MOCK_FREENAME === "true";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// In-memory store for mock sessions (dev only)
const mockSessions = new Map<string, { domain: string; walletAddress: string }>();
export { mockSessions };

export async function POST(request: Request) {
  try {
    const { domain, walletAddress } = await request.json();

    if (!domain || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Domain and wallet address are required" },
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

    // Server-side price verification — don't trust the client
    const api = new FreenameAPI();
    const searchResult = await api.searchDomains(fullDomain);
    const resultData = searchResult?.data || searchResult;

    let priceAmount = 0;
    let priceCurrency = "usd";

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
          priceAmount = priceSource.amount;
          priceCurrency = (priceSource.currency || "USD").toLowerCase();
        }
      }
    }

    if (priceAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Could not determine price" },
        { status: 500 }
      );
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: priceCurrency,
            unit_amount: Math.round(priceAmount * 100), // Stripe uses cents
            product_data: {
              name: fullDomain,
              description: `.agt agent name — minted as NFT on Polygon`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        domain: fullDomain,
        walletAddress,
        fulfillment_status: "pending",
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
    const message = error instanceof Error ? error.message : "Checkout failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
