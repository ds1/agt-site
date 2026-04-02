import { NextResponse } from "next/server";
import FreenameAPI, { FreenameRateLimitError, FreenameTimeoutError } from "@/lib/freename-api";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { calculatePrice } from "@/lib/pricing";

const MOCK = process.env.MOCK_FREENAME === "true";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`search:${ip}`, 30);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  let name = searchParams.get("name");

  if (!name) {
    return NextResponse.json(
      { success: false, error: "Name parameter required" },
      { status: 400 }
    );
  }

  name = name.toLowerCase().trim().replace(/\.agt$/, "");

  if (name.length < 1 || name.length > 63) {
    return NextResponse.json(
      { success: false, error: "Name must be between 1 and 63 characters" },
      { status: 400 }
    );
  }

  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(name) && name.length > 1) {
    return NextResponse.json(
      {
        success: false,
        error: "Name can only contain letters, numbers, and hyphens",
      },
      { status: 400 }
    );
  }

  const fullDomain = `${name}.agt`;

  if (MOCK) {
    const taken = ["test", "hello", "agent"];
    const isTaken = taken.includes(name);
    const mockBase = 9.99;
    const mockPricing = isTaken ? null : calculatePrice(mockBase, "USD");
    return NextResponse.json({
      success: true,
      name,
      fullDomain,
      status: isTaken ? "unavailable" : "available",
      available: !isTaken,
      price: mockPricing ? { currency: mockPricing.currency, amount: mockPricing.amount } : null,
    });
  }

  try {
    const api = new FreenameAPI();
    const searchResult = await api.searchDomains(fullDomain);
    const resultData = searchResult?.data || searchResult;

    let status = "unavailable";
    let price = null;

    if (resultData?.result) {
      const exactMatch = resultData.result.find(
        (r: { type: string }) => r.type === "EXACT_MATCH"
      );

      if (exactMatch?.elements?.length > 0) {
        const element = exactMatch.elements[0];
        const apiStatus = element.availabilityStatus;

        if (apiStatus === "AVAILABLE") {
          status = "available";
          const priceSource = element.domainPrice || element.price;
          if (priceSource?.amount) {
            const pricing = calculatePrice(
              priceSource.amount,
              priceSource.currency || "USD"
            );
            price = {
              currency: pricing.currency,
              amount: pricing.amount,
            };
          }
        } else if (apiStatus === "PROTECTED") {
          status = "protected";
        }
      }
    }

    return NextResponse.json({
      success: true,
      name,
      fullDomain,
      status,
      available: status === "available",
      price,
    });
  } catch (error) {
    console.error("Search error:", error);
    if (error instanceof FreenameRateLimitError) {
      return NextResponse.json(
        { success: false, error: "Service is busy. Please try again in a moment." },
        { status: 429 }
      );
    }
    if (error instanceof FreenameTimeoutError) {
      return NextResponse.json(
        { success: false, error: "Search timed out. Please try again." },
        { status: 504 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Search failed. Please try again." },
      { status: 500 }
    );
  }
}
