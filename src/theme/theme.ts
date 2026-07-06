// src/theme/theme.ts
// Design tokens — the single source of truth for color, type, and spacing.
// See docs/DESIGN.md. Screens/components must consume these, never hardcode.

export const color = {
  bg: '#0d0f12', // near-black base
  surface: '#161a1f', // cards
  surfaceAlt: '#1f2937', // muted/disabled
  textHi: '#f2f4f7', // primary text / hero numbers
  textMid: '#c2cad3', // body
  textLow: '#7c8794', // labels/captions
  urge: '#e5484d', // the urge button — the ONLY red; high-intent
  affirm: '#2f6f4f', // completion / positive
  accent: '#3b82f6', // sparing interactive accent
} as const;

// Font weights typed to RN's accepted string literals so tokens spread cleanly
// into TextStyle without `any`.
type FontWeight = '400' | '700' | '800';

export const type = {
  hero: { fontSize: 88, fontWeight: '800' as FontWeight }, // the metric number
  timer: { fontSize: 96, fontWeight: '800' as FontWeight },
  title: { fontSize: 24, fontWeight: '700' as FontWeight },
  body: { fontSize: 17, fontWeight: '400' as FontWeight, lineHeight: 24 },
  label: { fontSize: 13, fontWeight: '700' as FontWeight, letterSpacing: 2 }, // uppercase labels
  caption: { fontSize: 13, fontWeight: '400' as FontWeight },
} as const;

// 4-pt base scale
export const space = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 28,
  xxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  pill: 999,
} as const;

export const theme = { color, type, space, radius } as const;
export type Theme = typeof theme;
