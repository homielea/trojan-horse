// supabase/functions/checkin/index.ts
// The AI check-in PROXY. Runs on Supabase Edge (Deno). It is the ONLY place the
// Anthropic API key exists — the client never sees it (F6 hard rule). It injects
// the coach persona + guardrails, calls Claude, and returns plain text.
//
// Deploy:  supabase functions deploy checkin --no-verify-jwt
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
// Client:  set EXPO_PUBLIC_CHECKIN_PROXY_URL to this function's base URL.
//
// This file targets the Deno edge runtime and is intentionally dependency-free
// (raw fetch against the Messages API), so it isn't part of the Expo/tsc build.

// The reflective nightly check-in is low-volume, high-value — use the strongest
// model. (ARCHITECTURE.md: a fast tier for chat, escalate for reflective turns;
// this turn IS the reflective one.)
const MODEL = 'claude-opus-4-8';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'content-type',
  'access-control-allow-methods': 'POST, OPTIONS',
};

type ChatRole = 'user' | 'assistant';
interface Msg {
  role: ChatRole;
  content: string;
}
interface DangerZone {
  trigger: string;
  count: number;
}
interface Ctx {
  vertical: string;
  selfAwarenessReps: number;
  recentReps: { type: string; createdAt: number; trigger?: string; feeling?: string }[];
  dangerZones: DangerZone[];
  anchor?: { statements: string[]; name?: string };
  priorSummary?: string;
  lastEventWasSlip: boolean;
}
interface Body {
  context: Ctx;
  messages: Msg[];
  mode: 'checkin' | 'anchor_capture';
}

// Server-side crisis backstop (mirrors the client pre-check). If a user message
// signals crisis, we never call the model — we return resources directly.
const CRISIS = [
  /\bkill(?:ing)?\s+my\s?self\b/i,
  /\bsuicid(?:e|al)\b/i,
  /\bwant\s+to\s+die\b/i,
  /\bend(?:ing)?\s+(?:it|my life)\b/i,
  /\bself[-\s]?harm\b/i,
  /\bhurt(?:ing)?\s+my\s?self\b/i,
];
const CRISIS_REPLY =
  "I'm going to step out of coach mode for a second, because this matters more " +
  "than any of that. You don't have to white-knuckle this alone. Call or text 988 " +
  '(Suicide & Crisis Lifeline) — 24/7, free — or text HOME to 741741. Please reach ' +
  "one of them now. I'll be here.";

