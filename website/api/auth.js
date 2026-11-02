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

function hashPassword(salt, password) {
  return crypto.createHash('sha256').update(salt + password).digest('hex');
}

function generateSalt() {
  return crypto.randomBytes(16).toString('hex');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  Object.entries(corsHeaders()).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') return res.status(204).end();

  try {
    // POST /api/auth/signup
    if (req.method === 'POST' && req.url === '/api/auth/signup') {
      const { email, password, name } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: 'Email, password, and name are required' });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }
      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      const existing = await store.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(salt, password);
      const userId = `user_${crypto.randomBytes(12).toString('hex')}`;
      const user = {
        id: userId,
        email,
        name,
        passwordHash,
        salt,
        createdAt: new Date().toISOString()
      };
      await store.createUser(user);

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await store.saveToken(tokenHash, userId, expiresAt);

      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }

    // POST /api/auth/login
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = await store.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const passwordHash = hashPassword(user.salt, password);
      if (passwordHash !== user.passwordHash) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
      await store.saveToken(tokenHash, user.id, expiresAt);

      return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    }

    // GET /api/auth/me
    if (req.method === 'GET' && req.url === '/api/auth/me') {
      const token = verifyAuth(req);
      if (!token) return res.status(401).json({ error: 'Missing token' });
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
      const record = await store.getToken(tokenHash);
      if (!record) return res.status(401).json({ error: 'Invalid or expired token' });
      const user = await store.getUserById(record.userId);
      if (!user) return res.status(401).json({ error: 'User not found' });
      return res.json({ user: { id: user.id, email: user.email, name: user.name } });
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (err) {
    console.error('[auth] Error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};