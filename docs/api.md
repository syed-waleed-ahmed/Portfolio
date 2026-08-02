# API Reference

The backend is a single-purpose Express service: it accepts contact-form
submissions and relays them as email through [Resend](https://resend.com).
There is no database, no authentication and no user state.

- **Local base URL:** `http://localhost:5000`
- **Production base URL:** `https://portfolio-backend-kmum.onrender.com`
- **Content type:** `application/json` on every request and response
- **Authentication:** none. Abuse is controlled by CORS, rate limiting, a body
  cap and a honeypot rather than by credentials.

A ready-to-run Postman collection covering every endpoint and every error path
lives in [`postman/`](../postman/README.md).

---

## Conventions

Every response is JSON. Success and failure use distinct shapes:

```jsonc
// success
{ "success": true, "message": "Message sent successfully.", "id": "…" }

// failure
{ "success": false, "error": "Invalid email address." }
```

The health endpoints predate that convention and return `{ "status": "ok", … }`
instead, so uptime monitors can match on a single field.

In production (`NODE_ENV=production`) the `error` string on a `500` is always
the generic `"Internal server error."`. Outside production it carries the real
message to make local debugging possible. Stack traces are never returned.

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Root probe |
| `GET` | `/health` | Health check with server time |
| `POST` | `/api/contact` | Submit the contact form |

Anything else falls through to a catch-all `404`.

### `GET /`

Liveness probe. Takes no parameters.

**200**

```json
{ "status": "ok", "message": "Portfolio backend is running" }
```

### `GET /health`

Same probe with a timestamp, for uptime monitors that want to detect a frozen
process rather than just an open socket.

**200**

```json
{ "status": "ok", "time": "2026-08-02T07:36:48.512Z" }
```

`time` is an ISO 8601 UTC string generated per request.

### `POST /api/contact`

Validates a submission and sends it as an email to the site owner, with the
sender's address set as `Reply-To`.

**Request body**

| Field | Type | Required | Max length | Notes |
|-------|------|----------|------------|-------|
| `name` | string | yes | 100 | Trimmed before validation |
| `email` | string | yes | 100 | Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` |
| `subject` | string | yes | 200 | Control characters stripped before use as a mail header |
| `message` | string | yes | 5000 | Rendered into both the HTML and plain-text parts |
| `website` | string | no | - | Honeypot. See below. Real clients leave it empty |

A field that is missing, not a string, or empty after trimming is treated the
same way: `400` naming the first field that failed. Unknown fields are ignored.

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
        "name": "Jane Doe",
        "email": "jane@example.com",
        "subject": "AI Engineer role at Acme",
        "message": "Hi Waleed, I came across your portfolio..."
      }'
```

**200** - accepted and sent

```json
{ "success": true, "message": "Message sent successfully.", "id": "8f1b…" }
```

`id` is Resend's message ID. It is **absent** when the submission tripped the
honeypot, which is the only way to tell the two `200`s apart.

**Error responses**

| Status | When | `error` |
|--------|------|---------|
| `400` | Missing or empty required field | `Missing required field: <name>.` |
| `400` | Field over its length cap | `Field "<name>" is too long.` |
| `400` | Malformed email | `Invalid email address.` |
| `413` | Request body over 16 KB | `Payload too large.` |
| `429` | More than 5 requests from one IP in 15 minutes | `Too many requests. Please try again later.` |
| `502` | Resend accepted the call but rejected the send | `Email delivery failed.` |
| `503` | `RESEND_API_KEY`, `EMAIL_FROM` or `EMAIL_TO` unset on the server | `Email service is not configured.` |
| `500` | Anything unhandled | `Internal server error.` |

Validation stops at the first failure, so a request with two problems reports
only one.

#### Honeypot behaviour

The form carries a hidden `website` field. A submission that fills it is
dropped without sending, but answers with the same `200` and the same message
a real send produces. A bot that could distinguish rejection from success would
simply retry without the field, so the response deliberately gives nothing away.

Two consequences worth knowing when testing:

- A tripped submission still **consumes rate-limit quota**, because the check
  runs inside the router, after the limiter.
- A trip is logged server-side with the submitter's name and email, so a false
  positive (a password manager filling the trap) can be recovered by hand.

### Catch-all `404`

Any unmatched path or method returns:

```json
{ "success": false, "error": "Not found." }
```

`/api/contact` registers only `POST`, so `GET /api/contact` lands here rather
than returning `405`.

---

## Rate limiting

`POST /api/contact` allows **5 requests per IP per 15-minute window**. Replies
carry the standard draft headers - `RateLimit-Limit`, `RateLimit-Remaining`,
`RateLimit-Reset` - and the legacy `X-RateLimit-*` set is disabled.

The client IP comes from the first proxy hop (`trust proxy` is set to `1`),
which is what Render forwards in `X-Forwarded-For`. Hops beyond the first are
not trusted, so a client cannot spoof its way into a fresh quota.

Requests rejected by the 16 KB body cap never reach the limiter: `express.json`
is registered before the router, so an oversized payload costs no quota. The
honeypot check is inside the router and therefore does.

---

## CORS

Browser origins are allow-listed. The defaults are:

```text
http://localhost:5173
https://syedwaleedahmed.netlify.app
https://syedwaleedahmed.me
https://www.syedwaleedahmed.me
```

Set `ALLOWED_ORIGINS` (comma-separated) to replace that list without editing
code. Only `GET`, `POST` and `OPTIONS` are advertised, only `Content-Type` is
an accepted request header, and preflights are cached for 24 hours.

**A disallowed origin is not rejected with an error status.** The middleware
simply omits the `Access-Control-Allow-Origin` header, and the browser blocks
the response on the client side. That is deliberate: throwing inside the origin
callback would surface as a `500` and leak the existence of the allow-list.
Non-browser clients (curl, Postman) send no `Origin` header and are unaffected,
which is why the Postman collection works against production unchanged.

---

## Security headers

Every response passes through [Helmet](https://helmetjs.github.io/) with
`crossOriginResourcePolicy` relaxed to `cross-origin`, since the API is
consumed by a browser on a different origin. The notable headers:

| Header | Value |
|--------|-------|
| `Content-Security-Policy` | `default-src 'self'` plus Helmet's defaults |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `Cross-Origin-Resource-Policy` | `cross-origin` |

These are the API's own headers. The site served by Netlify has a separate,
stricter set - see [Deployment](deployment.md#security-headers-and-csp).

---

## Related documents

- [Architecture](architecture.md#contact-form-request-flow) - how a submission
  moves through the middleware stack
- [Security](security.md) - the controls behind these responses
- [Testing](testing.md) - automated tests and the Postman collection
- [`postman/README.md`](../postman/README.md) - importing and running the
  collection
