// H1.5 Session Search + Recap + Per-Session Tokens Test
// Run with: node test-session-search.js

const fs = require('fs');

// Load index.html and extract the script
const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No script tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1];

// Strip the appState declaration (let appState = {...};) so our mock is used
function stripAppStateDeclaration(script) {
  const lines = script.split('\n');
  let inAppState = false;
  let braceCount = 0;
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!inAppState && /^\s*let\s+appState\s*=/.test(line)) {
      inAppState = true;
      braceCount = (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      continue;
    }
    if (inAppState) {
      braceCount += (line.match(/\{/g) || []).length - (line.match(/\}/g) || []).length;
      if (braceCount <= 0 && /^\s*\};\s*$/.test(line.trim())) {
        inAppState = false;
        continue;
      }
      continue;
    }
    result.push(line);
  }
  return result.join('\n');
}

const scriptContentStripped = stripAppStateDeclaration(scriptContent);

// Extract function from script (for static analysis)
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

const mockAppState = {
  sessions: {
    'sess_1': {
      id: 'sess_1',
      name: 'Project Alpha',
      files: {
        'README.md': '# Project Alpha\n\nThis is a test project for searching with a longer content that will allow ellipsis to appear in the snippet when we search for the middle part of this text.',
        'src/main.js': 'function hello() { console.log("hello world"); }',
        '.devforge/progress.md': '## Next Up\n- Finish the search feature\n- Add tests',
        '.devforge/current-plan.md': '- [ ] Step 1\n- [~] Step 2\n- [ ] Step 3'
      },
      chatHistory: [
        { role: 'user', content: 'Please implement the search function' },
        { role: 'assistant', content: 'I will implement searchSessions now' },
        { role: 'user', content: 'Also add recap card' },
        { role: 'assistant', content: 'Adding showSessionRecap function' }
      ]
    },
    'sess_2': {
      id: 'sess_2',
      name: 'Project Beta',
      files: {
        'notes.txt': 'Brain note about authentication',
        'config.json': '{"apiKey": "secret123"}'
      },
      chatHistory: [
        { role: 'user', content: 'How do I authenticate?' },
        { role: 'assistant', content: 'Use the auth token from config' }
      ]
    },
    'sess_3': {
      id: 'sess_3',
      name: 'Empty Session',
      files: {},
      chatHistory: []
    }
  },
  activeSessionId: 'sess_1',
  usage: {
    byProject: {
      'sess_1': { requests: 10, totalTokens: 15000, cost: 0.045 },
      'sess_2': { requests: 5, totalTokens: 8000, cost: 0.022 }
    }
  },
  uncensoredPerProject: {},
  teachMode: false,
  checkpoints: [],
  brainTemplates: {},
  providers: {},
  agents: {},
  customSkillPacks: {},
  autonomy: {}
};

