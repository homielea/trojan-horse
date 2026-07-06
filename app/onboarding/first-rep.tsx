// app/onboarding/first-rep.tsx — Guaranteed first win (F4 step 3).
// A shortened intervention so the user lands on Home already at 1 rep, not 0.
// On completion: append the intervention rep AND mark onboarding done — the root
// gate then routes to Home.
import { UrgeSession } from '../../src/components';
import { useAppStore } from '../../src/store/useAppStore';

const FIRST_REP_SECONDS = 15; // shorter than the full 60s loop — a fast first win

const FIRST_REP_REFRAME =
  'Right now, just breathe. This is rep one. Notice the urge soften — that softening is the skill you’re building.';

export default function FirstRep() {
  const addIntervention = useAppStore((s) => s.addIntervention);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const finish = () => {
    addIntervention();
    completeOnboarding(); // flips the gate in app/_layout → routes to Home
  };

  return (
    <UrgeSession
      seconds={FIRST_REP_SECONDS}
      reframe={FIRST_REP_REFRAME}
      onComplete={finish}
      doneLabel="That's rep one. You're in."
    />
  );
}
