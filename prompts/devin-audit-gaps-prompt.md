# Devin Audit Gaps — the ~40 items the 2026-10-25 audit found missing

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies Devin's capabilities as IDEAS, implemented originally —
never Devin's name, logo, exact UI copy, proprietary code, or proprietary
models. Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

Source: the 2026-10-25 audit of devin.ai (front page, cloud, desktop,
security, plugins), docs.devin.ai, and Devin blogs, recorded in
`~/workspace/devforge/devin-complete-checklist.md` under "AUDIT GAPS".
His order (2026-10-25 ~22:32 +06): copy EVERY Devin feature, one by one,
even the smallest — nothing left out.

Already built / queued — DEDUPE, do not rebuild:
- Batch 5 D3 smart model routing — H5 adds only the Fusion CONTROLS, not
  a second router.
- Batch 5 D5 Security Swarm (Hunter + Fixer) — section C extends it, it
  does not re-implement scanning.
- Batch 6 E1 Devin Review — H13 extends it to GitLab/Bitbucket MRs.
- Batch 6 E2 Ask Devin — H12 adds the plan-to-session handoff.
- Batch 6 E4 Outposts (local execution mode) — H16 adds provider options
  + network policies.
- Batch 6 E5 Automations — A6 (auto-triage) and B-triggers use the SAME
  automations engine, never a second scheduler.
- Batch 6 E8 multimodal input (Figma files as task input) — B6 adds the
  Figma MCP PLUGIN, not a second input path.
- Batch 6 E12 CI/CD autotriage + E13 incident triage — A1 (Oncall) is the
  full incident-response PRODUCT around them, not a second triage.
- B4.2 Auto-docs + Batch 5 D1 architecture diagrams — H11 adds only the
  DeepWiki DETAILS (effort levels, config, freshness stamp).
- C1 one-click publish — B7 adds deployment MANAGEMENT + log reading, it
  does not re-implement publishing.
- H5.1 scheduled tasks + watch loops — H6 adds persistent background
  AGENTS, not a second scheduler.
- The app integrations hub (spec ready) — section B integrations are
  CATALOG ENTRIES for it, following its install-first rule.

## Scope — build sections A–D, one item at a time, slice by slice

### A) MAJOR — whole product areas

#### A1. Devin Oncall — incident-response product (not just triage)
- Alert Responders + Support/Bug Responders watch alert/bug streams
  24/7 (uses the E5 automations engine + the monitor, Batch 5 D9).
  Parent-child: a parent decides if an alert is new, spawns a child
  investigation, and SKIPS ~60% via known-issues matching + alert
  grouping (same alert text + same service within 1h = one incident).
- The responder joins the incident channel (task inbox thread), the
  child investigates in the background while answering questions, and
  maintains a LIVE incident document (updated as findings arrive).
- An async second "review" agent checks the conclusions before the
  incident is marked resolved. Per-Responder memory + per-org
  auto-generated debugging skills (the agent indexes the project's
  environment once and reuses it) + per-org memory from post-processed
  investigations. Simple mitigations offered with approval: rollback to
  the last green checkpoint, scale-up (restart the service).
- Every Oncall action is an event on the session timeline (Batch 8b G14).

#### A2. Memory & Dreaming — personal cross-project memory
- A personal Memory Drive, DISTINCT from the per-project Brain: a
  persistent store of markdown notes with a MEMORY.md index, browsable
  under Settings → Memory. Each session gets its own working copy;
  edits commit back, and a revision check REJECTS stale writes
  (conflicts are surfaced to the user, never silently overwritten).
- Dreaming: a daily async background session (uses the automations
  engine) that consolidates overlapping notes, removes transient
  details, finds lessons the user never captured, and deletes stale
  unused memories. Recent dreaming sessions are inspectable (what was
  merged, what was deleted, why).
- Dreaming never deletes a memory the user pinned, and every deletion is
  listed in the dreaming report with an Undo.

#### A3. Efficiency-based cost controls
- (a) Efficiency Score 0–100 per user (productive output per cost unit):
  grades Healthy / Satisfactory / Needs Improvement / Unknown, shown in
  My Analytics + merged PRs/day, cost per merged PR, sessions with
  delivered outcomes, consumption by session size. All computed from the
  B2 usage meter + task outcomes — tokens/$ are our unit, never ACU.
- (b) Devin Coach: BEFORE a run starts, pre-run prompt feedback —
  vague request, expensive mode for a simple task, unrelated tasks in
  one session, non-work usage — with inline suggestions, required
  confirmation for the flagged ones, or no checks (user picks per
  project). Coach analytics: how often each flag fired.
