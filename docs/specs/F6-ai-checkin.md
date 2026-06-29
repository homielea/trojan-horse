# Spec F6 — AI Late-Night Check-In (fast-follow, v1.1)

> The signature retention feature. One recurring, private, late-night conversation with an
> AI that talks like your sharpest friend three drinks in — not a therapist, not a chipper
> coach. It remembers you. It's the bar conversation men don't have anymore.

## Why
Demand proof: men absorb hours of confident male "optimization" talk (Huberman 300M+
downloads). Nobody turned that monologue into a *dialogue that knows you*. This is the
feature that makes the app outlive the original habit.

## User story
At ~11pm I get a nudge for my check-in. The AI asks how the day actually went, references
what I told it last time and my danger zones, calls out my excuses gently, and leaves me
with one thing to carry into tomorrow.

## Architecture (critical)
- Client → **our backend proxy** (Supabase edge function) → Anthropic Claude. NEVER call
  Anthropic from the client; the API key lives server-side only.
- Default to the latest Anthropic Claude model; use a fast tier for normal turns and
  escalate for harder reflective moments. Confirm exact model id against current docs at build.
- Context sent: compact rolling summary + last ~7 days of reps + top dangerMap entries.
  Do NOT send full history; summarize.
- Store each check-in as `{ id, date, transcript, summary }` (local for v1.1; backend later).

## Persona & guardrails (system prompt lives server-side)
- Voice: sharp, warm, direct male friend. Uses contractions, gets to the point, a little funny.
- Asks a real second question. Remembers specifics. Calls out avoidance without shaming.
- NEVER: diagnose, use clinical/therapy framing, moralize, or claim to be a therapist.
- If the user signals crisis/self-harm → drop the persona, surface crisis resources, stop coaching.

## Acceptance criteria
- [ ] No API key in the client bundle (verify).
- [ ] One check-in/day, opt-in nudge at a user-set evening time.
- [ ] AI references at least one concrete prior detail or danger-zone when available.
- [ ] Crisis-language path bypasses the persona and shows resources.
- [ ] Transcript + summary persisted; summary used as memory next time.

## Open questions
- Voice input? (defer)
- How long is a check-in (target 3–6 turns)?

---

## F6a — The Future-Self Anchor (core mechanic of the check-in)

> The check-in does NOT police the habit. Policing the behavior creates a new shame voice
> and men disengage. Instead, the AI anchors to the **man the user said he's becoming** and
> measures every night against *that*, not against a slip count. You fight a behavior and
> lose; you pursue an identity and win. The addiction is the current; the future self is
> the shore the AI keeps pointing at.

### Why (grounding)
Identity-based change outperforms behavior-suppression (self-discrepancy theory; identity-
based habit literature). Reframing from "stop doing X" to "become the man who wouldn't"
removes the shame loop (PRD §4) and gives the AI a non-naggy, non-clinical stance that
still drives change. It also gives the check-in a durable purpose *after* the original
habit fades — the retention answer to PRD risk #3 (episodic use).

### The anchor capture (one-time, early, on a GOOD night)
- Triggered after the user has some positive momentum (e.g. ≥5 self-awareness reps), NEVER
  during onboarding and NEVER right after a slip (capturing it in shame poisons it).
- The AI elicits, in his own words, a short portrait of the man he's becoming. Prompts like:
  "Forget the habit for a sec. A year from now, the version of you that's got this handled —
  what's different about his nights? What does he do at 11pm instead?"
- Capture 2–4 concrete, user-authored fragments (verbatim where possible). Store as the anchor.

### Data model addition
```ts
// extends src/domain/types.ts
export interface FutureSelf {
  capturedAt: number;
  statements: string[];   // user's own words, 2–4 short fragments
  name?: string;          // optional: what he calls this version of himself
  lastReferencedAt?: number;
}
// add to AppState: futureSelf?: FutureSelf
```

### How the AI uses the anchor (server-side prompt behaviour)
- The anchor `statements` are injected into the check-in system prompt every session.
- **After a slip:** never "you failed." Instead, gently invoke the anchor in the user's own
  words: e.g. "That's not really the guy who [his statement]. Where'd he go tonight?" Then a
  *second question* about what pulled him off course (links to F3 danger map).
- **On a good night:** affirm movement toward the anchor, specifically and concretely.
- The AI may, over time, gently propose evolving the anchor (with explicit user consent) —
  identities mature; the anchor should not become a stale stick to beat himself with.

### Guardrails
- Anchor must be **user-authored**, never AI-prescribed (no imposed ideal of manhood).
- Never weaponize the anchor as shame ("you're failing the man you wanted to be" is BANNED;
  "where'd he go tonight?" is curiosity, not condemnation — tone matters, enforce in prompt).
- If the anchor is empty (user skipped capture), the check-in still works; it just runs
  without the anchor frame and re-offers capture occasionally on good nights.
- Crisis path (above) overrides all anchor behaviour.

### Acceptance criteria
- [ ] Anchor capture triggers only on a positive moment; never during onboarding or post-slip.
- [ ] `FutureSelf.statements` are the user's own words, persisted, editable by the user.
- [ ] Post-slip check-ins reference the anchor as curiosity, never condemnation (review prompt + sample transcripts).
- [ ] Check-in functions correctly with no anchor set (graceful fallback + re-offer).
- [ ] Anchor is part of the compact context sent to the model (not full history).
- [ ] No BANNED words (DESIGN.md); no clinical framing.

### Backlog impact
- Update **T-010** to include anchor capture + storage + prompt integration.
- Add subtask: anchor capture trigger logic (gated on reps + "good night" heuristic).
- Add subtask: anchor edit screen (user can revise their own words anytime).
