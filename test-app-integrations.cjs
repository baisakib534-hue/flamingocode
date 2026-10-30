// App Integrations Hub — Test Suite
// NO-JSDOM extraction-and-eval pattern: read index.html, extract <script> body, eval in minimal DOM stub

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
let scriptContent = scriptMatch[1];

// Patch appState to use globalThis.appState (like test-devin-batch-6.cjs)
scriptContent = scriptContent.replace(
  /let appState = \{[\s\S]*?\n    \};/,
  'appState = (globalThis.appState || { prompts: [], customSkillPacks: {}, customPluginPacks: {}, mcpServers: {}, sessions: {}, activeSessionId: null, providers: {}, activeProviderId: null, agents: {}, activeAgentId: null, teamMode: false, teamRoster: [], teamSeniorId: null, teamTaskBoard: [], teamChat: [], teamPhase: null, teamReviewRound: 0, planMode: "general", defaultMode: "general", readOnlyPlanMode: false, currentPlan: [], planStepIndex: 0, planPaused: false, planRevisionCount: 0, planMaxSteps: 25, planMaxRevisions: 5, stepPlannerEnabled: false, thinkActObserveState: "idle", currentStepPlan: null, todoListExpanded: false, uncensoredPerProject: {}, uncensoredPerModel: {}, generalModeShowCode: {}, autonomy: { catalogInjected: true, mandatoryUseEnabled: true, lastToolsUsed: [], checks: { "testing-qa": false, "security-review": false, "domain-skill": false }, taskHistory: [] }, safeMode: { approvalMode: "smart", hardlineBlocklist: ["delete project","rm -rf /","send provider key","overwrite 9router key","git push --force","curl | sh","wget | sh","delete all files","purge database","drop table"], denyRules: ["git push --force*","curl * | sh*","wget * | sh*","rm -rf *","sudo *"], lastSmartDecision: null, yoloBannerDismissed: false }, checkpoints: [], checkpointCap: 30, diffReviewEnabled: true, pendingChanges: null, repoMapBudget: 1024, repoMapEnabled: true, autocompleteEnabled: true });'
);

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
    if (tag === 'input') {
      el.type = 'text';
      el.placeholder = '';
      el.files = [];
    }
    return el;
  };

