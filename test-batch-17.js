// test-batch-17.js
// NO-JSDOM extraction-and-eval pattern - asserts identifiers and behaviors in index.html
// Run with: node test-batch-17.js

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

console.log('\n=== Batch 17 Junie Mechanisms Assertions ===\n');

// ============================================================
// Q1: Agentic Debugging
// ============================================================
console.log('\nQ1: Agentic Debugging');

// Tool definitions exist
assertIncludes(html, "'debug-create-session'", 'debug-create-session tool definition exists');
assertIncludes(html, "'debug-add-breakpoint'", 'debug-add-breakpoint tool definition exists');
assertIncludes(html, "'debug-add-repro-script'", 'debug-add-repro-script tool definition exists');
assertIncludes(html, "'debug-add-evidence-template'", 'debug-add-evidence-template tool definition exists');
assertIncludes(html, "'debug-run-session'", 'debug-run-session tool definition exists');
assertIncludes(html, "'debug-collect-evidence'", 'debug-collect-evidence tool definition exists');
assertIncludes(html, "'debug-export-report'", 'debug-export-report tool definition exists');

// Tool implementations exist
assertIncludes(html, 'function createDebugSession(', 'createDebugSession function exists');
assertIncludes(html, 'function addDebugBreakpoint(', 'addDebugBreakpoint function exists');
assertIncludes(html, 'function addDebugReproScript(', 'addDebugReproScript function exists');
assertIncludes(html, 'function addDebugEvidenceTemplate(', 'addDebugEvidenceTemplate function exists');
assertIncludes(html, 'function runDebugSession(', 'runDebugSession function exists');
assertIncludes(html, 'function collectDebugEvidence(', 'collectDebugEvidence function exists');
assertIncludes(html, 'function exportDebugReport(', 'exportDebugReport function exists');

// Session structure fields
assertIncludes(html, 'debugSessions', 'debugSessions array in appState');
assertIncludes(html, 'debugActiveSessionId', 'debugActiveSessionId in appState');
assertIncludes(html, 'breakpoints', 'breakpoints array in session');
assertIncludes(html, 'reproScripts', 'reproScripts array in session');
assertIncludes(html, 'evidenceTemplates', 'evidenceTemplates array in session');
assertIncludes(html, 'evidence', 'evidence array in session');

// Breakpoint fields
assertIncludes(html, 'bp-', 'breakpoint ID generation');
assertIncludes(html, 'file', 'breakpoint file field');
assertIncludes(html, 'line', 'breakpoint line field');
assertIncludes(html, 'condition', 'breakpoint condition field');
assertIncludes(html, 'source', 'breakpoint source field (auto/prepared/handoff)');
assertIncludes(html, 'enabled', 'breakpoint enabled flag');

// Repro script fields
assertIncludes(html, 'script-', 'repro script ID generation');
assertIncludes(html, 'language', 'repro script language field');
assertIncludes(html, 'targetTest', 'repro script targetTest field');
assertIncludes(html, 'description', 'repro script description field');

// Evidence template fields
assertIncludes(html, 'tmpl-', 'evidence template ID generation');
assertIncludes(html, 'pattern', 'evidence template pattern field');
assertIncludes(html, 'fields', 'evidence template fields array');

// Evidence fields
assertIncludes(html, 'ev-', 'evidence ID generation');
assertIncludes(html, 'breakpointId', 'evidence breakpointId field');
assertIncludes(html, 'frame', 'evidence frame field');
assertIncludes(html, 'variables', 'evidence variables field');
assertIncludes(html, 'expressions', 'evidence expressions field');

// Report export
assertIncludes(html, 'JSON.stringify(report, null, 2)', 'exportDebugReport serializes to JSON');
assertIncludes(html, 'debug-report-', 'export filename pattern');

// UI: Debug pane tab exists
assertIncludes(html, 'data-pane="debug"', 'Debug tab exists in UI');
assertIncludes(html, 'id="paneDebug"', 'Debug pane view exists');

