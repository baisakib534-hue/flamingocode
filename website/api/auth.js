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

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    if (req.method === 'GET' && req.url === '/api/auth/config') {
      return res.json({ clientId: process.env.GOOGLE_CLIENT_ID || null });
    }

    if (req.method === 'POST' && req.url === '/api/auth/google') {
      const { credential } = req.body;
      if (!credential) return res.status(400).json({ error: 'Missing credential' });

      const { OAuth2Client } = require('google-auth-library');
      const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
      const ticket = await client.verifyIdToken({ idToken: credential, audience: process.env.GOOGLE_CLIENT_ID });
      const payload = ticket.getPayload();

      const email = payload.email;
      const name = payload.name;
      const picture = payload.picture;
      const sub = payload.sub;

      let user = await store.getUserByEmail(email);
      if (!user) {
        user = {
          id: `user_${crypto.randomBytes(12).toString('hex')}`,
          email,
          name,
          picture,
          googleSub: sub,
          createdAt: new Date().toISOString()
        };
        await store.createUser(user);
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await store.saveToken(tokenHash, user.id, expiresAt);

      return res.json({ token, user: { id: user.id, email: user.email, name: user.name, picture: user.picture } });
    }

    if (req.method === 'GET' && req.url === '/api/auth/validate') {
      const token = verifyAuth(req);
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const record = await store.getToken(tokenHash);
      if (!record) return res.status(401).json({ error: 'Invalid or expired token' });
      return res.json({ valid: true });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[auth] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};