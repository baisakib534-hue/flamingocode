# Devin Desktop — the full desktop-equivalent experience, in the web app first

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Devin Desktop's capabilities as IDEAS, implemented
originally — never Devin's name, logo, exact UI copy, proprietary code, or
proprietary models. Everything ships as FlamingoCode, with his providers +
DuckDuckGo free. Devin Desktop is a closed product that cannot be embedded;
FlamingoCode IS the equivalent, built in the open.

Full spec: `~/workspace/devforge/devin-desktop-spec.md` (§1–§11). Method
note (his orders 2026-10-26 ~19:44 + 19:48): hands-on exploration of his
Devin Cloud account comes FIRST, then REA reverse-engineering — that work
happens at the Devin Desktop stage and refines this build; this batch builds
the spec as written, and REA findings amend it afterwards. Do NOT wait for
REA — build now.

Already built that you must EXTEND, never rebuild:
- Team Mode v2 (board + team chat + Senior review) — §1 evolves the board
  into the Command Center, it does not replace it.
- Batch 2 inline autocomplete — §4 extends it into Tab completions, it
  does not replace it.
- Brain v2 + code graph + Batch 7.1 Repo Map — §5 builds Fast Context +
  Codemaps ON them, never a second index.
- Batch 5 D7 multi-repo tasks + D8 long-running tasks + D10 task inbox —
  §7 cloud handoff is built from these, not a second handoff.
- Stage 4 ecosystem (rules, skills, MCP, plugins) + H5.5 trust — §8 ships
  them TOGETHER in one view, it does not duplicate any of them.
- Senior review + Project Doctor + Auto-fix + Auto-docs — §9 VERIFIES they
  ship as one review+QA workflow, it does not rebuild them.
- Batch 5 D2 cross-repo search, Batch 6 E15 session API, Batch 6 E4
  Outposts — §6 external agents and §11 remote hosts build on these.

## Scope — build §1–§11, one at a time, slice by slice

### §1. Agent Command Center (the DEFAULT screen — not the editor)
- The app's default screen becomes the Command Center: a Kanban board of
  ALL agent sessions (local + cloud): running, idle, needs-review, done —
  one glance, one surface. This EVOLVES the Team Mode board: single-mode
  sessions appear here too, not only team sessions.
- Spaces: parallel work surfaces grouping sessions + PRs + files + git
  worktrees, so several agents share the right context. Create/rename/
  delete a Space; move a session into a Space by drag or picker.
- From the board: start a session, track it live, review its diff, merge
  its branch — without opening the editor. The editor is one click away,
  never the default.

### §2. Full IDE (the editor underneath)
- Verify + complete the editor shell: syntax highlighting (the existing
  highlighter covers the project's languages), full file tree (with
  search + filter), in-editor search across files, debugging panel
  (breakpoints list + run/pause/step buttons wired to the preview
  runtime where possible, honestly labelled where the web app cannot
  debug), extensions list (the installed plugin packs), keybindings
  view (every shortcut, editable), language servers status (from Batch 9
  T3 detection — which servers are present, which are missing).
- In-IDE previews + one-click app deploys (C1) from the editor toolbar.
- The full desktop IDE ships at Stage 6 (Electron); this batch makes the
  WEB editor complete and honest about what the desktop adds later.

### §3. Local agent — whole-repo awareness
- A "Local agent" mode (the single agent + Team Mode, with whole-repo
  awareness as a GUARANTEED property): before acting, the agent's context
  always includes the Repo Map (Batch 7.1) + the Brain digest + the code
  graph summary — the agent NEVER works from a single file alone.
- The agent tracks edits ACROSS sessions: a session's summary (files
  changed, decisions made) is written to the Brain so the next session
  starts aware. Multi-file tasks execute without the user pointing at
  each file — the agent finds the files itself via the graph.
- A "Whole-repo awareness" indicator in the session header shows what is
  loaded (map + digest + graph), so the user can see it is on.

### §4. Tab completions (Supercomplete equivalent)
- Extends the Batch 2 inline autocomplete: the completion predicts the
  NEXT EDIT, not just the next token — suggestions appear in small
  windows around the cursor, including deletions + additions (shown as a
  diff: red for removed, green for added).
- Modes: Supercomplete (powerful — whole-edit predictions) / Autocomplete
  (traditional — next-token) / Off. A mode picker in the editor status bar.
- Tab to Jump: the completion predicts the NEXT EDIT LOCATION; Tab jumps
  there. Tab to Import: Tab adds/updates the import for the symbol just
  completed. Clipboard context (OPT-IN toggle, default OFF): copied text
  becomes completion context. Aggression setting: Low / Medium / High
  (how often completions appear unasked).
- Context-aware: recent terminal activity, recent edits, clipboard (when
  opted in). Completions are LOCAL and rule-based (graph neighbours +
  recent edits) — never a model call per keystroke.

### §5. Fast Context + Codemaps
- Fast Context: the exact files/lines an agent needs, retrieved in
  milliseconds — a "Fast Context" retrieval that answers "which 5 files
  matter for this task?" from the Repo Map + code graph WITHOUT re-reading
  the repo, with a measured timing shown ("৫টি ফাইল, ১২ms-এ পাওয়া গেছে").
  A Settings toggle (default ON).
- Codemaps: an AI-annotated VISUAL map of the codebase for large repos /
  legacy code — a Codemap panel rendering the Repo Map as a clickable
  node graph (modules as nodes, imports as edges, PageRank-sized);
  click a node, see the code. The map is generated from the existing
  graph — never a second index.

