// Test for H1.3: Bounded Memory Discipline - Direct function extraction
// Run with: node test-memory-discipline.js

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
  // Match function declaration: function name(...) { ... }
  const regex = new RegExp(`function\\s+${funcName}\\s*\\([^)]*\\)\\s*\\{`, 'g');
  const match = regex.exec(script);
  if (!match) return null;
  
  const start = match.index + match[0].length - 1; // Include the opening brace
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

// Extract constants
function extractConstant(script, constName) {
  const regex = new RegExp(`const\\s+${constName}\\s*=\\s*([^;]+);`);
  const match = regex.exec(script);
  return match ? match[1].trim() : null;
}

console.log('=== H1.3 Bounded Memory Discipline Tests (Direct Extraction) ===\n');

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

// Test 1: WORKING_MEMORY_CAP constant exists
try {
  const cap = extractConstant(script, 'WORKING_MEMORY_CAP');
  assert('WORKING_MEMORY_CAP constant defined', 
    cap !== null && cap.includes('2200'));
} catch (e) {
  assert('WORKING_MEMORY_CAP constant defined', false, e.message);
}

// Test 2: writeWorkingMemory function exists
try {
  const func = extractFunction(script, 'writeWorkingMemory');
  assert('writeWorkingMemory function exists', func !== null);
} catch (e) {
  assert('writeWorkingMemory function exists', false, e.message);
}

// Test 3: consolidateWorkingMemory function exists
try {
  const func = extractFunction(script, 'consolidateWorkingMemory');
  assert('consolidateWorkingMemory function exists', func !== null);
} catch (e) {
  assert('consolidateWorkingMemory function exists', false, e.message);
}

// Test 4: scanForInjection function exists
try {
  const func = extractFunction(script, 'scanForInjection');
  assert('scanForInjection function exists', func !== null);
} catch (e) {
  assert('scanForInjection function exists', false, e.message);
}

// Test 5: scanForInjection has injection patterns
try {
  const func = extractFunction(script, 'scanForInjection');
  const patterns = [
    'ignore\\\\s+previous\\\\s+instructions',
    'system\\\\s*[::]',
    '###\\\\s*instruction',
    '<script',
    '\\{\\{.*\\}\\}',
    'eval\\\\s*\\(',
    'document\\\\.cookie',
    'localStorage|sessionStorage',
    'fetch\\\\s*\\(|XMLHttpRequest',
    'password|secret|token|api[_-]?key'
  ];
  
  let allFound = true;
  for (const pattern of patterns) {
    if (!func || !func.includes(pattern.replace(/\\\\/g, '\\'))) {
      allFound = false;
      break;
    }
  }
  assert('scanForInjection has all injection patterns', allFound);
} catch (e) {
  assert('scanForInjection has all injection patterns', false, e.message);
}

// Test 6: writeBrainNote includes injection scan
try {
  const func = extractFunction(script, 'writeBrainNote');
  assert('writeBrainNote includes injection scan call', 
    func !== null && func.includes('scanForInjection'));
} catch (e) {
  assert('writeBrainNote includes injection scan call', false, e.message);
}

// Test 7: writeBrainNote throws on injection
try {
  const func = extractFunction(script, 'writeBrainNote');
  assert('writeBrainNote throws on injection', 
    func !== null && func.includes('Injection scan blocked') && func.includes('throw'));
} catch (e) {
  assert('writeBrainNote throws on injection', false, e.message);
}

// Test 8: Frozen snapshot cache variables exist
try {
  assert('_frozenBrainDigestCache variable exists', 
    script.includes('_frozenBrainDigestCache'));
  assert('_turnCounter variable exists', 
    script.includes('_turnCounter'));
  assert('incrementTurn function exists', 
    script.includes('function incrementTurn'));
} catch (e) {
  assert('Frozen snapshot cache variables exist', false, e.message);
}

// Test 9: buildSystemContextWithGuard uses frozen snapshot
try {
  const func = extractFunction(script, 'buildSystemContextWithGuard');
  assert('buildSystemContextWithGuard uses frozen snapshot cache', 
    func !== null && func.includes('_frozenBrainDigestCache') && func.includes('_turnCounter'));
} catch (e) {
  assert('buildSystemContextWithGuard uses frozen snapshot cache', false, e.message);
}

// Test 10: incrementTurn called in handleSend
try {
  assert('incrementTurn called in handleSend', 
    script.includes('incrementTurn(); // H1.3: advance turn for frozen snapshot'));
} catch (e) {
  assert('incrementTurn called in handleSend', false, e.message);
}

// Test 11: createNewSession initializes workingMemory
try {
  const func = extractFunction(script, 'createNewSession');
  assert('createNewSession initializes workingMemory', 
    func !== null && func.includes('workingMemory:') && func.includes("''"));
} catch (e) {
  assert('createNewSession initializes workingMemory', false, e.message);
}

// Test 12: writeWorkingMemory throws on cap exceeded
try {
  const func = extractFunction(script, 'writeWorkingMemory');
  assert('writeWorkingMemory throws on cap exceeded', 
    func !== null && func.includes('Working memory cap exceeded') && func.includes('throw'));
} catch (e) {
  assert('writeWorkingMemory throws on cap exceeded', false, e.message);
}

// Test 13: consolidateWorkingMemory compresses content
try {
  const func = extractFunction(script, 'consolidateWorkingMemory');
  assert('consolidateWorkingMemory compresses content', 
    func !== null && func.includes('[Consolidated...]') && func.includes('WORKING_MEMORY_CAP'));
} catch (e) {
  assert('consolidateWorkingMemory compresses content', false, e.message);
}

// Test 14: scanForInjection returns object with clean and issues
try {
  const func = extractFunction(script, 'scanForInjection');
  assert('scanForInjection returns {clean, issues}', 
    func !== null && func.includes('clean:') && func.includes('issues:'));
} catch (e) {
  assert('scanForInjection returns {clean, issues}', false, e.message);
}

// Test 15: Working memory cap is ~2200 chars
try {
  const cap = extractConstant(script, 'WORKING_MEMORY_CAP');
  assert('Working memory cap ~2200 chars', 
    cap !== null && parseInt(cap) >= 2000 && parseInt(cap) <= 2500);
} catch (e) {
  assert('Working memory cap ~2200 chars', false, e.message);
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed ===`);

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}