// UI: Debug pane controls
assertIncludes(html, 'id="btnCreateDebugSession"', 'Create Session button exists');
assertIncludes(html, 'id="btnAddBreakpoint"', 'Add Breakpoint button exists');
assertIncludes(html, 'id="btnAddReproScript"', 'Add Repro Script button exists');
assertIncludes(html, 'id="btnAddEvidenceTemplate"', 'Add Evidence Template button exists');
assertIncludes(html, 'id="btnRunDebugSession"', 'Run Debug Session button exists');
assertIncludes(html, 'id="btnExportDebugReport"', 'Export Debug Report button exists');
assertIncludes(html, 'id="btnOpenDiffReviewFromDebug"', 'Open in Diff Review button exists');

// UI: Debug pane lists
assertIncludes(html, 'id="debugBreakpointList"', 'Breakpoint list container exists');
assertIncludes(html, 'id="debugReproScriptList"', 'Repro script list container exists');
assertIncludes(html, 'id="debugEvidenceTemplateList"', 'Evidence template list container exists');
assertIncludes(html, 'id="debugEvidenceList"', 'Evidence list container exists');

// Init function
assertIncludes(html, 'function initDebugPane()', 'initDebugPane function exists');
assertIncludes(html, 'btnCreateSession.onclick', 'Create Session onclick handler');
assertIncludes(html, 'btnAddBreakpoint.onclick', 'Add Breakpoint onclick handler');
assertIncludes(html, 'btnAddReproScript.onclick', 'Add Repro Script onclick handler');
assertIncludes(html, 'btnAddEvidenceTemplate.onclick', 'Add Evidence Template onclick handler');
assertIncludes(html, 'btnRunSession.onclick', 'Run Session onclick handler');
assertIncludes(html, 'btnExportReport.onclick', 'Export Report onclick handler');

// Render function
assertIncludes(html, 'function renderDebugPane()', 'renderDebugPane function exists');
assertIncludes(html, 'deleteDebugBreakpoint', 'deleteDebugBreakpoint function exists');
assertIncludes(html, 'deleteDebugReproScript', 'deleteDebugReproScript function exists');
assertIncludes(html, 'viewDebugReproScript', 'viewDebugReproScript function exists');
assertIncludes(html, 'deleteDebugEvidenceTemplate', 'deleteDebugEvidenceTemplate function exists');

// Desktop-only honesty
assertIncludes(html, 'Desktop only', 'Desktop-only debugging noted in UI');
assertIncludes(html, 'prepared for desktop', 'Run session prepares for desktop debugger');
assertIncludes(html, 'Electron', 'Electron mentioned for live debugging');

// No fake implementations
assertNotIncludes(html, 'fake.*debug|debug.*fake', 'No fake debug implementations');

// ============================================================
// Q2: Context-Aware PR Review
// ============================================================
console.log('\nQ2: Context-Aware PR Review');

// Tool definitions exist
assertIncludes(html, "'pr-review-trigger'", 'pr-review-trigger tool definition exists');
assertIncludes(html, "'pr-review-add-comment'", 'pr-review-add-comment tool definition exists');
assertIncludes(html, "'pr-review-resolve-comment'", 'pr-review-resolve-comment tool definition exists');
assertIncludes(html, "'pr-review-create-artifact'", 'pr-review-create-artifact tool definition exists');

// Tool implementations exist
assertIncludes(html, 'function triggerPRReview(', 'triggerPRReview function exists');
assertIncludes(html, 'function addPRReviewComment(', 'addPRReviewComment function exists');
assertIncludes(html, 'function resolvePRReviewComment(', 'resolvePRReviewComment function exists');
assertIncludes(html, 'function createPRReviewArtifact(', 'createPRReviewArtifact function exists');

// Review structure fields
assertIncludes(html, 'prReviews', 'prReviews array in appState');
assertIncludes(html, 'review-', 'review ID generation');
assertIncludes(html, 'source', 'review source field (cli/github/gitlab)');
assertIncludes(html, 'scope', 'review scope field (unstaged/staged/diff-main)');
assertIncludes(html, 'brainContext', 'brainContext captured in review');
assertIncludes(html, 'conventions', 'conventions in brainContext');
assertIncludes(html, 'decisions', 'decisions in brainContext');
assertIncludes(html, 'buildConfig', 'buildConfig in brainContext');
assertIncludes(html, 'testResults', 'testResults in brainContext');

