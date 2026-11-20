# Architecture review

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). Line numbers
refer to commit `f07475f`.

## What the system is

One stateless HTTP process with one job: accept a contact-form submission,
check it, and hand it to an email provider. It has no database, no
authentication, no sessions, no queue, no scheduler, no worker, no webhook and
no file storage. That was verified, not taken from the README: the six
production dependencies are `express`, `cors`, `helmet`, `express-rate-limit`,
`resend` and `dotenv`, none is a storage or queue client, and no source file
opens a socket, file or timer of its own beyond the HTTP listener and the
shutdown timer.

```text
Visitor's browser
  |
  |  1. GET /health (no-cors, once, when the form is first focused: wakes the instance)
  |  2. OPTIONS /api/contact (CORS preflight)
  |  3. POST /api/contact (JSON)
  v
Cloudflare  ->  Render load balancer  ->  node server.js   (one free-tier instance)
                                              |
                                              |  helmet -> cors -> express.json(16kb)
                                              |  -> rate limit (in memory) -> validate -> honeypot
                                              |  -> mailerService: repair, escape, render
                                              v
                                          Resend HTTP API  ->  the owner's inbox
```

The only state is the rate limiter's in-memory counters, which a restart or an
idle spin-down clears, and the lines the process writes to the platform's log.

## Modules

| Module | Lines | Responsibility | Depends on |
|--------|-------|----------------|------------|
| `config/env.js` | 50 | The only reader of `process.env`; one frozen `config`; boot warnings | `dotenv` |
| `routes/contactRoutes.js` | 101 | Rate limit, validation, honeypot, mapping mailer errors to statuses | `express`, `express-rate-limit`, the mailer |
| `services/mailerService.js` | 169 | Escaping, header flattening, both email templates, the Resend call, two typed errors | `resend`, `config` |
| `server.js` | 132 | Middleware order, health routes, 404, central error handler, start and shutdown | everything above |

The dependency graph is a straight line with no cycle: `server` imports
`routes` and `config`, `routes` imports `services`, `services` imports
`config`. Graphify was available and was not used: four modules can be read
whole, and were.

## What was found sound

Each of these was tested or traced, and the evidence is in the document named.

- **The boundaries hold.** A search for `process.env` finds it only in
  `config/env.js`. The route never touches the Resend SDK, and the mailer never
  touches `req` or `res`. The two typed errors are the whole interface between
  them (`mailerService.js:42-57`, `contactRoutes.js:88-97`).
- **Middleware order is deliberate and does what the documents say.** A 60 KB
  body, malformed JSON and a 5 MB gzip bomb were each refused by the parser
  with no `RateLimit-*` header, so none reached the limiter.
  ([TESTING_AUDIT.md](TESTING_AUDIT.md#probe-results))
- **The error boundary keeps provider detail out of responses.** A `403` from
  the provider, an HTML `502`, a thrown `fetch` and a non-JSON `200` all became
  the same fixed `502` body.
- **The app is importable without listening** (`server.js:120-132`), which is
  what makes the test suite and this audit's probes possible without a port or
  a mock framework.
- **Nothing is over-built.** No dependency injection container, no repository
  layer, no abstraction over the provider beyond one function. For one
  provider and one endpoint that is the right amount.

## Weaknesses

| Finding | Where |
|---------|-------|
| The process cannot know who its client is: that depends on a proxy count that lived in code as a literal and was wrong (F-01) | [SECURITY_AUDIT.md](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors) |
| The one outbound call had no time limit (F-02) | [RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md#f-02-a-send-has-no-time-limit) |
| Infrastructure settings live in a dashboard, not the repository: auto-deploy mode, environment variables, health check path, Node version (F-03, F-09) | [RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md#f-03-render-deploys-the-backend-whether-or-not-ci-passed) |
| The send is a single attempt with no record of the message (F-14) | [RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md#the-send-path-as-a-delivery-pipeline) |

## Coupling between the two projects

The frontend and the backend deploy separately and share no code, so four
things are written twice: the field names and caps, the email pattern, the
honeypot's name, and the API origin. `test/invariants.test.js` compares all
four and fails on a mismatch, which was confirmed by reading it
(`test/invariants.test.js:362-371`).

Two couplings had no such check:

- **The body cap and the field caps.** `express.json({ limit: "16kb" })` is in
  `server.js:40` and the caps are in `contactRoutes.js:13-18`. The largest
  valid submission in a three-byte script is 16,061 bytes, 323 under the cap.
  A test now pins it (F-08).
- **The deploy order.** The backend goes live from the push itself, the
  frontend only after CI. A change to the request contract is therefore live
  on one side for a few minutes before the other. With one client and one
  repository the answer is to make contract changes backward compatible, not
  to add versioning. Recorded, not changed.

## Recommendations

Essential: none beyond the findings above. The architecture does not need
changing.

Worth doing:

- Add a `render.yaml` Blueprint, so the service's root directory, build and
  start commands, health check path, auto-deploy trigger and the names of its
  environment variables are reviewed and versioned like everything else. Its
  absence is why F-03 and F-09 could not be settled from the repository.

Not recommended:

- A queue, outbox or retry worker for the send. At the volume a portfolio
  sees, a visitor who is told the send failed and shown an email address is a
  better outcome than infrastructure that has to be kept alive.
- TypeScript. See [CODE_QUALITY_AUDIT.md](CODE_QUALITY_AUDIT.md#typing).
