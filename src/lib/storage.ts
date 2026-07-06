// src/lib/storage.ts
// Thin AsyncStorage wrapper used as the Zustand persist backend.
// Kept separate so the store doesn't import the native module directly and so it
// can be swapped/mocked in tests.

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StateStorage } from 'zustand/middleware';

export const storage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};
