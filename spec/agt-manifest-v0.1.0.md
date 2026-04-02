# .agt Manifest Specification

**Version:** 0.1.0  
**Status:** Draft  
**Date:** 2026-04-02  

## Abstract

The .agt manifest defines agent identity using DNS TXT records on `.agt` domains. Each `.agt` domain is an ERC-721 NFT on the Polygon blockchain, owned by a wallet address. The manifest — a set of structured key-value TXT records — declares the agent's name, capabilities, protocols, endpoints, and metadata.

Any client that can resolve `.agt` domains can read and parse an agent's manifest without authentication.

## 1. Terminology

The key words "MUST", "MUST NOT", "SHOULD", "SHOULD NOT", and "MAY" in this document are to be interpreted as described in [RFC 2119](https://www.rfc-editor.org/rfc/rfc2119).

- **Agent**: An AI system or service identified by a `.agt` domain.
- **Manifest**: The complete set of `agt-*` TXT records on a `.agt` domain.
- **Record**: A single DNS TXT record containing one `agt-{field}={value}` pair.
- **Sentinel**: The `agt-version=1` record that marks a domain as having a valid manifest.

## 2. Record Format

All manifest records are DNS TXT records on the `.agt` domain's root (`@`) with the format:

```
agt-{field}={value}
```

- Values are UTF-8 strings.
- Each TXT record MUST contain exactly one `agt-{field}={value}` pair.
- DNS TXT record limits apply (255 bytes per string; multiple strings are concatenated).
- Records with unknown `agt-` prefixes SHOULD be ignored by parsers (forward compatibility).

## 3. Record Types

### 3.1 Required

| Record | Description |
|--------|-------------|
| `agt-version={n}` | **Required.** Sentinel that marks this domain as an .agt agent. Current value: `1`. |

A domain without `agt-version=1` MUST NOT be treated as having a valid manifest.

### 3.2 Identity

| Record | Description | Constraints |
|--------|-------------|-------------|
| `agt-name={name}` | Display name for the agent. | Max 100 characters. |
| `agt-description={text}` | One-line description of what the agent does. | Max 200 characters. |
| `agt-icon={url}` | Icon image URL. | PNG, SVG, or JPG. HTTPS recommended. 128x128px minimum recommended. |
| `agt-website={url}` | Agent homepage or landing page URL. | Full HTTPS URL. |
| `agt-owner={address}` | Owner wallet address. | Ethereum-style hex address (e.g., `0x1234...abcd`). |

### 3.3 Capabilities

| Record | Description | Cardinality |
|--------|-------------|-------------|
| `agt-protocol={id}` | Protocol the agent supports. | Repeatable. One record per protocol. |
| `agt-cap={id}` | Capability the agent has. | Repeatable. One record per capability. |

### 3.4 Endpoints

| Record | Description |
|--------|-------------|
| `agt-endpoint-{protocol}={url}` | URL for a specific protocol. `{protocol}` MUST match a declared `agt-protocol`. |

### 3.5 Commerce

| Record | Description |
|--------|-------------|
| `agt-pricing={model}` | Pricing model. Values: `free`, `paid`, `freemium`, `contact`. |

## 4. Protocol Vocabulary

The following protocol identifiers are defined in v0.1.0:

| ID | Name | Description |
|----|------|-------------|
| `mcp` | Model Context Protocol | Anthropic's protocol for tool and context integration. |
| `a2a` | Agent-to-Agent Protocol | Google's protocol for inter-agent communication. |
| `http` | REST API | Standard HTTP/HTTPS REST interface. |
| `ws` | WebSocket | Persistent bidirectional connection. |
| `grpc` | gRPC | High-performance RPC framework. |

Custom protocol IDs MAY be used. They SHOULD be lowercase, hyphen-separated identifiers.

## 5. Capability Vocabulary

Starter capabilities for v0.1.0:

`research`, `summarization`, `translation`, `code-generation`, `code-review`, `data-analysis`, `image-generation`, `image-analysis`, `audio-transcription`, `web-scraping`, `api-integration`, `workflow-automation`, `scheduling`, `monitoring`, `content-writing`, `chat`, `reasoning`, `math`, `search`, `embedding`

Custom capability IDs MAY be used. They MUST be lowercase, hyphen-separated identifiers.

## 6. Resolution Algorithm

To resolve a `.agt` manifest:

1. Query DNS TXT records for the domain (e.g., `researcher.agt`).
2. Filter for records matching the `agt-*` prefix.
3. Check for `agt-version=1`. If absent, the domain has no valid manifest.
4. Parse remaining records according to the field definitions in Section 3.

Resolution priority for future versions:

1. **Inline TXT records** (current, v0.1.0)
2. **Content-addressed manifest** (`agt-manifest-cid={cid}` — IPFS, future)
3. **Hosted manifest** (`agt-manifest-url={url}` — HTTP, future)

Clients MUST support inline TXT records. Support for content-addressed and hosted manifests is OPTIONAL in v0.1.0.

## 7. Parsing Rules

1. **Quote stripping**: DNS providers may wrap TXT values in double quotes. Parsers MUST strip surrounding quotes before interpreting values.
2. **Multiple records**: Fields marked "Repeatable" (e.g., `agt-protocol`, `agt-cap`) may appear multiple times. Each occurrence adds to the list.
3. **Empty values**: A record with an empty value after the `=` SHOULD be treated as if the record were absent.
4. **Unknown prefixes**: Records with unrecognized `agt-` prefixes SHOULD be silently ignored.
5. **Case sensitivity**: Field names (`agt-protocol`, `agt-cap`, etc.) are case-sensitive and MUST be lowercase. Values are case-sensitive unless otherwise specified.

## 8. Verification

The `agt-owner` address can be verified against the on-chain NFT owner:

1. Query the Freename Name Service (FNS) contract on Polygon.
2. Compute the token ID: `keccak256(abi.encodePacked(domain))`.
3. Call `ownerOf(tokenId)` on the FNS contract.
4. Compare the returned address with the `agt-owner` value.

A mismatch indicates the manifest may be stale or the domain has been transferred.

## 9. Example

A complete manifest for `researcher.agt`:

```
agt-version=1
agt-name=Research Agent
agt-description=Deep research and source citation
agt-icon=https://researcher.example.com/icon.png
agt-website=https://researcher.example.com
agt-owner=0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://researcher.example.com/mcp
agt-endpoint-http=https://researcher.example.com/api
agt-pricing=free
```

## 10. Security Considerations

- **Public data**: All TXT records are public and unencrypted. Agents MUST NOT store secrets in manifest records.
- **Endpoint URLs**: SHOULD use HTTPS. Clients SHOULD warn users before connecting to HTTP endpoints.
- **Icon URLs**: SHOULD be served over HTTPS to prevent mixed-content issues in browsers.
- **Owner verification**: Clients SHOULD verify `agt-owner` against on-chain ownership before trusting the manifest (see Section 8).
- **DNS poisoning**: Standard DNS security considerations apply. DNSSEC is not currently enforced for `.agt` domains.

## 11. Versioning

This specification uses semantic versioning. The `agt-version` record value tracks major versions only. Minor and patch changes to the specification do not change the `agt-version` value.

- **v0.1.0** (this document): Initial draft specification.
- Future breaking changes will increment the `agt-version` value.

## Appendix A: Record Reference

| Record | Section | Required | Repeatable | Max Length |
|--------|---------|----------|------------|-----------|
| `agt-version` | 3.1 | Yes | No | — |
| `agt-name` | 3.2 | No | No | 100 chars |
| `agt-description` | 3.2 | No | No | 200 chars |
| `agt-icon` | 3.2 | No | No | — |
| `agt-website` | 3.2 | No | No | — |
| `agt-owner` | 3.2 | No | No | — |
| `agt-protocol` | 3.3 | No | Yes | — |
| `agt-cap` | 3.3 | No | Yes | — |
| `agt-endpoint-{proto}` | 3.4 | No | No (per proto) | — |
| `agt-pricing` | 3.5 | No | No | — |
