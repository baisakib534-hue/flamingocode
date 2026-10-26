# Batch 7.7 — Serena + Sverklo MCPs (research sweep T1 + T2, TOP TOOL PICKS)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

Two MCP servers from the research sweep, both MIT and free, both top tool
picks — and Sverklo is the single biggest token saver in the whole sweep
(claims 13.8× fewer input tokens than naive grep: ~300–500 ranked tokens
per query vs 5,000–15,000 lines of grep output). What exists today (do NOT
rebuild): the H5.5 MCP manager (per-server trust, tool picker, call/spend
limits), the Brain code graph (b05e316/5f22ac7 — nodes/edges, query/path/
explain), the 7.1 Repo Map (PageRank-ranked digest), the 7.2b Tool
Recommender (already lists `mcp_serena` and `mcp_sverklo` as recommendable
— those entries currently point at nothing installable; THIS batch makes
them real). The GAP: no semantic code navigation and no blast-radius
analysis anywhere in the app.

Honest split (write this into the code comments + the UI copy): the two
servers are REAL MCP servers that run as processes — the web app cannot
spawn them, so their full LSP/embedding power lands in the desktop app
(Stage 6, where a server process can run). What this batch builds NOW is
(a) both servers as installable entries in the MCP manager with their real
tool lists + config templates, and (b) their CORE mechanisms implemented
in-app on the existing code graph, so the value exists today in the web
app too.

## 1. MCP catalog entries — Serena + Sverklo, installable

- Add both servers to the MCP manager's known-server catalog (the same
  list the "Add server" picker shows), with: id, name, repo, license
  (MIT), description, the real tool list, and a config template
  (`command`/`args`/`env` — the standard way each server is launched).
- Serena (`oraios/serena`, ~15 tools): find-symbol, find-references,
  insert-after-symbol, rename, plus the rest of its documented tool set
  (list each tool with a one-line description).
- Sverklo (`sverklo/sverklo`, 37 tools): hybrid search, blast-radius
  analysis, reference finding, file-dependency graphs, risk-scored PR
  review, git-pinned memory (list each tool with a one-line description).
- Install path = the existing H5.5 flow: a newly installed server starts
  UNTRUSTED, with the tool picker + call/spend limits applying from the
  first call. The 7.2b recommender entries for these two servers now
  resolve to these catalog entries (Install from a recommendation card or
  from the MCP page lands here).
- Each catalog entry states plainly whether it needs the desktop app to
  run ("Runs on desktop — in the web app, the built-in tools below do the
  same job") vs what works in-app now.

## 2. In-app semantic navigation (Serena's mechanism, on the code graph)

- `findSymbol(name)` — find a symbol (function/class/variable) by name
  across the project using the code-graph nodes (exact + prefix + fuzzy
  match), returning file + location + kind + signature where the graph
  has it.
- `findReferences(symbolId)` — every reference to that symbol via the
  graph's reference edges (callers, imports, usages), with file + line.
- `renameSymbol(symbolId, newName)` — rename by SYMBOL, not line numbers:
  applies the rename to the definition + every reference found in §2,
  as ONE diff-based patch (7.2 applier) per file, shown in the A2 diff
  review before apply. If a reference cannot be resolved safely, it is
  listed as "unresolved — review manually", never silently skipped.
- `insertAfterSymbol(symbolId, code)` — insert code right after a
  symbol's definition (diff-based, reviewed like any edit).
- These four are exposed as agent tools (the agent calls them instead of
  grepping) AND as UI actions in the Graph panel (click a node → Find
  references / Rename / Insert after).
- Wire into the agent system prompt: "Prefer findSymbol/findReferences
  over grep for navigation; prefer renameSymbol over manual renames."

## 3. In-app hybrid search + blast radius (Sverklo's mechanism)

- `hybridSearch(query)` — ranked search over the codebase combining (a)
  keyword match over names + file paths, (b) symbol-rank (Repo Map
  PageRank scores from 7.1), (c) reference-count boost. Returns the top
  10 results with a token-budgeted rendering (default 500 tokens —
  Sverklo's ranked ~300–500 claim is the target; show the token count of
  the result so the saving is visible). This REPLACES naive grep output
  for "find where X is used" questions in codebase chat.
- `blastRadius(symbolId | filePath)` — "what breaks if I change this":
  walks the graph's reference edges outward (direct + transitive
  dependents, capped at 2 hops by default with a depth control),
  returning the affected files/symbols grouped by hop, plus a count.
  Shown before any rename / delete / signature change (in the diff
  review, as a "Blast radius: N files, M symbols" line with an expandable
  list).
- `fileDependencyGraph(filePath)` — the dependency subgraph for one file
  (imports + imported-by), rendered in the Graph panel.
- `riskScoredReview(diff)` — scores a diff for review risk: each changed
  file gets a risk score from (blast radius × file criticality from the
  Repo Map rank × change size); the review lists the riskiest files
  first with the reason for each score. Wired into the Senior diff review
  (Team Mode) and the A2 diff review.
- `gitPinnedMemory` — a note pinned to a git commit/branch in Brain
  ("this decision holds as long as commit X is the base") — when the
  base changes, the pinned note is flagged as "base moved — re-check".

## 4. Settings + i18n

- MCP page: the two new servers in the catalog with Install buttons +
  their tool lists expandable.
- Settings → Behavior (or the Graph panel): hybrid-search token budget
  input (default 500), blast-radius depth (default 2), a toggle "Prefer
  symbol search over grep" (default ON).
- Bengali translations for every new string.

## 5. Dedupe — do NOT rebuild

The Brain code graph, the 7.1 Repo Map, the 7.2 diff applier, the A2 diff
review, the H5.5 MCP manager, the 7.2b recommender, codebase chat — build
ON them. No second graph, no second index, no second MCP manager, no
second review. Serena/Sverklo are new CATALOG entries + new graph-powered
tools, not new systems.

## Tests — new file `test-batch-7.7-serena-sverklo.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) both servers exist in the MCP catalog with their tool lists and
    config templates, and install starts UNTRUSTED;
(b) `findSymbol` finds a known symbol from the test graph fixture
    (exact + prefix match) and returns file + kind;
(c) `findReferences` returns the callers of a symbol via graph edges;
(d) `renameSymbol` renames the definition + all resolved references as
    diff patches, and lists an unresolvable reference as unresolved
    (never silently skipped);
(e) `insertAfterSymbol` inserts after the definition;
(f) `hybridSearch` returns ranked results within the token budget and
    the result shows its token count;
(g) `blastRadius` returns direct + transitive dependents grouped by hop,
    capped at the configured depth;
(h) `riskScoredReview` ranks the riskiest changed file first with a
    reason;
(i) `fileDependencyGraph` returns imports + imported-by for a file;
(j) a git-pinned memory note is flagged when its base commit moves;
(k) the recommender's `mcp_serena` / `mcp_sverklo` entries now resolve
    to these catalog entries (Install from a recommendation works);
(l) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
