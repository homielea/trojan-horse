# Spec F8 — Conditioning Level (fast-follow, v1.1)

> Gamifies the inner work as a single trainable stat — like a lift PR or fitness "level."
> Built on top of reps with a recency component so it rewards showing up, not just history.

## Definition (pure function)
`conditioningLevel(reps): { level: number; xp: number; toNext: number; trend: 'up'|'flat'|'down' }`

- XP accrues from RepEvents (an intervention is worth more than a slip-log, but both are
  positive — never negative).
- Recency decay: recent activity weighted higher; long inactivity makes the level "decay"
  visibly (loss aversion) WITHOUT touching the monotonic self-awareness count (F2).
- Suggested: `xp = Σ event_weight * recencyFactor(age)`; `level = floor(sqrt(xp / k))`.
  Tune `k`, weights, and decay during build; document chosen values in code.

## Display
- A level badge + progress bar on Home. "Conditioning" decays when reps lapse → nudges return.
- Tapping shows a simple insights view (reps over time, trend).

## Acceptance criteria
- [ ] Pure, unit-testable function in `src/domain/reps.ts`.
- [ ] Level never goes negative; decay affects the *level/XP*, never the self-awareness count.
- [ ] Decay creates a visible "use it or lose it" pull without shame language.
- [ ] Chosen constants documented inline.

## Note
Keep distinct from F2: F2 (self-awareness reps) is the permanent, never-reset trust number;
F8 (conditioning) is the dynamic, decaying engagement number. Two different jobs.
