// src/components/ConditioningBadge.tsx
// F8 display: the dynamic, decaying engagement number. Distinct from the permanent
// self-awareness count (F2) — this one is meant to drop when you lapse ("use it or
// lose it"), which is the pull to come back. No shame language.
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Conditioning } from '../domain/types';
import { color, radius, space, type } from '../theme/theme';

interface Props {
  conditioning: Conditioning;
  onPress?: () => void;
}

const TREND_COPY: Record<Conditioning['trend'], { arrow: string; word: string; tone: string }> = {
  up: { arrow: '↑', word: 'Building', tone: color.affirm },
  flat: { arrow: '→', word: 'Holding', tone: color.textLow },
  down: { arrow: '↓', word: 'Cooling off', tone: color.accent },
};

export function ConditioningBadge({ conditioning, onPress }: Props) {
  const { level, xp, toNext, trend } = conditioning;
  const spanXp = xp + toNext; // xp accumulated within the current level band + remaining
  const progress = spanXp > 0 ? Math.min(1, xp / spanXp) : 0;
  const t = TREND_COPY[trend];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>CONDITIONING</Text>
          <Text style={styles.level}>Level {level}</Text>
        </View>
        <Text style={[styles.trend, { color: t.tone }]}>
          {t.arrow} {t.word}
        </Text>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(progress * 100)}%` }]} />
      </View>
      <Text style={styles.sub}>
        {toNext > 0 ? `${toNext} XP to level ${level + 1}` : 'Maxed for now — keep showing up'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: space.lg,
    width: '100%',
    gap: space.sm,
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  label: { ...type.label, color: color.textLow },
  level: { ...type.title, color: color.textHi, marginTop: space.xs },
  trend: { ...type.label, letterSpacing: 1 },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: color.surfaceAlt,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: radius.pill, backgroundColor: color.accent },
  sub: { ...type.caption, color: color.textLow },
});
