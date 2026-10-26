// H5.4 REPAIR — Wire fireHook call sites test
// NO-JSDOM extraction & eval test — proves fireHook is CALLED at the three sites

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

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
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

// Create a minimal global environment for eval
const globalScope = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date,
  Math,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Map,
  Set,
  Promise,
  Error,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  document: {
    createElement: () => ({
      className: '',
      style: {},
      innerHTML: '',
      appendChild: () => {},
      remove: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      closest: () => null,
      setAttribute: () => {},
      getAttribute: () => null
    }),
    body: { appendChild: () => {}, querySelector: () => null },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: { 
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: '' }
  },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  crypto: { randomUUID: () => 'test-uuid-' + Math.random().toString(36).slice(2) },
  fetch: async () => ({ ok: true, json: async () => ({}), text: async () => '' }),
  escapeHtml: (s) => String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'"),
  t: (key) => key,
  logActivity: () => {},
  saveAppState: () => {},
  recordSessionEvent: () => {},
  recordAutonomyCheck: () => {},
  getTeamV2: () => ({}),
  appendTeamChat: () => {},
  appendTeamChatWithActions: () => {},
  renderTaskBoard: () => {},
  updateAgentStatusChips: () => {},
  callLLMWithAgent: async () => '',
  callLLMWithFallback: async () => '',
  parseAndApplyBlocks: async () => ({ chips: [], fileModified: false, toolsUsed: [], noteReads: [] }),
  parseToolsUsedLine: () => {},
  validateScheduledTask: () => ({ valid: true }),
  calculateNextRun: () => Date.now() + 86400000,
  tryTaskDoneTransition: () => true,
  releaseGateBlockedTasks: () => {},
  detectDisputes: () => [],
  arbitrateDispute: async () => {},
  collectReviewFlags: () => [],
  createAgent: () => ({ id: 'test-agent' }),
  getAllSkillsForLibrarian: () => [],
  loadSkillContent: () => null,
  loadToolContent: () => null,
  buildAutonomyCatalogText: () => '',
  buildSystemContextWithGuard: () => '',
  getSkillPackInstructions: () => '',
  queryGraph: () => ({ nodes: [], edges: [] }),
  explainGraph: () => ({ node: null, summary: '', byType: {} }),
  pathGraph: () => ({ path: [], summary: '' }),
  PROVIDER_PRESETS: {
    duckduckgo: { name: 'DuckDuckGo', model: 'duckduckgo' }
  },
  STORAGE_KEY: 'test',
  AUTONOMY_CATALOG: {
    skills: [],
    mcps: [],
    vibeSkills: [],
    newMcps: [],
    pluginPacks: []
  },
  TOOL_DEFINITIONS: {},
  // Test tracking
  testHookCalls: {
    'build-finish': [],
    'task-complete': [],
    'senior-reject': []
  }
};

