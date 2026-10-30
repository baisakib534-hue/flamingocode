declare const isAvailable = false;
declare const loadError = "Rust native module not built. Run `npm run build:native:rust`";
export declare function indexDirectory(_path: string): Promise<any>;
export declare function searchCodeGraph(_query: string, _projectPath: string): Promise<any>;
export declare function captureScreen(): Promise<any>;
export declare function inputClick(_x: number, _y: number): Promise<void>;
export declare function inputType(_text: string): Promise<void>;
export declare function inputKey(_key: string, _modifiers?: string[]): Promise<void>;
export declare function inputDrag(_fromX: number, _fromY: number, _toX: number, _toY: number): Promise<void>;
export declare function sandboxCreate(_config: any): Promise<any>;
export declare function sandboxExecute(_sandboxId: string, _command: string): Promise<any>;
export declare function sandboxDestroy(_sandboxId: string): Promise<void>;
export { isAvailable, loadError };
//# sourceMappingURL=index.d.ts.map