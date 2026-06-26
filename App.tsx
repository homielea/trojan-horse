import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

/**
 * Trojan Horse — core-loop skeleton.
 *
 * The visible product is a discipline tracker. The mechanics underneath are
 * emotional-regulation techniques, never named as such:
 *   - "Self-awareness reps" is an ANTI-streak metric: it only goes UP, including
 *     when you log a slip. A slip is data, not a reset to zero (kills shame-churn).
 *   - The urge button opens a 60-second intervention (breathwork + one reframe).
 *
 * This is intentionally single-file and dependency-light so it runs immediately.
 * Next steps: extract screens, persist state, add the AI late-night check-in.
 */

const INTERVENTION_SECONDS = 60;

const REFRAMES = [
  'The urge is a wave. You are not the wave. Ride it; it crests in 90 seconds.',
  'What are you actually feeling right now — under the urge? Name it.',
  'Future you, ten minutes from now: which choice makes him respect you more?',
  'This is a rep. Every rep makes the next urge weaker. You are training.',
];

type Screen = 'home' | 'intervention';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  // The anti-streak metric. Monotonic — never resets.
  const [reps, setReps] = useState(0);
  const [reframe, setReframe] = useState(REFRAMES[0]);

  const startUrge = () => {
    setReframe(REFRAMES[reps % REFRAMES.length]);
    setScreen('intervention');
  };

  // Completing an intervention OR honestly logging a slip both advance the metric:
  // the win is awareness, not abstinence.
  const completeRep = () => {
    setReps((n) => n + 1);
    setScreen('home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      {screen === 'home' ? (
        <Home reps={reps} onUrge={startUrge} onSlip={completeRep} />
      ) : (
        <Intervention reframe={reframe} onDone={completeRep} />
      )}
    </SafeAreaView>
  );
}

function Home({
  reps,
  onUrge,
  onSlip,
}: {
  reps: number;
  onUrge: () => void;
  onSlip: () => void;
}) {
  return (
    <View style={styles.screen}>
      <View style={styles.metricBlock}>
        <Text style={styles.metricNumber}>{reps}</Text>
        <Text style={styles.metricLabel}>SELF-AWARENESS REPS</Text>
        <Text style={styles.metricSub}>This number only goes up. Slips count too.</Text>
      </View>

      <Pressable
        style={({ pressed }) => [styles.urgeButton, pressed && styles.pressed]}
        onPress={onUrge}
      >
        <Text style={styles.urgeText}>I'm having an urge</Text>
      </Pressable>

      <Pressable style={styles.slipButton} onPress={onSlip}>
        <Text style={styles.slipText}>I slipped — log it (no shame, it's data)</Text>
      </Pressable>
    </View>
  );
}

function Intervention({
  reframe,
  onDone,
}: {
  reframe: string;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(INTERVENTION_SECONDS);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timer.current = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          if (timer.current) clearInterval(timer.current);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const done = remaining === 0;

  return (
    <View style={styles.screen}>
      <Text style={styles.timer}>{remaining}</Text>
      <Text style={styles.reframe}>{reframe}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.doneButton,
          !done && styles.doneButtonWaiting,
          pressed && styles.pressed,
        ]}
        onPress={onDone}
      >
        <Text style={styles.doneText}>
          {done ? 'Logged. That was a rep.' : 'Breathe. Stay with it.'}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0d0f12' },
  screen: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 28,
  },
  metricBlock: { alignItems: 'center', gap: 6, marginBottom: 12 },
  metricNumber: { color: '#f2f4f7', fontSize: 88, fontWeight: '800' },
  metricLabel: { color: '#7c8794', fontSize: 13, letterSpacing: 2, fontWeight: '700' },
  metricSub: { color: '#5a6573', fontSize: 13, marginTop: 4 },
  urgeButton: {
    backgroundColor: '#e5484d',
    paddingVertical: 22,
    paddingHorizontal: 40,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
  urgeText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  slipButton: { paddingVertical: 12 },
  slipText: { color: '#7c8794', fontSize: 14 },
  pressed: { opacity: 0.85 },
  timer: { color: '#f2f4f7', fontSize: 96, fontWeight: '800' },
  reframe: {
    color: '#c2cad3',
    fontSize: 20,
    lineHeight: 28,
    textAlign: 'center',
  },
  doneButton: {
    backgroundColor: '#2f6f4f',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  doneButtonWaiting: { backgroundColor: '#1f2937' },
  doneText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});
