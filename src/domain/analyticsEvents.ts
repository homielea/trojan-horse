// src/domain/analyticsEvents.ts
// The analytics event taxonomy. Pure constants + prop types — no deps.
//
// These are the raw events; the PRD §6 success metrics are DERIVED from them in
// PostHog (funnels / retention / trends), not computed on-device:
//
//   Activation (onboarding + 1st rep) ← ONBOARDING_COMPLETED → REP_LOGGED funnel
//   D1 / D7 retention                 ← APP_OPENED (retention on distinct anon id)
//   Avg reps / WAU / week             ← REP_LOGGED trend
//   Slip-after-slip retention         ← SLIP_LOGGED → later APP_OPENED/REP_LOGGED
//   Trial → paid                      ← PAYWALL_VIEWED → SUBSCRIPTION_STARTED funnel
//
// PRIVACY (PRD §4): no PII, ever. No trigger/feeling/note text, no transcripts —
// only coarse, non-identifying counts and types. Analytics is opt-out.

export const AnalyticsEvent = {
  APP_OPENED: 'app_opened',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  REP_LOGGED: 'rep_logged',
  SLIP_LOGGED: 'slip_logged',
  CHECKIN_COMPLETED: 'checkin_completed',
  PAYWALL_VIEWED: 'paywall_viewed',
  SUBSCRIPTION_STARTED: 'subscription_started',
} as const;

export type AnalyticsEventName =
  (typeof AnalyticsEvent)[keyof typeof AnalyticsEvent];

// Only non-identifying, low-cardinality props are allowed.
export type AnalyticsProps = Record<
  string,
  string | number | boolean | undefined
>;