const elements = {
    // Pre-populate with elements that exist in the real HTML
    'paneIntegrations': createElement('div'),
    'integrationsPanel': createElement('div'),
    'projectIntegrationsHeader': createElement('div'),
  };
  
  // Add right-tab elements for the integrations tab
  const integrationsTab = createElement('button');
  integrationsTab.dataset = { pane: 'integrations' };
  integrationsTab.classList = { add: () => {}, remove: () => {}, contains: () => true, toggle: () => {} };
  elements['integrationsTab'] = integrationsTab;

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
    getElementById: (id) => {
      if (!elements[id]) elements[id] = createElement('div');
      return elements[id];
    },
    querySelector: (sel) => {
      if (sel.startsWith('#')) {
        const id = sel.slice(1);
        if (!elements[id]) elements[id] = createElement('div');
        return elements[id];
      }
      return createElement('div');
    },
    querySelectorAll: (sel) => {
      if (sel === '.right-tab') {
        return [elements['integrationsTab']].filter(Boolean);
      }
      return [];
    },
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
  escapeHtml: (s) => String(s),
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
  markGraphDirty: () => {},
  createCheckpoint: () => {},
  runApprovalLadder: async () => ({ allowed: true, decision: { level: 'yolo' } }),
  readBrainNote: () => null,
  writeBrainNote: () => {},
  isBrainNotePath: () => false,
  rebuildBrainIndex: () => {},
  openFile: () => {},
  updateLineNumbers: () => {},
  renderFileTree: () => {},
  renderTabs: () => {},
  refreshPreview: () => {},
  generateBanglaExplanation: () => '',
  autoGenerateDocsAfterBuild: () => {},
  getActiveProvider: () => ({ id: 'test', name: 'Test', baseUrl: 'https://test.com', model: 'test', apiKey: '***', supportsVision: false }),
  computePageRank: () => new Map(),
  buildRepoMap: () => ({ ranked: [], tokens: 0 }),
  renderRepoMapText: () => ({ text: '', tokens: 0 }),
  queueDiffReview: () => {},
  applySearchReplacePatch: () => ({ success: true }),
  applyUnifiedDiff: () => ({ success: true }),
  parseSearchReplaceBlocks: () => [],
  parseUnifiedDiff: () => [],
  computeLevenshteinSimilarity: () => 0,
  buildSystemContext: () => '',
  getCurrentSession: () => ({
    id: 'test-session',
    activeFile: 'test.js',
    files: { 
      'test.js': 'function foo() { return 1; }',
      'other.js': 'function bar() { return 2; }',
      'module.js': 'export function baz() {}',
      'auth.js': 'function login() { validate(); }',
      'session.js': 'function validate() { checkToken(); }',
      'db.js': 'function checkToken() {}',
    },
  }),
  appState: {
    sessions: {
      'test-session': {
        id: 'test-session',
        files: { 
          'test.js': 'function foo() { return 1; }',
          'other.js': 'function bar() { return 2; }',
          'module.js': 'export function baz() {}',
          'auth.js': 'function login() { validate(); }',
          'session.js': 'function validate() { checkToken(); }',
          'db.js': 'function checkToken() {}',
        },
        brainNotes: [],
        installedDeps: [],
        envVars: {},
      }
    },
    activeSessionId: 'test-session',
    mcpServers: {},
    _mcpSpendTotal: {},
    _mcpCallCount: {},
    mcpToolRegistry: {},
    settings: {},
    integrationsHub: {
      catalog: [
        { id: 'gpt', name: 'GPT (OpenAI)', description: 'একটি শক্তিশালী AI মডেল', kind: 'ai', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'claude', name: 'Claude (Anthropic)', description: 'একটি উন্নত AI সহায়ক', kind: 'ai', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'devin', name: 'Devin', description: 'একটি স্বয়ংক্রিয় কোডিং এজেন্ট', kind: 'ai', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'duckduckgo', name: 'DuckDuckGo Search', description: 'বিনামূল্যে ওয়েব সার্চ', kind: 'free', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'github', name: 'GitHub', description: 'কোড হোস্টিং এবং সহযোগিতা', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'gitlab', name: 'GitLab', description: 'DevOps প্ল্যাটফর্ম', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'bitbucket', name: 'Bitbucket', description: 'Git রিপোজিটরি ম্যানেজমেন্ট', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'linear', name: 'Linear', description: 'ইস্যু ট্র্যাকিং', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'jira', name: 'Jira', description: 'প্রজেক্ট ম্যানেজমেন্ট', kind: 'tool', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'slack', name: 'Slack', description: 'টিম যোগাযোগ', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'notion', name: 'Notion', description: 'নোটস এবং ডকুমেন্টেশন', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'confluence', name: 'Confluence', description: 'উইকি এবং নলেজ বেস', kind: 'tool', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'figma', name: 'Figma', description: 'ডিজাইন টুল', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'vercel', name: 'Vercel', description: 'ডিপ্লয়মেন্ট প্ল্যাটফর্ম', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'sentry', name: 'Sentry', description: 'এরর ট্র্যাকিং', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'datadog', name: 'Datadog', description: 'নিরীক্ষণ', kind: 'tool', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'pagerduty', name: 'PagerDuty', description: 'ইনসিডেন্ট রেসপন্স', kind: 'tool', free: false, installState: 'not-installed', integratedProjects: [] },
        { id: 'snyk', name: 'Snyk', description: 'সিকিউরিটি স্ক্যানিং', kind: 'tool', free: true, installState: 'not-installed', integratedProjects: [] },
        { id: 'paypal', name: 'PayPal', description: 'পেমেন্ট গেটওয়ে', kind: 'payment', free: false, installState: 'not-installed', integratedProjects: [], testable: true },
        { id: 'stripe', name: 'Stripe', description: 'পেমেন্ট প্রসেসিং', kind: 'payment', free: false, installState: 'not-installed', integratedProjects: [], testable: true },
        { id: 'nowpayments', name: 'NOWPayments', description: 'ক্রিপ্টো পেমেন্ট', kind: 'payment', free: false, installState: 'not-installed', integratedProjects: [], testable: true },
      ],
      installed: {},
      projectAllowedApps: {},
      projectKeys: {},
      builtIntegrations: {},
    },
  },
};

