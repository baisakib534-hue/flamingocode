# Devin Batch 6 — Devin Complete Checklist, the remaining Devin features

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Devin's capabilities as IDEAS, implemented originally —
never Devin's name, logo, exact UI copy, proprietary code, or proprietary
models. Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Already built that you must EXTEND, never rebuild:
- Senior review + diff review (A2) + Team Mode v2 — E1 extends Senior review.
- Codebase chat + Brain v2 + code graph — E2 builds on them, never a second
  chat index or second graph.
- H5.1 scheduled tasks + watch loops — E5 extends them, not a second scheduler.
- H1.5 session search + recap — E15 builds on the session store, never a
  second session log.
- Batch 5 Security Swarm (Hunter + Fixer, `.devforge/security-findings.md`)
  — E18 schedules it, it does not re-implement scanning.
- B4.2 Auto-docs + Batch 5 D1 architecture diagrams — the wiki side is DONE;
  this batch adds only the Q&A side (E2).
- Batch 5 D8 long-running tasks (persisted state, resume) — E6 snapshots
  extend the SAME persisted state, not a second persistence layer.
- Batch 5 D10 task inbox — E19 hands tasks to the inbox, it does not build
  a second inbox.
- Tier A checkpoints (cap 30) — snapshots (E6) reuse them, never a second
  checkpoint system.

## Scope — build all 19, one at a time, slice by slice

### E1. Devin Review — automated PR review (Senior review, extended)
- `reviewPullRequest(changes)` — runs automatically on PR open (when the
  user opens the review panel for a branch), on every new commit pushed to
  a reviewed branch, and on manual trigger ("Review now" button).
- Catches, locally and rule-based first: security vulns (same classes as
  the Security Swarm), logic errors (unhandled nulls, off-by-one in loops
  the agent itself wrote, missing await), missing edge cases (empty list,
  null input), style violations (against the repo's learned conventions,
  Batch 5 D11).
- 70–90% auto-remediation target: findings the Fixer can patch with high
  confidence get a one-click "Apply fix" (through the A2 diff-review flow,
  user approves); the rest are flagged for humans with file + line +
  one-line Bengali explanation. Every review shows its remediation rate
  ("৮টির মধ্যে ৬টি auto-fix করা হয়েছে").
- Reviews persist per branch in `.devforge/reviews/<branch>.md` (Brain note).

### E2. Ask Devin — Q&A against the codebase, Deep Mode
- An "Ask" mode in codebase chat: the user asks a question ABOUT the code
  ("এই auth flow টা কিভাবে কাজ করে?") and the answer is grounded ONLY in
  the code graph + Repo Map + Brain notes — every claim cites file + line.
  A claim with no source is labelled "অনুমান" (guess), never stated as fact.
- Deep Mode toggle: instead of answering from the top-5 graph hits, it
  walks the call graph (up to 3 hops from the entry symbol) and reads the
  full bodies of the functions it cites, then answers. Deep Mode shows
  the walk ("পড়া হয়েছে: auth.js → session.js → db.js").

### E3. FlamingoCode CLI — terminal agent
- A CLI shape inside the app: a "CLI" panel that documents + generates the
  command for any task — `flamingocode run "<prompt>" --model <m> --repo <r>`
  — non-interactive, script/CI-friendly, with `--json` output (task id,
  status, files changed, test result).
- The in-app runner executes the same command shape: paste a CLI command,
  it parses it and runs that exact task with those exact flags. One
  command language, in-app and terminal alike (the real binary ships at
  Stage 6; the language and the runner land now).
- Exit codes in the result: 0 done, 1 failed, 2 needs-review. `--dry-run`
  prints the plan without changing a file.

### E4. Outposts — local execution mode ("hybrid deployment")
- A per-project "Execution" setting: Cloud (default today — everything
  runs in the web app) vs Local (the agent plans in the app, but file
  writes + terminal commands execute on the user's own machine via the
  desktop app at Stage 6).