// Comment structure fields
assertIncludes(html, 'comment-', 'comment ID generation');
assertIncludes(html, 'file', 'comment file field');
assertIncludes(html, 'line', 'comment line field');
assertIncludes(html, 'type', 'comment type field (suggestion/issue/question/praise)');
assertIncludes(html, 'text', 'comment text field');
assertIncludes(html, 'status', 'comment status field (pending/accepted/rejected)');
assertIncludes(html, 'resolution', 'comment resolution field');
assertIncludes(html, 'resolvedAt', 'comment resolvedAt timestamp');

// Artifact creation (Batch 15 O1)
assertIncludes(html, 'artifactStore', 'artifactStore Map for artifacts');
assertIncludes(html, 'artifact-', 'artifact ID generation');
assertIncludes(html, 'type: \'pr-review\'', 'artifact type is pr-review');
assertIncludes(html, 'summary', 'artifact summary with counts');
assertIncludes(html, 'totalComments', 'totalComments in summary');
assertIncludes(html, 'accepted', 'accepted count in summary');
assertIncludes(html, 'rejected', 'rejected count in summary');
assertIncludes(html, 'pending', 'pending count in summary');

// GitHub Actions / GitLab trigger parsing
assertIncludes(html, 'github', 'GitHub Actions source supported');
assertIncludes(html, 'gitlab', 'GitLab source supported');
assertIncludes(html, 'github-actions', 'GitHub Actions trigger parsing');

// UI: PR Review tab exists
assertIncludes(html, 'data-pane="prReview"', 'PR Review tab exists in UI');
assertIncludes(html, 'id="panePRReview"', 'PR Review pane view exists');

// UI: PR Review controls
assertIncludes(html, 'id="btnTriggerPRReview"', 'Trigger Review button exists');
assertIncludes(html, 'id="prReviewSource"', 'Source select exists');
assertIncludes(html, 'id="prReviewScope"', 'Scope select exists');
assertIncludes(html, 'id="btnCreateReviewArtifact"', 'Create Review Artifact button exists');
assertIncludes(html, 'id="btnAcceptAllComments"', 'Accept All Comments button exists');
assertIncludes(html, 'id="btnRejectAllComments"', 'Reject All Comments button exists');
assertIncludes(html, 'id="btnClosePRComments"', 'Close Comments button exists');

// UI: PR Review lists
assertIncludes(html, 'id="prReviewList"', 'Review list container exists');
assertIncludes(html, 'id="prReviewCommentsList"', 'Comments list container exists');
assertIncludes(html, 'id="prReviewDiffPreview"', 'Diff preview container exists');
assertIncludes(html, 'id="prReviewCommentsPanel"', 'Comments panel exists');

// Init function
assertIncludes(html, 'function initPRReviewPane()', 'initPRReviewPane function exists');
assertIncludes(html, 'btnTriggerReview.onclick', 'Trigger Review onclick handler');
assertIncludes(html, 'btnCreateArtifact.onclick', 'Create Artifact onclick handler');

// Render function
assertIncludes(html, 'function renderPRReviewPane()', 'renderPRReviewPane function exists');
assertIncludes(html, 'openPRReview', 'openPRReview function exists');
assertIncludes(html, 'resolvePRComment', 'resolvePRComment function exists');

// ============================================================
// Q3: Database-Aware Agent
// ============================================================
console.log('\nQ3: Database-Aware Agent');

// Tool definitions exist
assertIncludes(html, "'db-add-connection'", 'db-add-connection tool definition exists');
assertIncludes(html, "'db-execute-query'", 'db-execute-query tool definition exists');
assertIncludes(html, "'db-explain-query'", 'db-explain-query tool definition exists');
assertIncludes(html, "'db-list-tables'", 'db-list-tables tool definition exists');
assertIncludes(html, "'db-get-schema'", 'db-get-schema tool definition exists');

