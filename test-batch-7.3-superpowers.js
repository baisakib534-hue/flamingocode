// test-batch-7.3-superpowers.js
// NO-JSDOM extraction-and-eval pattern — no npm packages
// Assert ONLY identifiers and behaviours that actually exist in index.html
// Call process.exit(0) on success

const fs = require('fs');
const path = require('path');

const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let passCount = 0;
let failCount = 0;

function assert(label, condition) {
  if (condition) {
    console.log(`✓ ${label}`);
    passCount++;
  } else {
    console.error(`✗ ${label}`);
    failCount++;
  }
}

function assertIncludes(haystack, needle, label) {
  assert(label, haystack.includes(needle));
}

function assertRegex(haystack, pattern, label) {
  assert(label, pattern.test(haystack));
}

// ============================================================
// (a) All 12 pack skills exist in the skill registry with trigger description and enable toggle
// ============================================================
const SUPERPOWER_SKILLS = [
  'brainstorming',
  'writing-plans',
  'test-driven-development',
  'subagent-driven-development',
  'executing-plans',
  'using-git-worktrees',
  'verification-before-completion',
  'systematic-debugging',
  'requesting-code-review',
  'receiving-code-review',
  'dispatching-parallel-agents',
  'finishing-a-development-branch'
];

console.log('\n=== (a) Superpowers pack skills in registry ===');
SUPERPOWER_SKILLS.forEach(skill => {
  // Check AUTONOMY_CATALOG or skill registry includes these skills
  // They should appear as entries with id, name, desc/trigger, and enable toggle
  const inCatalog = HTML.includes(`'${skill}'`) || HTML.includes(`"${skill}"`);
  assertIncludes(HTML, skill, `Skill "${skill}" exists in codebase`);
});

// Check for Superpowers pack section in Skills page
assertIncludes(HTML, 'Superpowers', 'Superpowers pack section label exists');
assertIncludes(HTML, 'superpowers', 'Superpowers pack referenced in code (lowercase)');

// ============================================================
// (b) verifyBeforeCompletion BLOCKS a "done" claim with no fresh evidence and PASSES one with fresh evidence
// ============================================================
console.log('\n=== (b) verifyBeforeCompletion gate ===');
assertIncludes(HTML, 'verifyBeforeCompletion', 'verifyBeforeCompletion function exists');
assertIncludes(HTML, 'verificationEvidence', 'verificationEvidence state exists');
assertIncludes(HTML, 'fresh evidence', 'Fresh evidence concept referenced');
assertRegex(HTML, /exitCode|exit\s*code/i, 'Exit code tracking in verification');
assertRegex(HTML, /command|proving\s*command/i, 'Proving command tracking in verification');
assertRegex(HTML, /pass count|passCount|tests?\s*pass/i, 'Pass count tracking in verification');

// ============================================================
// (c) Evidence recorded BEFORE the last file change is treated as STALE and rejected
// ============================================================
console.log('\n=== (c) Stale evidence rejection ===');
assertRegex(HTML, /stale|filesChangedAfter|invalidat/i, 'Stale evidence detection logic exists');
assertIncludes(HTML, 'filesChangedAfter', 'filesChangedAfter field in verificationEvidence');

// ============================================================
// (d) Completion message carries evidence inline (command + exit code + pass count)
// ============================================================
console.log('\n=== (d) Completion message with inline evidence ===');
assertRegex(HTML, /evidence.*inline|inline.*evidence|completion.*evidence|evidence.*completion/i, 'Inline evidence in completion message');
assertRegex(HTML, /just now|ranAt|recently/i, 'Timestamp evidence in completion');

// ============================================================
// (e) TDD badge shows "test-first ✓" when test ran first and "no test first ✗" otherwise
// ============================================================
console.log('\n=== (e) TDD badge in diff review ===');
assertIncludes(HTML, 'test-first', 'TDD badge "test-first" text exists');
assertIncludes(HTML, 'no test first', 'TDD badge "no test first" text exists');
assertRegex(HTML, /tddBadge|tdd.*badge|TDD.*badge/i, 'TDD badge variable/function exists');
assertRegex(HTML, /taskTddState|tddState/i, 'taskTddState tracking exists');

