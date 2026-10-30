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
exports.registerFileSystemHandlers = registerFileSystemHandlers;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
function registerFileSystemHandlers(ipc, dialogModule) {
    ipc.handle('fs:readDirectory', async (_event, dirPath) => {
        try {
            const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
            const nodes = await Promise.all(entries.map(async (entry) => {
                const fullPath = path.join(dirPath, entry.name);
                let size;
                let modified;
                try {
                    const stats = await fs.promises.stat(fullPath);
                    size = stats.size;
                    modified = stats.mtimeMs;
                }
                catch { }
                return {
                    name: entry.name,
                    path: fullPath,
                    isDirectory: entry.isDirectory(),
                    size,
                    modified,
                    children: entry.isDirectory() ? [] : undefined,
                };
            }));
            return nodes.sort((a, b) => {
                if (a.isDirectory !== b.isDirectory)
                    return a.isDirectory ? -1 : 1;
                return a.name.localeCompare(b.name);
            });
        }
        catch (error) {
            throw new Error(`Failed to read directory: ${error}`);
        }
    });
    ipc.handle('fs:readFile', async (_event, filePath, encoding = 'utf-8') => {
        try {
            const content = await fs.promises.readFile(filePath, encoding);
            return { content, encoding };
        }
        catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    });
    ipc.handle('fs:writeFile', async (_event, options) => {
        try {
            const dir = path.dirname(options.path);
            await fs.promises.mkdir(dir, { recursive: true });
            await fs.promises.writeFile(options.path, options.content, options.encoding || 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to write file: ${error}`);
        }
    });
    ipc.handle('fs:delete', async (_event, targetPath) => {
        try {
            const stats = await fs.promises.stat(targetPath);
            if (stats.isDirectory()) {
                await fs.promises.rm(targetPath, { recursive: true });
            }
            else {
                await fs.promises.unlink(targetPath);
            }
        }
        catch (error) {
            throw new Error(`Failed to delete: ${error}`);
        }
    });
    ipc.handle('fs:rename', async (_event, oldPath, newPath) => {
        try {
            await fs.promises.rename(oldPath, newPath);
        }
        catch (error) {
            throw new Error(`Failed to rename: ${error}`);
        }
    });
    ipc.handle('fs:mkdir', async (_event, dirPath) => {
        try {
            await fs.promises.mkdir(dirPath, { recursive: true });
        }
        catch (error) {
            throw new Error(`Failed to create directory: ${error}`);
        }
    });
    ipc.handle('fs:exists', async (_event, targetPath) => {
        try {
            await fs.promises.access(targetPath);
            return true;
        }
        catch {
            return false;
        }
    });
    ipc.handle('fs:stat', async (_event, targetPath) => {
        try {
            const stats = await fs.promises.stat(targetPath);
            return {
                name: path.basename(targetPath),
                path: targetPath,
                isDirectory: stats.isDirectory(),
                size: stats.size,
                modified: stats.mtimeMs,
            };
        }
        catch {
            return null;
        }
    });
    ipc.handle('fs:watch', async (_event, dirPath) => {
        const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
            if (filename) {
                const fullPath = path.join(dirPath, filename);
                main_js_1.mainWindow?.webContents.send('fs:changed', { path: fullPath, eventType });
            }
        });
        return watcher.toString();
    });
    ipc.handle('fs:unwatch', async (_event, watcherId) => {
        // In a real implementation, track watchers by ID
    });
    ipc.handle('dialog:openDirectory', async () => {
        const result = await dialogModule.showOpenDialog(main_js_1.mainWindow, {
            properties: ['openDirectory', 'createDirectory'],
            title: 'Select Project Folder',
        });
        return result.canceled ? null : result.filePaths[0];
    });
    ipc.handle('dialog:openFile', async (_event, filters) => {
        const result = await dialogModule.showOpenDialog(main_js_1.mainWindow, {
            properties: ['openFile'],
            filters,
            title: 'Open File',
        });
        return result.canceled ? null : result.filePaths[0];
    });
    ipc.handle('dialog:saveFile', async (_event, defaultPath, filters) => {
        const result = await dialogModule.showSaveDialog(main_js_1.mainWindow, {
            defaultPath,
            filters,
            title: 'Save File',
        });
        return result.canceled ? null : result.filePath;
    });
}
const main_js_1 = require("../main.js");
//# sourceMappingURL=filesystem.js.map