# Mobile APK + phone→desktop — the phone drives the desktop

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch builds FlamingoCode's mobile app (Android APK first — he is on
Android; iOS later if feasible) and the phone→desktop connection, as IDEAS
implemented originally — never Qoder's/Trae's name, logo, exact UI copy, or
proprietary code. The Qoder mobile screenshots in
`~/workspace/devforge/qoder-ui-notes.md` ("Mobile App UI") are UI
REFERENCE for the phone screens — structure only, never his personal
workspace/device/account names from them.

Full spec: `~/workspace/devforge/mobile-app-spec.md` (§1–§14 + relay +
build order). The mobile stage runs AFTER Stage 6 (the desktop must exist
first, since the phone drives it). This batch builds the WEB-side pieces
NOW — the phone protocol, the companion UI, the relay contract — and the
native APK + relay deploy land at the mobile stage. Never claim the APK
exists before it is built.

Already built that you must EXTEND, never rebuild:
- B4.4 Mobile companion view — the phone UI in this batch EXTENDS it
  (same views, phone-sized), it does not replace it.
- Batch 7.12 message queue (visible queue, Send now, offline-safe) —
  §13 is the SAME queue on the phone, not a second queue.
- Batch 7.2b Tool Recommender (persistent Recommendations sections,
  all state in `appState`) — §14 mirrors the SAME state on the phone,
  never a second recommendations store.
- Batch 5 D10 task inbox + Batch 6 E15 session API + Batch 6 E5
  Automations — the phone reads tasks through the SAME inbox/session
  API, never a second task store.
- Batch 6 E16 video-recorded QA + sandbox §3 recordings — §8 watches
  the SAME records on the phone, never a second record store.
- B2 usage & quota dashboard + Tier A checkpoints — §10 views the SAME
  data on the phone.
- H2.3 Safe Mode (desktop Smart/Manual/Off) — §11 is the PHONE's own
  trio (Ask / Auto approve / Full access), a SEPARATE setting per
  paired desktop. Do not rename the desktop modes.

## Scope — build §1–§14 + relay contract, one at a time, slice by slice

### §1. Login = connection (HIS FLOW — no codes, no manual pairing)
- Step 1: sign UP on the FlamingoCode WEBSITE with a Gmail (the website
  is the account home). Step 2: sign IN on the desktop software with
  that SAME Gmail. Step 3: sign IN on the phone app with that SAME
  Gmail. All three on one account → automatically connected.
- WEB NOW: the account/connection state machine lands in the app —
  `pairingState` (signed-up / desktop-paired / phone-paired), a "Devices"
  panel listing paired devices (desktop + phone, with last-seen), and
  the pairing status shown in the header. The relay + website deploy
  land at the mobile stage; the state machine + panel land now and are
  testable with a simulated phone device.
- A device can be unpaired from the panel (revokes its access); unpaired
  devices are listed separately, never silently deleted.

### §2. Select desktop
- If several desktops are paired, the phone picks which one runs the
  task — a desktop picker (name + last-seen + status: online/offline)
  in the companion view and on the task form. The picker defaults to
  the last-used desktop. An offline desktop shows "Offline — the task
  will queue until it is back" and the task queues (never fails
  silently).

### §3. Select model
- Pick the model for the task FROM THE PHONE — the same model list the
  desktop shows (providers + DuckDuckGo free + custom), with the
  per-model rate-limit state visible. The choice travels with the task
  envelope to the desktop.

### §4. Custom provider add FROM THE PHONE (beyond Qoder/Trae)
- Add a custom provider from the phone itself (base URL + API key +
  model) — it becomes available on the desktop. The form validates the
  base URL + tests the connection (one probe call) before saving, and
  the key is sent ENCRYPTED (per-pair key, §relay) — never in plain
  text in the envelope, never stored on the relay.
- The new provider appears in the desktop's provider list with source
  "added from phone".

### §5. Prompt — text + voice (Bangla + English)
- Text prompt + voice prompt (Web Speech API, bn-BD/en-US toggle —
  same as B1 voice input) from the phone. Voice transcripts are kept
  (not auto-sent) until the user taps send — same rule as the desktop.

### §6. Live progress
- Task status, agent chat, and Team Mode live discussion, all watchable
  from the phone — the companion view streams the session's live events
  (same event timeline, Batch 6 E15) with a "live" indicator and a
  reconnect state when the phone drops.

### §7. Human checkpoints on the phone
- When the Senior needs a big decision, the phone BUZZES (notification)
  and the checkpoint opens on the phone: approve / reject / edit-and-
  approve, exactly like the desktop checkpoint UI. The decision travels
  back with the task id + checkpoint id so the desktop resumes the
  exact step.

### §8. Recordings on the phone
- Watch the test videos + reports from the phone — the recording page
  (sandbox §3) is phone-friendly: video + checklist + report, served
  through the relay. A recording link is attached to its task and its
  fix task.

