declare global {
    interface Window {
        devforgeSelfTest: {
            onConsoleMessage: (callback: (level: string, message: string, line: number, sourceId: string) => void) => () => void;
            executeScript: (script: string) => Promise<any>;
        };
    }
}
export {};
//# sourceMappingURL=selftest-preload.d.ts.map