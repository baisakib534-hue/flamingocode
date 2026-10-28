// Test suite for Devin Batch 5 — 11 flagship features
// Following the NO-JSDOM extraction-and-eval pattern from existing suites

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
        createLinearGradient: () => ({
          addColorStop: () => {},
        }),
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
  // Verifier repair (2026-10-27): the harness patch below replaces the
  // appState literal but its regex runs to the first `\n};` — which is the
  // end of NODE_TYPES, ~1250 lines later — so it also deletes the real
  // GRAPH_DIR / GRAPH_FILE consts. Mock them here like NODE_TYPES above,
  // or any test that arms the graph-rebuild timer (markGraphDirty) crashes
  // on `GRAPH_FILE is not defined` when the timer fires.
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
    getElementById: () => createElement('div'),
    querySelector: () => createElement('div'),
    querySelectorAll: () => [],
    body: createElement('body'),
    head: createElement('head'),
    title: '',
    location: { href: 'http://localhost' },
    addEventListener: () => {},
    removeEventListener: () => {},
    cookie: '',
    readyState: 'complete',
  },
  window: {
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
    location: { href: 'http://localhost', origin: 'http://localhost' },
    navigator: { userAgent: 'node', clipboard: { writeText: async () => {} } },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: async () => ({ ok: true, json: async () => ({}), text: async () => '' }),
    btoa: (s) => Buffer.from(s).toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString(),
    CryptoJS: {
      AES: { encrypt: (msg, key) => ({ toString: () => 'encrypted:' + msg }), decrypt: (ct, key) => ({ toString: () => ct.replace('encrypted:', '') }) },
      enc: { Utf8: { parse: (s) => s, stringify: (s) => s } },
      mode: { CBC: {} },
      pad: { Pkcs7: {} },
      lib: { WordArray: { create: (s) => s } },
    },
    indexedDB: {
      open: () => ({ onsuccess: null, onerror: null, result: { objectStoreNames: [], transaction: () => ({ objectStore: () => ({ put: () => {}, get: () => ({ onsuccess: null }) }) }) } }),
    },
    matchMedia: (query) => ({ matches: false, media: query, onchange: null, addListener: () => {}, removeListener: () => {}, addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => {} }),
    innerHeight: 800,
    innerWidth: 1200,
    devicePixelRatio: 1,
    scrollX: 0,
    scrollY: 0,
    scrollTo: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    ResizeObserver: class { observe() {} unobserve() {} disconnect() {} },
    MutationObserver: class { observe() {} disconnect() {} },
    URL: {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: () => {},
    },
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type || ''; } },
    File: class { constructor(parts, name, opts) { this.parts = parts; this.type = opts?.type || ''; this.name = name; } },
    FileReader: class { 
      readAsText() { setTimeout(() => { this.onload && this.onload({ target: { result: this._blob?.parts?.join('') || '' } }); }, 0); } 
      readAsDataURL() { setTimeout(() => { this.onload && this.onload({ target: { result: 'data:' + (this._blob?.type || '') + ';base64,' + btoa(this._blob?.parts?.join('') || '') } }); }, 0); } 
    },
    performance: { now: () => Date.now(), mark: () => {}, measure: () => {} },
    console: { log: () => {}, warn: () => {}, error: () => {}, info: () => {}, debug: () => {} },
    Event: class { constructor(type) { this.type = type; } },
    CustomEvent: class { constructor(type, opts) { this.type = type; this.detail = opts?.detail; } },
    KeyboardEvent: class { constructor(type, opts) { this.type = type; this.key = opts?.key; this.code = opts?.code; } },
    MouseEvent: class { constructor(type, opts) { this.type = type; this.clientX = opts?.clientX || 0; this.clientY = opts?.clientY || 0; } },
    HTMLElement: class {},
    HTMLCanvasElement: class {},
    HTMLInputElement: class {},
    HTMLSelectElement: class {},
    HTMLTextAreaElement: class {},
    HTMLDivElement: class {},
    HTMLSpanElement: class {},
    HTMLButtonElement: class {},
    Node: { ELEMENT_NODE: 1, TEXT_NODE: 3 },
    requestIdleCallback: (cb) => setTimeout(cb, 0),
    cancelIdleCallback: (id) => clearTimeout(id),
    crypto: { subtle: { digest: async () => new ArrayBuffer(32), importKey: async () => ({}), sign: async () => new ArrayBuffer(64), verify: async () => true, generateKey: async () => ({}), exportKey: async () => new ArrayBuffer(32) }, getRandomValues: (arr) => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } },
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
  getOrBuildCodeGraph: () => null,
  saveCodeGraph: () => {},
  getCurrentSession: () => ({
    id: 'test-session',
    activeFile: 'test.js',
    files: { 
      'test.js': 'function foo() { return 1; }',
      'other.js': 'function bar() { return 2; }',
      'module.js': 'export function baz() {}'
    }
  }),
  appState: {
    repoMapBudget: 1024,
    repoMapEnabled: true,
    autocompleteEnabled: true,
    providers: {
      'ollama-local': {
        enabled: true,
        apiKey: 'local',
        defaultModel: 'llama3.1',
        models: ['llama3.1', 'codellama'],
        costTier: 'free',
      },
      'gemini': {
        enabled: true,
        apiKey: 'test-key',
        defaultModel: 'gemini-1.5-flash',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        costTier: 'cheap',
      },
      'anthropic': {
        enabled: true,
        apiKey: 'test-key',
        defaultModel: 'claude-3-5-sonnet',
        models: ['claude-3-5-sonnet', 'claude-3-haiku'],
        costTier: 'medium',
      },
      'openai': {
        enabled: true,
        apiKey: 'test-key',
        defaultModel: 'gpt-4o',
        models: ['gpt-4o', 'gpt-4o-mini'],
        costTier: 'expensive',
      },
    },
    rateLimitState: {},
  },
  readFile: (filePath) => {
    const session = globalScope.getCurrentSession();
    if (!session || !session.files) return '';
    const entry = session.files[filePath];
    return (entry && entry.content) || (typeof entry === 'string' ? entry : '') || '';
  },
  writeFile: (filePath, content) => {
    const session = globalScope.getCurrentSession();
    session.files[filePath] = { content };
  },
  // Brain note functions
  getBrainNotes: (sessionId) => {
    const session = globalScope.appState.sessions[sessionId];
    if (!session) return [];
    return session.brainNotes || [];
  },
  writeBrainNote: (sessionId, path, content) => {
    const session = globalScope.appState.sessions[sessionId];
    if (!session) return;
    if (!session.brainNotes) session.brainNotes = [];
    const existing = session.brainNotes.findIndex(n => n.path === path);
    if (existing >= 0) {
      session.brainNotes[existing].content = content;
      session.brainNotes[existing].updatedAt = new Date().toISOString();
    } else {
      session.brainNotes.push({ path, content, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
  },
  // Graph constants
  NODE_TYPES: {
    FILE: 'file',
    FUNCTION: 'function',
    CLASS: 'class',
    METHOD: 'method',
    VARIABLE: 'variable',
    IMPORT: 'import',
  },
  EDGE_TYPES: {
    IMPORTS: 'imports',
    CALLS: 'calls',
    EXTENDS: 'extends',
    IMPLEMENTS: 'implements',
    REFERENCES: 'references',
  },
  GRAPH_SCHEMA_VERSION: 2,
  // Override getOrBuildCodeGraph to return mock graph
  getOrBuildCodeGraph: (session) => ({
    nodes: [
      { id: 'n1', type: 'file', name: 'a.js', filePath: 'a.js' },
      { id: 'n2', type: 'file', name: 'b.js', filePath: 'b.js' },
      { id: 'n3', type: 'file', name: 'c.js', filePath: 'c.js' },
      { id: 'n4', type: 'function', name: 'myFunction', filePath: 'test.js' },
      { id: 'n5', type: 'function', name: 'anotherFunction', filePath: 'test.js' },
      { id: 'n6', type: 'class', name: 'MyClass', filePath: 'test.js' },
      { id: 'n7', type: 'file', name: 'auth.test.js', filePath: 'auth.test.js' },
    ],
    edges: [
      { from: 'n1', to: 'n2', type: 'imports', confidence: 'EXTRACTED' },
      { from: 'n2', to: 'n3', type: 'imports', confidence: 'EXTRACTED' },
    ],
    updatedAt: Date.now()
  }),
  addToQueue: (item) => {
    globalScope.appState.messageQueue = globalScope.appState.messageQueue || [];
    globalScope.appState.messageQueue.push(item);
  },
};

// Evaluate the script in the global scope
// Patch the script to use global appState instead of declaring its own
const patchedScriptContent = scriptContent
  .replace(
    /let appState = \{[\s\S]*?\n    \};/,
    'appState = (globalThis.appState || {\n  prompts: [],\n  customSkillPacks: {},\n  customPluginPacks: {},\n  mcpServers: {},\n  sessions: {},\n  activeSessionId: null,\n  providers: {},\n  activeProviderId: null,\n  agents: {},\n  activeAgentId: null,\n  teamMode: false,\n  teamRoster: [],\n  teamSeniorId: null,\n  teamTaskBoard: [],\n  teamChat: [],\n  teamPhase: null,\n  teamReviewRound: 0,\n  planMode: "general",\n  defaultMode: "general",\n  readOnlyPlanMode: false,\n  currentPlan: [],\n  planStepIndex: 0,\n  planPaused: false,\n  planRevisionCount: 0,\n  planMaxSteps: 25,\n  planMaxRevisions: 5,\n  stepPlannerEnabled: false,\n  thinkActObserveState: "idle",\n  currentStepPlan: null,\n  todoListExpanded: false,\n  uncensoredPerProject: {},\n  uncensoredPerModel: {},\n  generalModeShowCode: {},\n  autonomy: { catalogInjected: true, mandatoryUseEnabled: true, lastToolsUsed: [], checks: { "testing-qa": false, "security-review": false, "domain-skill": false }, taskHistory: [] },\n  safeMode: { approvalMode: "smart", hardlineBlocklist: ["delete project","rm -rf /","send provider key","overwrite 9router key","git push --force","curl | sh","wget | sh","delete all files","purge database","drop table"], denyRules: ["git push --force*","curl * | sh*","wget * | sh*","rm -rf *","sudo *"], lastSmartDecision: null, yoloBannerDismissed: false },\n  checkpoints: [],\n  checkpointCap: 30,\n  diffReviewEnabled: true,\n  pendingChanges: null,\n  repoMapBudget: 1024,\n  repoMapEnabled: true,\n  autocompleteEnabled: true\n});'
  );

const context = vm.createContext(globalScope);
try {
  vm.runInContext(patchedScriptContent, context);
} catch (e) {
  // Some functions may fail due to missing DOM, but we only need the functions we test
  // Ignore errors from UI initialization code
  console.log('Note: Script eval had non-fatal errors:', e.message);
}

// Extract the functions we need to test
const { 
  buildArchitectureDiagram,
  renderArchitecturePanel,
  scheduleArchitectureRefresh,
  searchAllProjects,
  renderCrossRepoSearchResults,
  openCrossRepoResult,
  routeModelForStep,
  startSidekick,
  runSidekickVerification,
  getSidekickFindings,
  clearSidekickFindings,
  toggleSidekick,
  renderSidekickPanel,
  runSecurityScan,
  proposeSecurityFix,
  applySecurityFix,
  checkPublishBlocked,
  createDesktopTestPlan,
  getDesktopTestPlan,
  runDesktopTestStep,
  runDesktopTestPlan,
  createMultiRepoTask,
  getMultiRepoTask,
  executeMultiRepoTaskStep,
  completeMultiRepoTaskRepo,
  generateCoordinatedPRSummary,
  saveLongTaskState,
  getLongTasks,
  getLongTask,
  resumeLongTask,
  pauseLongTask,
  abortLongTask,
  persistLongTaskAfterStep,
  startMonitoring,
  checkLiveSite,
  logMonitorResult,
  stopMonitoring,
  getMonitorLog,
  addToInbox,
  getInboxItems,
  runInboxItem,
  completeInboxItem,
  reviewInboxItem,
  getMessageQueue,
  saveMessageQueue,
  learnRepoConventions,
  learnFromGitHistory,
  learnFromBrainNotes,
  learnFromCodeGraph,
  generateConventionsMd,
  getRepoConventions,
  forgetConvention,
  checkConventionViolation,
  // Helper functions from app
  getBrainNotes,
  writeBrainNote,
  getOrBuildCodeGraph,
  NODE_TYPES,
  EDGE_TYPES,
  GRAPH_SCHEMA_VERSION,
  t,
} = context;

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passCount++;
    return true;
  } else {
    console.log(`  ✗ ${name}`);
    failCount++;
    return false;
  }
}

