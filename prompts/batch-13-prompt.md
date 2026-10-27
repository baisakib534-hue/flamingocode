# Batch 13 — governance + safety + cost (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §13 (Cortex),
§19 (Factory), §12 (Bob), §10 (Agoragentic), §32 (VTCode), §33 (VT Code),
§9 (Devin CLI), §2 (Goose), §30 (Poolside), §23 (Kimchi), §7 (amp),
§28 (Mistral).

Already built that you must EXTEND, never rebuild:
- Safe Mode (H2.3: Smart/Manual/Off) + per-tool permissions (Batch 7.4,
  allow/ask/deny, last-match-wins) + H5.5 MCP trust rules — M1/M2/M3/M6/M7/
  M11/M12/M13 are GOVERNANCE ON TOP of Safe Mode, never a second permission
  system. Safe Mode still wins any conflict.
- G14 event-sourced state (8b) + H1.5 session store — M2's receipts and
  M3's audit log are EVENTS in the same log, never a second log.
- Usage dashboard (Tier B) + per-model rate limits + 8c M2 best-model —
  M8/M9/M10 report there, never a second meter. The router stays the ONE
  router; M14's reputation feeds its scores, it does not replace them.
- 8b G12 rules-file priority chain — M12/M13 extend it.
- Batch 5 D5 Security Swarm — M5's scanner feeds it findings; do NOT
  rebuild the swarm's scanner.
- Honest scope: M4's OS-level sandbox is STAGE 6 (Electron main process)
  — in the web app, build the policy UI + the backend-capability filter
  against a clearly-marked desktop stub; never fake an OS sandbox.

## Scope — build all 14, one at a time, slice by slice

### M1. Risk-tiered approval + graduated autonomy ladder (Cortex, Factory, Bob)
- Extend Safe Mode with explicit named rungs defined by REVERSIBILITY
  class, not just "ask more / ask less": read-only (inspect + plan, no
  approval needed); low (file edits and little else); medium (auto-approve
  REVERSIBLE actions — install deps, run tests — still ask before anything
  risky); high (everything incl. commits and pushes).
- Every action is classified read-only / additive / destructive, and the
  approval follows the tier automatically. The current rung is shown in the
  header, changeable per task, and a task can never silently climb rungs.
- Per-mode enforced standards: a prompt can never override the rung's
  standards (e.g. "never push without review" in high mode still holds if
  the project sets it).

### M2. Governance policy file + fail-closed evaluation + receipts (Agoragentic, Bob)
- A policy file (`.devforge/policy.yaml`, human-readable): allow/ask/deny
  per action, `authority.spend` owner_only hard-validated. The harness
  evaluates the policy BEFORE execution and FAILS CLOSED — missing policy /
  identity / cost / approval = BLOCKED, with a plain-language reason, never
  a silent pass.
- Every governed action leaves a receipt + proof artifact (action, policy
  decision, cost, timestamp) in the session's run record — the
  self-documenting audit trail. The policy editor shows the effective rule
  for any action ("why was this allowed?").

### M3. Command/network policy + shell-parse safety crate + audit log (Factory, VTCode, Bob)
- Harness-enforced lists — network hosts allowed, shell commands
  allowed/denied/require-approval — enforced by the TOOL RUNNER before
  execution, not by the model's goodwill. A denied command never reaches
  the shell.
- The shell is PARSED (tree-sitter-bash shape: command + args + redirections
  + pipes, with an LRU cache), not pattern-matched, before judging; dynamic
  shell syntax (`$(...)`, backticks, `eval`) is detected and treated as
  require-approval. Per-tool / per-arg allow/deny/prompt.
- Every judged command is written to a JSONL audit log (what ran, what was
  judged, what the policy said). The log is viewable in the Safe Mode panel.

### M4. Harness-enforced sandbox (Devin CLI, Stakpak, DeepAgents) — Stage 6
- OS-level file-scope + domain allow/deny for Autonomous mode, enforced
  outside the model: the agent runs with a backend (LocalShell vs
  SandboxBackend) and tools are filtered per backend capability — a tool
  the backend can't safely offer is simply absent, never refused by prompt.
- In the web app: build the policy UI + backend picker + capability filter
  against a clearly-marked desktop stub that says the OS enforcement lands
  at Stage 6 Electron. Never fake an OS sandbox in the web app. Include a
  health-monitor loop design note (the sandbox reports its own health; a
  dead sandbox blocks the task loudly).

### M5. Pre-send prompt scanner + secret substitution (Bob, Stakpak)
- BEFORE any prompt reaches a model: normalization + secrets/PII scan +
  redact + real-time policy check, INSIDE the workflow. Secrets are
  redacted to `[REDACTED_SECRET:<kind>:<id>]` before the model and restored
  at the tool-execution boundary via a session redaction map — the model
  never sees the real value.
- Privacy mode also redacts IPs / AWS IDs. The scan covers 210+ secret
  types by pattern (gitleaks shape). A redaction is shown in the chat as a
  marker ("🔒 2 secrets redacted before sending") — never silently, never
  with the value. The scanner runs on pasted prompts too, not just typed
  ones.

### M6. Model-judged approvals (Goose, Poolside)
- A classifier model judges approval: LOW runs immediately, MEDIUM runs
  with a notice, HIGH opens a dialog. Read-only actions are auto-approved.
  Untrusted instructions are kept OUT of the system prompt so they can't
  talk the judge into approving.
