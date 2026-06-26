# Trojan Horse

> A "quit the habit" app for men that fixes the habit by quietly building emotional
> regulation — therapy's results, none of therapy's branding.

**Codename.** Rename freely.

## The insight

Men won't search "therapy" — they search the shameful, performance-coded symptom.
~30,749 men/mo search "porn addiction help" (the US's #1 addiction help-search, ~3×
alcohol); "therapy for men" is up +42%, yet only ~17% of men are in any treatment.
The shameful habit is the unlocked side door into the male emotional interior. We
enter through the symptom and treat the human.

## Positioning

- **Storefront category:** habit-quitting / self-control — *not* a mental-health app.
- **Voice:** coach, not clinician. Performance framing (which the BPS found measurably
  increases male engagement vs. clinical language).
- **Against:** Headspace/Calm (too soft, gender-neutral), Hims (clinical/Rx),
  NoFap apps (pure willpower, no emotional layer, no moat).
- **Closest competitor:** Mettle — the only men's emotional pure-play, modestly funded.

## The Trojan mechanism

Marketed surface = streak + urge-button + discipline tracker. Underneath, every core
loop *is* a clinical technique, never named as such.

| He sees | He's actually doing |
|---|---|
| "Log the urge" | Trigger identification (CBT) |
| "60-sec autopsy after a slip" | Non-judgmental relapse processing → kills shame-churn |
| "Conditioning level" stat | Emotional regulation as a trainable, gamified metric |
| "11pm check-in" with AI | Naming affect + reducing isolation |

## MVP scope (~8–10 weeks)

1. **One quit-vertical only** (start with the loudest: porn).
2. **Urge button → 60-second guided intervention** (breathwork + one reframe). The core loop.
3. **Anti-streak counter:** slips don't reset to zero; logging a slip *advances* a
   self-awareness metric. Signature differentiator — build first.
4. **One AI late-night check-in/day**, with memory, coach-not-therapist voice.
5. Cut for v1: community/feed, multi-vertical, content library.

## Monetization

Gym-framed subscription (~$9.99/mo, $59/yr). Loss-aversion retention ("conditioning
decays" when reps are missed). Proof point: Quittr (porn, bootstrapped) hit ~$250K MRR
in ~4 months.

## Go-to-market

- **Wedge keyword:** "how to stop watching porn" / "porn addiction help" — highest-intent
  male emotional-distress search that routes around "therapy." Own via SEO + content engine.
- **Secondary:** male-wellness creator ecosystem (Huberman-adjacent). Low CAC.
- Avoid paid social on these keywords (ad-policy landmine) — lean SEO + creator + ASO.

## Top risks

1. App Store category sensitivity (porn-adjacent listings) → validate listing approval first.
2. Demand is positioning, not need → moat is the male framing + anti-streak mechanic.
3. Episodic use → AI check-in + identity ("becoming disciplined") must outlive the habit.

## Validate before building

1. Confirm App Store listing approval for the framing.
2. Run the 3 wedge terms through Google Keyword Planner for real US volumes.
3. Smoke-test: landing page on the wedge keyword + email capture before writing app code.

---

## Tech

Expo (SDK 56) + React Native + TypeScript.

```bash
npm install
npm run ios      # or: npm run android / npm run web
```

`App.tsx` ships a runnable skeleton of the core loop: the anti-streak
"self-awareness reps" counter, the urge button, and the 60-second intervention.
