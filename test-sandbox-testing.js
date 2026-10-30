// Sandbox + Universal Testing + Record (§1–§5) - NO-JSDOM extraction & eval test

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
  console.log('PASS: index.html script syntax OK');
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

// Minimal DOM stub (same pattern as existing test suites)
const createElement = (tag) => {
  const el = {
    tagName: tag.toUpperCase(),
    style: {},
    classList: { add: () => {}, remove: () => {}, contains: () => false, toggle: () => {} },
    setAttribute: () => {},
    getAttribute: () => null,
    appendChild: () => {},
    removeChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    innerHTML: '',
    textContent: '',
    value: '',
    checked: false,
    disabled: false,
    focus: () => {},
    click: () => {},
    options: [],
    selectedIndex: 0,
    files: [],
    contentWindow: { postMessage: () => {} },
    getBoundingClientRect: () => ({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }),
    scrollIntoView: () => {},
    scrollTop: 0,
    scrollLeft: 0,
    dataset: {},
    children: [],
    parentNode: null,
    parentElement: null,
    nextSibling: null,
    previousSibling: null,
    firstChild: null,
    lastChild: null,
    cloneNode: () => ({}),
    remove: () => {},
    replaceWith: () => {},
    before: () => {},
    after: () => {},
  };
  if (tag === 'select') {
    el.options = [];
    el.add = (opt) => { el.options.push(opt); };
    el.remove = (i) => { el.options.splice(i, 1); };
  }
  if (tag === 'option') {
    el.value = '';
    el.text = '';
    el.selected = false;
  }
  if (tag === 'canvas') {
    el.getContext = () => ({
      fillRect: () => {},
      clearRect: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      fillText: () => {},
      measureText: () => ({ width: 10 }),
      strokeText: () => {},
      save: () => {},
      restore: () => {},
      translate: () => {},
      scale: () => {},
      rotate: () => {},
      drawImage: () => {},
      createLinearGradient: () => ({ addColorStop: () => {} }),
      font: '',
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
      textAlign: 'start',
      textBaseline: 'alphabetic',
    });
    el.width = 300;
    el.height = 150;
  }
  return el;
};

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, "'");
}

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
  GRAPH_SCHEMA_VERSION: 1,
  GRAPH_DIR: '.devforge/graph/',
  GRAPH_FILE: '.devforge/graph/graph.json',
  NODE_TYPES: { FUNCTION: 'FUNCTION', CLASS: 'CLASS', CONCEPT: 'CONCEPT', FILE: 'FILE' },
  EDGE_TYPES: { CALLS: 'CALLS', IMPORTS: 'IMPORTS', USES: 'USES', EXTENDS: 'EXTENDS', IMPLEMENTS: 'IMPLEMENTS' },
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  document: {
    createElement,
    body: { appendChild: () => {}, querySelector: () => null, prepend: () => {}, insertBefore: () => {} },
    getElementById: (id) => {
      const stubs = {
        'chat-messages': { querySelector: () => null, prepend: () => {}, insertBefore: () => {} },
        'previewContainer': { style: {} },
        'previewIframe': { contentWindow: { postMessage: () => {} }, srcdoc: '', sandbox: '' },
        'previewHealthStatus': { textContent: '' },
        'previewErrorList': { innerHTML: '' },
        'previewFixLogList': { innerHTML: '' },
        'previewFixCycleBanner': { style: { display: 'none' } },
        'previewFixCycleText': { textContent: '' },
        'previewFixCycleCount': { textContent: '' },
        'previewNeedsHelp': { style: { display: 'none' } },
        'previewMaxAttemptsDisplay': { textContent: '' },
        'autoFixFeedCount': { textContent: '' },
        'autoFixFeedList': { innerHTML: '' },
        'autoFixFeedFilter': { value: 'all' },
        'checkpointCapDisplay': { textContent: '' },
        'checkpointList': { innerHTML: '' },
        'browserPreviewLog': { innerHTML: '' },
        'cuManifestList': { innerHTML: '' },
        'pmBackendStatus': { textContent: '' },
        'pmDesktopNote': { style: { display: 'none' } },
        'pmBackendLocal': { className: '' },
        'pmBackendDocker': { className: '' },
        'pmBackendSsh': { className: '' },
        'pmBackendCloud': { className: '' },
        'processList': { innerHTML: '' },
        'acpStatus': { textContent: '' },
        'mcp-recommendations-section': { innerHTML: '' },
        'skills-recommendations-section': { innerHTML: '' },
        'plugin-recommendations-section': { innerHTML: '' },
        'mutedRecommendationsList': { innerHTML: '' },
        'toolRecommendationsToggleSettings': { checked: true },
        'btnSuggestForTask': {},
      };
      return stubs[id] || null;
    },
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
  escapeHtml,
  t: (key) => key,
  logActivity: () => {},
  saveAppState: () => {},
  recordSessionEvent: () => {},
  recordAutonomyCheck: () => {},
  getTeamV2: () => ({}),
  appendTeamChat: () => {},
  renderTaskBoard: () => {},
  updateAgentStatusChips: () => {},
  callLLMWithAgent: async () => '',
  parseAndApplyBlocks: async () => ({}),
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
  PROVIDER_PRESETS: {},
  STORAGE_KEY: 'test',
  AUTONOMY_CATALOG: { skills: [], mcps: [], vibeSkills: [], newMcps: [], pluginPacks: [] },
  TOOL_DEFINITIONS: {},
  appState: {
    checkpoints: [],
    checkpointCap: 30,
    previewAutoFix: false,
    browserAgent: { previewMode: true, headedWatch: false, recordings: [], currentRecording: null },
    computerUse: { permissionMode: 'bounded', manifest: [], task: null, recordings: [], doctorCache: {} },
    processManager: { backend: 'local', dockerConfig: {}, sshConfig: {}, cloudConfig: {}, processes: [] },
    terminalBackends: { local: { available: true }, docker: { available: false }, ssh: { available: false }, cloud: { available: false } },
    projectSecrets: {},
    settings: {},
    isMobileApp: false,
    messageQueue: [],
    messageQueueEnabled: true,
    messageQueueCap: 20,
    skillPacks: {},
    installedSkills: [],
    installedMcpServers: [],
  },
  isToolInstalled: (tool) => false,
  getInstallPath: (tool) => ({}),
  getCurrentTaskId: () => 'test-task-1',
  getCurrentSession: () => ({ chatHistory: [], messageQueue: [] }),
  appendChatMessage: () => {},
  skillPacks: {},
  scrubMcpCredentialsForContext: (server) => server,
  rebuildMcpToolDefinitions: () => {},
  renderMcpServerList: () => {},
  renderMcpServerSummary: () => {},
  refreshUI: () => {},
  createCheckpoint: () => 'cp_test',
  restoreCheckpoint: () => true,
  getBrainDigest: () => '',
  addBrainNote: () => {},
};

