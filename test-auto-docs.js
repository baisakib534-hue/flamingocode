// Test for Auto-docs (B4.2) - Direct function extraction
// Run with: node test-auto-docs.js

const fs = require('fs');

// Extract the script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not extract script from index.html');
  process.exit(1);
}

const script = scriptMatch[1];

// Extract specific functions from the script using simple string search + brace counting
function extractFunction(script, funcName) {
  // Try both async and regular function
  let searchStr = `function ${funcName}(`;
  let idx = script.indexOf(searchStr);
  if (idx === -1) {
    searchStr = `async function ${funcName}(`;
    idx = script.indexOf(searchStr);
  }
  if (idx === -1) return null;

  const start = idx;
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < script.length; i++) {
    if (script[i] === '{') { braceCount++; seenOpen = true; }
    else if (script[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return script.slice(start, i + 1);
}

// Extract object (I18N)
function extractObject(script, objName) {
  const searchStr = `const ${objName} = {`;
  const idx = script.indexOf(searchStr);
  if (idx === -1) return null;

  const start = idx;
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < script.length; i++) {
    if (script[i] === '{') { braceCount++; seenOpen = true; }
    else if (script[i] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return script.slice(start, i + 1);
}

console.log('=== Auto-docs (B4.2) Tests (Direct Extraction) ===\n');

let passed = 0;
let failed = 0;

function assert(name, condition, details = '') {
  if (condition) {
    console.log(`PASS: ${name}`);
    passed++;
  } else {
    console.log(`FAIL: ${name}${details ? ' - ' + details : ''}`);
    failed++;
  }
}

// ============================================================
// (a) UI ELEMENTS
// ============================================================

assert('Generate README button exists', html.includes('id="btnGenerateReadme"'));
assert('Generate User Guide button exists', html.includes('id="btnGenerateUserGuide"'));
assert('Generate All Docs button exists', html.includes('id="btnGenerateAllDocs"'));
assert('Force Refresh Docs button exists', html.includes('id="btnForceRefreshDocs"'));
assert('Auto-docs enabled checkbox exists', html.includes('id="autoDocsEnabled"'));
assert('Auto-docs stale check checkbox exists', html.includes('id="autoDocsStaleCheck"'));
assert('Auto-docs status element exists', html.includes('id="autoDocsStatus"'));
assert('Auto-docs section has data-i18n label', html.includes('data-i18n="Auto-generate documentation"'));

// Check checkbox labels
assert('Auto-docs enabled label has data-i18n', html.includes('data-i18n="Auto-generate docs after builds"'));
assert('Auto-docs stale check label has data-i18n', html.includes('data-i18n="Show stale docs indicator"'));

// Check button data-i18n
assert('Generate README button has data-i18n', html.includes('id="btnGenerateReadme"') && html.includes('data-i18n="Generate README"'));
assert('Generate User Guide button has data-i18n', html.includes('id="btnGenerateUserGuide"') && html.includes('data-i18n="Generate User Guide"'));
assert('Generate All Docs button has data-i18n', html.includes('id="btnGenerateAllDocs"') && html.includes('data-i18n="Generate All Docs"'));
assert('Force Refresh button has data-i18n', html.includes('id="btnForceRefreshDocs"') && html.includes('data-i18n="Force Refresh Docs"'));

// ============================================================
// (b) AUTO-DOCS STATE IN appState
// ============================================================

assert('appState.autoDocs exists', script.includes('autoDocs:') && script.includes('enabled:'));
assert('appState.autoDocs has enabled', script.includes('autoDocs:') && script.includes('enabled:'));
assert('appState.autoDocs has showStaleIndicator', script.includes('autoDocs:') && script.includes('showStaleIndicator:'));
assert('appState.autoDocs has lastGenerated', script.includes('autoDocs:') && script.includes('lastGenerated:'));
assert('appState.autoDocs has lastFileHash', script.includes('autoDocs:') && script.includes('lastFileHash:'));
assert('appState.autoDocs has stale', script.includes('autoDocs:') && script.includes('stale:'));

// ============================================================
// (c) CORE FUNCTIONS
// ============================================================

// computeProjectFileHash
const hashFunc = extractFunction(script, 'computeProjectFileHash');
assert('computeProjectFileHash function exists', hashFunc !== null);
if (hashFunc) {
  assert('computeProjectFileHash iterates session.files values', hashFunc.includes('Object.values(session.files)') && hashFunc.includes('sort'));
  assert('computeProjectFileHash computes hash', hashFunc.includes('hash') && (hashFunc.includes('<<') || hashFunc.includes('charCodeAt')));
}

// checkDocsStale
const staleFunc = extractFunction(script, 'checkDocsStale');
assert('checkDocsStale function exists', staleFunc !== null);
if (staleFunc) {
  assert('checkDocsStale calls computeProjectFileHash', staleFunc.includes('computeProjectFileHash'));
  assert('checkDocsStale compares hashes', staleFunc.includes('lastFileHash') && staleFunc.includes('!='));
  assert('checkDocsStale returns stale status', staleFunc.includes('return'));
}

// updateDocsStaleIndicator
const indicatorFunc = extractFunction(script, 'updateDocsStaleIndicator');
assert('updateDocsStaleIndicator function exists', indicatorFunc !== null);
if (indicatorFunc) {
  assert('updateDocsStaleIndicator gets status element', indicatorFunc.includes('docsStaleIndicator') || indicatorFunc.includes('getElementById'));
  assert('updateDocsStaleIndicator calls checkDocsStale', indicatorFunc.includes('checkDocsStale'));
  assert('updateDocsStaleIndicator updates stale flag', indicatorFunc.includes('appState.autoDocs.stale'));
  assert('updateDocsStaleIndicator shows/hides indicator', indicatorFunc.includes('style.display'));
}

// generateReadme
const readmeFunc = extractFunction(script, 'generateReadme');
assert('generateReadme function exists', readmeFunc !== null);
if (readmeFunc) {
  assert('generateReadme builds project overview', readmeFunc.includes('README') || readmeFunc.includes('readme'));
  assert('generateReadme includes file map', readmeFunc.includes('generateReadmeContent'));
  assert('generateReadme includes how to run', readmeFunc.includes('generateReadmeContent'));
  assert('generateReadme uses session.files', readmeFunc.includes('session.files'));
  assert('generateReadme writes README.md to VFS', readmeFunc.includes('session.files') && readmeFunc.includes('README.md'));
  assert('generateReadme updates lastGenerated', readmeFunc.includes('lastGenerated'));
  assert('generateReadme updates lastFileHash', readmeFunc.includes('lastFileHash'));
  assert('generateReadme calls updateDocsStaleIndicator', readmeFunc.includes('updateDocsStaleIndicator'));
  assert('generateReadme calls updateLastUpdatedDisplay', readmeFunc.includes('updateLastUpdatedDisplay'));
}

// generateUserGuide
const guideFunc = extractFunction(script, 'generateUserGuide');
assert('generateUserGuide function exists', guideFunc !== null);
if (guideFunc) {
  assert('generateUserGuide creates .devforge/docs/', guideFunc.includes('.devforge/docs') || guideFunc.includes('devforge/docs'));
  assert('generateUserGuide uses session.files', guideFunc.includes('session.files'));
  assert('generateUserGuide writes user guide files', guideFunc.includes('session.files') && guideFunc.includes('devforge/docs'));
  assert('generateUserGuide updates lastGenerated', guideFunc.includes('lastGenerated'));
  assert('generateUserGuide updates lastFileHash', guideFunc.includes('lastFileHash'));
  assert('generateUserGuide calls updateDocsStaleIndicator', guideFunc.includes('updateDocsStaleIndicator'));
  assert('generateUserGuide calls updateLastUpdatedDisplay', guideFunc.includes('updateLastUpdatedDisplay'));
}

// generateAllDocs
const allDocsFunc = extractFunction(script, 'generateAllDocs');
assert('generateAllDocs function exists', allDocsFunc !== null);
if (allDocsFunc) {
  assert('generateAllDocs calls generateReadmeContent', allDocsFunc.includes('generateReadmeContent'));
  assert('generateAllDocs calls generateUserGuideContent', allDocsFunc.includes('generateUserGuideContent'));
  assert('generateAllDocs calls writeDocsToVFS', allDocsFunc.includes('writeDocsToVFS'));
  assert('generateAllDocs logs success', allDocsFunc.includes('logActivity') && allDocsFunc.includes('success'));
  assert('generateAllDocs catches errors', allDocsFunc.includes('try') && allDocsFunc.includes('catch'));
}

// forceRefreshDocs
const refreshFunc = extractFunction(script, 'forceRefreshDocs');
assert('forceRefreshDocs function exists', refreshFunc !== null);
if (refreshFunc) {
  assert('forceRefreshDocs calls generateAllDocs', refreshFunc.includes('generateAllDocs'));
  assert('forceRefreshDocs clears lastFileHash', refreshFunc.includes('lastFileHash') && refreshFunc.includes('='));
  assert('forceRefreshDocs saves appState', refreshFunc.includes('saveAppState'));
}

// autoGenerateDocsAfterBuild
const autoGenFunc = extractFunction(script, 'autoGenerateDocsAfterBuild');
assert('autoGenerateDocsAfterBuild function exists', autoGenFunc !== null);
if (autoGenFunc) {
  assert('autoGenerateDocsAfterBuild checks enabled flag', autoGenFunc.includes('appState.autoDocs') && autoGenFunc.includes('enabled'));
  assert('autoGenerateDocsAfterBuild calls computeProjectFileHash', autoGenFunc.includes('computeProjectFileHash'));
  assert('autoGenerateDocsAfterBuild generates readme and user guide', autoGenFunc.includes('generateReadmeContent') && autoGenFunc.includes('generateUserGuideContent'));
  assert('autoGenerateDocsAfterBuild calls writeDocsToVFS', autoGenFunc.includes('writeDocsToVFS'));
  assert('autoGenerateDocsAfterBuild updates lastGenerated and lastFileHash', autoGenFunc.includes('lastGenerated') && autoGenFunc.includes('lastFileHash'));
  assert('autoGenerateDocsAfterBuild saves appState', autoGenFunc.includes('saveAppState'));
  assert('autoGenerateDocsAfterBuild logs activity', autoGenFunc.includes('logActivity'));
  assert('autoGenerateDocsAfterBuild catches errors', autoGenFunc.includes('try') && autoGenFunc.includes('catch'));
}

// ============================================================
// (d) RENDER BACKUP TAB INTEGRATION
// ============================================================

const renderFunc = extractFunction(script, 'renderBackupTab');
assert('renderBackupTab gets auto-docs elements', renderFunc && renderFunc.includes('btnGenerateReadme') && renderFunc.includes('btnGenerateUserGuide') && renderFunc.includes('btnGenerateAllDocs') && renderFunc.includes('btnForceRefreshDocs'));
assert('renderBackupTab sets onclick for Generate README', renderFunc && renderFunc.includes('generateReadme'));
assert('renderBackupTab sets onclick for Generate User Guide', renderFunc && renderFunc.includes('generateUserGuide'));
assert('renderBackupTab sets onclick for Generate All Docs', renderFunc && renderFunc.includes('generateAllDocs'));
assert('renderBackupTab sets onclick for Force Refresh', renderFunc && renderFunc.includes('forceRefreshDocs'));
assert('renderBackupTab binds checkboxes', renderFunc && renderFunc.includes('autoDocsEnabled') && renderFunc.includes('autoDocsStaleCheck'));
assert('renderBackupTab initializes stale indicator', renderFunc && renderFunc.includes('updateDocsStaleIndicator'));

// ============================================================
// (e) BENGALI TRANSLATIONS
// ============================================================

const i18n = extractObject(script, 'I18N');
const translations = [
  'Generate README',
  'Generate User Guide',
  'Generate All Docs',
  'Force Refresh Docs',
  'Auto-generate docs after builds',
  'Show stale docs indicator',
  'Documentation is up to date',
  'Documentation is stale — files changed since last generation',
  'Documentation generated',
  'Documentation generation failed',
  'Auto-generate documentation'
];
for (const trans of translations) {
  assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
}

// UI elements have data-i18n attributes
assert('Section has data-i18n', html.includes('data-i18n="Auto-generate documentation"'));
assert('Generate README button has data-i18n', html.includes('id="btnGenerateReadme"') && html.includes('data-i18n="Generate README"'));
assert('Generate User Guide button has data-i18n', html.includes('id="btnGenerateUserGuide"') && html.includes('data-i18n="Generate User Guide"'));
assert('Generate All Docs button has data-i18n', html.includes('id="btnGenerateAllDocs"') && html.includes('data-i18n="Generate All Docs"'));
assert('Force Refresh button has data-i18n', html.includes('id="btnForceRefreshDocs"') && html.includes('data-i18n="Force Refresh Docs"'));
assert('Enabled checkbox label has data-i18n', html.includes('data-i18n="Auto-generate docs after builds"'));
assert('Stale check checkbox label has data-i18n', html.includes('data-i18n="Show stale docs indicator"'));

// ============================================================
// (f) INTEGRATION HOOKS
// ============================================================

// Check processAgentResponse calls autoGenerateDocsAfterBuild
const processFunc = extractFunction(script, 'processAgentResponse');
if (processFunc) {
  assert('processAgentResponse calls autoGenerateDocsAfterBuild on file change', processFunc.includes('fileModified') && processFunc.includes('autoGenerateDocsAfterBuild'));
}

// Check acceptAllChanges calls autoGenerateDocsAfterBuild
const acceptFunc = extractFunction(script, 'acceptAllChanges');
if (acceptFunc) {
  assert('acceptAllChanges calls autoGenerateDocsAfterBuild', acceptFunc.includes('autoGenerateDocsAfterBuild'));
}

// ============================================================
// (g) WRITE DOCS TO VFS
// ============================================================

const writeVFSFunc = extractFunction(script, 'writeDocsToVFS');
assert('writeDocsToVFS function exists', writeVFSFunc !== null);
if (writeVFSFunc) {
  assert('writeDocsToVFS writes README.md', writeVFSFunc.includes('README.md'));
  assert('writeDocsToVFS writes .devforge/docs/ files', writeVFSFunc.includes('.devforge/docs'));
  assert('writeDocsToVFS saves appState', writeVFSFunc.includes('saveAppState'));
  assert('writeDocsToVFS renders file tree', writeVFSFunc.includes('renderFileTree'));
  assert('writeDocsToVFS returns true', writeVFSFunc.includes('return true'));
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}