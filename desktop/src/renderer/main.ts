import './styles.css';

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  size?: number;
  modified?: number;
}

interface ReadFileResult {
  content: string;
  encoding: string;
}

interface WriteFileOptions {
  path: string;
  content: string;
  encoding?: string;
}

interface ProcessSpawnOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  detached?: boolean;
}

interface ProcessResult {
  pid: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
}

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

interface FileIndexResult {
  filesIndexed: number;
  symbolsExtracted: number;
  durationMs: number;
}

interface CodeGraphNode {
  id: string;
  name: string;
  nodeType: string;
  file: string;
  line: number;
  column: number;
}

interface CodeGraphEdge {
  from: string;
  to: string;
  edgeType: string;
}

interface CodeGraphResult {
  nodes: CodeGraphNode[];
  edges: CodeGraphEdge[];
}

interface ScreenCaptureResult {
  width: number;
  height: number;
  data: string;
}

interface SandboxConfig {
  type: 'rust' | 'cpp' | 'go';
  limits?: {
    cpuMs?: number;
    memoryMb?: number;
    diskMb?: number;
  };
}

interface SandboxResult {
  sandboxId: string;
  pid: number;
}

interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

interface DevForgeSettings {
  theme: string;
  providers: any[];
  agents: any[];
  skills: any[];
  mcpServers: any[];
  activeProvider: string;
  activeAgent: string;
  editorSettings: any;
  windowState: { width: number; height: number; x?: number; y?: number };
  migratedFromWeb: boolean;
  migrationDate?: string;
}

interface DevForgeDesktopAPI {
  fs: {
    readDirectory: (dirPath: string) => Promise<FileNode[]>;
    readFile: (filePath: string, encoding?: string) => Promise<ReadFileResult>;
    writeFile: (options: WriteFileOptions) => Promise<void>;
    delete: (targetPath: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    mkdir: (dirPath: string) => Promise<void>;
    exists: (targetPath: string) => Promise<boolean>;
    stat: (targetPath: string) => Promise<FileNode | null>;
    watch: (dirPath: string) => Promise<string>;
    unwatch: (watcherId: string) => Promise<void>;
    onChange: (callback: (event: { path: string; eventType: string }) => void) => () => void;
  };
  dialog: {
    openDirectory: () => Promise<string | null>;
    openFile: (filters?: any[]) => Promise<string | null>;
    saveFile: (defaultPath?: string, filters?: any[]) => Promise<string | null>;
    showMessageBox: (options: any) => Promise<number>;
    showErrorBox: (title: string, content: string) => Promise<void>;
  };
  process: {
    spawn: (options: ProcessSpawnOptions) => Promise<ProcessResult>;
    kill: (pid: number, signal?: string) => Promise<boolean>;
    list: () => Promise<ProcessResult[]>;
    spawnAgent: (agentPath: string, args: string[], projectDir: string) => Promise<ProcessResult>;
    sendStdin: (pid: number, data: string) => Promise<boolean>;
    onStdout: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onStderr: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onAgentStdout: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onAgentStderr: (callback: (data: { pid: number; data: string }) => void) => () => void;
  };
  native: {
    isAvailable: () => Promise<boolean>;
    getLoadError: () => Promise<string | null>;
    indexDirectory: (path: string) => Promise<FileIndexResult>;
    searchCodeGraph: (query: string, projectPath: string) => Promise<CodeGraphResult>;
    captureScreen: () => Promise<ScreenCaptureResult>;
    inputClick: (x: number, y: number) => Promise<void>;
    inputType: (text: string) => Promise<void>;
    inputKey: (key: string, modifiers?: string[]) => Promise<void>;
    inputDrag: (fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
    sandboxCreate: (config: SandboxConfig) => Promise<SandboxResult>;
    sandboxExecute: (sandboxId: string, command: string) => Promise<SandboxExecResult>;
    sandboxDestroy: (sandboxId: string) => Promise<void>;
  };
  settings: {
    get: () => Promise<DevForgeSettings>;
    set: (settings: Partial<DevForgeSettings>) => Promise<DevForgeSettings>;
    reset: () => Promise<DevForgeSettings>;
    migrateFromWeb: (localStorageData: Record<string, string>) => Promise<DevForgeSettings>;
    export: () => Promise<string>;
    import: (json: string) => Promise<DevForgeSettings>;
  };
  selftest: {
    createView: (options: { width: number; height: number }) => Promise<string>;
    loadURL: (url: string) => Promise<void>;
    loadHTML: (html: string, baseUrl: string) => Promise<void>;
    run: (runId: string, steps: SelfTestStep[]) => Promise<SelfTestRun>;
    getRun: (runId: string) => Promise<SelfTestRun | null>;
    captureScreenshot: () => Promise<string | null>;
    destroyView: () => Promise<void>;
    resizeView: (width: number, height: number) => Promise<void>;
    executeScript: (script: string) => Promise<any>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    isDev: () => Promise<boolean>;
  };
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  once: (channel: string, callback: (...args: any[]) => void) => void;
}

class DesktopBridge {
  private api: DevForgeDesktopAPI | null = null;
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return !!this.api;

    await new Promise<void>(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });

    this.api = window.devforgeDesktop || null;
    this.initialized = true;

    if (this.api) {
      console.log('[DevForge Desktop] Bridge initialized');
      this.setupMigration();
    } else {
      console.log('[DevForge Desktop] Running in browser mode (no desktop bridge)');
    }

    return !!this.api;
  }

  isDesktop(): boolean {
    return !!this.api;
  }

  getAPI(): DevForgeDesktopAPI | null {
    return this.api;
  }

  private async setupMigration(): Promise<void> {
    if (!this.api) return;

    try {
      const settings = await this.api.settings.get();
      if (!settings.migratedFromWeb) {
        const localStorageData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('devforge-')) {
            localStorageData[key] = localStorage.getItem(key) || '';
          }
        }
        if (Object.keys(localStorageData).length > 0) {
          console.log('[DevForge Desktop] Migrating localStorage data...');
          await this.api.settings.migrateFromWeb(localStorageData);
          console.log('[DevForge Desktop] Migration complete');
        }
      }
    } catch (error) {
      console.warn('[DevForge Desktop] Migration failed:', error);
    }
  }
}

export const desktopBridge = new DesktopBridge();

async function loadWebApp(): Promise<void> {
  const isDesktop = await desktopBridge.initialize();

  if (isDesktop) {
    document.documentElement.setAttribute('data-desktop', 'true');
    const api = desktopBridge.getAPI();
    if (api) {
      const version = await api.app.getVersion();
      const platform = await api.app.getPlatform();
      console.log(`[DevForge Desktop] Version: ${version}, Platform: ${platform}`);
    }
  } else {
    document.documentElement.setAttribute('data-desktop', 'false');
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../../index.html';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = '../../index.html';
  script.type = 'module';
  document.body.appendChild(script);
}

loadWebApp().catch(console.error);