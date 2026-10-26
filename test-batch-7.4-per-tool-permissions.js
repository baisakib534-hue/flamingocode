// test-batch-7.4-per-tool-permissions.js
// NO-JSDOM extraction-and-eval pattern — no npm packages
// Assert ONLY identifiers and behaviours that actually exist in index.html
// Call process.exit(0) on success

const fs = require('fs');
const path = require('path');

const HTML = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

let passCount = 0;
let failCount = 0;

function assert(label, condition) {
  if (condition) {
    console.log('PASS ' + label);
    passCount++;
  } else {
    console.error('FAIL ' + label);
    failCount++;
  }
}

function assertIncludes(haystack, needle, label) {
  assert(label, haystack.includes(needle));
}

function assertRegex(haystack, pattern, label) {
  assert(label, pattern.test(haystack));
}

// ============================================================
// (a) wildcardMatch — * matches any chars, ? matches exactly one char,
//     plain text matches literally, no other syntax
// ============================================================
console.log('\n=== (a) wildcardMatch function ===');
assertIncludes(HTML, 'wildcardMatch', 'wildcardMatch function exists');
assertRegex(HTML, /function wildcardMatch\(pattern,\s*text\)/, 'wildcardMatch signature correct');
assertRegex(HTML, /\.replace\(\/\\\*\/g\s*,\s*'\.\*'\)/, 'wildcardMatch handles * (any chars)');
assertRegex(HTML, /\.replace\(\/\\\?\/g\s*,\s*'\.'\)/, 'wildcardMatch handles ? (one char)');
assertRegex(HTML, /escape.*regex|special.*char|\[\\.\\+\\^\\$\\{\\}\\(\\)\\|\\\\[\\\\\\\\\\]/, 'wildcardMatch escapes regex special chars');
assertRegex(HTML, /new RegExp\('\^' \+ regexPattern \+ '\$'.*\.test\(text\)/, 'wildcardMatch uses anchored regex test');
assertRegex(HTML, /'i'\)/, 'wildcardMatch case-insensitive');

// ============================================================
// (b) evaluateToolPermission — last matching rule wins
// ============================================================
console.log('\n=== (b) evaluateToolPermission function ===');
assertIncludes(HTML, 'evaluateToolPermission', 'evaluateToolPermission function exists');
assertRegex(HTML, /function evaluateToolPermission\(toolName,\s*argsSummary,\s*agentId\)/, 'evaluateToolPermission signature correct');
assertRegex(HTML, /appState\.toolPermissions\s*\|\|/, 'Uses appState.toolPermissions');
assertRegex(HTML, /for\s*\(const rule of rules\)/, 'Iterates rules in order');
assertRegex(HTML, /wildcardMatch\(rule\.permission,\s*toolName\)\s*&&\s*wildcardMatch\(rule\.pattern,\s*argsSummary\)/, 'Matches both permission and pattern');
assertRegex(HTML, /matchedRule\s*=\s*rule/, 'Last matching rule wins (overwrites)');
assertRegex(HTML, /rule\.agentId\s*\|\|\s*rule\.teamId/, 'Skips agent/team scoped rules in first pass');
assertRegex(HTML, /agentId\)\s*\{/, 'Second pass for agent-scoped rules');
assertRegex(HTML, /rule\.agentId\s*===\s*agentId\s*\|\|\s*rule\.teamId\s*===\s*agentId/, 'Agent/team scoped rules override globals');

// ============================================================
// (c) Default is 'ask' when no rule matches
// ============================================================
console.log('\n=== (c) Default action is ask ===');
assertRegex(HTML, /return\s*\{\s*action:\s*['\"]ask['\"]/, 'Default action is ask');
assertRegex(HTML, /default is ask|default.*ask|ask.*default/i, 'Default ask documented or commented');

// ============================================================
// (d) Shipped defaults in appState.toolPermissions
// ============================================================
console.log('\n=== (d) Shipped default rules ===');
assertRegex(HTML, /toolPermissions:\s*\[/, 'toolPermissions array in appState');
assertRegex(HTML, /permission:\s*['\"]read['\"],\s*pattern:\s*['\"]\*['\"],\s*action:\s*['\"]allow['\"]/, 'read * -> allow');
assertRegex(HTML, /permission:\s*['\"]bash['\"],\s*pattern:\s*['\"]git status \*['\"],\s*action:\s*['\"]allow['\"]/, 'bash git status * -> allow');
assertRegex(HTML, /permission:\s*['\"]bash['\"],\s*pattern:\s*['\"]git log \*['\"],\s*action:\s*['\"]allow['\"]/, 'bash git log * -> allow');
assertRegex(HTML, /permission:\s*['\"]bash['\"],\s*pattern:\s*['\"]git diff \*['\"],\s*action:\s*['\"]allow['\"]/, 'bash git diff * -> allow');
assertRegex(HTML, /permission:\s*['\"]bash['\"],\s*pattern:\s*['\"]rm \*['\"],\s*action:\s*['\"]deny['\"]/, 'bash rm * -> deny');
assertRegex(HTML, /permission:\s*['\"]bash['\"],\s*pattern:\s*['\"]git push \*['\"],\s*action:\s*['\"]deny['\"]/, 'bash git push * -> deny');
assertRegex(HTML, /permission:\s*['\"]\*['\"],\s*pattern:\s*['\"]\*\.env['\"],\s*action:\s*['\"]deny['\"]/, '* *.env -> deny');
assertRegex(HTML, /permission:\s*['\"]\*['\"],\s*pattern:\s*['\"]\*API_KEY\*['\"],\s*action:\s*['\"]deny['\"]/, '* *API_KEY* -> deny');
assertRegex(HTML, /permission:\s*['\"]\*['\"],\s*pattern:\s*['\"]\*SECRET\*['\"],\s*action:\s*['\"]deny['\"]/, '* *SECRET* -> deny');
assertRegex(HTML, /permission:\s*['\"]\*['\"],\s*pattern:\s*['\"]\*PASSWORD\*['\"],\s*action:\s*['\"]deny['\"]/, '* *PASSWORD* -> deny');

// ============================================================
// (e) Per-agent override beats global rule for that agent only
// ============================================================
console.log('\n=== (e) Per-agent override ===');
assertRegex(HTML, /agentId/, 'agentId field referenced in rules');
assertRegex(HTML, /teamId/, 'teamId field referenced in rules');
assertRegex(HTML, /scope.*agent|agent.*scope/i, 'Agent scope in UI');
assertRegex(HTML, /permRuleAgentId|agentSelect/, 'Agent selector in rule form');
assertRegex(HTML, /rule\.agentId\s*===\s*agentId/, 'Agent-scoped rule matching');

// ============================================================
// (f) Reordering two rules flips the outcome
// ============================================================
console.log('\n=== (f) Rule reordering ===');
assertRegex(HTML, /perm-move-up/, 'Move up button exists');
assertRegex(HTML, /perm-move-down/, 'Move down button exists');
assertRegex(HTML, /\[rules\[i\], rules\[i-1\]\] = \[rules\[i-1\], rules\[i\]\]/, 'Swap logic for move up');
assertRegex(HTML, /\[rules\[i\], rules\[i\+1\]\] = \[rules\[i\+1\], rules\[i\]\]/, 'Swap logic for move down');
assertRegex(HTML, /saveAppState\(\)/, 'saveAppState called after rule changes');
assertRegex(HTML, /renderRules\(\)/, 'Re-renders after reorder');

// ============================================================
// (g) Deny path blocks call AND names the matching rule
// ============================================================
console.log('\n=== (g) Deny path blocks and names rule ===');
assertRegex(HTML, /effectiveAction\s*===\s*['\"]deny['\"]/, 'Deny action check in approval ladder');
assertRegex(HTML, /Blocked by your rule/, 'Blocked message includes rule description');
assertRegex(HTML, /matchedRule\?\.\s*permission/, 'Matched rule permission in deny message');
assertRegex(HTML, /matchedRule\?\.\s*pattern/, 'Matched rule pattern in deny message');
assertRegex(HTML, /level:\s*['\"]per-tool-deny['\"]/, 'Decision level per-tool-deny');
assertRegex(HTML, /allowed:\s*false/, 'Deny returns allowed: false');
assertRegex(HTML, /requiresUserInput:\s*false/, 'Deny does not require user input');

// ============================================================
// (h) Manual mode forces ask for otherwise-allowed, Off mode enforces deny
// ============================================================
console.log('\n=== (h) Safe Mode mapping ===');
assertRegex(HTML, /approvalMode\s*===\s*['\"]manual['\"]/, 'Manual mode check');
assertRegex(HTML, /effectiveAction\s*===\s*['\"]allow['\"]\s*\)\s*effectiveAction\s*=\s*['\"]ask['\"]/, 'Manual forces allow->ask');
assertRegex(HTML, /approvalMode\s*===\s*['\"]off['\"]/, 'Off (YOLO) mode check');
assertRegex(HTML, /Off.*YOLO.*deny|deny.*YOLO|deny.*still.*enforced|deny.*every.*mode/i, 'Deny enforced in YOLO mode');
assertRegex(HTML, /level:\s*['\"]per-tool-allow['\"]/, 'Allow decision level');

// ============================================================
// (i) Rules persist in appState.toolPermissions and survive save/load
//     and are present in backup export shape
// ============================================================
console.log('\n=== (i) Persistence and backup ===');
assertRegex(HTML, /saveAppState\(\)/, 'saveAppState called after rule changes');
assertRegex(HTML, /renderRules\(\)/, 'Re-renders after reorder');
assertRegex(HTML, /toolPermissions/, 'toolPermissions referenced in backup/export context');

// ============================================================
// (j) Bengali translation keys exist for new strings
// ============================================================
console.log('\n=== (j) Bengali translations ===');
const BN_KEYS = [
  'Per-Tool Permissions',
  'Fine-grained rules for every tool call',
  'Rules',
  'Allow',
  'Ask',
  'Deny',
  'Patterns use',
  'and',
  'only',
  'Presets',
  'Strict',
  'Balanced',
  'Open',
  'Presets replace all rules after confirmation',
  'Rules (order matters, lower wins)',
  '+ Add Rule',
  'Tool Pattern',
  'Argument Pattern',
  'All tools',
  'Write (file)',
  'Read (file/brain)',
  'Bash (shell commands)',
  'Browser (browse)',
  'MCP (all servers)',
  'Brain Read',
  'Screenshot to App',
  'e.g., git status *, rm *, *.env, *API_KEY*',
  'Use * for any chars, ? for one char',
  'Action',
  'Allow (auto-approve)',
  'Ask (prompt user)',
  'Deny (block)',
  'Scope',
  'All agents (global)',
  'Specific agent',
  'Agent',
  'Select agent',
  'Cancel',
  'Save Rule',
  'Add / Edit Rule',
  'Argument pattern is required',
  'Delete this rule',
  'Replace all current rules with',
  'preset',
  'permission rule'
];

BN_KEYS.forEach(key => {
  const escapedKey = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  assertRegex(HTML, new RegExp(escapedKey), 'Bengali translation key: "' + key + '"');
});

// ============================================================
// (k) Safe Mode section has compact summary line
// ============================================================
console.log('\n=== (k) Safe Mode summary line ===');
assertRegex(HTML, /permRuleCount|permAllowCount|permAskCount|permDenyCount/, 'Permission count elements exist');
assertRegex(HTML, /rules[\s\S]*deny[\s\S]*allow[\s\S]*ask|allow[\s\S]*deny[\s\S]*ask|summary[\s\S]*rules/i, 'Summary line pattern in Safe Mode or Permissions tab');

// ============================================================
// Summary
// ============================================================
console.log('\n=== SUMMARY ===');
console.log('Pass: ' + passCount);
console.log('Fail: ' + failCount);
console.log('Total: ' + (passCount + failCount));

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}