- In the web app, Local mode is HONESTLY stubbed: the setting saves, the
  UI shows "Local execution — desktop app লাগবে (Stage 6)", and tasks
  keep running in Cloud mode with a visible note. Never fake a local run.
- The mode flag, the plan/execute split, and the handoff record
  (`outpost-handoff.json` — plan + files + commands, ready for the desktop
  to pick up) are built NOW; the desktop executor lands at Stage 6.

### E5. Automations + scheduled sessions
- Extends H5.1 scheduled tasks: an "Automations" page listing every
  scheduled run — recurring (nightly tests, weekly knowledge maintenance,
  daily health checks) and one-time — with name, trigger, last run, next
  run, cost (from the B2 usage meter), and enable/disable.
- Triggers: schedule (cron-style picker: daily/weekly/monthly/custom) +
  webhook URL per automation (a POST to it starts the run) + monitored
  channel (a Brain note / inbox feed the automation watches).
- Consumption visibility per automation: tokens + cost per run, in the
  same Usage & Quota tab. A failed automation run files a fix task, never
  silently retries forever (max 3 retries, then needs-help).

### E6. Session snapshots — environment state survives
- Extends Batch 5 D8: a snapshot captures the session's environment state
  — open files, installed deps list, env vars (NAMES only, never values),
  current branch, last checkpoint id — into `.devforge/snapshots/<id>.json`.
- Follow-up sessions on the same project offer "Snapshot থেকে শুরু করো":
  setup steps (install, branch checkout, file open) are SKIPPED because
  the snapshot proves they already happened. A snapshot older than the
  last code change is marked stale and re-runs setup.
- Snapshot list UI with restore/delete; deleting a snapshot never deletes
  code, only the snapshot record.

### E7. Playbooks — successful sessions become reusable playbooks
- After a task finishes green, a "Save as playbook" button analyses the
  session (plan steps, tool choices, fixes applied) into a reusable
  playbook: name, when-to-use, ordered steps with the prompts that worked,
  and the pitfalls hit.
- Playbooks live in `.devforge/playbooks/` (Brain notes, one file each) and
  appear in the prompt library (B4) as a "Playbooks" filter. Running a
  playbook starts a task pre-filled with its steps; the agent follows the
  steps but may deviate and must say when it does.
- A playbook records its success rate (runs green / runs total) and shows
  it; a playbook that fails twice in a row is flagged "needs review".