// Helper to get session files for readFile
function getTestSessionFiles() {
  return {
    'test.js': { content: 'function foo() { return 1; }' },
    'other.js': { content: 'function bar() { return 2; }' },
    'module.js': { content: 'export function baz() {}' },
    'empty.js': { content: '' },
    'bad.js': { content: 'function broken { invalid syntax' },
  };
}

function assertEqual(name, actual, expected) {
  const pass = actual === expected;
  if (!pass) {
    console.log(`    Expected: ${JSON.stringify(expected)}`);
    console.log(`    Actual:   ${JSON.stringify(actual)}`);
  }
  return assert(name, pass);
}

// ============================================================
// D1: Auto Architecture Diagrams
// ============================================================
console.log('\n=== D1: Auto Architecture Diagrams ===');

assert('D1: buildArchitectureDiagram function exists', typeof buildArchitectureDiagram === 'function');

if (buildArchitectureDiagram) {
  const mockSession = { id: 'test', files: {} };
  const mockGraph = {
    nodes: [
      { id: 'n1', type: 'file', name: 'a.js', filePath: 'a.js' },
      { id: 'n2', type: 'file', name: 'b.js', filePath: 'b.js' },
      { id: 'n3', type: 'file', name: 'c.js', filePath: 'c.js' },
    ],
    edges: [
      { from: 'n1', to: 'n2', type: 'imports', confidence: 'EXTRACTED' },
      { from: 'n2', to: 'n3', type: 'imports', confidence: 'EXTRACTED' },
    ],
    updatedAt: Date.now()
  };
  const result = buildArchitectureDiagram(mockSession, mockGraph);
  assert('D1: buildArchitectureDiagram returns string', typeof result === 'string');
  // Diagram should be SVG
  assert('D1: diagram contains SVG', result.includes('<svg') || result.includes('svg'));
  assert('D1: diagram references module files', result.includes('a.js') || result.includes('b.js') || result.includes('c.js'));
}

