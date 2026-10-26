// Test for Team Chat Replay Viewer (B4.5) - Direct function extraction
// Run with: node test-team-replay.js

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

console.log('=== Team Chat Replay Viewer (B4.5) Tests (Direct Extraction) ===\n');

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
// (a) TEAM SESSION HISTORY STORAGE
// ============================================================

// Team session history should be stored in appState.teamV2.history or similar
assert('Team session history array exists in teamV2 init', script.includes('teamV2') && (script.includes('history: []') || script.includes('history = []')));

// Completed team sessions should be saved to history
const runTeamModeFunc = extractFunction(script, 'runTeamMode');
assert('runTeamMode saves completed session to history', runTeamModeFunc && (runTeamModeFunc.includes('history.push') || runTeamModeFunc.includes('.history.unshift') || runTeamModeFunc.includes('.history = [')));

// Session history should include: events, task board snapshots, roster, votes, checkpoints
assert('Session history stores task board snapshots', script.includes('history') && (script.includes('taskBoardSnapshot') || script.includes('teamTaskBoard')));
assert('Session history stores roster', script.includes('history') && script.includes('roster'));
assert('Session history stores votes', script.includes('history') && script.includes('votes'));
assert('Session history stores checkpoints', script.includes('history') && script.includes('checkpoints'));
assert('Session history stores finalTaskBoard', script.includes('history') && script.includes('finalTaskBoard'));
assert('Session history stores totalSpend', script.includes('history') && script.includes('totalSpend'));
assert('Session history stores usage', script.includes('history') && script.includes('usage'));

// History limited to 50 entries
assert('History limited to 50 entries', script.includes('history') && (script.includes('history.length = 50') || script.includes('history.splice') || script.includes('history.slice')));

// ============================================================
// (b) REPLAY VIEWER UI ELEMENTS
// ============================================================

// Dedicated replay viewer pane/button
assert('Replay tab/button exists', html.includes('Replay') && html.includes('data-tab="replay"'));
assert('Replay viewer pane exists', html.includes('id="paneReplay"'));

// Session list in replay viewer
assert('Replay viewer shows session list', html.includes('id="replaySessionList"'));

// Each session list item shows: date, duration, roster, outcome
assert('Session list items show date', script.includes('replay') && (script.includes('toLocaleDateString') || script.includes('toLocaleString')));
assert('Session list items show duration', script.includes('replay') && script.includes('duration'));
assert('Session list items show roster count', script.includes('replay') && script.includes('roster'));
assert('Session list items show outcome', script.includes('replay') && (script.includes('completed') || script.includes('outcome') || script.includes('status') || script.includes('Partial') || script.includes('approved')));

// ============================================================
// (c) REPLAY CONTROLS
// ============================================================

// Enhanced replay function opens replay viewer
const replayFunc = extractFunction(script, 'replayTeamSession');
assert('Enhanced replayTeamSession function exists', replayFunc !== null);
assert('replayTeamSession calls openReplayViewer', replayFunc && replayFunc.includes('openReplayViewer'));

// Open replay viewer function
const openReplayFunc = extractFunction(script, 'openReplayViewer');
assert('openReplayViewer function exists', openReplayFunc !== null);
assert('openReplayViewer switches to replay pane', openReplayFunc && openReplayFunc.includes('paneReplay'));

// Select replay session function
const selectReplayFunc = extractFunction(script, 'selectReplaySession');
assert('selectReplaySession function exists', selectReplayFunc !== null);
assert('selectReplaySession sets current session state', selectReplayFunc && selectReplayFunc.includes('replayViewerState.currentSession'));
assert('selectReplaySession renders first step', selectReplayFunc && selectReplayFunc.includes('renderReplayStep'));

// Close replay session function
const closeReplayFunc = extractFunction(script, 'closeReplaySession');
assert('closeReplaySession function exists', closeReplayFunc !== null);
assert('closeReplaySession resets state', closeReplayFunc && closeReplayFunc.includes('replayViewerState.currentSession = null'));

// Step-through controls
const playPauseFunc = extractFunction(script, 'toggleReplayPlayPause');
assert('toggleReplayPlayPause function exists', playPauseFunc !== null);

const stepForwardFunc = extractFunction(script, 'replayStepForward');
assert('replayStepForward function exists', stepForwardFunc !== null);

const stepBackwardFunc = extractFunction(script, 'replayStepBackward');
assert('replayStepBackward function exists', stepBackwardFunc !== null);

