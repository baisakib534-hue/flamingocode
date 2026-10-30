import { ipcMain, IpcMainInvokeEvent } from 'electron';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const SETTINGS_DIR = path.join(os.homedir(), '.devforge');
const SETTINGS_FILE = path.join(SETTINGS_DIR, 'settings.json');
const LOCALSTORAGE_FILE = path.join(SETTINGS_DIR, 'localStorage-migration.json');

interface DevForgeSettings {
  theme: string;
  providers: any[];
  agents: any[];
  skills: any[];
  mcpServers: any[];
  activeProvider: string;
  activeAgent: string;
  editorSettings: any;
  windowState: { width: number; height: number; x?: number; y?: number };
  migratedFromWeb: boolean;
  migrationDate?: string;
}

const DEFAULT_SETTINGS: DevForgeSettings = {
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

function ensureSettingsDir(): void {
  if (!fs.existsSync(SETTINGS_DIR)) {
    fs.mkdirSync(SETTINGS_DIR, { recursive: true });
  }
}

function loadSettings(): DevForgeSettings {
  ensureSettingsDir();
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

function saveSettings(settings: DevForgeSettings): void {
  ensureSettingsDir();
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

export function registerSettingsHandlers(ipc: typeof ipcMain): void {
  ipc.handle('settings:get', async (): Promise<DevForgeSettings> => {
    return loadSettings();
  });

  ipc.handle('settings:set', async (_event: IpcMainInvokeEvent, settings: Partial<DevForgeSettings>): Promise<DevForgeSettings> => {
    const current = loadSettings();
    const updated = { ...current, ...settings };
    saveSettings(updated);
    return updated;
  });

  ipc.handle('settings:reset', async (): Promise<DevForgeSettings> => {
    saveSettings(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  });

  ipc.handle('settings:migrateFromWeb', async (_event: IpcMainInvokeEvent, localStorageData: Record<string, string>): Promise<DevForgeSettings> => {
    const current = loadSettings();
    if (current.migratedFromWeb) {
      return current;
    }

    const migrated: Partial<DevForgeSettings> = {
      migratedFromWeb: true,
      migrationDate: new Date().toISOString(),
    };

    if (localStorageData['devforge-theme']) {
      migrated.theme = localStorageData['devforge-theme'];
    }
    if (localStorageData['devforge-providers']) {
      try { migrated.providers = JSON.parse(localStorageData['devforge-providers']); } catch {}
    }
    if (localStorageData['devforge-agents']) {
      try { migrated.agents = JSON.parse(localStorageData['devforge-agents']); } catch {}
    }
    if (localStorageData['devforge-skills']) {
      try { migrated.skills = JSON.parse(localStorageData['devforge-skills']); } catch {}
    }
    if (localStorageData['devforge-mcpServers']) {
      try { migrated.mcpServers = JSON.parse(localStorageData['devforge-mcpServers']); } catch {}
    }
    if (localStorageData['devforge-activeProvider']) {
      migrated.activeProvider = localStorageData['devforge-activeProvider'];
    }
    if (localStorageData['devforge-activeAgent']) {
      migrated.activeAgent = localStorageData['devforge-activeAgent'];
    }
    if (localStorageData['devforge-editorSettings']) {
      try { migrated.editorSettings = JSON.parse(localStorageData['devforge-editorSettings']); } catch {}
    }

    const updated = { ...current, ...migrated };
    saveSettings(updated);

    fs.writeFileSync(LOCALSTORAGE_FILE, JSON.stringify(localStorageData, null, 2));

    return updated;
  });

  ipc.handle('settings:export', async (): Promise<string> => {
    const settings = loadSettings();
    return JSON.stringify(settings, null, 2);
  });

  ipc.handle('settings:import', async (_event: IpcMainInvokeEvent, json: string): Promise<DevForgeSettings> => {
    const imported = JSON.parse(json);
    const validated = { ...DEFAULT_SETTINGS, ...imported };
    saveSettings(validated);
    return validated;
  });
}