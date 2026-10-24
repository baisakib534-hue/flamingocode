Read PRD.md and AGENTS.md. Stages 0-1 are committed. Implement ONLY Stage 2 (the anti-stuck compatibility layer — all 12 items, in order). This is the heart of the product: every retry/fallback must be visible in the Activity log. Self-review against the api-design skill, then commit with the message "Stage 2: anti-stuck API compatibility layer". End with the summary format from AGENTS.md. Do not start Stage 3.


EXECUTION RULE (from the manager): Never generate one giant edit in a single tool call — long generations die on upstream idle timeouts. Make changes in slices of at most ~150 lines each: apply one slice, then the next. After every 2-3 slices, commit with git (message: progress). If a generation is interrupted, continue from the file's current state instead of restarting.
