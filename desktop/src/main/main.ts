import { app, BrowserWindow, ipcMain, dialog, shell, nativeImage, Tray, Menu } from 'electron';
import * as path from 'node:path';
import * as fs from 'node:fs';
import { spawn, ChildProcess } from 'node:child_process';
import { registerFileSystemHandlers } from './ipc/filesystem.js';
import { registerProcessHandlers } from './ipc/process.js';
import { registerDialogHandlers } from './ipc/dialog.js';
import { registerNativeHandlers } from './ipc/native.js';
import { registerSettingsHandlers } from './ipc/settings.js';
import { registerSelfTestHandlers } from './ipc/selftest.js';

// Use process.cwd() for the app root, and compute paths relative to that
const APP_ROOT = process.cwd();
const MAIN_DIR = path.join(APP_ROOT, 'desktop/dist/main');

const isDev = process.env.NODE_ENV === 'development';
const APP_NAME = 'DevForge';

// Get the web app path (parent directory's index.html)
const WEB_APP_PATH = path.join(APP_ROOT, 'index.html');

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
const agentProcesses = new Map<number, ChildProcess>();

function createWindow(): BrowserWindow {
  const preloadPath = path.join(APP_ROOT, 'desktop/dist/preload/preload.js');
  const iconPath = path.join(APP_ROOT, 'assets/icon.png');

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 600,
    title: APP_NAME,
    icon: nativeImage.createFromPath(iconPath),
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
  } else {
    mainWindow.loadFile(WEB_APP_PATH);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    if (isDev) mainWindow?.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  return mainWindow;
}

function createTray(): void {
  const iconPath = path.join(MAIN_DIR, '../../assets/icon.png');
  tray = new Tray(nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 }));
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show DevForge', click: () => mainWindow?.show() },
    { label: 'Quit', click: () => app.quit() },
  ]);
  tray.setToolTip(APP_NAME);
  tray.setContextMenu(contextMenu);
  tray.on('double-click', () => mainWindow?.show());
}

app.whenReady().then(() => {
  createWindow();
  createTray();

  registerFileSystemHandlers(ipcMain, dialog);
  registerProcessHandlers(ipcMain, agentProcesses);
  registerDialogHandlers(ipcMain, dialog);
  registerNativeHandlers(ipcMain);
  registerSettingsHandlers(ipcMain);
  registerSelfTestHandlers(ipcMain, mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    agentProcesses.forEach((proc) => proc.kill());
    app.quit();
  }
});

app.on('before-quit', () => {
  agentProcesses.forEach((proc) => proc.kill());
});

ipcMain.handle('app:getVersion', () => app.getVersion());
ipcMain.handle('app:getPlatform', () => process.platform);
ipcMain.handle('app:isDev', () => isDev);

export { mainWindow, agentProcesses };