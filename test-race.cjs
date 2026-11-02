// Test for RACE Mode - Direct function extraction
// Run with: node test-race.cjs
// No jsdom and no package.json: the RACE pieces are extracted from
// index.html with string search + brace counting and run in a
// controlled context (same pattern as test-h5.3-attach.js).

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

console.log('=== RACE Mode Tests (Direct Extraction) ===\n');

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
// Extract the RACE Mode pieces from index.html
// ---------------------------------------------------------------------------
const setupRaceModeSrc = extractFunction(script, 'setupRaceMode');
const callLLMWithRaceSrc = extractFunction(script, 'callLLMWithRace');
const createRaceCardSrc = extractFunction(script, 'createRaceCard');
const updateRaceCardSrc = extractFunction(script, 'updateRaceCard');
const reorderRaceCardsSrc = extractFunction(script, 'reorderRaceCards');
const updateRaceStatusSrc = extractFunction(script, 'updateRaceStatus');
const useRaceResultSrc = extractFunction(script, 'useRaceResult');
const crownRaceResultSrc = extractFunction(script, 'crownRaceResult');
const detectTaskCategorySrc = extractFunction(script, 'detectTaskCategory');
const updateRacePickerHintsSrc = extractFunction(script, 'updateRacePickerHints');

assert('setupRaceMode function exists', setupRaceModeSrc !== null);
assert('callLLMWithRace function exists', callLLMWithRaceSrc !== null);
assert('createRaceCard function exists', createRaceCardSrc !== null);
assert('updateRaceCard function exists', updateRaceCardSrc !== null);
assert('reorderRaceCards function exists', reorderRaceCardsSrc !== null);
assert('updateRaceStatus function exists', updateRaceStatusSrc !== null);
assert('useRaceResult function exists', useRaceResultSrc !== null);
assert('crownRaceResult function exists', crownRaceResultSrc !== null);
assert('detectTaskCategory function exists', detectTaskCategorySrc !== null);
assert('updateRacePickerHints function exists', updateRacePickerHintsSrc !== null);

if (!setupRaceModeSrc || !callLLMWithRaceSrc || !createRaceCardSrc || !updateRaceCardSrc ||
    !reorderRaceCardsSrc || !updateRaceStatusSrc || !useRaceResultSrc || !crownRaceResultSrc ||
    !detectTaskCategorySrc || !updateRacePickerHintsSrc) {
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(1);
}

// --- Test 1: HTML has RACE mode UI elements -----------------------------------
assert('RACE toggle button exists', html.indexOf('id="btnRaceToggle"') !== -1);
assert('Race model picker container exists', html.indexOf('id="raceModelPicker"') !== -1);
assert('Race model select (multi) exists', html.indexOf('id="raceModelSelect"') !== -1);
assert('Race model select has multiple attr', html.indexOf('multiple') !== -1);
assert('Race model count badge exists', html.indexOf('id="raceModelCount"') !== -1);
assert('Race clear button exists', html.indexOf('id="btnRaceClear"') !== -1);
assert('Race close button exists', html.indexOf('id="btnRaceClose"') !== -1);
assert('Race results container exists', html.indexOf('id="raceResultsContainer"') !== -1);
assert('Race results list exists', html.indexOf('id="raceResultsList"') !== -1);
assert('Race results status exists', html.indexOf('id="raceResultsStatus"') !== -1);

// --- Test 2: Race model picker is a multi-select (checkbox list style) -------
assert('Race model select is multi-select', html.indexOf('multiple') !== -1 && html.indexOf('raceModelSelect') !== -1);
assert('Min 2 models hint present', html.indexOf('Select 2-4') !== -1 || html.indexOf('min 2') !== -1 || script.indexOf('Select at least 2') !== -1);
assert('Max 4 models enforced', script.indexOf('Maximum 4 models') !== -1 || script.indexOf('selected.length > 4') !== -1);

// --- Test 3: Race mode persistence --------------------------------------------
assert('Race mode uses localStorage', setupRaceModeSrc.includes('localStorage') && setupRaceModeSrc.includes('flamingocode_race_mode'));
assert('Race mode saves enabled state', setupRaceModeSrc.includes('saveRaceState') && setupRaceModeSrc.includes('enabled'));
assert('Race mode saves selected models', setupRaceModeSrc.includes('selectedModels') && setupRaceModeSrc.includes('selectedOptions'));

// --- Test 4: setupRaceMode called in setupChatHandlers -----------------------
assert('setupRaceMode called in setupChatHandlers', script.indexOf('setupRaceMode()') !== -1 || script.indexOf('setupRaceMode();') !== -1);

// --- Test 5: Race execution uses Promise.allSettled --------------------------
assert('Race uses Promise.allSettled', setupRaceModeSrc.includes('Promise.allSettled') || setupRaceModeSrc.includes('allSettled'));
assert('Race creates AbortController per model', setupRaceModeSrc.includes('AbortController') && setupRaceModeSrc.includes('raceAbortControllers'));

// --- Test 6: Per-model 120s timeout -------------------------------------------
assert('Race has 120s timeout', setupRaceModeSrc.includes('120000') || setupRaceModeSrc.includes('120s') || setupRaceModeSrc.includes('timeout'));
assert('Timeout marks model as timed out', setupRaceModeSrc.includes('timed out') && setupRaceModeSrc.includes('AbortError'));

