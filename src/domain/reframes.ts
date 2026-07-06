// src/domain/reframes.ts
// The reframe lines shown during the urge intervention (F1). Coach voice, no
// clinical language (DESIGN.md banned-words rule).

export const REFRAMES = [
  'The urge is a wave. You are not the wave. Ride it; it crests in 90 seconds.',
  'What are you actually feeling right now — under the urge? Name it.',
  'Future you, ten minutes from now: which choice makes him respect you more?',
  'This is a rep. Every rep makes the next urge weaker. You are training.',
] as const;

/** Deterministic selection by rep count, per spec F1 (`reps % REFRAMES.length`). */
export function reframeFor(repCount: number): string {
  return REFRAMES[repCount % REFRAMES.length];
}
