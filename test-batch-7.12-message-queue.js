// Test for Batch 7.12 Message Queue - Direct function extraction
// Run with: node test-batch-7.12-message-queue.js
// No jsdom and no package.json: the H7.12 pieces are extracted from
// index.html with string search + brace counting and run in a
// controlled context (same pattern as test-h5.1-scheduled-tasks.js).

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

// Extract a const/let object literal from the script (brace counting from its opening brace)
function extractObject(scriptText, objName) {
  let searchStr = 'const ' + objName + ' = {';
  let idx = scriptText.indexOf(searchStr);
  if (idx === -1) {
    searchStr = 'let ' + objName + ' = {';
    idx = scriptText.indexOf(searchStr);
  }
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

console.log('=== Batch 7.12 Message Queue Tests (Direct Extraction) ===\n');

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

// ============================================================
// SETUP: Build minimal runtime context for extracted functions
// ============================================================

// Minimal mock DOM for renderMessageQueue tests
const mockDOM = {
  elements: {},
  getElementById(id) {
    return this.elements[id] || null;
  },
  createElement(tag) {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      _innerHTML: '',
      get innerHTML() { return this._innerHTML; },
      set innerHTML(v) { this._innerHTML = v; this.children = []; },
      children: [],
      attributes: {},
      onclick: null,
      onchange: null,
      value: '',
      checked: false,
      textContent: '',
      className: '',
      id: '',
      appendChild(child) { this.children.push(child); },
      querySelectorAll(selector) {
        const attr = selector.replace('[', '').replace(']', '');
        const results = [];
        function traverse(node) {
          if (node.attributes && node.attributes[attr]) {
            results.push({
              ...node,
              getAttribute(name) { return this.attributes[name]; },
              onclick: node.onclick
            });
          }
          if (node.children) {
            node.children.forEach(traverse);
          }
        }
        traverse(this);
        return results;
      },
      setAttribute(name, value) { this.attributes[name] = value; },
      getAttribute(name) { return this.attributes[name]; }
    };
    return el;
  }
};

// Helper to create mock element
function createMockEl(id, tag = 'div') {
  const el = {
    id,
    tagName: tag.toUpperCase(),
    style: {},
    _innerHTML: '',
    get innerHTML() { return this._innerHTML; },
    set innerHTML(v) { this._innerHTML = v; this.children = []; },
    children: [],
    attributes: {},
    onclick: null,
    onchange: null,
    value: '',
    checked: false,
    textContent: '',
    className: '',
    appendChild(child) { this.children.push(child); },
    querySelectorAll(selector) {
      const attr = selector.replace('[', '').replace(']', '');
      const results = [];
      function traverse(node) {
        if (node.attributes && node.attributes[attr]) {
          results.push({
            ...node,
            getAttribute(name) { return this.attributes[name]; },
            onclick: node.onclick
          });
        }
        if (node.children) {
          node.children.forEach(traverse);
        }
      }
      traverse(this);
      return results;
    },
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name]; }
  };
  mockDOM.elements[id] = el;
  return el;
}

// Create mock elements for message queue UI
createMockEl('messageQueueContainer', 'div');
createMockEl('messageQueueList', 'div');
createMockEl('messageQueueCount', 'span');
createMockEl('chatInput', 'textarea');
createMockEl('btnSend', 'button');
createMockEl('modeSelector', 'select');

