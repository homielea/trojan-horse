# Trojan Horse — Architecture & Data Model

> Audience: AI build agents. This defines *how* we build. Follow it unless a spec overrides.

## 1. Stack decisions

| Concern | Choice | Notes |
|---------|--------|-------|
| Framework | Expo (SDK 56) + React Native + TypeScript | Already scaffolded |
| Navigation | **expo-router** (file-based) | Add in T-002; screens live in `app/` |
| State | **Zustand** + persist middleware | Simple, agent-friendly, no boilerplate |
| Local storage | `@react-native-async-storage/async-storage` | Backs Zustand persist; local-first |
| IDs / time | `expo-crypto` (randomUUID), `Date.now()` | No external date lib needed |
| Styling | StyleSheet + a central theme (see DESIGN.md) | No UI kit for MVP; keep deps light |
| Analytics (v1.1) | PostHog (privacy-friendly, self-hostable) | Defer until after MVP |
| Subscriptions (v1.1) | RevenueCat | F7 |
| AI check-in (v1.1) | **Anthropic Claude** via a backend proxy | NEVER ship API keys in the app |
| Backend (v1.1) | Supabase (auth optional/anonymous, edge functions for AI proxy) | Only when F6/F7 land |

> Installed for the MVP (T-001–T-007): `expo-router`, `zustand`,
> `@react-native-async-storage/async-storage`, `expo-crypto`, plus the expo-router
> peers `react-native-safe-area-context` and `react-native-screens`. Entry is now
> `expo-router/entry` (`package.json` `main`); the old single-file `App.tsx` is
> replaced by the `app/` route tree.

## 2. Folder structure (target)

```
app/                      # expo-router routes
  _layout.tsx             # root stack, theme provider
  index.tsx               # Home (anti-streak metric + urge button)
  intervention.tsx        # 60s urge intervention (modal route)
  autopsy.tsx             # post-slip debrief (modal route)
  onboarding/
    _layout.tsx
    index.tsx             # welcome + frame
    baseline.tsx          # set baseline (frequency, trigger guess)
    first-rep.tsx         # guaranteed first win
src/
  store/
    useAppStore.ts        # Zustand store (reps, sessions, dangerMap, settings)
  domain/
    types.ts              # all shared types (see §3)
    reps.ts               # pure logic: addRep, conditioningLevel, dangerMap
  components/             # reusable UI (Button, MetricBlock, BreathRing, ...)
  theme/
    theme.ts              # colors, spacing, type scale (DESIGN.md)
  lib/
    storage.ts            # AsyncStorage wrapper
assets/
docs/
```

## 3. Data model (TypeScript)

```ts
// src/domain/types.ts

export type Vertical = 'porn'; // MVP single vertical; enum for future expansion

export type RepType = 'intervention' | 'slip';

export interface RepEvent {
  id: string;            // uuid
  type: RepType;         // 'intervention' = rode the urge; 'slip' = acted on it
  createdAt: number;     // Date.now()
  trigger?: string;      // selected/typed in autopsy (e.g. 'bored', 'late night', 'argument')
  feeling?: string;      // named affect (e.g. 'lonely', 'stressed')
  note?: string;         // optional free text
}

export interface Settings {
  vertical: Vertical;
  baselineFrequencyPerWeek?: number; // from onboarding, for "money/time saved" math later
  onboardedAt?: number;
  crisisDismissedAt?: number;
}

export interface AppState {
  reps: RepEvent[];                 // append-only log; the source of truth
  settings: Settings;
  // derived (computed, not stored): selfAwarenessReps, conditioningLevel, dangerMap
}
```

### Derived values (pure functions, never stored)
- `selfAwarenessReps = reps.length` — the monotonic anti-streak metric.
- `conditioningLevel(reps)` — gamified level from rep count + recency decay (see F8 spec).
- `dangerMap(reps)` — frequency map of `trigger` across slip events, sorted desc.

**Invariant:** `reps` is append-only. Nothing deletes or resets it. This is what makes
the metric "only go up" and what kills shame-churn. Agents must not add a reset path.

## 4. State management contract

```ts
// src/store/useAppStore.ts — Zustand + persist
interface Store extends AppState {
  addIntervention(): void;                 // append RepEvent{type:'intervention'}
  logSlip(input: { trigger?: string; feeling?: string; note?: string }): void;
  setBaseline(freqPerWeek: number): void;
  completeOnboarding(): void;
}
```

- Persist the whole store to AsyncStorage under key `trojan-horse/v1`.
- Migrations: include a `version` field in persisted state for future schema changes.

## 5. AI check-in proxy (v1.1, do NOT build into client directly)

- Client calls our backend (Supabase edge function), never Anthropic directly.
- Backend holds `ANTHROPIC_API_KEY`, injects the system prompt + memory, calls Claude.
- Default model: **Anthropic Claude** (use the latest available; a fast tier such as
  Claude Sonnet for cost/latency in chat, escalate for harder reflective turns).
  Confirm exact model id at build time against current Anthropic docs.
- Memory: send a compact rolling summary + recent reps/dangerMap, not full history.
- See `docs/specs/ai-checkin.md`.

## 6. Conventions for agents

- TypeScript strict; no `any`. Run `npx tsc --noEmit` before considering a task done.
- Keep domain logic pure and in `src/domain/` (testable without RN).
- No new heavy dependencies without updating this file + a note in the PR.
- Every screen reads from the store via selectors; no prop-drilling of global state.
- Respect product principles in PRD §4 — especially: no "therapy" language, no reset path.
