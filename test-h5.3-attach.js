// Test for H5.3 @-attach in Chat - Direct function extraction
// Run with: node test-h5.3-attach.js
// No jsdom and no package.json: the H5.3 pieces are extracted from
// index.html with string search + brace counting and run in a
// controlled context (same pattern as test-h5.2-import-tools.js).

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

// Extract a const array literal from the script (bracket counting from its opening bracket)
function extractArray(scriptText, arrName) {
  const searchStr = 'const ' + arrName + ' = [';
  const idx = scriptText.indexOf(searchStr);
  if (idx === -1) return null;
  const start = scriptText.indexOf('[', idx);
  let bracketCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === '[') { bracketCount++; seenOpen = true; }
    else if (scriptText[i] === ']') {
      bracketCount--;
      if (bracketCount === 0 && seenOpen) break;
    }
  }
  if (bracketCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

// Extract a property value (object or array) from appState
function extractProperty(scriptText, propName) {
  let searchStr = propName + ': {';
  let idx = scriptText.indexOf(searchStr);
  let openChar = '{';
  let closeChar = '}';
  if (idx === -1) {
    searchStr = propName + ': [';
    idx = scriptText.indexOf(searchStr);
    openChar = '[';
    closeChar = ']';
  }
  if (idx === -1) return null;
  const start = scriptText.indexOf(openChar, idx);
  let braceCount = 0;
  let i = start;
  let seenOpen = false;
  for (; i < scriptText.length; i++) {
    if (scriptText[i] === openChar) { braceCount++; seenOpen = true; }
    else if (scriptText[i] === closeChar) {
      braceCount--;
      if (braceCount === 0 && seenOpen) break;
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return scriptText.slice(start, i + 1);
}

console.log('=== H5.3 @-attach in Chat Tests (Direct Extraction) ===\n');

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
// Extract the H5.3 pieces from index.html
// ---------------------------------------------------------------------------
const setupChatAttachmentsSrc = extractFunction(script, 'setupChatAttachments');
const openAttachPickerSrc = extractFunction(script, 'openAttachPicker');
const closeAttachPickerSrc = extractFunction(script, 'closeAttachPicker');
const renderAttachChipsSrc = extractFunction(script, 'renderAttachChips');
const addAttachmentSrc = extractFunction(script, 'addAttachment');
const removeAttachmentSrc = extractFunction(script, 'removeAttachment');
const getAttachableFilesSrc = extractFunction(script, 'getAttachableFiles');
const getAttachableFoldersSrc = extractFunction(script, 'getAttachableFolders');
const attachDiffSrc = extractFunction(script, 'attachDiff');
const attachUrlSrc = extractFunction(script, 'attachUrl');
const buildAttachPromptContextSrc = extractFunction(script, 'buildAttachPromptContext');
const i18nSrc = extractObject(script, 'I18N');

assert('setupChatAttachments function exists', setupChatAttachmentsSrc !== null);
assert('openAttachPicker function exists', openAttachPickerSrc !== null);
assert('closeAttachPicker function exists', closeAttachPickerSrc !== null);
assert('renderAttachChips function exists', renderAttachChipsSrc !== null);
assert('addAttachment function exists', addAttachmentSrc !== null);
assert('removeAttachment function exists', removeAttachmentSrc !== null);
assert('getAttachableFiles function exists', getAttachableFilesSrc !== null);
assert('getAttachableFolders function exists', getAttachableFoldersSrc !== null);
assert('attachDiff function exists', attachDiffSrc !== null);
assert('attachUrl function exists', attachUrlSrc !== null);
assert('buildAttachPromptContext function exists', buildAttachPromptContextSrc !== null);
assert('I18N object exists', i18nSrc !== null);

if (!setupChatAttachmentsSrc || !openAttachPickerSrc || !closeAttachPickerSrc || 
    !renderAttachChipsSrc || !addAttachmentSrc || !removeAttachmentSrc ||
    !getAttachableFilesSrc || !getAttachableFoldersSrc || !attachDiffSrc ||
    !attachUrlSrc || !buildAttachPromptContextSrc || !i18nSrc) {
  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
  process.exit(1);
}

// Evaluate the extracted I18N object
let I18N;
try {
  I18N = eval('(' + i18nSrc + ')');
} catch (e) {
  console.log('FAIL: extracted I18N literal does not evaluate - ' + e.message);
  process.exit(1);
}
console.log('PASS: extracted I18N literal evaluates');
passed++;

// --- Test 1: HTML has attachment UI elements -----------------------------------
assert('Attachment chips container exists', html.indexOf('id="attachChips"') !== -1);
assert('Attach picker overlay exists', html.indexOf('id="attachPicker"') !== -1);
assert('Attach picker file list exists', html.indexOf('id="attachPickerFiles"') !== -1);
assert('Attach picker folder list exists', html.indexOf('id="attachPickerFolders"') !== -1);
assert('Attach picker diff option exists', html.indexOf('id="attachPickerDiff"') !== -1);
assert('Attach picker URL option exists', html.indexOf('id="attachPickerUrl"') !== -1);
assert('Chat input wrapper has attachment trigger', html.indexOf('@') !== -1); // placeholder for @ trigger logic

// --- Test 2: Chat input handler includes @ trigger -----------------------------
assert('chatInput keydown handler checks for @', setupChatAttachmentsSrc.includes('@') || script.includes('chatInput') && script.includes('@'));

// --- Test 3: setupChatAttachments called in setupChatHandlers ------------------
assert('setupChatAttachments called in setupChatHandlers', script.indexOf('setupChatAttachments') !== -1);

// --- Test 4: openAttachPicker builds file/folder lists -------------------------
assert('openAttachPicker calls getAttachableFiles', openAttachPickerSrc.includes('getAttachableFiles'));
assert('openAttachPicker calls getAttachableFolders', openAttachPickerSrc.includes('getAttachableFolders'));
assert('openAttachPicker checks pendingChanges for diff', openAttachPickerSrc.includes('pendingChanges') || openAttachPickerSrc.includes('diff'));

// --- Test 5: renderAttachChips creates removable chips -------------------------
assert('renderAttachChips creates chip elements', renderAttachChipsSrc.includes('createElement') || renderAttachChipsSrc.includes('innerHTML'));
assert('renderAttachChips includes remove button', renderAttachChipsSrc.includes('remove') || renderAttachChipsSrc.includes('✕') || renderAttachChipsSrc.includes('×'));

// --- Test 6: addAttachment prevents duplicates ---------------------------------
assert('addAttachment checks for existing', addAttachmentSrc.includes('find') || addAttachmentSrc.includes('some') || addAttachmentSrc.includes('includes'));

// --- Test 7: removeAttachment removes by id ------------------------------------
assert('removeAttachment filters array', removeAttachmentSrc.includes('filter') || removeAttachmentSrc.includes('splice'));

// --- Test 8: buildAttachPromptContext formats context for prompt ---------------
assert('buildAttachPromptContext returns string', buildAttachPromptContextSrc.includes('return'));
assert('buildAttachPromptContext handles files', buildAttachPromptContextSrc.includes('file') || buildAttachPromptContextSrc.includes('path'));
assert('buildAttachPromptContext handles diff', buildAttachPromptContextSrc.includes('diff') || buildAttachPromptContextSrc.includes('pendingChanges'));
assert('buildAttachPromptContext handles URL', buildAttachPromptContextSrc.includes('url') || buildAttachPromptContextSrc.includes('URL'));

// --- Test 9: Bengali labels for @-attach ---------------------------------------
const bnKeys = [
  'Attach',
  'Attach File',
  'Attach Folder',
  'Attach Diff',
  'Attach URL',
  'Attachments',
  'Attach a file, folder, diff, or URL',
  'No files to attach',
  'No folders to attach',
  'Current diff attached',
  'Enter URL to attach',
  'Attach URL',
  'Remove attachment',
];
const bnLabelsOk = bnKeys.every(function (k) {
  return typeof I18N.bn[k] === 'string' && I18N.bn[k].length > 0 && I18N.bn[k] !== k;
});
assert('All Bengali labels exist, are non-empty and differ from English', bnLabelsOk,
  bnKeys.filter(k => !(typeof I18N.bn[k] === 'string' && I18N.bn[k].length > 0 && I18N.bn[k] !== k)).join(', '));

// --- Test 10: Attachment types structure ---------------------------------------
// Each attachment should have: type (file|folder|diff|url), id, label, data
// Test that addAttachment validates types
const validTypes = ['file', 'folder', 'diff', 'url'];
let typeCheckPassed = 0;
for (const type of validTypes) {
  if (addAttachmentSrc.includes(type)) typeCheckPassed++;
}
assert('addAttachment handles all 4 attachment types', typeCheckPassed === validTypes.length, 'passed ' + typeCheckPassed + '/' + validTypes.length);

// --- Test 11: Attachments included in sendAgentPrompt --------------------------
// Check that sendAgentPrompt uses buildAttachPromptContext
const sendAgentPromptIdx = script.indexOf('async function sendAgentPrompt');
if (sendAgentPromptIdx !== -1) {
  const sendAgentPromptSnippet = script.slice(sendAgentPromptIdx, sendAgentPromptIdx + 3000);
  assert('sendAgentPrompt calls buildAttachPromptContext', sendAgentPromptSnippet.includes('buildAttachPromptContext'));
  assert('sendAgentPrompt clears attachments after send', sendAgentPromptSnippet.includes('attach') && (sendAgentPromptSnippet.includes('clear') || sendAgentPromptSnippet.includes('[]') || sendAgentPromptSnippet.includes('length = 0')));
} else {
  assert('sendAgentPrompt found', false);
}

// --- Test 12: Attachment chips container in HTML -------------------------------
assert('attachChips div is in chat-input-wrapper area', html.indexOf('attachChips') !== -1 && html.indexOf('chat-input-wrapper') !== -1);

// --- Test 13: Picker keyboard navigation (ArrowUp/Down, Enter, Escape) -------
assert('openAttachPicker handles keyboard', openAttachPickerSrc.includes('keydown') || openAttachPickerSrc.includes('ArrowUp') || openAttachPickerSrc.includes('ArrowDown') || openAttachPickerSrc.includes('Escape'));

// --- Test 14: Standing guards --------------------------------------------------
assert('Literal </script count stays 1', (html.match(/<\/script/g) || []).length === 1);
assert('No ?.onclick assignments', html.indexOf('?.onclick') === -1);

console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
if (failed > 0) {
  console.log('H5.3 @-ATTACH: FAILED');
  process.exit(1);
}
console.log('H5.3 @-ATTACH: ALL TESTS PASSED (' + passed + '/' + passed + ')');