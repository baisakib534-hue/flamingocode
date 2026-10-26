# Batch 7.10 — Tool Search (research sweep #32, Claude Code — the lazy-loading MECHANISM)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His order (2026-10-25 ~22:42 +06, from the Claude tip video): "Load tools
when needed" — not "Tools already loaded". B4.7 built lazy loading (tools
load on demand by category/trigger), but it has no SEARCH mechanism — the
agent still decides from a static list. This batch ports Claude Code's
Tool Search (mechanism read from the sweep): instead of putting all 100+
tool schemas in context, the agent SEARCHES tool descriptions by keyword
and loads only the matching schemas. Reported cut: 51K → 8.5K tokens
(~85%). This is the mechanism that makes lazy loading real.

## 1. The searchable index — one index over the tools we already have

- `TOOL_SEARCH_INDEX` — built from the EXISTING registries, never a
  second catalog: built-in tools, the 15 + 12 skills (Stage 4 + 7.3
  Superpowers), the MCP servers' tools (H5.5 + 7.7 Serena/Sverklo), the
  plugin packs (H5.4), the 7.2b recommendation entries.
- Each index entry: `{ id, kind, name, whatItDoes (one line), keywords:
  [Bangla + English] }`. The `whatItDoes` + `keywords` come from the
  existing skill descriptions / tool lists / recommendation entries —
  reuse them, do not rewrite a second set of descriptions.
- The index rebuilds when a tool is installed/uninstalled/enabled/
  disabled (hook into the existing install/enable paths).

## 2. `searchTools(query)` — keyword search, ranked, budget-capped

- Local keyword/phrase matching over name + whatItDoes + keywords (same
  lightweight matcher style as the 7.2b recommender — NO model call).
- Returns ranked matches with a score (name hit > keyword hit >
  description hit), top N (default 8) above a threshold (default 1 hit).
- Returns `[]` silently when nothing matches.
- A per-query token estimate: each returned tool's schema cost is counted
  (rough chars/4 estimate, same estimator the B2 dashboard uses) and the
  result carries `{ tools, estimatedTokens, savedVsAll }` where
  `savedVsAll` = the all-schemas estimate minus the returned estimate —
  the saving is VISIBLE, not claimed.

## 3. Wiring — the agent loads only what the search returns

- In the agent's tool-selection step (Autonomy Engine — the point where
  it decides which tools a step needs), it calls
  `searchTools(stepDescription)` FIRST and loads ONLY the returned
  tools' schemas into context for that step. Tools the step does not
  need are never loaded.
- The loaded-tools list for the current step is visible in the session
  panel ("Tools loaded: read, write, findSymbol (3) — saved ~42K
  tokens") and in the B2 Usage & Quota dashboard per task.
- Fallback: if the search returns nothing for a step, the agent falls
  back to the step's category defaults (B4.7 behaviour) and logs that the
  search missed — never a silent empty toolset, never a stall.
- Manual use: the command palette (C3, Ctrl/⌘+K) gains a "Search tools"
  mode — typing a keyword lists matching tools with descriptions; picking
  one loads it for the next step (and shows its description).

## 4. Settings + i18n

- Settings → Behavior: "Tool search" toggle (default ON), top-N input
  (default 8), threshold input (default 1).
- The session panel's loaded-tools line + the B2 dashboard's saved-tokens
  line, with Bengali translations for every new string.

## 5. Dedupe — do NOT rebuild

B4.7 lazy loading, the Autonomy Engine, the skill/MCP/plugin registries,
the 7.2b recommender (same matcher style, different job — recommender
suggests MISSING tools to the human, Tool Search loads PRESENT tools for
the agent; say this distinction in a code comment), the C3 command
palette, the B2 dashboard — build ON them. No second registry, no second
matcher implementation (share the keyword-matching helper with 7.2b if
one exists, or extract it so both use it), no second usage meter.

## Tests — new file `test-batch-7.10-tool-search.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) the index contains entries from every registry (built-in tools,
    skills, MCP tools, plugin packs) and rebuilds on install/uninstall;
(b) `searchTools('rename')` returns the rename tool ranked above a
    description-only match; a name hit outranks a keyword hit;
(c) `searchTools` returns `[]` for a query matching nothing;
(d) the result carries `estimatedTokens` + `savedVsAll`, and the saving
    is positive when only a subset loads (subset estimate < all-schemas
    estimate);
(e) the agent step loads ONLY the searched tools (assert the loaded set
    for a fixture step equals the search result, not the full catalog);
(f) the search-miss fallback loads the B4.7 category defaults and logs
    the miss;
(g) the command palette's tool-search mode lists matching tools with
    descriptions, and picking one loads it for the next step;
(h) the session panel shows the loaded-tools line with the saved-tokens
    figure;
(i) the toggle + top-N + threshold exist in `appState` with the correct
    defaults (ON / 8 / 1);
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
