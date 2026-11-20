# Security Controls

What is implemented in the code and the platform configuration.

For **reporting a vulnerability**, see [`SECURITY.md`](../SECURITY.md) at the
repository root. That document is the disclosure policy; this one is the
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
| Body parsing errors | Malformed JSON (`400`), an unsupported charset or encoding (`415`) and the cap (`413`) get fixed messages, also before the limiter. They are logged by type only, because the parser's error carries the raw request body, which holds the sender's name, address and message |
| Rate limiting | `express-rate-limit`: 5 requests per IP per 15 minutes, IPv6 clients keyed by `/56` subnet, standard `RateLimit-*` headers, legacy headers off |
| Client IP resolution | `trust proxy` set to the number of proxies in front of the app (`TRUST_PROXY_HOPS`, default `3`, for Render). The IP is the entry those proxies wrote, never one from a client-supplied header chain. The number cannot be checked from the code, so [Deployment](deployment.md#checking-the-rate-limiters-key) has a check against the live API; with `1`, the value before the audit of 2026-11-20, and with `2`, the limiter keyed on a proxy and all visitors shared its counters |
| Input validation | Required-field, length (name 100, email 100, subject 200, message 5000) and email-pattern checks, all after trimming. An address holding a control character or an unpaired surrogate is refused as well: the pattern alone admits both |
| Honeypot | A hidden `website` field, checked after validation. A filled trap on a valid body is dropped without sending and answered with exactly the `200` a real send returns; on an invalid body it changes nothing |
| Method surface | Only `POST` is registered. Every other method falls through to the catch-all `404`, apart from `OPTIONS`: CORS answers a preflight from an allowed origin (or with no `Origin`) with `204`, and for a disallowed origin Express answers `OPTIONS /api/contact` itself with `200` and `Allow: POST`. See [API reference](api.md) |

### Why the honeypot answers `200`

Rejecting a tripped submission with an error would teach a bot that the field
is a trap, and it would retry without it. Returning the ordinary success
response leaves nothing to learn from. The two `200`s are byte-identical: the
response carries no provider message ID, which only a real send could have.
Because the check runs after validation, an invalid submission gets the same
`400` with or without the field, so that path gives nothing away either. Only
response time differs, since a real send waits for Resend; a delay to match it
was left out as not worth holding requests open for.

A trip is **logged with the submitter's name and email**, after validation (so
at most 100 characters each) and formatted with `%j` so a crafted value
containing newlines cannot forge extra log lines. That logging is deliberate: a
false positive (a password manager or browser autofill filling the trap) would
otherwise lose a real message silently, and the sender, having seen a success
message, would have no reason to try the published email address instead.

---

## Email handling

| Control | Implementation |
|---------|----------------|
| HTML escaping | Every user-supplied value is escaped (`&`, `<`, `>`, `"`, `'`) before being interpolated into the HTML email |
| Header-injection guard | Control characters, including CR and LF, are replaced with spaces in header-bound fields (`subject`, `Reply-To`) and whitespace is collapsed, so a crafted value cannot inject additional mail headers |
| Plain-text part | Name, email and subject are flattened the same way there, so a newline in one cannot forge an extra `Email:` or `Subject:` line. The message keeps its own line breaks |
| `mailto:` links | The submitter's address is URL-encoded (keeping `@`) before it is HTML-escaped into the two `mailto:` links. The email pattern admits `?`, `&` and `=`, which would otherwise let an address add a `bcc` or replace the subject in the owner's reply draft |
| Well-formed text | An unpaired surrogate in the name, subject or message is replaced with U+FFFD before anything is rendered. `encodeURIComponent`, which builds the reply link, throws on one, and that used to turn a crafted subject into a `500` |
| Provider timeout | A send is abandoned after 10 seconds (`RESEND_TIMEOUT_MS`) and answered with `502`. The SDK sets no limit and Node's `fetch` waits five minutes, so a stalled provider would otherwise hold every submission open |
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
headers: `Content-Security-Policy` (`default-src 'self'` plus Helmet's other
defaults), `Strict-Transport-Security: max-age=31536000; includeSubDomains`,
`X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`,
`Referrer-Policy: no-referrer`, `X-DNS-Prefetch-Control: off`.

### Site (Cloudflare `_headers`)

A separate and stricter set applies to the site itself: `X-Frame-Options: DENY`,
`X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, a
`Permissions-Policy` denying camera, microphone and geolocation,
`Strict-Transport-Security: max-age=31536000; includeSubDomains`, and a
`default-src 'self'` CSP with `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, `frame-ancestors 'none'`, `font-src 'self'` and
`upgrade-insecure-requests`. Cloudflare reads them from
`frontend/public/_headers`, which travels with the build, and after every
deploy `frontend/scripts/verify-deploy.mjs` fetches one URL per rule in that
file and fails the run if the host did not send them.

