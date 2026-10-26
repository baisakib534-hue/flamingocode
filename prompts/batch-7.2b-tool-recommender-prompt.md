# Batch 7.2b — Tool Recommender (NEW feature, his order 2026-10-26 ~18:19 +06)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## What to build

His words: when he gives the software a task, it should RECOMMEND the
MCPs / skills / plugins that would help with that task.

What exists today (do NOT rebuild): the Autonomy Engine — the agent
automatically USES whatever skill/MCP/plugin is already installed for a
task, with no @mention. The Plugin Catalog tab (H5.4) and the MCP manager
(H5.5, per-server trust + tool picker) exist for manual browsing/install.
The GAP this feature closes: when the tool a task needs is NOT installed,
nothing tells him. Build the recommendation layer on top of those
existing registries — never a second catalog.

### 1. Tool registry index (`TOOL_RECOMMENDATIONS`)
A single in-code index over the tools the app already knows about, plus
the well-known ones from our own research sweep (NOT a second catalog —
each entry points at the existing skill list, MCP server list, or plugin
catalog entry):
- Every built-in skill (the 15: 9 jcode pack + 6 new) and every built-in
  plugin pack (the 6 from the Plugin Catalog tab).
- Every MCP server the app knows: the 6 standard ones (context7,
  playwright, sequential-thinking, github, memory, fetch) + the
  research-sweep MCP servers worth recommending (Serena, Sverklo,
  context7, fetch, github, memory — reuse the sweep list, do not invent
  new servers).
- Each entry: `{ id, kind: 'skill'|'mcp'|'plugin', name, whatItDoes (one
  line), triggers: [keywords/phrases in Bangla + English], install: {how}
  }`. `install.how` reuses the existing install path for that kind
  (enable skill / add MCP server / install plugin from catalog) — do not
  invent a new installer.

### 2. Matcher (`recommendToolsForTask(promptText)`)
Runs when a task/prompt arrives (hook into the same entry point that
starts a task — `sendAgentPrompt` / the agent-task entry — and also on
demand from the Plugin Catalog tab via a "Suggest for current task"
button):
- Lightweight LOCAL keyword/phrase matching over the prompt text against
  each entry's `triggers` — NO model call (token economy; this runs
  before the agent spends anything).
- Score candidates; return the top 3 above a threshold (default 2
  trigger hits). Tools ALREADY installed/enabled are NEVER recommended.
- Muted tools (he clicked "Don't suggest again") are NEVER recommended.
- Returns `[]` silently when nothing matches — no noise, no empty card.

### 3. Recommendation card UI
When the matcher finds something, show ONE compact card in the chat area
(above the agent's first reply for that task — not a popup, not a modal):
- Tool name + kind chip (Skill / MCP / Plugin) + one-line "why this
  helps for this task".
- Buttons: **Install** (one click → the existing install path for that
  kind; after install the card updates to "Installed ✓" and the tool is
  available to the agent from the next task) + **Dismiss** (hides this
  card) + **Don't suggest again** (mutes that tool).
- The card ALSO lists, in small text, the trust consequence for MCPs:
  a newly installed MCP starts UNTRUSTED (H5.5 rule) — say so on the
  card, do not hide it.
- A "Recommended for this task" section in the Plugin Catalog tab shows
  the same recommendations for the current task, so he can find them
  even after dismissing the chat card.

### 4. Hard rules (his orders — do not bend these)
- **NEVER auto-install.** Installation happens ONLY when he clicks
  Install. This holds in every Safe Mode (Smart / Manual / Off) — a
  recommendation is a suggestion, never an action.
- **NEVER recommend an installed tool.** Check installed/enabled state
  from the existing registries at match time.
- **Learning (local, no model call):** when he installs a recommended
  tool, record `task → tool` in the Brain (project memory) so the same
  task pattern scores that tool higher next time; when he dismisses or
  mutes, lower that tool's score for similar tasks. Keep the learning
  tiny: a per-tool `scoreBoost` number and a mute list, persisted in
  `appState`. No new storage system.

### 5. Settings + Bengali labels
- Behavior tab: a "Tool recommendations" toggle (default ON) + a
  "Muted recommendations" list with per-tool unmute, persisted in
  `appState` like the other Behavior settings.
- All new UI strings through the existing `t()` system with Bengali
  translations.

## Tests — new file `test-batch-7.2b-tool-recommender.js`
Follow the established NO-JSDOM extraction-and-eval pattern (read
`index.html`, extract the `<script>`, eval it, call the real functions).
Assert ONLY identifiers/behaviours that actually exist in `index.html`
after your build. Cover at least:
- (a) a task mentioning a GitHub repo recommends the github MCP (when
  not installed) and does NOT recommend it when it is installed;
- (b) a task with no matching triggers returns no recommendations and
  renders no card;
- (c) at most 3 recommendations are returned, best score first;
- (d) Dismiss hides the card; "Don't suggest again" mutes the tool and
  it never appears again until unmuted from Settings;
- (e) clicking Install calls the existing install path for that kind and
  marks the tool installed — and NO install call happens without the
  click (call the matcher + render only, assert the install function was
  never invoked);
- (f) a newly installed MCP recommendation card states the untrusted
  consequence;
- (g) installing a recommended tool records the task → tool link and
  raises that tool's score for the same task text next time;
- (h) the Behavior toggle OFF suppresses all recommendation cards.

## Verification before you report done
1. `node` syntax check of the extracted script — must pass.
2. Run the NEW suite — all assertions pass.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new
   suite passing alone does NOT prove the script parses. Count the
   assertions yourself and report the real total; do not guess or round.
4. `git status` clean, commit pushed, `git ls-remote origin main` == HEAD.

## Scope discipline
- Do NOT touch: Repo Map (7.1), Diff-based editing (7.2), Team Mode,
  checkpoints, providers, Safe Mode, or any other feature. Do NOT build
  a second skill/MCP/plugin catalog — the registry is an INDEX over the
  existing ones.
- Do NOT add a model call for matching. Do NOT auto-install in any mode.
- If a sweep-listed MCP has no install path in the app yet, list it in
  the registry with `install.how: 'manual'` and a one-line note — do not
  invent an installer for it.
