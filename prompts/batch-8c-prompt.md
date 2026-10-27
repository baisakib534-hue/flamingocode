# Batch 8c — model auto-failover + best-model per task (solo + team) + themes

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch is two orders from the user, in his own words:
1. "model - auto: একটার limit শেষ হলে auto আর একটা select করে কাজ চালিয়ে
   যাবে + কোন কাজের জন্য কোন model best ওটা select করে কাজ করিশে নিবে।
   আর এটি solo + team দুই mode তেই থাকবে।"
2. "theme: Qoder এর theme কপি করবে + তুমি নিজে কিছু theme বানাবে,
   background এ কিছু চলবে — example: black hole, solar system, nature —
   আর একটি glass theme যেটার background নাই, ভিতর দিয়ে সব দেখা যায়।"

Already built that you must EXTEND, never rebuild:
- Batch 5 D3 smart routing: `routeModelForStep(step)` (index.html:11167) —
  filters rate-limited providers via `appState.rateLimitState` (`.isLimited` /
  `.retryAfter`), returns `{model, provider, reason}`. M1/M2 extend THIS
  router, never a second router.
- `buildProviderFallbackChain()` (index.html:24642) — the ordered fallback
  chain. M1 walks THIS chain, never a second chain.
- `callLLMWithFallback(messages, options)` (index.html:28415) — the single
  LLM call path. M1's retry goes through THIS function.
- `getCheapProvider()` (index.html:25938) — the cheap-model picker. M2 may
  use it for the "cheap + good enough" task types, never a second picker.
- Per-model rate limits (Batch 5): `appState.rateLimitState`,
  `rateLimitCountdown` UI. A "limit" in M1 is a rate-limit / quota error
  (HTTP 429 or a quota-exhausted error from the provider) — nothing else
  counts as a limit.
- Batch 8a F7 custom modes (per-mode model) + Batch 8b G8 (per-mode model
  extends F7) + G9 (model roles: Planner / Coder / Reviewer / Tester) +
  G16 (mid-task model switch: keeps plan + completed steps + Brain digest,
  logs a session event). By the time you run, Batch 8b is in the tree:
  USE G9 roles and G16's switch machinery where they exist; if a G9/G16
  piece is absent, implement the missing bit inside M1/M3, never a second
  roles or switch system.
- Team Mode v2 core (templates, live team chat, task board, Senior diff
  review). M3 wires model behaviour INTO its existing agent spawn path —
  never touch the team core itself.
- The app has NO theme system yet (only a `light-theme` body toggle at
  index.html:39078 and theme words inside generated sample code). T1–T3
  build the ONE theme engine. For Qoder's theme, read the reference notes
  first: `~/workspace/devforge/qoder-ui-notes.md` (+ screenshots in
  `~/workspace/devforge/`). Copy the THEME (colours, feel) — never Qoder's
  name, logo, or exact UI copy. The final UI polish stage (from his Qoder
  videos) still comes later and refines visuals; this batch is the theme
  ENGINE + the themes themselves.
- Safe Mode (H2.3) + the approval ladder still gate everything: a failover
  to a different model NEVER bypasses an approval the user would have seen.

## M1. Model auto-failover — limit শেষ হলে auto পরের model, কাজ থামে না

- When an LLM call fails with a rate-limit / quota error, the agent does
  NOT stop and does NOT ask the user: it marks that model limited in
  `rateLimitState` (with `retryAfter` when the provider gives one),
  picks the next eligible model from the fallback chain, and RETRIES the
  same step with the new model — through `callLLMWithFallback`.
- The task continues from the EXACT step that failed: plan, completed
  steps, checkpoints, and the Brain digest are kept (reuse G16's switch
  machinery when present). A completed step is never re-run.
- The switch is visible, never silent: a one-line note in chat
  ("<old model>-এর limit শেষ — <new model> দিয়ে চালিয়ে যাচ্ছি") and a
  session event (same event log as G14, when present) with old model, new
  model, and reason. The header model picker shows the active model.
- If EVERY model is limited, the agent stops cleanly with a plain message
  ("সব model-এর limit শেষ — <earliest retry time> পরে আবার চেষ্টা করো")
  and a "Retry now" button that re-runs the failed step only. It never
  loops forever: max 3 failovers per step, then it stops and asks.
- An "Auto-failover" toggle in Settings (default ON). When OFF, a limit
  stops the task and asks the user which model to continue with — the old
  behaviour, unchanged.

## M2. Best model per task — কোন কাজে কোন model best

- The router classifies each step/task and picks the best AVAILABLE model
  for that kind of work: planning, coding, review, testing, research/web,
  simple Q&A, long-context work. "Best" means: the configured model
  ranked first for that task type AND not currently limited — a limited
  model is skipped even when it is the best on paper, and the pick falls
  to the next one (M1's failover covers the case where the pick itself
  hits a limit mid-call).
- The mapping is visible and editable: Settings → "কোন কাজে কোন model"
  — a small table (task type → model, default "auto"). The user changing
  one row changes that task type everywhere; "auto" means the router's
  built-in ranking decides.
- The router LEARNS from the user: when the user manually switches the
  model for a task type (header picker, mid-task switch) 3 times to the
  same model, that pick becomes the stored preference for that task type
  (shown in the table as "শেখা", with its evidence "৩ বার" — and
  deletable, like any other row). Learned picks live in the SAME
  preferences table, never a second store.
