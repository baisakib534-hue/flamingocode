# FlamingoCode — Handoff for Qoder

> This file is context for an AI coding assistant (Qoder) taking over development.
> It records what was built, what the owner (Sakib) ordered, and the current state.
> Written 2026-11-03. Repo: https://github.com/baisakib534-hue/flamingocode (public)

## 1. What FlamingoCode is

Sakib's own agentic coding software — like Qoder/Cursor, but his product, his brand.
- **Name:** FlamingoCode (final; was DevForge → DodoCode → FlamingoCode)
- **Logo:** red flamingo pool-float (his own Canva design, customized — no letters)
- **Philosophy:** local-first like Qoder. **NO cloud version** — the user runs it on their own machine.
- **Three parts:**
  - `website/` — marketing site + account/relay backend (Vercel). Plain HTML/CSS/JS, no frameworks, no build step.
  - `desktop/` — the main app. **Electron + TypeScript** shell/UI; **C++/Rust native modules** for performance paths (indexing, graph search, Computer Use driver, sandbox); **Go** for small fast CLI/server pieces.
  - `mobile/` — phone companion app. **Flutter (Dart)**, Android first, iOS later.

## 2. Architecture decisions (his orders — do not change without his word)

- **Built-in free AI = DuckDuckGo AI** (real duck.ai protocol). NOT OpenCode, NOT any other provider. OpenCode is build-tooling only, never a product feature.
- **NO Google login / NO OAuth anywhere.** Auth = email+password accounts on the website → API token. Desktop logs in with email+password (or pastes API token) → "Pair Phone" shows a QR. Phone connects by scanning the QR OR by email+password login.
- **Relay backend** (desktop ↔ phone pairing/tasks) = Vercel serverless functions. **Single entrypoint** `website/api/index.js` — all `/api/*` routes go through it (this was a real bug fix: separate functions had separate memory, so tokens never validated across routes).
- **Per-agent permission tiers:** T1 read-only, T2 local-modify, T3 full — picked at agent creation.
- **Team Mode** is the flagship: one prompt → multiple agents divide work → a Senior Developer AI reviews, sends back for rework until correct.
- **Project Brain:** per-project markdown memory + conversation auto-summarization.
- **Flagships:** Bangla UI + voice input, Prompt Enhancer, Teach Mode, Project Doctor, auto-fix on preview error, screenshot-to-app, never-stuck routing.
- **Quality bar (his words):** 'কাজ করলে একদম ভালো না হলে একটু চাইনা' — completely good or not at all. Verify everything, no half-done work, no AI slop.
- **UI design:** he gave the builder full freedom ("ui design তোমার উপর ছেরে দিলাম") — can copy Qoder's UI or design new. Brand identity (name, flamingo logo) stays.
- **Copy the best features of other AI coding agents** (Devin, Cursor, etc.) — capabilities/mechanisms, NOT their code, names, logos, or exact UI copy.
- **NO separate IDE.** The agent + desktop shell (editor + file tree + terminal + chat) is enough, like Qoder.
- **Phone app is Flutter ONLY.** No Flutter for desktop or web.

## 3. What's built (current state 2026-11-03)

