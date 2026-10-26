// Test for GitHub Import (B4.1) - Direct function extraction
// Run with: node test-github-import.js

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

console.log('=== GitHub Import (B4.1) Tests (Direct Extraction) ===\n');

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

assert('GitHub import URL input exists', html.includes('id="githubImportUrl"'));
assert('GitHub import branch input exists', html.includes('id="githubImportBranch"'));
assert('GitHub import token input exists', html.includes('id="githubImportToken"'));
assert('GitHub import button exists', html.includes('id="btnImportGitHub"'));
assert('GitHub import status element exists', html.includes('id="githubImportStatus"'));
assert('GitHub import section has data-i18n label', html.includes('data-i18n="Import from GitHub"'));

// Check placeholders
const hasUrlPlaceholder = html.includes('id="githubImportUrl"') && html.includes('data-i18n-placeholder="https://github.com/owner/repo"');
const hasBranchPlaceholder = html.includes('id="githubImportBranch"') && html.includes('data-i18n-placeholder="Branch (optional, default: main)"');
const hasTokenPlaceholder = html.includes('id="githubImportToken"') && html.includes('data-i18n-placeholder="Token (optional, for private repos)"');
assert('URL input has data-i18n-placeholder', hasUrlPlaceholder);
assert('Branch input has data-i18n-placeholder', hasBranchPlaceholder);
assert('Token input has data-i18n-placeholder', hasTokenPlaceholder);

// ============================================================
// (b) IMPORT FUNCTION
// ============================================================

const importFunc = extractFunction(script, 'importFromGitHub');
assert('importFromGitHub function exists', importFunc !== null);

if (importFunc) {
  assert('importFromGitHub parses owner/repo from URL', importFunc.includes('github.com') && importFunc.includes('match'));
  assert('importFromGitHub calls GitHub API', importFunc.includes('api.github.com'));
  assert('importFromGitHub fetches repo metadata', importFunc.includes('/repos/'));
  assert('importFromGitHub fetches file tree', importFunc.includes('/git/trees/'));
  assert('importFromGitHub fetches file contents', importFunc.includes('/contents/'));
  assert('importFromGitHub uses Authorization header for token', importFunc.includes('Authorization') && importFunc.includes('token'));
  assert('importFromGitHub filters by extension', importFunc.includes('relevantExtensions'));
  assert('importFromGitHub caps file count', importFunc.includes('slice(0, 200)') || importFunc.includes('slice(0,200)'));
  assert('importFromGitHub calls scanForInjection', importFunc.includes('scanForInjection'));
  assert('importFromGitHub blocks unsafe files', importFunc.includes('blockedFiles') && importFunc.includes('!scan.clean'));
  assert('importFromGitHub continues with clean files only', importFunc.includes('scannedFiles'));
  assert('importFromGitHub calls createNewSession', importFunc.includes('createNewSession'));
  assert('importFromGitHub adds files to session', importFunc.includes('session.files'));
  assert('importFromGitHub calls switchSession', importFunc.includes('switchSession'));
  assert('importFromGitHub calls generateGitHubOverview', importFunc.includes('generateGitHubOverview'));
  assert('importFromGitHub calls writeBrainNote', importFunc.includes('writeBrainNote'));
  assert('importFromGitHub calls trackUsage', importFunc.includes('trackUsage'));
  assert('importFromGitHub has try/catch', importFunc.includes('try') && importFunc.includes('catch'));
  assert('importFromGitHub shows error in status', importFunc.includes('status.textContent') && importFunc.includes('err.message'));
  assert('importFromGitHub logs error', importFunc.includes('logActivity') && importFunc.includes('error'));
  assert('importFromGitHub clears URL input', importFunc.includes('urlInput.value') && importFunc.includes("''"));
  assert('importFromGitHub clears branch input', importFunc.includes('branchInput.value') && importFunc.includes("''"));
  assert('importFromGitHub clears token input', importFunc.includes('tokenInput.value') && importFunc.includes("''"));
}

// ============================================================
// (c) GENERATE GITHUB OVERVIEW
// ============================================================

const overviewFunc = extractFunction(script, 'generateGitHubOverview');
assert('generateGitHubOverview function exists', overviewFunc !== null);

if (overviewFunc) {
  assert('generateGitHubOverview includes source URL', overviewFunc.includes('Source:') && overviewFunc.includes('github.com'));
  assert('generateGitHubOverview includes branch', overviewFunc.includes('Branch:'));
  assert('generateGitHubOverview includes stars/forks', overviewFunc.includes('Stars:') && overviewFunc.includes('Forks:'));
  assert('generateGitHubOverview includes description', overviewFunc.includes('Description:'));
  assert('generateGitHubOverview includes import timestamp', overviewFunc.includes('Imported:'));
  assert('generateGitHubOverview calls detectStack', overviewFunc.includes('detectStack'));
  assert('generateGitHubOverview lists stack', overviewFunc.includes('Tech Stack') && overviewFunc.includes('forEach'));
  assert('generateGitHubOverview identifies key files', overviewFunc.includes('keyFiles') && (overviewFunc.includes('readme') || overviewFunc.includes('package.json')));
  assert('generateGitHubOverview lists key files', overviewFunc.includes('Key Files') && overviewFunc.includes('forEach'));
  assert('generateGitHubOverview shows top-level dirs', overviewFunc.includes('Project Structure') && overviewFunc.includes('topLevel'));
  assert('generateGitHubOverview checks for README', overviewFunc.includes('hasReadme'));
  assert('generateGitHubOverview checks for tests', overviewFunc.includes('hasTests'));
  assert('generateGitHubOverview checks for CI', overviewFunc.includes('hasCi'));
  assert('generateGitHubOverview checks for Docker', overviewFunc.includes('hasDocker'));
  assert('generateGitHubOverview checks for lint', overviewFunc.includes('hasLint'));
  assert('generateGitHubOverview checks for types', overviewFunc.includes('hasTypes'));
  assert('generateGitHubOverview has Present section', overviewFunc.includes('Present'));
  assert('generateGitHubOverview has Missing section', overviewFunc.includes('Missing') || overviewFunc.includes('Investigate'));
}

