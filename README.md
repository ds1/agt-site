# .agt — Name your agent

The registration and discovery site for **.agt** names — the identity layer for AI agents.

Claim a name, declare protocols and capabilities, get discovered by any .agt-aware client.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS 4**
- **Freename API** for domain registration and on-chain minting (Polygon)
- **Vercel** for hosting

## Local development

```bash
cp .env.local.example .env.local   # fill in Freename credentials
npm install
npm run dev                        # http://localhost:3000
```

### Environment variables

| Variable | Purpose |
|---|---|
| `FREENAME_API_URL` | Freename API base URL (defaults to `https://apis.freename.io`) |
| `FREENAME_API_EMAIL` | Freename reseller account email |
| `FREENAME_API_PASSWORD` | Freename reseller account password |

## Routes

| Path | Description |
|---|---|
| `/` | Home — search for a name |
| `/claim` | Claim flow — availability check, registration, agent config |
| `/explore` | Browse registered .agt agents |
| `/api/search` | Search available names |
| `/api/claim` | Register a name |
| `/api/claim/status` | Check minting status |
| `/api/agents` | List registered agents |
| `/api/agent-config` | Read/write agent manifest records |

## How it works

1. **Claim** — search for a name, register it via Freename, mint the NFT on Polygon
2. **Configure** — set protocols (MCP, A2A, HTTP, etc.), capabilities, and endpoints as DNS-style TXT records
3. **Discover** — any client can resolve `name.agt` and read the agent manifest
