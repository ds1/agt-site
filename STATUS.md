# Status

Last updated: 2026-04-01

## Current state

Site deployed to Vercel (agtnames.com). Stripe payment integration complete with live and test keys configured. Pricing engine applies 40% markup on Freename base prices. Webhook handles 6 event types with revenue tracking. Terms acceptance required before checkout. Vercel production env vars set. Awaiting Freename response on API authorization for agtnames.com and revenue share clarification before accepting real payments.

## In progress

- **E2E testing (#1)** — Stripe checkout flow verified locally (payment, redirect, webhook delivery all working). Freename fulfillment fails with "unexpected error" — likely IP whitelisting or domain authorization issue. Auto-refund triggers correctly on failure. Dedicated failure UX implemented.
- **Freename authorization (#87)** — Email sent to Freename requesting: API authorization for agtnames.com domain, net revenue definition, tax treatment in revenue split, markup confirmation. Awaiting response.

## Launch checklist

### Blockers (can't launch without)
- [x] #20 Configure Stripe for production (keys, webhook, Vercel env vars)
- [x] #25 Pricing margin on domain registration (40% markup, env-configurable)
- [x] #80 End-customer terms of service for checkout (checkbox + server validation)
- [ ] #17 Connect custom domain to Vercel
- [ ] #27 Freename API access from Vercel (IP whitelisting)
- [ ] #87 Clarify revenue share terms with Freename (email sent, awaiting response)
- [ ] #1 End-to-end claim flow testing with real APIs

### Compliance (new — from reseller agreement review)
- [x] #80 Terms acceptance before checkout
- [ ] #81 Revenue share tracking and Freename reconciliation (code built, needs real transactions)
- [ ] #82 Chargeback and fraud monitoring (webhook handlers built, alerting not yet)
- [ ] #83 Refund policy and refund handling (auto-refund works, policy page needed)
- [ ] #84 Freename branding compliance review
- [ ] #85 Truthful domain data display
- [ ] #86 API rate limit and fair use compliance

### Important (should have at launch)
- [ ] #28 Confirmation email after domain purchase
- [ ] #29 Error monitoring and alerting
- [ ] #88 Google Analytics custom events (base GA4 tracking live)
- [ ] #19 SEO & meta: OG image, sitemap, robots.txt
- [ ] #30 Support contact visible on all pages
- [ ] #31 Rate limiting on API routes (basic rate limiting exists)
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

- **Freename fulfillment** — zone creation returns "An unexpected error occurred." Likely needs IP whitelisting (#27) and/or domain authorization for agtnames.com (#87). Email sent to Freename 2026-04-01.
- **Promo code support** (#18) — waiting on Freename re: reseller API coupon support

## Recently completed (2026-04-01)

- Reviewed Freename Reseller Agreement — documented constraints in `_internal/reseller-agreement-constraints.md`
- Created 8 compliance-related GitHub issues (#80-88) from agreement review
- Stripe webhook handler expanded to 6 events (checkout completed/expired, dispute created/updated/closed, charge refunded)
- Revenue tracking module with JSONL ledger and admin API endpoint (`/api/admin/revenue`)
- Pricing engine: 40% markup on Freename base prices, env-configurable (`src/lib/pricing.ts`)
- Terms of service checkbox with server-side validation before Stripe Checkout
- Stripe Tax integration ready (gated behind `STRIPE_TAX_ENABLED` flag)
- Dedicated failure UX for post-payment registration errors (auto-refund messaging)
- Form accessibility fixes (id/name attributes on inputs)
- Vercel production environment variables configured
- Live and test Stripe webhooks created (6 events each)
- Testing guide documented in `_internal/testing-guide.md`

## Previously completed

- Stripe Checkout integration with webhook-driven fulfillment (#13)
- Celebration page: NFT card, social share, copy buttons, MetaMask import (#22)
- Mock mode for local development (#23)
- Full docs section: 7 pages with sidebar nav (#21)
- Custom .agt favicon (#24)
- Rebrand from @agtdomains to @agtnames (#16)
- Google Analytics integration (#32)
- SEO, rate limiting, legal pages, support contact, email capture
- Mobile responsiveness across all pages
- 24 alt-TLD/variation domains with 301 redirects to agtnames.com

## Open issues by phase

### Phase 1 — Foundation (launch blockers)
- #1 End-to-end claim flow testing
- #17 Connect custom domain to Vercel
- #27 Freename API IP whitelisting
- #41 Namebase.io offline — HNS DNS management unavailable
- #42 E2E agent config testing (registration site)
- #43 Verify Freename API cache clears for agt.agt records
- #44 Add agt-icon to registration site agent config form
- #45 Add agt-website record type for agent homepages
- #46 Publish .agt manifest spec as standalone document
- #79 Set NEXT_PUBLIC_GA_MEASUREMENT_ID in Vercel env (done via env vars)
- #87 Clarify revenue terms with Freename

### Compliance
- #81 Revenue share tracking
- #82 Chargeback monitoring
- #83 Refund policy
- #84 Branding compliance
- #85 Truthful data display
- #86 API rate limits

### Launch support
- #28 Confirmation emails
- #29 Error monitoring
- #88 Google Analytics custom events

### Marketing
- #34–#40 (unchanged)

### Phase 2–4
- Unchanged from previous status
