# Batch 14 — scheduler + MCP + onboarding (sweep #2)

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Source: `~/workspace/devforge/research-sweep-2026-10-27-agents.md` §2 (Goose),
§24 (Kimi), §13 (Cortex), §32 (VTCode), §19 (Factory), §11 (Auggie),
§20 (FastAgent), §30 (Poolside), §21 (Grok), §23 (Kimchi), §25 (MiniMax),
§9 (Devin CLI), §26 (Minion), §17 (DimCode).

Already built that you must EXTEND, never rebuild:
- Batch 6 E5 Automations + H5.1 scheduled tasks + 8b G17 background agents
  on repo events — N1/N2 are the SCHEDULED-TASKS feature on the SAME
  automations engine, never a second scheduler. One scheduler, three
  triggers (cron, repo event, autopilot check).
- MCP manager + H5.5 MCP trust rules + Batch 9's MCP servers — N4/N5/N6/N7/
  N8/N9/N10 all extend the ONE MCP manager; every new MCP starts UNTRUSTED,
  no exceptions. The MCP ~40-tools-per-config design rule (8b) still holds.
- Plugin catalog + 8a F11 agent hooks + Skills library + prompt library
  (B4) + 8a F7 custom modes — N10/N11 extend them, never a second catalog.
- Batch 5 D7 multi-repo tasks — N14 extends it. 8b G15 process watcher —
  N15/N16 extend it. 8a F7 custom modes — N17 extends them.
- Batch 9's integrations hub stage — N4/N9 are MCP-side, the hub stays the
  integrations surface.
- Safe Mode (H2.3): N1 needs his say-so on what a scheduled agent may
  touch — scheduled jobs run at the project's Safe Mode rung and NEVER
  above it; N2's autopilot never acts on a failure outside its approved
  scope; N5's OAuth flow never stores a token outside the existing
  local-only token store, masked.
- Honest scope: N1's cron runs in the desktop app (Stage 6) or through the
  relay when the app is closed — in the web app, build the schedule UI +
  task store + manual tick; the always-on runner is marked desktop/relay.

## Scope — build all 17, one at a time, slice by slice

### N1. Scheduled tasks (Goose, Kimi, Cortex, VTCode)
- ONE scheduled-tasks feature on the automations engine: the agent can
  run tasks on a schedule (create/list/delete as tools the agent itself
  can use, and from the Automations panel). E.g. "every morning, check the
  repo and open a fix PR".
- Behaviours, copied as mechanism: JITTER is on by default (avoids
  thundering-herd on the hour); NO-STALE skips missed runs rather than
  running a backlog; MANUAL TICK allows hand-triggering any scheduled task.
  Each task shows its last run + result. A scheduled run executes as the
  user's identity, in an inspectable thread, and lands its result in the
  task inbox (Batch 5 D10).
- Runs at the project's Safe Mode rung, never above it. PERMISSION TIERS
  (HIS DECISION 2026-10-29 ~13:44 +06 — all three tiers exist, picked
  PER AGENT at creation time, enforced not just displayed):
  Tier 1 READ-ONLY — the agent only reads and reports; it can never
  modify, delete, send, or publish anything. Tier 2 LOCAL-MODIFY — the
  agent may modify project files, but can NEVER send, publish, share,
  deploy, or open PRs. Tier 3 FULL — the agent may do everything,
  including send/publish. The UI states each scheduled agent's tier
  plainly, a scheduled agent cannot be created without a tier HE
  picked, it can never act above its tier, and tier changes are his
  explicit action only (logged).

