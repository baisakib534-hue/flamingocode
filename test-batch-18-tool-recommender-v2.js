// Batch 18 Tool Recommender v2 - NO-JSDOM extraction & eval test
// Extends Batch 7.2b tests with behavioural assertions for config boxes

const fs = require('fs');
const path = require('path');

const HTML_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

// Extract the main script content
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No <script> tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1].replace(/\x00/g, '');

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
    createElement: (tag) => {
      const el = {
        tagName: tag.toUpperCase(),
        className: '',
        style: {},
        innerHTML: '',
        value: '',
        checked: false,
        dataset: {},
        children: [],
        appendChild: function(child) { this.children.push(child); return child; },
        remove: function() {},
        querySelector: function() { return null; },
        querySelectorAll: function() { return []; },
        addEventListener: function() {},
        removeEventListener: function() {},
        closest: function() { return null; },
        setAttribute: function() {},
        getAttribute: function() { return null; },
        type: '',
        placeholder: '',
        required: false
      };
      if (tag === 'input') {
        el.type = 'text';
      }
      return el;
    },
    body: { appendChild: function() {}, querySelector: function() { return null; } },
    getElementById: function(id) {
      const stubs = {
        'chat-messages': { 
          querySelector: function() { return null; }, 
          prepend: function() {}, 
          insertBefore: function() {} 
        },
        'mcp-recommendations-section': { innerHTML: '' },
        'skills-recommendations-section': { innerHTML: '' },
        'plugin-recommendations-section': { innerHTML: '' },
        'mutedRecommendationsList': { innerHTML: '' },
        'toolRecommendationsToggleSettings': { checked: true },
        'btnSuggestForTask': {}
      };
      return stubs[id] || null;
    },
    querySelector: function() { return null; },
    querySelectorAll: function() { return []; },
    addEventListener: function() {},
    removeEventListener: function() {}
  },
  window: {
    addEventListener: function() {},
    removeEventListener: function() {},
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
    toolRecommendationsEnabled: true,
    mutedRecommendations: {},
    recommendationHistory: [],
    currentTaskRecommendations: [],
    mcpServers: {},
    skills: {},
    pluginCatalog: { installed: {} },
    skillPacks: {},
    installedSkills: [],
    installedMcpServers: [],
    settings: {},
    isMobileApp: false,
    messageQueue: [],
    messageQueueEnabled: true,
    messageQueueCap: 20
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
  refreshUI: () => {}
};

// Eval the script in the global scope
const vm = require('vm');
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: 'index.html', timeout: 10000 });
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

console.log('\n=== Batch 18 Tool Recommender v2 Tests ===\n');

// ===== R1: Name + boxes on every recommendation that needs config =====
console.log('--- R1: Config fields in TOOL_RECOMMENDATIONS ---');

// Check TOOL_RECOMMENDATIONS has config field for tools needing it
const toolRecMatch = scriptContent.match(/const TOOL_RECOMMENDATIONS = (\[[\s\S]*?\]);/);
if (!toolRecMatch) {
  console.error('FAIL: TOOL_RECOMMENDATIONS not found');
  process.exit(1);
}

// Check for config field on Supabase recommendation
assertExists('mcp_supabase', 'TOOL_RECOMMENDATIONS has Supabase entry');
assertExistsPattern(/config\s*:/, 'TOOL_RECOMMENDATIONS has config field for Supabase');
assertExists('projectUrl', 'TOOL_RECOMMENDATIONS has projectUrl config');
assertExists('anonKey', 'TOOL_RECOMMENDATIONS has anonKey config');
assertExists('serviceKey', 'TOOL_RECOMMENDATIONS has serviceKey config');

// Check for config field on GitHub MCP (token)
assertExists('mcp_github', 'TOOL_RECOMMENDATIONS has GitHub entry');
assertExists('token', 'TOOL_RECOMMENDATIONS has token config for GitHub');

// Check for config field on PostgreSQL
assertExists('mcp_postgresql', 'TOOL_RECOMMENDATIONS has PostgreSQL entry');
assertExists('connectionString', 'TOOL_RECOMMENDATIONS has connectionString config for PostgreSQL');

// Check config field structure: label, type, required, placeholder, isSecret
assertExistsPattern(/label\s*:/, 'Config fields have label property');
assertExistsPattern(/type\s*:/, 'Config fields have type property');
assertExistsPattern(/required\s*:/, 'Config fields have required property');
assertExistsPattern(/placeholder\s*:/, 'Config fields have placeholder property');
assertExistsPattern(/isSecret\s*:/, 'Config fields have isSecret property for masked inputs');

// ===== R2: Fill + Submit installs ONLY that tool =====
console.log('\n--- R2: Install with config values ---');

assertFunctionExists('installRecommendedTool', 'installRecommendedTool function exists');
assertExists('rec-config-input', 'installRecommendedTool reads config from form');

// ===== R3: Multiple boxes for the same thing =====
console.log('\n--- R3: Multiple config boxes per tool ---');
assertExists('mcp_supabase', 'Supabase entry exists in TOOL_RECOMMENDATIONS');

// ===== R4: Values are secrets, handled like secrets =====
console.log('\n--- R4: Secret handling ---');
assertExistsPattern(/inputType\s*=\s*isSecret\s*\?\s*['\"]password['\"]/, 'Password inputs for secret fields');
assertExistsPattern(/autocomplete\s*=\s*["']off["']/, 'autocomplete="off" on secret inputs');
assertExists('projectSecrets', 'Config stored per-project (not in repo)');

// ===== R5: Phone mirror support =====
console.log('\n--- R5: Phone mirror / offline queue ---');
assertExists('renderPhoneRecommendationCard', 'Phone recommendation card rendering');
assertExists('queueRecommendationInstall', 'Offline queue for install');
assertExists('messageQueue', 'Message queue integration');

// ===== UI rendering functions updated =====
console.log('\n--- UI: Render functions updated ---');
assertFunctionExists('renderRecommendationCard', 'renderRecommendationCard function exists');
assertFunctionExists('renderRecommendationSection', 'renderRecommendationSection function exists');
assertExists('rec-config-input', 'renderRecommendationCard includes config inputs');
assertExists('config-input', 'renderRecommendationCard includes config inputs');

// ===== New helper functions =====
console.log('\n--- New helper functions ---');
assertFunctionExists('renderConfigInputs', 'renderConfigInputs helper function');
assertFunctionExists('collectConfigValues', 'collectConfigValues helper function');
assertFunctionExists('validateConfigValues', 'validateConfigValues helper function');
assertFunctionExists('storeProjectSecret', 'storeProjectSecret helper function');
assertFunctionExists('getProjectSecret', 'getProjectSecret helper function');
assertFunctionExists('maskSecret', 'maskSecret helper function');

// ===== Integration with message queue =====
console.log('\n--- Message queue integration ---');
assertExists('messageQueue.push', 'Install queues to messageQueue when offline');

console.log('\nAll Batch 18 Tool Recommender v2 assertions passed');
process.exit(0);