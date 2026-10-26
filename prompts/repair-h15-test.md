REPAIR ROUND - H1.5 test file (Session search + recap + per-session tokens)

Context: repo /workspaces/devforge, branch main, HEAD db11d12. H1.5 is built and pushed, but it has NO test file - its new functions were verified only by grep and syntax check. This round adds the missing test coverage, nothing else.

1. Read test-memory-discipline.js and test-h14-context-files.js in the repo root - they are the pattern to follow: extract the main script from index.html and test the functions in Node with mocked document, localStorage and appState. Follow that pattern exactly.

2. Write test-session-search.js covering the H1.5 functions in index.html (searchSessions near line 14125, showSessionRecap near line 14190):
   - searchSessions: match by session name; match in session files (including Brain notes stored as session files); match in chat history; snippet context around the match (about 60 chars either side, with ellipsis); short or empty query (under 2 chars) restores the session list; no-match message; each result carries its sessionId and a click-to-switch target (switchSession(sessionId)).
   - showSessionRecap: recap card contents - usage stats, project files, last 3 exchanges, pending work from .devforge/progress.md and current-plan.md; auto-close after 15s (setTimeout 15000 calling closeSessionRecap); manual close (closeSessionRecap and the Got it button).
   - Per-session token totals: requests, tokens, cost read from appState.usage.byProject[sessionId], with zero defaults when a session has no usage entry.
   Aim for 10-15 assertions, mixing presence checks and real behavioural ones (mock timers and document so the auto-close and rendering are actually exercised, not just grepped). Inspect the real code first and test what it actually does - do not invent behaviour it does not have.

3. Run node test-session-search.js - it must pass 100 percent. If a test exposes a REAL bug in index.html, fix that bug (small fix only, no new features) and re-run until green. If a test fails only because of how it was written, fix the test.

4. Run node --check on the extracted main script (extract to a TEMP file only, do not commit it) and re-run the two existing suites (node test-memory-discipline.js must be 17/17, node test-h14-context-files.js must be 8/8) - both must still pass.

5. Commit the test file (and any bug fix as a SEPARATE commit if one was needed) with a clear message, then PUSH and verify git ls-remote origin main equals local HEAD and git status is clean. If the push asks for a GitHub username or password, STOP and report that - do not enter any credential. The Codespaces credential helper normally supplies authentication.

Scope: ONLY this test file (plus a small bug fix if one is genuinely found). Do NOT rebuild H1.1-H1.5 features, do NOT touch anything else.

Report back honestly: the test file (line count), how many assertions passed, any bug found and fixed (or none), node --check result, both existing suites results, commit hash, and push verification. Do not claim browser runtime tests - those ride with Stage 5.
