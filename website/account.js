document.addEventListener('DOMContentLoaded', async () => {
  await App.init();
  initAccountPage();
});

async function initAccountPage() {
  if (App.state.user) {
    showDashboard();
    await loadDashboardData();
  } else {
    showAuthView();
    bindAuthForms();
  }
}

function showAuthView() {
  document.getElementById('auth-view').style.display = 'block';
  document.getElementById('dashboard-view').style.display = 'none';
}

function bindAuthForms() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Login form
  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('login-btn');
    const email = form.email.value.trim();
    const password = form.password.value;

    App.showLoading(btn, true);
    try {
      const data = await App.api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      App.setSession(data.token, data.user);
      showDashboard();
      await loadDashboardData();
    } catch (err) {
      App.showAlert(document.querySelector('.auth-card'), err.message, 'error');
    } finally {
      App.showLoading(btn, false);
    }
  });

  // Signup form
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const btn = document.getElementById('signup-btn');
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const password = form.password.value;

    App.showLoading(btn, true);
    try {
      const data = await App.api('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name })
      });
      App.setSession(data.token, data.user);
      showDashboard();
      await loadDashboardData();
    } catch (err) {
      App.showAlert(document.querySelector('.auth-card'), err.message, 'error');
    } finally {
      App.showLoading(btn, false);
    }
  });
}

function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === tab);
    t.setAttribute('aria-selected', t.dataset.tab === tab);
  });
  document.querySelectorAll('.auth-panel').forEach(p => {
    const isActive = p.id === `panel-${tab}`;
    p.classList.toggle('active', isActive);
    p.hidden = !isActive;
  });
}

function showDashboard() {
  document.getElementById('auth-view').style.display = 'none';
  document.getElementById('dashboard-view').style.display = 'block';

  document.getElementById('user-avatar').textContent = App.state.user.name?.[0]?.toUpperCase() || 'U';
  document.getElementById('user-name').textContent = App.state.user.name || App.state.user.email;

  // Show token
  const tokenDisplay = document.getElementById('token-display');
  const tokenValue = document.getElementById('token-value');
  if (App.state.token) {
    tokenDisplay.style.display = 'block';
    tokenValue.textContent = App.state.token;
  }

  // Copy token button
  document.getElementById('copy-token-btn').addEventListener('click', async () => {
    await navigator.clipboard.writeText(App.state.token);
    const btn = document.getElementById('copy-token-btn');
    const original = btn.textContent;
    btn.textContent = 'Copied!';
    setTimeout(() => btn.textContent = original, 1500);
  });

  // Logout
  document.querySelector('[data-action="logout"]').addEventListener('click', () => {
    App.clearSession();
    location.reload();
  });
}

async function loadDashboardData() {
  await Promise.all([
    loadDevices(),
    loadTasks()
  ]);
}

async function loadDevices() {
  const container = document.getElementById('device-list');
  try {
    const devices = await App.api('/devices');
    App.state.devices = devices;
    renderDevices(devices);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">Failed to load devices: ${err.message}</div>`;
  }
}

function renderDevices(devices) {
  const container = document.getElementById('device-list');
  if (!devices.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>
        <p>No devices paired yet. Sign in on desktop or phone to pair.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = devices.map(d => `
    <div class="device-item">
      <div class="device-info">
        <div class="device-icon ${d.type === 'phone' ? 'phone' : ''}">
          ${d.type === 'phone'
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 3.21A2.19 2.19 0 0 0 4 4.72v14.56a2.19 2.19 0 0 0 1.5 1.51h13a2.19 2.19 0 0 0 1.5-1.51V4.72a2.19 2.19 0 0 0-1.5-1.51z"/><line x1="8" y1="19" x2="8.01" y2="19"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/></svg>'
          }
        </div>
        <div class="device-details">
          <div class="device-name">${escapeHtml(d.name)}</div>
          <div class="device-meta">
            <span>${d.type}</span>
            <span>Last seen: ${formatTime(d.lastSeen)}</span>
          </div>
        </div>
      </div>
      <div class="device-actions">
        <button class="btn-icon" data-action="unpair" data-device-id="${d.deviceId}" title="Unpair">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
        </button>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-action="unpair"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const deviceId = e.currentTarget.dataset.deviceId;
      if (confirm('Unpair this device?')) {
        await unpairDevice(deviceId);
      }
    });
  });
}

async function unpairDevice(deviceId) {
  try {
    await App.api(`/devices/${deviceId}`, { method: 'DELETE' });
    await loadDevices();
  } catch (err) {
    App.showAlert(document.getElementById('device-list'), err.message, 'error');
  }
}

async function loadTasks() {
  const container = document.getElementById('task-list');
  try {
    const tasks = await App.api('/tasks/history');
    App.state.tasks = tasks;
    renderTasks(tasks);
  } catch (err) {
    container.innerHTML = `<div class="alert alert-error">Failed to load tasks: ${err.message}</div>`;
  }
}

function renderTasks(tasks) {
  const container = document.getElementById('task-list');
  if (!tasks.length) {
    container.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        <p>No tasks yet. Run a task from the desktop app to see it here.</p>
      </div>
    `;
    return;
  }
  container.innerHTML = tasks.map(t => `
    <div class="task-item">
      <div class="task-info">
        <div class="task-id">${t.taskId.slice(0, 12)}…</div>
        <div class="task-envelope">${escapeJson(t.envelope)}</div>
      </div>
      <span class="task-status ${t.status}">${t.status}</span>
      <div class="task-actions">
        ${t.result ? `<button class="btn-icon" data-action="view-result" data-task-id="${t.taskId}" title="View result"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>` : ''}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-action="view-result"]').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const taskId = e.currentTarget.dataset.taskId;
      await viewTaskResult(taskId);
    });
  });
}

async function viewTaskResult(taskId) {
  try {
    const task = await App.api(`/tasks/${taskId}`);
    alert(`Task Result:\n${JSON.stringify(task.result, null, 2)}`);
  } catch (err) {
    App.showAlert(document.getElementById('task-list'), err.message, 'error');
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function escapeJson(obj) {
  try {
    return escapeHtml(JSON.stringify(obj).slice(0, 80)) + (JSON.stringify(obj).length > 80 ? '…' : '');
  } catch {
    return escapeHtml(String(obj));
  }
}

function formatTime(iso) {
  if (!iso) return 'never';
  const date = new Date(iso);
  const now = new Date();
  const diff = now - date;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return date.toLocaleDateString();
}