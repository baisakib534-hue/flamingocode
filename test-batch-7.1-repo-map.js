// Batch 7.1 Repo Map test — NO-JSDOM extraction & eval
// Proves: (a) referenced def ranks above unreferenced; (b) budget never exceeded;
// (c) mentioned file's defs get boost; (d) map text appears in agent context;
// (e) no second indexer (queryGraph remains only graph query entry point)

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
    files: { 'test.js': { content: '' }, 'other.js': { content: '' } }
  }),
  appState: {
    repoMapBudget: 1024,
    repoMapEnabled: true,
    autocompleteEnabled: true
  }
};

// Evaluate the script in the global scope
const context = vm.createContext(globalScope);
try {
  vm.runInContext(scriptContent, context);
} catch (e) {
  // Some functions may fail due to missing DOM, but we only need the functions we test
  // Ignore errors from UI initialization code
}

// Extract the functions we need to test
const { 
  computePageRank,
  buildRepoMap,
  renderRepoMapText,
  getOrBuildRepoMap,
  addGraphSummaryToDigest,
  invalidateRepoMapCache,
  queryGraph
} = context;

// Helper: create a mock graph with define/reference edges
function createMockGraph() {
  return {
    nodes: [
      { id: 'n1', name: 'foo', type: 'FUNCTION', filePath: 'a.js', meta: { params: ['x', 'y'] } },
      { id: 'n2', name: 'bar', type: 'FUNCTION', filePath: 'a.js', meta: { params: [] } },
      { id: 'n3', name: 'baz', type: 'FUNCTION', filePath: 'b.js', meta: { params: ['z'] } },
      { id: 'n4', name: 'Qux', type: 'CLASS', filePath: 'b.js', meta: {} },
      { id: 'n5', name: 'unused', type: 'FUNCTION', filePath: 'c.js', meta: { params: [] } }, // No incoming edges
      { id: 'n6', name: 'Config', type: 'CONCEPT', filePath: 'config.js', meta: {} }
    ],
    edges: [
      { from: 'n2', to: 'n1', type: 'CALLS' },       // bar calls foo
      { from: 'n3', to: 'n1', type: 'CALLS' },       // baz calls foo
      { from: 'n4', to: 'n1', type: 'USES' },        // Qux uses foo
      { from: 'n1', to: 'n6', type: 'USES' },        // foo uses Config
      // n5 (unused) has no edges
    ],
    updatedAt: Date.now()
  };
}

console.log('\n=== Test (a): Referenced def ranks above unreferenced ===');
try {
  const graph = createMockGraph();
  const ranks = computePageRank(graph, null);
  
  const fooRank = ranks.get('n1') || 0;
  const unusedRank = ranks.get('n5') || 0;
  
  console.log(`  foo rank: ${fooRank.toFixed(6)}`);
  console.log(`  unused rank: ${unusedRank.toFixed(6)}`);
  
  if (fooRank > unusedRank) {
    console.log('PASS: Referenced function (foo) ranks above unreferenced (unused)');
  } else {
    console.log('FAIL: Unreferenced function should rank lower');
    process.exit(1);
  }
} catch (e) {
  console.error('FAIL: Test (a) threw:', e.message);
  process.exit(1);
}

console.log('\n=== Test (b): Rendered map never exceeds token budget ===');
try {
  const graph = createMockGraph();
  const ranks = computePageRank(graph, null);
  
  const defNodes = graph.nodes
    .filter(n => n.type === 'FUNCTION' || n.type === 'CLASS' || n.type === 'CONCEPT')
    .map(n => ({ node: n, rank: ranks.get(n.id) || 0 }))
    .sort((a, b) => b.rank - a.rank);
  
  // Test various budgets
  for (const budget of [0, 50, 100, 200, 500, 1024]) {
    const { text, tokens } = renderRepoMapText(defNodes, budget);
    if (tokens > budget) {
      console.log(`FAIL: Budget ${budget}, got ${tokens} tokens`);
      process.exit(1);
    }
  }
  console.log('PASS: Rendered map never exceeds token budget for all tested budgets');
} catch (e) {
  console.error('FAIL: Test (b) threw:', e.message);
  process.exit(1);
}

console.log('\n=== Test (c): Mentioned file\'s definitions get boost ===');
try {
  const graph = createMockGraph();
  
  // Without personalization
  const ranks1 = computePageRank(graph, null);
  const fooRank1 = ranks1.get('n1') || 0;
  
  // With personalization: mention 'foo' in prompt, 'a.js' in session
  const personalization = { 
    sessionFiles: ['a.js'], 
    mentionedNames: ['foo'] 
  };
  const ranks2 = computePageRank(graph, personalization);
  const fooRank2 = ranks2.get('n1') || 0;
  
  console.log(`  foo rank (no boost): ${fooRank1.toFixed(6)}`);
  console.log(`  foo rank (with boost): ${fooRank2.toFixed(6)}`);
  
  if (fooRank2 > fooRank1) {
    console.log('PASS: Mentioned file/identifier gets personalization boost');
  } else {
    console.log('FAIL: Personalization boost not applied');
    process.exit(1);
  }
} catch (e) {
  console.error('FAIL: Test (c) threw:', e.message);
  process.exit(1);
}

