# Autonomy Engine — Part 4 ONLY: pre-commit gate

In index.html, implement ONLY this one part. Do not touch any other
feature, do not rewrite existing Autonomy code.

Build the pre-commit gate: the app must REFUSE to mark a task done
until the mandatory checks are recorded as run: testing-qa,
security-review, and the relevant domain skill for the task. Show a
visible gate status on the task (pending / passed / blocked, with the
missing check named when blocked), and block the done-transition while
any mandatory check is unrecorded.

Work in slices of at most 150 lines, commit every 2-3 slices.
Commit message: "Feature: Autonomy Engine — automatic skill/plugin/MCP
use" (this part completes the Autonomy Engine, so it carries the
final message). Verify: extract the script and run node --check
(must print SYNTAX-PASS), and grep that the gate + mandatory checks
(testing-qa, security-review) + blocked-transition logic are present.
