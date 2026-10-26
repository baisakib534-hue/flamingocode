# Devin Batch 5 — Devin's 11 flagship features, FlamingoCode-native

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Devin's capabilities as IDEAS, implemented originally —
never Devin's name, logo, exact UI copy, proprietary code, or proprietary
models. Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Already built that you must EXTEND, never rebuild:
- B4.2 Auto-docs (auto-generated docs per project) — D1 extends it, does not replace it.
- Brain v2 + code graph (`.devforge/notes/`, `graph.json`, `buildCodeGraph`,
  `queryGraph`/`pathGraph`/`explainGraph`) + Batch 7.1 Repo Map
  (`buildRepoMap`, PageRank, token-budgeted) — D1, D2, D11 build ON these.
  NEVER a second graph, second index, or second memory store.
- Team Mode v2 (agents + Senior review, `executeTeamAgentTask`) — D4 and D5
  are team shapes on top of it, not a second team system.
- Tier A checkpoints (cap 30) + H2.4 checkpoint restore modes — D8 persists
  through these, not a new checkpoint system.
- C1 one-click publish (pure-JS ZIP + deploy prep) — D9 watches what C1
  published, it does not re-implement publishing.
- Batch 7.12 message queue (visible queue, Send now, offline-safe) — D10
  feeds the SAME queue, not a second inbox store.
- Per-model rate limits + F5 never-stuck routing + Smart model routing
  is new here (D3) — routing DECIDES which model a step uses; F5 only
  FALLS BACK when a call fails. Do not confuse the two.

## Scope — build all 11, one at a time, slice by slice

### D1. Auto architecture diagrams (Devin Wiki style)
- `buildArchitectureDiagram(project)` — derives the diagram from the
  existing code graph + Repo Map: modules as boxes, imports/calls as edges,
  sized/ranked by PageRank (the most central modules are the biggest boxes).
- Renders as inline SVG in a new "Architecture" panel (Graph panel section
  is fine): every box is a LINK — click it and the matching source file
  opens in the editor. Every edge lists the import/call that created it.
- Auto-refresh: the diagram rebuilds (debounced, max once per 30s) whenever
  the code graph is marked dirty (`markGraphDirty`). A "Last updated"
  timestamp is shown, always.
