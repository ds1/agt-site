import { NextResponse } from "next/server";
import FreenameAPI from "@/lib/freename-api";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain) {
    return NextResponse.json(
      { success: false, error: "Domain parameter required" },
      { status: 400 }
    );
  }

  try {
    const api = new FreenameAPI();
    const result = await api.checkMintingStatus(domain);

    return NextResponse.json({
      success: true,
      status: result.data?.status || "UNKNOWN",
      transactionHash: result.data?.transactionHash || null,
    });
  } catch (error) {
    console.error("Minting status error:", error);

    // 404 likely means not in queue yet
    if (error instanceof Error && error.message.includes("404")) {
      return NextResponse.json({
        success: true,
        status: "PENDING",
        transactionHash: null,
      });
    }

    return NextResponse.json(
      { success: false, error: "Failed to check status" },
      { status: 500 }
    );
  }
}