function personaPrompt(ctx: Ctx, mode: Body['mode']): string {
  const lines: string[] = [];
  lines.push(
    'You are the check-in voice inside a discipline app for men beating a compulsive ' +
      'habit. You talk like a sharp, warm, direct male friend three drinks in — NOT a ' +
      'therapist, not a chipper coach. Contractions. Get to the point. A little dry humor. ' +
      'Ask a real second question. Reference specifics. Call out avoidance without shaming.',
  );
  lines.push(
    'NEVER: diagnose, use clinical or therapy framing, moralize, or claim to be a therapist. ' +
      'BANNED words: therapy, therapist, mental health, patient, disorder, "days clean", relapse-as-failure, sober. ' +
      'A slip is data, never failure. The metric only goes up.',
  );
  lines.push(
    'If the user signals crisis or self-harm: drop the persona, tell them to call/text 988 ' +
      'or text HOME to 741741, and stop coaching.',
  );

  // Compact memory / context (never full history).
  lines.push(`\nContext:\n- Self-awareness reps: ${ctx.selfAwarenessReps}`);
  if (ctx.dangerZones.length) {
    lines.push(
      `- Danger zones: ${ctx.dangerZones.map((d) => `${d.trigger} (${d.count})`).join(', ')}`,
    );
  }
  if (ctx.recentReps.length) {
    const slips = ctx.recentReps.filter((r) => r.type === 'slip').length;
    lines.push(`- Last 7 days: ${ctx.recentReps.length} reps, ${slips} slips.`);
  }
  if (ctx.priorSummary) lines.push(`- Last time: ${ctx.priorSummary}`);

  // F6a anchor behaviour.
  if (mode === 'anchor_capture') {
    lines.push(
      '\nMODE: capture the Future-Self Anchor. Forget the habit for a moment. Elicit, in HIS ' +
        'own words, a short portrait of the man he\'s becoming — e.g. "a year from now, the ' +
        "version of you that's got this handled: what's different about his nights? what does " +
        'he do at 11pm instead?" Draw out 2–4 concrete, user-authored fragments. Do NOT ' +
        'prescribe an ideal of manhood — it must be his words. When you have 2–4 good fragments, ' +
        'reflect them back and end your message with a line exactly like: ' +
        'ANCHOR: ["his words", "his words"]',
    );
  } else if (ctx.anchor?.statements.length) {
    lines.push(
      `\nHis Future-Self Anchor (his own words): ${JSON.stringify(ctx.anchor.statements)}.`,
    );
    if (ctx.lastEventWasSlip) {
      lines.push(
        'He just slipped. Do NOT say "you failed." Gently invoke the anchor in his own words as ' +
          'CURIOSITY, not condemnation — e.g. "that\'s not really the guy who [his words] — ' +
          'where\'d he go tonight?" Then ask a real second question about what pulled him off ' +
          'course (tie to his danger zones). "You\'re failing the man you wanted to be" is BANNED.',
      );
    } else {
      lines.push('Affirm concrete movement toward the anchor. Be specific.');
    }
  } else if (mode === 'checkin') {
    lines.push(
      '\nHe has no anchor set yet — the check-in still works without it. On a genuinely good ' +
        'night you may gently offer to capture one, but never push and never during a low moment.',
    );
  }

  lines.push(
    '\nKeep it to 3–6 turns total. End every message with a single line: SUMMARY: <one sentence ' +
      'of durable memory for next time>. That line is stripped before display — keep it out of ' +
      'the conversational body.',
  );
  if (mode === 'checkin') {
    lines.push('Leave him with one thing to carry into tomorrow.');
  }
  return lines.join('\n');
}

function extractTag(text: string, key: 'SUMMARY' | 'ANCHOR'): {
  cleaned: string;
  value: string | null;
} {
  const re = new RegExp(`^\\s*${key}:\\s*(.+)$`, 'im');
  const m = text.match(re);
  if (!m) return { cleaned: text, value: null };
  const cleaned = text.replace(re, '').trim();
  return { cleaned, value: m[1].trim() };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS });
  }

  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    return json({ error: 'Server misconfigured' }, 500);
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: 'Bad request' }, 400);
  }

  const lastUser = [...body.messages].reverse().find((m) => m.role === 'user');
  if (lastUser && CRISIS.some((re) => re.test(lastUser.content))) {
    return json({ reply: CRISIS_REPLY });
  }

  // Empty history → the coach opens the conversation.
  const messages = body.messages.length
    ? body.messages
    : [
        {
          role: 'user' as const,
          content:
            body.mode === 'anchor_capture'
              ? '(open the anchor conversation)'
              : '(open tonight’s check-in)',
        },
      ];

  const anthropicRes = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: personaPrompt(body.context, body.mode),
      messages,
    }),
  });

  if (!anthropicRes.ok) {
    return json({ error: 'Upstream error' }, 502);
  }

  const data = await anthropicRes.json();
  const raw: string =
    data?.content?.filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('') ?? '';

  // Pull the machine-readable trailers out of the visible reply.
  const afterSummary = extractTag(raw, 'SUMMARY');
  const afterAnchor = extractTag(afterSummary.cleaned, 'ANCHOR');
  let anchorStatements: string[] | undefined;
  if (afterAnchor.value) {
    try {
      const parsed = JSON.parse(afterAnchor.value);
      if (Array.isArray(parsed)) {
        anchorStatements = parsed.filter((x) => typeof x === 'string').slice(0, 4);
      }
    } catch {
      // ignore a malformed anchor line; the reply text still stands
    }
  }

  return json({
    reply: afterAnchor.cleaned,
    summary: afterSummary.value ?? undefined,
    anchorStatements,
  });
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'content-type': 'application/json' },
  });
}
