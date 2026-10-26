// Batch 7.2b Tool Recommender — NO-JSDOM extraction & eval test
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
const scriptContent = scriptMatch[1].replace(/\x00/g, '');

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
  TOOL_DEFINITIONS: {},
  // Tool Recommender specific stubs
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
    settings: {}
  },
  isToolInstalled: (tool) => false,
  getInstallPath: (tool) => ({}),
  getCurrentTaskId: () => 'test-task-1',
  getCurrentSession: () => ({ chatHistory: [] }),
  appendChatMessage: () => {},
  skillPacks: {}
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
    console.error(`FAIL: ${desc} — '${name}' not found in script`);
    process.exit(1);
  }
  console.log(`PASS: ${desc} — '${name}' exists`);
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
    console.error(`FAIL: ${desc} — '${name}' function not found in script`);
    process.exit(1);
  }
  console.log(`PASS: ${desc} — '${name}' function exists`);
}

// ===== TOOL RECOMMENDER TESTS =====

// 1. TOOL_RECOMMENDATIONS registry
assertExists('TOOL_RECOMMENDATIONS', 'Tool recommendations registry constant');
assertExists('kind', 'Registry entries have kind field');
assertExists('triggers', 'Registry entries have triggers field');
assertExists('install', 'Registry entries have install field');
assertExists('whatItDoes', 'Registry entries have whatItDoes field');

// Skill entries
assertExists('skill_no-ai-slop', 'no-ai-slop skill in registry');
assertExists('skill_senior-frontend', 'senior-frontend skill in registry');
assertExists('skill_testing-qa', 'testing-qa skill in registry');
assertExists('skill_api-design', 'api-design skill in registry');
assertExists('skill_debugging-discipline', 'debugging-discipline skill in registry');
assertExists('skill_git-workflow', 'git-workflow skill in registry');
assertExists('skill_security-review', 'security-review skill in registry');
assertExists('skill_accessibility', 'accessibility skill in registry');
assertExists('skill_performance', 'performance skill in registry');

// MCP entries
assertExists('mcp_context7', 'context7 MCP in registry');
assertExists('mcp_playwright', 'playwright MCP in registry');
assertExists('mcp_sequential-thinking', 'sequential-thinking MCP in registry');
assertExists('mcp_github', 'github MCP in registry');
assertExists('mcp_memory', 'memory MCP in registry');
assertExists('mcp_fetch', 'fetch MCP in registry');
assertExists('mcp_serena', 'serena MCP in registry');
assertExists('mcp_sverklo', 'sverklo MCP in registry');

// Plugin entries
assertExists('plugin_console-error-sweep', 'console-error-sweep plugin in registry');
assertExists('plugin_auto-test-after-build', 'auto-test-after-build plugin in registry');
assertExists('plugin_changelog-writer', 'changelog-writer plugin in registry');
assertExists('plugin_format-tidy', 'format-tidy plugin in registry');
assertExists('plugin_no-ai-slop', 'no-ai-slop plugin in registry');
assertExists('plugin_senior-frontend', 'senior-frontend plugin in registry');

// 2. Matcher function
assertFunctionExists('recommendToolsForTask', 'recommendToolsForTask matcher function');
assertFunctionExists('scoreToolForPrompt', 'scoreToolForPrompt scoring function');
assertFunctionExists('isToolInstalled', 'isToolInstalled check function');
assertFunctionExists('isToolMuted', 'isToolMuted check function');
assertFunctionExists('getInstallPath', 'getInstallPath function');
assertFunctionExists('getAccumulatedRecommendations', 'getAccumulatedRecommendations function');
assertFunctionExists('recordToolInstalledForTask', 'recordToolInstalledForTask learning function');

// 3. UI rendering functions
assertFunctionExists('renderRecommendationCard', 'renderRecommendationCard function');
assertFunctionExists('renderRecommendationSections', 'renderRecommendationSections function');
assertFunctionExists('renderRecommendationSection', 'renderRecommendationSection function');
assertFunctionExists('renderMutedRecommendationsList', 'renderMutedRecommendationsList function');

// 4. Event handlers
assertFunctionExists('handleRecommendationInstall', 'handleRecommendationInstall function');
assertFunctionExists('handleRecommendationDismiss', 'handleRecommendationDismiss function');
assertFunctionExists('handleRecommendationMute', 'handleRecommendationMute function');
assertFunctionExists('muteTool', 'muteTool function');
assertFunctionExists('unmuteTool', 'unmuteTool function');
assertFunctionExists('installRecommendedTool', 'installRecommendedTool function');
assertFunctionExists('attachPageRecommendationListeners', 'attachPageRecommendationListeners function');

// 5. UI elements in HTML
assertExists('mcp-recommendations-section', 'MCP recommendations section in HTML');
assertExists('skills-recommendations-section', 'Skills recommendations section in HTML');
assertExists('plugin-recommendations-section', 'Plugin recommendations section in HTML');
assertExists('mutedRecommendationsList', 'Muted recommendations list in HTML');
assertExists('toolRecommendationsToggleSettings', 'Tool recommendations toggle in HTML');
assertExists('btnSuggestForTask', 'Suggest for current task button in HTML');

// 6. Bengali/English translations (i18n keys)
assertExists('Tool Recommendations', 'Tool Recommendations translation key');
assertExists('Enable tool recommendations', 'Enable tool recommendations translation key');
assertExists('Muted Recommendations', 'Muted Recommendations translation key');
assertExists('Unmute', 'Unmute translation key');
assertExists('Recommendations', 'Recommendations translation key');
assertExists('Accumulated recommendations across tasks', 'Accumulated recommendations translation key');
assertExists('Newly installed MCPs start UNTRUSTED', 'Untrusted MCP warning translation key');
assertExists('Install', 'Install translation key');
assertExists('Dismiss', 'Dismiss translation key');
assertExists("Don't suggest again", "Don't suggest again translation key");
assertExists('Suggest for current task', 'Suggest for current task translation key');

// 7. App state fields
assertExists('toolRecommendationsEnabled', 'toolRecommendationsEnabled in appState');
assertExists('mutedRecommendations', 'mutedRecommendations in appState');
assertExists('recommendationHistory', 'recommendationHistory in appState');
assertExists('currentTaskRecommendations', 'currentTaskRecommendations in appState');

// 8. Integration points
assertExists('sendAgentPrompt', 'sendAgentPrompt function exists (integration point)');
assertExists('renderPluginCatalogTab', 'renderPluginCatalogTab function (Suggest button handler)');
assertExists('renderUncensoredBehaviorTab', 'renderUncensoredBehaviorTab function (Behavior tab)');
assertExists('setupSettingsModal', 'setupSettingsModal function (tab switching)');

// 9. Constants
assertExists('RECOMMENDATION_SCORE_THRESHOLD', 'Recommendation score threshold constant');
assertExists('MAX_RECOMMENDATIONS', 'Max recommendations constant');

// 10. Learning/score boost
assertExists('scoreBoost', 'Score boost for learning');
assertExists('task', 'Task field in recommendation history');

console.log('\n✓ All Batch 7.2b Tool Recommender assertions passed');
process.exit(0);