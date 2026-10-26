# Batch 7.5 — Recipes (research sweep #5, TOP CANDIDATE)

Read `PRD.md` and `AGENTS.md` first. Build ONLY this feature. Vanilla single
page (`index.html`), no npm packages, no new files except the test file.
Follow the repo house rules: plan → implement → self-review → test → fix →
summarize. Commit after each slice (every 2–3 slices) with a clear message,
push to origin/main, and verify `git ls-remote origin main` == HEAD before
you report done. Never claim a test passed that you did not run.

## Why this batch

His order: a user with no coding knowledge must be able to run a whole
expert workflow ("review my PR", "audit security", "fix all lint errors")
by picking a recipe and filling two boxes. What exists today (do NOT
rebuild): the B4 prompt library (prompts ONLY — no tools, no parameters,
no retry/checks, no chaining), Team Mode, the H5.2 import flow, the Plugin
Catalog. The GAP: no shareable workflow files. This batch ports Goose
Recipes (block/goose; schema + validator rules read from the official
docs — port as an idea, never copy code): a recipe is one YAML file that
turns an expert workflow into one tap. A recipe is also a team briefing
(Team Mode) and a prompt + tools + checks (B4, extended).

## 1. The recipe shape — one YAML file

A recipe is a JS object in-app, YAML at the import/export boundary:

```
title, description,
instructions + prompt (with {{parameter}} templating),
parameters: [{ key, input_type: string|number|select|file, requirement,
  default, options }],
extensions: [builtin skills or MCP servers to load, with timeout],
settings: { provider, model, temperature, max_turns },
retry: { max_retries, shell checks, on_failure command },
response: { json_schema },
sub_recipes: [recipe ids to run after this one]
```

- `prompt` is the headless entry (a recipe with no `prompt` can only run
  interactively, never headless).
- `instructions` is the long-form guidance; `prompt` is the short runnable
  text. At least one of the two is required.
- `extensions` lists the skills/MCPs the run loads (names from the
  existing skill list / MCP server list — never new registries).

## 2. Validator — `validateRecipe(recipe)`

Port the Goose validator rules exactly:
(a) at least one of `instructions` / `prompt` is required;
(b) every `{{variable}}` used in `instructions`/`prompt` MUST have a
    parameter definition, and every defined parameter MUST be used (no
    unused params);
(c) optional parameters MUST have defaults;
(d) file-type parameters CANNOT have defaults (so a recipe can never
    silently import a sensitive file);
(e) headless execution requires a `prompt` field.
- The validator returns `{ valid, errors: [{ field, message }] }` with
  plain-language messages (Bangla + English) naming the exact field.
- Invalid recipes cannot be saved or run — the editor shows the errors
  inline next to the offending field.

## 3. Run — `runRecipe(recipeId, params)`

- Param form: one input per parameter (text / number / select dropdown /
  file picker), defaults pre-filled, required ones marked — a non-coder
  fills two boxes and taps Run.
- Templating: `{{parameter}}` is substituted in `instructions` and
  `prompt` before the run (missing required param = run refused with a
  clear message, never a half-filled prompt).
- Extensions: the listed skills/MCPs are enabled for the duration of the
  run (then restored to their previous state).
- Settings: `provider` / `model` / `temperature` / `max_turns` override
  the current settings for this run only.
- Retry: after the run, each shell check runs; if a check fails, the
  `on_failure` command runs and the recipe retries, up to `max_retries`.
  When retries are exhausted the run ends as FAILED with the check output
  shown (never a silent "done" — this rides on the 7.3
  verification-before-completion gate: a recipe run may not claim done
  while its checks fail).
- Sub-recipes: after this recipe finishes, each `sub_recipes` entry runs
  in order, receiving the same params (plus this recipe's outputs where a
  key matches). A sub-recipe failure stops the chain and reports which
  link failed.
- Every run is logged (recipe, params used, result, checks) to the
  activity log and to Brain as a short note.

## 4. Recipes UI + built-ins

- New "Recipes" section (in the sidebar next to Prompt Library, or as a
  tab in the library panel — pick the placement that fits the existing
  layout, do not add a second sidebar): list with title + description +
  Run / Edit / Duplicate / Delete / Export (.yaml) buttons, and an
  Import button (paste YAML or pick a file).
- Recipe editor: form fields for title/description/parameters/settings/
  retry + a text area for `instructions`/`prompt` (with a `{{param}}`
  insert helper) + a YAML view (export text) — editing either side keeps
  the other in sync; validation errors show inline.
- Recipes live in `appState.recipes` (persisted with `saveAppState`,
  included in the A3 full backup export/import).
- Ship 5 built-in recipes (all valid per §2): "Review my PR", "Audit
  security", "Fix all lint errors", "Write tests for this file",
  "Explain this code in Bangla" (Teach Mode style, simple Bangla).
- YAML import/export: in-app storage is JS objects; export writes YAML
  text; import parses a documented YAML SUBSET only (top-level mappings,
  nested maps/lists with 2-space indent, quoted + plain scalars) via a
  small hand-rolled parser — no npm package. Invalid YAML fails with a
  clear error naming the line. Document the supported subset in a comment
  above the parser.

## 5. Dedupe — do NOT rebuild

B4 prompt library, Team Mode, the skill/MCP registries, the 7.3
verification gate, the H5.2 import flow — build ON them. No second prompt
store, no second YAML library, no second runner: a recipe run IS an agent
task (sendAgentPrompt) with params + extensions + settings applied.

## Tests — new file `test-batch-7.5-recipes.js`

NO-JSDOM extraction-and-eval pattern (no package.json, no node_modules —
never require jsdom or any npm package). Assert ONLY identifiers and
behaviours that actually exist in `index.html`. Call `process.exit(0)` on
success (a suite without it can crash after passing when a background
timer fires in the DOM-less eval — established pattern).

Cover at least:
(a) validator: recipe with neither `instructions` nor `prompt` → invalid;
(b) validator: `{{variable}}` with no parameter definition → invalid;
    defined parameter never used → invalid;
(c) validator: optional parameter without a default → invalid; file
    parameter WITH a default → invalid;
(d) validator: a complete, correct recipe → valid;
(e) templating: `{{name}}` is substituted, a missing required param
    refuses the run;
(f) run: settings override (model/temperature/max_turns) applies for the
    run only and the previous settings are restored after;
(g) run: a failing shell check triggers `on_failure` and retries up to
    `max_retries`, then ends FAILED with the check output (never "done");
(h) sub-recipes run in order and a failing link stops the chain naming
    the failed recipe;
(i) YAML export → import round-trip preserves title, parameters,
    settings and retry; invalid YAML fails naming the line;
(j) the 5 built-in recipes exist and all pass the validator;
(k) Bengali translation keys exist for the new strings.
3. Run the FULL suite (`test-*.js` AND `test-*.cjs`, including
   `test-h14-context-files.js` and `test-session-search.js`) — a new suite
   passing alone does NOT prove the script parses. Every suite must exit
   0. Report the REAL totals you counted yourself (suite count +
   assertion count), never a rounded or guessed number.
