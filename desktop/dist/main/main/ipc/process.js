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
exports.registerProcessHandlers = registerProcessHandlers;
const node_child_process_1 = require("node:child_process");
const path = __importStar(require("node:path"));
const fs = __importStar(require("node:fs"));
const runningProcesses = new Map();
function registerProcessHandlers(ipc, agentProcesses) {
    ipc.handle('process:spawn', async (_event, options) => {
        return new Promise((resolve, reject) => {
            const spawnOptions = {
                cwd: options.cwd || process.cwd(),
                env: { ...process.env, ...options.env },
                detached: options.detached || false,
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
            };
            const child = (0, node_child_process_1.spawn)(options.command, options.args || [], spawnOptions);
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
                main_js_1.mainWindow?.webContents.send('process:stdout', { pid: child.pid, data: data.toString() });
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
                main_js_1.mainWindow?.webContents.send('process:stderr', { pid: child.pid, data: data.toString() });
            });
            child.on('error', (error) => {
                reject(new Error(`Failed to spawn process: ${error.message}`));
            });
            child.on('close', (exitCode, signal) => {
                runningProcesses.delete(child.pid);
                agentProcesses.delete(child.pid);
                resolve({
                    pid: child.pid,
                    stdout,
                    stderr,
                    exitCode,
                    signal,
                });
            });
            runningProcesses.set(child.pid, child);
            agentProcesses.set(child.pid, child);
        });
    });
    ipc.handle('process:kill', async (_event, pid, signal = 'SIGTERM') => {
        const proc = runningProcesses.get(pid) || agentProcesses.get(pid);
        if (proc) {
            proc.kill(signal);
            return true;
        }
        return false;
    });
    ipc.handle('process:list', async () => {
        const results = [];
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
    ipc.handle('process:spawnAgent', async (_event, agentPath, args, projectDir) => {
        const fullAgentPath = path.resolve(agentPath);
        if (!fs.existsSync(fullAgentPath)) {
            throw new Error(`Agent not found: ${fullAgentPath}`);
        }
        return new Promise((resolve, reject) => {
            const child = (0, node_child_process_1.spawn)(fullAgentPath, args, {
                cwd: projectDir,
                env: { ...process.env, DEVFORGE_PROJECT_DIR: projectDir },
                stdio: ['pipe', 'pipe', 'pipe'],
                windowsHide: true,
            });
            let stdout = '';
            let stderr = '';
            child.stdout?.on('data', (data) => {
                stdout += data.toString();
                main_js_1.mainWindow?.webContents.send('agent:stdout', { pid: child.pid, data: data.toString() });
            });
            child.stderr?.on('data', (data) => {
                stderr += data.toString();
                main_js_1.mainWindow?.webContents.send('agent:stderr', { pid: child.pid, data: data.toString() });
            });
            child.on('error', (error) => {
                reject(new Error(`Failed to spawn agent: ${error.message}`));
            });
            child.on('close', (exitCode, signal) => {
                agentProcesses.delete(child.pid);
                resolve({
                    pid: child.pid,
                    stdout,
                    stderr,
                    exitCode,
                    signal,
                });
            });
            agentProcesses.set(child.pid, child);
        });
    });
    ipc.handle('process:sendStdin', async (_event, pid, data) => {
        const proc = runningProcesses.get(pid) || agentProcesses.get(pid);
        if (proc?.stdin?.writable) {
            proc.stdin.write(data);
            return true;
        }
        return false;
    });
}
const main_js_1 = require("../main.js");
//# sourceMappingURL=process.js.map