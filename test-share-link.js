// Test for Share Link (B4.3) - Direct function extraction
// Run with: node test-share-link.js

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

console.log('=== Share Link (B4.3) Tests (Direct Extraction) ===\n');

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

assert('Copy Share Link button exists', html.includes('id="btnCopyShareLink"'));
assert('Open Share Link button exists', html.includes('id="btnOpenShareLink"'));
assert('Share link output element exists', html.includes('id="shareLinkOutput"'));
assert('Share Link section has data-i18n label', html.includes('data-i18n="Share Link"'));
assert('Share Link description has data-i18n', html.includes('data-i18n="Share link opens the built app (not the editor). If not deployed yet, prepares deployment first."'));

// ============================================================
// (b) INITPUBLISHPANEL INTEGRATION
// ============================================================

const initPublishFunc = extractFunction(script, 'initPublishPanel');
assert('initPublishPanel function exists', initPublishFunc !== null);

if (initPublishFunc) {
  assert('initPublishPanel gets btnCopyShareLink', initPublishFunc.includes('btnCopyShareLink') && initPublishFunc.includes('getElementById'));
  assert('initPublishPanel gets btnOpenShareLink', initPublishFunc.includes('btnOpenShareLink') && initPublishFunc.includes('getElementById'));
  assert('initPublishPanel gets shareLinkOutput', initPublishFunc.includes('shareLinkOutput') && initPublishFunc.includes('getElementById'));
  assert('initPublishPanel defines generateShareLink', initPublishFunc.includes('function generateShareLink'));
  assert('initPublishPanel defines prepareDeploymentForShare', initPublishFunc.includes('function prepareDeploymentForShare'));
  assert('initPublishPanel sets onclick for btnCopyShareLink', initPublishFunc.includes('btnCopyShareLink.onclick'));
  assert('initPublishPanel sets onclick for btnOpenShareLink', initPublishFunc.includes('btnOpenShareLink.onclick'));
}

// ============================================================
// (c) GENERATE SHARE LINK LOGIC
// ============================================================

if (initPublishFunc) {
  assert('generateShareLink checks session.lastDeployType', initPublishFunc.includes('session.lastDeployType'));
  assert('generateShareLink handles gh-pages', initPublishFunc.includes('gh-pages') && initPublishFunc.includes('github.io'));
  assert('generateShareLink handles netlify', initPublishFunc.includes('netlify') && initPublishFunc.includes('netlify.app'));
  assert('generateShareLink handles vercel', initPublishFunc.includes('vercel') && initPublishFunc.includes('vercel.app'));
  assert('generateShareLink returns needsDeploy when no deploy type', initPublishFunc.includes('needsDeploy: true'));
  assert('generateShareLink sanitizes project name', initPublishFunc.includes('replace(/[^a-z0-9-_]/gi, \'-\')') && initPublishFunc.includes('toLowerCase()'));
}

// ============================================================
// (d) PREPARE DEPLOYMENT FOR SHARE
// ============================================================

if (initPublishFunc) {
  assert('prepareDeploymentForShare calls prepareGhPagesExport', initPublishFunc.includes('prepareGhPagesExport'));
  assert('prepareDeploymentForShare calls prepareNetlifyExport', initPublishFunc.includes('prepareNetlifyExport'));
  assert('prepareDeploymentForShare calls prepareVercelExport', initPublishFunc.includes('prepareVercelExport'));
  assert('prepareDeploymentForShare creates ZIP', initPublishFunc.includes('createZipFromVFS'));
  assert('prepareDeploymentForShare downloads blob', initPublishFunc.includes('downloadBlob'));
  assert('prepareDeploymentForShare sets session.lastDeployType', initPublishFunc.includes('session.lastDeployType = deployType'));
  assert('prepareDeploymentForShare calls saveAppState', initPublishFunc.includes('saveAppState()'));
  assert('prepareDeploymentForShare throws on unknown type', initPublishFunc.includes('Unknown deployment type'));
}

// ============================================================
// (e) COPY SHARE LINK HANDLER
// ============================================================

