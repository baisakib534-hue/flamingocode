# RACE Mode — Multi-Model Parallel Prompt Race

## Context
FlamingoCode web app: single-page vanilla JS (`index.html`, no frameworks, no build step).
It already supports multiple providers: the 9router `flamingocode-build` combo, DuckDuckGo AI
(free, default), and user-configured custom OpenAI-compatible providers. There is a model
picker in the chat input area and a per-project Brain (markdown memory).

## What to build: RACE mode
One prompt → N models answer IN PARALLEL → results shown RANKED. This is the "Godmod
replacement": instead of a fake provider, the user races the real models they already have.

### UI
- Add a **RACE toggle** next to the model picker in the chat input area.
- When RACE is ON, the model picker becomes a **multi-select** (checkbox list, min 2, max 4
  models) drawn from ALL configured providers (9router combo models, DDG AI, custom providers).
- The toggle + selection persist per session (remember last race set).

### Race execution
- On send: the SAME prompt (same system prompt as a normal chat turn) is fanned out to all
  selected models **in parallel** via `Promise.allSettled` — one model's failure, timeout, or
  hang must NEVER block or kill the others (never-stuck routing).
- Per-model timeout (120s): a hung model is marked "timed out", the rest continue.
- Each model call counts its tokens toward the existing usage/quota dashboard if present.

### Results view
- A race results panel (below the input, or a dedicated view — pick what fits the existing UI):
  one **card per model**, appearing as each finishes.
- Each card shows: model name + provider badge, latency (total ms, and time-to-first-token if
  streaming), the response (rendered exactly like a normal chat message), status
  (`racing…` / `done` / `failed: <reason>` / `timed out`).
- **Ranking**: cards auto-order by completion time, fastest first. The fastest card gets a
  subtle "⚡ fastest" marker. This ordering IS the rank — no fake scoring.
- Each card has two actions:
  - **"Use this"** — inserts that response into the main chat transcript as the accepted
    answer (and closes the race view).
  - **"Crown 👑"** — marks it the winner. Winners are recorded in the Project Brain as a tiny
    local tally (`model → wins`, with the task category when detectable, e.g. coding vs writing).
    Next time the race picker opens, show a hint like "👑 Usually wins for coding: <model>".
- Failed/timed-out cards stay visible with their error — never silently dropped.

### Discipline (non-negotiable)
- Small-request discipline applies: a race is ONE user request; do not loop or re-prompt
  models on your own.
- No AI slop: real wiring only. Every new button must actually work; grep-verify each new
  entry point is called from a live path.
- Do NOT touch or regress existing features (Team Mode, Brain, checkpoints, voice, etc.).
  Run the full existing test suite and keep it green.

## Build rules (repo AGENTS.md)
- Read `PRD.md` before starting.
- Plan → implement → self-review → test → fix → summarize. Then STOP.
- Write a test file `test-race.cjs` following the repo's NO-JSDOM extraction-and-eval pattern
  (no npm packages). It MUST call `process.exit(0)` on success.
- Tests must prove: fan-out calls all N models; one model's failure does not block others
  (allSettled); cards rank by completion latency; crowning writes the Brain tally; a hung
  model times out while others complete.
- Commit with a specific message when done. Keep `git status` clean.

## Deliverable
RACE mode working in the web app, tested, committed. Summarize what was built, the test
count, and the commit hash. Do NOT report success from your own summary — only from the
test run output.
