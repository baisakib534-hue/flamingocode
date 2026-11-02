import './styles.css';

interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileNode[];
  size?: number;
  modified?: number;
}

interface ReadFileResult {
  content: string;
  encoding: string;
}

interface WriteFileOptions {
  path: string;
  content: string;
  encoding?: string;
}

interface ProcessSpawnOptions {
  command: string;
  args?: string[];
  cwd?: string;
  env?: Record<string, string>;
  detached?: boolean;
}

interface ProcessResult {
  pid: number;
  stdout: string;
  stderr: string;
  exitCode: number | null;
  signal: string | null;
}

interface SelfTestStep {
  type: 'click' | 'type' | 'drag' | 'slide' | 'scroll' | 'wait' | 'assert';
  selector?: string;
  text?: string;
  from?: { x: number; y: number };
  to?: { x: number; y: number };
  direction?: 'up' | 'down' | 'left' | 'right';
  duration?: number;
  assertType?: 'exists' | 'textContains' | 'textEquals' | 'attributeEquals';
  expectedValue?: string;
  attribute?: string;
}

interface SelfTestResult {
  step: number;
  type: string;
  passed: boolean;
  error?: string;
  durationMs: number;
  screenshot?: string;
}

interface SelfTestRun {
  id: string;
  url: string;
  steps: SelfTestStep[];
  results: SelfTestResult[];
  consoleErrors: ConsoleError[];
  passed: boolean;
  durationMs: number;
}

interface ConsoleError {
  message: string;
  source: string;
  line: number;
  column: number;
  type: 'error' | 'warning' | 'info';
}

interface FileIndexResult {
  filesIndexed: number;
  symbolsExtracted: number;
  durationMs: number;
}

interface CodeGraphNode {
  id: string;
  name: string;
  nodeType: string;
  file: string;
  line: number;
  column: number;
}

interface CodeGraphEdge {
  from: string;
  to: string;
  edgeType: string;
}

interface CodeGraphResult {
  nodes: CodeGraphNode[];
  edges: CodeGraphEdge[];
}

interface ScreenCaptureResult {
  width: number;
  height: number;
  data: string;
}

interface SandboxConfig {
  type: 'rust' | 'cpp' | 'go';
  limits?: {
    cpuMs?: number;
    memoryMb?: number;
    diskMb?: number;
  };
}

interface SandboxResult {
  sandboxId: string;
  pid: number;
}

interface SandboxExecResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  durationMs: number;
}

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
  authToken?: string;
  authEmail?: string;
}

interface DevForgeDesktopAPI {
  fs: {
    readDirectory: (dirPath: string) => Promise<FileNode[]>;
    readFile: (filePath: string, encoding?: string) => Promise<ReadFileResult>;
    writeFile: (options: WriteFileOptions) => Promise<void>;
    delete: (targetPath: string) => Promise<void>;
    rename: (oldPath: string, newPath: string) => Promise<void>;
    mkdir: (dirPath: string) => Promise<void>;
    exists: (targetPath: string) => Promise<boolean>;
    stat: (targetPath: string) => Promise<FileNode | null>;
    watch: (dirPath: string) => Promise<string>;
    unwatch: (watcherId: string) => Promise<void>;
    onChange: (callback: (event: { path: string; eventType: string }) => void) => () => void;
  };
  dialog: {
    openDirectory: () => Promise<string | null>;
    openFile: (filters?: any[]) => Promise<string | null>;
    saveFile: (defaultPath?: string, filters?: any[]) => Promise<string | null>;
    showMessageBox: (options: any) => Promise<number>;
    showErrorBox: (title: string, content: string) => Promise<void>;
  };
  process: {
    spawn: (options: ProcessSpawnOptions) => Promise<ProcessResult>;
    kill: (pid: number, signal?: string) => Promise<boolean>;
    list: () => Promise<ProcessResult[]>;
    spawnAgent: (agentPath: string, args: string[], projectDir: string) => Promise<ProcessResult>;
    sendStdin: (pid: number, data: string) => Promise<boolean>;
    onStdout: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onStderr: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onAgentStdout: (callback: (data: { pid: number; data: string }) => void) => () => void;
    onAgentStderr: (callback: (data: { pid: number; data: string }) => void) => () => void;
  };
  native: {
    isAvailable: () => Promise<boolean>;
    getLoadError: () => Promise<string | null>;
    indexDirectory: (path: string) => Promise<FileIndexResult>;
    searchCodeGraph: (query: string, projectPath: string) => Promise<CodeGraphResult>;
    captureScreen: () => Promise<ScreenCaptureResult>;
    inputClick: (x: number, y: number) => Promise<void>;
    inputType: (text: string) => Promise<void>;
    inputKey: (key: string, modifiers?: string[]) => Promise<void>;
    inputDrag: (fromX: number, fromY: number, toX: number, toY: number) => Promise<void>;
    sandboxCreate: (config: SandboxConfig) => Promise<SandboxResult>;
    sandboxExecute: (sandboxId: string, command: string) => Promise<SandboxExecResult>;
    sandboxDestroy: (sandboxId: string) => Promise<void>;
  };
  settings: {
    get: () => Promise<DevForgeSettings>;
    set: (settings: Partial<DevForgeSettings>) => Promise<DevForgeSettings>;
    reset: () => Promise<DevForgeSettings>;
    migrateFromWeb: (localStorageData: Record<string, string>) => Promise<DevForgeSettings>;
    export: () => Promise<string>;
    import: (json: string) => Promise<DevForgeSettings>;
  };
  selftest: {
    createView: (options: { width: number; height: number }) => Promise<string>;
    loadURL: (url: string) => Promise<void>;
    loadHTML: (html: string, baseUrl: string) => Promise<void>;
    run: (runId: string, steps: SelfTestStep[]) => Promise<SelfTestRun>;
    getRun: (runId: string) => Promise<SelfTestRun | null>;
    captureScreenshot: () => Promise<string | null>;
    destroyView: () => Promise<void>;
    resizeView: (width: number, height: number) => Promise<void>;
    executeScript: (script: string) => Promise<any>;
  };
  app: {
    getVersion: () => Promise<string>;
    getPlatform: () => Promise<string>;
    isDev: () => Promise<boolean>;
  };
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  once: (channel: string, callback: (...args: any[]) => void) => () => void;
}

