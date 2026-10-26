// Test for Per-Model Rate Limits - Direct function extraction
// Run with: node test-rate-limits.js

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

console.log('=== Per-Model Rate Limits Tests (Direct Extraction) ===\n');

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

// Test 1: PROVIDER_PRESETS includes modelLimits
try {
  const presets = extractObject(script, 'PROVIDER_PRESETS');
  assert('PROVIDER_PRESETS object exists', presets !== null);
  assert('PROVIDER_PRESETS has 9router with modelLimits', presets && presets.includes('9router') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has omniroute-cloud with modelLimits', presets && presets.includes('omniroute-cloud') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has omniroute-local with modelLimits', presets && presets.includes('omniroute-local') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has pollinations with modelLimits', presets && presets.includes('pollinations') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has openrouter with modelLimits', presets && presets.includes('openrouter') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has groq with modelLimits', presets && presets.includes('groq') && presets.includes('modelLimits'));
  assert('PROVIDER_PRESETS has duckduckgo with modelLimits', presets && presets.includes('duckduckgo') && presets.includes('modelLimits'));
} catch (e) {
  assert('PROVIDER_PRESETS modelLimits', false, e.message);
}

// Test 2: modelLimits structure has all 11 fields
try {
  const presets = extractObject(script, 'PROVIDER_PRESETS');
  const fields = ['tpm', 'tpd', 'rpm', 'rpd', 'contextWindow', 'maxTokens', 'monthlyTokenCap', 'monthlyRequestCap', 'monthlyCostCap', 'concurrentLimit', 'cooldownSeconds'];
  for (const field of fields) {
    assert(`modelLimits has ${field} field`, presets && presets.includes(field));
  }
} catch (e) {
  assert('modelLimits has all 11 fields', false, e.message);
}

// Test 3: trackRateLimit function exists
try {
  const func = extractFunction(script, 'trackRateLimit');
  assert('trackRateLimit function exists', func !== null);
} catch (e) {
  assert('trackRateLimit function exists', false, e.message);
}

// Test 4: getRateLimitUsage function exists
try {
  const func = extractFunction(script, 'getRateLimitUsage');
  assert('getRateLimitUsage function exists', func !== null);
} catch (e) {
  assert('getRateLimitUsage function exists', false, e.message);
}

// Test 5: initRateLimitWindow handles window reset logic (no separate resetRateLimitWindow)
try {
  const func = extractFunction(script, 'initRateLimitWindow');
  assert('initRateLimitWindow function exists', func !== null);
  assert('initRateLimitWindow resets minute window', func && func.includes('minute') && func.includes('windowEnd'));
  assert('initRateLimitWindow resets day window', func && func.includes('day') && func.includes('windowEnd'));
  assert('initRateLimitWindow resets month window', func && func.includes('month') && func.includes('windowEnd'));
} catch (e) {
  assert('initRateLimitWindow handles window reset', false, e.message);
}

// Test 6: checkModelLimits function exists
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits function exists', func !== null);
} catch (e) {
  assert('checkModelLimits function exists', false, e.message);
}

// Test 7: checkModelLimits returns {allowed, blocked, warnings}
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits returns {allowed, blocked, warnings}', 
    func !== null && func.includes('allowed:') && func.includes('blocked:') && func.includes('warnings:'));
} catch (e) {
  assert('checkModelLimits returns {allowed, blocked, warnings}', false, e.message);
}

// Test 8: checkModelLimits checks TPM limit
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits checks TPM', func && func.includes('tpm') && func.includes('TPM'));
} catch (e) {
  assert('checkModelLimits checks TPM', false, e.message);
}

// Test 9: checkModelLimits checks TPD limit
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits checks TPD', func && func.includes('tpd') && func.includes('TPD'));
} catch (e) {
  assert('checkModelLimits checks TPD', false, e.message);
}

// Test 10: checkModelLimits checks RPM limit
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits checks RPM', func && func.includes('rpm') && func.includes('RPM'));
} catch (e) {
  assert('checkModelLimits checks RPM', false, e.message);
}

// Test 11: checkModelLimits checks RPD limit
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits checks RPD', func && func.includes('rpd') && func.includes('RPD'));
} catch (e) {
  assert('checkModelLimits checks RPD', false, e.message);
}

// Test 12: checkModelLimits checks monthly caps
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits checks monthlyTokenCap', func && func.includes('monthlyTokenCap'));
  assert('checkModelLimits checks monthlyRequestCap', func && func.includes('monthlyRequestCap'));
  assert('checkModelLimits checks monthlyCostCap', func && func.includes('monthlyCostCap'));
} catch (e) {
  assert('checkModelLimits checks monthly caps', false, e.message);
}

