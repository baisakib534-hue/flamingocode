# App Integrations Hub — apps you connect to your project

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch builds FlamingoCode's app integrations hub, like Codex, Claude
Code and Devin have — apps you connect to your project. Capabilities as
IDEAS, implemented originally — never their name, logo, exact UI copy,
proprietary code, or proprietary models. Everything ships as FlamingoCode,
with his providers + DuckDuckGo free.

Full spec: `~/workspace/devforge/app-integrations-spec.md`. The hub builds
with the ecosystem stage (after Stage 4's plugin/MCP/skill system — it
extends it) and with Batch 9 (sweep tools). Payment integrations are part
of the same hub, not a separate product.

Already built that you must EXTEND, never rebuild:
- Stage 4 ecosystem (plugins / MCP / skills) — the hub is a CATALOG on
  top of it, not a second plugin system.
- H5.5 MCP hardening (per-server trust, tool picker, call/spend limits,
  credential scrub) — every hub app that exposes tools follows the SAME
  trust rules: installed apps start UNTRUSTED where they touch tools.
- Batch 9 T1 MCP catalog + T2 skill packs — hub apps that are MCPs or
  packs LINK to those catalog entries, never duplicate them.
- Batch 6 E19 integrations (Linear, Jira, Slack, GitLab, Bitbucket) +
  Audit Gaps B1–B9 (Sentry, Datadog, PagerDuty, Snyk, Notion/Confluence,
  Figma, Vercel, Stripe-as-tool, databases) — those are INTEGRATION
  CARDS that live IN this hub; this batch builds the HUB ITSELF + the
  pre-installed catalog, not their cards again.
- Batch 8b G20 MCP Builder — rule 3's custom integration BUILDS through
  it where the app needs an MCP; where it needs a plain connector, the
  hub builds it from the app's public API.
- Batch 5 D3 smart model routing + per-model rate limits — hub apps
  never pick models; routing stays where it is.

## Scope — build the hub + catalog + rules, one at a time, slice by slice

### 1. The hub (Integrations panel)
- An "Integrations" panel in the app: browse the catalog → Install →
  then Integrate into the current project (one click each). Installed
  integrations show their status (installed / integrated / active) and
  which project uses them.
- Search + filter the catalog (by kind: AI / payments / free / tools,
  and by name). Each card shows: name, one-line Bengali description,
  kind, free/paid badge, install state, and — once installed — its
  Integrate button + status.
- A project shows its integrated apps in the project header (icons +
  count), with a quick disconnect per app.

### 2. Rule 1 — Install first, integrate after (enforced, not suggested)
- The Integrate button is DISABLED until the app is installed, with the
  reason shown ("আগে Install করো"). No integration without install —
  enforced in the code path, not just the UI: `integrateApp()` refuses
  an uninstalled app.
- Uninstalling an app that is integrated into a project first asks
  (lists the projects using it) and, on confirm, removes the
  integration from those projects and logs it.

### 3. Rule 2 — Use only when he says so (never auto-fire)
- Integrations attach to his project and sit READY — the AI uses one
  ONLY when he explicitly tells it to ("আমি বললে use করে"). The agent
  never calls an integrated app on its own initiative.
- A per-project "Allowed apps" list: an integrated app is usable only
  if the user has said so for that task — the chat shows a small "Use:
  <app>" picker when an integrated app could help, and the agent uses
  it only after the user picks it (or types "use <app>").
- PAYMENT integrations NEVER auto-fire, in any mode, under any
  permission setting — a payment action always opens an explicit
  confirmation with the amount, the payee, and the app, and waits.

### 4. Rule 3 — Custom option (tell the AI, it builds it)
- He can just TELL the AI: "build me an integration for X app" → the
  AI builds the connector (from the app's public API/MCP — via the
  Batch 8b G20 MCP Builder where an MCP fits) → it appears in the
  catalog → Install → Integrate. Built integrations stay in HIS
  catalog (marked "built by FlamingoCode", with the prompt that made
  them, editable).
- A built integration is a plain, readable connector file in
  `.devforge/integrations/<name>/` (manifest + code, no dependencies)
  so the user can read it before installing it.

### 5. Pre-installed catalog
- **AI apps, pre-installed:** GPT (ChatGPT/OpenAI), Claude, Devin —
  as integration cards (connect with the user's own key/account,
  stored per project — the hub never ships with a key).
- **Many free apps** in the catalog alongside them (free-first catalog
  — the free ones are the default shelf, shown first).
- **Payment integrations, pre-installed:** PayPal, Stripe, NOWPayments,
  and similar — so his projects can take payments (same NOWPayments
  rail as his marketplace plan). Each payment card shows its setup
  state and a "test" action that runs a $0 verification (never a real
  charge).
- Every catalog entry links to its MCP/skill-pack entry where one
  exists (Batch 9) instead of duplicating it.

### 6. Keys & secrets (project config, never the hub)
- Keys/secrets for an integration live in the PROJECT's own config
  (his keys, his project) — the hub never activates a payment
  integration on its own, and the hub never stores a key in the repo
  or in the catalog entry.
- A key's presence is shown (set / not set), never its value. The A3
  full backup export lists integration NAMES + settings, never key
  values (same rule as the Audit Gaps Secrets Manager).

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
  second graph/index/queue/store/scheduler/session-log/plugin system.
  The hub is a CATALOG over Stage 4 + Batch 9, not a new system.
- Safe Mode (H2.3) still gates everything dangerous: payments always
  confirm; a custom-built integration starts UNTRUSTED; an integrated
  app's tools follow the H5.5 trust + tool picker + spend limits.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 6 E19
  / Audit Gaps B-cards (this batch builds the hub they live in).

## Tests (required, same pattern as every batch)

- New suite `test-app-integrations.js` in the repo root, following the
  established NO-JSDOM extraction-and-eval pattern: read index.html,
  extract the <script> body, eval it in a minimal DOM stub (document /
  localStorage / window stubs as the existing suites do). NO package.json,
  NO node_modules, never require jsdom or any npm package.
- Cover each §1–§6 with at least 2 assertions on REAL behaviour:
  the catalog lists apps with kind + free/paid + install state, and
  search/filter works; Integrate is disabled before Install and
  `integrateApp()` refuses an uninstalled app; uninstalling an
  integrated app lists its projects and removes the integration on
  confirm; the agent never calls an integrated app unasked, and the
  "Use: <app>" picker gates it; a payment action always opens a
  confirmation with amount + payee and never fires without it, in any
  mode; a custom integration builds from a prompt into a readable
  connector file in `.devforge/integrations/`, appears in his catalog,
  and installs/integrates like any other; the pre-installed catalog
  contains GPT, Claude, Devin, the free shelf first, and PayPal/Stripe/
  NOWPayments with a $0 test (never a real charge); a key's presence
  shows as set/not-set with its value never exposed, and the backup
  export carries names only.
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
