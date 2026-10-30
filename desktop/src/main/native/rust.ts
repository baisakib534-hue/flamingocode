// Type declarations for Rust native module
// This will be replaced by the actual N-API module after `npm run build:native:rust`

export const isAvailable = false;
export const loadError = 'Rust native module not built. Run `npm run build:native:rust`';

export async function indexDirectory(_path: string): Promise<any> {
  throw new Error(loadError);
}

export async function searchCodeGraph(_query: string, _projectPath: string): Promise<any> {
  throw new Error(loadError);
}

export async function captureScreen(): Promise<any> {
  throw new Error(loadError);
}

export async function inputClick(_x: number, _y: number): Promise<void> {
  throw new Error(loadError);
}

export async function inputType(_text: string): Promise<void> {
  throw new Error(loadError);
}

export async function inputKey(_key: string, _modifiers?: string[]): Promise<void> {
  throw new Error(loadError);
}

export async function inputDrag(_fromX: number, _fromY: number, _toX: number, _toY: number): Promise<void> {
  throw new Error(loadError);
}

export async function sandboxCreate(_config: any): Promise<any> {
  throw new Error(loadError);
}

export async function sandboxExecute(_sandboxId: string, _command: string): Promise<any> {
  throw new Error(loadError);
}

export async function sandboxDestroy(_sandboxId: string): Promise<void> {
  throw new Error(loadError);
}