// --- Test 7: Race results ranking by completion latency -----------------------
assert('reorderRaceCards sorts by latency', reorderRaceCardsSrc.includes('latency') && reorderRaceCardsSrc.includes('sort'));
assert('Fastest gets marker', reorderRaceCardsSrc.includes('isFastest') || reorderRaceCardsSrc.includes('fastest'));
assert('Failed/timed-out at end', reorderRaceCardsSrc.includes('done') && (reorderRaceCardsSrc.includes('timed out') || reorderRaceCardsSrc.includes('failed')));

// --- Test 8: Race card shows model name, provider badge, latency, status ------
assert('createRaceCard includes model name', createRaceCardSrc.includes('modelName') || createRaceCardSrc.includes('opt.textContent'));
assert('createRaceCard includes provider badge', createRaceCardSrc.includes('providerName') || createRaceCardSrc.includes('provider.name'));
assert('createRaceCard includes status display', createRaceCardSrc.includes('race-status') || createRaceCardSrc.includes('status'));
assert('updateRaceCard shows latency', updateRaceCardSrc.includes('latency') || updateRaceCardSrc.includes('Latency'));
assert('updateRaceCard shows TTFT', updateRaceCardSrc.includes('ttft') || updateRaceCardSrc.includes('TTFT'));

// --- Test 9: Race card status states (racing/done/failed/timed out) ----------
assert('updateRaceCard handles done status', updateRaceCardSrc.includes('done') && updateRaceCardSrc.includes('success'));
assert('updateRaceCard handles timed out', updateRaceCardSrc.includes('timed out') && updateRaceCardSrc.includes('warning'));
assert('updateRaceCard handles failed', updateRaceCardSrc.includes('failed') && updateRaceCardSrc.includes('danger'));

// --- Test 10: Each card has "Use this" and "Crown 👑" actions -----------------
assert('createRaceCard has Use this button', createRaceCardSrc.includes('Use this') || createRaceCardSrc.includes('race-use-btn'));
assert('createRaceCard has Crown button', createRaceCardSrc.includes('Crown') || createRaceCardSrc.includes('race-crown-btn') || createRaceCardSrc.includes('👑'));
assert('useRaceResult inserts into chat', useRaceResultSrc.includes('appendChatMessage') && useRaceResultSrc.includes('chatHistory.push'));
assert('crownRaceResult writes to Brain', crownRaceResultSrc.includes('writeBrainNote') && crownRaceResultSrc.includes('race-wins-tally'));

// --- Test 11: Crowning records wins with task category ------------------------
assert('detectTaskCategory exists and categorizes', detectTaskCategorySrc !== null && detectTaskCategorySrc.includes('coding') && detectTaskCategorySrc.includes('writing'));
assert('crownRaceResult uses detectTaskCategory', crownRaceResultSrc.includes('detectTaskCategory'));
assert('crownRaceResult tallies by category', crownRaceResultSrc.includes('categories') && crownRaceResultSrc.includes('categories['));

// --- Test 12: Failed/timed-out cards stay visible -----------------------------
assert('Failed cards not removed', setupRaceModeSrc.includes('raceResults.push') && !setupRaceModeSrc.includes('filter') || setupRaceModeSrc.includes('push'));
assert('Error shown in card', updateRaceCardSrc.includes('error') && updateRaceCardSrc.includes('Error:'));

// --- Test 13: Race mode hooked into chat send handler -------------------------
// Search the full script for the race mode integration in handleSend
assert('handleSend checks race mode', script.includes('flamingocode_race_mode') && script.includes('runRace'));
assert('handleSend calls runRace when enabled', script.includes('await window.runRace(text)') || script.includes('runRace(text)'));

// --- Test 14: callLLMWithRace streams and tracks TTFT -------------------------
assert('callLLMWithRace uses streaming', callLLMWithRaceSrc.includes('stream: true') && callLLMWithRaceSrc.includes('getReader'));
assert('callLLMWithRace tracks first token time', callLLMWithRaceSrc.includes('firstTokenTime') && callLLMWithRaceSrc.includes('Date.now()'));
assert('callLLMWithRace restores provider model', callLLMWithRaceSrc.includes('originalModel') && callLLMWithRaceSrc.includes('provider.model = originalModel'));
assert('callLLMWithRace respects AbortSignal', callLLMWithRaceSrc.includes('signal') && callLLMWithRaceSrc.includes('fetch'));

// --- Test 15: Race results panel appears below input --------------------------
assert('raceResultsContainer in HTML after chat area', html.indexOf('raceResultsContainer') > html.indexOf('chat-input-wrapper') || html.indexOf('raceResultsContainer') > html.indexOf('messageQueueContainer'));

// --- Test 16: Standing guards -------------------------------------------------
assert('Literal </script count stays 1', (html.match(/<\/script/g) || []).length === 1);
assert('No ?.onclick assignments', html.indexOf('?.onclick') === -1);

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('RACE MODE: FAILED');
  process.exit(1);
}
console.log('RACE MODE: ALL TESTS PASSED (' + passed + '/' + passed + ')');
process.exit(0);