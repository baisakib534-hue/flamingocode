# Batch 8a — sweep leftovers: agent workflow, modes, safety rails

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Already built that you must EXTEND, never rebuild:
- Step Planner (conditional per-step planning, think-act-observe, Todo panel).
- Plan + Build modes + Chat/Plan modes — F7 extends these modes, it does not
  replace them.
- Tier A checkpoints (cap 30) + H2.4 restore modes — F9 stores checkpoints
  in git, it does not invent a second checkpoint system.
- H5.4 Hooks (task-complete, build-finish, senior-reject) — F11 adds
  user-defined hooks on the SAME fireHook path, not a second hook system.
- H5.1 scheduled tasks + Devin Batch 6 E5 Automations — F15's steps cap is
  a per-task limit, not a scheduler.
- Batch 7.3 Superpowers (RUNNING in parallel — DO NOT touch its files):
  TDD iron law + brainstorm-before-building already live there. Do NOT
  rebuild them here. If 7.3 has not landed yet, build F1–F15 so they work
  with or without the Superpowers skills present (feature-detect, never
  assume their identifiers exist).
- Per-model rate limits + F5 never-stuck routing + Batch 5 D3 smart model
  routing — F3 benchmarks THROUGH the existing routing, it does not add a
  second router.

## Scope — build all 15, one at a time, slice by slice

