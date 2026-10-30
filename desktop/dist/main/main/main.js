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
exports.agentProcesses = exports.mainWindow = void 0;
const electron_1 = require("electron");
const path = __importStar(require("node:path"));
const filesystem_js_1 = require("./ipc/filesystem.js");
const process_js_1 = require("./ipc/process.js");
const dialog_js_1 = require("./ipc/dialog.js");
const native_js_1 = require("./ipc/native.js");
const settings_js_1 = require("./ipc/settings.js");
const selftest_js_1 = require("./ipc/selftest.js");
// Use process.cwd() for the app root, and compute paths relative to that
const APP_ROOT = process.cwd();
const __dirname = path.join(APP_ROOT, 'desktop/dist/main');
const isDev = process.env.NODE_ENV === 'development';
const APP_NAME = 'DevForge';
// Get the web app path (parent directory's index.html)
const WEB_APP_PATH = path.join(APP_ROOT, 'index.html');
let mainWindow = null;
exports.mainWindow = mainWindow;
let tray = null;
const agentProcesses = new Map();
exports.agentProcesses = agentProcesses;
function createWindow() {
    const preloadPath = path.join(APP_ROOT, 'desktop/dist/preload/preload.js');
    const iconPath = path.join(APP_ROOT, 'assets/icon.png');
    exports.mainWindow = mainWindow = new electron_1.BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1000,
        minHeight: 600,
        title: APP_NAME,
        icon: electron_1.nativeImage.createFromPath(iconPath),
        webPreferences: {
            preload: preloadPath,
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
            webSecurity: !isDev,
            allowRunningInsecureContent: isDev,
        },
        show: false,
        titleBarStyle: 'hidden',
        trafficLightPosition: { x: 16, y: 16 },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
    else {
        mainWindow.loadFile(WEB_APP_PATH);
    }
    mainWindow.once('ready-to-show', () => {
        mainWindow?.show();
        if (isDev)
            mainWindow?.focus();
    });
    mainWindow.on('closed', () => {
        exports.mainWindow = mainWindow = null;
    });
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: 'deny' };
    });
    return mainWindow;
}
function createTray() {
    const iconPath = path.join(__dirname, '../../assets/icon.png');
    tray = new electron_1.Tray(electron_1.nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }));
    const contextMenu = electron_1.Menu.buildFromTemplate([
        { label: 'Show DevForge', click: () => mainWindow?.show() },
        { label: 'Quit', click: () => electron_1.app.quit() },
    ]);
    tray.setToolTip(APP_NAME);
    tray.setContextMenu(contextMenu);
    tray.on('double-click', () => mainWindow?.show());
}
electron_1.app.whenReady().then(() => {
    createWindow();
    createTray();
    (0, filesystem_js_1.registerFileSystemHandlers)(electron_1.ipcMain, electron_1.dialog);
    (0, process_js_1.registerProcessHandlers)(electron_1.ipcMain, agentProcesses);
    (0, dialog_js_1.registerDialogHandlers)(electron_1.ipcMain, electron_1.dialog);
    (0, native_js_1.registerNativeHandlers)(electron_1.ipcMain);
    (0, settings_js_1.registerSettingsHandlers)(electron_1.ipcMain);
    (0, selftest_js_1.registerSelfTestHandlers)(electron_1.ipcMain, mainWindow);
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        agentProcesses.forEach((proc) => proc.kill());
        electron_1.app.quit();
    }
});
electron_1.app.on('before-quit', () => {
    agentProcesses.forEach((proc) => proc.kill());
});
electron_1.ipcMain.handle('app:getVersion', () => electron_1.app.getVersion());
electron_1.ipcMain.handle('app:getPlatform', () => process.platform);
electron_1.ipcMain.handle('app:isDev', () => isDev);
//# sourceMappingURL=main.js.map