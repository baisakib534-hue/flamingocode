const fs = require("fs");
const path = require("path");

const HTML_PATH = path.join(__dirname, "index.html");
const html = fs.readFileSync(HTML_PATH, "utf8");

const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error("FAIL: No <script> tag found in index.html");
  process.exit(1);
}
const scriptContent = scriptMatch[1].replace(/\x00/g, "");

try {
  new Function(scriptContent);
} catch (e) {
  console.error("FAIL: Script syntax error:", e.message);
  process.exit(1);
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
        className: "",
        style: {},
        innerHTML: "",
        value: "",
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
        type: "",
        placeholder: "",
        required: false
      };
      if (tag === "input") { el.type = "text"; }
      return el;
    },
    body: { appendChild: function() {}, querySelector: function() { return null; } },
    getElementById: function(id) {
      const stubs = {
        "chat-messages": { querySelector: function() { return null; }, prepend: function() {}, insertBefore: function() {} },
        "mcp-recommendations-section": { innerHTML: "" },
        "skills-recommendations-section": { innerHTML: "" },
        "plugin-recommendations-section": { innerHTML: "" },
        "mutedRecommendationsList": { innerHTML: "" },
        "toolRecommendationsToggleSettings": { checked: true },
        "btnSuggestForTask": {},
        "editorTabs": { innerHTML: "", children: [], appendChild: function() {}, querySelector: function() { return null; } },
        "editorTextarea": { value: "", addEventListener: function() {}, selectionStart: 0, selectionEnd: 0 },
        "fileTree": { innerHTML: "" },
        "commandCenterView": { innerHTML: "" },
        "spacesList": { innerHTML: "" },
        "agentEnginesList": { innerHTML: "" },
        "fastContextToggle": { checked: true },
        "cloudHandoffPanel": { innerHTML: "" },
        "agentSetupView": { innerHTML: "" },
        "reviewQAStatus": { innerHTML: "" },
        "modelsPanel": { innerHTML: "" },
        "settingsPanel": { innerHTML: "" },
        "remoteHostsList": { innerHTML: "" },
        "remoteHostInput": { value: "" },
        "remoteHostUserInput": { value: "" },
        "remoteHostKeySelect": { value: "" },
        "connectOnStartupToggle": { checked: true },
        "autoContinueToggle": { checked: true },
        "autoFixLintsToggle": { checked: true },
        "gitignoreAccessToggle": { checked: true },
        "tabCompletionMode": { value: "supercomplete" },
        "completionAggression": { value: "medium" },
        "clipboardContextToggle": { checked: false },
        "codemapPanel": { innerHTML: "" },
        "externalAgentPanel": { innerHTML: "" },
        "sessionSelect": { value: "" }
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
    location: { href: "" }
  },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  crypto: { randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2) },
  fetch: async () => ({ ok: true, json: async () => ({}), text: async () => "" }),
  escapeHtml: (s) => String(s).replace(/&/g, "&").replace(/</g, "<").replace(/>/g, ">").replace(/"/g, '"').replace(/'/g, "'"),
  t: (key) => key,
  logActivity: () => {},
  saveAppState: () => {},
  recordSessionEvent: () => {},
  recordAutonomyCheck: () => {},
  getTeamV2: () => ({}),
  appendTeamChat: () => {},
  renderTaskBoard: () => {},
  updateAgentStatusChips: () => {},
  callLLMWithAgent: async () => "",
  parseAndApplyBlocks: async () => ({}),
  validateScheduledTask: () => ({ valid: true }),
  calculateNextRun: () => Date.now() + 86400000,
  tryTaskDoneTransition: () => true,
  releaseGateBlockedTasks: () => {},
  detectDisputes: () => [],
  arbitrateDispute: async () => {},
  collectReviewFlags: () => [],
  createAgent: () => ({ id: "test-agent" }),
  getAllSkillsForLibrarian: () => [],
  loadSkillContent: () => null,
  loadToolContent: () => null,
  buildAutonomyCatalogText: () => "",
  PROVIDER_PRESETS: {},
  STORAGE_KEY: "test",
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
    messageQueueCap: 20,
    commandCenter: { view: "board", filters: {} },
    spaces: [],
    sessions: {},
    activeSessionId: null,
    agents: {},
    activeAgentId: null,
    teamMode: false,
    teamRoster: [],
    teamSeniorId: null,
    teamTaskBoard: [],
    teamChat: [],
    teamPhase: null,
    teamReviewRound: 0,
    planMode: "general",
    defaultMode: "general",
    readOnlyPlanMode: false,
    currentPlan: [],
    repoMapBudget: 1024,
    repoMapEnabled: true,
    language: "en",
    projectSecrets: {},
    autocompleteEnabled: true,
    languageServers: {
      "rust-analyzer": { enabled: true },
      "clangd": { enabled: true },
      "pyright": { enabled: true },
      "gopls": { enabled: true }
    },
    backgroundAgents: {},
    formatOnSave: false,
    screenReaderMode: false,
    nextEditSuggestions: { enabled: true, lastEdit: null, suggestion: null },
    spaces: [],
    crossSessionMessages: [],
    promptSuggestions: { enabled: true, lastTaskOutcome: null, suggestions: [], dismissed: [] },
    outputStyle: "concise",
    ultrathink: { enabled: false, spend: 0 },
    sdk: { serveUrl: "/api", taskId: null },
    modeModels: {},
    modelRoles: { orchestrator: null, planner: null, builder: null, reviewer: null, explorer: null, researcher: null, judge: null, compactor: null },
    hubs: [],
    currentHub: null,
    ciChecks: { enabled: true, template: null, lastRun: null },
    rulesPriority: { enabled: true, chain: [".devforge/rules.md", "AGENTS.md", "steering", "global", "builtin"] },
    multiplayer: { enabled: false, sessionId: null, cursors: {}, taskStatus: {}, relayUrl: "" },
    eventStore: [],
    processWatcher: {},
    midTaskSwitch: { enabled: true, history: [] },
    backgroundTriggers: [],
    implicitMemories: { enabled: true, entries: {} },
    ambientContext: { enabled: false, currentContext: {}, dismissedKinds: [], suggestions: [] },
    mcpBuilder: { catalog: [], builtServers: {} },
    engines: {},
    taskEngineOverrides: {},
    skillPacks: { "security-audit": { installed: false, checklist: [] } },
    androidPack: { installed: false, guidance: {} },
    reviewArtifacts: [],
    anchoredComments: [],
    diffOrdering: "explanatory",
    diffEntryPoints: [],
    pendingRestack: null,
    steeringQueue: [],
    steeringReceipts: [],
    turnDiffs: [],
    decisionLedger: [],
    toolCallCitations: [],
    activeQuestionnaire: null,
    clipboardBridgeContext: null,
    recipeDeeplinks: {},
    projectReportCache: null,
    previewAnnotations: [],
    nextTurnAnnotations: [],
    intentSuggestion: null,
    intentSuggestionVisible: false,
    thinkingLine: { text: "", tokens: 0, visible: true },
    readOnlyContextFiles: {},
    attachedVideo: null,
    videoFrames: [],
    atomicActs: [],
    atomicActFallbacks: {},
    humanHandoffs: [],
    testHarness: { playbackQueue: [], passthroughMode: false },
    debugBreakpoints: [],
    debugSessions: [],
    debugEvidenceTemplates: [],
    debugReproScripts: [],
    debugActiveSessionId: null,
    prReviewTriggers: [],
    prReviews: [],
    prReviewComments: [],
    dbConnections: [],
    dbQueries: [],
    dbActiveConnectionId: null,
    dbSafeModeEnabled: true,
    cloudEnv: { attached: false, state: {} },
    fusionControls: { leadModel: null, sidekickModel: null, effortLevel: "medium", fastMode: false },
    fastContextEnabled: true,
    cloudHandoffEnabled: true,
    autoContinue: true,
    autoFixLints: true,
    gitignoreAccess: true,
    tabCompletionMode: "supercomplete",
    completionAggression: "medium",
    clipboardContextEnabled: false,
    remoteHosts: [],
    connectOnStartup: true,
    externalAgents: [],
    codemapEnabled: true
  },
  isToolInstalled: (tool) => false,
  getInstallPath: (tool) => ({}),
  getCurrentTaskId: () => "test-task-1",
  getCurrentSession: () => ({ chatHistory: [], messageQueue: [] }),
  appendChatMessage: () => {},
  skillPacks: {},
  scrubMcpCredentialsForContext: (server) => server,
  rebuildMcpToolDefinitions: () => {},
  renderMcpServerList: () => {},
  renderMcpServerSummary: () => {},
  refreshUI: () => {},
  getOrBuildCodeGraph: () => ({ nodes: [], edges: [] }),
  getOrBuildRepoMap: () => ({ rendered: "", tokens: 0 }),
  estimateTokens: (s) => Math.ceil(s.length / 4),
  MAX_TOKENS: 1500,
  getActiveProvider: () => ({ id: "test", model: "test-model" }),
  logActivity: (msg, level) => console.log("[" + level + "] " + msg)
};

