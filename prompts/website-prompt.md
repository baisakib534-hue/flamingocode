# FlamingoCode Website + Relay — Spec

## Context

FlamingoCode is his own agentic coding software (local-first, like Qoder —
NO cloud FlamingoCode; he runs it locally). The website serves two purposes:

1. **Product website** — landing page, features, downloads (desktop/phone
   binaries when ready), docs. Also my test bench.
2. **Account home + relay** — the meeting point between his phone app and
   his desktop app. Signup happens here first (Gmail); then signin on
   desktop + phone with the same Gmail = paired. Dashboard shows paired
   devices + tasks.

His order (2026-10-24): "FlamingoCode website (web app + account home/relay)
in this or a new repo, live on Vercel." His later clarification: relay
STAYS, build the website too if needed — no restriction.

## Repo location (PAT constraint)

The VM's GitHub PAT is scoped ONLY to `baisakib534-hue/flamingocode`.
Do NOT create a new repo. Build everything under `website/` in THIS repo.
Vercel deploys with Root Directory = `website/`.

## Stack

- Static site: plain HTML/CSS/JS (no framework, no build step) — matches
  the repo's conventions (see AGENTS.md).
- Relay endpoints: Vercel Serverless Functions under `website/api/`
  (Node.js, plain — no framework needed).
- Datastore: Vercel KV (free tier) for device registry + task envelopes.
  If KV is unavailable at build time, implement a clean storage interface
  (`website/api/_lib/store.js`) with an in-memory fallback clearly marked
  as dev-only, so KV can be plugged in via env vars.
- Brand: FlamingoCode name, his flamingo artwork
  (`~/workspace/devforge/brand/` — the red flamingo pool-float logo,
  body #f0513b, beak #2ec4b6). No AI-slop gradients; match the app's
  dark professional theme from the UI polish.

## Pages (website/)

1. `index.html` — landing: hero with logo + tagline, feature highlights
   (agent teams, Brain, voice, desktop + phone), download buttons
   (desktop/phone — show "coming soon" honestly until binaries exist in
   the repo release; NEVER fake a download link).
2. `download.html` — download page: lists Windows .exe, macOS .dmg,
   Android .apk when present in the GitHub release; otherwise honest
   "not yet released" state. Links to the repo release page.
3. `docs.html` — short docs: what FlamingoCode is, quickstart (desktop),
   phone pairing overview, FAQ.
4. `account.html` — account home:
   - Signup/signin with Gmail (Google Identity Services; client ID from
     env var `GOOGLE_CLIENT_ID`; if unset, show an honest "not configured"
     state — never a fake login).
   - Dashboard (signed in): paired devices list (desktop/phone, with
     names + last-seen), task history, recordings links.
5. Shared `style.css` + `app.js` — no duplication across pages.

## Relay API (website/api/)

All endpoints JSON in/out. Auth: the Gmail identity from account signin
(session token in `Authorization: Bearer <token>`; tokens issued at
signin, stored hashed in KV, 30-day expiry).

- `POST /api/devices/register` — {name, type: 'desktop'|'phone', pushToken?}
  → {deviceId, pairCode}. Registers a device to the signed-in account.
- `GET /api/devices` — list paired devices for the account
  → [{deviceId, name, type, lastSeen}].
- `DELETE /api/devices/:id` — unpair a device.
- `POST /api/tasks` — {toDeviceId, envelope} → {taskId}. Sends a task
  envelope to a paired device. The envelope is OPAQUE to the relay —
  the relay never reads inside it.
- `GET /api/tasks/poll?deviceId=` — long-poll (up to 25s, Vercel limit)
  for pending tasks for a device → [{taskId, envelope}]. Marks delivered.
- `POST /api/tasks/:id/result` — {result} → {ok}. Device posts the result.
- `GET /api/tasks/:id` — fetch task status + result (for the sender).
- `GET /api/recordings/:id` — signed link to a recording (recordings
  themselves stored wherever the desktop puts them; the relay only
  hands out the link the desktop registered).

## Security rules (HARD)

- The relay NEVER stores raw provider API keys. Keys travel inside the
  opaque envelope, encrypted with a per-pair key derived at pairing time
  (device-to-device); the relay cannot decrypt them.
- Tokens stored hashed (SHA-256). Rate-limit register + task send
  (simple per-IP bucket in KV).
- CORS: allow the desktop app + phone app origins; `*` is acceptable
  for v1 with the auth token required on every endpoint.
- No PII beyond Gmail + device names. No analytics, no trackers.

## Vercel config

- `website/vercel.json` — functions config, clean URLs, no framework.
- Root Directory on Vercel = `website/`. Document the exact dashboard
  steps in `website/DEPLOY.md` (project import, root dir, env vars:
  `GOOGLE_CLIENT_ID`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`).
- Free tier only. No paid add-ons.

## Tests

- `website/test-website.js` — NO-JSDOM extraction-eval pattern like the
  repo's other suites: assert pages exist with required sections, no fake
  download links, relay endpoint files exist with the documented routes,
  security rules hold (no key storage, hashed tokens, auth required).
- Minimum 40 assertions. Must exit 0.

## Build rules (repo AGENTS.md)

- Read PRD.md + AGENTS.md first. Build ONLY this batch, then stop.
- Vanilla HTML/CSS/JS + plain Node functions. No npm packages for the
  site itself.
- Commit: "Website + relay: product site, account home, task relay API".
- Do NOT push (verifier pushes after independent verification).
- Be honest in the summary about what is real vs placeholder (e.g.
  Gmail OAuth needs his client ID; KV needs env vars; download links
  appear only when release binaries exist).
