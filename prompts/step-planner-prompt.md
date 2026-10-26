# FlamingoCode — Step Planner + live todo list (prompt)
# Repo: baisakib534-hue/flamingocode, branch main, single-file
# index.html (~22,192 lines). Engine: Hermes Agent + 9router API
# (flamingocode-build combo) ONLY — headless form:
# hermes chat --provider ninerouter --model flamingocode-build
# -s test-first,testing-qa,debugging-discipline --checkpoints
# --oneshot -Q -q "$(cat <prompt-file>)"
# (--oneshot -Q BEFORE -q; -Q between -q and its query breaks parsing.)
# RULES: build ONLY the ONE feature in this file. Work in small
# slices; commit every 2-3 slices with clear messages. Commit
# EVERY file you create — including any test file — before
# pushing; never leave an untracked file behind.
# Verify every claim in the CODE (grep markers, never trust a
# summary). node --check SYNTAX-PASS on the extracted main script;
# literal '</script' count stays 1; no '?.onclick'. Commit + PUSH
# yourself and verify git ls-remote origin main == local HEAD.
# If the push asks for a GitHub username/password, STOP and report
# it — do not enter any credential. No browser runtime test —
# that rides with Stage 5.
# DEDUPE: Plan+Build exists (Round 39: Chat/Plan/Plan+Build
# modes, numbered plan -> live checklist saved to
# .devforge/current-plan.md, pause/resume/skip/re-plan, caps 25
# steps / 5 revisions) and Plan read-only mode exists (Batch 2
# F4: READ-ONLY indicator, Approve & Build) — EXTEND them, do NOT
# build a second plan system. Team Mode task board exists (drag
# to reassign) — the todo list here is the SINGLE agent's working
# list, not the team board. H2.3 Safe Mode v2 approval ladder
# exists (runApprovalLadder: hardline blocklist, user deny rules,
# Smart/Manual/Off) — risky steps go through IT, do NOT build a
# second approval system. Bangla UI toggle exists — add Bengali
# labels for the new UI.

## Step Planner + live todo list (his orders 2026-10-26 ~02:24 + ~02:28)
His words, 02:24: when he gives a prompt the agent plans first,
then auto-build starts (Smart/Off mode); DURING the task, like
Qoder/Devin, it thinks, runs cmd, sees the result, then does the
next step; and for BIG/COMPLEX tasks (e.g. a full game) it must
plan EACH DETAIL before building it — not the ordinary/simple
version other agents build, but human-like detail work, step by
step, carefully, no mistakes where it matters.
His CORRECTION, 02:28 (supersedes any "every step" wording):
NOT before every step — the agent itself understands WHEN
step-by-step planning is needed (only in the places he talked
about) and does it only then; planning every step would waste a
lot of extra tokens for nothing.
His second point, 02:28: the todo button was NOT added yet — it
is a common thing. Add it.
Build: (a) CONDITIONAL per-step planning — when a task starts,
the agent decides and records in one line whether the task needs
step-by-step planning. Triggers: big/complex task, many details,
careful or risky work, multi-part builds (a full game/app).
Simple tasks SKIP per-step planning and build directly (token
economy). (b) When triggered: before each step, a SHORT plan for
THAT step only (what, why, what to check after) — one or two
lines per step, never re-planning finished steps. (c)
Think-act-observe loop — during the task the agent thinks, runs
a command/tool, observes the result, then decides the next step;
the UI shows the live status (thinking / running / observed
result) while it works, like Qoder/Devin. (d) Todo button + live
todo list — a todo button in the UI opens the agent's live task
list: the current plan's steps with done / active / pending
states, auto-updated as work proceeds, surviving across turns
(persisted with the session/plan); clicking a step shows its
detail. This list IS the visible form of the step-by-step plan.
(e) Detail planning for big tasks — for a big/complex build the
agent plans each DETAIL before building it (a game: gameplay,
controls, levels, scoring, visuals, sound, edge cases — each as
planned steps, not one vague "build game" step). (f) Mode
mapping: Smart (default) = conditional planning + auto-build
low-risk, ask before risky (via the H2.3 ladder); Off/YOLO =
plan + build all automatically (hardline blocklist + deny rules
STILL apply); Manual = plan each step, ask before each build
step. (g) Token economy: per-step plans stay short; no
re-planning of finished steps; the trigger decision is one line.
Size M. Web: yes. Write a test file (test-step-planner.js,
same pattern as test-rate-limits.js / test-memory-discipline.js)
covering: trigger decision (big/complex triggers, simple task
skips), per-step plan creation, think-act-observe state
transitions, todo list updates + persistence, mode mapping.
All tests must pass before pushing.

