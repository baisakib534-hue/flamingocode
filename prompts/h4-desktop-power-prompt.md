# Hermes Batch H4 — Desktop power (with Stage 5 / Stage 6)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Hermes Agent's capabilities as IDEAS, implemented
originally — never Hermes' name, logo, exact UI copy, or proprietary code.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Full spec: `~/workspace/devforge/hermes-features-spec.md` §6, §8, §13, §14,
§15, §16 + `~/workspace/devforge/sandbox-testing-spec.md` (§1 sandbox,
§2 computer-use testing). H4 lands WITH Stage 5 / Stage 6: the web-app
parts are built NOW; the parts that need a real desktop (real git, real
language servers, a real Chromium, real desktop apps, Docker/SSH) land as
honest in-app harnesses + settings NOW and as real drivers at Stage 6.
Never fake a desktop capability in the web app.

Already built that you must EXTEND, never rebuild:
- Tier A checkpoints (cap 30) + H2.4 restore modes — §6 branches carry
  their OWN checkpoint history; §8 feeds Batch 3 auto-fix on error.
- Team Mode v2 — §6 gives each parallel agent its own branch by default.
- Batch 6 E15 session API + Batch 8a F4 (Goose serve, the ONE programmatic
  API) — §13 ACP is a PROTOCOL ADAPTER on the session API, never a second
  API.
- Batch 5 D6 desktop-app testing harness + sandbox spec §2 — §14/§15 drive
  through the SAME step language, never a second test language.
- H5.1 scheduled tasks + Batch 6 E5 Automations — §16's process panel is
  about RUNNING processes, not scheduled jobs; do not merge them.

## Scope — build all 6, one at a time, slice by slice

### §6. Experiment branches (git worktrees, adapted)
- WEB NOW — project branches: one click duplicates the current project
  into an isolated copy ("experiment branch") with its own files, Brain
  notes, and checkpoints. A team agent (or the user) works there; merging
  back runs the Tier A A2 diff review, file by file.
- Branch list UI: name, created from, files changed vs parent, status
  (clean / dirty / merged). NEVER auto-delete a branch with unmerged
  work — archive it (archived branches are restorable, listed separately).
- DESKTOP (Stage 6) — real git worktrees: one per team agent, branch per
  agent, merge via the Senior review. The web branch record ALREADY
  carries the fields the desktop needs (branch name, base commit, agent)
  so the upgrade is a driver swap, not a redesign. The web app labels
  this honestly: "Web branches are project copies — real git worktrees
  arrive with the desktop app."

### §8. LSP semantic diagnostics after every edit
- WEB NOW (two layers, in-browser): after EVERY agent edit, a check runs
  on the edited file — (a) a syntax parse, (b) a "new problems only" list
  comparing diagnostics before vs after the edit (only NEW errors are
  reported, like Hermes). For JS/TS, use an in-browser TypeScript
  compiler pass when available, else a solid syntax + undefined-name scan.
- The diagnostics panel shows: file, line, message, and whether it is
  NEW (introduced by this edit) or pre-existing. New diagnostics feed
  straight into Batch 3 auto-fix on error as fix tasks.
- A flaky/missing checker can NEVER break a write: on checker failure
  the edit still applies and the panel says "check unavailable — syntax
  only". Untrusted workspaces run the restricted check only.
- DESKTOP (Stage 6) — real language servers (typescript-language-server,
  pyright, gopls where the project uses them) wired into the same
  post-write check, same new-only rule, same never-breaks-a-write
  fallback. The Settings → Languages list (Audit Gaps H7) shows which
  server backs each language and its status.

### §13. ACP server for IDEs
- DESKTOP (Stage 6) — FlamingoCode exposes an ACP (Agent Client
  Protocol) server, so VS Code / Zed can drive FlamingoCode's agents
  with their skills, memory, and providers intact; and FlamingoCode's
  editor accepts external ACP agents as guest workers with the same
  curated toolset (files, terminal, web, memory, todo, skills,
  delegation, vision — no messaging, no cron) and the same approval
  prompts. Implement the OPEN ACP protocol from its spec — never copy
  Hermes' ACP adapter code.
- WEB NOW — the shape lands in the app: an "External agents (ACP)"
  panel listing the protocol, the curated toolset, and the guest-worker
  settings; an HTTP-endpoint external agent (Batch 6 E15 session API)
  can ALREADY run as a guest worker in the web app. The panel states
  plainly: "Local ACP servers (stdio) need the desktop app."