// Eval the script in the global scope
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: 'index.html', timeout: 10000 });
} catch (e) {
  console.error('FAIL: Script execution error:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// Now set up appState and mocks by evaluating in the same context
const setupCode = `
// Initialize appState with test data
appState.providers = { 'test-provider': { name: 'Test', model: 'test-model' } };
appState.activeProviderId = 'test-provider';
appState.agents = { 
  'agent-1': { id: 'agent-1', name: 'Test Agent', providerId: 'test-provider', skillPacks: [] },
  'agent-2': { id: 'agent-2', name: 'Frontend Dev', providerId: 'test-provider', skillPacks: [], rolePrompt: 'You are frontend' }
};
appState.activeAgentId = 'agent-1';
appState.teamRoster = ['agent-1', 'agent-2'];
appState.teamSeniorId = 'agent-1';
appState.teamMode = true;
appState.teamReviewRound = 0;
appState.teamTaskBoard = [];
appState.seniorRejectCounts = {};

// Store original functions
const originalGetHooksForEvent = getHooksForEvent;
const originalExecuteHookAction = executeHookAction;

// Override getHooksForEvent to return test hooks for our events
getHooksForEvent = function(event) {
  if (event === 'build-finish' || event === 'task-complete' || event === 'senior-reject') {
    return [{ id: 'test-hook-' + event, enabled: true, event: event, condition: '', action: { type: 'log' } }];
  }
  return originalGetHooksForEvent ? originalGetHooksForEvent(event) : [];
};

// Override executeHookAction to track calls
executeHookAction = async function(action, data) {
  if (data && testHookCalls[data.event]) {
    testHookCalls[data.event].push(data);
  }
  return originalExecuteHookAction ? originalExecuteHookAction(action, data) : Promise.resolve();
};

// The script's own function definitions overwrite the no-op stubs above when
// it is eval'd, so re-stub everything the driven flows touch (DOM + LLM +
// graph + budget) AFTER eval. Without these, runExecutionPhase /
// runReviewPhase crash on document access or try a real network call.
logActivity = () => {};
callLLMWithFallback = async () => 'Task completed successfully';
callLLMWithAgent = async () => {
  const replies = globalThis.__reviewReplies || ['APPROVED - all good'];
  const i = globalThis.__reviewCall || 0;
  globalThis.__reviewCall = i + 1;
  return replies[i] !== undefined ? replies[i] : 'APPROVED - all good';
};
parseAndApplyBlocks = async () => ({ chips: [], fileModified: false, toolsUsed: ['file-write'], noteReads: [] });
parseToolsUsedLine = () => {};
recordAgentUsage = () => {};
assertTeamBudget = () => {};
appendTeamChat = () => {};
appendTeamChatWithActions = () => {};
renderTaskBoard = () => {};
updateAgentStatusChips = () => {};
recordSessionEvent = () => {};
setTeamPhase = () => {};
// getTeamV2 must return ONE persistent object: runReviewPhase assigns
// lastReviewFlags on one call and reads .length on the next — a fresh {}
// per call throws "Cannot read properties of undefined (reading 'length')".
globalThis.__teamV2State = {};
getTeamV2 = () => globalThis.__teamV2State;
collectReviewFlags = () => [];
detectDisputes = () => [];
tryTaskDoneTransition = () => true;
releaseGateBlockedTasks = () => {};
buildSystemContextWithGuard = () => 'test context';
getSkillPackInstructions = () => '';
queryGraph = () => ({ nodes: [], edges: [], summary: '' });
explainGraph = () => ({ node: null, summary: '', byType: {} });
pathGraph = () => ({ path: [], summary: '' });
getCurrentSession = () => ({ id: 'test-session', name: 'Test', files: {} });

// Wrap fireHook itself to record (event, data): fireHook's data objects carry
// NO event field, so recording inside executeHookAction (data.event) can never
// work. The wrapper records synchronously before delegating, so assertions
// made after an awaited flow see every call even though the call sites are
// fire-and-forget (.catch only).
const originalFireHook = fireHook;
fireHook = async function(event, data) {
  if (testHookCalls[event]) testHookCalls[event].push(data);
  return originalFireHook(event, data);
};
`;

try {
  vm.runInContext(setupCode, context, { filename: 'setup.js', timeout: 5000 });
} catch (e) {
  console.error('FAIL: Setup code error:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// ===== TESTS =====

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

// Helper to get testHookCalls from context
function getTestHookCalls() {
  return context.testHookCalls;
}

// Helper to run async test code in context
async function runTestInContext(code) {
  const wrappedCode = '(async function() {' + code + '})()';
  return await vm.runInContext(wrappedCode, context, { timeout: 10000 });
}

// Top-level await is not allowed in this repo's Node setup (no package.json:
// a file mixing require() with top-level await fails to load), so the whole
// execution phase runs inside one async main() instead.
// ---------------------------------------------------------------------------
(async function main() {

// ---------------------------------------------------------------------------
// Test 1: build-finish fires in Team Mode executeAgentTask
// ---------------------------------------------------------------------------
console.log('\n--- Test 1: build-finish in Team Mode executeAgentTask ---');

// NOTE: the Team Mode function was shadowed by the single-mode
// executeAgentTask(task) sharing its name, so runExecutionPhase's call
// reached the wrong function and every team task threw 'No prompt provided
// for agent mode'. The team function is now executeTeamAgentTask (its own
// binding) — Test 1 calls it directly; Test 3 drives the full
// runExecutionPhase loop.
const testCode1 = `
// Reset tracking
testHookCalls['build-finish'] = [];
testHookCalls['task-complete'] = [];

const mockAgent = { id: 'agent-1', name: 'Test Agent', providerId: 'test-provider', skillPacks: [] };
const mockTask = { description: 'Build a feature', id: 'task-1' };

// Run the real Team Mode executeTeamAgentTask (LLM + file-apply stubbed in setup)
const result = await executeTeamAgentTask(mockAgent, mockTask);
return result;
`;

let result1;
try {
  result1 = await runTestInContext(testCode1);
} catch (e) {
  console.log('FAIL: Test 1 threw:', e.message);
  console.error(e.stack);
  failed += 6;
}

const calls1 = getTestHookCalls()['build-finish'];
assert('executeTeamAgentTask returns result', result1 && result1.summary !== undefined);
assert('build-finish hook fired once', calls1.length === 1, 'fired ' + calls1.length + ' times');
assert('build-finish data has agent', calls1[0] && calls1[0].agent && calls1[0].agent.id === 'agent-1');
assert('build-finish data has task description', calls1[0] && calls1[0].task === 'Build a feature');
assert('build-finish data has summary', calls1[0] && typeof calls1[0].summary === 'string');
assert('build-finish data has toolsUsed array', calls1[0] && Array.isArray(calls1[0].toolsUsed));

// ---------------------------------------------------------------------------
// Test 2: build-finish fires in single-mode executeAgentTask
// ---------------------------------------------------------------------------
console.log('\n--- Test 2: build-finish in single-mode executeAgentTask ---');

const testCode2 = `
// Reset tracking
testHookCalls['build-finish'] = [];

const mockTask2 = { 
  name: 'Single Mode Task', 
  prompt: 'Do something', 
  skills: [], 
  modelPin: 'test-provider' 
};

appState.activeAgentId = 'agent-1';

// Run the single-mode executeAgentTask
const result = await executeAgentTask(mockTask2);
return result;
`;

let result2;
try {
  result2 = await runTestInContext(testCode2);
} catch (e) {
  console.log('FAIL: Test 2 threw:', e.message);
  console.error(e.stack);
  failed += 6;
}

const calls2 = getTestHookCalls()['build-finish'];
assert('single executeAgentTask returns result', result2 && result2.response !== undefined);
assert('build-finish hook fired once in single mode', calls2.length === 1, 'fired ' + calls2.length + ' times');
assert('build-finish data has agent in single mode', calls2[0] && calls2[0].agent && calls2[0].agent.id === 'agent-1');
assert('build-finish data has task name in single mode', calls2[0] && calls2[0].task === 'Single Mode Task');
assert('build-finish data has summary in single mode', calls2[0] && typeof calls2[0].summary === 'string');
assert('build-finish data has toolsUsed array in single mode', calls2[0] && Array.isArray(calls2[0].toolsUsed));

// ---------------------------------------------------------------------------
// Test 3: task-complete fires in runExecutionPhase
// ---------------------------------------------------------------------------
console.log('\n--- Test 3: task-complete in runExecutionPhase ---');

const testCode3 = `
// Reset tracking
testHookCalls['task-complete'] = [];
testHookCalls['build-finish'] = [];

// Setup team task board
appState.teamTaskBoard = [
  { id: 'task-1', title: 'Task 1', description: 'First task', owner: 'agent-1', status: 'pending', dependsOn: [], output: '' },
  { id: 'task-2', title: 'Task 2', description: 'Second task', owner: 'agent-1', status: 'pending', dependsOn: ['task-1'], output: '' }
];
appState.teamRoster = ['agent-1'];
appState.teamSeniorId = 'agent-1';
appState.teamMode = true;
appState.teamReviewRound = 0;

// Mock functions needed by runExecutionPhase
setTeamPhase = function() {};
appendTeamChat = function() {};
appendTeamChatWithActions = function() {};
renderTaskBoard = function() {};
updateAgentStatusChips = function() {};
assertTeamBudget = function() {};
recordAgentUsage = function() {};

// NOTE: the execution phase calls executeTeamAgentTask per task (renamed
// from executeAgentTask — the shared name let the single-mode definition
// shadow the team one). The real team function runs (LLM + file-apply are
// stubbed in setup) and must fire build-finish AND task-complete.
await runExecutionPhase();
`;

try {
  await runTestInContext(testCode3);
} catch (e) {
  console.log('FAIL: Test 3 threw:', e.message);
  console.error(e.stack);
  failed += 5;
}

const calls3 = getTestHookCalls()['task-complete'];
assert('runExecutionPhase completes', true);
assert('task-complete hook fired twice (two tasks)', calls3.length === 2, 'fired ' + calls3.length + ' times');
assert('task-complete data has taskId', calls3[1] && calls3[1].taskId);
assert('task-complete data has description', calls3[1] && calls3[1].description);
assert('task-complete data has agent', calls3[1] && calls3[1].agent && calls3[1].agent.id === 'agent-1');

// ---------------------------------------------------------------------------
// Test 4: senior-reject fires with incrementing rejectCount
// ---------------------------------------------------------------------------
console.log('\n--- Test 4: senior-reject with rejectCount increment ---');

const testCode4 = `
// Reset tracking
testHookCalls['senior-reject'] = [];

// Reset reject counts
appState.seniorRejectCounts = {};
appState.teamTaskBoard = [
  { id: 'task-1', title: 'Task 1', description: 'First task', owner: 'agent-1', status: 'in-review', output: 'output 1' },
  { id: 'task-2', title: 'Task 2', description: 'Second task', owner: 'agent-2', status: 'in-review', output: 'output 2' }
];
appState.teamRoster = ['agent-1', 'agent-2'];
appState.teamSeniorId = 'agent-1';
appState.agents = {
  'agent-1': { id: 'agent-1', name: 'Senior Dev', rolePrompt: 'You are senior', providerId: 'test-provider', skillPacks: [] },
  'agent-2': { id: 'agent-2', name: 'Frontend Dev', rolePrompt: 'You are frontend', providerId: 'test-provider', skillPacks: [] }
};
appState.teamReviewRound = 0;

// NOTE: drive the REAL runReviewPhase() — no local processRework copy. The
// setup's callLLMWithAgent stub serves canned replies in order; each review
// round consumes one review reply plus one rework reply (the rework loop
// calls callLLMWithAgent again for the fix). Round 1 rejects Frontend Dev
// (count 1), round 2 rejects Frontend Dev again (count 2), round 3 rejects
// Senior Dev / agent-1 (count 1 for that owner+task).
globalThis.__reviewReplies = [
  'REWORK: Frontend Dev | Issue: Missing error handling | Fix: Add try-catch blocks',
  'Fixed output 1',
  'REWORK: Frontend Dev | Issue: Still missing validation | Fix: Add input validation',
  'Fixed output 2',
  'REWORK: Senior Dev | Issue: Architecture issue | Fix: Refactor module',
  'Fixed output 3'
];
globalThis.__reviewCall = 0;

// Round 1 — first reject (Frontend Dev, count 1)
await runReviewPhase();

// Round 2 — second reject, same owner+task (Frontend Dev, count 2)
await runReviewPhase();

// Round 3 — reject for a different agent+task (Senior Dev / agent-1, count 1)
await runReviewPhase();
`;

try {
  await runTestInContext(testCode4);
} catch (e) {
  console.log('FAIL: Test 4 threw:', e.message);
  console.error(e.stack);
  failed += 10;
}

const calls4 = getTestHookCalls()['senior-reject'];
assert('First reject: rejectCount is 1', calls4.length >= 1 && calls4[0].rejectCount === 1, 
  'count=' + calls4.length + ', rejectCount=' + (calls4[0]?.rejectCount));
assert('First reject: data has owner', calls4[0] && calls4[0].owner === 'agent-2');
assert('First reject: data has taskId', calls4[0] && calls4[0].taskId === 'task-2');
assert('First reject: data has reason', calls4[0] && calls4[0].reason === 'Missing error handling');

assert('Second reject: rejectCount increments to 2', calls4.length >= 2 && calls4[1].rejectCount === 2,
  'count=' + calls4.length + ', rejectCount=' + (calls4[1]?.rejectCount));
assert('Second reject: same owner+task', calls4[1] && calls4[1].owner === 'agent-2' && calls4[1].taskId === 'task-2');

assert('Third reject (different agent+task): rejectCount is 1', calls4.length >= 3 && calls4[2].rejectCount === 1,
  'count=' + calls4.length + ', rejectCount=' + (calls4[2]?.rejectCount));
assert('Third reject: different owner', calls4[2] && calls4[2].owner === 'agent-1');

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('H5.4 REPAIR: FAILED');
  process.exit(1);
}
console.log('H5.4 REPAIR: ALL TESTS PASSED (' + passed + '/' + passed + ')');
})().catch(e => { console.error('FAIL: uncaught error in test runner:', e); process.exit(1); });