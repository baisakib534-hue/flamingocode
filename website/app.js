const App = {
  state: {
    user: null,
    token: null,
    devices: [],
    tasks: []
  },

  apiBase: '/api',

  async init() {
    this.bindGlobalEvents();
    await this.restoreSession();
    this.updateAuthUI();
  },

  bindGlobalEvents() {
    document.addEventListener('click', (e) => {
      const logoutBtn = e.target.closest('[data-action="logout"]');
      if (logoutBtn) { e.preventDefault(); this.logout(); }
    });
  },

  async restoreSession() {
    const token = localStorage.getItem('fc_token');
    const user = localStorage.getItem('fc_user');
    if (token && user) {
      this.state.token = token;
      this.state.user = JSON.parse(user);
      const valid = await this.validateToken(token);
      if (!valid) { this.clearSession(); }
    }
  },

  async validateToken(token) {
    try {
      const res = await fetch(`${this.apiBase}/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return res.ok;
    } catch { return false; }
  },

  clearSession() {
    this.state.token = null;
    this.state.user = null;
    localStorage.removeItem('fc_token');
    localStorage.removeItem('fc_user');
  },

  setSession(token, user) {
    this.state.token = token;
    this.state.user = user;
    localStorage.setItem('fc_token', token);
    localStorage.setItem('fc_user', JSON.stringify(user));
  },

  updateAuthUI() {
    const authArea = document.getElementById('auth-area');
    if (!authArea) return;
    if (this.state.user) {
      authArea.innerHTML = `
        <span class="user-info">
          <span class="user-avatar">${this.state.user.name?.[0]?.toUpperCase() || 'U'}</span>
          <span>${this.state.user.name}</span>
        </span>
        <button class="btn btn-secondary" data-action="logout" style="padding: var(--space-8) var(--space-16);">Sign out</button>
      `;
    } else {
      authArea.innerHTML = `
        <a href="account.html" class="btn btn-secondary">Sign in</a>
      `;
    }
  },

  async api(path, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };
    if (this.state.token) {
      headers['Authorization'] = `Bearer ${this.state.token}`;
    }
    const res = await fetch(`${this.apiBase}${path}`, {
      ...options,
      headers
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `HTTP ${res.status}`);
    }
    return data;
  },

  showAlert(container, message, type = 'error') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    container.prepend(alert);
    setTimeout(() => alert.remove(), 5000);
  },

  showLoading(btn, loading = true) {
    if (loading) {
      btn.disabled = true;
      btn.dataset.originalText = btn.textContent;
      btn.innerHTML = '<span class="spinner"></span> Loading...';
    } else {
      btn.disabled = false;
      btn.textContent = btn.dataset.originalText || 'Submit';
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());

window.App = App;