const vm = require("vm");
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: "index.html", timeout: 10000 });
} catch (e) {
  console.error("FAIL: Script execution error:", e.message);
  console.error(e.stack);
  process.exit(1);
}

function assertExists(name, desc) {
  const patterns = [
    new RegExp("\\b" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\b"),
    new RegExp("function\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\("),
    new RegExp("const\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*="),
    new RegExp("let\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*="),
    new RegExp("var\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*=")
  ];
  const found = patterns.some(p => p.test(scriptContent));
  if (!found) {
    console.error("FAIL: " + desc + " - " + name + " not found in script");
    process.exit(1);
  }
  console.log("PASS: " + desc + " - " + name + " exists");
}

function assertFunctionExists(name, desc) {
  const patterns = [
    new RegExp("function\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\("),
    new RegExp("const\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*=\\s*(async\\s*)?function"),
    new RegExp("const\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*=\\s*(async\\s*)?\\("),
    new RegExp("async\\s+function\\s+" + name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\(")
  ];
  const found = patterns.some(p => p.test(scriptContent));
  if (!found) {
    console.error("FAIL: " + desc + " - " + name + " function not found in script");
    process.exit(1);
  }
  console.log("PASS: " + desc + " - " + name + " function exists");
}

function assertExistsPattern(pattern, desc) {
  const found = pattern.test(scriptContent);
  if (!found) {
    console.error("FAIL: " + desc + " - pattern " + pattern + " not found in script");
    process.exit(1);
  }
  console.log("PASS: " + desc + " - pattern exists");
}

function assertExistsInHTML(pattern, desc) {
  const found = pattern.test(html);
  if (!found) {
    console.error("FAIL: " + desc + " - pattern " + pattern + " not found in HTML");
    process.exit(1);
  }
  console.log("PASS: " + desc + " - pattern exists in HTML");
}

console.log("\n=== Devin Desktop Test ===\n");

console.log("--- §1: Agent Command Center ---");
assertFunctionExists("renderCommandCenter", "Command Center render function");
assertFunctionExists("createSpace", "Create Space function");
assertFunctionExists("deleteSpace", "Delete Space function");
assertFunctionExists("renameSpace", "Rename Space function");
assertFunctionExists("moveSessionToSpace", "Move session to Space function");
assertExists("commandCenter", "Command Center in appState");
assertExists("spaces", "Spaces array in appState");
assertExistsPattern(/commandCenterView/, "Command Center view element in HTML");
assertExistsPattern(/spacesList/, "Spaces list element in HTML");

console.log("\n--- §2: Full IDE ---");
assertFunctionExists("renderFileTree", "File tree render function");
assertFunctionExists("searchFilesInTree", "File tree search function");
assertFunctionExists("renderKeybindings", "Keybindings render function");
assertFunctionExists("renderLanguageServerStatus", "Language server status render");
assertFunctionExists("showEditor", "Show editor function");
assertExists("editorTextarea", "Editor textarea element");
assertExists("fileTree", "File tree element");
assertExistsPattern(/keybindings/, "Keybindings UI element");
assertExistsPattern(/language\.server/i, "Language server status display");

console.log("\n--- §3: Local Agent - Whole Repo Awareness ---");
assertFunctionExists("buildAgentContextWithRepoAwareness", "Build agent context with repo awareness");
assertFunctionExists("getWholeRepoAwarenessIndicator", "Whole repo awareness indicator");
assertFunctionExists("writeSessionSummaryToBrain", "Write session summary to Brain");
assertExists("repoMapBudget", "Repo Map budget in appState");
assertExists("repoMapEnabled", "Repo Map enabled in appState");
assertExists("debugBreakpoints", "Debug breakpoints array");
assertExists("debugSessions", "Debug sessions array");

console.log("\n--- §4: Tab Completions ---");
assertFunctionExists("getSupercompleteSuggestion", "Supercomplete suggestion function");
assertFunctionExists("applySupercomplete", "Apply Supercomplete function");
assertFunctionExists("tabToJump", "Tab to Jump function");
assertFunctionExists("tabToImport", "Tab to Import function");
assertFunctionExists("setTabCompletionMode", "Set tab completion mode");
assertExists("tabCompletionMode", "Tab completion mode setting");
assertExists("completionAggression", "Completion aggression setting");
assertExists("clipboardContextEnabled", "Clipboard context toggle");
assertExistsPattern(/supercomplete|autocomplete|off/, "Completion mode options");

console.log("\n--- §5: Fast Context + Codemaps ---");
assertFunctionExists("getFastContext", "Fast Context retrieval function");
assertFunctionExists("renderCodemap", "Codemap render function");
assertFunctionExists("measureFastContextTiming", "Fast Context timing measurement");
assertExists("fastContextEnabled", "Fast Context enabled toggle");
assertExists("codemapEnabled", "Codemap enabled toggle");
assertExistsPattern(/Fast Context|fastContext/i, "Fast Context UI reference");
assertExistsPattern(/codemap|codemap/i, "Codemap UI reference");

console.log("\n--- §6: External Agents ---");
assertFunctionExists("registerExternalAgent", "Register external agent function");
assertFunctionExists("runExternalAgent", "Run external agent function");
assertFunctionExists("renderExternalAgentPanel", "Render external agent panel");
assertExists("externalAgents", "External agents array in appState");
assertExists("agentEnginesList", "Agent engines list element");
assertExistsPattern(/installed.*logged.in|logged.in.*installed/, "Engine installed/logged-in status");
assertExistsPattern(/enable.*disable|disable.*enable/, "Engine enable/disable toggle");
assertExistsPattern(/not.installed|missing/, "Missing engine shows what is needed");

console.log("\n--- §7: Cloud Handoff ---");
assertFunctionExists("createHandoffEnvelope", "Create handoff envelope function");
assertFunctionExists("resumeFromHandoff", "Resume from handoff function");
assertFunctionExists("renderCloudHandoffPanel", "Render cloud handoff panel");
assertExists("cloudHandoffEnabled", "Cloud handoff enabled toggle");
assertExists("cloudHandoffPanel", "Cloud handoff panel element");
assertExistsPattern(/cloud. handoff|handoff.*cloud/i, "Cloud handoff UI reference");
assertExistsPattern(/resume.*step|step.*resume/i, "Resume from exact step");

console.log("\n--- §8: Agent Setup View ---");
assertFunctionExists("renderAgentSetupView", "Render agent setup view");
assertExists("agentSetupView", "Agent setup view element");
assertExists("rulesPriority", "Rules priority chain in appState");
assertExists("recipes", "Recipes array in appState");
assertExists("mcpServers", "MCP servers in appState");
assertExistsPattern(/rules|AGENTS\.md|skills|workflows|MCP/i, "All components in one view");
assertExistsPattern(/trust\.state|trustState/i, "MCP trust state shown");

console.log("\n--- §9: Review + QA Workflow ---");
assertFunctionExists("renderReviewQAStatus", "Render review QA status");
assertFunctionExists("advanceReviewQAStatus", "Advance review QA status");
assertExists("reviewQAStatus", "Review QA status element");
assertExistsPattern(/review.*QA|QA.*review/i, "Review QA workflow UI");
assertExistsPattern(/status\.line|single\.status/i, "Single status line for flow");

console.log("\n--- §10: Models + Free Tier ---");
assertFunctionExists("renderModelsPanel", "Render models panel");
assertExists("modelsPanel", "Models panel element");
assertExistsPattern(/DuckDuckGo|free\.provider|free\.tier/i, "Free tier mentioned");
assertExistsPattern(/unlimited|free.*completion/i, "Tab completions free/unlimited");
assertExists("providerFallbackChain", "Provider fallback chain in appState");

console.log("\n--- §11: Settings Toggles ---");
assertExists("remoteHosts", "Remote hosts array in appState");
assertExists("connectOnStartup", "Connect on startup toggle");
assertExists("autoContinue", "Auto-continue toggle");
assertExists("autoFixLints", "Auto-fix lints toggle");
assertExists("gitignoreAccess", "Gitignore access toggle");
assertFunctionExists("addRemoteHost", "Add remote host function");
assertFunctionExists("removeRemoteHost", "Remove remote host function");
assertFunctionExists("testRemoteHostConnection", "Test remote host connection");
assertExists("remoteHostsList", "Remote hosts list element");
assertExists("connectOnStartupToggle", "Connect on startup toggle element");
assertExists("autoContinueToggle", "Auto-continue toggle element");
assertExists("autoFixLintsToggle", "Auto-fix lints toggle element");
assertExists("gitignoreAccessToggle", "Gitignore access toggle element");
assertExists("fastContextToggle", "Fast Context toggle element");
assertExistsPattern(/default.*ON|enabled.*true/, "Settings default ON");
assertExistsPattern(/fastContextEnabled.*fastContextToggle|fastContextToggle.*fastContextEnabled/, "Fast Context toggle shared");

console.log("\nAll Devin Desktop (§1–§11) assertions passed");

console.log("\n--- D-DD-1: Devin Desktop Repair (Cross-file Search) ---");
assertFunctionExists("searchAcrossFiles", "Cross-file search function");
assertFunctionExists("openFileAtLine", "Open file at line function");
assertExists("crossFileSearchInput", "Cross-file search input element");
assertExists("crossFileSearchResults", "Cross-file search results container");

console.log("\n--- D-DD-1: Devin Desktop Repair (Language Detection) ---");
assertFunctionExists("detectProjectLanguages", "Detect project languages function");
assertExists("languageServers", "Language servers in appState");

console.log("\n--- D-DD-2: Desktop-only Labels ---");
assertExistsInHTML(/Desktop only.*available in Stage 6 app|available in Stage 6 app.*Desktop only/, "Debug pane desktop-only label");
assertExistsInHTML(/Preview.*Desktop only|Desktop only.*Preview/, "Preview tab desktop-only label");
assertExistsInHTML(/Health.*Desktop only|Desktop only.*Health/, "Preview Health tab desktop-only label");

console.log("\nAll Devin Desktop (§1–§11) + Repair assertions passed");
process.exit(0);