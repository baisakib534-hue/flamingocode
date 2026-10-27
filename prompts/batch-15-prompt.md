# Batch 15 — editor / UX + Computer Use + test harness (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §8 (Antigravity),
§7 (amp), §32 (VTCode), §25 (MiniMax), §1 (Aider), §2 (Goose), §3 (Devika),
§17 (DimCode), §4 (Windsurf), §24 (Kimi), §27 (Nova), §20 (FastAgent),
§6 (SWE-agent), §18 (Dirac).

Already built that you must EXTEND, never rebuild:
- Tier A diff review (before apply, default ON) + Senior review + Batch 12
  L2 gates / L3 rubric — O1/O2/O3/O5 are the REVIEW SURFACE on the same
  gates, never a second review.
- Stage 5 self-testing browser + Trae-style self-testing agent — O11/O15/
  O16 extend it. The Computer Use driver is Stage 6 (Electron) — O15/O16
  build the act decomposition + handoff SHAPE in the web app against a
  clearly-marked desktop stub; never fake driving another app in a browser
  page.
- Batch 9 D2 ask-user tool + Batch 10 J1 anchored edits + Batch 7.5 Recipes
  + Batch 7.12 per-session message queue — O7/O8/O10/O12 extend them.
- Batch 10 J6 pasted-patch apply — O8's clipboard bridge applies through
  the SAME path. Batch 4 lazy tool loading + Batch 10 J9 progressive skill
  disclosure — O12's intent completion never calls a model per keystroke.
- Batch 5 D5 Security Swarm quick profile — O9's unicode scan feeds it,
  does not replace it.
- Safe Mode (H2.3): O16's human handoff never auto-approves a payment or
  a login the user didn't do themselves; O15's Playwright fallback runs
  only inside the self-testing browser, never against the user's other apps
  in the web app.
- Honest scope: O14 video input works only where the model supports vision
  (DuckDuckGo AI models mostly cannot — the UI says so per model, from the
  Batch 10 J14 catalog); O15/O16's real app-driving lands at Stage 6.

## Scope — build all 18, one at a time, slice by slice

### O1. Review artifacts + anchored comments (Antigravity)
- The review surface becomes an ARTIFACT (evidence package): plan +
  ordered diff + test results + screenshots/recordings — NOT raw tool logs.
  The Senior review, the Adversary round, and the diff review all render
  into the same Artifact view.
- Anchored comments: highlight a plan section or a screenshot region,
  comment, and the agent incorporates it LIVE without restarting the task.
  Comments are events on the session timeline (G14) and attach to the
  artifact, not to the chat scrollback.