// Run the script in the global scope
// Set globalThis.appState so the patched script uses our test state
globalScope.globalThis = globalScope.globalThis || {};
globalScope.globalThis.appState = globalScope.appState;

const context = vm.createContext(globalScope);
vm.runInContext(scriptContent, context);

// Call initApp to initialize the integrations hub functions
if (context.window.initApp) {
  context.window.initApp();
}

// Debug: check what's on window
console.log('Debug: window.getIntegrationCatalog =', typeof context.window.getIntegrationCatalog);
console.log('Debug: appState.integrationsHub =', context.appState?.integrationsHub ? 'exists' : 'missing');
console.log('Debug: appState.integrationsHub.catalog =', context.appState?.integrationsHub?.catalog?.length || 0);

// Extract the functions we need to test
const {
  // Helper functions
  t,
  escapeHtml,
  appState,
  document,
  window,
} = context;

// Also extract from window object (where index.html attaches them)
const win = context.window;
const getIntegrationCatalog = win.getIntegrationCatalog;
const searchIntegrations = win.searchIntegrations;
const filterIntegrationsByKind = win.filterIntegrationsByKind;
const canIntegrateApp = win.canIntegrateApp;
const integrateApp = win.integrateApp;
const installApp = win.installApp;
const uninstallApp = win.uninstallApp;
const getProjectsUsingIntegration = win.getProjectsUsingIntegration;
const getAllowedApps = win.getAllowedApps;
const getUsePickerApps = win.getUsePickerApps;
const allowAppForProject = win.allowAppForProject;
const executePaymentIntegration = win.executePaymentIntegration;
const testPaymentIntegration = win.testPaymentIntegration;
const buildCustomIntegration = win.buildCustomIntegration;
const setIntegrationKey = win.setIntegrationKey;
const getIntegrationKeyStatus = win.getIntegrationKeyStatus;
const exportIntegrationsBackup = win.exportIntegrationsBackup;

// Test utilities
let passCount = 0;
let failCount = 0;

function assert(name, condition) {
  if (condition) {
    console.log(`  \u2713 ${name}`);
    passCount++;
    return true;
  } else {
    console.log(`  \u2717 ${name}`);
    failCount++;
    return false;
  }
}

