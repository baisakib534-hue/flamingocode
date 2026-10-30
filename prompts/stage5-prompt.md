# DevForge Stage 5 — browser self-test (jcode prompt, refreshed, self-contained)

Read PRD.md and AGENTS.md first. Implement ONLY this stage in index.html.
Do not start Stage 6.

## Stage 5: the agent tests what it built (Trae-style self-testing)
- A "Self-Test" run for the active project: DevForge loads the built app in
  the preview/browser pane and exercises it like a user — click every
  clickable element, fill inputs, drag & drop, move sliders, toggle
  switches, scroll, resize — all interaction types present in the DOM.
- During the run, capture: console errors, uncaught exceptions, failed
  network requests, and elements that do not respond.
- Results panel: a checklist of interactions tried, each pass/fail with the
  error if any; a "Fix with AI" button on each failure feeds the error +
  context back to the agent as a focused small request (self-healing loop,
  max 3 fix attempts per failure, then report).
- Safety: the self-test only runs inside the preview sandbox of the user's
  own project; it never navigates away to external sites on its own.

### Acceptance
- Extracted script passes `node --check`.
- grep markers present: self-test runner, interaction enumeration,
  failure → agent fix loop.
- A demo run on a template project completes and reports.

### EXECUTION RULE (manager)
Build in slices of ≤150 lines; commit every 2–3 slices with small progress
messages; if a generation would be huge, split it. Final commit message:
"Stage 5: browser self-test - automated interaction testing with fix loop"
Then print a short summary. Do not start Stage 6.
