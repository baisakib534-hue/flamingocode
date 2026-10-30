"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerNativeHandlers = registerNativeHandlers;
let nativeModule = null;
let nativeLoadError = null;
async function loadNativeModule() {
    if (nativeModule)
        return nativeModule;
    if (nativeLoadError)
        return null;
    try {
        let rustModule = null;
        let cppModule = null;
        try {
            rustModule = await import('../../native/rust/index.js');
        }
        catch { }
        try {
            cppModule = await import('../../native/cpp/index.js');
        }
        catch { }
        nativeModule = {
            // File indexing - prefer Rust for speed
            indexDirectory: async (path) => {
                if (rustModule?.indexDirectory)
                    return rustModule.indexDirectory(path);
                if (cppModule?.indexDirectory)
                    return cppModule.indexDirectory(path);
                throw new Error('No native indexer available');
            },
            searchCodeGraph: async (query, projectPath) => {
                if (rustModule?.searchCodeGraph)
                    return rustModule.searchCodeGraph(query, projectPath);
                if (cppModule?.searchCodeGraph)
                    return cppModule.searchCodeGraph(query, projectPath);
                throw new Error('No native code graph search available');
            },
            // Computer Use - prefer C++ for low-level input
            captureScreen: async () => {
                if (cppModule?.captureScreen)
                    return cppModule.captureScreen();
                if (rustModule?.captureScreen)
                    return rustModule.captureScreen();
                throw new Error('No screen capture available');
            },
            inputClick: async (x, y) => {
                if (cppModule?.inputClick)
                    return cppModule.inputClick(x, y);
                if (rustModule?.inputClick)
                    return rustModule.inputClick(x, y);
                throw new Error('No input click available');
            },
            inputType: async (text) => {
                if (cppModule?.inputType)
                    return cppModule.inputType(text);
                if (rustModule?.inputType)
                    return rustModule.inputType(text);
                throw new Error('No input type available');
            },
            inputKey: async (key, modifiers) => {
                if (cppModule?.inputKey)
                    return cppModule.inputKey(key, modifiers);
                if (rustModule?.inputKey)
                    return rustModule.inputKey(key, modifiers);
                throw new Error('No input key available');
            },
            inputDrag: async (fromX, fromY, toX, toY) => {
                if (cppModule?.inputDrag)
                    return cppModule.inputDrag(fromX, fromY, toX, toY);
                if (rustModule?.inputDrag)
                    return rustModule.inputDrag(fromX, fromY, toX, toY);
                throw new Error('No input drag available');
            },
            // Sandbox - Rust for isolation
            sandboxCreate: async (config) => {
                if (rustModule?.sandboxCreate)
                    return rustModule.sandboxCreate(config);
                throw new Error('No sandbox available');
            },
            sandboxExecute: async (sandboxId, command) => {
                if (rustModule?.sandboxExecute)
                    return rustModule.sandboxExecute(sandboxId, command);
                throw new Error('No sandbox execute available');
            },
            sandboxDestroy: async (sandboxId) => {
                if (rustModule?.sandboxDestroy)
                    return rustModule.sandboxDestroy(sandboxId);
                throw new Error('No sandbox destroy available');
            },
        };
        return nativeModule;
    }
    catch (error) {
        nativeLoadError = error instanceof Error ? error.message : String(error);
        console.warn('Failed to load native modules:', nativeLoadError);
        return null;
    }
}
function registerNativeHandlers(ipc) {
    ipc.handle('native:isAvailable', async () => {
        const mod = await loadNativeModule();
        return mod !== null;
    });
    ipc.handle('native:getLoadError', async () => {
        await loadNativeModule();
        return nativeLoadError;
    });
    ipc.handle('native:indexDirectory', async (_event, path) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.indexDirectory(path);
    });
    ipc.handle('native:searchCodeGraph', async (_event, query, projectPath) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.searchCodeGraph(query, projectPath);
    });
    ipc.handle('native:captureScreen', async () => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.captureScreen();
    });
    ipc.handle('native:inputClick', async (_event, x, y) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.inputClick(x, y);
    });
    ipc.handle('native:inputType', async (_event, text) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.inputType(text);
    });
    ipc.handle('native:inputKey', async (_event, key, modifiers) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.inputKey(key, modifiers);
    });
    ipc.handle('native:inputDrag', async (_event, fromX, fromY, toX, toY) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.inputDrag(fromX, fromY, toX, toY);
    });
    ipc.handle('native:sandboxCreate', async (_event, config) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.sandboxCreate(config);
    });
    ipc.handle('native:sandboxExecute', async (_event, sandboxId, command) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.sandboxExecute(sandboxId, command);
    });
    ipc.handle('native:sandboxDestroy', async (_event, sandboxId) => {
        const mod = await loadNativeModule();
        if (!mod)
            throw new Error('Native module not available');
        return mod.sandboxDestroy(sandboxId);
    });
}
//# sourceMappingURL=native.js.map