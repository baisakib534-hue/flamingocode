import { ipcMain } from 'electron';
import { ChildProcess } from 'node:child_process';
export interface ProcessSpawnOptions {
    command: string;
    args?: string[];
    cwd?: string;
    env?: NodeJS.ProcessEnv;
    detached?: boolean;
}
export interface ProcessResult {
    pid: number;
    stdout: string;
    stderr: string;
    exitCode: number | null;
    signal: NodeJS.Signals | null;
}
export declare function registerProcessHandlers(ipc: typeof ipcMain, agentProcesses: Map<number, ChildProcess>): void;
//# sourceMappingURL=process.d.ts.map