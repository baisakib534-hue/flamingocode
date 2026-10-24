# FlamingoCode Brain code-graph upgrade — Graphify's ideas, our own code (OpenCode/jcode prompt)

Build this as ONE feature, in slices, then STOP and report. This is
Brain v2 + a code graph: the linked-notes Brain stays exactly as it is
(atomic notes, [[wikilinks]], index map, ~1500-token digest cap —
NEVER expand the cap); this round ADDS a graph of the actual codebase
next to it.

Background (why, in one paragraph): Graphify turns a codebase into a
queryable knowledge graph — nodes are files/functions/concepts, edges
are calls/imports/uses, every edge is tagged EXTRACTED (explicit in
the source) or INFERRED (resolved by the indexer), and the agent
queries the graph instead of grepping whole files. We are NOT
installing Graphify (it is a Python CLI and cannot run inside this
browser web app) and NOT copying its code. Re-implement the MECHANISM
in this app's own JavaScript: a lightweight in-app indexer over the
project VFS.

## What to build
1. **Code-graph indexer** (`buildCodeGraph`): scans the project's VFS
   files (JS/TS/HTML/CSS first) and builds a graph: nodes = files,
   functions, classes, concepts (from comments/docs); edges = calls,
   imports, uses, defines, references. Every edge carries a confidence
   tag: EXTRACTED when explicit in the source, INFERRED when resolved
   by the indexer. Pragmatic parsing (regex + lightweight scanning) is
   fine — a full tree-sitter AST in the browser is out of scope. The
   indexer rebuilds incrementally (debounced) when files change.
2. **Graph persistence**: the graph is stored under `.devforge/graph/`
   as graph.json (with a schema version field), rebuilt on demand and
   on file change. It must survive reload.
3. **Query API the agent uses instead of grepping**:
   - `queryGraph(question)` → a scoped subgraph (relevant nodes +
     their edges) for a plain-language question.
   - `pathGraph(a, b)` → the shortest path between two things.
   - `explainGraph(concept)` → one node plus its connections.
   - The agent MUST consult these before reading whole files when the
     question is about how code connects. The Brain digest carries only
     a graph SUMMARY (top concepts + communities), never the full graph.
4. **Clickable graph view**: a Graph panel in the app showing nodes
   and edges (simple, lightweight rendering — keep Qoder-level load);
   click a node to jump to its file/symbol; filter and search.
5. **Dedupe**: this graph IS the codebase-chat index. Batch 2
   codebase chat and Batch 3 Project Doctor MUST use this graph later
   — never build a second index or a second graph.

Shared EXECUTION RULE: slices of ≤150 lines; commit every 2–3 slices
with small progress messages; split any huge generation. Do NOT break
existing wiring (checkpoints, diff review, backup, voice, team room,
autonomy, Brain v2 notes).

Markers: buildCodeGraph, queryGraph, pathGraph, explainGraph, graph
view panel id, graph.json persistence.
Commit: "Feature: Brain code graph (Graphify-style)"
