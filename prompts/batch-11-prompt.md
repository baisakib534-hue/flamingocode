# Batch 11 — Brain + memory + sessions (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §21 (Grok),
§23 (Kimchi), §5 (CrewAI), §14 (Crow), §32 (VTCode), §8 (Antigravity),
§4 (Windsurf), §17 (DimCode), §11 (Auggie), §29 (Pi), §27 (Nova), §9 (Devin
CLI), §28 (Mistral), §24 (Kimi), §18 (Dirac).

Already built that you must EXTEND, never rebuild:
- Brain v2 (atomic notes under `.devforge/notes/`, `[[wikilink]]s`,
  `.devforge/index.md` map) + Brain code graph — K1/K2/K3/K4/K6/K7/K8 all
  write to the SAME Brain, never a second memory. Brain digest ~1500 tokens
  still holds.
- H1 learning loop + Batch 5 D11 repo learning — K10 extends them, never a
  second learning system. H1.5 session store + Batch 6 E15 session API +
  G14 event-sourced state (8b) — K5/K12/K13/K14/K15 use the SAME session
  store, never a second log.
- Batch 10 J4 compaction v2 — K2 captures BEFORE compaction; K1 consolidates
  AFTER sessions. They are two halves of one memory pipeline, not two
  pipelines.
- Batch 5 D1 auto architecture diagrams — K9 (Codemaps) is the interactive
  map ON the same diagram data, never a second diagram.
- Goose session fork (8a) + Batch 10 J13 context fork — K12 is the TREE VIEW
  over forks, never a second fork mechanism.
- Team Mode v2 (templates, live chat, Senior review, auto-team) — K17/K18
  extend it; the Senior review gate stays.
- Relay + phone app (mobile-app prompt) — K14 handoff rides the relay,
  never a second sync protocol. NO cloud session: the handoff package is a
  FILE the user moves (or the relay carries); no hosted cloud leg.
- Safe Mode (H2.3): K5's session search never exposes another project's
  sessions; K14 never hands off a session to a device the user hasn't
  paired.

## Scope — build all 18, one at a time, slice by slice

### K1. Batch Dream memory consolidation (Grok)
- A "Dream" pass that runs after a session ends (or on demand from the
  Brain panel): raw session observations sitting in an inbox are folded
  into durable topic notes under `.devforge/notes/`.
- Rules, copied as mechanism: the pass claims a consolidation LEASE so it
  never edits a scope alongside a live session; it works in plan → commit
  phases with byte budgets (max 20 notes / 256 KB per batch, max 32 changes
  per commit); each commit is persisted before touching topic files so an
  interrupted run rolls forward; a note deferred 3 times is archived as
  "unplaceable" so it stops re-triggering runs.
- Retrieval uses MMR (maximal-marginal-relevance) search + query expansion
  for Brain search — diverse, relevant notes, not just the top-k nearest.
  The Brain panel shows the Dream run: notes consolidated, notes deferred,
  notes archived unplaceable.

### K2. Async memory capture worker + cheap decision gate (Kimchi)
- Project memory is captured automatically WITHOUT ever slowing or breaking
  a session: two capture points — before compaction (the leak point where
  knowledge would be summarized away) and at session shutdown — write small
  atomic JSON job files and spawn a detached, fire-and-forget worker that
  does the capture. Dedupe by message hash so overlapping captures are
  no-ops. A kill-switch setting freezes the store entirely.
- Before a note is written to Brain, a CHEAP classifier gate (a tiny local
  model call, or a keyword/heuristic gate in the web app) answers batched
  choice-questions (keep / drop / merge, with confidence) — fact text
  still comes from the extraction step, retrieval from the Brain index.
  Doctrine, enforced in code: "memory must never break a session; gates
  are filters, not infrastructure" — every gate caller degrades to pre-gate
  behaviour on error.

### K3. Unified Memory (CrewAI)
- The write side of memory: every note saved to Brain gets scope /
  category / importance (analyzed at save time, locally — a small
  rule-based classifier in the web app, model-assisted where a model is
  already being called). The Brain panel can filter notes by scope and
  category, and importance decides what survives when the digest is
  trimmed.
- Recall runs multi-query retrieval in parallel (the user's question
  re-phrased 3 ways + the original) and ranks by composite score
  (relevance + importance + recency), merged and deduped — instead of one
  query, one ranking.

### K4. Typed knowledge ingest (CrewAI)
- Ingest a file of any of these types into the project knowledge store:
  string / pdf / csv / excel / json / text_file. Each becomes chunked
  notes in the Brain with their source file recorded.
