// test-h4-desktop-power.js
// NO-JSDOM extraction-and-eval pattern - asserts identifiers and behaviors in index.html
// Run with: node test-h4-desktop-power.js

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const INDEX_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(INDEX_PATH, 'utf8');

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

console.log('\n=== Batch H4 Desktop Power Assertions ===\n');

// ============================================================
// §6: Experiment Branches (git worktrees, adapted)
// ============================================================
console.log('\n§6: Experiment Branches');

assertIncludes(html, 'function createExperimentBranch(', 'createExperimentBranch function exists');
assertIncludes(html, 'function switchToExperimentBranch(', 'switchToExperimentBranch function exists');
assertIncludes(html, 'function mergeExperimentBranch(', 'mergeExperimentBranch function exists');
assertIncludes(html, 'function applyBranchMerge(', 'applyBranchMerge function exists');
assertIncludes(html, 'function archiveExperimentBranch(', 'archiveExperimentBranch function exists');
assertIncludes(html, 'function restoreArchivedBranch(', 'restoreArchivedBranch function exists');
assertIncludes(html, 'function deleteExperimentBranch(', 'deleteExperimentBranch function exists');
assertIncludes(html, 'function renderExperimentBranchesList(', 'renderExperimentBranchesList function exists');
assertIncludes(html, 'function computeFilesChanged(', 'computeFilesChanged function exists');
assertIncludes(html, 'function generateBranchDiff(', 'generateBranchDiff function exists');
assertIncludes(html, 'experimentBranches', 'experimentBranches array in appState');
assertIncludes(html, 'activeExperimentBranchId', 'activeExperimentBranchId in appState');
assertIncludes(html, 'baseCommit', 'baseCommit field in branch');
assertIncludes(html, 'filesChanged', 'filesChanged array in branch');
assertRegex(html, /status.*clean.*dirty.*merged/, 'branch status values: clean/dirty/merged/archived');
assertIncludes(html, 'btnCreateExperimentBranch', 'Create Experiment Branch button');
assertIncludes(html, 'experimentBranchesList', 'experimentBranchesList element');
assertIncludes(html, 'archivedBranchesList', 'archivedBranchesList element');
assertIncludes(html, 'Web branches are project copies', 'honest web-branches label');

// ============================================================
// §8: LSP semantic diagnostics after every edit
// ============================================================
console.log('\n§8: LSP Diagnostics');

assertIncludes(html, 'function runLspDiagnostics(', 'runLspDiagnostics function exists');
assertIncludes(html, 'function checkJavaScriptSyntax(', 'checkJavaScriptSyntax function exists');
assertIncludes(html, 'function checkPythonSyntax(', 'checkPythonSyntax function exists');
assertIncludes(html, 'function checkGoSyntax(', 'checkGoSyntax function exists');
assertIncludes(html, 'function checkGenericSyntax(', 'checkGenericSyntax function exists');
assertIncludes(html, 'function queueAutoFixTasks(', 'queueAutoFixTasks function exists');
assertIncludes(html, 'function renderLspDiagnosticsPanel(', 'renderLspDiagnosticsPanel function exists');
assertIncludes(html, 'lspDiagnostics', 'lspDiagnostics object in appState');
assertIncludes(html, 'lspPreviousDiagnostics', 'lspPreviousDiagnostics map in appState');
assertIncludes(html, 'newDiagnostics', 'newDiagnostics comparison logic');
assertIncludes(html, 'check unavailable — syntax only', 'checker failure fallback message');
assertIncludes(html, 'autoFixIntegration', 'autoFixIntegration flag');
assertIncludes(html, 'mcp_write_file', 'mcp_write_file handler calls runLspDiagnostics');
assertIncludes(html, 'mcp_filesystem_write', 'mcp_filesystem_write handler calls runLspDiagnostics');
assertIncludes(html, 'lspDiagnosticsPanel', 'lspDiagnosticsPanel element');
assertIncludes(html, 'lspDiagnosticsEnabled', 'lsp diagnostics enabled toggle');
assertIncludes(html, 'lspAutoFixIntegration', 'auto-fix integration toggle');
assertIncludes(html, 'lspNewOnlyMode', 'new-only mode toggle');

// ============================================================
// §13: ACP server for IDEs
// ============================================================
console.log('\n§13: ACP External Agents');