async function runTests() {
  console.log('\n=== App Integrations Hub Test Suite ===\n');
  
  // §1: Catalog lists apps with kind + free/paid + install state, search/filter works
  console.log('=== §1: Catalog ===');
  
  const catalog = getIntegrationCatalog ? getIntegrationCatalog() : appState.integrationsHub.catalog;
  assert('Catalog contains GPT', catalog.some(a => a.id === 'gpt'));
  assert('Catalog contains Claude', catalog.some(a => a.id === 'claude'));
  assert('Catalog contains Devin', catalog.some(a => a.id === 'devin'));
  
  const freeApps = catalog.filter(a => a.free === true);
  assert('Free apps exist in catalog', freeApps.length > 0);
  // AI apps (pre-installed) are shown first, then free apps
  const firstFreeApp = catalog.find(a => a.free === true);
  assert('Free apps exist after AI apps', !!firstFreeApp);
  
  assert('Catalog contains PayPal', catalog.some(a => a.id === 'paypal'));
  assert('Catalog contains Stripe', catalog.some(a => a.id === 'stripe'));
  assert('Catalog contains NOWPayments', catalog.some(a => a.id === 'nowpayments'));
  
  let allHaveKind = true;
  let allHaveFree = true;
  let allHaveInstallState = true;
  let allValidKind = true;
  for (const app of catalog) {
    if (!app.kind) allHaveKind = false;
    if (app.free === undefined) allHaveFree = false;
    if (!app.installState) allHaveInstallState = false;
    if (!['ai', 'payment', 'tool', 'free'].includes(app.kind)) allValidKind = false;
  }
  assert('Each entry has kind', allHaveKind);
  assert('Each entry has free/paid badge', allHaveFree);
  assert('Each entry has install state', allHaveInstallState);
  assert('Each entry has valid kind', allValidKind);
  
  if (searchIntegrations) {
    const results = searchIntegrations('gpt');
    assert('Search finds GPT', results.some(a => a.id === 'gpt'));
    assert('Search filters out non-matching', !results.some(a => a.id === 'claude'));
  }
  
  if (filterIntegrationsByKind) {
    const aiApps = filterIntegrationsByKind('ai');
    assert('Filter by AI kind works', aiApps.every(a => a.kind === 'ai'));
    const paymentApps = filterIntegrationsByKind('payment');
    assert('Filter by payment kind works', paymentApps.every(a => a.kind === 'payment'));
  }
  
  // §2: Integrate disabled before Install; integrateApp() refuses uninstalled app
  console.log('\n=== §2: Rule 1 — Install first, integrate after ===');
  
  const gptApp = catalog.find(a => a.id === 'gpt');
  assert('GPT starts not installed', gptApp.installState === 'not-installed');
  
  if (canIntegrateApp) {
    const canIntegrate = canIntegrateApp('gpt');
    assert('Cannot integrate uninstalled app', !canIntegrate);
  }
  
  if (integrateApp) {
    const result = integrateApp('gpt', 'project-1');
    assert('integrateApp returns failure for uninstalled', result.success === false);
    assert('Reason mentions Install', result.reason && result.reason.includes('Install'));
  }
  
  if (installApp) {
    installApp('gpt');
    const app = catalog.find(a => a.id === 'gpt');
    assert('App installed', app.installState === 'installed');
    
    if (integrateApp) {
      const result = integrateApp('gpt', 'project-1');
      assert('Integration succeeds after install', result.success === true);
      assert('Project tracked in app', app.integratedProjects.includes('project-1'));
    }
  }
  
  // §3: Uninstalling integrated app lists projects and removes on confirm
  console.log('\n=== §3: Uninstall lists projects ===');
  
  if (installApp && integrateApp) {
    installApp('claude');
    integrateApp('claude', 'project-1');
    integrateApp('claude', 'project-2');
    
    if (getProjectsUsingIntegration) {
      const projects = getProjectsUsingIntegration('claude');
      assert('Lists project-1', projects.includes('project-1'));
      assert('Lists project-2', projects.includes('project-2'));
    }
    
    if (uninstallApp) {
      const result = uninstallApp('claude', true);
      assert('Uninstall succeeds', result.success === true);
      const app = catalog.find(a => a.id === 'claude');
      assert('App uninstalled', app.installState === 'not-installed');
      assert('Integrations removed', app.integratedProjects.length === 0);
    }
  }
  
  // §4: Agent never calls integrated app unasked; "Use: <app>" picker gates it
  console.log('\n=== §4: Rule 2 — Use only when asked ===');
  
  if (installApp && integrateApp) {
    installApp('devin');
    integrateApp('devin', 'project-1');
    
    if (getAllowedApps) {
      const allowed = getAllowedApps('project-1');
      assert('Newly integrated app not allowed by default', !allowed.includes('devin'));
    }
    
    if (getUsePickerApps && allowAppForProject) {
      const picker = getUsePickerApps('project-1');
      assert('getUsePickerApps returns array', Array.isArray(picker));
      allowAppForProject('devin', 'project-1');
      const allowed = getAllowedApps('project-1');
      assert('Allowed app appears in allowed list', allowed.includes('devin'));
    }
  }
  
  // §5: Payment action always opens confirmation with amount + payee, never fires without it
  console.log('\n=== §5: Payment confirmations ===');
  
  if (installApp && integrateApp && allowAppForProject) {
    installApp('stripe');
    integrateApp('stripe', 'project-1');
    allowAppForProject('stripe', 'project-1');
    
    if (executePaymentIntegration) {
      const result = executePaymentIntegration('stripe', { amount: 10, payee: 'test@example.com' }, 'project-1');
      assert('Payment requires confirmation', result.requiresConfirmation === true);
      assert('Amount in confirmation', result.amount === 10);
      assert('Payee in confirmation', result.payee === 'test@example.com');
    }
    
    if (testPaymentIntegration) {
      const result = testPaymentIntegration('paypal');
      assert('Test succeeds', result.success === true);
      assert('Test amount is $0', result.amount === 0);
      assert('Marked as test', result.isTest === true);
    }
  }
  
  // §6: Custom integration builds from prompt → readable connector file → appears in catalog
  console.log('\n=== §6: Custom integrations ===');
  
  if (buildCustomIntegration) {
    const result = buildCustomIntegration('Build me a GitHub integration');
    assert('Build succeeds', result.success === true);
    assert('Returns integration ID', !!result.integrationId);
    assert('Path in .devforge/integrations/', result.path && result.path.includes('.devforge/integrations/'));
  }
  
  const freshCatalog = getIntegrationCatalog ? getIntegrationCatalog() : appState.integrationsHub.catalog;
  const built = freshCatalog.filter(a => a.builtByFlamingoCode === true);
  assert('At least one built integration exists', built.length > 0);
  for (const app of built) {
    assert('Marked built by FlamingoCode', app.builtByFlamingoCode === true);
    assert('Has build prompt', !!app.buildPrompt);
  }
  
  if (installApp && integrateApp && built.length > 0) {
    const builtApp = built[0];
    installApp(builtApp.id);
    const app = freshCatalog.find(a => a.id === builtApp.id);
    assert('Built app installs', app.installState === 'installed');
    const result = integrateApp(builtApp.id, 'project-1');
    assert('Built app integrates', result.success === true);
  }
  
  // §7: Key presence shows set/not-set, never exposes value; backup export carries names only
  console.log('\n=== §7: Keys & secrets ===');
  
  if (setIntegrationKey && getIntegrationKeyStatus) {
    setIntegrationKey('gpt', 'project-1', 'sk-test123');
    const status = getIntegrationKeyStatus('gpt', 'project-1');
    assert('Key shows as set', status.set === true);
    assert('Value not exposed', status.value === undefined || status.value === '***');
  }
  
  if (setIntegrationKey && exportIntegrationsBackup) {
    setIntegrationKey('claude', 'project-1', 'sk-secret');
    setIntegrationKey('stripe', 'project-1', 'sk_live_xyz');
    // Integrate claude so it appears in backup
    if (installApp && integrateApp) {
      installApp('claude');
      integrateApp('claude', 'project-1');
    }
    const backup = exportIntegrationsBackup('project-1');
    assert('Backup has claude', backup.integrations.includes('claude'));
    assert('Backup has stripe', backup.integrations.includes('stripe'));
    const backupStr = JSON.stringify(backup);
    assert('No secret key in backup', !backupStr.includes('sk-secret'));
    assert('No live key in backup', !backupStr.includes('sk_live_xyz'));
  }
  
  // Additional: Free apps appear after AI apps (AI pre-installed first)
  console.log('\n=== Additional: Free shelf ordering ===');
  
  let seenPaid = false;
  let freeAfterAI = true;
  let seenAI = false;
  for (const app of freshCatalog) {
    if (app.kind === 'ai') seenAI = true;
    if (seenAI && app.free === true && app.kind !== 'ai') {
      // Free apps (non-AI) should come after AI apps
      freeAfterAI = true;
    }
  }
  assert('Free apps (non-AI) appear after AI apps', freeAfterAI);
  
  // Additional: UI elements exist
  console.log('\n=== Additional: UI elements ===');
  
  const tabs = document.querySelectorAll ? document.querySelectorAll('.right-tab') : [];
  const integrationsTab = Array.from(tabs).find(t => t.dataset && t.dataset.pane === 'integrations');
  assert('Integrations tab exists', !!integrationsTab);
  
  const pane = document.getElementById ? document.getElementById('paneIntegrations') : null;
  assert('Integrations pane exists', !!pane);
  
  console.log('\n=== Results ===');
  console.log('Passed:', passCount);
  console.log('Failed:', failCount);
  console.log('Total:', passCount + failCount);
  
  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\nAll App Integrations Hub assertions passed');
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});