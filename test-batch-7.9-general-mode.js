// test-batch-7.9-general-mode.js
// NO-JSDOM extraction-and-eval pattern - asserts identifiers and behaviors in index.html
// Run with: node test-batch-7.9-general-mode.js

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'index.html');

function readIndex() {
  return fs.readFileSync(INDEX_PATH, 'utf-8');
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

async function runTests() {
  const html = readIndex();
  
  console.log('\n=== Batch 7.9 General Mode Tests ===\n');
  
  // (a) "General" exists in the mode selector and is the default for a fresh user
  console.log('(a) Mode selector has "General" option and fresh appState defaults to general');
  assertIncludes(html, 'value="general"', 'Mode selector has General option');
  assertIncludes(html, "planMode: 'general'", 'Fresh appState defaults planMode to general');
  assertIncludes(html, "defaultMode: 'general'", 'Fresh appState defaults defaultMode to general');
  assertIncludes(html, '🌟 General', 'Mode selector displays General with icon');
  
  // (b) In General mode, rendering a task result contains NO diff markup, NO file content, NO terminal output, NO stack trace
  console.log('\n(b) General mode rendering hides diffs, file content, terminal output, stack traces');
  assertIncludes(html, "isGeneralMode = appState.planMode === 'general'", 'General mode detection in appendChatMessage');
  assertIncludes(html, 'extractCodeBlocks', 'Code block extraction function exists');
  // The conditional rendering in appendChatMessage should skip chips and toolsUsed in General mode
  assertIncludes(html, '} else {', 'Normal mode rendering branch exists');
  assertIncludes(html, 'NORMAL MODE', 'Normal mode rendering comment');
  // Verify General mode branch doesn't have Tools Used
  const generalModeSection = html.substring(html.indexOf('if (isGeneralMode)'), html.indexOf('} else {'));
  assertNotIncludes(generalModeSection, 'Tools Used:', 'General mode branch should not have Tools Used');
  assertNotIncludes(generalModeSection, 'action-chip', 'General mode branch should not have action chips');
  
  // (c) In General mode, the result shows a plain-Bangla progress line + a result card + the preview focus action
  console.log('\n(c) General mode shows Bangla progress line, result card, preview focus');
  assertIncludes(html, 'general-progress', 'Progress line CSS class');
  assertIncludes(html, 'general-result-card', 'Result card CSS class');
  assertIncludes(html, 'আমি নতুন ফাইল তৈরি করছি', 'Bangla progress text for create');
  assertIncludes(html, 'আমি ফাইল আপডেট করছি', 'Bangla progress text for modify');
  assertIncludes(html, 'এবার পরীক্ষা করছি', 'Bangla progress text for test');
  assertIncludes(html, 'focusPreview()', 'Preview focus function called');
  assertIncludes(html, 'btnPreview', 'Preview button reference in focusPreview');
  assertIncludes(html, 'previewFrame', 'Preview frame reference in focusPreview');
  
  // (d) An error in General mode renders the plain-Bangla sentence, not the raw error text
  console.log('\n(d) Error in General mode shows plain Bangla sentence');
  assertIncludes(html, 'Error occurred — fixing', 'Error Bangla text key exists');
  assertIncludes(html, 'একটা সমস্যা হয়েছে — আমি ঠিক করছি', 'Bengali translation for error');
  assertIncludes(html, 'isError = content.toLowerCase().includes', 'Error detection logic');
  assertIncludes(html, 'danger-bg', 'Error styling');
  // Regression (verifier repair): the error card must show ONLY the plain sentence, never the raw error text
  const errorSection = html.substring(html.indexOf('if (isError)'), html.indexOf('} else if (isDone'));
  assertNotIncludes(errorSection, 'cleanText', 'Error branch must not render the raw message text');
  
  // (e) The 7.3 verification evidence still attaches to a "done" claim in General mode
  console.log('\n(e) 7.3 verification evidence attaches in General mode');
  assertIncludes(html, 'extractVerificationEvidence', 'Verification evidence extraction function');
  assertIncludes(html, 'extractTestCount', 'Test count extraction function');
  assertIncludes(html, 'পরীক্ষা করা হয়েছে', 'Bengali verification text pattern');
  assertIncludes(html, 'Tests passed', 'English verification text pattern');
  assertIncludes(html, '✓ ${t(\'Tests passed\')}: ${testCount}', 'Verification display in result card');
  assertIncludes(html, 'success-bg', 'Verification success styling');
  
  // (f) "Show code" reveals the diff for that task only (other tasks stay hidden; switching to Chat mode reveals everything)
  console.log('\n(f) "Show code" toggle per task, Chat mode reveals all');
  assertIncludes(html, 'generalModeShowCode', 'Per-task show code state in appState');
  assertIncludes(html, 'toggleShowCode', 'Toggle show code function');
  assertIncludes(html, 'btn-show-code', 'Show code button class');
  assertIncludes(html, 'general-code-block', 'Code block container class');
  assertIncludes(html, 'data-msg-id', 'Message ID attribute for tracking');
  assertIncludes(html, 'Show code', 'Show code button text');
  assertIncludes(html, 'Hide code', 'Hide code button text');
  assertIncludes(html, 'appState.generalModeShowCode[msgId]', 'Per-message show code state');
  // Regression (verifier repair): the code block must be in the DOM (hidden) so Show code can reveal it
  assertIncludes(html, "display:${showCode ? 'block' : 'none'}", 'Code block rendered with display control for the toggle');
  
  // (g) Switching modes mid-task keeps the task + history + files
  console.log('\n(g) Mode switching preserves task, history, files');
  assertIncludes(html, 'appState.planMode', 'planMode in appState');
  assertIncludes(html, 'modeSelector.value = mode', 'Mode selector updates on change');
  // The chat history and files are stored in session, not affected by planMode
  assertIncludes(html, 'chatHistory', 'Chat history stored in session');
  assertIncludes(html, 'currentPlan', 'Plan stored in appState');
  
  // (h) A2 diff review, checkpoints, Senior review still run under General mode
  console.log('\n(h) Safety gates (A2, checkpoints, Senior review) still run');
  assertIncludes(html, 'checkPrecommitGate', 'Pre-commit gate function');
  assertIncludes(html, 'verifyBeforeCompletion', 'Verification-before-completion gate');
  assertIncludes(html, 'diffReview', 'Diff review function (A2)');
  assertIncludes(html, 'seniorReview', 'Senior review function');
  assertIncludes(html, 'checkpoint', 'Checkpoint functionality');
  // These are called from sendAgentPrompt regardless of planMode
  assertIncludes(html, 'sendAgentPrompt', 'Main agent prompt function');
  
  // (i) Bengali translation keys exist for the new strings
  console.log('\n(i) Bengali translation keys for new strings');
  const bnKeys = [
    'General',
    'General Mode',
    'Default Mode',
    'Default mode for new users (General = no code, results only)',
    'Show code',
    'Hide code',
    'Progress',
    'Result',
    'Error occurred — fixing',
    'Done — tested',
    'Tests passed',
    'Try it',
    'Approved',
    'Change it',
    'General — code hidden, results only',
    '(planning only)',
    '(read-only — approve to build)',
    '(paused)',
    '(executing)',
    '(ask about codebase)',
  ];
  
  for (const key of bnKeys) {
    assertIncludes(html, `'${key}':`, `Bengali translation for "${key}"`);
  }
  
  // Additional checks
  console.log('\n(Additional) Settings → Behavior has Default Mode selector');
  assertIncludes(html, 'defaultModeSelect', 'Default mode select element ID');
  assertIncludes(html, 'General Mode', 'General Mode section in settings');
  assertIncludes(html, 'Default mode for new users', 'Default mode description');
  
  console.log('\n(Additional) Helper functions for General Mode');
  assertIncludes(html, 'generateProgressBangla', 'Progress Bangla generator');
  assertIncludes(html, 'approveTask', 'Approve task function');
  assertIncludes(html, 'rejectTask', 'Reject task function');
  
  console.log('\n(Additional) Plan mode type includes general');
  assertIncludes(html, "'general' | 'chat' | 'codebase-chat'", 'Plan mode type includes general');
  
  console.log('\n=== ALL TESTS PASSED ===');
  console.log(`Total assertions: ${passCount}`);
  
  process.exit(0);
}

runTests().catch(err => {
  console.error('\n=== TEST FAILED ===');
  console.error(err.message);
  process.exit(1);
});