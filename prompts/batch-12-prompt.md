# Batch 12 — Team Mode + verification loops (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §23 (Kimchi),
§16 (DeepAgents), §20 (FastAgent), §6 (SWE-agent), §7 (amp), §9 (Devin CLI),
§4 (Windsurf), §21 (Grok), §19 (Factory), §15 (Corust), §5 (CrewAI),
§12 (Bob), §25 (MiniMax), §31 (Sigit).

Already built that you must EXTEND, never rebuild:
- Team Mode v2 (templates, live team chat, drag-to-reassign board, Senior
  diff review, Auto-team, arbitration/voting, checkpoints, replay/export,
  team memory → Brain) — L1/L7/L9/L10/L13/L18 all extend it; the Senior
  review gate stays the final gate.
- Batch 5 D3 smart routing + 8c M1/M2 (auto-failover / best-model) + 8b G9
  model roles — L1 is role assignment v2 ON the same roles table, never a
  second roles system. The router stays the ONE router.
- Batch 7.3 Superpowers (verification-before-completion iron law) + Batch 8a
  F6 adversary mode + Senior review — L2/L3/L4/L5/L6/L7 are verification
  LOOPS around the same iron law, never replacements for it. Four distinct
  mechanisms, built once each: gates (L2), rubric (L3), evaluator–optimizer
  (L4), reviewer/chooser (L5).
- Plan+Build mode — L11/L12/L14 extend it. Batch 8a F2 auto-commit — L8's
  restack is NOT here (Batch 15); L2's fix-checks ride the same commit path.
- 8a doom-loop detection — L19/L20 extend it with verified-progress and
  degenerate-output detection, never a second loop detector.
- Batch 8a F7 custom modes + Skills library — L18's agent files are the
  same custom-agent shape, stored as project files.
- Safe Mode (H2.3): L8's worktrees are Stage 6 only (a browser web app
  cannot create git worktrees) — in the web app, build the worktree POOL /
  registry / merge-gate UI against a clearly-marked desktop stub that says
  so; never fake a worktree. L16's k-voting never spends past the
  per-model rate limits.

## Scope — build all 20, one at a time, slice by slice

### L1. Role-based model assignment v2 (Kimchi)
- Extend 8b G9's roles (Planner/Coder/Reviewer/Tester) to 8 roles:
  orchestrator, planner, builder, reviewer, explorer, researcher, judge,
  compactor. Each role maps to a model OR an ORDERED candidate list,
  user-overridable in Settings → Model roles (same editable-table shape as
  the 8c M2 table). When a role has multiple candidates the router picks by
  tier + task complexity.
- Rules: build is ALWAYS delegated (the orchestrator never builds directly);
  trivial low-risk changes may be self-reviewed only when the orchestrator
  also owns the reviewer role. Capability sync: a routed model inherits the
  target's reasoning / contextWindow / maxTokens so a cheap stand-in behaves
  like the named model. Applies in Solo AND Team modes; changing a role's
  model once changes it everywhere that role is used.

### L2. Deterministic verification gates + fix-check contract (Kimchi)
- Replace/augment free-form Senior grading with a GATE REGISTRY:
  deterministic accept/refuse logic applied to structured gate verdicts the
  agent emits at every completion tool. The only judge call left interprets
  a non-zero verify-command exit as pass/retry/fail.
- Recommendation contract, adopted verbatim as the Senior's output format:
  max 3 recommendations, severity-ordered, each stating what is wrong / why
  it matters / what must change / what evidence proves the fix — and EACH
  MUST END WITH A RUNNABLE FIX-CHECK (a command, file inspection, or grep
  that passes only once the defect is gone). Demands must be producible in a
  headless environment (no screenshots/demos); anything needing human eyes
  is marked "manual review needed" and is advisory only, never a downgrade
  reason.
- A nudge-builder for Plan+Build step execution: fully-specified "nudge"
  prompts (exact next tool call + step description + verify command + phase
  context) so the agent never has to guess its next action.

### L3. Rubric grading (DeepAgents)
- Declare "done" UP FRONT as a rubric: before a task starts, the agent
  (or the user) writes the acceptance rubric; a separate grader sub-agent
  scores the transcript against it; `needs_revision` → feedback injected,
  re-loop until satisfied / failed / max_iterations.
