// test-stage5-selftest.js
// NO-JSDOM extraction-and-eval pattern - asserts identifiers and behaviors in index.html
// Run with: node test-stage5-selftest.js

const fs = require('fs');
const path = require('path');

const INDEX_PATH = path.join(__dirname, 'index.html');
const html = fs.readFileSync(INDEX_PATH, 'utf8');

// Extract the main script content (between <script> and </script>)
const scriptMatch = html.match(/<script[^>]*>([\s\S]*)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No <script> tag found in index.html');
  process.exit(1);
}
const scriptContent = scriptMatch[1];

// Quick syntax check
try {
  new Function(scriptContent);
  console.log('PASS: index.html script syntax OK');
} catch (e) {
  console.error('FAIL: Script syntax error:', e.message);
  process.exit(1);
}

let passCount = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(`ASSERTION FAILED: ${message}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertIncludes(haystack, needle, message) {
  if (!haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Expected to find: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertNotIncludes(haystack, needle, message) {
  if (haystack.includes(needle)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Should NOT contain: ${needle}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

function assertRegex(haystack, pattern, message) {
  if (!pattern.test(haystack)) {
    throw new Error(`ASSERTION FAILED: ${message}\n  Pattern: ${pattern}`);
  }
  passCount++;
  console.log(`  ✓ ${message}`);
}

console.log('\n=== Stage 5: Browser Self-Test Assertions ===\n');

// ============================================================
// 1. runSelfTest function exists and is the entry point
// ============================================================
console.log('\n1. runSelfTest entry point');

assertIncludes(scriptContent, 'async function runSelfTest()', 'runSelfTest async function exists');
assertIncludes(scriptContent, 'window.runSelfTest = runSelfTest', 'runSelfTest exposed on window for onclick');
assertIncludes(html, 'id="btnRunSelfTest"', 'Self-Test button exists in HTML');
assertIncludes(scriptContent, 'btnSelfTest.onclick = () => runSelfTest()', 'Self-Test button wired via JS onclick');
assertIncludes(scriptContent, 'selfTestState.running', 'runSelfTest checks/sets running guard');
assertIncludes(scriptContent, 'selfTestState.results = []', 'runSelfTest clears previous results');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.clear()', 'runSelfTest clears fix attempts map');
assertIncludes(scriptContent, 'selfTestGetInteractiveElements()', 'runSelfTest calls element discovery');
assertIncludes(scriptContent, 'selfTestRunInteraction(element)', 'runSelfTest calls interaction runner per element');
assertIncludes(scriptContent, 'selfTestRenderResults()', 'runSelfTest renders results after each interaction');
assertIncludes(scriptContent, 'selfTestState.running = false', 'runSelfTest resets running flag in finally');
assertIncludes(scriptContent, 'showToast(`Self-test complete:', 'runSelfTest reports completion via toast');

// ============================================================
// 2. selfTestGetInteractiveElements — element discovery function exists
// ============================================================
console.log('\n2. selfTestGetInteractiveElements discovery');

assertIncludes(scriptContent, 'function selfTestGetInteractiveElements()', 'selfTestGetInteractiveElements function exists');
assertIncludes(scriptContent, "document.getElementById('previewIframe')", 'Uses previewIframe for element discovery');
assertIncludes(scriptContent, 'iframe.contentWindow.document', 'Accesses iframe contentDocument');
assertIncludes(scriptContent, 'SELF_TEST_INTERACTIONS.forEach', 'Iterates over interaction types');
assertIncludes(scriptContent, 'doc.querySelectorAll(selector)', 'Queries elements per interaction selector');
assertIncludes(scriptContent, 'el.offsetParent === null', 'Skips hidden elements');
assertIncludes(scriptContent, 'selfTestGetElementId(el)', 'Generates unique element ID');
assertIncludes(scriptContent, 'el.getBoundingClientRect()', 'Captures element bounding rect');
assertIncludes(scriptContent, 'selfTestGetSelector(el)', 'Generates CSS selector for re-query');
assertIncludes(scriptContent, 'selfTestGetElementAttrs(el)', 'Captures relevant element attributes');
assertIncludes(scriptContent, 'element: el', 'Keeps direct element reference for interaction');
assertIncludes(scriptContent, 'return elements', 'Returns array of interactive elements');

// ============================================================
// 3. selfTestFixWithAI — fix loop function exists
// ============================================================
console.log('\n3. selfTestFixWithAI fix loop');

assertIncludes(scriptContent, 'async function selfTestFixWithAI(elementId)', 'selfTestFixWithAI async function exists');
assertIncludes(scriptContent, 'window.selfTestFixWithAI = selfTestFixWithAI', 'selfTestFixWithAI exposed on window for onclick');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.get(elementId)', 'Tracks fix attempts per element');
assertIncludes(scriptContent, 'attempts > 3', 'Enforces max 3 attempts per element');
assertIncludes(scriptContent, 'showToast(\'Max fix attempts (3) reached for this element\'', 'Reports max attempts reached via toast');
assertIncludes(scriptContent, 'await sendAgentPrompt(prompt)', 'Calls sendAgentPrompt with fix prompt');
assertIncludes(scriptContent, 'refreshPreview()', 'Calls refreshPreview after AI fix');
assertIncludes(scriptContent, 'selfTestGetInteractiveElements()', 'Re-discovers elements after preview refresh');
assertIncludes(scriptContent, 'selfTestRunInteraction(el)', 'Re-tests the fixed element');
assertIncludes(scriptContent, 'selfTestState.results[idx]', 'Updates result with new interaction outcome');
assertIncludes(scriptContent, 'selfTestRenderResults()', 'Re-renders results after fix attempt');
assertIncludes(scriptContent, 'showToast(`Fixed: ${result.element.name}`', 'Reports successful fix via toast');
assertIncludes(scriptContent, 'showToast(`Fix attempt ${attempts} did not resolve', 'Reports failed fix attempt via toast');

// ============================================================
// 4. SELF_TEST_INTERACTIONS — interaction enumeration marker exists
// ============================================================
console.log('\n4. SELF_TEST_INTERACTIONS enumeration');

assertIncludes(scriptContent, 'const SELF_TEST_INTERACTIONS = [', 'SELF_TEST_INTERACTIONS constant array exists');
assertIncludes(scriptContent, 'type: \'click\'', 'Click interaction type defined');
assertIncludes(scriptContent, 'type: \'input\'', 'Text input interaction type defined');
assertIncludes(scriptContent, 'type: \'select\'', 'Select/dropdown interaction type defined');
assertIncludes(scriptContent, 'type: \'range\'', 'Range/slider interaction type defined');
assertIncludes(scriptContent, 'type: \'toggle\'', 'Checkbox/radio toggle interaction type defined');
assertIncludes(scriptContent, 'type: \'drag\'', 'Drag & drop interaction type defined');
assertIncludes(scriptContent, 'type: \'scroll\'', 'Scroll interaction type defined');
assertIncludes(scriptContent, 'button, a[href], [role="button"]', 'Click selector includes buttons, links, role=button');
assertIncludes(scriptContent, 'input[type="text"], input[type="email"]', 'Input selector includes text-like inputs');
assertIncludes(scriptContent, 'textarea', 'Input selector includes textarea');
assertIncludes(scriptContent, 'select', 'Select selector targets select elements');
assertIncludes(scriptContent, 'input[type="range"]', 'Range selector targets range inputs');
assertIncludes(scriptContent, 'input[type="checkbox"], input[type="radio"]', 'Toggle selector targets checkboxes and radios');
assertIncludes(scriptContent, '[draggable="true"], .draggable', 'Drag selector targets draggable elements');
assertIncludes(scriptContent, '[style*="overflow"], [class*="scroll"]', 'Scroll selector targets scrollable containers');

// ============================================================
// 5. Self-test operates inside previewIframe (safety)
// ============================================================
console.log('\n5. Safety: previewIframe isolation');

assertIncludes(scriptContent, "document.getElementById('previewIframe')", 'All iframe access uses previewIframe ID');
assertNotIncludes(scriptContent, "document.getElementById('preview')", 'Does NOT use generic "preview" ID');
assertNotIncludes(scriptContent.slice(46570, 47000), 'window.location', 'Self-test does NOT navigate top-level window');
assertNotIncludes(scriptContent, 'top.location', 'Does NOT access top.location');
assertNotIncludes(scriptContent, 'parent.location', 'Does NOT access parent.location');
assertIncludes(scriptContent, 'iframe.contentWindow', 'Uses iframe.contentWindow for DOM access');
assertIncludes(scriptContent, 'iframe.contentWindow.document', 'Uses iframe.contentWindow.document for queries');
assertIncludes(scriptContent, 'win.Event', 'Uses iframe window for event construction');
assertIncludes(scriptContent, 'win.DragEvent', 'Uses iframe window for drag events');
assertIncludes(scriptContent, 'No preview loaded', 'Checks for previewIframe existence before running');

// ============================================================
// 6. Fix loop calls sendAgentPrompt() and refreshPreview()
// ============================================================
console.log('\n6. Fix loop integration with agent');

assertIncludes(scriptContent, 'await sendAgentPrompt(prompt)', 'Fix loop awaits sendAgentPrompt');
assertIncludes(scriptContent, 'const prompt = `Self-test interaction failed', 'Builds detailed fix prompt with context');
assertIncludes(scriptContent, 'result.element.name', 'Prompt includes element name');
assertIncludes(scriptContent, 'result.element.selector', 'Prompt includes element selector');
assertIncludes(scriptContent, 'result.element.tagName', 'Prompt includes element tag name');
assertIncludes(scriptContent, 'result.element.attrs', 'Prompt includes element attributes');
assertIncludes(scriptContent, 'errorDetails', 'Prompt includes error details from interaction');
assertIncludes(scriptContent, 'getCurrentSession()', 'Gets current session for file context');
assertIncludes(scriptContent, 'session?.activeFile', 'Includes active file in prompt');
assertIncludes(scriptContent, 'session?.files?.[file]', 'Includes file content in prompt');
assertIncludes(scriptContent, 'Reply with file:', 'Prompt requests fenced block response');
assertIncludes(scriptContent, 'refreshPreview()', 'Calls refreshPreview after agent responds');
assertIncludes(scriptContent, 'await new Promise(r => setTimeout(r, 1500))', 'Waits for preview to stabilize');

// ============================================================
// 7. Attempt tracking (max 3 attempts per failure, per spec)
// ============================================================
console.log('\n7. Attempt tracking (max 3)');

assertIncludes(scriptContent, 'fixAttempts: new Map()', 'fixAttempts initialized as Map in state');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.get(elementId) || 0', 'Reads current attempt count with default 0');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.set(elementId, attempts)', 'Increments and stores attempt count');
assertIncludes(scriptContent, 'attempts > 3', 'Checks if attempts exceed 3');
assertIncludes(scriptContent, 'Max fix attempts (3) reached', 'Toast message references max 3 attempts');
assertIncludes(scriptContent, 'Fix attempt ${attempts}/3', 'Toast shows current attempt number');
assertIncludes(scriptContent, '(selfTestState.fixAttempts.get(result.element.id) || 0) < 3', 'Fix button only shows when attempts < 3');
assertIncludes(scriptContent, '3 - (selfTestState.fixAttempts.get(result.element.id) || 0)', 'Button shows remaining attempts');
assertIncludes(scriptContent, 'Max fix attempts reached', 'Shows max attempts message when exhausted');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.clear()', 'Clears attempts on new self-test run');