// ============================================================
// (d) DETECT STACK
// ============================================================

const detectFunc = extractFunction(script, 'detectStack');
assert('detectStack function exists', detectFunc !== null);

if (detectFunc) {
  assert('detectStack detects package.json', detectFunc.includes('package') && detectFunc.includes('.json'));
  assert('detectStack detects React', detectFunc.includes('react'));
  assert('detectStack detects Vue', detectFunc.includes('vue'));
  assert('detectStack detects Svelte', detectFunc.includes('svelte'));
  assert('detectStack detects Next.js', detectFunc.includes('next'));
  assert('detectStack detects Express', detectFunc.includes('express'));
  assert('detectStack detects TypeScript', detectFunc.includes('typescript') || detectFunc.includes('tsconfig'));
  assert('detectStack detects requirements.txt/pyproject.toml', detectFunc.includes('requirements') && detectFunc.includes('pyproject'));
  assert('detectStack detects Django', detectFunc.includes('django'));
  assert('detectStack detects Flask', detectFunc.includes('flask'));
  assert('detectStack detects FastAPI', detectFunc.includes('fastapi'));
  assert('detectStack detects Rust (Cargo.toml)', detectFunc.includes('cargo') && detectFunc.includes('toml'));
  assert('detectStack detects Go (go.mod)', detectFunc.includes('go') && detectFunc.includes('mod'));
  assert('detectStack detects Java (pom.xml/gradle)', detectFunc.includes('pom') || detectFunc.includes('gradle'));
  assert('detectStack detects PHP (composer.json)', detectFunc.includes('composer') && detectFunc.includes('json'));
  assert('detectStack detects C# (.csproj/.sln)', detectFunc.includes('csproj') || detectFunc.includes('sln'));
  assert('detectStack detects Ruby (Gemfile)', detectFunc.includes('gemfile'));
  assert('detectStack detects Docker', detectFunc.includes('dockerfile'));
  assert('detectStack detects GitHub Actions', detectFunc.includes('github') && detectFunc.includes('workflows'));
  assert('detectStack detects GitLab CI', detectFunc.includes('gitlab-ci'));
  assert('detectStack uses Set for deduplication', detectFunc.includes('new Set'));
}

// ============================================================
// (e) RENDER BACKUP TAB INTEGRATION
// ============================================================

const renderFunc = extractFunction(script, 'renderBackupTab');
assert('renderBackupTab gets GitHub elements', renderFunc && renderFunc.includes('btnImportGitHub') && renderFunc.includes('githubImportUrl') && renderFunc.includes('githubImportStatus'));
assert('renderBackupTab sets onclick for GitHub import', renderFunc && renderFunc.includes('importFromGitHub'));
assert('renderBackupTab enables/disables button based on URL', renderFunc && renderFunc.includes('githubBtn.disabled') && renderFunc.includes('githubUrl.value'));
assert('renderBackupTab clears status on input', renderFunc && renderFunc.includes('githubStatus.textContent') && renderFunc.includes("''"));

// ============================================================
// (f) BENGALI TRANSLATIONS
// ============================================================

const i18n = extractObject(script, 'I18N');
const translations = [
  'Import from GitHub',
  'Paste a GitHub repository URL to analyze and import it as a new project. Public repos work without a token.',
  'https://github.com/owner/repo',
  'Branch (optional, default: main)',
  'Token (optional, for private repos)'
];
for (const trans of translations) {
  assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
}

// UI elements have data-i18n attributes
assert('Section has data-i18n', html.includes('data-i18n="Import from GitHub"'));
assert('Description has data-i18n', html.includes('data-i18n="Paste a GitHub repository URL to analyze and import it as a new project. Public repos work without a token."'));
assert('Button has data-i18n', html.includes('id="btnImportGitHub"') && html.includes('data-i18n="Import from GitHub"'));

// ============================================================
// (g) EDGE CASES
// ============================================================

if (importFunc) {
  assert('importFromGitHub validates URL with regex', importFunc.includes('match') && importFunc.includes('github.com'));
  assert('importFromGitHub shows error for invalid URL', importFunc.includes('Invalid GitHub URL'));
  assert('importFromGitHub throws if no safe files', importFunc.includes('No safe files to import'));
  assert('importFromGitHub caps at 200 files', importFunc.includes('slice(0, 200)') || importFunc.includes('slice(0,200)'));
  assert('importFromGitHub uses batchSize', importFunc.includes('batchSize'));
  assert('importFromGitHub uses Promise.all for batch', importFunc.includes('Promise.all'));
  assert('importFromGitHub uses atob for decoding', importFunc.includes('atob'));
}

if (overviewFunc) {
  assert('generateGitHubOverview notes auto-generation', overviewFunc.includes('auto-generated') || overviewFunc.includes('auto generated'));
}

if (importFunc) {
  assert('importFromGitHub clicks code tab', importFunc.includes('right-tab') && importFunc.includes('code'));
  assert('importFromGitHub logs success', importFunc.includes('logActivity') && importFunc.includes('success'));
  assert('importFromGitHub logs blocked files warning', importFunc.includes('logActivity') && importFunc.includes('warning') && importFunc.includes('blocked'));
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}