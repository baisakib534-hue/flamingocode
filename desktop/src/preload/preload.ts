import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
  encoding?: BufferEncoding;
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
  signal: NodeJS.Signals | null;
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

interface CodeGraphResult {
  nodes: CodeGraphNode[];
  edges: CodeGraphEdge[];
}

interface CodeGraphNode {
  id: string;
  name: string;
  type: 'function' | 'class' | 'variable' | 'import' | 'export';
  file: string;
  line: number;
  column: number;
}

interface CodeGraphEdge {
  from: string;
  to: string;
  type: 'calls' | 'imports' | 'extends' | 'references';
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

const api = {
  fs: {
    readDirectory: (dirPath: string): Promise<FileNode[]> =>
      ipcRenderer.invoke('fs:readDirectory', dirPath),
    readFile: (filePath: string, encoding?: BufferEncoding): Promise<ReadFileResult> =>
      ipcRenderer.invoke('fs:readFile', filePath, encoding),
    writeFile: (options: WriteFileOptions): Promise<void> =>
      ipcRenderer.invoke('fs:writeFile', options),
    delete: (targetPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:delete', targetPath),
    rename: (oldPath: string, newPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:rename', oldPath, newPath),
    mkdir: (dirPath: string): Promise<void> =>
      ipcRenderer.invoke('fs:mkdir', dirPath),
    exists: (targetPath: string): Promise<boolean> =>
      ipcRenderer.invoke('fs:exists', targetPath),
    stat: (targetPath: string): Promise<FileNode | null> =>
      ipcRenderer.invoke('fs:stat', targetPath),
    watch: (dirPath: string): Promise<string> =>
      ipcRenderer.invoke('fs:watch', dirPath),
    unwatch: (watcherId: string): Promise<void> =>
      ipcRenderer.invoke('fs:unwatch', watcherId),
    onChange: (callback: (event: { path: string; eventType: string }) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, data: { path: string; eventType: string }) => callback(data);
      ipcRenderer.on('fs:changed', handler);
      return () => ipcRenderer.off('fs:changed', handler);
    },
  },

  dialog: {
    openDirectory: (): Promise<string | null> =>
      ipcRenderer.invoke('dialog:openDirectory'),
    openFile: (filters?: Electron.FileFilter[]): Promise<string | null> =>
      ipcRenderer.invoke('dialog:openFile', filters),
    saveFile: (defaultPath?: string, filters?: Electron.FileFilter[]): Promise<string | null> =>
      ipcRenderer.invoke('dialog:saveFile', defaultPath, filters),
    showMessageBox: (options: Electron.MessageBoxOptions): Promise<number> =>
      ipcRenderer.invoke('dialog:showMessageBox', options),
    showErrorBox: (title: string, content: string): Promise<void> =>
      ipcRenderer.invoke('dialog:showErrorBox', title, content),
  },

  process: {
    spawn: (options: ProcessSpawnOptions): Promise<ProcessResult> =>
      ipcRenderer.invoke('process:spawn', options),
    kill: (pid: number, signal?: NodeJS.Signals): Promise<boolean> =>
      ipcRenderer.invoke('process:kill', pid, signal),
    list: (): Promise<ProcessResult[]> =>
      ipcRenderer.invoke('process:list'),
    spawnAgent: (agentPath: string, args: string[], projectDir: string): Promise<ProcessResult> =>
      ipcRenderer.invoke('process:spawnAgent', agentPath, args, projectDir),
    sendStdin: (pid: number, data: string): Promise<boolean> =>
      ipcRenderer.invoke('process:sendStdin', pid, data),
    onStdout: (callback: (data: { pid: number; data: string }) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, data: { pid: number; data: string }) => callback(data);
      ipcRenderer.on('process:stdout', handler);
      return () => ipcRenderer.off('process:stdout', handler);
    },
    onStderr: (callback: (data: { pid: number; data: string }) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, data: { pid: number; data: string }) => callback(data);
      ipcRenderer.on('process:stderr', handler);
      return () => ipcRenderer.off('process:stderr', handler);
    },
    onAgentStdout: (callback: (data: { pid: number; data: string }) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, data: { pid: number; data: string }) => callback(data);
      ipcRenderer.on('agent:stdout', handler);
      return () => ipcRenderer.off('agent:stdout', handler);
    },
    onAgentStderr: (callback: (data: { pid: number; data: string }) => void): (() => void) => {
      const handler = (_event: IpcRendererEvent, data: { pid: number; data: string }) => callback(data);
      ipcRenderer.on('agent:stderr', handler);
      return () => ipcRenderer.off('agent:stderr', handler);
    },
  },

  native: {
    isAvailable: (): Promise<boolean> =>
      ipcRenderer.invoke('native:isAvailable'),
    getLoadError: (): Promise<string | null> =>
      ipcRenderer.invoke('native:getLoadError'),
    indexDirectory: (path: string): Promise<FileIndexResult> =>
      ipcRenderer.invoke('native:indexDirectory', path),
    searchCodeGraph: (query: string, projectPath: string): Promise<CodeGraphResult> =>
      ipcRenderer.invoke('native:searchCodeGraph', query, projectPath),
    captureScreen: (): Promise<ScreenCaptureResult> =>
      ipcRenderer.invoke('native:captureScreen'),
    inputClick: (x: number, y: number): Promise<void> =>
      ipcRenderer.invoke('native:inputClick', x, y),
    inputType: (text: string): Promise<void> =>
      ipcRenderer.invoke('native:inputType', text),
    inputKey: (key: string, modifiers?: string[]): Promise<void> =>
      ipcRenderer.invoke('native:inputKey', key, modifiers),
    inputDrag: (fromX: number, fromY: number, toX: number, toY: number): Promise<void> =>
      ipcRenderer.invoke('native:inputDrag', fromX, fromY, toX, toY),
    sandboxCreate: (config: SandboxConfig): Promise<SandboxResult> =>
      ipcRenderer.invoke('native:sandboxCreate', config),
    sandboxExecute: (sandboxId: string, command: string): Promise<SandboxExecResult> =>
      ipcRenderer.invoke('native:sandboxExecute', sandboxId, command),
    sandboxDestroy: (sandboxId: string): Promise<void> =>
      ipcRenderer.invoke('native:sandboxDestroy', sandboxId),
  },

  settings: {
    get: (): Promise<DevForgeSettings> =>
      ipcRenderer.invoke('settings:get'),
    set: (settings: Partial<DevForgeSettings>): Promise<DevForgeSettings> =>
      ipcRenderer.invoke('settings:set', settings),
    reset: (): Promise<DevForgeSettings> =>
      ipcRenderer.invoke('settings:reset'),
    migrateFromWeb: (localStorageData: Record<string, string>): Promise<DevForgeSettings> =>
      ipcRenderer.invoke('settings:migrateFromWeb', localStorageData),
    export: (): Promise<string> =>
      ipcRenderer.invoke('settings:export'),
    import: (json: string): Promise<DevForgeSettings> =>
      ipcRenderer.invoke('settings:import', json),
  },

  selftest: {
    createView: (options: { width: number; height: number }): Promise<string> =>
      ipcRenderer.invoke('selftest:createView', options),
    loadURL: (url: string): Promise<void> =>
      ipcRenderer.invoke('selftest:loadURL', url),
    loadHTML: (html: string, baseUrl: string): Promise<void> =>
      ipcRenderer.invoke('selftest:loadHTML', html, baseUrl),
    run: (runId: string, steps: SelfTestStep[]): Promise<SelfTestRun> =>
      ipcRenderer.invoke('selftest:run', runId, steps),
    getRun: (runId: string): Promise<SelfTestRun | null> =>
      ipcRenderer.invoke('selftest:getRun', runId),
    captureScreenshot: (): Promise<string | null> =>
      ipcRenderer.invoke('selftest:captureScreenshot'),
    destroyView: (): Promise<void> =>
      ipcRenderer.invoke('selftest:destroyView'),
    resizeView: (width: number, height: number): Promise<void> =>
      ipcRenderer.invoke('selftest:resizeView', width, height),
    executeScript: (script: string): Promise<any> =>
      ipcRenderer.invoke('selftest:executeScript', script),
  },

  app: {
    getVersion: (): Promise<string> =>
      ipcRenderer.invoke('app:getVersion'),
    getPlatform: (): Promise<string> =>
      ipcRenderer.invoke('app:getPlatform'),
    isDev: (): Promise<boolean> =>
      ipcRenderer.invoke('app:isDev'),
  },

  on: (channel: string, callback: (...args: any[]) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, ...args: any[]) => callback(...args);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.off(channel, handler);
  },
  once: (channel: string, callback: (...args: any[]) => void): void => {
    ipcRenderer.once(channel, (_event, ...args) => callback(...args));
  },
};

contextBridge.exposeInMainWorld('devforgeDesktop', api);

declare global {
  interface Window {
    devforgeDesktop: typeof api;
  }
}