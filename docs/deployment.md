# Deployment

The site and its contact API are one Cloudflare Worker with static assets,
configured in `frontend/wrangler.jsonc` and published by
`.github/workflows/deploy.yml`. There is no other host.

## How a change reaches the site

1. A pull request runs CI (`ci.yml`): lint, type check, unit and Worker
   tests, repository invariants, a build, size budgets and `npm audit` in one
   job; the browser suite in a second; gitleaks over the full history in a
   third. Nothing is published from a pull request.
2. A push to `main` runs the same jobs, and once all three pass, calls
   `deploy.yml`, which builds again behind the prebuild gate and runs
   `wrangler deploy`. Cloudflare switches to the new version only when the
   upload has finished, so a cancelled run leaves the previous one live.
3. `scripts/verify-deploy.mjs` then checks the live origin: it serves this
   build's entry script, applies every rule in `_headers`, answers every page
   in the sitemap, answers unknown paths with the 404 page and a 404,
   redirects HTTP and `www` to the apex, and reports the Worker healthy with
   its mail secrets set. Any failure fails the run.

`deploy.yml` can also be run by hand (`workflow_dispatch`) to republish `main`.
That path skips CI but not the prebuild gate.

Between deploys, `health.yml` reads `/api/health` once a day and fails, which
emails the owner, if the Worker is down or its mail secrets are missing. A
weekly `links.yml` checks every link in the content and the docs.

## One-time setup: the Worker's secrets

The contact API needs three values. They are Worker secrets, so they survive
deploys and never appear in the repository. From `frontend/`, with Wrangler
signed in to the account that owns the site:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put EMAIL_FROM     # Portfolio contact form <contact@syedwaleedahmed.me>
npx wrangler secret put EMAIL_TO       # the inbox that receives messages
```

The same can be done in the dashboard under the Worker's Settings, Variables
and Secrets. Until they are set, `/api/health` reports `"mailer": "missing"`,
the form answers 503 and offers the email address, and the deploy
verification fails, which is the intended signal.

The sender's domain is verified in Resend (region Ireland). That rests on
four records in the Cloudflare zone, all DNS only: the DKIM key
`resend._domainkey` (TXT), `send` and `rsend` (CNAMEs to Resend's servers),
and `_dmarc` (TXT, `v=DMARC1; p=none;`, which only monitors). Removing any of
them stops delivery, and nothing in this repository would notice; Resend's
Domains page shows the status. The domain has no MX record, because nothing
receives mail there.

The first deploy with the Worker also creates the `ContactLimiter` Durable
Object class (the `v1` migration in `wrangler.jsonc`). SQLite-backed Durable
Objects are available on the free Workers plan.

## Credentials in GitHub

| Name | Kind | Use |
|---|---|---|
| `CLOUDFLARE_API_TOKEN` | Repository secret | Scoped to Workers on one account; used only by `deploy.yml` |
| `CLOUDFLARE_ACCOUNT_ID` | Repository variable | An identifier, kept out of `wrangler.jsonc` so the file is safe to publish |

The `production` environment accepts deployments from `main` only.

## Domain

`syedwaleedahmed.me` is registered at Spaceship until 2027-12-22, with
auto-renew on; the registrar only names Cloudflare's nameservers. Nothing here
watches the expiry, so check it each December. The zone is on Cloudflare's
free plan, in the same account as the Worker.

The routes in `wrangler.jsonc` attach the apex and `www` to the Worker, and
Cloudflare creates their DNS records and certificates. Two zone settings act
before the Worker and are not in the repository; `verify-deploy.mjs` checks
both after every deploy:

| Setting | Where | Effect |
|---|---|---|
| Always Use HTTPS | SSL/TLS, Edge Certificates | `http://` answers 301 to `https://` |
| Redirect rule `https://www.*` to `https://${1}` | Rules, Redirect Rules | `www` answers 301 to the apex |

The canonical origin is `SITE.url` in `frontend/src/content/site.ts`; the
first route and `SITE_URL` in `deploy.yml` must match it, which the
invariants test checks.

## Caching

HTML is served with `max-age=0, must-revalidate` (Cloudflare's default for
assets), so a deploy is visible on the next visit. Fingerprinted files in
`/assets/` and the font are immutable for a year. `/images/` keeps stable
names and revalidates. `/sw.js` is a kill switch that unregisters a service
worker an old version of the site installed; it stays, because removing it
would leave such a worker running.

## Rolling back

Revert the commit on `main`; the revert deploys like any other change. The
Cloudflare dashboard can also roll the Worker back to an earlier version
immediately, without a commit.

## Releases

A version marks a milestone; the site deploys continuously regardless.

1. In `CHANGELOG.md`, move the `Unreleased` entries under
   `## [X.Y.Z] - YYYY-MM-DD` and add the compare link at the end.
2. Set the version in `package.json` and `frontend/package.json` (the
   invariants test checks they match), and run
   `npm install --package-lock-only` in `frontend/`.
3. Merge the pull request, then tag the merge commit and publish the notes:

```bash
git tag -a vX.Y.Z -m "X.Y.Z" && git push origin vX.Y.Z
node scripts/release-notes.mjs X.Y.Z | gh release create vX.Y.Z --title "X.Y.Z" --notes-file - --verify-tag
```

`release-notes.mjs` joins each wrapped changelog paragraph onto one line,
because GitHub keeps line breaks in release notes. Releases are immutable once
published.
