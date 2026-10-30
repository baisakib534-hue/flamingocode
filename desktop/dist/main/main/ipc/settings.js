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
exports.registerSettingsHandlers = registerSettingsHandlers;
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const os = __importStar(require("node:os"));
const SETTINGS_DIR = path.join(os.homedir(), '.devforge');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');
const LOCALSTORAGE_FILE = path.join(SETTINGS_DIR, 'localStorage-migration.json');
const DEFAULT_SETTINGS = {
    theme: 'flamingo',
    providers: [],
    agents: [],
    skills: [],
    mcpServers: [],
    activeProvider: '',
    activeAgent: '',
    editorSettings: {
        fontSize: 14,
        tabSize: 2,
        wordWrap: true,
        minimap: false,
    },
    windowState: { width: 1400, height: 900 },
    migratedFromWeb: false,
};
function ensureSettingsDir() {
    if (!fs.existsSync(SETTINGS_DIR)) {
        fs.mkdirSync(SETTINGS_DIR, { recursive: true });
    }
}
function loadSettings() {
    ensureSettingsDir();
    try {
        if (fs.existsSync(SETTINGS_FILE)) {
            const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
            return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
        }
    }
    catch { }
    return DEFAULT_SETTINGS;
}
function saveSettings(settings) {
    ensureSettingsDir();
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}
function registerSettingsHandlers(ipc) {
    ipc.handle('settings:get', async () => {
        return loadSettings();
    });
    ipc.handle('settings:set', async (_event, settings) => {
        const current = loadSettings();
        const updated = { ...current, ...settings };
        saveSettings(updated);
        return updated;
    });
    ipc.handle('settings:reset', async () => {
        saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    });
    ipc.handle('settings:migrateFromWeb', async (_event, localStorageData) => {
        const current = loadSettings();
        if (current.migratedFromWeb) {
            return current;
        }
        const migrated = {
            migratedFromWeb: true,
            migrationDate: new Date().toISOString(),
        };
        if (localStorageData['devforge-theme']) {
            migrated.theme = localStorageData['devforge-theme'];
        }
        if (localStorageData['devforge-providers']) {
            try {
                migrated.providers = JSON.parse(localStorageData['devforge-providers']);
            }
            catch { }
        }
        if (localStorageData['devforge-agents']) {
            try {
                migrated.agents = JSON.parse(localStorageData['devforge-agents']);
            }
            catch { }
        }
        if (localStorageData['devforge-skills']) {
            try {
                migrated.skills = JSON.parse(localStorageData['devforge-skills']);
            }
            catch { }
        }
        if (localStorageData['devforge-mcpServers']) {
            try {
                migrated.mcpServers = JSON.parse(localStorageData['devforge-mcpServers']);
            }
            catch { }
        }
        if (localStorageData['devforge-activeProvider']) {
            migrated.activeProvider = localStorageData['devforge-activeProvider'];
        }
        if (localStorageData['devforge-activeAgent']) {
            migrated.activeAgent = localStorageData['devforge-activeAgent'];
        }
        if (localStorageData['devforge-editorSettings']) {
            try {
                migrated.editorSettings = JSON.parse(localStorageData['devforge-editorSettings']);
            }
            catch { }
        }
        const updated = { ...current, ...migrated };
        saveSettings(updated);
        fs.writeFileSync(LOCALSTORAGE_FILE, JSON.stringify(localStorageData, null, 2));
        return updated;
    });
    ipc.handle('settings:export', async () => {
        const settings = loadSettings();
        return JSON.stringify(settings, null, 2);
    });
    ipc.handle('settings:import', async (_event, json) => {
        const imported = JSON.parse(json);
        const validated = { ...DEFAULT_SETTINGS, ...imported };
        saveSettings(validated);
        return validated;
    });
}
//# sourceMappingURL=settings.js.map