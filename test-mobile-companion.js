// Test for Mobile Companion View (B4.4) - Direct function extraction
// Run with: node test-mobile-companion.js

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

  // Find the end of the parameter list (matching ')')
  let parenCount = 0;
  let i = idx + searchStr.length - 1; // position of '('
  for (; i < script.length; i++) {
    if (script[i] === '(') parenCount++;
    else if (script[i] === ')') {
      parenCount--;
      if (parenCount === 0) break;
    }
  }
  if (parenCount !== 0) return null;

  // Now find the function body opening '{'
  let bodyStart = -1;
  for (let j = i + 1; j < script.length; j++) {
    if (script[j] === '{') {
      bodyStart = j;
      break;
    }
  }
  if (bodyStart === -1) return null;

  // Count braces from the function body
  let braceCount = 0;
  let seenOpen = false;
  for (let k = bodyStart; k < script.length; k++) {
    if (script[k] === '{') { braceCount++; seenOpen = true; }
    else if (script[k] === '}') {
      braceCount--;
      if (braceCount === 0 && seenOpen) {
        i = k;
        break;
      }
    }
  }
  if (braceCount !== 0 || !seenOpen) return null;
  return script.slice(idx, i + 1);
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

console.log('=== Mobile Companion View (B4.4) Tests (Direct Extraction) ===\n');

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
// (a) UI ELEMENTS - Mobile Nav & Companion Pane
// ============================================================

assert('Mobile nav has Companion tab button', html.includes('data-mobile-tab="companion"'));
assert('Companion tab has icon and label', html.includes('data-mobile-tab="companion"') && html.includes('Companion'));
assert('Companion pane view exists', html.includes('id="paneCompanion"'));
assert('Companion pane has build status section', html.includes('id="companionBuildStatus"'));
assert('Companion pane has current step section', html.includes('id="companionCurrentStep"'));
assert('Companion pane has team chat section', html.includes('id="companionTeamChat"'));
assert('Companion pane has checkpoints section', html.includes('id="companionCheckpoints"'));
assert('Companion pane sections have data-i18n labels', html.includes('data-i18n="Build Status"') && html.includes('data-i18n="Current Step"') && html.includes('data-i18n="Team Chat"') && html.includes('data-i18n="Checkpoints"'));

// Check for big touch targets (min-height 44px or similar)
assert('Companion pane has touch-friendly styling', html.includes('min-height: 44px') || html.includes('min-height: 48px') || html.includes('touch-target') || html.includes('touchTarget'));

// ============================================================
// (b) MOBILE NAV INTEGRATION
// ============================================================

const setupMobileNavFunc = extractFunction(script, 'setupMobileNav');
assert('setupMobileNav function exists', setupMobileNavFunc !== null);

if (setupMobileNavFunc) {
  assert('setupMobileNav maps companion tab', setupMobileNavFunc.includes('companion') && setupMobileNavFunc.includes('show-companion'));
  assert('setupMobileNav shows companion pane', setupMobileNavFunc.includes('companion') && (setupMobileNavFunc.includes('paneCompanion') || setupMobileNavFunc.includes('show-companion')));
}

// Check CSS for show-companion class
assert('CSS has show-companion class for mobile', html.includes('.show-companion') || html.includes('show-companion'));

// ============================================================
// (c) COMPANION VIEW RENDERING FUNCTIONS
// ============================================================

const renderCompanionFunc = extractFunction(script, 'renderCompanionView') || extractFunction(script, 'updateCompanionView');
assert('renderCompanionView/updateCompanionView function exists', renderCompanionFunc !== null);

if (renderCompanionFunc) {
  assert('renderCompanionView updates build status', renderCompanionFunc.includes('companionBuildStatus') || renderCompanionFunc.includes('buildStatus') || renderCompanionFunc.includes('renderLegacyCompanionView'));
  assert('renderCompanionView updates current step', renderCompanionFunc.includes('companionCurrentStep') || renderCompanionFunc.includes('currentStep') || renderCompanionFunc.includes('renderLegacyCompanionView'));
  assert('renderCompanionView updates team chat', renderCompanionFunc.includes('companionTeamChat') || renderCompanionFunc.includes('teamChat') || renderCompanionFunc.includes('renderLegacyCompanionView'));
  assert('renderCompanionView updates checkpoints', renderCompanionFunc.includes('companionCheckpoints') || renderCompanionFunc.includes('checkpoints') || renderCompanionFunc.includes('renderLegacyCompanionView'));
}

