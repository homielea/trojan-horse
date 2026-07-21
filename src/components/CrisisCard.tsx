// src/components/CrisisCard.tsx
// Shown when the crisis pre-check fires (F6 guardrail). Drops the coach persona
// entirely — no coaching, no metric talk — just direct routes to help.
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { CRISIS_RESOURCES } from '../domain/checkin';
import { Card } from './Card';
import { color, space, type } from '../theme/theme';

export function CrisisCard() {
  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Talk to someone now</Text>
      <Text style={styles.body}>
        This is heavier than a check-in. You don't have to carry it alone — reach
        one of these, right now.
      </Text>
      {CRISIS_RESOURCES.map((r) => (
        <Pressable
          key={r.label}
          onPress={() => {
            void Linking.openURL(r.action);
          }}
          style={({ pressed }) => [styles.row, pressed && styles.pressed]}
        >
          <Text style={styles.rowLabel}>{r.label}</Text>
          <Text style={styles.rowDetail}>{r.detail}</Text>
        </Pressable>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: space.md, borderWidth: 1, borderColor: color.urge },
  title: { ...type.title, color: color.textHi },
  body: { ...type.body, color: color.textMid },
  row: {
    borderTopWidth: 1,
    borderTopColor: color.surfaceAlt,
    paddingTop: space.sm,
    gap: 2,
  },
  pressed: { opacity: 0.8 },
  rowLabel: { ...type.body, color: color.accent, fontWeight: '700' },
  rowDetail: { ...type.caption, color: color.textLow },
});
