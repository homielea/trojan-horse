// src/lib/checkinClient.ts
// Talks to OUR backend proxy — never Anthropic directly (F6 hard rule: no API key
// in the client). The proxy URL is a public config value (not a secret), read from
// an EXPO_PUBLIC_ env var so it's inlined at build. If unset, the feature reports
// itself unavailable and the UI degrades gracefully.

import type {
  CheckInContext,
  CheckInMessage,
} from '../domain/types';

// EXPO_PUBLIC_* vars are inlined by the Expo bundler; this is a URL, not a secret.
const PROXY_URL = process.env.EXPO_PUBLIC_CHECKIN_PROXY_URL ?? '';

export function checkinConfigured(): boolean {
  return PROXY_URL.length > 0;
}

export interface CheckinTurnRequest {
  context: CheckInContext;
  messages: CheckInMessage[]; // conversation so far (user + assistant)
  mode: 'checkin' | 'anchor_capture';
}

export interface CheckinTurnResponse {
  reply: string; // assistant text to display
  summary?: string; // optional updated rolling memory
  anchorStatements?: string[]; // present when the model has captured the anchor
}

export class CheckinError extends Error {}

/**
 * Send one turn to the proxy and get the assistant's reply. The proxy holds the
 * API key, injects the persona/system prompt + crisis guardrail, calls Claude, and
 * returns plain text (+ optional summary/anchor). We keep the client dumb.
 */
export async function sendCheckinTurn(
  req: CheckinTurnRequest,
  signal?: AbortSignal,
): Promise<CheckinTurnResponse> {
  if (!checkinConfigured()) {
    throw new CheckinError('Check-in is not configured yet.');
  }

  let res: Response;
  try {
    res = await fetch(`${PROXY_URL}/checkin`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req),
      signal,
    });
  } catch {
    throw new CheckinError("Couldn't reach the check-in. Check your connection.");
  }

  if (!res.ok) {
    throw new CheckinError(`Check-in failed (${res.status}).`);
  }

  const data = (await res.json()) as CheckinTurnResponse;
  if (typeof data.reply !== 'string') {
    throw new CheckinError('Malformed response from check-in.');
  }
  return data;
}