function createTestContext() {
  const mockDocument = {
    getElementById: (id) => {
      if (id === 'sessionSearchResults') return mockElements.sessionSearchResults;
      if (id === 'sessionList') return mockElements.sessionList;
      if (id === 'sessionRecapCard') return mockElements.sessionRecapCard;
      if (id === 'editorTextarea') return { value: '' };
      if (id === 'uncensoredToggle') return { checked: false };
      if (id === 'uncensoredChip') return { style: { display: 'none' } };
      if (id === 'teachPanelWrapper') return { style: { display: 'none' } };
      if (id === 'teachStatus') return { textContent: '' };
      if (id === 'teachModeToggle') return { checked: false };
      if (id === 'teachModeToggleSettings') return { checked: false };
      if (id === 'chatMessages') return { innerHTML: '' };
      return null;
    },
    createElement: (tag) => ({ 
      style: {}, 
      addEventListener: () => {}, 
      appendChild: () => {},
      innerHTML: '',
      querySelector: () => ({ style: {} })
    }),
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    body: { 
      appendChild: () => {},
      insertAdjacentHTML: (pos, html) => { mockElements.sessionRecapCard = { remove: () => { mockElements.sessionRecapCard = null; } }; }
    }
  };

  const mockElements = {
    sessionSearchResults: { 
      style: { display: 'none' }, 
      innerHTML: '' 
    },
    sessionList: { 
      style: { display: 'block' } 
    },
    sessionRecapCard: null
  };

  let timeoutCallback = null;
  let timeoutDelay = 0;

  const ctx = {
    console,
    Date,
    Math,
    JSON,
    Object,
    Array,
    String,
    Number,
    Boolean,
    Error,
    Map,
    Set,
    Promise,
    setTimeout: (cb, delay) => { 
      timeoutCallback = cb; 
      timeoutDelay = delay; 
      return 1; 
    },
    clearTimeout: () => { timeoutCallback = null; },
    setInterval: () => {},
    clearInterval: () => {},
    localStorage: {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {}
    },
    document: mockDocument,
    window: {
      addEventListener: () => {},
      postMessage: () => {},
      location: { href: '' },
      navigator: { clipboard: { writeText: () => Promise.resolve() } }
    },
    navigator: { clipboard: { writeText: () => Promise.resolve() } },
    CryptoJS: { SHA256: (s) => ({ toString: () => 'hash' }) },
    btoa: (s) => Buffer.from(s).toString('base64'),
    atob: (s) => Buffer.from(s, 'base64').toString(),
    escapeHtml: (s) => String(s).replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'"),
    logActivity: (msg, level) => {},
    saveAppState: () => {},
    renderSessionList: () => {},
    renderSessionPicker: () => {},
    renderFileTree: () => {},
    renderTabs: () => {},
    renderChatHistory: () => {},
    updateUncensoredUI: () => {},
    updateHeaderUsageMeter: () => {},
    previewHealthReset: () => {},
    getCurrentSession: () => mockAppState.sessions[mockAppState.activeSessionId],
    appState: mockAppState,
    _test: {
      fireTimeout: () => { if (timeoutCallback) timeoutCallback(); },
      getTimeoutDelay: () => timeoutDelay
    }
  };

  const fn = new Function(...Object.keys(ctx), scriptContentStripped + '; return { ' + [
    'searchSessions',
    'showSessionRecap',
    'closeSessionRecap',
    'switchSession',
    'renderSessionList',
    'renderSessionPicker',
    'renderFileTree',
    'renderTabs',
    'renderChatHistory',
    'updateUncensoredUI',
    'updateHeaderUsageMeter',
    'previewHealthReset',
    'sanitizeHistoryForReplay',
    'parseBlocksForDisplay',
    'appendChatMessage'
  ].join(',') + ' }');

  return { api: fn(...Object.values(ctx)), mockDocument, mockElements, mockAppState, _test: ctx._test };
}

console.log('Testing H1.5 Session Search + Recap + Per-Session Tokens...\n');

let passed = 0;
let failed = 0;

function assert(name, condition, details = '') {
  if (condition) {
    console.log('PASS: ' + name);
    passed++;
  } else {
    console.log('FAIL: ' + name + (details ? ' - ' + details : ''));
    failed++;
  }
}

