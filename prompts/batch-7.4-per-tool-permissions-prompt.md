# Batch 7.4 — Per-tool permissions (research sweep #18, TOP CANDIDATE)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His order: Safe Mode must be precise and explainable in one screen — "git
status always allowed, rm always blocked, everything else ask me". A
non-coder must be able to read it. What exists today (do NOT rebuild):
H2.3 Safe Mode v2 (Smart/Manual/Off + the approval ladder + deny rules as
a DESIGN) and H5.5 MCP per-server trust. The GAP: no per-tool permission
evaluator — nothing actually checks each tool call against fine-grained
rules before it runs. This batch ports OpenCode's permission evaluator
(mechanism read from source, official docs opencode.ai/docs/permissions —
port as an idea, never copy code): the whole policy engine is ~10 lines.

## 1. The evaluator — `evaluateToolPermission(toolName, argsSummary)`

- Policy = a flat list of `{ permission, pattern, action }` triples, where
  `permission` names the tool (e.g. `bash`, `write`, `read`, `mcp`) and
  `pattern` matches the call's argument summary (e.g. `git *`, `rm *`,
  `*.env`), and `action` is `allow` | `ask` | `deny`.
- Evaluator: `rules.flat().findLast(rule =>
  wildcardMatch(rule.permission, toolName) &&
  wildcardMatch(rule.pattern, argsSummary)) ?? { action: 'ask' }` —
  **last matching rule wins, default is ask**.
- `wildcardMatch(pattern, text)` — patterns use ONLY `*` (any chars) and
  `?` (one char). No regex, no other syntax — keep it exactly this small.
- Rules are stored in `appState.toolPermissions` (persisted with
  `saveAppState`, included in the A3 full backup export/import).
- Per-agent overrides: a rule may carry `agentId` (or `teamId`) — an
  agent-scoped rule is checked AFTER the global rules, so it wins over a
  global rule for that agent's calls. A rule with no agent scope applies
  to every agent.

## 2. Defaults — safe out of the box

Ship these rules in order (later = wins):
1. `read: { "*": "allow" }` — reading files is always safe.
2. `bash: { "git status *": "allow", "git log *": "allow", "git diff *": "allow" }`
3. `bash: { "rm *": "deny", "git push *": "deny" }` — destructive + publishing
   are denied until he explicitly allows them.
4. `*: { "*.env": "deny", "*API_KEY*": "deny", "*SECRET*": "deny",
   "*PASSWORD*": "deny" }` — secrets are blocked by default on EVERY tool
   (matches the H5.5 credential-scrub rule: credentials never enter agent
   context or tool arguments).
5. Everything else falls through to the default: `ask`.

The defaults must be visible and editable — never hidden magic.

## 3. Wiring into the approval ladder (H2.3)

- Before ANY tool call executes (agent tools, MCP tools, team-agent
  tools), run `evaluateToolPermission` with the tool name + a short
  argument summary (command string for bash, file path for write/read,
  tool name for MCP calls).
- `allow` → proceed silently, log the decision (debug level).
- `ask` → the existing approval ladder prompt (H2.3 Step 2.5) — he
  approves / denies / approves-once.
- `deny` → the call is BLOCKED: no execution, a clear message in chat
  ("Blocked by your rule: rm * is denied") + an activity-log entry +
  the rule that matched, so he can change it in one tap from the message.
- Safe Mode mapping: Smart mode uses these rules as written; Manual mode
  forces EVERYTHING to `ask` regardless of rules (rules still shown, with
  a "Manual overrides all" note); Off (YOLO) still enforces `deny` rules
  — a deny is a deny in every mode (untrusted-write escalation from H5.5
  still applies on top).

## 4. Permissions UI — one readable screen

- New Settings tab "Permissions" (next to the existing tabs), plus a
  compact summary line in the Safe Mode section ("12 rules · 3 deny ·
  4 allow · rest ask").
- Rule list: each row shows tool pattern, argument pattern, action chip
  (Allow green / Ask amber / Deny red), scope (All agents / one agent),
  and up/down reorder buttons (order matters — last match wins, so show
  a hint "lower rules win"), edit, delete.
- Add-rule form: tool dropdown (all tools the app knows + `*`), argument
  pattern text input with `*`/`?` hint, action selector, scope selector.
- One-tap presets: "Strict" (deny rm/push/.env, ask everything else),
  "Balanced" (the §2 defaults), "Open" (allow read + git reads, ask the
  rest) — each preset replaces the rule list only after he confirms.
- Bengali translations for every new string (tab name, chips, hints,
  blocked message, preset names).

## 5. Dedupe — do NOT rebuild

H2.3 Safe Mode + the approval ladder, H5.5 MCP trust, the A2 diff review,
the credential scrub — build ON them. No second approval UI, no second
deny list, no regex engine, no second settings store.

## Tests — new file `test-batch-7.4-per-tool-permissions.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) `wildcardMatch` — `*` matches any chars, `?` matches exactly one
    char, plain text matches literally, no other syntax;
(b) `evaluateToolPermission` — last matching rule wins (two overlapping
    rules, the later one decides);
(c) default is `ask` when no rule matches;
(d) the shipped defaults: `read` anything → allow; `git status` → allow;
    `rm *` → deny; `git push *` → deny; any tool touching `*.env` →
    deny;
(e) per-agent override beats the global rule for that agent only (other
    agents still get the global result);
(f) reordering two rules flips the outcome;
(g) the deny path blocks the call AND names the matching rule;
(h) Manual mode forces `ask` for an otherwise-allowed call, Off mode
    still enforces `deny`;
(i) rules persist in `appState.toolPermissions` and survive
    save/load (and are present in the backup export shape);
(j) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