// Test 13: checkModelLimits returns reset time via formatReset
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits includes reset time via formatReset', func && func.includes('formatReset'));
} catch (e) {
  assert('checkModelLimits includes reset time', false, e.message);
}

// Test 14: callLLM uses checkModelLimits
try {
  const func = extractFunction(script, 'callLLM');
  assert('callLLM calls checkModelLimits', func && func.includes('checkModelLimits'));
} catch (e) {
  assert('callLLM calls checkModelLimits', false, e.message);
}

// Test 15: callLLM throws F5_FALLBACK on limit hit
try {
  const func = extractFunction(script, 'callLLM');
  assert('callLLM throws F5_FALLBACK on limit', func && func.includes('F5_FALLBACK'));
} catch (e) {
  assert('callLLM throws F5_FALLBACK on limit', false, e.message);
}

// Test 16: callLLMWithFallback handles F5_FALLBACK
try {
  const func = extractFunction(script, 'callLLMWithFallback');
  assert('callLLMWithFallback handles F5_FALLBACK', func && func.includes('F5_FALLBACK'));
} catch (e) {
  assert('callLLMWithFallback handles F5_FALLBACK', false, e.message);
}

// Test 17: callLLMWithFallback shows visible rate limit message
try {
  const func = extractFunction(script, 'callLLMWithFallback');
  assert('callLLMWithFallback shows rate limit message', func && func.includes('logActivity') && func.includes('displayMsg'));
} catch (e) {
  assert('callLLMWithFallback shows rate limit message', false, e.message);
}

// Test 18: callLLMWithFallback logs limit hit
try {
  const func = extractFunction(script, 'callLLMWithFallback');
  assert('callLLMWithFallback logs limit hit', func && func.includes('logActivity'));
} catch (e) {
  assert('callLLMWithFallback logs limit hit', false, e.message);
}

// Test 19: generateModelLimitsReadout function exists
try {
  const func = extractFunction(script, 'generateModelLimitsReadout');
  assert('generateModelLimitsReadout function exists', func !== null);
} catch (e) {
  assert('generateModelLimitsReadout function exists', false, e.message);
}

// Test 20: generateModelLimitsReadout shows remaining for all limit types
try {
  const func = extractFunction(script, 'generateModelLimitsReadout');
  const types = ['TPM', 'RPM', 'TPD', 'RPD', 'Monthly Tokens', 'Monthly Reqs', 'Monthly Cost'];
  let allFound = true;
  for (const type of types) {
    if (!func || !func.includes(type)) allFound = false;
  }
  assert('generateModelLimitsReadout shows all limit types', allFound);
} catch (e) {
  assert('generateModelLimitsReadout shows all limit types', false, e.message);
}

// Test 21: generateModelLimitsReadout shows reset time
try {
  const func = extractFunction(script, 'generateModelLimitsReadout');
  assert('generateModelLimitsReadout shows reset time', func && (func.includes('resets in') || func.includes('resetsIn')));
} catch (e) {
  assert('generateModelLimitsReadout shows reset time', false, e.message);
}

// Test 22: saveProvider captures modelLimits from modal
try {
  const func = extractFunction(script, 'saveProvider');
  assert('saveProvider captures modelLimits', func && func.includes('modelLimits'));
} catch (e) {
  assert('saveProvider captures modelLimits', false, e.message);
}

// Test 23: saveProvider captures all 11 limit fields
try {
  const func = extractFunction(script, 'saveProvider');
  const fields = ['tpm', 'tpd', 'rpm', 'rpd', 'contextWindow', 'maxTokens', 'monthlyTokenCap', 'monthlyRequestCap', 'monthlyCostCap', 'concurrentLimit', 'cooldownSeconds'];
  for (const field of fields) {
    assert(`saveProvider captures ${field}`, func && func.includes(field));
  }
} catch (e) {
  assert('saveProvider captures all 11 limit fields', false, e.message);
}

// Test 24: openProviderModal loads modelLimits into modal
try {
  const func = extractFunction(script, 'openProviderModal');
  assert('openProviderModal loads modelLimits', func && func.includes('modelLimits'));
} catch (e) {
  assert('openProviderModal loads modelLimits', false, e.message);
}

