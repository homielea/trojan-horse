// src/components/UrgeSession.tsx
// The guided urge intervention body (F1), reused by the intervention route and by
// the onboarding "first rep" (F4) with a shorter timer. Pure UI + a local timer;
// it does NOT itself write to the store — the parent decides what completion means
// (so leaving early can log nothing, per F1).
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Button } from './Button';
import { BreathRing } from './BreathRing';
import { color, space, type } from '../theme/theme';

interface Props {
  seconds: number;
  reframe: string;
  onComplete: () => void;
  doneLabel?: string;
}

export function UrgeSession({
  seconds,
  reframe,
  onComplete,
  doneLabel = 'Logged. That was a rep.',
}: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          timer.current = null;
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    // Cleanup on unmount — leaving early (back gesture) stops the timer and,
    // because the parent only logs in onComplete, records nothing (F1).
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const done = remaining === 0;

  return (
    <View style={styles.screen}>
      <BreathRing seconds={remaining} />
      <Text style={styles.reframe}>{reframe}</Text>
      <Button
        label={done ? doneLabel : 'Breathe. Stay with it.'}
        variant="affirm"
        disabled={!done}
        onPress={onComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.xl,
    backgroundColor: color.bg,
  },
  reframe: {
    ...type.body,
    fontSize: 20,
    lineHeight: 28,
    color: color.textMid,
    textAlign: 'center',
  },
});
