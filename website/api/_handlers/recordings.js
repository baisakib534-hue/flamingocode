const store = require('../_lib/store');
const crypto = require('crypto');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
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

    // Vercel rewrite: /api/recordings/:op -> /api/recordings?op=:op
    // req.url may arrive as the original nested path or the rewritten base path;
    // accept either form so routing works regardless.
    const op = (() => {
      if (req.query && req.query.op) return String(req.query.op);
      const seg = (req.url || '').split('?')[0].split('/').filter(Boolean).pop();
      return seg || '';
    })();

    if (req.method === 'POST' && op === 'register') {
      const { url, expiresIn = 3600 } = req.body;
      if (!url) return res.status(400).json({ error: 'url required' });

      const id = `rec_${crypto.randomBytes(12).toString('hex')}`;
      const expiresAt = Date.now() + expiresIn * 1000;
      const recording = { id, userId, url, expiresAt, createdAt: new Date().toISOString() };
      await store.saveRecording(recording);
      return res.json({ id });
    }

    // GET /api/recordings/<id> — op is the recording id in either URL form
    if (req.method === 'GET' && op && op !== 'recordings' && op !== 'register') {
      const recording = await store.getRecording(op);
      if (!recording || recording.userId !== userId) {
        return res.status(404).json({ error: 'Recording not found' });
      }
      return res.json({ url: recording.url, expiresAt: recording.expiresAt });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[recordings] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};