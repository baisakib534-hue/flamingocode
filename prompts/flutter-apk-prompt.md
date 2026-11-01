# FlamingoCode Mobile — NATIVE Flutter APK (his order)

**STACK (his decision 2026-10-28 ~00:42 +06): native APK in Flutter (Dart),
Android first. Flutter is PHONE-ONLY.** This prompt builds ONLY the native
phone app. The desktop stays Electron, the web app stays HTML/CSS/JS.

## WHAT ALREADY EXISTS (do not rebuild)

- **Relay website + API: LIVE at https://flamingocode-eta.vercel.app**
  (repo `website/` folder). Endpoints (see `website/api/*.js` for the exact
  contract — READ them before coding):
  - `POST /api/auth/signup` + login — Gmail-based accounts, Bearer token
    auth (SHA-256 hashed tokens server-side). Rate limited.
  - `POST /api/devices/register` `{name, type: 'desktop'|'phone', pushToken?}`
    → `{deviceId, pairCode}`. `GET /api/devices` lists paired devices.
  - `POST /api/tasks` — send task `{deviceId, prompt, model, provider?, permission?}`.
    `GET /api/tasks?deviceId=` — poll status + results.
    Task envelope: `{id, status: queued|running|needs-help|done|failed,
    messages: [...], result?}`.
  - `GET /api/recordings?taskId=` — recording links (video URL + report).
- **Web-side companion pieces** already in `index.html` (phone protocol,
  companion UI, relay contract, message queue, recommendations mirror).
  The native app must speak the SAME protocol — feature parity with the
  web companion, not a redesign.
- **Brand:** FlamingoCode name; his flamingo logo artwork is at
  `~/workspace/devforge/brand/flamingocode-logo-transparent.png`
  (copy it into the Flutter assets — do NOT redraw it).

## WHERE TO BUILD

New folder `mobile/` in this repo. `flutter create` was NOT run — create
the project with `flutter create --org com.flamingocode --project-name
flamingocode_mobile mobile` (package `com.flamingocode.mobile`).
Commit in small slices.

## VM TOOLCHAIN SETUP (READ THIS FIRST — the environment is special)

The VM has NO direct internet for Java/Dart (egress proxy blocks them).
A local pub mirror + forward proxy are ALREADY RUNNING — use them:

- **Pub mirror:** `http://127.0.0.1:8080` — ALWAYS export
  `PUB_HOSTED_URL=http://127.0.0.1:8080` before ANY `flutter`/`dart pub`
  command. Without it, `pub get` hangs forever.
- **Flutter SDK:** `~/flutter-sdk/bin/flutter` (3.24.5). Add to PATH.
- **Java:** `~/jdk` (Temurin 17). Export `JAVA_HOME=~/jdk`.
- **Android SDK:** `~/android-sdk`. Export `ANDROID_HOME=~/android-sdk`
  and `ANDROID_SDK_ROOT=~/android-sdk`.
- **Gradle:** pre-downloaded at `~/.gradle/wrapper/dists/`. The Gradle
  daemon does NOT work on this VM — if `flutter build apk` fails on the
  Gradle step, report it honestly; the Dart code + `flutter analyze` +
  `flutter test` are the verifiable deliverables here.
- **Full env for every flutter command:**
  `export PUB_HOSTED_URL=http://127.0.0.1:8080 JAVA_HOME=~/jdk ANDROID_HOME=~/android-sdk ANDROID_SDK_ROOT=~/android-sdk PATH=~/flutter-sdk/bin:~/jdk/bin:$PATH`
- If `127.0.0.1:8080` is dead (VM restarted), restart the mirror:
  `nohup python3 ~/workspace/pub-mirror.py > ~/workspace/pub-mirror.log 2>&1 &`
  (and `~/workspace/flutter-proxy.py` on port 8888 the same way).

## FEATURES (from mobile-app-spec.md — ALL of them, his words are the spec)

1. **Login = connection (HIS FLOW).** Sign IN with the same Gmail used on
   the website + desktop. No codes, no manual pairing — same account =
   automatically connected. Store the token in flutter_secure_storage.
