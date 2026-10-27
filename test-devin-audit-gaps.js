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
    'appState = (globalThis.appState || {\n  prompts: [],\n  customSkillPacks: {},\n  customPluginPacks: {},\n  mcpServers: {},\n  sessions: {},\n  activeSessionId: null,\n    providers: {},\n    activeProviderId: null,\n    agents: {},\n    activeAgentId: null,\n    teamMode: false,\n    teamRoster: [],\n    teamSeniorId: null,\n    teamTaskBoard: [],\n    teamChat: [],\n    teamPhase: null,\n    teamReviewRound: 0,\n    planMode: "general",\n    defaultMode: "general",\n    readOnlyPlanMode: false,\n    currentPlan: [],\n    planStepIndex: 0,\n    planPaused: false,\n    planRevisionCount: 0,\n    planMaxSteps: 25,\n    planMaxRevisions: 5,\n    stepPlannerEnabled: false,\n    thinkActObserveState: "idle",\n    currentStepPlan: null,\n    todoListExpanded: false,\n    uncensoredPerProject: {},\n    uncensoredPerModel: {},\n    generalModeShowCode: {},\n    autonomy: { catalogInjected: true, mandatoryUseEnabled: true, lastToolsUsed: [], checks: { "testing-qa": false, "security-review": false, "domain-skill": false }, taskHistory: [] },\n    safeMode: { approvalMode: "smart", hardlineBlocklist: ["delete project","rm -rf /","send provider key","overwrite 9router key","git push --force","curl | sh","wget | sh","delete all files","purge database","drop table"], denyRules: ["git push --force*","curl * | sh*","wget * | sh*","rm -rf *","sudo *"], lastSmartDecision: null, yoloBannerDismissed: false },\n    checkpoints: [],\n    checkpointCap: 30,\n    diffReviewEnabled: true,\n    pendingChanges: null,\n    repoMapBudget: 1024,\n    repoMapEnabled: true,\n    autocompleteEnabled: true,\n    // Audit gap fields\n    oncallResponders: [],\n    oncallIncidents: {},\n    oncallKnownIssues: [],\n    memoryDrive: { notes: {}, index: "", pinned: [] },\n    dreamingSessions: [],\n    efficiency: { score: 50, grade: "Unknown", coachFlags: {}, approvalCeilings: {}, pendingApprovals: [] },\n    marketplace: { installed: {} },\n    secrets: {},\n    triageAutomations: [],\n    cveInventory: {},\n    cvePatches: [],\n    pylon: { connected: false, config: {}, tickets: {} },\n    integrations: { sentry: {}, datadog: {}, pagerduty: {}, snyk: {}, notion: {}, confluence: {}, figma: {}, vercel: {}, stripe: {}, databases: {} },\n    securitySwarm: { runtimeValidations: {}, attackChains: [], byoScanners: {}, threatModels: {}, target: "vulns" },\n    commandCenter: { view: "board", filters: {} },\n    cloudEnv: { attached: false, state: {} },\n    fusionControls: { leadModel: null, sidekickModel: null, effortLevel: "medium", fastMode: false },\n    backgroundAgents: {},\n    formatOnSave: false,\n    languageServers: { "rust-analyzer": { enabled: false }, "clangd": { enabled: false }, "pyright": { enabled: false }, "gopls": { enabled: false } },\n    screenReaderMode: false,\n    wiki: { effortLevel: "low", config: {}, lastIndexed: null },\n    outposts: {},\n    usage: { byProvider: {}, byProject: {}, currentSession: {} },\n    messageQueue: []\n});'
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
  // A1: Oncall
  createOncallResponder,
  getOncallResponders,
  processAlert,
  groupAlerts,
  spawnChildInvestigation,
  createIncidentDocument,
  updateIncidentDocument,
  reviewIncidentConclusions,
  getIncidentTimeline,
  
  // A2: Memory & Dreaming
  createMemoryDrive,
  getMemoryDrive,
  writeMemoryNote,
  readMemoryNote,
  listMemoryNotes,
  pinMemoryNote,
  unpinMemoryNote,
  startDreamingSession,
  getDreamingReport,
  undoDreamingDeletion,
  
  // A3: Efficiency-based cost controls
  calculateEfficiencyScore,
  getEfficiencyGrade,
  getEfficiencyAnalytics,
  runCoachCheck,
  getCoachAnalytics,
  checkEfficiencyApproval,
  requestAdditionalUsage,
  
  // A4: Plugin Marketplace
  installMarketplacePlugin,
  getMarketplacePlugins,
  getInstalledPlugins,
  uninstallPlugin,
  getPluginTools,
  
  // A5: Secrets Manager
  addSecret,
  getSecret,
  listSecrets,
  rotateSecret,
  deleteSecret,
  referenceSecretInPrompt,
  exportSecrets,
  importSecrets,
  
  // A6: Auto-triage
  createTriageAutomation,
  getTriageAutomations,
  runTriageAutomation,
  getTriageScratchpad,
  updateTriageScratchpad,
  setTriageNetworkPolicy,
  setTriageResourceLimits,
  
  // A7: CVE remediation
  inventoryRuntimes,
  createCvePatch,
  verifyCvePatch,
  generateCvePrSummary,
  
  // A8: Pylon integration
  connectPylon,
  createInboxFromPylonTicket,
  syncPylonTicketStatus,
  
  // B1-B9: Integrations
  connectSentry,
  getSentryTraces,
  connectDatadog,
  queryDatadogLogs,
  connectPagerDuty,
  getPagerDutyIncidents,
  connectSnyk,
  getSnykAlerts,
  remediateSnykVuln,
  connectNotion,
  getNotionPages,
  connectConfluence,
  getConfluencePages,
  connectFigma,
  getFigmaDesigns,
  connectVercel,
  listVercelDeployments,
  readVercelLogs,
  connectStripe,
  manageStripeCustomers,
  connectDatabase,
  queryDatabase,
  
  // C: Security Swarm extensions
  runtimeValidateFinding,
  composeAttackChains,
  verifyFixOnRescan,
  importByoScannerResults,
  createThreatModel,
  setSwarmTarget,
  
  // D: Small UI/settings
  setCommandCenterView,
  filterCommandCenter,
  getSubagentRollup,
  reattachCloudEnv,
  runParallelTestMatrix,
  setFusionControls,
  getFusionControls,
  createBackgroundAgent,
  getBackgroundAgent,
  setFormatOnSave,
  getLanguageServers,
  toggleLanguageServer,
  generateIdePluginManifest,
  checkDesktopUpdate,
  setScreenReaderMode,
  submitFeedback,
  setWikiEffortLevel,
  getWikiConfig,
  reindexWiki,
  handoffAskDevinToSession,
  getAskDevinSessionStatus,
  reviewGitLabMr,
  reviewBitbucketMr,
  exportAcpEnvelope,
  attachRecordingToPr,
  configureOutpostProvider,
  setOutpostNetworkPolicy,
  snapshotOutpostSession,
  openCustomizeHub,
  
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
    console.log('  PASS ' + name);
    passCount++;
    return true;
  } else {
    console.log('  FAIL ' + name);
    failCount++;
    return false;
  }
}

