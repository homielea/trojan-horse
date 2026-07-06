// src/components/Chip.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import { color, radius, space, type } from '../theme/theme';

interface Props {
  label: string;
  selected?: boolean;
  onPress: () => void;
}

/** Selectable pill for autopsy triggers/feelings (F3). */
export function Chip({ label, selected = false, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        selected && styles.selected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    paddingVertical: space.sm,
    paddingHorizontal: space.md,
    borderRadius: radius.pill,
    backgroundColor: color.surface,
    borderWidth: 1,
    borderColor: color.surfaceAlt,
    justifyContent: 'center',
  },
  selected: { backgroundColor: color.accent, borderColor: color.accent },
  pressed: { opacity: 0.85 },
  label: { ...type.body, color: color.textMid },
  selectedLabel: { color: '#fff', fontWeight: '700' },
});
