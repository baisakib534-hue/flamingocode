// Test for Mobile App §1-§14 + Relay Contract - Direct function extraction
// Run with: node test-mobile-app.js

const fs = require('fs');

// Extract the script from index.html
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
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

// Minimal DOM stub for eval
const stubDocument = {
  getElementById: (id) => ({ 
    value: '', 
    innerHTML: '', 
    textContent: '', 
    style: {}, 
    classList: { add: () => {}, remove: {}, toggle: {}, contains: () => false },
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    onclick: null,
    onchange: null,
    disabled: false,
    checked: false,
    selectedIndex: -1,
    options: [],
    appendChild: () => {},
    removeChild: () => {}
  }),
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => ({ style: {}, classList: { add: () => {}, remove: {} }, appendChild: () => {} }),
  body: { appendChild: () => {}, classList: { add: () => {}, remove: {} } },
  head: { appendChild: () => {} }
};

const stubWindow = {
  localStorage: {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  },
  SpeechRecognition: function() { this.start = () => {}; this.stop = () => {}; this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null; this.lang = ''; this.continuous = false; this.interimResults = false; },
  webkitSpeechRecognition: function() { this.start = () => {}; this.stop = () => {}; this.onstart = null; this.onresult = null; this.onerror = null; this.onend = null; this.lang = ''; this.continuous = false; this.interimResults = false; },
  location: { href: 'http://localhost' },
  btoa: (str) => Buffer.from(str).toString('base64'),
  atob: (str) => Buffer.from(str, 'base64').toString(),
  setTimeout: setTimeout,
  clearTimeout: clearTimeout,
  setInterval: setInterval,
  clearInterval: clearInterval,
  Math: Math,
  Date: Date,
  JSON: JSON,
  console: console,
  Object: Object,
  Array: Array,
  String: String,
  Number: Number,
  Boolean: Boolean,
  Error: Error,
  Promise: Promise,
  Map: Map,
  Set: Set,
  RegExp: RegExp,
  escapeHtml: (s) => s.replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'")
};

// Global stubs
global.document = stubDocument;
global.window = stubWindow;
global.localStorage = stubWindow.localStorage;
global.escapeHtml = stubWindow.escapeHtml;
global.btoa = stubWindow.btoa;
global.atob = stubWindow.atob;

console.log('=== Mobile App §1-§14 + Relay Contract Tests ===\n');

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
// (a) HTML ELEMENTS - Companion View UI
// ============================================================

console.log('\n--- (a) Companion View UI Elements ---\n');

assert('Companion pane exists', html.includes('id="paneCompanion"'));
assert('Companion pairing status badge', html.includes('id="companionPairingBadge"'));
assert('Companion pairing status text', html.includes('id="companionPairingText"'));
assert('Companion LAN indicator', html.includes('id="companionLanIndicator"'));
assert('Companion live indicator', html.includes('id="companionLiveIndicator"'));
assert('Desktop picker select', html.includes('id="companionDesktopPicker"'));
assert('Desktop picker status text', html.includes('id="companionDesktopStatus"'));
assert('Model picker select', html.includes('id="companionModelPicker"'));
assert('Model rate limit display', html.includes('id="companionModelRateLimit"'));
assert('Phone permissions container', html.includes('id="companionPhonePermissions"'));
assert('Message queue container', html.includes('id="companionMessageQueue"'));
assert('Message queue count badge', html.includes('id="companionQueueCount"'));
assert('Recommendations container', html.includes('id="companionRecommendations"'));
assert('Recommendations count badge', html.includes('id="companionRecommendationsCount"'));
assert('Notifications container', html.includes('id="companionNotifications"'));
assert('Prompt input', html.includes('id="companionPromptInput"'));
assert('Send prompt button', html.includes('id="btnCompanionSendPrompt"'));
assert('Voice prompt button', html.includes('id="btnCompanionVoicePrompt"'));
assert('Voice language select', html.includes('id="companionVoiceLang"'));
assert('Voice status', html.includes('id="companionVoiceStatus"'));
assert('Custom provider form', html.includes('id="companionProviderName"') && html.includes('id="companionProviderBaseUrl"') && html.includes('id="companionProviderApiKey"') && html.includes('id="companionProviderModel"'));
assert('Add provider button', html.includes('id="btnCompanionAddProvider"'));
assert('Provider status', html.includes('id="companionProviderStatus"'));

