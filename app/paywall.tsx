// app/paywall.tsx — F7 subscription. Gym-framed, loss-aversion, soft & dismissible.
// Shown only from an upsell tap after first value — never on launch, never over
// the urge loop.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '../src/components';
import { PRICING, useEntitlement, type Plan } from '../src/lib/purchases';
import { color, radius, space, type } from '../src/theme/theme';

const UNLOCKS = [
  'Your full danger map — every trigger, ranked',
  'Unlimited late-night check-ins',
  'Full conditioning insights + history',
];

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { purchase, restore } = useEntitlement();
  const [plan, setPlan] = useState<Plan>('annual');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={styles.kicker}>KEEP THE REPS COMING</Text>
      <Text style={styles.h1}>Conditioning decays when you stop showing up.</Text>
      <Text style={styles.p}>
        You already pay monthly for a number that goes up. This is that — for the
        part of you that flinches. The urge loop stays free, always. The rest is
        how you keep the momentum.
      </Text>

      <Card style={styles.unlocks}>
        {UNLOCKS.map((u) => (
          <Text key={u} style={styles.unlock}>
            •  {u}
          </Text>
        ))}
      </Card>

      <View style={styles.plans}>
        {(['annual', 'monthly'] as Plan[]).map((p) => {
          const selected = plan === p;
          return (
            <View
              key={p}
              style={[styles.plan, selected && styles.planSelected]}
              onTouchEnd={() => setPlan(p)}
            >
              <Text style={styles.planLabel}>{PRICING[p].label}</Text>
              <Text style={styles.planPrice}>{PRICING[p].price}</Text>
              {PRICING[p].sub ? <Text style={styles.planSub}>{PRICING[p].sub}</Text> : null}
            </View>
          );
        })}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <Button
        label={busy ? 'One sec…' : `Start ${PRICING[plan].label.toLowerCase()}`}
        variant="urge"
        disabled={busy}
        onPress={() => run(() => purchase(plan))}
      />
      <Button label="Restore purchases" variant="ghost" onPress={() => run(restore)} />
      <Button label="Not now" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.xl, gap: space.md },
  kicker: { ...type.label, color: color.urge },
  h1: { ...type.title, fontSize: 28, lineHeight: 34, color: color.textHi },
  p: { ...type.body, color: color.textMid },
  unlocks: { gap: space.sm },
  unlock: { ...type.body, color: color.textHi },
  plans: { flexDirection: 'row', gap: space.md, marginTop: space.sm },
  plan: {
    flex: 1,
    borderWidth: 1,
    borderColor: color.surfaceAlt,
    borderRadius: radius.md,
    padding: space.md,
    gap: space.xs,
  },
  planSelected: { borderColor: color.accent, backgroundColor: color.surface },
  planLabel: { ...type.label, color: color.textLow },
  planPrice: { ...type.title, color: color.textHi },
  planSub: { ...type.caption, color: color.affirm },
  error: { ...type.caption, color: color.urge },
});
