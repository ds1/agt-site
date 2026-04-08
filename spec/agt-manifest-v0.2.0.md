# .agt Manifest Specification

**Version:** 0.2.0
**Status:** Draft
**Date:** 2026-04-08
**Extends:** v0.1.0 (2026-04-02)

## Abstract

The .agt manifest defines agent identity using DNS TXT records on `.agt` domains. v0.1.0 established inline TXT records as the canonical format. v0.2.0 adds an alternative: a JSON manifest hosted on IPFS, referenced by a single TXT pointer record.

v0.2.0 is purely additive. All v0.1.0 features continue to work unchanged. Clients MUST support v1 inline TXT records. Support for v2 JSON manifests is OPTIONAL but RECOMMENDED.

## 1. Changes from v0.1.0

- New TXT pointer record: `agt-manifest=ipfs://{cid}` (Section 2)
- JSON manifest schema with richer metadata (Section 3)
- Capability schemas with input/output types (Section 3.3)
- Protocol version declarations (Section 3.2)
- Structured pricing model (Section 3.5)
- Cryptographic signature format and verification (Section 4)
- Updated resolution algorithm with IPFS-first priority (Section 5)

## 2. TXT Pointer Record

A v2 manifest is referenced by a single DNS TXT record on the `.agt` domain's root (`@`):

```
agt-manifest=ipfs://{cid}
```

- `{cid}` is a valid IPFS Content Identifier (CIDv0 or CIDv1) pointing to a JSON document conforming to the v2 schema.
- This single record replaces all individual `agt-*` TXT records from v1.
- If both `agt-manifest` and inline `agt-*` records exist, the `agt-manifest` pointer takes priority.
- The JSON document MUST be retrievable via a public IPFS gateway.

## 3. JSON Manifest Schema

### 3.1 Top-Level Structure