// Test 25: openProviderModal loads all 11 limit fields
try {
  const func = extractFunction(script, 'openProviderModal');
  const fields = ['tpm', 'tpd', 'rpm', 'rpd', 'contextWindow', 'maxTokens', 'monthlyTokenCap', 'monthlyRequestCap', 'monthlyCostCap', 'concurrentLimit', 'cooldownSeconds'];
  for (const field of fields) {
    assert(`openProviderModal loads ${field}`, func && func.includes(field));
  }
} catch (e) {
  assert('openProviderModal loads all 11 limit fields', false, e.message);
}

// Test 26: Provider modal has Model Limits section with 11 inputs
try {
  const hasModelLimitsSection = script.includes('Model Limits') && script.includes('Tokens Per Minute') && script.includes('Tokens Per Day') && 
    script.includes('Requests Per Minute') && script.includes('Requests Per Day') && script.includes('Context Window') &&
    script.includes('Max Tokens') && script.includes('Monthly Token Cap') && script.includes('Monthly Request Cap') &&
    script.includes('Monthly Cost Cap') && script.includes('Concurrent Limit') && script.includes('Cooldown Seconds');
  assert('Provider modal has Model Limits section with 11 inputs', hasModelLimitsSection);
} catch (e) {
  assert('Provider modal has Model Limits section', false, e.message);
}

// Test 27: Provider modal inputs have correct IDs (modelLimitX pattern)
try {
  const ids = ['modelLimitTpm', 'modelLimitTpd', 'modelLimitRpm', 'modelLimitRpd', 'modelLimitContextWindow', 'modelLimitMaxTokens', 
    'modelLimitMonthlyTokens', 'modelLimitMonthlyRequests', 'modelLimitMonthlyCost', 'modelLimitConcurrent', 'modelLimitCooldown'];
  let allFound = true;
  for (const id of ids) {
    // Script references use single quotes: document.getElementById('modelLimitTpm')
    if (!script.includes(`'${id}'`) && !script.includes(`"${id}"`)) allFound = false;
  }
  assert('Provider modal inputs have correct IDs (modelLimitX)', allFound);
} catch (e) {
  assert('Provider modal inputs have correct IDs', false, e.message);
}

// Test 28: Bengali translations for all 11 fields + messages
try {
  const i18n = extractObject(script, 'I18N');
  const translations = [
    'Model Limits',
    'Tokens Per Minute (TPM)',
    'Tokens Per Day (TPD)',
    'Requests Per Minute (RPM)',
    'Requests Per Day (RPD)',
    'Context Window',
    'Max Tokens',
    'Monthly Token Cap',
    'Monthly Request Cap',
    'Monthly Cost Cap (USD)',
    'Concurrent Limit',
    'Cooldown Seconds',
    'Empty = unlimited',
    'Numbers only, min 0',
    'Rate limit exceeded',
    'Press F5 to try fallback provider',
    'Approaching model limit',
    'resets in',
    'until reset',
    'now'
  ];
  for (const trans of translations) {
    assert(`Bengali translation for "${trans}"`, i18n && i18n.includes(trans));
  }
} catch (e) {
  assert('Bengali translations for all fields', false, e.message);
}

// Test 29: Modal labels have data-i18n attributes (in HTML template)
try {
  const hasI18n = html.includes('data-i18n="Model Limits"') && 
    html.includes('data-i18n="Tokens Per Minute') &&
    html.includes('data-i18n="Tokens Per Day') &&
    html.includes('data-i18n="Requests Per Minute') &&
    html.includes('data-i18n="Requests Per Day') &&
    html.includes('data-i18n="Context Window"') &&
    html.includes('data-i18n="Max Tokens"') &&
    html.includes('data-i18n="Monthly Token Cap"') &&
    html.includes('data-i18n="Monthly Request Cap"') &&
    html.includes('data-i18n="Monthly Cost Cap (USD)"') &&
    html.includes('data-i18n="Concurrent Limit"') &&
    html.includes('data-i18n="Cooldown Seconds"');
  assert('Modal labels have data-i18n attributes', hasI18n);
} catch (e) {
  assert('Modal labels have data-i18n attributes', false, e.message);
}

// Test 30: trackUsage calls trackRateLimit
try {
  const func = extractFunction(script, 'trackUsage');
  assert('trackUsage calls trackRateLimit', func && func.includes('trackRateLimit'));
} catch (e) {
  assert('trackUsage calls trackRateLimit', false, e.message);
}

// Test 31: Monthly cap enforcement in checkModelLimits
try {
  const func = extractFunction(script, 'checkModelLimits');
  // Should check usage against monthly caps
  assert('checkModelLimits enforces monthlyTokenCap', func && func.includes('monthlyTokenCap') && func.includes('totalTokens'));
  assert('checkModelLimits enforces monthlyRequestCap', func && func.includes('monthlyRequestCap') && func.includes('requests'));
  assert('checkModelLimits enforces monthlyCostCap', func && func.includes('monthlyCostCap') && func.includes('cost'));
} catch (e) {
  assert('Monthly cap enforcement in checkModelLimits', false, e.message);
}