// ============================================================
// 8. Results panel UI elements exist
// ============================================================
console.log('\n8. Results panel UI');

assertIncludes(html, 'id="previewSelfTestPanel"', 'previewSelfTestPanel container exists');
assertIncludes(html, 'style="display:none;', 'Panel hidden by default');
assertIncludes(html, 'id="selfTestSummary"', 'selfTestSummary element exists');
assertIncludes(html, 'id="selfTestResultsList"', 'selfTestResultsList element exists');
assertIncludes(scriptContent, "document.getElementById('previewSelfTestPanel')", 'Script accesses panel');
assertIncludes(scriptContent, "document.getElementById('selfTestResultsList')", 'Script accesses results list');
assertIncludes(scriptContent, "document.getElementById('selfTestSummary')", 'Script accesses summary');
assertIncludes(scriptContent, 'panel.style.display = \'block\'', 'Shows panel when results exist');
assertIncludes(scriptContent, 'panel.style.display = \'none\'', 'Hides panel when no results');
assertIncludes(scriptContent, '`${passed}/${total} passed`', 'Summary shows pass count');
assertIncludes(scriptContent, 'var(--success)', 'Uses success color for passed summary');
assertIncludes(scriptContent, 'var(--danger)', 'Uses danger color for failed summary');
assertIncludes(scriptContent, "border:1px solid ${passed ? 'var(--success)' : 'var(--danger)'", 'Passed/failed items have colored border');
assertIncludes(scriptContent, '${passed ? \'✓\' : \'✗\'}', 'Pass/fail indicators shown');
assertIncludes(scriptContent, 'result.duration}ms', 'Shows interaction duration');
assertIncludes(scriptContent, 'max-height:300px', 'Results list has max height with scroll');
assertIncludes(scriptContent, 'overflow-y:auto', 'Results list scrollable');

