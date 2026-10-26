# Batch 8b — sweep leftovers: collaboration, context, transparency, skills

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Already built that you must EXTEND, never rebuild:
- Batch 8a F4 (Goose serve) is the ONE programmatic API — G7 (SDK) is a
  CLIENT of it, never a second API.
- Batch 5 D3 smart model routing + per-model rate limits — G9 (model roles)
  and G16 (mid-task switch) route THROUGH it, never a second router.
- Batch 5 D11 repo learning (conventions) + Brain v2 — G18/G19 (implicit
  memories / ambient context) write to the SAME Brain, never a second memory.
- H1.5 session search + Batch 6 E15 session API — G3 (cross-session
  messaging) uses the session API, never a second session channel.
- Batch 6 E12 CI/CD autotriage — G11 (AI checks in CI/CD) triggers it, it
  does not re-implement triage.
- Batch 6 E5 Automations + H5.1 scheduled tasks — G17 (background agents on
  repo events) uses the SAME automations engine, never a second scheduler.
- H1.4 context files + Tier A checkpoints — G14 (event-sourced replay)
  records events into the SAME session store, never a second log.
- Batch 7.3 Superpowers (TDD iron law, brainstorm-before-building) — do NOT
  rebuild. Batch 8a F7 (custom modes) — G8 (per-mode model) extends it.
- Dedupe (from the sweep): #26 Spec Kit = #14 Kiro spec flow (built in
  Batch 7.6) — do not rebuild; #49 Quest Mode = H1's long-task form — not
  separate; MCP tool budget ~40/config is a DESIGN RULE for the MCP
  manager, not a feature — enforce it in the MCP page (warn over 40 tools
  per config) and note it, do not build a feature around it.

## Scope — build all 19, one at a time, slice by slice

### G1. Next Edit Suggestions (Copilot)
- After the agent (or the user) edits a file, the editor offers the most
  likely NEXT edit as a ghost suggestion (based on the code graph: the
  callers/callers-of-callers of the edited symbol, and the same edit
  pattern in sibling files). Tab accepts, Esc dismisses.
- The suggestion is LOCAL and rule-based (graph neighbours + recent edit
  pattern) — never a model call per keystroke. A wrong suggestion costs
  nothing: it is one keypress away from gone.

### G2. Copilot Spaces (shared context spaces)
- A "Space" is a named bundle of context for one task: files, Brain notes,
  a repo-map slice, and a goal line — saved under `.devforge/spaces/` and
  attachable to any task or team. Starting a task in a Space loads exactly
  that context (inside the digest cap), nothing else.
- Spaces are shareable: export a Space as one JSON (A3-style) and import it
  into another project. A Space shows its token cost before the task starts.

### G3. Cross-session messaging (Claude Code)
- Sessions can message each other through the Batch 6 E15 session API:
  from a session, "Send to session…" picks another live session and sends
  it a note ("backend API টা ready — তুমি frontend এ এটা use করো"); the
  receiving session shows it as a chat message from the sender session,
  with accept ("use this") / ignore.
- Messages are events on both sessions' timelines (G14) so the hand-off
  is replayable. A session that is terminated never receives messages —
  the sender is told so, plainly.

### G4. Prompt suggestions
- After a task finishes, the chat offers 3 follow-up prompts based on what
  just happened ("এবার test গুলো চালাও", "এই feature টার docs লিখে দাও",
  "এই কোডটা review করো") — generated locally from the task's outcome
  (files changed, tests run, errors seen), never a model call.
- One tap sends the suggestion as the next message. Suggestions the user
  never taps fade after the next task starts.

### G5. Output styles
- Response style presets for the agent's chat answers: Concise (short,
  Bengali, no fluff), Detailed (step-by-step, with file references),
  Teacher (Teach Mode style — every change explained in simple Bengali).
- The style is a per-project setting + a per-message override in the chat
  input. The style NEVER changes what the agent builds — only how it
  talks about it. Default: Concise.

### G6. Ultrathink toggle (Claude Code)
- A per-task toggle: "Ultrathink" gives the agent a bigger thinking budget
  for hard tasks — more planning passes before the first edit, deeper
  verification after (extra test round + Adversary round, Batch 8a F6).
