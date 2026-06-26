# AGENTS.md — how to build in this repo

You are an AI build agent working on **Trojan Horse**, an Expo (SDK 56) + React Native +
TypeScript app. Read this fully before writing code.

## Read these first (source of truth)
1. `docs/PRD.md` — what we're building and the non-negotiable product principles.
2. `docs/ARCHITECTURE.md` — stack, folder structure, data model, conventions.
3. `docs/BACKLOG.md` — the ordered tickets. Work top-to-bottom.
4. `docs/specs/*` — the spec for whatever feature you're building. Match its acceptance criteria.
5. `docs/DESIGN.md` — visual system + the BANNED-words copy rules.
6. Expo SDK 56 docs: https://docs.expo.dev/versions/v56.0.0/ — this version differs from training data.

## Hard rules (do not violate)
- **No "therapy" language.** Banned in all UI copy: therapy, therapist, mental health,
  patient, disorder, "days clean," relapse-as-failure. We are a *discipline/training* app. (PRD §4, DESIGN.md)
- **The self-awareness metric only goes up.** `reps` is append-only. Never add a reset,
  clear, or decrement path. Slips increment the metric. (spec F2)
- **Never paywall the urge loop.** Safety + retention. (spec F7)
- **No API keys in the client.** The AI check-in calls a backend proxy, never Anthropic directly. (spec F6)
- **TypeScript strict, no `any`.** Run `npx tsc --noEmit` before declaring a task done.

## Workflow per ticket
1. Open the ticket in `docs/BACKLOG.md` and its linked spec.
2. Implement per `docs/ARCHITECTURE.md` structure (domain logic pure in `src/domain/`).
3. Verify against the spec's acceptance-criteria checklist.
4. `npx tsc --noEmit` must pass.
5. Keep dependencies minimal; if you add one, update `docs/ARCHITECTURE.md` and note it.

## Run
```bash
npm install
npm run ios   # or android / web
npx tsc --noEmit
```

The current `App.tsx` is a single-file skeleton of the core loop (F1+F2). T-002 migrates
it into the `app/`-router structure; after that, screens live in `app/` per ARCHITECTURE.md.
