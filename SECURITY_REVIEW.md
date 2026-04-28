# Security Review

Date: 2026-04-28
Scope: Full codebase (client React app, Supabase edge functions, auth flow, build/deploy config)

## Result

No security findings to report.

## Areas Reviewed

- **Client React app** (`src/pages`, `src/components`, `src/hooks`, `src/lib`, `src/utils`, `src/data`, `index.html`, `vite.config.js`)
- **Edge functions** (`supabase/functions/delete-account`)
- **Auth flow** (magic-link login, `useAuth`, login callback handling)
- **Privileged boundary** (client → edge function invocation, service role usage)

## Findings Considered and Filtered

Two potential XSS sinks via unvalidated `href` attributes were identified and analyzed:

1. `src/components/ApplicationDetailModal.jsx:145` — `application.url` rendered as `<a href={url}>` without scheme validation.
2. `src/components/ApplicationDetailModal.jsx:269` — interview `meeting_link` rendered as `<a href={meeting_link}>` without scheme validation.

Both filtered as **false positives**: the only attack path is self-XSS. Data is per-user and RLS-isolated, with no cross-user rendering, sharing, or admin view. A user would have to paste an attacker-supplied `javascript:` URL into their own form and later click it themselves. Per the review rules, subtle low-impact web vulnerabilities require extremely high confidence, and pure self-XSS does not clear a concrete MEDIUM bar.

**Note (defense-in-depth, not a vulnerability):** Validating URL schemes (`http:`/`https:` allowlist) at save time in `useApplications` or at render time via a `safeHref()` helper would be a reasonable hardening measure.

## Items Confirmed Safe

- `delete-account` edge function verifies the caller via `supabaseAdmin.auth.getClaims(token)` and uses `claims.sub` for the user ID — does not trust client-supplied `user_id`.
- Service role key is read from `Deno.env`; only the anon key reaches the client (intentionally public).
- CORS uses `Access-Control-Allow-Origin: *` without `Allow-Credentials: true` — standard pattern for bearer-token edge functions.
- Magic-link `emailRedirectTo` uses `window.location.origin`; Supabase enforces a server-side allow-list of redirect URLs.
- `LoginPage` hash error parsing reads only against a static lookup; rendered as escaped JSX text.
- No `dangerouslySetInnerHTML`, `eval`, `Function`, unsafe `postMessage`, or unsafe `data:` HTML usage in scope.
- No raw SQL or service-role logging found.
