// src/domain/checkin.ts
// Pure logic for the AI late-night check-in (F6) and the Future-Self Anchor (F6a).
// No RN or network imports — unit-testable.

import { dangerMap } from './reps';
import type {
  CheckInContext,
  FutureSelf,
  RepEvent,
} from './types';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
const ANCHOR_MIN_REPS = 5; // F6a: some positive momentum before we ask
const RECENT_REP_CAP = 20; // cap the recent slice we send as context

/** Was the most recent event a slip? Gates anchor capture and shapes tone. */
export function lastEventWasSlip(reps: readonly RepEvent[]): boolean {
  const last = reps[reps.length - 1];
  return last?.type === 'slip';
}

/**
 * Should we offer to capture the Future-Self Anchor right now? (F6a)
 * Only on a positive moment: enough momentum, not during onboarding, and NEVER
 * right after a slip (capturing it in shame poisons it). Never re-offer once set.
 */
export function shouldOfferAnchorCapture(
  reps: readonly RepEvent[],
  futureSelf: FutureSelf | undefined,
  onboarded: boolean,
): boolean {
  if (!onboarded) return false;
  if (futureSelf) return false; // already captured
  if (reps.length < ANCHOR_MIN_REPS) return false;
  if (lastEventWasSlip(reps)) return false; // not in the shame moment
  return true;
}

/**
 * Build the compact context sent to the proxy (F6). Deliberately small: a summary,
 * the last ~7 days of reps (capped), the top danger zones, and the anchor — never
 * full history. `now` is injected for testability.
 */
export function buildCheckinContext(
  reps: readonly RepEvent[],
  futureSelf: FutureSelf | undefined,
  priorSummary: string | undefined,
  vertical: CheckInContext['vertical'],
  now: number,
): CheckInContext {
  const cutoff = now - SEVEN_DAYS_MS;
  const recentReps = reps
    .filter((r) => r.createdAt >= cutoff)
    .slice(-RECENT_REP_CAP)
    .map((r) => ({
      type: r.type,
      createdAt: r.createdAt,
      trigger: r.trigger,
      feeling: r.feeling,
    }));

  return {
    vertical,
    selfAwarenessReps: reps.length,
    recentReps,
    dangerZones: dangerMap(reps).slice(0, 3),
    anchor: futureSelf
      ? { statements: futureSelf.statements, name: futureSelf.name }
      : undefined,
    priorSummary,
    lastEventWasSlip: lastEventWasSlip(reps),
  };
}

// --- Crisis detection (client-side pre-check) ---------------------------------
// A conservative first line: if the user's own words signal crisis/self-harm, we
// bypass the coach persona entirely and surface resources (F6 guardrail). The
// server prompt has the same instruction; this pre-check means we never even send
// such a message to the model. Intentionally high-recall (better a false positive
// that shows a helpline than a missed real one).
const CRISIS_PATTERNS: RegExp[] = [
  /\bkill(?:ing)?\s+my\s?self\b/i,
  /\bend(?:ing)?\s+(?:it|my life)\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bno\s+reason\s+to\s+live\b/i,
  /\bhurt(?:ing)?\s+my\s?self\b/i,
  /\bself[-\s]?harm\b/i,
  /\bcan'?t\s+go\s+on\b/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((re) => re.test(text));
}

// US-centric default; a real launch localizes this. Kept in domain so the UI and
// the crisis path share one source of truth.
export interface CrisisResource {
  label: string;
  detail: string;
  action: string; // tel: or sms: or https:
}

export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    label: '988 Suicide & Crisis Lifeline',
    detail: 'Call or text 988 — 24/7, free, confidential.',
    action: 'tel:988',
  },
  {
    label: 'Crisis Text Line',
    detail: 'Text HOME to 741741.',
    action: 'sms:741741',
  },
];