// Check for refresh/update companion view on state changes
const companionUpdateTriggers = ['setTeamPhase', 'appendTeamChat', 'createCheckpoint', 'updateThinkActObserveState', 'executeNextPlanStep'];
let foundUpdateTrigger = false;
for (const trigger of companionUpdateTriggers) {
  const triggerFunc = extractFunction(script, trigger);
  if (triggerFunc && (triggerFunc.includes('companion') || triggerFunc.includes('renderCompanion') || triggerFunc.includes('updateCompanion'))) {
    foundUpdateTrigger = true;
    break;
  }
}
assert('Companion view updates on state changes', foundUpdateTrigger);

// ============================================================
// (d) BUILD STATUS DISPLAY
// ============================================================

// Build status should show: idle, working, success, error
assert('Companion build status handles idle state', script.includes('buildStatus') && (script.includes('idle') || script.includes('Idle')));
assert('Companion build status handles working state', script.includes('buildStatus') && (script.includes('working') || script.includes('Working')));
assert('Companion build status handles success state', script.includes('buildStatus') && (script.includes('success') || script.includes('Success')));
assert('Companion build status handles error state', script.includes('buildStatus') && (script.includes('error') || script.includes('Error')));

// ============================================================
// (e) CURRENT STEP DISPLAY
// ============================================================

// Should show agent's current step from plan or think-act-observe
assert('Companion current step reads from taoCurrentStep or planStepIndex', script.includes('taoCurrentStep') || script.includes('planStepIndex') || script.includes('currentStepPlan'));
assert('Companion current step shows step number', script.includes('companionCurrentStep') && (script.includes('Step') || script.includes('step')));

// ============================================================
// (f) TEAM CHAT DISPLAY (read-only, compact)
// ============================================================

assert('Companion team chat reads from appState.teamChat', script.includes('appState.teamChat') && script.includes('companionTeamChat'));
assert('Companion team chat shows agent emoji and name', script.includes('companionTeamChat') && (script.includes('emoji') || script.includes('name')));
assert('Companion team chat is compact (no input bar)', script.includes('companionTeamChat') && !script.match(/companionTeamChat.*teamJumpIn/));

// ============================================================
// (g) CHECKPOINTS FOR APPROVAL/REJECT
// ============================================================

assert('Companion checkpoints reads from appState.checkpoints', script.includes('appState.checkpoints') && script.includes('companionCheckpoints'));
assert('Companion checkpoints shows approve/reject buttons', script.includes('companionCheckpoints') && (script.includes('Approve') || script.includes('approve')) && (script.includes('Reject') || script.includes('reject')));
assert('Companion checkpoint buttons are touch-friendly', script.includes('companionCheckpoints') && (script.includes('min-height: 44px') || script.includes('min-height: 48px') || script.includes('padding: 12px') || script.includes('padding: 16px')));

// ============================================================
// (h) BENGALI TRANSLATIONS
// ============================================================

const i18n = extractObject(script, 'I18N');
const translations = [
  'Build Status',
  'Current Step',
  'Team Chat',
  'Checkpoints',
  'Companion',
  'Approve',
  'Reject',
  'Idle',
  'Working',
  'Success',
  'Error',
  'No active build',
  'No current step',
  'No team chat yet',
  'No checkpoints'
];

for (const trans of translations) {
  assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
}

// UI elements have data-i18n attributes
assert('Build Status section has data-i18n', html.includes('data-i18n="Build Status"'));
assert('Current Step section has data-i18n', html.includes('data-i18n="Current Step"'));
assert('Team Chat section has data-i18n', html.includes('data-i18n="Team Chat"'));
assert('Checkpoints section has data-i18n', html.includes('data-i18n="Checkpoints"'));

// ============================================================
// (i) RESPONSIVE BEHAVIOR
// ============================================================

// Companion view should be visible on mobile, possibly hidden on desktop or available as a pane
assert('Companion pane exists in HTML', html.includes('id="paneCompanion"'));

// ============================================================
// (j) EDGE CASES
// ============================================================

// Empty states
assert('Companion handles empty team chat', script.includes('companionTeamChat') && (script.includes('No team chat') || script.includes('no team chat') || script.includes('empty')));
assert('Companion handles empty checkpoints', script.includes('companionCheckpoints') && (script.includes('No checkpoint') || script.includes('no checkpoint') || script.includes('empty')));

// Touch targets - buttons should be large enough
const companionBtnStyles = script.match(/companionCheckpoints[\s\S]{0,500}/);
assert('Checkpoint approve button has adequate touch size', companionBtnStyles && (companionBtnStyles[0].includes('44px') || companionBtnStyles[0].includes('48px') || (companionBtnStyles[0].includes('padding:') && (companionBtnStyles[0].includes('12') || companionBtnStyles[0].includes('16') || companionBtnStyles[0].includes('14')))));

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}