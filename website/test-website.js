const fs = require('fs');
const path = require('path');

const WEBSITE_DIR = __dirname;
const API_DIR = path.join(WEBSITE_DIR, 'api');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✓ ${message}`);
    passed++;
  } else {
    console.error(`✗ ${message}`);
    failed++;
  }
}

function assertFileExists(filePath, message) {
  assert(fs.existsSync(filePath), message);
}

function assertFileContains(filePath, searchString, message) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    assert(false, `${message} (file missing: ${filePath})`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  assert(content.includes(searchString), message);
}

function assertFileNotContains(filePath, searchString, message) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    assert(false, `${message} (file missing: ${filePath})`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  assert(!content.includes(searchString), message);
}

function assertRegex(filePath, regex, message) {
  const exists = fs.existsSync(filePath);
  if (!exists) {
    assert(false, `${message} (file missing: ${filePath})`);
    return;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  assert(regex.test(content), message);
}

console.log('=== FlamingoCode Website + Relay Tests ===\n');

// Page structure tests
console.log('--- Page Structure ---');
assertFileExists(path.join(WEBSITE_DIR, 'index.html'), 'index.html exists');
assertFileExists(path.join(WEBSITE_DIR, 'download.html'), 'download.html exists');
assertFileExists(path.join(WEBSITE_DIR, 'docs.html'), 'docs.html exists');
assertFileExists(path.join(WEBSITE_DIR, 'account.html'), 'account.html exists');

assertFileContains(path.join(WEBSITE_DIR, 'index.html'), '<link rel="stylesheet" href="style.css">', 'index.html links style.css');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), '<script src="app.js"></script>', 'index.html loads app.js');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), '<link rel="stylesheet" href="style.css">', 'download.html links style.css');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), '<script src="app.js"></script>', 'download.html loads app.js');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), '<link rel="stylesheet" href="style.css">', 'docs.html links style.css');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), '<script src="app.js"></script>', 'docs.html loads app.js');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), '<link rel="stylesheet" href="style.css">', 'account.html links style.css');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), '<script src="app.js"></script>', 'account.html loads app.js');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), '<script src="account.js"></script>', 'account.html loads account.js');

// Landing page content
console.log('\n--- Landing Page Content ---');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'FlamingoCode', 'index.html contains brand name');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'Local-First Agentic Coding Studio', 'index.html contains tagline');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'Agent Teams', 'index.html mentions Agent Teams');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'Brain', 'index.html mentions Brain');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'Voice', 'index.html mentions Voice');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'Desktop + Phone', 'index.html mentions Desktop + Phone');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'No Cloud', 'index.html mentions No Cloud');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'flamingocode-logo.png', 'index.html references logo');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'href="download.html"', 'index.html links to download page');
assertFileContains(path.join(WEBSITE_DIR, 'index.html'), 'href="docs.html"', 'index.html links to docs page');

// Download page - honest "coming soon"
console.log('\n--- Download Page (Honest State) ---');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'api.github.com/repos/', 'download.html fetches live GitHub releases');
assertFileNotContains(path.join(WEBSITE_DIR, 'download.html'), 'All releases are signed', 'download.html has NO false signed claim');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'disabled', 'download.html has disabled buttons');
assertFileNotContains(path.join(WEBSITE_DIR, 'download.html'), 'href="flamingocode-', 'download.html has NO fake download links');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'github.com/baisakib534-hue/flamingocode/releases', 'download.html links to GitHub releases');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'Windows', 'download.html mentions Windows');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'macOS', 'download.html mentions macOS');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'Linux', 'download.html mentions Linux');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'Android', 'download.html mentions Android');
assertFileContains(path.join(WEBSITE_DIR, 'download.html'), 'iOS', 'download.html mentions iOS as Planned');

// Docs page
console.log('\n--- Docs Page ---');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'What Is FlamingoCode', 'docs.html has What Is section');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Quickstart', 'docs.html has Quickstart');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Phone Pairing', 'docs.html has Phone Pairing');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Agent Teams', 'docs.html has Agent Teams');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Providers', 'docs.html has Providers');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'FAQ', 'docs.html has FAQ');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Relay API Reference', 'docs.html has API Reference');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), '/api/devices/register', 'docs.html documents device register');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), '/api/tasks/poll', 'docs.html documents task poll');
assertFileContains(path.join(WEBSITE_DIR, 'docs.html'), 'Authorization: Bearer', 'docs.html documents auth header');

// Account page
console.log('\n--- Account Page ---');
assertFileNotContains(path.join(WEBSITE_DIR, 'account.html'), 'accounts.google.com/gsi/client', 'account.html has NO Google Identity Services (removed)');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'id="login-form"', 'account.html has email+password login form');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'id="signup-form"', 'account.html has signup form');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'Paired Devices', 'account.html has Paired Devices section');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'Task History', 'account.html has Task History section');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'Recordings', 'account.html has Recordings section');
assertFileContains(path.join(WEBSITE_DIR, 'account.html'), 'data-action="logout"', 'account.html has logout button');

// Shared CSS
console.log('\n--- Shared CSS ---');
assertFileExists(path.join(WEBSITE_DIR, 'style.css'), 'style.css exists');
const css = fs.readFileSync(path.join(WEBSITE_DIR, 'style.css'), 'utf8');
assert(css.includes('--accent-red: #f0513b'), 'CSS has brand red #f0513b');
assert(css.includes('--accent-teal: #2ec4b6'), 'CSS has brand teal #2ec4b6');
assert(css.includes('--bg: #0b0d14'), 'CSS has dark background');
assert(css.includes('.btn-primary'), 'CSS has primary button');
assert(css.includes('.btn-secondary'), 'CSS has secondary button');
assert(css.includes('.feature-card'), 'CSS has feature card');
assert(css.includes('.download-card'), 'CSS has download card');
assert(css.includes('@media (max-width: 640px)'), 'CSS has mobile responsive');
assert(css.includes('.alert-error'), 'CSS has error alert');
assert(css.includes('.alert-success'), 'CSS has success alert');

// Shared JS
console.log('\n--- Shared JS ---');
assertFileExists(path.join(WEBSITE_DIR, 'app.js'), 'app.js exists');
const appJs = fs.readFileSync(path.join(WEBSITE_DIR, 'app.js'), 'utf8');
assert(appJs.includes('App.init'), 'app.js has init');
assert(appJs.includes('restoreSession'), 'app.js restores session');
assert(appJs.includes('localStorage.getItem'), 'app.js uses localStorage');
assert(appJs.includes('Authorization'), 'app.js sends auth header');
assert(appJs.includes('apiBase'), 'app.js has apiBase');
assert(appJs.includes('validateToken'), 'app.js validates token');
assert(appJs.includes('showAlert'), 'app.js shows alerts');
assert(appJs.includes('showLoading'), 'app.js shows loading state');

// API endpoints — single merged function (api/index.js) + handlers.
// (Separate api/*.js functions each had their own memory store, so tokens
// created by auth.js never validated on devices.js — the relay was broken.)
console.log('\n--- API Endpoints ---');
assertFileExists(path.join(API_DIR, 'index.js'), 'api/index.js exists (single entrypoint)');
assertFileExists(path.join(API_DIR, '_handlers/auth.js'), 'api/_handlers/auth.js exists');
assertFileExists(path.join(API_DIR, '_handlers/devices.js'), 'api/_handlers/devices.js exists');
assertFileExists(path.join(API_DIR, '_handlers/tasks.js'), 'api/_handlers/tasks.js exists');
assertFileExists(path.join(API_DIR, '_handlers/recordings.js'), 'api/_handlers/recordings.js exists');
assertFileExists(path.join(API_DIR, '_lib/store.js'), 'api/_lib/store.js exists');
assertFileNotContains(path.join(API_DIR, 'index.js'), 'api/auth.js', 'no stale per-file function references');

const authApi = fs.readFileSync(path.join(API_DIR, '_handlers/auth.js'), 'utf8');
assertFileNotContains(path.join(API_DIR, '_handlers/auth.js'), 'google-auth-library', 'auth.js has NO Google OAuth (removed)');
assert(authApi.includes('sha256'), 'auth.js hashes tokens');
assert(authApi.includes('/api/auth/me'), 'auth.js has me endpoint');
assert(authApi.includes('/api/auth/login'), 'auth.js has login endpoint');
assert(authApi.includes('/api/auth/signup'), 'auth.js has signup endpoint');

const devicesApi = fs.readFileSync(path.join(API_DIR, '_handlers/devices.js'), 'utf8');
assert(devicesApi.includes("op === 'register'"), 'devices.js has register');
assert(devicesApi.includes('/api/devices'), 'devices.js has list');
assert(devicesApi.includes('DELETE'), 'devices.js has delete');
assert(devicesApi.includes('checkRateLimit'), 'devices.js has rate limiting');
assert(devicesApi.includes('pairCode'), 'devices.js generates pair code');

const tasksApi = fs.readFileSync(path.join(API_DIR, '_handlers/tasks.js'), 'utf8');
assert(tasksApi.includes('while (tasks.length === 0'), 'tasks.js implements long-poll');
assert(tasksApi.includes('24000'), 'tasks.js respects 25s Vercel limit');
assert(tasksApi.includes('envelope'), 'tasks.js handles opaque envelope');
assert(tasksApi.includes('checkRateLimit'), 'tasks.js has rate limiting');

const recordingsApi = fs.readFileSync(path.join(API_DIR, '_handlers/recordings.js'), 'utf8');
assert(recordingsApi.includes('/api/recordings/'), 'recordings.js has GET recording');
assert(recordingsApi.includes("op === 'register'"), 'recordings.js has register');
assert(recordingsApi.includes('expiresAt'), 'recordings.js returns expiresAt');

// Store / Security
console.log('\n--- Store & Security ---');
const storeJs = fs.readFileSync(path.join(API_DIR, '_lib/store.js'), 'utf8');
assert(storeJs.includes('sha256'), 'store.js hashes tokens');
assert(storeJs.includes('KV_REST_API_URL'), 'store.js reads KV env');
assert(storeJs.includes('KV_REST_API_TOKEN'), 'store.js reads KV token');
assert(storeJs.includes('memoryStore'), 'store.js has memory fallback');
assert(storeJs.includes('dev only'), 'store.js marks fallback as dev-only');
assert(storeJs.includes('checkRateLimit'), 'store.js has rate limiting');
assert(!storeJs.includes('apiKey'), 'store.js does NOT store raw API keys');
assert(storeJs.includes('envelope'), 'store.js mentions envelope');
assert(storeJs.includes('hash'), 'store.js mentions hashing');

// Vercel config
console.log('\n--- Vercel Config ---');
assertFileExists(path.join(WEBSITE_DIR, 'vercel.json'), 'vercel.json exists');
const vercelJson = fs.readFileSync(path.join(WEBSITE_DIR, 'vercel.json'), 'utf8');
assert(vercelJson.includes('api/index.js'), 'vercel.json configures single api entrypoint');
assert(vercelJson.includes('handler=:handler'), 'vercel.json routes to handler dispatch');
assert(!vercelJson.includes('api/auth.js'), 'vercel.json has NO separate auth function');
assert(vercelJson.includes('cleanUrls'), 'vercel.json has cleanUrls');
assert(vercelJson.includes('maxDuration'), 'vercel.json has maxDuration');

// DEPLOY.md
console.log('\n--- Deploy Docs ---');
assertFileExists(path.join(WEBSITE_DIR, 'DEPLOY.md'), 'DEPLOY.md exists');
const deploy = fs.readFileSync(path.join(WEBSITE_DIR, 'DEPLOY.md'), 'utf8');
assert(deploy.includes('Root Directory'), 'DEPLOY.md mentions Root Directory');
assert(deploy.includes('KV_REST_API_URL'), 'DEPLOY.md documents KV URL');
assert(deploy.includes('KV_REST_API_TOKEN'), 'DEPLOY.md documents KV token');
assert(deploy.includes('Vercel KV'), 'DEPLOY.md has Vercel KV setup');

// Assets
console.log('\n--- Assets ---');
assertFileExists(path.join(WEBSITE_DIR, 'assets/flamingocode-logo.png'), 'Logo copied to assets');

// No AI slop checks
console.log('\n--- No AI Slop Checks ---');
const allHtml = [
  path.join(WEBSITE_DIR, 'index.html'),
  path.join(WEBSITE_DIR, 'download.html'),
  path.join(WEBSITE_DIR, 'docs.html'),
  path.join(WEBSITE_DIR, 'account.html')
];
for (const file of allHtml) {
  const content = fs.readFileSync(file, 'utf8');
  assert(!content.includes('lorem ipsum'), `${file}: no lorem ipsum`);
  assert(!content.includes('Welcome to our'), `${file}: no generic welcome`);
  assert(!content.includes('amazing platform'), `${file}: no amazing platform`);
  assert(!content.includes('seamless'), `${file}: no "seamless"`);
  assert(!content.includes('leverage'), `${file}: no "leverage"`);
  assert(!content.includes('delve'), `${file}: no "delve"`);
}

// Summary
console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll tests passed!');
  process.exit(0);
}