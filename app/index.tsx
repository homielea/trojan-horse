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
import { shouldOfferAnchorCapture } from '../src/domain/checkin';
import { canStartCheckin, dangerZoneLimit } from '../src/domain/entitlements';
import { checkinConfigured } from '../src/lib/checkinClient';
import { useEntitlement } from '../src/lib/purchases';
import {
  selectCheckIns,
  selectFutureSelf,
  selectIsOnboarded,
  selectReps,
  useAppStore,
} from '../src/store/useAppStore';
import { color, space, type } from '../src/theme/theme';

const DANGER_MAP_MIN_SLIPS = 3; // F3: surfaces only after ≥3 triggered slips

export default function Home() {
  const router = useRouter();
  const reps = useAppStore(selectReps);
  const futureSelf = useAppStore(selectFutureSelf);
  const onboarded = useAppStore(selectIsOnboarded);
  const checkIns = useAppStore(selectCheckIns);
  const { isPro } = useEntitlement();
  const count = selfAwarenessReps(reps);
  const conditioning = conditioningLevel(reps, Date.now());
  const showDanger = triggeredSlipCount(reps) >= DANGER_MAP_MIN_SLIPS;
  // F7: free previews the top trigger; paid sees the full map.
  const allZones = showDanger ? dangerMap(reps) : [];
  const zones = allZones.slice(0, dangerZoneLimit(isPro));
  const lockedZones = allZones.length - zones.length;
  // The check-in only shows once the backend is switched on (F6 is v1.1).
  const checkinAvailable = checkinConfigured();
  // Offer to capture the anchor only on a good night (F6a gate).
  const offerAnchor =
    checkinAvailable && shouldOfferAnchorCapture(reps, futureSelf, onboarded);

  // F7: urge loop is NEVER gated. The check-in is: free gets a lifetime cap.
  const startCheckin = () => {
    if (canStartCheckin(isPro, checkIns.length)) router.push('/checkin');
    else router.push('/paywall');
  };
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

      {offerAnchor ? (
        <Card style={styles.nudgeCard}>
          <Text style={styles.nudgeTitle}>You've got some momentum.</Text>
          <Text style={styles.nudgeBody}>
            Good moment to name the man you're becoming — before the next urge, not
            during one.
          </Text>
          <Button
            label="Name him"
            variant="affirm"
            onPress={() => router.push('/checkin?mode=anchor_capture')}
          />
        </Card>
      ) : null}

      {checkinAvailable ? (
        <Button
          label={futureSelf ? 'Late-night check-in' : 'Talk it out — check-in'}
          variant="ghost"
          onPress={startCheckin}
        />
      ) : null}

      {showDanger ? (
        <Card style={styles.dangerCard}>
          <Text style={styles.dangerTitle}>YOUR DANGER ZONES</Text>
          {zones.map((z) => (
            <View key={z.trigger} style={styles.dangerRow}>
              <Text style={styles.dangerTrigger}>{z.trigger}</Text>
              <Text style={styles.dangerCount}>{z.count}</Text>
            </View>
          ))}
          {lockedZones > 0 ? (
            <Button
              label={`See all ${allZones.length} danger zones`}
              variant="ghost"
              onPress={() => router.push('/paywall')}
              style={styles.dangerUpsell}
            />
          ) : (
            <Text style={styles.dangerSub}>
              Where the urge tends to catch you. Naming it is half the work.
            </Text>
          )}
        </Card>
      ) : null}

      <Button
        label="Settings"
        variant="ghost"
        onPress={() => router.push('/settings')}
      />
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
  dangerUpsell: { marginTop: space.xs },
  nudgeCard: { gap: space.sm },
  nudgeTitle: { ...type.title, fontSize: 18, color: color.textHi },
  nudgeBody: { ...type.body, color: color.textMid },
});
