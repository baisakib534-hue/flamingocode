// Test for Local AI Support (B4.6) - Direct function extraction
// Run with: node test-local-ai.js

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
  let searchStr = `async function ${funcName}(`;
  let idx = script.indexOf(searchStr);
  if (idx === -1) {
    searchStr = `function ${funcName}(`;
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

// Extract object
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

console.log('=== Local AI Support (B4.6) Tests (Direct Extraction) ===\n');

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
// (a) PROVIDER_PRESETS includes local-ai preset
// ============================================================

const presets = extractObject(script, 'PROVIDER_PRESETS');
assert('PROVIDER_PRESETS object exists', presets !== null);
assert('PROVIDER_PRESETS has local-ai key', presets && presets.includes('local-ai'));
assert('local-ai preset has name "Local AI"', presets && presets.includes('Local AI'));
assert('local-ai preset type is openai-compatible', presets && presets.includes('openai-compatible'));
assert('local-ai preset baseUrl is localhost:11434', presets && presets.includes('localhost:11434'));
assert('local-ai preset model is llama3.1:8b', presets && presets.includes('llama3.1:8b'));
assert('local-ai preset authStyle is none', presets && presets.includes('authStyle') && presets.includes('none'));
assert('local-ai preset has isLocal: true', presets && presets.includes('isLocal: true'));
assert('local-ai preset has modelLimits', presets && presets.includes('modelLimits'));

// ============================================================
// (b) Provider modal HTML has Local AI option in preset select
// ============================================================

assert('Provider modal has local-ai option in preset select', html.includes('value="local-ai"') && html.includes('Local AI (Ollama'));
assert('local-ai option mentions Ollama and LM Studio', html.includes('Ollama') && html.includes('LM Studio') && html.includes('11434'));

// ============================================================
// (c) Local AI guidance section in provider modal
// ============================================================

assert('Provider modal has localAiGuidance div', html.includes('id="localAiGuidance"'));
assert('Guidance has Local AI Setup heading', html.includes('Local AI Setup') && html.includes('data-i18n="Local AI Setup"'));
assert('Guidance mentions Ollama serve command', html.includes('ollama serve'));
assert('Guidance mentions LM Studio Local Server', html.includes('LM Studio') && html.includes('Local Server'));
assert('Guidance mentions model pull command', html.includes('ollama pull'));
assert('Guidance mentions CORS proxy', html.includes('CORS') && html.includes('proxy'));

// ============================================================
// (d) Local connection status indicator
// ============================================================

assert('Provider modal has localConnectionStatus div', html.includes('id="localConnectionStatus"'));
assert('Connection status has indicator element', html.includes('id="localStatusIndicator"'));
assert('Connection status has text element', html.includes('id="localStatusText"'));
assert('Check Connection button exists', html.includes('id="btnCheckLocalConnection"'));
assert('Check Connection button has data-i18n', html.includes('data-i18n="Check Connection"'));

// ============================================================
// (e) checkLocalConnection function exists
// ============================================================

const checkLocalFunc = extractFunction(script, 'checkLocalConnection');
assert('checkLocalConnection function exists', checkLocalFunc !== null);
assert('checkLocalConnection is async', checkLocalFunc && checkLocalFunc.includes('async function'));
assert('checkLocalConnection takes baseUrl, indicatorEl, textEl', checkLocalFunc && checkLocalFunc.includes('baseUrl') && checkLocalFunc.includes('indicatorEl') && checkLocalFunc.includes('textEl'));
assert('checkLocalConnection handles empty baseUrl', checkLocalFunc && checkLocalFunc.includes('Enter Base URL'));
assert('checkLocalConnection calls fetch with /models endpoint', checkLocalFunc && checkLocalFunc.includes('/models') && checkLocalFunc.includes('fetch'));
assert('checkLocalConnection has 5 second timeout', checkLocalFunc && checkLocalFunc.includes('AbortSignal.timeout(5000)'));
assert('checkLocalConnection handles OK response', checkLocalFunc && checkLocalFunc.includes('res.ok') && checkLocalFunc.includes('Online'));
assert('checkLocalConnection handles HTTP error', checkLocalFunc && checkLocalFunc.includes('HTTP') && checkLocalFunc.includes('Offline'));
assert('checkLocalConnection handles timeout', checkLocalFunc && checkLocalFunc.includes('TimeoutError') && checkLocalFunc.includes('Timeout'));
assert('checkLocalConnection handles CORS error', checkLocalFunc && checkLocalFunc.includes('CORS') && checkLocalFunc.includes('CORS blocked'));
assert('checkLocalConnection handles connection refused', checkLocalFunc && checkLocalFunc.includes('Failed to fetch') && checkLocalFunc.includes('Connection refused'));
assert('checkLocalConnection handles generic error', checkLocalFunc && checkLocalFunc.includes('Error: '));

// ============================================================
// (f) openProviderModal integrates local AI logic
// ============================================================

const openProviderFunc = extractFunction(script, 'openProviderModal');
assert('openProviderModal function exists', openProviderFunc !== null);
assert('openProviderModal gets localAiGuidance element', openProviderFunc && openProviderFunc.includes('localAiGuidance'));
assert('openProviderModal gets localConnectionStatus element', openProviderFunc && openProviderFunc.includes('localConnectionStatus'));
assert('openProviderModal gets localStatusIndicator element', openProviderFunc && openProviderFunc.includes('localStatusIndicator'));
assert('openProviderModal gets localStatusText element', openProviderFunc && openProviderFunc.includes('localStatusText'));
assert('openProviderModal gets btnCheckLocalConnection element', openProviderFunc && openProviderFunc.includes('btnCheckLocalConnection'));
assert('openProviderModal checks isLocalPreset', openProviderFunc && openProviderFunc.includes('local-ai') && openProviderFunc.includes('omniroute-local'));
assert('openProviderModal checks isLocalUrl (localhost/127.0.0.1)', openProviderFunc && openProviderFunc.includes('localhost') && openProviderFunc.includes('127.0.0.1'));
assert('openProviderModal shows guidance for local preset', openProviderFunc && openProviderFunc.includes('localGuidance.style.display') && openProviderFunc.includes('block'));
assert('openProviderModal shows status for local preset', openProviderFunc && openProviderFunc.includes('localStatus.style.display') && openProviderFunc.includes('flex'));
assert('openProviderModal calls checkLocalConnection on open', openProviderFunc && openProviderFunc.includes('checkLocalConnection(currentBaseUrl'));
assert('openProviderModal has presetSelect.onchange handler', openProviderFunc && openProviderFunc.includes('presetSelect.onchange'));
assert('openProviderModal has baseUrlInput.oninput handler', openProviderFunc && openProviderFunc.includes('baseUrlInput.oninput'));
assert('openProviderModal has checkBtn.onclick handler', openProviderFunc && openProviderFunc.includes('checkBtn.onclick'));

// ============================================================
// (g) Bengali translations for Local AI
// ============================================================

const i18nObj = extractObject(script, 'I18N');
assert('I18N object exists', i18nObj !== null);
assert('Bengali: Local AI Setup', i18nObj && i18nObj.includes('Local AI Setup') && i18nObj.includes('লোকাল AI সেটআপ'));
assert('Bengali: For Ollama: run', i18nObj && i18nObj.includes('For Ollama: run') && i18nObj.includes('Ollama-এর জন্য: চালান'));
assert('Bengali: For LM Studio: enable', i18nObj && i18nObj.includes('For LM Studio: enable') && i18nObj.includes('LM Studio-এর জন্য: সক্রিয় করুন'));
assert('Bengali: Model must be loaded', i18nObj && i18nObj.includes('Model must be loaded') && i18nObj.includes('মডেল লোড করা থাকতে হবে'));
assert('Bengali: CORS may be needed', i18nObj && i18nObj.includes('CORS may be needed') && i18nObj.includes('CORS দরকার হতে পারে'));
assert('Bengali: Check Connection', i18nObj && i18nObj.includes('Check Connection') && i18nObj.includes('সংযোগ চেক করুন'));
assert('Bengali: Enter Base URL', i18nObj && i18nObj.includes('Enter Base URL') && i18nObj.includes('বেস ইউআরএল লিখুন'));
assert('Bengali: Checking...', i18nObj && i18nObj.includes('Checking...') && i18nObj.includes('চেক করা হচ্ছে...'));
assert('Bengali: Online', i18nObj && i18nObj.includes('Online') && i18nObj.includes('অনলাইন'));
assert('Bengali: Offline', i18nObj && i18nObj.includes('Offline') && i18nObj.includes('অফলাইন'));
assert('Bengali: Timeout', i18nObj && i18nObj.includes('Timeout') && i18nObj.includes('টাইমআউট'));
assert('Bengali: CORS blocked', i18nObj && i18nObj.includes('CORS blocked') && i18nObj.includes('CORS ব্লক করা হয়েছে'));
assert('Bengali: Connection refused', i18nObj && i18nObj.includes('Connection refused') && i18nObj.includes('সংযোগ প্রত্যাখ্যান করা হয়েছে'));
assert('Bengali: Error:', i18nObj && i18nObj.includes('Error: ') && i18nObj.includes('ত্রুটি: '));

// ============================================================
// (h) local-ai preset has modelLimits with all 11 fields
// ============================================================

const limitFields = ['tpm', 'tpd', 'rpm', 'rpd', 'contextWindow', 'maxTokens', 'monthlyTokenCap', 'monthlyRequestCap', 'monthlyCostCap', 'concurrentLimit', 'cooldownSeconds'];
for (const field of limitFields) {
  assert(`local-ai modelLimits has ${field}`, presets && presets.includes('local-ai') && presets.includes(field));
}

// ============================================================
// Results
// ============================================================

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}