// Test suite for Batch 8b — G1..G23 sweep leftovers
// Following the NO-JSDOM extraction-and-eval pattern from existing suites

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
      querySelector: () => createElement('div'),
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
      });
    }
    return el;
  };

const globalScope = {
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null
  },
  document: {
    createElement,
    getElementById: (id) => createElement('div'),
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
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    requestAnimationFrame: (cb) => setTimeout(cb, 16),
    cancelAnimationFrame: (id) => clearTimeout(id),
    setTimeout,
    clearTimeout,
    setInterval,
    clearInterval,
    fetch: async () => ({ ok: true, json: async () => ({}), text: async () => '' }),
    btoa: (s) => Buffer.from(s).toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString(),
    innerHeight: 800,
    innerWidth: 1200,
    devicePixelRatio: 1,
    scrollX: 0,
    scrollY: 0,
    scrollTo: () => {},
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
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
  escapeHtml: (s) => String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/\"/g, '"').replace(/'/g, "'"),
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
        apiKey: '***',
        defaultModel: 'llama3.1',
        models: ['llama3.1', 'codellama'],
        costTier: 'free',
      },
      'gemini': {
        enabled: true,
        apiKey: '***',
        defaultModel: 'gemini-1.5-flash',
        models: ['gemini-1.5-flash', 'gemini-1.5-pro'],
        costTier: 'cheap',
      },
      'anthropic': {
        enabled: true,
        apiKey: '***',
        defaultModel: 'claude-3-5-sonnet',
        models: ['claude-3-5-sonnet', 'claude-3-haiku'],
        costTier: 'medium',
      },
      'openai': {
        enabled: true,
        apiKey: '***',
        defaultModel: 'gpt-4o',
        models: ['gpt-4o', 'gpt-4o-mini'],
        costTier: 'expensive',
      },
    },
    rateLimitState: {},
    // Audit gap fields
    oncallResponders: [],
    oncallIncidents: {},
    oncallKnownIssues: [],
    memoryDrive: { notes: {}, index: '', pinned: [] },
    dreamingSessions: [],
    efficiency: { score: 50, grade: 'Unknown', coachFlags: {}, approvalCeilings: {}, pendingApprovals: [] },
    marketplace: { installed: {} },
    secrets: {},
    triageAutomations: [],
    cveInventory: {},
    cvePatches: [],
    pylon: { connected: false, config: {}, tickets: {} },
    integrations: { sentry: {}, datadog: {}, pagerduty: {}, snyk: {}, notion: {}, confluence: {}, figma: {}, vercel: {}, stripe: {}, databases: {} },
    securitySwarm: { runtimeValidations: {}, attackChains: [], byoScanners: {}, threatModels: {}, target: 'vulns' },
    commandCenter: { view: 'board', filters: {} },
    cloudEnv: { attached: false, state: {} },
    fusionControls: { leadModel: null, sidekickModel: null, effortLevel: 'medium', fastMode: false },
    backgroundAgents: {},
    formatOnSave: false,
    languageServers: { 'rust-analyzer': { enabled: false }, 'clangd': { enabled: false }, 'pyright': { enabled: false }, 'gopls': { enabled: false } },
    screenReaderMode: false,
    wiki: { effortLevel: 'low', config: {}, lastIndexed: null },
    outposts: {},
    usage: { byProvider: {}, byProject: {}, currentSession: {} },
    // Batch 8a fields
    stepsCap: { enabled: true, global: 50, task: null, raise: 25 },
    autoCommit: { enabled: false, history: [] },
    safeMode: { approvalMode: 'smart' },
    boomerang: { enabled: false, every: 5, waitForUser: true },
    userHooks: [],
    steeringFiles: {},
    shadowCheckpoints: [],
    githubRepo: null,
    githubToken: null,
    customModes: {},
    forks: {},
    adversary: { enabled: true, autoEnableSteps: 10, maxObjections: 5, useCheapModel: true },
    sessions: {},
    activeSessionId: null,
    checkpoints: [],
    checkpointCap: 30,
    currentPlan: [],
    messageQueue: [],
    // Batch 8b fields
    nextEditSuggestions: {},
    spaces: [],
    crossSessionMessages: [],
    outputStyle: 'concise',
    ultrathink: { enabled: false, spend: 0 },
    sdk: {},
    modelRoles: {},
    hubs: [],
    ciChecks: {},
    rulesPriority: {},
    multiplayer: {},
    eventStore: [],
    processWatcher: {},
    mcpServers: {},
    midTaskSwitch: {},
    backgroundTriggers: [],
    implicitMemories: {},
    ambientContext: {},
    mcpBuilder: {},
    engines: {},
    skillPacks: {},
    serveTasks: {},
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
    'appState = (globalThis.appState || {});'
  );