- The editor can also supply its OWN MCP servers per session (the H5.5
  trust rules apply — a guest agent's MCPs start untrusted).

### §14. Real browser agent (CDP) + headed watch mode
- DESKTOP (Stage 6, Electron already ships Chromium) — a real-browser
  agent panel: the agent drives a REAL Chromium over CDP through the
  built app — click/type/scroll/screenshot, one browser per agent
  session, screenshots shown to the user, dialogs handled, private
  URLs (localhost) use a local sidecar so a cloud browser never sees
  them. Headed watch mode opens a VISIBLE window so he can watch the
  agent click through his app live — this is the recording the sandbox
  spec demands.
- The agent batches a whole sub-procedure into one call (navigate, wait,
  extract, click, type, screenshot) through the SAME step language
  Batch 5 D6 defined — one step language, two drivers (web preview now,
  real Chromium at Stage 6).
- WEB NOW — the panel + step language + recording shape land now; test
  steps run in the preview iframe (Stage 5) and the panel labels them
  "preview test — real-browser runs need the desktop app". Never claim
  an iframe test is a real-browser test.

### §15. Computer Use — GENERAL-PURPOSE (his 14:00 + 14:12 orders)
- His words, the scope: the agent must drive ANY installed desktop app
  and do ANY task in it — NOT testing-only, NOT only the named apps.
  Roblox Studio, Free Fire Craftland Studio, PUBG Studio were ONLY
  examples; scope = ALL app types (games, design, office, browser,
  anything). Two uses, same mechanics: (a) the BUILD agent uses
  third-party apps to create things in them (open the app, click menus,
  type, drag, build, watch the screen, verify); (b) the TEST agent
  drives the built desktop app.
- Mechanics (desktop, Stage 6): the agent reads the accessibility tree
  and posts synthesized input WITHOUT moving the real cursor, switching
  desktops, or stealing focus. Permission modes: standard (normal
  approvals), BOUNDED (a capability manifest the user reviews ONCE —
  allowed apps/origins/tools, everything else fails closed — this is
  the default), unrestricted (YOLO, explicit acceptance only). A tinted
  overlay cursor shows where the agent is acting, visible in the
  recording. A `doctor`-style check explains in plain words why the
  agent cannot click something ("why can't the test click this button?").
- WEB NOW — the manifest + task shape land now: a "Computer Use" panel
  where the user approves the bounded manifest (which apps the agent
  may touch, added one by one, each with its allowed actions), a task
  form ("use <app> to <do this>"), and the recording shape. The panel
  states plainly: "Computer Use drives real apps from the desktop app
  (Stage 6) — the web app cannot see or click other apps." Never fake
  a desktop run.

### §16. Terminal backends + background process manager
- Backend switcher (desktop, Stage 6): the agent's terminal runs in a
  switchable backend — local / Docker container (one persistent
  container per session, files + installed packages survive across
  turns) / SSH remote (recommended for safety) / cloud microVMs
  (Modal / Daytona / Vercel Sandbox, snapshot-backed) — chosen per
  project in Settings, with the sandbox as the default. Container
  backends run hardened (read-only rootfs, dropped capabilities, PID
  limits).
- WEB NOW — the Settings picker + the process panel land now: a process
  panel showing running builds/servers with LIVE logs, stop button,
  restart; background processes are first-class (start / list / poll /
  wait / log / kill / send input, PTY mode for interactive tools).
  Signal deaths are explained in PLAIN WORDS ("the dev server was
  killed — the machine ran out of memory") instead of bare exit codes
  ("exit 137").
- The web app's processes run in the cloud/host sandbox from the sandbox
  spec; the panel labels the backend in use. Docker/SSH backends are
  selectable in Settings but show "needs the desktop app" until Stage 6.

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
  second graph/index/queue/store/scheduler/session-log/API/test language.
  §13 is an adapter on the E15 session API. §14/§15 use the D6 step
  language. §6 branches carry their own checkpoint history inside the cap.
- Safe Mode (H2.3) still gates everything dangerous: §15 defaults to
  the BOUNDED manifest (fail closed); §13 guest agents get the curated
  toolset only; §8 never breaks a write; §6 never auto-deletes unmerged
  work.
- Honesty is a feature: every desktop-only capability is labelled as
  such in the UI. Never claim the web app drives real apps, real
  browsers, real git worktrees, or real language servers.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5 D6
  step language (extend it, do not replace it).

## Tests (required, same pattern as every batch)

- New suite `test-h4-desktop-power.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each §6/§8/§13/§14/§15/§16 with at least 2 assertions on REAL
  behaviour: a project branch duplicates files + Brain + checkpoints,
  merges through diff review, and an unmerged branch archives instead
  of deleting; the post-edit check reports only NEW diagnostics and a
  checker failure never blocks the write; the ACP panel lists the
  protocol + curated toolset and an HTTP guest worker runs through the
  session API; a browser test step runs through the D6 step language
  and is labelled preview (never claimed as real-browser); the Computer
  Use manifest approves apps one by one, defaults to bounded/fail-closed,
  and the panel states the desktop requirement; the process panel lists
  a running process with live logs, stops/restarts it, and explains a
  signal death in plain words.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per section: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