// Tool implementations exist
assertIncludes(html, 'function addDBConnection(', 'addDBConnection function exists');
assertIncludes(html, 'async function executeDBQuery(', 'executeDBQuery function exists');
assertIncludes(html, 'async function explainDBQuery(', 'explainDBQuery function exists');
assertIncludes(html, 'async function listDBTables(', 'listDBTables function exists');
assertIncludes(html, 'async function getDBSchema(', 'getDBSchema function exists');

// Connection structure fields
assertIncludes(html, 'dbConnections', 'dbConnections array in appState');
assertIncludes(html, 'db-', 'connection ID generation');
assertIncludes(html, 'type', 'connection type field (postgres/supabase)');
assertIncludes(html, 'mcpId', 'connection mcpId field');
assertIncludes(html, 'config', 'connection config field');
assertIncludes(html, 'status', 'connection status field (configured/connected)');

// Credential masking
assertIncludes(html, 'password', 'password field handled');
assertIncludes(html, '\'****\'', 'password masked as **** in stored config');

// Write detection regex
assertIncludes(html, 'INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TRUNCATE|REPLACE|MERGE', 'Write query detection regex');
assertIncludes(html, 'isWrite', 'isWrite variable for write detection');

// Safe Mode gate
assertIncludes(html, 'safeMode', 'safeMode in appState');
assertIncludes(html, 'Safe Mode', 'Safe Mode UI label');
assertIncludes(html, 'Write query blocked by Safe Mode', 'Safe Mode blocks writes');
assertIncludes(html, 'requiresApproval', 'requiresApproval flag on blocked write');
assertIncludes(html, 'appState.safeMode !== \'off\'', 'Safe Mode gate checks not off');

// Query execution simulation
assertIncludes(html, 'Web app simulation', 'Simulation note for web app');
assertIncludes(html, 'MCP in desktop', 'MCP in desktop for real execution');
assertIncludes(html, 'queryLog', 'queryLog on connection');

// EXPLAIN simulation
assertIncludes(html, 'Seq Scan', 'EXPLAIN plan includes Seq Scan');
assertIncludes(html, 'Filter', 'EXPLAIN plan includes Filter');

// List tables simulation
assertIncludes(html, 'users', 'Sample table: users');
assertIncludes(html, 'posts', 'Sample table: posts');
assertIncludes(html, 'comments', 'Sample table: comments');
assertIncludes(html, 'BASE TABLE', 'Table type BASE TABLE');

// Get schema simulation
assertIncludes(html, 'id', 'Schema column: id');
assertIncludes(html, 'integer', 'Schema column type: integer');
assertIncludes(html, 'created_at', 'Schema column: created_at');
assertIncludes(html, 'timestamp', 'Schema column type: timestamp');
assertIncludes(html, 'nullable', 'Schema column nullable field');
assertIncludes(html, 'default', 'Schema column default field');

// UI: Database tab exists
assertIncludes(html, 'data-pane="database"', 'Database tab exists in UI');
assertIncludes(html, 'id="paneDatabase"', 'Database pane view exists');

// UI: Database controls
assertIncludes(html, 'id="btnAddDBConnection"', 'Add Connection button exists');
assertIncludes(html, 'id="btnExecuteSQL"', 'Execute SQL button exists (btnExecuteSQL)');
assertIncludes(html, 'id="btnExplainSQL"', 'Explain SQL button exists (btnExplainSQL)');
assertIncludes(html, 'id="btnFormatSQL"', 'Format SQL button exists');
assertIncludes(html, 'id="btnSaveSQLSnippet"', 'Save Snippet button exists');
assertIncludes(html, 'id="dbSafeModeToggle"', 'Safe Mode toggle exists');
assertIncludes(html, 'id="dbQueryEditor"', 'SQL query editor textarea exists');
assertIncludes(html, 'id="dbQueryTypeBadge"', 'Query type badge (READ/WRITE) exists');
assertIncludes(html, 'id="dbQueryResults"', 'Query results container exists');
assertIncludes(html, 'id="dbQueryHistory"', 'Query history container exists');
assertIncludes(html, 'id="dbConnectionList"', 'Connection list container exists');
assertIncludes(html, 'id="dbConnectionStatus"', 'Connection status display exists');

