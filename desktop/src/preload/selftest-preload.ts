import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('devforgeSelfTest', {
  onConsoleMessage: (callback: (level: string, message: string, line: number, sourceId: string) => void) => {
    const handler = (_event: Event, level: string, message: string, line: number, sourceId: string) => {
      callback(level, message, line, sourceId);
    };
    window.addEventListener('console-message', handler as EventListener);
    return () => window.removeEventListener('console-message', handler as EventListener);
  },

  executeScript: (script: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      try {
        const result = eval(script);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  },
});

declare global {
  interface Window {
    devforgeSelfTest: {
      onConsoleMessage: (callback: (level: string, message: string, line: number, sourceId: string) => void) => () => void;
      executeScript: (script: string) => Promise<any>;
    };
  }
}