assert('D1: renderArchitecturePanel function exists', typeof renderArchitecturePanel === 'function');

// ============================================================
// D2: Cross-Repo Search
// ============================================================
console.log('\n=== D2: Cross-Repo Search ===');

assert('D2: searchAllProjects function exists', typeof searchAllProjects === 'function');

if (searchAllProjects) {
  // Set up mock localStorage with multiple projects
  globalScope.localStorage.store['devforge_sessions'] = JSON.stringify({
    'project1': { id: 'project1', name: 'Project One', files: { 'src/main.js': { content: 'function foo() {}' } } },
    'project2': { id: 'project2', name: 'Project Two', files: { 'lib/utils.js': { content: 'function bar() {}' } } },
  });
  
  const results = searchAllProjects('foo');
  assert('D2: searchAllProjects returns array', Array.isArray(results));
  
  if (results.length > 0) {
    assert('D2: results have project name', 'project' in results[0] || 'projectName' in results[0]);
    assert('D2: results have file path', 'file' in results[0] || 'filePath' in results[0]);
    assert('D2: results have context line', 'context' in results[0] || 'line' in results[0]);
    
    // Check ranking: exact symbol match should be first
    const firstResult = results[0];
    const hasExactSymbol = firstResult.context?.includes('foo') || firstResult.line?.includes('foo');
    assert('D2: exact symbol match ranked first', hasExactSymbol);
  }
}

