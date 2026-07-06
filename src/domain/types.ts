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
}

export interface AppState {
  reps: RepEvent[]; // append-only log; the source of truth
  settings: Settings;
  // derived (computed, not stored): selfAwarenessReps, conditioningLevel, dangerMap
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