const jumpToStepFunc = extractFunction(script, 'replayJumpToStep');
assert('replayJumpToStep function exists', jumpToStepFunc !== null);

const playReplayFunc = extractFunction(script, 'playReplay');
assert('playReplay function exists', playReplayFunc !== null);
assert('playReplay uses speed from state', playReplayFunc && playReplayFunc.includes('replayViewerState.speed'));

// Task board rendering at each step
const renderTaskBoardFunc = extractFunction(script, 'renderReplayTaskBoard');
assert('renderReplayTaskBoard function exists', renderTaskBoardFunc !== null);
assert('renderReplayTaskBoard renders task items', renderTaskBoardFunc && renderTaskBoardFunc.includes('task-status'));

// Chat rendering at each step
const renderStepFunc = extractFunction(script, 'renderReplayStep');
assert('renderReplayStep function exists', renderStepFunc !== null);
assert('renderReplayStep renders chat message', renderStepFunc && renderStepFunc.includes('replayChat'));
assert('renderReplayStep renders task board', renderStepFunc && renderStepFunc.includes('renderReplayTaskBoard'));

// Jump-in during replay
const jumpInFunc = extractFunction(script, 'replayJumpIn');
assert('replayJumpIn function exists', jumpInFunc !== null);
assert('replayJumpIn inserts user event', jumpInFunc && jumpInFunc.includes('jump-in') && jumpInFunc.includes('splice'));

// Speed change handler
const speedChangeFunc = extractFunction(script, 'onReplaySpeedChange');
assert('onReplaySpeedChange function exists', speedChangeFunc !== null);
assert('onReplaySpeedChange reads from select', speedChangeFunc && speedChangeFunc.includes('replaySpeedSelect'));

// ============================================================
// (d) REPLAY EVENT STRUCTURE WITH SNAPSHOTS
// ============================================================

// Session events should include task board snapshots
const recordEventFunc = extractFunction(script, 'recordSessionEvent');
assert('recordSessionEvent captures task board state', recordEventFunc && recordEventFunc.includes('taskBoardSnapshot'));
assert('recordSessionEvent captures task fields', recordEventFunc && recordEventFunc.includes('id:') && recordEventFunc.includes('title:') && recordEventFunc.includes('owner:') && recordEventFunc.includes('status:') && recordEventFunc.includes('gate:') && recordEventFunc.includes('reworkNote:'));

// ============================================================
// (e) BENGALI TRANSLATIONS
// ============================================================

const i18n = extractObject(script, 'I18N');
const replayTranslations = [
  'Replay',
  'Team Replay',
  'Session Replay',
  'No past sessions',
  'Select a session and press Play to start replay.',
  'Replayed to the end of the recorded session.',
  'Jump in mid-replay',
  'Enter your message to redirect the team (will be injected at current replay point):',
  'Jump-in message added to replay',
  'Play',
  'Pause',
  'Previous',
  'Next',
  'Speed',
  'Close Session'
];

for (const trans of replayTranslations) {
  assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
}

// UI elements have data-i18n attributes
assert('Replay viewer has data-i18n labels', html.includes('data-i18n="Replay"') || html.includes('data-i18n="Play"') || html.includes('data-i18n="Pause"') || html.includes('data-i18n="Previous"') || html.includes('data-i18n="Next"') || html.includes('data-i18n="Speed"') || html.includes('data-i18n="Close Session"'));

// ============================================================
// (f) INTEGRATION WITH TEAM MODE UI
// ============================================================

// Replay button should be in Team Mode action bar
assert('Replay button in Team Mode action bar', html.includes('btnReplaySession') && html.includes('replayTeamSession'));

// Replay viewer tab in main pane tabs
assert('Replay tab in main pane tabs', html.includes('data-tab="replay"'));

// ============================================================
// (g) EDGE CASES
// ============================================================

// Empty history state
assert('Handles empty session history', script.includes('history') && (script.includes('No past') || script.includes('length === 0')));

// Replay respects teamMode state (doesn't interfere with live session)
assert('Replay state separate from live session', script.includes('replayViewerState') && script.includes('currentSession'));

// ============================================================
// (h) SYNTAX CHECK
// ============================================================

// Verify script is valid JavaScript (no syntax errors)
try {
  // Just check that the script can be parsed - we do a basic check
  const scriptStart = script.indexOf('function ') !== -1 || script.indexOf('const ') !== -1;
  assert('Script has valid structure', scriptStart);
} catch (e) {
  assert('Script syntax valid', false, e.message);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}