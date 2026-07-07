// app/anchor.tsx — F6a: view and edit the Future-Self Anchor in the user's own words.
// The anchor is always user-authored and editable here; never AI-prescribed.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../src/components';
import { selectFutureSelf, useAppStore } from '../src/store/useAppStore';
import { color, radius, space, type } from '../src/theme/theme';

const MAX_STATEMENTS = 4;

export default function Anchor() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const futureSelf = useAppStore(selectFutureSelf);
  const setFutureSelf = useAppStore((s) => s.setFutureSelf);

  // Editable copy; pad to 3 rows so there's room to add without a button.
  const initial = futureSelf?.statements ?? [];
  const [rows, setRows] = useState<string[]>(
    [...initial, ...Array(Math.max(0, 3 - initial.length)).fill('')].slice(
      0,
      MAX_STATEMENTS,
    ),
  );
  const [name, setName] = useState(futureSelf?.name ?? '');

  const setRow = (i: number, val: string) =>
    setRows((r) => r.map((x, j) => (j === i ? val : x)));

  const save = () => {
    const statements = rows.map((r) => r.trim()).filter((r) => r.length > 0);
    if (statements.length === 0) return;
    setFutureSelf(statements, name.trim() || undefined);
    router.back();
  };

  // No anchor yet → point at the conversational capture (only meaningful on a
  // good night; the Home nudge gates that, this is the manual entry).
  if (!futureSelf && initial.length === 0) {
    return (
      <View
        style={[
          styles.screen,
          styles.centered,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <Text style={styles.h1}>The man you're becoming</Text>
        <Text style={styles.p}>
          Not who you should be — who, a year from now, has this handled. A few of
          his details, in your words. We capture it on a good night, not mid-urge.
        </Text>
        <Button
          label="Capture it now"
          variant="affirm"
          onPress={() => router.replace('/checkin?mode=anchor_capture')}
        />
        <Button label="Not now" variant="ghost" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl },
        ]}
      >
        <Text style={styles.h1}>The man you're becoming</Text>
        <Text style={styles.p}>Your words. Edit them anytime — you're allowed to grow.</Text>

        {rows.map((row, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`In his words #${i + 1}`}
            placeholderTextColor={color.textLow}
            value={row}
            onChangeText={(v) => setRow(i, v)}
            multiline
          />
        ))}

        <Text style={styles.label}>WHAT HE'S CALLED (OPTIONAL)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Sunday-morning me"
          placeholderTextColor={color.textLow}
          value={name}
          onChangeText={setName}
        />

        <Button label="Save" variant="affirm" onPress={save} style={styles.save} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg },
  content: { paddingHorizontal: space.xl, gap: space.md },
  centered: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'center',
    gap: space.md,
  },
  h1: { ...type.title, fontSize: 26, color: color.textHi },
  p: { ...type.body, color: color.textLow },
  label: { ...type.label, color: color.textLow, marginTop: space.sm },
  input: {
    ...type.body,
    color: color.textHi,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
  },
  save: { marginTop: space.md },
});
