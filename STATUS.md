# Status

Last updated: 2026-04-03

## Current state

Site deployed to Vercel (agtnames.com). Stripe payment integration complete with live and test keys configured. Pricing engine applies 40% markup on Freename base prices. Webhook handles 6 event types with revenue tracking. Terms acceptance required before checkout. Vercel production env vars set. Freename API confirmed working — zone creation, minting, and NFT import to MetaMask validated end-to-end (2026-04-03). Awaiting Freename response on domain authorization for agtnames.com and revenue share clarification before accepting real payments.

## Active blockers

- **Freename domain authorization** — Awaiting confirmation that Reseller API is authorized for agtnames.com (not agtdomains.com). Email sent 2026-04-01, follow-up 2026-04-03. See [#87](https://github.com/ds1/agt-site/issues/87).
- **Revenue share clarification** — Net revenue definition, tax treatment, retail pricing confirmation still pending from Freename. See [#89](https://github.com/ds1/agt-site/issues/89), [#90](https://github.com/ds1/agt-site/issues/90).
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
