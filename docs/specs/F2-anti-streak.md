# Spec F2 — Anti-Streak Metric ("Self-Awareness Reps")

> The signature differentiator. Unlike NoFap streak counters that reset to zero on a slip
> (a shame machine that causes churn), our metric is MONOTONIC: it only ever goes up.
> Both riding an urge AND honestly logging a slip increment it. The win is awareness.

## User story
As a user, my progress number never resets — even when I slip — so I never feel like
I'm "back to zero" and never want to delete the app out of shame.

## Behaviour
- `selfAwarenessReps = reps.length` (interventions + slips both count).
- Displayed prominently on Home as the hero number with label "SELF-AWARENESS REPS"
  and subtext "This number only goes up. Slips count too."
- There is **no** UI, setting, or code path that decrements or resets it. (Invariant.)

## Acceptance criteria
- [ ] Metric equals total RepEvents and updates immediately on any new event.
- [ ] Logging a slip increases the metric (does NOT reset it).
- [ ] No reset/clear/decrement path exists anywhere (search the codebase to confirm).
- [ ] Value persists across app restarts (AsyncStorage).
- [ ] Copy never frames a slip as failure.

## Anti-requirements (do not build)
- ❌ A "days clean" streak counter.
- ❌ Any "you broke your streak" / "starting over" messaging.