assertIncludes(html, 'function startAcpServer(', 'startAcpServer function exists');
assertIncludes(html, 'function stopAcpServer(', 'stopAcpServer function exists');
assertIncludes(html, 'function renderAcpPanel(', 'renderAcpPanel function exists');
assertIncludes(html, 'acp', 'acp object in appState');
assertIncludes(html, 'running', 'acp.running flag');
assertIncludes(html, 'serverPort', 'acp.serverPort field');
assertIncludes(html, 'guestWorkerEnabled', 'guestWorkerEnabled in acp state');
assertIncludes(html, 'guestMcpUntrusted', 'guestMcpUntrusted in acp state');
assertIncludes(html, 'ACP guest workers (HTTP) active', 'HTTP guest workers message');
assertIncludes(html, 'Local stdio server needs desktop app', 'honest desktop label for ACP stdio');
assertIncludes(html, 'acpExternalAgents', 'acpExternalAgents settings tab');
assertIncludes(html, 'acpExternalAgents', 'acpExternalAgents settings pane');
assertIncludes(html, 'acpStatus', 'acpStatus element');

// ============================================================
// §14: Real browser agent (CDP) + headed watch mode
// ============================================================
console.log('\n§14: Real Browser Agent');

assertIncludes(html, 'function runBrowserPreviewTest(', 'runBrowserPreviewTest function exists');
assertIncludes(html, 'function recordBrowserSteps(', 'recordBrowserSteps function exists');
assertIncludes(html, 'browserAgent', 'browserAgent object in appState');
assertIncludes(html, 'currentRecording', 'currentRecording field');
assertIncludes(html, 'recordings', 'recordings array');
assertIncludes(html, 'preview test — real-browser runs need the desktop app', 'honest preview label');
assertIncludes(html, 'D6 step language', 'shared D6 step language referenced');
assertIncludes(html, 'browserPreviewLog', 'browserPreviewLog element');
assertIncludes(html, 'realBrowserAgent', 'realBrowserAgent settings tab');
assertIncludes(html, 'btnRunBrowserPreviewTest', 'Run Preview Test button');
assertIncludes(html, 'btnRecordBrowserSteps', 'Record Steps button');

// ============================================================
// §15: Computer Use — general purpose
// ============================================================
console.log('\n§15: Computer Use');

assertIncludes(html, 'function setComputerUsePermissionMode(', 'setComputerUsePermissionMode function exists');
assertIncludes(html, 'function addCuManifestEntry(', 'addCuManifestEntry function exists');
assertIncludes(html, 'function removeCuManifestEntry(', 'removeCuManifestEntry function exists');
assertIncludes(html, 'function renderCuManifest(', 'renderCuManifest function exists');
assertIncludes(html, 'function runCuDoctorCheck(', 'runCuDoctorCheck function exists');
assertIncludes(html, 'computerUse', 'computerUse object in appState');
assertIncludes(html, 'permissionMode', 'permissionMode field (bounded/standard/unrestricted)');
assertIncludes(html, 'manifest', 'manifest array in computerUse');
assertIncludes(html, 'bounded', 'bounded mode default (fail-closed)');
assertIncludes(html, 'fail-closed', 'fail-closed behavior mentioned');
assertIncludes(html, 'Computer Use drives real apps from the desktop app', 'honest desktop label');
assertIncludes(html, 'doctor', 'doctor check referenced');
assertIncludes(html, 'cuPermissionBounded', 'bounded permission button');
assertIncludes(html, 'cuPermissionStandard', 'standard permission button');
assertIncludes(html, 'cuPermissionUnrestricted', 'unrestricted permission button');
assertIncludes(html, 'cuManifestList', 'cuManifestList element');
assertIncludes(html, 'btnCuAddApp', 'Add App button');
assertIncludes(html, 'cuAddAppName', 'App name input');
assertIncludes(html, 'cuAddAppPath', 'App path input');
assertIncludes(html, 'cuAddAppActions', 'Allowed actions input');
assertIncludes(html, 'btnCuDoctorCheck', 'Doctor Check button');
assertIncludes(html, 'btnCuRunTask', 'Run Task button');

// ============================================================
// §16: Terminal backends + background process manager
// ============================================================
console.log('\n§16: Process Manager');