- (c) Efficiency-based approvals: limits auto-raise for efficient users
  up to a ceiling the user sets; above-ceiling requests go to a review
  dialog (reason + efficiency + model-mix + consumption shown) with
  "Request additional usage". All ceilings are user-set, never imposed.

#### A4. Plugin Marketplace — 150+ one-click plugins
- A Marketplace tab (extends the Plugin Catalog): one-click install of
  tools + skills + context as a bundle. Install scopes: Personal /
  Organization (shared with the team) / Enterprise — in our app,
  Personal = this project, Organization = all my projects.
- Named plugins as catalog entries (each: install, tools it adds,
  OAuth connect where needed — shared-vs-individual OAuth choice shown
  on the card): Supabase, MongoDB Atlas, Snowflake, PostHog, HubSpot,
  LaunchDarkly, Grafana, Neon, Postman, Pinecone, Canva, Intercom,
  PlanetScale, CircleCI, Redis, Miro, Hugging Face, Amplitude, Asana,
  Zapier, Cloudflare Docs. (The MCP ones live in Batch 9 T1 — link to
  them, do not duplicate.)
- Every marketplace plugin starts UNTRUSTED (H5.5 rule) and shows its
  tool list before install. Never auto-install.

#### A5. Secrets Manager — named secrets vault
- A Secrets page: named secrets (API keys + credentials) stored per
  project so the agent can use them during sessions and in CLI/custom
  workflows. A secret is referenced by NAME in prompts ("use the
  {{stripe-key}} secret") — the VALUE is never shown in chat, never
  written into the Brain, never exported by A3 backup (export lists
  secret NAMES only, with a "re-enter values on import" note).
- Add / rotate / delete a secret; rotation keeps the old value usable
  until the new one is confirmed working. The vault is localStorage +
  project-scoped, same storage family as provider keys.

#### A6. Auto-triage as a first-class automation
- A "Triage Bug Reports" template: one click watches a channel (Slack
  via the Batch 6 E19 integration, or the task inbox feed). A persistent
  parent monitor agent with a SHARED SCRATCHPAD (routing table:
  code-area → owner, duplicate records, context that survives restarts —
  stored as a Brain note, `.devforge/triage-scratchpad.md`).
- Per-automation setup prompt (plain-language behaviour customization:
  "only triage bugs tagged payments, ignore feature requests") and
  per-automation NETWORK POLICY (restrict outbound access — security
  against untrusted channel input: the triage agent may read the repo
  and the channel, nothing else, until a human approves) and
  per-automation RESOURCE LIMITS (cost/invocation caps; each child
  investigation counts as a session in the usage meter).

#### A7. CVE remediation plugin workflow
- Cross-repo runtime inventory (READ-ONLY): Dockerfiles/base images,
  distro packages, CI setup-php/setup-node/.nvmrc, Helm, Terraform,
  Lambda runtimes, Ansible/Chef/Puppet — inventoried from the code
  graph + file scan, listed per repo with versions.
- Approval gate BEFORE patching. A patch moves a dependency to a
  VERIFIED fixed version (tag/digest/package version/checksum confirmed
  against the official registry/advisory — the confirmation is shown on
  the patch card, never assumed). Tests run BEFORE and AFTER inside the
  new production image (with a runtime comparison: old vs new).
- One PR per repo with: before/after versions, test results, runtime
  differences, risk label, rollout + rollback plan. The PR is generated
  as a coordinated-PR summary (Batch 5 D7 shape) — pushing is the user's
  explicit action.

#### A8. Pylon integration
- Support tickets trigger investigations natively: a Pylon ticket (via
  the integrations hub card, same install-first rule) creates an inbox
  item; the agent investigates (logs, repro, root cause, PR) and updates
  sync BOTH ways (ticket status ↔ session status). Customer follow-ups
  flow INTO the linked session as messages; an engineer can take over
  the linked session from the ticket.
- Support can also run codebase search, generate screenshots/video demos,
  and scope small features — all from the ticket view, all logged on the
  session timeline.

### B) MEDIUM — named integrations (catalog entries for the hub)
Each is an integration card (install-first rule): connect, test, disconnect,
plus its agent capability. Do not duplicate Batch 9 T1 MCP entries — link
to them where the same service appears there.
- B1 Sentry — pull stack traces, triage issues (also an auto-triage MCP
  source for A6).
- B2 Datadog — query logs, traces, monitors (also an auto-triage MCP source).
- B3 PagerDuty — incidents as automation triggers; incident management
  (feeds A1 Oncall).
- B4 Snyk — Snyk alerts as automation triggers; remediate Snyk-flagged
  vulnerabilities (feeds A7).
- B5 Notion / Confluence — agent context from pages/databases, docs
  (read into the Brain digest, inside the cap).
- B6 Figma — designs, components, styles as agent context (MCP plugin;
  Batch 6 E8 already takes Figma files as task input — this is the
  persistent connection, not a second input).
- B7 Vercel — manage deployments, read deployment logs (extends C1:
  publish hands off a ZIP today; this adds list/redeploy/logs).
- B8 Stripe as an agent tool — manage customers + subscriptions
  (DIFFERENT from the hub's Stripe-as-payment-option; this one is read +
  manage with approval, never auto-charge).
- B9 Databases as agent tools — PostgreSQL, MySQL, MongoDB (+ Atlas,
  Snowflake, Neon, PlanetScale, Redis plugins): run read queries with
  approval, schema view from the code graph's data layer.

### C) SECURITY SWARM sub-features (extend Batch 5 D5)
- C1 Runtime validation of findings: reproduce the exploit in an
  isolated sandbox (the sandbox spec) → verdict confirmed / false
  positive / inconclusive, shown on the finding.
- C2 Attack-chain composition: findings composed into full cross-file
  attack paths, each with severity + confidence.
- C3 Finding lifecycle + fix verification: the next scan checks whether
  a fix ACTUALLY resolved the finding; findings carry likely owners and
  priority.
- C4 Bring-your-own scanner: consume an existing SAST scanner's results
  via profile/API import, then validate/dedupe/compose/prioritize/
  remediate them through the same swarm pipeline.
- C5 Shareable scan report (optional, compiled by an agent) + threat-
  model-driven matcher creation (one agent builds a per-repo threat
  model → targeted searches from it).
- C6 Swarm targets beyond vulnerabilities: "proactively find novel
  vulnerabilities, performance issues, and gaps in test coverage" —
  the swarm gains a target picker (vulns / performance / coverage).

### D) SMALL — UI, settings, details
- H1 Command Center List view + filters — Board AND List views; filter
  by Status / Space / Pull request / Agent; Clear filters.
- H2 Subagent roll-up in a coordinator session — "Coordinating 8
  subagents", "8 subagents · 16 PRs", per-subagent status ("Waiting on
  2 subagents", "PR is approved") in the Team Mode view.
- H3 Persistent cloud dev environment — "Close your laptop, open
  another. Your environment is still running": the running cloud env
  (server, files) reattaches from any machine. In the web app: the env
  state (open files, running dev server, branch) persists and reattaches
  on reload/another device via the relay; the real always-on server
  ships with the cloud stage — the state + reattach land now.
- H4 Parallel test matrix — the same suite across multiple versions /
  platforms in parallel ("Tests: 4 Python versions in parallel"),
  results as one matrix grid.
- H5 Fusion routing controls — Lead model, Sidekick model, Effort level,
  Fast mode toggle (controls only; model names are proprietary and are
  NOT copied — the user picks from THEIR configured models).
- H6 Custom background agents — long-lived background agents on the
  machine sharing context with the user (extends H5.1 watch loops:
  a background agent keeps running between tasks, with its own memory
  note, and can be asked anything about what it watched).
- H7 Format-on-save + named language servers — Prettier "format code on
  save" toggle + named servers (rust-analyzer, clangd, pyright, gopls)
  listed in Settings → Languages with enable/disable.
- H8 Editor plugins for other IDEs — FlamingoCode-as-plugin inside VS
  Code / JetBrains (IntelliJ, PyCharm, WebStorm…): the app generates
  the plugin manifest + install instructions per IDE (the plugin itself
  ships at Stage 6; the manifest + docs land now, honestly labelled).
- H9 Desktop auto-update (OTA) — over-the-air update, settings /
  extensions / work carried over (Stage 6 mechanism; the web app shows
  the update channel setting + "Check for updates" that reports the
  installed vs latest version honestly).
- H10 Screen-reader / accessibility support — "Screen Reader Optimized"
  toggle in the status bar: ARIA labels on the main panels, keyboard
  navigation for the chat + task board, focus visible.
- H11 In-app feedback/support entry — Help (?) icon → Contact support
  (opens a feedback form that saves to a Brain note + offers to send it);
  Slack Connect for Teams (via the Batch 6 E19 Slack integration).
- H12 DeepWiki details — effort levels Low (free) / Medium / High
  configurable per org and per repo; wiki config file
  (`.devin/wiki.json` shape, ours: `.devforge/wiki.json`); "Last
  indexed" freshness stamp (wiki re-derived from the live tree — the
  stamp shows when, and a Re-index button). (The full DeepWiki layout /
  navigation / diagrams experience comes via REA at the Devin Desktop
  stage, per his order — this item is only the details.)
