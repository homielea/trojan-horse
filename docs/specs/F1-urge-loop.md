# Spec F1 — Urge Loop (core loop)

> The reason the app exists. When a user feels an urge, the app intercepts it with a
> 60-second guided intervention and converts surviving the urge into a logged "rep."

## User story
As a man feeling an urge, I tap one button and get a 60-second structured intervention
(breathing + one reframing line) so the wave passes and I record a win.

## Flow
1. Home shows a large **"I'm having an urge"** button (always reachable in ≤1 tap).
2. Tap → navigate to `intervention` (modal route).
3. Intervention screen:
   - A 60s countdown with a breathing visual (expand/contract ring, ~4s in / 4s out).
   - One reframe line, chosen deterministically by `reps % REFRAMES.length`.
   - CTA is disabled-looking until timer hits 0 ("Breathe. Stay with it."), then becomes
     **"Logged. That was a rep."**
4. On completion → `addIntervention()` (append RepEvent) → return Home → metric increments.

## Acceptance criteria
- [ ] Urge button reachable from Home in one tap; min 56px tall touch target.
- [ ] Timer counts 60→0 accurately; interval cleared on unmount (no leak).
- [ ] Reframe text is visible the whole time and selected per the rule above.
- [ ] Completing appends exactly one `RepEvent{type:'intervention'}` and increments the metric.
- [ ] User can leave early (back gesture) WITHOUT logging — leaving early logs nothing
      and shows no guilt messaging.
- [ ] No network calls. Fully offline.

## Notes for later
- v1.1: optional haptic pulse on each breath cycle (expo-haptics).
- v1.1: let the AI pick the reframe based on recent dangerMap instead of round-robin.