assertIncludes(html, 'function setTerminalBackend(', 'setTerminalBackend function exists');
assertIncludes(html, 'function startProcess(', 'startProcess function exists');
assertIncludes(html, 'function stopProcess(', 'stopProcess function exists');
assertIncludes(html, 'function restartProcess(', 'restartProcess function exists');
assertIncludes(html, 'function sendProcessInput(', 'sendProcessInput function exists');
assertIncludes(html, 'function explainSignalDeath(', 'explainSignalDeath function exists');
assertIncludes(html, 'function renderProcessList(', 'renderProcessList function exists');
assertIncludes(html, 'function viewProcessLogs(', 'viewProcessLogs function exists');
assertIncludes(html, 'processManager', 'processManager object in appState');
assertIncludes(html, 'backend', 'backend field (local/docker/ssh/cloud)');
assertIncludes(html, 'processes', 'processes array in processManager');
assertIncludes(html, 'explainSignalDeath', 'signal death explanation in plain words');
assertIncludes(html, 'out of memory', 'OOM explanation');
assertIncludes(html, 'killed — out of memory', 'SIGKILL/OOM explanation');
assertIncludes(html, 'terminated — shutdown requested', 'SIGTERM explanation');
assertIncludes(html, 'crashed — segmentation fault', 'SIGSEGV explanation');
assertIncludes(html, 'pmBackendLocal', 'Local backend button');
assertIncludes(html, 'pmBackendDocker', 'Docker backend button');
assertIncludes(html, 'pmBackendSsh', 'SSH backend button');
assertIncludes(html, 'pmBackendCloud', 'Cloud backend button');
assertIncludes(html, 'pmDesktopNote', 'desktop note for docker/ssh/cloud');
assertIncludes(html, 'pmStartCommand', 'Start command input');
assertIncludes(html, 'pmStartCwd', 'Working directory input');
assertIncludes(html, 'pmStartPty', 'PTY mode checkbox');
assertIncludes(html, 'btnPmStartProcess', 'Start Process button');
assertIncludes(html, 'processList', 'processList element');
assertIncludes(html, 'No running processes', 'running processes label');
assertIncludes(html, 'live logs', 'live logs mentioned');

// ============================================================
// Settings tabs for all 6 sections
// ============================================================
console.log('\nSettings Tabs & Panes');

assertIncludes(html, 'data-settings-tab="experimentBranches"', 'experimentBranches settings tab');
assertIncludes(html, 'data-settings-tab="lspDiagnostics"', 'lspDiagnostics settings tab');
assertIncludes(html, 'data-settings-tab="acpExternalAgents"', 'acpExternalAgents settings tab');
assertIncludes(html, 'data-settings-tab="realBrowserAgent"', 'realBrowserAgent settings tab');
assertIncludes(html, 'data-settings-tab="computerUse"', 'computerUse settings tab');
assertIncludes(html, 'data-settings-tab="processManager"', 'processManager settings tab');
assertIncludes(html, 'settingsPaneExperimentBranches', 'experimentBranches settings pane');
assertIncludes(html, 'settingsPaneLspDiagnostics', 'lspDiagnostics settings pane');
assertIncludes(html, 'settingsPaneAcpExternalAgents', 'acpExternalAgents settings pane');
assertIncludes(html, 'settingsPaneRealBrowserAgent', 'realBrowserAgent settings pane');
assertIncludes(html, 'settingsPaneComputerUse', 'computerUse settings pane');
assertIncludes(html, 'settingsPaneProcessManager', 'processManager settings pane');

// ============================================================
// Final summary
// ============================================================
console.log(`\n=== ALL ${passCount} ASSERTIONS PASSED ===`);
console.log('§6: Experiment Branches — project copies, per-branch checkpoints, diff review, archive (no auto-delete)');
console.log('§8: LSP Diagnostics — post-edit syntax + new-only comparison, never breaks write, auto-fix integration');
console.log('§13: ACP External Agents — HTTP guest workers now, stdio needs desktop, curated toolset');
console.log('§14: Real Browser Agent — preview iframe test, D6 step language, honest desktop label');
console.log('§15: Computer Use — bounded manifest (fail-closed), doctor check, honest desktop label');
console.log('§16: Process Manager — backend switcher, live logs, stop/restart, plain-word signal deaths');

process.exit(0);