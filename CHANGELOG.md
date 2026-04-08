# Changelog

## 2026-04-08 — Manifest v2 Specification & Documentation Refresh

### What changed

Today we published the draft specification for .agt manifest v2, the next evolution of how AI agents declare their identity, capabilities, and how to reach them.

The current manifest (v1) stores agent identity as flat DNS TXT records on a .agt domain. It works, and it will continue to work indefinitely. But TXT records have limits. Each value caps at 255 bytes. There is no way to describe the shape of what an agent accepts or returns. Protocols have no version numbers. Pricing is a single keyword. And there is no way to cryptographically prove that the person who owns the domain actually wrote the manifest.

v2 addresses all of this by introducing a JSON manifest hosted on IPFS, pointed to by a single TXT record.

### What v2 enables

**Capability schemas.** An agent can now describe not just that it does research, but exactly what input it accepts (a string query) and what output it returns (a summary with cited sources). This is what allows other agents and tools to evaluate compatibility automatically, without a human reading documentation.

**Protocol versions.** Instead of declaring support for MCP generically, an agent can specify which version of MCP it implements. Clients can check compatibility before attempting a connection, rather than discovering a mismatch at runtime.

**Structured pricing.** Rather than labeling an agent as "paid" with no further detail, a v2 manifest can express the currency, the amount, the billing unit (per request, per month, per token), and even the blockchain for on-chain payments. This lays groundwork for agents to negotiate costs with each other programmatically.

**Cryptographic signatures.** The manifest can be signed by the domain owner's wallet. Clients verify three things: the signature matches the declared owner, the declared owner matches the on-chain NFT holder, and the content has not been tampered with. This turns the manifest from metadata into a verifiable credential.

**Content integrity.** Because the manifest lives on IPFS, the pointer in the TXT record is a hash of the content. If someone alters the JSON, the hash will not match. The content is immutable by design.

### How it works

A v2 agent has one TXT record on their .agt domain:

```
agt-manifest=ipfs://bafybeigdyrzt5sfp7udm7hu76uh7y26nf3efuylqabf3oclgtqy55fbzdi
```

That CID points to a JSON document on IPFS containing everything: name, description, protocols with versions and endpoints, capabilities with input/output schemas, pricing details, owner address, and an optional signature.

When a client resolves a .agt domain, it checks for this pointer first. If found, it fetches the JSON from an IPFS gateway. If not found, it falls back to reading inline TXT records the v1 way. The return type is the same either way. Existing agents and existing clients are unaffected.

### What else changed

We updated every example across the documentation, spec pages, landing page, and SDK docs to use `exampleagent.agt` as the canonical example domain, replacing the previous `researcher.agt`. This makes it clearer that the examples are generic illustrations, not tied to a specific agent type.

The full v2 specification is published at `spec/agt-manifest-v0.2.0.md` and rendered on the `/spec` and `/docs/agt-manifest-spec` pages of the site.

### What comes next

The spec is defined. Implementation follows in stages:

1. **Resolver SDK** learns to detect the `agt-manifest` pointer and fetch JSON from IPFS, with automatic v1 fallback.
2. **IPFS pinning** infrastructure gets set up so the config dashboard can publish v2 manifests.
3. **Config API** gains a v2 write path that serializes the form to JSON, pins to IPFS, and writes the pointer record.
4. **Config form** submits as v2 by default, showing the IPFS CID on success.
5. **Signatures** come last, likely through the CLI tool first and browser wallet integration later.

During the transition, both v1 and v2 records will be written simultaneously so no client breaks regardless of which version it understands.

### Freename integration updates

We also resolved several open questions with Freename, our registry partner:

- **Domain authorization confirmed.** Freename confirmed that the Reseller API is authorized for use from agtnames.com. This was the last launch blocker in that category.
- **Wallet behavior clarified.** The minting wallet address is what determines NFT ownership. The wallet in zone creation does not need to match. Our fulfillment flow already handles this correctly.
- **Custody model decided.** Freename offers a single custody wallet per reseller. After evaluating the options, we chose to continue requiring customers to provide their own wallet at checkout. This avoids custody liability, regulatory complexity, and the operational burden of managing transfers. Our target audience is developers who already have wallets.
- **Follow-up questions sent.** Revenue share definition, test registration costs, and domain reservation capabilities are still pending responses from Freename.
