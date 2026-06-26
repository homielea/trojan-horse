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
