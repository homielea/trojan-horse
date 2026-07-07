// src/lib/analytics.ts
// Privacy-first analytics (PRD §4/§6). The app calls `analytics.capture(...)`;
// this module decides whether anything actually leaves the device.
//
// ── PostHog integration boundary ─────────────────────────────────────────────
// PostHog is privacy-friendly and self-hostable (ARCHITECTURE §1). Add
// `posthog-react-native` in a dev build and implement the two marked spots:
//   init():    new PostHog(EXPO_PUBLIC_POSTHOG_KEY, { host: EXPO_PUBLIC_POSTHOG_HOST })
//   send():    client.capture(name, props)
// We never call identify() with a real identifier — PostHog's anonymous distinct
// id is enough for the §6 retention/funnel metrics, and keeps us PII-free.
// Until wired, capture() is a no-op (or a dev console log). It is ALSO a no-op
// whenever the user has opted out. Both gates are checked on every call.
// ─────────────────────────────────────────────────────────────────────────────

import type { AnalyticsEventName, AnalyticsProps } from '../domain/analyticsEvents';

const POSTHOG_KEY = process.env.EXPO_PUBLIC_POSTHOG_KEY ?? '';
const DEV_LOG = process.env.EXPO_PUBLIC_ANALYTICS_DEBUG === '1';

export function analyticsConfigured(): boolean {
  return POSTHOG_KEY.length > 0;
}

class Analytics {
  private optedOut = false;

  /** Synced from persisted settings (see useAnalyticsSync). Opt-out wins. */
  setOptOut(optedOut: boolean): void {
    this.optedOut = optedOut;
  }

  capture(name: AnalyticsEventName, props?: AnalyticsProps): void {
    if (this.optedOut) return;
    if (DEV_LOG) console.log('[analytics]', name, props ?? {});
    if (!analyticsConfigured()) return;
    // TODO(PostHog): client.capture(name, props)
  }
}

export const analytics = new Analytics();