const RELAY_URL = 'https://flamingocode-eta.vercel.app';

class DesktopBridge {
  private api: DevForgeDesktopAPI | null = null;
  private initialized = false;

  async initialize(): Promise<boolean> {
    if (this.initialized) return !!this.api;

    await new Promise<void>(resolve => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        window.addEventListener('load', () => resolve(), { once: true });
      }
    });

    this.api = window.devforgeDesktop || null;
    this.initialized = true;

    if (this.api) {
      console.log('[DevForge Desktop] Bridge initialized');
      this.setupMigration();
    } else {
      console.log('[DevForge Desktop] Running in browser mode (no desktop bridge)');
    }

    return !!this.api;
  }

  isDesktop(): boolean {
    return !!this.api;
  }

  getAPI(): DevForgeDesktopAPI | null {
    return this.api;
  }

  private async setupMigration(): Promise<void> {
    if (!this.api) return;

    try {
      const settings = await this.api.settings.get();
      if (!settings.migratedFromWeb) {
        const localStorageData: Record<string, string> = {};
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('devforge-')) {
            localStorageData[key] = localStorage.getItem(key) || '';
          }
        }
        if (Object.keys(localStorageData).length > 0) {
          console.log('[DevForge Desktop] Migrating localStorage data...');
          await this.api.settings.migrateFromWeb(localStorageData);
          console.log('[DevForge Desktop] Migration complete');
        }
      }
    } catch (error) {
      console.warn('[DevForge Desktop] Migration failed:', error);
    }
  }
}

export const desktopBridge = new DesktopBridge();

class AuthManager {
  private token: string | null = null;
  private email: string | null = null;
  private deviceId: string | null = null;
  private pairCode: string | null = null;
  private qrRefreshInterval: number | null = null;

  async loadStoredAuth(): Promise<boolean> {
    const api = desktopBridge.getAPI();
    if (!api) return false;

    try {
      const settings = await api.settings.get();
      if (settings.authToken) {
        this.token = settings.authToken;
        this.email = settings.authEmail || null;
        const valid = await this.validateToken();
        if (valid) return true;
        this.clearAuth();
      }
    } catch (e) {
      console.warn('[Auth] Failed to load stored auth:', e);
    }
    return false;
  }

