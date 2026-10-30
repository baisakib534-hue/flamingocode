import { BrowserWindow } from 'electron';
import { ChildProcess } from 'node:child_process';
declare let mainWindow: BrowserWindow | null;
declare const agentProcesses: Map<number, ChildProcess>;
export { mainWindow, agentProcesses };
//# sourceMappingURL=main.d.ts.map