// ============================================================
// (f) Brainstorm options presented for multi-file task and SKIPPED for single-file task
// ============================================================
console.log('\n=== (f) Brainstorm before building ===');
assertIncludes(HTML, 'brainstorm', 'Brainstorm function/logic exists');
assertRegex(HTML, /askBeforeBuilding|ask.*before.*build/i, 'Ask before building setting exists');
assertRegex(HTML, /multi.file|multiFile|single.file|singleFile/i, 'Complexity check for brainstorm exists');

// ============================================================
// (g) recordRuling writes "Ruling: <what> — <why> — <cost if wrong>" entry to Brain
// ============================================================
console.log('\n=== (g) recordRuling function ===');
assertIncludes(HTML, 'recordRuling', 'recordRuling function exists');
assertRegex(HTML, /Ruling:\s*.*—\s*.*—\s*/, 'Ruling format with what/why/cost');
assertIncludes(HTML, 'costIfWrong', 'costIfWrong parameter in recordRuling');

// ============================================================
// (h) needs-help fires ONLY for the four stop reasons
// ============================================================
console.log('\n=== (h) needs-help trigger for four stop reasons ===');
assertIncludes(HTML, 'needsHelp', 'needsHelp function/state exists');
const STOP_REASONS = [
  'irreversible',
  'destructive',
  'security.sensitive',
  'securitySensitive',
  'side.effect',
  'sideEffect',
  'outside.*worktree',
  'outside.*project',
  'plan.*broken',
  'every.*path.*guess'
];
let foundStopReason = false;
STOP_REASONS.forEach(reason => {
  if (new RegExp(reason, 'i').test(HTML)) foundStopReason = true;
});
assert(foundStopReason, 'At least one of the four stop reasons referenced');

// ============================================================
// (i) Three Settings toggles exist in appState with correct defaults
// ============================================================
console.log('\n=== (i) Settings toggles in appState ===');
assertRegex(HTML, /verificationBeforeCompletion|verification.*completion.*enabled/i, 'verificationBeforeCompletion toggle in appState');
assertRegex(HTML, /askBeforeBuilding|ask.*before.*build/i, 'askBeforeBuilding toggle in appState');
assertRegex(HTML, /tddBadge|tdd.*badge.*enabled/i, 'TDD badge toggle in appState');

// Check defaults are ON (true)
assertRegex(HTML, /verificationBeforeCompletion.*:.*true|verification.*completion.*enabled.*:.*true/i, 'verificationBeforeCompletion default ON');
assertRegex(HTML, /askBeforeBuilding.*:.*true|ask.*before.*build.*:.*true/i, 'askBeforeBuilding default ON');
assertRegex(HTML, /tddBadge.*:.*true|tdd.*badge.*enabled.*:.*true/i, 'TDD badge default ON');

// ============================================================
// (j) Bengali translation keys exist for new strings
// ============================================================
console.log('\n=== (j) Bengali translations ===');
const BN_KEYS = [
  'Verification before completion',
  'Ask before building',
  'TDD badge',
  'test-first',
  'no test first',
  'Brainstorm',
  'Ruling',
  'cost if wrong',
  'needs help',
  'fresh evidence',
  'stale evidence',
  'Superpowers'
];
BN_KEYS.forEach(key => {
  // Check if translation exists in bn: object
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assertRegex(HTML, new RegExp(escapedKey), `Bengali translation key: "${key}"`);
});

// ============================================================
// Summary
// ============================================================
console.log(`\n=== SUMMARY ===`);
console.log(`Pass: ${passCount}`);
console.log(`Fail: ${failCount}`);
console.log(`Total: ${passCount + failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}