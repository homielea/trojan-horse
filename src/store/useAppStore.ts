// src/store/useAppStore.ts
// The single global store. Zustand + persist to AsyncStorage under `trojan-horse/v1`.
//
// INVARIANT (PRD §4, F2): `reps` is append-only. The only mutators are
// addIntervention() and logSlip(), both of which APPEND. There is intentionally
// no clear/reset/remove action. Do not add one.

import * as Crypto from 'expo-crypto';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { addRep } from '../domain/reps';
import type {
  AppState,
  CheckIn,
  FutureSelf,
  RepEvent,
  Settings,
  SlipInput,
} from '../domain/types';
import { storage } from '../lib/storage';

const PERSIST_KEY = 'trojan-horse/v1';
const PERSIST_VERSION = 1; // bump + add a migrate() for future schema changes

const defaultSettings: Settings = {
  vertical: 'porn',
};

interface Store extends AppState {
  addIntervention: () => void;
  logSlip: (input: SlipInput) => void;
  setBaseline: (freqPerWeek: number) => void;
  completeOnboarding: () => void;
  // F6 / F6a
  addCheckIn: (checkIn: CheckIn) => void;
  setFutureSelf: (statements: string[], name?: string) => void;
  markAnchorReferenced: () => void;
  setAnalyticsOptOut: (optOut: boolean) => void;
}

function newRep(type: RepEvent['type'], extra: SlipInput = {}): RepEvent {
  return {
    id: Crypto.randomUUID(),
    type,
    createdAt: Date.now(),
    ...extra,
  };
}

export const useAppStore = create<Store>()(
  persist(
    (set) => ({
      reps: [],
      settings: defaultSettings,
      checkIns: [],
      futureSelf: undefined,

      addIntervention: () =>
        set((s) => ({ reps: addRep(s.reps, newRep('intervention')) })),

      logSlip: (input) =>
        set((s) => ({
          reps: addRep(
            s.reps,
            newRep('slip', {
              trigger: input.trigger,
              feeling: input.feeling,
              note: input.note,
            }),
          ),
        })),

      setBaseline: (freqPerWeek) =>
        set((s) => ({
          settings: { ...s.settings, baselineFrequencyPerWeek: freqPerWeek },
        })),

      completeOnboarding: () =>
        set((s) => ({
          settings: { ...s.settings, onboardedAt: Date.now() },
        })),

      // Append a completed check-in session (append-only, like reps).
      addCheckIn: (checkIn) =>
        set((s) => ({ checkIns: [...s.checkIns, checkIn] })),

      // The anchor is user-authored and editable. Overwriting keeps the original
      // capture time so "the man he's becoming" has a start date; F6a.
      setFutureSelf: (statements, name) =>
        set((s) => ({
          futureSelf: {
            capturedAt: s.futureSelf?.capturedAt ?? Date.now(),
            statements,
            name,
            lastReferencedAt: s.futureSelf?.lastReferencedAt,
          },
        })),

      markAnchorReferenced: () =>
        set((s) =>
          s.futureSelf
            ? { futureSelf: { ...s.futureSelf, lastReferencedAt: Date.now() } }
            : {},
        ),

      setAnalyticsOptOut: (optOut) =>
        set((s) => ({ settings: { ...s.settings, analyticsOptOut: optOut } })),
    }),
    {
      name: PERSIST_KEY,
      version: PERSIST_VERSION,
      storage: createJSONStorage(() => storage),
      // Only persist domain data, not the action functions.
      partialize: (s) => ({
        reps: s.reps,
        settings: s.settings,
        checkIns: s.checkIns,
        futureSelf: s.futureSelf,
      }),
    },
  ),
);

/**
 * Reactive hydration flag. `persist.hasHydrated()` is a one-shot read; this hook
 * subscribes to `onFinishHydration` so gating logic re-renders when the persisted
 * state finishes loading from AsyncStorage.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() =>
    useAppStore.persist.hasHydrated(),
  );
  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() =>
      setHydrated(true),
    );
    // Guard against hydration completing before the listener attached.
    if (useAppStore.persist.hasHydrated()) setHydrated(true);
    return unsub;
  }, []);
  return hydrated;
}

// --- Selectors (screens read via these; no prop-drilling of global state) ---
export const selectReps = (s: Store) => s.reps;
export const selectSettings = (s: Store) => s.settings;
export const selectIsOnboarded = (s: Store) =>
  s.settings.onboardedAt !== undefined;
export const selectFutureSelf = (s: Store) => s.futureSelf;
export const selectCheckIns = (s: Store) => s.checkIns;
