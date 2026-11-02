# Account + QR Pairing Spec — No Google Login Anywhere

## Decision (his, 2026-11-02)
- **NO Google Sign-In, NO OAuth anywhere** — website, desktop, phone.
- **Simple email+password accounts** on the Vercel website.
- After account creation/login, the website gives an **API token**.
- **Desktop**: login with email+password (or paste API token). After login, "Pair Phone" button shows a QR code.
- **Phone**: TWO ways to connect — (a) login with email+password directly, OR (b) scan the desktop's QR code (quick path, no typing).
- QR contains a short-lived pairing token derived from the user's API token.

## Website (`website/`)
### Account system (`website/api/auth.js`, `website/account.html`)
- **REMOVE all Google OAuth code.** Delete `/api/auth/config` and `/api/auth/google` endpoints. Remove `OAuth2Client` usage.
- **New endpoints:**
  - `POST /api/auth/signup` — body: `{email, password}`. Validate email format, password min 8 chars. Hash password with SHA-256 + salt (use `crypto`). Store user in the existing `store` (check `website/api/_lib/store.js` for the pattern). Return `{ok: true}` or error.
  - `POST /api/auth/login` — body: `{email, password}`. Verify hash. If OK, generate API token (32-byte hex), store SHA-256 hash with user ID and 30-day expiry (same pattern as the old Google flow's `saveToken`). Return `{token: <plain token>, user: {email, name}}`. The plain token is shown ONCE.
  - `GET /api/auth/me` — header `Authorization: Bearer <token>`. Return user info if token valid.
- **Password hashing:** `SHA256(salt + password)`, salt = 16-byte hex per user, stored alongside.
- **`/account` page (`website/account.html`):**
  - REMOVE the Google Sign-In button and the "not configured" error.
  - Show: Signup form (email + password + name) and Login form (email + password). Tab or toggle between them.
  - After login/signup: show "Your API token" with the token value, a "Copy" button, and instructions:
    - "Desktop app-এ login করো এই email+password দিয়ে, অথবা API token paste করো।"
    - "Phone app-এ QR scan করো অথবা email+password দিয়ে login করো।"
  - (Bengali + English.)

### Docs
- `website/DEPLOY.md`: REMOVE the `GOOGLE_CLIENT_ID` requirement. Document the new email+password auth.

## Desktop (Electron + TypeScript)
- **Login screen/section:** Email + password fields, "Login" button. Also "Or paste API token" field as alternative.
- On login: `POST https://flamingocode-eta.vercel.app/api/auth/login` with credentials. Store the returned API token securely (use Electron `safeStorage` if available, else localStorage — check existing code).
- **After login:** Show "Pair Phone" button. Clicking it:
  - Generates a short-lived pairing token: `POST /api/devices/register` with `Authorization: Bearer <api_token>` → gets `deviceId` + `pairCode` (check `website/api/devices/register.js` — it may need the user ID from the token).
  - Displays QR code containing JSON: `{"v":1,"relay":"https://flamingocode-eta.vercel.app","deviceId":"...","pairCode":"...","exp":<5min>}`.
  - Use the `qrcode` npm package (add to `desktop/package.json` if missing).
  - "Refresh" and "Close" buttons.
- **NO Google code.** Remove any Google OAuth stubs.

## Phone (Flutter/Dart)
- **DELETE the Google Sign-In stub** in `mobile/lib/ui/screens/login_screen.dart`.
- **New login screen with TWO tabs/options:**
  1. **"Scan QR" (default):** Camera QR scanner (use `mobile_scanner` package, add to `pubspec.yaml`). On scan: parse JSON, validate `v==1` and `exp`, connect to relay with `deviceId` + `pairCode`. Show "Connected ✅" or error with "Scan again".
  2. **"Login":** Email + password fields. On submit: `POST /api/auth/login`, store token (use `flutter_secure_storage` if available, else shared preferences — check existing code), connect.
- **NO `google_sign_in` package.** Remove the dependency if present.
- The app must work WITHOUT any prior sign-in — QR scan is the fastest path.

## Relay API (`website/api/`)
- `POST /api/devices/register`: Must accept `Authorization: Bearer <api_token>` (user token, not just device token). Link the device to the user ID. Check current implementation — it may need updating to extract user from token.
- All existing device/task endpoints keep working with Bearer tokens.

## Constraints
- **NO Google, NO OAuth, NO third-party login anywhere.**
- **Passwords: hashed, never plain.** Tokens: SHA-256 hashed server-side, plain shown once.
- **Small-request discipline.**
- **No regressions** — full test suite green.
- Test file: `test-account-qr.cjs` (NO-JSDOM, `process.exit(0)`) proving:
  - Signup validates email/password, hashes password (not plain).
  - Login verifies hash, returns token.
  - Token auth works on `/api/auth/me`.
  - QR payload format and expiry validation.
  - No Google/OAuth references remain in changed files.

## Files to check first
- `website/api/_lib/store.js` — user/token storage pattern.
- `website/api/devices/register.js` — pair code generation, add user linking.
- `website/account.html` — current Google UI to replace.
- `mobile/lib/ui/screens/login_screen.dart` — stub to replace.
- `desktop/src/renderer/` — where to add login + Pair Phone UI.
