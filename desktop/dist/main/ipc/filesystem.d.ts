import { ipcMain, dialog } from 'electron';
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
export declare function registerFileSystemHandlers(ipc: typeof ipcMain, dialogModule: typeof dialog): void;
//# sourceMappingURL=filesystem.d.ts.map