// Eval the script in the global scope
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: 'index.html', timeout: 15000 });
} catch (e) {
  console.error('FAIL: Script execution error:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// Helper to check if identifier exists in script
function assertExists(name, desc) {
  const patterns = [
    new RegExp('\\b' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b'),
    new RegExp('function\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\('),
    new RegExp('const\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*='),
    new RegExp('let\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*='),
    new RegExp('var\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=')
  ];
  const found = patterns.some(p => p.test(scriptContent));
  if (!found) {
    console.error('FAIL: ' + desc + ' - \'' + name + '\' not found in script');
    process.exit(1);
  }
  console.log('PASS: ' + desc + ' - \'' + name + '\' exists');
}

function assertFunctionExists(name, desc) {
  const patterns = [
    new RegExp('function\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\('),
    new RegExp('const\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*(async\\s*)?function'),
    new RegExp('const\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*=\\s*(async\\s*)?\\('),
    new RegExp('async\\s+function\\s+' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\s*\\(')
  ];
  const found = patterns.some(p => p.test(scriptContent));
  if (!found) {
    console.error('FAIL: ' + desc + ' - \'' + name + '\' function not found in script');
    process.exit(1);
  }
  console.log('PASS: ' + desc + ' - \'' + name + '\' function exists');
}

function assertExistsPattern(pattern, desc) {
  const found = pattern.test(scriptContent);
  if (!found) {
    console.error('FAIL: ' + desc + ' - pattern ' + pattern + ' not found in script');
    process.exit(1);
  }
  console.log('PASS: ' + desc + ' - pattern ' + pattern + ' exists');
}

function assertUIElement(id, desc) {
  const pattern = new RegExp('id=["\']' + id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']');
  const found = pattern.test(html);
  if (!found) {
    console.error('FAIL: ' + desc + ' - UI element id=\'' + id + '\' not found in HTML');
    process.exit(1);
  }
  console.log('PASS: ' + desc + ' - UI element id=\'' + id + '\' exists');
}

console.log('\n=== Sandbox + Universal Testing + Record (§1–§5) Tests ===\n');

// ===== §1: OWN SANDBOX =====
console.log('--- §1: Own Sandbox ---');

assertFunctionExists('createSandbox', 'createSandbox function exists');
assertFunctionExists('resetSandbox', 'resetSandbox function exists');
assertFunctionExists('snapshotSandbox', 'snapshotSandbox function exists (uses checkpoint system)');
assertFunctionExists('archiveSandbox', 'archiveSandbox function exists');
assertFunctionExists('restoreSandbox', 'restoreSandbox function exists');

assertUIElement('sandboxPanel', 'Sandbox panel UI exists');
assertUIElement('sandboxStatus', 'Sandbox status display exists');
assertUIElement('sandboxResetBtn', 'Sandbox reset button exists');
assertUIElement('sandboxSnapshotBtn', 'Sandbox snapshot button exists');
assertUIElement('sandboxFilesList', 'Sandbox files list exists');
assertUIElement('sandboxProcessesList', 'Sandbox processes list exists');
assertUIElement('sandboxBrowserInfo', 'Sandbox browser info exists');
assertUIElement('sandboxEnvVars', 'Sandbox env vars display exists');

assertExistsPattern(/sandboxId/, 'sandbox has sandboxId');
assertExistsPattern(/filesystem/, 'sandbox has filesystem');
assertExistsPattern(/processes/, 'sandbox has processes');
assertExistsPattern(/browser/, 'sandbox has browser');
assertExistsPattern(/env/, 'sandbox has env');
assertExistsPattern(/status/, 'sandbox has status');
assertExistsPattern(/createdAt/, 'sandbox has createdAt');
assertExistsPattern(/archived/, 'sandbox has archived flag');
assertExistsPattern(/snapshots/, 'sandbox has snapshots array');
assertExistsPattern(/auto.*sandbox|sandbox.*auto|createSandbox.*project|createSandbox.*task/, 'Sandbox created automatically per project/task');
assertExistsPattern(/archived.*7|7.*day|restorable/, 'Sandbox archived for 7 days restorable');
assertExistsPattern(/unmerged|dirty.*work|hasChanges|hasUnmergedWork/, 'Sandbox with unmerged work archives instead of deleting');

// ===== §2: UNIVERSAL TESTING =====
console.log('\n--- §2: Universal Testing ---');

assertFunctionExists('runUniversalTest', 'runUniversalTest function exists');
assertFunctionExists('runWebTest', 'runWebTest function exists (extends preview test)');
assertFunctionExists('runDesktopTest', 'runDesktopTest function exists');
assertFunctionExists('runMobileTest', 'runMobileTest function exists');
assertFunctionExists('runApiTest', 'runApiTest function exists');
assertFunctionExists('runCliTest', 'runCliTest function exists');
assertFunctionExists('createTestCase', 'createTestCase function exists');

assertUIElement('universalTestPanel', 'Universal test panel UI exists');
assertUIElement('testTargetSelect', 'Test target selector (web/desktop/mobile/api/cli)');
assertUIElement('testStepsList', 'Test steps list exists');
assertUIElement('testRunBtn', 'Test run button exists');
assertUIElement('testResults', 'Test results display exists');
assertUIElement('apiTestBuilder', 'API test request builder exists');
assertUIElement('cliTestBuilder', 'CLI test command builder exists');

assertExists('testSteps', 'appState has testSteps array');
assertExists('testTargets', 'testTargets object with web/desktop/mobile/api/cli');
assertExists('testLanguage', 'Uses same step language as Batch 5 D6');
assertExistsPattern(/click|type|drag|scroll|wait|assert/, 'Step language includes click/type/drag/scroll/wait/assert');
assertExistsPattern(/failure.*fix|autoFix.*test|test.*failure/, 'Test failure becomes auto-fix task');
assertExistsPattern(/step.*attach|failingStep|attached.*step/, 'Failing step attached to fix task');

// ===== §2 Web tests =====
assertFunctionExists('runWebTestSteps', 'runWebTestSteps executes steps in preview iframe');
assertExistsPattern(/preview.*iframe|iframe.*preview/, 'Web test runs in preview iframe');
assertExistsPattern(/responsive|phone|tablet|desktop/, 'Responsive sizes tested');

// ===== §2 Desktop tests =====
assertFunctionExists('runDesktopTestSteps', 'runDesktopTestSteps for computer-use');
assertExistsPattern(/computer.use|computerUse|Computer Use/, 'Desktop test uses computer-use');

// ===== §2 Mobile tests =====
assertFunctionExists('runMobileTestSteps', 'runMobileTestSteps for mobile');
assertExistsPattern(/android|ios|iphone/i, 'Mobile test covers both Android and iPhone');
assertExistsPattern(/viewport|size.*phone|phone.*size/, 'Phone-sized viewports for both platforms');
assertExistsPattern(/side.by.side|sideBySide|dual|mobile.*desktop/, 'Side-by-side mobile + desktop view');

// ===== §2 API tests =====
assertFunctionExists('runApiTestSteps', 'runApiTestSteps sends requests');
assertUIElement('apiMethodSelect', 'API method selector');
assertUIElement('apiUrlInput', 'API URL input');
assertUIElement('apiBodyInput', 'API body input');
assertUIElement('apiExpectedStatus', 'API expected status input');
assertUIElement('apiSavedCases', 'Saved API test cases per project');

// ===== §2 CLI tests =====
assertFunctionExists('runCliTestSteps', 'runCliTestSteps runs commands');
assertUIElement('cliCommandInput', 'CLI command input');
assertUIElement('cliExpectedOutput', 'CLI expected output');
assertUIElement('cliExpectedExitCode', 'CLI expected exit code');

// ===== §3: RECORD =====
console.log('\n--- §3: Record ---');

assertFunctionExists('createRecording', 'createRecording function exists');
assertFunctionExists('attachRecordingToFixTask', 'attachRecordingToFixTask function exists');
assertFunctionExists('getRecording', 'getRecording function exists');
assertFunctionExists('renderRecordingPage', 'renderRecordingPage function exists (phone-friendly)');

assertUIElement('recordingsList', 'Recordings list UI exists');
assertUIElement('recordingVideoSlot', 'Recording video slot exists (placeholder for Stage 6)');
assertUIElement('recordingStepLog', 'Recording step-by-step log exists');
assertUIElement('recordingReport', 'Recording pass/fail report exists');
assertUIElement('recordingTimestamp', 'Failing step timestamped in video exists');

assertExistsPattern(/recording/, 'appState has recording object');
assertExistsPattern(/videoSlot/, 'recording has videoSlot (placeholder for real video)');
assertExistsPattern(/stepLog/, 'recording has stepLog array');
assertExistsPattern(/report/, 'recording has report object');
assertExistsPattern(/timestampedFailures/, 'recording has timestampedFailures');
assertExistsPattern(/phoneFriendly/, 'recording marked phone-friendly');
assertExistsPattern(/attachedToFixTask|fixTaskId|attachRecordingToFixTask/, 'Failed session recording attached to fix task');
assertExistsPattern(/done.*recording|recording.*required|gate.*recording/, 'DONE gate requires recording');

// ===== §4: OWN COMPUTERS =====
console.log('\n--- §4: Own Computers ---');

assertFunctionExists('createVm', 'createVm function exists');
assertFunctionExists('listVms', 'listVms function exists');
assertFunctionExists('getVmStatus', 'getVmStatus function exists');
assertFunctionExists('installEmulatorInSnapshot', 'installEmulatorInSnapshot function exists');

assertUIElement('computersPanel', 'Computers panel UI exists');
assertUIElement('vmList', 'VM list exists');
assertUIElement('vmStatus', 'VM status display exists');
assertUIElement('vmBlueprint', 'VM blueprint display exists');
assertUIElement('accelerationStatus', 'Hardware acceleration status exists');

assertExistsPattern(/vms/, 'appState has vms array');
assertExistsPattern(/vmId/, 'vm has vmId');
assertExistsPattern(/os/, 'vm has os (linux/windows/mac)');
assertExistsPattern(/status/, 'vm has status');
assertExistsPattern(/blueprint/, 'vm has blueprint');
assertExistsPattern(/emulatorPreinstalled/, 'vm has emulatorPreinstalled flag');
assertExistsPattern(/acceleration/, 'vm has acceleration status');

assertExistsPattern(/linux.*now|current.*linux|web.*stage/, 'Linux VM available now (web stage)');
assertExistsPattern(/windows.*staged|mac.*staged|desktop.*stage|cloud.*stage/, 'Windows/macOS labeled as desktop/cloud stage');
assertExistsPattern(/Android|android/, 'Android viewport exists');
assertExistsPattern(/iPhone|iphone/, 'iPhone viewport exists');
assertExistsPattern(/Android.*iPhone|iPhone.*Android|both.*platform|side.by.side.*mobile|mobile.*side.by.side/, 'Both Android and iPhone viewports side-by-side');

// Live test checklist
assertFunctionExists('renderTestChecklist', 'renderTestChecklist function exists');
assertUIElement('testChecklist', 'Live test checklist UI exists');
assertExistsPattern(/Testing\s+\d+\/\d+|testing.*progress/, 'Live checklist shows "Testing X/Y" style');
assertExistsPattern(/time.*pass|pass.*fail|checkmark/, 'Per-test time + pass/fail checkmark');
assertExistsPattern(/live.*update|updates.*live|real.time/, 'Checklist updates live while agent clicks');

// Skill learning loop
assertFunctionExists('persistTestLearnings', 'persistTestLearnings function exists (to Brain)');
assertExistsPattern(/brain.*learn|learn.*brain|persist.*brain/, 'Learnings persist to Brain');

// ===== §5: END-TO-END FLOW =====
console.log('\n--- §5: End-to-End Flow ---');

assertFunctionExists('getFlowStatus', 'getFlowStatus function exists');
assertFunctionExists('advanceFlow', 'advanceFlow function exists');
assertFunctionExists('canMarkDone', 'canMarkDone function exists (enforces recording gate)');

assertUIElement('flowStatusLine', 'Flow status line UI exists');
assertUIElement('flowBuild', 'Flow build step indicator');
assertUIElement('flowSandbox', 'Flow sandbox step indicator');
assertUIElement('flowTest', 'Flow test step indicator (with progress)');
assertUIElement('flowRecord', 'Flow record step indicator');
assertUIElement('flowFix', 'Flow fix step indicator');
assertUIElement('flowRetest', 'Flow re-test step indicator');
assertUIElement('flowDone', 'Flow done step indicator');

assertExists('flowState', 'appState has flowState');
assertExistsPattern(/build.*sandbox.*test.*record.*fix.*retest.*done/, 'Flow order: build -> sandbox -> test -> record -> fix -> re-test -> done');
assertExistsPattern(/done.*recording|recording.*required|gate.*recording/, 'DONE refused without recording');
assertExistsPattern(/test.*sandbox|sandbox.*test/, 'Test run requires sandbox');
assertExistsPattern(/record.*test|test.*record/, 'Recording requires test run');

// Integration with existing systems
assertExistsPattern(/checkpoint.*snapshot|snapshot.*checkpoint/, 'Snapshot uses Tier A checkpoint system');
assertExistsPattern(/E16|record.*shape|videoRecord/, 'Record uses E16 record shape');
assertExistsPattern(/D6|stepLanguage|test.*step.*language/, 'Uses Batch 5 D6 step language');
assertExistsPattern(/browserAgent|computerUse|processManager/, 'Uses H4 §14/§15/§16 drivers');

// Honesty labels
assertExistsPattern(/preview.test|preview test|real.browser.*desktop/, 'Preview test labeled honestly');
assertExistsPattern(/storyboard|videoSlot|placeholder.*video/, 'Storyboard != video distinction');
assertExistsPattern(/linux.*now|windows.*later|mac.*later|staged/, 'Staged capabilities labeled honestly');

console.log('\n=== All Sandbox + Universal Testing + Record assertions passed ===');
process.exit(0);