  async validateToken(): Promise<boolean> {
    if (!this.token) return false;
    try {
      const res = await fetch(`${RELAY_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.token}` }
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  async loginWithCredentials(email: string, password: string): Promise<{ token: string; user: { email: string; name: string } }> {
    const res = await fetch(`${RELAY_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  }

  async loginWithToken(token: string): Promise<{ user: { email: string; name: string } }> {
    const res = await fetch(`${RELAY_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Invalid token');
    }
    return res.json();
  }

  async registerDevice(): Promise<{ deviceId: string; pairCode: string }> {
    if (!this.token) throw new Error('Not authenticated');
    const res = await fetch(`${RELAY_URL}/api/devices/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ name: 'Desktop', type: 'desktop' })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Device registration failed');
    }
    return res.json();
  }

  async saveAuth(token: string, email: string): Promise<void> {
    this.token = token;
    this.email = email;
    const api = desktopBridge.getAPI();
    if (api) {
      await api.settings.set({ authToken: token, authEmail: email });
    }
  }

  clearAuth(): void {
    this.token = null;
    this.email = null;
    this.deviceId = null;
    this.pairCode = null;
    const api = desktopBridge.getAPI();
    if (api) {
      api.settings.set({ authToken: undefined, authEmail: undefined });
    }
  }

  getToken(): string | null {
    return this.token;
  }

  getEmail(): string | null {
    return this.email;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  setDeviceInfo(deviceId: string, pairCode: string): void {
    this.deviceId = deviceId;
    this.pairCode = pairCode;
  }

  getDeviceInfo(): { deviceId: string | null; pairCode: string | null } {
    return { deviceId: this.deviceId, pairCode: this.pairCode };
  }

  startQRRefresh(callback: () => void): void {
    this.stopQRRefresh();
    this.qrRefreshInterval = window.setInterval(callback, 4 * 60 * 1000);
  }

  stopQRRefresh(): void {
    if (this.qrRefreshInterval) {
      clearInterval(this.qrRefreshInterval);
      this.qrRefreshInterval = null;
    }
  }
}

export const authManager = new AuthManager();

async function renderLoginScreen(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="login-screen">
      <div class="login-card">
        <img src="../../assets/flamingocode-logo.png" alt="FlamingoCode" class="login-logo">
        <h1>Welcome to FlamingoCode</h1>
        <p class="login-subtitle">Sign in to pair your desktop with the phone app</p>

        <div class="login-tabs" role="tablist">
          <button role="tab" class="login-tab active" data-tab="credentials" aria-selected="true">Email + Password</button>
          <button role="tab" class="login-tab" data-tab="token" aria-selected="false">Paste API Token</button>
        </div>

        <div role="tabpanel" class="login-panel active" data-panel="credentials">
          <form id="credentials-form" class="login-form">
            <div class="form-group">
              <label for="login-email">Email</label>
              <input type="email" id="login-email" name="email" required autocomplete="email" placeholder="you@example.com">
            </div>
            <div class="form-group">
              <label for="login-password">Password</label>
              <input type="password" id="login-password" name="password" required autocomplete="current-password" placeholder="••••••••">
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="login-btn">Sign In</button>
          </form>
        </div>

        <div role="tabpanel" class="login-panel" data-panel="token" hidden>
          <form id="token-form" class="login-form">
            <div class="form-group">
              <label for="api-token">API Token</label>
              <input type="text" id="api-token" name="token" required placeholder="Paste your API token from the website" style="font-family: var(--font-mono); font-size: 0.8125rem;">
            </div>
            <p class="form-hint">Get your token from <a href="${RELAY_URL}/account.html" target="_blank">account page</a> after signing in.</p>
            <button type="submit" class="btn btn-primary btn-block" id="token-btn">Continue with Token</button>
          </form>
        </div>

        <div id="login-error" class="login-error" style="display: none;"></div>
      </div>
    </div>
  `;

  bindLoginTabs();
  bindCredentialsForm();
  bindTokenForm();
}

function bindLoginTabs(): void {
  document.querySelectorAll<HTMLElement>('.login-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll<HTMLElement>('.login-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === target);
        t.setAttribute('aria-selected', String(t.dataset.tab === target));
      });
      document.querySelectorAll<HTMLElement>('.login-panel').forEach(p => {
        const isActive = p.dataset.panel === target;
        p.classList.toggle('active', isActive);
        p.hidden = !isActive;
      });
    });
  });
}

function bindCredentialsForm(): void {
  const form = document.getElementById('credentials-form') as HTMLFormElement;
  const btn = document.getElementById('login-btn') as HTMLButtonElement;
  const errorEl = document.getElementById('login-error') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    btn.disabled = true;
    btn.textContent = 'Signing in…';

    try {
      const data = await authManager.loginWithCredentials(email, password);
      await authManager.saveAuth(data.token, data.user.email);
      await showMainApp();
    } catch (err: any) {
      errorEl.textContent = err.message || 'Login failed';
      errorEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Sign In';
    }
  });
}

function bindTokenForm(): void {
  const form = document.getElementById('token-form') as HTMLFormElement;
  const btn = document.getElementById('token-btn') as HTMLButtonElement;
  const errorEl = document.getElementById('login-error') as HTMLDivElement;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    errorEl.textContent = '';

    const token = (form.elements.namedItem('token') as HTMLInputElement).value.trim();

    btn.disabled = true;
    btn.textContent = 'Verifying…';

    try {
      const data = await authManager.loginWithToken(token);
      await authManager.saveAuth(token, data.user.email);
      await showMainApp();
    } catch (err: any) {
      errorEl.textContent = err.message || 'Invalid token';
      errorEl.style.display = 'block';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Continue with Token';
    }
  });
}