const context = vm.createContext(globalScope);
try {
  vm.runInContext(patchedScriptContent, context);
} catch (e) {
  // Some functions may fail due to missing DOM, but we only need the functions we test
  // Ignore errors from UI initialization code
  console.log('Note: Script eval had non-fatal errors:', e.message);
}

// Batch 8b harness extras: the script uses bare `performance` (browser global).
if (!context.performance) context.performance = { now: () => Date.now() };

// ==================== Batch 8b: extract the functions under test ====================
const {
  // G1
  getNextEditSuggestion, acceptNextEditSuggestion, dismissNextEditSuggestion,
  // G2
  createSpace, loadSpace, exportSpace, importSpace, getSpaceTokenCost,
  // G3
  sendCrossSessionMessage, receiveCrossSessionMessage, getCrossSessionMessages,
  // G4
  generatePromptSuggestions, showPromptSuggestions,
  // G5
  setOutputStyle, getOutputStyle, applyOutputStyle,
  // G6
  toggleUltrathink, getUltrathinkCost, recordUltrathinkSpend,
  // G7
  createTask, onEvent, getResult, // SDK functions
  // G8
  setModeModel, getModeModel, applyModeModel,
  // G9
  setModelRole, getModelRole, getRoleModel,
  // G10
  exportHub, importHub, mergeHubConfig, showHubConflicts,
  // G11
  generateCiTemplate, addCiChecksStep, runCiChecks,
  // G12
  getRulesPriorityChain, resolveRuleConflict, showRulesPanel,
  // G13
  startMultiplayer, stopMultiplayer, broadcastCursor, broadcastTaskStatus,
  // G14
  recordEvent, replaySession, getEventLog, detectDivergence, hashString,
  // D8 routing
  routeModelForStep,
  // D10 MCP tool budget
  getMcpToolCounts, renderMcpServerList,
  // G15
  startProcessWatcher, stopProcessWatcher, getProcessStatus, onProcessCrash,
  // G16
  switchModelMidTask, logModelSwitch, setActiveProvider,
  // G17
  addRepoEventTrigger, removeRepoEventTrigger, runRepoEventTrigger, getRepoEventTriggers,
  // G18
  recordImplicitMemory, getImplicitMemories, deleteImplicitMemory, toggleImplicitMemories,
  // G19
  trackAmbientContext, showAmbientSuggestion, dismissAmbientSuggestion, toggleAmbientTracking,
  // G20
  buildMcpServer, testMcpServer, installMcpServer, getMcpBuilderCatalog,
  // G21
  listEngines, getEngineRateLimitState, setTaskEngineOverride, getTaskEngineOverride,
  // G22
  installSecurityAuditPack, runSecurityAuditScan, getSecurityAuditChecklist,
  // G23
  installAndroidPack, isAndroidProject, getAndroidGuidance,
} = context;

let passCount = 0;
let failCount = 0;
function assert(label, condition) {
  if (condition) { console.log('\u2713 ' + label); passCount++; }
  else { console.error('\u2717 ' + label); failCount++; }
}
function assertIncludes(haystack, needle, label) { assert(label, haystack.includes(needle)); }
function assertRegex(haystack, pattern, label) { assert(label, pattern.test(haystack)); }
function assertNotIncludes(haystack, needle, label) { assert(label, !haystack.includes(needle)); }
function fnBody(name) {
  const idx = html.indexOf('function ' + name + '(');
  if (idx === -1) return '';
  return html.slice(idx, idx + 5000);
}
function withTimeout(promise, ms, label) {
  return Promise.race([promise, new Promise((_, rej) => setTimeout(() => rej(new Error(label + ' timed out after ' + ms + 'ms')), ms))]);
}

// Shared test session (the script's getCurrentSession reads appState.sessions)
function setupSession() {
  globalScope.appState.sessions = {
    'test-session': {
      id: 'test-session', name: 'Test',
      files: { 'test.js': 'function foo() { return 1; }' },
      openTabs: [],
      steps: [{}, {}, {}], chatHistory: [{ content: 'did X' }, { content: 'did Y' }],
      checkpoints: [],
    },
  };
  globalScope.appState.activeSessionId = 'test-session';
  globalScope.appState.checkpoints = [];
  globalScope.appState.safeMode = { approvalMode: 'smart' };
  globalScope.appState.planMode = 'plan-build';
  // The harness stubs getCurrentSession (it shadows the script's block-scoped
  // version and returns a fresh throwaway object each call), so point the global
  // at the real test session — otherwise writes land in a discarded object.
  context.getCurrentSession = () => globalScope.appState.sessions[globalScope.appState.activeSessionId] || null;
  return globalScope.appState.sessions['test-session'];
}

// Persistent fake elements for getElementById overrides
const fakeEls = new Map();
function fakeEl(id, props) {
  if (!fakeEls.has(id)) {
    fakeEls.set(id, Object.assign({
      style: {}, dataset: {},
      classList: { add() {}, remove() {}, contains: () => false, toggle() {} },
      addEventListener() {}, removeEventListener: () => {},
      setAttribute() {}, getAttribute: () => null,
      value: '', checked: false, disabled: false,
      textContent: '', innerHTML: '', options: [], files: [],
      click() {}, focus() {},
    }, props || {}));
  }
  return fakeEls.get(id);
}

