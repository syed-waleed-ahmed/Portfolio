# Security Controls

What is implemented in the code and the platform configuration.

For **reporting a vulnerability**, see [`SECURITY.md`](../SECURITY.md) at the
repository root - that document is the disclosure policy; this one is the
inventory.

The threat model is narrow. There is no database, no authentication, no user
accounts and no stored data. The realistic risks are: abuse of the contact
endpoint (spam, floods), injection through the one field set that reaches an
email template, and leaking credentials or internals through responses, logs
or the repository.

---

## Contact endpoint

| Control | Implementation |
|---------|----------------|
| Body-size cap | `express.json({ limit: "16kb" })`, registered before the router so an oversized payload is rejected with `413` without consuming rate-limit quota |
| Rate limiting | `express-rate-limit`: 5 requests per IP per 15 minutes, standard `RateLimit-*` headers, legacy headers off |
| Client IP resolution | `trust proxy` set to `1`. The IP is read from the platform proxy hop only, never blindly from a client-supplied header chain |
| Input validation | Required-field, length (name 100, email 100, subject 200, message 5000) and email-pattern checks, all after trimming |
| Honeypot | A hidden `website` field. A filled trap is dropped without sending and answered with the same `200` a real send returns |
| Method surface | Only `POST` is registered. Everything else falls through to the catch-all `404` |

### Why the honeypot answers `200`

Rejecting a tripped submission with an error would teach a bot that the field
is a trap, and it would retry without it. Returning the ordinary success
response leaves nothing to learn from. The only observable difference is the
absent `id`, which requires a configured mailer to notice.

A trip is **logged with the submitter's name and email**, truncated to 100
characters and formatted with `%j` so a crafted value containing newlines
cannot forge extra log lines. That logging is deliberate: a false positive - a
password manager or browser autofill filling the trap - would otherwise lose a
real message silently, and with no email address published in the UI the form
is the only way to reach the site owner.

---

## Email handling

| Control | Implementation |
|---------|----------------|
| HTML escaping | Every user-supplied value is escaped (`&`, `<`, `>`, `"`, `'`) before being interpolated into the HTML email |
| Header-injection guard | Control characters, including CR and LF, are stripped from header-bound fields (`subject`, `Reply-To`) and whitespace is collapsed, so a crafted value cannot inject additional mail headers |
| Subject truncation | Sanitized subjects are capped at 200 characters before being sent |
| Reply-To | Set to the submitter's address; `From` is always the verified sender the server owns, never user input |
| Credential isolation | The Resend key exists only in the backend environment. It is never sent to the client and never appears in a response |

Both an HTML and a plain-text part are rendered. The text part improves
deliverability and renders in clients with HTML disabled.

---

## Transport and browser controls

### API (Helmet, on Render)

`helmet()` with `crossOriginResourcePolicy` relaxed to `cross-origin`, since
the API is consumed by a browser on a different origin. Notable resulting
headers: `Content-Security-Policy: default-src 'self'`,
`Strict-Transport-Security: max-age=31536000; includeSubDomains`,
`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, `X-DNS-Prefetch-Control: off`.

### Site (Netlify `_headers`)

A separate and stricter set applies to the site itself: `X-Frame-Options: DENY`,
`Referrer-Policy: strict-origin-when-cross-origin`, a
`Permissions-Policy` denying camera, microphone and geolocation, and a
`default-src 'self'` CSP with `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, `frame-ancestors 'none'` and `upgrade-insecure-requests`.

The one inline script (the analytics snippet) is pinned by SHA-256 hash rather
than allowed wholesale. The exact value and the procedure for recomputing it
are in [Deployment](deployment.md#the-inline-analytics-hash).

### CORS

A browser-origin allow-list, overridable with `ALLOWED_ORIGINS`. Only `GET`,
`POST` and `OPTIONS` are advertised and only `Content-Type` is an accepted
request header.

A disallowed origin does not receive an error status. The middleware omits the
`Access-Control-Allow-Origin` header and the browser blocks the response.
Throwing inside the origin callback would surface as a `500` and advertise that
an allow-list exists, so the callback returns `false` instead. CORS is a
browser control, not an authentication mechanism: non-browser clients send no
`Origin` header and are unaffected, which is why the rate limit, the body cap
and the honeypot are the controls that actually bound abuse.

---

## Error handling and information disclosure

- A centralized error handler logs the full error server-side and returns a
  generic message. Stack traces are never sent to a client.
- In production, `500` responses always read `Internal server error.`. Outside
  production the real message is included to make local debugging possible,
  which is why `NODE_ENV=production` must be set on Render.
- Mailer failures are mapped to specific codes (`503` unconfigured, `502`
  delivery rejected) rather than surfacing provider errors verbatim.
- Missing mail configuration is reported once at boot, so a misconfiguration
  is visible in the deploy log rather than only at the first submission.

---

## Repository and supply chain

| Control | Implementation |
|---------|----------------|
| Secret scanning | `gitleaks` runs in CI on every push and PR, over the full git history rather than the tip commit |
| Dependency audit | `npm audit --omit=dev --audit-level=high` on both workspaces; CI fails on a high or critical production advisory |
| Dependency updates | Dependabot opens grouped weekly PRs (npm minor and patch; GitHub Actions including majors) |
| Least-privilege CI | `permissions: contents: read` at workflow level |
| Secret hygiene | `.env` files are gitignored while `.env.example` templates are tracked; keys, certificates and keystores are ignored by extension |
| Runtime pinning | One Node version across local, CI and Netlify, with `engine-strict=true` refusing a mismatched install |

---

## Deliberate non-goals

Listed so they are visible decisions rather than oversights:

- **No CAPTCHA.** The honeypot plus the rate limit have been sufficient, and a
  CAPTCHA would add a third-party script to a page whose CSP currently permits
  exactly one.
- **No authentication.** There is nothing to protect behind one.
- **No WAF or bot-management layer.** Out of proportion to a personal site.
- **The rate limiter is in-memory.** It resets on restart and does not
  coordinate across instances. Correct for a single free-tier instance;
  it would need a shared store if the backend ever scaled horizontally.

---

## Related documents

- [`SECURITY.md`](../SECURITY.md) - reporting a vulnerability, scope, safe harbour
- [API reference](api.md) - status codes and response shapes
- [Deployment](deployment.md#security-headers-and-csp) - CSP and header configuration
- [Architecture](architecture.md#contact-form-request-flow) - where each control sits in the stack