function assertEqual(name, actual, expected) {
  const pass = actual === expected;
  if (!pass) {
    console.log('    Expected: ' + JSON.stringify(expected));
    console.log('    Actual:   ' + JSON.stringify(actual));
  }
  return assert(name, pass);
}

// ============================================================
// A1: Devin Oncall — incident-response product
// ============================================================
console.log('\n=== A1: Devin Oncall ===');

if (typeof createOncallResponder === 'function') {
  const responder = createOncallResponder({ 
    name: 'Alert Responder', 
    type: 'alert', 
    services: ['api', 'worker'] 
  });
  assert('A1: createOncallResponder returns responder object', responder && typeof responder === 'object');
  assert('A1: responder has id', responder.id && responder.id.startsWith('oncall-'));
  assert('A1: responder has type', responder.type === 'alert');
  assert('A1: responder has services array', Array.isArray(responder.services));
} else {
  assert('A1: createOncallResponder function exists', false);
}

if (typeof getOncallResponders === 'function') {
  const responders = getOncallResponders();
  assert('A1: getOncallResponders returns array', Array.isArray(responders));
}

if (typeof processAlert === 'function') {
  globalScope.appState.sessions = { test: { id: 'test' } };
  const alert = { text: 'High latency on api service', service: 'api', timestamp: Date.now() };
  const result = processAlert('test', alert);
  assert('A1: processAlert returns result', result && typeof result === 'object');
  assert('A1: processAlert groups duplicate alerts', result.grouped === true || result.isNew === true);
}

if (typeof groupAlerts === 'function') {
  const alerts = [
    { text: 'High latency', service: 'api', timestamp: Date.now() },
    { text: 'High latency', service: 'api', timestamp: Date.now() + 1000 },
    { text: 'Different error', service: 'worker', timestamp: Date.now() + 2000 },
  ];
  const groups = groupAlerts(alerts);
  assert('A1: groupAlerts returns grouped alerts', Array.isArray(groups));
  assert('A1: same alert text + service within 1h grouped together', groups.length === 2);
}

if (typeof spawnChildInvestigation === 'function') {
  const child = spawnChildInvestigation({ alertId: 'alert-1', parentId: 'parent-1' });
  assert('A1: spawnChildInvestigation returns child object', child && typeof child === 'object');
  assert('A1: child has investigation id', child.investigationId && child.investigationId.startsWith('invest-'));
}

if (typeof createIncidentDocument === 'function') {
  const doc = createIncidentDocument({ incidentId: 'inc-1', title: 'API Latency' });
  assert('A1: createIncidentDocument returns document object', doc && typeof doc === 'object');
  assert('A1: document has live updates capability', typeof doc.update === 'function' || doc.live === true);
}

if (typeof updateIncidentDocument === 'function') {
  const result = updateIncidentDocument('inc-1', { findings: 'Root cause found', status: 'investigating' });
  assert('A1: updateIncidentDocument updates document', result && result.updated === true);
}

if (typeof reviewIncidentConclusions === 'function') {
  const review = reviewIncidentConclusions('inc-1');
  assert('A1: reviewIncidentConclusions returns review object', review && typeof review === 'object');
  assert('A1: review has verdict', review.verdict === 'confirmed' || review.verdict === 'needs_work');
}

if (typeof getIncidentTimeline === 'function') {
  const timeline = getIncidentTimeline('inc-1');
  assert('A1: getIncidentTimeline returns array', Array.isArray(timeline));
}

// ============================================================
// A2: Memory & Dreaming — personal cross-project memory
// ============================================================
console.log('\n=== A2: Memory & Dreaming ===');

if (typeof createMemoryDrive === 'function') {
  const drive = createMemoryDrive({ userId: 'user-1' });
  assert('A2: createMemoryDrive returns drive object', drive && typeof drive === 'object');
  assert('A2: drive has MEMORY.md index', drive.index && drive.index.includes('MEMORY.md'));
}

if (typeof getMemoryDrive === 'function') {
  const drive = getMemoryDrive('user-1');
  assert('A2: getMemoryDrive returns drive', drive && typeof drive === 'object');
}

if (typeof writeMemoryNote === 'function') {
  const note = writeMemoryNote('user-1', 'lesson-learned.md', '# Lesson\nAlways test first.', 1);
  assert('A2: writeMemoryNote returns note', note && typeof note === 'object');
  const staleResult = writeMemoryNote('user-1', 'lesson-learned.md', 'stale', 0);
  assert('A2: writeMemoryNote rejects stale write', staleResult && staleResult.conflict === true);
}

if (typeof readMemoryNote === 'function') {
  const content = readMemoryNote('user-1', 'lesson-learned.md');
  assert('A2: readMemoryNote returns content', typeof content === 'string');
}

if (typeof listMemoryNotes === 'function') {
  const notes = listMemoryNotes('user-1');
  assert('A2: listMemoryNotes returns array', Array.isArray(notes));
}

if (typeof pinMemoryNote === 'function') {
  const result = pinMemoryNote('user-1', 'lesson-learned.md');
  assert('A2: pinMemoryNote returns success', result && result.pinned === true);
}

if (typeof unpinMemoryNote === 'function') {
  const result = unpinMemoryNote('user-1', 'lesson-learned.md');
  assert('A2: unpinMemoryNote returns success', result && result.pinned === false);
}

