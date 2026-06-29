# Trojan Horse — Build Backlog (agent tickets)

> Ordered for build sequence. Each ticket is sized for a single AI agent pass and has
> explicit acceptance criteria. Reference the linked spec. Do tickets top-to-bottom;
> later tickets assume earlier ones are merged. Run `npx tsc --noEmit` before "done."

## Milestone 0 — Foundations

### T-001 · Theme + base components
- Create `src/theme/theme.ts` from DESIGN.md (color, type, spacing tokens).
- Build `Button` (urge/affirm/ghost), `MetricBlock`, `Chip`, `Card` in `src/components/`.
- AC: components render; tokens used (no hardcoded colors in screens after this).

### T-002 · expo-router + app shell
- Add `expo-router`; create `app/_layout.tsx` (root stack + theme), move Home to `app/index.tsx`.
- Register modal routes for `intervention` and `autopsy`.
- AC: app boots to Home via router; modal routes navigable; `npx tsc --noEmit` clean.

### T-003 · Domain + store
- Create `src/domain/types.ts` (per ARCHITECTURE §3) and `src/domain/reps.ts`
  (`addRep`, `dangerMap`, stub `conditioningLevel`).
- Create `src/store/useAppStore.ts` (Zustand + persist to AsyncStorage key `trojan-horse/v1`).
- AC: store persists across restart; append-only `reps`; NO reset path; types strict.

## Milestone 1 — Core loop (MVP)

### T-004 · F1 Urge loop
- Implement Home urge button → `intervention` route with 60s timer + BreathRing + reframe.
- Wire completion to `addIntervention()`.
- AC: matches `specs/F1-urge-loop.md` checklist (timer cleanup, early-exit logs nothing, offline).

### T-005 · F2 Anti-streak metric
- Home `MetricBlock` shows `selfAwarenessReps` with correct label/subtext; persists.
- AC: matches `specs/F2-anti-streak.md`; codebase has no decrement/reset path (grep to confirm).

### T-006 · F3 Relapse autopsy + danger map
- "I slipped" ghost button → `autopsy` 3-step flow → `logSlip()`.
- Danger Map card on Home after ≥3 triggered slips.
- AC: matches `specs/F3-relapse-autopsy.md`.

### T-007 · F4 Onboarding
- `app/onboarding/` welcome → baseline → first-rep; `completeOnboarding()`; gate on `onboardedAt`.
- AC: matches `specs/F4-onboarding.md` (<60s, no account, no clinical words, lands at ≥1 rep).

### T-008 · MVP polish + copy pass
- Apply DESIGN.md voice rules everywhere; check BANNED words list; empty/edge states.
- AC: no banned words in UI; looks premium-dark; runs on iOS + Android + web.

## Milestone 2 — Fast-follow (v1.1)

### T-009 · F8 Conditioning level (`specs/F8-conditioning-level.md`)
### T-010 · Backend proxy + F6 AI check-in (`specs/F6-ai-checkin.md`) — needs Supabase + Anthropic key server-side
- Includes **F6a Future-Self Anchor** (the core check-in mechanic): anchor capture
  (gated on momentum + good-night heuristic, never onboarding/post-slip), `FutureSelf`
  storage, anchor-aware prompt behaviour, and a user-editable anchor screen. See spec §F6a.
### T-011 · F7 Paywall via RevenueCat (`specs/F7-paywall.md`)
### T-012 · Analytics (PostHog) + the success metrics in PRD §6

## Definition of done (every ticket)
- [ ] Matches the linked spec's acceptance criteria.
- [ ] `npx tsc --noEmit` passes; no `any`.
- [ ] Respects PRD §4 principles (no therapy language; no reset path; shame-free).
- [ ] Works on iOS, Android, web (Expo).
