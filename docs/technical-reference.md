# .agt Technical Reference

Comprehensive documentation covering strategy, architecture, manifest specification, user flows, API contracts, and implementation details for the .agt agent namespace.

**Last updated:** 2026-03-24

---

## Table of Contents

1. [Strategic Overview](#1-strategic-overview)
2. [TLD Ownership & Platform Architecture](#2-tld-ownership--platform-architecture)
3. [Manifest Specification v1](#3-manifest-specification-v1)
4. [System Architecture](#4-system-architecture)
5. [Browser — Agent Resolution Engine](#5-browser--agent-resolution-engine)
6. [Registration Site — agt-site](#6-registration-site--agt-site)
7. [Resolver SDK — @agt/resolver](#7-resolver-sdk--agtresolver)
8. [Freename Reseller API Integration](#8-freename-reseller-api-integration)
9. [User Flows](#9-user-flows)
10. [Design System](#10-design-system)
11. [Data Model](#11-data-model)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Roadmap](#13-roadmap)

---

## 1. Strategic Overview

### The Opportunity

The AI agent ecosystem lacks a decentralized identity and discovery layer:

- **MCP** (Anthropic): Defines agent-to-tool communication. Discovery is manual JSON config — no directory.
- **A2A** (Google): Defines agent-to-agent communication. Agent Cards live at `/.well-known/agent.json` — tied to traditional DNS.
- **OpenAI / Salesforce marketplaces**: Fully centralized. Platforms control listing, ranking, and delisting.
- **LangChain, CrewAI, AutoGen**: Orchestration frameworks where agent discovery is hardcoded.

`.agt` fills this gap as the decentralized, verifiable, human-readable identity layer for AI agents.

### What .agt Is

A **namespace for AI agents**, owned across multiple naming systems. A `.agt` name gives an agent:

- A human-readable identity (`researcher.agt`)
- Structured metadata (capabilities, protocols, endpoints)
- Verifiable ownership (on-chain NFT on Polygon)
- Discoverability (resolvable by any client)

### Positioning

`.agt` is not a domain registrar. It is the identity layer for the agent ecosystem. The mental model:

- ICANN controls `.com` → every company needs one
- `.agt` → every agent needs one

### Naming Convention

- Users register **names**, not domains. "Claim a name" / "Name your agent."
- GoDaddy has claimed "Agent Name Service (ANS)" — avoid that branding.
- Use ".agt Protocol" or ".agt Standard" when referencing the spec.

---

## 2. TLD Ownership & Platform Architecture

### Ownership

| System | Role | Status |
|--------|------|--------|
| **Freename** | Canonical registry — ownership, NFT minting, on-chain records | Active. 942+ SLDs registered. Reseller API partnership with invoice billing. |
| **Handshake** | Infrastructure — DNS records, reachability via DoH | Owned. Registrations closed to avoid collisions. |
| **Dweb** | Defensive registration | Owned. Not actively used. |

### Dual-Platform Model

**Freename** is the single source of truth for registration. **Handshake** records are a downstream effect, set by our system.

```
Agent developer claims researcher.agt
  → Freename Reseller API: create zone, mint NFT on Polygon
  → Our system (future): propagate DNS records to Handshake zone
  → Result: researcher.agt resolves on BOTH systems

Freename = ownership layer (who owns it, NFT, on-chain records)
Handshake = infrastructure layer (DNS records, IP endpoints, DoH reachability)
```

This eliminates name collisions. There is one registration path (Freename), and Handshake mirrors it.

### Pricing

Domain pricing is set by Freename. The TLD owner has limited control over pricing and cannot offer free registrations. Adoption strategy must work within Freename's pricing structure. The reseller partnership uses invoice billing — domains can be registered via API without real-time payment to Freename.

---

## 3. Manifest Specification v1

### Overview

The `.agt` manifest defines agent identity using DNS TXT records on `.agt` domains. Any client that can resolve Freename or Handshake domains can read and parse an agent's manifest.

### Record Format

Each TXT record value follows `agt-{field}={value}`.

#### Required

| Record | Description |
|--------|-------------|
| `agt-version=1` | **Required sentinel.** Must be present for the domain to be recognized as an agent. |

#### Identity

| Record | Description |
|--------|-------------|
| `agt-name={name}` | Display name. Max 100 characters. |
| `agt-description={text}` | One-line description. Max 200 characters. |
| `agt-icon={url}` | Icon image URL (PNG, SVG, JPG). Recommended 128x128+. |
| `agt-owner={address}` | Owner wallet address (e.g., `0x1234...abcd`). |

#### Capabilities

| Record | Description |
|--------|-------------|
| `agt-protocol={id}` | Protocol the agent supports. One record per protocol. Repeatable. |
| `agt-cap={id}` | Capability the agent has. One record per capability. Repeatable. |

#### Endpoints

| Record | Description |
|--------|-------------|
| `agt-endpoint-{protocol}={url}` | URL for a specific protocol. `{protocol}` matches a declared `agt-protocol`. |

#### Commerce

| Record | Description |
|--------|-------------|
| `agt-pricing={model}` | Values: `free`, `paid`, `freemium`, `contact`. |

### Resolution Algorithm

Priority order:

1. **Inline TXT records** (v1 default): Check for `agt-version=1`. If found, parse all `agt-*` values.
2. **Content-addressed manifest**: If `agt-manifest={cid-or-url}` present, fetch JSON from IPFS or HTTP.
3. **Hosted manifest**: Fetch `{endpoint}/.agt/manifest.json` from the domain's HTTP endpoint.
4. **Fallback**: Resolve as normal web content (IPFS, Arweave, HTTP).

### Parsing Rules

- Strip surrounding double quotes (Freename API wraps TXT values in quotes).
- Multiple records of the same type are supported.
- Empty values after `=` are ignored.
- Unknown `agt-` prefixed records are ignored (forward compatibility).
- `agt-version` sentinel must be present for any parsing to occur.

### Protocol Vocabulary

| ID | Name | Description |
|----|------|-------------|
| `mcp` | MCP | Model Context Protocol (Anthropic) |
| `a2a` | A2A | Agent-to-Agent Protocol (Google) |
| `http` | HTTP | REST API |
| `ws` | WebSocket | Real-time bidirectional |
| `grpc` | gRPC | High-performance RPC |

### Capability Vocabulary (20 starter)

`research`, `summarization`, `translation`, `code-generation`, `code-review`, `data-analysis`, `image-generation`, `image-analysis`, `audio-transcription`, `web-scraping`, `api-integration`, `workflow-automation`, `scheduling`, `monitoring`, `content-writing`, `chat`, `reasoning`, `math`, `search`, `embedding`

Custom IDs allowed (lowercase, hyphen-separated).

### Verification

The `agt-owner` address can be verified against the Freename NFT owner on-chain:

1. Compute tokenId: `keccak256(bytes(tld) ++ keccak256(bytes(sld)))`
2. Query FNS contract `ownerOf(tokenId)` on Polygon (`0x465ea4967479A96D4490d575b5a6cC2B4A4BEE65`)
3. Compare with declared `agt-owner`

### Example

```
agt-version=1
agt-name=Research Agent
agt-description=Deep research and source citation
agt-icon=https://researcher.example.com/icon.png
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://researcher.example.com/mcp
agt-endpoint-http=https://researcher.example.com/api/v1
agt-pricing=freemium
agt-owner=0xABCD1234...
```

---

## 4. System Architecture

### Components

```
┌─────────────────────────────────────────────────────────────┐
│  .agt Ecosystem                                             │
│                                                             │
│  ┌──────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │ Browser  │  │ agt-site     │  │ @agt/resolver SDK  │   │
│  │ (Tauri)  │  │ (Next.js 16) │  │ (TypeScript)       │   │
│  └────┬─────┘  └──────┬───────┘  └─────────┬──────────┘   │
│       │               │                     │               │
│       │  resolve       │  register/config    │  resolve     │
│       │               │                     │               │
│  ┌────┴───────────────┴─────────────────────┴──────────┐   │
│  │           Freename API Layer                         │   │
│  │  ┌─────────────────┐  ┌──────────────────────────┐  │   │
│  │  │ Public Resolver  │  │ Reseller API (Auth0)     │  │   │
│  │  │ (read-only)      │  │ (zone CRUD, minting,     │  │   │
│  │  │                  │  │  records)                 │  │   │
│  │  └─────────────────┘  └──────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
│                          │                                   │
│  ┌───────────────────────┴──────────────────────────────┐   │
│  │              Polygon Blockchain                       │   │
│  │  FNS Contract: 0x465ea4967479A96D4490d575b5a6cC2B4A4 │   │
│  │  NFT ownership, on-chain records                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Repos

| Repo | Purpose | Stack |
|------|---------|-------|
| `browser` | Web3 browser — first .agt client | Tauri v2, Rust, vanilla JS/CSS |
| `agt/agt-site` | Registration site + agent directory | Next.js 16, TypeScript, Tailwind |
| `agt/resolver-sdk` | Standalone resolver library | TypeScript, zero dependencies |
| `agt/agtdomains-register` | Legacy registration site (archived) | Next.js 15, React 19, RainbowKit |

---

## 5. Browser — Agent Resolution Engine

### Repo: `C:\Users\danma\Documents\GitHub\browser`

### Resolution Flow

```
User types "researcher.agt" in URL bar
  → Frontend (main.js): parse domain, call navigate()
  → Tauri backend (commands.rs): navigate_to_domain()
  → ResolverCascade.resolve("researcher.agt")
    → TLD hint: "agt" → Freename resolver (skips cascade)
    → FreenameResolver.resolve_api()
      → GET https://apis.freename.io/api/v1/resolver/FNS/researcher.agt
      → Parse records
      → If agt-version=1 found: extract_agent_manifest() → ContentPointer::Agent
      → Else: extract_content() → ContentPointer::Ipfs/Http/etc.
  → fetch_content()
    → If Agent: return manifest directly (no HTTP fetch)
    → Else: fetch from IPFS/HTTP/Arweave
  → Frontend receives NavigateResult
    → If result.agent: render agent card UI
    → If result.direct_url: render in per-tab webview (HTTP)
    → Else: render in iframe (IPFS/Arweave blob)
```

### Key Files

| File | Purpose |
|------|---------|
| `src-tauri/src/resolver/mod.rs` | `AgentManifest`, `AgentEndpoint`, `ContentPointer::Agent`, `ResolverCascade` |
| `src-tauri/src/resolver/freename.rs` | `extract_agent_manifest()`, `strip_quotes()`, Freename API + on-chain resolution |
| `src-tauri/src/commands.rs` | `navigate_to_domain`, `fetch_content`, `NavigateResult.agent`, `clear_domain_cache` |
| `src-tauri/src/cache.rs` | Resolution cache with TTL, `remove()` for cache busting |
| `src-tauri/src/state.rs` | Resolver cascade init, TLD hints (`.agt` → freename) |
| `src/main.js` | `loadContent()` (agent/webview/blob branches), `switchTab()`, `renderAgentUI()`, `escapeHtml()` |
| `src/index.html` | `#agent-view` container in `#content-area` |
| `src/styles.css` | Agent view CSS (`.agt-*` classes) |

### Agent Card UI

Rendered by `renderAgentUI(tab)` in `main.js`. Vanilla DOM manipulation (no framework).

Components:
- Icon (custom via `agt-icon` or purple dot default)
- Domain name + description
- Protocol pills (indigo) + capability pills (green)
- Endpoint rows (clickable, opens in new tab)
- Details section (pricing, owner, resolution source)
- "Open Primary Endpoint" action button

### Tab Behavior

- `tab.displayMode = 'agent'` for agent tabs
- `tab.agentManifest` stores the parsed manifest
- Tab favicon: `agt-icon` URL or purple dot SVG data URI
- Reload: clears resolution cache via `clear_domain_cache`, then re-navigates
- Tab title: manifest `name` field

### Backward Compatibility

Domains without `agt-version=1` sentinel fall through to normal content resolution (IPFS → HTTP → A record → TXT dnslink). All 942+ existing SLDs continue working unchanged.

### Tests

78 total tests. Agent-specific tests in `freename.rs`:
- `agent_manifest_requires_version_sentinel`
- `agent_manifest_parses_full_records`
- `agent_manifest_minimal_version_only`
- `agent_manifest_ignores_empty_values`
- `agent_manifest_handles_quoted_values`
- `agent_manifest_mixed_with_ipfs_records`
- `agent_manifest_not_triggered_by_random_txt`

---

## 6. Registration Site — agt-site

### Repo: `C:\Users\danma\Documents\GitHub\agt\agt-site`

### Stack

- Next.js 16.2.1 (Turbopack)
- TypeScript, Tailwind CSS
- CSS Modules for component styles
- No RainbowKit / wallet library — plain text input for wallet addresses

### Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing page — search hero, manifest preview, steps, SDK code block |
| `/claim` | Full claim flow — search → availability → wallet → claim → mint → configure → done |
| `/explore` | Agent directory — search, filter by protocol/capability, agent card grid |

### API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/search` | GET | Check name availability + pricing via Freename |
| `/api/claim` | POST | Create zone, trigger minting, set sentinel record |
| `/api/claim/status` | GET | Poll minting status |
| `/api/agent-config` | POST | Set agt-* TXT records from structured config |
| `/api/agents` | GET | Fetch agent manifests from seed domain list |

### Components

| Component | Purpose |
|-----------|---------|
| `Nav` | Sticky nav bar (.agt wordmark, Explore, Claim links) |
| `Footer` | Minimal footer (@agtnames, Spec link) |
| `HomeContent` | Landing page content (client component) |
| `ClaimContent` | Multi-step claim flow (client component, uses `useSearchParams`) |
| `AgentConfigForm` | Agent configuration form (protocols, capabilities, endpoints) |
| `AgentCard` | Reusable agent manifest card |
| `ExploreContent` | Agent directory with search/filters (client component) |

### Claim Flow States

```
search → claiming → minting → configure → done

search:     Search form + availability result + wallet input
claiming:   Progress indicator — "Creating zone..."
minting:    Progress indicator + polling — "Minting to Polygon..."
            Polls /api/claim/status every 5s for up to 2 min
configure:  AgentConfigForm — name, description, icon, protocols,
            capabilities, endpoints, pricing. Save or skip.
done:       Summary card — domain claimed, config status, next actions
```

### Key Libraries

| File | Purpose |
|------|---------|
| `src/lib/freename-api.ts` | Freename Reseller API client with Auth0 token management |
| `src/lib/agent-capabilities.ts` | Vocabulary data: CAPABILITIES (20), PROTOCOLS (5), PRICING_OPTIONS (4) |

---

## 7. Resolver SDK — @agt/resolver

### Repo: `C:\Users\danma\Documents\GitHub\agt\resolver-sdk`

### Package

- Name: `@agt/resolver`
- Version: 0.1.0
- Zero dependencies
- TypeScript → ESM output (`dist/index.js` + `dist/index.d.ts`)
- Works in Node.js, Deno, Bun, and browsers

### API

```typescript
import { resolveAgent, resolveAgents, isAgent } from '@agt/resolver'

// Resolve a single agent
const agent = await resolveAgent('researcher.agt')
// Returns AgentManifest | null

// Resolve multiple agents in parallel
const agents = await resolveAgents(['a.agt', 'b.agt', 'c.agt'])

// Check if a domain has agent config
const hasConfig = await isAgent('researcher.agt')
```

### Types

```typescript
interface AgentManifest {
  domain: string;
  version: number;
  name: string | null;
  description: string | null;
  icon: string | null;
  protocols: string[];
  capabilities: string[];
  endpoints: AgentEndpoint[];
  pricing: string | null;
  owner: string | null;
}

interface AgentEndpoint {
  protocol: string;
  url: string;
}

interface ResolveOptions {
  resolverUrl?: string;  // Default: Freename public resolver
  timeout?: number;      // Default: 10000ms
}
```

### Resolution

Uses the Freename public resolver API (no auth required):
`GET https://apis.freename.io/api/v1/resolver/FNS/{domain}`

Parses TXT records with `agt-` prefix, strips surrounding quotes, requires `agt-version` sentinel.

---

## 8. Freename Reseller API Integration

### Authentication

Auth0-based. Credentials: `FREENAME_API_EMAIL` + `FREENAME_API_PASSWORD`.

```
Login: POST /api/v1/auth/login → { access_token, refresh_token, expires_in }
Refresh: POST /api/v1/auth/refresh → { access_token, id_token, expires_in }
```

Token is cached at module level in `freename-api.ts` with 60-second buffer. Auto-refreshes. Falls back to full re-login if refresh fails.

### Access Control

- APIs are IP-whitelisted. Freename must whitelist the server's IP.
- The reseller must not delegate API credentials.
- Rate limits are agreed per contract. Some endpoints are quota-limited.

### Key Endpoints

All under `POST/GET https://apis.freename.io/api/v1/reseller-logic/`

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/search?searchString=X` | GET | Search domains, get availability + pricing |
| `/zones/availability/{domain}` | GET | Check if domain is available (boolean) |
| `/zones?mint=false` | POST | Create zone (domain registration) |
| `/zones/minting` | POST | Trigger NFT minting on blockchain |
| `/minting/{domain}` | GET | Check minting status |
| `/records?zone={uuid}` | POST | Create records on a zone |
| `/records?zone={uuid}` | GET | Fetch records for a zone |
| `/records?record={uuid}` | PUT | Update a specific record |
| `/records/{uuid}` | DELETE | Delete a record |
| `/registrant` | POST | Create registrant profile |
| `/profile-registry/{wallet}` | GET | Fetch profile by wallet |

### Zone Creation Payload

```json
{
  "name": "researcher.agt",
  "status": "OK",
  "level": "SLD",
  "chain": "POLYGON",
  "walletAddress": "0x...",
  "registrationDate": "2026-03-24T00:00:00.000Z",
  "records": []
}
```

### Minting Payload

```json
{
  "mintDetail": [{ "blockchain": "POLYGON", "name": "researcher.agt" }],
  "walletAddress": "0x..."
}
```

Minting is async — takes a few minutes. Poll `/minting/{domain}` for status (PENDING → IN_PROGRESS → COMPLETE | FAILED).

### Record Types

Standard DNS: `A`, `AAAA`, `MX`, `CNAME`, `NS`, `SOA`, `TXT`, `PTR`
Web3: `TOKEN`, `PROFILE`, `LINK`, `CONTRACT`, `OTHER`

For agent manifests, use TXT records with `name: "@"` and `value: "agt-*=..."`.

### Supported Chains

Ethereum, BSC, Polygon (default for .agt), Base, Solana.

### Billing

Gas fees are covered by Freename and invoiced to the reseller. No real-time payment required for zone creation or minting.

---

## 9. User Flows

### Flow 1: Claim a Name (Registration Site)

```
1. User visits /claim
2. Types a name (e.g., "researcher"), clicks Search
3. API checks availability via Freename → shows price
4. User enters wallet address (0x...)
5. Clicks "Claim this name"
6. Backend: createZone → triggerMinting → set agt-version=1
7. Frontend polls minting status every 5s
8. On success → AgentConfigForm appears
9. User fills in: name, description, protocols, capabilities, endpoints
   OR clicks "Skip for now"
10. Backend: createRecords with agt-* TXT records
11. Done screen: domain claimed, config status, next actions
```

### Flow 2: Browse the Agent from the Browser

```
1. User types "researcher.agt" in browser URL bar
2. TLD hint routes to Freename resolver
3. Freename API returns TXT records
4. extract_agent_manifest() finds agt-version=1, parses all agt-* records
5. Returns ContentPointer::Agent(AgentManifest)
6. Frontend renders agent card (not a webpage)
7. User sees: name, description, protocols, capabilities, endpoints
8. Clicks endpoint → opens in new webview tab
```

### Flow 3: Resolve Programmatically (SDK)

```typescript
import { resolveAgent } from '@agt/resolver'

const agent = await resolveAgent('researcher.agt')
if (agent) {
  // Use agent.endpoints[0].url to connect
  // Check agent.protocols for supported communication methods
  // Read agent.capabilities for what it can do
}
```

### Flow 4: Agent-to-Agent Discovery (Future)

```
1. Orchestrator agent needs web scraping capability
2. Queries .agt registry for agents with capability "web-scraping"
3. Resolves manifests, compares pricing/reputation
4. Selects scraper.agt, connects via MCP endpoint
5. Delegates task, receives signed result
```

### Flow 5: Explore Agents (Registration Site)

```
1. User visits /explore
2. Page fetches manifests from seed domain list via /api/agents
3. Agent cards displayed in grid
4. User filters by protocol (MCP, A2A) or capability (research, chat)
5. User searches by name or description
```

---

## 10. Design System

### Principles

- **Tool, not billboard.** The site is a registry for a technical audience, not a SaaS marketing page.
- **Content-first.** Show real manifests, real code, real agents. No decorative illustrations.
- **Dense and useful.** Every element earns its space. No padding for padding's sake.
- **The product is the visual.** Agent cards, manifest records, SDK code blocks — these are the design.

### Colors

```css
--bg-deep:        #0f0a1a     /* Page background (near-black purple) */
--bg-surface:     #1a1030     /* Card/panel surfaces */
--bg-elevated:    #251a40     /* Inputs, hover states */
--bg-input:       #1e1535     /* Form inputs */

--purple-accent:  #7c6bbd     /* Primary accent (the brand dot) */
--purple-muted:   #5a4d8a     /* Secondary accent, borders */
--purple-dim:     #3d2f66     /* Subtle borders, dividers */
--purple-glow:    rgba(124, 107, 189, 0.15)  /* Active state glows */

--text-primary:   #f0edf5     /* Headings (warm white) */
--text-secondary: #9b8ec4     /* Body text (muted lavender) */
--text-tertiary:  #6b5d8f     /* Subtle text, placeholders */

--success:        #4ade80     /* Available, confirmed */
--error:          #f87171     /* Errors */
```

### Typography

```
Sans:  Source Sans 3 (400, 600, 700)
Mono:  Source Code Pro (400, 500)

Headings: Source Sans 3, 700, negative letter-spacing
Body: Source Sans 3, 400
Labels: Source Sans 3, 600, uppercase, 0.05em tracking
Code/addresses/domains: Source Code Pro
```

### Component Patterns

- **Cards**: `--bg-surface`, `--purple-dim` border, subtle border-color transition on hover
- **Pills**: Rounded 4px, semi-transparent background. Protocol = purple, Capability = green.
- **Inputs**: `--bg-input`, `--purple-dim` border, `--purple-accent` on focus
- **Buttons primary**: `--purple-accent` background, white text
- **Buttons secondary**: Transparent, `--purple-dim` border, `--text-tertiary`
- **Progress indicators**: Pulsing purple dot + text
- **No gradients** on backgrounds. Flat dark purple.

### Agent Card (Shared Across Browser + Site)

Both the browser's `renderAgentUI()` and the site's `<AgentCard>` component render the same visual:
- 40-48px icon (custom or purple dot)
- Domain in monospace, name below in secondary color
- Description (2-line clamp)
- Protocol pills (uppercase, indigo)
- Capability pills (lowercase, green)
- Footer: pricing + endpoint count

---

## 11. Data Model

### AgentManifest (TypeScript / Rust)

```typescript
interface AgentManifest {
  domain: string;           // "researcher.agt"
  version: number;          // 1
  name: string | null;      // "Research Agent"
  description: string | null;
  icon: string | null;      // URL to image
  protocols: string[];      // ["mcp", "a2a"]
  capabilities: string[];   // ["research", "summarization"]
  endpoints: AgentEndpoint[];
  pricing: string | null;   // "free" | "paid" | "freemium" | "contact"
  owner: string | null;     // "0x..."
}

interface AgentEndpoint {
  protocol: string;         // "mcp"
  url: string;              // "https://..."
}
```

### Freename Zone

```
Zone UUID: string (from createZone response)
Domain: "researcher.agt"
Chain: "POLYGON"
Wallet: "0x..."
Records: [
  { type: "TXT", name: "@", value: "agt-version=1" },
  { type: "TXT", name: "@", value: "agt-name=Research Agent" },
  ...
  { type: "A", name: "@", value: "34.22.218.54" },      // Freename default
  { type: "NS", name: "@", value: "ns1.noto.network" },  // Freename default
]
```

### On-Chain (FNS Contract)

```
Contract: 0x465ea4967479A96D4490d575b5a6cC2B4A4BEE65 (Polygon, Base, BSC, Aurora, Cronos)
Token ID: keccak256(bytes(tld) ++ keccak256(bytes(sld)))
Interface: getManyRecords(string[] keys, uint256 tokenId) → string[]
Proxy: TransparentUpgradeableProxy (ERC-1967)
Implementation: 0x8Ea27Ade73926c6AcA0a2bd1fbc657E1A349710f (unverified)
```

---

## 12. Deployment & Infrastructure

### Browser

- Built with `npm run build` (Tauri + Rust)
- Requires MSVC environment on Windows
- No deployment — desktop application distributed as installer
- Test with `npm run dev` (hot reload)

### Registration Site (agt-site)

- Built with `npm run build` (Next.js 16 + Turbopack)
- Deployable to Vercel, Cloudflare Pages, or any Node.js host
- Environment variables required: `FREENAME_API_EMAIL`, `FREENAME_API_PASSWORD`, `FREENAME_API_URL`
- Freename API requires IP whitelisting

### Resolver SDK

- Built with `tsc` → `dist/index.js` + `dist/index.d.ts`
- Publishable to npm as `@agt/resolver`
- Zero dependencies, works in any JS runtime

---

## 13. Roadmap

### Completed

- Browser agent resolution engine (Rust + vanilla JS)
- Agent card UI in browser
- Manifest spec v1 (TXT record-based)
- Registration site with full inline claim flow
- Agent directory / explore page
- Resolver SDK (TypeScript, zero-dep)
- Design system (dark purple, Source Sans 3)

### Phase 2: Ecosystem

- Record management dashboard (edit agent config post-registration)
- Agent directory backed by Supabase index (replace seed list)
- Publish `@agt/resolver` to npm
- Onboarding campaign for 942 existing SLD holders
- Landing page refinement

### Phase 3: Infrastructure

- Handshake DNS sync from Freename state
- CLI tool (`agt init --from-mcp`, `agt register`, `agt update`)
- Browser agent interaction (MCP/A2A client, not just card display)
- Manifest v2 (IPFS-hosted JSON with signatures)

### Phase 4: Network Effects

- Agent-to-agent discovery protocol
- Trust/reputation layer (on-chain attestations)
- On-chain payment integration
- Open standard publication (RFC-style spec)
- Multi-platform clients (VS Code extension, Slack bot, etc.)
