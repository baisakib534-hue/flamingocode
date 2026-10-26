# Batch 9 — sweep tools: MCP servers, skill packs, CLI tools, built-in tools

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies other agents' capabilities as IDEAS, implemented originally —
never their name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.

This batch is the TOOLS batch: it makes tools INSTALLABLE and USABLE inside
FlamingoCode. It builds with the integrations hub stage. It does NOT build
new agent features — it wires tools into the systems that already exist
(MCP manager + H5.5 trust, Skills page, tool catalog, lazy loading B4.7).

Already built / queued — DEDUPE, do not rebuild:
- Serena + Sverklo MCPs — Batch 7.7 (queued). Do NOT list them again.
- Superpowers pack — Batch 7.3. Spec Kit flow — Batch 7.6. ECC layer —
  Batch 8b G21. Security-audit skill — Batch 8b G22. Android skills —
  Batch 8b G23. MCP Builder — Batch 8b G20 (builds NEW MCPs; this batch
  only CATALOGS existing ones).
- Context7 + Playwright MCPs — already installed on the builder, and the
  app already lists them. GitHub MCP — already in the catalog; this batch
  only adds the UPGRADE (token + toolsets, see T1).
- H5.5 MCP hardening (per-server trust, tool picker, call/spend limits,
  credential scrub, Reload) applies to EVERY server added here: every new
  catalog entry starts UNTRUSTED, shows its tools in the picker, and
  respects the call/spend limits. The MCP ~40-tools-per-config design rule
  (Batch 8b) is enforced as a warning on the MCP page.

## Scope — build all 4 groups, one at a time, slice by slice

### T1. MCP servers — catalog entries (installable, untrusted by default)
Add each of the following as an installable entry in the MCP catalog
(MCP page), with: name, one-line Bengali description, install command
(npx/uvx + package, pinned version where known), the tools it exposes
(listed, so the H5.5 tool picker can show them), and its trust default
(untrusted — user-added rule).
- jcodemunch (codebase chunking/indexing helper), GitNexus (multi-repo
  git intelligence), Chrome DevTools (browser debugging — pairs with the
  H4 real browser agent work), Supabase (database + auth), Sentry (error
  tracking — pairs with Batch 6 E13 incident triage), Figma (design files
  — pairs with Batch 6 E8 multimodal input), Firecrawl (web scraping —
  pairs with Batch 7.11 research mode), Linear (issue tracking — pairs
  with Batch 6 E19), PostgreSQL (database queries), Vercel (deployments —
  pairs with C1 publish), Cloudflare (workers + pages), Excalidraw
  (diagrams — pairs with Batch 5 D1 architecture diagrams), AWS (cloud
  resources), Notion (docs — pairs with the Brain), Zapier (automations —
  pairs with Batch 6 E5), monitoring MCPs (uptime/health checks — pairs
  with Batch 5 D9 post-deploy monitoring), memory MCPs (persistent memory
  servers — pairs with Brain v2, never a second memory store).
- GitHub MCP UPGRADE (not a second entry): the existing github entry gains
  a token field (optional personal access token, stored per project, never
  in the repo) + toolsets (repos / issues / PRs / actions — pick which
  toolsets are enabled, so the tool count stays under the ~40 rule).
