# `checkin` edge function — AI late-night check-in proxy (F6)

This is the **only** place the Anthropic API key lives. The client calls this
function; this function calls Claude. No key ever ships in the app bundle.

## Deploy

```bash
# 1. Set the key as a secret (never commit it)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# 2. Deploy (no JWT so the app can call it anonymously; add your own rate limiting)
supabase functions deploy checkin --no-verify-jwt
```

## Wire up the client

Set the function's base URL as a build-time public env var (it's a URL, not a
secret). The client appends `/checkin`:

```bash
EXPO_PUBLIC_CHECKIN_PROXY_URL=https://<project-ref>.functions.supabase.co
```

When this is unset, the app hides the check-in and everything else keeps working
offline.

## Contract

`POST /checkin` — body `{ context, messages, mode }` (see
`src/domain/types.ts` → `CheckInContext`, `CheckInMessage`). Returns
`{ reply, summary?, anchorStatements? }`.

- The persona, guardrails, crisis path, and F6a anchor behaviour live in the
  system prompt built here (`personaPrompt`) — server-side only.
- The model is told to append `SUMMARY:` (rolling memory) and, in
  `anchor_capture` mode, `ANCHOR: [...]` (the user's own words). Both trailers
  are stripped from the visible reply before it's returned.
- Model: `claude-opus-4-8`. No `temperature` (removed on 4.8). Confirm the model
  id against current Anthropic docs at deploy time.

## Notes

- This directory is excluded from the app's `tsc` build (it targets the Deno
  edge runtime, not React Native).
- Add auth / per-user rate limiting before a real launch; `--no-verify-jwt`
  leaves the endpoint open.
