# Status

Last updated: 2025-03-25

## Current state

Site is built and deployed to Vercel. Domain not yet connected. Claim flow implemented but not tested end-to-end against live Freename API.

## In progress

Nothing active — between work sessions.

## Blocked

- **Promo code support** (#18) — waiting on Freename to confirm whether the reseller API supports coupon/promo codes

## Up next (phase 1)

- [ ] Connect agtnames.com domain to Vercel (#17)
- [ ] SEO & meta: OG image, sitemap, robots.txt, metadataBase (#19)
- [ ] End-to-end claim flow testing against live Freename API (#1)

## Recently completed

- Site scaffolded with Next.js 16 / React 19 / Tailwind 4
- Full inline claim flow: search → availability → wallet → claim → mint → configure → done
- Explore page with agent directory
- Agent config form (protocols, capabilities, endpoints)
- Freename reseller API integration (auth, search, zone creation, minting, records)
- Technical reference docs
- Rebrand from @agtdomains to @agtnames (#16 — closed)
- README replaced with project-specific docs
- Lint warning fixed, build clean
- Deployed to Vercel production

## Open issues by phase

### Phase 1 — Foundation
- #1 End-to-end claim flow testing
- #17 Connect custom domain to Vercel
- #19 SEO & meta

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
- #13 On-chain payment integration
- #14 Open standard publication
- #15 Multi-platform clients (VS Code, Slack, etc.)