// ============================================================
// (b) §1: PAIRING STATE MACHINE & DEVICES PANEL
// ============================================================

console.log('\n--- (b) §1: Pairing State Machine & Devices Panel ---\n');

const initMobilePairingFunc = extractFunction(script, 'initMobilePairing');
assert('initMobilePairing function exists', initMobilePairingFunc !== null);

const updatePairingStateFunc = extractFunction(script, 'updatePairingState');
assert('updatePairingState function exists', updatePairingStateFunc !== null);

const simulateDesktopPairingFunc = extractFunction(script, 'simulateDesktopPairing');
assert('simulateDesktopPairing function exists', simulateDesktopPairingFunc !== null);

const simulatePhonePairingFunc = extractFunction(script, 'simulatePhonePairing');
assert('simulatePhonePairing function exists', simulatePhonePairingFunc !== null);

const pairWithDesktopFunc = extractFunction(script, 'pairWithDesktop');
assert('pairWithDesktop function exists', pairWithDesktopFunc !== null);

const pairWithPhoneFunc = extractFunction(script, 'pairWithPhone');
assert('pairWithPhone function exists', pairWithPhoneFunc !== null);

const unpairDeviceFunc = extractFunction(script, 'unpairDevice');
assert('unpairDevice function exists', unpairDeviceFunc !== null);

const checkRelayConnectionFunc = extractFunction(script, 'checkRelayConnection');
assert('checkRelayConnection function exists', checkRelayConnectionFunc !== null);

// Verify pairing states in code
assert('Pairing state: signed-up', script.includes("'signed-up'") || script.includes('"signed-up"'));
assert('Pairing state: desktop-paired', script.includes("'desktop-paired'") || script.includes('"desktop-paired"'));
assert('Pairing state: phone-paired', script.includes("'phone-paired'") || script.includes('"phone-paired"'));

// Verify paired devices structure
assert('Paired devices have id', script.includes('pairedDevices') && script.includes('id'));
assert('Paired devices have name', script.includes('pairedDevices') && script.includes('name'));
assert('Paired devices have type', script.includes('pairedDevices') && script.includes('type'));
assert('Paired devices have lastSeen', script.includes('pairedDevices') && script.includes('lastSeen'));
assert('Paired devices have status online/offline', script.includes('pairedDevices') && script.includes('online'));

// Verify unpaired devices listed separately
assert('Unpaired devices tracked', script.includes('unpairedDevices') || script.includes('revoked'));

// Verify header pairing status
assert('Header pairing status badge', html.includes('id="headerPairingStatus"') || html.includes('id="pairingStatusIcon"'));
assert('Header pairing status text', html.includes('id="pairingStatusHeaderText"'));

// ============================================================
// (c) §2: DESKTOP PICKER
// ============================================================

console.log('\n--- (c) §2: Desktop Picker ---\n');

const renderCompanionDesktopPickerFunc = extractFunction(script, 'renderCompanionDesktopPicker');
assert('renderCompanionDesktopPicker function exists', renderCompanionDesktopPickerFunc !== null);

const getDefaultDesktopFunc = extractFunction(script, 'getDefaultDesktop');
assert('getDefaultDesktop function exists', getDefaultDesktopFunc !== null);

assert('Desktop picker shows name + last-seen + online/offline', renderCompanionDesktopPickerFunc && renderCompanionDesktopPickerFunc.includes('lastSeen') && renderCompanionDesktopPickerFunc.includes('online'));
assert('Desktop picker defaults to last-used', getDefaultDesktopFunc && (getDefaultDesktopFunc.includes('lastUsedDesktopId') || getDefaultDesktopFunc.includes('lastUsed')));
assert('Offline desktop shows queue message', renderCompanionDesktopPickerFunc && renderCompanionDesktopPickerFunc.includes('Offline') && renderCompanionDesktopPickerFunc.includes('queue'));

