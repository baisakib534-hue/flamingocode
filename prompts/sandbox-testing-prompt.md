# Sandbox + Universal Testing + Record — own computers, every target, always a recording

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Devin's sandbox/testing/record capabilities as IDEAS,
implemented originally — never Devin's name, logo, exact UI copy,
proprietary code, or proprietary models. Everything ships as FlamingoCode,
with his providers + DuckDuckGo free.

His order (2026-10-24 ~12:59 +06 — his catch, a gap he found himself):
"own sandbox থাকবে। Mobile app, software সব testing করবে পরে Record
দিবে তাই না আমার coder? এই সব লাগাও নাই?" — the sandbox, the universal
testing, and the recording must be explicit and end-to-end, not implied.

Full spec: `~/workspace/devforge/sandbox-testing-spec.md` (§1–§5).
Method note (his orders 2026-10-26 ~19:44 + 19:48): at the Devin Desktop
stage, FIRST hands-on click+test EVERYTHING in his Devin Cloud account
(carrycle@gmail.com — Devin credits AUTHORIZED for that work), THEN REA
reverse-engineering. That work refines this build afterwards; do NOT wait
for it — build the spec as written now.

Already built that you must EXTEND, never rebuild:
- B3 self-healing preview loop (Preview Health panel, error capture,
  runPreviewFixCycle cap 5, needs-help state) — §2 web testing extends
  it, it does not replace it.
- Batch 5 D6 desktop-app testing harness + D9 post-deploy monitoring —
  §2 desktop/mobile testing uses the SAME step language, never a second
  test language.
- Batch 6 E16 video-recorded QA sessions — §3 recordings use the SAME
  record shape, never a second record store.
- H4 §14 real browser agent (CDP) + §15 Computer Use + §16 terminal
  backends — §1 sandboxes are WHERE those drivers run; §4 VMs are the
  computers they run on. Do not duplicate the drivers.
- Batch 5 D8 long-running tasks + Tier A checkpoints — §1 snapshots use
  the SAME checkpoint system, never a second one.

## Scope — build §1–§5, one at a time, slice by slice

### §1. Own sandbox (per project / per task)
- Every project/task runs in its OWN isolated sandbox: own filesystem,
  own terminal, own browser, own environment vars. Safe to run
  untrusted/generated code — it cannot touch the user's real machine or
  other projects.
- Sandbox panel per project: name, status (running/stopped), what is
  inside it (files, processes, browser), RESET in one click, SNAPSHOT
  before risky operations (uses the Tier A checkpoint system — a
  snapshot IS a checkpoint with a label).
- The agent's shell + editor + browser all live INSIDE the sandbox.
  WEB app: the sandbox runs in the cloud/host. DESKTOP app (Stage 6):
  the sandbox runs locally on the user's machine. The panel states
  which one is in use.
- A sandbox is created automatically with every new project/task and
  destroyed (archived, restorable for 7 days) when the task is deleted.
  Never silently delete a sandbox with unmerged work.

### §2. Universal testing (everything, not just websites)
One test runner, every target, same step language (Batch 5 D6):
- **Websites / web apps** — real browser: click everywhere, forms,
  drag & drop, sliders, responsive sizes (phone/tablet/desktop).
  Runs in the preview iframe now (Stage 5), real Chromium at Stage 6
  (H4 §14).
- **Desktop software** — computer-use: launch the app, click menus,
  type, drag, verify windows and dialogs (Stage 6 Electron apps, H4 §15).
  The web app runs the SAME steps against the web preview and labels
  them honestly.
- **Mobile apps** — mobile-web + responsive testing in the web app
  (phone-sized viewports for BOTH Android and iPhone sizes — never
  iPhone-only); full native Android app testing via emulator in the
  desktop app (Stage 6): launch, tap, swipe, type, verify screens.
  iOS native testing runs on a macOS session (iOS Simulator) — the
  panel states this plainly.
- **APIs / backends** — send requests, check responses, error cases.
  A request builder in the test panel (method, URL, body, expected
  status) with saved cases per project.
- **CLIs** — run commands, check outputs and exit codes.
- EVERY failure becomes an automatic fix task (Batch 3 auto-fix on
  error) with the failing step attached. A test run never ends with a
  silent failure.

### §3. Record — every test session gives a recording
- After testing, the user ALWAYS gets a record: a VIDEO recording of
  the whole test session (screen capture — what was clicked, what
  happened, where it failed) + a step-by-step log alongside it (click →
  result) + a pass/fail report with the failing step TIMESTAMPED in
  the video.
