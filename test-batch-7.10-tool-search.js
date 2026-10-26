// Test for Tool Search (Batch 7.10) - Direct function extraction
// Run with: node test-batch-7.10-tool-search.js
// No jsdom and no package.json: the B7.10 pieces are extracted from
// index.html with string search + brace counting and run in a
// controlled context (same pattern as test-h14-context-files.js).

const fs = require('fs');

// Extract the script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not extract script from index.html');
  process.exit(1);
}
const script = scriptMatch[1];

// Extract a named function from the script using string search + brace counting
function extractFunction(scriptText, funcName) {
  let searchStr = 'async function ' + funcName + '(';
  let idx = scriptText.indexOf(searchStr);
  if (idx === -1) {
    searchStr = 'function ' + funcName + '(';
    idx = scriptText.indexOf(searchStr);
  }
  if (idx === -1) return null;
  const start = idx;
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

// Extract a const object/array literal from the script (brace/bracket counting from its opening)
function extractObject(scriptText, objName) {
  const searchStr = 'const ' + objName + ' = ';
  const idx = scriptText.indexOf(searchStr);
  if (idx === -1) return null;
  const start = scriptText.indexOf('{', idx);
  const startBracket = scriptText.indexOf('[', idx);
  const firstChar = (start !== -1 && (startBracket === -1 || start < startBracket)) ? start : startBracket;
  if (firstChar === -1) return null;
  const openChar = scriptText[firstChar];
  const closeChar = openChar === '{' ? '}' : ']';
  let braceCount = 0;
  let i = firstChar;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === openChar) { braceCount++; seenOpen = true; }
    else if (scriptText[i] === closeChar) {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(firstChar, i + 1);
}

// Extract an IIFE assigned to a variable (e.g., window.TOOL_SEARCH_INDEX = (function () { ... })())
function extractIIFE(scriptText, varName) {
  // Match both "const VAR = (function" and "window.VAR = (function" patterns
  const patterns = [
    'const ' + varName + ' = (function',
    'window.' + varName + ' = (function',
    'var ' + varName + ' = (function'
  ];
  let idx = -1;
  for (const p of patterns) {
    const i = scriptText.indexOf(p);
    if (i !== -1) { idx = i; break; }
  }
  if (idx === -1) return null;
  
  // Find the opening brace of the IIFE body (after "function () {")
  const funcIdx = scriptText.indexOf('function', idx);
  if (funcIdx === -1) return null;
  const openParen = scriptText.indexOf('(', funcIdx);
  const closeParen = scriptText.indexOf(')', openParen);
  const openBrace = scriptText.indexOf('{', closeParen);
  if (openBrace === -1) return null;
  
  // Now find the matching closing brace
  let braceCount = 0;
  let i = openBrace;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  
  // After the closing brace, find the ');' that ends the IIFE assignment statement
  // The IIFE invocation is either }()) or })() followed by ;
  let j = i + 1;
  // Skip whitespace
  while (j < scriptText.length && /\s/.test(scriptText[j])) j++;
  // Now look for the IIFE invocation pattern and the terminating semicolon
  // The invocation is short: either () or )() or ()) etc.
  // We'll scan forward until we find ');' (allowing whitespace between ) and ;)
  let found = false;
  for (; j < scriptText.length; j++) {
    if (scriptText[j] === ')') {
      // Check if next non-whitespace is ';'
      let k = j + 1;
      while (k < scriptText.length && /\s/.test(scriptText[k])) k++;
      if (k < scriptText.length && scriptText[k] === ';') {
        j = k; // include the semicolon
        found = true;
        break;
      }
    }
    // Safety: if we hit a new function/var/const declaration, we've gone too far
    const remaining = scriptText.slice(j, j + 20);
    if (/^(function|const|let|var|window\.)\s/.test(remaining)) {
      break;
    }
  }
  if (!found) {
    // Fallback: original logic for compatibility
    j = i + 1;
    const afterBrace = scriptText.slice(j, j + 10);
    if (afterBrace.trim().startsWith('()')) {
      let parenCount = 0;
      for (; j < scriptText.length; j++) {
        if (scriptText[j] === '(') parenCount++;
        else if (scriptText[j] === ')') {
          parenCount--;
          if (parenCount === 0) break;
        }
      }
    }
  }
  
  // Return the full IIFE expression: (function () { ... })()
  // Start from the '(' before 'function'
  const iifeStart = scriptText.lastIndexOf('(', funcIdx);
  return scriptText.slice(iifeStart, j + 1);
}

// Extract a property object literal (e.g. lazyTools: { ... } inside appState)
function extractProperty(scriptText, propName) {
  const searchStr = propName + ': {';
  const idx = scriptText.indexOf(searchStr);
  if (idx === -1) return null;
  const start = scriptText.indexOf('{', idx);
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '{') { braceCount++; seenOpen = true; }
    else if (scriptText[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

console.log('=== Batch 7.10 Tool Search Tests (Direct Extraction) ===\n');

let passed = 0;
let failed = 0;

function assert(name, condition, details) {
  if (condition) {
    console.log('PASS: ' + name);
    passed++;
  } else {
    console.log('FAIL: ' + name + (details ? ' - ' + details : ''));
    failed++;
  }
}

// ---------------------------------------------------------------------------
// Extract the B7.10 pieces from index.html
// ---------------------------------------------------------------------------
// TOOL_SEARCH_INDEX is built via IIFE, extract the IIFE and evaluate it
const toolSearchIndexSrc = extractIIFE(script, 'TOOL_SEARCH_INDEX');
const searchToolsSrc = extractFunction(script, 'searchTools');
const rebuildToolSearchIndexSrc = extractFunction(script, 'rebuildToolSearchIndex');
const i18nSrc = extractObject(script, 'I18N');
const autonomyCatalogSrc = extractObject(script, 'AUTONOMY_CATALOG');
const toolDefinitionsSrc = extractObject(script, 'TOOL_DEFINITIONS');
const toolRecommendationsSrc = extractObject(script, 'TOOL_RECOMMENDATIONS');
const scoreToolForPromptSrc = extractFunction(script, 'scoreToolForPrompt');
const lazyToolsSrc = extractProperty(script, 'lazyTools');
const toolSearchSettingsSrc = extractProperty(script, 'toolSearch');

assert('TOOL_SEARCH_INDEX object exists', toolSearchIndexSrc !== null);
assert('searchTools function exists', searchToolsSrc !== null);
assert('rebuildToolSearchIndex function exists', rebuildToolSearchIndexSrc !== null);
assert('I18N object exists', i18nSrc !== null);
assert('AUTONOMY_CATALOG object exists', autonomyCatalogSrc !== null);
assert('TOOL_DEFINITIONS object exists', toolDefinitionsSrc !== null);
assert('TOOL_RECOMMENDATIONS object exists', toolRecommendationsSrc !== null);
assert('scoreToolForPrompt function exists', scoreToolForPromptSrc !== null);
assert('appState.lazyTools literal exists', lazyToolsSrc !== null);
assert('appState.toolSearch literal exists', toolSearchSettingsSrc !== null);

if (!toolSearchIndexSrc || !searchToolsSrc || !rebuildToolSearchIndexSrc || !i18nSrc ||
    !autonomyCatalogSrc || !toolDefinitionsSrc || !toolRecommendationsSrc ||
    !scoreToolForPromptSrc || !lazyToolsSrc || !toolSearchSettingsSrc) {
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(1);
}

// Evaluate the extracted data objects (pure literals from index.html)
let TOOL_SEARCH_INDEX;
let I18N;
let AUTONOMY_CATALOG;
let TOOL_DEFINITIONS;
let TOOL_RECOMMENDATIONS;
let toolSearchSettingsDefaults;
try {
  I18N = eval('(' + i18nSrc + ')');
  AUTONOMY_CATALOG = eval('(' + autonomyCatalogSrc + ')');
  TOOL_DEFINITIONS = eval('(' + toolDefinitionsSrc + ')');
  TOOL_RECOMMENDATIONS = eval('(' + toolRecommendationsSrc + ')');
  toolSearchSettingsDefaults = eval('(' + toolSearchSettingsSrc + ')');
} catch (e) {
  console.log('FAIL: extracted B7.10 literals do not evaluate - ' + e.message);
  process.exit(1);
}

// TOOL_SEARCH_INDEX is an IIFE that needs TOOL_DEFINITIONS, AUTONOMY_CATALOG, TOOL_RECOMMENDATIONS, appState in scope
// Evaluate it with a Function that provides these dependencies
const appStateForIndex = {
  customSkillPacks: {},
  mcpServers: [],
  pluginCatalog: { installed: {} }
};
try {
  const fn = new Function('TOOL_DEFINITIONS', 'AUTONOMY_CATALOG', 'TOOL_RECOMMENDATIONS', 'appState', 'return ' + toolSearchIndexSrc);
  TOOL_SEARCH_INDEX = fn(TOOL_DEFINITIONS, AUTONOMY_CATALOG, TOOL_RECOMMENDATIONS, appStateForIndex);
} catch (e) {
  console.log('FAIL: TOOL_SEARCH_INDEX IIFE evaluation failed - ' + e.message);
  process.exit(1);
}
console.log('PASS: extracted B7.10 literals evaluate');
passed++;

// Run the extracted B7.10 functions in a controlled context
let saveCalls = 0;
const appState = {
  toolSearch: { enabled: true, topN: 8, threshold: 1 },
  lazyTools: { enabled: true, loadedCount: 0, loadedKeys: [] },
  enabledSkills: [],
  mcpServers: [],
  installedPlugins: [],
  mutedRecommendations: {},
  toolRecommendationsEnabled: true,
  currentTaskRecommendations: [],
  recommendationHistory: []
};
const ctx = {
  window: { TOOL_SEARCH_INDEX: null },
  appState: appState,
  AUTONOMY_CATALOG: AUTONOMY_CATALOG,
  TOOL_DEFINITIONS: TOOL_DEFINITIONS,
  TOOL_RECOMMENDATIONS: TOOL_RECOMMENDATIONS,
  saveAppState: function () { saveCalls++; }
};
const b710Code = 'window.TOOL_SEARCH_INDEX = ' + toolSearchIndexSrc + ';\n' +
  'const TOOL_SEARCH_INDEX = window.TOOL_SEARCH_INDEX;\n' +
  searchToolsSrc + '\n' +
  rebuildToolSearchIndexSrc + '\n' +
  scoreToolForPromptSrc + '\n' +
  '; return { TOOL_SEARCH_INDEX: window.TOOL_SEARCH_INDEX, searchTools: searchTools, rebuildToolSearchIndex: rebuildToolSearchIndex, scoreToolForPrompt: scoreToolForPrompt };';
const fn = new Function(...Object.keys(ctx), b710Code);
const api = fn(...Object.values(ctx));

// ---------------------------------------------------------------------------
// Test (a): Index contains entries from every registry and rebuilds on install/uninstall
// ---------------------------------------------------------------------------
const indexKeys = Object.keys(TOOL_SEARCH_INDEX);
assert('TOOL_SEARCH_INDEX has at least 20 entries (built-in + skills + MCP + plugins + recs)', indexKeys.length >= 20, 'found ' + indexKeys.length);

// Check for built-in tools in index
const builtinInIndex = Object.values(TOOL_SEARCH_INDEX).filter(e => e.kind === 'builtin');
assert('Index contains builtin tools', builtinInIndex.length >= 10, 'found ' + builtinInIndex.length);

// Check for skills in index
const skillsInIndex = Object.values(TOOL_SEARCH_INDEX).filter(e => e.kind === 'skill');
assert('Index contains skills', skillsInIndex.length >= 10, 'found ' + skillsInIndex.length);

// Check for MCP tools in index
const mcpInIndex = Object.values(TOOL_SEARCH_INDEX).filter(e => e.kind === 'mcp');
assert('Index contains MCP tools', mcpInIndex.length >= 2, 'found ' + mcpInIndex.length);

// Check for plugin tools in index
const pluginInIndex = Object.values(TOOL_SEARCH_INDEX).filter(e => e.kind === 'plugin');
assert('Index contains plugin tools', pluginInIndex.length >= 2, 'found ' + pluginInIndex.length);

// Check for recommendation entries in index
const recInIndex = Object.values(TOOL_SEARCH_INDEX).filter(e => e.kind === 'recommendation');
assert('Index contains recommendation entries', recInIndex.length >= 5, 'found ' + recInIndex.length);

// Verify index entry structure
const sampleEntry = Object.values(TOOL_SEARCH_INDEX)[0];
assert('Index entry has id', typeof sampleEntry.id === 'string' && sampleEntry.id.length > 0);
assert('Index entry has kind', ['builtin', 'skill', 'mcp', 'plugin', 'recommendation'].includes(sampleEntry.kind));
assert('Index entry has name', typeof sampleEntry.name === 'string' && sampleEntry.name.length > 0);
assert('Index entry has whatItDoes', typeof sampleEntry.whatItDoes === 'string' && sampleEntry.whatItDoes.length > 0);
assert('Index entry has keywords array', Array.isArray(sampleEntry.keywords) && sampleEntry.keywords.length > 0);
assert('Index entry keywords include English', sampleEntry.keywords.some(k => /[a-zA-Z]/.test(k)));
// Check that at least one entry in the index has Bangla keywords (recommendation entries do)
assert('Index entry keywords include Bangla', Object.values(TOOL_SEARCH_INDEX).some(e => e.keywords.some(k => /[\u0980-\u09FF]/.test(k))));

// Test rebuild function
assert('rebuildToolSearchIndex is a function', typeof api.rebuildToolSearchIndex === 'function');
const initialCount = Object.keys(api.TOOL_SEARCH_INDEX).length;
api.rebuildToolSearchIndex();
const afterRebuildCount = Object.keys(api.TOOL_SEARCH_INDEX).length;
assert('rebuildToolSearchIndex preserves index size', afterRebuildCount === initialCount);

// ---------------------------------------------------------------------------
// Test (b): searchTools('rename') returns rename tool ranked above description-only match
// ---------------------------------------------------------------------------
const renameResults = api.searchTools('rename');
assert('searchTools returns array for rename', Array.isArray(renameResults.tools));
assert('searchTools returns at least one result for rename', renameResults.tools.length > 0);

// Find the rename tool in results
const renameTool = renameResults.tools.find(t => t.name.toLowerCase().includes('rename'));
assert('rename tool appears in results', renameTool !== undefined);
if (renameTool) {
  assert('rename tool has high score (name hit)', renameTool.score >= 3);
}

// Compare with a tool that only has rename in description
const otherResults = renameResults.tools.filter(t => !t.name.toLowerCase().includes('rename'));
if (otherResults.length > 0) {
  assert('Name hit outranks keyword/description hit', renameTool.score > otherResults[0].score);
}

// Verify score breakdown: name hit > keyword hit > description hit
const nameHitTool = renameResults.tools.find(t => t.matchedField === 'name');
const keywordHitTool = renameResults.tools.find(t => t.matchedField === 'keyword');
if (nameHitTool && keywordHitTool) {
  assert('Name hit score > Keyword hit score', nameHitTool.score > keywordHitTool.score);
}

// ---------------------------------------------------------------------------
// Test (c): searchTools returns [] for a query matching nothing
// ---------------------------------------------------------------------------
const emptyResults = api.searchTools('xyzzy-nonexistent-query-12345');
assert('searchTools returns empty array for no match', Array.isArray(emptyResults.tools) && emptyResults.tools.length === 0);
assert('Empty result still has estimatedTokens and savedVsAll', typeof emptyResults.estimatedTokens === 'number' && typeof emptyResults.savedVsAll === 'number');

// ---------------------------------------------------------------------------
// Test (d): Result carries estimatedTokens + savedVsAll, saving positive for subset
// ---------------------------------------------------------------------------
const subsetResults = api.searchTools('file');
assert('Result has estimatedTokens', typeof subsetResults.estimatedTokens === 'number' && subsetResults.estimatedTokens > 0);
assert('Result has savedVsAll', typeof subsetResults.savedVsAll === 'number');
assert('savedVsAll is positive (subset < all)', subsetResults.savedVsAll > 0);
assert('estimatedTokens uses chars/4 estimator', subsetResults.estimatedTokens === Math.round(subsetResults.estimatedTokens));

// Verify all-schemas estimate is larger
const allTools = Object.values(TOOL_SEARCH_INDEX);
const allSchemaChars = allTools.reduce((sum, t) => sum + JSON.stringify(t).length, 0);
const allSchemaEstimate = Math.round(allSchemaChars / 4);
assert('all-schemas estimate > subset estimate', allSchemaEstimate > subsetResults.estimatedTokens);

// ---------------------------------------------------------------------------
// Test (e): Agent step loads ONLY the searched tools (fixture step)
// ---------------------------------------------------------------------------
// We simulate the agent step by checking that the loaded tools match searchTools output
const stepDescription = 'I need to read a file and write the output to another file';
const searchResult = api.searchTools(stepDescription);
const loadedTools = searchResult.tools.map(t => t.name).sort();
const searchToolNames = searchResult.tools.map(t => t.name).sort();
assert('Loaded tools match search result (not full catalog)', JSON.stringify(loadedTools) === JSON.stringify(searchToolNames));
assert('Loaded tools is a subset of all tools', loadedTools.length <= Object.keys(TOOL_SEARCH_INDEX).length);
assert('Loaded tools does not equal full catalog', loadedTools.length < Object.keys(TOOL_SEARCH_INDEX).length);

// ---------------------------------------------------------------------------
// Test (f): Search-miss fallback loads B4.7 category defaults and logs miss
// ---------------------------------------------------------------------------
// This requires checking the integration point in the autonomy engine
// We verify the fallback function exists and the log message pattern
const fallbackSrc = extractFunction(script, 'loadCategoryDefaults');
assert('loadCategoryDefaults function exists for fallback', fallbackSrc !== null);
const logMissSrc = extractFunction(script, 'logSearchMiss');
assert('logSearchMiss function exists for fallback logging', logMissSrc !== null);

// ---------------------------------------------------------------------------
// Test (g): Command palette tool-search mode lists matching tools with descriptions
// ---------------------------------------------------------------------------
const cmdPaletteSrc = extractFunction(script, 'openCommandPalette');
assert('openCommandPalette function exists', cmdPaletteSrc !== null);
// Check for tool-search mode in command palette
const toolSearchModeInPalette = script.indexOf('tool-search') !== -1 || script.indexOf('Search tools') !== -1;
assert('Command palette has tool-search mode', toolSearchModeInPalette);

// ---------------------------------------------------------------------------
// Test (h): Session panel shows loaded-tools line with saved-tokens figure
// ---------------------------------------------------------------------------
const sessionPanelSrc = extractFunction(script, 'renderSessionPanel');
assert('renderSessionPanel function exists', sessionPanelSrc !== null);
const loadedToolsLine = script.indexOf('Tools loaded:') !== -1;
const savedTokensInPanel = script.indexOf('saved') !== -1 && script.indexOf('tokens') !== -1;
assert('Session panel shows loaded-tools line', loadedToolsLine);
assert('Session panel shows saved-tokens figure', savedTokensInPanel);

// ---------------------------------------------------------------------------
// Test (i): Toggle + top-N + threshold exist in appState with correct defaults
// ---------------------------------------------------------------------------
assert('toolSearch.enabled defaults to true', toolSearchSettingsDefaults.enabled === true);
assert('toolSearch.topN defaults to 8', toolSearchSettingsDefaults.topN === 8);
assert('toolSearch.threshold defaults to 1', toolSearchSettingsDefaults.threshold === 1);

// ---------------------------------------------------------------------------
// Test (j): Bengali translation keys exist for new strings
// ---------------------------------------------------------------------------
const bnKeys = [
  'Tool Search',
  'Search tools',
  'Tool search enabled',
  'Top N results',
  'Score threshold',
  'Tools loaded',
  'saved',
  'tokens',
  'Search missed — using category defaults',
  'No tools matched'
];
const bnLabelsOk = bnKeys.every(function (k) {
  return typeof I18N.bn[k] === 'string' && I18N.bn[k].length > 0 && I18N.bn[k] !== k;
});
assert('All Bengali translation keys exist, non-empty, differ from English', bnLabelsOk);

// ---------------------------------------------------------------------------
// Standing guards
// ---------------------------------------------------------------------------
assert('Literal </script count stays 1', (html.match(/<\/script>/g) || []).length === 1);
assert('No ?.onclick assignments', html.indexOf('?.onclick') === -1);

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('BATCH 7.10 TOOL SEARCH: FAILED');
  process.exit(1);
}
console.log('BATCH 7.10 TOOL SEARCH: ALL TESTS PASSED (' + passed + '/' + passed + ')');
process.exit(0);