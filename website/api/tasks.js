const store = require('./_lib/store');
const crypto = require('crypto');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

function verifyAuth(req) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

async function getUserIdFromToken(token) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const record = await store.getToken(tokenHash);
  return record?.userId || null;
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    const token = verifyAuth(req);
    if (!token) return res.status(401).json({ error: 'Missing or invalid Authorization header' });

    const userId = await getUserIdFromToken(token);
    if (!userId) return res.status(401).json({ error: 'Invalid or expired token' });

    const rateLimit = store.checkRateLimit(`tasks:${userId}`, 50, 60000);
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limited', retryAfter: rateLimit.retryAfter });
    }

    if (req.method === 'POST' && req.url === '/api/tasks') {
      const { toDeviceId, envelope } = req.body;
      if (!toDeviceId || envelope === undefined) {
        return res.status(400).json({ error: 'toDeviceId and envelope required' });
      }

      const device = await store.getDevice(toDeviceId);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ error: 'Target device not found or not yours' });
      }

      const taskId = `task_${crypto.randomBytes(12).toString('hex')}`;
      const task = {
        taskId,
        userId,
        toDeviceId,
        envelope,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      await store.createTask(task);
      return res.json({ taskId });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/tasks/poll')) {
      const url = new URL(req.url, 'http://localhost');
      const deviceId = url.searchParams.get('deviceId');
      if (!deviceId) return res.status(400).json({ error: 'deviceId required' });

      const device = await store.getDevice(deviceId);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ error: 'Device not found' });
      }

      await store.updateDeviceLastSeen(deviceId);

      const start = Date.now();
      const timeout = 24000;
      let tasks = await store.getPendingTasks(deviceId);

      while (tasks.length === 0 && Date.now() - start < timeout) {
        await new Promise(r => setTimeout(r, 1000));
        tasks = await store.getPendingTasks(deviceId);
      }

      if (tasks.length > 0) {
        await store.markTasksDelivered(tasks.map(t => t.taskId));
      }

      return res.json(tasks.map(t => ({ taskId: t.taskId, envelope: t.envelope })));
    }

    if (req.method === 'POST' && req.url.startsWith('/api/tasks/') && req.url.endsWith('/result')) {
      const taskId = req.url.split('/api/tasks/')[1].split('/result')[0];
      const { result } = req.body;
      if (result === undefined) return res.status(400).json({ error: 'result required' });

      const task = await store.getTask(taskId);
      if (!task || task.toDeviceId !== deviceId) {
        return res.status(404).json({ error: 'Task not found' });
      }

      await store.updateTaskResult(taskId, result);
      return res.json({ ok: true });
    }

    if (req.method === 'GET' && req.url.startsWith('/api/tasks/')) {
      const taskId = req.url.split('/api/tasks/')[1];
      const task = await store.getTask(taskId);
      if (!task || task.userId !== userId) {
        return res.status(404).json({ error: 'Task not found' });
      }
      return res.json(task);
    }

    if (req.method === 'GET' && req.url === '/api/tasks/history') {
      const tasks = await store.getUserTasks(userId);
      return res.json(tasks);
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[tasks] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};