# Spec F4 — Onboarding

> The first 60 seconds decide activation. Goal: get a shame-loaded man from install to
> his first logged rep without friction, without clinical language, without scaring him off.

## User story
As a new user, I'm welcomed by a coach (not a clinic), I set a quick baseline, and I get
a guaranteed first win — all in under a minute.

## Flow (`app/onboarding/`)
1. **Welcome / frame** (`index.tsx`): one screen, coach voice. Sets the contract:
   "This isn't therapy. It's training. The number only goes up. Let's get your first rep."
   No account, no email, no permissions ask yet.
2. **Baseline** (`baseline.tsx`): one question — "How often does this usually get you,
   in a week?" → sets `baselineFrequencyPerWeek`. Framed as calibration, not judgment.
   Skippable.
3. **First rep** (`first-rep.tsx`): run a shortened version of the F1 intervention so the
   user lands on Home already at **1 rep**, not 0. Guaranteed first win.
4. `completeOnboarding()` sets `onboardedAt`; routes to Home. Onboarding never shows again.

## Acceptance criteria
- [ ] Entire flow completable in < 60s; every step after Welcome is skippable.
- [ ] No email/account/login. No permission prompts during onboarding.
- [ ] Zero clinical/therapy/mental-health words anywhere in copy.
- [ ] User arrives on Home with selfAwarenessReps ≥ 1.
- [ ] `onboardedAt` persists; relaunch goes straight to Home.

## Notes for later
- v1.1: soft push-notification opt-in AFTER first value (not during onboarding).
- v1.1: A/B test the welcome framing copy (see GTM brainstorm).