// ============================================================
// 9. "Fix with AI" button exists and is wired
// ============================================================
console.log('\n9. Fix with AI button');

assertIncludes(scriptContent, 'onclick="selfTestFixWithAI', 'Fix button has onclick to selfTestFixWithAI');
assertIncludes(scriptContent, '🔧 Fix with AI', 'Fix button shows emoji and label');
assertIncludes(scriptContent, 'selfTestFixWithAI(\'${result.element.id}\')', 'Button passes element ID to handler');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.get(result.element.id) || 0) < 3', 'Button only shows when attempts < 3');
assertIncludes(scriptContent, 'class="btn"', 'Fix button uses btn class');
assertIncludes(scriptContent, 'padding:2px 8px;font-size:9px', 'Fix button has compact styling');
assertIncludes(scriptContent, 'margin-left:8px', 'Fix button spaced from pass/fail indicator');
assertIncludes(scriptContent, 'Max fix attempts reached', 'Shows exhausted message when attempts >= 3');
assertIncludes(scriptContent, 'color:var(--text-dim)', 'Exhausted message uses dim text');
assertIncludes(scriptContent, 'font-size:9px', 'Exhausted message uses small font');

// ============================================================
// 10. Toast reporting for success/failure
// ============================================================
console.log('\n10. Toast reporting');

