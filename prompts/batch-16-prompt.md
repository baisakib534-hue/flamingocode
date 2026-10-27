# Batch 16 — Harn mechanisms: self-parking agents, transactional + AST edits, merge-model apply, crystallization

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §22 (Harn),
`std/agent/workers.harn` (spawn_agent / resume conditions),
`std/edit/safe_patch.harn` (transactional edits),
`std/edit/function_body.harn` (AST symbol edits),
`std/edit/fast_apply.harn` (merge-model apply),
`docs/src/workflow-crystallization.md` (crystallization).

Already built that you must EXTEND, never rebuild:
- Team Mode v2 + sub-agents — P1 is self-parking ON it, never a second
  agent system. Resume conditions are checked against the Batch 8b G14
  event log and the Batch 6 E5/G17 trigger-spec parser — never a second
  store, never a second scheduler, never a second log.
- Batch 7.2 diff-based editing — P2/P3/P4 are edit-path extensions ON it,
  never a second edit path. The Brain code graph is the ONE graph — P3
  reads symbol spans from it, never a second index. Tier A checkpoints
  stay the session-level undo — P2's rollback is per-edit, never a second
  checkpoint store.
- Batch 5 D3 smart routing + `getCheapProvider()` — P4 calls the cheap
  provider's first model (same as the Batch 8a adversary), never a second
  router and never the primary model for merge work.
- Batch 7.5 Recipes + Batch 8b G14 event log — P5 mines the G14 log and a
  promoted workflow IS a Recipe, never a second workflow store.
- Batch 10 J1 (hash-anchored edits), J2 (AST-inspect), J6 (fuzzy
  SEARCH/REPLACE) — P2 anchors on J1's hashes, P3 extends J2's spans into
  writes, P4 falls back to J6. Never a second anchoring or apply path.
- Safe Mode (H2.3) still gates everything dangerous: P1's resumed agent
  runs under the same Safe Mode; P2's hooks never bypass Safe Mode; P5's
  shadow-check never writes a file or calls a tool.

## Scope — build all 5, one at a time, slice by slice

### P1. Self-parking subagents with resume conditions (Harn)
- A subagent (Team Mode) can suspend itself with a reason + resume
  conditions: a trigger (the G17 trigger-spec parser), a timeout in
  minutes, or an EventLog topic (`on_event`). The resume action is one of:
  `resume_with_summary` (continue with a short summary injected),
  `fail` (end the subagent as failed), `resume_with_input` (continue only
  when fresh input arrives).
- The parent sees every parked subagent in the team view (reason, resume
  condition, parked-since) with pause / resume-now / stop controls. A
  stopped subagent never resumes. A parked subagent keeps its plan, its
  completed steps, and its Brain digest — resuming continues from its exact
  next step, never re-runs a completed step.
- Resume conditions are checked on every session event and on a cheap
  timer tick (timeouts); the check itself costs no model call. Every park
  and resume is a G14 session event with its reason.

### P2. Transactional edits — per-edit hooks + dry-run + rollback (Harn)
- Every file edit runs inside a transaction: capture a rollback snapshot
  (before-hash + before-content) FIRST; run the `pre_apply` hook (any
  registered hook may veto with a reason — a vetoed edit leaves the file
  untouched and says why); check the write policy; apply; run the
  `post_apply` hook; on any failure, restore the snapshot and fire the
  `on_rollback` hook.
- A dry-run mode returns the would-be diff without writing anything.
  Every applied edit records a receipt in the G14 event log (path,
  before/after hash, which hooks ran, rollback snapshot id).
- Hooks are small registered functions (Brain rules / skill hooks), listed
  on the edit panel with what each one checks. A hook that throws never
  breaks the edit — it is treated as a veto with its error as the reason.

