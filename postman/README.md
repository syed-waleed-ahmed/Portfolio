# Portfolio API - Postman Collection

Postman assets for testing the backend in [`../backend`](../backend).

## Files

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Requests + test scripts for every backend endpoint |
| `Portfolio-API.postman_environment.json` | `baseUrl` for local dev (`http://localhost:5000`) |
| `Portfolio-API.postman_environment.production.json` | `baseUrl` for the live backend on Render |

## Test the live API (no clone needed)

You can import straight from GitHub - in Postman, **Import → Link** and paste
each raw URL, then pick the **Production** environment:

- Collection:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_collection.json`
- Production environment:
  `https://raw.githubusercontent.com/syed-waleed-ahmed/Portfolio/main/postman/Portfolio-API.postman_environment.production.json`

The production environment targets `https://portfolio-backend-kmum.onrender.com`.
The backend is on Render's free tier, so the first request after idle may take
~30–60 s to cold-start - re-run if it times out.

> **Want a one-click "Run in Postman" button?** Open the collection in your own
> Postman account → **Share → Via API / Public link**, then paste the generated
> `https://run.pstmn.io/button.svg` snippet into the README. That step has to be
> done from your account because the button embeds your hosted collection ID.

## Endpoints covered

- `GET /` - root health probe
- `GET /health` - health check with timestamp
- `POST /api/contact` - contact form (validation, honeypot, rate limit, Resend email)
- Negative cases: 404 catch-all, wrong HTTP method, invalid payloads, and the
  16 KB body cap

## Usage

1. Open Postman → **Import** → drop both JSON files in.
2. Select the **Portfolio API - Local** environment in the top-right dropdown.
3. Start the backend locally:
   ```bash
   cd ../backend
   npm install
   cp .env.example .env   # fill in Resend keys if you want to test the email path
   npm start
   ```
4. Run requests individually, or hit **Run collection** in the Collection Runner.

## Switching to production

Select the **Portfolio API - Production** environment (imported from
`Portfolio-API.postman_environment.production.json`) instead of **Local** - it
already points `baseUrl` at the Render URL. The collection has no other
environment-specific values.

> Note: only the **happy path** sends a **real email** via Resend. Every other
> request is safe against prod - validation, 404, rate-limit, "payload too
> large" and "honeypot tripped" all stop before the mailer.

## Notes

- The contact endpoint is rate-limited (5 requests / 15 min / IP). The **"Rate limit triggered"** request is designed to be run 6+ times in the Runner to verify the 429 path.
- **"Field too long"** and **"Payload too large"** are different paths, despite the similar names. The first sends a 101-char name against the 100-char cap and gets a **400** from route validation. The second sends a ~20 KB body against `express.json({ limit: "16kb" })` and gets a **413** from the body parser - which is registered before the router, so it rejects ahead of the rate limiter and costs no quota.
- **"Honeypot tripped"** fills the hidden `website` field and expects a **200** that looks exactly like a real send - that's deliberate, so a bot can't detect the trap and retry without the field. The tell that nothing was sent is the missing `id`. Unlike the 413, this check lives *inside* the router, so it **does** consume rate-limit quota.
- Happy-path POST returns **200** when the email sends. If the mailer is unconfigured (missing `RESEND_API_KEY` / `EMAIL_FROM` / `EMAIL_TO`) it returns **503**; if Resend accepts the request but rejects the send it returns **502**. The test script accepts all three.
- All tests use Postman's built-in `pm.test()` / Chai assertions - no external runner needed.
