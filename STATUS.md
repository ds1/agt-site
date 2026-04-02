# Status

Last updated: 2026-04-01

## Current state

Site deployed to Vercel (agtnames.com). Stripe payment integration complete with live and test keys configured. Pricing engine applies 40% markup on Freename base prices. Webhook handles 6 event types with revenue tracking. Terms acceptance required before checkout. Vercel production env vars set. Awaiting Freename response on API authorization for agtnames.com and revenue share clarification before accepting real payments.

## Active blockers

- **Freename fulfillment** — Zone creation returns "unexpected error." Likely needs IP whitelisting and/or domain authorization for agtnames.com. Email sent to Freename 2026-04-01. See [#27](https://github.com/ds1/agt-site/issues/27), [#87](https://github.com/ds1/agt-site/issues/87).
- **Promo code support** — Waiting on Freename re: reseller API coupon support. See [#18](https://github.com/ds1/agt-site/issues/18).

## Tracking

All TODOs, features, and roadmap items are tracked in [GitHub Issues](https://github.com/ds1/agt-site/issues).

| View | Command |
|------|---------|
| Launch blockers | `gh issue list --label launch-blocker --state open` |
| Phase 1 | `gh issue list --label phase-1 --state open` |
| Compliance | `gh issue list --label compliance --state open` |
| Launch important | `gh issue list --label launch-important --state open` |
| Marketing | `gh issue list --label marketing --state open` |

## Recently completed (2026-04-01)

- Stripe webhook handler expanded to 6 events (#80 closed)
- Revenue tracking module with JSONL ledger and admin API
- Pricing engine with 40% markup
- Terms of service checkbox with server-side validation
- Dedicated failure UX for post-payment registration errors
- Vercel production env vars configured
- Google Analytics integration (#32 closed)
- SEO, rate limiting, legal pages, support contact, email capture
