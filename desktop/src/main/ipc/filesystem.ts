import { ipcMain, IpcMainInvokeEvent, dialog } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  size?: number;
  modified?: number;
}

export interface ReadFileResult {
  content: string;
  encoding: string;
}

export interface WriteFileOptions {
  path: string;
  content: string;
  encoding?: BufferEncoding;
}

export function registerFileSystemHandlers(
  ipc: typeof ipcMain,
  dialogModule: typeof dialog
): void {
  ipc.handle('fs:readDirectory', async (_event: IpcMainInvokeEvent, dirPath: string): Promise<FileNode[]> => {
    try {
      const entries = await fs.promises.readdir(dirPath, { withFileTypes: true });
      const nodes: FileNode[] = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dirPath, entry.name);
          let size: number | undefined;
          let modified: number | undefined;
          try {
            const stats = await fs.promises.stat(fullPath);
            size = stats.size;
            modified = stats.mtimeMs;
          } catch {}
          return {
            name: entry.name,
            path: fullPath,
            isDirectory: entry.isDirectory(),
            size,
            modified,
            children: entry.isDirectory() ? [] : undefined,
          };
        })
      );
      return nodes.sort((a, b) => {
        if (a.isDirectory !== b.isDirectory) return a.isDirectory ? -1 : 1;
        return a.name.localeCompare(b.name);
      });
    } catch (error) {
      throw new Error(`Failed to read directory: ${error}`);
    }
  });

  ipc.handle('fs:readFile', async (_event: IpcMainInvokeEvent, filePath: string, encoding: BufferEncoding = 'utf-8'): Promise<ReadFileResult> => {
    try {
      const content = await fs.promises.readFile(filePath, encoding);
      return { content, encoding };
    } catch (error) {
      throw new Error(`Failed to read file: ${error}`);
    }
  });

  ipc.handle('fs:writeFile', async (_event: IpcMainInvokeEvent, options: WriteFileOptions): Promise<void> => {
    try {
      const dir = path.dirname(options.path);
      await fs.promises.mkdir(dir, { recursive: true });
      await fs.promises.writeFile(options.path, options.content, options.encoding || 'utf-8');
    } catch (error) {
      throw new Error(`Failed to write file: ${error}`);
    }
  });

  ipc.handle('fs:delete', async (_event: IpcMainInvokeEvent, targetPath: string): Promise<void> => {
    try {
      const stats = await fs.promises.stat(targetPath);
      if (stats.isDirectory()) {
        await fs.promises.rm(targetPath, { recursive: true });
      } else {
        await fs.promises.unlink(targetPath);
      }
    } catch (error) {
      throw new Error(`Failed to delete: ${error}`);
    }
  });

  ipc.handle('fs:rename', async (_event: IpcMainInvokeEvent, oldPath: string, newPath: string): Promise<void> => {
    try {
      await fs.promises.rename(oldPath, newPath);
    } catch (error) {
      throw new Error(`Failed to rename: ${error}`);
    }
  });

  ipc.handle('fs:mkdir', async (_event: IpcMainInvokeEvent, dirPath: string): Promise<void> => {
    try {
      await fs.promises.mkdir(dirPath, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory: ${error}`);
    }
  });

  ipc.handle('fs:exists', async (_event: IpcMainInvokeEvent, targetPath: string): Promise<boolean> => {
    try {
      await fs.promises.access(targetPath);
      return true;
    } catch {
      return false;
    }
  });

  ipc.handle('fs:stat', async (_event: IpcMainInvokeEvent, targetPath: string): Promise<FileNode | null> => {
    try {
      const stats = await fs.promises.stat(targetPath);
      return {
        name: path.basename(targetPath),
        path: targetPath,
        isDirectory: stats.isDirectory(),
        size: stats.size,
        modified: stats.mtimeMs,
      };
    } catch {
      return null;
    }
  });

  ipc.handle('fs:watch', async (_event: IpcMainInvokeEvent, dirPath: string): Promise<string> => {
    const watcher = fs.watch(dirPath, { recursive: true }, (eventType, filename) => {
      if (filename) {
        const fullPath = path.join(dirPath, filename);
        mainWindow?.webContents.send('fs:changed', { path: fullPath, eventType });
      }
    });
    return watcher.toString();
  });

  ipc.handle('fs:unwatch', async (_event: IpcMainInvokeEvent, watcherId: string): Promise<void> => {
    // In a real implementation, track watchers by ID
  });

  ipc.handle('dialog:openDirectory', async (): Promise<string | null> => {
    const result = await dialogModule.showOpenDialog(mainWindow!, {
      properties: ['openDirectory', 'createDirectory'],
      title: 'Select Project Folder',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipc.handle('dialog:openFile', async (_event: IpcMainInvokeEvent, filters?: Electron.FileFilter[]): Promise<string | null> => {
    const result = await dialogModule.showOpenDialog(mainWindow!, {
      properties: ['openFile'],
      filters,
      title: 'Open File',
    });
    return result.canceled ? null : result.filePaths[0];
  });

  ipc.handle('dialog:saveFile', async (_event: IpcMainInvokeEvent, defaultPath?: string, filters?: Electron.FileFilter[]): Promise<string | null> => {
    const result = await dialogModule.showSaveDialog(mainWindow!, {
      defaultPath,
      filters,
      title: 'Save File',
    });
    return result.canceled ? null : result.filePath;
  });
}

import { mainWindow } from '../main.js';