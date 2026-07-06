// src/domain/reps.ts
// Pure domain logic over the append-only RepEvent log. No RN imports — unit-testable.
//
// INVARIANT (PRD §4, spec F2): `reps` is append-only. There is deliberately NO
// remove/reset/decrement helper in this module. Do not add one.

import type {
  Conditioning,
  ConditioningTrend,
  DangerZone,
  RepEvent,
  RepType,
} from './types';

/**
 * Append a new RepEvent to the log, returning a NEW array (never mutates input).
 * `id` and `createdAt` are injected by the caller (store) so this stays pure and
 * deterministic — see ARCHITECTURE §3 (expo-crypto randomUUID, Date.now()).
 */
export function addRep(
  reps: readonly RepEvent[],
  event: RepEvent,
): RepEvent[] {
  return [...reps, event];
}

/** The monotonic anti-streak metric (F2): interventions + slips both count. */
export function selfAwarenessReps(reps: readonly RepEvent[]): number {
  return reps.length;
}

/**
 * Frequency map of `trigger` across slip events, ranked desc (F3).
 * Only slips with a recorded trigger contribute. Ties broken by first-seen order
 * for stable, deterministic output.
 */
export function dangerMap(reps: readonly RepEvent[]): DangerZone[] {
  const counts = new Map<string, number>();
  for (const rep of reps) {
    if (rep.type !== 'slip' || !rep.trigger) continue;
    counts.set(rep.trigger, (counts.get(rep.trigger) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([trigger, count]) => ({ trigger, count }))
    .sort((a, b) => b.count - a.count);
}

/** Count of slips that carry a trigger — gates when the Danger Map appears (F3: ≥3). */
export function triggeredSlipCount(reps: readonly RepEvent[]): number {
  return reps.reduce(
    (n, r) => (r.type === 'slip' && r.trigger ? n + 1 : n),
    0,
  );
}

// --- Conditioning level (F8) -------------------------------------------------
// The dynamic, decaying engagement number. Distinct from the permanent F2 count:
// decay affects level/XP ONLY, never the self-awareness count.
//
// Chosen constants (documented per spec F8):
//   - An intervention (rode the urge) is worth more than a slip-log, but both are
//     strictly positive — logging a slip is honest work, never punished.
//   - Recency: each event's weight decays with a 14-day half-life, so lapsing
//     visibly lowers the level ("use it or lose it") without shame language.
//   - level = floor(sqrt(xp / K)); K tuned so ~a week of daily reps ≈ level 3–4.
const EVENT_WEIGHT: Record<RepType, number> = {
  intervention: 10,
  slip: 6,
};
const HALF_LIFE_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const LEVEL_K = 12; // curve constant

function recencyFactor(ageMs: number): number {
  if (ageMs <= 0) return 1;
  return Math.pow(0.5, ageMs / HALF_LIFE_MS);
}

function xpToLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / LEVEL_K));
}

function levelToXp(level: number): number {
  return level * level * LEVEL_K;
}

/**
 * Compute the conditioning level from the rep log as of `now`.
 * `trend` compares decayed XP now vs. what it was ~7 days ago: are you building
 * momentum, holding, or lapsing?
 */
export function conditioningLevel(
  reps: readonly RepEvent[],
  now: number,
): Conditioning {
  let xp = 0;
  let xpWeekAgo = 0;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  for (const rep of reps) {
    const weight = EVENT_WEIGHT[rep.type];
    xp += weight * recencyFactor(now - rep.createdAt);
    if (rep.createdAt <= weekAgo) {
      xpWeekAgo += weight * recencyFactor(weekAgo - rep.createdAt);
    }
  }

  const level = xpToLevel(xp);
  const nextLevelXp = levelToXp(level + 1);
  const toNext = Math.max(0, Math.ceil(nextLevelXp - xp));

  let trend: ConditioningTrend = 'flat';
  if (xp > xpWeekAgo * 1.05) trend = 'up';
  else if (xp < xpWeekAgo * 0.95) trend = 'down';

  return { level, xp: Math.round(xp), toNext, trend };
}