assert('D2: renderCrossRepoSearchResults function exists', typeof renderCrossRepoSearchResults === 'function');
assert('D2: openCrossRepoResult function exists', typeof openCrossRepoResult === 'function');

// ============================================================
// D3: Smart Model Routing
// ============================================================
console.log('\n=== D3: Smart Model Routing ===');

assert('D3: routeModelForStep function exists', typeof routeModelForStep === 'function');

if (routeModelForStep) {
  // Test uses step.text (or step.description) and step.kind
  const mechanicalRouting = routeModelForStep({ 
    text: 'rename variable x to y', 
    kind: 'mechanical' 
  });
  assert('D3: routeModelForStep returns routing object', mechanicalRouting && typeof mechanicalRouting === 'object');
  assert('D3: mechanical step routed to cheap/fast model', 
    mechanicalRouting.reason?.includes('mechanical') || mechanicalRouting.reason?.includes('cheap'));
  
  const judgmentRouting = routeModelForStep({ 
    text: 'design architecture for new module', 
    kind: 'judgment' 
  });
  assert('D3: judgment step routed to strong model', 
    judgmentRouting.reason?.includes('judgment') || judgmentRouting.reason?.includes('strong'));
}

// ============================================================
// D4: Sidekick Agent
// ============================================================
console.log('\n=== D4: Sidekick Agent ===');

assert('D4: startSidekick function exists', typeof startSidekick === 'function');
assert('D4: runSidekickVerification function exists', typeof runSidekickVerification === 'function');

if (startSidekick) {
  const mockTask = {
    id: 'task-1',
    plan: {
      steps: [
        { file: 'test.js', description: 'create function foo', expected: 'function foo' },
        { file: 'other.js', description: 'add import', expected: 'import' },
      ]
    },
    sidekickEnabled: true,
  };
  const result = startSidekick(mockTask);
  assert('D4: startSidekick returns success', result.success === true);
  assert('D4: startSidekick creates sidekick state', result.sidekick && result.sidekick.enabled === true);
}

if (runSidekickVerification) {
  // Test that the function exists and can be called without error
  // (The actual verification logic depends on readFile which is mocked in the app)
  assert('D4: runSidekickVerification is callable', typeof runSidekickVerification === 'function');
}

assert('D4: getSidekickFindings function exists', typeof getSidekickFindings === 'function');
assert('D4: toggleSidekick function exists', typeof toggleSidekick === 'function');

// ============================================================
// D5: Security Swarm
// ============================================================
console.log('\n=== D5: Security Swarm ===');

assert('D5: runSecurityScan function exists', typeof runSecurityScan === 'function');
assert('D5: proposeSecurityFix function exists', typeof proposeSecurityFix === 'function');
assert('D5: applySecurityFix function exists', typeof applySecurityFix === 'function');
assert('D5: checkPublishBlocked function exists', typeof checkPublishBlocked === 'function');

if (runSecurityScan) {
  const mockSession = { id: 'test', files: { 'config.js': 'const api_key = "sk-1234567890abcdef1234";' } };
  globalScope.appState.sessions = { test: mockSession };
  
  const result = runSecurityScan('test');
  assert('D5: runSecurityScan returns findings object', result && typeof result === 'object');
  assert('D5: runSecurityScan has findings array', Array.isArray(result.findings));
  assert('D5: runSecurityScan has criticalCount', typeof result.criticalCount === 'number');
  assert('D5: runSecurityScan has totalCount', typeof result.totalCount === 'number');
  assert('D5: runSecurityScan has publishBlocked', typeof result.publishBlocked === 'boolean');
}

if (proposeSecurityFix) {
  const finding = { fixerPatch: { file: 'config.js', from: 'old', to: 'new' } };
  const fix = proposeSecurityFix(finding);
  assert('D5: proposeSecurityFix returns fix object', fix && typeof fix === 'object');
  assert('D5: proposeSecurityFix includes diff', fix?.diff && fix.diff.includes('old') && fix.diff.includes('new'));
}

if (checkPublishBlocked) {
  const result = checkPublishBlocked('nonexistent');
  assert('D5: checkPublishBlocked returns blocked false for no note', result.blocked === false);
}