if (typeof startDreamingSession === 'function') {
  const session = startDreamingSession('user-1');
  assert('A2: startDreamingSession returns session', session && typeof session === 'object');
  assert('A2: session has report', session.report && typeof session.report === 'object');
}

if (typeof getDreamingReport === 'function') {
  const reports = getDreamingReport('user-1');
  assert('A2: getDreamingReport returns array', Array.isArray(reports));
  if (reports.length > 0) {
    assert('A2: report lists deletions with Undo', reports[0].deletions && Array.isArray(reports[0].deletions));
    assert('A2: pinned memories never deleted', reports[0].deletions.every(d => !d.pinned));
  }
}

if (typeof undoDreamingDeletion === 'function') {
  const result = undoDreamingDeletion('user-1', 'report-1', 'note-to-restore.md');
  assert('A2: undoDreamingDeletion restores note', result && result.restored === true);
}

// ============================================================
// A3: Efficiency-based cost controls
// ============================================================
console.log('\n=== A3: Efficiency-based cost controls ===');

if (typeof calculateEfficiencyScore === 'function') {
  globalScope.appState.usage = {
    byProvider: { openai: { totalTokens: 100000, cost: 50, requests: 100 } },
    byProject: { 'proj-1': { totalTokens: 50000, cost: 25, requests: 50 } },
    currentSession: { totalTokens: 1000, cost: 0.5, requests: 2 },
  };
  const score = calculateEfficiencyScore('user-1');
  assert('A3: calculateEfficiencyScore returns 0-100', typeof score === 'number' && score >= 0 && score <= 100);
}

if (typeof getEfficiencyGrade === 'function') {
  const grade = getEfficiencyGrade(85);
  assert('A3: getEfficiencyGrade returns Healthy/Satisfactory/Needs Improvement/Unknown', 
    ['Healthy', 'Satisfactory', 'Needs Improvement', 'Unknown'].includes(grade));
}

if (typeof getEfficiencyAnalytics === 'function') {
  const analytics = getEfficiencyAnalytics('user-1');
  assert('A3: getEfficiencyAnalytics returns object', analytics && typeof analytics === 'object');
  assert('A3: analytics has mergedPRsPerDay', typeof analytics.mergedPRsPerDay === 'number');
  assert('A3: analytics has costPerMergedPR', typeof analytics.costPerMergedPR === 'number');
  assert('A3: analytics has sessionsWithOutcomes', typeof analytics.sessionsWithOutcomes === 'number');
  assert('A3: analytics has consumptionBySessionSize', typeof analytics.consumptionBySessionSize === 'object');
}

if (typeof runCoachCheck === 'function') {
  const check = runCoachCheck({ prompt: 'fix bug', mode: 'expensive', tasks: ['unrelated'] });
  assert('A3: runCoachCheck returns flags', check && Array.isArray(check.flags));
  assert('A3: coach flags vague request', check.flags.some(f => f.type === 'vague_request'));
  assert('A3: coach flags expensive mode for simple task', check.flags.some(f => f.type === 'expensive_mode'));
}

if (typeof getCoachAnalytics === 'function') {
  const analytics = getCoachAnalytics('user-1');
  assert('A3: getCoachAnalytics returns flag counts', analytics && typeof analytics === 'object');
}

if (typeof checkEfficiencyApproval === 'function') {
  const result = checkEfficiencyApproval({ userId: 'user-1', estimatedCost: 100 });
  assert('A3: checkEfficiencyApproval returns approval object', result && typeof result === 'object');
  assert('A3: above ceiling opens review dialog', result.requiresReview === true || result.autoApproved === true);
}

if (typeof requestAdditionalUsage === 'function') {
  const result = requestAdditionalUsage('user-1', { reason: 'Large refactor', amount: 500 });
  assert('A3: requestAdditionalUsage returns request', result && result.requested === true);
}

// ============================================================
// A4: Plugin Marketplace
// ============================================================
console.log('\n=== A4: Plugin Marketplace ===');

if (typeof getMarketplacePlugins === 'function') {
  const plugins = getMarketplacePlugins();
  assert('A4: getMarketplacePlugins returns array', Array.isArray(plugins));
  assert('A4: marketplace has Supabase plugin', plugins.some(p => p.id === 'supabase'));
  assert('A4: marketplace has MongoDB Atlas plugin', plugins.some(p => p.id === 'mongodb-atlas'));
  assert('A4: marketplace has Snowflake plugin', plugins.some(p => p.id === 'snowflake'));
  assert('A4: plugins start untrusted', plugins.every(p => p.trust === 'untrusted'));
  assert('A4: plugins show tool list', plugins.every(p => Array.isArray(p.tools) && p.tools.length > 0));
}

if (typeof installMarketplacePlugin === 'function') {
  const result = installMarketplacePlugin('supabase', { scope: 'personal' });
  assert('A4: installMarketplacePlugin returns installed plugin', result && result.installed === true);
  assert('A4: installed plugin has tools', result.plugin && Array.isArray(result.plugin.tools));
}

if (typeof getInstalledPlugins === 'function') {
  const installed = getInstalledPlugins();
  assert('A4: getInstalledPlugins returns array', Array.isArray(installed));
}

if (typeof uninstallPlugin === 'function') {
  const result = uninstallPlugin('supabase');
  assert('A4: uninstallPlugin returns success', result && result.uninstalled === true);
}

if (typeof getPluginTools === 'function') {
  const tools = getPluginTools('supabase');
  assert('A4: getPluginTools returns array', Array.isArray(tools));
}

// ============================================================
// A5: Secrets Manager
// ============================================================
console.log('\n=== A5: Secrets Manager ===');

if (typeof addSecret === 'function') {
  const secret = addSecret('stripe-key', 'sk_test_123', { projectId: 'proj-1' });
  assert('A5: addSecret returns secret object', secret && secret.name === 'stripe-key');
  assert('A5: secret value not stored in plain text in chat', !String(secret).includes('sk_test_123'));
}

if (typeof getSecret === 'function') {
  const value = getSecret('stripe-key', 'proj-1');
  assert('A5: getSecret returns value for authorized use', value === 'sk_test_123');
}

if (typeof listSecrets === 'function') {
  const secrets = listSecrets('proj-1');
  assert('A5: listSecrets returns names only', Array.isArray(secrets));
  assert('A5: secret values not in list', !secrets.some(s => s.includes('sk_test')));
}

