// app/intervention.tsx — F1 urge loop (modal route).
// 60s guided intervention. Completing appends exactly one intervention rep and
// returns Home. Leaving early (swipe/back) logs nothing.
import { useRouter } from 'expo-router';
import { UrgeSession } from '../src/components';
import { reframeFor } from '../src/domain/reframes';
import { selectReps, useAppStore } from '../src/store/useAppStore';

const INTERVENTION_SECONDS = 60;

export default function InterventionScreen() {
  const router = useRouter();
  const reps = useAppStore(selectReps);
  const addIntervention = useAppStore((s) => s.addIntervention);
  // Reframe chosen deterministically by current rep count (spec F1).
  const reframe = reframeFor(reps.length);

  const complete = () => {
    addIntervention();
    router.back();
  };

  return (
    <UrgeSession
      seconds={INTERVENTION_SECONDS}
      reframe={reframe}
      onComplete={complete}
    />
  );
}