- Honest scope, stated in the UI: the web app does chunk + keyword index,
  no vector store; embeddings land at Stage 6. A PDF ingests as extracted
  text (the app's existing PDF text path), never as a binary blob.

### K5. SQL-persistent sessions + query_memory (Crow)
- Sessions are queryable memory, not just a list: a `query_memory` tool
  lets the agent search past sessions with progressive disclosure —
  query → session_id → session_id+query, with content modes and a
  context=N limit. Full-text search (FTS5/BM25 shape) over session text.
- Honest scope: SQLite lands at Stage 6 desktop; the web app uses
  IndexedDB behind the SAME API. Images in sessions are content-addressed
  and hydrated to base64 only when actually sent to a model.

### K6. Evaluator + typed lessons (Kimchi Ferment-v2)
- An independent evaluator step for long Team Mode jobs: it returns
  exactly one JSON object — `{"verdict": "continue|met|impossible",
  "checks": [...], "reason": ...}` — with per-requirement checks, each
  citing evidence by ID (`[m12]` = tool result, `[l3]` = lesson).
- Evidence policy, enforced: ONLY tool results and evidence-labelled
  lessons count as proof; user/assistant claims, plans, file edits, and
  command exit status alone are NOT proof.
- Lessons are harvested from completed todos (max 5 per run, max 1,000
  chars each), typed `decision | evidence | dead-end`, stored in the Brain,
  and fed back as evaluator evidence on later runs.

### K7. Decision ledger (VTCode)
- Every agent decision is recorded: rationale + tool call + expected
  outcome + confidence 0–1. The last 12 decisions are injected into the
  system prompt, and they are marked `preserve_in_compression=true` so
  compaction (Batch 10 J4) never drops them.
- The session timeline shows decisions as their own entries ("decided X
  because Y, confidence 0.8"), and the Senior review can challenge a
  low-confidence decision.

### K8. Self-improving knowledge base (Antigravity)
- The agent proposes procedural items ("how we do X in this project") from
  what it observes; each proposal waits for the USER's approval in the
  Brain panel; approved items become durable Brain notes; rejected ones
  never re-appear.
- Proposals are shown with their evidence (the session + lines they came
  from). This is the concrete mechanism behind "the agent learns the
  repo's conventions" (Batch 5 D11), made visible and user-gated.

### K9. Codemaps (Windsurf)
- Visual architecture maps: nodes are modules/files, linked to EXACT
  source lines; clicking a node jumps to that line in the editor. A map is
  saved as a `.codemap` file in the project and is @-mentionable in chat
  (attaching it loads exactly that map's context, inside the digest cap).
- Built on the Batch 5 D1 auto-diagram data — the same boxes and links,
  made clickable and persistent, never a second diagram.

### K10. Learn skill (Crow)
- The harness improves its own prompts from measured session outcomes: a
  session-DB bench records which prompt wordings preceded good vs bad
  outcomes; the Learn skill proposes prompt tweaks, each shown with its
  evidence, and the user approves before any prompt changes.
- Extends the H1 learning loop — the same loop, with measured outcomes as
  the signal instead of vibes.

### K11. Cross-process occupancy detection (DimCode)
- A lockfile/heartbeat in `.devforge/` when two sessions (web + desktop,
  or two Team Mode workers) share a project: each session writes its id +
  heartbeat; a session that sees another live heartbeat on the same files
  warns before writing ("another session is editing this project") and
  never silently overwrites the other's work.
- Stale heartbeats (no beat for 60s) are treated as dead and cleared.

### K12. Session tree + branch summarization (Auggie, Pi)
- A `/tree` view over session forks: the session's JSONL entries form a
  TREE; the user can jump to any branch; an abandoned branch is
  SUMMARIZED and attached to the branch point (so its work is never lost,
  just folded away).
- Branch summaries are Brain notes, linked from the tree. Forking itself
  is unchanged (Goose fork, 8a) — this is the view + the summarization.

### K13. Agent Dashboard (Grok, Antigravity, Nova)
- ONE view over all live sessions: Solo + Team, across repos, with repo,
  model, status, tokens. Sessions are first-class records with live
  status, not just chat tabs. Sessions owned by OTHER tools (foreign
  sessions) are listed as such, read-only.
- Per-run observability: step trace + live screenshots + artifacts in one
  place (Nova's fleet view, folded in). A local diagnostics endpoint in
  the desktop app serves the dashboard data (web app: same data from the
  session store). The task inbox (Batch 5 D10) links here — a finished
  background run lands in the inbox AND shows on the dashboard.

### K14. Portable session handoff (Devin CLI, Mistral)
- A session can be packaged (context + branch + WIP diff) into a portable
  handoff file, and picked up on another device — phone ↔ desktop through
  the relay, or as a file the user moves. Copy the PACKAGING, not a hosted
  cloud session: there is NO cloud leg, per his no-cloud order.
- The pickup shows what the package contains (session, branch, uncommitted
  changes) before applying, and never applies a handoff over uncommitted
  local work without a checkpoint first.

### K15. Session export/import (Auggie)
- Export a session as HTML (readable transcript) or JSONL (machine
  re-importable); import a JSONL session back into the session store.
  Import never overwrites an existing session — it creates a new one and
  says so.

### K16. Skill registry with cached frontmatter parsing (Mistral)
- A registry of every skill (project + global skill dirs) with frontmatter
  parsed ONCE and cached — the Skills page knows every skill, its
  description, and its cost without re-reading every file on every open.
- The registry invalidates per file (mtime check), never wholesale.

### K17. "Client owns the tools" (Crow)
- Each agent gets EXACTLY the tools its job needs: tool supply is a
  session-creation parameter, and per-agent `mcpServers` can REPLACE the
  global supply for that agent. The agent has zero built-in tools beyond
  what the session grants.
- The Team Mode agent editor shows each agent's tool supply, and the
  session header shows it too. A sub-agent that needs a tool it wasn't
  granted asks (needs-help), never silently grabs it.
- NOTE: Crow's "no permissions — agent has same access as you" is
  explicitly REJECTED. Safe Mode still applies on top of the tool supply.

### K18. Goal mode (Grok, Kimi, Dirac, Crow)
- A durable Goal object: objective + checklist + state
  (running / paused / blocked / stopped / achieved), with pause / resume /
  clear commands. One goal owns a coordinator task plus child task hosts;
  follow-up runs continue the SAME goal. The goal (and its deadline, if
  set) is injected into the agent's context; a deadline scheduler nudges
  as the deadline approaches.
- The goal must pass a VERIFY step before the final "done" report — the
  agent reviews its own work (code, tests, pages) and the report is
  withheld until verification passes. Give it a goal and walk away for
  hours/days; it pauses only when it needs input.
- Extends Plan+Build + Team Mode. Goal state is persisted in the Brain so
  it survives restarts.

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
  second graph/index/queue/store/scheduler/session-log/API/router. K1/K2/
  K3/K6/K7/K8 all write to the SAME Brain. K5/K12/K13/K14/K15 use the SAME
  session store. K1's Dream budgets (20 notes / 256 KB / 32 changes) are
  enforced, not aspirational.
- Safe Mode (H2.3) still gates everything dangerous: K5 never exposes
  another project's sessions; K14 never hands off to an unpaired device;
  K17 never grants a tool outside Safe Mode; K8 proposals never apply
  themselves.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner, Batch 10's compaction (K2 captures BEFORE it,
  K1 consolidates AFTER it — do not re-implement it).

## Tests (required, same pattern as every batch)

- New suite `test-batch-11.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each K1–K18 with at least 2 assertions on REAL behaviour:
  a Dream run consolidates inbox notes into topic notes within its budgets
  and archives a 3×-deferred note as unplaceable, and MMR retrieval returns
  diverse notes; a capture worker fires before compaction and at shutdown,
  dedupes by hash, and a failing gate degrades to pre-gate behaviour; a
  saved note carries scope/category/importance and recall merges 3
  re-phrasings by composite score; an ingested CSV becomes chunked Brain
  notes with its source recorded; query_memory finds a past session by
  text and discloses progressively; an evaluator returns a JSON verdict
  with evidence-cited checks and rejects a claim-only proof; a decision is
  recorded with confidence and survives compaction; a proposed knowledge
  item waits for approval and a rejected one never re-appears; a Codemap
  node jumps to its exact line and the map is @-mentionable; a Learn
  proposal carries its measured evidence and changes nothing without
  approval; a second live heartbeat warns before a write and a stale one
  clears; the session tree shows a fork and an abandoned branch is
  summarized; the dashboard lists live sessions across repos with status
  and tokens; a handoff package round-trips (context + branch + diff) and
  refuses to apply over uncommitted work without a checkpoint; a session
  exports as HTML and re-imports as JSONL without overwriting; the skill
  registry lists skills without re-reading files and invalidates per file;
  an agent's tool supply is exactly what its session granted and an
  ungranted tool asks instead of grabbing; a goal pauses/resumes, its
  deadline nudges, and its final report is withheld until verification
  passes.
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