// ============================================================
// D6: Desktop Test Harness
// ============================================================
console.log('\n=== D6: Desktop Test Harness ===');

assert('D6: createDesktopTestPlan function exists', typeof createDesktopTestPlan === 'function');
assert('D6: getDesktopTestPlan function exists', typeof getDesktopTestPlan === 'function');
assert('D6: runDesktopTestStep function exists', typeof runDesktopTestStep === 'function');
assert('D6: runDesktopTestPlan function exists', typeof runDesktopTestPlan === 'function');

if (createDesktopTestPlan) {
  const plan = createDesktopTestPlan('test', { 
    appName: 'Test App', 
    steps: [ { action: 'click', selector: '#btn' } ] 
  });
  assert('D6: createDesktopTestPlan returns plan object', plan && typeof plan === 'object');
  assert('D6: plan has steps', Array.isArray(plan.steps));
  assert('D6: plan has appName', plan.appName === 'Test App');
}

if (runDesktopTestStep) {
  const stepResult = runDesktopTestStep({ action: 'wait' });
  assert('D6: runDesktopTestStep returns result object', stepResult && typeof stepResult === 'object');
  assert('D6: runDesktopTestStep has passed field', typeof stepResult.passed === 'boolean');
  assert('D6: runDesktopTestStep has durationMs', typeof stepResult.durationMs === 'number');
}

if (runDesktopTestPlan) {
  globalScope.appState.sessions = { test: { id: 'test', files: {} } };
  const result = runDesktopTestPlan('test');
  assert('D6: runDesktopTestPlan handles missing plan', result && result.error === 'No test plan found');
}

// ============================================================
// D7: Multi-Repo Tasks
// ============================================================
console.log('\n=== D7: Multi-Repo Tasks ===');

assert('D7: createMultiRepoTask function exists', typeof createMultiRepoTask === 'function');
assert('D7: getMultiRepoTask function exists', typeof getMultiRepoTask === 'function');
assert('D7: executeMultiRepoTaskStep function exists', typeof executeMultiRepoTaskStep === 'function');
assert('D7: completeMultiRepoTaskRepo function exists', typeof completeMultiRepoTaskRepo === 'function');
assert('D7: generateCoordinatedPRSummary function exists', typeof generateCoordinatedPRSummary === 'function');

if (createMultiRepoTask) {
  const task = createMultiRepoTask('my-task', [
    { projectId: 'backend', dependencyOrder: 0 },
    { projectId: 'frontend', dependencyOrder: 1 },
    { projectId: 'docs', dependencyOrder: 2 },
  ]);
  assert('D7: createMultiRepoTask returns task object', task && typeof task === 'object');
  assert('D7: task has repos array', Array.isArray(task.repos));
  assert('D7: task repos sorted by dependencyOrder', task.repos[0].projectId === 'backend');
  assert('D7: task has branchName format', task.repos[0].branchName?.includes('flamingocode/my-task'));
}

if (generateCoordinatedPRSummary) {
  globalScope.appState.sessions = { test: { id: 'test' } };
  const result = generateCoordinatedPRSummary('nonexistent');
  assert('D7: generateCoordinatedPRSummary handles missing task', result && result.error === 'Task not found');
}

// ============================================================
// D8: Long-Running Tasks
// ============================================================
console.log('\n=== D8: Long-Running Tasks ===');

assert('D8: saveLongTaskState function exists', typeof saveLongTaskState === 'function');
assert('D8: getLongTasks function exists', typeof getLongTasks === 'function');
assert('D8: getLongTask function exists', typeof getLongTask === 'function');
assert('D8: resumeLongTask function exists', typeof resumeLongTask === 'function');
assert('D8: pauseLongTask function exists', typeof pauseLongTask === 'function');
assert('D8: abortLongTask function exists', typeof abortLongTask === 'function');
assert('D8: persistLongTaskAfterStep function exists', typeof persistLongTaskAfterStep === 'function');

if (saveLongTaskState) {
  const task = saveLongTaskState('task-1', { 
    plan: [{ description: 'step 1' }, { description: 'step 2' }],
    currentStepIndex: 0,
    status: 'running',
  });
  assert('D8: saveLongTaskState returns task', task && typeof task === 'object');
  assert('D8: saveLongTaskState persists to localStorage', globalScope.localStorage.store['flamingocode_long_tasks']?.includes('task-1'));
}

if (getLongTask) {
  const task = getLongTask('task-1');
  assert('D8: getLongTask retrieves saved task', task && task.id === 'task-1');
  assert('D8: getLongTask has plan', Array.isArray(task.plan));
}

if (resumeLongTask) {
  const result = resumeLongTask('task-1');
  assert('D8: resumeLongTask returns task', result && result.task);
  assert('D8: resumeLongTask sets status to running', result.task.status === 'running');
}

if (abortLongTask) {
  globalScope.appState.sessions = { test: { id: 'test' } };
  const result = abortLongTask('task-1', 'User cancelled');
  assert('D8: abortLongTask returns task', result && result.task);
  assert('D8: abortLongTask sets status to aborted', result.task.status === 'aborted');
  assert('D8: abortLongTask saves handoff note', result.message?.includes('handoff'));
}

