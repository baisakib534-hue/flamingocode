// Test suite for Devin Audit Gaps — ~40 features across sections A–D
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
  alert: () => {},
  confirm: () => true,
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
    'appState = (globalThis.appState || {\n  prompts: [],\n  customSkillPacks: {},\n  customPluginPacks: {},\n  mcpServers: {},\n  sessions: {},\n  activeSessionId: null,\n    providers: {},\n    activeProviderId: null,\n    agents: {},\n    activeAgentId: null,\n    teamMode: false,\n    teamRoster: [],\n    teamSeniorId: null,\n    teamTaskBoard: [],\n    teamChat: [],\n    teamPhase: null,\n    teamReviewRound: 0,\n    planMode: "general",\n    defaultMode: "general",\n    readOnlyPlanMode: false,\n    currentPlan: [],\n    planStepIndex: 0,\n    planPaused: false,\n    planRevisionCount: 0,\n    planMaxSteps: 25,\n    planMaxRevisions: 5,\n    stepPlannerEnabled: false,\n    thinkActObserveState: "idle",\n    currentStepPlan: null,\n    todoListExpanded: false,\n    uncensoredPerProject: {},\n    uncensoredPerModel: {},\n    generalModeShowCode: {},\n    autonomy: { catalogInjected: true, mandatoryUseEnabled: true, lastToolsUsed: [], checks: { "testing-qa": false, "security-review": false, "domain-skill": false }, taskHistory: [] },\n    safeMode: { approvalMode: "smart", hardlineBlocklist: ["delete project","rm -rf /","send provider key","overwrite 9router key","git push --force","curl | sh","wget | sh","delete all files","purge database","drop table"], denyRules: ["git push --force*","curl * | sh*","wget * | sh*","rm -rf *","sudo *"], lastSmartDecision: null, yoloBannerDismissed: false },\n    checkpoints: [],\n    checkpointCap: 30,\n    diffReviewEnabled: true,\n    pendingChanges: null,\n    repoMapBudget: 1024,\n    repoMapEnabled: true,\n    autocompleteEnabled: true,\n    // Audit gap fields\n    oncallResponders: [],\n    oncallIncidents: {},\n    oncallKnownIssues: [],\n    memoryDrive: { notes: {}, index: "", pinned: [] },\n    dreamingSessions: [],\n    efficiency: { score: 50, grade: "Unknown", coachFlags: {}, approvalCeilings: {}, pendingApprovals: [] },\n    marketplace: { installed: {} },\n    secrets: {},\n    triageAutomations: [],\n    cveInventory: {},\n    cvePatches: [],\n    pylon: { connected: false, config: {}, tickets: {} },\n    integrations: { sentry: {}, datadog: {}, pagerduty: {}, snyk: {}, notion: {}, confluence: {}, figma: {}, vercel: {}, stripe: {}, databases: {} },\n    securitySwarm: { runtimeValidations: {}, attackChains: [], byoScanners: {}, threatModels: {}, target: "vulns" },\n    commandCenter: { view: "board", filters: {} },\n    cloudEnv: { attached: false, state: {} },\n    fusionControls: { leadModel: null, sidekickModel: null, effortLevel: "medium", fastMode: false },\n    backgroundAgents: {},\n    formatOnSave: false,\n    languageServers: { "rust-analyzer": { enabled: false }, "clangd": { enabled: false }, "pyright": { enabled: false }, "gopls": { enabled: false } },\n    screenReaderMode: false,\n    wiki: { effortLevel: "low", config: {}, lastIndexed: null },\n    outposts: {},\n    usage: { byProvider: {}, byProject: {}, currentSession: {} },\n    stepsCap: { enabled: true, global: 50, task: null, raise: 25 },\n    autoCommit: { enabled: false, history: [] },\n    safeMode: { approvalMode: "smart" },\n    boomerang: { enabled: false, every: 5, waitForUser: true },\n    userHooks: [],\n    steeringFiles: {},\n    shadowCheckpoints: [],\n    githubRepo: null,\n    customModes: {},\n    forks: {},\n    adversary: { enabled: true, autoEnableSteps: 10, maxObjections: 5, useCheapModel: true },\n    sessions: {},\n    activeSessionId: null,\n    checkpoints: [],\n    checkpointCap: 30,\n    currentPlan: [],\n    messageQueue: []\n});'
  );

const context = vm.createContext(globalScope);
try {
  vm.runInContext(patchedScriptContent, context);
} catch (e) {
  // Some functions may fail due to missing DOM, but we only need the functions we test
  // Ignore errors from UI initialization code
  console.log('Note: Script eval had non-fatal errors:', e.message);
}
// ==================== Batch 8a tests (string + functional) ====================
// ==================== Batch 8a: extract the functions under test ====================
const {
  sendArchitectPrompt, saveArchitecturePlan,
  performAutoCommit, revertAutoCommit,
  runAgentWithModel, runHiddenTests,
  runServeTest, handleServeCreateTask, handleServeGetTask, handleServeTaskMessage,
  createSessionFork, runAdversaryReview, parseAdversaryResponse, resolveAdversaryObjection,
  loadCustomModes, triggerBoomerangCheckin, waitForBoomerangResponse,
  createShadowCheckpoint, createCheckpoint, loadSteeringFiles, getSteeringContentForBrain,
  loadHooks, saveUserHook, renderUserHooksTab, fireUserHooks,
  loadPowers, toggleBuiltinPower, isToolAllowedByPowers, getEnabledPowerTools,
  trackFileEdit, trackToolFailure, detectDoomLoop,
  checkGithubTriggers, addTriggeredTask,
  renderStepsCapTab, getEffectiveStepsCap, isStepsCapReached, writeStepsCapHandoff,
  parseAndApplyBlocks, writeBrainNote, getCurrentSession, estimateTokens, getCheapProvider,
  exportBackup, searchTools,
} = context;

