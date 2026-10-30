"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSelfTestHandlers = registerSelfTestHandlers;
const electron_1 = require("electron");
const path = __importStar(require("node:path"));
const selfTestRuns = new Map();
let testBrowserView = null;
let testWebContents = null;
function registerSelfTestHandlers(ipc, mainWindow) {
    ipc.handle('selftest:createView', async (_event, options) => {
        if (testBrowserView) {
            testBrowserView.webContents.close();
        }
        testBrowserView = new electron_1.BrowserView({
            webPreferences: {
                preload: path.join(__dirname, '../../preload/selftest-preload.js'),
                contextIsolation: true,
                nodeIntegration: false,
                sandbox: true,
                webSecurity: false,
            },
        });
        mainWindow?.setBrowserView(testBrowserView);
        testBrowserView.setBounds({ x: 0, y: 0, width: options.width, height: options.height });
        testWebContents = testBrowserView.webContents;
        testWebContents.on('console-message', (_event, level, message, line, sourceId) => {
            const run = Array.from(selfTestRuns.values()).find(r => !r.passed && r.results.length < r.steps.length);
            if (run && (level === 'error' || level === 'warning')) {
                run.consoleErrors.push({
                    message,
                    source: sourceId,
                    line,
                    column: 0,
                    type: level === 'error' ? 'error' : 'warning',
                });
            }
        });
        return 'created';
    });
    ipc.handle('selftest:loadURL', async (_event, url) => {
        if (!testWebContents)
            throw new Error('BrowserView not created');
        await testWebContents.loadURL(url);
        await new Promise((resolve) => {
            testWebContents.once('did-finish-load', () => resolve());
        });
    });
    ipc.handle('selftest:loadHTML', async (_event, html, baseUrl) => {
        if (!testWebContents)
            throw new Error('BrowserView not created');
        await testWebContents.loadURL(`data:text/html,${encodeURIComponent(html)}`);
    });
    ipc.handle('selftest:run', async (_event, runId, steps) => {
        if (!testWebContents)
            throw new Error('BrowserView not created');
        const run = {
            id: runId,
            url: testWebContents.getURL(),
            steps,
            results: [],
            consoleErrors: [],
            passed: true,
            durationMs: 0,
        };
        selfTestRuns.set(runId, run);
        const startTime = Date.now();
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            const stepStart = Date.now();
            try {
                await executeStep(testWebContents, step);
                run.results.push({
                    step: i,
                    type: step.type,
                    passed: true,
                    durationMs: Date.now() - stepStart,
                });
            }
            catch (error) {
                run.results.push({
                    step: i,
                    type: step.type,
                    passed: false,
                    error: error instanceof Error ? error.message : String(error),
                    durationMs: Date.now() - stepStart,
                });
                run.passed = false;
                break;
            }
        }
        run.durationMs = Date.now() - startTime;
        return run;
    });
    ipc.handle('selftest:getRun', async (_event, runId) => {
        return selfTestRuns.get(runId) || null;
    });
    ipc.handle('selftest:captureScreenshot', async () => {
        if (!testWebContents)
            return null;
        const image = await testWebContents.capturePage();
        return image.toDataURL();
    });
    ipc.handle('selftest:destroyView', async () => {
        if (testBrowserView) {
            mainWindow?.setBrowserView(null);
            testBrowserView.webContents.close();
            testBrowserView = null;
            testWebContents = null;
        }
    });
    ipc.handle('selftest:resizeView', async (_event, width, height) => {
        if (testBrowserView) {
            testBrowserView.setBounds({ x: 0, y: 0, width, height });
        }
    });
    ipc.handle('selftest:executeScript', async (_event, script) => {
        if (!testWebContents)
            throw new Error('BrowserView not created');
        return testWebContents.executeJavaScript(script);
    });
}
async function executeStep(webContents, step) {
    const selector = step.selector;
    switch (step.type) {
        case 'click': {
            if (!selector)
                throw new Error('Click requires selector');
            await webContents.executeJavaScript(`
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error('Element not found: ${selector}');
        el.click();
      `);
            break;
        }
        case 'type': {
            if (!selector)
                throw new Error('Type requires selector');
            if (!step.text)
                throw new Error('Type requires text');
            await webContents.executeJavaScript(`
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error('Element not found: ${selector}');
        el.focus();
        el.value = ${JSON.stringify(step.text)};
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
      `);
            break;
        }
        case 'drag': {
            if (!step.from || !step.to)
                throw new Error('Drag requires from and to coordinates');
            await webContents.sendInputEvent({
                type: 'mouseDown',
                x: step.from.x,
                y: step.from.y,
                button: 'left',
                clickCount: 1,
            });
            await webContents.sendInputEvent({
                type: 'mouseMove',
                x: step.to.x,
                y: step.to.y,
                button: 'left',
            });
            await webContents.sendInputEvent({
                type: 'mouseUp',
                x: step.to.x,
                y: step.to.y,
                button: 'left',
            });
            break;
        }
        case 'slide': {
            if (!step.direction)
                throw new Error('Slide requires direction');
            const distance = step.duration || 300;
            await webContents.executeJavaScript(`
        window.scrollBy({
          ${step.direction === 'up' || step.direction === 'down' ? 'top' : 'left'}: ${step.direction === 'up' || step.direction === 'left' ? '-' : ''}${distance},
          behavior: 'smooth'
        });
      `);
            await new Promise(r => setTimeout(r, distance + 100));
            break;
        }
        case 'scroll': {
            await webContents.executeJavaScript(`
        window.scrollTo(0, document.body.scrollHeight);
      `);
            break;
        }
        case 'wait': {
            await new Promise(r => setTimeout(r, step.duration || 1000));
            break;
        }
        case 'assert': {
            if (!selector)
                throw new Error('Assert requires selector');
            const result = await webContents.executeJavaScript(`
        (() => {
          const el = document.querySelector(${JSON.stringify(selector)});
          if (!el) return { pass: false, error: 'Element not found' };
          switch (${JSON.stringify(step.assertType)}) {
            case 'exists':
              return { pass: true };
            case 'textContains':
              return { pass: el.textContent?.includes(${JSON.stringify(step.expectedValue || '')}) || false };
            case 'textEquals':
              return { pass: el.textContent?.trim() === ${JSON.stringify(step.expectedValue || '')} };
            case 'attributeEquals':
              return { pass: el.getAttribute(${JSON.stringify(step.attribute)}) === ${JSON.stringify(step.expectedValue || '')} };
            default:
              return { pass: false, error: 'Unknown assert type' };
          }
        })()
      `);
            if (!result.pass)
                throw new Error(result.error || 'Assertion failed');
            break;
        }
    }
}
//# sourceMappingURL=selftest.js.map