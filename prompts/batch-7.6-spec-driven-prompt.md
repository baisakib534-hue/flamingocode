# Batch 7.6 — Spec-driven flow (research sweep #14 Kiro + #26 Spec Kit — build ONCE, credit both)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His order: a user who cannot code must get a READABLE spec BEFORE any code,
approve it in plain language, and the spec must stay true afterwards — this
kills the "agent built the wrong thing" failure. What exists today (do NOT
rebuild): Plan+Build (Round 39) makes plans; Superpowers `writing-plans`
(7.3) makes plans. The GAP: neither produces EARS acceptance criteria nor a
living design doc that updates itself. This batch ports the Kiro / Spec Kit
spec-driven pipeline (capability only — Kiro is proprietary, Spec Kit is
open source; port the mechanism, never code or branding): prompt →
requirements → design → tasks, as living artifacts.

## 1. The pipeline — `requirements.md` → `design.md` → `tasks.md`

- A spec lives under `.devforge/specs/<feature>/` as three markdown files:
  `requirements.md`, `design.md`, `tasks.md` (project files, inside Brain
  scope — the Brain digest carries the spec's current status + open tasks).
- `requirements.md` — user stories in EARS format: `WHEN <condition> THE
  SYSTEM SHALL <behaviour>` + acceptance criteria per story. Every EARS
  line carries a one-line plain-Bangla paraphrase next to it (he reads
  Bangla, not EARS).
- `design.md` — architecture, component list, tech stack, and how the
  change fits the EXISTING codebase (analysed from the code graph / repo
  map — never a design written blind). Includes a short diagram in text
  form (boxes + arrows) when the change touches more than one component.
- `tasks.md` — sequenced, checkable implementation tasks; each task ends
  in an independently testable deliverable (one action, one checkable
  result — the Superpowers `writing-plans` shape).
- `startSpecFlow(prompt)` — the entry: for a non-trivial task (multi-file,
  or the user picks "Spec mode"), the agent drafts `requirements.md`
  FIRST and waits for his approval before writing `design.md`; drafts
  `design.md`, waits for approval; then writes `tasks.md` and execution
  follows it step by step (the 7.3 `executing-plans` behaviour).
- Approval gates: NO code is written before `requirements.md` AND
  `design.md` are both approved. Each approval is a plain-language tap
  ("ঠিক আছে, এগোও" / "বদলাও") — he can also reply in words and the agent
  revises that document only, never the others.

## 2. Living specs — the spec updates itself as code changes

- After each code change in the task, the agent updates the affected spec
  section: the matching `tasks.md` item is ticked, and if the architecture
  changed, `design.md` is updated to match.
- `checkSpecDrift()` — at task end (and on demand from the Specs panel):
  compares what the code does against what the spec says; if code changed
  beyond the spec, the agent flags the drift ("spec says X, code does Y")
  and offers to update the spec — never silently leaves the spec stale.
- A spec's status is tracked in `appState.specState`: `draft-requirements`
  → `draft-design` → `draft-tasks` → `approved` → `building` → `done` /
  `drifted`. The status shows in the Specs panel and in the Brain digest.

## 3. Constitution — `.devforge/constitution.md`

- One project-principles file every spec must follow (Spec Kit's
  constitution idea, our own content): seeded from his standing rules —
  no AI slop, quality over speed, Bangla UI + Bangla voice, DuckDuckGo
  free as the built-in AI, Electron + TypeScript for desktop, small
  requests / one step per request, never claim done without fresh
  evidence (7.3 gate).
- `checkConstitution(spec)` — before a spec is marked approved, each
  requirement is checked against the constitution; a violating
  requirement is flagged with the principle it breaks and must be fixed
  or explicitly waived by him (a waiver is recorded in the spec).
- The constitution is editable from the Specs panel (he owns the rules).

## 4. Specs UI

- New "Specs" panel (next to the Prompt Library / Recipes placement —
  reuse the existing panel layout, do not add a second sidebar): list of
  specs with status chips, and a viewer showing the three documents with
  Approve / Revise buttons per document, the tasks checklist driving
  execution (ticking as the agent works), and a "Check drift" button.
- Starting a spec: a "Spec mode" toggle on the chat input (next to the
  Plan / Plan+Build mode selector) + a "New spec" button in the panel.
- Bengali translations for every new string (panel labels, approval
  buttons, drift messages, constitution labels).

## 5. Dedupe — do NOT rebuild

Plan+Build (Round 39), the 7.3 Superpowers pack (`writing-plans`,
`executing-plans`, verification gate), the Brain + code graph + repo map,
the A2 diff review — build ON them. No second plan system, no second
checklist, no second approval flow: spec approval IS the Plan+Build
checkpoint shape, and spec execution IS plan execution with the spec
documents as its source.

## Tests — new file `test-batch-7.6-spec-driven.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) `startSpecFlow` creates `.devforge/specs/<feature>/` with the three
    documents in order (requirements first, design second, tasks third);
(b) a requirement is written in EARS form (`WHEN … THE SYSTEM SHALL …`)
    with acceptance criteria AND a Bangla paraphrase line;
(c) NO code change happens while requirements or design are unapproved
    (the approval gate blocks execution);
(d) approving requirements unlocks design drafting; approving design
    unlocks tasks + execution;
(e) a code change ticks the matching `tasks.md` item;
(f) `checkSpecDrift` flags code that goes beyond the spec (and offers the
    update, never silently stale);
(g) `checkConstitution` flags a requirement that breaks a seeded
    principle (e.g. "claim done without evidence") and a waiver is
    recorded when he overrides it;
(h) `design.md` references the existing codebase (code-graph/repo-map
    input is used, not a blind design);
(i) spec status transitions are tracked in `appState.specState`;
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
