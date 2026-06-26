# Spec F3 — Relapse Autopsy & Danger Map

> Reframes a slip from failure into the single most valuable data event in the app.
> A 60-second, shame-free debrief captures the trigger and feeling; aggregated over time
> these build a personal "danger map" that powers personalization.

## User story
As a user who just slipped, I do a quick, non-judgmental debrief that turns the slip into
useful data, and over time I can see my personal danger patterns.

## Flow
1. Home has a low-key entry: **"I slipped — log it (no shame, it's data)."**
2. Tap → `autopsy` (modal route), a 3-step, ~60s flow:
   - Step 1: "What set it off?" — chips (Bored, Late night, Stressed, Lonely, Argument,
     Scrolling, Tired, Other+text) → `trigger`.
   - Step 2: "What were you actually feeling underneath?" — chips (named affects) → `feeling`.
   - Step 3 (optional): one line of free text → `note`.
3. Submit → `logSlip({trigger, feeling, note})` (appends RepEvent{type:'slip'}) → Home.
4. After ≥3 slips with triggers, Home surfaces a **Danger Map** card: top triggers ranked.

## Danger map
- `dangerMap(reps)` = frequency of `trigger` across slip events, sorted desc.
- Display top 3 as "Your danger zones" with counts. Tap → simple list.

## Acceptance criteria
- [ ] Autopsy completable in under ~60s; all steps after step 1 skippable.
- [ ] Submitting appends exactly one `RepEvent{type:'slip'}` with captured fields.
- [ ] Tone is explicitly non-judgmental throughout (no "you failed").
- [ ] Danger Map appears only after ≥3 triggered slips; ranks correctly by frequency.
- [ ] All local; no network.

## Notes for later
- v1.1: feed dangerMap into the AI check-in and into reframe selection (F1).
- v1.1: time-of-day pattern detection ("most slips happen 11pm–1am").