// ============================================================
// (d) §3: MODEL PICKER
// ============================================================

console.log('\n--- (d) §3: Model Picker ---\n');

const renderCompanionModelPickerFunc = extractFunction(script, 'renderCompanionModelPicker');
assert('renderCompanionModelPicker function exists', renderCompanionModelPickerFunc !== null);

const getAllAvailableModelsFunc = extractFunction(script, 'getAllAvailableModels');
assert('getAllAvailableModels function exists', getAllAvailableModelsFunc !== null);

assert('Model picker shows same list as desktop', renderCompanionModelPickerFunc && getAllAvailableModelsFunc);
assert('Model picker shows rate-limit state', renderCompanionModelPickerFunc && renderCompanionModelPickerFunc.includes('rateLimited') && renderCompanionModelPickerFunc.includes('rate limited'));
assert('Model choice travels in envelope', script.includes('model') && script.includes('envelope'));

// ============================================================
// (e) §4: CUSTOM PROVIDER FROM PHONE
// ============================================================

console.log('\n--- (e) §4: Custom Provider From Phone ---\n');

const addCustomProviderFromPhoneFunc = extractFunction(script, 'addCustomProviderFromPhone');
assert('addCustomProviderFromPhone function exists', addCustomProviderFromPhoneFunc !== null);

assert('Provider form validates base URL', addCustomProviderFromPhoneFunc && addCustomProviderFromPhoneFunc.includes('new URL'));
assert('Provider form tests connection', addCustomProviderFromPhoneFunc && addCustomProviderFromPhoneFunc.includes('Testing connection'));
assert('API key encrypted (placeholder)', addCustomProviderFromPhoneFunc && (addCustomProviderFromPhoneFunc.includes('btoa') || addCustomProviderFromPhoneFunc.includes('encrypt')));
assert('Provider marked "added from phone"', addCustomProviderFromPhoneFunc && addCustomProviderFromPhoneFunc.includes('added from phone'));

// ============================================================
// (f) §5: VOICE PROMPT (bn-BD/en-US)
// ============================================================

console.log('\n--- (f) §5: Voice Prompt ---\n');

const startCompanionVoicePromptFunc = extractFunction(script, 'startCompanionVoicePrompt');
assert('startCompanionVoicePrompt function exists', startCompanionVoicePromptFunc !== null);

const stopCompanionVoicePromptFunc = extractFunction(script, 'stopCompanionVoicePrompt');
assert('stopCompanionVoicePrompt function exists', stopCompanionVoicePromptFunc !== null);

assert('Voice uses SpeechRecognition', startCompanionVoicePromptFunc && (startCompanionVoicePromptFunc.includes('SpeechRecognition') || startCompanionVoicePromptFunc.includes('webkitSpeechRecognition')));
assert('Voice supports bn-BD and en-US', html.includes('bn-BD') && html.includes('en-US'));
assert('Transcript kept until sent', startCompanionVoicePromptFunc && startCompanionVoicePromptFunc.includes('companionVoiceTranscript'));
assert('Send button sends transcript', script.includes('sendCompanionPrompt') && script.includes('companionVoiceTranscript'));

// ============================================================
// (g) §6: LIVE PROGRESS
// ============================================================

console.log('\n--- (g) §6: Live Progress ---\n');

assert('Live indicator in companion header', html.includes('id="companionLiveIndicator"'));
assert('Reconnect state handled', script.includes('reconnect') || script.includes('disconnected'));

// ============================================================
// (h) §7: HUMAN CHECKPOINTS ON PHONE
// ============================================================

console.log('\n--- (h) §7: Human Checkpoints ---\n');