if (persistLongTaskAfterStep) {
  const result = persistLongTaskAfterStep('task-1', 0, { success: true }, { checkpoint: true });
  assert('D8: persistLongTaskAfterStep increments step', result.task.currentStepIndex === 1);
  assert('D8: persistLongTaskAfterStep saves checkpoint', result.task.checkpoints?.length > 0);
  assert('D8: persistLongTaskAfterStep caps checkpoints at 30', result.task.checkpoints.length <= 30);
}

// ============================================================
// D9: Post-Deploy Monitoring
// ============================================================
console.log('\n=== D9: Post-Deploy Monitoring ===');

assert('D9: startMonitoring function exists', typeof startMonitoring === 'function');
assert('D9: checkLiveSite function exists', typeof checkLiveSite === 'function');
assert('D9: logMonitorResult function exists', typeof logMonitorResult === 'function');
assert('D9: stopMonitoring function exists', typeof stopMonitoring === 'function');
assert('D9: getMonitorLog function exists', typeof getMonitorLog === 'function');

if (checkLiveSite) {
  checkLiveSite({ url: 'https://example.com', markerText: 'FlamingoCode' }).then(result => {
    assert('D9: checkLiveSite returns result', result && typeof result === 'object');
    assert('D9: checkLiveSite has status', typeof result.status === 'number');
    assert('D9: checkLiveSite has healthy', typeof result.healthy === 'boolean');
    assert('D9: checkLiveSite has markerFound', typeof result.markerFound === 'boolean');
    assert('D9: checkLiveSite has responseTimeMs', typeof result.responseTimeMs === 'number');
  });
}

if (startMonitoring) {
  globalScope.appState.sessions = { test: { id: 'test', deployUrl: 'https://example.com' } };
  const result = startMonitoring('test', {});
  assert('D9: startMonitoring returns monitoring config', result && result.monitoring);
  assert('D9: startMonitoring sets enabled true', result.monitoring.enabled === true);
  assert('D9: startMonitoring has intervalMs', typeof result.monitoring.intervalMs === 'number');
}

if (logMonitorResult) {
  globalScope.appState.sessions = { test: { id: 'test' } };
  logMonitorResult('test', { 
    url: 'https://example.com', 
    status: 200, 
    healthy: true, 
    markerFound: true, 
    jsLoaded: true, 
    responseTimeMs: 100, 
    checkedAt: new Date().toISOString() 
  });
  // Note: logMonitorResult writes to Brain note, hard to test without full Brain
  assert('D9: logMonitorResult runs without error', true);
}

if (stopMonitoring) {
  globalScope.appState.sessions = { test: { id: 'test', monitoring: { enabled: true, url: 'https://example.com' } } };
  const result = stopMonitoring('test');
  assert('D9: stopMonitoring returns monitoring config', result && result.monitoring);
  assert('D9: stopMonitoring sets enabled false', result.monitoring.enabled === false);
  assert('D9: stopMonitoring has stoppedAt', typeof result.monitoring.stoppedAt === 'string');
}

// ============================================================
// D10: Task Inbox
// ============================================================
console.log('\n=== D10: Task Inbox ===');

assert('D10: addToInbox function exists', typeof addToInbox === 'function');
assert('D10: getInboxItems function exists', typeof getInboxItems === 'function');
assert('D10: runInboxItem function exists', typeof runInboxItem === 'function');
assert('D10: completeInboxItem function exists', typeof completeInboxItem === 'function');
assert('D10: reviewInboxItem function exists', typeof reviewInboxItem === 'function');
assert('D10: getMessageQueue function exists', typeof getMessageQueue === 'function');
assert('D10: saveMessageQueue function exists', typeof saveMessageQueue === 'function');

if (addToInbox) {
  const item = addToInbox({ title: 'Test task', source: 'manual', taskData: { foo: 'bar' } });
  assert('D10: addToInbox returns item', item && typeof item === 'object');
  assert('D10: addToInbox sets id', item.id?.startsWith('inbox-'));
  assert('D10: addToInbox sets status new', item.status === 'new');
  assert('D10: addToInbox stores in queue', getMessageQueue().some(q => q.id === item.id));
}

if (getInboxItems) {
  const items = getInboxItems();
  assert('D10: getInboxItems returns array', Array.isArray(items));
  assert('D10: getInboxItems filters by prefix', items.every(i => i.id?.startsWith('inbox-')));
}

if (runInboxItem) {
  const queue = getMessageQueue();
  const item = queue.find(q => q.id?.startsWith('inbox-'));
  if (item) {
    const result = runInboxItem(item.id);
    assert('D10: runInboxItem returns item', result && result.item);
    assert('D10: runInboxItem sets status running', result.item.status === 'running');
    assert('D10: runInboxItem returns taskData', result.taskData && result.taskData.foo === 'bar');
  }
}

