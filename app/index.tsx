// app/index.tsx — Home. The anti-streak metric + the two ways into the loop.
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card, ConditioningBadge, MetricBlock } from '../src/components';
import {
  conditioningLevel,
  dangerMap,
  selfAwarenessReps,
  triggeredSlipCount,
} from '../src/domain/reps';
import { selectReps, useAppStore } from '../src/store/useAppStore';
import { color, space, type } from '../src/theme/theme';

const DANGER_MAP_MIN_SLIPS = 3; // F3: surfaces only after ≥3 triggered slips

export default function Home() {
  const router = useRouter();
  const reps = useAppStore(selectReps);
  const count = selfAwarenessReps(reps);
  const conditioning = conditioningLevel(reps, Date.now());
  const showDanger = triggeredSlipCount(reps) >= DANGER_MAP_MIN_SLIPS;
  const zones = showDanger ? dangerMap(reps).slice(0, 3) : [];
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <MetricBlock
        value={count}
        label="Self-awareness reps"
        sub="This number only goes up. Slips count too."
      />

      <View style={styles.actions}>
        <Button
          label="I'm having an urge"
          variant="urge"
          onPress={() => router.push('/intervention')}
        />
        <Button
          label="I slipped — log it (no shame, it's data)"
          variant="ghost"
          onPress={() => router.push('/autopsy')}
        />
      </View>

      <ConditioningBadge
        conditioning={conditioning}
        onPress={() => router.push('/insights')}
      />

      {showDanger ? (
        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>YOUR DANGER ZONES</Text>
          {zones.map((z) => (
            <View key={z.trigger} style={styles.dangerRow}>
              <Text style={styles.dangerTrigger}>{z.trigger}</Text>
              <Text style={styles.dangerCount}>{z.count}</Text>
            </View>
          ))}
          <Text style={styles.dangerSub}>
            Where the urge tends to catch you. Naming it is half the work.
          </Text>
        </Card>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.bg },
  container: {
    flexGrow: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: space.xl,
  },
  actions: { width: '100%', gap: space.md, alignItems: 'center' },
  dangerCard: { gap: space.sm },
  dangerTitle: { ...type.label, color: color.textLow },
  dangerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dangerTrigger: { ...type.body, color: color.textHi },
  dangerCount: { ...type.title, color: color.urge },
  dangerSub: { ...type.caption, color: color.textLow, marginTop: space.xs },
});
