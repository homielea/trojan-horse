// src/domain/entitlements.ts
// Pure free-vs-paid gating rules (F7). No RN or SDK imports — unit-testable.
//
// HARD RULE (F7 / AGENTS.md): the urge loop is NEVER gated. It's the safety loop.
// There is deliberately no gate function for F1/F2/F3 here — those are always free.
// What's gated is the *insight + companion* layer.

export const CHECKIN_FREE_LIFETIME = 3; // F7: 3 lifetime check-ins on free
export const DANGER_MAP_FREE_LIMIT = 1; // F7: free previews the top trigger only

/** How many danger zones to reveal. Free previews 1; paid sees all. */
export function dangerZoneLimit(isPro: boolean): number {
  return isPro ? Number.POSITIVE_INFINITY : DANGER_MAP_FREE_LIMIT;
}

/** Can the user start another check-in? Free gets a lifetime cap; paid unlimited. */
export function canStartCheckin(isPro: boolean, usedCount: number): boolean {
  return isPro || usedCount < CHECKIN_FREE_LIFETIME;
}

/** Check-ins left before the paywall (null = unlimited). Never negative. */
export function checkinsRemaining(
  isPro: boolean,
  usedCount: number,
): number | null {
  if (isPro) return null;
  return Math.max(0, CHECKIN_FREE_LIFETIME - usedCount);
}

/** Full conditioning insights (chart + breakdown) are paid; the level is free. */
export function canSeeFullInsights(isPro: boolean): boolean {
  return isPro;
}