async function showMainApp(): Promise<void> {
  const isDesktop = await desktopBridge.initialize();

  if (isDesktop) {
    document.documentElement.setAttribute('data-desktop', 'true');
    const api = desktopBridge.getAPI();
    if (api) {
      const version = await api.app.getVersion();
      const platform = await api.app.getPlatform();
      console.log(`[DevForge Desktop] Version: ${version}, Platform: ${platform}`);
    }
  } else {
    document.documentElement.setAttribute('data-desktop', 'false');
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '../../index.html';
  document.head.appendChild(link);

  const script = document.createElement('script');
  script.src = '../../index.html';
  script.type = 'module';
  document.body.appendChild(script);
}

async function renderPairPhoneScreen(): Promise<void> {
  const app = document.getElementById('app');
  if (!app) return;
  app.innerHTML = `
    <div class="pair-screen">
      <header class="pair-header">
        <div class="pair-header-left">
          <button class="btn-icon" id="back-btn" title="Back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          </button>
          <h1>Pair Phone</h1>
        </div>
        <div class="pair-header-right">
          <span class="user-email" id="user-email"></span>
          <button class="btn-icon" id="logout-btn" title="Sign out">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </header>

      <main class="pair-main">
        <div class="pair-card">
          <div class="pair-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 3.21A2.19 2.19 0 0 0 4 4.72v14.56a2.19 2.19 0 0 0 1.5 1.51h13a2.19 2.19 0 0 0 1.5-1.51V4.72a2.19 2.19 0 0 0-1.5-1.51z"/><line x1="8" y1="19" x2="8.01" y2="19"/></svg>
          </div>
          <h2>Scan QR Code on Phone</h2>
          <p class="pair-instruction">Open FlamingoCode on your phone, go to "Scan QR" tab, and scan this code.</p>

          <div class="qr-container" id="qr-container">
            <canvas id="qr-canvas"></canvas>
          </div>

          <div class="pair-details">
            <div class="detail-row">
              <span class="detail-label">Device ID</span>
              <span class="detail-value" id="device-id-display"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Pair Code</span>
              <span class="detail-value pair-code" id="pair-code-display"></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Expires</span>
              <span class="detail-value" id="expiry-display"></span>
            </div>
          </div>

          <div class="pair-actions">
            <button class="btn btn-secondary" id="refresh-qr-btn">Refresh QR</button>
            <button class="btn btn-primary" id="done-btn">Done</button>
          </div>
        </div>
      </main>
    </div>
  `;

  document.getElementById('back-btn')?.addEventListener('click', () => showMainApp());
  document.getElementById('logout-btn')?.addEventListener('click', () => logout());
  document.getElementById('refresh-qr-btn')?.addEventListener('click', generateAndShowQR);
  document.getElementById('done-btn')?.addEventListener('click', () => showMainApp());

  await generateAndShowQR();
}

async function generateAndShowQR(): Promise<void> {
  const canvas = document.getElementById('qr-canvas') as HTMLCanvasElement;
  const deviceIdDisplay = document.getElementById('device-id-display');
  const pairCodeDisplay = document.getElementById('pair-code-display');
  const expiryDisplay = document.getElementById('expiry-display');
  const userEmailDisplay = document.getElementById('user-email');

  if (!canvas || !deviceIdDisplay || !pairCodeDisplay || !expiryDisplay) return;

  const { QRCode } = await import('qrcode');

  try {
    const { deviceId, pairCode } = await authManager.registerDevice();
    authManager.setDeviceInfo(deviceId, pairCode);

    const expMs = Date.now() + 5 * 60 * 1000;
    const expDate = new Date(expMs);
    const payload = {
      v: 1,
      relay: RELAY_URL,
      deviceId,
      pairCode,
      exp: Math.floor(expMs / 1000)
    };

    await QRCode.toCanvas(canvas, JSON.stringify(payload), {
      width: 256,
      margin: 2,
      color: {
        dark: '#f1f5f9',
        light: '#0b0d14'
      }
    });

    deviceIdDisplay.textContent = deviceId;
    pairCodeDisplay.textContent = pairCode;
    expiryDisplay.textContent = expDate.toLocaleTimeString();
    if (userEmailDisplay) userEmailDisplay.textContent = authManager.getEmail() || '';
  } catch (err) {
    console.error('[Pair] QR generation failed:', err);
    const container = document.getElementById('qr-container');
    if (container) {
      container.innerHTML = `<div class="alert alert-error">Failed to generate QR: ${(err as Error).message}</div>`;
    }
  }
}

function logout(): void {
  authManager.clearAuth();
  authManager.stopQRRefresh();
  renderLoginScreen();
}

async function loadWebApp(): Promise<void> {
  const hasAuth = await authManager.loadStoredAuth();

  if (hasAuth) {
    await showMainApp();
  } else {
    renderLoginScreen();
  }
}

loadWebApp().catch(console.error);