2. **Select desktop** — list paired desktops (`GET /api/devices`,
   `type=desktop`); if several, a picker. Remember the last choice.
3. **Select model** — model picker per task (text list from a bundled
   `assets/models.json`; include his 9router + DuckDuckGo free models).
4. **Custom provider add FROM THE PHONE** — form: name + base URL + API
   key + model; saved per account; becomes selectable as a provider.
   The key is sent to the DESKTOP via the relay task envelope (the phone
   never needs the desktop to have it pre-configured).
5. **Prompt** — text field + **voice input (Bangla + English)** via
   speech_to_text; language toggle bn-BD/en-US; interim transcript shown,
   final text kept in the field (not auto-sent).
6. **Live progress** — task status timeline, agent chat messages
   (streamed via polling `GET /api/tasks`), Team Mode live discussion
   view (messages tagged by agent name).
7. **Human checkpoints** — when a task hits `needs-help`, a full-screen
   checkpoint card: the question, context, Approve / Reject buttons;
   local notification buzzes (flutter_local_notifications).
8. **Recordings** — per-task recordings page: video player
   (video_player, from the relay URL) + pass/fail report view.
9. **Notifications** — task done / failed / needs-you via
   flutter_local_notifications (local polling; FCM later).
10. **Extras:** Brain notes view (read-only list from relay or bundled
    placeholder), cost + quota meter (per-task cost display),
    checkpoint restore (list checkpoints, restore tap), voice-to-build
    (voice prompt → send), task history (past tasks, tap to reopen).
11. **Phone permissions — Ask / Auto approve / Full access (HIS TRIO,
    per paired desktop, Ask = default).**
    - Ask: every permission-needing step asks on the phone first.
    - Auto approve: routine auto-approved; delete / payment / publish /
      outside-project commands STILL ask.
    - Full access: everything auto-approved, desktop never waits.
    The chosen mode is sent with each task (`permission` field) and
    shown as a segmented control on the desktop-picker screen.
12. **Offline.** The phone is a remote — desktop work NEVER stops when
    the phone goes offline. Same-WiFi **LAN mode**: if the desktop's
    local address is known, talk directly (setting: desktop LAN URL).
    Fully offline: no new prompt/approval can go out; approval-waiting
    steps show `needs-help` and wait; the phone catches up on reconnect.
13. **Message queue (his catch).** During a running task, a "Queue"
    button opens the visible queue: each queued message shows its order
    with edit / delete / "Send now". Next queued message auto-sends when
    the running task finishes. Queue persists on-device (shared_preferences
    or sqlite) and syncs when back online.
14. **Recommendations (his order).** Recommendations section mirroring
    the desktop list; each card: Install / Dismiss / "Don't suggest
    again". Config-box cards (name + labelled input boxes, e.g. Supabase
    URL + keys) — fill on phone, submit → install lands on desktop.
    NEVER auto-install: Install is always his explicit tap, in EVERY
    permission mode. Offline Install taps queue and sync.

## QUALITY BAR (his standing rule)

- No AI slop. Every screen must look deliberate: consistent spacing,
  his brand, real empty states, real error states, loading skeletons.
- `flutter analyze` MUST be clean. `flutter test` — write widget tests
  for: login flow, task send, message queue (add/edit/delete/reorder),
  permission-mode segmented control, checkpoint approve/reject.
- Then `flutter build apk --release`. The APK is the deliverable.
- Honesty: if the relay is unreachable, say so in the UI (no fake
  data). The demo/placeholder relay URL from the web companion is NOT
  acceptable here — use the live `https://flamingocode-eta.vercel.app`.

## DELIVERABLES

- `mobile/` Flutter project, committed in slices with clear messages.
- `flutter analyze` clean + `flutter test` passing (report counts).
- `mobile/build/app/outputs/flutter-apk/app-release.apk` built.
- NEVER commit `build/` output or `.dart_tool/` — `.gitignore` them.
- Summarize honestly: what works, what was verified, what is stubbed.
