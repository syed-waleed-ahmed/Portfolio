# Portfolio API - Postman Collection

API tests for the backend in [`../backend`](../backend). Fourteen requests
across four folders, each asserting status code and response shape with
`pm.test()`, so the whole thing can be run unattended in the Collection Runner.

The API contract itself is documented in [`../docs/api.md`](../docs/api.md).

## Files

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Requests and test scripts for every endpoint |
| `Portfolio-API.postman_environment.json` | `baseUrl` for local development (`http://localhost:5000`) |
| `Portfolio-API.postman_environment.production.json` | `baseUrl` for the live backend on Render |

`{{baseUrl}}` is the only variable. The collection carries a local default, so
it still runs if you forget to select an environment.

## Quick start

1. In Postman, **Import** and drop in the collection plus one environment file.
2. Select **Portfolio API - Local** from the environment dropdown.
3. Start the backend:
   ```bash
   cd ../backend
   npm install
   cp .env.example .env    # fill in Resend values only if you want to test delivery
   npm start
   ```
4. Run requests individually, or hit **Run collection** in the Runner.

Without Resend credentials the backend still serves every route; the valid
submission returns `503` instead of sending, which the test accepts.

## Testing the live API without cloning

In Postman, choose **Import → Link** and paste each raw URL:

- Collection:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_collection.json`
- Production environment:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_environment.production.json`

Then select **Portfolio API - Production**. `baseUrl` is the only value that
differs between environments, so nothing else needs changing.

> **Only `POST /api/contact - Valid submission` sends a real email.** Every
> other request stops before the mailer: validation, the body cap, the
> honeypot, the rate limiter, the CORS preflights and the 404s are all safe to
> run against production.

The backend is on Render's free tier and sleeps after inactivity, so the first
request can take 30 to 60 seconds to cold-start. Re-run if it times out.

## Coverage

| Folder | Request | Expects |
|--------|---------|---------|
| Health | `GET /` - Root probe | `200` with running status |
| Health | `GET /health` - Health check | `200` with an ISO timestamp |
| Contact | Valid submission | `200`, or `503`/`502` when the mailer is unavailable |
| Contact | Missing required field | `400` naming the field |
| Contact | Invalid email | `400` |
| Contact | Field over its length cap | `400` from route validation |
| Contact | Empty body | `400` |
| Contact | Body over the 16 KB cap | `413` from the body parser, no quota consumed |
| Contact | Honeypot tripped | `200` with no `id`, nothing sent |
| Contact | Rate limit (run 6+ times) | `429` once the window is exhausted |
| CORS | Preflight from an allowed origin | `204` echoing the origin |
| CORS | Preflight from a disallowed origin | No `Access-Control-Allow-Origin`, no `5xx` |
| Negative | `GET /api/unknown` | `404` catch-all |
| Negative | `GET /api/contact` | `404`, since only `POST` is registered |

The primary requests carry saved response examples, so the expected payload is
visible in Postman without sending anything.

## Notes

**Running the whole collection exhausts the rate limit, on purpose.** The
endpoint allows 5 requests per IP per 15 minutes and six Contact requests
consume quota, so the last ones receive a `429`. Their tests report that as
**skipped** rather than failed, since the limiter has its own dedicated request.
Restart the backend to clear the in-memory counter and get a full pass again.

**Verifying the limiter deliberately.** Open the Runner, select
*Rate limit (run 6+ times)*, set Iterations to 6 or more, and run. The sixth
call returns `429` with `RateLimit-*` headers.

**"Field over its length cap" and "Body over the 16 KB cap" are different
paths.** The first sends a 101-character name against the 100-character cap and
gets a `400` from route validation. The second sends a roughly 20 KB body
against `express.json({ limit: "16kb" })` and gets a `413` from the body parser,
which is registered before the router and therefore rejects ahead of the rate
limiter. Its test asserts exactly that by checking no `RateLimit-Remaining`
header came back.

**The honeypot returns a `200` that looks like a real send.** That is
deliberate, so a bot cannot detect the trap and retry without the field. The
only tell is the missing `id`. Unlike the `413`, this check lives inside the
router, so it *does* consume rate-limit quota.

**The CORS requests set an `Origin` header explicitly**, which Postman
otherwise omits. That is also why the rest of the collection is unaffected by
the allow-list: CORS is a browser control, and a client that sends no `Origin`
is never subject to it.

**Assertions use Postman's built-in `pm.test()` and Chai**, so no external
runner is required. The collection is also verified with
[newman](https://github.com/postmanlabs/newman):

```bash
npx newman run Portfolio-API.postman_collection.json \
  -e Portfolio-API.postman_environment.json
```

## Keeping it current

The collection is part of the API contract. If you change an endpoint, payload
or status code, update the matching request, its test script and its saved
example in the same pull request, and confirm the file still imports without
errors. The PR template has a checklist item for it.
