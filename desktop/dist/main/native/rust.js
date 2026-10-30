"use strict";
// Type declarations for Rust native module
// This will be replaced by the actual N-API module after `npm run build:native:rust`
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadError = exports.isAvailable = void 0;
exports.indexDirectory = indexDirectory;
exports.searchCodeGraph = searchCodeGraph;
exports.captureScreen = captureScreen;
exports.inputClick = inputClick;
exports.inputType = inputType;
exports.inputKey = inputKey;
exports.inputDrag = inputDrag;
exports.sandboxCreate = sandboxCreate;
exports.sandboxExecute = sandboxExecute;
exports.sandboxDestroy = sandboxDestroy;
exports.isAvailable = false;
exports.loadError = 'Rust native module not built. Run `npm run build:native:rust`';
async function indexDirectory(_path) {
    throw new Error(exports.loadError);
}
async function searchCodeGraph(_query, _projectPath) {
    throw new Error(exports.loadError);
}
async function captureScreen() {
    throw new Error(exports.loadError);
}
async function inputClick(_x, _y) {
    throw new Error(exports.loadError);
}
async function inputType(_text) {
    throw new Error(exports.loadError);
}
async function inputKey(_key, _modifiers) {
    throw new Error(exports.loadError);
}
async function inputDrag(_fromX, _fromY, _toX, _toY) {
    throw new Error(exports.loadError);
}
async function sandboxCreate(_config) {
    throw new Error(exports.loadError);
}
async function sandboxExecute(_sandboxId, _command) {
    throw new Error(exports.loadError);
}
async function sandboxDestroy(_sandboxId) {
    throw new Error(exports.loadError);
}
//# sourceMappingURL=rust.js.map