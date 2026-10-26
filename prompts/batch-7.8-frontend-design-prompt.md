# Batch 7.8 — frontend-design skill (research sweep #8 / P1, TOP PACK PICK)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His complaint, in his own words: the HTML he opened looked "অনেক ai slop
আর ugly". The Anthropic `frontend-design` skill (from `anthropics/skills`,
19 skills) is the direct cure — a skill that enforces real design taste
and is explicitly anti-"AI slop". What exists today (do NOT rebuild): the
`design-taste` skill (one of the 6 new skills), the `senior-frontend`
skill, B4.7 lazy tool loading, the B3 self-healing preview loop, the A2
diff review. The GAP: no production-grade design enforcement anywhere in
the agent loop — nothing stops the agent from shipping generic purple
gradients and three identical emoji cards. This batch ports the skill's
MECHANISM (progressive disclosure + design rules, in our own words —
never copy Anthropic's SKILL.md text) and wires it into the preview as an
enforced design review.

## 1. The skill — `frontend-design` in the skill library

Same shape as the existing skills (id, name, trigger description, body,
enabled toggle). Progressive disclosure, exactly Anthropic's 3 levels:
- Level 1 — frontmatter (~100 words): always visible to the agent; the
  trigger description + the one-line taste rule.
- Level 2 — the SKILL.md body (<500 lines): the design rules (below),
  loaded when the agent does UI work.
- Level 3 — references/scripts, loaded ON DEMAND only: a design-tokens
  reference + a component-patterns reference (this is the same lazy
  loading B4.7 implements — reuse it, do not build a second loader).
- The skill auto-activates (Autonomy Engine) whenever a task touches UI:
  building a page, changing layout, styling a component, or the preview.

Design rules to encode (our own words, production-grade):
- Typography: one font family for UI + one for display at most (two
  total), a fixed type scale (no ad-hoc sizes), line-height tied to the
  scale.
- Spacing: one spacing scale (4/8/16/24/32…), no magic numbers.
- Colour: a defined palette from the design tokens (§3) — no random
  gradients, no default purple-blue gradient, no more than 3 accent
  colours on one screen.
- Layout: real rhythm (consistent gutters, aligned edges), no generic
  "hero + 3 identical cards with emoji icons" pattern, no lorem ipsum —
  real content or clearly-marked placeholder copy.
- Components: consistent buttons/inputs/cards (one style each), states
  for hover/focus/disabled/loading, accessible contrast (WCAG AA).
- Motion: animation with purpose only (feedback, orientation) — never
  decoration for its own sake.
- Responsive by default: the design must hold at mobile width, not just
  desktop.

## 2. Design review gate — `designReview()` (enforced, not just text)

- Runs automatically after every preview render (B3 Preview Health panel)
  and before the Senior signs off a UI change (Team Mode).
- Checks the live preview DOM against the §1 rules and returns a list of
  violations, each with `{ rule, element, severity, fix }`:
  contrast below AA, more than 2 font families in use, more than 3 accent
  colours on screen, spacing values outside the scale, the generic
  3-identical-cards pattern, missing hover/focus/disabled states on an
  interactive element, text overflowing its container at mobile width.
- Violations become FIX TASKS in the B3 self-healing loop (same shape as
  preview errors — auto-fix cycle, capped, needs-help if it cannot fix).
- The design review result shows in the Preview Health panel next to the
  error list ("Design: 2 issues") and in the A2 diff review for UI files
  ("Design ✓" / "Design: N issues").
- A design violation NEVER blocks a non-UI task, and never blocks the
  agent from continuing other work — it is a fix task, not a stop.

## 3. Design tokens — `appState.designTokens`

- One tokens object, persisted: `{ colors: { background, surface, text,
  muted, accent, accent2, danger, warning, success, border }, spacing:
  [4,8,16,24,32,48,64], typeScale: [...], radius, fontFamily, fontDisplay }`.
- The agent MUST use token values for any new UI (system-prompt addition
  + the skill body). The tokens ship with sensible FlamingoCode defaults
  (dark-first, coral accent from his flamingo logo #f0513b) — the UI
  polish stage (Qoder videos) will set the final tokens; this batch only
  builds the mechanism + defaults.
- A Settings → Appearance section shows the tokens (read-only list for
  now, editing comes with UI polish — say so in the UI copy, do not build
  a token editor here).

## 4. Companion skill — `webapp-testing` (same pack, Stage 5 feed)

- Same pack (P1), same shape: a Playwright-based UI testing skill that
  drives the preview in a real browser — click/type/drag/scroll, assert
  visible state, screenshot on failure.
- In the web app it wires to the B3 preview + the sandbox browser-test
  design (spec exists): the skill's checks run as preview-health checks
  today, and as real browser runs at the desktop/sandbox stage (say so in
  the skill body — do not fake a browser run in the web app).
- Default: ON, alongside `frontend-design`.

## 5. Dedupe — do NOT rebuild

`design-taste`, `senior-frontend`, B4.7 lazy loading, the B3 preview loop,
the A2 diff review, Team Mode Senior review, the skill library — build ON
them. No second design system, no second preview, no second test runner.
This batch is ONE skill + ONE companion skill + ONE review gate + ONE
tokens object.

## Tests — new file `test-batch-7.8-frontend-design.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) the `frontend-design` skill exists in the skill registry with a
    frontmatter trigger (~100 words) + body + on-demand references
    (progressive disclosure shape);
(b) the skill auto-activates on a UI task and NOT on a pure-logic task;
(c) `designReview` flags low-contrast text, more than 2 font families,
    and the generic 3-identical-cards pattern on a test DOM fixture;
(d) a design violation becomes a fix task in the B3 self-healing loop
    (and does NOT stop non-UI work);
(e) `appState.designTokens` exists with the full shape (colors, spacing,
    typeScale, radius, fonts) and the coral accent default;
(f) new UI output uses token values (a test render resolves colours from
    tokens, not hardcoded hex);
(g) the `webapp-testing` skill exists and its checks map to preview-health
    checks (no fake browser run claimed in the web app);
(h) the design result shows in the Preview Health panel ("Design: N
    issues") and in the A2 diff review for UI files;
(i) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