### Desktop — v1.0.2 released ✅
- Release: https://github.com/baisakib534-hue/flamingocode/releases/tag/v1.0.2-desktop
- `FlamingoCode.Setup.1.0.2.exe` (Windows) + `FlamingoCode-1.0.2-arm64.dmg` (macOS)
- v1.0.2 fixes a **launch crash** (`SyntaxError: __dirname already declared` — a local `const __dirname` shadowed Node's CJS wrapper param; renamed to `MAIN_DIR`).
- **Installers are UNSIGNED** — Windows SmartScreen / macOS Gatekeeper warn on first open. Code-signing certs (~$99/yr Apple, ~$70–200/yr Windows) are Sakib's money decision — never buy without his word.
- Built via GitHub Actions: `.github/workflows/release-desktop.yml` (workflow_dispatch with `tag` + `release_name` inputs).

### Phone — v1.0.1 APK released ✅
- Release: https://github.com/baisakib534-hue/flamingocode/releases/tag/v1.0.1-apk — `app-release.apk` (~35 MB)
- Email+password login + QR scan pairing. No Google sign-in.
- Flutter 3.24.5 / Dart 3.5.4. `mobile/pubspec.yaml` pins `speech_to_text: ^6.6.0` (v7.x breaks the Android build).

### Website — live ✅
- https://flamingocode-eta.vercel.app (Vercel project `flamingocode`, Hobby)
- Pages: `/` `/download` `/docs` `/account`. Download page fetches **live GitHub Releases** (latest `-desktop` / `-apk` tags) — do not hardcode "Coming Soon".
- Relay API (`website/api/`): single `index.js` entrypoint dispatching to `_handlers/{auth,devices,tasks,recordings}.js`, shared `_lib/store.js` (Vercel KV if `KV_REST_API_URL`/`KV_REST_API_TOKEN` set, else in-memory — memory is per-instance, KV recommended for production).
- Auth: `POST /api/auth/signup|login` → 64-char hex token (SHA-256 hashed server-side, 30-day expiry). `GET /api/auth/me` validates.
- Devices: `POST /api/devices/register` → `{deviceId: dev_<24hex>, pairCode: 8-char}`; `POST /api/devices/pair` with `{deviceId, pairCode}`.
- Tasks: `POST /api/tasks` `{toDeviceId, envelope}` → `{taskId}`; `GET /api/tasks/poll?deviceId=`; `POST /api/tasks/:id/result` `{result}`; `GET /api/tasks/history`.

### Feature inventory (all in repo, tested)
Stages 0–6, Project Brain, Plan+Build mode, Autonomy Engine, Brain v2, Team Mode v2, Tier A (checkpoints/undo/diff review/backup), voice input, usage dashboard, self-healing preview, prompt library, Tier C (one-click publish, templates, command palette), app integrations hub, account+QR auth. Full test suite: `node ~/workspace/devforge/run-full-suite.cjs` (was 4458 passed, 0 failed) — website tests: `node website/test-website.js`.

## 4. Repo layout

```
flamingocode/
├── website/            # static site + Vercel API
│   ├── api/index.js    # single API entrypoint (DO NOT split into per-file functions)
│   ├── api/_handlers/  # auth.js, devices.js, tasks.js, recordings.js
│   ├── api/_lib/store.js
│   ├── vercel.json     # rewrites /api/* → /api/index
│   └── test-website.js
├── desktop/            # Electron app
│   ├── src/main/       # main process (main.ts — no shadowing of Node globals!)
│   ├── src/preload/
│   ├── src/renderer/   # UI (vanilla TS)
│   └── native/         # Rust (lib.rs), C++ (addon/, screen_capture/, input_simulator/), Go (main.go)
├── mobile/             # Flutter app (56 Dart files, 14 screens)
├── prompts/            # build prompts (stage5-prompt.md, stage6-prompt.md are current; stage5.md/stage6.md are OLD — do not use)
├── PRD.md              # product requirements — read before building a stage
└── .github/workflows/release-desktop.yml
```

## 5. Build commands

```bash
# Desktop (Windows, with VS Build Tools C++, Rust, Go, Node 20 installed)
cd desktop && npm install && npm run build

# Phone (Flutter 3.24.5, Android SDK API 34)
cd mobile && flutter pub get && flutter build apk

# Website — no build; deploy via Vercel (rootDir: website/)
```

## 6. Standing rules from Sakib

- He directs; the builder builds. Report verified results, not claims.
- Never ask twice for credentials/info he already gave — batch requests.
- Money decisions are his alone (certs, credits, top-ups, subscriptions).
- Never rename/delete his installs, keys, or combos without explicit instruction.
- The 9router API key baked into the web app STAYS — do not touch.
- Default language with him: Bengali. Keep replies short, no preamble.
- When he says "test it yourself", test end-to-end in the real surface (live site / real app), not just unit tests.

## 7. Known lessons (don't repeat these mistakes)

- Electron main process: NEVER declare `const __dirname` / `__filename` — they collide with Node's CJS wrapper params and crash at launch. (This shipped in v1.0.1 and crashed on his PC.)
- Vercel: one file per function = separate memory. Keep the single `api/index.js` entrypoint.
- `window.X = X` exposure alone is not wiring — verify handlers are actually called.
- Test files must actually test the feature (a round once shipped 6 slices with 0 tests).
- Never commit `desktop/node_modules` or `desktop/assets/icons/` (build intermediates).
- GitHub PATs need `Contents: read/write` on this repo only; the PAT cannot push workflow files (no `workflow` scope) — workflow edits go through the GitHub web UI.