- The rubric is shown in the task header and in the final report ("met 4/5
  rubric items, failed: …"). The grader never edits code — it only scores.

### L4. Evaluator–optimizer loop (fast-agent)
- A reusable generate → critique → regenerate loop with a NUMERIC quality
  bar: a generator drafts, an evaluator returns a structured verdict
  (rating POOR/FAIR/GOOD/EXCELLENT + feedback + `needs_improvement` +
  focus areas), loop until `min_rating` (default GOOD) or `max_refinements`
  (default 3). Applies to code, docs, AND plans — not just diffs.
- The loop is a Team Mode primitive the Senior can invoke for any artifact,
  with its bar and cap visible in the task header.

### L5. Reviewer/chooser retry loop (SWE-agent)
- Retry up to N tries; each try is SCORED; a chooser (with a preselector)
  picks the best try. Distinct from L4: L4 refines ONE draft, L5 runs
  SEVERAL independent tries and chooses.
- The chooser's pick is shown with the scores of the rejected tries, so the
  user can see why it won.

### L6. Oracle (amp)
- A fresh-context second-opinion subagent that critiques the DIAGNOSIS
  before any code is written ("is this really the bug? is this really the
  right fix?"). The Oracle sees the diagnosis + evidence, NOT the
  implementation plan, and returns agree / disagree-with-reason.
- A disagree blocks the build step until the diagnosis is revised or the
  user overrides. The Oracle runs before code, the Adversary (8a F6) runs
  after — they are different passes.

### L7. /loop diff-review loop (Devin CLI)
- A user-invoked repeat-until-clean loop: prompt → apply → git-diff review
  → fix → repeat until the diff is clean or the user stops it. Each loop
  shows its diff; the loop has an iteration cap (default 5) and says so.
- The loop is a chat command (`/loop <instruction>`), and its iterations
  are events on the session timeline (G14).

### L8. Worktree-parallel agents (Windsurf, Grok, Factory, VTCode, Mistral)
- One git worktree per team agent instead of all agents sharing one tree,
  so parallel agents never collide on files; a human gates the merge.
- Design (Stage 6 desktop): a pre-created worktree POOL so spawning is
  instant; a registry tracking every worktree (status, label, kind);
  auto-GC (max-age, dry-run, rebuild from disk discovery); snapshot/restore
  helpers (freeze a worktree to a git ref, revive it later); a resolver
  (use existing / create named / create per prompt, lifecycle limits).
  Verify-then-merge: a subagent loop in a worktree runs a verify closure
  before its work is merged.
- HONEST SCOPE, stated in the UI: a browser web app cannot create git
  worktrees. In the web app, build the pool / registry / merge-gate UI
  against a clearly-marked desktop stub; the real worktree creation lands
  at Stage 6 Electron. Never fake a worktree in the web app.

### L9. Missions — Validator role + milestones (Factory)
- Extend Team Mode with an explicit VALIDATOR role (own model + reasoning
  effort): a coordinator decomposes work into milestones, delegates to
  workers, and validators check EACH milestone before the next starts.
- Milestones are tracked on the team board (pending / in progress /
  validated / failed) and the Senior review gate still runs at the end.
  A mission can be defined in a file (`.devforge/missions/<name>.md`) and
  run headless.

### L10. Language-specialist agents with compiler-as-verifier loop (Corust)
- Per-language specialist team members: each language gets a specialist
  whose gate is that language's own compiler/linter (e.g. Rust: cargo
  check/clippy/fmt as pass/fail; JS/TS: tsc + eslint; Python: ruff).
- Specialists are Team Mode templates (like the existing 4), each naming
  its verifier commands. A specialist's work is not "done" until its
  verifier passes — the gate is the compiler, not the model's opinion.

### L11. Flows — deterministic event-driven orchestration (CrewAI)
- A Flow is a deterministic workflow with typed state and a resume point,
  not a free-form agent ramble: `@start` / `@listen` / `@router` steps,
  `and_`/`or_` conditions, a `@persist` resume point, a `@human_feedback`
  gate, a FlowDefinition YAML, usage rollup per flow, and an auto flow
  diagram.
- Flows live beside Recipes (Goose, Batch 7.5): a Recipe is a shareable
  workflow with params + checks; a Flow is a deterministic one with typed
  state. Same runner, different shape — never a second runner.

### L12. Conditional tasks + output guardrails (CrewAI)
- Plan+Build steps gain a `run_if` predicate: a step whose predicate is
  false is SKIPPED — and a skipped step still emits its output (so
  downstream steps never see a hole).
- Output guardrails: a step's output is validated (schema / checklist);
  on failure it retries, bounded (≤N, default 3), then fails loudly with
  the validation errors attached.

### L13. Reproduce-first bug-fix recipe (SWE-agent)
- The bug-fix flow ALWAYS reproduces first: find/read → write a repro
  script → edit → re-run repro → edge cases, minimal changes. The fix is
  not "done" until the repro passes AND the edge cases are checked.
- This becomes the default shape of Project Doctor's auto-fix and the
  self-healing preview loop (B3): a fix task without a repro script is
  refused with a plain note.

### L14. Spec Mode with separate planning model (Factory)
- "Plan with a stronger model": the agent researches the repo and writes
  a spec first (acceptance criteria, technical design, expected file
  changes, test strategy, implementation steps), an approval gate, then
  implements. The planning model is separately configurable (a stronger
  model for planning, a cheaper one for building).
- Approved specs are saved as Markdown in the Brain as a durable record.

### L15. Capability Dial (amp)
- An effort dial in the chat header: Low / Medium / High / Ultra. The
  USER picks effort; the SYSTEM picks the models (through the D3 router +
  8c M2). UX over the router, never a second router.
- The dial shows its cost honestly before the task starts ("Ultra ≈ 3–4×
  tokens") and the Usage tab records dial spend separately.

### L16. MAKER k-voting — reliable mode for cheap/free models (fast-agent)
- A router "reliable mode" for short deterministic steps (classify,
  extract, small edits): sample the worker 3–5 times INDEPENDENTLY
  (no shared history), discard "red-flag" outputs (too long, malformed),
  first response to lead by k votes wins. Match strategies: exact /
  normalized / structured-JSON. Max samples 25, default 5, k default 2.
- Ideal for free Nemotron/StepFun models where a single sample is flaky.
  The mode is a per-task toggle ("Reliable"), off by default, and its
  extra calls are shown in the Usage tab. Never spends past per-model
  rate limits.

### L17. Modernization playbook (Bob)
- A coordinated multi-agent upgrade playbook: code → tests → docs →
  pipelines, in stages, with Senior review at EACH stage. A playbook is a
  Recipe (Batch 7.5) with a stage list; each stage is a Team Mode job.
- Ships with one worked example (e.g. "upgrade this project to the new
  router") so the user can see the stages before running one.

### L18. Custom agents as repo-shipped Markdown files (Factory)
- Agent definitions as Markdown files inside the project
  (`.devforge/agents/<name>.md`) with frontmatter (system prompt + model
  preference + allowed tool set), committable so a team shares specialists.
  The same custom-agent shape as 8a F7 — stored as project files, our own
  format. Can import Claude Code agent definitions.
- The Team Mode agent editor reads/writes these files; an agent defined in
  a file and one defined in the UI are the same thing.

### L19. Runaway guard — verified-progress loop detection (MiniMax)
- Extend doom-loop detection (8a): 6 signal kinds — exact_action_repeat,
  exact_result_repeat, same_error_family, abab_action_cycle,
  polling_repeat, unchanged_progress_repeat. Reads VERIFIED progress from
  tool provenance / file hashes, NOT from the model's claims. Reminder
  after N≥3; shadow/observe-only mode watches without interrupting; a
  replay log lets the user inspect what looped.
- Distinct from 8a's repetition detection (which watches the model's
  output): this watches whether the WORLD changed.

### L20. RepetitionGuard — degenerate-decoding detector (Sigit)
- A ~60-line guard, zero model calls: sliding 200-word window re-checked
  every 25 words; ≤40 distinct words = degenerate (vs ~90–120 normal
  prose); fenced code blocks skipped; O(1) via word-count map + deque.
- When it fires, the turn is stopped, the degenerate tail is discarded,
  and the agent is told plainly to restart that step — before it burns
  more tokens. The cheapest high-value item in this batch.

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
  second graph/index/queue/store/scheduler/session-log/API/router. L1
  roles extend the ONE roles table. L11 Flows share the Recipe runner.
  L8's worktree UI is a desktop stub in the web app — never a fake
  worktree. L2/L3/L4/L5 are four distinct loops around the SAME iron law.
- Safe Mode (H2.3) still gates everything dangerous: L8 never merges
  without the human gate; L16 never spends past rate limits; L10's
  compiler gates run read-only commands unless the task already permits
  writes.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner, Batch 10's edit protocol (L13's repro scripts
  use it, do not re-implement it).

## Tests (required, same pattern as every batch)

- New suite `test-batch-12.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each L1–L20 with at least 2 assertions on REAL behaviour:
  a role change updates every agent using that role and build is always
  delegated; a gate registry refuses a completion whose fix-check fails and
  a Senior recommendation ends with a runnable fix-check; a rubric is
  declared up front and the grader's needs_revision re-loops with feedback;
  an evaluator–optimizer loop stops at GOOD or at its cap; a chooser picks
  the highest-scored try and shows the rejected scores; an Oracle disagree
  blocks the build step until revised or overridden; a /loop run repeats
  until the diff is clean or hits its cap; the worktree UI shows pool +
  registry + merge gate and honestly marks creation as desktop-only; a
  mission's milestones validate in order and a failed milestone blocks the
  next; a language specialist's work is not done until its compiler gate
  passes; a Flow runs its steps in order, resumes from its persist point,
  and stops at its human gate; a skipped conditional step still emits
  output and a failed guardrail retries ≤N then fails loudly; a bug-fix
  without a repro script is refused; a spec is written by the planning
  model, gated, then implemented, and saved as a Brain note; the effort
  dial shows its cost and records spend separately; a k-vote picks the
  majority answer and discards a malformed sample; a playbook runs its
  stages with Senior review at each; an agent file round-trips through the
  editor; a runaway loop is caught by unchanged verified progress (not by
  output repetition) and a shadow-mode run only observes; degenerate output
  is stopped and its tail discarded.
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
