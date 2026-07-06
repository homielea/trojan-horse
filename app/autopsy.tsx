// app/autopsy.tsx — F3 relapse autopsy (modal route).
// A 3-step, ~60s shame-free debrief. Steps 2 and 3 are skippable. Submitting
// appends exactly one slip rep with the captured fields, then returns Home.
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Chip } from '../src/components';
import { useAppStore } from '../src/store/useAppStore';
import { color, radius, space, type } from '../src/theme/theme';

const TRIGGERS = [
  'Bored',
  'Late night',
  'Stressed',
  'Lonely',
  'Argument',
  'Scrolling',
  'Tired',
];
const FEELINGS = [
  'Lonely',
  'Stressed',
  'Numb',
  'Restless',
  'Ashamed',
  'Anxious',
  'Empty',
];

type Step = 0 | 1 | 2;

export default function AutopsyScreen() {
  const router = useRouter();
  const logSlip = useAppStore((s) => s.logSlip);
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<Step>(0);
  const [trigger, setTrigger] = useState<string | undefined>();
  const [otherTrigger, setOtherTrigger] = useState('');
  const [feeling, setFeeling] = useState<string | undefined>();
  const [note, setNote] = useState('');

  const resolvedTrigger =
    trigger === 'Other' ? otherTrigger.trim() || 'Other' : trigger;

  const submit = () => {
    logSlip({
      trigger: resolvedTrigger,
      feeling,
      note: note.trim() || undefined,
    });
    router.back();
  };

  const next = () => setStep((s) => (s < 2 ? ((s + 1) as Step) : s));

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        style={[
          styles.screen,
          { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.lg },
        ]}
      >
        <Text style={styles.progress}>STEP {step + 1} OF 3</Text>

        {step === 0 ? (
          <View style={styles.body}>
            <Text style={styles.q}>What set it off?</Text>
            <Text style={styles.sub}>No shame — this is just data.</Text>
            <View style={styles.chips}>
              {[...TRIGGERS, 'Other'].map((t) => (
                <Chip
                  key={t}
                  label={t}
                  selected={trigger === t}
                  onPress={() => setTrigger(t)}
                />
              ))}
            </View>
            {trigger === 'Other' ? (
              <TextInput
                style={styles.input}
                placeholder="Name it"
                placeholderTextColor={color.textLow}
                value={otherTrigger}
                onChangeText={setOtherTrigger}
                autoFocus
              />
            ) : null}
          </View>
        ) : null}

        {step === 1 ? (
          <View style={styles.body}>
            <Text style={styles.q}>What were you actually feeling underneath?</Text>
            <Text style={styles.sub}>The urge usually rides on something else.</Text>
            <View style={styles.chips}>
              {FEELINGS.map((f) => (
                <Chip
                  key={f}
                  label={f}
                  selected={feeling === f}
                  onPress={() => setFeeling(f)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.body}>
            <Text style={styles.q}>Anything else? (optional)</Text>
            <Text style={styles.sub}>One line, for future you.</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="What happened, in a sentence"
              placeholderTextColor={color.textLow}
              value={note}
              onChangeText={setNote}
              multiline
            />
          </View>
        ) : null}

        <View style={styles.footer}>
          {step < 2 ? (
            <>
              <Button label="Next" variant="affirm" onPress={next} />
              <Button
                label={step === 0 ? 'Skip the rest — just log it' : 'Skip'}
                variant="ghost"
                onPress={submit}
              />
            </>
          ) : (
            <Button label="Log it. That was a rep." variant="affirm" onPress={submit} />
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  screen: {
    flex: 1,
    paddingHorizontal: space.xl,
    justifyContent: 'space-between',
  },
  progress: { ...type.label, color: color.textLow },
  body: { flex: 1, justifyContent: 'center', gap: space.md },
  q: { ...type.title, color: color.textHi },
  sub: { ...type.body, color: color.textLow, marginTop: -space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  input: {
    ...type.body,
    color: color.textHi,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    marginTop: space.sm,
  },
  noteInput: { minHeight: 88, textAlignVertical: 'top' },
  footer: { gap: space.sm },
});
