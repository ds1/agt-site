import { NextResponse } from "next/server";
import FreenameAPI from "@/lib/freename-api";

export async function POST(request: Request) {
  try {
    const { name, walletAddress } = await request.json();

    if (!name || !walletAddress) {
      return NextResponse.json(
        { success: false, error: "Name and wallet address are required" },
        { status: 400 }
      );
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet address" },
        { status: 400 }
      );
    }

    const fullDomain = name.toLowerCase().replace(/\.agt$/, "") + ".agt";
    const api = new FreenameAPI();

    // 1. Re-check availability
    const available = await api.checkAvailability(fullDomain);
    if (!available) {
      return NextResponse.json(
        { success: false, error: "Name is no longer available" },
        { status: 409 }
      );
    }

    // 2. Create zone
    const zoneResult = await api.createZone({
      name: fullDomain,
      walletAddress,
    });

    const zoneUuid = zoneResult.data?.uuid;
    if (!zoneUuid) {
      throw new Error("Zone creation failed — no UUID returned");
    }

    // 3. Trigger minting on Polygon
    await api.triggerMinting(fullDomain, walletAddress);

    // 4. Set agt-version=1 sentinel record
    await api.createRecords(zoneUuid, [
      { type: "TXT", name: "@", value: "agt-version=1", ttl: 300 },
    ]);

    return NextResponse.json({
      success: true,
      domain: fullDomain,
      zoneUuid,
      walletAddress,
    });
  } catch (error) {
    console.error("Claim error:", error);
    const message =
      error instanceof Error ? error.message : "Claim failed";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
