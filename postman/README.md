# Portfolio API — Postman Collection

Postman assets for testing the backend in [`../backend`](../backend).

## Files

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Requests + test scripts for every backend endpoint |
| `Portfolio-API.postman_environment.json` | `baseUrl` variable (defaults to `http://localhost:5000`) |

## Endpoints covered

- `GET /` — root health probe
- `GET /health` — health check with timestamp
- `POST /api/contact` — contact form (validation, rate limit, Resend email)
- Negative cases: 404 catch-all, wrong HTTP method, invalid payloads

## Usage

1. Open Postman → **Import** → drop both JSON files in.
2. Select the **Portfolio API — Local** environment in the top-right dropdown.
3. Start the backend locally:
   ```bash
   cd ../backend
   npm install
   cp .env.example .env   # fill in Resend keys if you want to test the email path
   npm start
   ```
4. Run requests individually, or hit **Run collection** in the Collection Runner.

## Switching to production

Edit the `baseUrl` variable to point at your deployed backend (e.g. the Render URL). The collection has no other environment-specific values.

## Notes

- The contact endpoint is rate-limited (5 requests / 15 min / IP). The **"Rate limit triggered"** request is designed to be run 6+ times in the Runner to verify the 429 path.
- Happy-path POST returns **200** when Resend env vars (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) are configured on the server; otherwise it returns **503**. The test script accepts either.
- All tests use Postman's built-in `pm.test()` / Chai assertions — no external runner needed.
