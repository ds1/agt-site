import { NextResponse } from "next/server";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { getKnownDomains } from "@/lib/domain-registry";

const FREENAME_RESOLVER = "https://apis.freename.io/api/v1/resolver/FNS";

interface FreenameRecord {
  key: string;
  type: string;
  value: string;
}

interface AgentManifest {
  domain: string;
  version: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  website: string | null;
  protocols: string[];
  capabilities: string[];
  endpoints: { protocol: string; url: string }[];
  pricing: string | null;
  owner: string | null;
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^"|"$/g, "");
}

function parseManifest(
  domain: string,
  records: FreenameRecord[]
): AgentManifest | null {
  const m: AgentManifest = {
    domain,
    version: 0,
    name: null,
    description: null,
    icon: null,
    website: null,
    protocols: [],
    capabilities: [],
    endpoints: [],
    pricing: null,
    owner: null,
  };

  for (const rec of records) {
    if (rec.type !== "TXT") continue;
    const v = stripQuotes(rec.value);

    if (v.startsWith("agt-version="))
      m.version = parseInt(v.slice(12)) || 1;
    else if (v.startsWith("agt-name=")) m.name = v.slice(9);
    else if (v.startsWith("agt-description=")) m.description = v.slice(16);
    else if (v.startsWith("agt-icon=")) m.icon = v.slice(9);
    else if (v.startsWith("agt-website=")) m.website = v.slice(12);
    else if (v.startsWith("agt-protocol=")) {
      const p = v.slice(13);
      if (p) m.protocols.push(p);
    } else if (v.startsWith("agt-cap=")) {
      const c = v.slice(8);
      if (c) m.capabilities.push(c);
    } else if (v.startsWith("agt-endpoint-")) {
      const rest = v.slice(13);
      const eq = rest.indexOf("=");
      if (eq > 0)
        m.endpoints.push({
          protocol: rest.slice(0, eq),
          url: rest.slice(eq + 1),
        });
    } else if (v.startsWith("agt-pricing=")) m.pricing = v.slice(12);
    else if (v.startsWith("agt-owner=")) m.owner = v.slice(10);
  }

  return m.version ? m : null;
}

// --- Server-side manifest cache (5-minute TTL) ---
const CACHE_TTL_MS = 5 * 60 * 1000;
const _manifestCache = new Map<string, { manifest: AgentManifest | null; expiresAt: number }>();
let _allCachedAt = 0;
let _allCachedResult: AgentManifest[] = [];

async function fetchManifest(domain: string): Promise<AgentManifest | null> {
  const now = Date.now();
  const cached = _manifestCache.get(domain);
  if (cached && cached.expiresAt > now) return cached.manifest;

  try {
    const resp = await fetch(`${FREENAME_RESOLVER}/${domain}`, {
      next: { revalidate: 300 },
    });
    if (!resp.ok) {
      _manifestCache.set(domain, { manifest: null, expiresAt: now + CACHE_TTL_MS });
      return null;
    }
    const data = await resp.json();
    if (!data.data?.records) {
      _manifestCache.set(domain, { manifest: null, expiresAt: now + CACHE_TTL_MS });
      return null;
    }
    const manifest = parseManifest(domain, data.data.records);
    _manifestCache.set(domain, { manifest, expiresAt: now + CACHE_TTL_MS });
    return manifest;
  } catch {
    // Don't cache errors — allow retry
    return null;
  }
}

async function getAllAgents(): Promise<AgentManifest[]> {
  const now = Date.now();
  if (_allCachedAt > 0 && now - _allCachedAt < CACHE_TTL_MS) {
    return _allCachedResult;
  }

  const domains = getKnownDomains();
  // Resolve in batches of 5 to avoid hammering the API
  const results: (AgentManifest | null)[] = [];
  for (let i = 0; i < domains.length; i += 5) {
    const batch = domains.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(fetchManifest));
    results.push(...batchResults);
  }

  _allCachedResult = results.filter((a): a is AgentManifest => a !== null);
  _allCachedAt = now;
  return _allCachedResult;
}

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const { ok } = rateLimit(`agents:${ip}`, 20);
  if (!ok) {
    return NextResponse.json(
      { success: false, error: "Too many requests. Please try again shortly." },
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const capability = searchParams.get("capability");
  const protocol = searchParams.get("protocol");
  const q = searchParams.get("q")?.toLowerCase();

  let agents = await getAllAgents();

  if (capability) agents = agents.filter((a) => a.capabilities.includes(capability));
  if (protocol) agents = agents.filter((a) => a.protocols.includes(protocol));
  if (q)
    agents = agents.filter(
      (a) =>
        a.domain.includes(q) ||
        a.name?.toLowerCase().includes(q) ||
        a.description?.toLowerCase().includes(q)
    );

  return NextResponse.json({ success: true, count: agents.length, agents });
}