- The recording is watchable FROM THE PHONE (he lives on his phone):
  the record is a phone-friendly page (video + checklist + report) the
  relay serves to the mobile app.
- Failed sessions keep their recording ATTACHED to the fix task, so the
  agent re-tests against the same recording. A feature is NOT done
  without its recording — the task cannot be marked done until its
  recording exists (same gate as Batch 6 E16).
- WEB NOW: the record shape + storyboard (text steps with timestamps)
  + report land now; real screen video arrives with the Stage 6
  drivers (H4 §14/§15). The record shape MUST already carry a video
  slot. Never claim a storyboard is a video.

### §4. Own computers — Windows, Mac, Linux VMs
- Per task, the sandbox spins up its OWN virtual computer(s): Linux
  first (web app stage), Windows + Mac added with the desktop/cloud
  stage — the agent builds, tests and records on THOSE machines, never
  on the user's real machine.
- A "Computers" panel: which VMs exist for this task (Linux now;
  Windows/macOS labelled "desktop/cloud stage"), their status, and the
  blueprint each boots from (emulator pre-installed into the VM
  snapshot for mobile tasks — never installed ad hoc).
- Mobile app testing is part of every run, for BOTH platforms — Android
  AND iPhone: phone-sized viewports for both, side by side with the
  desktop app in ONE session ("Devin's computer" pattern: mobile screen
  + desktop app, side by side). Never iPhone-only.
- Live test checklist UI: "Testing 3/12" style — every test listed with
  its time + pass/fail checkmark, updating LIVE while the agent clicks
  through.
- Verified mechanics to respect: Android = FULL emulator inside the VM,
  two modes — adb (install APK, Espresso/instrumented tests, logcat,
  screenshots, scripted taps) + Computer Use (mouse tap/swipe/type on
  the emulator window, video record). iOS = iOS Simulator on a macOS
  session (NOT in the Linux VM). Skill-learning loop: after testing,
  emulator/build/navigation learnings persist into the project (Brain)
  so the next test is faster. KVM gotcha: the emulator needs hardware
  acceleration; without it, -no-accel software rendering is very slow —
  the desktop stage must plan for this (the panel shows the
  acceleration status honestly when known).
- WEB NOW: the Linux computer + the checklist UI + the side-by-side
  mobile viewports land now; Windows/macOS VMs and the real emulators
  land with the desktop/cloud stage, labelled as such.

### §5. End-to-end flow (no gaps)
- Build → run in own sandbox → test on every target → record video +
  report → auto-fix failures → re-test → record again → done ONLY when
  green + recording delivered.
- A "Flow" status line on every task shows where it is in that chain
  (build ✓ → sandbox ✓ → test 3/12 → record ✓ → fix 1 → re-test…),
  and the DONE gate enforces it: no green without a recording, no
  recording without a test run, no test run without a sandbox.
- This is part of Stage 5 (self-testing), extended to all targets, and
  the sandbox ships with the product from the start.

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
  second graph/index/queue/store/scheduler/session-log/test language/
  record store. §1 snapshots ARE Tier A checkpoints. §3 records ARE the
  E16 record shape. §4 learnings go to the Brain.
- Safe Mode (H2.3) still gates everything dangerous: the sandbox is the
  default place untrusted code runs; a test that would touch the real
  machine is refused with a plain message.
- Honesty is a feature: storyboard ≠ video, preview test ≠ real-browser
  test, Linux now ≠ Windows/macOS now. Every staged capability is
  labelled with when it becomes real.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5 D6
  step language (extend it, do not replace it).

## Tests (required, same pattern as every batch)

- New suite `test-sandbox-testing.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each §1–§5 with at least 2 assertions on REAL behaviour:
  a sandbox is created per project with its own files/processes/browser,
  resets in one click, and snapshots through the checkpoint system; a
  sandbox with unmerged work archives instead of deleting; a web test
  clicks through a page and a failure becomes a fix task with the step
  attached; an API test case sends a request and checks the status; a
  CLI test checks output + exit code; a mobile test runs both Android
  and iPhone viewports side by side; a recording exists for every
  finished test session with step log + timestamped failures, is
  attached to its fix task, and blocks DONE until it exists; the
  Computers panel lists Linux now and labels Windows/macOS as staged;
  the live checklist shows "Testing 3/12" with per-test time + result;
  a learning from a test persists into the Brain; the flow status line
  advances through build → sandbox → test → record → fix → re-test →
  done, and DONE is refused without a recording.
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
