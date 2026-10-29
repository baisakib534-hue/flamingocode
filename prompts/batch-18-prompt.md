# Batch 18 — Tool Recommender v2: name + input boxes on recommendations

## QUEUED — his order 2026-10-28 ~00:38 +06

His words (paraphrased from voice): when a recommendation needs something
(like Supabase), the card shows the NAME of the thing + an empty BOX — he
fills the box with a password or any string, submits, and ONLY that thing
gets installed with those values. If he installs it later, only that one
installs. A recommendation can have MULTIPLE boxes for the same thing
(Supabase needs URL + anon key + service key). Filed in `feature-ideas.md`
#20 (Tool Recommender v2) + mobile-app-spec.md §14. Queue AFTER Batch 17.

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch EXTENDS the Tool Recommender built in Batch 7.2b (local keyword
matcher, top-3 card, one-click Install + Dismiss + "Don't suggest again",
MCP installs start UNTRUSTED, NEVER auto-install). It reuses the Batch 9
pattern (GitHub MCP token modal: masked password input, per-project store,
env key at call time) — do not rebuild that pattern, extend it to
recommendations.

## Scope — build all 5, one at a time, slice by slice

### R1. Name + boxes on every recommendation that needs config
- A recommendation card shows the tool NAME (which thing it is) plus one
  empty input box per value the install needs, each box LABELLED with what
  goes in it (e.g. Supabase: Project URL, anon key, service_role key;
  GitHub MCP: token). Password / secret boxes are masked inputs.
- Required vs optional is marked on each box. Empty boxes are the default
  — nothing is pre-filled, never a guessed value.

### R2. Fill + Submit installs ONLY that tool
- Submit installs exactly that one recommendation, applying the typed
  values to its install (MCP env/config, skill/plugin settings). No other
  recommended tool installs. The same holds when he installs it LATER from
  the Recommendations section — only that one installs.
- A required box left empty blocks the submit with a clear message naming
  the missing box. Nothing installs, nothing is half-configured.

### R3. Multiple boxes for the same thing
- A tool can declare as many boxes as it needs (Supabase = 3). All filled
  values are applied together in one install. The card lists every box the
  tool needs — no hidden second step after submit.

### R4. Values are secrets, handled like secrets
- Typed values are stored per-project, masked in the UI, never written
  into the repo, never shown in logs or chat (same rule as the Batch 9
  GitHub token: scrubbed from context). Dismiss / "Don't suggest again"
  unchanged. NEVER auto-install unchanged. MCP installs still start
  UNTRUSTED (H5.5), stated on the card.

### R5. The phone shows the same card with the same boxes
- The phone app mirrors the recommendation with its boxes (his 2026-10-26
  ~19:33 order: phone mirrors recommendations). Filling the boxes on the
  phone + submit installs on the desktop — the install lands on the
  desktop, exactly like phone Install today. An offline submit queues and
  syncs when back online (same queue as the message queue).

## Tests
- Extend the existing recommender test suite with behavioural assertions:
  submit with values → only that tool installed, values applied; empty
  required box → submit blocked, nothing installed; multiple boxes all
  applied in one install; dismiss / "Don't suggest again" unchanged;
  values masked + absent from logs/context; phone-submit path queues
  offline and installs on sync. No source-string-only assertions for
  behaviour that must be live.

## Honest scope
- The boxes COLLECT config; they never run code and never auto-install.
- A tool whose install needs a desktop-only step says so on the card
  (same honesty as the Batch 9 GitHub token: stored for desktop use).
