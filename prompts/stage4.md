Read PRD.md and AGENTS.md. Stages 0-3 are committed. Implement ONLY Stage 4 (Skills / Plugins / MCP library UI: the built-in skill packs as attachable bundles, user-created packs, plugin pipelines, MCP registry with the honest desktop-execution label). Self-review, then commit with the message "Stage 4: skills, plugins and MCP library". End with the summary format from AGENTS.md. Do not start Stage 5.


EXECUTION RULE (from the manager): Never generate one giant edit in a single tool call — long generations die on upstream idle timeouts. Make changes in slices of at most ~150 lines each: apply one slice, then the next. After every 2-3 slices, commit with git (message: progress). If a generation is interrupted, continue from the file's current state instead of restarting.