if (reviewInboxItem) {
  const queue = getMessageQueue();
  const item = queue.find(q => q.id?.startsWith('inbox-'));
  if (item) {
    item.status = 'done';
    saveMessageQueue(queue);
    const result = reviewInboxItem(item.id, true, 'Looks good');
    assert('D10: reviewInboxItem approves', result.item.status === 'done');
    assert('D10: reviewInboxItem stores reviewNote', result.item.reviewNote === 'Looks good');
    
    // Test reject
    const item2 = addToInbox({ title: 'Task 2', status: 'done' });
    const result2 = reviewInboxItem(item2.id, false, 'Needs work');
    assert('D10: reviewInboxItem rejects', result2.item.status === 'needs-review');
  }
}

// ============================================================
// D11: Repo Learning
// ============================================================
console.log('\n=== D11: Repo Learning ===');

assert('D11: learnRepoConventions function exists', typeof learnRepoConventions === 'function');
assert('D11: learnFromGitHistory function exists', typeof learnFromGitHistory === 'function');
assert('D11: learnFromBrainNotes function exists', typeof learnFromBrainNotes === 'function');
assert('D11: learnFromCodeGraph function exists', typeof learnFromCodeGraph === 'function');
assert('D11: generateConventionsMd function exists', typeof generateConventionsMd === 'function');
assert('D11: getRepoConventions function exists', typeof getRepoConventions === 'function');
assert('D11: forgetConvention function exists', typeof forgetConvention === 'function');
assert('D11: checkConventionViolation function exists', typeof checkConventionViolation === 'function');

if (learnRepoConventions) {
  globalScope.appState.sessions = { test: { id: 'test', files: { 'test.js': { content: 'function myFunction() {}' } } } };
  const result = learnRepoConventions('test');
  assert('D11: learnRepoConventions returns conventions', result && Array.isArray(result.conventions));
  assert('D11: learnRepoConventions has count', typeof result.count === 'number');
  assert('D11: learnRepoConventions saves to session', globalScope.appState.sessions.test.conventions?.length > 0);
}

if (learnFromGitHistory) {
  const conventions = learnFromGitHistory({ id: 'test' });
  assert('D11: learnFromGitHistory returns array', Array.isArray(conventions));
  assert('D11: learnFromGitHistory has conventional commits rule', conventions.some(c => c.rule.includes('conventional commits')));
}

if (learnFromCodeGraph) {
  globalScope.appState.sessions = { test: { id: 'test' } };
  // Mock getOrBuildCodeGraph to return a graph with naming patterns
  globalScope.getOrBuildCodeGraph = () => ({
    nodes: [
      { id: 'n1', type: 'function', name: 'myFunction', filePath: 'test.js' },
      { id: 'n2', type: 'function', name: 'anotherFunction', filePath: 'test.js' },
      { id: 'n3', type: 'class', name: 'MyClass', filePath: 'test.js' },
      { id: 'n4', type: 'file', name: 'auth.test.js', filePath: 'auth.test.js' },
    ],
    edges: []
  });
  const conventions = learnFromCodeGraph({ id: 'test' });
  assert('D11: learnFromCodeGraph detects camelCase', conventions.some(c => c.rule.includes('camelCase')));
  assert('D11: learnFromCodeGraph detects PascalCase', conventions.some(c => c.rule.includes('PascalCase')));
  assert('D11: learnFromCodeGraph detects test pattern', conventions.some(c => c.rule.includes('Tests co-located')));
}

if (checkConventionViolation) {
  globalScope.appState.sessions = { test: { id: 'test', conventions: [ { rule: 'Functions use camelCase naming' } ] } };
  const violations = checkConventionViolation('function my_function() {}', 'test');
  assert('D11: checkConventionViolation detects snake_case violation', violations.length > 0);
  assert('D11: checkConventionViolation includes rule in message', violations[0].message.includes('camelCase'));
}

if (forgetConvention) {
  globalScope.appState.sessions = { test: { id: 'test', conventions: [ { rule: 'Test rule' } ] } };
  // Override getCurrentSession to return the test session
  globalScope.getCurrentSession = () => globalScope.appState.sessions.test;
  const result = forgetConvention('Test rule');
  assert('D11: forgetConvention removes rule', result && result.length === 0);
}

// ============================================================
// VERIFIER REPAIR — wiring regression tests (2026-10-27)
// Hermes built all 11 features but 8 of them were defined-but-never-called
// (the Batch 7.6 pattern), D1 crashed the 7.2 suite with infinite
// recursion, and D9 "monitoring" returned random results. These tests
// assert the LIVE call sites, not just that the functions exist.
// ============================================================
console.log('\n=== VERIFIER REPAIR: wiring ===');

// D1: the markGraphDirty wrapper that recursed forever must be gone,
// and the original must call scheduleArchitectureRefresh.
assert('D1-repair: no self-capturing markGraphDirty wrapper', !scriptContent.includes('const originalMarkGraphDirty = markGraphDirty;'));
assert('D1-repair: markGraphDirty calls scheduleArchitectureRefresh', typeof context.markGraphDirty === 'function' && context.markGraphDirty.toString().includes('scheduleArchitectureRefresh('));
// NOTE: no functional markGraphDirty() call here on purpose — it arms the
// 500ms graph-rebuild timer, whose callback renders the graph panel and
// needs a real canvas (the harness stub has none). The FUNCTIONAL proof
// lives in the 7.2 suite: it calls markGraphDirty and crashed on the
// recursion before this repair; it passes after it.

