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

## 8. Complete order log (every instruction he gave, chronological)

These are his literal orders. When in doubt, obey the latest one on that topic.

1. **2026-10-22:** Open-ended autonomy — "তুমিই যা ভালো মনে করো করতে থাকো শুধু কাজ হলেই চলে" (do what you think is best, only results matter). Money actions still need his word.
2. **2026-10-24 ~10:22:** Standing oversight rule — "আমি তোমাকে যা যা বলেছি সব note করো সব করো আর দেখো সব করেছো কিনা। না করলে করো ওগোও।" (note everything I told you, do it all, check it's all done — if not, do it).
3. **2026-10-24 ~18:38:** "Don't stop until finished."
4. **2026-10-24 ~10:45:** Product renamed twice by him: DevForge → DodoCode → **FlamingoCode** (FINAL). Logo = his very first Canva flamingo pool-float design, customized (no letters).
5. **2026-10-24 ~11:00:** Built-in free AI = **DuckDuckGo AI** (his original recipe) — NOT OpenCode. The OpenCode Zen login offer is WITHDRAWN, never re-offer.
6. **2026-10-24 ~09:56 → 2026-10-27 ~03:25:** Stack — "no Python, use what professionals/Qoder use" → final: **TS+Electron shell/UI, C++/Rust native modules for perf paths, Go for small CLI/server pieces, JS web frontend.** Tauri is OUT.
7. **2026-10-24 ~10:50:** Engine = **Hermes + 9router API only** (flamingocode-build combo). If the 9router path fails, report the EXACT reason — never silently fall back to NVIDIA.
8. **2026-10-24 ~12:21:** Autonomy — FlamingoCode's AI automatically uses whatever skill/plugin/MCP each task needs (no @mention), sub-agents too. The jcode pack (9 skills + 3 MCPs) is MANDATORY, pre-installed.
9. **2026-10-24:** Team Mode = flagship identity (his design): agents talk, divide work, test themselves → **Senior Developer AI reviews everyone's work, sends owner back to rework until correct** → Senior's final report.
10. **2026-10-24:** Context-graph — NO whole-Obsidian embed. Own Brain v2 (plain markdown notes). "Obsidian" he meant = **Graphify** (github.com/Graphify-Labs/graphify), NOT the Obsidian app.
11. **2026-10-24:** Standing feature-invention mandate — the builder invents features in his style, specs them, and builds them; AND copies the best features from other coding software (ideas/mechanisms, never code).
12. **2026-10-24:** Project Brain + **small-request discipline** (one step / one file per small request, per-request token budget).
13. **2026-10-24:** Plan+Build mode (interleaved, live checklist in Brain); roadmap tiers A/B/C; **Time-travel = Tier A checkpoints — do not build it separately.**
14. **2026-10-24:** **NO cloud FlamingoCode** — he runs it LOCALLY like Qoder. Website is FOR TESTING only. The relay STAYS.
15. **2026-10-25 ~10:43:** Kilo / Cline / Codex STOPPED — never resume them.
16. **2026-10-25 ~15:08:** Godmod researched — it is NOT a free-AI provider (routes through user's own keys). Do NOT add as a provider.
17. **2026-10-25 ~22:32:** Copy EVERY Devin feature one by one, even the smallest (capabilities only — not name/logo/UI copy/proprietary code). **Lazy tool loading** — tools/skills/MCPs load only when needed. Keep adding good features from MANY AI agents + GitHub.
18. **2026-10-26 ~02:35:** Core quality principle (his words): 'কাজ করলে একদম ভালো না হলে একটু চাইনা' — completely good or not at all. Fast coding = mistakes = AI slop, which he hates.
19. **2026-10-26 ~14:00:** **Computer Use, general-purpose** — the agent drives ANY installed desktop app for ANY task (his examples: Roblox Studio, Free Fire Craftland, PUBG Studio). Lands at Stage 6 + H4 (web page can't do it; Electron desktop can).
20. **2026-10-26 ~17:48:** Standing order — install MCPs/plugins WHEN NEEDED for the build ("যখন লাগে তখনই লাগিয়ে কাজ করিও").
21. **2026-10-26/28:** Tool Recommender (local keyword matcher, top-3 card, never auto-install in Safe Mode); **Devin Wiki = DeepWiki**.
22. **2026-10-26 ~19:24:** Phone permissions: Ask (default) / Auto approve (routine) / Full access. Offline: desktop work never stops when phone goes offline; a fully offline approval-waiting step waits, the rest keeps running. Message queue for follow-ups during a running task.
23. **2026-10-26:** Devin Cloud credits MAY be spent on hands-on exploration/testing (his explicit exception to the money rule).
24. **2026-10-27:** **NO separate IDE** (agent + desktop shell is enough). REA must do the FULL Devin copy at the Devin Desktop stage.
25. **2026-10-27:** Harn 'ask/architect/code/shadow' modes NOT verified — do not build.
26. **2026-10-28:** Phone app = **Flutter, Android first** — "হ্যাঁ, phone app Flutter-এ বানাও". Flutter is PHONE-ONLY (never desktop/web).
27. **2026-10-29:** ALL THREE per-agent tiers (T1 read-only, T2 local-modify, T3 full) — picked at agent creation, changed only by his explicit action.
28. **2026-10-30:** UI design freedom — "ui design তোমার উপর ছেরে দিলাম" — copy Qoder, change it, or design new; NO restrictions. Brand identity stays.
29. **2026-10-31:** Never wipe API/connection data on redeploy without his explicit approval. Never rename/relabel/delete his own installs.
30. **2026-11-02:** Multi-model RACE — built, then DROPPED by him same day ('ওও আরে এটা বাদ দেও race কোথাও লাগবে না'). Do NOT use or rebuild anywhere.
31. **2026-11-02:** **NO Google Sign-In / NO OAuth anywhere.** Email+password → API token → QR pairing. (Final auth architecture.)
32. **2026-11-02:** The baked-in 9router key in the web app STAYS — do not re-raise. The dead 9router combo is hands-off without his word.
33. **2026-11-02:** Do NOT ask him repeatedly for credentials/info he already gave ("বার বার এসব ভালো লাগে না") — batch once, settle it.
34. **2026-11-02 ~22:02:** Standing E2E order — invent features myself and **test everything myself end-to-end** (real signups, real flows), professional-grade.
35. **2026-10-31:** NVIDIA restriction — ONLY StepFun (step-5-preview) and Nemotron 3 Ultra for free models.
36. **Standing:** "আমার কথা মানো আগে" (obey first when decided) — at most 1–2 sentences of honest objection, then full compliance, never re-argue.
37. **Standing:** Credentials/codes he pastes in chat are session-scoped — use once for the task, never write into memory/files/replies.
38. **Standing:** Money/permission/account decisions are his alone. Pasted credentials never become standing config.
39. **2026-11-03:** Full-C++ rewrite asked → advised against → he accepted ("ঠিক আছে"). Hybrid architecture stands; do not re-raise.
