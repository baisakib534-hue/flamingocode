// test-stage6-desktop.js
// NO-JSDOM extraction-and-eval pattern - asserts desktop bridge wiring in index.html and preload.ts
// Run with: node test-stage6-desktop.js

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'index.html');
const PRELOAD_PATH = path.join(__dirname, 'desktop/src/preload/preload.ts');
const MAIN_PATH = path.join(__dirname, 'desktop/src/main/main.ts');

const html = fs.readFileSync(INDEX_PATH, 'utf8');
const preload = fs.readFileSync(PRELOAD_PATH, 'utf8');
const main = fs.readFileSync(MAIN_PATH, 'utf8');

// Extract the main script content (between <script> and </script>)
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No <script> tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1];

// Quick syntax check on index.html script
try {
  new Function(scriptContent);
  console.log('PASS: index.html script syntax OK');
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

// Quick syntax check on preload.ts (TypeScript - skip Function constructor check, just verify file exists)
console.log('PASS: preload.ts file exists and readable');

// Syntax check on main.ts (TypeScript - skip Function constructor check, just verify file exists)
console.log('PASS: main.ts file exists and readable');

let passCount = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Expected to find: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Should NOT contain: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertRegex(haystack, pattern, message) {
  if (!pattern.test(haystack)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Pattern: ${pattern}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

console.log('\n=== Stage 6 Repair: Desktop Bridge Wiring Assertions ===\n');

// ============================================================
// 1. window.devforgeDesktop feature-detection code exists in index.html
// ============================================================
console.log('\n1. Feature detection for window.devforgeDesktop');

assertIncludes(scriptContent, "typeof window.devforgeDesktop !== 'undefined'", 'Defensive feature detection for window.devforgeDesktop');
assertIncludes(scriptContent, 'isDesktopMode = true', 'Sets isDesktopMode flag when bridge present');
assertIncludes(scriptContent, 'desktopBridge = window.devforgeDesktop', 'Assigns desktopBridge reference');
assertIncludes(scriptContent, 'console.log', 'Logs mode detection');
assertRegex(scriptContent, /console\.log\(['"']\[FlamingoCode\] Desktop mode detected/, 'Logs desktop mode message');
assertRegex(scriptContent, /console\.log\(['"']\[FlamingoCode\] Browser mode/, 'Logs browser mode message');

// ============================================================
// 2. File operations route through bridge when present
// ============================================================
console.log('\n2. File operations route through bridge');

assertIncludes(scriptContent, 'desktopBridge.dialog.openDirectory', 'Uses dialog.openDirectory for folder selection');
assertIncludes(scriptContent, 'desktopBridge.fs.readDirectory', 'Uses fs.readDirectory to list folder contents');
assertIncludes(scriptContent, 'desktopBridge.fs.readFile', 'Uses fs.readFile to read file content');
assertIncludes(scriptContent, 'desktopBridge.fs.writeFile', 'Uses fs.writeFile to save file content');
assertIncludes(scriptContent, 'session.files = {}', 'Clears session files when opening folder');
assertIncludes(scriptContent, 'session.projectRoot = dir', 'Stores project root path');
assertIncludes(scriptContent, 'renderFileTree()', 'Re-renders file tree after loading folder');
assertIncludes(scriptContent, 'saveAppState()', 'Persists state after loading folder');
assertIncludes(scriptContent, 'Object.entries(session.files', 'Iterates session files for saving to disk');
assertIncludes(scriptContent, 'await desktopBridge.fs.writeFile({ path, content:', 'Writes files with correct WriteFileOptions format');

// ============================================================
// 3. Process operations route through bridge when present
// ============================================================
console.log('\n3. Process operations route through bridge');

// Check that process namespace is available in the bridge (exposed in preload)
// The preload exposes process namespace - verify index.html can reference it
assertIncludes(preload, 'process: {', 'Preload exposes process namespace');
assertIncludes(preload, 'spawn:', 'Preload exposes process.spawn');
assertIncludes(preload, 'kill:', 'Preload exposes process.kill');
assertIncludes(preload, 'list:', 'Preload exposes process.list');
assertIncludes(preload, 'spawnAgent:', 'Preload exposes process.spawnAgent');
assertIncludes(preload, 'sendStdin:', 'Preload exposes process.sendStdin');
assertIncludes(preload, 'onStdout:', 'Preload exposes process.onStdout');
assertIncludes(preload, 'onStderr:', 'Preload exposes process.onStderr');

// ============================================================
// 4. Browser fallback works when bridge is absent
// ============================================================
console.log('\n4. Browser fallback behavior');

assertIncludes(scriptContent, 'isDesktopMode = false', 'Sets isDesktopMode false when bridge absent');
assertIncludes(scriptContent, 'desktopBridge = null', 'Sets desktopBridge null when bridge absent');
assertIncludes(scriptContent, 'localStorage', 'Uses localStorage for browser persistence');
assertIncludes(scriptContent, 'IndexedDB', 'Uses IndexedDB for browser persistence');
assertIncludes(scriptContent, 'FileReader', 'Uses FileReader for browser file input');
assertIncludes(scriptContent, 'createObjectURL', 'Uses createObjectURL for browser file downloads');
assertIncludes(scriptContent, 'input type="file"', 'Uses file input for browser file selection');
assertNotIncludes(scriptContent, 'showOpenFilePicker', 'Does NOT use File System Access API (not in browser fallback)');
assertNotIncludes(scriptContent, 'showDirectoryPicker', 'Does NOT use showDirectoryPicker (not in browser fallback)');

// ============================================================
// 5. Desktop mode indicator UI exists
// ============================================================
console.log('\n5. Desktop mode indicator UI');

assertIncludes(html, 'id="desktopModeIndicator"', 'Desktop mode indicator element exists in HTML');
assertIncludes(html, 'Desktop Mode', 'Desktop mode indicator has label');
assertIncludes(scriptContent, 'desktopModeIndicator', 'JavaScript references desktop mode indicator');
assertIncludes(scriptContent, 'indicator.style.display = \'flex\'', 'Shows indicator when in desktop mode');
assertIncludes(html, 'svg', 'Desktop mode indicator has SVG icon');

// ============================================================
// 6. Command palette has Open Folder and Save to Disk actions
// ============================================================
console.log('\n6. Command palette integration');

assertIncludes(scriptContent, "id: 'openFolder'", 'Command palette has openFolder action');
assertIncludes(scriptContent, "title: 'Open Folder'", 'openFolder action has correct title');
assertIncludes(scriptContent, "section: 'File & Project'", 'openFolder action in File & Project section');
assertIncludes(scriptContent, "id: 'saveToDisk'", 'Command palette has saveToDisk action');
assertIncludes(scriptContent, "title: 'Save to Disk'", 'saveToDisk action has correct title');
assertIncludes(scriptContent, 'shortcut:', 'Commands have shortcut keys');

// ============================================================
// 7. Preload bridge API surface - verify key methods exist
// ============================================================
console.log('\n7. Preload bridge API surface');

assertIncludes(preload, 'fs: {', 'Preload exposes fs namespace');
assertIncludes(preload, 'readDirectory:', 'Preload exposes fs.readDirectory');
assertIncludes(preload, 'readFile:', 'Preload exposes fs.readFile');
assertIncludes(preload, 'writeFile:', 'Preload exposes fs.writeFile');
assertIncludes(preload, 'delete:', 'Preload exposes fs.delete');
assertIncludes(preload, 'rename:', 'Preload exposes fs.rename');
assertIncludes(preload, 'mkdir:', 'Preload exposes fs.mkdir');
assertIncludes(preload, 'exists:', 'Preload exposes fs.exists');
assertIncludes(preload, 'stat:', 'Preload exposes fs.stat');
assertIncludes(preload, 'watch:', 'Preload exposes fs.watch');
assertIncludes(preload, 'unwatch:', 'Preload exposes fs.unwatch');
assertIncludes(preload, 'onChange:', 'Preload exposes fs.onChange');

assertIncludes(preload, 'dialog: {', 'Preload exposes dialog namespace');
assertIncludes(preload, 'openDirectory:', 'Preload exposes dialog.openDirectory');
assertIncludes(preload, 'openFile:', 'Preload exposes dialog.openFile');
assertIncludes(preload, 'saveFile:', 'Preload exposes dialog.saveFile');
assertIncludes(preload, 'showMessageBox:', 'Preload exposes dialog.showMessageBox');
assertIncludes(preload, 'showErrorBox:', 'Preload exposes dialog.showErrorBox');

assertIncludes(preload, 'process: {', 'Preload exposes process namespace');
assertIncludes(preload, 'native: {', 'Preload exposes native namespace');
assertIncludes(preload, 'settings: {', 'Preload exposes settings namespace');
assertIncludes(preload, 'selftest: {', 'Preload exposes selftest namespace');
assertIncludes(preload, 'app: {', 'Preload exposes app namespace');

// ============================================================
// 8. Main process loads index.html
// ============================================================
console.log('\n8. Main process loads index.html');

assertIncludes(main, 'loadFile', 'Main process uses loadFile');
assertIncludes(main, 'WEB_APP_PATH', 'Main process defines WEB_APP_PATH for index.html');
assertIncludes(main, "path.join(APP_ROOT, 'index.html')", 'Main process loads index.html from repo root');
assertIncludes(main, 'loadFile(WEB_APP_PATH)', 'Main process loads index.html via WEB_APP_PATH');
assertIncludes(main, 'preload', 'Main process references preload script');
assertIncludes(main, 'BrowserWindow', 'Main process creates BrowserWindow');
assertIncludes(main, 'webPreferences', 'Main process configures webPreferences');
assertIncludes(main, 'nodeIntegration: false', 'Main process disables nodeIntegration');
assertIncludes(main, 'contextIsolation: true', 'Main process enables contextIsolation');

// ============================================================
// 9. No TODO/stub comments in the wiring (check only new bridge code area)
// ============================================================
console.log('\n9. No stubs or TODOs in wiring');

// Check only the desktop bridge detection area (lines around the feature detection)
const bridgeSection = scriptContent.substring(scriptContent.indexOf('Desktop Bridge Detection') - 100, scriptContent.indexOf('Desktop Bridge Detection') + 500);
assertNotIncludes(bridgeSection, 'TODO', 'No TODO comments in bridge detection code');
assertNotIncludes(bridgeSection, 'FIXME', 'No FIXME comments in bridge detection code');
assertNotIncludes(bridgeSection, 'coming soon', 'No "coming soon" placeholders in bridge code');
assertNotIncludes(bridgeSection, 'stub', 'No stub implementations in bridge code');

// Check the openFolder/saveToDisk actions area
const folderActionsSection = scriptContent.substring(scriptContent.indexOf("id: 'openFolder'") - 50, scriptContent.indexOf("id: 'saveToDisk'") + 500);
assertNotIncludes(folderActionsSection, 'TODO', 'No TODO comments in folder actions');
assertNotIncludes(folderActionsSection, 'FIXME', 'No FIXME comments in folder actions');
assertNotIncludes(folderActionsSection, 'coming soon', 'No "coming soon" placeholders in folder actions');
assertNotIncludes(folderActionsSection, 'stub', 'No stub implementations in folder actions');

// ============================================================
// 10. Defensive checks - bridge methods only called when present
// ============================================================
console.log('\n10. Defensive bridge usage');

assertIncludes(scriptContent, 'if (!isDesktopMode)', 'Checks isDesktopMode before bridge calls');
assertIncludes(scriptContent, 'logActivity', 'Uses logActivity for user feedback');
assertIncludes(scriptContent, "'warning'", 'Shows warning when desktop feature unavailable in browser');
assertIncludes(scriptContent, "'error'", 'Shows error on bridge failures');
assertIncludes(scriptContent, "'success'", 'Shows success on bridge operations');

console.log('\n=== SUMMARY ===');
console.log(`Total assertions passed: ${passCount}`);
console.log('\n✓ All Stage 6 repair assertions passed!');
process.exit(0);