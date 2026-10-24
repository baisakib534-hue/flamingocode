# FlamingoCode Brain code-graph REPAIR — wire the queries, verify Brain v2 (jcode prompt)

Context: the Brain code-graph landed in commit b05e316 (indexer,
graph.json under .devforge/graph/, EXTRACTED/INFERRED edge tags,
paneGraph panel, digest cap 1500 untouched). BUT two real gaps were
found by verification, and THIS round fixes exactly those — build
nothing else new.

## Gap 1 — the query APIs exist but are never called
- queryGraph, pathGraph, explainGraph and getGraphSummary are defined
  but have NO call sites in index.html. The agent therefore does not
  actually use the graph yet.
- FIX: wire them into the agent's flow — before the agent reads files
  to answer "how does X connect / where is Y used" questions, it
  consults queryGraph/pathGraph/explainGraph; getGraphSummary feeds
  the Brain digest (inside the existing ~1500-token cap — NEVER
  expand the cap). Verify the existing markGraphDirty rebuild triggers
  are actually connected to file changes.
- After the fix, grep must show call sites for EACH of queryGraph,
  pathGraph, explainGraph and getGraphSummary (count > 1 line each).

## Gap 2 — Brain v2 integration is unverified (jcode was wrong)
- During the build jcode claimed there was "no Brain code" and the
  "Brain v2 linked-notes system did not yet exist". That is WRONG:
  Brain v2 exists (commit 9ce129d) — atomic notes under
  .devforge/notes/, [[wikilink]] connections, .devforge/index.md map,
  readBrainNote(name) on-demand, ~1500-token digest.
- FIX: verify the Brain v2 system is intact (readBrainNote,
  devforge/notes, devforge/index markers all present and working). If
  the graph round duplicated any Brain code (a parallel notes/index
  system), DELETE the duplicate and keep the original 9ce129d system
  as the single one. Report exactly what was found and what was
  removed (if anything).

## Gap 3 — graph panel reachability
- Verify the Graph panel (paneGraph) is reachable from navigation on
  BOTH desktop and mobile, and the Build Graph button actually calls
  buildCodeGraph. Fix any dead button or missing nav entry.

Shared EXECUTION RULE — MANDATORY THIS TIME: slices of ≤150 lines;
commit EVERY 2–3 slices (the last round shipped all 1,390 lines in a
single commit — do NOT repeat that); commit and push immediately if a
timeout approaches. Do NOT break existing wiring (checkpoints, diff
review, backup, voice, team room, autonomy, Brain v2 notes).

Markers after repair: call-site counts for queryGraph, pathGraph,
explainGraph, getGraphSummary (each > 1); readBrainNote,
devforge/notes, devforge/index still present; node --check SYNTAX-PASS.
Commit: "Fix: wire code-graph queries into agent flow and Brain v2"
