import { NextResponse } from "next/server";

const FREENAME_RESOLVER = "https://apis.freename.io/api/v1/resolver/FNS";

const SEED_DOMAINS = [
  "agt.agt",
  "scrape.agt",
  "receipt.agt",
  "pricing.agt",
  "tutorial.agt",
  "ai.agt",
  "search.agt",
  "chat.agt",
  "code.agt",
  "data.agt",
  "research.agt",
  "translate.agt",
  "monitor.agt",
  "deploy.agt",
  "build.agt",
  "test.agt",
  "scan.agt",
  "write.agt",
  "read.agt",
  "index.agt",
];

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

async function fetchManifest(domain: string): Promise<AgentManifest | null> {
  try {
    const resp = await fetch(`${FREENAME_RESOLVER}/${domain}`, {
      next: { revalidate: 300 },
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (!data.data?.records) return null;
    return parseManifest(domain, data.data.records);
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const capability = searchParams.get("capability");
  const protocol = searchParams.get("protocol");
  const q = searchParams.get("q")?.toLowerCase();

  const results = await Promise.all(SEED_DOMAINS.map(fetchManifest));
  let agents = results.filter((a): a is AgentManifest => a !== null);

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