### O2. Intelligently ordered diffs (amp)
- The diff review shows the most explanatory files first (entry points,
  files other changed files depend on, files with the most review
  comments), not alphabetical. The ordering rule is shown ("ordered by
  explanatory value") and the user can switch back to alphabetical.
- Extends Tier A diff review — same review, better order.

### O3. Restack changes into clean commits (amp)
- Restack a messy working diff into logical commits: group the diff by
  file/concern, propose the commit split, the user approves, then the
  commits are created. Extends auto-commit (8a F2) — same commit path,
  grouped.
- A restack never commits without approval and never rewrites commits
  that are already pushed.

### O4. Mid-run steering with delivery receipts (amp, Dirac)
- A follow-up sent mid-run is injected at the NEXT STEP boundary as a
  course correction (steer, don't queue behind the run) — extending the
  per-session message queue (7.12) with mid-run injection + delivery
  receipts ("steering received at step 7, applied from step 8").
- A steering message that arrives while the agent is mid-tool-call waits
  for the step boundary, never interrupts a write half-way.

### O5. Turn diffs + /explain without a model call (VTCode)
- Every turn shows its before/after diffs per file (with size thresholds
  — huge diffs collapse); `/explain` renders a deterministic explanation
  from the trajectory + decision ledger (Batch 11 K7) alone — ZERO tokens.
- The explanation names what changed, why (the decision that drove it),
  and what it affects (callers from the code graph). Teach Mode style,
  simple Bengali, no model call.

### O6. Source-reference citations for every tool call (MiniMax)
- Every tool call in the session timeline carries stable citation IDs:
  file refs (recovered even from shell commands that touched files) and
  web evidence where the call used the web. Clicking a citation jumps to
  the file/line or the source.
- Citations are recorded in the event log (G14), so a replay shows exactly
  what each step was based on.

### O7. Multi-step questionnaire — ask-user as a form (MiniMax)
- Extend the ask-user tool (Batch 9 D2): ask SEVERAL questions at once as
  a FORM — N questions, each with close/skip/free-text per question —
  instead of one question per round-trip.
- The form is one chat message; answering it sends all answers at once;
  skipped questions are marked skipped (never silently defaulted).

### O8. Clipboard bridge to any free web chatbot (Aider)
- `/copy` puts the task context on the clipboard; the user pastes it into
  ANY free chatbot and pastes the reply back with `/paste` — the reply is
  applied as edits through the Batch 10 J6 pasted-patch path, with a diff
  review before apply. Image paste is supported (a pasted screenshot
  attaches to the task).
- The bridge is honest about what it is: the external chatbot's answer is
  untrusted text until the diff review passes it.

### O9. Recipe deeplinks + unicode-tag security scan (Goose)
- Share a Recipe (Batch 7.5) as a base64url deeplink — opening the link
  imports the recipe (UNTRUSTED until reviewed, like any import).
- Scan pasted prompts for invisible / zero-width unicode characters
  before the agent acts on them; a hit is flagged plainly ("this paste
  contains hidden characters — show them?") and the hidden characters are
  revealed, never silently stripped or silently obeyed.

### O10. PDF project-report export (Devika)
- Export the project report (status, files, decisions, readiness score,
  recent sessions) as PDF: Reporter → markdown → PDF. The report is the
  same content as the auto-docs (Batch 4) project summary, exported —
  never a second report.

### O11. In-preview element annotation / click-to-source (DimCode, Windsurf)
- In the self-testing preview: click an element to jump to its source
  (click-to-source); or CIRCLE an element, write intent, and the
  annotation PLUS the element's CSS properties is injected into chat
  context — "what you see is what you change".
- Annotations are attached to the next agent turn as context (selector +
  computed CSS + the user's words), and shown as markers on the preview
  until the turn runs.

### O12. Supercomplete intent completion + Tab-to-Jump + Tab-to-Import (Windsurf)
- Extend inline autocomplete (Batch 2): a small fast model predicts the
  INTENT of the next edit (~150ms), not just the next tokens; Tab jumps
  to the predicted location / imports the predicted symbol; Esc dismisses.
- LOCAL and rule-based first (graph neighbours + recent edit pattern, the
  Batch 8b G1 next-edit shape); a model call happens only for the intent
  guess, never per keystroke. A wrong suggestion costs one keypress.

### O13. Live thinking line + token usage in chat (Devika)
- A live "thinking" line in chat while the agent works (what it is doing
  RIGHT NOW, in plain Bengali) plus a running token count for the turn.
  The line is the agent's internal monologue, streamed — not a fake
  progress bar.
- Pairs with Kilo radical transparency (8b): the thinking line is the
  live view, the timeline is the record. The user can hide the thinking
  line per session.

### O14. Read-only context files (Aider)
- A read-only flag per context file (H1.4): the model sees the file, but
  the edit path REFUSES it — with a plain note if the agent tries ("that
  file is read-only context"). The file tree shows the flag.
- Small, but it closes a real hole: context files today can be edited by
  the agent that was only meant to read them.

### O15. Video input (Kimi) — Stage 6, vision models only
- Attach a video/screenshot to a prompt; the agent samples frames and
  uses them as requirements/evidence (e.g. a screen recording of a bug, a
  fly-through becoming a page). Frames are sampled for vision-capable
  models; the media is projected into model context with a per-model
  capability gate from the Batch 10 J14 catalog.
- Honest scope: only models with vision input can use it; DuckDuckGo AI
  models mostly cannot — the UI says so per model, and attaching video to
  a non-vision model warns before sending. Clipboard paste (Ctrl-V)
  attaches images.

### O16. Atomic acts + deterministic scaffolding + Playwright fallback (Nova) — Stage 6
- Computer Use / self-testing reliability: decompose a UI task into
  ATOMIC acts, interleaved with deterministic asserts/breakpoints; when
  an act fails twice, fall back to a scripted step (Playwright in the
  self-testing browser) instead of re-trying the same failing act.
- In the web app, build the act decomposition + scaffolding + fallback
  SHAPE against the self-testing browser, honestly marked; driving OTHER
  desktop apps lands at Stage 6 Electron (the Computer Use driver).
  Never fake driving another app in a browser page.

### O17. Human-in-the-loop as a DOING role (Nova)
- The agent can hand the browser to the USER mid-task for the parts only
  a human can do (solve a captcha, log in, approve a payment), then
  resume where it left off. The handoff pauses the turn with a plain
  "your turn — <what to do>" card; the user taps "done, continue" and the
  agent resumes from the exact next step.
- A wait-time tracker shows how long the human step has been waiting. The
  agent NEVER auto-approves a payment or a login the user didn't do.

### O18. Scripted-model test harness (fast-agent, Mini SWE-agent)
- A scripted-model mode for the agent loop: a Passthrough model (echoes
  input unchanged, implements the model interface) and a Playback model
  (replays a scripted list of assistant messages in sequence, then
  reports "MESSAGES EXHAUSTED") — so the verifier can run full multi-turn
  agent flows OFFLINE and deterministically, with zero model calls.
- Plus a tiny reference loop as a smoke test (Mini SWE-agent lesson): a
  minimal agent loop the verifier runs to prove the agent loop itself
  works. Directly serves "verify everything, no half-done work".
- The harness is test tooling, not a user feature: it lives in the test
  files and a hidden diagnostics panel, never in the main UI.

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
- Respect the caps: Brain digest ~1500 tokens, checkpoints cap 30, no
  second graph/index/queue/store/scheduler/session-log/API/router. O1/O2/
  O3/O5 render the SAME review; O4 extends the ONE message queue; O8
  applies through the Batch 10 J6 path; O16's app-driving is a Stage 6
  stub in the web app — never faked. O18 is test tooling, not a user
  feature.
- Safe Mode (H2.3) still gates everything dangerous: O17 never
  auto-approves a payment/login; O8's pasted reply is untrusted until diff
  review; O9 never silently obeys hidden characters; O14's read-only flag
  is enforced by the edit path, not by prompt.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner, Batch 10's edit protocol (O8/O11 apply through
  it, do not re-implement it).

## Tests (required, same pattern as every batch)

- New suite `test-batch-15.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each O1–O18 with at least 2 assertions on REAL behaviour:
  a review renders as an artifact (plan + diff + tests + screenshots) and
  an anchored comment is incorporated without restarting the task; the diff
  review orders explanatory files first and can switch to alphabetical; a
  restack proposes a grouped split, waits for approval, and never commits
  pushed work; a mid-run steering message is injected at the next step
  boundary with a delivery receipt and never interrupts a write; /explain
  renders from trajectory + ledger with zero model calls and names what
  changed and why; a tool call carries citation IDs that jump to their
  file/line; a questionnaire form sends all answers at once and marks
  skipped questions as skipped; a pasted chatbot reply applies through the
  anchored path with a diff review, and a pasted image attaches; a recipe
  deeplink round-trips and a paste with zero-width characters is flagged
  with the hidden characters revealed; a project report exports as PDF
  from the same content as auto-docs; a circled preview element injects
  selector + CSS + intent into the next turn and click-to-source jumps to
  the file; an intent suggestion offers Tab-to-Jump/Import and Esc
  dismisses it without a model call per keystroke; the thinking line shows
  the current step with a running token count and can be hidden; an edit
  to a read-only context file is refused with a plain note; attaching video
  to a non-vision model warns before sending and a vision model receives
  sampled frames; an atomic act that fails twice falls back to a scripted
  step and app-driving outside the test browser is honestly marked
  desktop-only; a human handoff pauses with a "your turn" card and resumes
  from the exact next step, and a payment is never auto-approved; a
  Playback model runs a scripted multi-turn flow offline and reports
  "MESSAGES EXHAUSTED", and the tiny reference loop passes its smoke test.
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
