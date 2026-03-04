# AUTH_STAGING_POLICY

## Scope
This policy defines how authentication must work on HayatiBank staging and production hosts.

## Trust Zones
- First-party auth zone: `*.hayatibank.ru`
- Technical hosting zone: `*.web.app`, `*.firebaseapp.com`

These are different origins and must be treated as different security contexts.

## Production Rule
- All auth-critical flows (session mutation, login/logout, `/api/me` cookie restore) are first-party only: `*.hayatibank.ru`.

## Staging Rule (`web.app` / `firebaseapp.com`)
- Do not rely on first-party cookie session (`__session`) as source of truth.
- `/api/me` cookie restore is disabled/skipped for non-`*.hayatibank.ru` hosts.
- Use staging for UI/UX and non-auth-critical checks.
- If auth-like behavior is needed on staging, use explicit bearer-token flow only.

## CORS / Credentials
- `Access-Control-Allow-Origin` must be explicit allowlist only.
- `Access-Control-Allow-Credentials: true` is required only where credentialed session endpoints are expected.
- Never assume `web.app` origin can fully emulate first-party cookie behavior.

## Engineering Do/Don't
Do:
- Test real auth behavior on `*.hayatibank.ru`.
- Keep staging deterministic (no magic cookie fallbacks).

Don't:
- Build auth-critical logic around `web.app` cookie behavior.
- Treat preview channels as auth-sovereign environments.

## Quick Verification Checklist
1. On `*.hayatibank.ru`: `/api/me` works with server session cookie.
2. On `*.web.app`: no noisy `/api/me` restore retries.
3. Console has no repeated auth loops caused by cross-origin cookie assumptions.

## Related Guideline
- `HAYATIBANK_ENGINEERING_GUIDELINES.md`
