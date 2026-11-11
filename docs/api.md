# API Reference

The backend is a single-purpose Express service: it accepts contact-form
submissions and relays them as email through [Resend](https://resend.com).
There is no database, no authentication and no user state.

- **Local base URL:** `http://localhost:5000`
- **Production base URL:** `https://portfolio-backend-kmum.onrender.com`
- **Content type:** `application/json` for request bodies and for every
  response except the answers to `OPTIONS` requests (see [CORS](#cors))
- **Authentication:** none. Abuse is controlled by CORS, rate limiting, a body
  cap and a honeypot rather than by credentials.

A ready-to-run Postman collection covering every endpoint and every error path
lives in [`postman/`](../postman/README.md).

---

## Conventions

Every response is JSON, apart from the answers to `OPTIONS` preflights. Success
and failure use distinct shapes:

```jsonc
// success
{ "success": true, "message": "Message sent successfully." }

// failure
{ "success": false, "error": "Invalid email address." }
```

The health endpoints predate that convention and return `{ "status": "ok", … }`
instead, so uptime monitors can match on a single field.

In production (`NODE_ENV=production`) the `error` string on a `500` is always
the generic `"Internal server error."`. Outside production it carries the real
message to make local debugging possible. Stack traces are never returned. A
body the parser refuses gets a fixed message of its own (`400`, `413` or `415`,
below) in every environment, never the parser's error.

---

## Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/` | Root probe |
| `GET` | `/health` | Health check with server time |
| `POST` | `/api/contact` | Submit the contact form |

Anything else falls through to a catch-all `404`, except most `OPTIONS`
requests, which the CORS middleware answers first (see [CORS](#cors)).

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

The site's contact form also sends this endpoint one `no-cors` request when a
visitor first focuses a field. The free-tier instance sleeps when idle, and
waking it then means the cold start is mostly over by the time they press send.
That is why `/health` stays cheap and outside the rate limiter.

### `POST /api/contact`

Validates a submission and sends it as an email to the site owner, with the
sender's address set as `Reply-To`.

**Request body**

| Field | Type | Required | Max length | Notes |
|-------|------|----------|------------|-------|
| `name` | string | yes | 100 | Shown as the sender in the email |
| `email` | string | yes | 100 | Must match `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`; becomes the `Reply-To` |
| `subject` | string | yes | 200 | Control characters flattened to spaces before use as a mail header |
| `message` | string | yes | 5000 | Rendered into both the HTML and plain-text parts |
| `website` | string | no | - | Honeypot. See below. Real clients leave it empty |

Every required field is trimmed before validation, the length cap applies to
the trimmed value, and the trimmed value is what gets sent. A field that is
missing, not a string, or empty after trimming is treated the same way: `400`
naming the first field that failed. Unknown fields are ignored.
A body sent with a `Content-Type` other than JSON is not parsed at all, so it
fails validation as if it were empty.

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
{ "success": true, "message": "Message sent successfully." }
```

The body is byte-for-byte the same whether the message was sent or caught by
the honeypot. Resend's message ID is logged server-side (`[contact] sent id=…`)
rather than returned, because an ID that only a real send could carry would
tell a bot which of its submissions the trap caught.

**Error responses**

| Status | When | `error` |
|--------|------|---------|
| `400` | Body is not valid JSON | `Malformed JSON body.` |
| `400` | Missing or empty required field | `Missing required field: <name>.` |
| `400` | Field over its length cap | `Field "<name>" is too long.` |
| `400` | Malformed email | `Invalid email address.` |
| `413` | Request body over 16 KB | `Payload too large.` |
| `415` | A body in a charset or content encoding the parser does not support | `Unsupported request body.` |
| `429` | More than 5 requests from one IP in 15 minutes | `Too many requests. Please try again later.` |
| `502` | Resend rejected the send, or could not be reached | `Email delivery failed.` |
| `503` | `RESEND_API_KEY`, `EMAIL_FROM` or `EMAIL_TO` unset on the server | `Email service is not configured.` |
| `500` | Anything unhandled | `Internal server error.` |

The `400` for malformed JSON, the `413` and the `415` come from `express.json`,
ahead of the rate limiter, so they cost no quota. Validation stops at the first
failure, so a request with two problems reports only one: presence and length
are checked field by field (`name`, `email`, `subject`, `message`), then the
email pattern.

#### Honeypot behaviour

The form carries a hidden `website` field. The check runs **after** validation,
so the trap changes nothing in the response:

- A valid submission that fills it is dropped without sending, and answers with
  exactly the `200` a real send produces.
- An invalid submission that fills it gets the same `400` it would get without
  the field.

A bot that could distinguish rejection from success would simply retry without
the field, so the response deliberately gives nothing away. Only the timing
differs: a trapped submission answers at once, while a real one waits for
Resend. Matching that with a delay would hold a request open to defeat a bot
patient enough to time its replies, which a portfolio's contact form does not
attract.

Two consequences worth knowing when testing:

- A tripped submission still **consumes rate-limit quota**, because the check
  runs inside the router, after the limiter.
- A trip is logged server-side with the submitter's validated name and email,
  so a false positive (a password manager filling the trap) can be recovered by
  hand.

### Catch-all `404`

Any unmatched path or method returns:

```json
{ "success": false, "error": "Not found." }
```

`/api/contact` registers only `POST`, so `GET /api/contact` lands here rather
than returning `405`. `OPTIONS` mostly does not: the CORS middleware answers
it first, as described [below](#cors).

---

## Rate limiting

`POST /api/contact` allows **5 requests per IP per 15-minute window**. Replies
carry the IETF draft-6 headers - `RateLimit-Policy`, `RateLimit-Limit`,
`RateLimit-Remaining`, `RateLimit-Reset` - and the legacy `X-RateLimit-*` set
is disabled. A `429` adds `Retry-After`, in seconds.

The client IP comes from the first proxy hop (`trust proxy` is set to `1`),
which is what Render forwards in `X-Forwarded-For`. Hops beyond the first are
not trusted, so a client cannot spoof its way into a fresh quota. IPv6 clients
are keyed by their `/56` subnet rather than the full address, the default in
`express-rate-limit` 8, since one subscriber is usually handed a whole block and
could otherwise rotate through it for fresh quota.

Every `POST` that reaches the router counts, whatever happens to it next:
a validation failure, a tripped honeypot and a real send all spend quota.
Requests the body parser rejects (over the 16 KB cap, malformed JSON, or an
unsupported charset or encoding) never reach the limiter: `express.json` is
registered before the router, so they cost no quota.

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
code. It replaces the defaults rather than adding to them, so list every origin
that should keep working; setting only a new domain locks out the live site.
Only `GET`, `POST` and `OPTIONS` are advertised, only `Content-Type` is an
accepted request header, and `Access-Control-Max-Age: 86400` lets a browser
cache a preflight for up to 24 hours (Chromium caps it at two).

**A disallowed origin is not rejected with an error status.** The middleware
simply omits the `Access-Control-Allow-Origin` header, and the browser blocks
the response on the client side. That is deliberate: throwing inside the origin
callback would surface as a `500` and leak the existence of the allow-list.
Non-browser clients (curl, Postman) send no `Origin` header and are unaffected,
which is why the Postman collection works against production unchanged.

The form posts JSON, so a browser sends an `OPTIONS` preflight before each
submission. Those answers are not JSON:

| `OPTIONS` from | Answered by | Response |
|----------------|-------------|----------|
| An allowed origin, or no `Origin` | The CORS middleware, on any path | `204`, empty body, with the CORS headers |
| A disallowed origin, to `/api/contact` | Express's automatic `OPTIONS` reply | `200`, `Allow: POST`, a plain-text body, no `Access-Control-Allow-Origin` |
| A disallowed origin, to any other path | The catch-all | The JSON `404` |

In every case a disallowed origin gets no `Access-Control-Allow-Origin`, so the
browser never sends the `POST`. Preflights pass no rate limiter.

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
