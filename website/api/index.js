/**
 * Single API entrypoint.
 *
 * WHY: Vercel deploys every file under api/ as a SEPARATE serverless
 * function, each with its own Node.js process and its own in-memory store.
 * With one function per route file, a token created by the login route lived
 * only in that function's memory, so the devices route with the same token
 * ALWAYS returned "Invalid or expired token" — the relay could never work.
 *
 * Routing every /api/* request through this one function gives all handlers
 * a single shared store module instance (same memory) per function instance.
 * (For bulletproof multi-instance persistence the project still wants
 * Vercel KV — see DEPLOY.md. This fixes the deterministic failure.)
 */
const handlers = {
  auth: require('./_handlers/auth.js'),
  devices: require('./_handlers/devices.js'),
  tasks: require('./_handlers/tasks.js'),
  recordings: require('./_handlers/recordings.js')
};

function corsHeaders(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = async (req, res) => {
  const name = req.query && req.query.handler;
  const handler = handlers[name];
  if (!handler) {
    res.setHeader('Content-Type', 'application/json');
    corsHeaders(res);
    if (req.method === 'OPTIONS') return res.status(204).end();
    return res.status(404).json({ error: 'Not found' });
  }
  // Rebuild the canonical path the sub-handler expects: its opOf() reads
  // req.query.op first, then falls back to the last URL path segment.
  // Other query params (deviceId, taskId, …) pass through untouched.
  const op = req.query.op;
  req.url = op ? `/api/${name}/${op}` : `/api/${name}`;
  return handler(req, res);
};
