import { NextResponse } from "next/server";
import FreenameAPI from "@/lib/freename-api";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const MOCK = process.env.MOCK_FREENAME === "true";
const FREENAME_RESOLVER = "https://apis.freename.io/api/v1/resolver/FNS";

function stripQuotes(s: string): string {
  return s.trim().replace(/^"|"$/g, "");
}

interface AgentConfig {
  name?: string;
  description?: string;
  icon?: string;
  website?: string;
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
    if (config.website) {
      records.push({ type: "TXT", name: "@", value: `agt-website=${config.website}`, ttl: 300 });
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

/**
 * GET /api/agent-config?domain=example.agt
 * Resolve a domain's current agent config via the public Freename resolver.
 * Also attempts to look up the zone UUID via the Reseller API for editing.
 */
export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`agent-config-read:${ip}`, 20);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  if (!domain || !domain.endsWith(".agt")) {
    return NextResponse.json(
      { success: false, error: "A valid .agt domain is required" },
      { status: 400 }
    );
  }

  try {
    // 1. Resolve current records via public resolver
    const resolverResp = await fetch(`${FREENAME_RESOLVER}/${domain}`);
    if (!resolverResp.ok) {
      if (resolverResp.status === 404) {
        return NextResponse.json(
          { success: false, error: "Domain not found" },
          { status: 404 }
        );
      }
      throw new Error(`Resolver returned HTTP ${resolverResp.status}`);
    }

    const resolverData = await resolverResp.json();
    const records: { key: string; type: string; value: string }[] = resolverData.data?.records || [];

    // Parse agt-* records into config
    const config: AgentConfig = {};
    const protocols: string[] = [];
    const capabilities: string[] = [];
    const endpoints: { protocol: string; url: string }[] = [];
    let hasVersion = false;

    for (const rec of records) {
      if (rec.type !== "TXT") continue;
      const v = stripQuotes(rec.value);

      if (v.startsWith("agt-version=")) hasVersion = true;
      else if (v.startsWith("agt-name=")) config.name = v.slice(9);
      else if (v.startsWith("agt-description=")) config.description = v.slice(16);
      else if (v.startsWith("agt-icon=")) config.icon = v.slice(9);
      else if (v.startsWith("agt-website=")) config.website = v.slice(12);
      else if (v.startsWith("agt-protocol=")) {
        const p = v.slice(13);
        if (p) protocols.push(p);
      } else if (v.startsWith("agt-cap=")) {
        const c = v.slice(8);
        if (c) capabilities.push(c);
      } else if (v.startsWith("agt-endpoint-")) {
        const rest = v.slice(13);
        const eq = rest.indexOf("=");
        if (eq > 0) endpoints.push({ protocol: rest.slice(0, eq), url: rest.slice(eq + 1) });
      } else if (v.startsWith("agt-pricing=")) config.pricing = v.slice(12);
      else if (v.startsWith("agt-owner=")) config.owner = v.slice(10);
    }

    if (protocols.length) config.protocols = protocols;
    if (capabilities.length) config.capabilities = capabilities;
    if (endpoints.length) config.endpoints = endpoints;

    // 2. Try to look up zone UUID via Reseller API search
    let zoneUuid: string | null = null;
    if (!MOCK) {
      try {
        const api = new FreenameAPI();
        const searchResult = await api.searchDomains(domain);
        // Search returns an array of zones; find exact match
        const zones = searchResult?.data || searchResult || [];
        const match = Array.isArray(zones)
          ? zones.find((z: { name?: string; uuid?: string }) =>
              z.name?.toLowerCase() === domain.toLowerCase()
            )
          : null;
        if (match?.uuid) zoneUuid = match.uuid;
      } catch (err) {
        console.warn("Could not look up zone UUID:", err);
      }
    }

    return NextResponse.json({
      success: true,
      domain,
      hasVersion,
      config,
      zoneUuid,
    });
  } catch (error) {
    console.error("Agent config read error:", error);
    const message = error instanceof Error ? error.message : "Failed to read config";
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
