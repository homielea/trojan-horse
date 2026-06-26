# Spec F7 — Paywall / Subscription (fast-follow, v1.1)

> Gym-framed subscription. Men already pay monthly for a number going up (gym, Whoop).
> Frame the inner-life metric the same way. Loss-aversion retention, not shame.

## Model
- Pricing (assumed; founder to confirm): **$9.99/mo** or **$59/yr** (annual emphasized).
- Tooling: **RevenueCat** for cross-platform entitlements + receipt validation.
- Trial: 7-day free trial on annual.

## Free vs paid (proposed)
| Capability | Free | Paid |
|---|---|---|
| Urge loop (F1) | ✅ | ✅ |
| Anti-streak metric (F2) | ✅ | ✅ |
| Relapse autopsy (F3) | ✅ (log) | ✅ |
| Danger Map | preview (top 1) | full |
| AI late-night check-in (F6) | 3 lifetime | unlimited |
| Conditioning level (F8) | basic | full + insights |

Rationale: the core safety loop stays free (never paywall someone mid-urge); the
*insight + companion* layer is the upgrade.

## Acceptance criteria
- [ ] Urge loop is NEVER behind the paywall (safety/ethics + retention).
- [ ] Paywall appears after first value (not on launch); soft, dismissible.
- [ ] RevenueCat entitlement gates paid features; restores purchases correctly.
- [ ] Annual + trial configured; monthly available.
- [ ] Loss-aversion framing in retention copy, never shame framing.