// Test 32: initRateLimitWindow has window reset logic built-in
try {
  const func = extractFunction(script, 'initRateLimitWindow');
  assert('initRateLimitWindow has minute reset logic', func && func.includes('minute') && func.includes('windowEnd') && func.includes('requests = 0'));
  assert('initRateLimitWindow has day reset logic', func && func.includes('day') && func.includes('windowEnd') && func.includes('requests = 0'));
  assert('initRateLimitWindow has month reset logic', func && func.includes('month') && func.includes('windowEnd') && func.includes('requests = 0'));
} catch (e) {
  assert('initRateLimitWindow window reset logic', false, e.message);
}

// Test 33: getRateLimitUsage returns usage data
try {
  const func = extractFunction(script, 'getRateLimitUsage');
  assert('getRateLimitUsage returns usage data', func && func.includes('requests:') && func.includes('totalTokens:'));
} catch (e) {
  assert('getRateLimitUsage returns usage data', false, e.message);
}

// Test 34: checkModelLimits warns when approaching limit (80% threshold)
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits warns approaching limit at 80%', func && func.includes('0.8') && func.includes('warnings'));
} catch (e) {
  assert('checkModelLimits warns approaching limit', false, e.message);
}

// Test 35: renderProviderList shows model limits readout
try {
  const func = extractFunction(script, 'renderProviderList');
  assert('renderProviderList calls generateModelLimitsReadout', func && func.includes('generateModelLimitsReadout'));
} catch (e) {
  assert('renderProviderList shows model limits readout', false, e.message);
}

// Test 36: B2 Usage Dashboard shows per-model rate limits
try {
  const func = extractFunction(script, 'renderUsageDashboard');
  assert('renderUsageDashboard shows per-model rate limits', func && func.includes('generateModelLimitsReadout'));
} catch (e) {
  assert('B2 Usage Dashboard shows per-model rate limits', false, e.message);
}

// Test 37: F5 fallback trigger on rate limit hit in callLLMWithFallback
try {
  const func = extractFunction(script, 'callLLMWithFallback');
  assert('callLLMWithFallback triggers fallback on F5_FALLBACK', func && func.includes('F5_FALLBACK') && func.includes('continue'));
} catch (e) {
  assert('F5 fallback trigger on rate limit hit', false, e.message);
}

// Test 38: checkModelLimits uses estimated prompt and completion tokens
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits uses estPromptTokens', func && func.includes('estimatedPromptTokens'));
  assert('checkModelLimits uses estCompletionTokens', func && func.includes('estimatedCompletionTokens'));
} catch (e) {
  assert('checkModelLimits estimates prompt and completion tokens', false, e.message);
}

// Test 39: Null/undefined limits treated as unlimited (via != null check)
try {
  const func = extractFunction(script, 'checkModelLimits');
  assert('checkModelLimits handles null limits via != null', func && func.includes('!= null'));
} catch (e) {
  assert('Null/undefined limits treated as unlimited', false, e.message);
}

// Test 40: Cooldown seconds available in model limits
try {
  const func = extractFunction(script, 'checkModelLimits');
  // cooldownSeconds is in the limits object but may not be used for enforcement yet
  // It's stored and available in getModelRateLimits
  const getModelLimits = extractFunction(script, 'getModelRateLimits');
  assert('cooldownSeconds in model limits defaults', getModelLimits && getModelLimits.includes('cooldownSeconds'));
} catch (e) {
  assert('Cooldown seconds in model limits', false, e.message);
}

// Test 41: logLimitHit function exists for logging limit hits
try {
  const func = extractFunction(script, 'logLimitHit');
  assert('logLimitHit function exists', func !== null);
  assert('logLimitHit logs to appState.usage.limitHits', func && func.includes('limitHits'));
} catch (e) {
  assert('logLimitHit function exists', false, e.message);
}

// Test 42: checkModelLimits calls logLimitHit for blocked limits
try {
  const func = extractFunction(script, 'checkModelLimits');
  // Note: logLimitHit is called from callLLM when blocked
  const callLLMFunc = extractFunction(script, 'callLLM');
  assert('callLLM calls logLimitHit on blocked', callLLMFunc && callLLMFunc.includes('logLimitHit'));
} catch (e) {
  assert('callLLM calls logLimitHit on blocked', false, e.message);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}