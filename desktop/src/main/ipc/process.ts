import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { spawn, ChildProcess, SpawnOptions } from 'node:child_process';
import * as path from 'node:path';
import * as fs from 'node:fs';

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

const runningProcesses = new Map<number, ChildProcess>();

export function registerProcessHandlers(
  ipc: typeof ipcMain,
  agentProcesses: Map<number, ChildProcess>
): void {
  ipc.handle('process:spawn', async (_event: IpcMainInvokeEvent, options: ProcessSpawnOptions): Promise<ProcessResult> => {
    return new Promise((resolve, reject) => {
      const spawnOptions: SpawnOptions = {
        cwd: options.cwd || process.cwd(),
        env: { ...process.env, ...options.env },
        detached: options.detached || false,
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      };

      const child = spawn(options.command, options.args || [], spawnOptions);

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        mainWindow?.webContents.send('process:stdout', { pid: child.pid, data: data.toString() });
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        mainWindow?.webContents.send('process:stderr', { pid: child.pid, data: data.toString() });
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn process: ${error.message}`));
      });

      child.on('close', (exitCode, signal) => {
        runningProcesses.delete(child.pid!);
        agentProcesses.delete(child.pid!);
        resolve({
          pid: child.pid!,
          stdout,
          stderr,
          exitCode,
          signal,
        });
      });

      runningProcesses.set(child.pid!, child);
      agentProcesses.set(child.pid!, child);
    });
  });

  ipc.handle('process:kill', async (_event: IpcMainInvokeEvent, pid: number, signal: NodeJS.Signals = 'SIGTERM'): Promise<boolean> => {
    const proc = runningProcesses.get(pid) || agentProcesses.get(pid);
    if (proc) {
      proc.kill(signal);
      return true;
    }
    return false;
  });

  ipc.handle('process:list', async (): Promise<ProcessResult[]> => {
    const results: ProcessResult[] = [];
    for (const [pid, proc] of runningProcesses) {
      results.push({
        pid,
        stdout: '',
        stderr: '',
        exitCode: null,
        signal: null,
      });
    }
    for (const [pid, proc] of agentProcesses) {
      if (!runningProcesses.has(pid)) {
        results.push({
          pid,
          stdout: '',
          stderr: '',
          exitCode: null,
          signal: null,
        });
      }
    }
    return results;
  });

  ipc.handle('process:spawnAgent', async (
    _event: IpcMainInvokeEvent,
    agentPath: string,
    args: string[],
    projectDir: string
  ): Promise<ProcessResult> => {
    const fullAgentPath = path.resolve(agentPath);
    if (!fs.existsSync(fullAgentPath)) {
      throw new Error(`Agent not found: ${fullAgentPath}`);
    }

    return new Promise((resolve, reject) => {
      const child = spawn(fullAgentPath, args, {
        cwd: projectDir,
        env: { ...process.env, DEVFORGE_PROJECT_DIR: projectDir },
        stdio: ['pipe', 'pipe', 'pipe'],
        windowsHide: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout?.on('data', (data) => {
        stdout += data.toString();
        mainWindow?.webContents.send('agent:stdout', { pid: child.pid, data: data.toString() });
      });

      child.stderr?.on('data', (data) => {
        stderr += data.toString();
        mainWindow?.webContents.send('agent:stderr', { pid: child.pid, data: data.toString() });
      });

      child.on('error', (error) => {
        reject(new Error(`Failed to spawn agent: ${error.message}`));
      });

      child.on('close', (exitCode, signal) => {
        agentProcesses.delete(child.pid!);
        resolve({
          pid: child.pid!,
          stdout,
          stderr,
          exitCode,
          signal,
        });
      });

      agentProcesses.set(child.pid!, child);
    });
  });

  ipc.handle('process:sendStdin', async (_event: IpcMainInvokeEvent, pid: number, data: string): Promise<boolean> => {
    const proc = runningProcesses.get(pid) || agentProcesses.get(pid);
    if (proc?.stdin?.writable) {
      proc.stdin.write(data);
      return true;
    }
    return false;
  });
}

import { mainWindow } from '../main.js';