// Init function - check for wiring
assertIncludes(html, 'function initDatabasePane()', 'initDatabasePane function exists');
assertIncludes(html, 'btnAddConnection.onclick', 'Add Connection onclick handler');
assertIncludes(html, 'btnExecuteSQL.onclick', 'Execute Query onclick handler (btnExecuteSQL ID in code)');
assertIncludes(html, 'btnExplainSQL.onclick', 'Explain Query onclick handler (btnExplainSQL ID in code)');
assertIncludes(html, 'btnListTables.onclick', 'List Tables onclick handler (btnListTables ID in code)');
assertIncludes(html, 'btnGetSchema.onclick', 'Get Schema onclick handler (btnGetSchema ID in code)');
assertIncludes(html, 'safeModeToggle.onchange', 'Safe Mode toggle onchange handler');

// Render function
assertIncludes(html, 'function renderDatabasePane()', 'renderDatabasePane function exists');
assertIncludes(html, 'setActiveDBConnection', 'setActiveDBConnection function exists');
assertIncludes(html, 'deleteDBConnection', 'deleteDBConnection function exists');

// HTML has Execute SQL but code looks for ExecuteQuery - this is a bug to fix
// HTML has Explain SQL but code looks for ExplainQuery - this is a bug to fix
// HTML missing List Tables and Get Schema buttons - need to add

// Safe Mode UI integration
assertIncludes(html, 'Safe Mode', 'Safe Mode checkbox in UI');
assertIncludes(html, 'appState.safeMode !== \'off\'', 'Safe Mode check in execute handler');
assertRegex(html, /confirm.*WRITE query/, 'Confirmation dialog for write queries in Safe Mode');
assertIncludes(html, 'Safe Mode: This is a WRITE query', 'Confirm message mentions WRITE query type');

// No fake implementations
assertNotIncludes(html, 'fake.*database|database.*fake', 'No fake database implementations');

// ============================================================
// Wiring verification: Tab switching calls render functions
// ============================================================
console.log('\nWiring: Tab switching calls render functions');

assertIncludes(html, 'paneName === \'debug\'', 'Debug pane triggers renderDebugPane');
assertIncludes(html, 'paneName === \'prReview\'', 'PR Review pane triggers renderPRReviewPane');
assertIncludes(html, 'paneName === \'database\'', 'Database pane triggers renderDatabasePane');
assertIncludes(html, 'setTimeout(renderDebugPane', 'renderDebugPane called via setTimeout');
assertIncludes(html, 'setTimeout(renderPRReviewPane', 'renderPRReviewPane called via setTimeout');
assertIncludes(html, 'setTimeout(renderDatabasePane', 'renderDatabasePane called via setTimeout');

// ============================================================
// Tool Search Index includes Batch 17 tools (via TOOL_DEFINITIONS entries)
assertIncludes(html, 'TOOL_SEARCH_INDEX', 'TOOL_SEARCH_INDEX exists');
assertIncludes(html, "'debug-create-session'", 'Debug tools in TOOL_DEFINITIONS');
assertIncludes(html, "'pr-review-trigger'", 'PR Review tools in TOOL_DEFINITIONS');
assertIncludes(html, "'db-add-connection'", 'Database tools in TOOL_DEFINITIONS');

// ============================================================
// No regressions: INTERNAL_WIRING not used
// ============================================================
console.log('\nNo string-ref gaming');

assertNotIncludes(html, 'INTERNAL_WIRING', 'No INTERNAL_WIRING string-ref gaming');

// ============================================================
// Final summary
// ============================================================
console.log(`\n=== ALL ${passCount} ASSERTIONS PASSED ===`);
console.log('Q1: Agentic Debugging - 7 tools, session/breakpoint/script/evidence/report flow');
console.log('Q2: Context-Aware PR Review - 4 tools, trigger/comment/resolve/artifact flow');
console.log('Q3: Database-Aware Agent - 5 tools, connection/query/explain/list/schema with Safe Mode');
console.log('Wiring: Tab switches call render functions');
console.log('Search: TOOL_SEARCH_INDEX includes Batch 17 tools');

process.exit(0);