if (initPublishFunc) {
  assert('btnCopyShareLink handler calls generateShareLink', initPublishFunc.includes('generateShareLink(session)'));
  assert('btnCopyShareLink handler checks needsDeploy', initPublishFunc.includes('result.needsDeploy'));
  assert('btnCopyShareLink handler prompts for platform when needsDeploy', initPublishFunc.includes('prompt') && initPublishFunc.includes('GitHub Pages') && initPublishFunc.includes('Netlify') && initPublishFunc.includes('Vercel'));
  assert('btnCopyShareLink handler calls prepareDeploymentForShare', initPublishFunc.includes('prepareDeploymentForShare(session, deployType)'));
  assert('btnCopyShareLink handler uses navigator.clipboard.writeText', initPublishFunc.includes('navigator.clipboard.writeText'));
  assert('btnCopyShareLink handler shows output', initPublishFunc.includes('showOutput(\'shareLinkOutput\'') || initPublishFunc.includes('showOutput("shareLinkOutput"') || initPublishFunc.includes("showOutput('shareLinkOutput'"));
  assert('btnCopyShareLink handler updates publishStatus', initPublishFunc.includes('publishStatus.textContent'));
  assert('btnCopyShareLink handler logs activity', initPublishFunc.includes('logActivity') && initPublishFunc.includes('Share link copied'));
  assert('btnCopyShareLink handler has try/catch', initPublishFunc.includes('try') && initPublishFunc.includes('catch'));
  assert('btnCopyShareLink handler handles cancel', initPublishFunc.includes('Cancelled'));
}

// ============================================================
// (f) OPEN SHARE LINK HANDLER
// ============================================================

if (initPublishFunc) {
  assert('btnOpenShareLink handler calls generateShareLink', initPublishFunc.includes('generateShareLink(session)'));
  assert('btnOpenShareLink handler checks needsDeploy', initPublishFunc.includes('result.needsDeploy'));
  assert('btnOpenShareLink handler prompts for platform when needsDeploy', initPublishFunc.includes('prompt') && initPublishFunc.includes('GitHub Pages') && initPublishFunc.includes('Netlify') && initPublishFunc.includes('Vercel'));
  assert('btnOpenShareLink handler calls prepareDeploymentForShare', initPublishFunc.includes('prepareDeploymentForShare(session, deployType)'));
  assert('btnOpenShareLink handler opens window when deployed', initPublishFunc.includes('window.open') && initPublishFunc.includes('result.liveUrl'));
  assert('btnOpenShareLink handler shows output for needsDeploy', initPublishFunc.includes('showOutput(\'shareLinkOutput\'') || initPublishFunc.includes('showOutput("shareLinkOutput"') || initPublishFunc.includes("showOutput('shareLinkOutput'"));
  assert('btnOpenShareLink handler updates publishStatus', initPublishFunc.includes('publishStatus.textContent'));
  assert('btnOpenShareLink handler logs activity', initPublishFunc.includes('logActivity'));
  assert('btnOpenShareLink handler has try/catch', initPublishFunc.includes('try') && initPublishFunc.includes('catch'));
  assert('btnOpenShareLink handler handles cancel', initPublishFunc.includes('Cancelled'));
}

// ============================================================
// (g) BENGALI TRANSLATIONS
// ============================================================

const i18n = extractObject(script, 'I18N');
const translations = [
  'Share Link',
  'Share link opens the built app (not the editor). If not deployed yet, prepares deployment first.'
];
for (const trans of translations) {
  assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
}

// UI elements have data-i18n attributes
assert('Section has data-i18n', html.includes('data-i18n="Share Link"'));
assert('Description has data-i18n', html.includes('data-i18n="Share link opens the built app (not the editor). If not deployed yet, prepares deployment first."'));

// ============================================================
// (h) EDGE CASES
// ============================================================

if (initPublishFunc) {
  assert('generateShareLink builds GitHub Pages URL with username placeholder', initPublishFunc.includes('<username>'));
  assert('generateShareLink builds Netlify URL with project name', initPublishFunc.includes('${safeName}.netlify.app'));
  assert('generateShareLink builds Vercel URL with project name', initPublishFunc.includes('${safeName}.vercel.app'));
  assert('prepareDeploymentForShare uses safeName in filename', initPublishFunc.includes('safeName') && initPublishFunc.includes('.zip'));
  assert('handlers check for active session', initPublishFunc.includes('getCurrentSession()') && initPublishFunc.includes('!session'));
  assert('handlers show alert for no session', initPublishFunc.includes('alert') && initPublishFunc.includes('No active session'));
}

// ============================================================
// (i) SHARE LINK OUTPUT MESSAGE CONTENT
// ============================================================

if (initPublishFunc) {
  assert('Copy handler output includes "built app (not the editor)"', initPublishFunc.includes('BUILT APP (not the FlamingoCode editor)') || initPublishFunc.includes('built app (not the editor)'));
  assert('Copy handler output includes "viewer sees your running application"', initPublishFunc.includes('viewer sees your running application') || initPublishFunc.includes('viewer sees') || initPublishFunc.includes('running application'));
  assert('Open handler output for needsDeploy includes next steps', initPublishFunc.includes('Next steps') && initPublishFunc.includes('Extract') && initPublishFunc.includes('Follow the') && initPublishFunc.includes('Once deployed'));
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}