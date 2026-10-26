# Batch 7.2 — Diff-based editing (Roo Code mechanism, ported as an idea)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## What to build

Today the agent writes whole files through `parseAndApplyBlocks`. On a
17,000-line file a 5-line fix costs 17,000 lines of output. Port Roo Code's
diff-based editing mechanism (idea only — no Roo code, no branding): the
agent emits targeted PATCHES, never full-file rewrites. This is the INPUT
side of diffs. The A2 diff *review* (showing diffs to the user) already
exists — do not rebuild it; this feature is the patch-application engine
underneath it.

### 1. SearchReplace applier — primary strategy (`applySearchReplacePatch`)
Parse `<<<<<<< SEARCH / ======= / >>>>>>> REPLACE` blocks from agent
output. Apply each block against the target file content:
- Exact match first (line-constrained search).
- **Middle-out matching**: when the search text occurs more than once,
  start matching from the middle of the target area and work outward, so
  the most plausible occurrence wins (use the surrounding context lines
  the agent gave, and the file region the agent is currently working on).
- **Fuzzy fallback**: if no exact match, score candidate regions with
  Levenshtein similarity and apply the best one above a configurable
  threshold (default 0.85 similarity); below threshold, FAIL CLEANLY —
  report which block failed and why, change nothing in the file.
- **Indentation preservation**: when the search block's indentation
  differs from the matched region's, re-indent the replacement to match
  the file's actual indentation.
- Multiple blocks in one agent message apply in order; if any block
  fails, roll back that whole message's edits (atomic per message) and
  report the failure — never leave a half-patched file.

### 2. Unified diff applier (`applyUnifiedDiff`)
Classic unified-diff application (`---`/`+++` hunks, `@@` headers) for
agent output in unified-diff form. Support multiple hunks, sub-hunk
splitting (a hunk that partially matches still applies its matching
parts), and the same fuzzy fallback as SearchReplace. On total failure,
fall back to the existing full-block apply path (`parseAndApplyBlocks`)
and record that the fallback was used — never silently drop an edit.

### 3. Wire it into the agent edit path
- `parseAndApplyBlocks` (or its caller) must TRY the patch strategies
  first when agent output contains SEARCH/REPLACE blocks or a unified
  diff, and only then fall back to whole-file writes. Whole-file writes
  stay available for genuinely new files and full rewrites.
- Teach the agent the format: add the SEARCH/REPLACE block format and
  the "patch first, never rewrite a whole file for a small change" rule
  to the agent system-prompt builder (the same place the existing agent
  instructions live). Keep it short — 6 lines max in the prompt.
- Record per-edit metadata for the A2 diff review: whether the edit
  landed via patch or via full rewrite, so the review UI can show it
  (one small label in the existing diff-review rendering — do not
  rebuild the review UI).

### 4. Settings
Behavior tab: a "Fuzzy patch matching" toggle (default ON) + a
similarity-threshold input (default 0.85, range 0.5–1.0), persisted in
`appState` like the other Behavior settings. When the toggle is OFF,
only exact matches apply.

### 5. Bengali labels
New UI strings go through the existing `t()` system with Bengali
translations, like the Batch 7.1 strings did.

## Tests — new file `test-batch-7.2-diff-editing.js`
Follow the established NO-JSDOM extraction-and-eval pattern (read
`index.html`, extract the `<script>`, eval it, call the real functions).
Assert ONLY identifiers/behaviours that actually exist in `index.html`
after your build. Cover at least:
- (a) exact SEARCH/REPLACE block applies and changes only the target lines;
- (b) fuzzy match applies when the search text has a 1-character typo and
  the file keeps its other content;
- (c) indentation drift in the search block is corrected to the file's
  indentation on apply;
- (d) a block with no match anywhere fails cleanly and leaves the file
  byte-identical;
- (e) multiple blocks in one message apply in order, and one failing
  block rolls back the whole message;
- (f) a unified diff with two hunks applies both;
- (g) middle-out: the same search text twice in a file applies at the
  occurrence nearest the agent's working region, not blindly the first;
- (h) the agent system prompt contains the SEARCH/REPLACE format and the
  patch-first rule;
- (i) the fuzzy toggle OFF forces exact-only matching.

## Verification before you report done
1. `node` syntax check of the extracted script (the same check as the
   other suites use) — must pass.
2. Run the NEW suite — all assertions pass.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new
   suite passing alone does NOT prove the script parses. Count the
   assertions yourself and report the real total; do not guess or round.
4. `git status` clean, commit pushed, `git ls-remote origin main` == HEAD.

## Scope discipline
- Do NOT touch: Repo Map (7.1), Team Mode, checkpoints, providers,
  Safe Mode, or any other feature. Do NOT build a second diff-review UI.
- Dedupe: A2 diff review already shows diffs — only add the one small
  "via patch / via rewrite" label to its existing rendering.
- If the Roo "git fallback" cannot apply in a browser app, the
  `parseAndApplyBlocks` fallback above IS the port of it — say so in
  your summary, do not invent a git shell.