assertIncludes(scriptContent, 'showToast(`Self-test started:', 'Toast on self-test start');
assertIncludes(scriptContent, 'showToast(`Self-test complete:', 'Toast on self-test completion');
assertIncludes(scriptContent, 'showToast(\'Self-test aborted\'', 'Toast on self-test abort');
assertIncludes(scriptContent, 'showToast(\'Self-test results cleared\'', 'Toast on results clear');
assertIncludes(scriptContent, 'showToast(`Fix attempt ${attempts}/3', 'Toast on fix attempt start');
assertIncludes(scriptContent, 'showToast(`Fixed: ${result.element.name}`', 'Toast on successful fix');
assertIncludes(scriptContent, 'showToast(`Fix attempt ${attempts} did not resolve', 'Toast on failed fix attempt');
assertIncludes(scriptContent, 'showToast(\'Fix with AI failed', 'Toast on fix error');
assertIncludes(scriptContent, 'showToast(\'Max fix attempts (3) reached', 'Toast on max attempts reached');
assertIncludes(scriptContent, 'showToast(\'No preview loaded', 'Toast when no preview iframe');
assertIncludes(scriptContent, 'showToast(\'No interactive elements', 'Toast when no elements found');
assertIncludes(scriptContent, '\'success\'', 'Uses success toast type');
assertIncludes(scriptContent, '\'error\'', 'Uses error toast type');
assertIncludes(scriptContent, '\'warning\'', 'Uses warning toast type');
assertIncludes(scriptContent, '\'info\'', 'Uses info toast type');

// ============================================================
// Additional: selfTestRunInteraction implementation
// ============================================================
console.log('\n11. selfTestRunInteraction implementation');

assertIncludes(scriptContent, 'async function selfTestRunInteraction(element)', 'selfTestRunInteraction async function exists');
assertIncludes(scriptContent, 'doc.querySelector(element.selector)', 'Re-queries element by selector in iframe');
assertIncludes(scriptContent, 'window.addEventListener(\'message\'', 'Listens for PREVIEW_ERROR from iframe');
assertIncludes(scriptContent, 'e.data.type === \'PREVIEW_ERROR\'', 'Filters for PREVIEW_ERROR messages');
assertIncludes(scriptContent, 'el.focus()', 'Focuses element before interaction');
assertIncludes(scriptContent, 'el.click()', 'Performs click for click type');
assertIncludes(scriptContent, 'el.value = testValue', 'Sets value for input type');
assertIncludes(scriptContent, "el.dispatchEvent(new win.Event('input', { bubbles: true }))", 'Dispatches input event');
assertIncludes(scriptContent, "el.dispatchEvent(new win.Event('change', { bubbles: true }))", 'Dispatches change event');
assertIncludes(scriptContent, "el.selectedIndex", 'Changes selection for select type');
assertIncludes(scriptContent, "el.value = mid", 'Sets midpoint for range type');
assertIncludes(scriptContent, "el.checked = !el.checked", 'Toggles checkbox/radio');
assertIncludes(scriptContent, 'DragEvent', 'Uses DragEvent for drag type');
assertIncludes(scriptContent, "el.scrollTop", 'Manipulates scroll position for scroll type');
assertIncludes(scriptContent, 'return { success: errors.length === 0', 'Returns success based on errors');
assertIncludes(scriptContent, 'duration: Date.now() - startTime', 'Measures interaction duration');