- The pick is shown, not hidden: each step's model is visible in the
  task/step header, and the chat note names the model used for a step
  when it differs from the project default.

## M3. Solo + team — দুই mode-তেই

- SOLO mode: M1 + M2 apply to the single agent's steps exactly as above.
- TEAM mode: every team agent has its own model (from its ROLE per G9
  when present, else from the agent's own model field) and fails over
  INDEPENDENTLY — one agent hitting a limit never stops the other agents.
  The Senior review agent fails over the same way; a Senior failover
  never skips the review gate.
- The team board shows each agent's CURRENT model (it changes visibly on
  a failover) and a failover note in the team chat when any agent
  switches. Team Mode v2 core (templates, chat, board, Senior review) is
  NOT rebuilt — only the model behaviour is wired into its agent spawn
  path. Find that path in the tree; if its agent objects carry no model
  field yet, add one field, not a second agent system.

## T1. Theme engine + Qoder theme

- ONE theme engine: Settings → Themes. A theme is a set of CSS variables
  (background, panels, text, muted text, accent, borders, code/syntax
  colours) applied through a `data-theme` attribute on the root + CSS
  variable overrides. Switching a theme repaints the whole app instantly
  with no reload. The choice is saved in appState and survives reload.
- The Qoder theme: copy Qoder's theme from the reference notes
  (`~/workspace/devforge/qoder-ui-notes.md` + screenshots) — its colours
  and feel as a theme named "Qoder". Never Qoder's name/logo/branding
  anywhere else; the theme's name in the list is the only place "Qoder"
  appears, as the theme's name.
- The theme list shows a small live preview swatch per theme (its real
  colours, not a stock image). A theme the user picks applies to the
  editor, sidebar, chat, panels, and modals — every surface, not just
  the background.

## T2. Animated background themes — নিজের বানানো (original)

- Three original animated themes, built with lightweight canvas/CSS only
  (no libraries, no npm, no images): **Black Hole** (a dark accretion
  disk with a glowing ring + drifting stars), **Solar System** (planets
  orbiting slowly around a sun), **Nature** (soft forest tones with
  slow-drifting leaves/pollen). Each is its own theme in the same engine
  (T1) — same CSS variables + one canvas background layer behind the app.
- The animation is SUBTLE and never fights typing: slow motion, low
  contrast, dimmed behind panels. One shared animation loop (one
  `requestAnimationFrame`, not one per theme), paused when the tab is
  hidden (`visibilitychange`) and when the user enables "Reduce motion"
  (also respects the OS `prefers-reduced-motion` setting — then the theme
  shows a single static frame). Each animated theme has its own
  animation on/off toggle in the theme list.
- Performance guard: the canvas is capped (devicePixelRatio ≤ 2, few
  dozen particles max) and the loop stops entirely when a static theme
  is active. The themes are original designs — no copied artwork.

## T3. Glass theme — background নাই, ভিতর দিয়ে দেখা যায়

- A glass theme: panels, sidebar, chat bubbles, and modals are
  translucent (`backdrop-filter: blur`) with a thin light border, so
  whatever is behind them shows through. The app's own background is
  transparent in this theme — the backdrop layer (or the animated theme
  beneath, if one is active) is visible through every surface.
- Readability guard: text keeps full contrast — a soft scrim/shadow
  behind text where needed, and the blur strength is adjustable in the
  theme's settings (Low / Medium / High). If the user turns blur to Low
  on a busy backdrop, a warning notes the readability trade-off.
- Honest scope, stated in the theme's description: in the browser the
  "see-through" shows the app's backdrop layer through the panels; true
  see-through to the OS desktop needs a transparent window, which lands
  at the Electron desktop stage (Stage 6) — the glass theme is built so
  it lights up fully there without changes. Nothing is faked: the theme
  never claims desktop transparency in the web app.

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
  second graph/index/queue/store/scheduler/session-log/API/router. M1/M2
  extend `routeModelForStep` + `buildProviderFallbackChain`. M3 uses the
  SAME failover function as M1. Learned picks live in the SAME model
  preferences table. T1–T3 are ONE theme engine, ONE canvas loop.
- Safe Mode (H2.3) still gates everything dangerous: a failover never
  bypasses an approval; a learned pick never changes the approval ladder.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner.

## Tests (required, same pattern as every batch)

- New suite `test-batch-8c.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each M1–M3 and T1–T3 with at least 2 assertions on REAL behaviour:
  a rate-limit error retries the same step on the next model with the
  plan intact and a visible note; all models limited stops cleanly with
  a retry button and never loops past 3 failovers per step; auto-failover
  OFF stops and asks instead; the router picks the mapped model for a
  task type and skips a limited best model; a user-edited mapping row
  changes the pick and a learned pick appears after 3 manual switches
  with evidence and is deletable; a team agent's limit switches only
  that agent while the others keep working, and the board shows the new
  model; switching themes repaints via the data-theme attribute and
  survives reload; the Qoder theme applies its colours; each animated
  theme starts its canvas loop, pauses on a hidden tab, and honours
  reduced-motion with a static frame; the glass theme makes panels
  translucent with blur and keeps text readable, and its description
  states the desktop-transparency scope honestly.
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
