# ALL GITHUB ISSUES — ds1/agt-site

*Exported 2026-04-05*

---

## OPEN ISSUES (32)

---

### #97 — Pending: Domain reservation/blocking to prevent fraud and squatting
**State:** OPEN | **Labels:** `launch-important`, `compliance` | **Created:** 2026-04-03

As the operator of the .agt namespace (also held on Handshake), we need a way to prevent fraudulent or misleading registrations — trademarked names, brand-confusable names, and premium names we hold on HNS.

Several .agt domains held on Handshake are already registered by others on Freename:
- news.agt — **unavailable**
- crypto.agt — **unavailable**
- sales.agt — **unavailable**
- service.agt — **unavailable**
- travel.agt — **unavailable**
- pay.agt — **unavailable**

Still available (as of 2026-04-03):
- vibe.agt ($198), live.agt ($499), top.agt ($4,900), domain.agt ($2,499), free.agt ($1,499)

**Questions sent to Freename (2026-04-03):**
1. Can specific second-level domains under .agt be reserved or blocked from registration?
2. Can names be flagged as protected or restricted?
3. If not, is self-registration the only option to secure them? (Cost implications in #96)

Without reservation capability, premium .agt names can be registered by anyone through Freename's platform, creating potential conflicts with HNS .agt holders and trademark issues.

**Acceptance Criteria:**
- [ ] Freename response on reservation/blocking capabilities
- [ ] Decision on approach for protecting key names
- [ ] If self-registration: coordinate with #96 on cost clarification first

---

### #96 — Pending: Cost of test/self-registered domains via Reseller API
**State:** OPEN | **Labels:** `revenue`, `compliance` | **Created:** 2026-04-03

The reseller agreement (Section 5.3) defines revenue share based on "payments from end customers." When registering domains internally (no customer, no payment), it's unclear whether Freename considers these billable.

Test domain `testprobe999.agt` was registered via the API with no apparent charge or credit deduction.

**Question sent to Freename (2026-04-03):**
Are test or internal registrations made through the Reseller API at no cost, given that the revenue share is based on payments collected from end customers? If there is a cost, what is the billing mechanism?

**Impact — affects whether we can:**
- Register test domains freely during development
- Self-register domains to prevent fraud/squatting (see #97)
- Reserve premium .agt names we hold on Handshake

**Acceptance Criteria:**
- [ ] Written clarification from Freename on self-registration costs
- [ ] Update `_internal/reseller-agreement-constraints.md` with answer

---

### #95 — Pending: Customer wallet custody solution for users without a wallet
**State:** OPEN | **Labels:** `enhancement` | **Created:** 2026-04-03

Our claim flow currently requires the customer to provide an EVM wallet address for minting. Not all potential customers will have one.

**Questions sent to Freename (2026-04-03):**
1. Does Freename provide a custody wallet for registrants?
2. Can we mint to a Freename-managed wallet and let the customer claim it later?
3. Or should we handle wallet provisioning on our end?

**Options (pending Freename response):**
- **Freename custody:** Simplest if available — mint to Freename wallet, customer claims via Freename dashboard
- **Our custody:** Generate a wallet per customer, hold keys, let them transfer out (complex, liability concerns)
- **Require wallet:** Current approach — customer must have a wallet (limits audience)
- **Delayed minting:** Register zone without minting, let customer mint later when they have a wallet

**Acceptance Criteria:**
- [ ] Freename response on custody options
- [ ] Decision on approach
- [ ] Update claim flow if wallet is no longer required upfront

---

### #94 — Pending: Wallet address mismatch — zone creation vs minting
**State:** OPEN | **Labels:** `compliance` | **Created:** 2026-04-03

During testing, a zone was created with `walletAddress` set to `0x0000000000000000000000000000000000000000` (null address), then minting was triggered with a different wallet (`0x0C7FA1ea0D6B42bfA018538B828f2a0Cf2604810`). Minting succeeded.

**Questions sent to Freename (2026-04-03):**
1. Does the `walletAddress` in zone creation need to match the minting request?
2. Is there a way to update the wallet address on an existing zone before minting?
3. Are there downstream implications of the mismatch (ownership records, on-chain metadata)?

If the wallet address in zone creation matters for on-chain ownership or metadata, our fulfillment flow may need to ensure consistency between the two calls. Currently `fulfillment.ts` passes the same wallet to both, so this only affects the test domain `testprobe999.agt`.

**Acceptance Criteria:**
- [ ] Written clarification from Freename on wallet address behavior
- [ ] Update `docs/technical-reference.md` with findings
- [ ] If mismatch matters: verify `testprobe999.agt` ownership is correct on-chain

---

### #93 — Pending: Domain authorization for agtnames.com
**State:** OPEN | **Labels:** `launch-blocker`, `compliance` | **Created:** 2026-04-03

Our Freename reseller credentials were issued to `engineering@agtdomains.com`, but our site is hosted at `agtnames.com`. Need written confirmation that the Reseller API is authorized for use from this domain.

**Status:** Asked in email to Freename engineering team (2026-04-03), both in initial email and follow-up. No response yet.

**Cannot accept real payments until domain authorization is confirmed. This is a launch blocker.**

**Acceptance Criteria:**
- [ ] Written confirmation from Freename that `agtnames.com` is authorized
- [ ] Any required configuration changes completed on Freename's end

---

### #90 — Review tax requirements for Stripe and Freename
**State:** OPEN | **Labels:** `revenue`, `compliance` | **Created:** 2026-04-02

Stripe Tax is integrated but disabled (`STRIPE_TAX_ENABLED=false`). Before accepting real payments, we need to understand tax obligations.

**Questions to resolve:**
- Does AGT need to collect sales tax / VAT on domain registrations?
- How does Freename handle tax in their invoicing to us (reseller)?
- Does the 65/35 revenue split apply pre-tax or post-tax?
- Which jurisdictions require tax collection for digital goods / NFT sales?
- Is Stripe Tax the right solution, or do we need a dedicated tax service?

**Action items:**
- [ ] Research tax obligations for digital goods / NFT sales in AGT's operating jurisdiction
- [ ] Check Freename reseller agreement for tax treatment clauses (Section 5.3, 5.6)
- [ ] Decide whether to enable Stripe Tax before launch or defer
- [ ] If enabling, configure tax settings in Stripe Dashboard and set `STRIPE_TAX_ENABLED=true`
- [ ] Document tax handling approach

**Reference:** Stripe Tax docs, `STRIPE_TAX_ENABLED` env var, Reseller Agreement Section 5.3/5.6, Related: #89

---

### #89 — Clarify 'net revenue' definition with Freename
**State:** OPEN | **Labels:** `revenue`, `compliance` | **Created:** 2026-04-02

Per the Reseller Agreement (Section 5.3), AGT owes Freename 65% of net revenue by the 10th of each month. The agreement does not explicitly define whether "net revenue" means:
1. **Gross sales** (total customer payment), or
2. **Gross minus payment processing fees** (after Stripe fees are deducted)

Current implementation uses interpretation #2 (gross minus Stripe fees), which is the standard industry interpretation. However, this has not been confirmed with Freename.

On a $24.46 sale with a ~$1.01 Stripe fee:
- Interpretation #1: Freename gets 65% of $24.46 = **$15.90**
- Interpretation #2: Freename gets 65% of $23.45 = **$15.24**

The difference compounds at volume.

**Action required:** Ask Freename to confirm the "net revenue" definition. If they define it as gross (interpretation #1), update the revenue split calculation in `src/lib/revenue.ts` and `src/app/api/webhooks/stripe/route.ts`.

**Reference:** Reseller Agreement Section 5.3 and Section 2. Spun out from #81.

---

### #87 — Clarify revenue share terms with Freename
**State:** OPEN | **Labels:** `launch-blocker`, `revenue`, `compliance` | **Created:** 2026-04-01

The Freename Reseller Agreement defines a 65/35 revenue split (Freename/AGT) on Reseller API sales, but several terms are ambiguous and need written clarification before going live.

**Open Questions:**

**1. "Net revenue" definition** — Does the split apply to (a) gross sales pre-tax, or (b) gross minus payment processing fees? At $14.99/domain: (a) gives Freename $9.74; (b) gives $9.27. Compounds at volume.

**2. Tax treatment in revenue split** — Does tax collected (VAT/GST/sales tax) count toward "total volume generated"? It should not, since tax is collected on behalf of governments — but needs written confirmation.

**3. Markup confirmation** — The agreement does not restrict AGT's retail pricing. AGT plans ~40% markup plus premium tiers for short names. While contractually permissible, good practice to confirm Freename has no objections (they receive 65% of the higher amount too).

**Acceptance Criteria:**
- [ ] Written response from Freename on "net revenue" definition
- [ ] Written confirmation that tax collected is excluded from revenue split
- [ ] Written confirmation (or no objection) on markup pricing approach
- [ ] Update `_internal/reseller-agreement-constraints.md` with answers
- [ ] Adjust revenue tracking calculations in `src/lib/revenue.ts` if needed

**Reference:** Reseller Agreement Section 2 and Section 5.3, Internal doc: `_internal/reseller-agreement-constraints.md`

---

### #43 — Verify Freename API cache clears for agt.agt records
**State:** OPEN | **Labels:** (none) | **Created:** 2026-03-26

After setting records on `agt.agt`, only some records (name, description, icon) are resolving. The remaining 6 records (protocols, capabilities, endpoints, pricing, owner) may be stuck in Freename's API cache.

**Steps:**
1. Query Freename API for `agt.agt` and check all `agt-*` records
2. If records are missing, wait for cache expiry or investigate Freename cache TTL
3. Verify browser renders the full agent card with all fields populated

**Expected Records:** `agt-version`, `agt-name`, `agt-description`, `agt-icon`, `agt-protocol`, `agt-cap`, `agt-endpoint-*`, `agt-pricing`, `agt-owner`

---

### #42 — Registration site: end-to-end agent config testing
**State:** OPEN | **Labels:** (none) | **Created:** 2026-03-26

Verify the full round-trip of the .agt agent configuration flow works end-to-end.

**Steps:**
1. Run the registration site locally with `npm run dev`
2. Register a test domain and fill out the agent config form
3. Verify records land on Freename via the public resolver API
4. Verify the browser renders the newly registered agent correctly
5. Fix any issues discovered in the round-trip

**Acceptance Criteria:**
- A domain can be registered with agent config through the registration site
- Records are readable via Freename public resolver API
- Browser resolves and displays the agent card correctly

---

### #41 — Namebase.io offline — HNS DNS management unavailable
**State:** OPEN | **Labels:** (none) | **Created:** 2026-03-26

Namebase.io is offline (rebuilding after ownership change). This means Handshake DNS records cannot be managed through their UI.

**Impact:**
- Cannot update or add HNS domains via Namebase
- Existing HNS domains with records already set continue to resolve normally
- Namecheap HNS management still works for domains registered there

**Action:** Monitor Namebase.io status for when it comes back online. Consider documenting alternative HNS DNS management options (Bob Wallet, Namecheap, etc.)

---

### #40 — Launch video — screen recording of full claim flow
**State:** OPEN | **Labels:** `marketing` | **Created:** 2026-03-26

A 60-90 second screen recording showing the full claim experience. Used for X thread, landing page, docs, and outreach.

**Script:**
1. Type a name in the search bar
2. See availability + price
3. Enter wallet address
4. Click Claim → Stripe Checkout
5. Complete payment
6. Watch minting progress
7. Celebration page with NFT card
8. Configure agent (select protocols, capabilities)
9. Done — show the agent resolving in the browser

**Format:** 1080p or 4K, dark theme matches site. No audio needed (captions/annotations). GIF version for X embeds. Host on YouTube for embedding.

---

### #39 — Social proof — showcase registered agents on landing page
**State:** OPEN | **Labels:** `phase-2`, `marketing` | **Created:** 2026-03-26

The landing page shows a static manifest example. It should show real, configured agents to prove the system works and create FOMO.

**Tasks:**
- [ ] Fetch live agent data from /api/agents on the landing page
- [ ] Show 3-4 real agent cards below the fold
- [ ] Display total registered count ("N agents and counting")
- [ ] Requires: at least 3-5 agents actually configured with manifests (seed with your own)

Relates to #6 Landing page refinement.

---

### #38 — Partnership outreach — agent framework integrations
**State:** OPEN | **Labels:** `marketing` | **Created:** 2026-03-26

Get .agt mentioned in agent framework docs as a discovery/identity option.

**Targets:**
- **Anthropic MCP**: Propose .agt as a discovery layer for MCP servers
- **Google A2A**: Position as an alternative to .well-known/agent.json
- **LangChain**: Integration guide for resolving .agt agents in chains
- **CrewAI**: Agent identity for crew members
- **AutoGen**: Agent discovery for multi-agent orchestration
- **Semantic Kernel**: .NET agent identity integration

**Approach:** Build working integrations first (resolve .agt in each framework), write tutorials showing the integration, submit PRs to their docs/examples repos, reach out to maintainers with working code — not just an idea.

**Requires:** @agt/resolver published to npm (#4)

---

### #37 — Existing .agt holder outreach campaign
**State:** OPEN | **Labels:** `marketing`, `revenue` | **Created:** 2026-03-26

942+ SLDs already registered on Freename. These holders don't know about the agent manifest system. Converting them to active agent identities is the fastest path to a populated directory.

**Strategy:**
1. Get the list of existing .agt SLD holders from Freename (or on-chain query)
2. Identify holders with public profiles (Twitter, GitHub, ENS)
3. Direct outreach: "You own X.agt — did you know you can configure it as an AI agent identity?"
4. Provide a one-click onboarding flow (#5) to configure their existing domain

**Messaging:** "You already own the name. Now give it a brain." Show what their .agt could look like with a manifest configured. Free to configure — they already paid for the domain.

Relates to #5 Existing holder onboarding flow.

---

### #36 — SEO content strategy — target agent identity keywords
**State:** OPEN | **Labels:** `marketing` | **Created:** 2026-03-26

Capture organic search traffic from developers looking for agent identity, discovery, and naming solutions.

**Target Keywords:** "AI agent identity", "agent discovery protocol", "MCP agent directory", "A2A agent discovery", "name your AI agent", "agent namespace", "decentralized agent registry", "Web3 AI agent", ".agt domain", ".agt agent"

**Content Plan:**
- **Comparison pages**: ".agt vs agent marketplaces", ".agt vs .well-known/agent.json"
- **Tutorial pages**: "How to register a .agt name", "Resolve .agt names in Node.js"
- **Spec page** (done): /docs/agt-manifest-spec — already indexed
- **Landing page SEO** (#19): OG image, structured data, sitemap

**Tasks:**
- [ ] Keyword research with actual search volumes
- [ ] Create 3-5 SEO-optimized content pages
- [ ] Submit sitemap to Google Search Console
- [ ] Build backlinks from agent framework docs/READMEs

---

### #35 — Developer community seeding — HN, Reddit, Discord
**State:** OPEN | **Labels:** `marketing` | **Created:** 2026-03-26

Reach developers where they already are. Focus on communities discussing AI agents, MCP, A2A.

**Channels:**

**Hacker News:** "Show HN: .agt — Decentralized identity for AI agents" — lead with the technical angle: DNS TXT records, on-chain ownership, zero-dep resolver. Best posted 8-9am PT on weekdays.

**Reddit:** r/artificial, r/MachineLearning, r/LocalLLaMA, r/web3, r/cryptocurrency. Frame as solving a real problem, not selling.

**Discord / Slack:** MCP community (Anthropic's Discord), LangChain Discord, AutoGen community, AI agent builder communities. Introduce .agt as infrastructure, not a competitor.

**Dev.to / Hashnode:** Tutorial: "Give your MCP server a .agt identity in 5 minutes". Cross-post to Medium for broader reach.

**Approach:** Lead with technical value, not sales pitch. Show real code (resolver SDK, manifest format). Invite feedback and feature requests. Be transparent about early stage.

---

### #34 — Launch announcement — X thread + blog post
**State:** OPEN | **Labels:** `marketing` | **Created:** 2026-03-26

Announce .agt to the world. Two formats: a punchy X thread for virality and a blog post for depth/SEO.

**X Thread (@agtnames) structure:**
1. Hook: "Every AI agent needs a name. Today we're launching .agt — the decentralized identity layer for AI agents."
2. The problem: MCP has no directory, A2A is tied to DNS, marketplaces are centralized
3. What .agt is: one name, every platform, no gatekeepers
4. Live demo: show the claim flow (screen recording or GIF)
5. The manifest: show the TXT record format
6. The resolver: show the 3-line SDK code
7. CTA: "Claim yours at agtnames.com"

**Blog Post:** Publish on site at /blog/introducing-agt (or Medium/Substack). Expand the six layers narrative from the rebrand issue. Include architecture diagram. Link to docs, claim page.

**Timing:** Coordinate with domain going live (#17). Post during peak dev Twitter hours (10am-12pm PT, Tue-Thu).

---

### #28 — Confirmation email after domain purchase
**State:** OPEN | **Labels:** `launch-important` | **Created:** 2026-03-26

Users spend money and receive no email from us. Stripe sends a generic payment receipt, but we should send a branded confirmation with .agt-specific details.

**Content:**
- Domain name claimed
- Wallet address minted to
- Transaction hash + Polygonscan link
- OpenSea link
- MetaMask import instructions
- Link to configure agent
- Support contact

**Options:** Resend (simple, API-based), Stripe receipt customization, SendGrid / Postmark.

**Requires:** Email capture in the claim flow (currently only collecting wallet address).

---

### #18 — Promo code support in claim flow
**State:** OPEN | **Labels:** `phase-2`, `blocked` | **Created:** 2026-03-25

Freename's website checkout supports promo/coupon codes, but the reseller API (`POST /api/v1/reseller-logic/zones`) has no documented promo code parameter.

**Status:** Blocked — waiting on Freename support to confirm whether the reseller API supports promo codes.

**Options:**
1. **Freename API support** (preferred) — pass a `promoCode` param to the zone creation endpoint, if Freename confirms it exists
2. **Self-managed promo layer** — validate codes server-side, subsidize the difference (we pay Freename full price)
3. **Redirect to Freename checkout** — users with promo codes complete checkout on Freename directly (breaks inline flow)

**Integration point:** When supported, the promo code field goes in `ClaimContent.tsx` next to the price display (line ~204), validated in `/api/claim/route.ts` before `createZone`.

**Research notes:** Freename OpenAPI spec has zero mention of promo/coupon/discount/voucher. Freename dashboard has "Custom Coupons" feature for TLD owners (up to 50% off, configurable limits). Some promo-like API paths return 401 (not 404) — may indicate undocumented endpoints.

---

### #15 — Multi-platform clients (VS Code, Slack, etc.)
**State:** OPEN | **Labels:** `phase-4` | **Created:** 2026-03-24

As a developer, I want to resolve .agt names from my existing tools (VS Code, Slack, CLI) so that I don't need a separate browser to discover and connect to agents.

The `@agt/resolver` SDK enables .agt resolution from any JavaScript runtime. This issue tracks building clients for popular platforms.

**Potential Clients:**

**VS Code Extension:** Hover over `.agt` domain in comments/strings → show agent card tooltip. Command palette: "Resolve .agt agent" → input domain → show manifest. CodeLens on MCP endpoint URLs → "Connect to agent".

**Slack Bot:** `/agt researcher.agt` → posts agent card as a rich message. `/agt discover research` → lists agents with research capability.

**ChatGPT / Claude Plugin (or MCP tool):** Resolve .agt domains inline in conversation. "Look up researcher.agt" → returns formatted manifest.

**CLI:** Already planned as `@agt/cli` (#8).

**Acceptance Criteria:**
- [ ] At least one non-browser client exists and works
- [ ] Client uses `@agt/resolver` SDK
- [ ] Agent manifest is displayed in platform-appropriate format
- [ ] Published / installable by end users

Start with VS Code extension — largest developer audience, most natural fit.

---

### #14 — Open standard publication
**State:** OPEN | **Labels:** `phase-4` | **Created:** 2026-03-24

As an agent ecosystem participant, I want the .agt spec to be an open, community-governed standard so that I can trust it won't be unilaterally changed or captured by a single entity.

**Specification Document:** RFC-style format with versioning (v1.0, v1.1, v2.0). Sections: Abstract, Terminology, Record Format, Resolution Algorithm, Verification, Vocabularies, Examples, Security Considerations, IANA-equivalent registry for capabilities/protocols. Hosted on a dedicated docs site or GitHub Pages.

**Community Process:** Public GitHub repo for the spec (separate from implementation repos). Issue-based proposal process (similar to ECMAScript proposals). Stages: Proposal → Draft → Candidate → Standard. Open to community contributions.

**Outreach:** Blog post announcing the spec. Submit to agent framework communities (LangChain, CrewAI, AutoGen, Anthropic MCP). Present at relevant conferences. Seek endorsements from known agent projects.

**Compatibility:** Document how .agt relates to Google A2A Agent Cards (complementary — .agt is discovery, A2A is communication), Anthropic MCP (complementary — .agt endpoints can be MCP servers), OpenAPI (HTTP endpoints can reference OpenAPI specs).

**Acceptance Criteria:**
- [ ] Spec document published and publicly accessible
- [ ] Versioning scheme in place
- [ ] Community contribution process documented
- [ ] At least one external party has reviewed the spec
- [ ] Compatibility with MCP and A2A documented

---

### #12 — Trust and reputation layer
**State:** OPEN | **Labels:** `phase-4` | **Created:** 2026-03-24

As an agent consumer, I want to see how trustworthy an agent is before delegating work to it.

**Attestation Model:**
- **Endorsements**: Agent A endorses Agent B ("researcher.agt trusts scraper.agt for web data")
- **Task attestations**: User/agent attests that Agent X completed a task satisfactorily
- **Negative attestations**: Flagging unreliable agents (with evidence)

**On-Chain Implementation:** Use EAS (Ethereum Attestation Service) on Polygon, or a custom contract. Schema: `{ from: address, to: domain, type: endorsement|task|flag, message: string, timestamp: uint }`. Attestations signed by the `from` wallet.

**Reputation Score:** Computed from: number of endorsements, task success rate, endorser reputation (recursive). Simple v1: count of unique endorsers. Displayed in browser agent card and on /explore.

**Browser Integration:** Agent card shows trust indicators: "Endorsed by N agents", list of endorser domains, reputation score badge.

**SDK Integration:** `getReputation('researcher.agt')` returns reputation data. Include in `AgentManifest` as optional `reputation` field.

**Acceptance Criteria:**
- [ ] Agents can endorse other agents on-chain
- [ ] Endorsements are readable from the browser and SDK
- [ ] Browser agent card shows endorsement count and endorser names
- [ ] /explore page shows reputation indicators
- [ ] Reputation score is computed and displayed
- [ ] Negative attestations (flags) are visible

---

### #11 — Agent-to-agent discovery protocol
**State:** OPEN | **Labels:** `phase-4` | **Created:** 2026-03-24

As an orchestrator agent, I want to discover other agents by capability at runtime so that I can delegate tasks to the best available agent without hardcoding dependencies.

**Discovery API:** Query endpoint: `GET /api/discover?capability=research&protocol=mcp&pricing=free`. Returns ranked list of matching agents with full manifests. Ranking factors: capabilities matched, endpoint reachability, reputation. Rate limiting to prevent abuse.

**SDK Integration:** `discoverAgents({ capability: 'research', protocol: 'mcp' })` in @agt/resolver. Returns `AgentManifest[]` sorted by relevance.

**Protocol Specification:** Document the discovery query format. Define response schema. Specify caching behavior. Define how agents register for discovery (having agt-version=1 is sufficient).

**Orchestration Example:**
```typescript
const agents = await discoverAgents({ capability: 'research', protocol: 'mcp' })
const best = agents[0]
const mcpClient = new MCPClient(best.endpoints.find(e => e.protocol === 'mcp').url)
const result = await mcpClient.callTool('search', { query: 'quantum computing' })
```

**Acceptance Criteria:**
- [ ] Discovery API returns agents filtered by capability and protocol
- [ ] SDK exposes `discoverAgents()` function
- [ ] Results are ranked by relevance
- [ ] Protocol is documented as part of the .agt spec
- [ ] Works with the Supabase-backed index (#3)

---

### #10 — Manifest v2: IPFS-hosted JSON with signatures
**State:** OPEN | **Labels:** `phase-3` | **Created:** 2026-03-24

As an agent developer with complex capabilities, I want to publish a richer manifest than TXT records allow — with structured schemas, multi-language descriptions, and cryptographic signatures.

v1 uses inline TXT records (max 255 chars per value). v2 uses a full JSON manifest hosted on IPFS, referenced via a single `agt-manifest` TXT record.

**Manifest v2 Schema:**
```json
{
  "agt": "2.0",
  "name": "Research Agent",
  "description": "Deep research and source citation",
  "icon": "ipfs://bafyICON...",
  "protocols": [
    { "id": "mcp", "version": "2025-01", "endpoint": "https://..." },
    { "id": "a2a", "version": "1.0", "endpoint": "https://.../.well-known/agent.json" }
  ],
  "capabilities": [
    {
      "id": "research",
      "description": "Searches academic databases and web sources",
      "input": { "type": "string" },
      "output": { "type": "object", "properties": { "summary": "string", "sources": "array" } }
    }
  ],
  "pricing": { "model": "freemium", "free_tier": "10 queries/day", "paid": { "currency": "USDC", "per_request": "0.01", "chain": "base" } },
  "owner": "0x...",
  "signature": "0x..."
}
```

**Resolution:** `agt-manifest=ipfs://bafyMANIFEST` TXT record → fetch JSON → validate signature. Falls back to v1 TXT records if no `agt-manifest` record. **Signature Verification:** Canonical JSON serialization, owner wallet signs, clients verify signature matches owner matches on-chain NFT owner. **Tooling:** CLI `agt publish` and registration site option.

**Acceptance Criteria:**
- [ ] v2 JSON schema defined and documented
- [ ] Browser resolves `agt-manifest` TXT record → fetches JSON from IPFS
- [ ] SDK resolves v2 manifests
- [ ] Signature verification works in browser and SDK
- [ ] v1 TXT records continue to work (backward compatible)
- [ ] CLI can publish v2 manifests

---

### #9 — Browser agent interaction: MCP/A2A client
**State:** OPEN | **Labels:** `phase-3` | **Created:** 2026-03-24

As a browser user, I want to interact with an agent directly from its card — not just view metadata — so that the browser becomes a client, not just a directory viewer.

**HTTP Endpoint Interaction:** For agents with `agt-protocol=http`: inline request/response panel — user types a query, sends to HTTP endpoint, sees response.

**MCP Client (Stretch):** For agents with `agt-protocol=mcp`: lightweight MCP client. Connect via HTTP/SSE transport. List available tools. Allow user to invoke tools with parameters. Display results.

**A2A Client (Stretch):** For agents with `agt-protocol=a2a`: fetch the Agent Card from the endpoint. Display alongside .agt manifest. Initiate a conversation via A2A protocol.

**UI Changes:** Agent card gets a "Connect" tab/section. Tab shows interaction modes based on declared protocols: HTTP (request/response form), MCP (tool list + invocation UI), A2A (conversation interface).

**Acceptance Criteria:**
- [ ] HTTP agents: user can send a request and see the response inline
- [ ] MCP agents: user can list tools and invoke them (stretch)
- [ ] A2A agents: user can view Agent Card and start conversation (stretch)
- [ ] Errors (unreachable endpoint, timeout) shown gracefully

---

### #8 — CLI tool: agt init / register / update / resolve
**State:** OPEN | **Labels:** `phase-3` | **Created:** 2026-03-24

A CLI tool (`@agt/cli`) that wraps the Reseller API and resolver SDK. Primary audience: MCP server developers who want to give their agent a name in one command.

**Commands:**

`npx @agt/cli init [--from-mcp URL]` — Detects MCP server at given URL, reads MCP server info (name, tools, description), generates `agt.config.json` with pre-filled manifest fields, interactive prompts for missing fields.

`npx @agt/cli register <name>` — Checks availability, shows price, prompts for confirmation/wallet, creates zone + triggers minting, sets agt-version=1, polls for minting completion.

`npx @agt/cli update <name>` — Reads local `agt.config.json`, sets agt-* TXT records via Records API, shows confirmation.

`npx @agt/cli resolve <name>` — Uses @agt/resolver SDK to fetch and pretty-print manifest, shows verification status.

**Config File Format (`agt.config.json`):**
```json
{
  "domain": "researcher.agt",
  "name": "Research Agent",
  "description": "Deep research and citation",
  "icon": "https://...",
  "protocols": ["mcp"],
  "capabilities": ["research", "summarization"],
  "endpoints": [{ "protocol": "mcp", "url": "https://researcher.example.com/mcp" }],
  "pricing": "free",
  "owner": "0x..."
}
```

**Authentication:** Prompts for Freename email/password on first use. Stores in `~/.agt/credentials`. Uses same Auth0 login flow.

**Acceptance Criteria:**
- [ ] `npx @agt/cli resolve agt.agt` prints the manifest
- [ ] `npx @agt/cli init --from-mcp http://localhost:3000` generates agt.config.json
- [ ] `npx @agt/cli register myagent` creates zone and triggers minting
- [ ] `npx @agt/cli update myagent` sets records from agt.config.json
- [ ] All commands have `--help` output
- [ ] Errors are human-readable

---

### #7 — Handshake DNS sync service
**State:** OPEN | **Labels:** `phase-3` | **Created:** 2026-03-24

As a .agt domain holder, I want my agent to be resolvable via Handshake DNS so that any HNS-aware client can discover my agent without depending on the Freename API.

The user owns the .agt TLD on Handshake and controls the zone file. This service watches Freename .agt registrations and mirrors their records to Handshake DNS, giving every .agt domain dual-system reachability for free.

**Sync Logic:**
- Watch Freename for new/updated .agt zones (poll Reseller API or maintain event log)
- For each zone with agent records: set matching TXT records in Handshake zone, set A record if HTTP endpoint exists
- For zones without agent records: mirror existing A/CNAME/TXT records from Freename
- Handle transfers and deletions

**Handshake Zone Management:** Use Bob Wallet API, Namebase API, or direct HNS node. Or Namecheap API if TLD managed there. Batch updates.

**Acceptance Criteria:**
- [ ] New Freename registrations mirrored to Handshake within 30 minutes
- [ ] Agent TXT records (agt-*) appear in HNS DNS resolution
- [ ] A records for HTTP endpoints mirrored
- [ ] Domain resolves via browser's Handshake resolver (DoH)
- [ ] Handles 942+ existing domains (backfill)
- [ ] Failures logged, don't block other domains

---

### #6 — Landing page refinement
**State:** OPEN | **Labels:** `phase-2` | **Created:** 2026-03-24

As a visitor, I want to immediately understand what .agt is and why I should claim a name.

**Content Updates:**
- [ ] Add live agent count from the directory ("N agents registered")
- [ ] Add live agent cards section below the fold — show 3-4 real agents from /api/agents
- [ ] Refine hero copy based on user feedback
- [ ] Add "Supported protocols" section showing MCP, A2A, HTTP logos/descriptions

**SEO & Meta:**
- [ ] Set `metadataBase` in layout.tsx to eliminate the Next.js warning
- [ ] Add OG image (1200x630)
- [ ] Add sitemap.xml
- [ ] Add robots.txt

**Performance:**
- [ ] Optimize font loading (preconnect to Google Fonts)
- [ ] Ensure landing page is fully static (no client-side fetch on load)

**Acceptance Criteria:**
- [ ] Landing page shows real agent count and live agent cards
- [ ] All meta tags present (OG, Twitter, description)
- [ ] Lighthouse performance score > 90
- [ ] No metadataBase warning in build output
- [ ] Page loads without any client-side API calls (static render)

---

### #5 — Existing holder onboarding flow
**State:** OPEN | **Labels:** `phase-2` | **Created:** 2026-03-24

942+ .agt domains are already registered but have no agent manifest (no agt-version=1 record). This issue creates an onboarding path for existing holders to configure their domains.

**Self-Service Path (via Dashboard):** Depends on Record Management Dashboard (#2). Existing holders visit `/dashboard`, authenticate with their wallet, see their .agt domains listed as "Not configured", click to open AgentConfigForm, fill in details, save. Records set via Reseller API on their existing zone.

**Template Configurations:**
- **Chatbot**: protocols=[http], capabilities=[chat], pricing=free
- **Research Agent**: protocols=[mcp], capabilities=[research, summarization]
- **Code Assistant**: protocols=[mcp, http], capabilities=[code-generation, code-review]
- **API Service**: protocols=[http, grpc], capabilities=[api-integration]

**Communication:**
- [ ] Draft announcement post for @agtnames (X/Twitter)
- [ ] Draft email/notification if contact info available
- [ ] Add banner on landing page: "Own a .agt name? Configure your agent →"

**Acceptance Criteria:**
- [ ] Existing domain holders can authenticate and see their domains
- [ ] Domains without agt-version=1 show "Not configured" status
- [ ] Template selection pre-fills the config form
- [ ] Saving config sets agt-* records on the existing zone
- [ ] Configured domains appear in /explore after next index cycle

---

### #4 — Publish @agt/resolver to npm
**State:** OPEN | **Labels:** `phase-2` | **Created:** 2026-03-24

The resolver SDK at `agt/resolver-sdk` is built and tested locally. This issue tracks publishing it to npm.

**Package Preparation:**
- [ ] Finalize package.json (name, version, description, repository, homepage, keywords, license)
- [ ] Add README.md with: overview, install instructions, API reference, examples
- [ ] Add CHANGELOG.md
- [ ] Ensure `npm pack` produces a clean tarball (only dist/ + package.json + README)
- [ ] Add `.npmignore` or verify `files` field in package.json

**Publishing:**
- [ ] Create npm org `@agt`
- [ ] `npm publish --access public`
- [ ] Verify: `npm install @agt/resolver` in a fresh project
- [ ] Verify: `import { resolveAgent } from '@agt/resolver'` works

**Documentation:**
- [ ] README: Quick start, full API reference, TypeScript types
- [ ] Examples: resolve single agent, batch resolve, isAgent check, custom resolver URL/timeout

**Acceptance Criteria:**
- [ ] `npm install @agt/resolver` works in a fresh Node.js project
- [ ] `resolveAgent('agt.agt')` returns a valid AgentManifest
- [ ] TypeScript types available (intellisense in VS Code)
- [ ] Package has zero dependencies
- [ ] Package size < 10KB

---

### #3 — Supabase-backed agent directory index
**State:** OPEN | **Labels:** `phase-2` | **Created:** 2026-03-24

Current `/explore` page fetches manifests from a hardcoded list of ~20 seed domains. Replace with Supabase-backed index that auto-discovers and caches agent manifests.

**Indexer Service:** Periodically scan all known .agt domains for agent manifests via Freename API. Parse agt-* records, store in Supabase. Run as cron job or on-demand API route (`POST /api/agents/reindex`). Refresh interval: 15-30 minutes.

**Supabase Schema:**
```sql
CREATE TABLE agents (
  domain TEXT PRIMARY KEY,
  version INT, name TEXT, description TEXT, icon TEXT,
  protocols TEXT[], capabilities TEXT[],
  endpoints JSONB, pricing TEXT, owner TEXT,
  indexed_at TIMESTAMPTZ DEFAULT NOW(), raw_records JSONB
);
CREATE INDEX idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX idx_agents_protocols ON agents USING GIN(protocols);
```

**Updated /api/agents:** Query Supabase instead of live Freename. Support filters: `?capability=X`, `?protocol=Y`, `?q=search`. Pagination: `?page=1&limit=20`. Sort by indexed_at or name.

**Acceptance Criteria:**
- [ ] Indexer scans all .agt domains and stores in Supabase
- [ ] `/api/agents` reads from Supabase with filter/search/pagination
- [ ] `/explore` page loads instantly from cached index
- [ ] New registrations appear within 30 minutes
- [ ] Agents that remove agt-version are de-indexed
- [ ] Handles 1000+ domains without timeout

---

### #2 — Record management dashboard
**State:** OPEN | **Labels:** `phase-2` | **Created:** 2026-03-24

Add a `/dashboard` page where authenticated users can manage their .agt domains.

**Authentication:** User enters wallet address, site presents challenge message to sign, user signs with wallet (MetaMask, etc.), backend verifies signature, session persists via JWT or cookie.

**Domain Listing:** Query Freename API to list all .agt zones owned by authenticated wallet. Display each with config status (configured / not configured).

**Configuration Editing:** Click domain to open agent config. Reuse `AgentConfigForm` component. Pre-populate with existing records (GET `/api/agent-config?zone={uuid}`). On save, update via Records API. Show success/error feedback.

**Resolution Preview:** After saving, "Test resolution" button fetches `https://apis.freename.io/api/v1/resolver/FNS/{domain}` and displays parsed manifest. Confirms records are live.

**Acceptance Criteria:**
- [ ] Wallet-signature authentication works
- [ ] Dashboard lists all owned .agt domains
- [ ] Pre-populated AgentConfigForm for each domain
- [ ] Saving updates records via Freename Records API
- [ ] Resolution preview shows parsed manifest after save
- [ ] Handles edge cases: no owned domains, API errors

**API Endpoints Needed:** `GET /api/dashboard/domains?wallet={address}`, `GET /api/agent-config?zone={uuid}` (exists), `POST /api/agent-config` (exists), `POST /api/auth/verify`

---

### #1 — End-to-end claim flow testing
**State:** OPEN | **Labels:** `phase-1`, `launch-blocker` | **Created:** 2026-03-24

The full claim flow (search → pay → fulfill → mint → celebrate → configure) is implemented but has not been tested end-to-end against the live Freename Reseller API and Stripe in production mode.

**Prerequisites:**
- [ ] Freename API IP whitelisting confirmed for Vercel deployment
- [ ] `FREENAME_API_EMAIL` and `FREENAME_API_PASSWORD` set in Vercel env vars
- [ ] Stripe production keys configured (#20)
- [ ] `MOCK_FREENAME=false` in production

**Acceptance Criteria:**
- [ ] Search returns correct availability status and pricing from Freename
- [ ] Clicking "Claim this name" redirects to Stripe Checkout with correct price
- [ ] Stripe payment completes and webhook fires successfully
- [ ] Webhook fulfills: creates zone, triggers minting, sets agt-version=1 record
- [ ] User returns to site and sees fulfillment progress
- [ ] Minting status polling detects COMPLETE state
- [ ] Celebration page renders with correct domain, wallet, NFT details
- [ ] Token ID, contract address, and transaction hash are correct and copyable
- [ ] OpenSea and Polygonscan links resolve correctly
- [ ] Agent config form saves agt-* TXT records via Records API
- [ ] Skipping agent config proceeds to done screen without errors
- [ ] Error states handled: name unavailable (409), Stripe cancelled, webhook failure (auto-refund), minting timeout

**Test Plan (13 steps):**
1. Set `MOCK_FREENAME=false`, configure real Stripe test keys
2. Run `stripe listen --forward-to localhost:3000/api/webhooks/stripe`
3. Navigate to `/claim`, search for an unclaimed name
4. Enter a valid Polygon wallet address
5. Click "Claim this name" → verify Stripe redirect
6. Complete payment with test card `4242 4242 4242 4242`
7. Verify webhook fires and fulfillment completes
8. Wait for minting to complete (or timeout gracefully)
9. Verify celebration page shows correct NFT details
10. Fill out agent config form, click Save
11. Verify records via Freename resolver API
12. Test cancellation: start checkout, click back → verify cancel message
13. Test failure: simulate Freename API error → verify auto-refund

---

## CLOSED ISSUES (65)

---

### #92 — Fix: Freename API timeout resilience and zone creation corrections
**State:** CLOSED | **Labels:** `bug` | **Created:** 2026-04-03 | **Closed:** 2026-04-03

Zone creation via the Freename Reseller API was failing with 504 timeouts, mistakenly attributed to IP whitelisting (#27). Actual cause: Freename's zone creation endpoint takes ~20-45s to respond, and our client timeout was 15s. The operation was succeeding on Freename's backend despite the timeout. Additionally, `createZone` payload was missing required fields.

**Fixes (deployed in 259ba64):**

**`src/lib/freename-api.ts`:** Default API timeout: 15s → 30s. Zone creation dedicated timeout: 90s. Added `registrantUuid` field (required per docs). Fixed `level` field: `SLD` → `TLD`. Fixed `registrationDate` format: stripped milliseconds and timezone.

**`src/lib/fulfillment.ts`:** Zone creation timeout handled gracefully: on timeout, waits 5s then re-checks availability; if domain no longer available → zone was created despite timeout, proceeds to minting; if still available → retries once. Minting proceeds even without zone UUID. TXT record creation skipped if no UUID (can be set later).

**`src/app/api/webhooks/stripe/route.ts`:** Added auto-refund on webhook crash path (unhandled exceptions). Previously only explicit `result.success === false` path triggered auto-refund; a thrown exception left the customer charged with no domain.

**Validated:** Zone creation, minting, and NFT import to MetaMask confirmed working end-to-end. Test domain `testprobe999.agt` registered and minted on Polygon.

---

### #91 — Capability taxonomy: categories, descriptions, search, and registry
**State:** CLOSED | **Labels:** `enhancement` | **Created:** 2026-04-02 | **Closed:** 2026-04-02

The capability system was a flat list of 20 `{ id, label }` objects with no descriptions, no categories, no hierarchy, and no search. Capabilities were hardcoded in three separate places, AgentCard showed raw IDs instead of labels.

**What was done:** Rewrote `src/lib/agent-capabilities.ts` as a structured registry: 69 capabilities across 8 categories (Language, Code, Data, Search & Retrieval, Media, Communication, Automation, Security). Every capability has: ID, label, description, and category. Helper functions: `getCapabilityLabel()`, `getCapabilityDescription()`, `searchCapabilities()`, `getCapabilitiesGrouped()`, `isKnownCapability()`, `resolveCapabilityAlias()`. AgentConfigForm: search input + grouped categories with tooltip descriptions. AgentCard: fixed raw ID display bug, added description tooltips. ExploreContent: optgroup-based filter dropdown organized by category. Spec pages render dynamically from registry. Custom capabilities supported with auto-formatted labels. Built for scale: adding a capability = one line in the registry array.

---

### #88 — Implement Google Analytics (GA4) site-wide
**State:** CLOSED | **Labels:** `phase-1`, `launch-important` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

GA4 already implemented in root layout (`src/app/layout.tsx`) using Next.js `Script` component with `afterInteractive` strategy. Measurement ID `G-0ECCVDTCGW` configured in `.env`.

**Remaining tasks at close:**
- [ ] Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-0ECCVDTCGW` in Vercel env
- [ ] Verify GA receiving pageview data on deployed site
- [ ] Add custom events: domain search, availability result, checkout initiated/completed/cancelled, agent config saved/skipped
- [ ] Verify GA respects privacy policy
- [ ] Consider cookie consent banner for GDPR

---

### #86 — API rate limit and fair use compliance
**State:** CLOSED | **Labels:** `launch-important`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

Per Reseller Agreement Section 4.6, Freename may apply fair use limitations or volume thresholds on API calls. Exceeding or circumventing is prohibited. Section 4.7 allows Freename to modify/deprecate APIs at any time.

**Requirements implemented:** Client-side rate limiting for Freename API calls (global, not just per-user). Graceful 429/rate-limit response handling with user-friendly error messages. Search result caching for short TTL to reduce redundant API calls. API timeout handling (no uptime SLA from Freename). Freename API errors don't expose internals to end users. Logging captures response times and error rates.

---

### #85 — Truthful domain data display
**State:** CLOSED | **Labels:** `launch-important`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

Per Reseller Agreement Section 6.5, domain data must be displayed truthfully and clearly. Section 3.3 prohibits false/misleading representations about price, quality, value, availability.

**Acceptance Criteria completed:** Search results display real-time availability from Freename API (or clearly indicate if cached). Price shown matches Stripe checkout exactly. Domain description doesn't overstate capabilities. Minting status and NFT details accurate. Error states clearly communicated. No stale pricing — markup consistent between search and checkout.

---

### #84 — Freename branding compliance review
**State:** CLOSED | **Labels:** `launch-important`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

Per Reseller Agreement Section 4.4, any use of Freename's trademarks, logos, or product names requires pre-written approval. Section 13.1: no partnership or joint venture implied.

**Completed:** Audited all pages/components/metadata for Freename brand references. Any references either have written approval or were removed/replaced with generic language. Site does not imply partnership or joint venture. No Freename logo displayed without approval.

---

### #83 — Refund policy and refund handling
**State:** CLOSED | **Labels:** `launch-blocker`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

As merchant of record (Section 5.2), AGT is responsible for all refund handling. Webhook already implements auto-refund on fulfillment failure. Section 5.6: Freename may apply cancellation fee.

**Completed:** Refund policy published (linked from terms and footer). Policy states: refunds for failed minting (automatic), refund window for other cases, non-refundable scenarios. Auto-refund on fulfillment failure continues working. Customer support email exists. Refund transactions logged in revenue tracking. Freename cancellation fees accounted for.

---

### #82 — Chargeback and fraud monitoring
**State:** CLOSED | **Labels:** `launch-blocker`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

Per Reseller Agreement Section 5.5, AGT fully indemnifies Freename against all losses from fraudulent transactions — including indirect losses, lost profit, reputational harm, legal fees. Section 5.3: 25% revenue holdback for 3 months if chargeback rates are high.

**Completed:** Stripe webhook handles `charge.dispute.created` events. Disputes logged with session ID, domain, amount, reason, date. Alert mechanism for new disputes. Basic fraud signals checked before checkout (rate limiting, email validation). Stripe Radar evaluated. Dispute evidence submission process documented. Monthly dispute rate trackable.

---

### #81 — Revenue share tracking and Freename reconciliation
**State:** CLOSED | **Labels:** `launch-blocker`, `revenue`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-02

Per Section 5.3, AGT must pay Freename 65% of net revenue by the 10th of each month.

**Completed:** Every successful `checkout.session.completed` logs: session ID, domain, gross amount, currency, Stripe fee, net amount, Freename share (65%), AGT share (35%), timestamp. Revenue data stored persistently. Monthly summary can be generated. Revenue data accessible via admin/internal endpoint. Data retained for 12+ months. "Net revenue" definition flagged as open question (→ #89).

---

### #80 — End-customer terms of service for checkout
**State:** CLOSED | **Labels:** `phase-1`, `launch-blocker`, `compliance` | **Created:** 2026-04-01 | **Closed:** 2026-04-01

Per Section 5.9, all required legal agreements must be displayed and accepted by end customers before purchase.

**Completed:** Terms of service page at `/terms`. Terms cover: purchase finality, refund conditions, NFT minting, domain ownership, Freename as registry. Checkout requires explicit acceptance before payment (checkbox). Acceptance validated server-side. Cannot proceed to Stripe without accepting. Terms accessible from footer.

---

### #79 — Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel env
**State:** CLOSED | **Labels:** (none) | **Created:** 2026-03-31 | **Closed:** 2026-04-02

Simple ops task: add `NEXT_PUBLIC_GA_MEASUREMENT_ID` with GA4 measurement ID (`G-XXXXXXXXXX`) to Vercel environment variables. Set for Production (and optionally Preview/Development). Redeploy.

---

### #78 — Multi-platform .agt resolution clients (duplicate)
**State:** CLOSED | **Labels:** `phase:4`, `agent-namespace`, `sdk` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Enable .agt resolution from VS Code, Slack, ChatGPT/Claude plugins, mobile companion. All built on `@agt/resolver`. Consider an MCP server wrapping the resolver for instant MCP client compatibility. *Moved from ds1/web3-browser#25. Superseded by #15.*

---

### #77 — Open standard publication for .agt manifest spec (duplicate)
**State:** CLOSED | **Labels:** `phase:4`, `agent-namespace`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Publish .agt manifest spec as a formal, versioned open standard. RFC-style document with change process. Seek feedback from MCP, A2A, agent framework communities. *Moved from ds1/web3-browser#24. Superseded by #14.*

---

### #76 — On-chain payments for agent services (duplicate)
**State:** CLOSED | **Labels:** `phase:4`, `agent-namespace`, `infra` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Enable programmatic payments between agents based on manifest pricing. Extend manifest with payment contract address and chain. USDC/MATIC on Polygon. Escrow-based or prepaid credit. *Moved from ds1/web3-browser#23. Superseded by #13.*

---

### #75 — Trust and reputation layer for agents (duplicate)
**State:** CLOSED | **Labels:** `phase:4`, `agent-namespace`, `infra` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

On-chain trust and reputation system. Attestations, endorsements, reputation score. EAS on Polygon or custom contract. Prevent sybil attacks. *Moved from ds1/web3-browser#22. Superseded by #12.*

---

### #74 — Agent-to-agent discovery protocol (duplicate)
**State:** CLOSED | **Labels:** `phase:4`, `agent-namespace`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Query .agt namespace by capability/protocol/pricing. Returns ranked list. Use cases: orchestrator finding agents, framework auto-discovery. *Moved from ds1/web3-browser#21. Superseded by #11.*

---

### #73 — Manifest v2: IPFS-hosted JSON manifest (duplicate)
**State:** CLOSED | **Labels:** `phase:3`, `agent-namespace`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Rich JSON manifest on IPFS referenced by single TXT record. Enables detailed capability descriptions, input/output schemas, signed manifests. Progressive resolution: check agt-manifest first, fall back to v1 TXT records. *Moved from ds1/web3-browser#20. Superseded by #10.*

---

### #72 — CLI tool: @agt/cli for agent management (duplicate)
**State:** CLOSED | **Labels:** `phase:3`, `agent-namespace`, `cli` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Commands: init (detect MCP/A2A server), register, update, resolve. Built on Resolver SDK. Targets MCP server developers. Auto-detect mcp.json/agent.json. *Moved from ds1/web3-browser#18. Superseded by #8.*

---

### #71 — Handshake DNS sync service for .agt domains (duplicate)
**State:** CLOSED | **Labels:** `phase:3`, `agent-namespace`, `infra` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Watch Freename .agt state changes, mirror records to HNS DNS. HNS management via Namecheap API (already automated). Could run as cron or webhook listener. *Moved from ds1/web3-browser#17. Superseded by #7.*

---

### #70 — Registration site landing page refresh (duplicate)
**State:** CLOSED | **Labels:** `phase:2`, `registration-site` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Update messaging from "AI agent domain" to "give your agent an identity." Showcase agent card UI. Highlight manifest spec and protocol support. *Moved from ds1/web3-browser#16. Superseded by #6.*

---

### #69 — Existing .agt holder onboarding campaign (duplicate)
**State:** CLOSED | **Labels:** `phase:2`, `agent-namespace`, `registration-site` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Help 942 existing .agt SLD holders configure agent identities. Self-service via /dashboard with templates. agt-version sentinel ensures backward compatibility. *Moved from ds1/web3-browser#15. Superseded by #5.*

---

### #68 — Resolver SDK: @agt/resolver npm package (duplicate)
**State:** CLOSED | **Labels:** `phase:2`, `agent-namespace`, `sdk` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Standalone npm package for resolving .agt domains. TypeScript, minimal deps. Progressive resolution: TXT → IPFS → HTTP. Usable from Node.js, Deno, Bun, browser. *Moved from ds1/web3-browser#14. Superseded by #4.*

---

### #67 — Agent directory / explorer page (duplicate)
**State:** CLOSED | **Labels:** `phase:2`, `agent-namespace`, `registration-site` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Browseable /explore or /directory page. Filter by capability, protocol, pricing. Data source: periodic Freename scan cached in Supabase. *Moved from ds1/web3-browser#13. Superseded by #3.*

---

### #66 — Record management dashboard for .agt domains (duplicate)
**State:** CLOSED | **Labels:** `phase:2`, `agent-namespace`, `registration-site` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Web dashboard for managing agent config. Wallet-signature auth. List owned domains, edit config, view resolution status, live preview. *Moved from ds1/web3-browser#12. Superseded by #2.*

---

### #65 — Publish .agt manifest spec as standalone document (duplicate)
**State:** CLOSED | **Labels:** `phase:1`, `agent-namespace`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Clean standalone markdown document defining the full spec. Record types, field definitions, resolution algorithm, starter vocabularies. Version as v1.0. *Moved from ds1/web3-browser#11.*

---

### #64 — Add agt-website record type for agent homepages (duplicate)
**State:** CLOSED | **Labels:** `phase:1`, `agent-namespace`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Define `agt-website` record in manifest spec. Add to registration site form (optional URL field). Browser renders "Visit website" link. *Moved from ds1/web3-browser#10.*

---

### #63 — Add agt-icon to registration site agent config form (duplicate)
**State:** CLOSED | **Labels:** `phase:1`, `agent-namespace`, `registration-site`, `spec` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Add `agt-icon` URL input field to AgentConfigForm. Validate URL format. Include in API route. Preview icon in form. *Moved from ds1/web3-browser#9.*

---

### #62 — Verify Freename API cache clears for agt.agt records (duplicate)
**State:** CLOSED | **Labels:** `phase:1`, `agent-namespace` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

After setting records on `agt.agt`, only some resolving. Check all agt-* records, wait for cache expiry if needed. *Moved from ds1/web3-browser#4. Superseded by #43.*

---

### #61 — Registration site: end-to-end agent config testing (duplicate)
**State:** CLOSED | **Labels:** `phase:1`, `agent-namespace`, `registration-site` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Full round-trip: register test domain → fill agent config → verify on Freename → verify browser renders. *Moved from ds1/web3-browser#3. Superseded by #42.*

---

### #60 — Namebase.io offline — HNS DNS management unavailable (duplicate)
**State:** CLOSED | **Labels:** `infra`, `blocker` | **Created:** 2026-03-27 | **Closed:** 2026-03-31

Namebase.io rebuilding after ownership change. Cannot manage HNS domains via Namebase. Existing records still resolve. Namecheap still works. *Moved from ds1/web3-browser#2. Superseded by #41.*

---

### #33 — Email capture in claim flow
**State:** CLOSED | **Labels:** `launch-important`, `revenue` | **Created:** 2026-03-26 | **Closed:** 2026-03-31

Currently only collecting wallet address. No way to follow up, send confirmations, or notify about issues.

**Tasks completed:**
- Add optional email field to claim flow (before checkout)
- Pass email to Stripe Checkout (`customer_email` parameter — pre-fills Stripe's form)
- Store for confirmation emails and support follow-up

---

### #32 — Analytics integration
**State:** CLOSED | **Labels:** `launch-important` | **Created:** 2026-03-26 | **Closed:** 2026-03-31

GOATCOUNTER_SITE=agt was configured but no tracking code installed. Need visibility into traffic, conversion funnel, drop-off points.

**Tasks completed:** Install tracking script (switched to GA4 per #88). Track key events: search, checkout started/completed, minting complete. Funnel: landing → search → checkout → payment → celebration.

---

### #31 — Rate limiting on API routes
**State:** CLOSED | **Labels:** `launch-important` | **Created:** 2026-03-26 | **Closed:** 2026-03-31

No throttling on search, checkout, or webhook endpoints. Risk of abuse.

**Tasks completed:** Rate limit /api/search (30 req/min per IP). Rate limit /api/checkout (5 req/min per IP). Abuse detection for repeated failed checkout attempts.

---

### #30 — Support contact visible on all pages
**State:** CLOSED | **Labels:** `launch-important` | **Created:** 2026-03-26 | **Closed:** 2026-03-31

Users with payment issues need to reach someone. Only @agtnames X link in footer.

**Tasks completed:** Add support email. Display in footer and on error states. Add to confirmation email.

---

### #29 — Error monitoring and alerting
**State:** CLOSED | **Labels:** `launch-important` | **Created:** 2026-03-26 | **Closed:** 2026-04-02

If Stripe webhook fails, Freename API errors, or minting breaks at 3am, need to know immediately.

**Tasks completed:** Error tracking for server-side errors. Monitor webhook failures (user paid but didn't get domain). Alerts for: webhook errors, Freename API auth failures, minting failures. Structured logging in webhook handler and fulfillment logic.

---

### #27 — Freename API access from Vercel (IP whitelisting)
**State:** CLOSED | **Labels:** `launch-blocker` | **Created:** 2026-03-26 | **Closed:** 2026-04-03

Freename reseller API is IP-whitelisted. Vercel uses dynamic IPs for serverless functions. Options considered: whitelist Vercel IP ranges (too broad), static IP proxy, API key auth.

**Resolved:** Issue was actually a timeout problem, not IP whitelisting. See #92 for the fix.

---

### #26 — Terms of Service and Privacy Policy pages
**State:** CLOSED | **Labels:** `launch-blocker` | **Created:** 2026-03-26 | **Closed:** 2026-03-31

Required for Stripe integration and legal compliance. Created `/terms` and `/privacy` pages covering payment terms, refund policy, NFT ownership, data collection, third-party services (Stripe, Freename, Polygon). Footer links added. Terms linked from Stripe Checkout.

---

### #25 — Pricing margin on domain registration
**State:** CLOSED | **Labels:** `launch-blocker`, `revenue` | **Created:** 2026-03-26 | **Closed:** 2026-04-01

Previously passing Freename's price straight through. Added configurable markup via `PRICE_MARKUP_PERCENT` / `PRICE_MARKUP_FLAT` env vars. Markup applied in `/api/checkout/route.ts`. Final price shown in search results. Premium name pricing for short/desirable names.

---

### #24 — Custom favicon and asset cleanup
**State:** CLOSED | **Labels:** `phase-1` | **Created:** 2026-03-26 | **Closed:** 2026-03-26

Replaced default Vercel triangle favicon with branded .agt SVG icon. Removed unused Next.js default assets (file.svg, globe.svg, next.svg, vercel.svg, window.svg).

---

### #23 — Mock mode for local development
**State:** CLOSED | **Labels:** `phase-1` | **Created:** 2026-03-26 | **Closed:** 2026-03-26

`MOCK_FREENAME=true` enables full claim flow testing without external services. Search: all names available at $9.99 (except test/hello/agent). Checkout: skips Stripe, redirects with mock session ID. Fulfillment: simulates pending → complete after 2 polls. Minting: simulates pending → complete after 3 polls. Agent config: logs to console, returns success.

---

### #22 — Celebration page with NFT details and social share
**State:** CLOSED | **Labels:** `phase-1` | **Created:** 2026-03-26 | **Closed:** 2026-03-26

Post-claim celebration page: congratulations heading with domain name, 1:1 NFT card with responsive text sizing, social share buttons (X, LinkedIn, Discord, Reddit), NFT details (contract address, token ID, tx hash with copy buttons), OpenSea and Polygonscan links, expandable MetaMask import instructions, next steps (configure agent, claim another, explore), expandable agent config records view.

---

### #21 — Full docs section with technical reference
**State:** CLOSED | **Labels:** `documentation` | **Created:** 2026-03-26 | **Closed:** 2026-03-26

Completed /docs with 7 pages: overview, manifest spec, resolver SDK, API reference, user flows, architecture, roadmap. Sidebar navigation. Custom favicon.

---

### #20 — Configure Stripe for production
**State:** CLOSED | **Labels:** `phase-1`, `launch-blocker` | **Created:** 2026-03-26 | **Closed:** 2026-04-02

Stripe Checkout integration built and working in mock mode. Production config: create Stripe account, get production API keys, add webhook endpoint `https://agtnames.com/api/webhooks/stripe`, get webhook secret, set `NEXT_PUBLIC_BASE_URL=https://agtnames.com`, add all env vars to Vercel, test with test keys + `stripe listen`, switch to live keys.

---

### #19 — SEO & meta: OG image, sitemap, robots.txt, metadataBase
**State:** CLOSED | **Labels:** `phase-1`, `launch-important` | **Created:** 2026-03-25 | **Closed:** 2026-03-31

Set `metadataBase` in layout.tsx. Created OG image (1200x630). Added `sitemap.xml`. Added `robots.txt` with sitemap reference. Verified OG tags render correctly.

---

### #17 — Connect custom domain to Vercel
**State:** CLOSED | **Labels:** `phase-1`, `launch-blocker` | **Created:** 2026-03-25 | **Closed:** 2026-04-02

Added DNS records (A/CNAME) pointing agtnames.com to Vercel. Verified domain. HTTPS certificate provisioned. agtdomains.com 301 redirect to agtnames.com. GitHub repo connected for auto-deploy.

---

### #16 — Rebrand and reposition: agtdomains → agtnames
**State:** CLOSED | **Labels:** `phase-2`, `marketing` | **Created:** 2026-03-24 | **Closed:** 2026-03-25

Comprehensive rebrand from "AGT Domains" to "AGT Names" — not just a name change but a repositioning from "Web3 domain registrar" to "decentralized agent identity layer."

**Core Message:** ".agt is the decentralized, verifiable, human-readable identity and discovery layer for AI agents."

**The Six Layers narrative:** (1) Identity — domain is the agent, wallet controls it, NFT on Polygon. (2) Manifest — structured TXT records: capabilities, protocols, endpoints, pricing. (3) Resolution — permissionless via Freename resolver or HNS DNS, @agt/resolver SDK. (4) Communication — manifest declares protocols (MCP, A2A, HTTP, WebSocket, gRPC). (5) Trust & Reputation — on-chain attestations between identities. (6) Composition — decentralized agent orchestration with native directory.

**Key messaging shifts:** "Name" not "domain", "Claim" not "register", "Identity" not "address", "Manifest" not "profile", "Resolve" not "look up". Avoid: "Agent Name Service/ANS" (GoDaddy owns), "Domain registrar", "Web3 domain".

**Audience segments:** Agent developers (primary), agent framework maintainers, Web3-native builders, enterprises building agent fleets.

**Migration:** Handles updated (@agtnames), domains redirected (agtdomains.com → agtnames.com), code/docs updated, SEO migration with canonical URLs.

---

### #13 — On-chain payment integration
**State:** CLOSED | **Labels:** `phase-1` | **Created:** 2026-03-24 | **Closed:** 2026-03-26

Agent manifest extensions for on-chain payments: `agt-payment-address`, `agt-payment-chain`, `agt-payment-token`, `agt-payment-amount`. Payment flow: consumer resolves manifest → sees pricing → sends payment → includes tx hash in request → agent verifies on-chain. Optional escrow contract (stretch goal). Browser shows pricing details and "Pay and connect" button.

---

## SUMMARY

| Category | Open | Closed | Total |
|----------|------|--------|-------|
| Launch blockers | 3 (#93, #87, #1) | 8 | 11 |
| Compliance/Pending Freename | 6 (#97, #96, #95, #94, #90, #89) | 7 | 13 |
| Launch important | 1 (#28) | 7 | 8 |
| Phase 1 | 3 (#43, #42, #41) | 8 | 11 |
| Phase 2 | 7 (#2–#6, #18, #39) | 4 | 11 |
| Phase 3 | 4 (#7–#10) | 4 | 8 |
| Phase 4 | 4 (#11, #12, #14, #15) | 4 | 8 |
| Marketing | 6 (#34–#40) | 1 | 7 |
| Bug/Enhancement | 0 | 2 | 2 |
| Duplicate (migrated from web3-browser) | 0 | 19 | 19 |
| Ops/Other | 0 | 1 (#79) | 1 |
| **Total** | **32 open** | **65 closed** | **97** |

**Critical path to launch:** #93 (domain authorization — waiting on Freename) and #87 (revenue share terms — waiting on Freename) are both launch blockers pending external responses. #1 (E2E claim flow testing) is the remaining launch blocker that requires internal work once the external dependencies resolve.