- H13 Ask Devin plan-to-session handoff + inline session status — Ask
  Devin (Batch 6 E2) generates a context-rich prompt from the Q&A
  "ready to hand off to an Agent session" (one-click "Start session
  with this"), and the session's status shows directly inside the Ask
  Devin conversation.
- H14 Devin Review for GitLab merge requests (and Bitbucket) —
  intelligent diffs, inline comments, AI chat on MRs, not just GitHub
  PRs (extends Batch 6 E1).
- H15 Handoff to an external agent — send a task OUT to a Claude
  Code/Codex-style session (ACP covers running other agents INSIDE;
  this is the outbound handoff: export the task as an ACP envelope +
  instructions, ready to paste/run elsewhere).
- H16 Screen recording attached to the fix PR — a fix PR (Batch 5 D7
  coordinated-PR summary) carries its test-session recording (Batch 6
  E16) as an attachment link.
- H17 Outposts provider options + network policies — Outposts on Vercel
  Sandbox, Daytona, E2B, Cloudflare, Modal, NVIDIA Brev, NVIDIA
  OpenShell (provider picker, honest: the provider runs at Stage 6,
  the picker + per-provider config land now); network policies via
  sandbox firewall rules (allow-list per Outpost); session state via
  sandbox snapshots (extends Batch 6 E6).
- H18 Customize hub — ONE Customize area holding Memory, Plugins, MCPs
  (and Skills): the pieces exist separately in Settings/Stage 4 today;
  this unifies them into one navigable hub (no duplicate settings —
  the hub LINKS to the existing pages).

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
- Respect the caps: Brain digest ~1500 tokens (Memory Drive is separate
  storage, but what enters a session's context still lives INSIDE the
  cap), checkpoints cap 30, no second graph/index/queue/store/scheduler/
  session-log. A6 uses the E5 engine; H18 LINKS, it does not duplicate.
- Safe Mode (H2.3) still gates everything dangerous: A7 never patches
  without approval; A5 secret values never appear in chat/Brain/export;
  A6's triage agent is network-restricted until a human approves; B8
  never auto-charges.
- Never copy proprietary model names, Devin's name/logo/exact UI copy,
  or proprietary code. Reference-only sources (memory standard, vuln
  plugin repo) are studied, never copied.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 5
  Security Swarm scanner (section C only extends it).

## Tests (required, same pattern as every batch)

- New suite `test-devin-audit-gaps.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each item with at least 2 assertions on REAL behaviour:
  Oncall groups duplicate alerts, spawns a child, keeps a live incident
  doc, and a review agent checks conclusions; Memory Drive rejects a
  stale write with a surfaced conflict, and Dreaming's report lists a
  deletion with Undo (pinned memories never deleted); the Efficiency
  Score grades from real usage data, Coach flags a vague prompt before
  the run, and an above-ceiling request opens the review dialog; a
  marketplace plugin installs with its tools listed and starts
  untrusted; a secret is referenced by name, its value never appears in
  chat/Brain/export, and rotation keeps the old value until the new one
  works; the triage template watches a channel with a shared scratchpad
  and a network policy; the CVE flow inventories runtimes read-only,
  gates patching on approval, and produces a one-PR-per-repo summary
  with rollback plan; a Pylon ticket creates an inbox item and updates
  sync both ways; every B1–B9 card connects/tests/disconnects and its
  capability works (Sentry pulls a trace, Vercel lists a deployment,
  Stripe never auto-charges); swarm runtime validation returns a
  verdict, attack chains compose with severity + confidence, the next
  scan verifies a fix, a BYO scanner result imports and dedupes, and
  the target picker switches to performance/coverage; List view +
  filters work, the subagent roll-up counts live subagents, the cloud
  env reattaches its state, the test matrix runs one suite across
  versions, Fusion controls pick Lead/Sidekick from the user's models,
  a background agent keeps its memory note between tasks, format-on-
  save + named servers toggle, the IDE plugin manifest generates, the
  update check reports installed vs latest honestly, screen-reader
  mode adds ARIA labels + keyboard nav, the Help entry saves feedback
  to a Brain note, wiki effort levels + config + Last indexed stamp
  work, Ask Devin hands its Q&A off to a session with status inline,
  Review works on a GitLab MR, an outbound ACP envelope exports, a fix
  PR carries its recording, Outposts pick a provider with firewall
  rules + snapshots, and the Customize hub links Memory/Plugins/MCPs/
  Skills without duplicating them.
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