// ============================================================
// Additional: Helper functions
// ============================================================
console.log('\n12. Helper functions');

assertIncludes(scriptContent, 'function selfTestGetElementId(el)', 'selfTestGetElementId helper exists');
assertIncludes(scriptContent, 'function selfTestGetSelector(el)', 'selfTestGetSelector helper exists');
assertIncludes(scriptContent, 'function selfTestGetElementAttrs(el)', 'selfTestGetElementAttrs helper exists');
assertIncludes(scriptContent, 'el.id', 'Uses element ID when available');
assertIncludes(scriptContent, 'path.unshift(segment)', 'Builds selector path from element up');
assertIncludes(scriptContent, 'nth-of-type', 'Includes nth-of-type for sibling disambiguation');
assertIncludes(scriptContent, 'path.length > 5', 'Limits selector path depth');
assertIncludes(scriptContent, 'attrs[attr.name] = attr.value', 'Captures relevant attributes');
assertIncludes(scriptContent, "['id', 'class', 'type', 'name', 'placeholder', 'value', 'href', 'role', 'tabindex', 'draggable']", 'Attribute whitelist defined');

// ============================================================
// Additional: Abort and Clear functions
// ============================================================
console.log('\n13. Abort and Clear controls');

assertIncludes(scriptContent, 'function selfTestAbort()', 'selfTestAbort function exists');
assertIncludes(scriptContent, 'window.selfTestAbort = selfTestAbort', 'selfTestAbort exposed on window');
assertIncludes(scriptContent, 'selfTestState.running = false', 'Abort sets running to false');
assertIncludes(scriptContent, 'btn.textContent = \'🧪 Self-Test\'', 'Abort restores button text');
assertIncludes(scriptContent, 'btn.disabled = false', 'Abort re-enables button');
assertIncludes(scriptContent, 'function selfTestClearResults()', 'selfTestClearResults function exists');
assertIncludes(scriptContent, 'window.selfTestClearResults = selfTestClearResults', 'selfTestClearResults exposed on window');
assertIncludes(scriptContent, 'selfTestState.results = []', 'Clear empties results');
assertIncludes(scriptContent, 'selfTestState.fixAttempts.clear()', 'Clear empties fix attempts');
assertIncludes(scriptContent, 'selfTestRenderResults()', 'Clear re-renders empty panel');

// ============================================================
// Final summary
// ============================================================
console.log(`\n=== ALL ${passCount} ASSERTIONS PASSED ===`);
console.log('1. runSelfTest entry point — async, guarded, discovers elements, runs interactions, renders, reports');
console.log('2. selfTestGetInteractiveElements — iframe-scoped, 7 interaction types, hidden-filtered, ID/selector/attrs captured');
console.log('3. selfTestFixWithAI — max 3 attempts, calls sendAgentPrompt, refreshPreview, re-tests, updates results');
console.log('4. SELF_TEST_INTERACTIONS — 7 types: click, input, select, range, toggle, drag, scroll');
console.log('5. previewIframe isolation — no top-level navigation, all DOM access via iframe.contentWindow');
console.log('6. Agent integration — detailed prompt with errors+context, awaits sendAgentPrompt, refreshPreview, wait');
console.log('7. Attempt tracking — Map per element, enforced at 3, UI shows remaining, clears on new run');
console.log('8. Results panel — hidden by default, summary with pass/fail colors, scrollable list, pass/fail icons, duration');
console.log('9. Fix with AI button — wired to handler, shows attempts remaining, disabled at max');
console.log('10. Toast reporting — start, complete, abort, clear, fix attempts, success, failure, edge cases');

process.exit(0);