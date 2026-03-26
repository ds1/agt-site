import { NextResponse } from "next/server";
import FreenameAPI from "@/lib/freename-api";
import { keccak256 } from "js-sha3";

const MOCK = process.env.MOCK_FREENAME === "true";

const FNS_CONTRACT = "0x465ea4967479A96D4490d575b5a6cC2B4A4BEE65";

/**
 * Compute the FNS token ID for a domain.
 * tokenId = keccak256(bytes(tld) ++ keccak256(bytes(sld)))
 */
function computeTokenId(domain: string): string {
  const parts = domain.replace(/\.$/, "").split(".");
  if (parts.length !== 2) return "";
  const [sld, tld] = parts;

  const tldBytes = new TextEncoder().encode(tld);
  const sldHash = new Uint8Array(
    keccak256.arrayBuffer(new TextEncoder().encode(sld))
  );

  const combined = new Uint8Array(tldBytes.length + sldHash.length);
  combined.set(tldBytes);
  combined.set(sldHash, tldBytes.length);

  const tokenIdHex = keccak256(combined);
  const tokenIdDecimal = BigInt("0x" + tokenIdHex).toString();
  return tokenIdDecimal;
}

// Track mock poll counts per domain so status progresses realistically
const mockPollCounts = new Map<string, number>();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { success: false, error: "Domain parameter required" },
      { status: 400 }
    );
  }

  const tokenId = computeTokenId(domain);

  if (MOCK) {
    const count = (mockPollCounts.get(domain) || 0) + 1;
    mockPollCounts.set(domain, count);
    const status = count >= 3 ? "COMPLETE" : "PENDING";
    if (status === "COMPLETE") mockPollCounts.delete(domain);
    return NextResponse.json({
      success: true,
      status,
      transactionHash: status === "COMPLETE" ? "0x" + "a".repeat(64) : null,
      tokenId,
      contract: FNS_CONTRACT,
    });
  }

  try {
    const api = new FreenameAPI();
    const result = await api.checkMintingStatus(domain);

    return NextResponse.json({
      success: true,
      status: result.data?.status || "UNKNOWN",
      transactionHash: result.data?.transactionHash || null,
      tokenId,
      contract: FNS_CONTRACT,
    });
  } catch (error) {
    console.error("Minting status error:", error);

    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json({
        success: true,
        status: "PENDING",
        transactionHash: null,
        tokenId,
        contract: FNS_CONTRACT,
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
