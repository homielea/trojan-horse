// src/components/BreathRing.tsx
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { color, type } from '../theme/theme';

interface Props {
  /** Number rendered in the center (the countdown seconds). */
  seconds: number;
  size?: number;
}

const IN_MS = 4000; // ~4s inhale
const OUT_MS = 4000; // ~4s exhale
const MIN_SCALE = 0.72;

/**
 * Expand/contract breathing ring for the urge intervention (F1).
 * Pure visual — drives no state, logs nothing. Loops a 4s-in / 4s-out cycle and
 * swaps the "Breathe in / Breathe out" cue in step with the animation.
 */
export function BreathRing({ seconds, size = 240 }: Props) {
  const scale = useRef(new Animated.Value(MIN_SCALE)).current;
  const phase = useRef(new Animated.Value(0)).current; // 0 = out, 1 = in

  useEffect(() => {
    const cycle = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(scale, {
            toValue: 1,
            duration: IN_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(phase, {
            toValue: 1,
            duration: IN_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(scale, {
            toValue: MIN_SCALE,
            duration: OUT_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(phase, {
            toValue: 0,
            duration: OUT_MS,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    cycle.start();
    return () => cycle.stop();
  }, [scale, phase]);

  const inOpacity = phase; // 1 while inhaling
  const outOpacity = phase.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Animated.View
        style={[
          styles.ring,
          { width: size, height: size, borderRadius: size / 2 },
          { transform: [{ scale }] },
        ]}
      />
      <View style={styles.center} pointerEvents="none">
        <Text style={styles.seconds}>{seconds}</Text>
        <View style={styles.cueRow}>
          <Animated.Text style={[styles.cue, { opacity: inOpacity }]}>
            Breathe in
          </Animated.Text>
          <Animated.Text style={[styles.cue, styles.cueOut, { opacity: outOpacity }]}>
            Breathe out
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: color.accent,
    backgroundColor: 'rgba(59,130,246,0.08)',
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  seconds: { ...type.timer, color: color.textHi },
  cueRow: { height: 22, justifyContent: 'center' },
  cue: {
    ...type.label,
    color: color.textLow,
    position: 'absolute',
    alignSelf: 'center',
    width: 120,
    textAlign: 'center',
  },
  cueOut: {},
});