### §6. External agents (ACP equivalent)
- "Bring your own agent" panel: plug in OTHER agent CLIs/endpoints
  (Codex-style, Claude-style, OpenCode-style, any OpenAI-compatible
  agent) and run them as first-class agents inside FlamingoCode — same
  task board, same review gate, same session store.
- An external agent is configured with: name, endpoint/command, model,
  and its capabilities (which tools it supports). The agent runs through
  the Batch 6 E15 session API so its events appear on the timeline.
- The panel is honest about scope: in the web app, external agents run
  over HTTP endpoints; local CLI agents run at Stage 6 (desktop).

### §7. Cloud handoff
- Hand a long task to a cloud agent: the task's full state (plan, steps,
  checkpoints, Brain digest) is packaged as a handoff envelope; work
  continues even when the laptop is closed; the user reviews when back
  (task inbox, Batch 5 D10).
- Built from Batch 5 D8 (long-running tasks) + D10 (inbox) + the relay:
  the envelope is stored, the session resumes from the exact step on any
  device, and the review happens in the inbox. The handoff shows its
  status live ("cloud-এ চলছে · step 14/60").

### §8. Rules / Skills / Workflows / MCP — one view
- ONE "Agent setup" view holding Rules files, AGENTS.md, Skills,
  Workflows (Batch 7.5 Recipes), and MCP servers together — the pieces
  already exist separately; this unifies them so the user shapes agent
  behaviour in one place (same idea as the Audit Gaps H18 Customize hub
  — link to it, do not duplicate it).
- The view shows, per project, what is active: which rules files apply
  (with the Batch 8b G12 priority chain), which skills are installed,
  which workflows exist, which MCPs are connected (with trust state).

### §9. Review + QA workflow — verify it ships as ONE flow
- Do NOT rebuild: Senior review + Project Doctor + Auto-fix + Auto-docs
  + ship-ready already exist. This item VERIFIES they work as one
  workflow end-to-end: a finished task flows review → visual QA (B3
  preview) → scheduled QA (H5.1) → release notes (auto-generated from
  the session) → bug triage (Batch 6 E12) → automated fixing → code
  migration/refactoring → docs auto-gen — with ONE status line showing
  where the task is in that flow.
- Any gap found (a step that does not connect to the next) is FIXED in
  this batch, and listed in the summary if it cannot be fixed here.

### §10. Models + free tier shape
- Free tier by design: Tab completions (§4) are FREE and UNLIMITED
  (local, rule-based — no model call). Inline edits likewise.
- The Models panel states the free-first shape plainly: DuckDuckGo free
  as default + the free-provider fallback chain (F5) + the user's own
  providers. Light agent quota is enforced ONLY by the per-model rate
  limits the user sets — no hidden paywall, no artificial cap.

### §11. Settings — from his screenshot (capabilities only)
All six ship as Settings toggles (default ON, matching the screenshot):
- Remote agent hosts: connect to agents on remote machines over SSH —
  a remote-agent panel: add saved SSH hosts (host, user, key name —
  NEVER the key itself), connect to an agent running on a remote machine.
  (Real SSH execution lands at Stage 6; the panel + saved hosts + the
  connection state land now, honestly labelled.)
- Connect on startup: connect to saved hosts automatically on startup.
- Auto-continue: the agent continues past the invocation limit without
  prompting; otherwise it stops and asks the user to continue.
- Auto-fix lints: the agent detects lint errors from its own edits and
  may fix them automatically (note shown: may increase tool usage).
- Enable Fast Context: allow the Fast Context agent to retrieve relevant
  code (§5) — the §5 toggle and this one are the SAME toggle, shown in
  both places, never two settings.
- Gitignore access: let the agent view and edit files in .gitignore.

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
  second graph/index/queue/store/scheduler/session-log. §1 evolves the
  Team Mode board; §8 unifies existing pages (links, not copies); §11's
  Fast Context toggle is the §5 toggle.
- Safe Mode (H2.3) still gates everything dangerous: §6 external agents
  run through the same approval ladder; §11 remote hosts never store a
  private key; §4 clipboard context is opt-in, default OFF.
- REA comes AFTER this batch (his order) and refines it — build the spec
  as written now; do not block on REA.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules.

## Tests (required, same pattern as every batch)

- New suite `test-devin-desktop.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each §1–§11 with at least 2 assertions on REAL behaviour:
  the Command Center lists all sessions (single + team) by status and a
  Space groups sessions + PRs + files; the editor shows file tree +
  search + keybindings + language-server status; a Local-agent session
  loads map + digest + graph and its summary lands in the Brain; a Tab
  completion predicts a whole edit (add + delete shown as a diff), Tab
  to Jump moves to the next edit location, Tab to Import adds the
  import, and clipboard context stays off unless opted in; Fast Context
  returns the top files with a measured timing and the Codemap renders
  clickable nodes; an external agent runs through the session API with
  its events on the timeline; a cloud handoff envelope resumes from the
  exact step on another device and lands in the inbox for review; the
  Agent setup view shows rules (with priority), skills, workflows, and
  MCPs with trust state in one place; the review→QA flow status line
  advances through every step for a finished task; Tab completions cost
  nothing and are unlimited; all six §11 toggles exist, default ON, and
  the Fast Context toggle is the same setting in both places.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per section: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
