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
| `GOOGLE_CLIENT_ID` | `your-google-oauth-client-id.apps.googleusercontent.com` | From Google Cloud Console → APIs & Services → Credentials |
| `KV_REST_API_URL` | `https://your-kv-url.vercel-storage.com` | From Vercel KV dashboard |
| `KV_REST_API_TOKEN` | `your-kv-token` | From Vercel KV dashboard |

### 4. Deploy
- Click **Deploy**
- Wait for build to complete
- Visit the deployed URL

---

## Google OAuth Setup

1. Go to https://console.cloud.google.com/
2. Create a project or select existing
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `https://your-vercel-app.vercel.app`
   - `http://localhost:3000` (for local testing)
6. Authorized redirect URIs: (not needed for GIS)
7. Copy **Client ID** → set as `GOOGLE_CLIENT_ID` in Vercel

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
├── account.html        # Account home (signin + dashboard)
├── style.css           # Shared styles
├── app.js              # Shared app logic
├── account.js          # Account page logic
├── vercel.json         # Vercel config
├── api/
│   ├── auth.js         # Google OAuth + token validation
│   ├── devices.js      # Device registry
│   ├── tasks.js        # Task relay (send, poll, result)
│   ├── recordings.js   # Recording links
│   └── _lib/
│       └── store.js    # Storage interface (KV + memory fallback)
├── assets/
│   └── flamingocode-logo.png
└── DEPLOY.md           # This file
```

---

## Security Notes

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
| "GOOGLE_CLIENT_ID not configured" | Add env var in Vercel, redeploy |
| "KV not configured" | Add KV env vars, or functions use memory fallback (dev only) |
| CORS errors | All endpoints allow `*` origin; ensure `Authorization: Bearer <token>` header is sent |
| 401 on valid token | Token expired (30 days) or KV unavailable — re-signin |
| Long-poll timeout | Vercel max 30s; poll uses 24s max |

---

## Verification Checklist

After deploy, verify:
- [ ] Landing page loads with logo, features, CTAs
- [ ] Download page shows "Coming Soon" honestly (no fake links)
- [ ] Docs page renders all sections
- [ ] Account page shows Google Sign-In button (if configured) or honest "not configured" state
- [ ] Sign in works → dashboard shows paired devices (empty initially)
- [ ] API endpoints respond: `GET /api/auth/config`, `POST /api/devices/register`, etc.
- [ ] No console errors on any page