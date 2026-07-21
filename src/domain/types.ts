// src/domain/types.ts
// All shared domain types. See docs/ARCHITECTURE.md §3.

export type Vertical = 'porn'; // MVP single vertical; union for future expansion

export type RepType = 'intervention' | 'slip';

export interface RepEvent {
  id: string; // uuid
  type: RepType; // 'intervention' = rode the urge; 'slip' = acted on it
  createdAt: number; // Date.now()
  trigger?: string; // selected/typed in autopsy (e.g. 'Bored', 'Late night')
  feeling?: string; // named affect (e.g. 'Lonely', 'Stressed')
  note?: string; // optional free text
}

export interface Settings {
  vertical: Vertical;
  baselineFrequencyPerWeek?: number; // from onboarding, for "time saved" math later
  onboardedAt?: number;
  crisisDismissedAt?: number;
  checkinHour?: number; // user-set evening nudge hour (0–23); F6
  analyticsOptOut?: boolean; // privacy is a feature (PRD §4); T-012
}

// --- F6 AI late-night check-in ---
export type ChatRole = 'user' | 'assistant';

export interface CheckInMessage {
  role: ChatRole;
  content: string;
}

export interface CheckIn {
  id: string;
  date: number; // Date.now() at session start
  transcript: CheckInMessage[];
  summary?: string; // compact rolling memory, produced server-side
}

// --- F6a Future-Self Anchor ---
export interface FutureSelf {
  capturedAt: number;
  statements: string[]; // the user's own words, 2–4 short fragments
  name?: string; // optional: what he calls this version of himself
  lastReferencedAt?: number;
}

export interface AppState {
  reps: RepEvent[]; // append-only log; the source of truth
  settings: Settings;
  checkIns: CheckIn[]; // append-only log of check-in sessions
  futureSelf?: FutureSelf; // the anchor; absent until captured
  // derived (computed, not stored): selfAwarenessReps, conditioningLevel, dangerMap
}

// Compact context sent to the check-in proxy (never full history). F6/F6a.
export interface CheckInContext {
  vertical: Vertical;
  selfAwarenessReps: number;
  recentReps: { type: RepType; createdAt: number; trigger?: string; feeling?: string }[];
  dangerZones: DangerZone[];
  anchor?: { statements: string[]; name?: string };
  priorSummary?: string;
  lastEventWasSlip: boolean;
}

// Input accepted when logging a slip via the autopsy flow (F3).
export interface SlipInput {
  trigger?: string;
  feeling?: string;
  note?: string;
}

// A single ranked entry in the danger map (F3).
export interface DangerZone {
  trigger: string;
  count: number;
}

// Result of the conditioning-level computation (F8).
export type ConditioningTrend = 'up' | 'flat' | 'down';

export interface Conditioning {
  level: number;
  xp: number;
  toNext: number; // xp remaining to reach the next level
  trend: ConditioningTrend;
}
