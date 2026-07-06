// app/onboarding/index.tsx — Welcome / frame (F4 step 1). Coach voice, no account.
import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components';
import { color, space, type } from '../../src/theme/theme';

export default function Welcome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + space.xxl, paddingBottom: insets.bottom + space.xl },
      ]}
    >
      <View style={styles.body}>
        <Text style={styles.kicker}>WELCOME</Text>
        <Text style={styles.h1}>You're not starting over. You're training.</Text>
        <Text style={styles.p}>
          You're here to beat a habit. The way we do it: every urge you ride and
          every slip you log is a rep. The number only goes up — even on your
          worst night. No streaks to break. No starting over.
        </Text>
        <Text style={styles.p}>Let's get your first rep.</Text>
      </View>
      <Button
        label="Start"
        variant="urge"
        onPress={() => router.push('/onboarding/baseline')}
      />
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
  kicker: { ...type.label, color: color.urge },
  h1: { ...type.title, fontSize: 30, lineHeight: 38, color: color.textHi },
  p: { ...type.body, color: color.textMid },
});
