# Autonomy Engine — Part 3 ONLY: sub-agent spawn templates

In index.html, implement ONLY this one part. Do not touch any other
feature, do not rewrite existing Autonomy code.

Build the sub-agent spawn templates: when the app spawns a sub-agent,
the template must embed into the sub-agent's context/instructions:
(1) the FULL installed skill/plugin/MCP catalog (reuse the
single-source catalog constant already in the file — do not duplicate
the catalog by hand), and (2) the mandatory-use rule text (the agent
MUST pick and use whatever skill/plugin/MCP each task needs, with no
@mention required), so a spawned sub-agent can invoke skills, plugins
and MCPs on its own exactly like a single-mode agent.

Work in slices of at most 150 lines, commit every 2-3 slices.
Commit message: "feat(autonomy): sub-agent spawn templates with
embedded catalog". Verify: extract the script and run node --check
(must print SYNTAX-PASS), and grep that the spawn template + catalog
reference + mandatory-use rule are present.