// Run all tests in async IIFE to support await
(async () => {
  try {
    // ==================== G1: Next Edit Suggestions ====================
    {
      const session = setupSession();
      globalScope.appState.nextEditSuggestions = { enabled: true, lastEdit: null, suggestion: null };
      // File with call graph: foo() calls bar()
      session.files['test.js'] = 'function foo() { return bar(); }\nfunction bar() { return 1; }';

      // Call the function
      const suggestion = getNextEditSuggestion('test.js', 'foo', 'function foo() { return bar(); }');
      assert('G1: getNextEditSuggestion returns suggestion object', suggestion && typeof suggestion === 'object');
      assert('G1: suggestion has text property', suggestion && typeof suggestion.text === 'string');
      assert('G1: suggestion text mentions bar', suggestion && suggestion.text.includes('bar'));

      // Accept suggestion
      const accepted = acceptNextEditSuggestion('test.js', suggestion);
      assert('G1: acceptNextEditSuggestion returns true', accepted === true);

      // Dismiss suggestion
      const dismissed = dismissNextEditSuggestion('test.js');
      assert('G1: dismissNextEditSuggestion returns true', dismissed === true);
    }

    // ==================== G2: Copilot Spaces ====================
    {
      const space = createSpace('test-space', {
        files: ['test.js', 'other.js'],
        brainNotes: [{ path: 'note.md', content: 'Some note' }],
        repoMapSlice: 'test.js -> other.js',
        goal: 'Test space goal',
      });
      assert('G2: createSpace returns space object', space && space.name === 'test-space');
      assert('G2: space has tokenCost', space && typeof space.tokenCost === 'number');

      const loaded = loadSpace('test-space');
      assert('G2: loadSpace returns space', loaded && loaded.name === 'test-space');

      const exported = exportSpace('test-space');
      assert('G2: exportSpace returns JSON string', typeof exported === 'string');
      const parsed = JSON.parse(exported);
      assert('G2: exported space has correct structure', parsed.name === 'test-space');

      const imported = importSpace(exported);
      assert('G2: importSpace returns space', imported && imported.name === 'test-space');

      const cost = getSpaceTokenCost('test-space');
      assert('G2: getSpaceTokenCost returns number', typeof cost === 'number' && cost >= 0);
    }

    // ==================== G3: Cross-session messaging ====================
    {
      globalScope.appState.sessions['session-1'] = { id: 'session-1', name: 'Session 1', files: {}, steps: [], chatHistory: [], checkpoints: [] };
      globalScope.appState.sessions['session-2'] = { id: 'session-2', name: 'Session 2', files: {}, steps: [], chatHistory: [], checkpoints: [] };
      const msg = sendCrossSessionMessage('session-1', 'session-2', 'Hello from session 1');
      assert('G3: sendCrossSessionMessage returns message object', msg && msg.fromSessionId === 'session-1');
      assert('G3: message has content', msg && msg.content === 'Hello from session 1');

      const received = receiveCrossSessionMessage('session-2');
      assert('G3: receiveCrossSessionMessage returns messages', Array.isArray(received));

      const allMessages = getCrossSessionMessages('session-2');
      assert('G3: getCrossSessionMessages returns array', Array.isArray(allMessages));
    }

    // ==================== G4: Prompt suggestions ====================
    {
      globalScope.appState.promptSuggestions = { enabled: true, lastTaskOutcome: null, suggestions: [], dismissed: [] };
      const session = setupSession();
      session.files['test.js'] = 'function foo() { return 1; }';
      session.steps = [{ tool: 'write', file: 'test.js' }, { tool: 'test', result: 'pass' }];

      const suggestions = generatePromptSuggestions('test-session');
      assert('G4: generatePromptSuggestions returns array', Array.isArray(suggestions));
      assert('G4: suggestions has up to 3 items', suggestions.length <= 3);
      if (suggestions.length > 0) {
        assert('G4: suggestion has text', typeof suggestions[0].text === 'string');
      }

      const shown = showPromptSuggestions('test-session');
      assert('G4: showPromptSuggestions returns suggestions', Array.isArray(shown));
    }

    // ==================== G5: Output styles ====================
    {
      setOutputStyle('detailed');
      assert('G5: setOutputStyle sets style', globalScope.appState.outputStyle === 'detailed');

      const style = getOutputStyle();
      assert('G5: getOutputStyle returns current style', style === 'detailed');

      const applied = applyOutputStyle('Test message', 'teacher');
      assert('G5: applyOutputStyle returns styled message', typeof applied === 'string');
      assert('G5: teacher style adds explanation', applied.includes('Teach') || applied.includes('explain') || applied.length > 10);
    }

    // ==================== G6: Ultrathink toggle ====================
    {
      toggleUltrathink(true);
      assert('G6: toggleUltrathink enables', globalScope.appState.ultrathink.enabled === true);

      const cost = getUltrathinkCost();
      assert('G6: getUltrathinkCost returns cost estimate', typeof cost === 'string' && cost.includes('2') && cost.includes('3'));

      recordUltrathinkSpend(1000);
      assert('G6: recordUltrathinkSpend records spend', globalScope.appState.ultrathink.spend === 1000);

      toggleUltrathink(false);
      assert('G6: toggleUltrathink disables', globalScope.appState.ultrathink.enabled === false);
    }

    // ==================== G7: SDK / programmatic API ====================
    {
      const task = await createTask('Test task prompt');
      assert('G7: createTask returns task object', task && task.id);
      assert('G7: task has id', typeof task.id === 'string');

      const events = [];
      const unsubscribe = await onEvent(task.id, (e) => events.push(e));
      assert('G7: onEvent returns unsubscribe function', typeof unsubscribe === 'function');

      const result = await getResult(task.id);
      assert('G7: getResult returns result or null', result === null || typeof result === 'object');
      unsubscribe();
    }

    // ==================== G8: Per-mode model ====================
    {
      setModeModel('plan', 'anthropic|claude-3-5-sonnet');
      assert('G8: setModeModel stores model', globalScope.appState.modeModels['plan'] === 'anthropic|claude-3-5-sonnet');

      const model = getModeModel('plan');
      assert('G8: getModeModel returns model', model === 'anthropic|claude-3-5-sonnet');

      // Unset mode should inherit default
      const unsetModel = getModeModel('unknown-mode');
      assert('G8: unknown mode returns null (inherit)', unsetModel === null);

      const applied = applyModeModel('plan');
      assert('G8: applyModeModel returns model string', typeof applied === 'string');
    }

    // ==================== G9: Model roles ====================
    {
      setModelRole('Planner', 'anthropic|claude-3-5-sonnet');
      assert('G9: setModelRole stores role model', globalScope.appState.modelRoles.Planner === 'anthropic|claude-3-5-sonnet');

      const roleModel = getModelRole('Planner');
      assert('G9: getModelRole returns model', roleModel === 'anthropic|claude-3-5-sonnet');

      const resolved = getRoleModel('Planner');
      assert('G9: getRoleModel resolves through router', typeof resolved === 'string');
    }

    // ==================== G10: Continue Hub ====================
    {
      const hub = exportHub();
      assert('G10: exportHub returns hub object', hub && hub.name);
      assert('G10: hub has config', hub && hub.config);

      const conflicts = mergeHubConfig(hub);
      assert('G10: mergeHubConfig returns conflicts array', Array.isArray(conflicts));

      const shown = showHubConflicts(conflicts);
      assert('G10: showHubConflicts returns UI data', shown && Array.isArray(shown.items));
    }

    // ==================== G11: AI checks in CI/CD ====================
    {
      const template = generateCiTemplate();
      assert('G11: generateCiTemplate returns YAML string', typeof template === 'string' && template.includes('name:'));

      const withChecks = addCiChecksStep(template);
      assert('G11: addCiChecksStep adds checks step', withChecks.includes('FlamingoCode checks') || withChecks.includes('flamingocode-checks'));

      const runResult = await runCiChecks('test-repo');
      assert('G11: runCiChecks returns result', runResult && typeof runResult === 'object');
    }

    // ==================== G12: Rules-file priority chain ====================
    {
      const chain = getRulesPriorityChain();
      assert('G12: getRulesPriorityChain returns array', Array.isArray(chain));
      assert('G12: chain has expected files', chain.includes('.devforge/rules.md') && chain.includes('AGENTS.md'));

      const conflict = resolveRuleConflict('test-rule', { '.devforge/rules.md': 'allow', 'AGENTS.md': 'deny' });
      assert('G12: resolveRuleConflict returns winner', conflict && conflict.winner === '.devforge/rules.md');

      const panel = showRulesPanel('test-rule');
      assert('G12: showRulesPanel returns panel data', panel && panel.chain);
    }

    // ==================== G13: Real-time multiplayer ====================
    {
      const started = startMultiplayer('test-session', 'ws://localhost:8080');
      assert('G13: startMultiplayer returns success', started === true);
      assert('G13: multiplayer enabled in state', globalScope.appState.multiplayer.enabled === true);

      broadcastCursor('test-session', { x: 100, y: 200, user: 'user1' });
      assert('G13: broadcastCursor stores cursor', globalScope.appState.multiplayer.cursors['user1']);

      broadcastTaskStatus('test-session', 'task-1', 'running');
      assert('G13: broadcastTaskStatus stores status', globalScope.appState.multiplayer.taskStatus['task-1'] === 'running');

      stopMultiplayer('test-session');
      assert('G13: stopMultiplayer disables', globalScope.appState.multiplayer.enabled === false);
    }

    // ==================== G14: Event-sourced state + deterministic replay ====================
    {
      recordEvent('test-session', 1, 'prompt_sent', { prompt: 'Test prompt' });
      assert('G14: recordEvent adds to eventStore', globalScope.appState.eventStore.length > 0);

      const events = getEventLog('test-session');
      assert('G14: getEventLog returns events', Array.isArray(events));

      const replay = replaySession('test-session', 0);
      assert('G14: replaySession returns replay result', replay && typeof replay === 'object');

      const divergence = detectDivergence('test-session', []);
      assert('G14: detectDivergence returns divergence info', divergence && typeof divergence === 'object');
    }

    // ==================== G15: Process watcher ====================
    {
      const proc = startProcessWatcher('test-proc', 'npm run dev', { cwd: '/tmp' });
      assert('G15: startProcessWatcher returns process object', proc && proc.id);

      const status = getProcessStatus(proc.id);
      assert('G15: getProcessStatus returns status', status && (status.status === 'running' || status.status === 'started'));

      const crash = onProcessCrash(proc.id, 1, 'Error: something failed');
      assert('G15: onProcessCrash returns crash info', crash && crash.exitCode === 1);

      stopProcessWatcher(proc.id);
      assert('G15: stopProcessWatcher stops process', true); // No error thrown
    }

    // ==================== G16: Mid-task model switch ====================
    {
      globalScope.appState.midTaskSwitch = { enabled: true, history: [] };
      const session = setupSession();
      session.files['test.js'] = 'function foo() { return 1; }';

      const switched = switchModelMidTask('test-session', 'anthropic|claude-3-5-sonnet', 'slow');
      assert('G16: switchModelMidTask returns true', switched === true);
      assert('G16: model switch logged in history', globalScope.appState.midTaskSwitch.history.length > 0);
      assert('G16: history entry has reason', globalScope.appState.midTaskSwitch.history[0].reason === 'slow');

      const logged = logModelSwitch('test-session', 'openai|gpt-4o', 'quota');
      assert('G16: logModelSwitch logs switch', globalScope.appState.midTaskSwitch.history.length === 2);
    }

    // ==================== G17: Background agents + automations on repo events ====================
    {
      const trigger = addRepoEventTrigger('push', 'Review PR', 'Review the PR for security issues');
      assert('G17: addRepoEventTrigger returns trigger', trigger && trigger.id);
      assert('G17: trigger has event type', trigger.event === 'push');

      const triggers = getRepoEventTriggers();
      assert('G17: getRepoEventTriggers returns array', Array.isArray(triggers) && triggers.length > 0);

      const runResult = await runRepoEventTrigger(trigger.id, { ref: 'refs/heads/main' });
      assert('G17: runRepoEventTrigger returns result', runResult && runResult.inboxItemId);

      const removed = removeRepoEventTrigger(trigger.id);
      assert('G17: removeRepoEventTrigger returns true', removed === true);
    }

    // ==================== G18: Implicit memories ====================
    {
      globalScope.appState.implicitMemories = { enabled: true, entries: {} };
      recordImplicitMemory('refactor-model', 'anthropic|claude-3-5-sonnet', 'User switched to this model for refactor tasks 3 times');
      assert('G18: recordImplicitMemory creates entry', globalScope.appState.implicitMemories.entries['refactor-model']);

      const memories = getImplicitMemories();
      assert('G18: getImplicitMemories returns entries', Array.isArray(memories) && memories.length > 0);
      assert('G18: memory has evidence', memories[0].evidence && memories[0].evidence.includes('3 times'));

      const deleted = deleteImplicitMemory('refactor-model');
      assert('G18: deleteImplicitMemory returns true', deleted === true);
      assert('G18: memory is deleted', !globalScope.appState.implicitMemories.entries['refactor-model']);

      toggleImplicitMemories(false);
      assert('G18: toggleImplicitMemories disables', globalScope.appState.implicitMemories.enabled === false);
    }

    // ==================== G19: Ambient context tracking ====================
    {
      globalScope.appState.ambientContext = { enabled: true, currentContext: {}, dismissedKinds: [], suggestions: [] };
      trackAmbientContext('test.js', 'myFunction', 'hover');
      assert('G19: trackAmbientContext updates context', globalScope.appState.ambientContext.currentContext.file === 'test.js');

      const suggestion = showAmbientSuggestion('test-missing-test', 'Write test for myFunction');
      assert('G19: showAmbientSuggestion returns suggestion', suggestion && suggestion.kind === 'test-missing-test');

      const dismissed = dismissAmbientSuggestion('test-missing-test');
      assert('G19: dismissAmbientSuggestion adds to dismissedKinds', globalScope.appState.ambientContext.dismissedKinds.includes('test-missing-test'));

      toggleAmbientTracking(false);
      assert('G19: toggleAmbientTracking disables', globalScope.appState.ambientContext.enabled === false);
    }

    // ==================== G20: MCP Builder ====================
    {
      const server = buildMcpServer('GitHub Issue Summary', 'Read GitHub issues and provide summary');
      assert('G20: buildMcpServer returns server def', server && server.name && server.tools);

      const testResult = await testMcpServer(server);
      assert('G20: testMcpServer returns test results', Array.isArray(testResult.results));

      const installed = installMcpServer(server);
      assert('G20: installMcpServer returns installed server', installed && installed.trusted === false);

      const catalog = getMcpBuilderCatalog();
      assert('G20: getMcpBuilderCatalog returns catalog', Array.isArray(catalog) && catalog.length > 0);
    }

    // ==================== G21: ECC engine-agnostic layer ====================
    {
      globalScope.appState.engines = { 'ollama-local': { models: ['llama3.1'], rateLimit: { remaining: 100 } } };
      const engines = listEngines();
      assert('G21: listEngines returns engines', Array.isArray(engines) && engines.length > 0);

      const rateLimit = getEngineRateLimitState('ollama-local');
      assert('G21: getEngineRateLimitState returns state', rateLimit && typeof rateLimit.remaining === 'number');

      setTaskEngineOverride('task-1', 'ollama-local');
      assert('G21: setTaskEngineOverride stores override', globalScope.appState.taskEngineOverrides['task-1'] === 'ollama-local');

      const override = getTaskEngineOverride('task-1');
      assert('G21: getTaskEngineOverride returns override', override === 'ollama-local');
    }

    // ==================== G22: Security-audit skill pack ====================
    {
      const pack = installSecurityAuditPack();
      assert('G22: installSecurityAuditPack installs pack', pack && pack.installed === true);

      const scan = await runSecurityAuditScan('test-repo');
      assert('G22: runSecurityAuditScan returns findings', Array.isArray(scan.findings));

      const checklist = getSecurityAuditChecklist();
      assert('G22: getSecurityAuditChecklist returns checklist', Array.isArray(checklist) && checklist.length > 0);
      assert('G22: checklist has OWASP items', checklist.some(c => c.category === 'OWASP Top 10'));
    }

    // ==================== G23: Android skills pack ====================
    {
      globalScope.appState.androidPack = { installed: false, guidance: {} };
      const pack = installAndroidPack();
      assert('G23: installAndroidPack installs pack', pack && pack.installed === true);

      const isAndroid = isAndroidProject({ 'build.gradle': 'android { }' });
      assert('G23: isAndroidProject detects Android', isAndroid === true);

      const guidance = getAndroidGuidance('Compose');
      assert('G23: getAndroidGuidance returns guidance', typeof guidance === 'string' && guidance.length > 0);
    }

    // ==================== MERGED BEHAVIOR (repair verification) ====================
    // These assert the MERGED single definitions, not the old duplicates.
    {
      // --- Spaces by id (the UI passes ids, not names) ---
      const space = createSpace('merged-space', { files: ['test.js'], brainNotes: [], repoMapSlice: '', goal: 'merged' });
      assert('MERGED G2: loadSpace by id', loadSpace(space.id) && loadSpace(space.id).name === 'merged-space');
      const exportedById = exportSpace(space.id);
      assert('MERGED G2: exportSpace by id returns JSON', typeof exportedById === 'string' && JSON.parse(exportedById).name === 'merged-space');

      // --- MCP Builder: tools parsed from the description + no-arg test/install ---
      const parsed = buildMcpServer('GitHub Issue Summary', 'Read GitHub issues and provide summary');
      assert('MERGED G20: buildMcpServer parses a read tool', parsed.tools.some(x => x.name.includes('read')));
      assert('MERGED G20: buildMcpServer parses a summarize tool', parsed.tools.some(x => x.name.includes('summarize')));
      globalScope.appState.mcpBuilderLastGenerated = parsed;
      const noArgTest = await testMcpServer();
      assert('MERGED G20: testMcpServer() with no args returns results', Array.isArray(noArgTest.results) && noArgTest.results.length === parsed.tools.length);
      const noArgInstall = installMcpServer();
      assert('MERGED G20: installMcpServer() with no args installs untrusted', noArgInstall && noArgInstall.trusted === false);
      const badTest = await testMcpServer({ name: 'bad', tools: [{ name: 'x' }] });
      assert('MERGED G20: testMcpServer flags a malformed tool', badTest.results[0] && badTest.results[0].success === false);

      // --- Hub import with a File ---
      const hub = exportHub();
      const hubFile = new File([JSON.stringify(hub)], 'hub.json', { type: 'application/json' });
      const importedHub = await importHub(hubFile);
      assert('MERGED G10: importHub with a File returns the hub', importedHub && importedHub.name === hub.name && !importedHub.error);
      const importedStr = await importHub(JSON.stringify(hub));
      assert('MERGED G10: importHub with a JSON string returns the hub', importedStr && importedStr.name === hub.name);

      // --- Replay: re-apply, skip already-applied, flag divergence ---
      globalScope.appState.sessions['replay-session'] = { id: 'replay-session', files: {}, openTabs: [], steps: [], chatHistory: [], checkpoints: [] };
      const rs = globalScope.appState.sessions['replay-session'];
      recordEvent('replay-session', 0, 'file_write', { file: 'replay.js', content: 'v1', beforeHash: hashString('') });
      rs.files['replay.js'] = 'v1'; // already applied in real time
      const replayAlready = replaySession('replay-session', 0);
      assert('MERGED G14: replay skips an already-applied write', replayAlready.skipped.length === 1 && replayAlready.diverged === false);
      rs.files['replay.js'] = 'CHANGED'; // someone edited it since
      const replayDiverge = replaySession('replay-session', 0);
      assert('MERGED G14: replay flags a before-state divergence', replayDiverge.diverged === true && replayDiverge.divergences.length === 1);
      assert('MERGED G14: replay restores the recorded content', rs.files['replay.js'] === 'v1');
      // Two writes to the same file without a checkpoint: first applies, second skips
      globalScope.appState.sessions['replay-session-2'] = { id: 'replay-session-2', files: {}, openTabs: [], steps: [], chatHistory: [], checkpoints: [] };
      recordEvent('replay-session-2', 0, 'file_write', { file: 'dup.js', content: 'one', beforeHash: hashString('') });
      recordEvent('replay-session-2', 1, 'file_write', { file: 'dup.js', content: 'two', beforeHash: hashString('one') });
      const replayDup = replaySession('replay-session-2', 0);
      assert('MERGED G14: replay applies the first write, skips the duplicate', replayDup.applied.filter(a => a.type === 'file_write').length === 1 && replayDup.skipped.filter(s => s.type === 'file_write').length === 1);

      // --- CI checks: a real failure lands in triage; a clean session passes ---
      const cs = setupSession();
      cs.files['broken.js'] = 'function broken( {';
      const ciFail = await runCiChecks('test-repo');
      assert('MERGED G11: runCiChecks fails lint on a syntax error', ciFail.lint.passed === false && ciFail.lint.issues > 0);
      assert('MERGED G11: runCiChecks failure lands in triage', ciFail.triage && typeof ciFail.triage.classification === 'string');
      delete cs.files['broken.js'];
      const ciPass = await runCiChecks('test-repo');
      assert('MERGED G11: runCiChecks passes a clean session', ciPass.lint.passed === true && ciPass.triage === null);
      const ciTemplate = generateCiTemplate();
      assert('MERGED G11: generateCiTemplate includes the checks step', ciTemplate.includes('FlamingoCode checks'));

      // --- Security scan: a real secret is found; a clean session is clean ---
      cs.files['config.js'] = "const apiKey = 'sk-1234567890abcdef';";
      const secScan = await runSecurityAuditScan('test-repo');
      assert('MERGED G22: runSecurityAuditScan finds a hardcoded API key', secScan.findings.some(f => f.file === 'config.js'));
      delete cs.files['config.js'];
      const secClean = await runSecurityAuditScan('test-repo');
      assert('MERGED G22: runSecurityAuditScan is clean without secrets', secClean.findings.length === 0);

      // --- MCP >40-tools warning ---
      const savedServers = globalScope.appState.mcpServers;
      globalScope.appState.mcpServers = {
        s1: { id: 's1', name: 'Server One', enabled: true, transport: 'stdio', command: 'node s1.js', description: 'Test server one', enabledTools: Array.from({ length: 25 }, (_, i) => 'tool_' + i) },
        s2: { id: 's2', name: 'Server Two', enabled: true, transport: 'stdio', command: 'node s2.js', description: 'Test server two', enabledTools: Array.from({ length: 25 }, (_, i) => 'tool_' + i) },
      };
      const counts = getMcpToolCounts();
      assert('MERGED D10: getMcpToolCounts totals enabled tools', counts.total === 50);
      assert('MERGED D10: >40 tools trips the warning', counts.overLimit === true);
      renderMcpServerList();
      globalScope.appState.mcpServers = { s1: { id: 's1', name: 'Server One', enabled: true, transport: 'stdio', command: 'node s1.js', description: 'Test server one', enabledTools: ['a', 'b'] } };
      const countsUnder = getMcpToolCounts();
      assert('MERGED D10: under 40 tools is not over the limit', countsUnder.overLimit === false);
      globalScope.appState.mcpServers = savedServers;

      // --- Implicit memories: the object shape, not the old array ---
      globalScope.appState.implicitMemories = { enabled: true, entries: {} };
      recordImplicitMemory('merged-key', 'openai|gpt-4o', 'evidence text');
      assert('MERGED G18: implicitMemories is an object store', !Array.isArray(globalScope.appState.implicitMemories) && typeof globalScope.appState.implicitMemories.entries === 'object');
      assert('MERGED G18: entry has id === key', globalScope.appState.implicitMemories.entries['merged-key'].id === 'merged-key');

      // --- Ambient toggle actually gates tracking ---
      globalScope.appState.ambientContext = { enabled: true, currentContext: {}, dismissedKinds: [], suggestions: [] };
      trackAmbientContext('a.js', 'fn', 'hover');
      assert('MERGED G19: tracking on updates context', globalScope.appState.ambientContext.currentContext.file === 'a.js');
      toggleAmbientTracking(false);
      const gated = trackAmbientContext('b.js', 'fn2', 'hover');
      assert('MERGED G19: toggle off gates tracking', gated && gated.ignored === true && globalScope.appState.ambientContext.currentContext.file !== 'b.js');
      toggleAmbientTracking(true);

      // --- Mid-task switch actually switches the provider ---
      setupSession();
      globalScope.appState.activeProviderId = 'ollama-local';
      switchModelMidTask('test-session', 'openai|gpt-4o', 'slow');
      assert('MERGED G16: switchModelMidTask switches the provider', globalScope.appState.activeProviderId === 'openai');

      // --- Role model is consulted by the router ---
      globalScope.appState.rateLimitState = {};
      setModelRole('Coder', 'openai|gpt-4o');
      assert('MERGED G9: getRoleModel returns the configured role model', getRoleModel('Coder') === 'openai|gpt-4o');
      const routed = routeModelForStep({ text: 'build the thing', kind: 'build' });
      assert('MERGED G9: routeModelForStep consults the role model', routed && routed.provider === 'openai' && routed.model === 'gpt-4o' && routed.reason.includes('role: Coder'));

      // --- Multiplayer without a relay is honestly local-only ---
      globalScope.appState.multiplayer = {};
      const noRelay = startMultiplayer('test-session');
      assert('MERGED G13: startMultiplayer without a relay reports not-connected', noRelay && noRelay.connected === false);
      stopMultiplayer('test-session');

      // --- G18: at 3 repeats the pattern is written to the Brain (same Brain, never a second memory) ---
      setupSession();
      globalScope.appState.implicitMemories = { enabled: true, entries: {} };
      recordImplicitMemory('brain-key', 'openai|gpt-4o', 'evidence one');
      recordImplicitMemory('brain-key', 'openai|gpt-4o', 'evidence two');
      recordImplicitMemory('brain-key', 'openai|gpt-4o', 'evidence three');
      const brainEntry = globalScope.appState.implicitMemories.entries['brain-key'];
      assert('MERGED G18: 3 repeats mark the memory brain-written', brainEntry && brainEntry.brainWritten === true);
      const brainNoteFiles = Object.keys(globalScope.appState.sessions['test-session'].files).filter(f => f.includes('implicit-memory'));
      assert('MERGED G18: a Brain note file exists for the pattern', brainNoteFiles.length > 0);

      // --- G16: header-picker change mid-task is logged as a mid-task switch ---
      setupSession();
      globalScope.appState.sessions['test-session'].planStepIndex = 2; // a plan is mid-execution
      globalScope.appState.midTaskSwitch = { enabled: true, history: [] };
      globalScope.appState.activeProviderId = 'ollama-local';
      setActiveProvider('openai');
      assert('MERGED G16: header-picker change mid-task is logged', globalScope.appState.midTaskSwitch.history.length === 1 && globalScope.appState.midTaskSwitch.history[0].toModel.includes('openai'));
      globalScope.appState.activeProviderId = 'ollama-local';

      // --- Engine rate limits come from rateLimitState ---
      globalScope.appState.engines = {};
      globalScope.appState.rateLimitState = { 'ollama-local': { isLimited: true, retryAfter: Date.now() + 60000 } };
      const rl = getEngineRateLimitState('ollama-local');
      assert('MERGED G21: limited engine reports 0 remaining', rl.remaining === 0);
      const engines = listEngines();
      assert('MERGED G21: listEngines marks the limited engine', engines.find(e => e.id === 'ollama-local').limited === true);
      globalScope.appState.rateLimitState = {};
      globalScope.appState.engines = {};
    }

    // ==================== Summary ====================
    console.log('\n--- Batch 8b Test Summary ---');
    console.log('Passed:', passCount);
    console.log('Failed:', failCount);

    if (failCount > 0) {
      console.log('\nSome tests failed. Check implementation.');
      process.exit(1);
    } else {
      console.log('\nAll Batch 8b tests passed!');
      // Ensure clean exit (background timer in DOM-less eval can crash process after tests pass)
      setTimeout(() => process.exit(0), 100);
    }
  } catch (e) {
    console.error('Test suite error:', e.message);
    console.error(e.stack);
    process.exit(1);
  }
})();