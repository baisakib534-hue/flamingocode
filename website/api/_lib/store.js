const crypto = require('crypto');

let kv = null;
let useKV = false;
const memoryStore = {
  users: new Map(),
  devices: new Map(),
  tasks: new Map(),
  recordings: new Map(),
  tokens: new Map(),
  rateLimits: new Map()
};

function initKV() {
  if (useKV) return;
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  if (url && token) {
    try {
      kv = { url, token };
      useKV = true;
      console.log('[store] Vercel KV initialized');
    } catch (e) {
      console.warn('[store] KV init failed, using memory fallback:', e.message);
    }
  } else {
    console.log('[store] KV env vars not set, using memory fallback (dev only)');
  }
}

async function kvRequest(method, path, body) {
  if (!useKV || !kv) throw new Error('KV not configured');
  const res = await fetch(`${kv.url}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${kv.token}`,
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KV ${method} ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateId(prefix = '') {
  return `${prefix}${crypto.randomBytes(16).toString('hex')}`;
}

function checkRateLimit(key, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const windowStart = now - windowMs;
  if (!memoryStore.rateLimits.has(key)) {
    memoryStore.rateLimits.set(key, []);
  }
  const requests = memoryStore.rateLimits.get(key).filter(t => t > windowStart);
  if (requests.length >= limit) {
    return { allowed: false, retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000) };
  }
  requests.push(now);
  memoryStore.rateLimits.set(key, requests);
  return { allowed: true };
}

const store = {
  async getUserByEmail(email) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/user:email:${email}`);
      return data.result || null;
    }
    for (const user of memoryStore.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  async getUserById(userId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/user:id:${userId}`);
      return data.result || null;
    }
    return memoryStore.users.get(userId) || null;
  },

  async createUser(user) {
    initKV();
    if (useKV) {
      await kvRequest('POST', '/set', { key: `user:id:${user.id}`, value: user });
      await kvRequest('POST', '/set', { key: `user:email:${user.email}`, value: user });
    } else {
      memoryStore.users.set(user.id, user);
    }
    return user;
  },

  async saveToken(tokenHash, userId, expiresAt) {
    initKV();
    const record = { userId, expiresAt };
    if (useKV) {
      await kvRequest('POST', '/set', { key: `token:${tokenHash}`, value: record, expire: Math.floor((expiresAt - Date.now()) / 1000) });
    } else {
      memoryStore.tokens.set(tokenHash, record);
    }
  },

  async getToken(tokenHash) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/token:${tokenHash}`);
      return data.result || null;
    }
    const record = memoryStore.tokens.get(tokenHash);
    if (record && record.expiresAt > Date.now()) return record;
    if (record) memoryStore.tokens.delete(tokenHash);
    return null;
  },

  async deleteToken(tokenHash) {
    initKV();
    if (useKV) {
      await kvRequest('POST', '/delete', { key: `token:${tokenHash}` });
    } else {
      memoryStore.tokens.delete(tokenHash);
    }
  },

  async registerDevice(device) {
    initKV();
    if (useKV) {
      await kvRequest('POST', '/set', { key: `device:${device.deviceId}`, value: device });
      await kvRequest('POST', '/set', { key: `user:devices:${device.userId}`, value: await this.getUserDevices(device.userId) });
    } else {
      memoryStore.devices.set(device.deviceId, device);
    }
    return device;
  },

  async getDevice(deviceId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/device:${deviceId}`);
      return data.result || null;
    }
    return memoryStore.devices.get(deviceId) || null;
  },

  async getUserDevices(userId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/user:devices:${userId}`);
      return data.result || [];
    }
    const devices = [];
    for (const device of memoryStore.devices.values()) {
      if (device.userId === userId) devices.push(device);
    }
    return devices;
  },

  async updateDeviceLastSeen(deviceId) {
    initKV();
    const device = await this.getDevice(deviceId);
    if (device) {
      device.lastSeen = new Date().toISOString();
      if (useKV) {
        await kvRequest('POST', '/set', { key: `device:${deviceId}`, value: device });
      }
    }
    return device;
  },

  async deleteDevice(deviceId, userId) {
    initKV();
    if (useKV) {
      await kvRequest('POST', '/delete', { key: `device:${deviceId}` });
      const devices = await this.getUserDevices(userId);
      const filtered = devices.filter(d => d.deviceId !== deviceId);
      await kvRequest('POST', '/set', { key: `user:devices:${userId}`, value: filtered });
    } else {
      memoryStore.devices.delete(deviceId);
    }
  },

  async createTask(task) {
    initKV();
    // task.envelope is opaque — relay never reads inside it
    if (useKV) {
      await kvRequest('POST', '/set', { key: `task:${task.taskId}`, value: task });
    } else {
      memoryStore.tasks.set(task.taskId, task);
    }
    return task;
  },

  async getTask(taskId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/task:${taskId}`);
      return data.result || null;
    }
    return memoryStore.tasks.get(taskId) || null;
  },

  async getPendingTasks(deviceId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/tasks:pending:${deviceId}`);
      return data.result || [];
    }
    const tasks = [];
    for (const task of memoryStore.tasks.values()) {
      if (task.toDeviceId === deviceId && task.status === 'pending') {
        tasks.push(task);
      }
    }
    return tasks;
  },

  async markTasksDelivered(taskIds) {
    initKV();
    for (const taskId of taskIds) {
      const task = await this.getTask(taskId);
      if (task) {
        task.status = 'delivered';
        task.deliveredAt = new Date().toISOString();
        if (useKV) {
          await kvRequest('POST', '/set', { key: `task:${taskId}`, value: task });
        }
      }
    }
  },

  async updateTaskResult(taskId, result) {
    initKV();
    const task = await this.getTask(taskId);
    if (task) {
      task.result = result;
      task.status = 'completed';
      task.completedAt = new Date().toISOString();
      if (useKV) {
        await kvRequest('POST', '/set', { key: `task:${taskId}`, value: task });
      }
    }
    return task;
  },

  async getUserTasks(userId) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/user:tasks:${userId}`);
      return data.result || [];
    }
    const tasks = [];
    for (const task of memoryStore.tasks.values()) {
      if (task.userId === userId) tasks.push(task);
    }
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async saveRecording(recording) {
    initKV();
    if (useKV) {
      await kvRequest('POST', '/set', { key: `recording:${recording.id}`, value: recording });
    } else {
      memoryStore.recordings.set(recording.id, recording);
    }
    return recording;
  },

  async getRecording(id) {
    initKV();
    if (useKV) {
      const data = await kvRequest('GET', `/get/recording:${id}`);
      return data.result || null;
    }
    return memoryStore.recordings.get(id) || null;
  },

  checkRateLimit
};

module.exports = store;