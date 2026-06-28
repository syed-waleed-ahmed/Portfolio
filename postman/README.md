# Portfolio API — Postman Collection

Postman assets for testing the backend in [`../backend`](../backend).

## Files

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Requests + test scripts for every backend endpoint |
| `Portfolio-API.postman_environment.json` | `baseUrl` for local dev (`http://localhost:5000`) |
| `Portfolio-API.postman_environment.production.json` | `baseUrl` for the live backend on Render |

## Test the live API (no clone needed)

You can import straight from GitHub — in Postman, **Import → Link** and paste
each raw URL, then pick the **Production** environment:

- Collection:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_collection.json`
- Production environment:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_environment.production.json`

The production environment targets `https://portfolio-backend-kmum.onrender.com`.
The backend is on Render's free tier, so the first request after idle may take
~30–60 s to cold-start — re-run if it times out.

> **Want a one-click "Run in Postman" button?** Open the collection in your own
> Postman account → **Share → Via API / Public link**, then paste the generated
> `https://run.pstmn.io/button.svg` snippet into the README. That step has to be
> done from your account because the button embeds your hosted collection ID.

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

Select the **Portfolio API — Production** environment (imported from
`Portfolio-API.postman_environment.production.json`) instead of **Local** — it
already points `baseUrl` at the Render URL. The collection has no other
environment-specific values.

> Note: hitting the live contact endpoint sends a **real email** via Resend.
> Use the validation/404/rate-limit requests for safe smoke tests against prod.

## Notes

- The contact endpoint is rate-limited (5 requests / 15 min / IP). The **"Rate limit triggered"** request is designed to be run 6+ times in the Runner to verify the 429 path.
- Happy-path POST returns **200** when Resend env vars (`RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO`) are configured on the server; otherwise it returns **503**. The test script accepts either.
- All tests use Postman's built-in `pm.test()` / Chai assertions — no external runner needed.
