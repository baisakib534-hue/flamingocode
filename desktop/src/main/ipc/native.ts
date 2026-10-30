import { ipcMain, IpcMainInvokeEvent } from 'electron';

interface NativeModule {
  // File indexing
  indexDirectory(path: string): Promise<FileIndexResult>;
  searchCodeGraph(query: string, projectPath: string): Promise<CodeGraphResult>;

  // Computer Use
  captureScreen(): Promise<ScreenCaptureResult>;
  inputClick(x: number, y: number): Promise<void>;
  inputType(text: string): Promise<void>;
  inputKey(key: string, modifiers?: string[]): Promise<void>;
  inputDrag(fromX: number, fromY: number, toX: number, toY: number): Promise<void>;

  // Sandbox
  sandboxCreate(config: SandboxConfig): Promise<SandboxResult>;
  sandboxExecute(sandboxId: string, command: string): Promise<SandboxExecResult>;
  sandboxDestroy(sandboxId: string): Promise<void>;
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
  data: string; // base64 encoded PNG
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

let nativeModule: NativeModule | null = null;
let nativeLoadError: string | null = null;

async function loadNativeModule(): Promise<NativeModule | null> {
  if (nativeModule) return nativeModule;
  if (nativeLoadError) return null;

  try {
    let rustModule: any = null;
    let cppModule: any = null;

    try {
      rustModule = await import('../native/rust.js');
    } catch {}
    try {
      cppModule = await import('../native/cpp.js');
    } catch {}

    nativeModule = {
      // File indexing - prefer Rust for speed
      indexDirectory: async (path: string) => {
        if (rustModule?.indexDirectory) return rustModule.indexDirectory(path);
        if (cppModule?.indexDirectory) return cppModule.indexDirectory(path);
        throw new Error('No native indexer available');
      },
      searchCodeGraph: async (query: string, projectPath: string) => {
        if (rustModule?.searchCodeGraph) return rustModule.searchCodeGraph(query, projectPath);
        if (cppModule?.searchCodeGraph) return cppModule.searchCodeGraph(query, projectPath);
        throw new Error('No native code graph search available');
      },

      // Computer Use - prefer C++ for low-level input
      captureScreen: async () => {
        if (cppModule?.captureScreen) return cppModule.captureScreen();
        if (rustModule?.captureScreen) return rustModule.captureScreen();
        throw new Error('No screen capture available');
      },
      inputClick: async (x: number, y: number) => {
        if (cppModule?.inputClick) return cppModule.inputClick(x, y);
        if (rustModule?.inputClick) return rustModule.inputClick(x, y);
        throw new Error('No input click available');
      },
      inputType: async (text: string) => {
        if (cppModule?.inputType) return cppModule.inputType(text);
        if (rustModule?.inputType) return rustModule.inputType(text);
        throw new Error('No input type available');
      },
      inputKey: async (key: string, modifiers?: string[]) => {
        if (cppModule?.inputKey) return cppModule.inputKey(key, modifiers);
        if (rustModule?.inputKey) return rustModule.inputKey(key, modifiers);
        throw new Error('No input key available');
      },
      inputDrag: async (fromX: number, fromY: number, toX: number, toY: number) => {
        if (cppModule?.inputDrag) return cppModule.inputDrag(fromX, fromY, toX, toY);
        if (rustModule?.inputDrag) return rustModule.inputDrag(fromX, fromY, toX, toY);
        throw new Error('No input drag available');
      },

      // Sandbox - Rust for isolation
      sandboxCreate: async (config: SandboxConfig) => {
        if (rustModule?.sandboxCreate) return rustModule.sandboxCreate(config);
        throw new Error('No sandbox available');
      },
      sandboxExecute: async (sandboxId: string, command: string) => {
        if (rustModule?.sandboxExecute) return rustModule.sandboxExecute(sandboxId, command);
        throw new Error('No sandbox execute available');
      },
      sandboxDestroy: async (sandboxId: string) => {
        if (rustModule?.sandboxDestroy) return rustModule.sandboxDestroy(sandboxId);
        throw new Error('No sandbox destroy available');
      },
    };

    return nativeModule;
  } catch (error) {
    nativeLoadError = error instanceof Error ? error.message : String(error);
    console.warn('Failed to load native modules:', nativeLoadError);
    return null;
  }
}

export function registerNativeHandlers(ipc: typeof ipcMain): void {
  ipc.handle('native:isAvailable', async (): Promise<boolean> => {
    const mod = await loadNativeModule();
    return mod !== null;
  });

  ipc.handle('native:getLoadError', async (): Promise<string | null> => {
    await loadNativeModule();
    return nativeLoadError;
  });

  ipc.handle('native:indexDirectory', async (_event: IpcMainInvokeEvent, path: string) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.indexDirectory(path);
  });

  ipc.handle('native:searchCodeGraph', async (_event: IpcMainInvokeEvent, query: string, projectPath: string) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.searchCodeGraph(query, projectPath);
  });

  ipc.handle('native:captureScreen', async () => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.captureScreen();
  });

  ipc.handle('native:inputClick', async (_event: IpcMainInvokeEvent, x: number, y: number) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.inputClick(x, y);
  });

  ipc.handle('native:inputType', async (_event: IpcMainInvokeEvent, text: string) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.inputType(text);
  });

  ipc.handle('native:inputKey', async (_event: IpcMainInvokeEvent, key: string, modifiers?: string[]) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.inputKey(key, modifiers);
  });

  ipc.handle('native:inputDrag', async (_event: IpcMainInvokeEvent, fromX: number, fromY: number, toX: number, toY: number) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.inputDrag(fromX, fromY, toX, toY);
  });

  ipc.handle('native:sandboxCreate', async (_event: IpcMainInvokeEvent, config: SandboxConfig) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.sandboxCreate(config);
  });

  ipc.handle('native:sandboxExecute', async (_event: IpcMainInvokeEvent, sandboxId: string, command: string) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.sandboxExecute(sandboxId, command);
  });

  ipc.handle('native:sandboxDestroy', async (_event: IpcMainInvokeEvent, sandboxId: string) => {
    const mod = await loadNativeModule();
    if (!mod) throw new Error('Native module not available');
    return mod.sandboxDestroy(sandboxId);
  });
}