### P3. AST symbol-targeted edits (Harn)
- Replace a function body by symbol NAME (not line numbers, not search
  text): `replaceSymbolBody(session, file, symbolName, newBody)` looks the
  symbol's span up in the Brain code graph, splices the new body in, and
  verifies the result still parses (the existing syntax check). The edit
  goes through the Batch 7.2 diff path, so it shows as a normal diff and
  is covered by Tier A checkpoints.
- When the parser or the span is unverified (no span, stale graph, parse
  failure after splice), it falls back to J6 fuzzy SEARCH/REPLACE and says
  so in the result. A missing symbol returns a clear error, never a silent
  no-op. The event log records which path was used (AST vs fallback).

### P4. Merge-model fast apply (Harn)
- A second apply strategy beside J6: `applyWithMergeModel(session, file,
  intent)` sends (path, preimage content-hash, edit intent, full
  before-content) to the cheap provider's first model and asks for JSON-only
  complete after-content — no markdown fences, no placeholders, no
  explanations. The result is hash-checked (must differ from the preimage
  in exactly the intended way) and must still parse before it is applied
  as one diff.
- On ANY failure — fenced output, placeholders, unparseable JSON, hash
  mismatch, parse failure — it falls back to J6 SEARCH/REPLACE and records
  the fallback. The event log records which apply path was used. The merge
  model is never the primary model and never the model doing the task.

### P5. Workflow crystallization (Harn)
- Mine the G14 event log for repeated work: find repeated contiguous
  action sequences (same tools, same order, 3+ occurrences), extract the
  scalar parameters that varied across occurrences, reject any candidate
  whose side effects diverge, and mark model-dependent steps as fuzzy.
- Each candidate becomes a reviewable skeleton + manifest: the workflow
  outline, the extracted parameters, the capability set it needs, required
  secrets, the side effect of each step, where the approval boundaries sit,
  which steps are deterministic vs fuzzy, and a rollback target — plus an
  eval pack (the source traces it was mined from).
- Shadow-check: replay the candidate's deterministic steps against
  holdout traces WITHOUT mutating anything (no file writes, no tool calls,
  no model calls for the deterministic part) and report pass/fail per
  trace. Only his tap promotes a candidate — a promoted workflow becomes
  a Recipe (Batch 7.5) whose deterministic steps run as plain code and
  whose fuzzy steps still call the model. A promoted workflow never
  auto-runs without being invoked.

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
  second graph/index/queue/store/scheduler/session-log/API/router. P1
  resumes read the ONE G14 event log. P2's rollback snapshot lives in the
  ONE checkpoint store. P3 reads the ONE code graph. P5 mines the ONE
  event log and promotes into the ONE Recipes store.
- Safe Mode (H2.3) still gates everything dangerous: P1's resumed agent
  runs under the same Safe Mode; P2's hooks never bypass Safe Mode; P4's
  merge model never writes directly, only through the diff path; P5's
  shadow-check never writes or calls tools.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner.

## Tests (required, same pattern as every batch)

- New suite `test-batch-16.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each P1–P5 with at least 2 assertions on REAL behaviour:
  a subagent parks with a reason + timeout condition and resumes with a
  summary when the timeout passes; a parked agent with an on_event
  condition resumes when that event lands in the log; a stopped agent
  never resumes and a resumed agent keeps its completed steps; a pre_apply
  veto leaves the file untouched and names its reason; a failed apply
  restores the rollback snapshot and fires on_rollback; a dry-run returns
  the diff without writing; a symbol-body replace updates only that body
  and the file still parses; an unverified span falls back to text edit
  and says so; a merge-model apply returns complete after-content with no
  fences or placeholders and the hash check passes; a fenced or
  unparseable merge response falls back to J6; the event log records
  which apply path was used; repeated traces mine into a skeleton +
  manifest naming capabilities, secrets, and rollback; a candidate with
  divergent side effects is rejected; a shadow-check runs against holdout
  traces without mutating anything; promotion needs his tap and a promoted
  workflow runs its deterministic steps without a model call.
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
