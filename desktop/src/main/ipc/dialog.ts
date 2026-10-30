import { ipcMain, IpcMainInvokeEvent, dialog } from 'electron';

export function registerDialogHandlers(ipc: typeof ipcMain, dialogModule: typeof dialog): void {
  ipc.handle('dialog:showMessageBox', async (
    _event: IpcMainInvokeEvent,
    options: Electron.MessageBoxOptions
  ): Promise<number> => {
    const result = await dialogModule.showMessageBox(mainWindow!, options);
    return result.response;
  });

  ipc.handle('dialog:showErrorBox', async (
    _event: IpcMainInvokeEvent,
    title: string,
    content: string
  ): Promise<void> => {
    dialogModule.showErrorBox(title, content);
  });

  ipc.handle('dialog:showOpenDialog', async (
    _event: IpcMainInvokeEvent,
    options: Electron.OpenDialogOptions
  ): Promise<string[]> => {
    const result = await dialogModule.showOpenDialog(mainWindow!, options);
    return result.filePaths;
  });

  ipc.handle('dialog:showSaveDialog', async (
    _event: IpcMainInvokeEvent,
    options: Electron.SaveDialogOptions
  ): Promise<string | null> => {
    const result = await dialogModule.showSaveDialog(mainWindow!, options);
    return result.canceled ? null : result.filePath!;
  });
}

import { mainWindow } from '../main.js';