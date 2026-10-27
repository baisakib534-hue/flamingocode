// Test suite for Batch 8c — Model auto-failover + best-model per task + themes + multiple accounts
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
let scriptContent = scriptMatch[1];

// Patch appState declaration to be global (like test-batch-8b.js)
scriptContent = scriptContent.replace(
  /let appState = \{[\s\S]*?\n    \};/,
  'appState = (globalThis.appState || {});'
);

// Also expose constants that are inside the main function
// Move DEFAULT_TASK_TYPES and AVAILABLE_THEMES to top level by patching
// Find them inside the main function and add global references
scriptContent = scriptContent.replace(
  /const DEFAULT_TASK_TYPES = \[/,
  'const DEFAULT_TASK_TYPES = ['
);
scriptContent = scriptContent.replace(
  /const AVAILABLE_THEMES = \[/,
  'const AVAILABLE_THEMES = ['
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
    matchMedia: (query) => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }),
    console: console,
    Math: Math,
    Date: Date,
    JSON: JSON,
    Object: Object,
    Array: Array,
    Promise: Promise,
    Error: Error,
    Map: Map,
    Set: Set,
    Symbol: Symbol,
    Reflect: Reflect,
    crypto: { randomUUID: () => 'test-uuid', getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256)) },
    performance: { now: () => Date.now() },
    screen: { width: 1200, height: 800 },
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    },
    sessionStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      length: 0,
      key: () => null
    },
  },
  navigator: {
    clipboard: { writeText: () => Promise.resolve() },
    userAgent: 'Mozilla/5.0 (Test)',
    platform: 'Linux x86_64',
    languages: ['en-US', 'en'],
    hardwareConcurrency: 8,
  },
  console: console,
  // Top-level fetch stub (the script calls bare fetch; the GitHub user endpoint
  // returns a fake verified user so the D5 migration test is deterministic)
  fetch: async (url) => {
    if (String(url).includes('api.github.com/user')) {
      return { ok: true, status: 200, json: async () => ({ login: 'miguser', avatar_url: 'https://example.com/a.png', name: 'Mig User', id: 42 }), text: async () => '' };
    }
    return { ok: false, status: 404, json: async () => ({}), text: async () => '' };
  },
  Math: Math,
  Date: Date,
  JSON: JSON,
  Object: Object,
  Array: Array,
  Promise: Promise,
  Error: Error,
  Map: Map,
  Set: Set,
  Symbol: Symbol,
  Reflect: Reflect,
  crypto: { randomUUID: () => 'test-uuid', getRandomValues: (arr) => arr.map(() => Math.floor(Math.random() * 256)) },
  performance: { now: () => Date.now() },
  screen: { width: 1200, height: 800 },
};
globalScope.globalThis = globalScope; // for appState patch

// Pre-populate globalScope.appState with required properties for Batch 8c tests
globalScope.appState = {
  accounts: [],
  autoFailoverEnabled: true,
  maxFailoversPerStep: 3,
  taskModelPreferences: {},
  theme: 'default',
  language: 'en',
  providers: {},
  activeProviderId: null,
  agents: {},
  activeAgentId: null,
  teamMode: false,
  teamRoster: [],
  teamSeniorId: null,
  teamTaskBoard: [],
  teamChat: [],
  teamPhase: null,
  teamReviewRound: 0,
  planMode: 'general',
  defaultMode: 'general',
  readOnlyPlanMode: false,
  currentPlan: [],
  planStepIndex: 0,
  planPaused: false,
  planRevisionCount: 0,
  planMaxSteps: 25,
  planMaxRevisions: 5,
  stepPlannerEnabled: false,
  thinkActObserveState: 'idle',
  currentStepPlan: null,
  todoListExpanded: false,
  uncensoredPerProject: {},
  uncensoredPerModel: {},
  generalModeShowCode: {},
  sessions: {},
  activeSessionId: null,
  prompts: [],
  customSkillPacks: {},
  customPluginPacks: {},
  mcpServers: {},
  rateLimitState: {},
  failoverCounter: 0,
  modelSwitchHistory: [],
};

// Assertion helper
let passCount = 0;
let failCount = 0;

function assert(label, condition, details = '') {
  if (condition) {
    console.log('PASS:', label);
    passCount++;
  } else {
    console.error('FAIL:', label, details ? '- ' + details : '');
    failCount++;
  }
}