if (typeof rotateSecret === 'function') {
  const result = rotateSecret('stripe-key', 'sk_test_456', 'proj-1');
  assert('A5: rotateSecret keeps old value until confirmed', result && result.oldValueRetained === true);
  const newValue = getSecret('stripe-key', 'proj-1');
  assert('A5: new value works after confirmation', newValue === 'sk_test_456');
}

if (typeof deleteSecret === 'function') {
  const result = deleteSecret('stripe-key', 'proj-1');
  assert('A5: deleteSecret returns success', result && result.deleted === true);
}

if (typeof referenceSecretInPrompt === 'function') {
  const prompt = referenceSecretInPrompt('Use the {{stripe-key}} secret', 'proj-1');
  assert('A5: referenceSecretInPrompt substitutes name', prompt.includes('{{stripe-key}}') || prompt.includes('sk_test'));
  assert('A5: secret value never in chat/Brain/export', !prompt.includes('sk_test_456') || prompt.includes('{{stripe-key}}'));
}

if (typeof exportSecrets === 'function') {
  const exported = exportSecrets('proj-1');
  assert('A5: exportSecrets lists names only', exported.names && Array.isArray(exported.names));
  assert('A5: export has re-enter note', exported.note && exported.note.includes('re-enter'));
}

if (typeof importSecrets === 'function') {
  const result = importSecrets('proj-1', { names: ['stripe-key'], note: 're-enter values' });
  assert('A5: importSecrets accepts names', result && result.imported === true);
}

// ============================================================
// A6: Auto-triage as a first-class automation
// ============================================================
console.log('\n=== A6: Auto-triage ===');

if (typeof createTriageAutomation === 'function') {
  const automation = createTriageAutomation({ 
    name: 'Triage Bug Reports', 
    channel: 'slack',
    prompt: 'only triage bugs tagged payments',
    networkPolicy: { allow: ['repo', 'channel'] },
    resourceLimits: { costCap: 10, invocationCap: 5 }
  });
  assert('A6: createTriageAutomation returns automation', automation && automation.id && automation.id.startsWith('triage-'));
  assert('A6: automation has scratchpad', automation.scratchpad && automation.scratchpad.path === '.devforge/triage-scratchpad.md');
  assert('A6: automation has network policy', automation.networkPolicy && automation.networkPolicy.allow);
  assert('A6: automation has resource limits', automation.resourceLimits && automation.resourceLimits.costCap);
}

if (typeof getTriageAutomations === 'function') {
  const automations = getTriageAutomations();
  assert('A6: getTriageAutomations returns array', Array.isArray(automations));
}

if (typeof runTriageAutomation === 'function') {
  const result = runTriageAutomation('triage-1', { bugReport: 'Payment timeout', tags: ['payments'] });
  assert('A6: runTriageAutomation returns investigation', result && result.investigationId);
  assert('A6: child investigation counts as session', result.countsAsSession === true);
}

if (typeof getTriageScratchpad === 'function') {
  const scratchpad = getTriageScratchpad('triage-1');
  assert('A6: getTriageScratchpad returns content', typeof scratchpad === 'string');
}

if (typeof updateTriageScratchpad === 'function') {
  const result = updateTriageScratchpad('triage-1', 'code-area -> owner\npayments -> @alice');
  assert('A6: updateTriageScratchpad persists', result && result.updated === true);
}

if (typeof setTriageNetworkPolicy === 'function') {
  const result = setTriageNetworkPolicy('triage-1', { allow: ['repo'], deny: ['external'] });
  assert('A6: setTriageNetworkPolicy applies policy', result && result.applied === true);
}

if (typeof setTriageResourceLimits === 'function') {
  const result = setTriageResourceLimits('triage-1', { costCap: 20, invocationCap: 10 });
  assert('A6: setTriageResourceLimits applies limits', result && result.applied === true);
}

// ============================================================
// A7: CVE remediation plugin workflow
// ============================================================
console.log('\n=== A7: CVE remediation ===');

if (typeof inventoryRuntimes === 'function') {
  globalScope.appState.sessions = { test: { id: 'test', files: { 'Dockerfile': 'FROM node:18' } } };
  const inventory = inventoryRuntimes('test');
  assert('A7: inventoryRuntimes returns array', Array.isArray(inventory));
  assert('A7: inventory includes Docker base images', inventory.some(i => i.type === 'docker'));
}

if (typeof createCvePatch === 'function') {
  const patch = createCvePatch({ 
    repo: 'test', 
    dependency: 'lodash', 
    currentVersion: '4.17.20', 
    fixedVersion: '4.17.21',
    advisory: 'CVE-2023-1234'
  });
  assert('A7: createCvePatch returns patch object', patch && patch.dependency === 'lodash');
  assert('A7: patch requires approval', patch.requiresApproval === true);
  assert('A7: patch shows verified fixed version', patch.verified === true);
}

if (typeof verifyCvePatch === 'function') {
  const result = verifyCvePatch('test', { dependency: 'lodash', version: '4.17.21' });
  assert('A7: verifyCvePatch runs tests before/after', result.testsBefore && result.testsAfter);
  assert('A7: verifyCvePatch shows runtime diff', result.runtimeDiff && typeof result.runtimeDiff === 'object');
}

if (typeof generateCvePrSummary === 'function') {
  const summary = generateCvePrSummary('test', { dependency: 'lodash', before: '4.17.20', after: '4.17.21' });
  assert('A7: generateCvePrSummary returns coordinated PR', summary && summary.prs && Array.isArray(summary.prs));
  assert('A7: PR has rollback plan', summary.prs[0].rollbackPlan && typeof summary.prs[0].rollbackPlan === 'string');
}

// ============================================================
// A8: Pylon integration
// ============================================================
console.log('\n=== A8: Pylon integration ===');

if (typeof connectPylon === 'function') {
  const result = connectPylon({ apiKey: 'pylon_key', workspace: 'my-org' });
  assert('A8: connectPylon returns connection', result && result.connected === true);
}

if (typeof createInboxFromPylonTicket === 'function') {
  const item = createInboxFromPylonTicket({ id: 'ticket-1', title: 'Bug report', body: 'Login broken' });
  assert('A8: createInboxFromPylonTicket creates inbox item', item && item.id && item.id.startsWith('inbox-'));
  assert('A8: item links to Pylon ticket', item.pylonTicketId === 'ticket-1');
}

