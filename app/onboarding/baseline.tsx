// app/onboarding/baseline.tsx — Baseline calibration (F4 step 2). Skippable.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip } from '../../src/components';
import { useAppStore } from '../../src/store/useAppStore';
import { color, space, type } from '../../src/theme/theme';

// Framed as calibration, not judgment. Value = approx times/week.
const OPTIONS: { label: string; value: number }[] = [
  { label: 'A few times a month', value: 2 },
  { label: 'About once a week', value: 1 },
  { label: 'A few times a week', value: 4 },
  { label: 'Most days', value: 6 },
  { label: 'Daily or more', value: 9 },
];

export default function Baseline() {
  const router = useRouter();
  const setBaseline = useAppStore((s) => s.setBaseline);
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<number | undefined>();

  const goNext = () => {
    if (selected !== undefined) setBaseline(selected);
    router.push('/onboarding/first-rep');
  };

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={styles.body}>
        <Text style={styles.kicker}>CALIBRATION</Text>
        <Text style={styles.h1}>How often does this usually get you, in a week?</Text>
        <Text style={styles.p}>
          Rough is fine. It just sets your baseline — no one sees this but you.
        </Text>
        <View style={styles.chips}>
          {OPTIONS.map((o) => (
            <Chip
              key={o.label}
              label={o.label}
              selected={selected === o.value}
              onPress={() => setSelected(o.value)}
            />
          ))}
        </View>
      </View>
      <View style={styles.footer}>
        <Button label="Next" variant="affirm" onPress={goNext} />
        <Button
          label="Skip"
          variant="ghost"
          onPress={() => router.push('/onboarding/first-rep')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'space-between',
    backgroundColor: color.bg,
  },
  body: { flex: 1, justifyContent: 'center', gap: space.md },
  kicker: { ...type.label, color: color.textLow },
  h1: { ...type.title, fontSize: 26, lineHeight: 34, color: color.textHi },
  p: { ...type.body, color: color.textLow },
  chips: { gap: space.sm, marginTop: space.sm, alignItems: 'flex-start' },
  footer: { gap: space.sm },
});