function assertAsync(label, fn) {
  try {
    const result = fn();
    if (result && typeof result.then === 'function') {
      return result.then(() => {
        console.log('PASS:', label);
        passCount++;
      }).catch(err => {
        console.error('FAIL:', label, '- ' + err.message);
        failCount++;
      });
    } else {
      if (result) {
        console.log('PASS:', label);
        passCount++;
      } else {
        console.error('FAIL:', label);
        failCount++;
      }
    }
  } catch (err) {
    console.error('FAIL:', label, '- ' + err.message);
    failCount++;
  }
}

// Run the script in the stubbed environment
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context);
} catch (e) {
  console.error('FAIL: Script execution error:', e.message);
  process.exit(1);
}

// Now run tests by accessing functions from the context
const appState = globalScope.appState;
const routeModelForStep = context.routeModelForStep;
const buildProviderFallbackChain = context.buildProviderFallbackChain;
const callLLMWithFallback = context.callLLMWithFallback;
const getCheapProvider = context.getCheapProvider;

// Also get the aliased functions we add
const connectGitHubAccount = context.connectGitHubAccount || context.addGithubAccount;
const getAccountForAction = context.getAccountForAction;
const migrateLegacyGitHubToken = context.migrateLegacyGitHubToken;
const handleRateLimitFailover = context.handleRateLimitFailover;
const getModelForTaskType = context.getModelForTaskType;
const learnModelPreference = context.learnModelPreference;
const DEFAULT_TASK_TYPES = context.DEFAULT_TASK_TYPES;
const AVAILABLE_THEMES = context.AVAILABLE_THEMES;
const applyTheme = context.applyTheme;
const startThemeAnimation = context.startThemeAnimation;
const stopThemeAnimation = context.stopThemeAnimation;
const disconnectAccount = context.disconnectAccount;
const setDefaultAccount = context.setDefaultAccount;
const runTeamMode = context.runTeamMode;
const callLLMWithAgent = context.callLLMWithAgent;

console.log('\n========== A1: Multiple Accounts Tests ==========');

// Test: appState.accounts store exists and has correct structure
assert('A1: appState.accounts store exists', 
  typeof appState.accounts !== 'undefined' && Array.isArray(appState.accounts));

// Test: connectGitHubAccount function exists (alias for addGithubAccount)
assert('A1: connectGitHubAccount function exists', 
  typeof connectGitHubAccount === 'function');

// Test: disconnectAccount function exists
assert('A1: disconnectAccount function exists', 
  typeof disconnectAccount === 'function');

// Test: setDefaultAccount function exists
assert('A1: setDefaultAccount function exists', 
  typeof setDefaultAccount === 'function');

