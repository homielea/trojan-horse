// src/components/Card.tsx
import { StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { color, radius, space } from '../theme/theme';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** Surface container for Danger Map / insights (F3, F8). */
export function Card({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: space.lg,
    width: '100%',
  },
});
