# Status

Last updated: 2026-03-26

## Current state

Site is built and deployed to Vercel. Stripe payment integration complete (mock mode). Docs section live with 7 pages. Custom favicon. Celebration page with NFT details, social share, MetaMask import instructions. Domain not yet connected to Vercel. Stripe not yet configured for production.

## In progress

Nothing active — between work sessions.

## Blocked

- **Promo code support** (#18) — waiting on Freename to confirm whether the reseller API supports coupon/promo codes

## Up next (phase 1)

- [ ] Configure Stripe for production (#20)
- [ ] Connect agtnames.com domain to Vercel (#17)
- [ ] SEO & meta: OG image, sitemap, robots.txt, metadataBase (#19)
- [ ] End-to-end claim flow testing against live APIs (#1)

## Recently completed

- Stripe Checkout integration — payment required before domain registration (#13 — closed)
  - Webhook-driven fulfillment with auto-refund on failure
  - Server-side price verification (prevents manipulation)
  - Mock mode for local testing without Stripe or Freename
- Full docs section: overview, manifest spec, resolver SDK, API reference, user flows, architecture, roadmap (#21 — closed)
- Celebration page: NFT card, social share (X, LinkedIn, Discord, Reddit), NFT details with copy buttons, MetaMask import, OpenSea/Polygonscan links
- Custom .agt favicon (SVG)
- Contextual headers per claim flow step
- Placeholder text and copy updates
- Site scaffolded with Next.js 16 / React 19 / Tailwind 4
- Full inline claim flow: search → pay → fulfill → mint → celebrate → configure
- Explore page with agent directory
- Agent config form (protocols, capabilities, endpoints)
- Freename reseller API integration (auth, search, zone creation, minting, records)
- Technical reference docs
- Rebrand from @agtdomains to @agtnames (#16 — closed)
- Deployed to Vercel production

## Open issues by phase

### Phase 1 — Foundation
- #1 End-to-end claim flow testing
- #17 Connect custom domain to Vercel
- #19 SEO & meta
- #20 Configure Stripe for production

### Phase 2 — Ecosystem
- #2 Record management dashboard
- #3 Supabase-backed agent directory index
- #4 Publish @agt/resolver to npm
- #5 Existing holder onboarding flow
- #6 Landing page refinement
- #18 Promo code support (blocked)

### Phase 3 — Infrastructure
- #7 Handshake DNS sync service
- #8 CLI tool: agt init / register / update / resolve
- #9 Browser agent interaction: MCP/A2A client
- #10 Manifest v2: IPFS-hosted JSON with signatures

### Phase 4 — Network effects
- #11 Agent-to-agent discovery protocol
- #12 Trust and reputation layer
- #14 Open standard publication
- #15 Multi-platform clients (VS Code, Slack, etc.)