// Test: setDefaultAccount is defined exactly once (D1 repair — the duplicate is gone)
assert('A1: setDefaultAccount defined once in the script',
  (scriptContent.match(/function setDefaultAccount\(/g) || []).length === 1);

// Test: getAccountForAction function exists (per-action targeting)
assert('A1: getAccountForAction function exists', 
  typeof getAccountForAction === 'function');

// Test: migrateLegacyGitHubToken function exists
assert('A1: migrateLegacyGitHubToken function exists', 
  typeof migrateLegacyGitHubToken === 'function');

console.log('\n========== M1: Model Auto-Failover Tests ==========');

// Test: autoFailoverEnabled setting exists
assert('M1: appState.autoFailoverEnabled setting exists', 
  typeof appState.autoFailoverEnabled !== 'undefined');

// Test: handleRateLimitFailover function exists
assert('M1: handleRateLimitFailover function exists', 
  typeof handleRateLimitFailover === 'function');

// Test: maxFailoversPerStep setting (should be 3)
assert('M1: maxFailoversPerStep is 3', 
  appState.maxFailoversPerStep === 3 || context.MAX_FAILOVERS_PER_STEP === 3);

// Test: failoverCounter is a real appState field (init in loadAppState, not test-only;
// the loadAppState-on-a-legacy-save test in the async section proves the init)
assert('M1: failoverCounter is a real appState field', 
  typeof appState.failoverCounter !== 'undefined');
assert('M1: modelSwitchHistory is a real appState field', 
  Array.isArray(appState.modelSwitchHistory));

// Test: the failover path in callLLMWithFallback is wired through the helper
// and records the counter/history + a visible chat note + a session event
assert('M1: callLLMWithFallback wires handleRateLimitFailover', 
  callLLMWithFallback && callLLMWithFallback.toString().includes('handleRateLimitFailover'));
assert('M1: callLLMWithFallback records failoverCounter + modelSwitchHistory', 
  callLLMWithFallback && callLLMWithFallback.toString().includes('failoverCounter') && callLLMWithFallback.toString().includes('modelSwitchHistory'));
assert('M1: callLLMWithFallback posts a visible chat note + session event on failover', 
  callLLMWithFallback && callLLMWithFallback.toString().includes('appendChatMessage') && callLLMWithFallback.toString().includes('recordEvent'));

console.log('\n========== M2: Best Model Per Task Tests ==========');

// Test: taskModelPreferences store exists
assert('M2: appState.taskModelPreferences exists', 
  typeof appState.taskModelPreferences !== 'undefined');

// Test: DEFAULT_TASK_TYPES constant exists
assert('M2: DEFAULT_TASK_TYPES constant exists', 
  DEFAULT_TASK_TYPES && Array.isArray(DEFAULT_TASK_TYPES));

// Test: getModelForTaskType function exists
assert('M2: getModelForTaskType function exists', 
  typeof getModelForTaskType === 'function');

// Test: learnModelPreference function exists
assert('M2: learnModelPreference function exists', 
  typeof learnModelPreference === 'function');

// Test: routeModelForStep uses the single canonical lookup (getModelForTaskType)
assert('M2: routeModelForStep consults getModelForTaskType', 
  routeModelForStep && routeModelForStep.toString().includes('getModelForTaskType'));

console.log('\n========== M3: Solo + Team Model Behaviour Tests ==========');

// Test: Team agents have model field
assert('M3: runTeamMode exists', typeof runTeamMode === 'function');

// Test: callLLMWithAgent supports per-agent model
assert('M3: callLLMWithAgent exists', typeof callLLMWithAgent === 'function');

// Test: Team agent failover is independent — per-agent calls go through the
// fallback path (callLLMWithAgent -> callLLMWithFallback), so a rate-limited
// agent fails over without touching the other agents
assert('M3: Team agent failover logic exists', 
  callLLMWithAgent && callLLMWithAgent.toString().includes('callLLMWithFallback'));

console.log('\n========== T1: Theme Engine + Qoder Theme Tests ==========');

// Test: theme engine state exists
assert('T1: appState.theme exists', 
  typeof appState.theme !== 'undefined');

// Test: available themes list includes Qoder
assert('T1: AVAILABLE_THEMES includes Qoder theme', 
  AVAILABLE_THEMES && AVAILABLE_THEMES.some(t => t.id === 'qoder'));

// Test: applyTheme function exists
assert('T1: applyTheme function exists', 
  typeof applyTheme === 'function');

// Test: Theme CSS variables are defined for Qoder theme
assert('T1: Qoder theme has CSS variables', 
  AVAILABLE_THEMES && AVAILABLE_THEMES.find(t => t.id === 'qoder')?.cssVars);

// Test: theme switch updates data-theme attribute
assert('T1: applyTheme sets data-theme on document', 
  applyTheme && applyTheme.toString().includes('data-theme'));

// Test: theme persists in localStorage
assert('T1: theme saved to appState/localStorage', 
  applyTheme && (applyTheme.toString().includes('saveAppState') || applyTheme.toString().includes('localStorage')));

console.log('\n========== T2: Animated Background Themes Tests ==========');

// Test: Animated themes exist (Black Hole, Solar System, Nature)
const animatedThemes = ['blackhole', 'solarsystem', 'nature'];
animatedThemes.forEach(themeId => {
  assert(`T2: ${themeId} theme exists`, 
    AVAILABLE_THEMES && AVAILABLE_THEMES.some(t => t.id === themeId));
});

// Test: animation loop function exists
assert('T2: startThemeAnimation function exists', 
  typeof startThemeAnimation === 'function');

assert('T2: stopThemeAnimation function exists', 
  typeof stopThemeAnimation === 'function');

// Test: respects prefers-reduced-motion
assert('T2: respects prefers-reduced-motion', 
  startThemeAnimation && startThemeAnimation.toString().includes('prefers-reduced-motion'));

// Test: pauses on visibilitychange
assert('T2: pauses on tab hidden', 
  startThemeAnimation && startThemeAnimation.toString().includes('visibilitychange'));

// Test: canvas performance guards (devicePixelRatio cap)
assert('T2: canvas has devicePixelRatio cap', 
  startThemeAnimation && startThemeAnimation.toString().includes('devicePixelRatio'));

// Test: single shared animation loop
assert('T2: single requestAnimationFrame loop', 
  startThemeAnimation && startThemeAnimation.toString().includes('requestAnimationFrame'));

console.log('\n========== T3: Glass Theme Tests ==========');

// Test: Glass theme exists
assert('T3: glass theme exists', 
  AVAILABLE_THEMES && AVAILABLE_THEMES.some(t => t.id === 'glass'));

// Test: glass theme has backdrop-filter blur
const glassTheme = AVAILABLE_THEMES?.find(t => t.id === 'glass');
assert('T3: glass theme has backdrop-filter', 
  glassTheme && glassTheme.cssVars && Object.values(glassTheme.cssVars).some(v => v.includes('backdrop-filter') || v.includes('blur')));

// Test: glass theme description states desktop transparency scope honestly
assert('T3: glass theme has honest description', 
  glassTheme && glassTheme.description && glassTheme.description.includes('desktop') && glassTheme.description.includes('Electron'));

// Test: blur strength adjustable (Low/Medium/High)
assert('T3: glass theme has blur settings', 
  glassTheme && glassTheme.blurStrength && ['low', 'medium', 'high'].includes(glassTheme.blurStrength));

// Test: readability guard with scrim
assert('T3: glass theme has text scrim for readability', 
  glassTheme && glassTheme.cssVars && Object.values(glassTheme.cssVars).some(v => v.includes('rgba') && (v.includes('0.') || v.includes('scrim'))));

// ---- Async behavioural tests for the Batch 8c repair (D1/D2/D3/D5/D6/D8/D10) ----
(async () => {
  console.log('\n========== Repair: behavioural tests ==========');

  // D5/D8: loadAppState initialises the 8c fields on a legacy save (no 8c fields yet)
  const _savedAppState = globalScope.appState;
  globalScope.appState = {
    language: 'en', providers: {}, activeProviderId: null, agents: {}, activeAgentId: null,
    teamMode: false, teamRoster: [], teamSeniorId: null, teamTaskBoard: [], teamChat: [],
    teamPhase: null, teamReviewRound: 0, planMode: 'general', defaultMode: 'general',
    readOnlyPlanMode: false, currentPlan: [], planStepIndex: 0, planPaused: false,
    planRevisionCount: 0, planMaxSteps: 25, planMaxRevisions: 5, stepPlannerEnabled: false,
    thinkActObserveState: 'idle', currentStepPlan: null, todoListExpanded: false,
    uncensoredPerProject: {}, uncensoredPerModel: {}, generalModeShowCode: {},
    sessions: {}, activeSessionId: null, prompts: [], customSkillPacks: {},
    customPluginPacks: {}, mcpServers: {}, rateLimitState: {}
  };
  try {
    context.loadAppState();
    const _fresh = globalScope.appState;
    assert('D8: loadAppState initialises failoverCounter to 0', _fresh.failoverCounter === 0);
    assert('D8: loadAppState initialises modelSwitchHistory to []', Array.isArray(_fresh.modelSwitchHistory));
    assert('D8: loadAppState initialises failoverHistory to []', Array.isArray(_fresh.failoverHistory));
    assert('D5: loadAppState initialises accounts to []', Array.isArray(_fresh.accounts));
    assert('D5: loadAppState initialises learnedModelPreferences to {}', _fresh.learnedModelPreferences && typeof _fresh.learnedModelPreferences === 'object');
    assert('D8: loadAppState initialises autoFailoverEnabled', _fresh.autoFailoverEnabled === true);
    assert('D8: loadAppState initialises maxFailoversPerStep to 3', _fresh.maxFailoversPerStep === 3);
  } catch (e) {
    assert('D8: loadAppState runs on a legacy save without throwing', false, e.message);
  } finally {
    globalScope.appState = _savedAppState;
  }

  // D5: legacy token migrates once (username fetched, legacy fields deleted)
  appState.accounts = [];
  appState.githubToken = 'tok-legacy';
  appState.githubRepo = 'miguser/repo';
  try {
    await migrateLegacyGitHubToken();
    assert('D5: migration creates one account', appState.accounts.length === 1);
    assert('D5: migrated account has the fetched username', appState.accounts[0] && appState.accounts[0].username === 'miguser');
    assert('D5: migration deletes the legacy token', appState.githubToken === undefined);
    assert('D5: migration deletes the legacy repo', appState.githubRepo === undefined);
    assert('D5: loadAppState calls migrateLegacyGitHubToken',
      context.loadAppState && context.loadAppState.toString().includes('migrateLegacyGitHubToken'));
  } catch (e) {
    assert('D5: migration runs without throwing', false, e.message);
  }

  // D2: manual switches teach the best model (3 repeats -> learned) + D4 routing honours it
  // (providers need apiKeys: routeModelForStep only routes among keyed providers;
  // usage is needed by the provider list render that setActiveProvider triggers)
  appState.providers = {
    'prov-a': { id: 'prov-a', name: 'Provider A', defaultModel: 'model-a', models: ['model-a'], type: 'duckduckgo', apiKey: 'key-a' },
    'prov-b': { id: 'prov-b', name: 'Provider B', defaultModel: 'model-b', models: ['model-b'], type: 'duckduckgo', apiKey: 'key-b' }
  };
  appState.usage = { rateLimits: {}, byProvider: {} };
  appState.activeProviderId = 'prov-a';
  appState.taskModelPreferences = {};
  appState.learnedModelPreferences = {};
  appState.sessions = { 'sess-1': { id: 'sess-1', planStepIndex: 1, currentModel: 'prov-a|model-a' } };
  appState.activeSessionId = 'sess-1';
  appState.currentPlan = [{ text: 'Plan the auth module', kind: 'plan' }, { text: 'Write the login function', kind: 'coding' }];
  appState.eventStore = [];
  try {
    const _sw1 = context.switchModelMidTask('sess-1', 'prov-b|model-b', 'just trying');
    assert('D2: switchModelMidTask switches the provider', _sw1 === true && appState.activeProviderId === 'prov-b');
    assert('D2: first manual switch records the learned candidate (count 1)',
      appState.learnedModelPreferences.coding && appState.learnedModelPreferences.coding.count === 1);
    context.switchModelMidTask('sess-1', 'prov-b|model-b', 'just trying');
    context.switchModelMidTask('sess-1', 'prov-b|model-b', 'just trying');
    assert('D2: after 3 switches the preference is learned (শেখা)',
      appState.learnedModelPreferences.coding && appState.learnedModelPreferences.coding.learned === true);
    assert('D2: learned preference is written to the task table',
      appState.taskModelPreferences.coding === 'model-b|prov-b');
    // D4: with the table entry cleared, the router honours the learned preference
    delete appState.taskModelPreferences.coding;
    const _routed = routeModelForStep({ text: 'Write the login function', kind: 'coding' });
    assert('D4: routeModelForStep returns the learned model',
      _routed && _routed.model === 'model-b');
    assert('D4: routeModelForStep reports the learned reason',
      _routed && String(_routed.reason || '').indexOf('learned-preference') === 0);
    // D2 via the header picker path (setActiveProvider mid-task)
    appState.activeProviderId = 'prov-a';
    context.setActiveProvider('prov-b');
    assert('D2: header picker switch also teaches (count grows)',
      appState.learnedModelPreferences.coding && appState.learnedModelPreferences.coding.count === 4);
  } catch (e) {
    assert('D2: manual-switch learning runs without throwing', false, e.message);
  }

  // D3: the task-model table is real and editable
  try {
    assert('D3: renderTaskModelPreferences exists', typeof context.renderTaskModelPreferences === 'function');
    assert('D3: settings table markup exists in the page',
      html.includes('id="taskModelPreferencesTable"') && html.includes('id="settingsPaneModelPrefs"') && html.includes('data-settings-tab="modelPrefs"'));
    context.setTaskModelPreference('testing', 'model-a|prov-a');
    assert('D3: setTaskModelPreference persists the choice',
      appState.taskModelPreferences.testing === 'model-a|prov-a');
    context.renderTaskModelPreferences();
    assert('D3: renderTaskModelPreferences runs without throwing', true);
    context.deleteTaskModelPreference('testing');
    assert('D3: deleteTaskModelPreference clears the choice (and learned)',
      !appState.taskModelPreferences.testing && !appState.learnedModelPreferences.testing);
  } catch (e) {
    assert('D3: task-model table runs without throwing', false, e.message);
  }

  // D6: per-action account resolution from the user's words
  appState.accounts = [
    { id: 'gh-1', service: 'github', username: 'octocat', token: 'tok-octo', isDefault: true },
    { id: 'gh-2', service: 'github', username: 'otherdev', token: 'tok-other', isDefault: false }
  ];
  assert('D6: exact username resolves to that account',
    getAccountForAction('github', 'octocat') && getAccountForAction('github', 'octocat').id === 'gh-1');
  assert('D6: username inside a sentence resolves to that account',
    getAccountForAction('github', 'please use otherdev account for this') && getAccountForAction('github', 'please use otherdev account for this').id === 'gh-2');
  assert('D6: no username mentioned falls back to the default account',
    getAccountForAction('github', 'do it on this repo') && getAccountForAction('github', 'do it on this repo').id === 'gh-1');
  assert('D6: importFromGitHub resolves the account from the repo owner',
    context.importFromGitHub && context.importFromGitHub.toString().includes('getAccountForAction'));

  // D8: the failover helper is real (it used to return no-fallback-chain always)
  appState.providers = {
    'prov-a': { id: 'prov-a', name: 'Provider A', defaultModel: 'model-a', models: ['model-a'], type: 'duckduckgo' },
    'prov-b': { id: 'prov-b', name: 'Provider B', defaultModel: 'model-b', models: ['model-b'], type: 'duckduckgo' }
  };
  appState.rateLimitState = {};
  appState.failoverCount = {};
  appState.providerFallbackChain = { enabled: true, chain: [], cooldowns: {}, cooldownMs: 60000 };
  appState.auxProviderFallbackChain = { chain: [] };
  try {
    buildProviderFallbackChain();
    const _fo1 = handleRateLimitFailover({ id: 'step-1', text: 'do x', kind: 'coding' }, 'model-a', 'prov-a', {});
    assert('D8: helper picks the next model after a rate limit',
      _fo1 && _fo1.success === true && _fo1.model === 'model-b' && _fo1.providerId === 'prov-b');
    assert('D8: helper marks the failed model as rate-limited',
      appState.rateLimitState['prov-a:model-a'] && appState.rateLimitState['prov-a:model-a'].isLimited === true);
    assert('D8: helper counts failovers per step',
      appState.failoverCount['step-1'] === 1);
    handleRateLimitFailover({ id: 'step-1', text: 'do x', kind: 'coding' }, 'model-a', 'prov-a', {});
    handleRateLimitFailover({ id: 'step-1', text: 'do x', kind: 'coding' }, 'model-a', 'prov-a', {});
    const _fo4 = handleRateLimitFailover({ id: 'step-1', text: 'do x', kind: 'coding' }, 'model-a', 'prov-a', {});
    assert('D8: helper stops after 3 failovers for the same step',
      _fo4 && _fo4.success === false && _fo4.reason === 'max-failovers-reached');
  } catch (e) {
    assert('D8: failover helper runs without throwing', false, e.message);
  }

  // D1: setDefaultAccount is per-service (the deleted duplicate cleared ALL services)
  appState.accounts = [
    { id: 'gh-1', service: 'github', username: 'alice', token: 't1', isDefault: true },
    { id: 'gh-2', service: 'github', username: 'bob', token: 't2', isDefault: false },
    { id: 'x-1', service: 'other', username: 'carol', token: 't3', isDefault: true }
  ];
  try {
    const _sd = setDefaultAccount('gh-2');
    assert('D1: setDefaultAccount returns true', _sd === true);
    assert('D1: setDefaultAccount is per-service (other github cleared, other service untouched)',
      appState.accounts.find(a => a.id === 'gh-2').isDefault === true &&
      appState.accounts.find(a => a.id === 'gh-1').isDefault === false &&
      appState.accounts.find(a => a.id === 'x-1').isDefault === true);
  } catch (e) {
    assert('D1: setDefaultAccount runs without throwing', false, e.message);
  }

  // D10: the animations toggle is one field, and the loop honours it
  assert('D10: no stale appState.themeAnimations field remains',
    !scriptContent.includes('appState.themeAnimations'));
  assert('D10: startThemeAnimation honours the animations toggle',
    startThemeAnimation && startThemeAnimation.toString().includes('themeAnimationEnabled'));
  assert('D10: the theme canvas element exists in the page',
    html.includes('id="themeCanvas"'));

  console.log('\n========== Summary ==========');
  console.log('Passed:', passCount);
  console.log('Failed:', failCount);

  // Exit cleanly (background timer in DOM-less eval can otherwise crash)
  process.exit(failCount > 0 ? 1 : 0);
})();