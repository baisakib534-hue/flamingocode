# FlamingoCode Website — Vercel Deployment Guide

## Quick Start

1. Push this repo to GitHub (already at `baisakib534-hue/flamingocode`)
2. Import project in Vercel
3. Set **Root Directory** to `website/`
4. Add environment variables (below)
5. Deploy

---

## Vercel Dashboard Steps

### 1. Import Project
- Go to https://vercel.com/new
- Select `baisakib534-hue/flamingocode`
- Click **Import**

### 2. Configure Project
- **Framework Preset**: Other
- **Root Directory**: `website/` ⚠️ **CRITICAL**
- **Build Command**: (leave empty — static site)
- **Output Directory**: (leave empty)
- **Install Command**: (leave empty)

### 3. Environment Variables
Add these in **Settings → Environment Variables** (all environments: Production, Preview, Development):

| Name | Value | Description |
|------|-------|-------------|
| `KV_REST_API_URL` | `https://your-kv-url.vercel-storage.com` | From Vercel KV dashboard |
| `KV_REST_API_TOKEN` | `your-kv-token` | From Vercel KV dashboard |

### 4. Deploy
- Click **Deploy**
- Wait for build to complete
- Visit the deployed URL

---

## Vercel KV Setup

1. In Vercel dashboard, go to **Storage → Create Database → KV**
2. Select region (closest to you)
3. Copy **KV_REST_API_URL** and **KV_REST_API_TOKEN**
4. Add as environment variables

**Free tier limits**: 30,000 commands/month, 256 MB storage — sufficient for device registry + task envelopes.

---

## Local Development

```bash
cd website
# Serve static files
npx serve .
# Or Python
python3 -m http.server 3000
```

For API functions locally, use Vercel CLI:
```bash
npm i -g vercel
vercel dev
```
This runs functions at `http://localhost:3000/api/...` with env vars from `.env.local`.

---

## Project Structure

```
website/
├── index.html          # Landing page
├── download.html       # Download page
├── docs.html           # Documentation
├── account.html        # Account home (email/password signin + dashboard)
├── style.css           # Shared styles
├── app.js              # Shared app logic
├── account.js          # Account page logic
├── vercel.json         # Vercel config
├── api/
│   ├── index.js        # SINGLE API entrypoint (see note below)
│   ├── _handlers/
│   │   ├── auth.js         # Email/password auth + token validation
│   │   ├── devices.js      # Device registry + QR pairing
│   │   ├── tasks.js        # Task relay (send, poll, result)
│   │   └── recordings.js   # Recording links
│   └── _lib/
│       └── store.js    # Storage interface (KV + memory fallback)
├── assets/
│   └── flamingocode-logo.png
└── DEPLOY.md           # This file
```

> **Why one entrypoint:** Vercel runs each file under `api/` as a separate
> serverless function with its own process and memory. When auth/devices/
> tasks were separate functions, a token saved by the login function was
> invisible to the devices function — every `/api/devices` call returned
> "Invalid or expired token". Routing all of `/api/*` through `api/index.js`
> gives every handler one shared store module instance. `vercel.json`
> rewrites map `/api/:handler/:op` → `/api/index?handler=:handler&op=:op`.

---

## Authentication

- **Email + password only** — no OAuth, no third-party login
- Passwords hashed with SHA-256 + per-user salt (16 bytes)
- API tokens: 32-byte hex, shown once on login/signup, stored SHA-256 hashed
- Token expiry: 30 days
- Endpoints:
  - `POST /api/auth/signup` — `{email, password, name}` → `{token, user}`
  - `POST /api/auth/login` — `{email, password}` → `{token, user}`
  - `GET /api/auth/me` — `Authorization: Bearer <token>` → `{user}`

---

## Security Notes

- Passwords hashed (SHA-256 + salt), never stored plain
- Tokens stored hashed (SHA-256) in KV/memory
- 30-day token expiry
- Rate limiting on register (20/min) and task send (50/min)
- CORS: `*` with required Bearer token on all endpoints
- No raw API keys stored — keys travel in encrypted envelopes only
- No analytics, no trackers

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| "KV not configured" | Add KV env vars, or functions use memory fallback (dev only) |
| CORS errors | All endpoints allow `*` origin; ensure `Authorization: Bearer ***` header is sent |
| 401 on valid token | Token expired (30 days) — re-signin. If it happens right after login, check that all routes go through api/index.js (separate functions = separate memory) |
| Long-poll timeout | Vercel max 30s; poll uses 24s max |

---

## Verification Checklist

After deploy, verify:
- [ ] Landing page loads with logo, features, CTAs
- [ ] Download page shows "Coming Soon" honestly (no fake links)
- [ ] Docs page renders all sections
- [ ] Account page shows email/password signup/login forms
- [ ] Sign up works → dashboard shows API token + paired devices (empty initially)
- [ ] Sign in works → dashboard shows API token + paired devices
- [ ] API endpoints respond: `POST /api/auth/signup`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/devices/register`, etc.
- [ ] No console errors on any page