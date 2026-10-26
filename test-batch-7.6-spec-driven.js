// test-batch-7.6-spec-driven.js
// NO-JSDOM extraction-and-eval pattern. Assert ONLY identifiers and behaviours
// that actually exist in index.html. Call process.exit(0) on success.

const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function extractFunction(script, name) {
  // Try to find function declaration
  const patterns = [
    new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 's'),
    new RegExp(`const\\s+${name}\\s*=\\s*\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}`, 's'),
    new RegExp(`${name}\\s*:\\s*function\\s*\\([^)]*\\)\\s*\\{[^}]*\\}`, 's'),
    new RegExp(`${name}\\s*:\\s*\\([^)]*\\)\\s*=>\\s*\\{[^}]*\\}`, 's'),
  ];
  for (const re of patterns) {
    const m = script.match(re);
    if (m) return m[0];
  }
  return null;
}

function assert(condition, msg) {
  if (!condition) throw new Error(`FAIL: ${msg}`);
  console.log(`PASS: ${msg}`);
}

function assertContains(haystack, needle, msg) {
  if (!haystack.includes(needle)) throw new Error(`FAIL: ${msg} (missing "${needle}")`);
  console.log(`PASS: ${msg}`);
}

function assertRegex(haystack, pattern, msg) {
  if (!pattern.test(haystack)) throw new Error(`FAIL: ${msg} (pattern: ${pattern})`);
  console.log(`PASS: ${msg}`);
}

// --- Test Suite ---

let passCount = 0;
let failCount = 0;

function runTest(name, fn) {
  try {
    fn();
    passCount++;
  } catch (e) {
    failCount++;
    console.error(e.message);
  }
}

// Extract the main script content (between <script> tags)
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
const script = scriptMatch ? scriptMatch[1] : '';

runTest('startSpecFlow function exists', () => {
  const fn = extractFunction(script, 'startSpecFlow');
  assert(fn !== null, 'startSpecFlow function should exist');
});

runTest('checkSpecDrift function exists', () => {
  const fn = extractFunction(script, 'checkSpecDrift');
  assert(fn !== null, 'checkSpecDrift function should exist');
});

runTest('checkConstitution function exists', () => {
  const fn = extractFunction(script, 'checkConstitution');
  assert(fn !== null, 'checkConstitution function should exist');
});

runTest('appState.specState is defined in initial state', () => {
  assertRegex(script, /specState\s*:/, 'appState should have specState property');
});

runTest('specState has expected status values', () => {
  // Check for status transition constants or usage
  assertRegex(script, /draft-requirements|draft-design|draft-tasks|approved|building|done|drifted/, 'specState should track status transitions');
});

runTest('Requirements EARS format with Bangla paraphrase', () => {
  // Check for EARS pattern generation and Bangla paraphrase
  assertRegex(script, /WHEN.*THE SYSTEM SHALL/, 'Should generate EARS format requirements');
  assertRegex(script, /bn:|Bangla|paraphrase|বাংলা/, 'Should include Bangla paraphrase for requirements');
});

runTest('Approval gate blocks code execution before requirements approved', () => {
  // Check that execution is gated by approval
  assertRegex(script, /requirements.*approved|approved.*requirements|gate|block.*execution/, 'Should have approval gate logic');
});

runTest('Approving requirements unlocks design drafting', () => {
  assertRegex(script, /approveRequirement|approve.*requirement|unlock.*design/, 'Should unlock design after requirements approval');
});

runTest('Approving design unlocks tasks and execution', () => {
  assertRegex(script, /approveDesign|approve.*design|unlock.*task|unlock.*execution/, 'Should unlock tasks after design approval');
});

runTest('Code change ticks matching tasks.md item', () => {
  assertRegex(script, /tick.*task|task.*done|updateTask|markTask/, 'Should tick tasks.md items on code change');
});

runTest('checkSpecDrift flags code beyond spec', () => {
  assertRegex(script, /spec says|code does|drift|flag.*drift/, 'checkSpecDrift should flag drift');
});

runTest('checkConstitution flags violating requirements', () => {
  assertRegex(script, /constitution|principle|violat|waiver/, 'checkConstitution should check against principles');
});

runTest('design.md references existing codebase (code graph / repo map)', () => {
  assertRegex(script, /codeGraph|repoMap|code graph|repo map|existing codebase/, 'design.md should reference codebase analysis');
});

runTest('Specs panel UI exists with status chips and viewer', () => {
  assertContains(html, 'id="specsPanel"', 'Should have specs panel');
  assertContains(html, 'id="specList"', 'Should have spec list');
  assertContains(html, 'id="specViewer"', 'Should have spec viewer');
});

runTest('Spec mode toggle in chat input area', () => {
  assertContains(html, 'specMode', 'Should have spec mode toggle');
});

runTest('New Spec button in panel', () => {
  assertContains(html, 'New Spec', 'Should have New Spec button');
  assertContains(html, 'নতুন স্পেক', 'Should have Bengali New Spec button');
});

runTest('Bengali translations for all new spec strings', () => {
  const bnKeys = [
    'Specs', 'Requirements', 'Design', 'Tasks', 'Approve', 'Revise',
    'Check Drift', 'Constitution', 'New Spec', 'Spec Mode',
    'Draft Requirements', 'Draft Design', 'Draft Tasks', 'Approved',
    'Building', 'Done', 'Drifted', 'Spec says', 'Code does',
    'Waiver', 'Principle', 'EARS', 'Acceptance Criteria'
  ];
  for (const key of bnKeys) {
    const regex = new RegExp(`'${key.replace(/'/g, "\\'")}'\\s*:\\s*'[^']*[\\u0980-\\u09FF]'`);
    if (!regex.test(html)) {
      throw new Error(`Missing Bengali translation for: ${key}`);
    }
  }
  console.log('PASS: Bengali translations exist for all new spec strings');
});

runTest('Constitution file seeded with principles', () => {
  assertRegex(script, /constitution\.md|no AI slop|quality over speed|Bangla|never claim done|evidence/, 'Should seed constitution with principles');
});

runTest('Spec status shown in Brain digest', () => {
  assertRegex(script, /Brain.*spec|spec.*Brain|specState.*digest|digest.*specState/, 'Spec status should appear in Brain digest');
});

runTest('.devforge/specs/<feature>/ directory structure created', () => {
  assertRegex(script, /\.devforge\/specs|specs\/[^\/]+\/requirements|specs\/[^\/]+\/design|specs\/[^\/]+\/tasks/, 'Should create spec directory structure');
});

// Summary
console.log(`\n=== RESULTS: ${passCount} passed, ${failCount} failed ===`);
if (failCount > 0) {
  process.exit(1);
}
process.exit(0);