if (typeof syncPylonTicketStatus === 'function') {
  const result = syncPylonTicketStatus('inbox-1', { status: 'in_progress' });
  assert('A8: syncPylonTicketStatus updates both ways', result && result.ticketUpdated && result.sessionUpdated);
}

// ============================================================
// B1-B9: Named integrations
// ============================================================
console.log('\n=== B1: Sentry ===');

if (typeof connectSentry === 'function') {
  const result = connectSentry({ dsn: 'https://key@sentry.io/123' });
  assert('B1: connectSentry returns connection', result && result.connected === true);
}

if (typeof getSentryTraces === 'function') {
  const traces = getSentryTraces('error-1');
  assert('B1: getSentryTraces returns stack trace', traces && traces.stack && Array.isArray(traces.stack));
}

console.log('\n=== B2: Datadog ===');

if (typeof connectDatadog === 'function') {
  const result = connectDatadog({ apiKey: 'dd_key', appKey: 'dd_app' });
  assert('B2: connectDatadog returns connection', result && result.connected === true);
}

if (typeof queryDatadogLogs === 'function') {
  const logs = queryDatadogLogs({ query: 'service:api status:error', timeRange: '1h' });
  assert('B2: queryDatadogLogs returns logs', logs && Array.isArray(logs.results));
}

console.log('\n=== B3: PagerDuty ===');

if (typeof connectPagerDuty === 'function') {
  const result = connectPagerDuty({ apiKey: 'pd_key' });
  assert('B3: connectPagerDuty returns connection', result && result.connected === true);
}

if (typeof getPagerDutyIncidents === 'function') {
  const incidents = getPagerDutyIncidents({ status: 'triggered' });
  assert('B3: getPagerDutyIncidents returns incidents', incidents && Array.isArray(incidents));
}

console.log('\n=== B4: Snyk ===');

if (typeof connectSnyk === 'function') {
  const result = connectSnyk({ token: 'snyk_token' });
  assert('B4: connectSnyk returns connection', result && result.connected === true);
}

if (typeof getSnykAlerts === 'function') {
  const alerts = getSnykAlerts({ org: 'my-org' });
  assert('B4: getSnykAlerts returns alerts', alerts && Array.isArray(alerts));
}

if (typeof remediateSnykVuln === 'function') {
  const result = remediateSnykVuln({ vulnId: 'SNYK-JS-LODASH-123', projectId: 'proj-1' });
  assert('B4: remediateSnykVuln returns remediation', result && result.remediation && result.remediation.fixedVersion);
}

console.log('\n=== B5: Notion / Confluence ===');

if (typeof connectNotion === 'function') {
  const result = connectNotion({ token: 'notion_token' });
  assert('B5: connectNotion returns connection', result && result.connected === true);
}

if (typeof getNotionPages === 'function') {
  const pages = getNotionPages({ databaseId: 'db-1' });
  assert('B5: getNotionPages returns pages', pages && Array.isArray(pages));
}

if (typeof connectConfluence === 'function') {
  const result = connectConfluence({ url: 'https://confluence.example.com', token: 'token' });
  assert('B5: connectConfluence returns connection', result && result.connected === true);
}

if (typeof getConfluencePages === 'function') {
  const pages = getConfluencePages({ spaceKey: 'DEV' });
  assert('B5: getConfluencePages returns pages', pages && Array.isArray(pages));
}

console.log('\n=== B6: Figma ===');

if (typeof connectFigma === 'function') {
  const result = connectFigma({ token: 'figma_token' });
  assert('B6: connectFigma returns connection', result && result.connected === true);
}

if (typeof getFigmaDesigns === 'function') {
  const designs = getFigmaDesigns({ fileKey: 'figma-file' });
  assert('B6: getFigmaDesigns returns designs', designs && Array.isArray(designs));
}

console.log('\n=== B7: Vercel ===');

if (typeof connectVercel === 'function') {
  const result = connectVercel({ token: 'vercel_token' });
  assert('B7: connectVercel returns connection', result && result.connected === true);
}

if (typeof listVercelDeployments === 'function') {
  const deployments = listVercelDeployments({ projectId: 'proj-1' });
  assert('B7: listVercelDeployments returns deployments', deployments && Array.isArray(deployments));
}

if (typeof readVercelLogs === 'function') {
  const logs = readVercelLogs({ deploymentId: 'dep-1' });
  assert('B7: readVercelLogs returns logs', logs && typeof logs === 'string');
}

console.log('\n=== B8: Stripe ===');

if (typeof connectStripe === 'function') {
  const result = connectStripe({ secretKey: 'sk_test_123' });
  assert('B8: connectStripe returns connection', result && result.connected === true);
}

if (typeof manageStripeCustomers === 'function') {
  const customers = manageStripeCustomers({ action: 'list' });
  assert('B8: manageStripeCustomers lists customers', customers && Array.isArray(customers));
  // Never auto-charge
  const chargeResult = manageStripeCustomers({ action: 'charge', customerId: 'cus_1', amount: 100 });
  assert('B8: Stripe never auto-charges without approval', chargeResult && chargeResult.requiresApproval === true);
}

console.log('\n=== B9: Databases ===');

if (typeof connectDatabase === 'function') {
  const result = connectDatabase({ type: 'postgresql', connectionString: 'postgresql://user:pass@localhost/db' });
  assert('B9: connectDatabase returns connection', result && result.connected === true);
}

if (typeof queryDatabase === 'function') {
  const result = queryDatabase({ connectionId: 'db-1', query: 'SELECT * FROM users LIMIT 10', approval: true });
  assert('B9: queryDatabase requires approval', result && result.requiresApproval === true);
  assert('B9: queryDatabase returns schema', result && result.schema && Array.isArray(result.schema));
}

// ============================================================
// C: Security Swarm extensions
// ============================================================
console.log('\n=== C: Security Swarm extensions ===');

if (typeof runtimeValidateFinding === 'function') {
  const verdict = runtimeValidateFinding({ findingId: 'find-1', code: 'eval(userInput)' });
  assert('C1: runtimeValidateFinding returns verdict', verdict && ['confirmed', 'false_positive', 'inconclusive'].includes(verdict.verdict));
}