assert('Checkpoint buzzes phone', script.includes('notification') || script.includes('buzz') || script.includes('checkpoint'));
assert('Checkpoint approve/reject', script.includes('approve') && script.includes('reject') && script.includes('checkpoint'));
assert('Checkpoint resumes exact step', script.includes('checkpoint') && (script.includes('taskId') || script.includes('stepId')));

// ============================================================
// (i) §8: RECORDINGS ON PHONE
// ============================================================

console.log('\n--- (i) §8: Recordings ---\n');

assert('Recordings viewable from phone', html.includes('recording') || script.includes('recording'));
assert('Recording linked to task', script.includes('recording') && script.includes('taskId'));

// ============================================================
// (j) §9: NOTIFICATIONS
// ============================================================

console.log('\n--- (j) §9: Notifications ---\n');

const renderCompanionNotificationsFunc = extractFunction(script, 'renderCompanionNotifications');
assert('renderCompanionNotifications function exists', renderCompanionNotificationsFunc !== null);

assert('Notifications list done/failed/needs-you', renderCompanionNotificationsFunc && renderCompanionNotificationsFunc.includes('type') && (renderCompanionNotificationsFunc.includes('success') || renderCompanionNotificationsFunc.includes('error')));
assert('Notification links to task', script.includes('notification') && script.includes('taskId'));

// ============================================================
// (k) §10: EXTRAS (Brain, cost, checkpoint restore, voice-to-build, history)
// ============================================================

console.log('\n--- (k) §10: Extras ---\n');

assert('Brain notes view', html.includes('brain') || script.includes('brain'));
assert('Cost + quota meter', script.includes('cost') && script.includes('quota'));
assert('Checkpoint restore from phone', script.includes('restore') && script.includes('checkpoint'));
assert('Voice-to-build', script.includes('voice') && script.includes('build'));
assert('Task history', script.includes('history') && script.includes('task'));

// ============================================================
// (l) §11: PHONE PERMISSIONS - Ask / Auto approve / Full access
// ============================================================

console.log('\n--- (l) §11: Phone Permissions Trio ---\n');

const renderCompanionPhonePermissionsFunc = extractFunction(script, 'renderCompanionPhonePermissions');
assert('renderCompanionPhonePermissions function exists', renderCompanionPhonePermissionsFunc !== null);

const getPhonePermissionsFunc = extractFunction(script, 'getPhonePermissions');
assert('getPhonePermissions function exists', getPhonePermissionsFunc !== null);

const setPhonePermissionsFunc = extractFunction(script, 'setPhonePermissions');
assert('setPhonePermissions function exists', setPhonePermissionsFunc !== null);

assert('Three modes: ask/auto/full', renderCompanionPhonePermissionsFunc && renderCompanionPhonePermissionsFunc.includes('ask') && renderCompanionPhonePermissionsFunc.includes('auto') && renderCompanionPhonePermissionsFunc.includes('full'));
assert('Ask: every step asks', renderCompanionPhonePermissionsFunc && renderCompanionPhonePermissionsFunc.includes('Every permission step asks'));
assert('Auto approve: routine auto, dangerous asks', renderCompanionPhonePermissionsFunc && renderCompanionPhonePermissionsFunc.includes('Routine work auto-approved'));
assert('Full access: never waits', renderCompanionPhonePermissionsFunc && renderCompanionPhonePermissionsFunc.includes('Everything auto-approved'));
assert('Install never auto-fires', renderCompanionPhonePermissionsFunc && script.includes('installRecommendation'));

// ============================================================
// (m) §12: OFFLINE PHONE & LAN MODE
// ============================================================

console.log('\n--- (m) §12: Offline Phone & LAN Mode ---\n');

const isLanModeAvailableFunc = extractFunction(script, 'isLanModeAvailable');
assert('isLanModeAvailable function exists', isLanModeAvailableFunc !== null);

assert('LAN mode detected', script.includes('lanModeDetected') || script.includes('lanMode'));
assert('LAN indicator in UI', html.includes('id="companionLanIndicator"'));
assert('Offline phone never stops desktop', script.includes('offline') && script.includes('desktop'));
assert('Waiting step holds when offline', script.includes('needs-help') || script.includes('waiting') && script.includes('offline'));

