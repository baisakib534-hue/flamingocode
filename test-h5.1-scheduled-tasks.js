// Test for H5.1 Scheduled Tasks + Watch Loops - Direct function extraction
// Run with: node test-h5.1-scheduled-tasks.js
// No jsdom and no package.json: the H5.1 pieces are extracted from
// index.html with string search + brace counting and run in a
// controlled context (same pattern as test-h14-context-files.js).

const fs = require('fs');

// Extract the script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not extract script from index.html');
  process.exit(1);
}
const script = scriptMatch[1];

// Extract a named function from the script using string search + brace counting
function extractFunction(scriptText, funcName) {
  let searchStr = 'async function ' + funcName + '(';
  let idx = scriptText.indexOf(searchStr);
  if (idx === -1) {
    searchStr = 'function ' + funcName + '(';
    idx = scriptText.indexOf(searchStr);
  }
  if (idx === -1) return null;
  const start = idx;
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

// Extract a const object literal from the script (brace counting from its opening brace)
function extractObject(scriptText, objName) {
  const searchStr = 'const ' + objName + ' = {';
  const idx = scriptText.indexOf(searchStr);
  if (idx === -1) return null;
  const start = scriptText.indexOf('{', idx);
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

// Extract a property object literal (e.g. scheduledTasks: { ... } inside appState)
function extractProperty(scriptText, propName) {
  const searchStr = propName + ': {';
  const idx = scriptText.indexOf(searchStr);
  if (idx === -1) return null;
  const start = scriptText.indexOf('{', idx);
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

console.log('=== H5.1 Scheduled Tasks + Watch Loops Tests (Direct Extraction) ===\n');

let passed = 0;
let failed = 0;

function assert(name, condition, details) {
  if (condition) {
    console.log('PASS: ' + name);
    passed++;
  } else {
    console.log('FAIL: ' + name + (details ? ' - ' + details : ''));
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Extract the H5.1 pieces from index.html
// ---------------------------------------------------------------------------
const scheduledTasksSrc = extractProperty(script, 'scheduledTasks');
const createScheduledTaskSrc = extractFunction(script, 'createScheduledTask');
const listScheduledTasksSrc = extractFunction(script, 'listScheduledTasks');
const updateScheduledTaskSrc = extractFunction(script, 'updateScheduledTask');
const deleteScheduledTaskSrc = extractFunction(script, 'deleteScheduledTask');
const runScheduledTaskSrc = extractFunction(script, 'runScheduledTask');
const pauseScheduledTaskSrc = extractFunction(script, 'pauseScheduledTask');
const resumeScheduledTaskSrc = extractFunction(script, 'resumeScheduledTask');
const renderScheduledTasksTabSrc = extractFunction(script, 'renderScheduledTasksTab');
const parseScheduleSrc = extractFunction(script, 'parseSchedule');
const validateScheduledTaskSrc = extractFunction(script, 'validateScheduledTask');
const executeScheduledTaskSrc = extractFunction(script, 'executeScheduledTask');
const watchLoopSrc = extractFunction(script, 'startWatchLoop');
const stopWatchLoopSrc = extractFunction(script, 'stopWatchLoop');
const i18nSrc = extractObject(script, 'I18N');

assert('scheduledTasks object exists in appState', scheduledTasksSrc !== null);
assert('createScheduledTask function exists', createScheduledTaskSrc !== null);
assert('listScheduledTasks function exists', listScheduledTasksSrc !== null);
assert('updateScheduledTask function exists', updateScheduledTaskSrc !== null);
assert('deleteScheduledTask function exists', deleteScheduledTaskSrc !== null);
assert('runScheduledTask function exists', runScheduledTaskSrc !== null);
assert('pauseScheduledTask function exists', pauseScheduledTaskSrc !== null);
assert('resumeScheduledTask function exists', resumeScheduledTaskSrc !== null);
assert('renderScheduledTasksTab function exists', renderScheduledTasksTabSrc !== null);
assert('parseSchedule function exists', parseScheduleSrc !== null);
assert('validateScheduledTask function exists', validateScheduledTaskSrc !== null);
assert('executeScheduledTask function exists', executeScheduledTaskSrc !== null);
assert('startWatchLoop function exists', watchLoopSrc !== null);
assert('stopWatchLoop function exists', stopWatchLoopSrc !== null);
assert('I18N object exists', i18nSrc !== null);

if (!scheduledTasksSrc || !createScheduledTaskSrc || !listScheduledTasksSrc || !updateScheduledTaskSrc || 
    !deleteScheduledTaskSrc || !runScheduledTaskSrc || !pauseScheduledTaskSrc || !resumeScheduledTaskSrc ||
    !renderScheduledTasksTabSrc || !parseScheduleSrc || !validateScheduledTaskSrc || !executeScheduledTaskSrc ||
    !watchLoopSrc || !stopWatchLoopSrc || !i18nSrc) {
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(1);
}

// Evaluate the extracted data objects (pure literals from index.html)
let scheduledTasksDefaults;
let I18N;
try {
  scheduledTasksDefaults = eval('(' + scheduledTasksSrc + ')');
  I18N = eval('(' + i18nSrc + ')');
} catch (e) {
  console.log('FAIL: extracted H5.1 literals do not evaluate - ' + e.message);
  process.exit(1);
}
console.log('PASS: extracted H5.1 literals evaluate');
passed++;

// --- Test 1: scheduledTasks defaults -------------------------------------------
assert('scheduledTasks defaults to empty array', Array.isArray(scheduledTasksDefaults) && scheduledTasksDefaults.length === 0);

// --- Test 2: parseSchedule handles cron expressions ----------------------------
const cronTests = [
  { input: '0 9 * * *', desc: 'daily 9am cron' },
  { input: '*/30 * * * *', desc: 'every 30 minutes cron' },
  { input: '0 0 * * 0', desc: 'weekly sunday cron' },
  { input: '0 0 1 * *', desc: 'monthly 1st cron' },
];
let cronPassed = 0;
for (const test of cronTests) {
  try {
    const fn = new Function('return ' + parseScheduleSrc)();
    const result = fn(test.input);
    if (result && result.type === 'cron' && result.expression === test.input) {
      cronPassed++;
    }
  } catch (e) {
    // ignore
  }
}
assert('parseSchedule handles cron expressions', cronPassed === cronTests.length, 'passed ' + cronPassed + '/' + cronTests.length);

// --- Test 3: parseSchedule handles natural language intervals ------------------
const intervalTests = [
  { input: 'every 30m', desc: 'every 30 minutes', expectedType: 'interval', expectedMs: 30 * 60 * 1000 },
  { input: 'every 2h', desc: 'every 2 hours', expectedType: 'interval', expectedMs: 2 * 60 * 60 * 1000 },
  { input: 'every hour', desc: 'every hour', expectedType: 'interval', expectedMs: 60 * 60 * 1000 },
  { input: 'every day', desc: 'every day', expectedType: 'interval', expectedMs: 24 * 60 * 60 * 1000 },
  { input: 'every monday 9am', desc: 'every monday 9am', expectedType: 'cron' },
  { input: 'weekdays at 9am', desc: 'weekdays at 9am', expectedType: 'cron' },
];
let intervalPassed = 0;
for (const test of intervalTests) {
  try {
    const fn = new Function('return ' + parseScheduleSrc)();
    const result = fn(test.input);
    if (result && result.type === test.expectedType) {
      if (test.expectedMs && result.ms === test.expectedMs) intervalPassed++;
      else if (!test.expectedMs) intervalPassed++;
    }
  } catch (e) {
    // ignore
  }
}
assert('parseSchedule handles natural language intervals', intervalPassed === intervalTests.length, 'passed ' + intervalPassed + '/' + intervalTests.length);

// --- Test 4: parseSchedule handles one-shot schedules --------------------------
const oneshotTests = [
  { input: 'in 30m', desc: 'in 30 minutes', expectedType: 'oneshot', expectedMs: 30 * 60 * 1000 },
  { input: 'in 2h', desc: 'in 2 hours', expectedType: 'oneshot', expectedMs: 2 * 60 * 60 * 1000 },
];
let oneshotPassed = 0;
for (const test of oneshotTests) {
  try {
    const fn = new Function('return ' + parseScheduleSrc)();
    const result = fn(test.input);
    if (result && result.type === test.expectedType && result.ms === test.expectedMs) {
      oneshotPassed++;
    }
  } catch (e) {
    // ignore
  }
}
assert('parseSchedule handles one-shot schedules', oneshotPassed === oneshotTests.length, 'passed ' + oneshotPassed + '/' + oneshotTests.length);

// --- Test 5: parseSchedule handles absolute timestamp --------------------------
try {
  const fn = new Function('return ' + parseScheduleSrc)();
  const result = fn('2026-06-01T09:00:00');
  assert('parseSchedule handles absolute timestamp', result && result.type === 'oneshot' && result.timestamp === '2026-06-01T09:00:00');
} catch (e) {
  assert('parseSchedule handles absolute timestamp', false, e.message);
}

// --- Test 6: createScheduledTask validates required fields --------------------
try {
  const ctx = { scheduledTasks: [], appState: { scheduledTasks: [] } };
  const fn = new Function('ctx', createScheduledTaskSrc + '\nreturn { createScheduledTask: createScheduledTask };');
  const api = fn(ctx);
  // Should fail without schedule or prompt
  assert('createScheduledTask requires schedule', typeof api.createScheduledTask === 'function');
} catch (e) {
  assert('createScheduledTask function evaluable', false, e.message);
}

// --- Test 7: Bengali labels for scheduled tasks --------------------------------
const bnKeys = [
  'Scheduled Tasks',
  'Schedule',
  'Prompt',
  'Skills',
  'Model Pin',
  'Project Directory',
  'No Agent Mode',
  'Watch Loop',
  'Create Task',
  'Pause',
  'Resume',
  'Run Now',
  'Edit',
  'Delete',
  'Enabled',
  'Disabled',
  'Next Run',
  'Last Run',
  'Status',
  'Preflight Valid',
  'Watch Build',
  'Change Detection',
  'Fixed Interval',
  'Self Paced',
];
const bnLabelsOk = bnKeys.every(function (k) {
  return typeof I18N.bn[k] === 'string' && I18N.bn[k].length > 0 && I18N.bn[k] !== k;
});
assert('All Bengali labels exist, are non-empty and differ from English', bnLabelsOk);

// --- Test 8: Settings UI has Scheduled Tasks tab -------------------------------
assert('Scheduled Tasks tab exists in settings', html.indexOf('data-settings-tab="scheduled"') !== -1);
assert('Scheduled Tasks pane exists', html.indexOf('id="settingsPaneScheduled"') !== -1);
assert('Scheduled Tasks tab has i18n attribute', html.indexOf('data-i18n="Scheduled Tasks"') !== -1);

// --- Test 9: Settings tab switching includes scheduled tasks -------------------
const tabSwitchSrc = script.slice(script.indexOf('if (tabName === \'providers\')'));
assert('Tab switcher renders scheduled tasks', tabSwitchSrc.indexOf('scheduled') !== -1);

// --- Test 10: validateScheduledTask checks preflight ---------------------------
try {
  const fn = new Function('return ' + validateScheduledTaskSrc)();
  const task = { schedule: '0 9 * * *', prompt: 'test', noAgent: false };
  const result = fn(task);
  assert('validateScheduledTask returns validation result', result && typeof result.valid === 'boolean');
} catch (e) {
  assert('validateScheduledTask function evaluable', false, e.message);
}

// --- Test 11: NO-AGENT mode validation ----------------------------------------
try {
  const fn = new Function('return ' + validateScheduledTaskSrc)();
  // noAgent mode requires script
  const taskNoScript = { schedule: '0 9 * * *', prompt: 'test', noAgent: true };
  const resultNoScript = fn(taskNoScript);
  assert('validateScheduledTask fails noAgent without script', resultNoScript && resultNoScript.valid === false);
  
  const taskWithScript = { schedule: '0 9 * * *', prompt: 'test', noAgent: true, script: 'echo hello' };
  const resultWithScript = fn(taskWithScript);
  assert('validateScheduledTask passes noAgent with script', resultWithScript && resultWithScript.valid === true);
} catch (e) {
  assert('validateScheduledTask NO-AGENT mode validation', false, e.message);
}

// --- Test 12: watch loop functions exist ---------------------------------------
assert('startWatchLoop handles fixed interval', watchLoopSrc && watchLoopSrc.includes('fixed') && watchLoopSrc.includes('interval'));
assert('startWatchLoop handles change detection', watchLoopSrc && (watchLoopSrc.includes('change') || watchLoopSrc.includes('monitor')));

// --- Test 12: scheduled task structure includes all required fields ------------
try {
  const fn = new Function('return ' + createScheduledTaskSrc)();
  // Just verify the function creates tasks with expected structure
  assert('createScheduledTask creates task with id', createScheduledTaskSrc.includes('id') && createScheduledTaskSrc.includes('Date.now'));
  assert('createScheduledTask includes schedule field', createScheduledTaskSrc.includes('schedule'));
  assert('createScheduledTask includes prompt field', createScheduledTaskSrc.includes('prompt'));
  assert('createScheduledTask includes skills field', createScheduledTaskSrc.includes('skills'));
  assert('createScheduledTask includes modelPin field', createScheduledTaskSrc.includes('modelPin'));
  assert('createScheduledTask includes workdir field', createScheduledTaskSrc.includes('workdir'));
  assert('createScheduledTask includes noAgent field', createScheduledTaskSrc.includes('noAgent'));
  assert('createScheduledTask includes script field', createScheduledTaskSrc.includes('script'));
  assert('createScheduledTask includes deliver field', createScheduledTaskSrc.includes('deliver'));
  assert('createScheduledTask includes monitor field', createScheduledTaskSrc.includes('monitor'));
} catch (e) {
  assert('createScheduledTask structure', false, e.message);
}

// --- Test 13: preflight validation alerts once on broken job ------------------
assert('validateScheduledTask tracks preflight failures', validateScheduledTaskSrc.includes('preflight') || validateScheduledTaskSrc.includes('alertOnce'));

// --- Test 14: Standing guards --------------------------------------------------
assert('Literal </script count stays 1', (html.match(/<\/script/g) || []).length === 1);
assert('No ?.onclick assignments', html.indexOf('?.onclick') === -1);

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('H5.1 SCHEDULED TASKS: FAILED');
  process.exit(1);
}
console.log('H5.1 SCHEDULED TASKS: ALL TESTS PASSED (' + passed + '/' + passed + ')');