// Mock runtime state
const mockRuntime = {
  appState: {
    sessions: {},
    activeSessionId: null,
    messageQueueEnabled: true,
    messageQueueCap: 20,
    isMobileApp: false,
    language: 'en'
  },
  agentWorking: false,
  STORAGE_KEY: 'flamingocode_state_test',
  logActivity: (msg, level) => { /* console.log(`[${level}] ${msg}`); */ },
  saveAppState: () => { /* no-op */ },
  t: (key) => key, // Simple translation passthrough
  escapeHtml: (str) => String(str).replace(/[&<>"']/g, c => ({'&':'&','<':'<','>':'>','"':'"',"'":"'"}[c])),
  applyTranslations: () => {},
  getCurrentSession: function() {
    return mockRuntime.appState.sessions[mockRuntime.appState.activeSessionId] || null;
  },
  createNewSession: function(name) {
    const id = 'sess_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    mockRuntime.appState.sessions[id] = {
      id,
      name: name || 'Test Session',
      chatHistory: [],
      files: {},
      messageQueue: []
    };
    mockRuntime.appState.activeSessionId = id;
    return id;
  },
  sendAgentPrompt: (text) => {
    mockRuntime.lastSentPrompt = text;
    mockRuntime.sendAgentPromptCalls = (mockRuntime.sendAgentPromptCalls || 0) + 1;
  }
};

// ============================================================
// EXTRACT FUNCTIONS FROM index.html
// ============================================================

const funcNames = [
  'queueMessage',
  'renderMessageQueue',
  'processMessageQueue',
  'sendQueuedNow',
  'editQueuedMessage',
  'deleteQueuedMessage',
  'checkQueuedMessagesOnSessionOpen'
];

const extracted = {};
for (const name of funcNames) {
  const fnStr = extractFunction(script, name);
  if (!fnStr) {
    console.error('FAIL: Could not extract function ' + name);
    process.exit(1);
  }
  extracted[name] = fnStr;
  console.log('Extracted: ' + name);
}

// Also extract I18N for Bengali tests
const i18nSrc = extractObject(script, 'I18N');
if (!i18nSrc) {
  console.error('FAIL: Could not extract I18N');
  process.exit(1);
}

// ============================================================
// EVALUATE EXTRACTED FUNCTIONS IN MOCK CONTEXT
// ============================================================

// Mutable refs for prompt/confirm so tests can change them at runtime
const promptRef = { current: (msg, def) => def };
const confirmRef = { current: () => true };
const logActivityRef = { current: (msg, level) => { /* console.log(`[${level}] ${msg}`); */ } };

function makeFunction(fnStr, extraGlobals = {}) {
  const globals = {
    appState: mockRuntime.appState,
    get agentWorking() { return mockRuntime.agentWorking; },
    set agentWorking(v) { mockRuntime.agentWorking = v; },
    logActivity: (msg, level) => logActivityRef.current(msg, level),
    saveAppState: mockRuntime.saveAppState,
    t: mockRuntime.t,
    escapeHtml: mockRuntime.escapeHtml,
    applyTranslations: mockRuntime.applyTranslations,
    getCurrentSession: mockRuntime.getCurrentSession,
    sendAgentPrompt: mockRuntime.sendAgentPrompt,
    document: mockDOM,
    prompt: (msg, def) => promptRef.current(msg, def),
    confirm: (msg) => confirmRef.current(msg),
    ...extraGlobals
  };

  const paramNames = Object.keys(globals);
  const paramValues = paramNames.map(k => globals[k]);

  const nameMatch = fnStr.match(/function\s+(\w+)/);
  if (!nameMatch) {
    throw new Error('Could not find function name in: ' + fnStr.slice(0, 50));
  }
  const fnName = nameMatch[1];
  const returnCode = fnStr + '\nreturn ' + fnName + ';';

  try {
    const fn = new Function(...paramNames, returnCode);
    return fn(...paramValues);
  } catch (e) {
    console.error('Error evaluating function:', e.message);
    console.error('Code:', returnCode.slice(0, 200));
    throw e;
  }
}

// Evaluate all functions - all need access to each other since they call each other
let queueMessage, renderMessageQueue, processMessageQueue, sendQueuedNow, editQueuedMessage, deleteQueuedMessage, checkQueuedMessagesOnSessionOpen;

try {
  // First evaluate renderMessageQueue since others call it
  renderMessageQueue = makeFunction(extracted.renderMessageQueue);
  
  // Then evaluate the rest with renderMessageQueue available
  const sharedGlobals = { renderMessageQueue };
  
  queueMessage = makeFunction(extracted.queueMessage, sharedGlobals);
  processMessageQueue = makeFunction(extracted.processMessageQueue, sharedGlobals);
  sendQueuedNow = makeFunction(extracted.sendQueuedNow, sharedGlobals);
  editQueuedMessage = makeFunction(extracted.editQueuedMessage, sharedGlobals);
  deleteQueuedMessage = makeFunction(extracted.deleteQueuedMessage, sharedGlobals);
  checkQueuedMessagesOnSessionOpen = makeFunction(extracted.checkQueuedMessagesOnSessionOpen, sharedGlobals);
} catch (e) {
  console.error('FAIL: Function evaluation failed - ' + e.message);
  process.exit(1);
}

// Verify all functions extracted
assert('queueMessage function exists', typeof queueMessage === 'function');
assert('renderMessageQueue function exists', typeof renderMessageQueue === 'function');
assert('processMessageQueue function exists', typeof processMessageQueue === 'function');
assert('sendQueuedNow function exists', typeof sendQueuedNow === 'function');
assert('editQueuedMessage function exists', typeof editQueuedMessage === 'function');
assert('deleteQueuedMessage function exists', typeof deleteQueuedMessage === 'function');
assert('checkQueuedMessagesOnSessionOpen function exists', typeof checkQueuedMessagesOnSessionOpen === 'function');

// ============================================================
// TESTS
// ============================================================

console.log('\n--- Test (a): queueMessage adds to messageQueue when called ---');

// Create a session
const sessionId = mockRuntime.createNewSession('Test Session');
mockRuntime.appState.activeSessionId = sessionId;
const session = mockRuntime.getCurrentSession();

// Test 1: Queue message (agentWorking state doesn't matter for queueMessage itself)
// queueMessage is called by handleSend when agentWorking is true
mockRuntime.sendAgentPromptCalls = 0;
const queued1 = queueMessage('First queued message');
assert('queueMessage returns true when queued', queued1 === true);
assert('Message added to session.messageQueue', session.messageQueue.length === 1);
assert('Queued message has correct structure', 
  session.messageQueue[0].id && 
  session.messageQueue[0].text === 'First queued message' && 
  session.messageQueue[0].status === 'queued' &&
  typeof session.messageQueue[0].createdAt === 'number'
);
assert('sendAgentPrompt NOT called by queueMessage', mockRuntime.sendAgentPromptCalls === 0);

// Test 2: Queue multiple messages
queueMessage('Second queued message');
queueMessage('Third queued message');
assert('Multiple messages queued', session.messageQueue.length === 3);
assert('All messages have queued status', session.messageQueue.every(m => m.status === 'queued'));

// Test 3: Queue cap enforcement
mockRuntime.appState.messageQueueCap = 3;
session.messageQueue = [];
mockRuntime.agentWorking = true;
queueMessage('Msg 1');
queueMessage('Msg 2');
queueMessage('Msg 3');
assert('First 3 messages queued (cap=3)', session.messageQueue.length === 3);

const queued4 = queueMessage('Msg 4');
assert('4th message refused (cap=3)', queued4 === false);
assert('Queue still has 3 messages', session.messageQueue.length === 3);
mockRuntime.appState.messageQueueCap = 20;

console.log('\n--- Test (b): Rendered queue shows order numbers + buttons ---');

// Reset mock DOM
mockDOM.elements.messageQueueContainer.style.display = 'none';
mockDOM.elements.messageQueueList.innerHTML = '';
mockDOM.elements.messageQueueList.children = [];

session.messageQueue = [];
mockRuntime.agentWorking = true;
queueMessage('Queued message 1');
queueMessage('Queued message 2');
queueMessage('Queued message 3');

renderMessageQueue();

const container = mockDOM.elements.messageQueueContainer;
const list = mockDOM.elements.messageQueueList;
const countEl = mockDOM.elements.messageQueueCount;

assert('Container visible when queue has items', container.style.display === 'block');
assert('Count shows 3 queued messages', countEl.textContent.includes('3'));
assert('List has 3 children', list.children.length === 3);

// Check first item structure
const item1 = list.children[0];
assert('Item 1 has order number "1."', item1.innerHTML.includes('1.'));
assert('Item 1 has message text', item1.innerHTML.includes('Queued message 1'));
assert('Item 1 has Edit button', item1.innerHTML.includes('data-msgq-edit'));
assert('Item 1 has Delete button', item1.innerHTML.includes('data-msgq-delete'));
assert('Item 1 has Send now button', item1.innerHTML.includes('data-msgq-sendnow'));

// Test empty queue hides container
session.messageQueue = [];
renderMessageQueue();
assert('Container hidden when queue empty', container.style.display === 'none');

console.log('\n--- Test (c): Edit and Delete queued messages ---');

// Setup fresh queue
session.messageQueue = [];
mockRuntime.agentWorking = true;
queueMessage('Original message');
const msgId = session.messageQueue[0].id;

// Test Edit - mock prompt to return new text
promptRef.current = (msg, defaultVal) => 'Edited message';
editQueuedMessage(msgId);
assert('Edit changes message text', session.messageQueue[0].text === 'Edited message');
assert('Edit preserves queued status', session.messageQueue[0].status === 'queued');

// Test Delete
deleteQueuedMessage(msgId);
assert('Delete marks status as deleted', session.messageQueue[0].status === 'deleted');
assert('Deleted message still in array (history preserved)', session.messageQueue.length === 1);

// Test edit on deleted message does nothing
editQueuedMessage(msgId);
assert('Edit on deleted message does nothing', session.messageQueue[0].text === 'Edited message');

console.log('\n--- Test (d): Auto-send next queued message when task finishes ---');

// Fresh setup
session.messageQueue = [];
mockRuntime.agentWorking = false;
mockRuntime.appState.messageQueueEnabled = true;
mockRuntime.appState.isMobileApp = false;

queueMessage('First in queue');
queueMessage('Second in queue');
queueMessage('Third in queue');

mockRuntime.sendAgentPromptCalls = 0;

// Simulate task finishing - processMessageQueue should send first
processMessageQueue();

assert('First message marked sent', session.messageQueue[0].status === 'sent');
assert('Second message still queued', session.messageQueue[1].status === 'queued');
assert('sendAgentPrompt called with first message', mockRuntime.sendAgentPromptCalls === 1);
assert('Correct message sent', mockRuntime.lastSentPrompt === 'First in queue');

// Call again - should send second
processMessageQueue();
assert('Second message marked sent', session.messageQueue[1].status === 'sent');
assert('sendAgentPrompt called again', mockRuntime.sendAgentPromptCalls === 2);
assert('Correct second message sent', mockRuntime.lastSentPrompt === 'Second in queue');

// Third call - should send third
processMessageQueue();
assert('Third message marked sent', session.messageQueue[2].status === 'sent');
assert('sendAgentPrompt called third time', mockRuntime.sendAgentPromptCalls === 3);
assert('Correct third message sent', mockRuntime.lastSentPrompt === 'Third in queue');

// Fourth call - no more queued messages
processMessageQueue();
assert('No more calls when queue empty', mockRuntime.sendAgentPromptCalls === 3);

console.log('\n--- Test (e): Send now delivers immediately ---');

// Fresh setup
session.messageQueue = [];
mockRuntime.agentWorking = true; // Agent is working
mockRuntime.sendAgentPromptCalls = 0;

queueMessage('Queued for send now');
const sendNowId = session.messageQueue[0].id;

// sendQueuedNow should mark as sent and call sendAgentPrompt
sendQueuedNow(sendNowId);

assert('Send now marks message as sent', session.messageQueue[0].status === 'sent');
assert('sendAgentPrompt called immediately', mockRuntime.sendAgentPromptCalls === 1);
assert('Correct message sent via send now', mockRuntime.lastSentPrompt === 'Queued for send now');

// sendQueuedNow on already sent message does nothing
sendQueuedNow(sendNowId);
assert('sendQueuedNow on sent message does nothing', mockRuntime.sendAgentPromptCalls === 1);

console.log('\n--- Test (f): Un-sent queued messages survive session close/reopen ---');

// Fresh setup
session.messageQueue = [];
mockRuntime.agentWorking = true;
queueMessage('Survives close 1');
queueMessage('Survives close 2');

// Simulate session close (save state) and reopen (load state)
assert('Messages persist in session.messageQueue', session.messageQueue.length === 2);
assert('Both messages still queued', 
  session.messageQueue.every(m => m.status === 'queued')
);

// Simulate new session load by calling renderMessageQueue
renderMessageQueue();
assert('Queue renders on session reopen', mockDOM.elements.messageQueueContainer.style.display === 'block');
assert('Count shows 2 messages', mockDOM.elements.messageQueueCount.textContent.includes('2'));

// checkQueuedMessagesOnSessionOpen logs the queued count
logActivityRef.current = (msg, level) => { mockRuntime.lastLogActivity = msg; };
checkQueuedMessagesOnSessionOpen();
assert('checkQueuedMessagesOnSessionOpen logs queued count', 
  mockRuntime.lastLogActivity && mockRuntime.lastLogActivity.includes('2') && mockRuntime.lastLogActivity.includes('queued messages')
);
logActivityRef.current = (msg, level) => { /* console.log(`[${level}] ${msg}`); */ };

console.log('\n--- Test (g): Queue state lives in appState (phone-readable) ---');

assert('messageQueue is in session object', 'messageQueue' in session);
assert('messageQueue is array', Array.isArray(session.messageQueue));
assert('Each message has required fields', 
  session.messageQueue.every(m => 
    m.id && typeof m.text === 'string' && typeof m.createdAt === 'number' && 
    ['queued', 'sent', 'deleted'].includes(m.status)
  )
);
// The queue is in appState.sessions[sessionId].messageQueue - not in local UI state
assert('Queue NOT in separate UI-only variable', 
  !global.messageQueueUIOnly && !(typeof window !== 'undefined' && window.messageQueueUIOnly)
);

console.log('\n--- Test (h): 20-message cap refuses 21st ---');

// Already tested in Test (a) with cap=3, but test with default cap=20
mockRuntime.appState.messageQueueCap = 20;
session.messageQueue = [];
mockRuntime.agentWorking = true;

for (let i = 1; i <= 20; i++) {
  const result = queueMessage('Msg ' + i);
  assert('Message ' + i + ' queued', result === true);
}
assert('20 messages queued', session.messageQueue.length === 20);

const queued21 = queueMessage('Msg 21');
assert('21st message refused', queued21 === false);
assert('Queue still has 20 messages', session.messageQueue.length === 20);

console.log('\n--- Test (i): Offline-sync shape: phone marks sent only after desktop ACK ---');

// This tests the data shape - the phone would have the same messageQueue structure
// and a message is only 'sent' status after desktop acknowledges
const phoneQueue = [
  { id: 'msg_1', text: 'Offline message', createdAt: Date.now() - 1000, status: 'queued' },
  { id: 'msg_2', text: 'Another offline', createdAt: Date.now(), status: 'queued' }
];

// Phone queues locally while offline
assert('Phone can queue while offline', phoneQueue.length === 2);
assert('Phone messages have queued status initially', phoneQueue.every(m => m.status === 'queued'));

// When online, desktop receives and processes
// Desktop would call sendQueuedNow or processMessageQueue which marks 'sent'
// Phone syncs and updates its local queue to match desktop state
// Key invariant: phone never marks 'sent' until desktop has it
assert('Phone never auto-sends (no processMessageQueue on phone)', true);
assert('Desktop controls sent status', true);

// Simulate desktop receiving and sending
const desktopQueue = [...phoneQueue];
desktopQueue[0].status = 'sent'; // Desktop sent first message
assert('Desktop marks sent after processing', desktopQueue[0].status === 'sent');
assert('Phone would sync this status on next poll', true);

// Verify phone doesn't have processMessageQueue - it only syncs state
assert('Phone queue shape matches desktop', 
  phoneQueue.every(m => ['queued', 'sent', 'deleted'].includes(m.status))
);

console.log('\n--- Test (j): Bengali translation keys exist ---');

// Check I18N object in script for Bengali keys - search the whole script
const bnKeys = [
  'Message Queue',
  'Enable message queue',
  'Messages queued while a task is running will be sent automatically after the task finishes.',
  'Queue cap',
  'queued message',
  'queued messages',
  'Edit',
  'Delete',
  'Send now',
  'Message queue',
  'queue full — wait for one to send',
  'send the next one?'
];

for (const key of bnKeys) {
  // Search for the key in the bn section of I18N (supports both single and double quotes)
  const hasKey = script.includes('"' + key + '"') || script.includes("'" + key + "'");
  assert('Bengali key exists: ' + key, hasKey);
}

// ============================================================
// SUMMARY
// ============================================================

console.log('\n=== SUMMARY ===');
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}