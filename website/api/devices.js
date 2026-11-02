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

// Vercel rewrite: /api/devices/:op -> /api/devices?op=:op
// req.url may arrive as the original nested path or the rewritten base path;
// accept either form so routing works regardless.
function opOf(req) {
  if (req.query && req.query.op) return String(req.query.op);
  const seg = (req.url || '').split('?')[0].split('/').filter(Boolean).pop();
  return seg || '';
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

    const rateLimit = store.checkRateLimit(`devices:${userId}`, 20, 60000);
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limited', retryAfter: rateLimit.retryAfter });
    }

    const op = opOf(req);

    if (req.method === 'POST' && op === 'register') {
      const { name, type, pushToken } = req.body;
      if (!name || !type || !['desktop', 'phone'].includes(type)) {
        return res.status(400).json({ error: 'Invalid request: name and type (desktop|phone) required' });
      }

      const deviceId = `dev_${crypto.randomBytes(12).toString('hex')}`;
      const pairCode = crypto.randomBytes(4).toString('hex').toUpperCase();
      const device = {
        deviceId,
        userId,
        name,
        type,
        pushToken: pushToken || null,
        pairCode,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      };
      await store.registerDevice(device);
      return res.json({ deviceId, pairCode });
    }

    if (req.method === 'GET' && (op === 'devices' || req.url === '/api/devices')) {
      const devices = await store.getUserDevices(userId);
      return res.json(devices.map(d => ({
        deviceId: d.deviceId,
        name: d.name,
        type: d.type,
        lastSeen: d.lastSeen
      })));
    }

    if (req.method === 'DELETE' && req.url.startsWith('/api/devices/')) {
      const deviceId = req.url.split('/api/devices/')[1];
      const device = await store.getDevice(deviceId);
      if (!device || device.userId !== userId) {
        return res.status(404).json({ error: 'Device not found' });
      }
      await store.deleteDevice(deviceId, userId);
      return res.json({ ok: true });
    }

    // POST /api/devices/pair - pair a phone with a desktop using pairCode
    if (req.method === 'POST' && op === 'pair') {
      const { deviceId, pairCode } = req.body;
      if (!deviceId || !pairCode) {
        return res.status(400).json({ error: 'deviceId and pairCode required' });
      }

      const device = await store.getDevice(deviceId);
      if (!device) {
        return res.status(404).json({ error: 'Device not found' });
      }
      if (device.pairCode !== pairCode.toUpperCase()) {
        return res.status(401).json({ error: 'Invalid pair code' });
      }
      if (device.type !== 'desktop') {
        return res.status(400).json({ error: 'Can only pair with desktop devices' });
      }

      // Generate a new token for the phone
      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await store.saveToken(tokenHash, device.userId, expiresAt);

      const user = await store.getUserById(device.userId);
      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[devices] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};