### §9. Notifications
- Task done / failed / needs-you — a notifications list in the
  companion view (and a push hook for the native app at the mobile
  stage). Each notification links to its task. Notifications are
  per-device (a phone notification never marks the desktop's as read).

### §10. Extras
- Brain notes view (read the project's Brain from the phone), cost +
  quota meter (same B2 data), checkpoint restore FROM THE PHONE (pick a
  checkpoint, confirm, the desktop restores it), voice-to-build (a voice
  prompt that starts a build directly), task history (all past tasks
  with status + result).

### §11. Phone permissions — Ask / Auto approve / Full access (his trio)
- Per paired desktop, exactly his three modes: **Ask** (default — every
  permission step asks on the phone first), **Auto approve** (routine
  work auto-approved — edits inside the project, running tests,
  installing a recommended tool; dangerous steps — deleting files,
  payments, publishing, commands outside the project — STILL ask on
  the phone), **Full access** (everything auto-approved, the desktop
  never waits for the phone).
- The setting lives per desktop in the Devices panel. With Full access
  or Auto approve ON, an offline phone never stalls routine desktop
  work; with Ask, an approval-waiting step waits (needs-help state)
  until the phone answers.
- NEVER auto-install from the phone in ANY mode — Install is always his
  explicit tap (§14).

### §12. Offline phone
- The work runs ON THE DESKTOP, the phone is only the remote — the phone
  going offline NEVER stops desktop work.
- Sending a new prompt, watching live progress, or approving a checkpoint
  normally needs internet on the phone (relay route). EXCEPTION: same-
  WiFi LAN mode — when phone and desktop are on the SAME WiFi, the phone
  talks to the desktop DIRECTLY over the local network, no internet
  needed. A LAN-mode indicator shows when it is active.
- Fully offline phone (no WiFi, no mobile data, not on the desktop's
  network): no new prompt or approval can reach the desktop — the
  waiting step waits (needs-help) while everything else keeps running,
  and the phone catches up when back online (queued items sync, §13).

### §13. Message queue on the phone (his catch)
- While a task runs, the phone lets him send follow-up messages anyway —
  they go into a VISIBLE queue (each shows its order; tap to edit,
  delete, or "Send now"). When the running task finishes, the next
  queued message auto-sends to the desktop as a follow-up in the same
  session. "Send now" reaches the agent immediately as a follow-up
  (handled after its current step).
- Queued messages stay on the phone while offline and sync when back
  online (same-WiFi LAN mode included). This is the SAME queue as
  Batch 7.12 — one store, phone view + desktop view.

### §14. Recommendations on the phone
- The phone mirrors recommendations: a Recommendations section (the same
  accumulated not-installed list as the desktop pages) plus a
  notification per new recommendation. From the phone he can Install /
  Dismiss / "Don't suggest again" exactly as on desktop — the install
  lands on the desktop.
- NEVER auto-install from the phone: Install is always his explicit tap,
  in every mode. Offline phone: recommendations wait and appear when
  back online; an offline Install tap queues and syncs.

### Relay contract (build + Vercel deploy at the mobile stage)
- The relay is the meeting point + account home: repo
  `baisakib534-hue/flamingocode-relay` (new, small), deployed on Vercel
  free tier. Endpoints (CONTRACT — implement the client side now, the
  server at the mobile stage): register device (desktop/phone), list
  paired devices, send task, poll task status + results, fetch
  recording links. Dashboard: paired devices + tasks.
- Security (non-negotiable): the relay routes task envelopes; it NEVER
  stores raw provider keys unencrypted — keys travel encrypted with a
  per-pair key derived at pairing, and live only on the desktop.
- WEB NOW: the relay CLIENT (envelope build/send/poll, device
  register/list) lands in the app with a configurable relay URL
  (defaulting to a placeholder that says "relay deploys at the mobile
  stage") and a "Test connection" that reports honestly.

## Rules (non-negotiable)

- Small slices, commit after every 2–3 slices (the verifier commits +
  pushes; make each slice independently correct so a partial commit is
  never broken).
- Every new function/identifier you add MUST exist in index.html and be
  exercised by the new test suite — assert ONLY identifiers/behaviours
  that actually exist in index.html. Never assert a name you only planned.
- No AI slop: every feature must work end-to-end in the app, wired into
  real UI (panel/tab/button), not a dead function. Bengali UI text follows
  the app's existing i18n pattern (full-English-string keys).
- Respect the caps: Brain digest ~1500 tokens, checkpoints cap 30, no
  second graph/index/queue/store/scheduler/session-log/task store/
  recommendations store. §13 is the 7.12 queue; §14 is the 7.2b state.
- Safe Mode (H2.3) still gates everything dangerous: §11 is the phone's
  own trio and never overrides the desktop Safe Mode; §4 keys travel
  encrypted; the relay never stores raw keys.
- Honesty is a feature: the APK + relay deploy land at the mobile stage.
  This batch builds the protocol + companion UI + relay client, testable
  with a simulated phone device. Never claim the APK exists.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the desktop Safe
  Mode names (Smart/Manual/Off).

## Tests (required, same pattern as every batch)

- New suite `test-mobile-app.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each §1–§14 + relay with at least 2 assertions on REAL behaviour:
  the pairing state machine advances signup → desktop-paired →
  phone-paired with no codes, and unpairing revokes access; the desktop
  picker lists paired desktops with online/offline and queues a task for
  an offline desktop; the model picker shows the same list + rate-limit
  state and the choice travels in the envelope; a custom provider added
  from the phone validates + probes before saving, its key travels
  encrypted, and it appears on the desktop as "added from phone"; a
  voice prompt keeps its transcript until sent; live progress streams
  session events with a live indicator; a checkpoint buzzes the phone
  and approve/reject resumes the exact step; a recording is watchable
  from the phone view; notifications list done/failed/needs-you with
  links; Brain + cost meter + checkpoint restore + voice-to-build +
  task history all work from the phone view; the permission trio
  behaves per mode (Ask waits, Auto approve passes routine but asks
  on dangerous, Full access never waits) and Install never auto-fires;
  LAN mode is detected on same-WiFi and used without internet, and a
  fully offline phone leaves desktop work running while the waiting
  step holds; the queue edits/deletes/sends-now and auto-sends the
  next message when the task finishes, surviving offline; phone
  recommendations mirror the desktop list and Install/Dismiss/"Don't
  suggest again" work from the phone with offline Install queuing;
  the relay client builds/sends/polls envelopes against the contract
  and reports honestly when the relay URL is the placeholder.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per section: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
