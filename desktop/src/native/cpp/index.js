// Placeholder for C++ native module
// This will be replaced by the actual N-API module after `npm run build:native:cpp`
const isAvailable = false;
const loadError = 'C++ native module not built. Run `npm run build:native:cpp`';
export async function indexDirectory(_path) {
    throw new Error(loadError);
}
export async function searchCodeGraph(_query, _projectPath) {
    throw new Error(loadError);
}
export async function captureScreen() {
    throw new Error(loadError);
}
export async function inputClick(_x, _y) {
    throw new Error(loadError);
}
export async function inputType(_text) {
    throw new Error(loadError);
}
export async function inputKey(_key, _modifiers) {
    throw new Error(loadError);
}
export async function inputDrag(_fromX, _fromY, _toX, _toY) {
    throw new Error(loadError);
}
export async function sandboxCreate(_config) {
    throw new Error(loadError);
}
export async function sandboxExecute(_sandboxId, _command) {
    throw new Error(loadError);
}
export async function sandboxDestroy(_sandboxId) {
    throw new Error(loadError);
}
export { isAvailable, loadError };
//# sourceMappingURL=index.js.map