# Testing

Two layers, with no overlap between them:

| Layer | Tool | Scope | Where it runs |
|-------|------|-------|---------------|
| Automated | `node --test` | Backend routing, validation, limits | Locally and in CI on every push and PR |
| Manual / live | Postman | The same surface against a running server, local or production | On demand |

The frontend has no test suite. Its gate is ESLint plus a production build in
CI, and the build failing is what catches a broken import or a bad JSX change.
See [Gaps](#gaps) below.

---

## Automated tests

```bash
npm test              # from the repository root
npm test --prefix backend   # equivalent
```

Nine tests in `backend/test/contact.test.js`, using Node's built-in runner with
no extra dependencies. They import the Express app directly and bind an
ephemeral port, which is why they never collide with a dev server on 5000.

| Test | Asserts |
|------|---------|
| `GET /health` | `200` and `status: "ok"` |
| `GET /` | `200` and `status: "ok"` |
| Missing fields | `400`, `success: false`, error mentions the missing field |
| Invalid email | `400`, error mentions the email |
| Over-length field | `400` on a 101-character name against the 100 cap |
| Body over 16 KB | `413`, `Payload too large.`, and **no** `RateLimit-Remaining` header, proving the cap runs before the limiter |
| Honeypot filled | `200` with `success: true`, and nothing sent |
| Honeypot empty | `400`, proving an empty trap does not short-circuit validation |
| Unknown route | `404` with `success: false` |

Two properties of this suite are deliberate:

- **Importing `server.js` is itself a test.** A broken or missing import
  anywhere in `config/` or `services/` fails the whole suite, so CI catches a
  module-level mistake even in code no test exercises directly.
- **No email is ever sent.** Every path stops before the mailer, so the suite
  passes identically with or without Resend credentials in the environment.

The rate limiter is not covered automatically: exhausting a 15-minute window
would make the suite slow and order-dependent. It is covered in Postman instead.

---

## Postman collection

`postman/` holds a collection and two environments that exercise every endpoint
and every error path, including the ones the automated suite skips.

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Requests and test scripts for the whole API |
| `Portfolio-API.postman_environment.json` | `baseUrl` for local development |
| `Portfolio-API.postman_environment.production.json` | `baseUrl` for the live Render backend |

Every request carries a `pm.test()` script asserting status code and response
shape, so the collection can be run unattended in the Collection Runner.

Import both JSON files, select **Portfolio API - Local**, start the backend,
and run. Full instructions, including importing straight from GitHub without
cloning, are in [`postman/README.md`](../postman/README.md).

### Verifying the rate limiter

Open the Runner, select **Rate limit triggered**, set iterations to 6 or more,
and run. The first five calls pass through; the sixth returns `429` with
`RateLimit-*` headers. The limiter is in-memory, so restarting the backend
clears the counter.

### Running against production

Select the **Portfolio API - Production** environment. Nothing else changes;
`baseUrl` is the only environment-specific value.

> Only the **happy path** sends a real email. Validation, payload-too-large,
> honeypot, rate-limit and 404 requests all stop before the mailer and are safe
> to run against production.

The backend is on Render's free tier, so the first request after idle may take
30 to 60 seconds to cold-start. Re-run if it times out.

---

## What CI runs

| Job | Command |
|-----|---------|
| Frontend | `npm run lint`, then `npm run build` with `NODE_ENV=production` |
| Frontend | `npm audit --omit=dev --audit-level=high` |
| Backend | `npm test` |
| Backend | `npm audit --omit=dev --audit-level=high` |
| Secret scan | `gitleaks` over full git history |

The audit gate covers **production** dependencies at high severity and above.
Dev-dependency and low-severity findings are reviewed rather than blocking a
build.

---

## Before opening a pull request

```bash
npm run lint     # frontend changes
npm run build    # frontend changes
npm test         # backend changes
```

If the change touches the API surface, update the Postman collection in the
same PR and confirm it still imports cleanly. The PR template has a checklist
covering this.

---

## Gaps

Known and accepted, listed here so nobody has to rediscover them:

- **No frontend unit or component tests.** The site is presentational and
  data-driven; lint plus a production build catch the failure modes that
  actually occur. A component test suite would be the first thing to add if the
  frontend grew stateful logic.
- **No end-to-end browser test.** The contact form is verified by hand and
  through Postman against the deployed API.
- **The mailer is never exercised automatically.** Sending real email from CI
  would need a live Resend key in the environment. Delivery is verified by
  running the Postman happy path against a configured backend.
- **CORS rejection is not asserted by either suite**, because neither client
  sends an `Origin` header the way a browser does.

---

## Related documents

- [API reference](api.md) - the contract these tests assert
- [Development](development.md#troubleshooting) - failures you may hit locally
- [`postman/README.md`](../postman/README.md) - collection usage in detail