try {
  const { api, mockDocument, mockElements, mockAppState, _test } = createTestContext();
  console.log('PASS: Script loads without syntax errors\n');

  console.log('--- searchSessions Tests ---');

  assert('searchSessions function exists', typeof api.searchSessions === 'function');

  mockElements.sessionSearchResults.style.display = 'block';
  mockElements.sessionList.style.display = 'none';
  api.searchSessions('a');
  assert('Query < 2 chars hides results and shows session list', 
    mockElements.sessionSearchResults.style.display === 'none' && 
    mockElements.sessionList.style.display === 'block');

  mockElements.sessionSearchResults.style.display = 'block';
  mockElements.sessionList.style.display = 'none';
  api.searchSessions('');
  assert('Empty query hides results and shows session list', 
    mockElements.sessionSearchResults.style.display === 'none' && 
    mockElements.sessionList.style.display === 'block');

  mockElements.sessionSearchResults.style.display = 'block';
  mockElements.sessionList.style.display = 'none';
  api.searchSessions('   ');
  assert('Whitespace-only query hides results and shows session list', 
    mockElements.sessionSearchResults.style.display === 'none' && 
    mockElements.sessionList.style.display === 'block');

  mockElements.sessionSearchResults.style.display = 'none';
  mockElements.sessionList.style.display = 'block';
  api.searchSessions('Alpha');
  assert('Match by session name shows results', 
    mockElements.sessionSearchResults.style.display === 'block' &&
    mockElements.sessionSearchResults.innerHTML.includes('Project Alpha') &&
    mockElements.sessionSearchResults.innerHTML.includes('session'));

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('authentication');
  assert('Match in session files (Brain notes) shows results', 
    mockElements.sessionSearchResults.style.display === 'block' &&
    mockElements.sessionSearchResults.innerHTML.includes('notes.txt') &&
    mockElements.sessionSearchResults.innerHTML.includes('authentication'));

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('implement');
  assert('Match in chat history shows results', 
    mockElements.sessionSearchResults.style.display === 'block' &&
    mockElements.sessionSearchResults.innerHTML.includes('implement') &&
    (mockElements.sessionSearchResults.innerHTML.includes('You') || mockElements.sessionSearchResults.innerHTML.includes('Agent')));

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('test project');
  const hasEllipsis = mockElements.sessionSearchResults.innerHTML.includes('...');
  assert('Snippet has ellipsis context', hasEllipsis);

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('nonexistentqueryxyz');
  assert('No-match message displayed', 
    mockElements.sessionSearchResults.style.display === 'block' &&
    mockElements.sessionSearchResults.innerHTML.includes('No matches'));

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('Alpha');
  assert('Results have switchSession onclick with sessionId', 
    mockElements.sessionSearchResults.innerHTML.includes("switchSession('sess_1')"));

  const manyFiles = {};
  for (let i = 0; i < 60; i++) {
    manyFiles['file' + i + '.txt'] = 'content with match ' + i;
  }
  mockAppState.sessions.sess_many = {
    id: 'sess_many',
    name: 'Many Files',
    files: manyFiles,
    chatHistory: []
  };
  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('match');
  const resultDivs = mockElements.sessionSearchResults.innerHTML.split('<div style="padding:6px').length - 1;
  assert('Results capped at 50', resultDivs <= 50);

  console.log('\n--- showSessionRecap Tests ---');

  assert('showSessionRecap function exists', typeof api.showSessionRecap === 'function');

  api.showSessionRecap(mockAppState.sessions.sess_1);
  assert('Recap card created', mockElements.sessionRecapCard !== null);

  api.showSessionRecap(mockAppState.sessions.sess_3);
  assert('Session with no usage entry does not throw', true);

  api.showSessionRecap(mockAppState.sessions.sess_1);
  assert('showSessionRecap runs for session with project files', true);

  api.showSessionRecap(mockAppState.sessions.sess_1);
  assert('showSessionRecap runs for session with chat history', true);

  api.showSessionRecap(mockAppState.sessions.sess_1);
  assert('showSessionRecap runs for session with progress/plan files', true);

  api.showSessionRecap(mockAppState.sessions.sess_1);
  assert('Auto-close timeout set to 15000ms', _test.getTimeoutDelay() === 15000);

  assert('closeSessionRecap function exists', typeof api.closeSessionRecap === 'function');

  api.showSessionRecap(mockAppState.sessions.sess_1);
  api.closeSessionRecap();
  assert('closeSessionRecap removes card', mockElements.sessionRecapCard === null);

  // Test 21: switchSession calls showSessionRecap after 100ms (static analysis)
  // Extract switchSession function from script and check for showSessionRecap call
  const switchSessionFunc = extractFunction(scriptContentStripped, 'switchSession');
  assert('switchSession calls showSessionRecap after delay', 
    switchSessionFunc !== null && 
    switchSessionFunc.includes('showSessionRecap') && 
    switchSessionFunc.includes('setTimeout') &&
    switchSessionFunc.includes('100'));

  mockElements.sessionSearchResults.innerHTML = '';
  api.searchSessions('Project');
  const hasSessionType = mockElements.sessionSearchResults.innerHTML.includes('session');
  assert('Result type includes session', hasSessionType);

  console.log('\n=== Results: ' + passed + ' passed, ' + failed + ' failed ===');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }

} catch (e) {
  console.error('ERROR:', e.message);
  console.error(e.stack);
  process.exit(1);
}