- Bengali labels for the panel heading and the empty state ("এখনো কোনো
  ফাইল নেই" style, in the app's i18n pattern — full-English-string keys).

### D2. Cross-repo search (Devin Search style)
- `searchAllProjects(query)` — searches across ALL projects stored locally
  (every project with a `.devforge/` Brain + code graph), not just the open
  one. Matches file names, symbol names (from the code graph), and Brain
  note text.
- Results ranked: exact symbol match > file-name match > note-text match,
  then PageRank within that project. Each result shows the project name,
  the file path, and one line of context.
- A search box in the header/sidebar ("সব প্রজেক্টে খুঁজুন"). Opening a
  result switches to that project AND opens the file. Never loads a whole
  second project's files into the open project's context — only the opened
  file, on demand.

### D3. Smart model routing (Devin Fusion style)
- `routeModelForStep(step)` — decides, per step, which model does it:
  mechanical steps (formatting, renames, boilerplate, import fixes) go to
  the cheapest/fastest configured model; judgment steps (architecture,
  debugging, review, security) go to the strongest configured model.
- The classifier is LOCAL and rule-based (step text + file type + step kind
  from the Step Planner): never a model call just to decide the model.
- Routing is VISIBLE: every agent step shows which model ran it and why
  ("cheap: mechanical edit" / "strong: judgment call"), in the step log
  and in the Usage & Quota tab (tokens + cost saved vs always-strong,
  shown as a running total).
- Settings toggle (default ON) + a per-project override. When only ONE
  model is configured, routing is a no-op and says so once, not on every step.
- Never routes a step to a model that has no key / is rate-limited — the
  per-model rate-limit state decides eligibility first, F5 fallback second.

### D4. Sidekick agent
- A second agent that runs ALONGSIDE the main agent on the same task, with
  its own tool calls, doing VERIFICATION in parallel while the main agent
  builds: it re-reads each finished file, checks it against the plan step,
  and files findings (pass / nit / bug) into a Sidekick panel.
- The main agent NEVER waits for the Sidekick — findings arrive as they
  come; a bug finding becomes a fix task in the queue (visible, not silent).
- Toggle per task ("Sidekick on/off", default ON for Team Mode, OFF for
  single quick tasks under 3 steps). The Sidekick uses the CHEAP model
  (D3 routing: verification is mechanical) unless the user picks otherwise.
- Team Mode: the Sidekick is a named team member in the team chat
  ("Sidekick"), its findings appear as chat messages.

### D5. Security Swarm
- A dedicated mini-team (2 agents: Hunter + Fixer) that hunts
  vulnerabilities in the open project on demand ("Security scan" button)
  and on every build-finish (hook, fire-and-forget, never blocks the build).
- Hunter checks, locally, for the real classes: secrets/keys in code,
  `eval(`/`innerHTML` with user input, unsanitized URL params, missing
  auth on new routes, `http://` where `https://` belongs, overly broad
  permissions. Each finding: severity (critical/high/medium/low), file +
  line, one-line Bengali explanation.
- Fixer proposes a patch per finding (diff-review A2 flow — user approves
  before apply, default ON). Critical findings block "publish" (C1) with
  a clear warning until fixed or explicitly dismissed with a reason.
- Findings persist in `.devforge/security-findings.md` (Brain note) so the
  next scan shows fixed vs still-open, never re-reports a fixed one.

### D6. Desktop-app testing (computer-use harness, in-app now)
- The REAL computer-use driver lands at Stage 6 (Electron) — this batch
  builds the IN-APP harness it will drive: `desktopTestPlan` — a test
  spec (app name, launch command, steps: click/type/drag/wait/assert,
  expected screen text) stored per project, editable in a "Desktop tests"
  panel.
- Steps run through a single `runDesktopTestStep(step)` entry point that
  TODAY runs against the web preview (same step language) and at Stage 6
  runs against the real desktop app — one step language, two drivers.
- Every run produces a record: step log + pass/fail + screenshot placeholder
  (real screenshots arrive with the Stage 6 driver; the record shape must
  already carry them). A failed step becomes a fix task, same as B3.

### D7. Multi-repo tasks
- One task spanning several repos (frontend + backend + docs): the task
  holds a list of linked repos (local projects), each with its own branch
  name (`flamingocode/<task-slug>`), its own file changes, and its own
  checkpoint.
- The agent works repo by repo in dependency order (backend first, then
  frontend, then docs — or the order the user sets by dragging the repo
  list). Each repo's changes are reviewed (A2 diff review) separately.
- A "Coordinated PR" summary is generated: per repo — branch, files
  changed, test result — as one Markdown note saved to the Brain, ready
  to paste as PR descriptions. Never pushes or opens a real PR by itself
  (pushing is the user's explicit action).

### D8. Long-running tasks (survive restarts, run hours/days)
- A task can be marked long-running (migrations, big refactors): its full
  state — plan, current step, completed steps, checkpoints, agent
  messages — is persisted to localStorage + `.devforge/long-tasks.json`
  after EVERY step (never only at the end).
- On reload, a "Resume" banner offers the exact step it stopped at, with
  the plan and the Brain digest rebuilt from the persisted state. Resume
  never re-runs a completed step and never loses a checkpoint.
- Progress UI: "Step 14/60 · running 3h 20m · last checkpoint 12 min ago",
  with Pause / Resume / Abort. Abort keeps everything done so far and
  writes a handoff note to the Brain.

### D9. Post-deploy monitoring
- After a C1 publish, the project gets a "Monitor" toggle: the app
  periodically (default every 15 min, configurable, only while the app is
  open) fetches the live URL and checks: HTTP status, the page still
  contains its expected marker text, and (if the publish recorded it) the
  main JS file still loads.
- A breakage produces a red banner + a notification + a fix task in the
  queue ("Live site down: <url> returned 500 at <time>"), and the monitor
  log (`.devforge/monitor-log.md`) records every check. A "Fix it" button
  starts the agent on the breakage with the log attached.
- Monitoring NEVER auto-deploys a fix — the user approves every publish,
  same as C1. Monitoring stops cleanly when the toggle is off.

### D10. Task inbox (assign from anywhere, review later)
- An "Inbox" panel: tasks assigned from anywhere — typed here, sent from
  the phone (Batch 7.12 queue), or pasted as a message — land as inbox
  items (title, source, time, status: new / running / done / needs-review).
- "Run" starts an inbox item as a normal agent task; "Review" opens a
  finished item's diff + test result + recording link for approve/reject,
  exactly like a human checkpoint. Rejected items go back to the inbox
  with the reviewer's note attached.
- The inbox is the SAME store as the 7.12 message queue — an item queued
  from the phone appears here, and running it here clears it there.
  One store, two views. Never a second queue.

### D11. Repo learning (conventions from history, Brain tie-in)
- `learnRepoConventions(project)` — reads the project's git history
  (commit messages), its Brain notes, and its code graph, and extracts
  CONVENTIONS as a plain list: naming style, file layout, error-handling
  pattern, test style, "always/never" rules the repo actually follows.
- Conventions are saved as `.devforge/conventions.md` (a Brain note) and
  injected into the agent's system prompt for that project (inside the
  existing Brain digest cap — conventions replace generic guidance, they
  never grow the cap).
- A "Conventions" panel shows each rule with ONE example commit/file that
  proves it, and a "forget this rule" button per rule. Rules the agent
  VIOLATES are flagged in diff review ("breaks convention: <rule>").

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
- Respect the caps: Brain digest ~1500 tokens (conventions + repo map
  live INSIDE it), checkpoints cap 30, no second graph/index/queue/store.
- Safe Mode (H2.3) still gates everything dangerous: D5 Fixer patches go
  through A2 diff review; D9 never auto-publishes; D7 never pushes a PR.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules.

## Tests (required, same pattern as every batch)

- New suite `test-devin-batch-5.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each D1–D11 with at least 2 assertions on REAL behaviour:
  diagram builds from a tiny graph and links boxes to files; cross-repo
  search ranks an exact symbol above a note match; routing picks cheap
  for a rename step and strong for an architecture step, and skips a
  rate-limited model; Sidekick files a finding without blocking the main
  task; Security Swarm flags a hardcoded key and a critical finding blocks
  publish; desktop test steps run through the single entry point;
  multi-repo task keeps per-repo branches separate; a long task resumes
  at the exact persisted step without re-running a completed one; the
  monitor flags a 500 and logs it; an inbox item queued from the phone
  store appears in the Inbox and clears when run; conventions are learned
  from a fake history, saved to the Brain note, and a violation is flagged
  in diff review.
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