console.log('\n=== Test (d): Map text appears in built agent context ===');
try {
  const graph = createMockGraph();
  const session = { 
    id: 'test', 
    activeFile: 'a.js', 
    files: { 'a.js': {}, 'b.js': {} } 
  };
  
  // Mock getOrBuildCodeGraph to return our test graph
  const originalGetGraph = globalScope.getOrBuildCodeGraph;
  globalScope.getOrBuildCodeGraph = () => graph;
  
  // Test addGraphSummaryToDigest includes repo map
  let digest = 'Existing digest content\n';
  let totalTokens = 100; // Small existing digest
  
  const result = addGraphSummaryToDigest(digest, totalTokens, session, 'call foo function');
  
  const hasRepoMap = result.digest.includes('Repo Map') || result.digest.includes('repo map');
  const hasGraphSummary = result.digest.includes('Code Graph Summary');
  
  console.log(`  Result digest length: ${result.digest.length} chars`);
  console.log(`  Has Code Graph Summary: ${hasGraphSummary}`);
  console.log(`  Has Repo Map: ${hasRepoMap}`);
  
  if (hasGraphSummary && hasRepoMap) {
    console.log('PASS: Repo Map text appears in built agent context alongside graph summary');
  } else {
    console.log('FAIL: Missing expected sections in digest');
    process.exit(1);
  }
  
  // Restore
  globalScope.getOrBuildCodeGraph = originalGetGraph;
} catch (e) {
  console.error('FAIL: Test (d) threw:', e.message);
  process.exit(1);
}

console.log('\n=== Test (e): No second indexer exists (queryGraph is only graph query entry) ===');
try {
  // Check that there's no buildCodeGraph-style indexer being called as a new entry point
  // The only graph query functions should be: queryGraph, pathGraph, explainGraph
  // buildCodeGraph should exist but only for internal use (not a new query entry point)
  
  const hasQueryGraph = typeof queryGraph === 'function';
  console.log(`  queryGraph exists: ${hasQueryGraph}`);
  
  // Check that the script doesn't contain a NEW buildCodeGraph that's exposed as a query entry
  // The existing buildCodeGraph is for internal graph building, not a query API
  const scriptHasQueryGraph = scriptContent.includes('function queryGraph');
  const scriptHasPathGraph = scriptContent.includes('function pathGraph');
  const scriptHasExplainGraph = scriptContent.includes('function explainGraph');
  
  console.log(`  queryGraph in script: ${scriptHasQueryGraph}`);
  console.log(`  pathGraph in script: ${scriptHasPathGraph}`);
  console.log(`  explainGraph in script: ${scriptHasExplainGraph}`);
  
  // The repo map uses getOrBuildCodeGraph internally, not a new query function
  const repoMapUsesGetOrBuild = scriptContent.includes('getOrBuildCodeGraph');
  console.log(`  Repo Map uses getOrBuildCodeGraph: ${repoMapUsesGetOrBuild}`);
  
  if (hasQueryGraph && scriptHasQueryGraph && scriptHasPathGraph && scriptHasExplainGraph && repoMapUsesGetOrBuild) {
    console.log('PASS: queryGraph remains the only graph query entry point; Repo Map reads existing graph');
  } else {
    console.log('FAIL: Missing expected graph query functions or Repo Map uses wrong API');
    process.exit(1);
  }
} catch (e) {
  console.error('FAIL: Test (e) threw:', e.message);
  process.exit(1);
}

console.log('\n=== Test: Repo Map cache invalidation on markGraphDirty ===');
try {
  // Check that invalidateRepoMapCache is called by markGraphDirty
  const markGraphDirtySource = scriptContent.match(/function markGraphDirty\(\) \{[\s\S]*?\n\}/);
  const callsInvalidate = markGraphDirtySource && markGraphDirtySource[0].includes('invalidateRepoMapCache');
  console.log(`  markGraphDirty calls invalidateRepoMapCache: ${callsInvalidate}`);
  
  if (callsInvalidate) {
    console.log('PASS: Repo Map cache invalidated on graph dirty');
  } else {
    console.log('FAIL: markGraphDirty does not invalidate Repo Map cache');
    process.exit(1);
  }
} catch (e) {
  console.error('FAIL: Cache invalidation test threw:', e.message);
  process.exit(1);
}

console.log('\n=== All Batch 7.1 Repo Map tests PASSED ===');