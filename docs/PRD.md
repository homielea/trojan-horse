# Trojan Horse — Product Requirements Document

> Status: v0 (MVP definition). Codename "Trojan Horse" — rename before launch.
> Audience: AI build agents + founder. This is the source of truth for *what* we build and *why*.

## 1. One-liner

A "quit the habit" app for men that fixes the habit by quietly building emotional
regulation — therapy's results, none of therapy's branding.

## 2. The problem & insight

Men won't search "therapy" — they search the shameful, performance-coded symptom.

- ~30,749 men/mo search "porn addiction help" (US's #1 addiction help-search, ~3× alcohol).
- "Therapy for men" searches +42%, yet only ~17% of men are in any treatment; male suicide ~4× female.
- Peer-reviewed (BPS): coaching/performance framing increases male engagement vs. clinical framing.

**Wedge:** enter through the shameful habit (the door he'll walk through), deliver
emotional-regulation skills disguised as discipline training.

## 3. Target user (MVP)

Men 22–40 caught in a porn/compulsive-use loop, who would never book a therapist but
will install a "beat the habit" app at 11pm during an urge. Entry frame = behavioral/
performance. Real problem = unregulated stress, shame, isolation.

**Anti-persona (do not build for):** users seeking clinical treatment, women, multi-
addiction case management. Out of scope for MVP.

## 4. Product principles (non-negotiable)

1. **Never say "therapy," "mental health," or "patient."** Voice = coach/friend, not clinician.
2. **Shame is the enemy of retention.** Every flow must reduce shame, never inflict it.
3. **The metric only goes up.** No zeroing streaks. Slips are data, not failure.
4. **Performance framing.** Inner work is presented as a trainable stat, like a lift PR.
5. **Privacy is a feature.** Local-first; nothing requires a real name; sensitive by design.

## 5. MVP scope (the only things we build first)

| # | Feature | Why it's in MVP |
|---|---------|-----------------|
| F1 | **Urge loop** — urge button → 60s guided intervention (breath + one reframe) | The core loop; the reason to open the app |
| F2 | **Anti-streak metric** — "self-awareness reps," monotonic, slips count too | The signature differentiator vs. every NoFap app |
| F3 | **Relapse autopsy + danger map** — 60s post-slip debrief → personal trigger map | Turns shame into insight; powers personalization |
| F4 | **Onboarding** — frictionless, shame-free, sets baseline + first rep | First 60s decides activation |
| F5 | **Local persistence** — all data on-device (AsyncStorage) | Privacy + works offline; no backend needed for v1 |

### Fast-follow (v1.1, specced but not MVP)
- F6 **AI late-night check-in** (signature retention; needs backend + Claude API)
- F7 **Paywall / subscription** (gym-framed; RevenueCat)
- F8 **Conditioning level** (gamified aggregate of reps + recency decay)

### Explicitly out of scope (v1)
Community/feed, multi-vertical (vaping/gambling), content library, clinician referral,
cloud sync/accounts, web app.

## 6. Success metrics

| Metric | Target (directional) | Why |
|--------|----------------------|-----|
| Activation: completes onboarding + 1st rep | ≥ 60% of installs | First-session value |
| D1 / D7 retention | ≥ 40% / ≥ 20% | Loop is habit-forming |
| Avg reps logged / WAU / week | ≥ 4 | Core loop engagement |
| Slip-after-slip retention (did they stay post-slip?) | ≥ 70% | Anti-shame mechanic works |
| (v1.1) Trial → paid | ≥ 5% | Willingness to pay |

## 7. Key risks → mitigations

1. **App Store rejection** (porn-adjacent framing) → list as "self-control/focus/discipline,"
   no explicit content, no "porn" in store title; validate approval before heavy build.
2. **Demand is positioning not need** (Calm/Hims compete adjacently) → moat = male framing + anti-streak.
3. **Episodic use** (churn when "cured") → identity framing + AI check-in must outlive the habit.
4. **Duty of care** (distress/crisis) → always-available crisis resource link; never diagnose.

## 8. Open questions (founder to decide)

- Final product name + bundle ID.
- Pricing exact ($9.99/mo, $59/yr assumed).
- Which model powers the AI check-in (see ARCHITECTURE.md — default Anthropic Claude).
- Backend choice for v1.1 (Supabase assumed).
