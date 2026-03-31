import { NextResponse } from "next/server";
import FreenameAPI from "@/lib/freename-api";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MOCK = process.env.MOCK_FREENAME === "true";

interface AgentConfig {
  name?: string;
  description?: string;
  icon?: string;
  protocols?: string[];
  capabilities?: string[];
  endpoints?: { protocol: string; url: string }[];
  pricing?: string;
  owner?: string;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`agent-config:${ip}`, 10);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  try {
    const { zoneUuid, config } = (await request.json()) as {
      zoneUuid: string;
      config: AgentConfig;
    };

    if (!zoneUuid) {
      return NextResponse.json(
        { success: false, error: "zoneUuid is required" },
        { status: 400 }
      );
    }

    // Build TXT records from config
    const records: { type: string; name: string; value: string; ttl: number }[] = [];

    // agt-version=1 sentinel should already exist from claim, but ensure it
    records.push({ type: "TXT", name: "@", value: "agt-version=1", ttl: 300 });

    if (config.name) {
      records.push({ type: "TXT", name: "@", value: `agt-name=${config.name}`, ttl: 300 });
    }
    if (config.description) {
      records.push({ type: "TXT", name: "@", value: `agt-description=${config.description}`, ttl: 300 });
    }
    if (config.icon) {
      records.push({ type: "TXT", name: "@", value: `agt-icon=${config.icon}`, ttl: 300 });
    }
    if (config.protocols) {
      for (const proto of config.protocols) {
        records.push({ type: "TXT", name: "@", value: `agt-protocol=${proto}`, ttl: 300 });
      }
    }
    if (config.capabilities) {
      for (const cap of config.capabilities) {
        records.push({ type: "TXT", name: "@", value: `agt-cap=${cap}`, ttl: 300 });
      }
    }
    if (config.endpoints) {
      for (const ep of config.endpoints) {
        if (ep.protocol && ep.url) {
          records.push({ type: "TXT", name: "@", value: `agt-endpoint-${ep.protocol}=${ep.url}`, ttl: 300 });
        }
      }
    }
    if (config.pricing) {
      records.push({ type: "TXT", name: "@", value: `agt-pricing=${config.pricing}`, ttl: 300 });
    }
    if (config.owner) {
      records.push({ type: "TXT", name: "@", value: `agt-owner=${config.owner}`, ttl: 300 });
    }

    if (MOCK) {
      console.log(`[MOCK] Agent config for zone ${zoneUuid}:`, records.map(r => r.value));
      return NextResponse.json({
        success: true,
        recordCount: records.length,
      });
    }

    const api = new FreenameAPI();
    await api.createRecords(zoneUuid, records);

    return NextResponse.json({
      success: true,
      recordCount: records.length,
    });
  } catch (error) {
    console.error("Agent config error:", error);
    const message = error instanceof Error ? error.message : "Failed to save";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