- FAIL-CLOSED on classifier failure: if the judge errors or times out, the
  action is denied, never auto-approved. The judge's verdict + reason are
  logged as session events. This is an OPTIONAL layer in front of Safe
  Mode (off by default, toggle in Settings → Safe Mode); Safe Mode still
  wins any conflict.

### M7. Trusted folders (Mistral)
- Per-workspace trust decision (trust repo / trust current folder / trust
  this session only / decline), persisted. Dangerous operations are BLOCKED
  in untrusted folders and in $HOME, with a plain explanation and a
  one-tap "trust this folder" (which itself asks for confirmation).
- The trust state is shown in the project header. A project opened from an
  untrusted folder starts in read-only mode until trusted.

### M8. Spend governance — hard caps + attribution + cost line (Kimchi)
- Hard caps that stop requests AT the limit, not after: per project, per
  task, per model. When a cap is hit the task pauses with a plain message
  and a "raise cap / switch model / stop" choice — never a surprise bill,
  never a silent overrun.
- Every router call is tagged with a work ID for attribution; the Usage
  dashboard shows spend per task / per project / per model / per tag.
  The Senior's final report carries a cost line ("this task cost X tokens,
  $Y, across N models").

### M9. Plan with estimated token cost per step (Cortex)
- The planner emits the plan WITH a cost estimate per step; the plan view
  shows the total estimate before the user approves it. After the run,
  actuals are reconciled against the estimate (estimated vs actual, per
  step) and shown in the task report.
- Estimates come from the plan's shape (steps × typical tokens per step
  type, learned from past runs), never from a model guess at runtime.

### M10. Agent evals (Cortex)
- Eval a finished agent run, not just a model: Answer Correctness vs
  ground truth (the task's rubric, Batch 12 L3), Tool Selection Accuracy
  (did it pick the right tools?), Execution Efficiency (steps vs the
  minimal path). Scores are stored per run and shown in the task report.
- Extends the model benchmark (8a F3): the benchmark scores MODELS, evals
  score RUNS. A small built-in eval set ships with the feature so the user
  can see it work before running it on their own tasks.

### M11. Shell-tool approvals library (Stakpak)
- Approve a whole CLASS of shell commands at once, with matching rules:
  parse / match / resolve — e.g. approve "npm test *" but not "npm
  publish". Bulk approval is explicit (the user picks the class and sees
  exactly which commands it covers) and revocable per class.
- Approved classes are listed in the Safe Mode panel with their match
  counts; a class that has never matched in 30 days is flagged for review.

### M12. Rulebooks with URI/tag filtering (Stakpak)
- Rulebooks scoped by file pattern and tag: include/exclude URI wildcards
  + tags (e.g. "security rules apply to `src/**`, tag:auth"). The Rules
  panel shows which rulebook applies to the current file, and a switcher
  turns rulebooks on/off per project.
- Extends the rules chain (8b G12): rulebooks sit in the chain with their
  scope shown, and a lower rule never silently overrides a higher one.

### M13. AGENTS.md cascade (amp)
- Rules cascade down the directory tree: working dir → parent dirs →
  system-wide, per-package AGENTS.md. The Rules panel shows the cascade
  and, for any rule, which file it came from and what it overrides.
- Conflicts are listed in the panel with the winner named — a lower rule
  never silently overrides a higher one (same rule as 8b G12, extended to
  the directory cascade).

### M14. Quote-before-spend + provider reputation (Agoragentic)
- Two-phase quote for PAID tools: before a call that costs money, the
  agent gets a quote (what it will cost), the user approves the quote, then
  the call executes against the quote id. No quote → no paid call. Free
  tools never need a quote.
- Provider reputation tiers — Unverified / Verified / Audited — plus
  success-rate tracking, feeding the router's scores: a provider that
  keeps failing loses routing share automatically. Reputation is shown in
  the Engines view (8b G21).

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
  second graph/index/queue/store/scheduler/session-log/API/router. M2/M3
  write receipts + audit entries into the ONE event log (G14). M8/M9/M10
  report into the ONE usage dashboard. M4's sandbox is a desktop stub in
  the web app — never a fake OS sandbox.
- Safe Mode (H2.3) still gates everything dangerous and still WINS any
  conflict: M6's judge can only approve what Safe Mode already allows;
  M1's high rung never bypasses a project-level "never push" standard;
  M7's trust decision itself asks for confirmation.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner (M5 feeds it findings, does not rebuild it).

## Tests (required, same pattern as every batch)

- New suite `test-batch-13.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each M1–M14 with at least 2 assertions on REAL behaviour:
  a destructive action in low rung asks while a reversible one in medium
  auto-approves, and a task never climbs rungs silently; a missing policy
  blocks with a reason and every governed action leaves a receipt; a denied
  shell command never reaches the shell, a `$(...)` command needs approval,
  and the audit log records the judgement; the sandbox UI honestly marks
  OS enforcement as desktop-only and a tool the backend can't offer is
  absent; a pasted API key is redacted before the model and restored at the
  tool boundary, with the redaction marked in chat; a judge failure denies
  (never approves) and a low action runs immediately with its verdict
  logged; a dangerous op in an untrusted folder is blocked and the project
  starts read-only; a cap stops requests AT the limit with a choice, and
  spend is attributed per work ID with a cost line on the Senior report; a
  plan shows per-step estimates before approval and reconciles actuals
  after; an eval scores a run on correctness/tool-selection/efficiency; a
  bulk approval covers exactly its class and is revocable; a rulebook
  applies only inside its URI scope and the panel names the winner; the
  cascade names the winning file for a conflict; a paid call without an
  approved quote never runs and a failing provider loses routing share.
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
