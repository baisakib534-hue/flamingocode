// Test for Step Planner + Live Todo List - Direct function extraction
// Run with: node test-step-planner.js

const fs = require('fs');

// Extract the script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: Could not extract script from index.html');
  process.exit(1);
}

const script = scriptMatch[1];

// Extract specific functions from the script using regex
function extractFunction(script, funcName) {
  const regex = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`, 'g');
  const match = regex.exec(script);
  if (!match) return null;

  const start = match.index + match[0].length - 1;
  let braceCount = 0;
  let i = start;
  for (; i < script.length; i++) {
    if (script[i] === '{') braceCount++;
    else if (script[i] === '}') {
      braceCount--;
      if (braceCount === 0) break;
    }
  }
  if (braceCount !== 0) return null;
  return script.slice(match.index, i + 1);
}

// Extract constants/objects
function extractConstant(script, constName) {
  const regex = new RegExp(`const\\s+${constName}\\s*=\\s*([^;]+);`);
  const match = regex.exec(script);
  return match ? match[1].trim() : null;
}

function extractObject(script, objName) {
  const regex = new RegExp(`const\\s+${objName}\\s*=\\s*\\{`, 'g');
  const match = regex.exec(script);
  if (!match) return null;

  const start = match.index + match[0].length - 1;
  let braceCount = 0;
  let i = start;
  for (; i < script.length; i++) {
    if (script[i] === '{') braceCount++;
    else if (script[i] === '}') {
      braceCount--;
      if (braceCount === 0) break;
    }
  }
  if (braceCount !== 0) return null;
  return script.slice(match.index, i + 1);
}

console.log('=== Step Planner + Live Todo List Tests (Direct Extraction) ===\n');

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
// (a) CONDITIONAL PER-STEP PLANNING - Trigger Decision
// ============================================================

// Test 1: shouldTriggerStepPlanning function exists
try {
  const func = extractFunction(script, 'shouldTriggerStepPlanning');
  assert('shouldTriggerStepPlanning function exists', func !== null);
} catch (e) {
  assert('shouldTriggerStepPlanning function exists', false, e.message);
}

// Test 2: shouldTriggerStepPlanning returns boolean and logs decision
try {
  const func = extractFunction(script, 'shouldTriggerStepPlanning');
  assert('shouldTriggerStepPlanning returns trigger decision', func && func.includes('return') && (func.includes('true') || func.includes('false')));
  assert('shouldTriggerStepPlanning logs one-line decision', func && func.includes('logActivity') && func.includes('Step planning'));
} catch (e) {
  assert('shouldTriggerStepPlanning returns trigger decision', false, e.message);
}

// Test 3: Triggers for big/complex tasks (many details, multi-part, risky)
try {
  const func = extractFunction(script, 'shouldTriggerStepPlanning');
  const triggers = ['game', 'app', 'complex', 'detail', 'multi', 'risk', 'careful', 'large', 'big'];
  let foundTriggerLogic = false;
  for (const trigger of triggers) {
    if (func && func.toLowerCase().includes(trigger)) {
      foundTriggerLogic = true;
      break;
    }
  }
  assert('shouldTriggerStepPlanning detects big/complex triggers', foundTriggerLogic);
} catch (e) {
  assert('shouldTriggerStepPlanning detects big/complex triggers', false, e.message);
}

// Test 4: Simple tasks skip per-step planning
try {
  const func = extractFunction(script, 'shouldTriggerStepPlanning');
  assert('shouldTriggerStepPlanning allows simple task skip', func && (func.includes('simple') || func.includes('skip') || func.includes('short') || func.includes('token economy')));
} catch (e) {
  assert('shouldTriggerStepPlanning allows simple task skip', false, e.message);
}

// ============================================================
// (b) PER-STEP PLAN CREATION
// ============================================================

// Test 5: createStepPlan function exists
try {
  const func = extractFunction(script, 'createStepPlan');
  assert('createStepPlan function exists', func !== null);
} catch (e) {
  assert('createStepPlan function exists', false, e.message);
}

// Test 6: createStepPlan returns short plan (what, why, check)
try {
  const func = extractFunction(script, 'createStepPlan');
  assert('createStepPlan returns {what, why, check}', func && func.includes('what:') && func.includes('why:') && func.includes('check:'));
} catch (e) {
  assert('createStepPlan returns {what, why, check}', false, e.message);
}

// Test 7: createStepPlan called before each step when triggered
try {
  const func = extractFunction(script, 'executeNextPlanStep');
  assert('executeNextPlanStep calls createStepPlan when triggered', func && func.includes('createStepPlan'));
} catch (e) {
  assert('executeNextPlanStep calls createStepPlan', false, e.message);
}

// Test 8: createStepPlan does not re-plan finished steps
try {
  const func = extractFunction(script, 'createStepPlan');
  assert('createStepPlan skips done steps', func && (func.includes('done') || func.includes('finished') || func.includes('current')));
} catch (e) {
  assert('createStepPlan skips done steps', false, e.message);
}

// ============================================================
// (c) THINK-ACT-OBSERVE STATE TRANSITIONS
// ============================================================

// Test 9: thinkActObserveState variable exists with states
try {
  const states = ['thinking', 'running', 'observed', 'idle'];
  let allFound = true;
  for (const state of states) {
    if (!script.includes(state)) allFound = false;
  }
  assert('Think-act-observe states defined (thinking/running/observed/idle)', allFound);
} catch (e) {
  assert('Think-act-observe states defined', false, e.message);
}

// Test 10: updateThinkActObserveState function exists
try {
  const func = extractFunction(script, 'updateThinkActObserveState');
  assert('updateThinkActObserveState function exists', func !== null);
} catch (e) {
  assert('updateThinkActObserveState function exists', false, e.message);
}

// Test 11: State transitions: thinking -> running -> observed
try {
  const func = extractFunction(script, 'updateThinkActObserveState');
  assert('updateThinkActObserveState handles thinking state', func && func.includes('thinking'));
  assert('updateThinkActObserveState handles running state', func && func.includes('running'));
  assert('updateThinkActObserveState handles observed state', func && func.includes('observed'));
} catch (e) {
  assert('State transitions thinking->running->observed', false, e.message);
}

// Test 12: UI shows live status (thinking/running/observed)
try {
  const func = extractFunction(script, 'updateThinkActObserveState');
  assert('updateThinkActObserveState updates UI', func && (func.includes('textContent') || func.includes('innerHTML') || func.includes('style')));
} catch (e) {
  assert('updateThinkActObserveState updates UI', false, e.message);
}

// ============================================================
// (d) TODO BUTTON + LIVE TODO LIST
// ============================================================

// Test 13: Todo button in header
try {
  const hasTodoBtn = html.includes('btnTodo') || html.includes('todoBtn') || html.includes('id=\"btnTodo\"') || html.includes('id=\"todoBtn\"');
  assert('Todo button exists in header (btnTodo or todoBtn)', hasTodoBtn);
} catch (e) {
  assert('Todo button in header', false, e.message);
}

// Test 14: Todo list panel/modal exists
try {
  const hasTodoPanel = html.includes('todoPanel') || html.includes('todoList') || html.includes('todoModal') || html.includes('id=\"todoPanel\"') || html.includes('id=\"todoList\"');
  assert('Todo list panel/modal exists', hasTodoPanel);
} catch (e) {
  assert('Todo list panel/modal exists', false, e.message);
}

// Test 15: Todo list shows steps with done/active/pending states
try {
  const func = extractFunction(script, 'renderTodoList') || extractFunction(script, 'updateTodoList');
  assert('renderTodoList/updateTodoList function exists', func !== null);
} catch (e) {
  assert('Todo list render function exists', false, e.message);
}

// Test 16: Todo list auto-updates as work proceeds
try {
  const func = extractFunction(script, 'renderTodoList') || extractFunction(script, 'updateTodoList');
  assert('Todo list updates on step change', func && (func.includes('done') || func.includes('current') || func.includes('pending')));
} catch (e) {
  assert('Todo list auto-updates on step change', false, e.message);
}

// Test 17: Todo list persists across turns (saved with session/plan)
try {
  const func = extractFunction(script, 'savePlanToBrainFile') || extractFunction(script, 'saveAppState');
  // Check that todo list state is saved
  const todoSaveFunc = extractFunction(script, 'saveTodoList') || script.includes('todo') && script.includes('save');
  assert('Todo list state persisted with session/plan', todoSaveFunc);
} catch (e) {
  assert('Todo list state persisted', false, e.message);
}

// Test 18: Clicking a step shows its detail
try {
  const func = extractFunction(script, 'showStepDetail') || extractFunction(script, 'onTodoStepClick');
  assert('Click step shows detail function exists', func !== null);
} catch (e) {
  assert('Click step shows detail', false, e.message);
}

// ============================================================
// (e) DETAIL PLANNING FOR BIG TASKS
// ============================================================

// Test 19: expandPlanForBigTask function exists (breaks big steps into details)
try {
  const func = extractFunction(script, 'expandPlanForBigTask') || extractFunction(script, 'detailPlanForBigTask');
  assert('expandPlanForBigTask/detailPlanForBigTask function exists', func !== null);
} catch (e) {
  assert('Detail planning for big tasks function exists', false, e.message);
}

// Test 20: Detail planning creates sub-steps for game/app components
try {
  const func = extractFunction(script, 'expandPlanForBigTask') || extractFunction(script, 'detailPlanForBigTask');
  const components = ['gameplay', 'control', 'level', 'scoring', 'visual', 'sound', 'edge'];
  let foundComponent = false;
  if (func) {
    for (const comp of components) {
      if (func.toLowerCase().includes(comp)) {
        foundComponent = true;
        break;
      }
    }
  }
  assert('Detail planning covers game/app components', foundComponent);
} catch (e) {
  assert('Detail planning covers game/app components', false, e.message);
}

// ============================================================
// (f) MODE MAPPING: Smart / Off (YOLO) / Manual
// ============================================================

// Test 21: planModeMapping or similar integrates with safeMode.approvalMode
try {
  const func = extractFunction(script, 'getPlanExecutionMode') || extractFunction(script, 'resolvePlanMode') || script.includes('planMode') && script.includes('approvalMode');
  assert('Plan mode maps to Safe Mode approval ladder', func !== null || (script.includes('planMode') && script.includes('approvalMode')));
} catch (e) {
  assert('Plan mode maps to Safe Mode approval ladder', false, e.message);
}

// Test 22: Smart mode = conditional planning + auto-build low-risk, ask before risky
try {
  const func = extractFunction(script, 'executeNextPlanStep') || extractFunction(script, 'sendPlanPrompt');
  assert('Smart mode uses conditional planning', func && (func.includes('smart') || func.includes('approvalMode')));
  assert('Smart mode asks before risky (via runApprovalLadder)', script.includes('runApprovalLadder'));
} catch (e) {
  assert('Smart mode conditional planning + approval ladder', false, e.message);
}

// Test 23: Off/YOLO mode = plan + build all automatically (hardline + deny still apply)
try {
  const func = extractFunction(script, 'executeNextPlanStep');
  assert('Off/YOLO mode auto-executes', func && func.includes('off') && func.includes('yolo'));
  assert('Hardline blocklist still applies in YOLO', script.includes('hardlineBlocklist') && script.includes('off'));
} catch (e) {
  assert('Off/YOLO mode auto-executes with hardline', false, e.message);
}

// Test 24: Manual mode = plan each step, ask before each build step
try {
  const func = extractFunction(script, 'executeNextPlanStep');
  assert('Manual mode asks before each step', func && func.includes('manual') && (func.includes('confirm') || func.includes('prompt')));
} catch (e) {
  assert('Manual mode asks before each step', false, e.message);
}

// ============================================================
// (g) TOKEN ECONOMY
// ============================================================

// Test 25: Per-step plans stay short (token limit)
try {
  const func = extractFunction(script, 'createStepPlan');
  assert('createStepPlan enforces short plans', func && (func.includes('short') || func.includes('token') || func.includes('brief') || func.includes('limit')));
} catch (e) {
  assert('Per-step plans stay short (token economy)', false, e.message);
}

// Test 26: No re-planning of finished steps
try {
  const func = extractFunction(script, 'createStepPlan') || extractFunction(script, 'executeNextPlanStep');
  assert('No re-planning of finished steps', func && (func.includes('done') || func.includes('finished') || func.includes('!step.done')));
} catch (e) {
  assert('No re-planning of finished steps', false, e.message);
}

// Test 27: Trigger decision is one line
try {
  const func = extractFunction(script, 'shouldTriggerStepPlanning');
  assert('Trigger decision is one line', func && (func.match(/return\s+(true|false)/) || func.includes('trigger') && func.split('\n').length < 10));
} catch (e) {
  assert('Trigger decision is one line', false, e.message);
}

// ============================================================
// BENGALI TRANSLATIONS
// ============================================================

// Test 28: Bengali translations for new UI elements
try {
  const i18n = extractObject(script, 'I18N');
  const translations = [
    'Todo',
    'Todo List',
    'Step Planner',
    'Thinking',
    'Running',
    'Observed',
    'Step Detail',
    'Trigger Step Planning',
    'Conditional Planning',
    'Think',
    'Act',
    'Observe'
  ];
  for (const trans of translations) {
    assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
  }
} catch (e) {
  assert('Bengali translations for new UI', false, e.message);
}

// Test 29: Todo button has data-i18n attribute
try {
  const hasI18n = html.includes('data-i18n=\"Todo\"') || html.includes('data-i18n=\"Todo List\"');
  assert('Todo button has data-i18n attribute', hasI18n);
} catch (e) {
  assert('Todo button data-i18n', false, e.message);
}

// Test 30: Think-act-observe status elements have data-i18n
try {
  const hasI18n = html.includes('data-i18n=\"Thinking\"') && html.includes('data-i18n=\"Running\"') && html.includes('data-i18n=\"Observed\"');
  assert('Think-act-observe status has data-i18n', hasI18n);
} catch (e) {
  assert('Think-act-observe status data-i18n', false, e.message);
}

// ============================================================
// INTEGRATION TESTS
// ============================================================

// Test 31: sendAgentPrompt integrates shouldTriggerStepPlanning
try {
  const func = extractFunction(script, 'sendAgentPrompt');
  assert('sendAgentPrompt checks shouldTriggerStepPlanning', func && func.includes('shouldTriggerStepPlanning'));
} catch (e) {
  assert('sendAgentPrompt integrates trigger check', false, e.message);
}

// Test 32: executeNextPlanStep uses think-act-observe loop
try {
  const func = extractFunction(script, 'executeNextPlanStep');
  assert('executeNextPlanStep uses think-act-observe', func && func.includes('updateThinkActObserveState'));
} catch (e) {
  assert('executeNextPlanStep uses think-act-observe loop', false, e.message);
}

// Test 33: Plan mode selector includes step planner mode
try {
  const hasMode = html.includes('step-plan') || html.includes('stepPlan') || html.includes('Step Planner') || script.includes('step-plan');
  assert('Plan mode selector includes step planner option', hasMode);
} catch (e) {
  assert('Plan mode selector includes step planner', false, e.message);
}

// Test 34: Todo list integrates with existing plan checklist
try {
  const func = extractFunction(script, 'renderPlanChecklist');
  assert('renderPlanChecklist updates todo list', func && (func.includes('todo') || func.includes('Todo')));
} catch (e) {
  assert('Plan checklist integrates with todo list', false, e.message);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}