### N2. Autopilot check-then-act loop + living ops doc (Stakpak)
- An autopilot that CHECKS first and only acts on failure: `init`
  discovers the project's stack and writes a living ops doc
  (`APPS.md` in the project, kept updated); `up` runs the loop on a
  schedule (N1's scheduler); each check is a tri-state script — 0 = passed,
  do nothing; 1 = skipped; 2+ / timeout = failed, wake the agent with a
  fully-specified prompt (exact next tool call + verify command + context,
  the Batch 12 L2 nudge shape).
- Run history is kept (SQLite at Stage 6, the session store in the web
  app) and shown per check. The autopilot never acts outside its approved
  scope — a failure it can't fix files a needs-help task instead of
  improvising.

### N3. Agent Readiness score (Factory)
- A new Project Doctor check: a readiness score 1–5 over 100+ signals
  (tests, CI, docs, lint/typecheck, branch protection, env templates,
  structured logs, …), with a prioritized fix list. Most repos start at
  Level 2; the score is stored in the Brain and tracked over time.
- The report is plain language for a non-coder ("what to fix first, and
  why"), with a one-tap "fix this" per item that files a fix task.

### N4. MCP Apps (Goose)
- An MCP server can serve interactive UI, rendered in a SANDBOXED iframe
  with a strict CSP, talking back over postMessage. The MCP page shows
  which servers offer a UI; opening one shows it in a panel, isolated
  from the app.
- An MCP App can never read the app's state or call tools except through
  the postMessage bridge, and it starts UNTRUSTED like every MCP.

### N5. Conversational MCP setup (Kimi)
- "Add MCP by chatting": the user names the server (or pastes a URL), the
  agent probes it, handles OAuth if needed, and saves it — no raw JSON
  editing. The Tool Recommender's one-click Install is an entry point to
  this flow.
- The flow validates the server (probe) BEFORE saving; a failed probe is
  reported plainly with the probe error. OAuth tokens go to the existing
  local-only token store, masked. The MCP status panel surfaces MCP health
  per server.

### N6. Runtime MCP attach (fast-agent)
- Attach an MCP server at runtime over stdio / streamable HTTP with OAuth,
  NO restart. The MCP page gains "attach" (add + probe + enable in one
  step) and the new server is usable by the agent in the very next turn.
- Attaching never restarts the session and never drops the conversation.

### N7. MCP Elicitation (fast-agent)
- When a connected MCP server elicits — pauses the run and asks the user
  a typed question — surface a STRUCTURED FORM in chat (not free text);
  the user answers once and the run resumes. Distinct from the agent
  deciding to ask: the SERVER asked.
- Elicitation requests are logged as session events with the server's name,
  so a chatty server is visible.

### N8. Extension malware check + tool-inspection pipeline (Goose)
- Before install, an MCP/plugin is SCANNED: what its tools claim vs what
  they do (tool definitions inspected), plus a malware check on its
  installable content. A failed scan blocks the install with a plain
  reason; a suspicious-but-not-failed scan installs as UNTRUSTED with the
  suspicion stated on the card.
- Extends H5.5 trust: the scan is a pre-install step, not a replacement
  for trust levels.

### N9. Brain graph as MCP server (Auggie)
- Expose the Brain code graph AS an MCP server, so other tools (and the
  user's other agents) can query it: tools for symbol lookup, references,
  file outline — the same five operations as Batch 10 J2, served over MCP.
- The server is off by default; enabling it is one toggle on the Brain
  panel, and it serves read-only (never writes to the graph).

### N10. Plugin-pack format + lifecycle hooks + error isolation (Auggie, DimCode)
- A plugin-pack format: `plugin.json` manifest, `commands/` + `agents/` +
  `hooks/hooks.json` with lifecycle hooks (SessionStart / SessionStop /
  Notification / PreToolUse / PostToolUse, shell-script hooks), auto-update
  check, per-project recommended marketplaces.
- Error isolation, one manifest per plugin: a crashing plugin is isolated
  and doesn't take the agent down — each MCP server/skill load is wrapped
  in its own error boundary with per-plugin enable/disable. A crashed
  plugin is shown as crashed (with its error) in the catalog, never
  silently missing.

### N11. File-based custom slash commands with per-command model pin (Auggie)
- Slash commands as files (`.devforge/commands/<name>.md`) with
  `$ARGUMENTS` substitution, EACH with its own pinned model. The prompt
  library (B4) lists them; typing `/name` runs the file's prompt with its
  pinned model.
- A command file and a library entry are the same thing — editing one
  edits the other.

### N12. ACP server + client (Poolside)
- FlamingoCode can DRIVE remote ACP engines over streamable HTTP + header
  auth (capability negotiated; the host owns UX/permissions/hooks, the
  engine is a replaceable endpoint) AND can itself be driven as an ACP
  engine.
- Extends the BYO-engine panel (Devin Desktop §6) + Engines view (8b G21).
  A remote engine that fails its capability negotiation is shown as
  unavailable, never silently half-working.

### N13. Import existing Claude Code / OpenCode setup + skill auto-discovery (Grok, Kimchi, MiniMax)
- Onboarding: a "Bring your existing setup" import that reads a user's
  Claude Code / OpenCode configs (CLAUDE.md, `.claude/rules`, skills,
  plugins, agents, hooks, MCP servers, AGENTS.md) into FlamingoCode's
  Skills library + MCP manager — no rewrite needed. Zero setup for the
  non-coder user.
- Skill auto-discovery: at onboarding, scan the other tools' skill dirs
  (e.g. `~/.claude/skills/`) and offer each found skill for import.
  Imported MCPs start UNTRUSTED (H5.5). The import shows exactly what was
  found and what was skipped, before anything is installed.

### N14. Multi-directory workspace (Devin CLI)
- Several directories in one workspace (`/add-dir`, multi-root): the
  project picker can hold multiple roots; the Brain, code graph, and file
  tree cover all of them; the agent is told which root each file belongs
  to. Extends multi-repo tasks (Batch 5 D7).
- A workspace shows its roots and lets the user remove one (which never
  deletes files, only unlinks the root).

### N15. Background shell commands with later polling (Devin CLI)
- A command that exceeds its wait-timeout goes to BACKGROUND with an ID
  instead of blocking the turn; later turns poll it. The process watcher
  (8b G15) shows it as running with its ID; the agent can ask for its
  output in a later turn.
- A background command that finishes while the user is away files its
  result in the task inbox, like any background agent.

### N16. Persistent background-task ledger (Minion)
- A durable ledger of background tasks (JSON records: id, command,
  started, status, output path) with list / status / output / cancel
  tools. Tasks auto-background after 180s. The ledger survives restarts —
  a task started before a crash is shown as "unknown — check" on reopen,
  never as silently done.
- Extends the process watcher (8b G15): the watcher reads the ledger.

### N17. Mode switch that preserves history (Minion)
- Switching modes (8a F7 custom modes) keeps the conversation: the agent
  is rebuilt from the new mode's spec and the history / log / metadata
  carry across. The switch is logged as a session event with the old and
  new mode named.
- A mode switch never re-runs a completed step and never drops a
  checkpoint (same guarantee as the mid-task model switch, 8b G16).

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
  second graph/index/queue/store/scheduler/session-log/API/router. N1/N2
  use the ONE automations engine. N4–N10 extend the ONE MCP manager. N9
  serves the ONE code graph. N1's always-on runner is desktop/relay —
  the web app builds the schedule UI + task store + manual tick, honestly
  marked.
- Safe Mode (H2.3) still gates everything dangerous: N1 runs at the
  project's rung, never above; N2 never acts outside its approved scope;
  N5 stores OAuth tokens local-only, masked; N13 imports MCPs UNTRUSTED;
  N4's iframe can never read app state.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner.

## Tests (required, same pattern as every batch)

- New suite `test-batch-14.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each N1–N17 with at least 2 assertions on REAL behaviour:
  a scheduled task runs on its schedule with jitter, skips a missed run
  (no backlog), and can be hand-triggered, with its result in the inbox;
  an autopilot check that passes does nothing, one that fails wakes the
  agent with a specified prompt, and one it can't fix files needs-help; a
  readiness report scores 1–5 with a prioritized plain-language fix list
  stored in Brain; an MCP App renders in a sandboxed iframe and cannot
  read app state; a conversational MCP add probes before saving and a
  failed probe reports its error; a runtime-attached MCP is usable in the
  next turn without a restart; an elicitation surfaces a form and resumes
  the run after an answer; a failed malware scan blocks install and a
  suspicious one installs untrusted with the suspicion stated; the Brain
  graph serves its five operations over MCP, read-only; a crashing plugin
  is isolated and shown as crashed; a slash-command file runs with its
  pinned model; a remote ACP engine negotiates capabilities and an
  unavailable one is shown as such; an import lists exactly what was found
  and skipped, and imported MCPs start untrusted; a workspace holds
  several roots and removing one never deletes files; a long command goes
  to background with an ID and its result lands in the inbox; the ledger
  survives a simulated restart and marks an unknown task as unknown; a
  mode switch carries history and logs the switch.
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
