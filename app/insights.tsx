// app/insights.tsx — F8 insights (modal route). Reps over time + trend + breakdown.
// Read-only; no shame framing. Reached by tapping the conditioning badge.
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '../src/components';
import {
  conditioningLevel,
  repBreakdown,
  repsPerDay,
  selfAwarenessReps,
} from '../src/domain/reps';
import { canSeeFullInsights } from '../src/domain/entitlements';
import { useEntitlement } from '../src/lib/purchases';
import { selectReps, useAppStore } from '../src/store/useAppStore';
import { color, radius, space, type } from '../src/theme/theme';

const DAYS = 14;

export default function Insights() {
  const router = useRouter();
  const reps = useAppStore(selectReps);
  const { isPro } = useEntitlement();
  const full = canSeeFullInsights(isPro);
  const insets = useSafeAreaInsets();
  const now = Date.now();

  const cond = conditioningLevel(reps, now);
  const { interventions, slips } = repBreakdown(reps);
  const perDay = repsPerDay(reps, now, DAYS);
  const maxDay = Math.max(1, ...perDay);

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={styles.h1}>Your training</Text>

      <Card style={styles.card}>
        <Text style={styles.cardLabel}>CONDITIONING</Text>
        <Text style={styles.big}>Level {cond.level}</Text>
        <Text style={styles.sub}>
          {cond.trend === 'up'
            ? 'Momentum is building. Keep the reps coming.'
            : cond.trend === 'down'
              ? 'Cooling off — a rep or two brings it back up.'
              : 'Steady. Showing up is the whole game.'}
        </Text>
      </Card>

      {full ? (
      <>
      <Card style={styles.card}>
        <Text style={styles.cardLabel}>LAST {DAYS} DAYS</Text>
        <View style={styles.chart}>
          {perDay.map((count, i) => (
            <View key={i} style={styles.barSlot}>
              <View
                style={[
                  styles.bar,
                  {
                    height: `${Math.round((count / maxDay) * 100)}%`,
                    backgroundColor: count > 0 ? color.accent : color.surfaceAlt,
                  },
                ]}
              />
            </View>
          ))}
        </View>
        <Text style={styles.sub}>Each bar is a day. Taller = more reps.</Text>
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Total reps</Text>
          <Text style={styles.rowValue}>{selfAwarenessReps(reps)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Urges ridden</Text>
          <Text style={styles.rowValue}>{interventions}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Slips logged</Text>
          <Text style={styles.rowValue}>{slips}</Text>
        </View>
      </Card>
      </>
      ) : (
        <Card style={styles.card}>
          <Text style={styles.cardLabel}>FULL INSIGHTS</Text>
          <Text style={styles.sub}>
            Your reps over time, trend, and breakdown — the whole picture of how
            you're training. Part of the upgrade.
          </Text>
          <Button
            label="Unlock insights"
            variant="affirm"
            onPress={() => router.push('/paywall')}
          />
        </Card>
      )}

      <Button label="Done" variant="affirm" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: color.bg },
  container: { paddingHorizontal: space.xl, gap: space.lg },
  h1: { ...type.title, fontSize: 28, color: color.textHi },
  card: { gap: space.sm },
  cardLabel: { ...type.label, color: color.textLow },
  big: { ...type.title, fontSize: 32, color: color.textHi },
  sub: { ...type.caption, color: color.textLow },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 96,
    gap: space.xs,
    marginVertical: space.sm,
  },
  barSlot: { flex: 1, height: '100%', justifyContent: 'flex-end' },
  bar: { width: '100%', borderRadius: radius.sm, minHeight: 3 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: space.xs,
  },
  rowLabel: { ...type.body, color: color.textMid },
  rowValue: { ...type.title, color: color.textHi },
});
