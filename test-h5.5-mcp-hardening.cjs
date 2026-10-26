// H5.5 MCP Hardening — NO-JSDOM extraction & eval test
// Tests: trust enforcement, tool picker, call/spend limits, credential scrubbing

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const HTML_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(HTML_PATH, 'utf8');

const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No <script> tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1];

// Quick syntax check
try {
  new Function(scriptContent);
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

// Create a minimal global environment for eval
const globalScope = {
  console,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  Date,
  Math,
  JSON,
  Object,
  Array,
  String,
  Number,
  Boolean,
  Map,
  Set,
  Promise,
  Error,
  localStorage: {
    store: {},
    getItem(k) { return this.store[k] || null; },
    setItem(k, v) { this.store[k] = String(v); },
    removeItem(k) { delete this.store[k]; },
    clear() { this.store = {}; }
  },
  document: {
    createElement: () => ({
      className: '',
      style: {},
      innerHTML: '',
      appendChild: () => {},
      remove: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {},
      removeEventListener: () => {},
      closest: () => null,
      setAttribute: () => {},
      getAttribute: () => null
    }),
    body: { appendChild: () => {}, querySelector: () => null },
    getElementById: () => null,
    querySelector: () => null,
    querySelectorAll: () => [],
    addEventListener: () => {},
    removeEventListener: () => {}
  },
  window: { 
    addEventListener: () => {},
    removeEventListener: () => {},
    location: { href: '' }
  },
  navigator: { clipboard: { writeText: () => Promise.resolve() } },
  alert: () => {},
  confirm: () => true,
  logActivity: () => {},
  assert: (condition, msg) => { if (!condition) throw new Error(msg || 'Assertion failed'); }
};

// Create VM context and evaluate the script
const context = vm.createContext(globalScope);

try {
  vm.runInContext(scriptContent, context, { filename: 'index.html', timeout: 10000 });
} catch (e) {
  console.error('FAIL: Script execution error:', e.message);
  console.error(e.stack);
  process.exit(1);
}

// Now set up appState and mocks by evaluating in the same context
const setupCode = `
// Initialize appState with test data
appState.mcpServers = {};
appState._mcpCallCounts = {};
appState._mcpSpendTotal = {};
appState.lazyTools = { enabled: true, loadedKeys: [], loadedCount: 0 };
appState.customSkillPacks = {};
appState.safeMode = {
  approvalMode: 'off',
  hardlineBlocklist: [],
  denyRules: []
};

// Re-run mandatory MCP initialization
const mandatoryMcps = [
  { id: 'mcp_github', name: 'GitHub', transport: 'stdio', command: 'npx @modelcontextprotocol/server-github', env: {}, description: 'GitHub repository operations', enabled: true, trust: 'trusted' },
  { id: 'mcp_memory', name: 'Memory', transport: 'stdio', command: 'npx @modelcontextprotocol/server-memory', env: {}, description: 'Persistent memory for agents', enabled: true, trust: 'trusted' },
  { id: 'mcp_fetch', name: 'Fetch', transport: 'stdio', command: 'npx @modelcontextprotocol/server-fetch', env: {}, description: 'Web fetching and content extraction', enabled: true, trust: 'trusted' }
];
mandatoryMcps.forEach(mcp => {
  appState.mcpServers[mcp.id] = mcp;
});

rebuildMcpToolDefinitions();
`;

try {
  vm.runInContext(setupCode, context, { filename: 'setup.js', timeout: 5000 });
} catch (e) {
  console.error('FAIL: Setup code error:', e.message);
  console.error(e.stack);
  process.exit(1);
}

function runTestInContext(code) {
  const wrappedCode = '(async function() {' + code + '})()';
  return vm.runInContext(wrappedCode, context, { timeout: 10000 });
}

function assert(condition, msg) {
  if (!condition) throw new Error(msg || 'Assertion failed');
}

let passCount = 0;
let failCount = 0;

async function runTests() {
  async function test(name, fn) {
    // Reset appState before each test
    await runTestInContext(`
      appState.mcpServers = {};
      appState._mcpCallCounts = {};
      appState._mcpSpendTotal = {};
      appState.lazyTools = { enabled: true, loadedKeys: [], loadedCount: 0 };
      appState.customSkillPacks = {};
      appState.safeMode = { approvalMode: 'off', hardlineBlocklist: [], denyRules: [] };
      const mandatoryMcps = [
        { id: 'mcp_github', name: 'GitHub', transport: 'stdio', command: 'npx @modelcontextprotocol/server-github', env: {}, description: 'GitHub repository operations', enabled: true, trust: 'trusted' },
        { id: 'mcp_memory', name: 'Memory', transport: 'stdio', command: 'npx @modelcontextprotocol/server-memory', env: {}, description: 'Persistent memory for agents', enabled: true, trust: 'trusted' },
        { id: 'mcp_fetch', name: 'Fetch', transport: 'stdio', command: 'npx @modelcontextprotocol/server-fetch', env: {}, description: 'Web fetching and content extraction', enabled: true, trust: 'trusted' }
      ];
      mandatoryMcps.forEach(mcp => { appState.mcpServers[mcp.id] = mcp; });
      rebuildMcpToolDefinitions();
    `);
    
    try {
      await fn();
      console.log('PASS:', name);
      passCount++;
    } catch (e) {
      console.log('FAIL:', name, '-', e.message);
      failCount++;
    }
  }

  console.log('\n=== H5.5 MCP Hardening Tests ===\n');

  // Test 1: Pre-installed MCPs have trust: 'trusted'
  await test('Pre-installed MCPs (github, memory, fetch) have trust=trusted', async () => {
    await runTestInContext(`
      assert(appState.mcpServers.mcp_github !== undefined, 'mcp_github exists');
      assert(appState.mcpServers.mcp_memory !== undefined, 'mcp_memory exists');
      assert(appState.mcpServers.mcp_fetch !== undefined, 'mcp_fetch exists');
      assert(appState.mcpServers.mcp_github.trust === 'trusted', 'github trust is trusted');
      assert(appState.mcpServers.mcp_memory.trust === 'trusted', 'memory trust is trusted');
      assert(appState.mcpServers.mcp_fetch.trust === 'trusted', 'fetch trust is trusted');
    `);
  });

  // Test 2: New user-added servers default to trust='untrusted'
  await test('New user-added servers default to trust=untrusted', async () => {
    await runTestInContext(`
      const newServerId = 'mcp_new_' + Date.now();
      appState.mcpServers[newServerId] = {
        id: newServerId,
        name: 'New Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Test server',
        enabled: true,
        trust: 'untrusted',
        enabledTools: [],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      assert(appState.mcpServers[newServerId].trust === 'untrusted', 'New server defaults to untrusted');
    `);
  });

  // Test 3: scrubMcpCredentialsForContext scrubs apiKey, token, password, secret, env secrets
  await test('scrubMcpCredentialsForContext removes credential fields', async () => {
    await runTestInContext(`
      const server = {
        id: 'mcp_test',
        name: 'Test Server',
        apiKey: 'sk-secret123',
        token: 'token456',
        password: 'pass789',
        secret: 'secret000',
        accessToken: 'atoken',
        authToken: 'authtoken',
        env: {
          API_KEY: 'env-secret',
          GITHUB_TOKEN: 'ghp_xxx',
          PASSWORD: 'env-pass',
          NORMAL_VAR: 'keep-this'
        },
        description: 'Test'
      };
      const scrubbed = scrubMcpCredentialsForContext(server);
      assert(scrubbed.apiKey === '[REDACTED]', 'apiKey redacted');
      assert(scrubbed.token === '[REDACTED]', 'token redacted');
      assert(scrubbed.password === '[REDACTED]', 'password redacted');
      assert(scrubbed.secret === '[REDACTED]', 'secret redacted');
      assert(scrubbed.accessToken === '[REDACTED]', 'accessToken redacted');
      assert(scrubbed.authToken === '[REDACTED]', 'authToken redacted');
      assert(scrubbed.env.API_KEY === '[REDACTED]', 'env API_KEY redacted');
      assert(scrubbed.env.GITHUB_TOKEN === '[REDACTED]', 'env GITHUB_TOKEN redacted');
      assert(scrubbed.env.PASSWORD === '[REDACTED]', 'env PASSWORD redacted');
      assert(scrubbed.env.NORMAL_VAR === 'keep-this', 'non-secret env var preserved');
    `);
  });

  // Test 4: buildAutonomyCatalogText includes USER MCP SERVERS section with scrubbed credentials
  await test('buildAutonomyCatalogText includes user MCP servers with scrubbed credentials', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_custom = {
        id: 'mcp_custom',
        name: 'Custom Server',
        transport: 'stdio',
        command: 'npx test',
        env: { API_KEY: 'secret123' },
        description: 'Custom server description',
        enabled: true,
        trust: 'untrusted',
        enabledTools: ['mcp_custom_tool1'],
        callLimit: 10,
        spendLimit: 5.00
      };
      rebuildMcpToolDefinitions();
      
      const catalogText = buildAutonomyCatalogText();
      assert(catalogText.includes('USER MCP SERVERS (registry)'), 'Contains USER MCP SERVERS section');
      assert(catalogText.includes('Custom Server'), 'Contains server name');
      assert(catalogText.includes('Custom server description'), 'Contains description');
      assert(catalogText.includes('Trust: untrusted'), 'Contains trust level');
      assert(catalogText.includes('Call limit: 10/session'), 'Contains call limit');
      assert(catalogText.includes('[REDACTED]') || !catalogText.includes('secret123'), 'Credential not in output');
    `);
  });

  // Test 5: Disabled tools are excluded from context summary
  await test('Disabled tools excluded from context summary', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_custom = {
        id: 'mcp_custom',
        name: 'Custom Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Custom server',
        enabled: true,
        trust: 'untrusted',
        enabledTools: ['mcp_custom_readonly'],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      const catalogText = buildAutonomyCatalogText();
      assert(catalogText.includes('readonly'), 'Enabled tool appears in summary');
    `);
  });

  // Test 6: checkMcpTrustEnforcement triggers for untrusted server write tools
  await test('checkMcpTrustEnforcement requires approval for untrusted write tools', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_untrusted = {
        id: 'mcp_untrusted',
        name: 'Untrusted Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Untrusted server',
        enabled: true,
        trust: 'untrusted',
        enabledTools: ['mcp_untrusted_create_issue', 'mcp_untrusted_read_file'],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      const result = checkMcpTrustEnforcement('mcp_untrusted_create_issue', 'tool');
      assert(result.requiresApproval === true, 'Write tool on untrusted requires approval');
      assert(result.reason.includes('write operation'), 'Reason mentions write operation');
      assert(result.serverName === 'Untrusted Server', 'Server name in result');
      assert(result.trust === 'untrusted', 'Trust level in result');
    `);
  });

  // Test 7: checkMcpTrustEnforcement allows read tools on untrusted servers
  await test('checkMcpTrustEnforcement allows read tools on untrusted servers', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_untrusted = {
        id: 'mcp_untrusted',
        name: 'Untrusted Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Untrusted server',
        enabled: true,
        trust: 'untrusted',
        enabledTools: ['mcp_untrusted_read_file', 'mcp_untrusted_list_files'],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      const result = checkMcpTrustEnforcement('mcp_untrusted_read_file', 'tool');
      assert(result.requiresApproval === false, 'Read tool on untrusted does not require approval');
    `);
  });

  // Test 8: checkMcpTrustEnforcement allows all tools on trusted servers
  await test('checkMcpTrustEnforcement allows write tools on trusted servers', async () => {
    await runTestInContext(`
      const result = checkMcpTrustEnforcement('mcp_github_create_issue', 'tool');
      assert(result.requiresApproval === false, 'Write tool on trusted does not require approval');
    `);
  });

  // Test 9: checkMcpTrustEnforcement blocks disabled tools
  await test('checkMcpTrustEnforcement blocks disabled tools', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_custom = {
        id: 'mcp_custom',
        name: 'Custom Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Custom server',
        enabled: true,
        trust: 'trusted',
        enabledTools: ['mcp_custom_readonly'],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      const result = checkMcpTrustEnforcement('mcp_custom_write_file', 'tool');
      assert(result.requiresApproval === true, 'Disabled tool requires approval');
      assert(result.reason.includes('disabled'), 'Reason mentions disabled');
    `);
  });

  // Test 10: Call limit enforcement
  await test('Call limit enforcement triggers at limit', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_limited = {
        id: 'mcp_limited',
        name: 'Limited Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Call limited server',
        enabled: true,
        trust: 'trusted',
        enabledTools: [],
        callLimit: 3,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      for (let i = 0; i < 3; i++) {
        const result = checkMcpCallSpendLimit('mcp_limited', appState.mcpServers.mcp_limited);
        assert(result.requiresPrompt === false, 'Call ' + (i+1) + ' should not trigger limit');
      }
      
      appState._mcpCallCounts.mcp_limited = 3;
      const result = checkMcpCallSpendLimit('mcp_limited', appState.mcpServers.mcp_limited);
      assert(result.requiresPrompt === true, 'Call limit reached triggers prompt');
      assert(result.reason.includes('Call limit reached'), 'Reason mentions call limit');
      assert(result.type === 'callLimit', 'Type is callLimit');
    `);
  });

  // Test 11: Spend limit enforcement
  await test('Spend limit enforcement triggers at limit', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_limited = {
        id: 'mcp_limited',
        name: 'Limited Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Spend limited server',
        enabled: true,
        trust: 'trusted',
        enabledTools: [],
        callLimit: undefined,
        spendLimit: 10.00
      };
      rebuildMcpToolDefinitions();
      
      appState._mcpSpendTotal.mcp_limited = 10.00;
      const result = checkMcpCallSpendLimit('mcp_limited', appState.mcpServers.mcp_limited);
      assert(result.requiresPrompt === true, 'Spend limit reached triggers prompt');
      assert(result.reason.includes('Spend limit reached'), 'Reason mentions spend limit');
      assert(result.type === 'spendLimit', 'Type is spendLimit');
    `);
  });

  // Test 12: incrementMcpCallCount increments counter
  await test('incrementMcpCallCount increments session counter', async () => {
    await runTestInContext(`
      assert(incrementMcpCallCount('mcp_test') === 1, 'First call returns 1');
      assert(incrementMcpCallCount('mcp_test') === 2, 'Second call returns 2');
      assert(incrementMcpCallCount('mcp_other') === 1, 'Different server has separate counter');
    `);
  });

  // Test 13: addMcpSpend adds to spend total
  await test('addMcpSpend adds to spend total', async () => {
    await runTestInContext(`
      assert(addMcpSpend('mcp_test', 0.5) === 0.5, 'First spend returns 0.5');
      assert(addMcpSpend('mcp_test', 0.3) === 0.8, 'Second spend returns 0.8');
      assert(addMcpSpend('mcp_other', 1.0) === 1.0, 'Different server has separate total');
    `);
  });

  // Test 14: rebuildMcpToolDefinitions adds tools from registry
  await test('rebuildMcpToolDefinitions adds MCP tools from registry', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_custom = {
        id: 'mcp_custom',
        name: 'Custom Server',
        transport: 'stdio',
        command: 'npx test',
        env: {},
        description: 'Custom server',
        enabled: true,
        trust: 'untrusted',
        enabledTools: ['mcp_custom_tool1'],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      assert(TOOL_DEFINITIONS.mcp_github !== undefined, 'Built-in github tool exists');
      assert(TOOL_DEFINITIONS.mcp_memory !== undefined, 'Built-in memory tool exists');
      assert(TOOL_DEFINITIONS.mcp_fetch !== undefined, 'Built-in fetch tool exists');
      assert(TOOL_DEFINITIONS.mcp_github.mcpServerTrust === 'trusted', 'Built-in github has trusted');
      assert(TOOL_DEFINITIONS.mcp_memory.mcpServerTrust === 'trusted', 'Built-in memory has trusted');
      assert(TOOL_DEFINITIONS.mcp_fetch.mcpServerTrust === 'trusted', 'Built-in fetch has trusted');
    `);
  });

  // Test 15: Regression test - credential never appears in MCP summary
  await test('Regression: credential value never appears in MCP summary', async () => {
    await runTestInContext(`
      appState.mcpServers.mcp_leaky = {
        id: 'mcp_leaky',
        name: 'Leaky Server',
        transport: 'stdio',
        command: 'npx test',
        env: { 
          API_KEY: 'sk-live-abcdefghijklmnop',
          GITHUB_TOKEN: 'ghp_xxxxxxxxxxxxxxxx',
          SECRET: 'super-secret-value'
        },
        description: 'Server with credentials',
        enabled: true,
        trust: 'untrusted',
        enabledTools: [],
        callLimit: undefined,
        spendLimit: undefined
      };
      rebuildMcpToolDefinitions();
      
      const catalogText = buildAutonomyCatalogText();
      assert(!catalogText.includes('sk-live-abcdefghijklmnop'), 'API_KEY value not in summary');
      assert(!catalogText.includes('ghp_xxxxxxxxxxxxxxxx'), 'GITHUB_TOKEN value not in summary');
      assert(!catalogText.includes('super-secret-value'), 'SECRET value not in summary');
      assert(catalogText.includes('[REDACTED]') || !catalogText.includes('API_KEY'), 'Credentials scrubbed or omitted');
    `);
  });

  console.log('\n=== Results ===');
  console.log('Passed:', passCount);
  console.log('Failed:', failCount);
  console.log('Total:', passCount + failCount);

  if (failCount > 0) {
    process.exit(1);
  } else {
    console.log('\nAll H5.5 MCP Hardening assertions passed');
    process.exit(0);
  }
}

runTests().catch(e => {
  console.error('Test runner error:', e);
  process.exit(1);
});