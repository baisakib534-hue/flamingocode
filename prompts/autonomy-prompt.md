# Build prompt — Autonomy Engine (from autonomy-spec.md)

Read autonomy-spec.md in this repo's workspace (the manager will place
it at prompts/autonomy.md) and implement it exactly in index.html:

1. A settings section "Autonomy" that shows the installed skill/plugin/
   MCP catalog and the mandatory-use rule in plain words.
2. A per-task "Tools used" strip in the agent chat UI: after every
   task, list which skills/plugins/MCPs the agent applied (the agent
   fills this from its own tool-match step; empty is only valid for
   trivial tasks, with a one-line reason).
3. Sub-agent spawn templates that embed the full catalog + the
   mandatory-use rule, so spawned agents can invoke skills/plugins/MCPs
   on their own.
4. The pre-commit gate: the app refuses to mark a task done until the
   mandatory checks (testing-qa, security-review, relevant domain
   skill) are recorded as run.

Work in slices of at most 150 lines, commit every 2-3 slices.
Final commit message: "Feature: Autonomy Engine — automatic skill/plugin/MCP use".
