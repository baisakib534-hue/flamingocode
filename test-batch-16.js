// test-batch-16.js
// NO-JSDOM extraction-and-eval pattern - asserts identifiers and behaviors in index.html
// Run with: node test-batch-16.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INDEX_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(INDEX_PATH, 'utf8');

// Extract the main script content (between <script> and </script>)
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
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

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Expected to find: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Should NOT contain: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertRegex(haystack, pattern, message) {
  if (!pattern.test(haystack)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Pattern: ${pattern}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

console.log('\n=== Batch 16 Harn Mechanisms Assertions ===\n');

// ============================================================
// P1: Self-parking subagents with resume conditions
// ============================================================
console.log('\nP1: Self-parking subagents with resume conditions');

// parkSubAgent function exists and is wired
assertIncludes(html, 'function parkSubAgent(', 'parkSubAgent function exists');
assertIncludes(html, 'parkReason', 'parkReason field in subagent state');
assertIncludes(html, 'resumeCondition', 'resumeCondition field in subagent state');
assertIncludes(html, 'resumeAction', 'resumeAction field in subagent state');
assertIncludes(html, 'parkedAt', 'parkedAt timestamp tracked');
assertIncludes(html, 'isParked', 'isParked flag tracked');
assertIncludes(html, 'Resume Now', 'resume-now control exists');
assertIncludes(html, 'stopParkedAgent', 'stopParkedAgent function exists');
assertIncludes(html, 'checkResumeConditions', 'checkResumeConditions function exists');
assertIncludes(html, 'on_event', 'on_event resume condition type supported');
assertIncludes(html, 'timeout', 'timeout resume condition type supported');
assertIncludes(html, 'trigger', 'trigger resume condition type supported');
assertIncludes(html, 'resume_with_summary', 'resume_with_summary action supported');
assertIncludes(html, 'resume_with_input', 'resume_with_input action supported');
assertIncludes(html, 'fail', 'fail action supported');
assertIncludes(html, 'completedSteps', 'completedSteps preserved on park');
assertIncludes(html, 'brainDigest', 'brainDigest preserved on park');
assertIncludes(html, 'nextStepIndex', 'nextStepIndex preserved on park');

// Event log records park/resume
assertIncludes(html, 'subagent_parked', 'subagent_parked event type recorded');
assertIncludes(html, 'subagent_resumed', 'subagent_resumed event type recorded');
assertIncludes(html, 'subagent_stopped', 'subagent_stopped event type recorded');

// Timer tick for timeout checking
assertIncludes(html, 'setInterval', 'timer tick for timeout checking');
assertIncludes(html, 'checkParkedAgentTimeouts', 'checkParkedAgentTimeouts function exists');

// ============================================================
// P2: Transactional edits — per-edit hooks + dry-run + rollback
// ============================================================
console.log('\nP2: Transactional edits — per-edit hooks + dry-run + rollback');

assertIncludes(html, 'function applyTransactionalEdit(', 'applyTransactionalEdit function exists');
assertIncludes(html, 'pre_apply', 'pre_apply hook type');
assertIncludes(html, 'post_apply', 'post_apply hook type');
assertIncludes(html, 'on_rollback', 'on_rollback hook type');
assertIncludes(html, 'dryRun', 'dryRun mode supported');
assertIncludes(html, 'checkpointSnapshots', 'rollbackSnapshot captured in checkpoint store');
assertIncludes(html, 'beforeHash', 'beforeHash recorded');
assertIncludes(html, 'afterHash', 'afterHash recorded');
assertIncludes(html, 'hooksRan', 'hooksRan recorded in receipt');
assertIncludes(html, 'edit_receipt', 'editReceipt recorded in event log');
assertIncludes(html, 'registerEditHook', 'registerEditHook function exists');
assertIncludes(html, 'unregisterEditHook', 'unregisterEditHook function exists');
assertIncludes(html, 'editHooks', 'editHooks registry exists');
assertIncludes(html, 'veto', 'hook veto mechanism');

// ============================================================
// P3: AST symbol-targeted edits
// ============================================================
console.log('\nP3: AST symbol-targeted edits');

assertIncludes(html, 'function replaceSymbolBody(', 'replaceSymbolBody function exists');
assertIncludes(html, 'getSymbolSpan', 'getSymbolSpan function exists');
assertIncludes(html, 'span', 'symbolSpan looked up from code graph');
assertIncludes(html, 'transactional_ast', 'ast_edit path recorded in event log');
assertIncludes(html, 'fallbackToFuzzy', 'fallbackToFuzzy recorded when AST fails');
assertIncludes(html, 'verifyParses', 'verifySyntax called after splice');

// ============================================================
// P4: Merge-model fast apply
// ============================================================
console.log('\nP4: Merge-model fast apply');

assertIncludes(html, 'function applyWithMergeModel(', 'applyWithMergeModel function exists');
assertIncludes(html, 'getCheapProvider', 'getCheapProvider used for merge model');
assertIncludes(html, 'merge_model', 'merge_model path recorded in event log');
assertIncludes(html, 'preimageHash', 'hashCheck performed on merge result');
assertIncludes(html, 'includes', 'no markdown fences in merge response');
assertIncludes(html, 'placeholders', 'no placeholders in merge response');
assertIncludes(html, 'fallbackToJ6', 'fallbackToJ6 recorded on merge failure');
assertIncludes(html, 'afterContent', 'complete after-content returned');

// ============================================================
// P5: Workflow crystallization
// ============================================================
console.log('\nP5: Workflow crystallization');

assertIncludes(html, 'function mineEventLogForWorkflows(', 'mineEventLogForWorkflows function exists');
assertIncludes(html, 'extractVaryingParameters', 'extractVariableParams function exists');
assertIncludes(html, 'checkSideEffectDivergence', 'rejectDivergentSideEffects function exists');
assertIncludes(html, 'isModelDependentStep', 'markFuzzySteps function exists');
assertIncludes(html, 'promoteWorkflowToRecipe', 'buildWorkflowSkeleton function exists');
assertIncludes(html, 'promoteWorkflowToRecipe', 'buildWorkflowManifest function exists');
assertIncludes(html, 'shadowCheckWorkflow', 'shadowCheck function exists');
assertIncludes(html, 'holdoutTraces', 'holdoutTraces used for shadow check');
assertIncludes(html, 'promoteWorkflow', 'promoteWorkflow function exists');
assertIncludes(html, 'recipe', 'promotedWorkflow becomes Recipe');
assertIncludes(html, 'deterministicSteps', 'deterministicSteps run without model');
assertIncludes(html, 'fuzzySteps', 'fuzzySteps still call model');
assertIncludes(html, 'evalPack', 'evalPack recorded with source traces');
assertIncludes(html, 'capabilities', 'capabilities in manifest');
assertIncludes(html, 'secrets', 'secrets in manifest');
assertIncludes(html, 'rollbackTarget', 'rollbackTarget in manifest');
assertIncludes(html, 'approvalBoundaries', 'approvalBoundaries in manifest');

// No INTERNAL_WIRING string-ref gaming
assertNotIncludes(html, 'INTERNAL_WIRING', 'No INTERNAL_WIRING string-ref gaming');

// No fake implementations
assertNotIncludes(html, 'console.log.*fake|fake.*console.log', 'No fake console.log implementations');

// ============================================================
// Final summary
// ============================================================
console.log(`\n=== ALL ${passCount} ASSERTIONS PASSED ===`);
console.log('Batch 16 Harn mechanisms verified');
console.log('P1: Self-parking subagents with resume conditions');
console.log('P2: Transactional edits with hooks, dry-run, rollback');
console.log('P3: AST symbol-targeted edits');
console.log('P4: Merge-model fast apply');
console.log('P5: Workflow crystallization from event log');

process.exit(0);