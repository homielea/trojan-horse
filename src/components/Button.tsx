// src/components/Button.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { color, radius, space, type } from '../theme/theme';

type Variant = 'urge' | 'affirm' | 'ghost';

interface Props {
  label: string;
  onPress: () => void;
  variant?: Variant;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * The one button component.
 *   - urge:   loud red, the only high-intent element on Home.
 *   - affirm: green completion / positive.
 *   - ghost:  text-only, low-key (e.g. the "I slipped" entry — never shouts).
 */
export function Button({
  label,
  onPress,
  variant = 'affirm',
  disabled = false,
  style,
}: Props) {
  const isGhost = variant === 'ghost';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        variant === 'urge' && styles.urge,
        variant === 'affirm' && styles.affirm,
        isGhost && styles.ghost,
        disabled && !isGhost && styles.disabled,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.label,
          isGhost ? styles.ghostLabel : styles.solidLabel,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56, // spec F1: min 56px touch target
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
  },
  urge: { backgroundColor: color.urge },
  affirm: { backgroundColor: color.affirm },
  ghost: {
    backgroundColor: 'transparent',
    minHeight: 44,
    paddingVertical: space.sm,
  },
  disabled: { backgroundColor: color.surfaceAlt },
  pressed: { opacity: 0.85 },
  label: { ...type.title, fontSize: 18 },
  solidLabel: { color: '#fff' },
  ghostLabel: { color: color.textLow, ...type.body },
});