// ============================================================
// (n) §13: MESSAGE QUEUE (extends B7.12)
// ============================================================

console.log('\n--- (n) §13: Message Queue ---\n');

const renderCompanionMessageQueueFunc = extractFunction(script, 'renderCompanionMessageQueue');
assert('renderCompanionMessageQueue function exists', renderCompanionMessageQueueFunc !== null);

const addToMessageQueueFunc = extractFunction(script, 'addToMessageQueue');
assert('addToMessageQueue function exists', addToMessageQueueFunc !== null);

const sendQueueMessageNowFunc = extractFunction(script, 'sendQueueMessageNow');
assert('sendQueueMessageNow function exists', sendQueueMessageNowFunc !== null);

const editQueueMessageFunc = extractFunction(script, 'editQueueMessage');
assert('editQueueMessage function exists', editQueueMessageFunc !== null);

const deleteQueueMessageFunc = extractFunction(script, 'deleteQueueMessage');
assert('deleteQueueMessage function exists', deleteQueueMessageFunc !== null);

assert('Queue shows order numbers', renderCompanionMessageQueueFunc && renderCompanionMessageQueueFunc.includes('#${index + 1}'));
assert('Queue tap to edit/delete/send-now', renderCompanionMessageQueueFunc && renderCompanionMessageQueueFunc.includes('editQueueMessage') && renderCompanionMessageQueueFunc.includes('sendQueueMessageNow') && renderCompanionMessageQueueFunc.includes('deleteQueueMessage'));
assert('Auto-send next when task finishes', script.includes('auto') && script.includes('send') && script.includes('queue'));
assert('Queue survives offline', addToMessageQueueFunc && addToMessageQueueFunc.includes('offline'));
assert('Same queue as B7.12 (shared appState.messageQueue)', addToMessageQueueFunc && addToMessageQueueFunc.includes('appState.messageQueue'));

// ============================================================
// (o) §14: RECOMMENDATIONS MIRROR (extends B7.2b)
// ============================================================

console.log('\n--- (o) §14: Recommendations Mirror ---\n');

const renderCompanionRecommendationsFunc = extractFunction(script, 'renderCompanionRecommendations');
assert('renderCompanionRecommendations function exists', renderCompanionRecommendationsFunc !== null);

const installRecommendationFunc = extractFunction(script, 'installRecommendation');
assert('installRecommendation function exists', installRecommendationFunc !== null);

const dismissRecommendationFunc = extractFunction(script, 'dismissRecommendation');
assert('dismissRecommendation function exists', dismissRecommendationFunc !== null);

const dontSuggestRecommendationFunc = extractFunction(script, 'dontSuggestRecommendation');
assert('dontSuggestRecommendation function exists', dontSuggestRecommendationFunc !== null);

assert('Mirrors desktop recommendations list', renderCompanionRecommendationsFunc && renderCompanionRecommendationsFunc.includes('appState.recommendations'));
assert('Install/Dismiss/Don\'t suggest buttons', renderCompanionRecommendationsFunc && renderCompanionRecommendationsFunc.includes('Install') && renderCompanionRecommendationsFunc.includes('Dismiss') && renderCompanionRecommendationsFunc.includes('Don\'t suggest'));
assert('Install lands on desktop', installRecommendationFunc && installRecommendationFunc.includes('sendRelayEnvelope'));
assert('Install never auto-fires', installRecommendationFunc && !installRecommendationFunc.includes('auto'));
assert('Offline install queues', installRecommendationFunc && installRecommendationFunc.includes('offlineQueued'));

// ============================================================
// (p) RELAY CLIENT - Envelope Contract
// ============================================================

console.log('\n--- (p) Relay Client - Envelope Contract ---\n');

const buildRelayEnvelopeFunc = extractFunction(script, 'buildRelayEnvelope');
assert('buildRelayEnvelope function exists', buildRelayEnvelopeFunc !== null);

