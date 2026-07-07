// app/checkin.tsx — F6 AI late-night check-in (+ F6a anchor capture).
// A short chat with a backend-proxied coach. `mode=anchor_capture` runs the
// one-time Future-Self Anchor elicitation instead of a normal check-in.
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CrisisCard } from '../src/components';
import { buildCheckinContext, detectCrisis } from '../src/domain/checkin';
import type { CheckIn, CheckInMessage } from '../src/domain/types';
import * as Crypto from 'expo-crypto';
import {
  checkinConfigured,
  sendCheckinTurn,
} from '../src/lib/checkinClient';
import {
  selectCheckIns,
  selectFutureSelf,
  selectReps,
  selectSettings,
  useAppStore,
} from '../src/store/useAppStore';
import { color, radius, space, type } from '../src/theme/theme';

export default function CheckIn() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode = params.mode === 'anchor_capture' ? 'anchor_capture' : 'checkin';
  const insets = useSafeAreaInsets();

  const reps = useAppStore(selectReps);
  const settings = useAppStore(selectSettings);
  const futureSelf = useAppStore(selectFutureSelf);
  const checkIns = useAppStore(selectCheckIns);
  const addCheckIn = useAppStore((s) => s.addCheckIn);
  const setFutureSelf = useAppStore((s) => s.setFutureSelf);
  const markAnchorReferenced = useAppStore((s) => s.markAnchorReferenced);

  const [messages, setMessages] = useState<CheckInMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [crisis, setCrisis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | undefined>();
  const startedAt = useRef(Date.now());
  const scrollRef = useRef<ScrollView>(null);

  const priorSummary = checkIns[checkIns.length - 1]?.summary;

  const runTurn = async (history: CheckInMessage[]) => {
    setLoading(true);
    setError(null);
    try {
      const context = buildCheckinContext(
        reps,
        futureSelf,
        priorSummary,
        settings.vertical,
        Date.now(),
      );
      const res = await sendCheckinTurn({ context, messages: history, mode });
      setMessages([...history, { role: 'assistant', content: res.reply }]);
      if (res.summary) setSummary(res.summary);
      if (mode === 'anchor_capture' && res.anchorStatements?.length) {
        setFutureSelf(res.anchorStatements);
      }
      if (mode === 'checkin' && futureSelf) markAnchorReferenced();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Kick off with the coach's opening line (empty history → proxy opens).
  useEffect(() => {
    if (checkinConfigured()) void runTurn([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text || loading) return;
    if (detectCrisis(text)) {
      setCrisis(true);
      setInput('');
      return;
    }
    const next = [...messages, { role: 'user' as const, content: text }];
    setMessages(next);
    setInput('');
    void runTurn(next);
  };

  const finish = () => {
    if (messages.length > 0) {
      const checkIn: CheckIn = {
        id: Crypto.randomUUID(),
        date: startedAt.current,
        transcript: messages,
        summary,
      };
      addCheckIn(checkIn);
    }
    router.back();
  };

  if (!checkinConfigured()) {
    return (
      <View style={[styles.screen, styles.centered, { paddingTop: insets.top + space.xl }]}>
        <Text style={styles.title}>Check-in isn't live yet</Text>
        <Text style={styles.muted}>
          The late-night check-in needs the backend switched on. Everything else
          works offline in the meantime.
        </Text>
        <Button label="Back" variant="affirm" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.screen, { paddingTop: insets.top + space.md }]}>
        <Text style={styles.kicker}>
          {mode === 'anchor_capture' ? 'THE MAN YOU’RE BECOMING' : 'LATE-NIGHT CHECK-IN'}
        </Text>
        <ScrollView
          ref={scrollRef}
          style={styles.thread}
          contentContainerStyle={styles.threadContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {crisis ? <CrisisCard /> : null}
          {messages.map((m, i) => (
            <View
              key={i}
              style={[m.role === 'user' ? styles.userBubble : styles.coachBubble]}
            >
              <Text style={m.role === 'user' ? styles.userText : styles.coachText}>
                {m.content}
              </Text>
            </View>
          ))}
          {loading ? <ActivityIndicator color={color.textLow} style={styles.loading} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>

        {!crisis ? (
          <View style={[styles.composer, { paddingBottom: insets.bottom + space.sm }]}>
            <TextInput
              style={styles.input}
              placeholder="Say it straight."
              placeholderTextColor={color.textLow}
              value={input}
              onChangeText={setInput}
              editable={!loading}
              multiline
              onSubmitEditing={send}
            />
            <View style={styles.composerRow}>
              <Pressable onPress={finish} hitSlop={8}>
                <Text style={styles.done}>Done</Text>
              </Pressable>
              <Button
                label="Send"
                variant="affirm"
                disabled={loading || input.trim().length === 0}
                onPress={send}
                style={styles.sendBtn}
              />
            </View>
          </View>
        ) : (
          <View style={[styles.composer, { paddingBottom: insets.bottom + space.sm }]}>
            <Button label="Close" variant="affirm" onPress={finish} />
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: color.bg },
  screen: { flex: 1, backgroundColor: color.bg, paddingHorizontal: space.lg },
  centered: { justifyContent: 'center', alignItems: 'center', gap: space.md },
  title: { ...type.title, color: color.textHi, textAlign: 'center' },
  muted: { ...type.body, color: color.textLow, textAlign: 'center' },
  kicker: { ...type.label, color: color.textLow, marginBottom: space.sm },
  thread: { flex: 1 },
  threadContent: { gap: space.md, paddingVertical: space.sm },
  coachBubble: {
    backgroundColor: color.surface,
    borderRadius: radius.md,
    padding: space.md,
    alignSelf: 'flex-start',
    maxWidth: '90%',
  },
  coachText: { ...type.body, color: color.textHi },
  userBubble: {
    backgroundColor: color.surfaceAlt,
    borderRadius: radius.md,
    padding: space.md,
    alignSelf: 'flex-end',
    maxWidth: '90%',
  },
  userText: { ...type.body, color: color.textHi },
  loading: { alignSelf: 'flex-start', marginTop: space.xs },
  error: { ...type.caption, color: color.urge },
  composer: { gap: space.sm, paddingTop: space.sm },
  input: {
    ...type.body,
    color: color.textHi,
    backgroundColor: color.surface,
    borderRadius: radius.md,
    paddingHorizontal: space.md,
    paddingVertical: space.md,
    maxHeight: 120,
  },
  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.md,
  },
  done: { ...type.body, color: color.textLow },
  sendBtn: { flex: 1 },
});
