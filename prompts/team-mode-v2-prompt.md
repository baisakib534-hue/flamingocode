# Team Mode v2 — flagship team room (build prompt)

Read prompts/team-mode-spec.md in this repo and implement it exactly
in index.html. Do not touch any other feature, do not rewrite the
Stage 3 team mode — v2 EXTENDS it.

Build: (1) team templates (Web App / API / Bug Hunt / Design, one
click) with role presets (PM, Senior, Frontend, Backend, QA, DevOps,
Docs) — EVERY template MUST include a QA agent by default (the
Autonomy pre-commit gate stays blocked without recorded testing-qa);
(2) live team chat panel (watch agent discussion live, user can jump
in mid-task to redirect); (3) drag-to-reassign task board;
(4) Senior review with diff view + disagreement arbitration (Senior
arbitrates, user can overrule); (5) parallel/sequential toggle;
(6) Auto-team (software picks team composition from the prompt, always
including QA); (7) team memory into the Project Brain across sessions;
(8) cost/time per agent + budget cap; (9) add-specialist mid-task;
(10) agent voting on architecture; (11) human checkpoints only on big
decisions; (12) replay + transcript export.

Work in slices of at most 150 lines, commit every 2-3 slices.
Commit message: "Feature: Team Mode v2 — flagship team room".
Verify: extract the script and run node --check (must print
SYNTAX-PASS), and grep that the templates, live chat, board, Senior
diff review, Auto-team and replay markers are present.