- Every entry shows whether its package is VERIFIED present (a one-click
  "Check" that probes the install command's registry entry) vs "not
  checked yet" — never claim a server works until its probe passes.

### T2. Skill / plugin packs P1–P11 (installable from the Skills page)
Add each pack as an installable entry on the Skills page (same pattern as
the jcode packs): name, Bengali description, skills it contains, install
(one click, into the app's skill registry), uninstall.
- P1 Anthropic skills (the official skills collection shape — document
  creation, code review, and research skills as FlamingoCode-native
  equivalents, written originally).
- P2 knowledge-work plugins (note-taking, research synthesis, reading
  lists — pairs with Brain v2).
- P3 claude-plugins-official equivalents (the official plugin shapes,
  re-implemented as our own packs).
- P4 Superpowers — ALREADY Batch 7.3: this batch only adds the PACK
  ENTRY pointing at the built skills (no rebuild).
- P5 Spec Kit — ALREADY Batch 7.6: pack entry only (no rebuild).
- P6 ECC — ALREADY Batch 8b G21: pack entry only (no rebuild).
- P7 security-audit skill — ALREADY Batch 8b G22: pack entry only.
- P8 android skills — ALREADY Batch 8b G23: pack entry only.
- P9 cursor/plugins equivalents (editor-focused plugin shapes,
  re-implemented originally).
- P10 Goose catalog (Goose's recipe + extension catalog shapes, pointing
  at our Batch 7.5 Recipes + MCP catalog — no duplicate store).
- P11 Qoder scale benchmark (a benchmark pack: the model-benchmark tasks
  from Batch 8a F3, packaged as a runnable pack).
- Each pack entry shows its skill count + install state, and installed
  packs appear in the agent's skill catalog (lazy-loaded, B4.7).

### T3. CLI tools C1–C14 (available to the agent, declared + detected)
For each CLI tool, add a "CLI tools" section (Settings → Tools or the
agent's tool panel) that DECLARES the tool (what it does, which agent job
uses it) and DETECTS it (a "Check" button that runs `<tool> --version`
through the app's terminal path and reports found / missing / version).
The agent's tool catalog lists a CLI tool ONLY when it is detected;
undetected tools show as "not installed" with install instructions.
- C1 ast-grep (structural search), C2 ripgrep (fast search — the agent's
  codebase search uses it when present, falls back to the built-in search
  when absent), C3 tree-sitter (parsing — feeds the code graph indexer
  when present), C4 LSP servers (per-language: typescript, python, rust,
  go — pairs with H4 §8), C5 formatters/linters (ESLint/Prettier/Ruff/
  gofmt/rustfmt — the agent runs the project's own config, never invents
  one), C6 test runners (Vitest/Jest/pytest/go test — the agent runs the
  project's own test command), C7 Playwright/Puppeteer (browser tests —
  pairs with H4 §14), C8 gh CLI (GitHub from the terminal — pairs with
  Batch 8a F14), C9 git worktree (pairs with H4 §6), C10 Docker (pairs
  with the sandbox spec), C11 difftastic/delta (diff display), C12 tmux
  (terminal sessions), C13 jq/yq (JSON/YAML queries), C14 debuggers
  (node --inspect, python -m pdb — the agent can attach, never auto-run
  on user code without approval).
- Honest scope: the web app DECLARES + DETECTS; real execution of these
  tools happens through the terminal path that exists today, and fully
  inside the desktop app at Stage 6. Never claim a tool ran when only
  its presence was detected.

### T4. Built-in tools D1–D3 (agent tools, in the catalog)
Add three built-in tools to the agent's tool catalog (visible in the tool
picker, lazy-loaded like every other tool):
- D1 `todowrite` — the agent's own todo list (the Step Planner's Todo
  panel): create/update/complete todos, visible to the user live.
- D2 `question` / `ask_followup_question` — the agent asks the user a
  question MID-TASK and waits for the answer (uses the existing human
  checkpoint UI — one mechanism, two names for the same tool).
- D3 `list_code_definition_names` — lists the top-level definitions
  (functions, classes, components) of a file, from the code graph —
  the agent's fast "what is in this file" tool, no full-file read needed.

## Rules (non-negotiable)

- Small slices, commit after every 2–3 slices (the verifier commits +
  pushes; make each slice independently correct so a partial commit is
  never broken).
- Every new function/identifier you add MUST exist in index.html and be
  exercised by the new test suite — assert ONLY identifiers/behaviours
  that actually exist in index.html. Never assert a name you only planned.
- No AI slop: every entry must be real (a catalog entry the user can
  install, a detection that actually probes, a tool the agent can call) —
  not a dead list. Bengali UI text follows the app's existing i18n pattern
  (full-English-string keys).
- Respect the caps and the rules: every MCP starts UNTRUSTED (H5.5);
  never auto-install anything; never store a token in the repo; the
  ~40-tools-per-config warning is enforced; no second memory/graph/queue/
  scheduler/API. P4–P8 are PACK ENTRIES ONLY — the features already exist.
- Safe Mode (H2.3) still gates everything: a detected CLI tool is never
  run on user code without the approval ladder; a catalog MCP install is
  always the user's explicit tap.
- Never touch: provider/model config, the 9router preset, DuckDuckGo
  wiring, Team Mode v2 core, the H5.5 MCP trust rules, the Batch 7.7
  Serena/Sverklo entries.

## Tests (required, same pattern as every batch)

- New suite `test-batch-9.js` in the repo root, following the established
  NO-JSDOM extraction-and-eval pattern: read index.html, extract the
  <script> body, eval it in a minimal DOM stub (document / localStorage /
  window stubs as the existing suites do). NO package.json, NO node_modules,
  never require jsdom or any npm package.
- Cover each group with at least 2 assertions per item family on REAL
  behaviour: every T1 catalog entry exists with its install command +
  tool list + untrusted default, and the GitHub upgrade adds token +
  toolsets without duplicating the entry; every T2 pack entry exists,
  installs into the skill registry, and P4–P8 point at already-built
  features (no duplicate implementation); every T3 tool has a declaration
  + a detection probe, and an undetected tool is hidden from the agent
  catalog with install instructions; D1 creates/updates/completes a todo
  visible in the Todo panel, D2 asks a question through the checkpoint UI
  and waits, D3 lists a file's definitions from the code graph without
  reading the whole file.
- The suite MUST call `process.exit(0)` on success (a background timer in
  the DOM-less eval can otherwise crash the process after all tests pass
  — established pattern, see the 7.2 suite fix).
- Run the new suite alone AND the full suite (`test-*.js` + `test-*.cjs`)
  before finishing. Report the exact counts you measured yourself.

## Finish

- Summarize per group: what was built, the identifiers, the test count.
- List anything you could NOT build and why — never claim it done.
- Do NOT push. Leave the tree with your changes + the new test file so the
  verifier can check, commit, and push.
