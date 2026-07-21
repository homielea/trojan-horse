// app/_layout.tsx — root stack + theme + onboarding gate.
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { color } from '../src/theme/theme';
import {
  selectIsOnboarded,
  selectSettings,
  useAppStore,
  useHydrated,
} from '../src/store/useAppStore';
import { analytics } from '../src/lib/analytics';
import { AnalyticsEvent } from '../src/domain/analyticsEvents';

export default function RootLayout() {
  const onboarded = useAppStore(selectIsOnboarded);
  const settings = useAppStore(selectSettings);
  const hydrated = useHydrated();
  const segments = useSegments();
  const router = useRouter();

  // Keep analytics opt-out in sync with persisted settings (privacy wins).
  useEffect(() => {
    analytics.setOptOut(settings.analyticsOptOut ?? false);
  }, [settings.analyticsOptOut]);

  // One APP_OPENED per launch, once state has hydrated (powers D1/D7 retention).
  useEffect(() => {
    if (hydrated) analytics.capture(AnalyticsEvent.APP_OPENED);
  }, [hydrated]);

  // Gate: until onboarding is done, keep the user in the onboarding flow. Once
  // done, keep them out of it. Wait for persisted state to hydrate first so we
  // don't briefly flash onboarding for a returning user (F4).
  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === 'onboarding';
    if (!onboarded && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboarded && inOnboarding) {
      router.replace('/');
    }
  }, [hydrated, onboarded, segments, router]);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: color.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="intervention" options={{ presentation: 'modal' }} />
        <Stack.Screen name="autopsy" options={{ presentation: 'modal' }} />
        <Stack.Screen name="insights" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
        <Stack.Screen name="anchor" options={{ presentation: 'modal' }} />
        <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
        <Stack.Screen name="onboarding" />
      </Stack>
    </SafeAreaProvider>
  );
}
