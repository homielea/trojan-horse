// app/settings.tsx — minimal settings. Privacy opt-out (PRD §4) + anchor access.
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Card } from '../src/components';
import { analyticsConfigured } from '../src/lib/analytics';
import { selectSettings, useAppStore } from '../src/store/useAppStore';
import { color, space, type } from '../src/theme/theme';

export default function Settings() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const settings = useAppStore(selectSettings);
  const setAnalyticsOptOut = useAppStore((s) => s.setAnalyticsOptOut);
  const optedOut = settings.analyticsOptOut ?? false;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <Text style={styles.h1}>Settings</Text>

      <Card style={styles.card}>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>Anonymous analytics</Text>
            <Text style={styles.rowSub}>
              Coarse, non-identifying usage only — never your triggers, notes, or
              check-ins. Turn it off anytime.
            </Text>
          </View>
          <Switch
            value={!optedOut}
            onValueChange={(on) => setAnalyticsOptOut(!on)}
            trackColor={{ true: color.affirm, false: color.surfaceAlt }}
          />
        </View>
        {!analyticsConfigured() ? (
          <Text style={styles.note}>Analytics isn't switched on in this build.</Text>
        ) : null}
      </Card>

      <Button
        label="The man you're becoming"
        variant="affirm"
        onPress={() => router.push('/anchor')}
      />
      <Button label="Done" variant="ghost" onPress={() => router.back()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.xl, gap: space.md },
  h1: { ...type.title, fontSize: 28, color: color.textHi },
  card: { gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.md },
  rowText: { flex: 1, gap: space.xs },
  rowLabel: { ...type.body, color: color.textHi, fontWeight: '700' },
  rowSub: { ...type.caption, color: color.textLow },
  note: { ...type.caption, color: color.textLow },
});
