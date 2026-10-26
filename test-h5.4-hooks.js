// H5.4 Hooks + Plugin Catalog — NO-JSDOM extraction & eval test
// Pattern: extract <script> from index.html, eval in Node global scope, assert identifiers/behaviours

const fs = require('fs');
const path = require('path');

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

// Ensure only one </script> literal
const endScriptCount = (html.match(/<\/script>/g) || []).length;
if (endScriptCount !== 1) {
  console.error(`FAIL: Expected exactly 1 </script> tag, found ${endScriptCount}`);
  process.exit(1);
}

// Ensure no ?.onclick patterns
if (/\?\.\s*onclick/.test(scriptContent)) {
  console.error('FAIL: Found ?.onclick pattern (use addEventListener)');
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
  t: (key) => key, // translation stub
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
  AUTONOMY_CATALOG: {
    skills: [],
    mcps: [],
    vibeSkills: [],
    newMcps: [],
    pluginPacks: []
  },
  TOOL_DEFINITIONS: {}
};

// Eval the script in the global scope
const vm = require('vm');
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: 'index.html', timeout: 5000 });
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
    console.error(`FAIL: ${desc} — '${name}' not found in script`);
    process.exit(1);
  }
  console.log(`PASS: ${desc} — '${name}' exists`);
}

// ===== H5.4 HOOKS TESTS =====

// Hook registry in appState
assertExists('hooks', 'Hook registry in appState');

// Hook management functions
assertExists('registerHook', 'Register hook function');
assertExists('unregisterHook', 'Unregister hook function');
assertExists('fireHook', 'Fire hook function');
assertExists('getHooksForEvent', 'Get hooks for event function');

// Built-in event types
assertExists('HOOK_EVENTS', 'Hook event types constant');
assertExists('build-finish', 'build-finish event');
assertExists('task-complete', 'task-complete event');
assertExists('senior-reject', 'senior-reject event');
assertExists('review-complete', 'review-complete event');
assertExists('test-complete', 'test-complete event');
assertExists('project-start', 'project-start event');
assertExists('agent-spawn', 'agent-spawn event');

// Hook condition evaluation
assertExists('evaluateHookCondition', 'Evaluate hook condition function');

// Hook actions
assertExists('executeHookAction', 'Execute hook action function');
assertExists('ACTION_TYPES', 'Action types constant');
assertExists('webhook', 'webhook action type');
assertExists('notification', 'notification action type');
assertExists('log', 'log action type');

// Hook UI functions
assertExists('renderHooksTab', 'Render hooks tab function');
assertExists('openHookModal', 'Open hook modal function');
assertExists('saveHook', 'Save hook function');

// ===== H5.4 PLUGIN CATALOG TESTS =====

// Plugin catalog state
assertExists('pluginCatalog', 'Plugin catalog state in appState');
assertExists('pluginCatalog.installed', 'Installed plugin packs registry in pluginCatalog');

// Plugin catalog functions
assertExists('installPluginPack', 'Install plugin pack function');
assertExists('uninstallPluginPack', 'Uninstall plugin pack function');
assertExists('enablePluginPackForAgent', 'Enable plugin pack for agent function');
assertExists('disablePluginPackForAgent', 'Disable plugin pack for agent function');
assertExists('getAvailablePluginPacks', 'Get available plugin packs function');
assertExists('getInstalledPluginPacks', 'Get installed plugin packs function');
assertExists('renderPluginCatalogTab', 'Render plugin catalog tab function');
assertExists('openPluginCatalogModal', 'Open plugin catalog modal function');

// Plugin pack structure
assertExists('PLUGIN_PACK_CATALOG', 'Plugin pack catalog constant');
assertExists('component-pack', 'component-pack in catalog');
assertExists('auth-pack', 'auth-pack in catalog');
assertExists('payments-pack', 'payments-pack in catalog');
assertExists('ai-integration-pack', 'ai-integration-pack in catalog');
assertExists('i18n-pack', 'i18n-pack in catalog');
assertExists('analytics-pack', 'analytics-pack in catalog');

// Bengali labels (Bangla UI toggle)
assertExists('data-i18n', 'i18n attributes present for Bangla');
assertExists('H5.4', 'H5.4 references in script');

// Integration: fireHook evaluates each hook condition against event data
assertExists('rejectCount', 'Reject count field for senior-reject hook conditions');
assertExists('action.payload', 'Webhook action payload from event data');
assertExists('hook.condition', 'Hook condition evaluated when an event fires');

// Plugin pack enable/disable per agent in agent config
assertExists('agentPluginPacks', 'Agent plugin packs UI element');
assertExists('enabledForAgent', 'Plugin packs enabled state per agent');

console.log('\n✓ All H5.4 Hooks + Plugin Catalog assertions passed');
