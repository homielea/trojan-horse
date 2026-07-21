// src/lib/purchases.ts
// Entitlement layer over RevenueCat (F7). The rest of the app depends only on the
// `useEntitlement()` hook and never on the SDK directly, so the store integration
// is a single, isolated swap.
//
// ── RevenueCat integration boundary ──────────────────────────────────────────
// RevenueCat's *public* SDK key is designed to live in the client (it is NOT a
// secret — unlike the Anthropic key in F6). Add `react-native-purchases` in a dev
// build and implement the three marked functions below against it:
//
//   configure(): Purchases.configure({ apiKey: RC_KEY })
//   readPro():   (await Purchases.getCustomerInfo()).entitlements.active['pro'] != null
//   buy(pkg):    await Purchases.purchasePackage(pkg)   // 'annual' | 'monthly'
//   restore():   await Purchases.restorePurchases()
//
// Until then this module resolves entitlement to the free tier (or simulates pro
// via EXPO_PUBLIC_FORCE_PRO=1 for testing the gates), so the app runs end-to-end
// with the gating fully wired.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useState } from 'react';

// Public SDK key (safe in-client). Presence = "RevenueCat is wired up".
const RC_KEY =
  process.env.EXPO_PUBLIC_RC_IOS_KEY ??
  process.env.EXPO_PUBLIC_RC_ANDROID_KEY ??
  '';
// Dev/testing override to exercise paid gates without a real purchase.
const FORCE_PRO = process.env.EXPO_PUBLIC_FORCE_PRO === '1';

export function purchasesConfigured(): boolean {
  return RC_KEY.length > 0;
}

export type Plan = 'annual' | 'monthly';

// Assumed pricing (F7; founder to confirm). Annual is emphasized.
export const PRICING: Record<Plan, { label: string; price: string; sub?: string }> = {
  annual: { label: 'Annual', price: '$59/yr', sub: '7-day free trial · best value' },
  monthly: { label: 'Monthly', price: '$9.99/mo' },
};

async function readPro(): Promise<boolean> {
  if (FORCE_PRO) return true;
  // TODO(RevenueCat): return whether the 'pro' entitlement is active.
  return false;
}

/**
 * Reactive entitlement hook. Screens call this to gate paid features.
 * `purchase`/`restore` reject with a clear message until RevenueCat is wired.
 */
export function useEntitlement() {
  const [isPro, setIsPro] = useState(FORCE_PRO);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    void readPro().then((pro) => {
      if (alive) {
        setIsPro(pro);
        setLoading(false);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  const purchase = async (_plan: Plan): Promise<void> => {
    if (!purchasesConfigured()) {
      throw new Error('Subscriptions are not switched on in this build yet.');
    }
    // TODO(RevenueCat): await Purchases.purchasePackage(pkgFor(_plan)); then refresh.
    setIsPro(await readPro());
  };

  const restore = async (): Promise<void> => {
    if (!purchasesConfigured()) {
      throw new Error('Subscriptions are not switched on in this build yet.');
    }
    // TODO(RevenueCat): await Purchases.restorePurchases(); then refresh.
    setIsPro(await readPro());
  };

  return { isPro, loading, purchase, restore };
}
