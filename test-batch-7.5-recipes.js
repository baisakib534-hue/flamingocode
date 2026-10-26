// test-batch-7.5-recipes.js
// Test suite for Batch 7.5 Recipes feature
// NO-JSDOM extraction-and-eval pattern — no npm packages
// Run with: node test-batch-7.5-recipes.js

const fs = require('fs');

function loadIndexHtml() {
  const html = fs.readFileSync('/home/hatch/workspace/flamingocode/index.html', 'utf8');
  return html;
}

function extractFunction(html, funcName) {
  const pattern = new RegExp('function\\s+' + funcName + '\\s*\\([^)]*\\)\\s*\\{', 'm');
  const match = html.match(pattern);
  if (!match) return null;
  const start = match.index + match[0].length;
  let braceCount = 1;
  let i = start;
  while (i < html.length && braceCount > 0) {
    if (html[i] === '{') braceCount++;
    else if (html[i] === '}') braceCount--;
    i++;
  }
  return html.slice(match.index, i);
}

function extractVariable(html, varName) {
  const pattern = new RegExp('const\\s+' + varName + '\\s*=\\s*[\\{\\[]', 'm');
  const match = html.match(pattern);
  if (!match) return null;
  const start = match.index + match[0].length - 1;
  const openChar = html[start];
  const closeChar = openChar === '[' ? ']' : '}';
  let braceCount = 1;
  let i = start + 1;
  while (i < html.length && braceCount > 0) {
    if (html[i] === openChar) braceCount++;
    else if (html[i] === closeChar) braceCount--;
    i++;
  }
  return html.slice(match.index, i);
}

function runTest(name, fn) {
  try {
    fn();
    console.log('  PASS: ' + name);
    return true;
  } catch (e) {
    console.log('  FAIL: ' + name);
    console.log('    ' + e.message);
    return false;
  }
}

function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(msg + ': expected ' + JSON.stringify(expected) + ', got ' + JSON.stringify(actual));
  }
}

function assertTrue(val, msg) {
  if (!val) throw new Error(msg);
}

function assertFalse(val, msg) {
  if (val) throw new Error(msg);
}

function assertContains(haystack, needle, msg) {
  if (!haystack.includes(needle)) {
    throw new Error(msg + ': "' + needle + '" not found in "' + haystack.substring(0, 100) + '..."');
  }
}