- The toggle shows its cost honestly before the task starts ("Ultrathink
  ≈ 2–3× tokens") and the Usage tab records Ultrathink spend separately.
  It is OFF by default and never turns itself on.

### G7. SDK / programmatic API (Codex — client of the ONE API)
- A tiny in-app SDK shape: `flamingocode` JS client (documented in the
  Serve panel, Batch 8a F4) — `createTask(prompt)`, `onEvent(taskId, fn)`,
  `getResult(taskId)` — calling the SAME endpoints F4 defined. The SDK
  code lives in the app as a documented snippet the user can copy into
  their own scripts; the in-app runner can execute SDK calls against the
  live session store.
- Never a second endpoint set, never a second auth scheme: the SDK uses
  the same per-project key the Serve panel already issues.

### G8. Per-mode model (Cline)
- Each mode (Chat/Plan/Plan+Build/Architect + custom modes, Batch 8a F7)
  can have its OWN default model, set in the mode editor. Switching modes
  switches the model in the header picker, visibly, with a one-line note
  ("Plan mode → <model>").
- A mode with no model set inherits the project default. The per-mode
  model still respects rate limits + smart routing (Batch 5 D3) — the
  mode picks the DEFAULT, routing picks the step's model.

### G9. Model roles (Aider + Roo + Continue — ONE mechanism, three sources)
- Roles, not models, per job: Planner (plans), Coder (writes), Reviewer
  (Senior review), Tester (runs tests). Each role maps to a model in
  Settings → Model roles. Team Mode agents take their model from their
  ROLE by default; a single-mode task uses Planner for planning steps and
  Coder for build steps (through the D3 router).
- Changing a role's model once changes it everywhere that role is used.
  This is the single roles mechanism — the three sweep sources describe
  the same thing, built once.

### G10. Continue Hub (Continue) — shared config, local-first
- A Hub is a folder of shared config (models, rules, modes, powers) that
  several projects can point at: export the current project's shareable
  config as a Hub JSON, import a Hub JSON into another project (merge,
  never overwrite — conflicts are shown and the user picks per item).
- Hubs are FILES the user owns (export/import), not a cloud account —
  local-first by design. A project shows which Hub it follows, if any.

### G11. AI checks in CI/CD (Continue)
- When the user exports a CI config (GitHub Actions YAML, from a template
  in the app), an optional "FlamingoCode checks" step is included: on
  every push it runs the agent's checks (lint via the app's own rules,
  the Security Swarm quick profile, the review rules from Batch 6 E1)
  and posts the result as a check summary.
- The CI step calls the Batch 6 E12 autotriage when it fails — the failure
  lands in the app's triage view with its fix proposal. The template is
  generated, never auto-committed to the user's repo without approval.

### G12. Rules-file priority chain (Zed)
- When rules disagree, precedence is explicit and shown: project
  `.devforge/rules.md` > `AGENTS.md` > steering files (Batch 8a F10) >
  global user rules > built-in defaults. The Rules panel shows the chain
  and, for any rule, which file it came from and what it overrides.
- A lower rule NEVER silently overrides a higher one: conflicts are listed
  in the panel with the winner named.

### G13. Real-time multiplayer (Zed) — honest scope
- Two sessions on the SAME project (same machine, two tabs, or phone +
  desktop through the relay) see each other's live cursor position in the
  editor and live task status — implemented on the existing relay/session
  sync, not a new sync protocol.
- Honest scope, stated in the UI: same-project live presence + task status
  NOW; true simultaneous editing of the same file (operational transform)
  is NOT built — the second editor's save wins with a conflict note, never
  a silent overwrite. Full OT is a desktop-stage job, listed as such.

### G14. Event-sourced state + deterministic replay (OpenHands)
- EVERY agent action is an event in the session store (H1.5): prompt sent,
  tool called (with args), file written (with diff hash), test run (with
  result), decision made (with reason). The session timeline (Batch 6 E15)
  IS the event log.
- "Replay" re-runs a session's events from any point, deterministically:
  same prompts, same tool calls, same order — and shows where the replay
  diverges from the original (different model output is flagged, not
  hidden). Replay never re-applies a file write twice without a checkpoint
  in between.

### G15. Process watcher (Cline)
- Long-running processes the agent starts (dev server, test watch, build
  watch) are watched: the watcher shows live status (running / done /
  failed + exit code), streams the last lines of output into a panel, and
  notifies when the process finishes or crashes.
- A crashed process files a fix task with its last output attached. The
  watcher survives a task ending — the process keeps running and its
  status stays visible until the user stops it.

### G16. Mid-task model switch (Kilo)
- The model can be switched MID-TASK from the header picker: the agent
  keeps its plan, its completed steps, and its Brain digest, and continues
  with the new model from the exact next step. The switch is logged as a
  session event (G14) with the reason the user picked (dropdown: "slow" /
  "wrong answer" / "quota" / "just trying").
- Switching never re-runs a completed step and never drops a checkpoint.

### G17. Background agents + automations on repo events (Cursor)
- Background agents triggered by REPO EVENTS (uses the E5 automations
  engine): on push, on PR open, on a new issue — run a configured job
  (review the PR, triage the issue, run the tests). The trigger list is
  per project; each trigger shows its last run + result.
- A background agent runs WITHOUT opening a chat window — its result lands
  in the task inbox (Batch 5 D10) for review. It never pushes, comments,
  or merges on its own.

### G18. Implicit memories (Windsurf)
- The agent quietly notes things the user does NOT write down: which model
  the user switches to for which task type, which files the user opens
  after a build, which suggestions get accepted. These become implicit
  memory entries (shown in a panel, each with its evidence: "৩ বার দেখা
  গেছে") — and the agent USES them (e.g. pre-selects the model the user
  always picks for refactors).
