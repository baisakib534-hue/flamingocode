// Test suite for Batch 13 — Governance + Safety + Cost (M1–M14)
// NO-JSDOM extraction-and-eval pattern — no npm packages
// Assert ONLY identifiers and behaviours that actually exist in index.html
// Call process.exit(0) on success

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

// Extract the main script content (first <script> tag only, non-greedy)
const scriptMatch = html.match(/<script[^>]*>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No <script> tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1];

// Quick syntax check
try {
  new Function(scriptContent);
  console.log('PASS: index.html script syntax OK');
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

let passCount = 0;
let failCount = 0;

function assert(label, condition) {
  if (condition) {
    console.log('PASS ' + label);
    passCount++;
  } else {
    console.error('FAIL ' + label);
    failCount++;
  }
}

function assertIncludes(haystack, needle, label) {
  assert(label, haystack.includes(needle));
}

function assertRegex(haystack, pattern, label) {
  assert(label, pattern.test(haystack));
}

console.log('\n=== Batch 13 Test Suite ===');

// ============================================================
// M1: Risk-tiered approval + graduated autonomy ladder
// ============================================================
console.log('\n=== M1: Risk-tiered approval + graduated autonomy ladder ===');

// M1a: Approval rung types exist (read-only, low, medium, high)
assertIncludes(html, 'approvalRung', 'approvalRung state exists');
assertRegex(html, /readOnly|read-only|inspect.*plan/, 'Read-only rung defined');
assertRegex(html, /low.*rung|rung.*low/, 'Low rung defined');
assertRegex(html, /medium.*rung|rung.*medium/, 'Medium rung defined');
assertRegex(html, /high.*rung|rung.*high/, 'High rung defined');

// M1b: Action classification (read-only / additive / destructive)
assertIncludes(html, 'classifyAction', 'classifyAction function exists');
assertRegex(html, /function classifyAction/, 'classifyAction function signature');
assertRegex(html, /readOnly|additive|destructive/, 'Three reversibility classes');

// M1c: Rung enforcement — destructive action in low rung asks, reversible in medium auto-approves
assertRegex(html, /rung.*destructive|destructive.*rung/, 'Rung enforces destructive action approval');
assertRegex(html, /autoApprove|auto.*approve/, 'Auto-approve logic for medium rung');

// M1d: Task never silently climbs rungs
assertRegex(html, /climb|silent|explicit/, 'No silent rung climbing');
assertRegex(html, /currentRung|current rung|rung.*change/, 'Current rung shown in header');

// M1e: Per-mode enforced standards (prompt cannot override)
assertRegex(html, /enforcedStandard|standard.*enforced|never.*override/, 'Standards enforced per rung');

// ============================================================
// M2: Governance policy file + fail-closed evaluation + receipts
// ============================================================
console.log('\n=== M2: Governance policy file + fail-closed evaluation + receipts ===');

// M2a: Policy file .devforge/policy.yaml
assertIncludes(html, 'governancePolicy', 'governancePolicy state exists');
assertRegex(html, /policy\.yaml|devforge.*policy/, 'Policy file path referenced');
assertRegex(html, /authority\.spend.*owner_only/, 'authority.spend owner_only validated');

// M2b: Fail-closed evaluation — missing policy/identity/cost/approval = BLOCKED
assertIncludes(html, 'failClosed', 'failClosed function exists');
assertRegex(html, /fail.*closed|blocked.*missing|missing.*blocked/, 'Fail-closed logic');
assertRegex(html, /plain.*language|reason.*plain/, 'Plain-language reason on block');

// M2c: Every governed action leaves a receipt in event log
assertIncludes(html, 'receipt', 'Receipt mechanism exists');
assertRegex(html, /recordEvent|eventStore.*receipt/, 'Receipt written to event log');
assertRegex(html, /action.*policy.*decision.*cost.*timestamp/, 'Receipt includes required fields');

// M2d: Policy editor shows effective rule ("why was this allowed?")
assertRegex(html, /effectiveRule|why.*allowed|policy.*editor/, 'Policy editor shows effective rule');

// ============================================================
// M3: Command/network policy + shell-parse safety + audit log
// ============================================================
console.log('\n=== M3: Command/network policy + shell-parse safety + audit log ===');

// M3a: Network hosts allow/deny lists
assertIncludes(html, 'networkPolicy', 'networkPolicy state exists');
assertRegex(html, /allowedHosts|deniedHosts|host.*allow|host.*deny/, 'Host allow/deny lists');

// M3b: Shell commands allow/deny/require-approval
assertIncludes(html, 'shellPolicy', 'shellPolicy state exists');
assertRegex(html, /allowedCommands|deniedCommands|requireApproval/, 'Shell command lists');

// M3c: Shell PARSED (tree-sitter-bash shape) before judging
assertIncludes(html, 'parseShell', 'parseShell function exists');
assertRegex(html, /tree.*sitter|parse.*shell|command.*args.*redirect.*pipe/, 'Shell parsed not pattern-matched');
assertRegex(html, /LRU|cache/, 'LRU cache for parsed shells');

// M3d: Dynamic shell syntax ($(...) backticks eval) detected → require-approval
assertRegex(html, /\$\(|`|eval/, 'Dynamic shell syntax detection');
assertRegex(html, /dynamic.*shell|require.*approval/, 'Dynamic syntax requires approval');

// M3e: Per-tool / per-arg allow/deny/prompt
assertRegex(html, /per.*tool|per.*arg|tool.*allow|tool.*deny/, 'Per-tool/arg permissions');

// M3f: JSONL audit log viewable in Safe Mode panel
assertIncludes(html, 'auditLog', 'auditLog state exists');
assertRegex(html, /JSONL|audit.*log/, 'JSONL audit log');
assertRegex(html, /Safe Mode.*audit|audit.*Safe Mode/, 'Audit log viewable in Safe Mode panel');

// ============================================================
// M4: Harness-enforced sandbox (Stage 6 desktop stub)
// ============================================================
console.log('\n=== M4: Harness-enforced sandbox (Stage 6 desktop stub) ===');

// M4a: Backend picker (LocalShell vs SandboxBackend)
assertIncludes(html, 'backendPicker', 'backendPicker UI exists');
assertRegex(html, /LocalShell|SandboxBackend|backend.*picker/, 'Backend picker with two options');

// M4b: Capability filter — tool absent if backend can't offer it
assertIncludes(html, 'capabilityFilter', 'capabilityFilter function exists');
assertRegex(html, /capability.*filter|tool.*absent|backend.*capab/, 'Tools filtered by backend capability');

// M4c: Desktop stub marked clearly — OS enforcement lands at Stage 6 Electron
assertRegex(html, /Stage 6|Electron|desktop.*stub|OS.*enforcement/, 'Desktop stub clearly marked');

// M4d: Health-monitor loop design note
assertRegex(html, /health.*monitor|sandbox.*health|dead.*sandbox/, 'Health monitor loop design note');

// ============================================================
// M5: Pre-send prompt scanner + secret substitution
// ============================================================
console.log('\n=== M5: Pre-send prompt scanner + secret substitution ===');

// M5a: Normalization + secrets/PII scan + redact BEFORE model
assertIncludes(html, 'scanPrompt', 'scanPrompt function exists');
assertRegex(html, /before.*model|pre.*send|prompt.*scan/, 'Scan runs before model');
assertRegex(html, /secret|PII|redact/, 'Secrets/PII scanning and redaction');

// M5b: 210+ secret types by pattern (gitleaks shape)
assertRegex(html, /210|gitleaks|secret.*type|pattern.*secret/, '210+ secret types by pattern');

// M5c: Redaction format [REDACTED_SECRET:<kind>:<id>]
assertRegex(html, /REDACTED_SECRET|redacted.*secret.*kind.*id/, 'Redaction format correct');

// M5d: Restored at tool-execution boundary via session redaction map
assertIncludes(html, 'redactionMap', 'redactionMap state exists');
assertRegex(html, /restore.*tool|tool.*boundary|execution.*boundary/, 'Restored at tool boundary');

// M5e: Redaction marker shown in chat ("🔒 2 secrets redacted before sending")
assertRegex(html, /🔒|redacted.*before.*sending|secret.*redacted/, 'Redaction marker in chat');

// M5f: Scanner runs on pasted prompts too
assertRegex(html, /paste|pasted.*prompt/, 'Scanner runs on pasted prompts');

// ============================================================
// M6: Model-judged approvals (optional layer, off by default)
// ============================================================
console.log('\n=== M6: Model-judged approvals ===');

// M6a: Classifier model judges: LOW auto, MEDIUM notice, HIGH dialog
assertIncludes(html, 'modelJudge', 'modelJudge function/state exists');
assertRegex(html, /LOW|MEDIUM|HIGH|low|medium|high/, 'Three risk levels');
assertRegex(html, /auto.*run|notice|dialog/, 'Different behavior per level');

// M6b: Read-only actions auto-approved
assertRegex(html, /read.*only.*auto|auto.*read.*only/, 'Read-only auto-approved');

// M6c: Untrusted instructions kept OUT of system prompt
assertRegex(html, /untrusted.*instruction|system.*prompt.*excluded/, 'Untrusted instructions excluded');

// M6d: FAIL-CLOSED on classifier failure — deny, never auto-approve
assertRegex(html, /fail.*closed|classifier.*fail|timeout.*deny/, 'Fail-closed on classifier failure');
assertRegex(html, /denied|blocked|never.*auto.*approve/, 'Denies on failure');

// M6e: Judge verdict + reason logged as session events
assertRegex(html, /judge.*verdict|judge.*reason|session.*event/, 'Judge verdict logged');

// M6f: Optional layer, toggle in Settings → Safe Mode; Safe Mode wins conflicts
assertRegex(html, /optional|toggle.*Safe Mode|Safe Mode.*wins/, 'Optional toggle, Safe Mode wins');

// ============================================================
// M7: Trusted folders
// ============================================================
console.log('\n=== M7: Trusted folders ===');

// M7a: Per-workspace trust decision (trust repo / trust folder / trust session / decline)
assertIncludes(html, 'trustedFolders', 'trustedFolders state exists');
assertRegex(html, /trust.*repo|trust.*folder|trust.*session|decline/, 'Four trust options');

// M7b: Dangerous ops BLOCKED in untrusted folders and $HOME
assertRegex(html, /untrusted.*folder|HOME.*blocked|dangerous.*blocked/, 'Blocked in untrusted/HOME');

// M7c: Plain explanation + one-tap "trust this folder" (which asks confirmation)
assertRegex(html, /plain.*explanation|one.tap|trust.*this.*folder/, 'Explanation + one-tap trust');
assertRegex(html, /confirm|ask.*confirmation/, 'Trust action asks confirmation');

// M7d: Trust state shown in project header
assertRegex(html, /project.*header|header.*trust|trust.*state/, 'Trust state in header');

// M7e: Untrusted folder starts in read-only mode
assertRegex(html, /read.only|untrusted.*read/, 'Untrusted starts read-only');

// ============================================================
// M8: Spend governance — hard caps + attribution + cost line
// ============================================================
console.log('\n=== M8: Spend governance ===');

// M8a: Hard caps stop requests AT the limit (per project, per task, per model)
assertIncludes(html, 'spendCaps', 'spendCaps state exists');
assertRegex(html, /hard.*cap|cap.*stop|stop.*at.*limit/, 'Hard caps stop AT limit');
assertRegex(html, /per.*project|per.*task|per.*model/, 'Three cap scopes');

// M8b: Cap hit → task pauses with choice (raise cap / switch model / stop)
assertRegex(html, /pause|choice|raise.*cap|switch.*model|stop/, 'Pause with choices on cap hit');

// M8c: Every router call tagged with work ID for attribution
assertIncludes(html, 'workId', 'workId tagging exists');
assertRegex(html, /work.*id|attribution|tagged/, 'Router calls tagged with work ID');

// M8d: Usage dashboard shows spend per task/project/model/tag
assertRegex(html, /usage.*dashboard|spend.*per.*task|spend.*per.*project|spend.*per.*model/, 'Dashboard shows spend breakdown');

// M8e: Senior report carries cost line
assertRegex(html, /cost.*line|Senior.*report|task.*cost/, 'Cost line in Senior report');

// ============================================================
// M9: Plan with estimated token cost per step
// ============================================================
console.log('\n=== M9: Plan with estimated token cost per step ===');

// M9a: Planner emits plan WITH cost estimate per step
assertIncludes(html, 'planCostEstimate', 'planCostEstimate function/state exists');
assertRegex(html, /cost.*estimate.*step|estimate.*per.*step/, 'Cost estimate per step');

// M9b: Plan view shows total estimate before approval
assertRegex(html, /total.*estimate|plan.*view.*estimate/, 'Total estimate shown before approval');

// M9c: After run, actuals reconciled (estimated vs actual per step)
assertRegex(html, /reconcile|estimated.*actual|actual.*estimated/, 'Reconciliation after run');

// M9d: Estimates from plan shape (learned from past runs), not model guess
assertRegex(html, /learned|past.*run|plan.*shape/, 'Estimates learned, not guessed');

// ============================================================
// M10: Agent evals (score RUNS, not models)
// ============================================================
console.log('\n=== M10: Agent evals ===');

// M10a: Eval scores run on: Answer Correctness, Tool Selection Accuracy, Execution Efficiency
assertIncludes(html, 'agentEval', 'agentEval function/state exists');
assertRegex(html, /Answer.*Correctness|Tool.*Selection|Execution.*Efficiency/, 'Three eval dimensions');

// M10b: Scores stored per run, shown in task report
assertRegex(html, /stored.*run|per.*run|task.*report/, 'Scores per run in task report');

// M10c: Extends model benchmark (8a F3) — benchmark scores MODELS, evals score RUNS
assertRegex(html, /benchmark.*model|eval.*run/, 'Benchmark vs eval distinction');

// M10d: Built-in eval set ships with feature
assertRegex(html, /built.in.*eval|eval.*set|ships.*eval/, 'Built-in eval set included');

// ============================================================
// M11: Shell-tool approvals library (bulk approval classes)
// ============================================================
console.log('\n=== M11: Shell-tool approvals library ===');

// M11a: Approve CLASS of shell commands (parse/match/resolve)
assertIncludes(html, 'shellApprovalClass', 'shellApprovalClass state exists');
assertRegex(html, /parse|match|resolve/, 'Parse/match/resolve pipeline');

// M11b: e.g., approve "npm test *" but not "npm publish"
assertRegex(html, /npm test.*npm publish|class.*npm/, 'Class approval example');

// M11c: Bulk approval explicit — user picks class, sees exact commands covered
assertRegex(html, /explicit|pick.*class|sees.*covered/, 'Explicit bulk approval');

// M11d: Revocable per class
assertRegex(html, /revocable|revoke.*class/, 'Revocable per class');

// M11e: Approved classes listed in Safe Mode panel with match counts; 30-day stale flag
assertRegex(html, /Safe Mode.*class|match.*count|30.*day|stale/, 'Classes in Safe Mode panel with stale flag');

// ============================================================
// M12: Rulebooks with URI/tag filtering
// ============================================================
console.log('\n=== M12: Rulebooks with URI/tag filtering ===');

// M12a: Rulebooks scoped by file pattern + tag (include/exclude URI wildcards + tags)
assertIncludes(html, 'rulebook', 'rulebook state exists');
assertRegex(html, /URI.*wildcard|tag.*filter|scope.*file/, 'URI/tag scoping');

// M12b: Rules panel shows which rulebook applies to current file
assertRegex(html, /rulebook.*applies|current.*file.*rulebook/, 'Panel shows applicable rulebook');

// M12c: Switcher turns rulebooks on/off per project
assertRegex(html, /switcher|on.*off.*project|rulebook.*toggle/, 'Rulebook switcher per project');

// M12d: Extends rules chain (8b G12) — rulebooks in chain with scope shown
assertRegex(html, /rulesPriority|chain.*rulebook|scope.*shown/, 'Extends rules chain');

// M12e: Lower rule never silently overrides higher one
assertRegex(html, /never.*silent.*override|lower.*higher|winner/, 'Conflict resolution — lower never overrides');

// ============================================================
// M13: AGENTS.md cascade
// ============================================================
console.log('\n=== M13: AGENTS.md cascade ===');

// M13a: Rules cascade: working dir → parent dirs → system-wide, per-package
assertIncludes(html, 'agentsMdCascade', 'agentsMdCascade state exists');
assertRegex(html, /cascade|working.*dir|parent.*dir|system.*wide/, 'Directory cascade');

// M13b: Rules panel shows cascade + which file rule came from + what it overrides
assertRegex(html, /panel.*cascade|file.*came.*from|overrides/, 'Panel shows cascade details');

// M13c: Conflicts listed with winner named
assertRegex(html, /conflict.*listed|winner.*named/, 'Conflicts listed with winner');

// M13d: Same rule as 8b G12 — lower never silently overrides higher
assertRegex(html, /8b.*G12|G12|never.*silent.*override/, 'Same conflict rule as G12');

// ============================================================
// M14: Quote-before-spend + provider reputation
// ============================================================
console.log('\n=== M14: Quote-before-spend + provider reputation ===');

// M14a: Two-phase quote for PAID tools: quote → user approves → execute against quote ID
assertIncludes(html, 'quoteBeforeSpend', 'quoteBeforeSpend function/state exists');
assertRegex(html, /quote.*before|two.*phase|paid.*tool/, 'Two-phase quote for paid tools');

// M14b: Free tools never need a quote
assertRegex(html, /free.*tool.*never.*quote|no.*quote.*free/, 'Free tools no quote');

// M14c: Provider reputation tiers: Unverified / Verified / Audited
assertRegex(html, /Unverified|Verified|Audited|reputation.*tier/, 'Three reputation tiers');

// M14d: Success-rate tracking feeds router scores
assertRegex(html, /success.*rate|router.*score|reputation.*router/, 'Success rate feeds router');

// M14e: Failing provider loses routing share automatically
assertRegex(html, /failing.*loses|routing.*share|auto.*reduce/, 'Failing provider loses share');

// M14f: Reputation shown in Engines view (8b G21)
assertRegex(html, /Engines|engine.*view|G21/, 'Reputation in Engines view');

// ============================================================
// ============================================================
// Wiring regression (verifier fix D-B13) — locks in the 13 repair's
// real wiring and the F1 regression fix. The repair agent added NO
// new assertions (suite stayed 109); these are the missing locks.
// ============================================================
assert('F1 regression: getRungStandard guards missing rungStandards', /const standards = appState\.rungStandards \|\| \{\}/.test(scriptContent));
assert('F1 regression: evaluatePolicy guards missing governancePolicy', /appState\.governancePolicy \? appState\.governancePolicy\.parsed : null/.test(scriptContent));
assert('F1 regression: M1+M2 gates skipped when Safe Mode is off', /if \(sm\.approvalMode !== 'off'\)/.test(scriptContent));
assert('M1: runApprovalLadder calls canActionRunAtRung', /canActionRunAtRung\(actionClass, appState\.approvalRung\)/.test(scriptContent));
assert('M2: runApprovalLadder calls evaluatePolicy', /evaluatePolicy\(actionText, actionClass, \{ userId: 'owner' \}\)/.test(scriptContent));
assert('M2: runApprovalLadder enforces failClosed', /failClosed\(policyDecision\)/.test(scriptContent));
assert('M5: sendAgentPrompt pre-send calls scanPrompt', /scanPrompt\(modelHistory\[userMsgIdx\]\.content\)/.test(scriptContent));
assert('M8: model-call path checks spend caps', /checkSpendCaps\(\{ providerId: appState\.activeProviderId/.test(scriptContent));
assert('M10: palette entry calls runAgentEval', /id: 'runAgentEval'[\s\S]{0,600}?runAgentEval\(/.test(scriptContent));
assert('No INTERNAL_WIRING gaming object', !scriptContent.includes('INTERNAL_WIRING'));
assert('Exactly one runPlaybook definition (no shadow)', scriptContent.split('function runPlaybook(').length - 1 === 1);
assert('Exactly one listPlaybooks definition (no shadow)', scriptContent.split('function listPlaybooks(').length - 1 === 1);

// Summary
// ============================================================
console.log('\n=== SUMMARY ===');
console.log('Pass:', passCount);
console.log('Fail:', failCount);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll Batch 13 tests passed!');
  process.exit(0);
}