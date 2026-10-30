import { contextBridge, ipcRenderer } from 'electron';
const api = {
    fs: {
        readDirectory: (dirPath) => ipcRenderer.invoke('fs:readDirectory', dirPath),
        readFile: (filePath, encoding) => ipcRenderer.invoke('fs:readFile', filePath, encoding),
        writeFile: (options) => ipcRenderer.invoke('fs:writeFile', options),
        delete: (targetPath) => ipcRenderer.invoke('fs:delete', targetPath),
        rename: (oldPath, newPath) => ipcRenderer.invoke('fs:rename', oldPath, newPath),
        mkdir: (dirPath) => ipcRenderer.invoke('fs:mkdir', dirPath),
        exists: (targetPath) => ipcRenderer.invoke('fs:exists', targetPath),
        stat: (targetPath) => ipcRenderer.invoke('fs:stat', targetPath),
        watch: (dirPath) => ipcRenderer.invoke('fs:watch', dirPath),
        unwatch: (watcherId) => ipcRenderer.invoke('fs:unwatch', watcherId),
        onChange: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('fs:changed', handler);
            return () => ipcRenderer.off('fs:changed', handler);
        },
    },
    dialog: {
        openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
        openFile: (filters) => ipcRenderer.invoke('dialog:openFile', filters),
        saveFile: (defaultPath, filters) => ipcRenderer.invoke('dialog:saveFile', defaultPath, filters),
        showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options),
        showErrorBox: (title, content) => ipcRenderer.invoke('dialog:showErrorBox', title, content),
    },
    process: {
        spawn: (options) => ipcRenderer.invoke('process:spawn', options),
        kill: (pid, signal) => ipcRenderer.invoke('process:kill', pid, signal),
        list: () => ipcRenderer.invoke('process:list'),
        spawnAgent: (agentPath, args, projectDir) => ipcRenderer.invoke('process:spawnAgent', agentPath, args, projectDir),
        sendStdin: (pid, data) => ipcRenderer.invoke('process:sendStdin', pid, data),
        onStdout: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('process:stdout', handler);
            return () => ipcRenderer.off('process:stdout', handler);
        },
        onStderr: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('process:stderr', handler);
            return () => ipcRenderer.off('process:stderr', handler);
        },
        onAgentStdout: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('agent:stdout', handler);
            return () => ipcRenderer.off('agent:stdout', handler);
        },
        onAgentStderr: (callback) => {
            const handler = (_event, data) => callback(data);
            ipcRenderer.on('agent:stderr', handler);
            return () => ipcRenderer.off('agent:stderr', handler);
        },
    },
    native: {
        isAvailable: () => ipcRenderer.invoke('native:isAvailable'),
        getLoadError: () => ipcRenderer.invoke('native:getLoadError'),
        indexDirectory: (path) => ipcRenderer.invoke('native:indexDirectory', path),
        searchCodeGraph: (query, projectPath) => ipcRenderer.invoke('native:searchCodeGraph', query, projectPath),
        captureScreen: () => ipcRenderer.invoke('native:captureScreen'),
        inputClick: (x, y) => ipcRenderer.invoke('native:inputClick', x, y),
        inputType: (text) => ipcRenderer.invoke('native:inputType', text),
        inputKey: (key, modifiers) => ipcRenderer.invoke('native:inputKey', key, modifiers),
        inputDrag: (fromX, fromY, toX, toY) => ipcRenderer.invoke('native:inputDrag', fromX, fromY, toX, toY),
        sandboxCreate: (config) => ipcRenderer.invoke('native:sandboxCreate', config),
        sandboxExecute: (sandboxId, command) => ipcRenderer.invoke('native:sandboxExecute', sandboxId, command),
        sandboxDestroy: (sandboxId) => ipcRenderer.invoke('native:sandboxDestroy', sandboxId),
    },
    settings: {
        get: () => ipcRenderer.invoke('settings:get'),
        set: (settings) => ipcRenderer.invoke('settings:set', settings),
        reset: () => ipcRenderer.invoke('settings:reset'),
        migrateFromWeb: (localStorageData) => ipcRenderer.invoke('settings:migrateFromWeb', localStorageData),
        export: () => ipcRenderer.invoke('settings:export'),
        import: (json) => ipcRenderer.invoke('settings:import', json),
    },
    selftest: {
        createView: (options) => ipcRenderer.invoke('selftest:createView', options),
        loadURL: (url) => ipcRenderer.invoke('selftest:loadURL', url),
        loadHTML: (html, baseUrl) => ipcRenderer.invoke('selftest:loadHTML', html, baseUrl),
        run: (runId, steps) => ipcRenderer.invoke('selftest:run', runId, steps),
        getRun: (runId) => ipcRenderer.invoke('selftest:getRun', runId),
        captureScreenshot: () => ipcRenderer.invoke('selftest:captureScreenshot'),
        destroyView: () => ipcRenderer.invoke('selftest:destroyView'),
        resizeView: (width, height) => ipcRenderer.invoke('selftest:resizeView', width, height),
        executeScript: (script) => ipcRenderer.invoke('selftest:executeScript', script),
    },
    app: {
        getVersion: () => ipcRenderer.invoke('app:getVersion'),
        getPlatform: () => ipcRenderer.invoke('app:getPlatform'),
        isDev: () => ipcRenderer.invoke('app:isDev'),
    },
    on: (channel, callback) => {
        const handler = (_event, ...args) => callback(...args);
        ipcRenderer.on(channel, handler);
        return () => ipcRenderer.off(channel, handler);
    },
    once: (channel, callback) => {
        ipcRenderer.once(channel, (_event, ...args) => callback(...args));
    },
};
contextBridge.exposeInMainWorld('devforgeDesktop', api);
//# sourceMappingURL=preload.js.map