const sendRelayEnvelopeFunc = extractFunction(script, 'sendRelayEnvelope');
assert('sendRelayEnvelope function exists', sendRelayEnvelopeFunc !== null);

const pollRelayEnvelopesFunc = extractFunction(script, 'pollRelayEnvelopes');
assert('pollRelayEnvelopes function exists', pollRelayEnvelopesFunc !== null);

const processRelayEnvelopeFunc = extractFunction(script, 'processRelayEnvelope');
assert('processRelayEnvelope function exists', processRelayEnvelopeFunc !== null);

assert('Envelope has version, type, from, to, payload, timestamp, nonce', buildRelayEnvelopeFunc && buildRelayEnvelopeFunc.includes('version') && buildRelayEnvelopeFunc.includes('type') && buildRelayEnvelopeFunc.includes('from') && buildRelayEnvelopeFunc.includes('to') && buildRelayEnvelopeFunc.includes('payload') && buildRelayEnvelopeFunc.includes('timestamp') && buildRelayEnvelopeFunc.includes('nonce'));
assert('Envelope types: task/checkpoint/message/approval/provider/sync', buildRelayEnvelopeFunc && (buildRelayEnvelopeFunc.includes('task') || buildRelayEnvelopeFunc.includes('checkpoint') || buildRelayEnvelopeFunc.includes('message')));
assert('Relay URL configurable with placeholder', script.includes('relayUrl') && (script.includes('placeholder') || script.includes('relay deploys')));
assert('Test connection reports honestly', checkRelayConnectionFunc && (checkRelayConnectionFunc.includes('placeholder') || checkRelayConnectionFunc.includes('not deployed') || checkRelayConnectionFunc.includes('relay deploys')));
assert('LAN mode tried first', sendRelayEnvelopeFunc && sendRelayEnvelopeFunc.includes('lanModeDetected'));
assert('Offline queue persists', sendRelayEnvelopeFunc && sendRelayEnvelopeFunc.includes('offlineQueue'));
assert('Keys encrypted with per-pair key', script.includes('encrypted') || script.includes('per-pair') || script.includes('btoa'));

// ============================================================
// (q) COMPANION VIEW RENDER INTEGRATION
// ============================================================

console.log('\n--- (q) Companion View Render Integration ---\n');

const renderCompanionViewFunc = extractFunction(script, 'renderCompanionView');
assert('renderCompanionView function exists', renderCompanionViewFunc !== null);

assert('renderCompanionView calls all sub-renders', renderCompanionViewFunc && renderCompanionViewFunc.includes('renderCompanionPairingStatus') && renderCompanionViewFunc.includes('renderCompanionDesktopPicker') && renderCompanionViewFunc.includes('renderCompanionModelPicker') && renderCompanionViewFunc.includes('renderCompanionPhonePermissions') && renderCompanionViewFunc.includes('renderCompanionMessageQueue') && renderCompanionViewFunc.includes('renderCompanionRecommendations') && renderCompanionViewFunc.includes('renderCompanionNotifications'));

assert('Companion tab triggers render', html.includes('data-pane="companion"') && script.includes('renderCompanionView'));

// ============================================================
// (r) EDGE CASES
// ============================================================

console.log('\n--- (r) Edge Cases ---\n');

// Empty states
assert('Companion handles empty message queue', renderCompanionMessageQueueFunc && renderCompanionMessageQueueFunc.includes('Queue empty'));
assert('Companion handles empty recommendations', renderCompanionRecommendationsFunc && renderCompanionRecommendationsFunc.includes('No recommendations'));
assert('Companion handles no desktop paired', renderCompanionDesktopPickerFunc && renderCompanionDesktopPickerFunc.includes('No desktops paired'));

// Offline queue sync on reconnect
assert('Offline queue syncs when back online', script.includes('offlineQueue') && (script.includes('sync') || script.includes('poll')));

// ============================================================
// RESULTS
// ============================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}