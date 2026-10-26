// Test for Lazy Tool Loading (B4.7) - Direct function extraction
// Run with: node test-b4.7-lazy-loading.js
// No jsdom and no package.json: the B4.7 pieces are extracted from
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

// Extract a const object literal from the script (brace counting from its opening brace)
function extractObject(scriptText, objName) {
  const searchStr = 'const ' + objName + ' = {';
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

console.log('=== B4.7 Lazy Tool Loading Tests (Direct Extraction) ===\n');

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
// Extract the B4.7 pieces from index.html
// ---------------------------------------------------------------------------
const toolsSrc = extractObject(script, 'TOOL_DEFINITIONS');
const loadToolSrc = extractFunction(script, 'loadToolContent');
const parseSrc = extractFunction(script, 'parseToolsUsedLine');
const catalogSrc = extractFunction(script, 'buildAutonomyCatalogText');
const lazyToolsSrc = extractProperty(script, 'lazyTools');
const i18nSrc = extractObject(script, 'I18N');
const autonomySrc = extractObject(script, 'AUTONOMY_CATALOG');

assert('TOOL_DEFINITIONS object exists', toolsSrc !== null);
assert('loadToolContent function exists', loadToolSrc !== null);
assert('parseToolsUsedLine function exists', parseSrc !== null);
assert('buildAutonomyCatalogText function exists', catalogSrc !== null);
assert('appState.lazyTools literal exists', lazyToolsSrc !== null);
assert('I18N object exists', i18nSrc !== null);
assert('AUTONOMY_CATALOG object exists', autonomySrc !== null);

if (!toolsSrc || !loadToolSrc || !parseSrc || !catalogSrc || !lazyToolsSrc || !i18nSrc || !autonomySrc) {
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(1);
}

// Evaluate the extracted data objects (pure literals from index.html)
let TOOL_DEFINITIONS;
let lazyToolsDefaults;
let I18N;
let AUTONOMY_CATALOG;
try {
  TOOL_DEFINITIONS = eval('(' + toolsSrc + ')');
  lazyToolsDefaults = eval('(' + lazyToolsSrc + ')');
  I18N = eval('(' + i18nSrc + ')');
  AUTONOMY_CATALOG = eval('(' + autonomySrc + ')');
} catch (e) {
  console.log('FAIL: extracted B4.7 literals do not evaluate - ' + e.message);
  process.exit(1);
}
console.log('PASS: extracted B4.7 literals evaluate');
passed++;

// Run the extracted B4.7 functions in a controlled context (stubs for appState/saveAppState)
let saveCalls = 0;
const appState = { lazyTools: { enabled: true, loadedCount: 0, loadedKeys: [] }, customSkillPacks: undefined };
const ctx = { appState: appState, AUTONOMY_CATALOG: AUTONOMY_CATALOG, saveAppState: function () { saveCalls++; } };
const b47Code = 'const TOOL_DEFINITIONS = ' + toolsSrc + ';\n' + loadToolSrc + '\n' + parseSrc + '\n' + catalogSrc;
const fn = new Function(...Object.keys(ctx), b47Code + '\n; return { TOOL_DEFINITIONS: TOOL_DEFINITIONS, loadToolContent: loadToolContent, parseToolsUsedLine: parseToolsUsedLine, buildAutonomyCatalogText: buildAutonomyCatalogText };');
const api = fn(...Object.values(ctx));

function resetLazyTools(enabled) {
  appState.lazyTools = { enabled: enabled !== false, loadedCount: 0, loadedKeys: [] };
  saveCalls = 0;
}

// --- Test 1: tool registry ---------------------------------------------------
const toolKeys = Object.keys(api.TOOL_DEFINITIONS);
assert('Registry has at least 15 tools', toolKeys.length >= 15, 'found ' + toolKeys.length);
assert('Registry includes file-write', !!api.TOOL_DEFINITIONS['file-write']);
assert('Registry includes brain-read', !!api.TOOL_DEFINITIONS['brain-read']);
assert('Registry includes browser', !!api.TOOL_DEFINITIONS['browser']);
assert('Registry includes query-graph', !!api.TOOL_DEFINITIONS['query-graph']);
const allToolsWellFormed = toolKeys.every(function (k) {
  const t = api.TOOL_DEFINITIONS[k];
  return typeof t.name === 'string' && typeof t.type === 'string' && typeof t.trigger === 'string' && typeof t.description === 'string';
});
assert('Every tool has string name/type/trigger/description', allToolsWellFormed);
const allTypesValid = toolKeys.every(function (k) {
  return ['builtin', 'mcp', 'skill'].indexOf(api.TOOL_DEFINITIONS[k].type) !== -1;
});
assert('Every tool type is builtin, mcp or skill', allTypesValid);
assert('file-write trigger is a one-liner', api.TOOL_DEFINITIONS['file-write'].trigger.indexOf('\n') === -1);

// --- Test 2: lazyTools defaults ----------------------------------------------
assert('lazyTools defaults to enabled', lazyToolsDefaults.enabled === true);
assert('lazyTools defaults loadedCount to 0', lazyToolsDefaults.loadedCount === 0);
assert('lazyTools defaults loadedKeys to an empty array', Array.isArray(lazyToolsDefaults.loadedKeys) && lazyToolsDefaults.loadedKeys.length === 0);

// --- Test 3: loadToolContent -------------------------------------------------
assert('loadToolContent is a function', typeof api.loadToolContent === 'function');
resetLazyTools(true);
const fileWriteContent = api.loadToolContent('tool_file-write');
assert('loadToolContent returns the file-write definition', typeof fileWriteContent === 'string' && fileWriteContent.indexOf('=== TOOL: FILE-WRITE ===') !== -1);
assert('loadToolContent includes the trigger', fileWriteContent.indexOf('Creates or overwrites a file') !== -1);
assert('loadToolContent includes the description', fileWriteContent.indexOf('Write full file content to the virtual filesystem') !== -1);
assert('loadToolContent tracks the loaded tool', appState.lazyTools.loadedKeys.indexOf('file-write') !== -1);
assert('loadToolContent bumps loadedCount to 1', appState.lazyTools.loadedCount === 1);
assert('loadToolContent persists state once', saveCalls === 1, 'saveCalls=' + saveCalls);
assert('loadToolContent returns null for an unknown tool', api.loadToolContent('tool_no-such-tool') === null);

// --- Test 4: duplicate load does not double-count ----------------------------
const againContent = api.loadToolContent('tool_file-write');
assert('Duplicate load returns the same content', againContent === fileWriteContent);
assert('Duplicate load keeps one loaded key', appState.lazyTools.loadedKeys.length === 1);
assert('Duplicate load keeps loadedCount at 1', appState.lazyTools.loadedCount === 1);
assert('Duplicate load does not persist again', saveCalls === 1, 'saveCalls=' + saveCalls);

// --- Test 5: parseToolsUsedLine loads load:-prefixed tools -------------------
resetLazyTools(true);
api.parseToolsUsedLine('Tools used: load: tool_brain-read, load: tool_browser');
assert('parseToolsUsedLine loads both named tools', appState.lazyTools.loadedKeys.indexOf('brain-read') !== -1 && appState.lazyTools.loadedKeys.indexOf('browser') !== -1);
assert('parseToolsUsedLine sets loadedCount to 2', appState.lazyTools.loadedCount === 2);

// --- Test 6: plain tool names and missing marker load nothing ----------------
resetLazyTools(true);
api.parseToolsUsedLine('Tools used: brain-read, browser');
assert('Plain tool names load nothing', appState.lazyTools.loadedCount === 0 && appState.lazyTools.loadedKeys.length === 0);
api.parseToolsUsedLine('No tools were used here.');
assert('A line without the marker loads nothing', appState.lazyTools.loadedCount === 0);

// --- Test 7: disabled mode loads nothing --------------------------------------
resetLazyTools(true);
api.parseToolsUsedLine('Tools used: load: tool_brain-read, load: tool_browser');
assert('Setup loads two tools', appState.lazyTools.loadedCount === 2);
appState.lazyTools.enabled = false;
api.parseToolsUsedLine('Tools used: load: tool_terminal');
assert('Disabled mode keeps loadedCount at 2', appState.lazyTools.loadedCount === 2);
assert('Disabled mode does not load terminal', appState.lazyTools.loadedKeys.indexOf('terminal') === -1);

// --- Test 8: lazy catalog shows names + triggers + counter only ---------------
resetLazyTools(true);
appState.lazyTools.loadedKeys = ['file-write', 'brain-read'];
appState.lazyTools.loadedCount = 2;
const lazyCatalog = api.buildAutonomyCatalogText();
const totalTools = Object.keys(api.TOOL_DEFINITIONS).length;
assert('Lazy catalog has the lazy-loaded header', lazyCatalog.indexOf('TOOLS (lazy-loaded)') !== -1);
assert('Lazy catalog shows the loaded counter', lazyCatalog.indexOf('Mode: Load tools when needed. 2 of ' + totalTools + ' loaded.') !== -1);
assert('Lazy catalog marks loaded tools', lazyCatalog.indexOf('[LOADED]') !== -1);
assert('Lazy catalog offers load keys for unloaded tools', lazyCatalog.indexOf('[load: tool_browser]') !== -1);
assert('Lazy catalog hides full descriptions', lazyCatalog.indexOf('Write full file content to the virtual filesystem') === -1);
const allNamesListed = toolKeys.every(function (k) { return lazyCatalog.indexOf(api.TOOL_DEFINITIONS[k].name) !== -1; });
assert('Lazy catalog lists every tool name', allNamesListed);

// --- Test 9: eager catalog shows full definitions ------------------------------
appState.lazyTools.enabled = false;
const eagerCatalog = api.buildAutonomyCatalogText();
assert('Eager catalog has the pre-loaded header', eagerCatalog.indexOf('TOOLS (pre-loaded)') !== -1);
assert('Eager catalog includes the full file-write description', eagerCatalog.indexOf('Write full file content to the virtual filesystem') !== -1);
assert('Eager catalog has no load keys', eagerCatalog.indexOf('[load: tool_') === -1);

// --- Test 10: Bengali labels ----------------------------------------------------
const bnKeys = ['Lazy Tool Loading', 'Loading Mode', 'Load tools when needed (default)', 'Tools already loaded', 'Loaded', 'tools'];
const bnLabelsOk = bnKeys.every(function (k) {
  return typeof I18N.bn[k] === 'string' && I18N.bn[k].length > 0 && I18N.bn[k] !== k;
});
assert('All six Bengali labels exist, are non-empty and differ from English', bnLabelsOk);

// --- Test 11: settings UI and wiring --------------------------------------------
assert('Lazy mode radio exists', html.indexOf('name="lazyToolsMode" value="lazy"') !== -1);
assert('Eager mode radio exists', html.indexOf('name="lazyToolsMode" value="eager"') !== -1);
assert('Loaded counter span exists', html.indexOf('id="lazyToolsLoadedCount"') !== -1);
assert('Total counter span exists', html.indexOf('id="lazyToolsTotalCount"') !== -1);
assert('Lazy Tool Loading heading is i18n-tagged', html.indexOf('data-i18n="Lazy Tool Loading"') !== -1);
assert('Loading Mode label is i18n-tagged', html.indexOf('data-i18n="Loading Mode"') !== -1);
assert('Counter shows loadedCount', script.indexOf('lazyToolsLoadedCount.textContent = loadedCount') !== -1);
assert('Counter shows totalTools', script.indexOf('lazyToolsTotalCount.textContent = totalTools') !== -1);
assert('Mode change resets tracking', script.indexOf('appState.lazyTools.loadedKeys = []') !== -1);
assert('Mode change rebuilds agent context', script.indexOf('buildAgentContext()') !== -1);
const parseCallSites = (script.match(/parseToolsUsedLine\(/g) || []).length;
assert('parseToolsUsedLine has 1 definition + 3 call sites', parseCallSites >= 4, 'found ' + parseCallSites);

// --- Test 12: standing guards ----------------------------------------------------
assert('Literal </script count stays 1', (html.match(/<\/script/g) || []).length === 1);
assert('No ?.onclick assignments', html.indexOf('?.onclick') === -1);

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('B4.7 LAZY LOADING: FAILED');
  process.exit(1);
}
console.log('B4.7 LAZY LOADING: ALL TESTS PASSED (' + passed + '/' + passed + ')');
