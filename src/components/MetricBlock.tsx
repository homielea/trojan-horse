// src/components/MetricBlock.tsx
import { StyleSheet, Text, View } from 'react-native';
import { color, space, type } from '../theme/theme';

interface Props {
  value: number | string;
  label: string;
  sub?: string;
}

/** Hero number + uppercase label + optional subtext. The Home centerpiece (F2). */
export function MetricBlock({ value, label, sub }: Props) {
  return (
    <View style={styles.block}>
      <Text style={styles.number} accessibilityRole="text">
        {value}
      </Text>
      <Text style={styles.label}>{label.toUpperCase()}</Text>
      {sub ? <Text style={styles.sub}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  block: { alignItems: 'center', gap: space.xs, marginBottom: space.md },
  number: { ...type.hero, color: color.textHi },
  label: { ...type.label, color: color.textLow },
  sub: { ...type.caption, color: color.textLow, marginTop: space.xs },
});
