// app/onboarding/_layout.tsx — the onboarding sub-stack.
import { Stack } from 'expo-router';
import { color } from '../../src/theme/theme';

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: color.bg },
        animation: 'slide_from_right',
        gestureEnabled: false, // linear flow; no swipe-back between steps
      }}
    />
  );
}
