# Batch 10 — context engineering + editing (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §18 (Dirac),
§6 (SWE-agent), §17 (DimCode), §16 (DeepAgents), §25 (MiniMax), §32 (VTCode),
§1 (Aider), §29 (Pi), §24 (Kimi), §11 (Auggie), §28 (Mistral), §14 (Crow),
§31 (Sigit), §26 (Minion).

Already built that you must EXTEND, never rebuild:
- Batch 7.2 diff-based editing (Roo) — J1/J6/J8 are the EDIT PROTOCOL on top
  of it, never a second edit path. The Brain code graph (Stage 6 plan) is the
  ONE graph — J2 exposes it as a tool, J1 stores anchors in it, never a
  second index.
- Brain v2 auto-summarization — J4 is compaction v2 ON it, never a second
  summarizer. Batch 4 lazy tool loading — J9 extends it to skill bodies.
- Batch 7.1 Repo Map + Batch 5 D3 smart routing + 8c M1/M2 (auto-failover /
  best-model) — J3 routes THROUGH the D3 router; J14/J15 are the catalog +
  the "Auto" picker entry, never a second router.
- Tier A checkpoints — J18 is checkpoint v2 ON them, never a second
  checkpoint store. H1.5 session store + G14 event-sourced state (8b) —
  J17 journals into the SAME session store.
- Per-model rate limits + 8b G9 model roles — J16 is a per-model setting on
  the SAME role/model system, never a second model config.
- Batch 6 E15 session API + Team Mode sub-agents — J13 forks context
  through the session API, never a second channel.
- Usage dashboard (Tier B) — J11 reports there, never a second meter.
- Safe Mode (H2.3) still gates everything dangerous: J10's sandboxed scripts
  can only call tools the agent could already call, and only inside the
  agent's current permissions.

## Scope — build all 18, one at a time, slice by slice

### J1. Hash-anchored line edits (Dirac)
- Replace line-number-based edits in the agent's file-apply path with ANCHOR
  IDs: every line gets a content hash (FNV-1a 32-bit); on each read the file
  is reconciled with a Myers diff — unchanged lines KEEP their visible
  anchor IDs, new lines get fresh IDs from a dictionary-word pool
  (`word+word` combos). The model sees lines as `Word§<content>` and the
  edit tool targets anchor IDs, never line numbers, so edits survive drift
  without re-reading the file.
- Anchors live in the Brain code graph (one anchor table per file). Caps:
  max anchored lines/bytes per file (over → fall back to the existing
  shell-edit path), 1,024 tracked files, state persisted per task.
- Atomic multi-edit folds in: several find/replace pairs in ONE file, ONE
  call, applied bottom-up so earlier anchors don't drift.

### J2. AST-inspect tool on the Brain code graph (Dirac inspect_ast)
- Expose the Brain's tree-sitter code graph as a first-class agent tool
  with five operations: `outline` (declarations, no bodies),
  `implementation` (complete named definitions), `definitions` /
  `references` / `occurrences` (exact indexed symbol locations, qualified
  names like `UserService.load`). Batched paths+symbols, result reducer +
  implementation cache. Read-only.
- The tool description tells the model to prefer it over broad read/grep
  when structure matters. In the web app the graph is the existing
  JS-side index (tree-sitter lands at Stage 6); the tool's SHAPE and
  operations are the same either way.

### J3. Cache-stable prompt construction + history processors (DimCode, SWE-agent)
- Freeze the system prompt and the tool-definition block byte-for-byte
  across turns in a session, and keep a stable history prefix (never
  re-order or re-render it) so provider KV-cache hits stay high — the
  free-first user on 9router stops re-paying prompt cost every turn.