### F1. Architect mode (Aider)
- A mode alongside Chat/Plan/Plan+Build: in Architect mode the agent may
  ONLY plan, ask questions, and write design notes — it changes NO code.
  The plan it produces is saved as `.devforge/architecture-plan.md` and
  offered as the starting plan for a Plan+Build run ("এই plan দিয়ে build
  করো" button).
- The mode switch is visible in the mode picker; Architect mode shows a
  banner ("Architect mode — শুধু plan, কোড বদলাবে না") so it can never be
  mistaken for a building mode. Any tool call that would write a file is
  refused in this mode with that exact message.

### F2. Git auto-commit (Aider)
- Settings toggle (default OFF) + per-task checkbox: after a task finishes
  green (all tests pass, no needs-help), the app creates a git commit
  automatically with a generated message ("flamingocode: <task title> —
  <files changed>").
- The commit is made through the SAME git path the app already uses for
  its own history (local git state); if the project has no git repo, the
  toggle shows "এই প্রজেক্টে git নেই" and stays off. Auto-commit NEVER
  pushes — pushing is always the user's explicit action.
- Every auto-commit is listed in a small "Commits" view with revert
  (restore via the Tier A checkpoint taken just before the commit).

### F3. Model benchmark (Aider)
- A "Benchmark" panel: pick 2+ configured models and a small task set
  (3 built-in tasks: a bugfix, a small feature, a refactor — each with a
  hidden expected test), run each model on each task through the existing
  agent path, and record: time, tokens, cost, tests passed, steps used.
- Results as a table + a recommendation ("এই ধরনের কাজে <model> সবচেয়ে
  ভালো") that the user can apply as the default model for that task type.
  Benchmark runs respect the per-model rate limits and the steps cap (F15)
  and never spend more than the user-approved budget shown before start.

### F4. Goose serve — HTTP server exposing the agent (one API)
- An in-app "Serve" toggle: when ON, the app exposes the agent over a
  local HTTP endpoint shape (`POST /v1/tasks` — create a task, `GET
  /v1/tasks/:id` — status + result, `POST /v1/tasks/:id/message`) using
  the SAME session API Batch 6 E15 built. This is the ONE programmatic
  API — the Codex-style SDK (Batch 8b) is a client of this same API, never
  a second one.
- The web app documents the endpoints in the Serve panel with copyable
  curl examples. The real listening socket ships at Stage 6 (Electron);
  in the web app the toggle saves, the panel documents, and a "test with
  the in-app runner" button exercises the exact same handler code. Never
  claim the web page itself is listening on a port.

### F5. Session fork (Goose)
- Any session can be forked at any point: "Fork from here" creates a new
  session sharing the history UP TO that point (plan, Brain digest,
  checkpoints) and diverging after it. The fork is labelled with its
  parent ("forked from <task> at step 7").
- Forks appear in the session list (H1.5) grouped under their parent.
  Forking never copies secrets/keys — the fork re-reads them from the
  project's own config, same as any new session.

### F6. Adversary mode (Goose)
- A devil's-advocate agent: after the main agent produces a plan (or a
  finished solution), the Adversary reads it and attacks it — finds the
  weakest assumption, the unhandled edge case, the over-complicated part
  — and files its objections as review comments the main agent must answer
  before the plan is accepted.
- Toggle per task ("Adversary on/off", default ON for Plan+Build tasks over
  10 steps). The Adversary uses the CHEAP model (mechanical critique) and
  its objections are capped at 5 per round so it cannot filibuster.

### F7. Custom modes as files (Roo)
- Modes are no longer only the built-ins: a user can define a mode in a
  file `.devforge/modes/<name>.md` (name, when-to-use, allowed tools,
  system-prompt addition, default model) and it appears in the mode picker
  next to Chat/Plan/Plan+Build/Architect.
- The mode editor is a plain form (name, description, allowed-tools
  checkboxes, prompt textarea) that writes the file; a broken mode file
  (bad frontmatter) is listed with its error, never crashes the picker.
- Built-in modes cannot be deleted or edited from the file UI — only
  custom ones. Custom modes work in Team Mode too (an agent can be
  assigned a custom mode).

### F8. Boomerang tasks (Roo)
- A task can be set to "boomerang": after every N steps (user picks N,
  default 5) the agent PAUSES, presents what it has done so far, and waits
  for the user ("চালিয়ে যাও" / "থামো" / "এই অংশটা বদলাও"). The rest of
  the plan keeps its place — nothing is lost while waiting.
- Boomerang check-ins appear as human checkpoints (same UI as the existing
  checkpoint flow) so the user already knows how to answer them.

### F9. Shadow-git checkpoints (Roo)
- Tier A checkpoints gain a git backing: when the project has a git repo,
  each checkpoint ALSO records the current git HEAD + a `git stash`-style
  snapshot reference (commit hash of the checkpoint state, created on a
  `flamingocode-checkpoints` branch that never touches the user's branches).
- Restore from a shadow-git checkpoint checks out the recorded state AND
  restores the app's own checkpoint record, so code + app state agree.
  If there is no git repo, checkpoints work exactly as before (local only)
  — git backing is an addition, never a requirement.

### F10. Steering files (Kiro)
- Files under `.devforge/steering/*.md` are ALWAYS in the agent's context
  (inside the existing Brain digest cap — steering replaces generic
  guidance first, never grows the cap): product vision, tech decisions,
  "always/never" rules the user writes once and never repeats.
- A "Steering" panel lists the files with edit/delete/new; a steering file
  can be toggled off per project without deleting it. Steering files are
  included in the A3 full backup export/import.

### F11. Agent hooks (Kiro) — user-defined, on the H5.4 path
- Users can define their own hooks in Settings → Hooks: pick an event
  (the H5.4 events + `step-complete`, `plan-approved`, `publish-done`),
  and an action (show a notification, write a Brain note, run a shell
  check — shell checks only in Safe Mode Manual/Off, never Smart).
- User hooks fire through the SAME `fireHook` function H5.4 built, with
  the same fire-and-forget + `.catch` guard so a broken user hook can
  never break a task. A hook that fails 3 times is auto-disabled with a
  notice.

### F12. Powers (Kiro)
- Capability packs toggled per project: each Power is a named bundle
  (e.g. "Web research", "Security review", "Design polish") that switches
  ON a set of skills/MCPs/tools for that project and shows its status in
  the project header. Turning a Power off removes its tools from the
  agent's catalog for that project (lazy loading, Batch 4 B4.7 — the tools
  are unloaded, not just hidden).
- Powers are defined in `.devforge/powers.json` (name, tools, description)
  with 3 built-ins; users can add their own. A Power never auto-installs
  an MCP — install is always the user's explicit action (H5.5 rule).

### F13. Doom-loop detection (OpenCode)
- The agent watches its own recent steps: the same file edited 3 times
  with the same error after it, or the same tool call failing 3 times in
  a row with the same message, is a DOOM LOOP. On detection the agent
  STOPS that line of attack, writes a "stuck" note (what it tried, what
  failed), and offers: try a different approach / ask the user / escalate
  to the Senior (Team Mode) / switch model (F5 fallback).
- Detection is local and rule-based (no model call). The stuck note goes
  to the Brain so the next session does not repeat the same loop.

### F14. GitHub App trigger (OpenCode)
- When a repo is linked (github MCP), a "GitHub triggers" setting lets the
  user pick: on `@flamingocode` mention in an issue/PR comment, or on a
  label (`flamingocode` label added), the mentioned task is pulled INTO
  the task inbox (Batch 5 D10) as a new item with its source link.
- The trigger only READS GitHub (poll when the app is open, or via the
  webhook URL from the Automations page) — it never comments, closes, or
  pushes on GitHub without the user's explicit action per item.

### F15. Steps cap (OpenCode)
- A per-task and global setting: maximum agent steps per task (default 50,
  user-settable 5–500). At the cap the agent stops cleanly, saves a
  handoff note (what is done, what remains, exact next step), and asks
  the user to continue (continuing raises the cap for that task by the
  amount the user picks).
- The cap is enforced in the agent loop itself (not the UI), and the
  handoff note is written to the Brain so a resumed session starts from
  the exact step, never from scratch.

## Rules (non-negotiable)

- Small slices, commit after every 2–3 slices (the verifier commits +
  pushes; make each slice independently correct so a partial commit is
  never broken).
- Every new function/identifier you add MUST exist in index.html and be
  exercised by the new test suite — assert ONLY identifiers/behaviours
  that actually exist in index.html. Never assert a name you only planned.
- No AI slop: every feature must work end-to-end in the app, wired into
  real UI (panel/tab/button), not a dead function. Bengali UI text follows
  the app's existing i18n pattern (full-English-string keys).
- Respect the caps: Brain digest ~1500 tokens (steering + conventions live
  INSIDE it), checkpoints cap 30, no second graph/index/queue/store/
  scheduler/hook system/router. F4 is the ONE programmatic API.
- Safe Mode (H2.3) still gates everything dangerous: F2 never pushes;
  F11 shell hooks never run in Smart mode; F14 never writes to GitHub.
- Do NOT rebuild the 7.3 Superpowers items (TDD iron law,
  brainstorm-before-building). Feature-detect them if you reference them.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules.

## Tests (required, same pattern as every batch)

- New suite `test-batch-8a.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each F1–F15 with at least 2 assertions on REAL behaviour:
  Architect mode refuses a file write and saves its plan; auto-commit
  creates a commit only on a green task and never pushes; the benchmark
  runs 2 models on 1 task and records time/tokens/cost/tests; the Serve
  panel documents the endpoints and the in-app runner exercises the same
  handler; a fork shares history up to its fork point and diverges after;
  the Adversary files at most 5 objections and the plan waits for answers;
  a custom mode file appears in the picker and a broken one lists its
  error; a boomerang task pauses at step N and resumes from the same place;
  a shadow-git checkpoint records a HEAD and restores code + app state;
  a steering file enters the digest inside the cap; a user hook fires
  through fireHook and a 3-times-failing hook auto-disables; turning a
  Power off unloads its tools; a doom loop (same error 3×) stops the
  attack and writes a stuck note; a GitHub mention pulls into the inbox
  as an item and writes nothing to GitHub; the steps cap stops the task
  at N and writes a handoff note with the exact next step.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per feature: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
