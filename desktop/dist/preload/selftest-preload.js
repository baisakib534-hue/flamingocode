import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('devforgeSelfTest', {
    onConsoleMessage: (callback) => {
        const handler = (_event, level, message, line, sourceId) => {
            callback(level, message, line, sourceId);
        };
        window.addEventListener('console-message', handler);
        return () => window.removeEventListener('console-message', handler);
    },
    executeScript: (script) => {
        return new Promise((resolve, reject) => {
            try {
                const result = eval(script);
                resolve(result);
            }
            catch (error) {
                reject(error);
            }
        });
    },
});
//# sourceMappingURL=selftest-preload.js.map