```json
{
  "agt": "2.0",
  "domain": "exampleagent.agt",
  "name": "Example Agent",
  "description": "General-purpose assistant agent",
  "icon": "https://exampleagent.example.com/icon.png",
  "website": "https://exampleagent.example.com",
  "owner": "0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a",
  "protocols": [...],
  "capabilities": [...],
  "pricing": {...},
  "signature": "0x..."
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `agt` | string | Yes | Schema version. MUST be `"2.0"`. |
| `domain` | string | Yes | The `.agt` domain this manifest describes. |
| `name` | string | No | Display name. Max 100 characters. |
| `description` | string | No | One-line description. Max 500 characters (extended from v1's 200). |
| `icon` | string | No | Icon image URL. HTTPS recommended. |
| `website` | string | No | Agent homepage URL. HTTPS recommended. |
| `owner` | string | No | Owner wallet address (Ethereum-style hex, e.g., `0x...`). |
| `protocols` | array | No | Supported protocols (Section 3.2). |
| `capabilities` | array | No | Agent capabilities (Section 3.3). |
| `pricing` | object | No | Pricing model (Section 3.5). |
| `signature` | string | No | Hex-encoded EIP-191 signature (Section 4). |

### 3.2 Protocols

Each protocol is an object with an identifier, optional version, and optional endpoint:

```json
{
  "protocols": [
    {
      "id": "mcp",
      "version": "2025-11-05",
      "endpoint": "https://exampleagent.example.com/mcp"
    },
    {
      "id": "a2a",
      "version": "1.0",
      "endpoint": "https://exampleagent.example.com/.well-known/agent.json"
    },
    {
      "id": "http",
      "endpoint": "https://exampleagent.example.com/api/v1"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Protocol identifier (from vocabulary or custom). |
| `version` | string | No | Protocol version string. Format is protocol-specific. |
| `endpoint` | string | No | URL for this protocol's endpoint. HTTPS recommended. |

The protocol vocabulary from v0.1.0 applies: `mcp`, `a2a`, `http`, `ws`, `grpc`. Custom protocol IDs MAY be used (lowercase, hyphen-separated).

### 3.3 Capabilities

Each capability is an object with an identifier and optional schema:

```json
{
  "capabilities": [
    {
      "id": "research",
      "description": "Searches academic databases and web sources",
      "input": {
        "type": "string",
        "description": "Natural language research query"
      },
      "output": {
        "type": "object",
        "properties": {
          "summary": { "type": "string", "description": "Synthesized findings" },
          "sources": { "type": "array", "description": "List of cited sources" }
        }
      }
    },
    {
      "id": "summarization"
    }
  ]
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Capability identifier (from vocabulary or custom). |
| `description` | string | No | Human-readable description of this agent's implementation. |
| `input` | object | No | Input schema (Section 3.4). |
| `output` | object | No | Output schema (Section 3.4). |

The capability vocabulary from v0.1.0 applies (69 registered capabilities across 8 categories). Custom capability IDs MAY be used (lowercase, hyphen-separated).

Capabilities without `input`/`output` fields are equivalent to v1 `agt-cap=` declarations. Clients MUST NOT require schema fields.

### 3.4 Schema Objects

Input and output schemas use a simplified type system:

```json
{
  "type": "string" | "number" | "boolean" | "object" | "array",
  "description": "Human-readable description",
  "properties": { ... }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | Yes | One of: `string`, `number`, `boolean`, `object`, `array`. |
| `description` | string | No | Human-readable description. |
| `properties` | object | No | For `object` type: map of property names to schema objects. |
| `items` | object | No | For `array` type: schema of array elements. |

This is intentionally simpler than JSON Schema. Full JSON Schema compatibility MAY be added in a future version.

### 3.5 Pricing

```json
{
  "pricing": {
    "model": "freemium",
    "free_tier": "10 queries/day",
    "paid": {
      "currency": "USD",
      "amount": "0.01",
      "unit": "per_request",
      "chain": "base"
    }
  }
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | Yes | One of: `free`, `paid`, `freemium`, `contact`. |
| `free_tier` | string | No | Human-readable description of free tier limits. |
| `paid` | object | No | Payment details for paid or freemium models. |
| `paid.currency` | string | No | Currency code (e.g., `USD`, `USDC`, `ETH`). |
| `paid.amount` | string | No | Price as a decimal string. |
| `paid.unit` | string | No | Billing unit: `per_request`, `per_month`, `per_token`, `per_minute`. |
| `paid.chain` | string | No | Blockchain for on-chain payments (e.g., `polygon`, `base`, `ethereum`). |

## 4. Signature Format

The manifest MAY include a cryptographic signature proving the declared owner authored the content.

### 4.1 Signing

1. Remove the `signature` field from the manifest JSON (if present).
2. Serialize the remaining JSON canonically: keys sorted alphabetically at all levels, no whitespace, UTF-8 encoding.
3. Compute the keccak256 hash of the canonical JSON bytes.
4. Sign the hash using EIP-191 `personal_sign` with the owner's private key.
5. Encode the signature as a hex string prefixed with `0x`.

### 4.2 Verification

To verify a signed manifest:

1. Extract the `signature` field and remove it from the JSON.
2. Serialize the remaining JSON canonically (same rules as signing).
3. Recover the signer address from the signature and canonical message.
4. **Three-way verification:**
   - Recovered signer address MUST match the `owner` field in the manifest.
   - `owner` field MUST match the on-chain NFT owner (query FNS contract `ownerOf(tokenId)` on Polygon).
   - If all three match, the manifest is verified.
5. If any check fails, the manifest SHOULD be marked as unverified (not rejected).

### 4.3 Unsigned Manifests

Manifests without a `signature` field are valid but unverified. Clients SHOULD indicate the verification status to users. Unsigned manifests are not inherently untrusted -- the IPFS CID provides content integrity, and the `owner` field can still be checked against on-chain ownership independently.

## 5. Resolution Algorithm (Updated)

To resolve a `.agt` manifest:

1. Query DNS TXT records for the domain (e.g., `exampleagent.agt`).
2. Check for `agt-manifest=ipfs://{cid}`:
   - If found: fetch the JSON document from an IPFS gateway.
   - Validate the `agt` field equals `"2.0"`.
   - If `signature` is present, verify per Section 4.2.
   - Return the parsed manifest.
3. If no `agt-manifest` record: check for `agt-version=1`.
   - If found: parse inline TXT records per v0.1.0 rules.
   - Return the parsed manifest.
4. If neither is found, the domain has no valid manifest. Return null.

### 5.1 IPFS Gateway

Clients SHOULD use a configurable IPFS gateway URL. Recommended defaults:

- `https://dweb.link/ipfs/{cid}`
- `https://ipfs.io/ipfs/{cid}`
- `https://cloudflare-ipfs.com/ipfs/{cid}`

Clients SHOULD implement a timeout (recommended: 10 seconds) and fall back to v1 TXT records if the IPFS gateway is unreachable.

### 5.2 Caching

- IPFS manifests are immutable (the CID is a hash of the content). Clients MAY cache aggressively by CID.
- The TXT pointer record (`agt-manifest=ipfs://{cid}`) is subject to DNS TTL and SHOULD be re-fetched periodically.
- When the pointer changes (new CID), the client MUST fetch the new manifest.

## 6. Backward Compatibility

- All v0.1.0 inline TXT records continue to work unchanged.
- Clients MUST support v1 inline TXT records.
- v2 JSON manifest support is OPTIONAL but RECOMMENDED.
- Agent owners can use v1 only, v2 only, or both simultaneously.
- When both exist, the `agt-manifest` pointer takes priority.
- The v1 `agt-version=1` sentinel is not required when using v2 JSON manifests (the `"agt": "2.0"` field in JSON serves the same purpose).

## 7. Example

### v2 JSON Manifest (on IPFS)

A complete v2 manifest for `exampleagent.agt`:

```json
{
  "agt": "2.0",
  "domain": "exampleagent.agt",
  "name": "Example Agent",
  "description": "General-purpose assistant agent with research and summarization capabilities",
  "icon": "https://exampleagent.example.com/icon.png",
  "website": "https://exampleagent.example.com",
  "owner": "0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a",
  "protocols": [
    {
      "id": "mcp",
      "version": "2025-11-05",
      "endpoint": "https://exampleagent.example.com/mcp"
    },
    {
      "id": "http",
      "endpoint": "https://exampleagent.example.com/api/v1"
    }
  ],
  "capabilities": [
    {
      "id": "research",
      "description": "Searches academic databases and web sources",
      "input": {
        "type": "string",
        "description": "Natural language research query"
      },
      "output": {
        "type": "object",
        "properties": {
          "summary": { "type": "string", "description": "Synthesized findings" },
          "sources": { "type": "array", "description": "Cited source URLs" }
        }
      }
    },
    {
      "id": "summarization"
    }
  ],
  "pricing": {
    "model": "freemium",
    "free_tier": "10 queries/day",
    "paid": {
      "currency": "USD",
      "amount": "0.01",
      "unit": "per_request"
    }
  },
  "signature": "0x7f3e8d4c..."
}
```

### TXT Pointer Record

The single DNS TXT record on `exampleagent.agt`:

```
agt-manifest=ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
```

### Equivalent v1 Inline Records (for comparison)

The same agent configured using v0.1.0 inline TXT records:

```
agt-version=1
agt-name=Example Agent
agt-description=General-purpose assistant agent
agt-icon=https://exampleagent.example.com/icon.png
agt-website=https://exampleagent.example.com
agt-owner=0x912D39E13b0bDAe2C5Cf5D0E2f9F4B38aE9c7f6a
agt-protocol=mcp
agt-protocol=http
agt-cap=research
agt-cap=summarization
agt-endpoint-mcp=https://exampleagent.example.com/mcp
agt-endpoint-http=https://exampleagent.example.com/api/v1
agt-pricing=freemium
```

Note that the v2 JSON manifest includes richer data (capability schemas, protocol versions, structured pricing) that cannot be expressed in v1 TXT records.

## 8. Security Considerations

All security considerations from v0.1.0 apply, plus:

- **IPFS content integrity**: The CID is a cryptographic hash of the manifest content. If the content is tampered with, the CID will not match. Clients SHOULD verify the fetched content matches the CID.
- **Gateway trust**: Public IPFS gateways serve content but do not guarantee availability. Clients SHOULD support multiple gateway fallbacks.
- **Signature verification**: A valid signature proves the manifest was authored by the wallet owner at the time of signing. It does not prove the manifest is current -- the owner may have published a newer version. Always use the latest CID from the TXT pointer.
- **Canonical JSON**: Signing requires deterministic serialization. Implementations MUST sort keys alphabetically and use no whitespace to ensure consistent hashes across platforms.
- **Private key safety**: Manifest signing requires access to the owner's private key. Signing SHOULD be performed client-side (browser wallet, CLI tool). Private keys MUST NOT be transmitted to or stored on servers.

## 9. Versioning

- **v0.1.0**: Inline TXT records. `agt-version=1` sentinel.
- **v0.2.0** (this document): Adds JSON manifests on IPFS. `"agt": "2.0"` in JSON. TXT pointer: `agt-manifest=ipfs://{cid}`.
- Future versions will increment the `agt` field in JSON and the `agt-version` value in TXT records.

## Appendix A: JSON Schema (Formal)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": ".agt Manifest v2",
  "type": "object",
  "required": ["agt", "domain"],
  "properties": {
    "agt": { "type": "string", "const": "2.0" },
    "domain": { "type": "string", "pattern": "^[a-z0-9-]+\\.agt$" },
    "name": { "type": "string", "maxLength": 100 },
    "description": { "type": "string", "maxLength": 500 },
    "icon": { "type": "string", "format": "uri" },
    "website": { "type": "string", "format": "uri" },
    "owner": { "type": "string", "pattern": "^0x[a-fA-F0-9]{40}$" },
    "protocols": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "version": { "type": "string" },
          "endpoint": { "type": "string", "format": "uri" }
        }
      }
    },
    "capabilities": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id"],
        "properties": {
          "id": { "type": "string" },
          "description": { "type": "string" },
          "input": { "$ref": "#/$defs/schema" },
          "output": { "$ref": "#/$defs/schema" }
        }
      }
    },
    "pricing": {
      "type": "object",
      "required": ["model"],
      "properties": {
        "model": { "type": "string", "enum": ["free", "paid", "freemium", "contact"] },
        "free_tier": { "type": "string" },
        "paid": {
          "type": "object",
          "properties": {
            "currency": { "type": "string" },
            "amount": { "type": "string" },
            "unit": { "type": "string", "enum": ["per_request", "per_month", "per_token", "per_minute"] },
            "chain": { "type": "string" }
          }
        }
      }
    },
    "signature": { "type": "string", "pattern": "^0x[a-fA-F0-9]+$" }
  },
  "$defs": {
    "schema": {
      "type": "object",
      "required": ["type"],
      "properties": {
        "type": { "type": "string", "enum": ["string", "number", "boolean", "object", "array"] },
        "description": { "type": "string" },
        "properties": {
          "type": "object",
          "additionalProperties": { "$ref": "#/$defs/schema" }
        },
        "items": { "$ref": "#/$defs/schema" }
      }
    }
  }
}
```