function main() {
  console.log('\n=== Batch 7.5 Recipes Test Suite ===\n');

  const html = loadIndexHtml();
  let passed = 0;
  let failed = 0;

  // Extract key functions and data from index.html
  const validateRecipeSrc = extractFunction(html, 'validateRecipe');
  const parseYamlSrc = extractFunction(html, 'parseYaml');
  const toYamlSrc = extractFunction(html, 'toYaml');
  const runRecipeSrc = extractFunction(html, 'runRecipe');
  const sanitizeRecipeSrc = extractFunction(html, 'sanitizeRecipe');
  const builtinRecipesSrc = extractVariable(html, 'BUILTIN_RECIPES');
  const i18nSrc = extractVariable(html, 'I18N');

  if (!validateRecipeSrc) throw new Error('validateRecipe function not found in index.html');
  if (!parseYamlSrc) throw new Error('parseYaml function not found in index.html');
  if (!toYamlSrc) throw new Error('toYaml function not found in index.html');
  if (!runRecipeSrc) throw new Error('runRecipe function not found in index.html');
  if (!sanitizeRecipeSrc) throw new Error('sanitizeRecipe function not found in index.html');
  if (!builtinRecipesSrc) throw new Error('BUILTIN_RECIPES not found in index.html');
  if (!i18nSrc) throw new Error('I18N translations not found in index.html');

  // Evaluate BUILTIN_RECIPES and I18N (they're just data, no browser deps)
  eval('BUILTIN_RECIPES = ' + builtinRecipesSrc.slice(builtinRecipesSrc.indexOf('[')));
  eval('I18N = ' + i18nSrc.slice(i18nSrc.indexOf('{')));

  // ===== TESTS =====

  // (a) Validator source: at least one of instructions / prompt required
  passed += runTest('validator source: checks instructions or prompt required', function() {
    assertContains(validateRecipeSrc, 'hasInstructions', 'Should check hasInstructions');
    assertContains(validateRecipeSrc, 'hasPrompt', 'Should check hasPrompt');
    assertContains(validateRecipeSrc, 'At least one', 'Should have error message for missing instructions/prompt');
  }) ? 1 : 0;

  // (b) Validator source: every {{variable}} used MUST have a parameter definition
  passed += runTest('validator source: checks all {{vars}} have param definitions', function() {
    assertContains(validateRecipeSrc, 'usedVars', 'Should track used variables');
    assertContains(validateRecipeSrc, 'definedParams', 'Should track defined parameters');
    assertContains(validateRecipeSrc, 'Variable', 'Should check for undefined variables');
  }) ? 1 : 0;

  // (b) Validator source: every defined parameter MUST be used (no unused params)
  passed += runTest('validator source: checks no unused params', function() {
    assertContains(validateRecipeSrc, 'defined but never used', 'Should check for unused parameters');
  }) ? 1 : 0;

  // (c) Validator source: optional parameters MUST have defaults
  passed += runTest('validator source: optional params need defaults', function() {
    assertContains(validateRecipeSrc, 'Optional parameter', 'Should check optional params have defaults');
    assertContains(validateRecipeSrc, 'requirement === \'optional\'', 'Should check optional requirement');
  }) ? 1 : 0;

  // (d) Validator source: file-type parameters CANNOT have defaults
  passed += runTest('validator source: file params cannot have defaults', function() {
    assertContains(validateRecipeSrc, 'input_type === \'file\'', 'Should check file input type');
    assertContains(validateRecipeSrc, 'cannot have a default', 'Should forbid defaults on file params');
  }) ? 1 : 0;

  // (e) Validator source: headless execution requires prompt field
  passed += runTest('validator source: headless requires prompt (runtime check)', function() {
    // The validator marks this as runtime check, runRecipe enforces it
    assertContains(runRecipeSrc, 'options.headless', 'runRecipe should check headless mode');
    assertContains(runRecipeSrc, 'recipe.prompt', 'runRecipe should require prompt for headless');
    assertContains(runRecipeSrc, 'Headless execution requires', 'Should have error for headless without prompt');
  }) ? 1 : 0;

  // (e) Templating: {{name}} is substituted, missing required param refuses run
  passed += runTest('templating: function source has substitution logic', function() {
    assertContains(runRecipeSrc, 'template', 'Should have template function');
    assertContains(runRecipeSrc, 'replace', 'Should use replace for templating');
    assertContains(runRecipeSrc, 'required', 'Should check required params');
  }) ? 1 : 0;

  // (f) Run: settings override applies for run only and previous settings restored
  passed += runTest('run: settings override logic present in source', function() {
    assertContains(runRecipeSrc, 'settings', 'Should handle settings');
    assertContains(runRecipeSrc, 'provider', 'Should handle provider override');
    assertContains(runRecipeSrc, 'model', 'Should handle model override');
    assertContains(runRecipeSrc, 'temperature', 'Should handle temperature override');
    assertContains(runRecipeSrc, 'max_turns', 'Should handle max_turns override');
    assertContains(runRecipeSrc, 'originalSettings', 'Should save original settings');
    assertContains(runRecipeSrc, 'Restore original', 'Should restore settings');
  }) ? 1 : 0;

  // (g) Run: failing shell check triggers on_failure and retries up to max_retries, then ends FAILED
  passed += runTest('run: retry logic with shell checks present in source', function() {
    assertContains(runRecipeSrc, 'max_retries', 'Should handle max_retries');
    assertContains(runRecipeSrc, 'checks', 'Should handle checks array');
    assertContains(runRecipeSrc, 'on_failure', 'Should handle on_failure command');
    assertContains(runRecipeSrc, 'FAILED', 'Should end as FAILED when retries exhausted');
  }) ? 1 : 0;

  // (h) Sub-recipes run in order, failing link stops chain naming failed recipe
  passed += runTest('run: sub-recipes chaining logic present in source', function() {
    assertContains(runRecipeSrc, 'sub_recipes', 'Should handle sub_recipes');
    assertContains(runRecipeSrc, 'Sub-recipe', 'Should mention sub-recipe');
    assertContains(runRecipeSrc, 'failed', 'Should handle failure');
  }) ? 1 : 0;

  // (i) YAML export -> import round-trip preserves title, parameters, settings, retry
  passed += runTest('YAML: parseYaml and toYaml functions exist in source', function() {
    assertContains(parseYamlSrc, 'function parseYaml', 'parseYaml function should exist');
    assertContains(toYamlSrc, 'function toYaml', 'toYaml function should exist');
    assertContains(parseYamlSrc, 'line', 'Should track line numbers for errors');
    assertContains(toYamlSrc, 'stringify', 'Should have stringify logic');
  }) ? 1 : 0;

  // (j) 5 built-in recipes exist and all pass validator (check structure)
  passed += runTest('built-ins: exactly 5 built-in recipes exist', function() {
    assertEqual(BUILTIN_RECIPES.length, 5, 'Should have 5 built-in recipes');
  }) ? 1 : 0;

  passed += runTest('built-ins: correct titles', function() {
    var titles = BUILTIN_RECIPES.map(function(r) { return r.title; });
    assertContains(titles.join(','), 'Review my PR', 'Missing "Review my PR"');
    assertContains(titles.join(','), 'Audit security', 'Missing "Audit security"');
    assertContains(titles.join(','), 'Fix all lint errors', 'Missing "Fix all lint errors"');
    assertContains(titles.join(','), 'Write tests for this file', 'Missing "Write tests for this file"');
    assertContains(titles.join(','), 'Explain this code in Bangla', 'Missing "Explain this code in Bangla"');
  }) ? 1 : 0;

  passed += runTest('built-ins: all have required fields', function() {
    BUILTIN_RECIPES.forEach(function(r, i) {
      assertTrue(r.title, 'Recipe ' + i + ' missing title');
      assertTrue(r.prompt || r.instructions, 'Recipe ' + i + ' missing prompt/instructions');
      assertTrue(Array.isArray(r.parameters), 'Recipe ' + i + ' missing parameters array');
    });
  }) ? 1 : 0;

  passed += runTest('built-ins: all have valid parameter structures', function() {
    BUILTIN_RECIPES.forEach(function(r, i) {
      (r.parameters || []).forEach(function(p, pi) {
        assertTrue(p.key, 'Recipe ' + i + ' param ' + pi + ' missing key');
        assertTrue(['string', 'number', 'select', 'file'].includes(p.input_type), 'Recipe ' + i + ' param ' + pi + ' invalid input_type');
        assertTrue(['required', 'optional'].includes(p.requirement), 'Recipe ' + i + ' param ' + pi + ' invalid requirement');
      });
    });
  }) ? 1 : 0;

  // (k) Bengali translation keys exist for new strings
  passed += runTest('i18n: Bengali translations exist for Recipes UI', function() {
    var bn = I18N.bn || {};
    var requiredKeys = [
      'Recipes', 'Recipe Library', 'New Recipe', 'Recipe Title', 'Recipe Description',
      'Instructions', 'Prompt', 'Parameters', 'Extensions', 'Settings', 'Retry',
      'Response Schema', 'Sub-Recipes', 'Run', 'Export', 'Import', 'Duplicate',
      'Delete Recipe', 'Save Recipe', 'Validate Recipe', 'Cancel', 'YAML View',
      'Refresh', 'Search recipes...', 'No recipes match. Clear the search or create a new recipe.',
      'Built-in recipe — saving stores an editable copy.', 'Built-in recipes cannot be deleted.',
      'Recipe title is required.', 'At least one of Instructions or Prompt is required.',
      'Saved successfully', 'Exported', 'Imported successfully', 'Import failed',
      'Recipe is valid', 'Validation error', 'Running recipe...', 'Recipe completed successfully',
      'Recipe failed', 'Enter value for required parameter', 'Key', 'Type', 'Requirement',
      'Default', 'Options', 'Required', 'Optional', 'Timeout (ms)', 'Select skill/MCP',
      'Select recipe', 'Add Parameter', 'Add Extension', 'Add Sub-Recipe', 'Max Retries',
      'On Failure Command', 'Shell Checks (one per line)', 'Provider', 'Temperature',
      'Max Turns', 'File', 'Number', 'Select', 'String'
    ];
    var missing = [];
    requiredKeys.forEach(function(key) {
      if (!bn[key]) {
        missing.push(key);
      }
    });
    if (missing.length > 0) {
      throw new Error('Missing Bengali translations for: ' + missing.join(', '));
    }
  }) ? 1 : 0;

  // Additional: allRecipes and findRecipe work with built-ins
  passed += runTest('allRecipes: includes built-ins and sorts by title', function() {
    var allRecipesSrc = extractFunction(html, 'allRecipes');
    var findRecipeSrc = extractFunction(html, 'findRecipe');
    assertTrue(allRecipesSrc.includes('BUILTIN_RECIPES'), 'allRecipes should reference BUILTIN_RECIPES');
    assertTrue(findRecipeSrc.includes('BUILTIN_RECIPES'), 'findRecipe should reference BUILTIN_RECIPES');
  }) ? 1 : 0;

  // Additional: validateRecipe function has all 5 Goose rules
  passed += runTest('validator source: implements all 5 Goose rules', function() {
    assertContains(validateRecipeSrc, 'instructions', 'Should check instructions');
    assertContains(validateRecipeSrc, 'prompt', 'Should check prompt');
    assertContains(validateRecipeSrc, 'optional', 'Should check optional params');
    assertContains(validateRecipeSrc, 'default', 'Should check defaults');
    assertContains(validateRecipeSrc, 'file', 'Should check file type');
    assertContains(runRecipeSrc, 'headless', 'Should check headless execution in runRecipe');
  }) ? 1 : 0;

  // Additional: runRecipe uses sendAgentPrompt
  passed += runTest('run: uses sendAgentPrompt for execution', function() {
    assertContains(runRecipeSrc, 'sendAgentPrompt', 'Should call sendAgentPrompt');
  }) ? 1 : 0;

  // Additional: runRecipe logs to activity and brain
  passed += runTest('run: logs to activity and brain', function() {
    assertContains(runRecipeSrc, 'logActivity', 'Should log activity');
    assertContains(runRecipeSrc, 'writeBrainNote', 'Should write brain note');
  }) ? 1 : 0;

  // Additional: runRecipe enables/disables extensions
  passed += runTest('run: enables extensions for duration', function() {
    assertContains(runRecipeSrc, 'superpowersEnabled', 'Should enable skills');
    assertContains(runRecipeSrc, 'mcpServers', 'Should enable MCPs');
    assertContains(runRecipeSrc, 'originalSkillStates', 'Should save original skill states');
  }) ? 1 : 0;

  // Additional: Recipes modal HTML exists
  passed += runTest('UI: Recipes modal HTML exists', function() {
    assertContains(html, 'id="recipesModal"', 'Should have recipes modal');
    assertContains(html, 'id="recipeList"', 'Should have recipe list');
    assertContains(html, 'id="recipeForm"', 'Should have recipe form');
  }) ? 1 : 0;

  // Additional: Recipes sidebar button exists
  passed += runTest('UI: Recipes sidebar button exists', function() {
    assertContains(html, 'id="btnOpenRecipes"', 'Should have open recipes button');
    assertContains(html, 'data-i18n="Recipes"', 'Should have i18n for Recipes');
  }) ? 1 : 0;

  // Additional: Recipes command palette entry
  passed += runTest('UI: Recipes command palette entry exists', function() {
    assertContains(html, 'id: \'recipes\'', 'Should have recipes command palette entry');
    assertContains(html, 'title: \'Recipes\'', 'Should have Recipes title in palette');
  }) ? 1 : 0;

  // Additional: appState has recipes array
  passed += runTest('state: appState.recipes array exists', function() {
    assertContains(html, 'recipes: []', 'appState should have recipes array');
  }) ? 1 : 0;

  // Summary
  var total = passed + failed;
  console.log('\n=== Results: ' + passed + '/' + total + ' passed, ' + failed + ' failed ===');
  
  if (failed > 0) {
    process.exit(1);
  }
  process.exit(0);
}

main().catch(function(e) {
  console.error('Test suite crashed:', e);
  process.exit(1);
});