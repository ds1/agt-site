# .agt Manifest Specification v1

**Version:** 1.0
**Date:** 2026-03-24
**Status:** Draft

## Overview

The `.agt` manifest defines a standard for declaring AI agent identity, capabilities, and endpoints using DNS TXT records on `.agt` domains. Any client that can resolve Freename or Handshake domains can read and parse an agent's manifest without specialized infrastructure.

## Record Format

Agent metadata is stored as TXT records on the domain's zone. Each record value follows the format `agt-{field}={value}`.

### Required

| Record Value | Description |
|---|---|
| `agt-version=1` | **Required sentinel.** Must be present for the domain to be recognized as an agent identity. Domains without this record are treated as normal web content. |

### Identity

| Record Value | Description |
|---|---|
| `agt-name={name}` | Human-readable display name for the agent. Max 100 characters. |
| `agt-description={text}` | One-line description of what the agent does. Max 200 characters. |
| `agt-icon={url}` | URL to an icon image (PNG, SVG, or JPG). Recommended size: 128x128 or larger. |
| `agt-website={url}` | URL to the agent's website or homepage. |
| `agt-owner={address}` | Wallet address of the agent's owner (e.g., `0x1234...abcd`). |

### Capabilities

| Record Value | Description |
|---|---|
| `agt-protocol={id}` | A protocol the agent supports. One record per protocol. See [Protocol Vocabulary](#protocol-vocabulary). |
| `agt-cap={id}` | A capability the agent has. One record per capability. See [Capability Vocabulary](#capability-vocabulary). |

### Endpoints

| Record Value | Description |
|---|---|
| `agt-endpoint-{protocol}={url}` | The URL for a specific protocol endpoint. The `{protocol}` segment matches a declared `agt-protocol` value. |

### Commerce

| Record Value | Description |
|---|---|
| `agt-pricing={model}` | Pricing model. Values: `free`, `paid`, `freemium`, `contact`. |

## Resolution Algorithm

Clients resolving a `.agt` domain should follow this priority:

1. **Inline TXT records (v1, default):** Check for `agt-version=1` among TXT records. If found, parse all `agt-*` values into an agent manifest.
2. **Content-addressed manifest:** If `agt-manifest={cid-or-url}` is present, fetch the full JSON manifest from IPFS (`ipfs://...`) or HTTP. This enables richer schemas beyond TXT record limits.
3. **Hosted manifest:** If no `agt-*` TXT records are found but the domain has an HTTP endpoint, attempt to fetch `{endpoint}/.agt/manifest.json`.
4. **Fallback to web content:** If none of the above produce an agent manifest, resolve the domain as normal web content (IPFS, Arweave, HTTP).

### Parsing Rules

- TXT record values may be wrapped in double quotes by the DNS provider (e.g., `"agt-version=1"`). Clients must strip surrounding quotes before parsing.
- Multiple records of the same type are supported (e.g., multiple `agt-protocol=` and `agt-cap=` records).
- Empty values after the `=` sign should be ignored.
- Unknown `agt-` prefixed records should be ignored (forward compatibility).
- The `agt-version` sentinel must be present for any `agt-*` records to be parsed.

## Protocol Vocabulary

| ID | Name | Description |
|---|---|---|
| `mcp` | MCP | Model Context Protocol (Anthropic) |
| `a2a` | A2A | Agent-to-Agent Protocol (Google) |
| `http` | HTTP | REST API (OpenAPI-compatible) |
| `ws` | WebSocket | Real-time bidirectional communication |
| `grpc` | gRPC | High-performance RPC |

Custom protocol IDs are allowed. Use lowercase, hyphen-separated identifiers.

## Capability Vocabulary

| ID | Label |
|---|---|
| `research` | Research |
| `summarization` | Summarization |
| `translation` | Translation |
| `code-generation` | Code Generation |
| `code-review` | Code Review |
| `data-analysis` | Data Analysis |
| `image-generation` | Image Generation |
| `image-analysis` | Image Analysis |
| `audio-transcription` | Audio Transcription |
| `web-scraping` | Web Scraping |
| `api-integration` | API Integration |
| `workflow-automation` | Workflow Automation |
| `scheduling` | Scheduling |
| `monitoring` | Monitoring |
| `content-writing` | Content Writing |
| `chat` | Chat |
| `reasoning` | Reasoning |
| `math` | Math |
| `search` | Search |
| `embedding` | Embedding |

Custom capability IDs are allowed. Use lowercase, hyphen-separated identifiers.

## Example

A research agent at `researcher.agt` with the following TXT records:

```
agt-version=1
agt-name=Research Agent
agt-description=Deep research and source citation across academic and web sources
agt-icon=https://researcher.example.com/icon.png
agt-website=https://researcher.example.com
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-cap=citation
agt-endpoint-mcp=https://researcher.example.com/mcp
agt-endpoint-http=https://researcher.example.com/api/v1
agt-pricing=freemium
agt-owner=0xABCD1234...
```

A client resolving `researcher.agt` would parse this into:

```json
{
  "version": 1,
  "name": "Research Agent",
  "description": "Deep research and source citation across academic and web sources",
  "icon": "https://researcher.example.com/icon.png",
  "website": "https://researcher.example.com",
  "protocols": ["mcp", "http"],
  "capabilities": ["research", "summarization", "citation"],
  "endpoints": [
    { "protocol": "mcp", "url": "https://researcher.example.com/mcp" },
    { "protocol": "http", "url": "https://researcher.example.com/api/v1" }
  ],
  "pricing": "freemium",
  "owner": "0xABCD1234..."
}
```

## Verification

The `agt-owner` field declares the wallet address that controls the domain. Clients can verify ownership by checking the Freename NFT owner on-chain:

1. Compute the Freename token ID for the domain
2. Query the FNS contract `ownerOf(tokenId)` on Polygon
3. Compare with the declared `agt-owner` value

If they match, the manifest is verified. If they don't, the client should flag a mismatch warning.

## DNS Provider Notes

### Freename
- Records are set via the Reseller API: `POST /api/v1/reseller-logic/records?zone={uuid}`
- Use `@` as the record name for root domain records
- TXT values are returned wrapped in double quotes by the resolver API
- Records are indexed as `record.TXT.0`, `record.TXT.1`, etc.

### Handshake
- Records are set as standard DNS TXT records on the TLD zone
- Use standard DNS tooling (Namecheap, Bob Wallet, etc.)
- Resolved via DNS-over-HTTPS (RFC 8484) through `hnsdoh.com` or `hdns.io`

## Future Directions

- **Manifest v2 (JSON):** Full JSON manifest hosted on IPFS, referenced via `agt-manifest` TXT record. Enables richer schemas, signatures, and structured capability descriptions.
- **Signed manifests:** Manifest JSON signed by the owner's wallet, enabling cryptographic verification without on-chain lookups.
- **Capability schemas:** Structured input/output type definitions per capability (beyond simple string tags).
- **Trust attestations:** On-chain endorsements between `.agt` agents, forming a decentralized reputation graph.
