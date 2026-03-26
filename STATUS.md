# Status

Last updated: 2026-03-26

## Current state

Site built and deployed to Vercel (agtnames.com). Stripe payment integration complete in mock mode. Full docs section. Celebration page with NFT details. Not yet accepting real payments.

## Launch checklist

### Blockers (can't launch without)
- [ ] #20 Configure Stripe for production
- [ ] #17 Connect custom domain to Vercel
- [ ] #25 Pricing margin on domain registration
- [ ] #26 Terms of Service and Privacy Policy pages
- [ ] #27 Freename API access from Vercel (IP whitelisting)
- [ ] #1 End-to-end claim flow testing with real APIs

### Important (should have at launch)
- [ ] #19 SEO & meta: OG image, sitemap, robots.txt
- [ ] #28 Confirmation email after domain purchase
- [ ] #29 Error monitoring and alerting
- [ ] #30 Support contact visible on all pages
- [ ] #31 Rate limiting on API routes
- [ ] #32 Analytics integration
- [ ] #33 Email capture in claim flow

### Marketing launch
- [ ] #34 Launch announcement — X thread + blog post
- [ ] #35 Developer community seeding — HN, Reddit, Discord
- [ ] #36 SEO content strategy
- [ ] #37 Existing .agt holder outreach
- [ ] #38 Partnership outreach — agent framework integrations
- [ ] #39 Social proof — showcase agents on landing page
- [ ] #40 Launch video — screen recording of claim flow

## Blocked

- **Promo code support** (#18) — waiting on Freename re: reseller API coupon support

## Recently completed

- Stripe Checkout integration with webhook-driven fulfillment (#13)
- Celebration page: NFT card, social share, copy buttons, MetaMask import (#22)
- Mock mode for local development (#23)
- Full docs section: 7 pages with sidebar nav (#21)
- Custom .agt favicon (#24)
- Rebrand from @agtdomains to @agtnames (#16)

## Open issues by phase

### Phase 1 — Foundation (launch blockers)
- #1 End-to-end claim flow testing
- #17 Connect custom domain to Vercel
- #19 SEO & meta
- #20 Configure Stripe for production
- #25 Pricing margin
- #26 Terms of Service + Privacy Policy
- #27 Freename API IP whitelisting

### Launch support
- #28 Confirmation emails
- #29 Error monitoring
- #30 Support contact
- #31 Rate limiting
- #32 Analytics
- #33 Email capture

### Marketing
- #34 Launch announcement
- #35 Community seeding
- #36 SEO content strategy
- #37 Existing holder outreach
- #38 Partnership outreach
- #39 Social proof on landing page
- #40 Launch video

### Phase 2 — Ecosystem
- #2 Record management dashboard
- #3 Supabase-backed agent directory index
- #4 Publish @agt/resolver to npm
- #5 Existing holder onboarding flow
- #6 Landing page refinement
- #18 Promo code support (blocked)

### Phase 3 — Infrastructure
- #7 Handshake DNS sync service
- #8 CLI tool
- #9 Browser agent interaction
- #10 Manifest v2

### Phase 4 — Network effects
- #11 Agent-to-agent discovery protocol
- #12 Trust and reputation layer
- #14 Open standard publication
- #15 Multi-platform clients