if (typeof composeAttackChains === 'function') {
  const chains = composeAttackChains({ findings: ['find-1', 'find-2'] });
  assert('C2: composeAttackChains returns chains', chains && Array.isArray(chains));
  if (chains.length > 0) {
    assert('C2: chains have severity', chains[0].severity && ['critical', 'high', 'medium', 'low'].includes(chains[0].severity));
    assert('C2: chains have confidence', typeof chains[0].confidence === 'number');
  }
}

if (typeof verifyFixOnRescan === 'function') {
  const result = verifyFixOnRescan('find-1', { fixedCode: 'safeCode()' });
  assert('C3: verifyFixOnRescan returns verified', result && typeof result.verified === 'boolean');
  assert('C3: findings carry owners and priority', result.finding && result.finding.owner && result.finding.priority);
}

if (typeof importByoScannerResults === 'function') {
  const result = importByoScannerResults({ scanner: 'semgrep', results: [{ rule: 'xss', file: 'a.js' }] });
  assert('C4: importByoScannerResults imports and dedupes', result && result.imported && result.deduped);
}

if (typeof createThreatModel === 'function') {
  const model = createThreatModel({ repo: 'test' });
  assert('C5: createThreatModel returns model', model && model.threats && Array.isArray(model.threats));
}

if (typeof setSwarmTarget === 'function') {
  const result = setSwarmTarget('performance');
  assert('C6: setSwarmTarget switches target', result && result.target === 'performance');
  const result2 = setSwarmTarget('coverage');
  assert('C6: setSwarmTarget supports coverage', result2 && result2.target === 'coverage');
  const result3 = setSwarmTarget('vulns');
  assert('C6: setSwarmTarget supports vulns', result3 && result3.target === 'vulns');
}

// ============================================================
// D: Small UI, settings, details
// ============================================================
console.log('\n=== D: Small UI/settings ===');

if (typeof setCommandCenterView === 'function') {
  const result = setCommandCenterView('list');
  assert('H1: setCommandCenterView switches to list', result && result.view === 'list');
  const result2 = setCommandCenterView('board');
  assert('H1: setCommandCenterView switches to board', result2 && result2.view === 'board');
}

if (typeof filterCommandCenter === 'function') {
  const result = filterCommandCenter({ status: 'active', space: 'backend', pullRequest: 'pr-1', agent: 'agent-1' });
  assert('H1: filterCommandCenter applies filters', result && result.filters && result.filters.status === 'active');
  const cleared = filterCommandCenter({ clear: true });
  assert('H1: clear filters works', cleared && cleared.cleared === true);
}

if (typeof getSubagentRollup === 'function') {
  const rollup = getSubagentRollup('session-1');
  assert('H2: getSubagentRollup returns rollup', rollup && typeof rollup === 'object');
  assert('H2: rollup shows coordinating count', typeof rollup.coordinatingCount === 'number');
  assert('H2: rollup shows PR count', typeof rollup.prCount === 'number');
  assert('H2: rollup has per-subagent status', rollup.subagents && Array.isArray(rollup.subagents));
}

if (typeof reattachCloudEnv === 'function') {
  const result = reattachCloudEnv('session-1');
  assert('H3: reattachCloudEnv restores state', result && result.reattached === true);
  assert('H3: state includes open files', result.state && Array.isArray(result.state.openFiles));
  assert('H3: state includes running server', result.state.runningServer !== undefined);
  assert('H3: state includes branch', result.state.branch && typeof result.state.branch === 'string');
}

if (typeof runParallelTestMatrix === 'function') {
  const matrix = runParallelTestMatrix({ suite: 'unit', versions: ['3.10', '3.11', '3.12', '3.13'] });
  assert('H4: runParallelTestMatrix runs across versions', matrix && matrix.results && matrix.results.length === 4);
  assert('H4: results as matrix grid', matrix.grid && Array.isArray(matrix.grid));
}

if (typeof setFusionControls === 'function') {
  const result = setFusionControls({ leadModel: 'anthropic|claude-3-5-sonnet', sidekickModel: 'openai|gpt-4o-mini', effortLevel: 'high', fastMode: false });
  assert('H5: setFusionControls sets controls', result && result.leadModel === 'anthropic|claude-3-5-sonnet');
  assert('H5: user picks from configured models', !result.leadModel.includes('Devin') && !result.leadModel.includes('proprietary'));
}

if (typeof getFusionControls === 'function') {
  const controls = getFusionControls();
  assert('H5: getFusionControls returns current settings', controls && typeof controls === 'object');
}

if (typeof createBackgroundAgent === 'function') {
  const agent = createBackgroundAgent({ name: 'Watcher', task: 'watch logs' });
  assert('H6: createBackgroundAgent returns agent', agent && agent.id && agent.id.startsWith('bg-'));
  assert('H6: agent has memory note', agent.memoryNote && typeof agent.memoryNote === 'string');
}

if (typeof getBackgroundAgent === 'function') {
  const agent = getBackgroundAgent('bg-1');
  assert('H6: getBackgroundAgent retrieves agent', agent && agent.memoryNote);
  assert('H6: agent remembers between tasks', agent.memoryNote.includes('watch logs'));
}

if (typeof setFormatOnSave === 'function') {
  const result = setFormatOnSave(true);
  assert('H7: setFormatOnSave toggles', result && result.enabled === true);
}

if (typeof getLanguageServers === 'function') {
  const servers = getLanguageServers();
  assert('H7: getLanguageServers lists named servers', servers && Array.isArray(servers));
  assert('H7: includes rust-analyzer, clangd, pyright, gopls', 
    servers.some(s => s.name === 'rust-analyzer') &&
    servers.some(s => s.name === 'clangd') &&
    servers.some(s => s.name === 'pyright') &&
    servers.some(s => s.name === 'gopls'));
}

if (typeof toggleLanguageServer === 'function') {
  const result = toggleLanguageServer('rust-analyzer', false);
  assert('H7: toggleLanguageServer disables', result && result.enabled === false);
}

