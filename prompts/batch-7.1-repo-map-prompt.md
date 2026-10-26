# Batch 7.1 — Repo Map (Aider repomap, code-analyzed idea)

Repo: baisakib534-hue/flamingocode. Work in ~/workspace/flamingocode.
Read PRD.md first. Build ONLY this feature, then stop and summarize.

## What to build
Aider's Repo Map as a **ranked, token-budgeted rendering of our EXISTING
Brain code graph** — the missing piece. We already have the graph
(b05e316/5f22ac7: nodes/edges in `.devforge/graph/graph.json`, query/path/
explain, markGraphDirty). We do NOT have the ranked digest. Build the
digest — never a second index, never a second graph.

Mechanism (idea only, from the code-analyzed sweep report — never copy
Aider's code): tags per file → define/reference graph → PageRank over it
→ fill a token budget with the highest-ranked tags → render as a tree.

## Spec
1. **Rank** — `buildRepoMap()` (new): run PageRank over the code graph's
   define/reference edges (implement PageRank inline, ~30 lines, damping
   0.85, ~20 iterations; no library). Personalization boost for (a) files
   already in the current chat/session and (b) files/identifiers the user
   mentioned in the latest prompt — the same boost idea as Aider's
   (100/len(files) weight); document the weights in a comment.
2. **Budget** — default map budget **1024 tokens** (sampled token
   estimation, same estimator the app already uses for the Brain digest).
   Fill the budget with the highest-ranked definitions first; never
   exceed it. Budget is a setting (Settings → Behavior or Brain section),
   persisted, default 1024, min 0 = map off.
3. **Render** — tree text, one file per block:
   `filename:\n  ├─ def foo(…)` (functions/classes with signatures),
   each line truncated to ~100 chars. Put the renderer in its own
   function `renderRepoMapText(ranked, budget)`.
4. **Inject** — the rendered map is appended to the agent context
   (the buildSystemContextWithGuard / buildBrainDigest path), inside the
   existing ~1500-token Brain digest cap accounting (map budget is part
   of, not on top of, the digest discipline — the map replaces the
   least-useful digest lines when both are on; never silently blow the
   cap). A per-session toggle includes/excludes the map.
5. **Refresh** — rebuild on `markGraphDirty` (writes/deletes/diff-accept/
   editor edits); cache the rendered string in memory until the graph is
   dirty again (browser equivalent of Aider's tag cache — no SQLite).
6. **UI** — extend the existing Graph panel (paneGraph): a "Repo Map"
   section showing the rendered map + a budget meter ("Repo Map 612 /
   1024 tokens") + the toggle. Bengali labels for the new UI strings.
7. **Dedupe** — codebase chat (Batch 2 F3) keeps querying the graph via
   queryGraph/pathGraph/explainGraph; the Repo Map only READS the same
   graph. No new indexer, no new storage file besides the setting.

## House rules (repo AGENTS.md)
- One self-contained vanilla page (index.html), no frameworks, no build step.
- Use the skills, especially no-ai-slop, senior-frontend, testing-qa,
  api-design, debugging-discipline, git-workflow.
- Plan → implement → self-review → test → fix → summarize.
- Commit after each slice (every 2–3 slices), specific messages.
- Report honestly. Never claim a test passed that you did not run.

## Tests (NO-JSDOM pattern — never require jsdom or any npm package;
no package.json, no node_modules; assert ONLY identifiers/behaviours
that actually exist in index.html)
- New file `test-batch-7.1-repo-map.js` (extraction-and-eval pattern,
  same as test-h5.4-repair.js): prove (a) a definition referenced by
  others ranks above an unreferenced one; (b) the rendered map never
  exceeds the token budget; (c) a mentioned file's definitions get the
  boost; (d) the map text appears in the built agent context;
  (e) no second index exists (queryGraph remains the only graph query
  entry point — assert no new `buildCodeGraph`-style indexer function).
- Run the FULL suite (all test-*.js + test-*.cjs) — every suite must
  pass, including h14-context-files and session-search. A new suite
  passing alone does NOT prove the script parses.

## Finish
- `node --check` the extracted script (syntax PASS).
- Commit the slices, push, verify `git ls-remote origin main` == HEAD.
- Summary: what was built, the test file + counts, full-suite total,
  any gaps or deviations from this prompt.
