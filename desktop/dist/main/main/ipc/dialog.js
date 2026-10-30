"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerDialogHandlers = registerDialogHandlers;
function registerDialogHandlers(ipc, dialogModule) {
    ipc.handle('dialog:showMessageBox', async (_event, options) => {
        const result = await dialogModule.showMessageBox(main_js_1.mainWindow, options);
        return result.response;
    });
    ipc.handle('dialog:showErrorBox', async (_event, title, content) => {
        dialogModule.showErrorBox(title, content);
    });
    ipc.handle('dialog:showOpenDialog', async (_event, options) => {
        const result = await dialogModule.showOpenDialog(main_js_1.mainWindow, options);
        return result.filePaths;
    });
    ipc.handle('dialog:showSaveDialog', async (_event, options) => {
        const result = await dialogModule.showSaveDialog(main_js_1.mainWindow, options);
        return result.canceled ? null : result.filePath;
    });
}
const main_js_1 = require("../main.js");
//# sourceMappingURL=dialog.js.map