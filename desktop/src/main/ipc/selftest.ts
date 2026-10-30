import { ipcMain, IpcMainInvokeEvent, BrowserView, BrowserWindow, WebContents } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';

interface SelfTestStep {
  type: 'click' | 'type' | 'drag' | 'slide' | 'scroll' | 'wait' | 'assert';
  selector?: string;
  text?: string;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  assertType?: 'exists' | 'textContains' | 'textEquals' | 'attributeEquals';
  expectedValue?: string;
  attribute?: string;
}

interface SelfTestResult {
  step: number;
  type: string;
  passed: boolean;
  error?: string;
  durationMs: number;
  screenshot?: string;
}

interface SelfTestRun {
  id: string;
  url: string;
  steps: SelfTestStep[];
  results: SelfTestResult[];
  consoleErrors: ConsoleError[];
  passed: boolean;
  durationMs: number;
}

interface ConsoleError {
  message: string;
  source: string;
  line: number;
  column: number;
  type: 'error' | 'warning' | 'info';
}

const selfTestRuns = new Map<string, SelfTestRun>();
let testBrowserView: BrowserView | null = null;
let testWebContents: WebContents | null = null;

export function registerSelfTestHandlers(ipc: typeof ipcMain, mainWindow: BrowserWindow | null): void {
  ipc.handle('selftest:createView', async (_event: IpcMainInvokeEvent, options: { width: number; height: number }): Promise<string> => {
    if (testBrowserView) {
      testBrowserView.webContents.close();
    }

    testBrowserView = new BrowserView({
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

    (testWebContents as any).on('console-message', (_event: any, level: string, message: string, line: number, sourceId: string) => {
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

  ipc.handle('selftest:loadURL', async (_event: IpcMainInvokeEvent, url: string): Promise<void> => {
    if (!testWebContents) throw new Error('BrowserView not created');
    await testWebContents.loadURL(url);
    await new Promise<void>((resolve) => {
      testWebContents!.once('did-finish-load', () => resolve());
    });
  });

  ipc.handle('selftest:loadHTML', async (_event: IpcMainInvokeEvent, html: string, baseUrl: string): Promise<void> => {
    if (!testWebContents) throw new Error('BrowserView not created');
    await testWebContents.loadURL(`data:text/html,${encodeURIComponent(html)}`);
  });

  ipc.handle('selftest:run', async (_event: IpcMainInvokeEvent, runId: string, steps: SelfTestStep[]): Promise<SelfTestRun> => {
    if (!testWebContents) throw new Error('BrowserView not created');

    const run: SelfTestRun = {
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
      } catch (error) {
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

  ipc.handle('selftest:getRun', async (_event: IpcMainInvokeEvent, runId: string): Promise<SelfTestRun | null> => {
    return selfTestRuns.get(runId) || null;
  });

  ipc.handle('selftest:captureScreenshot', async (): Promise<string | null> => {
    if (!testWebContents) return null;
    const image = await testWebContents.capturePage();
    return image.toDataURL();
  });

  ipc.handle('selftest:destroyView', async (): Promise<void> => {
    if (testBrowserView) {
      mainWindow?.setBrowserView(null);
      testBrowserView.webContents.close();
      testBrowserView = null;
      testWebContents = null;
    }
  });

  ipc.handle('selftest:resizeView', async (_event: IpcMainInvokeEvent, width: number, height: number): Promise<void> => {
    if (testBrowserView) {
      testBrowserView.setBounds({ x: 0, y: 0, width, height });
    }
  });

  ipc.handle('selftest:executeScript', async (_event: IpcMainInvokeEvent, script: string): Promise<any> => {
    if (!testWebContents) throw new Error('BrowserView not created');
    return testWebContents.executeJavaScript(script);
  });
}

async function executeStep(webContents: WebContents, step: SelfTestStep): Promise<void> {
  const selector = step.selector;

  switch (step.type) {
    case 'click': {
      if (!selector) throw new Error('Click requires selector');
      await webContents.executeJavaScript(`
        const el = document.querySelector(${JSON.stringify(selector)});
        if (!el) throw new Error('Element not found: ${selector}');
        el.click();
      `);
      break;
    }
    case 'type': {
      if (!selector) throw new Error('Type requires selector');
      if (!step.text) throw new Error('Type requires text');
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
      if (!step.from || !step.to) throw new Error('Drag requires from and to coordinates');
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
      if (!step.direction) throw new Error('Slide requires direction');
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
      if (!selector) throw new Error('Assert requires selector');
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
      if (!result.pass) throw new Error(result.error || 'Assertion failed');
      break;
    }
  }
}