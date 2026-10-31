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

    const rateLimit = store.checkRateLimit(`devices:${userId}`, 20, 60000);
    if (!rateLimit.allowed) {
      return res.status(429).json({ error: 'Rate limited', retryAfter: rateLimit.retryAfter });
    }

    if (req.method === 'POST' && req.url === '/api/devices/register') {
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

    if (req.method === 'GET' && req.url === '/api/devices') {
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

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[devices] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};