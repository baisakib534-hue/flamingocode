# DevForge feature build — Plan + Build mode (jcode prompt, self-contained)

Read PRD.md and AGENTS.md first. Implement ONLY this feature in index.html.
It builds on the Project Brain feature (`.devforge/` files); if Brain is
present, use it; if not, keep the plan in app state + a plan file fallback.
Do not start any other stage or feature.

## Feature: Plan + Build mode — interleaved planning and execution
## (Sakib's order: "plan করে আর build করে জায়গায় জায়গায়")

### Mode selector
- Agent chat header gets a mode selector: Chat / Plan / Plan + Build.
- Plan mode: the agent only plans (no file changes).
- Plan + Build mode: the flow below.

### Flow
1. User gives a task → agent outputs a numbered plan of SMALL, verifiable
   steps (each step ≈ one small request / one file, per the small-request
   discipline).
2. The plan renders as a live checklist panel beside the chat (checkboxes,
   current step highlighted) and is saved to `.devforge/current-plan.md`
   so it survives reloads and context compression.
3. The agent executes steps ONE BY ONE, each as its own focused request
   referencing the plan + Brain digest. A step is ticked when its file
   changes land and (where applicable) the preview shows no new errors.
4. On failure or new information, the agent revises the plan (the checklist
   shows "revised" with the change noted) and continues.
5. Finish = a summary report against the plan: done / changed / skipped +
   why for each step.

### Controls
- Pause / resume, skip-step button, "Re-plan" button.
- The user can edit the checklist between steps (toggle, delete a step,
  add a note) — execution respects the edits.

### Caps (configurable in Settings → Behavior)
- Max steps per plan: default 25. Max plan revisions: default 5.
- Hitting a cap stops gracefully with a report, never a silent hang.

### Acceptance (verify before committing)
- Extracted script passes `node --check`.
- grep markers present: mode selector id, checklist renderer,
  `current-plan.md` write.
- Plan persists across page reload (state + brain file).

### EXECUTION RULE (manager)
Build in slices of ≤150 lines; commit every 2–3 slices with small progress
messages; if a generation would be huge, split it. Final commit message:
"Feature: Plan + Build mode - interleaved planning and execution"
Then print a short summary. Do not start the next feature.
