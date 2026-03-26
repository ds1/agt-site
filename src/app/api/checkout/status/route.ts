import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";

const MOCK = process.env.MOCK_FREENAME === "true";

// Mock fulfillment polling state
const mockPollCounts = new Map<string, number>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");

  if (!sessionId) {
    return NextResponse.json(
      { success: false, error: "session_id parameter required" },
      { status: 400 }
    );
  }

  // Mock mode
  if (MOCK) {
    // Dynamically import to access the shared mock store
    const { mockSessions } = await import("../route");

    const count = (mockPollCounts.get(sessionId) || 0) + 1;
    mockPollCounts.set(sessionId, count);

    const mockData = mockSessions.get(sessionId);

    // Simulate: pending for 2 polls, then complete
    if (count >= 3) {
      mockPollCounts.delete(sessionId);
      const { randomUUID } = await import("crypto");
      return NextResponse.json({
        success: true,
        fulfillment_status: "complete",
        domain: mockData?.domain || "mock.agt",
        walletAddress: mockData?.walletAddress || "0x" + "0".repeat(40),
        zoneUuid: randomUUID(),
      });
    }

    return NextResponse.json({
      success: true,
      fulfillment_status: "pending",
      domain: mockData?.domain || "mock.agt",
      walletAddress: mockData?.walletAddress || "0x" + "0".repeat(40),
      zoneUuid: null,
    });
  }

  // Production — read state from Stripe session metadata
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return NextResponse.json({
        success: true,
        fulfillment_status: "awaiting_payment",
        domain: session.metadata?.domain || null,
        walletAddress: session.metadata?.walletAddress || null,
        zoneUuid: null,
      });
    }

    return NextResponse.json({
      success: true,
      fulfillment_status: session.metadata?.fulfillment_status || "pending",
      domain: session.metadata?.domain || null,
      walletAddress: session.metadata?.walletAddress || null,
      zoneUuid: session.metadata?.zoneUuid || null,
      error: session.metadata?.fulfillment_error || null,
    });
  } catch (error) {
    console.error("Checkout status error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
