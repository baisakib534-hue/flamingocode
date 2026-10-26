# Batch — Cursor IDE features (dispatch right after the Devin Desktop prompt)

## Context
Read `PRD.md` and `~/workspace/devforge/cursor-ide-spec.md` first. The Devin
Desktop prompt (prompts/devin-batch-5-prompt.md is NOT this — the Devin Desktop
prompt is prompts/devin-desktop-prompt.md) builds the Devin Desktop copy
(Command Center, Spaces, full IDE, Tab completions, Fast Context, Codemaps).
THIS prompt adds Cursor's IDE features into that same IDE shell, as
capabilities only — never Cursor's name, logo, exact UI copy, proprietary
code, or proprietary models (Tab/Fusion). Our engines stay his providers +
DuckDuckGo free. Follow the repo house rules in AGENTS.md: vanilla single
page, no frameworks, no build step, no npm packages; skills
test-first/testing-qa/debugging-discipline/no-ai-slop/senior-frontend/api-design/git-workflow;
commit after each slice; never claim an unrun test passed. Tests follow the
established NO-JSDOM extraction-and-eval pattern and assert ONLY identifiers
and behaviours that actually exist in index.html; the new suite MUST call
process.exit(0) on success.

## What to build (all inside the IDE shell from the Devin Desktop prompt)

### 1. Tab completions — Cursor Tab behaviour (extends Devin Desktop §4)
- Ghost-text inline suggestion in the editor as the user types: grey text
  after the cursor, `Tab` accepts, `Esc` rejects, `Ctrl+→` accepts one word.
- The suggestion comes from the LOCAL chain only: current file context +
  the code graph (Repo Map neighbours + recently edited symbols) fed to the
  active provider (DuckDuckGo free default / 9router / custom). No
  proprietary model, no network call to Cursor.
- Next-edit prediction: after an accept, offer the likely follow-on edit in
  the same file (same mechanism, one extra suggestion, never auto-applied).
- Settings (Settings → Editor): Tab completions On/Off, Aggression
  Low/Medium/High (how often suggestions appear), "Tab to Jump" and
  "Tab to Import" toggles (same names as the Devin Desktop spec §4 — one
  setting serves both). Free and unlimited by design (his free-first rule).
- Never suggest inside a secret (`.env`, keys, tokens) — reuse the H2.5/H5.5
  credential scrub: suggestions are built from code context only.

### 2. Composer panel — multi-file agentic edits
- A Composer mode in the IDE: one prompt → plan → per-file diffs listed in
  the panel → Accept/Reject per file (reuse the A2 diff review) → Apply all.
- Built on the existing diff-based editing (7.2) and Team Mode — this prompt
  adds ONLY the panel UI + the plan-then-apply flow, not a second agent.
- Shows live progress per file (queued / editing / done / needs review).

### 3. Bugbot review view — automatic PR review
- A Review view listing PR findings (file, line, severity, suggested fix),
  each with "Assign to Devin" (creates a fix task in the current session)
  and Dismiss. Findings come from the existing Project Doctor + security
  checks (Batch 3 F1, Batch 6 Review) — this prompt adds ONLY the view +
  the assign flow, not a new scanner.
- Reuses the Devin Review settings (auto-review rules, per-PR spend limit).

### 4. Background-agents view
- A panel listing running background agents: task, branch, status
  (working / waiting / done / needs review), PR link when opened. Built on
  H5.1 scheduled tasks + long-running tasks (Devin Batch 5) — this prompt
  adds ONLY the view; if Batch 5's long-running tasks are not in the build
  yet, the view shows scheduled tasks and an honest empty state, never fake
  agents.

### 5. Editor shell completeness (only what the Devin Desktop prompt did not cover)
- File explorer with the project tree (from the VFS), editor tabs (open /
  close / dirty dot), terminal panel (runs the H4 terminal backend when
  present; in the web app it is the existing in-app terminal, never a fake
  one), and the preview beside the editor.
- All new strings get Bengali translations (full-English-string i18n keys,
  same as every batch).

## Acceptance tests (new suite test-batch-cursor-ide.js)
(a) Tab suggestion appears as ghost text and Tab accepts / Esc rejects
    (drive the real functions, not a copy of the code);
(b) next-edit prediction offered once after an accept, never auto-applied;
(c) aggression setting changes suggestion frequency (Low < Medium < High in
    the test's deterministic stub);
(d) no suggestion is built from secret content (.env / API_KEY);
(e) Composer panel lists per-file diffs with Accept/Reject per file and the
    flow reuses applySearchReplacePatch (7.2);
(f) Bugbot view lists findings with Assign-to-Devin creating a fix task and
    Dismiss removing it;
(g) background-agents view lists running agents from H5.1 state and shows
    the honest empty state when there are none;
(h) editor tabs + file explorer + terminal panel exist and open/close;
(i) Bengali translation keys exist for all new strings.
Run the FULL suite after (all test-*.js + test-*.cjs must exit 0). Run
`node --check` on the extracted script FIRST — a passing new suite does not
prove the script parses. Verify every new entry point is actually CALLED
from a live path (not just defined) and add a wiring regression test if one
is not.