The one inline script (the analytics snippet) is pinned by SHA-256 hash rather
than allowed wholesale, and the repository invariants fail if the hash goes
stale. `script-src` also lists `'unsafe-inline'`, but only as a fallback for
browsers too old to support hashes: one that supports them ignores
`'unsafe-inline'` whenever a hash is present. `style-src` does allow
`'unsafe-inline'`, because two of the lazy libraries add `<style>` elements at
runtime and the prerendered HTML carries a `style` attribute for the reveal
stagger; the reasons for that and for `img-src data:` are in
[Deployment](deployment.md#security-headers-and-csp). The exact hash and the
procedure for recomputing it are in
[Deployment](deployment.md#the-inline-analytics-hash).

The contact form carries `method="post"`, so a submit in the moment before
hydration, which the browser handles itself, does not put the message in the
address bar, server logs or analytics as a `GET` query would.

### CORS

A browser-origin allow-list, which `ALLOWED_ORIGINS` replaces rather than
extends. Only `GET`, `POST` and `OPTIONS` are advertised and only
`Content-Type` is an accepted request header. The backend tests assert both
sides: an allowed origin gets the header, a disallowed one does not.

A disallowed origin does not receive an error status. The middleware omits the
`Access-Control-Allow-Origin` header and the browser blocks the response.
Throwing inside the origin callback would surface as a `500` and advertise that
an allow-list exists, so the callback returns `false` instead. CORS is a
browser control, not an authentication mechanism: non-browser clients send no
`Origin` header and are unaffected, which is why the rate limit, the body cap
and the honeypot are the controls that actually bound abuse.

---

## Error handling and information disclosure

- A centralized error handler logs an unexpected error in full server-side and
  returns a generic message. Stack traces are never sent to a client. A body
  the parser rejected is the exception, logged by type only (see
  [Contact endpoint](#contact-endpoint)).
- In production, `500` responses always read `Internal server error.`. Outside
  production the real message is included to make local debugging possible,
  which is why the server must run with `NODE_ENV=production`. On Render that
  is a variable in the dashboard since 2026-11-20; before, it rested on the
  platform's default for a Node service.
- Mailer failures are mapped to specific codes (`503` unconfigured, `502`
  delivery rejected, the provider unreachable or silent for 10 seconds) rather than surfacing provider
  errors verbatim.
- Resend's message ID is logged, not returned, so a response says nothing about
  the provider.
- Configuration that would fail silently is reported once at boot, so it is
  visible in the deploy log rather than only at the first submission: missing
  mail settings, an `ALLOWED_ORIGINS` entry no browser could send (a trailing
  slash, a path, an upper-case host, a wildcard), and a proxy count or timeout
  that is not a usable number.
  `backend/.env.example` leaves the three mail variables empty for the same
  reason: any non-empty value counts as configured, so a copied placeholder would
  have turned that warning and the `503` into a `502` from a failed send.

---

## Repository and supply chain

| Control | Implementation |
|---------|----------------|
| Secret scanning | `gitleaks` runs in CI on every push to `main` and every pull request against it, over the full git history rather than the tip commit. GitHub's secret scanning is on as well, with push protection, which refuses a push containing a recognized credential before it lands |
| Code scanning | GitHub's CodeQL default setup analyzes the JavaScript and the workflow files on every push to `main`, every pull request against it, and weekly |
| Dependency alerts | Dependabot alerts and security updates are on, so an advisory gets its own pull request outside the weekly schedule when a patched version fits the dependents' ranges, transitive dependencies included. When none does, the fix is an npm `overrides` entry (see [Development](development.md#dependencies)) |
| Dependency audit | `npm audit --omit=dev --audit-level=high` on both projects; CI fails on a high or critical production advisory |
| Dependency updates | Dependabot opens grouped weekly PRs (npm minor and patch; GitHub Actions including majors), each release at least seven days old. The cooldown does not delay security updates |
| Pinned actions | Every GitHub Action is pinned to a full commit SHA, which cannot be moved to other code the way a tag can. Wrangler, which the deploy workflow installs on demand, is pinned to an exact version |
| Least-privilege CI | `permissions: contents: read` at workflow level in CI, the deploy workflow and the link check. `refresh-activity.yml` alone asks for `contents: write`, to commit its snapshot. Every checkout that does not push sets `persist-credentials: false` |
| Deploy credentials | The frontend is published with `CLOUDFLARE_API_TOKEN`, a repository secret scoped to Workers on one account. The account ID is a repository variable, being an identifier rather than a credential, and the repository invariants keep it out of `frontend/wrangler.jsonc`. The deploy job runs only on a push to `main` once every CI job has passed, after the weekly snapshot commit, or by hand: a pull request is checked but never published. Each deploy is recorded under a GitHub environment named `production` |
| Third-party data | The weekly snapshot job reads a community API for contribution counts, validates every day in the response before writing it, and commits the result as data. Visitors' browsers never call that API |
| Secret hygiene | `.env` files are gitignored while `.env.example` templates are tracked; keys, certificates and keystores are ignored by extension |
| Runtime pinning | One Node major, pinned in `.nvmrc` and read from there by every workflow, the deploy included; the repository invariants fail on a workflow that hardcodes a version. `engine-strict=true` refuses a mismatched local install through `npm run install:all`; installs inside `frontend/` or `backend/`, and so CI, the deploy workflow and Render, only warn |

Private vulnerability reporting is on too, and is the route
[`SECURITY.md`](../SECURITY.md) prefers. GitHub's secret scanning, code
scanning, Dependabot alerts and security updates, and private reporting are
repository settings rather than tracked files, so a fork does not inherit them.

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