- Implicit memories are ALWAYS visible and deletable, and an "Implicit
  memories off" toggle stops collection entirely. Nothing is collected
  silently: the panel says exactly what is being watched.

### G19. Ambient context tracking (Windsurf)
- The app tracks what the user is LOOKING at (open file, selected symbol,
  recent searches) and offers help WITHOUT being asked — a small, quiet
  suggestion chip ("এই function টার test লেখা নেই — লিখে দেবো?"), never a
  popup, never interrupting typing. One tap accepts, the chip's × dismisses
  it, and dismissed suggestions of that kind stop appearing.
- Ambient tracking is OFF by default and needs the toggle ON; when off,
  nothing is tracked. The toggle states exactly what is watched.

### G20. MCP Builder (Trae)
- "Build an MCP" flow: the user describes a tool in plain words ("GitHub
  issue গুলো পড়ে summary দেবে এমন MCP"), the agent generates an MCP
  server definition (name, tools with schemas, stdio command) as a
  catalog entry (installable through the MCP page, starting UNTRUSTED per
  H5.5), with a test button that calls each tool once against a stub.
- The builder writes the server as a plain Node script in
  `.devforge/mcp-built/<name>/` (vanilla JS, no dependencies) so the user
  can read it. It never installs its own creation without the user's tap.

### G21. ECC engine-agnostic layer (GitHub trending)
- Formalize what already exists: the provider layer (custom providers,
  DuckDuckGo, Pollinations, 9router, omniroute) is documented in the app
  as the ENGINE layer — any engine can be swapped under a task without
  changing the task. A new "Engines" view lists every configured engine,
  its models, its rate-limit state, and a one-click "use this engine for
  the next task".
- No new abstraction is built — this item is the documentation + the view
  over the existing provider system, plus a per-task engine override
  (stored on the task, visible in its header).

### G22. Security-audit skill pack (GitHub trending)
- A skill pack (installable from the Skills page, like the jcode packs):
  `security-audit` — a checklist skill the agent loads when auditing:
  OWASP Top 10 sweep, dependency audit (known-vulnerable patterns in the
  dependency list), secret scan, permission review. The pack is a SKILL.md
  + checklist, using the existing skill system — it wires into the
  Security Swarm (Batch 5 D5) as its checklist source.
- The pack ships with 5 example findings (each with its fix) so the user
  can see what it catches before running it on their code.

### G23. Android skills pack (GitHub trending)
- A skill pack (installable from the Skills page): `android-dev` —
  Android app guidance for the agent: Gradle project layout, Activity /
  Compose patterns, APK build steps, common Android pitfalls (main-thread
  work, permission flow, lifecycle). Written as SKILL.md files in the
  existing pack format, usable by the agent when the project is Android.
- Ships alongside the mobile-app stage as reference; it does not build or
  sign an APK by itself (that is the Mobile APK stage's job).

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
  second graph/index/queue/store/scheduler/session-log/API/router. G7 is
  a CLIENT of the 8a F4 API. G9 is the ONE roles mechanism. G18/G19 write
  to the SAME Brain. Enforce the MCP ~40-tools-per-config design rule as a
  warning on the MCP page.
- Safe Mode (H2.3) still gates everything dangerous: G17 never pushes or
  merges; G20's built MCP starts UNTRUSTED; G13 never silently overwrites
  a file; G19 tracking is OFF by default.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner (G22 only supplies its checklist).

## Tests (required, same pattern as every batch)

- New suite `test-batch-8b.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each G1–G23 with at least 2 assertions on REAL behaviour:
  a next-edit suggestion comes from graph neighbours and Tab accepts it;
  a Space loads exactly its context inside the cap and exports as JSON;
  a cross-session message arrives as a chat message and is on both
  timelines; a follow-up suggestion is generated from the finished task's
  outcome; the output style changes only the talk, never the build; the
  Ultrathink toggle shows its cost and records its spend separately; the
  SDK calls the F4 endpoints (same handler, no second set); a mode switch
  changes the model visibly and an unset mode inherits the default; a role
  change updates every agent using that role; a Hub import merges without
  overwriting and shows conflicts; the CI template includes the checks step
  and a failure lands in triage; the rules panel names the winning file
  for a conflict; a second editor's save produces a conflict note, never
  a silent overwrite; a replay from step 5 reproduces the same tool calls
  and flags a divergence; the process watcher reports a crash with its
  last output and files a fix task; a mid-task switch keeps the plan and
  logs the event with its reason; a repo-event trigger runs its job and
  lands the result in the inbox without pushing; an implicit memory shows
  its evidence and can be deleted, and the off toggle stops collection;
  an ambient chip appears only with tracking on and a dismissed kind stops
  appearing; the MCP Builder generates a readable server + catalog entry
  starting untrusted; the Engines view lists every engine with its
  rate-limit state and a per-task override works; the security-audit pack
  installs and its checklist drives a swarm scan; the android pack installs
  and is offered when the project is Android.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per feature: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