- History is a pipeline: processors transform it before the call
  (LastNObservations keeps the last N tool observations full and shrinks
  older ones; cache_control marks the last 2 messages). A small panel in
  the Usage tab shows the cache-hit estimate per session (tokens re-paid
  vs reused, from the provider's usage fields when present).

### J4. Compaction v2 (DeepAgents, Pi, Auggie, Dirac, Poolside)
- Recoverable summarization: at 85% context, summarize keeping the last
  ~10% of turns VERBATIM; evicted history is appended to a per-session
  history file (`.devforge/history/<session>.md`); summaries CHAIN (each
  new summary covers the previous summary + the evicted turns).
- Structured compaction entry: every compaction records a file-op ledger
  (which files changed, which notes were written) so a compacted session
  can still prove what it did. Auto-compact triggers at window−16k reserve,
  keeping the last 20k tokens verbatim.
- Predictive headroom: compaction starts BEFORE the wall (warn at 70%,
  compact at 85%, never at 99%). A cheap-model condenser does the
  summarizing when a cheap model is configured; otherwise the current
  model summarizes. A PreCompact hook fires before every compaction so
  hooks/skills can inject last-moment context. The user can invoke
  compaction manually (a `compact` command); the agent can too, through a
  `compact_conversation` tool.

### J5. Tool-output budget + artifact spillover + clearing rules (MiniMax, DeepAgents, VTCode)
- Every tool result has a byte cap (per-tool caps, configurable): over the
  cap it is spilled to an artifact file and the model gets a head/tail
  preview + a reference it can page back on demand. Human messages over
  50k tokens are offloaded the same way (preview + path).
- Tool-result clearing: outputs over 10k lines are trimmed to the first
  5k + last 5k lines; large outputs are spooled to disk instead of held in
  context. Sensitive tools (ones that can print secrets) get a lower cap
  and their spillover files are marked sensitive.
- The chat shows spilled results as a collapsible "large output" block
  with a "load more" action — never a silent truncation.

### J6. SEARCH/REPLACE fuzzy edit blocks + apply pasted patch (Aider)
- The model may emit SEARCH/REPLACE blocks; when a block doesn't match
  exactly, repair it with fuzzy matching (difflib-style similarity,
  threshold 0.6) and offer a "did you mean" retry showing the closest
  match — instead of failing and re-asking the model for the whole edit.
- "Apply a pasted patch": the user can paste a unified diff (or a block
  from any free chatbot) and the app applies it through the same
  J1-anchored apply path, with a diff review before apply (Tier A rule).

### J7. ACI windowed tools (SWE-agent)
- The agent's file tools work on WINDOWS: `open`/`goto`/`search` show a
  file window with line numbers (anchored, J1); `edit` replaces a line
  RANGE; `run_tests` returns a pass/fail summary (not raw logs);
  empty command output is explicitly confirmed ("(no output)") so the
  model never guesses whether a command ran.
- Window size is capped (default 200 lines); a window that would exceed
  the cap is refused with a suggestion to narrow it.

### J8. Multi-file batching in one round-trip (Dirac)
- The agent loop allows parallel tool calls per turn; related reads/edits
  are sent together and batched edits are applied in reverse file order
  (bottom-up) so earlier anchors don't drift.
- A batched turn shows as ONE entry in the session timeline with its
  per-file results, and a failure in one file never silently drops the
  others — each file's result is reported separately.

### J9. Skills as progressive disclosure (DeepAgents)
- Only SKILL.md HEADERS are injected per call; a skill body loads on
  demand when the agent actually invokes that skill. The Skills page shows
  each skill's loaded state (header-only / loaded) and its token cost.
- This extends Batch 4 lazy tool loading to skill CONTENT, under the same
  setting (load-when-needed vs pre-loaded).

### J10. Codemode (Pi)
- A "write a script that drives the tools" mode: the agent writes a small
  JS program that calls its own tools (`tools.*`, `text()`, `image()`,
  `store()`/`load()` KV, `searchTools` BM25, `describeTool`) for
  multi-step mechanical work, instead of one tool call per turn.
- The script runs in a sandboxed iframe/worker in the web app (QuickJS
  lands at Stage 6), with hard caps (10k output tokens / 16M chars /
  timeout). It can only call tools the agent could already call, inside
  the agent's current Safe Mode permissions. The script is shown in the
  chat (readable, editable) before it runs.

### J11. Token-exhaustion diagnostics (Aider)
- When a call fails on tokens, the Usage tab + chat say WHICH side
  exhausted (input context vs output limit) and what to do: input →
  "compact now / drop files from context"; output → "split the task /
  ask for a shorter answer". Estimates carry a 0.7 fudge factor so the
  warning fires before the real wall.
- The diagnostic is a plain-language Bengali line, never a raw provider
  error.

### J12. File-freshness guard (Minion)
- Every file read records mtime+size; an edit based on a file that changed
  since it was read (by the user, another agent, or another session) is
  REFUSED with a plain warning ("এই file টা তুমি পড়ার পর বদলে গেছে —
  আবার পড়ে নিচ্ছি") and the agent re-reads before retrying.
- The guard is visible in the diff review: a stale-read edit can never
  reach apply.

### J13. Subagent context fork (Kimi)
- When the Senior (or orchestrator) spawns a sub-agent, it may pass a
  FORKED SNAPSHOT of the relevant conversation — not the whole history, a
  capped slice (max input size, configurable) — so the child has context
  without re-asking. The fork is marked in the child's session header
  ("forked from <parent session>, <n> messages").
- This is parent→child context inheritance, distinct from Goose session
  fork (8a, session branching). The fork is behind an experimental toggle,
  off by default, in Team Mode settings.

### J14. Model capability catalog (Pi, Crow, Sigit)
- ONE catalog of what each model can actually do: bundled metadata
  (context limits, prices, thinking budget, image limits) + EMPIRICALLY
  probed capabilities (vision / tool-calling / long-context, probed by
  running tiny test calls and storing the OBSERVED result) + local-model
  capability flags (is_tool_calling / max_tokens / context_window).
- The catalog feeds the router (8c M2 best-model, Batch 5 D3): a task
  that needs vision never routes to a model the catalog says can't see.
  The Models/Engines view shows each model's probed capabilities with a
  "re-probe" button. Probed results are stored per model and survive
  restarts.

### J15. Virtual models — router as selectable "Auto" (Pi)
- The model picker gains an "Auto" entry: the router picks the model per
  turn. Sticky-turn rule: tool follow-ups stay on the model that handled
  the turn; only fresh prompts re-route. Selection vs dispatch are
  recorded separately in the session event log (which model was CHOSEN vs
  which one RAN the turn).
- Compaction (J4) uses the PHYSICAL model's limits, never the virtual
  one's. "Auto" is the default for fresh projects.

### J16. Per-model thinking-effort control (Auggie)
- Each model gets a thinking-effort setting (off → minimal → low →
  medium → high → xhigh), remembered per model, cyclable from the model
  picker and settable in Settings → Models. The effort is sent with the
  call only when the provider supports it; unsupported providers ignore
  it silently and the UI says so.
- The effort is recorded per turn in the event log and in the Usage tab
  (effort vs tokens), so the user can see what higher effort actually
  costs.

### J17. Durable harness — crash-proof turn journal (Pi)
- Conversations / turns / tool calls / state are committed to storage
  BEFORE they are shown — a turn journal. A killed round (runtime
  restart, crash, closed tab) resumes from the journal on reopen: the
  session shows exactly where it stopped, with the in-flight turn marked
  "interrupted — resume?" and a one-tap resume that re-runs from the next
  step, never re-running a completed step.
- The journal is the SAME session store (H1.5), never a second log.

### J18. Event-sourced checkpoints v2 (Mistral)
- Checkpoints become an append-only log of turns + manual edits +
  keep/revert decisions; the session History is a pure projection of the
  log. Keep/revert works PER HUNK with dependency closure (reverting a
  hunk also reverts the hunks that depend on it, and says so).
- Reconcile: manual edits the user makes outside the app (editing a file
  directly) are detected by diffing live disk vs the projection and
  captured as their own log entries — never silently lost, never
  un-revertable. "No un-revert": anything the log recorded can be
  reverted.

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
  second graph/index/queue/store/scheduler/session-log/API/router. J1
  anchors live in the ONE code graph. J4 compacts the ONE Brain. J17
  journals the ONE session store. J15 "Auto" routes THROUGH the D3 router.
- Safe Mode (H2.3) still gates everything dangerous: J10 scripts can only
  call tools the agent could already call; J12 never applies a stale edit;
  J18 never reverts without a checkpoint in between.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner.

## Tests (required, same pattern as every batch)

- New suite `test-batch-10.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each J1–J18 with at least 2 assertions on REAL behaviour:
  an edit by anchor ID survives a line-number drift and a stale-read edit
  is refused; the AST tool returns outline/definitions/references for a
  sample file; the system prompt + tool defs are byte-identical across two
  turns and the history pipeline shrinks old observations; a compaction at
  85% keeps the last 10% verbatim and chains summaries, with a file-op
  ledger; an over-cap tool result spills to an artifact with a head/tail
  preview and a >10k-line output is trimmed to first+last 5k; a fuzzy
  SEARCH/REPLACE block repairs with a "did you mean" suggestion and a
  pasted patch applies through the anchored path; a windowed open shows
  line numbers and empty output is confirmed; a batched multi-file turn
  applies bottom-up and reports per-file results; a skill loads
  header-only until invoked; a Codemode script runs in the sandbox under
  its caps and cannot call a tool outside permissions; a token failure
  names the exhausted side with advice; a subagent fork carries a capped
  snapshot marked in its header; the catalog records a probed capability
  and the router refuses a vision task to a model probed as blind; "Auto"
  sticks within a turn and re-routes on a fresh prompt, and compaction
  uses the physical model's limits; a per-model effort setting is
  remembered and logged per turn; a journaled turn survives a simulated
  crash and resumes without re-running a completed step; a per-hunk
  revert pulls its dependents and a manual edit is reconciled into the log.
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