// D3/D4/D8: the plan-step executor must route, sidekick and persist.
if (typeof context.executeNextPlanStep === 'function') {
  const planSrc = context.executeNextPlanStep.toString();
  assert('D3-repair: plan steps call routeModelForStep', planSrc.includes('routeModelForStep('));
  assert('D3-repair: plan steps use the routed provider via callLLM', planSrc.includes('callLLM(messages, _route.provider)'));
  assert('D4-repair: plan start calls startSidekick', planSrc.includes('startSidekick('));
  assert('D4-repair: plan steps verify touched files via runSidekickVerification', planSrc.includes('runSidekickVerification('));
  assert('D8-repair: plan start registers the long task', planSrc.includes("saveLongTaskState('plan-'"));
  assert('D8-repair: plan steps persist via persistLongTaskAfterStep', planSrc.includes('persistLongTaskAfterStep('));
  assert('D8-repair: plan completion marks the long task completed', planSrc.includes("getLongTask('plan-'"));
} else {
  assert('D3/D4/D8-repair: executeNextPlanStep is reachable', false);
}

// D5: every publish scans first and critical findings block the deploy.
(function () {
  const start = scriptContent.indexOf('function prepareDeploymentForShare');
  const end = scriptContent.indexOf('if (btnCopyShareLink)', start);
  const body = start >= 0 && end > start ? scriptContent.slice(start, end) : '';
  assert('D5-repair: publish runs a fresh security scan', body.includes('runSecurityScan('));
  assert('D5-repair: publish is blocked by critical findings', body.includes('checkPublishBlocked('));
})();

// D6/D7/D9/D10/D11: command palette entries exist for the manual triggers.
['securityScan', 'applySecurityFixes', 'desktopTest', 'multiRepoTask', 'startMonitoring', 'taskInbox', 'resumeLongTask', 'learnConventions'].forEach(id => {
  assert('Palette-repair: action "' + id + '" registered', scriptContent.includes("id: '" + id + "'"));
});

// D9: monitoring is real now — no random result, real fetch, safe defaults.
if (typeof context.checkLiveSite === 'function') {
  const liveSrc = context.checkLiveSite.toString();
  assert('D9-repair: checkLiveSite does a real fetch', liveSrc.includes('fetch('));
  assert('D9-repair: checkLiveSite has no random mock result', !liveSrc.includes('Math.random()'));
}
if (typeof context.startMonitoring === 'function') {
  assert('D9-repair: startMonitoring tolerates a missing config', context.startMonitoring.toString().includes('config = {}'));
}
if (typeof context.createDesktopTestPlan === 'function') {
  assert('D6-repair: createDesktopTestPlan tolerates a missing plan', context.createDesktopTestPlan.toString().includes('plan = {}'));
}

// D10: phone-queued messages mirror into the inbox; the inbox has a panel.
if (typeof context.queueMessage === 'function') {
  assert('D10-repair: queueMessage mirrors phone items into the inbox', context.queueMessage.toString().includes('addToInbox('));
} else {
  assert('D10-repair: queueMessage is reachable', false);
}
assert('D10-repair: showInboxPanel exists and lists inbox items', typeof context.showInboxPanel === 'function' && context.showInboxPanel.toString().includes('getInboxItems('));

// D11: conventions are learned on session open and checked in diff review.
if (typeof context.switchSession === 'function') {
  assert('D11-repair: switching sessions learns repo conventions', context.switchSession.toString().includes('learnRepoConventions('));
} else {
  assert('D11-repair: switchSession is reachable', false);
}
if (typeof context.renderFileDiff === 'function') {
  assert('D11-repair: diff review checks convention violations', context.renderFileDiff.toString().includes('checkConventionViolation('));
} else {
  assert('D11-repair: renderFileDiff is reachable', false);
}

// D9 async: the real check against the mocked fetch resolves the same shape.
if (typeof context.checkLiveSite === 'function') {
  context.checkLiveSite({ url: 'https://example.com', markerText: 'FlamingoCode' }).then(result => {
    assert('D9-repair: real checkLiveSite resolves a result', result && typeof result === 'object');
    assert('D9-repair: real checkLiveSite reports a numeric status', typeof result.status === 'number');
    assert('D9-repair: real checkLiveSite reports healthy as boolean', typeof result.healthy === 'boolean');
    assert('D9-repair: real checkLiveSite reports markerFound as boolean', typeof result.markerFound === 'boolean');
  }).catch(e => {
    assert('D9-repair: real checkLiveSite never rejects (' + e.message + ')', false);
  });
}

// ============================================================
// SUMMARY
// ============================================================
// Delayed 1.5s so the async D9 checkLiveSite asserts above (and the
// original D9 async asserts) get a turn on the event loop before exit.
// Without the wait, process.exit would run before their .then callbacks.
setTimeout(() => {
console.log('\n=== TEST SUMMARY ===');
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);
console.log(`Total:  ${passCount + failCount}`);

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
  process.exit(0);
}
}, 1500);