### E8. Multi-modal input — mockups, Figma, video as task input
- Task input accepts attachments: an image (UI mockup / screenshot),
  a Figma file link (paste the URL — the agent fetches its public metadata
  and lists its frames), and a video recording (the agent reads the
  video's frames as images, up to 12 frames, and describes what it sees).
- The attachment is shown in the chat as a thumbnail/card, and its content
  (image description, Figma frame list, video frame notes) is injected
  into the agent's prompt as context — the agent builds FROM the mockup,
  it does not ignore it.
- Honest limits, stated in the UI: image understanding is local
  (file name + size + a user-written caption is the ground truth; the
  model reads the image only when the configured provider supports vision
  — otherwise the caption carries it). Never claim vision that is not there.

### E9. Self-assessed confidence
- After every solution (a finished task, a review, a fix), the agent
  reports its confidence per item: high / medium / low, with ONE reason
  ("high — সব test pass করেছে + ৩টি edge case হাতে যাচাই করা হয়েছে").
- Low-confidence items are NEVER presented as done: they arrive with a
  "যাচাই করো" flag, a suggested check the user can run, and they block
  the "publish" (C1) button until confirmed or fixed — same gate as a
  critical security finding.
- Confidence is stored on the task record and shown in the task inbox
  (E19 hand-off) so a reviewer sees it before approving.

### E10. Agentic MapReduce — huge repos, guaranteed coverage
- For repos over the graph's comfortable size: deterministic selectors
  split the repo into shards (by top-level folder, then by PageRank rank
  within each folder), and parallel child sessions (sub-agents, Team Mode
  machinery) work each shard with the SAME instruction.
- A reducer merges the shard results: dedupes findings, resolves
  conflicts by shard priority (core folders first), and produces one
  report with per-shard coverage ("১২টি shard-এর সবগুলো cover করা হয়েছে").
- Powers the Security Swarm full scan + big migrations (E11): those two
  features MUST use MapReduce when the repo has more than 50 files.
  Progress shows live per-shard status, and a failed shard retries once,
  then reports its gap honestly instead of pretending coverage.

### E11. Legacy migration — COBOL/Fortran → modern, version upgrades
- A "Migrate" flow: pick a source (legacy language file, old framework
  version, old API version) and a target (modern language / new version);
  the agent produces a migration PLAN first (files in order, risky spots
  flagged, what cannot be auto-migrated listed honestly), user approves,
  then it migrates file by file with a test after each file.
- Built-in migration packs: version upgrades (dependency major bumps with
  their breaking-change notes) and API migrations (old endpoint → new
  endpoint, with a compatibility shim when the new API lacks a field).
- COBOL/Fortran: honest scope — the agent translates the STRUCTURE
  (paragraphs → functions, data division → types) and flags every
  construct it cannot prove equivalent as "হাতে যাচাই করো". Never claims
  a legacy migration is provably identical.

### E12. CI/CD autotriage
- Paste (or fetch, when the repo is linked) a CI failure log: the agent
  triages it — classifies the failure (test / build / lint / deploy /
  flaky), finds the failing file + line, and proposes the fix.
- Flaky detection: the same test failing then passing across runs is
  labelled flaky with its history, and the fix offered is a retry/quarantine
  note, not a code change. A fix is applied only through A2 diff review.
- Triage history persists in `.devforge/ci-triage.md` so repeat failures
  show "এই একই failure ৩ বার হয়েছে".

### E13. Incident triage — read logs, reproduce, cut MTTR
- An "Incident" flow: paste logs (or point at the monitor log, E9 in
  Batch 5 / D9), the agent reads them, reproduces the bug in the preview
  when it can (with the exact failing input from the log), and writes an
  incident note: what broke, the likely cause, the reproduction steps,
  and the fix — with a time-to-triage stamp.
- The incident note is saved to the Brain and linked from the monitor log
  entry that reported the breakage, so the loop closes: monitor → incident
  → fix → re-test → monitor green.

### E14. Knowledge management — dedupe, resolve conflicts, learn patterns
- A "Knowledge" panel over the Brain: it finds DUPLICATE entries (same
  rule in two notes), CONFLICTING guidance (one note says "always X",
  another says "never X"), and proposes a merge/resolution the user
  approves — never silently deletes a note.
- It also creates knowledge FROM codebase patterns (Batch 5 D11
  conventions feed this): a pattern seen in 3+ files becomes a proposed
  Brain entry ("এই প্রজেক্টে error handling এভাবে করা হয়"), user approves
  before it is saved. Approved entries are injected into the agent prompt
  inside the existing digest cap.

### E15. Session API — sessions, programmatically
- An in-app session API (used by the CLI E3, the automations E5, and the
  inbox E19): `createSession(task)`, `searchSessions(query)`,
  `messageSession(id, text)`, `terminateSession(id)` — all operating on
  the SAME session store H1.5 built, with event timelines (every agent
  action is an event) and tags per session.
- A "Sessions" panel lists live + past sessions with their tags, status,
  and a live event timeline view. Terminating a session stops its agent
  cleanly and writes a handoff note to the Brain.

### E16. Video-recorded QA sessions
- When the agent QAs its own work (B3 preview loop, Batch 5 D6 desktop
  tests), the session is RECORDED: step log + pass/fail + (in the web app)
  a text storyboard of what was checked; the recording is packaged as a
  review item the user can watch/read.
- The recording is sent to the reviewer (task inbox / phone) as an edited
  summary: only the failing steps in full, the passing steps as a
  checklist — never a raw dump. Real screen video arrives with the Stage 6
  driver; the record shape MUST already carry a video slot.
- Rule (from the sandbox spec): a feature is NOT done without its
  recording — the QA record is attached to the task before it can be
  marked done.

### E17. Fast startup bar
- Every session type (new task, resume, review, inbox run) shows a
  startup bar: the steps it is doing to boot (load Brain digest, build
  repo map, restore snapshot, warm the model) with live timing.
- Target: sessions boot in seconds, not a minute. The bar shows the
  ACTUAL measured time per step; any step over 5s is flagged and its
  cause named (e.g. "repo map rebuild — ৪০০+ ফাইল"). The bar is honest
  telemetry, not a fake progress animation.

### E18. Security Swarm scheduling (extends Batch 5 D5)
- Auto Scan on schedule: daily / weekly / monthly / custom (uses the E5
  automations engine — one scheduler, two users).
- Scan new commits: incremental — only files changed since the last scan
  are re-scanned (cheaper than a full scan); the findings file records
  which commit each finding belongs to.
- Scan profiles (quick / full / secrets-only) + filters (severity, folder),
  full scan HISTORY (every scan: date, profile, findings count, fixed
  count), and Discover vs Ingest modes (Discover: scan and report only;
  Ingest: scan and auto-file fix tasks for high+ findings).

### E19. Integrations — Linear, Jira, Slack, GitLab, Bitbucket + inbox hand-off
- Integration cards (same install-first rule as the app integrations hub:
  install the integration, then use it): Linear, Jira, Slack, GitLab,
  Bitbucket. Each card: connect (paste the workspace URL + token — stored
  per project, never in the repo), test connection, disconnect.
- Hand-off: a finished task can be sent to the connected tool as an issue
  / message with its summary + confidence (E9) + recording (E16) attached;
  an issue assigned in Linear/Jira can be pulled INTO the task inbox
  (Batch 5 D10) as a new inbox item. Slack: task completion posts to the
  configured channel (user-triggered, never automatic).
- GitLab/Bitbucket repos can be linked as multi-repo task members (Batch 5
  D7) — same per-repo branch + review flow, provider-agnostic.

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
  second graph/index/queue/store/scheduler/session-log. E5 uses the H5.1
  scheduler; E15 uses the H1.5 session store; E18 uses the E5 scheduler.
- Safe Mode (H2.3) still gates everything dangerous: auto-remediation
  fixes go through A2 diff review; E9 low-confidence blocks publish;
  E4 Local mode never fakes a local run; E8 never claims vision it lacks.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner itself (E18 only schedules it).

## Tests (required, same pattern as every batch)

- New suite `test-devin-batch-6.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each E1–E19 with at least 2 assertions on REAL behaviour:
  review flags a hardcoded key and offers an apply-fix through diff
  review, and reports its remediation rate; Ask answers only from cited
  sources and labels an unsourced claim as a guess, and Deep Mode shows
  its walk; the CLI runner parses a command and runs that exact task, and
  `--dry-run` changes no file; Local mode saves the setting, shows the
  Stage 6 note, and never fakes a run; an automation lists its next run
  and its per-run cost, and a failed run files a fix task after max 3
  retries; a snapshot restores open files + branch and is marked stale
  after a code change; a playbook saves from a green session and records
  its success rate; a mockup attachment injects its caption into the
  agent prompt; a low-confidence solution blocks publish with a check
  suggestion; MapReduce covers all shards of a fake 60-file repo and
  reports a failed shard's gap honestly; a migration plan lists what
  cannot be auto-migrated; CI triage classifies a pasted log and flags a
  flaky repeat; an incident note links back to its monitor log entry;
  knowledge dedupe proposes a merge and never deletes silently; the
  session API creates/messages/terminates a session on the H1.5 store;
  a QA recording attaches to its task before the task can be marked done;
  the startup bar reports real per-step timings; a scheduled swarm scan
  runs incrementally on changed files only; a Linear issue pulls into the
  inbox as an item.
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