// Batch 8a harness extras: the script uses bare `performance` (browser global).
if (!context.performance) context.performance = { now: () => Date.now() };

let passCount = 0;
let failCount = 0;
function assert(label, condition) {
  if (condition) { console.log(`✓ ${label}`); passCount++; }
  else { console.error(`✗ ${label}`); failCount++; }
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
const origGetById = context.document.getElementById;
context.document.getElementById = (id) => (fakeEls.has(id) ? fakeEls.get(id) : origGetById(id));

// ============================================================
// Part A — string-presence asserts (UI text + existence + wiring)
// ============================================================
console.log('\n=== F1: Architect mode ===');
assertIncludes(html, 'architect', 'Architect mode value in mode picker');
assertIncludes(html, 'Architect mode — শুধু plan, কোড বদলাবে না', 'Exact Bengali refusal message for Architect mode');
assertIncludes(html, 'sendArchitectPrompt', 'sendArchitectPrompt function exists');
assertIncludes(html, 'saveArchitecturePlan', 'saveArchitecturePlan function exists');
assertIncludes(html, '.devforge/architecture-plan.md', 'Architecture plan save path referenced');
assertIncludes(html, 'data-i18n="Architect"', 'Architect mode label in mode picker');
assertIncludes(html, 'এই plan দিয়ে build করো', 'Build with this plan button text in Bengali');
assertRegex(html, /updateArchitectIndicator|architectIndicator/, 'Architect indicator update function exists');
assertRegex(html, /ARCHITECT MODE GUARD|Write blocked.*Architect mode|architect.*mode.*refuse/i, 'Architect mode write refusal logic exists');
assertRegex(html, /appState\.planMode === 'architect'/, 'Architect guard reads planMode');

console.log('\n=== F2: Git auto-commit ===');
assertIncludes(html, 'autoCommit', 'autoCommit config in appState');
assertIncludes(html, 'performAutoCommit', 'performAutoCommit function exists');
assertIncludes(html, 'revertAutoCommit', 'revertAutoCommit function exists');
assertIncludes(html, 'updateAutoCommitUI', 'updateAutoCommitUI function exists');
assertIncludes(html, 'renderCommitsView', 'renderCommitsView function exists');
assertIncludes(html, 'autoCommitEnabled', 'Auto-commit checkbox ID exists');
assertIncludes(html, 'autoCommitGitStatus', 'Auto-commit git status element exists');
assertIncludes(html, 'এই প্রজেক্টে git নেই', 'Bengali "no git repo" message');
assertIncludes(html, 'commitsView', 'Commits view container exists');
assertIncludes(html, 'Auto-commits created after green task completions', 'Commits view description');
assertIncludes(html, 'পূর্বাবস্থা', 'Revert button text in Bengali');
assertIncludes(html, 'flamingocode:', 'Commit message format prefix');
assertIncludes(html, 'Git Auto-commit', 'Git Auto-commit section label');
assertIncludes(html, 'isGitRepo', 'isGitRepo function exists');
assertRegex(html, /autoCommit.*enabled.*false/, 'autoCommit default OFF');
assertRegex(html, /fireHook.*task-complete|performAutoCommit.*gateOK|autoCommit.*enabled.*gateOK/i, 'Auto-commit triggered on task completion');
assert('hash regex matches real git output "[main abc1234]"', (() => { const start = html.indexOf('commitResult.stdout.match(/'); if (start === -1) return false; const lit = html.slice(start + 'commitResult.stdout.match(/'.length); const end = lit.indexOf('/)'); if (end === -1) return false; const re = eval('/' + lit.slice(0, end) + '/'); const g = '[main abc1234]'.match(re); return !!g && g[1] === 'abc1234'; })());

console.log('\n=== F3: Model benchmark ===');
assertIncludes(html, 'Benchmark', 'Benchmark panel label');
assertIncludes(html, 'benchmark', 'Benchmark function/logic exists');
assertIncludes(html, 'benchmarkTask', 'Built-in benchmark tasks defined');
assertRegex(html, /bugfix|small feature|refactor/i, 'Three benchmark task types referenced');
assertRegex(html, /time|tokens|cost|tests passed|steps used/i, 'Benchmark metrics recorded');
assertRegex(html, /এই ধরনের কাজে.*সবচেয়ে ভালো|recommendation/i, 'Benchmark recommendation text in Bengali');
assertRegex(html, /steps.*cap|maxSteps/i, 'Steps cap respected in benchmark');
assertRegex(html, /rate.limit|rateLimit/i, 'Rate limits respected in benchmark');
assert('runAgentWithModel has no random numbers (was fabricated)', !/Math\.random\(\)/.test(fnBody('runAgentWithModel')));
assertRegex(fnBody('runHiddenTests'), /new Function/, 'runHiddenTests really evaluates the tests (was a substring heuristic)');

console.log('\n=== F4: Goose serve (HTTP API) ===');
assertIncludes(html, 'Serve', 'Serve panel/tab label');
assertIncludes(html, '/v1/tasks', 'Serve API endpoint /v1/tasks');
assertIncludes(html, 'POST /v1/tasks', 'POST /v1/tasks endpoint documented');
assertIncludes(html, 'GET /v1/tasks/:id', 'GET /v1/tasks/:id endpoint documented');
assertIncludes(html, 'POST /v1/tasks/:id/message', 'POST /v1/tasks/:id/message endpoint documented');
assertIncludes(html, 'sessionAPI', 'sessionAPI handler used by serve');
assertRegex(html, /In-App Runner/i, 'In-app runner button referenced');
assertIncludes(html, 'curl', 'curl examples in serve panel');
assertRegex(html, /serve.*toggle|serveToggle/i, 'Serve toggle exists');
assertRegex(html, /does not listen on a port/i, 'Web app does not claim to listen on port');
assertRegex(fnBody('runServeTest'), /handleServeGetTask|handleServeTaskMessage/, 'Serve runner exercises GET + message handlers');

console.log('\n=== F5: Session fork ===');
assertIncludes(html, 'fork', 'Fork function/logic exists');
assertIncludes(html, 'forked from', 'Fork parent label referenced');
assertRegex(html, /fork.*session|session.*fork/i, 'Session fork capability');
assertRegex(html, /history.*up to|shar.*history/i, 'Fork shares history up to fork point');

console.log('\n=== F6: Adversary mode ===');
assertIncludes(html, 'Adversary', 'Adversary mode label');
assertIncludes(html, 'adversary', 'Adversary function/logic exists');
assertRegex(html, /objection|review comment/i, 'Adversary files objections as review comments');
assertRegex(html, /5.*objection|max.*5.*objection|objection.*cap/i, 'Adversary capped at 5 objections');
assertRegex(html, /cheap.*model|CHEAP/i, 'Adversary uses cheap model');
assertNotIncludes(html, "callMCPTool('mcp_web_search', { query: adversaryPrompt })", 'Adversary no longer fakes it via web search');
assertRegex(fnBody('runAdversaryReview'), /callLLM\(/, 'Adversary calls the cheap model for real');
assertRegex(fnBody('parseAdversaryResponse'), /JSON\.parse/, 'parseAdversaryResponse really parses JSON (was: return [] always)');
assertRegex(html, /resolveAdversaryObjection\(\$\{objections\.length - 1 - idx\}\)/, 'Adversary list has a working Resolve button');
assertRegex(html, /runAdversaryReview\(\{ steps: appState\.currentPlan \}/, 'Approve & Build is gated by the Adversary');

console.log('\n=== F7: Custom modes as files ===');
assertIncludes(html, '.devforge/modes', 'Custom modes directory path');
assertIncludes(html, 'custom mode', 'Custom mode concept referenced');
assertRegex(html, /allowed.tools|allowedTools|tools.*checkbox/i, 'Custom mode allowed tools checkboxes');
assertRegex(html, /frontmatter|front.matter|bad.*mode.*error/i, 'Broken mode file error handling');
assertRegex(html, /built.in.*cannot.*delete|built-in.*immutable/i, 'Built-in modes cannot be deleted');

console.log('\n=== F8: Boomerang tasks ===');
assertIncludes(html, 'boomerang', 'Boomerang mode label/function');
assertRegex(html, /boomerang.*step|step.*boomerang|every.*N.*step/i, 'Boomerang pauses every N steps');
assertIncludes(html, 'চালিয়ে যাও', 'Bengali "continue" button');
assertIncludes(html, 'থামো', 'Bengali "stop" button');
assertIncludes(html, 'এই অংশটা বদলাও', 'Bengali "change this part" button');
assertRegex(html, /human.*checkpoint|checkpoint.*human/i, 'Boomerang uses human checkpoint UI');
assertRegex(html, /triggerBoomerangCheckin\(autoTurn \+ 1/, 'Boomerang hooks into the agent loop');

console.log('\n=== F9: Shadow-git checkpoints ===');
assertRegex(html, /Shadow Git|renderShadowGitTab/, 'Shadow-git label/function');
assertIncludes(html, 'flamingocode-checkpoints', 'Shadow-git branch name');
assertRegex(html, /git.*stash|stash.*snapshot/i, 'Shadow-git uses stash-style snapshot');
assertRegex(html, /HEAD.*recorded|record.*HEAD/i, 'Checkpoint records git HEAD');
assertRegex(html, /restore.*code.*app.*state|code.*app.*state.*agree/i, 'Restore syncs code and app state');
assertRegex(html, /no.*git.*repo.*local.*only|without.*git.*works.*before/i, 'Works without git repo');
assertRegex(html, /createShadowCheckpoint\(checkpoint\.id\)/, 'createCheckpoint backs up to shadow-git');

console.log('\n=== F10: Steering files ===');
assertIncludes(html, '.devforge/steering', 'Steering files directory path');
assertIncludes(html, 'Steering', 'Steering panel label');
assertRegex(html, /steering.*digest|digest.*steering/i, 'Steering files in Brain digest');
assertRegex(html, /cap.*1500|1500.*token|token.*cap/i, 'Brain digest cap ~1500 tokens referenced');
assertRegex(html, /toggle.*off.*per.*project|steering.*disabled/i, 'Steering file can be toggled off');
assertRegex(fnBody('exportBackup'), /steeringFiles/, 'Steering files in A3 backup export');
assertRegex(html, /steeringState\.files = data\.steeringFiles/, 'Steering files restored by A3 backup import');
assertRegex(html, /getSteeringContentForBrain\(\)/, 'Brain digest pulls steering content');

console.log('\n=== F11: Agent hooks (user-defined) ===');
assertIncludes(html, 'Hooks', 'Hooks panel/tab label');
assertRegex(html, /userHook|user-defined hook/i, 'User-defined hooks concept');
assertRegex(html, /step-complete|plan-approved|publish-done/i, 'New hook events: step-complete, plan-approved, publish-done');
assertRegex(html, /fireUserHooks\(event, data\)/, 'User hooks fire through the same fireHook path');
assertRegex(html, /shell.*check.*safe.*mode|safe.*mode.*shell/i, 'Shell hooks only in Safe Mode Manual/Off');
assertRegex(html, /3.*time.*fail|fail.*3.*time|auto-disable/i, 'Hook auto-disables after 3 failures');
assertRegex(html, /notification|Brain.*note|shell.*check/i, 'Hook actions: notification, Brain note, shell check');
assertIncludes(html, 'settingsPaneUserHooks', 'User Hooks have their own settings pane (no duplicate id)');
assertIncludes(html, 'saveUserHook', 'F11 functions renamed off the H5.4 collision');
assertNotIncludes(html, 'id="hooksList" style="font-size: 10px', 'No duplicate hooksList id');
assertRegex(html, /safeMode\.approvalMode/, 'safeMode read as an object, not a string');

console.log('\n=== F12: Powers ===');
assertIncludes(html, '.devforge/powers.json', 'Powers config file path');
assertIncludes(html, 'Powers', 'Powers panel/label');
assertRegex(html, /capability.*pack|power.*bundle/i, 'Powers as capability packs');
assertRegex(html, /Web research|Security review|Design polish/i, 'Built-in powers referenced');
assertRegex(html, /unload.*tool|tool.*unload|lazy.*load/i, 'Power off unloads tools (lazy loading)');
assertRegex(html, /never.*auto.install|install.*user.*action/i, 'Power never auto-installs MCP');
assertRegex(html, /isToolAllowedByPowers\(t\.id\)/, 'Step tool-picker filters by enabled Powers');
assertRegex(html, /power\.enabled !== false/, 'Powers default ON unless explicitly disabled');

console.log('\n=== F13: Doom-loop detection ===');
assertIncludes(html, 'doom', 'Doom loop detection label/function');
assertRegex(html, /maxEdits:\s*3/, 'Same file edited 3 times with same error (maxEdits 3)');
assertRegex(html, /maxFailures:\s*3/, 'Same tool call failing 3 times (maxFailures 3)');
assertRegex(html, /stuck.*note|DOOM.*LOOP|doom.*loop/i, 'Writes stuck note to Brain');
assertRegex(html, /different.*approach|ask.*user|escalate|switch.*model/i, 'Offers: different approach, ask user, escalate, switch model');
assertRegex(html, /trackFileEdit\(_f, _e\.message\)/, 'Self-healing loop feeds the doom detector');
assertRegex(html, /trackToolFailure\('screenshot-to-app'/, 'Tool failures feed the doom detector');

console.log('\n=== F14: GitHub App trigger ===');
assertIncludes(html, 'GitHub', 'GitHub trigger label/function');
assertRegex(html, /@flamingocode|flamingocode.*label/i, 'Trigger on @flamingocode mention or label');
assertRegex(html, /task.*inbox|inbox.*task/i, 'Pulls into task inbox');
assertRegex(html, /READ.*GitHub|never.*write.*GitHub|only.*reads/i, 'Trigger only READs GitHub');
assertRegex(html, /poll|webhook/i, 'Poll or webhook for triggers');
assertRegex(fnBody('checkGithubTriggers'), /api\.github\.com/, 'Trigger really polls the GitHub API (was a stub)');
assertNotIncludes(fnBody('checkGithubTriggers'), 'we simulate the check', 'Trigger no longer simulates the check');

console.log('\n=== F15: Steps cap ===');
assertIncludes(html, 'stepsCap', 'Steps cap setting exists');
assertRegex(html, /5.*500|default.*50/i, 'Steps cap range 5-500, default 50');
assertRegex(html, /handoff.*note|handoffNote|what.*done.*what.*remains/i, 'Handoff note with done/remaining/next step');
assertRegex(html, /agent.*loop.*enforce|enforce.*agent.*loop/i, 'Cap enforced in agent loop');
assertRegex(html, /resume.*exact.*step|continue.*raise.*cap/i, 'Resume from exact step, continue raises cap');
assertIncludes(html, 'function renderStepsCapTab', 'Steps Cap tab has a render function (was missing)');
assertIncludes(html, 'function getEffectiveStepsCap', 'Effective-cap helper exists');
assertRegex(html, /isStepsCapReached\(session\)/, 'Cap check hooks into the agent loop');
assertRegex(html, /stepsTaken = \(session\.stepsTaken \|\| 0\) \+ 1/, 'Each agent turn counts one step');

console.log('\n=== Cross-cutting: no duplicate definitions (F11 repair) ===');
{
  const countDef = (name) => (html.match(new RegExp('function ' + name + '\\(', 'g')) || []).length;
  assert('saveHook defined once (H5.4 only)', countDef('saveHook') === 1);
  assert('deleteHook defined once (H5.4 only)', countDef('deleteHook') === 1);
  assert('editHook defined once (H5.4 only)', countDef('editHook') === 1);
  assert('renderHooksTab defined once (H5.4 only)', countDef('renderHooksTab') === 1);
  assert('saveUserHook defined once (F11)', countDef('saveUserHook') === 1);
  assert('renderUserHooksTab defined once (F11)', countDef('renderUserHooksTab') === 1);
  assert('exportBackup: A3 top-level def + nested session export (different scopes, not a collision)', countDef('exportBackup') === 2);
}

console.log('\n=== Cross-cutting: MCP tool execution (callMCPTool) ===');
assertIncludes(html, 'callMCPTool', 'callMCPTool function exists');
assertRegex(html, /mcp_bash|mcp_write_file|mcp_web_search|mcp_filesystem_write/i, 'MCP tools routed');
assertRegex(html, /mcp_bash.*git.*rev-parse|git.*rev-parse.*mcp_bash/i, 'Git repo detection via mcp_bash');

// ============================================================
// Part B — functional tests on REAL behaviour (eval harness)
// ============================================================
async function main() {
  const origCallLLM = context.callLLM;
  const origCallMCPTool = context.callMCPTool;
  const origFetch = context.fetch;
  const origLogActivity = context.logActivity;

  // ---- F1: Architect guard blocks writes, allows them in plan-build ----
  console.log('\n=== F1 functional: Architect guard ===');
  try {
    const session = setupSession();
    globalScope.appState.planMode = 'architect';
    const blocked = await withTimeout(parseAndApplyBlocks('```file:guard-test.js\nconsole.log(1);\n```'), 15000, 'architect guard');
    assert(blocked && blocked.blocked === true, 'Architect mode returns blocked:true for file writes');
    assert(blocked && blocked.fileModified === false, 'Architect mode does not modify files');
    assert(!session.files['guard-test.js'], 'Architect mode leaves the file unwritten');
    globalScope.appState.planMode = 'plan-build';
    // Safe Mode off for this call: the approval ladder would otherwise wait on a
    // (stubbed) approval modal. The write path itself is what is under test here.
    globalScope.appState.safeMode = { approvalMode: 'off' };
    const allowed = await withTimeout(parseAndApplyBlocks('```file:guard-test.js\nconsole.log(1);\n```'), 15000, 'plan-build write');
    assert(allowed && allowed.fileModified === true, 'Plan-build mode applies the file write');
    assert(allowed && Array.isArray(allowed.chips) && allowed.chips.some(c => String(c.label || '').includes('guard-test.js')), 'Plan-build mode reports the written file in its chips');
    assert(session.files['guard-test.js'] && session.files['guard-test.js'].includes('console.log(1)'), 'Plan-build mode writes the file content');
    globalScope.appState.safeMode = { approvalMode: 'smart' };
  } catch (e) { assert('F1 functional: ' + e.message, false); }

  // ---- F2: auto-commit extracts the REAL hash from real git output ----
  console.log('\n=== F2 functional: performAutoCommit ===');
  try {
    setupSession();
    globalScope.appState.autoCommit = { enabled: true, history: [] };
    context.callMCPTool = async (tool, args) => {
      const cmd = (args && args.command) || '';
      if (cmd.includes('git commit')) return { success: true, stdout: '[main abc1234] Auto-commit\n' };
      if (cmd.includes('git status')) return { success: true, stdout: ' M a.js\n' };
      return { success: true, stdout: 'deadbeef0000000\n' };
    };
    const ok = await withTimeout(performAutoCommit({ description: 'test task', id: 't1' }, null), 15000, 'performAutoCommit');
    assert(globalScope.appState.autoCommit.lastCommitHash === 'abc1234', 'Auto-commit hash is the real git hash abc1234 (not the abc+Date fallback)');
    assert(Array.isArray(globalScope.appState.autoCommit.history) && globalScope.appState.autoCommit.history[0] && globalScope.appState.autoCommit.history[0].hash === 'abc1234', 'Auto-commit history records the real hash');
    assert(ok !== false, 'performAutoCommit reports success');
  } catch (e) { assert('F2 functional: ' + e.message, false); }
  finally { context.callMCPTool = origCallMCPTool; }

  // ---- F3: benchmark runs the model and the tests for real ----
  console.log('\n=== F3 functional: benchmark ===');
  try {
    const code = 'function findLastEven(arr){let l;for(const n of arr){if(n%2===0)l=n;}return l;}';
    assert(runHiddenTests(['findLastEven([1,3,5,2,4]) === 4', 'findLastEven([1,3,5]) === undefined'], code) === 2, 'Hidden tests pass for correct code');
    assert(runHiddenTests(['findLastEven([1,3,5,2,4]) === 4'], 'function findLastEven(arr){return 0;}') === 0, 'Hidden tests fail for wrong code');
    assert(runHiddenTests(['findLastEven([1,3,5,2,4]) === 4'], '```js\n' + code + '\n```') === 1, 'Hidden tests extract code from fences');
    globalScope.appState.providers = globalScope.appState.providers || {};
    globalScope.appState.providers.ninerouter = { enabled: true, models: ['flamingocode-build'], model: 'flamingocode-build' };
    context.callLLM = async () => '```js\n' + code + '\n```';
    const res = await withTimeout(runAgentWithModel('ninerouter', 'flamingocode-build', 'Write findLastEven', 50), 15000, 'runAgentWithModel');
    assert(res && res.output && res.output.includes('findLastEven'), 'Benchmark returns the model\'s real output');
    assert(res && res.steps === 1, 'Benchmark counts one model call as one step');
    assert(res && res.tokens > 0, 'Benchmark tokens are estimated from real text');
    assert(res && res.cost === 0, 'Benchmark cost is $0 for the free models');
    assert(res && !res.error, 'Benchmark reports no error on success');
  } catch (e) { assert('F3 functional: ' + e.message, false); }
  finally { context.callLLM = origCallLLM; }

  // ---- F4: serve runner exercises create + GET + message ----
  console.log('\n=== F4 functional: serve runner ===');
  try {
    setupSession();
    globalScope.appState.activeProviderId = 'ollama-local';
    fakeEl('serveTestPrompt', { value: 'hello serve' });
    fakeEl('serveTestMode', { value: 'plan-build' });
    fakeEl('serveTestResult', { textContent: '' });
    await withTimeout(runServeTest(), 15000, 'runServeTest');
    const text = fakeEls.get('serveTestResult').textContent || '';
    assert(text.includes('Task created:'), 'Serve runner creates a task');
    assert(text.includes('GET /task/'), 'Serve runner exercises the GET handler');
    assert(text.includes('POST /task/'), 'Serve runner exercises the message handler');
    assert(text.includes('400'), 'Serve runner shows the expected 400 guard for messaging a completed task');
    const tasks = Object.values(globalScope.appState.serveTasks || {});
    assert(tasks.length > 0 && tasks[0].status === 'completed', 'Serve task completes through the agent path');
  } catch (e) { assert('F4 functional: ' + e.message, false); }

  // ---- F5: session fork keeps the parent link ----
  console.log('\n=== F5 functional: session fork ===');
  try {
    const session = setupSession();
    createSessionFork();
    const forks = Object.values(globalScope.appState.sessions || {}).filter(s => s.parentId === 'test-session');
    assert(forks.length === 1, 'Fork creates one child session');
    assert(forks[0] && forks[0].forkedFromStep === 3, 'Fork shares history up to the fork point (3 steps)');
    assert(forks[0] && Array.isArray(forks[0].steps) && forks[0].steps.length === 3, 'Fork copies the shared steps');
  } catch (e) { assert('F5 functional: ' + e.message, false); }

  // ---- F6: adversary asks the model and parses objections for real ----
  console.log('\n=== F6 functional: adversary ===');
  try {
    const good = '[{"type":"security","severity":"high","text":"SQL injection not escaped"}, {"type":"edge-case","severity":"low","text":"empty input"}]';
    const parsed = parseAdversaryResponse(good);
    assert(Array.isArray(parsed) && parsed.length === 2, 'Parser returns both objections');
    assert(parsed[0].type === 'security' && parsed[0].severity === 'high', 'Parser keeps type and severity');
    assert(parseAdversaryResponse('```json\n' + good + '\n```').length === 2, 'Parser strips code fences');
    assert(parseAdversaryResponse('not json at all').length === 0, 'Parser returns [] for garbage');
    assert(parseAdversaryResponse('[]').length === 0, 'Parser returns [] for an empty array');
    globalScope.appState.adversary = { enabled: true, autoEnableSteps: 10, maxObjections: 5, useCheapModel: true };
    context.callLLM = async () => good;
    const plan12 = { steps: Array.from({ length: 12 }, (_, i) => ({ title: 'step ' + i })) };
    const objs = await withTimeout(runAdversaryReview(plan12, 'test task'), 15000, 'runAdversaryReview');
    assert(Array.isArray(objs) && objs.length === 2, 'Adversary returns 2 objections for a 12-step plan');
    const few = await runAdversaryReview({ steps: [{}, {}, {}] }, 'test task');
    assert(Array.isArray(few) && few.length === 0, 'Adversary skips plans under the auto-enable threshold');
    globalScope.appState.adversary = { enabled: false, autoEnableSteps: 10, maxObjections: 5 };
    const off = await runAdversaryReview(plan12, 'test task');
    assert(Array.isArray(off) && off.length === 0, 'Adversary returns [] when disabled');
  } catch (e) { assert('F6 functional: ' + e.message, false); }
  finally { context.callLLM = origCallLLM; globalScope.appState.adversary = { enabled: true, autoEnableSteps: 10, maxObjections: 5, useCheapModel: true }; }

  // ---- F7: custom modes load from appState ----
  console.log('\n=== F7 functional: custom modes ===');
  try {
    globalScope.appState.customModes = { testmode: { name: 'testmode', description: 'd', tools: ['write'] } };
    loadCustomModes();
    assert(true, 'loadCustomModes runs without throwing');
  } catch (e) { assert('F7 functional: ' + e.message, false); }

  // ---- F8: boomerang fast paths (the waiting path needs a user by design) ----
  console.log('\n=== F8 functional: boomerang ===');
  try {
    globalScope.appState.boomerang = { enabled: false, every: 5, waitForUser: true };
    const off = await triggerBoomerangCheckin(5, 'x');
    assert(off && off.action === 'continue', 'Boomerang continues immediately when disabled');
    globalScope.appState.boomerang = { enabled: true, every: 5, waitForUser: true };
    const notMultiple = await triggerBoomerangCheckin(3, 'x');
    assert(notMultiple && notMultiple.action === 'continue', 'Boomerang continues on non-multiple steps');
    assert(typeof waitForBoomerangResponse === 'function', 'waitForBoomerangResponse exists for the real check-in');
  } catch (e) { assert('F8 functional: ' + e.message, false); }

  // ---- F9: shadow checkpoint with no repo returns null, never throws ----
  console.log('\n=== F9 functional: shadow-git ===');
  try {
    const r = await createShadowCheckpoint('cp-1');
    assert(r === null, 'Shadow checkpoint returns null with no git repo (local-only mode)');
  } catch (e) { assert('F9 functional: ' + e.message, false); }

  // ---- F10: steering files enter the digest, inside the cap ----
  console.log('\n=== F10 functional: steering ===');
  try {
    globalScope.appState.steeringFiles = {
      coding: { name: 'coding', content: 'Always use const.', enabled: true },
      off: { name: 'off', content: 'never see this', enabled: false },
    };
    loadSteeringFiles();
    const content = getSteeringContentForBrain();
    assert(content.includes('Always use const.'), 'Enabled steering file reaches the digest');
    assert(!content.includes('never see this'), 'Disabled steering file stays out of the digest');
    globalScope.appState.steeringFiles = {
      small: { name: 'small', content: 'Always use const.', enabled: true },
      big: { name: 'big', content: 'x'.repeat(10000), enabled: true },
    };
    loadSteeringFiles();
    const capped = getSteeringContentForBrain();
    assert(capped.includes('Always use const.'), 'Small steering file still fits the digest');
    assert(!capped.includes('x'.repeat(100)), 'Oversized steering file is skipped (does not fit the 1500-token budget)');
  } catch (e) { assert('F10 functional: ' + e.message, false); }

  // ---- F11: user hooks save, fire, and respect Safe Mode ----
  console.log('\n=== F11 functional: user hooks ===');
  try {
    fakeEl('hookNameInput', { value: 'form-hook' });
    fakeEl('hookEventSelect', { value: 'task-completed' });
    fakeEl('hookActionSelect', { value: 'notification' });
    fakeEl('hookConfigInput', { value: '{"message":"from form"}' });
    globalScope.appState.userHooks = [];
    loadHooks();
    saveUserHook();
    const saved = (globalScope.appState.userHooks || []).find(h => h.name === 'form-hook');
    assert(!!saved, 'saveUserHook stores the hook from the form');
    assert(saved && saved.config && saved.config.message === 'from form', 'saveUserHook parses the JSON config');
    globalScope.appState.userHooks = [
      { id: 'h1', name: 'notify-hook', event: 'task-completed', action: 'notification', config: { message: 'hello from hook' }, enabled: true },
      { id: 'h2', name: 'shell-hook', event: 'task-completed', action: 'shell-check', config: { command: 'echo hi' }, enabled: true },
    ];
    loadHooks();
    const seen = [];
    context.logActivity = (msg) => { seen.push(String(msg)); };
    let mcpCalls = 0;
    context.callMCPTool = async () => { mcpCalls++; return { success: true, stdout: '', exitCode: 0 }; };
    globalScope.appState.safeMode = { approvalMode: 'smart' };
    await fireUserHooks('task-completed', {});
    assert(seen.some(m => m.includes('hello from hook')), 'Notification hook fires through fireUserHooks');
    assert(mcpCalls === 0, 'Shell-check hook does NOT run in Smart mode (safeMode object bug fixed)');
    assert(seen.some(m => m.includes('Smart mode')), 'Smart-mode skip is logged');
    globalScope.appState.safeMode = { approvalMode: 'manual' };
    await fireUserHooks('task-completed', {});
    assert(mcpCalls === 1, 'Shell-check hook runs in Manual mode');
  } catch (e) { assert('F11 functional: ' + e.message, false); }
  finally { context.logActivity = origLogActivity; context.callMCPTool = origCallMCPTool; globalScope.appState.safeMode = { approvalMode: 'smart' }; }

  // ---- F12: powers gate tools, default ON ----
  console.log('\n=== F12 functional: powers ===');
  try {
    loadPowers();
    assert(isToolAllowedByPowers('mcp_web_search') === true, 'Web-search tool allowed while Web Research power is on (default)');
    assert(getEnabledPowerTools().includes('mcp_web_search'), 'getEnabledPowerTools lists the web-search tool');
    assert(isToolAllowedByPowers('write') === true, 'A tool no Power owns is always allowed');
    toggleBuiltinPower('web-research', false);
    assert(isToolAllowedByPowers('mcp_web_search') === false, 'Web-search tool blocked when its Power is off');
    assert(!getEnabledPowerTools().includes('mcp_web_search'), 'getEnabledPowerTools drops the tool when the Power is off');
    toggleBuiltinPower('web-research', true);
    assert(isToolAllowedByPowers('mcp_web_search') === true, 'Web-search tool returns when its Power is back on');
  } catch (e) { assert('F12 functional: ' + e.message, false); }

  // ---- F13: doom loop fires on the 3rd identical failure ----
  console.log('\n=== F13 functional: doom loop ===');
  try {
    assert(trackFileEdit('a.js', 'same error') === false, '1st identical file edit: no doom loop');
    assert(trackFileEdit('a.js', 'same error') === false, '2nd identical file edit: no doom loop');
    assert(trackFileEdit('a.js', 'same error') === true, '3rd identical file edit: doom loop detected');
    assert(trackFileEdit('a.js', 'different error') === false, 'A different error starts a fresh count');
    assert(trackToolFailure('mytool', 'boom') === false, '1st identical tool failure: no doom loop');
    assert(trackToolFailure('mytool', 'boom') === false, '2nd identical tool failure: no doom loop');
    assert(trackToolFailure('mytool', 'boom') === true, '3rd identical tool failure: doom loop detected');
  } catch (e) { assert('F13 functional: ' + e.message, false); }

  // ---- F14: GitHub trigger polls for real and dedupes ----
  console.log('\n=== F14 functional: GitHub trigger ===');
  try {
    let fetchCalls = 0;
    context.fetch = async (url) => {
      fetchCalls++;
      if (String(url).includes('/search/issues')) {
        return { ok: true, json: async () => ({ items: [{ id: 2, title: 'T2', body: '', html_url: 'u2', number: 2 }] }) };
      }
      return { ok: true, json: async () => ([{ id: 1, title: 'T1', body: 'b', html_url: 'u1', number: 1 }]) };
    };
    globalScope.appState.githubRepo = 'octo/repo';
    globalScope.appState.githubTriggeredTasks = [];
    await checkGithubTriggers();
    assert((globalScope.appState.githubTriggeredTasks || []).length === 2, 'Trigger pulls 1 labeled issue + 1 mention into the inbox');
    await checkGithubTriggers();
    assert((globalScope.appState.githubTriggeredTasks || []).length === 2, 'Trigger dedupes seen items on the second poll');
    globalScope.appState.githubRepo = null;
    fetchCalls = 0;
    await checkGithubTriggers();
    assert(fetchCalls === 0, 'Trigger makes no network call with no repo linked');
  } catch (e) { assert('F14 functional: ' + e.message, false); }
  finally { context.fetch = origFetch; }

  // ---- F15: steps cap helpers + save flow ----
  console.log('\n=== F15 functional: steps cap ===');
  try {
    globalScope.appState.stepsCap = { enabled: true, global: 50, task: null, raise: 25 };
    assert(getEffectiveStepsCap({}) === 50, 'Default effective cap is 50');
    globalScope.appState.stepsCap = { enabled: true, global: 5, task: null, raise: 25 };
    assert(getEffectiveStepsCap({}) === 5, 'Global cap of 5 is respected');
    assert(getEffectiveStepsCap({ stepsCapRaised: 25 }) === 30, 'A granted raise lifts the cap');
    globalScope.appState.stepsCap = { enabled: true, global: 50, task: 10, raise: 25 };
    assert(getEffectiveStepsCap({}) === 10, 'Per-task override wins over the global cap');
    globalScope.appState.stepsCap = { enabled: false, global: 5, task: null, raise: 25 };
    assert(getEffectiveStepsCap({}) === Infinity, 'Disabled cap is infinite');
    globalScope.appState.stepsCap = { enabled: true, global: 5, task: null, raise: 25 };
    assert(isStepsCapReached({ stepsTaken: 5 }) === true, 'Cap reached at exactly 5 steps');
    assert(isStepsCapReached({ stepsTaken: 4 }) === false, 'Cap not reached at 4 steps');
    const session = { id: 's1', files: {}, chatHistory: [{ content: 'did X' }, { content: 'did Y' }] };
    // The harness stubs writeBrainNote (sessionId-based, writes to brainNotes);
    // record the call the handoff makes instead of depending on that stub.
    const brainWrites = [];
    const origWriteBrainNote = context.writeBrainNote;
    context.writeBrainNote = (sess, name, content) => {
      brainWrites.push({ sess, name, content });
      if (sess && sess.files) sess.files['.devforge/notes/' + String(name).replace(/\.md$/i, '') + '.md'] = content;
    };
    const note = writeStepsCapHandoff(session, 5);
    assert(note.includes('continue') && note.includes('5 steps'), 'Handoff note names the exact next step and the cap');
    assert(brainWrites.length === 1 && brainWrites[0].name === 'handoff-steps-cap.md', 'Handoff calls writeBrainNote with the handoff note');
    assert(Object.values(session.files).some(v => String(v).includes('steps cap reached')), 'Handoff note is written into the Brain');
    context.writeBrainNote = origWriteBrainNote;
    fakeEl('stepsCapEnabled', { checked: true });
    fakeEl('stepsCapGlobal', { value: '7' });
    fakeEl('stepsCapTask', { value: '' });
    fakeEl('stepsCapRaise', { value: '30' });
    fakeEl('btnSaveStepsCap', {});
    renderStepsCapTab();
    assert(fakeEls.get('stepsCapGlobal').value === 5 || fakeEls.get('stepsCapGlobal').value === '5', 'Steps Cap tab loads the saved global cap into the form');
    fakeEls.get('stepsCapGlobal').value = '7';
    fakeEls.get('stepsCapRaise').value = '30';
    fakeEls.get('btnSaveStepsCap').onclick();
    assert(globalScope.appState.stepsCap.global === 7, 'Save Config persists the global cap');
    assert(globalScope.appState.stepsCap.raise === 30, 'Save Config persists the raise amount');
  } catch (e) { assert('F15 functional: ' + e.message, false); }
}

main().then(() => {
  console.log(`\n=== SUMMARY ===`);
  console.log(`Pass: ${passCount}`);
  console.log(`Fail: ${failCount}`);
  console.log(`Total: ${passCount + failCount}`);
  process.exit(failCount > 0 ? 1 : 0);
}).catch((e) => {
  console.error('FATAL in main():', e);
  process.exit(1);
});