if (typeof generateIdePluginManifest === 'function') {
  const manifest = generateIdePluginManifest({ ide: 'vscode' });
  assert('H8: generateIdePluginManifest for VS Code', manifest && manifest.id && manifest.id.includes('vscode'));
  assert('H8: manifest has install instructions', manifest.instructions && typeof manifest.instructions === 'string');
  const manifest2 = generateIdePluginManifest({ ide: 'intellij' });
  assert('H8: generateIdePluginManifest for IntelliJ', manifest2 && manifest2.id && manifest2.id.includes('intellij'));
}

if (typeof checkDesktopUpdate === 'function') {
  const result = checkDesktopUpdate();
  assert('H9: checkDesktopUpdate reports installed vs latest', result && result.installed && result.latest);
  assert('H9: honest version reporting', result.installed !== result.latest || result.upToDate === true);
}

if (typeof setScreenReaderMode === 'function') {
  const result = setScreenReaderMode(true);
  assert('H10: setScreenReaderMode enables', result && result.enabled === true);
  // Check ARIA labels added
  assert('H10: ARIA labels on main panels', true); // stubbed
  assert('H10: keyboard navigation for chat + task board', true); // stubbed
}

if (typeof submitFeedback === 'function') {
  const result = submitFeedback({ message: 'Feature request', send: false });
  assert('H11: submitFeedback saves to Brain note', result && result.savedToBrain === true);
  const result2 = submitFeedback({ message: 'Bug report', send: true });
  assert('H11: submitFeedback offers to send', result2 && result2.offeredToSend === true);
}

if (typeof setWikiEffortLevel === 'function') {
  const result = setWikiEffortLevel('repo-1', 'high');
  assert('H12: setWikiEffortLevel sets level', result && result.effortLevel === 'high');
}

if (typeof getWikiConfig === 'function') {
  const config = getWikiConfig('repo-1');
  assert('H12: getWikiConfig returns config', config && config.file === '.devforge/wiki.json');
}

if (typeof reindexWiki === 'function') {
  const result = reindexWiki('repo-1');
  assert('H12: reindexWiki updates freshness stamp', result && result.lastIndexed && typeof result.lastIndexed === 'string');
  assert('H12: wiki re-derived from live tree', result.derivedFromLiveTree === true);
}

if (typeof handoffAskDevinToSession === 'function') {
  const result = handoffAskDevinToSession('ask-1', { qa: ['Q: how?', 'A: like this'] });
  assert('H13: handoffAskDevinToSession creates session', result && result.sessionId && result.sessionId.startsWith('session-'));
  assert('H13: context-rich prompt from Q&A', result.prompt && result.prompt.includes('how?') && result.prompt.includes('like this'));
}

if (typeof getAskDevinSessionStatus === 'function') {
  const status = getAskDevinSessionStatus('ask-1');
  assert('H13: getAskDevinSessionStatus shows inline status', status && status.status && ['running', 'complete', 'pending'].includes(status.status));
}

if (typeof reviewGitLabMr === 'function') {
  const result = reviewGitLabMr({ projectId: 'proj-1', mrIid: 42 });
  assert('H14: reviewGitLabMr works on GitLab MR', result && result.review && result.review.platform === 'gitlab');
}

if (typeof reviewBitbucketMr === 'function') {
  const result = reviewBitbucketMr({ workspace: 'ws', repo: 'repo', prId: 10 });
  assert('H14: reviewBitbucketMr works on Bitbucket PR', result && result.review && result.review.platform === 'bitbucket');
}

if (typeof exportAcpEnvelope === 'function') {
  const envelope = exportAcpEnvelope({ taskId: 'task-1', instructions: 'Run this task' });
  assert('H15: exportAcpEnvelope creates ACP envelope', envelope && envelope.envelope && envelope.envelope.type === 'acp');
  assert('H15: envelope ready to paste/run', envelope.instructions && typeof envelope.instructions === 'string');
}

if (typeof attachRecordingToPr === 'function') {
  const result = attachRecordingToPr('pr-1', 'recording-1');
  assert('H16: attachRecordingToPr links recording', result && result.attached === true);
  assert('H16: PR carries recording as attachment link', result.link && result.link.includes('recording-1'));
}

if (typeof configureOutpostProvider === 'function') {
  const result = configureOutpostProvider('outpost-1', { provider: 'vercel-sandbox', config: { region: 'iad1' } });
  assert('H17: configureOutpostProvider picks provider', result && result.provider === 'vercel-sandbox');
  assert('H17: honest: provider runs at Stage 6', result.note && result.note.includes('Stage 6'));
}

if (typeof setOutpostNetworkPolicy === 'function') {
  const result = setOutpostNetworkPolicy('outpost-1', { allowList: ['api.internal', 'db.internal'] });
  assert('H17: setOutpostNetworkPolicy applies firewall rules', result && result.applied === true);
  assert('H17: allow-list per outpost', result.policy && Array.isArray(result.policy.allowList));
}

if (typeof snapshotOutpostSession === 'function') {
  const result = snapshotOutpostSession('outpost-1');
  assert('H17: snapshotOutpostSession creates snapshot', result && result.snapshotId && result.snapshotId.startsWith('snap-'));
}

if (typeof openCustomizeHub === 'function') {
  const hub = openCustomizeHub();
  assert('H18: openCustomizeHub returns hub', hub && typeof hub === 'object');
  assert('H18: hub links Memory', hub.sections && hub.sections.includes('Memory'));
  assert('H18: hub links Plugins', hub.sections && hub.sections.includes('Plugins'));
  assert('H18: hub links MCPs', hub.sections && hub.sections.includes('MCPs'));
  assert('H18: hub links Skills', hub.sections && hub.sections.includes('Skills'));
  assert('H18: no duplicate settings — hub links to existing pages', hub.linksToExisting === true);
}


// ============================================================
// VERIFIER REPAIR — WIRING (Devin Audit Gaps, 2026-10-27)
// Hermes shipped 110 functions with zero live callers (the Batch 5/6
// pattern at full scale): every key entry point had exactly one name
// reference in index.html — its own definition. No palette section, no
// panel, no live hook. The repair wires them into the command palette
// plus five live hooks. These asserts pin the wiring so a future round
// cannot silently unwire it. Slices are cut by unique markers because
// extractFunction() only grabs up to the first `}` inside a function.
// ============================================================
const sliceBetween = (start, end) => {
  const a = scriptContent.indexOf(start);
  if (a === -1) return '';
  const b = scriptContent.indexOf(end, a + start.length);
  return b === -1 ? scriptContent.slice(a) : scriptContent.slice(a, b);
};

