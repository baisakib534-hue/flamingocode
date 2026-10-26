# Batch 7.3 — Superpowers pack + verification-before-completion (research sweep #22–25, TOP CANDIDATE)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His order: the software must work like a real human dev team, no AI slop.
What exists today (do NOT rebuild): the Stage 4 skill library (15 skills: 9
jcode pack + 6 new), the testing-qa skill, Plan+Build (Round 39), Team Mode
v2, A2 diff review, B3 self-healing preview, H2.3 Safe Mode, H1.4 context
files. The GAP: nothing enforces HOW the agent works — no disciplined
workflow, and no rule that forbids claiming "done" without fresh proof.
Hermes twice claimed done falsely (C3: false commit + false 7/7 tests; B4:
someone else's code presented as its own). This batch ports the
Superpowers disciplined-workflow pack (obra/superpowers — code read: all 12
SKILL.md files, mechanisms only, NEVER copy their text verbatim) as our own
skill pack, AND wires its two iron laws into the agent loop as ENFORCED
gates, not just skill text.

## 1. The pack — 12 skills in the Skills page

Each as a skill entry in the EXISTING skill library (same shape as the
existing 15: id, name, description/trigger, body stored in-app, enabled
toggle). Keep the Superpowers skill NAMES — they are generic workflow
names, not branding. Write every body FRESH in our own words (never copy
Superpowers' SKILL.md text). Mechanisms to encode in each body:

- `brainstorming` — lay out approaches, get the human to pick one, write a
  short design doc, get approval, THEN plan. Never build first.
- `writing-plans` — plans saved per feature (one file per feature under
  `.devforge/plans/YYYY-MM-DD-<feature>.md`), tasks right-sized so each
  ends in an independently testable deliverable, every step is one action
  with a checkable result ("write failing test → run it → implement →
  run tests → commit").
- `test-driven-development` — TDD iron law (§3).
- `subagent-driven-development` — fresh subagent per task, review after
  each, broad final review; "Rulings, not stalls" (§5).
- `executing-plans` — execute a written plan step by step, checking each
  step's result before the next; a failed step stops that step only, the
  plan is revised, never silently skipped.
- `using-git-worktrees` — detect isolation first, prefer native worktree
  tools, fall back to `git worktree add`; never mix two tasks in one tree.
- `verification-before-completion` — the iron law (§2).
- `systematic-debugging` — reproduce first, form ONE hypothesis, test it,
  record the result; never shotgun-fix, never change two things at once.
- `requesting-code-review` — before asking for review: run tests, run
  lint, write what changed and what to check; the review request carries
  its own evidence.
- `receiving-code-review` — every review comment gets a reply: fixed,
  disputed with reason, or deferred with reason; nothing silently
  dropped.
- `dispatching-parallel-agents` — independent tasks go to parallel
  agents with non-overlapping file scopes; overlapping scopes are
  sequential, never parallel.
- `finishing-a-development-branch` — before a branch is called done:
  tests green, review addressed, changelog entry, clean tree, pushed.

All 12 appear in the Skills page under a "Superpowers" pack section with
per-skill enable/disable. Default: all ON.

## 2. Verification-before-completion — IRON LAW, an enforced gate

Not just skill text. A real gate in the agent loop:

- `verificationEvidence` in the session/appState: `{ command, outputTail,
  exitCode, ranAt, filesChangedAfter: bool }` — recorded every time the
  agent runs a proving command (test suite, preview health check, build).
- `verifyBeforeCompletion(claim)` — called before the agent presents a
  final "done / passing / fixed" message. The rule: IDENTIFY the proving
  command → RUN it fresh in this turn → READ the full output + exit code
  → VERIFY → only then claim. If no fresh evidence exists for the claim,
  the completion message is BLOCKED and replaced with either (a) the agent
  runs the proving command now, or (b) an explicit "UNVERIFIED — no fresh
  evidence" label on the claim. NEVER a silent "done".
- The completion message shows the evidence inline: proving command +
  exit code + pass count (e.g. "✓ 75/75 tests, exit 0, just now").
- STALE evidence does not count: any file change after the run
  invalidates it and the gate re-runs the proving command.
- Wire the gate into: the `sendAgentPrompt` final-message path, the end
  of `runExecutionPhase`, and the Team Mode Senior final report (the
  Senior may not sign off without fresh evidence — a Senior "approved"
  with no evidence is itself blocked and labelled UNVERIFIED).

## 3. TDD iron law

- System-prompt addition (agent + team agents): "NO PRODUCTION CODE
  WITHOUT A FAILING TEST FIRST — write the test, watch it fail, write
  minimal code to pass."
- `tddGate` in the A2 diff review: when a task changes production files,
  the review shows a TDD badge — "test-first ✓" if a failing test was
  written/run before the production change in this task, "no test first
  ✗" otherwise. The badge is a WARNING, not a hard block — he can
  override it, but it must be visible on every review.
- Track per task: `taskTddState = { testWrittenFirst: bool, testFile,
  productionFiles: [] }` — set when a test file changes/runs before the
  first production-file change in the task.

## 4. Brainstorm-before-building

- For a NON-TRIVIAL task (multi-file, or Plan+Build mode), the agent's
  FIRST message lays out 2–3 approaches in plain language (Bangla first,
  he reads Bangla), he picks one, the choice is recorded as the design
  decision, and only then does the agent plan/build.
- Single-file, single-step tasks skip this automatically (complexity
  check: ≤1 file + ≤1 step → no brainstorm, just build).
- Settings → Behavior toggle "Ask before building (brainstorm first)",
  default ON. The chosen approach + the rejected ones are recorded in
  Brain as a short design note (`.devforge/notes/`).

## 5. Subagent-driven-development — Rulings, not stalls

- `recordRuling(what, why, costIfWrong)` — decisions logged to Brain as
  `Ruling: <what> — <why> — <cost if wrong>`, and shown in the team chat
  / activity log.
- Only FOUR things stop a run and enter the needs-help state: (1)
  irreversible/destructive action, (2) security-sensitive action, (3)
  side effect outside the worktree/project, (4) a plan so broken every
  path is a guess. Everything else: record a Ruling and KEEP GOING.
- Wire this into the existing needs-help trigger so it only fires for
  those four. Team Mode already uses fresh subagents per task + review
  after each — wire the Ruling log into the team chat.

## 6. Settings + Skills page + i18n

- Skills page: "Superpowers" pack section, 12 skills, per-skill
  enable/disable, default all ON.
- Settings → Behavior: "Verification before completion" toggle (default
  ON — turning it OFF shows a warning that completion claims become
  unverified), "Ask before building" toggle (default ON), "TDD badge in
  diff review" toggle (default ON).
- Bengali translations for every new string (toggle labels, gate
  messages, badge text, Ruling labels).

## 7. Dedupe — do NOT rebuild

Plan+Build, Team Mode, testing-qa, A2 diff review, B3 preview, Safe Mode,
the skill library — build ON them. No second skill library, no second
plan system, no second review gate, no second needs-help state.

## Tests — new file `test-batch-7.3-superpowers.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) all 12 pack skills exist in the skill registry with a trigger
    description and an enable toggle;
(b) `verifyBeforeCompletion` BLOCKS a "done" claim with no fresh evidence
    and PASSES one with fresh evidence (exit 0 + output read);
(c) evidence recorded BEFORE the last file change is treated as STALE and
    rejected (gate re-runs);
(d) a completion message carries its evidence inline (command + exit code
    + pass count);
(e) the TDD badge shows "test-first ✓" when a test ran first and "no test
    first ✗" otherwise;
(f) brainstorm options are presented for a multi-file task and SKIPPED for
    a single-file task;
(g) `recordRuling` writes a `Ruling: <what> — <why> — <cost if wrong>`
    entry to Brain;
(h) needs-help fires ONLY for the four stop reasons (a reversible,
    in-project decision does NOT stop the run);
(i) the three Settings toggles exist in `appState` with the correct
    defaults (verification ON, ask-before-building ON, TDD badge ON);
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
