# Batch 17 — Junie mechanisms: agentic debugging, context-aware PR review, database-aware agent

## QUEUED — approved by Sakib 2026-10-27 ~18:52 +06 ("হ্যা junie করো")

Junie (JetBrains' agent) seen in his Devin Agents photo; researched as
proactivity preparation (draft 2026-10-27 ~15:03). Queue AFTER Batch 16.
Filed in `feature-ideas.md` §F as "Junie (from his Devin photo, resolved
2026-10-27)".

## Context (read first)

You are working in the FlamingoCode repo (single-file web app, `index.html`).
Read `PRD.md` and `AGENTS.md` before touching code. Build ONLY this batch.
Vanilla HTML/CSS/JS, no npm packages, no new dependencies.

This batch copies another agent's capabilities as IDEAS, implemented originally —
never its name, logo, exact UI copy, proprietary code, or proprietary models.
Everything ships as FlamingoCode, with his providers + DuckDuckGo free.
Sources: JetBrains Junie GA blog (blog.jetbrains.com, Junie leaves Beta,
June 2026) + Junie docs (jetbrains.com/help/.../junie.html) + Junie Local
announcement (Aug 2026).

Already built that you must EXTEND, never rebuild:
- Batch 7 self-testing preview + Project Doctor + Batch 12 reproduce-first
  bug-fix recipe — Q1 is a debugging loop ON them, never a second test loop.
- Team Mode v2 Senior review + Batch 12 L7 /loop diff-review + Batch 15 O1
  review artifacts — Q2 is a review TRIGGER + SURFACE on them, never a
  second review gate. The Senior review stays the final gate.
- Batch 9 PostgreSQL + Supabase MCPs — Q3 uses those connections, never a
  second DB connection store. DB credentials stay local-only, masked.
- Safe Mode (H2.3) gates everything dangerous: Q1's debugger never writes
  outside the project; Q3's SQL writes need approval; Q2's review never
  applies a change by itself.

## Scope — build all 3, one at a time, slice by slice

### Q1. Agentic debugging — the agent drives a real debugger (Junie GA)
- The agent can launch a debug session for a run configuration or a test,
  or TAKE OVER a debug session the user already has open.
- It sets breakpoints anywhere the runtime can step into — project code,
  library code, SDK code — and inspects real runtime state: stack frames,
  thread state, expression evaluation, run-to-line. It collects evidence
  instead of guessing from code or adding log statements.
- Three patterns, all supported: (a) fully autonomous — "debug why this
  test fails only on the second iteration"; (b) prepared — "prepare the
  debugger, I'll trigger the UI flow" (breakpoints set, agent waits);
  (c) handoff — "continue my current debug session and tell me why this
  value becomes null".
- Every debugger finding lands in the session as evidence (frame + values),
  and the fix it proposes goes through the normal diff review + Senior
  review. A failed debug run is reported with what was tried, never
  silently retried.
- Honest scope: a live debugger needs a real runtime — this lands at the
  desktop stage (Stage 6 Electron: Node inspector / CDP). In the web app,
  Q1 only PREPARES (breakpoint list + repro script + evidence template);
  it never claims to debug live in the browser.

### Q2. Context-aware PR review — review with the whole project in mind (Junie GA)
- Trigger from three places: GitHub Actions, GitLab (incl. on-prem), or a
  `/review` command in chat/CLI. Scope is the user's choice: unstaged
  changes, staged changes, or a diff against main.
- The review uses the SAME project context the agent writes code with:
  build config, test results, conventions, and past decisions from the
  Brain — not a first-time read of the diff. It highlights meaningful
  changes, explains design rationale, and gives inline accept/reject
  controls per comment.
- Accepted comments become fix tasks for the agent (through the normal
  pipeline); rejected ones are recorded in the Brain as a decision, never
  re-raised. The review renders as a Batch 15 O1 review artifact.

### Q3. Database-aware agent — query real data in the same session (Junie GA)
- The agent connects to a database already configured for the project
  (via the Batch 9 MCPs) and queries REAL data — not schema guesses — then
  writes, fixes, and validates SQL in the same session that handles the
  code change.
- Read queries run freely; any write (INSERT/UPDATE/DELETE/schema change)
  needs approval under Safe Mode, and every SQL statement + its result is
  logged in the session. A SQL fix is validated by re-running it, never by
  assuming it works.

## Deliberately NOT copied from Junie
- Junie Local (on-device Qwen3.6-27B, no cloud, no token charges) — needs
  an Apple M5 Mac with 64 GB RAM, hardware he does not have; the
  local-model idea is already covered by unlimited custom providers +
  Ollama/LiteLLM. Revisit only if his hardware changes.
- Bring-your-own-key + local runtimes (LiteLLM / LM Studio / Ollama) —
  already built (unlimited custom providers).
- Brave / Think / Auto + Ask / Code modes — already built (Batch 8a
  custom modes + Plan+Build mode).
- Remote control (start on laptop, check from phone) — already built
  (phone message queue + Batch 11 portable handoff + Agent Dashboard).
- Advanced Plan mode (plan as a confirmable artifact) — already built
  (Plan+Build + Batch 15 O1 review artifacts); do not build separately.
- Junie's proprietary models, JetBrains branding, and IDE-specific
  internals — never copied.
