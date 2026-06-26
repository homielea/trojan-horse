# Trojan Horse — Design System

> Aesthetic: calm-confident, masculine, dark, premium. Think "performance app" (Whoop,
> Huberman-adjacent), not "wellness app" (pastel, lowercase, lotus flowers). No clinical
> blue. No infantilizing illustrations.

## Principles
- Dark-first. Big confident numbers. Lots of negative space. One accent at a time.
- Calm by default; the urge button is the one loud element on the screen.
- Type does the work; minimal chrome. No gradients-as-decoration.

## Color tokens
```ts
// src/theme/theme.ts
export const color = {
  bg:        '#0d0f12', // near-black base
  surface:   '#161a1f', // cards
  surfaceAlt:'#1f2937', // muted/disabled
  textHi:    '#f2f4f7', // primary text / hero numbers
  textMid:   '#c2cad3', // body
  textLow:   '#7c8794', // labels/captions
  urge:      '#e5484d', // the urge button — the ONLY red; high-intent
  affirm:    '#2f6f4f', // completion / positive
  accent:    '#3b82f6', // sparing interactive accent
} as const;
```

## Type scale
```ts
export const type = {
  hero:   { fontSize: 88, fontWeight: '800' }, // the metric number
  timer:  { fontSize: 96, fontWeight: '800' },
  title:  { fontSize: 24, fontWeight: '700' },
  body:   { fontSize: 17, fontWeight: '400', lineHeight: 24 },
  label:  { fontSize: 13, fontWeight: '700', letterSpacing: 2 }, // uppercase labels
  caption:{ fontSize: 13, fontWeight: '400' },
} as const;
```

## Spacing
4-pt base scale: `xs 4, sm 8, md 16, lg 24, xl 28, xxl 40`.

## Components to build (`src/components/`)
- `Button` — variants: `urge` (loud red), `affirm` (green), `ghost` (text-only, low-key, for "I slipped").
- `MetricBlock` — hero number + uppercase label + subtext.
- `BreathRing` — animated expand/contract circle for the intervention timer.
- `Chip` — selectable pill for autopsy triggers/feelings.
- `Card` — surface container for Danger Map / insights.

## Voice & copy rules
- Coach/friend, not clinician. Contractions. Short. A little dry humor.
- BANNED words in UI copy: therapy, therapist, mental health, patient, disorder, clean
  (as in "days clean"), relapse-as-failure, sober (clinical sense).
- Slips: always "data," never "failure." The number always "goes up."
- Example good: "That was a rep." / "No shame, it's data." / "Your danger zones."
- Example bad: "You broke your streak." / "Day 1 again." / "Let's heal together."