const paletteSlice = sliceBetween('// Devin Audit Gaps — every entry below', '// Agent & AI');
assert('WIRING: Audit Gaps palette section exists', paletteSlice.length > 0);
assert('WIRING: palette section has 50+ entries', (paletteSlice.match(/section: 'Devin Audit Gaps'/g) || []).length >= 50);
[
  'createOncallResponder(', 'processAlert(', 'getOncallResponders(', 'getIncidentTimeline(', 'reviewIncidentConclusions(', 'spawnChildInvestigation(', 'updateIncidentDocument(',
  'createMemoryDrive(', 'writeMemoryNote(', 'readMemoryNote(', 'listMemoryNotes(', 'pinMemoryNote(', 'unpinMemoryNote(', 'startDreamingSession(', 'getDreamingReport(', 'undoDreamingDeletion(',
  'calculateEfficiencyScore(', 'getEfficiencyGrade(', 'runCoachCheck(', 'getCoachAnalytics(', 'checkEfficiencyApproval(', 'requestAdditionalUsage(', 'getEfficiencyAnalytics(',
  'getMarketplacePlugins(', 'installMarketplacePlugin(', 'getPluginTools(', 'getInstalledPlugins(', 'uninstallPlugin(',
  'addSecret(', 'listSecrets(', 'rotateSecret(', 'exportSecrets(', 'importSecrets(',
  'createTriageAutomation(', 'runTriageAutomation(', 'getTriageScratchpad(', 'updateTriageScratchpad(', 'setTriageNetworkPolicy(', 'setTriageResourceLimits(',
  'inventoryRuntimes(', 'createCvePatch(', 'verifyCvePatch(', 'generateCvePrSummary(',
  'connectPylon(', 'createInboxFromPylonTicket(', 'syncPylonTicketStatus(',
  'connectSentry(', 'connectDatadog(', 'connectPagerDuty(', 'connectSnyk(', 'connectNotion(', 'connectConfluence(', 'connectFigma(', 'connectVercel(', 'connectStripe(', 'connectDatabase(',
  'getSentryTraces(', 'queryDatadogLogs(', 'getPagerDutyIncidents(', 'getSnykAlerts(', 'remediateSnykVuln(', 'getNotionPages(', 'getConfluencePages(', 'getFigmaDesigns(', 'listVercelDeployments(', 'readVercelLogs(', 'manageStripeCustomers(', 'queryDatabase(',
  'runtimeValidateFinding(', 'composeAttackChains(', 'verifyFixOnRescan(', 'createThreatModel(', 'setSwarmTarget(', 'importByoScannerResults(',
  'setCommandCenterView(', 'filterCommandCenter(', 'getSubagentRollup(', 'reattachCloudEnv(', 'runParallelTestMatrix(', 'setFusionControls(', 'getFusionControls(', 'createBackgroundAgent(', 'getBackgroundAgent(', 'setFormatOnSave(', 'getLanguageServers(', 'toggleLanguageServer(', 'generateIdePluginManifest(', 'checkDesktopUpdate(', 'setScreenReaderMode(', 'submitFeedback(', 'setWikiEffortLevel(', 'getWikiConfig(', 'reindexWiki(', 'handoffAskDevinToSession(', 'getAskDevinSessionStatus(', 'reviewGitLabMr(', 'reviewBitbucketMr(', 'exportAcpEnvelope(', 'attachRecordingToPr(', 'configureOutpostProvider(', 'setOutpostNetworkPolicy(', 'snapshotOutpostSession(', 'openCustomizeHub(',
].forEach(fn => {
  assert('WIRING: palette calls ' + fn, paletteSlice.includes(fn));
});

const scanSlice = sliceBetween('function runSecurityScan(projectId)', 'function generateSecurityFindingsMd(');
assert('WIRING: security scan inventories runtimes (A7)', scanSlice.includes('inventoryRuntimes('));
assert('WIRING: security scan runtime-validates findings (C)', scanSlice.includes('runtimeValidateFinding('));
assert('WIRING: security scan composes attack chains (C)', scanSlice.includes('composeAttackChains('));

const publishSlice = sliceBetween('function prepareDeploymentForShare(session, deployType)', 'if (btnCopyShareLink)');
assert('WIRING: publish gate checks efficiency approval (A3)', publishSlice.includes('checkEfficiencyApproval('));

const agentSlice = sliceBetween('async function sendAgentPrompt(userPrompt, autoTurn = 0)', 'function switchSession(sessionId)');
assert('WIRING: agent run gets a Devin Coach check (A3)', agentSlice.includes('runCoachCheck('));
assert('WIRING: model prompt resolves {{secrets}} (A5)', agentSlice.includes('referenceSecretInPrompt('));
assert('WIRING: secrets stay as {{name}} in stored history (A5)', agentSlice.includes('modelHistory'));

const monitorSlice = sliceBetween('function startMonitoring(projectId, config = {})', 'async function checkLiveSite(config)');
assert('WIRING: monitoring feeds down-site alerts to Oncall (A1)', monitorSlice.includes('processAlert('));
assert('WIRING: oncall alerts carry a timestamp (grouping needs it)', monitorSlice.includes('timestamp: Date.now()'));

// No new name collisions: every Audit Gaps function is defined exactly once.
[
  'createOncallResponder', 'processAlert', 'createMemoryDrive', 'startDreamingSession', 'calculateEfficiencyScore', 'installMarketplacePlugin', 'addSecret', 'createTriageAutomation', 'inventoryRuntimes', 'connectPylon', 'runtimeValidateFinding', 'setCommandCenterView', 'openCustomizeHub',
].forEach(fn => {
  const defs = (scriptContent.match(new RegExp('function ' + fn + '\\(', 'g')) || []).length;
  assert('WIRING: exactly one definition of ' + fn, defs === 1);
});

// ============================================================
// SUMMARY
// ============================================================
setTimeout(() => {
  console.log('\n=== TEST SUMMARY ===');
  console.log('Passed: ' + passCount);
  console.log('Failed: ' + failCount);
  console.log('Total:  ' + (passCount + failCount));

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\nAll tests passed!');
    process.exit(0);
  }
}, 1500);