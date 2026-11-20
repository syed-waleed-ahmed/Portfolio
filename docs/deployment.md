# Deployment

The two projects deploy independently.

| Part | Platform | URL | Trigger |
|------|----------|-----|---------|
| Frontend | Cloudflare Workers | https://syedwaleedahmed.me (see [Domain](#domain)) | Push to `main`, published once every CI job has passed |
| Backend | Render | https://portfolio-backend-kmum.onrender.com | Push to `main` that changes `backend/`, deployed once the commit's checks have passed |

Both build from the same repository. Every workflow reads the Node version
from `.nvmrc`, and the repository invariants fail on one that names a version
itself.

---

## Frontend (Cloudflare Workers)

The site is a Worker with static assets and no script, so every request is a
static asset request, which Cloudflare serves on its free plan without a quota.
`frontend/wrangler.jsonc` is the whole configuration:

| Setting | Value |
|---------|-------|
| Worker name | `portfolio` |
| Assets directory | `./dist`, the Vite build output |
| Unknown paths | `not_found_handling: "404-page"`, which answers with `404.html` and a 404 status |
| Node version, for the build | `24`, from `.nvmrc` |

Cloudflare builds nothing. `.github/workflows/deploy.yml` builds the site on a
GitHub runner and uploads the result with `wrangler deploy`, so the host has no
build minutes or deploy count to run out of. That matters for a site that
ships about once a day: a host that meters deploys on its free plan can spend
a month's allowance in two weeks and stop publishing, which is what ended the
site's previous hosting in November 2026.

The build needs no environment variables. `npm run build` compiles the client
bundle, compiles a server bundle, and prerenders the page into
`dist/index.html` (see [Architecture](architecture.md#rendering-strategy)). If
the prerender step fails the whole build fails, so a deploy can never publish
an empty page.

### The deploy gate

Nothing reaches the site except through `deploy.yml`, which has three callers:

| Caller | When | What has passed first |
|--------|------|-----------------------|
| The `deploy` job in `ci.yml` | A push to `main` | Every CI job: lint, the content tests, the invariants, the build, the size budgets, both audits, the browser suite, the backend's tests and the secret scan |
| `refresh-activity.yml` | After its weekly snapshot commit | The prebuild gate |
| `workflow_dispatch` | By hand, from the Actions tab, to republish `main` | The prebuild gate |

So a commit that fails any check in CI is never published.

There is a second, smaller gate inside the build itself.
`frontend/package.json` has a `prebuild` script,
which npm runs before every `npm run build`, the deploy's included:

```text
eslint . && node --test && node --test ../test/invariants.test.js
```

That is frontend lint, the content tests and the repository invariants. A commit
that fails any of them fails the build before Vite starts, nothing is uploaded,
and Cloudflare keeps serving the previous version. After CI the gate repeats
checks that have just passed, which costs seconds. For the other two callers it
is the only gate there is. Render waits for the same CI run before it deploys
the backend, by a setting of its own (see [Backend (Render)](#backend-render)).

`npm run build --ignore-scripts`, run in `frontend/`, skips the gate. CI builds
that way because it runs the same three checks as separate steps; locally it is
the deliberate way round a known failure while working on the build itself.

Each run of `deploy.yml` does three things:

1. **Build.** It checks out the commit, runs `npm ci` and builds behind the
   gate.
2. **Publish.** `cloudflare/wrangler-action`, pinned to a commit SHA like every
   other action, runs `wrangler deploy` with Wrangler 4.158.0. Wrangler is not
   in `package.json`: only this job uses it, and as a dependency every other
   job would download it for nothing.
3. **Verify.** `frontend/scripts/verify-deploy.mjs` fetches the live origin and
   fails the run unless it serves this build (the entry script's fingerprint
   identifies one), applies every rule in `_headers`, tested against one real
   URL per rule, answers an unknown path with the 404 page, and redirects
   plain HTTP and `www` to itself (see [Domain](#domain)). It is the one
   check of the host itself: everything else exercises `_headers` through a
   local imitation.

Deploys run one at a time, in order (`concurrency: deploy-production`). A newer
push cancels the CI run before it, deploy included, which is safe at any point:
Cloudflare switches to a new version only once its upload has finished. Each
deploy is recorded under the repository's `production` environment.

The workflow needs two settings in the repository:

| Setting | Kind | Value |
|---------|------|-------|
| `CLOUDFLARE_API_TOKEN` | Secret | An API token from Cloudflare's "Edit Cloudflare Workers" template, limited to this one account |
| `CLOUDFLARE_ACCOUNT_ID` | Variable | The account's ID, which is an identifier and not a credential |

### How Cloudflare serves the files

- **`_headers` is applied as written.** The file travels inside `dist/`, and
  Cloudflare applies it: the CSP, the other security headers and every cache
  rule (see
  [Security headers and CSP](#security-headers-and-csp) and
  [Caching](#caching)). It is not served itself.
- **`.html` URLs redirect to their extensionless form.** `/index.html`
  answers 307 to `/`, and `/404.html` to `/404`, so `_headers` has no rule
  for either: it could never apply, and `verify-deploy.mjs` fails on a rule
  whose URL does not answer 200. Google's site-verification file is reached
  through the same redirect.
- **A new version is live as soon as its upload finishes.** There is no edge
  cache to purge.
- **Rolling back** is `npx wrangler rollback` in `frontend/`, or the Worker's
  Deployments page in the Cloudflare dashboard. Neither changes `main`, so the
  next deploy publishes `main` again: revert the commit as well.

### Domain

`syedwaleedahmed.me` is registered at Namecheap, and Namecheap's only job is
to name Cloudflare's two nameservers. The DNS zone is in the same Cloudflare
account as the Worker, on the free plan.

The domain is attached to the Worker in `frontend/wrangler.jsonc`, not in a
dashboard:

```jsonc
"routes": [
  { "pattern": "syedwaleedahmed.me", "custom_domain": true },
  { "pattern": "www.syedwaleedahmed.me", "custom_domain": true }
],
"workers_dev": false,
"preview_urls": false
```

For a custom domain Cloudflare creates the DNS record and the certificate
itself, so the zone needs no record written by hand for either hostname, and
a deploy fails if one is in the way. `workers_dev: false` and
`preview_urls: false` leave those two as the only addresses: the Worker has no
`workers.dev` address of its own.

Two settings live in the Cloudflare zone and not in this repository, because
they act before a request reaches the Worker:

| Setting | Where | Effect |
|---------|-------|--------|
| Always Use HTTPS | SSL/TLS, Edge Certificates | `http://` answers 301 to `https://` |
| A redirect rule, `https://www.*` to `https://${1}` | Rules, Redirect Rules | `www` answers 301 to the apex, path and query string kept |

So the site has one address, the apex over HTTPS, which is also what
`rel="canonical"` in `index.html` names. Neither setting can be read from a
checkout, so `verify-deploy.mjs` requests both after every deploy and fails
the run if either has stopped redirecting.

Three places name the origin: that first route, the canonical URL, and
`SITE_URL` in `deploy.yml`, which is the address each deploy is verified
against. The repository invariants fail if they stop agreeing. The apex and
`www` are the two live origins on the backend's CORS allow-list.

The zone holds nothing but the site: no mail or verification records. A
record for another service is added in the Cloudflare dashboard, under the
zone's DNS settings.

### Environment variables

The deploy sets none. `VITE_API_BASE_URL` stays unset, so the bundle uses the
Render URL written into `Contact.jsx`; if the backend moves, change that
default rather than adding a variable to the workflow. `VITE_`-prefixed
variables are compiled into the client bundle and are therefore public.

A new backend origin also has to be added to `connect-src` in
`frontend/public/_headers`, or the CSP blocks the form, and should replace the
`dns-prefetch` hint in `index.html`. `vite preview` does not apply `_headers`,
and CI builds without the variable, so a missed `connect-src` shows only on the
live site, where the form reports that the server could not be reached.
The invariants test checks both against the default origin in `Contact.jsx`,
not against the variable, so moving the backend means changing that default
too.

---

## Backend (Render)

These settings live in Render's dashboard, not in a file here, so nothing in
the repository can check them. The table is what the dashboard held on
2026-11-20:

| Setting | Value |
|---------|-------|
| Branch | `main` |
| Root directory | `backend` |
| Build command | `npm ci --omit=dev` |
| Start command | `npm start` |
| Health check path | `/health` |
| Auto-Deploy | After CI Checks Pass |
| Region | Frankfurt |

Environment variables, set in the Render dashboard. The first four are set
today; the rest are optional:

```text
NODE_ENV=production
RESEND_API_KEY=…
EMAIL_FROM=…
EMAIL_TO=…
ALLOWED_ORIGINS=…   # optional; omit to use the built-in defaults
TRUST_PROXY_HOPS=…  # optional; omit for 3. See the check below before changing it
RESEND_TIMEOUT_MS=… # optional; omit for 10000
```

`PORT` is injected by Render and must not be hardcoded. The app reads it from
the environment and falls back to 5000 locally.

`NODE_ENV=production` is what keeps error detail out of `500` responses.
Until 2026-11-20 it was not in the dashboard at all: Render runs a Node
service with that value unless told otherwise, and the live API's `500` read
`Internal server error.` on the strength of that default alone. It is set
explicitly now, so it no longer depends on the platform keeping the default.

The Node version comes from the repository's `.nvmrc`, the file CI reads. The
build log says so (`Using Node.js version 24.22.3 via
/opt/render/project/src/.nvmrc`). A `NODE_VERSION` variable in the dashboard
would override the file, and is left unset on purpose, so that there is one
pin.

The build command is `npm ci --omit=dev`, which installs exactly the
lockfile's production tree and fails if `package.json` has moved ahead of the
lockfile: 76 packages, by the build log. Until 2026-11-20 it was
`npm install`, which resolved all 155, development ones included, so ESLint
sat on the server though nothing there runs it. Saving a new build command in
the dashboard starts a deploy at once, and so does saving a variable with the
default button, "Save, rebuild, and deploy": both happen outside the
Auto-Deploy rule below, which governs commits.

Auto-Deploy has been After CI Checks Pass since 2026-11-20: Render deploys a
commit only once every check on it has succeeded, and does not deploy a commit
that has no checks. Before that it deployed every push, whatever CI reported.
Two consequences follow. The checks include the frontend's deploy job, so a
frontend deploy that fails its own check also holds that commit's backend
back, until a later commit passes or someone deploys it by hand in Render. And
the weekly snapshot commit, which starts no CI run, is never deployed, which
is right: it changes nothing under `backend/`, and Render ignores a commit
that does not.

Two details matter on this platform specifically:

- **`trust proxy` counts the proxies in front of the app.** Each proxy appends
  the address it heard from to `X-Forwarded-For`, so trusting as many entries
  as there are proxies makes the rate limiter key on the visitor. The count is
  `3` unless `TRUST_PROXY_HOPS` says otherwise. Render's documentation names
  two layers, Cloudflare and its own load balancers, and does not show the
  header as the app receives it; measured, two was still too few. The number
  is easy to get wrong and nothing in the code can check it, so
  [check it against the live API](#checking-the-rate-limiters-key) after any
  change to it or to the host.
- **Graceful shutdown is wired to `SIGTERM` and `SIGINT`.** Render sends
  `SIGTERM` on redeploy; the server stops accepting connections, finishes
  in-flight requests, and force-exits after 10 seconds if something hangs.

### Checking the rate limiter's key

The limiter cannot be seen from outside, but its `RateLimit-Remaining` header
can, and it says which counter a request landed on. An empty body fails
validation with a `400`, so none of these requests can send mail; together they
spend four of the caller's five submissions for the next 15 minutes.

```bash
API=https://portfolio-backend-kmum.onrender.com
remaining() { curl -s -o /dev/null -D - -X POST "$API/api/contact" -H 'Content-Type: application/json' -d '{}' "$@" | grep -i '^ratelimit-remaining'; }

remaining; remaining; remaining            # must read 4, 3, 2
remaining -H 'X-Forwarded-For: 203.0.113.7'   # must read 1, not 4
```

| Reading | Meaning | Fix |
|---------|---------|-----|
| `4, 3, 2`, then `1` | The key is the caller's address, and a forged header does not change it | None, but see the last step |
| Numbers that do not count down by one, such as `4, 4, 3` | The key is a proxy's address, one of several, and every visitor shares those counters | Raise `TRUST_PROXY_HOPS` by one |
| `4, 3, 2`, then `4` | The forged header chose the key, so a new value buys a fresh quota | Lower `TRUST_PROXY_HOPS` by one |

One case passes this from a single network and is still wrong: a count that is
too low where the proxy seen is always the same one. Rule it out from a second
network, a phone on mobile data for example: its first request must read `4`
while the first network's counter is still spent. Submitting the live form from
that phone does as well, since it sends only if the phone has a counter of its
own.

This check is how the number was found, twice, on 2026-11-20. With `1`, sixteen
such requests from one machine, which left through a single public address,
spread over three counters, each unmoved by the forged header, and three of the
sixteen were answered `429`: the limiter was keyed on Render's proxies, so any
visitor could spend the allowance of all the others. With `2`, the number
Render's documentation suggests, six requests on fresh connections spread over
four counters: a different proxy layer, and still not the visitor. With `3`, nine
requests, four from a browser and five from a script on fresh connections,
counted down one counter from 4 to 0 and were then refused, and the forged
header changed nothing. That is one network's evidence; the second-network
step above has not been run.

Wait a few minutes after a deploy before running it. Render keeps the previous
instance serving while the new one takes over, each has its own counters, and
a reading from the old one looks exactly like a second counter.

### Free-tier cold starts

The service runs on Render's free tier and sleeps after inactivity. The first
request after idle can take 30 to 60 seconds. Three mitigations are already in
place: `index.html` carries a `dns-prefetch` hint for the backend origin,
focusing the contact form sends one `no-cors` request to `/health` so the
backend is already waking by the time someone presses send, and after six
seconds the form explains the delay rather than appearing frozen. An uptime
pinger against `/health` would remove the delay entirely at the cost of keeping
a free instance awake.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push to `main` and every pull request
against it, with `permissions: contents: read` and in-progress runs cancelled
per ref.

| Job | Steps |
|-----|-------|
| `frontend` | `npm ci`, lint, content tests, repository invariants, prerendered build with `--ignore-scripts`, size budgets, `npm audit --omit=dev --audit-level=high` |
| `e2e` | `npm ci`, `npx playwright install --with-deps chromium`, build with `--ignore-scripts`, the Playwright suite; the report is uploaded as an artifact if it fails, kept 14 days |
| `backend` | `npm ci`, lint, `npm test`, `npm audit --omit=dev --audit-level=high` |
| `secret-scan` | `gitleaks` over the full git history (`fetch-depth: 0`) |
| `deploy` | On a push to `main` only, and only after the four jobs above: calls `deploy.yml` (see [The deploy gate](#the-deploy-gate)) |

Every job that installs Node takes it from `node-version-file: .nvmrc`, never
a hardcoded number, so CI and the deploy cannot drift from local work. What
each suite covers is in [Testing](testing.md). CodeQL code scanning runs as well, from GitHub's
default setup in the repository settings rather than from a workflow file.

Every action in every workflow is pinned to a full commit SHA, with its version
in a comment (`actions/checkout@3d3c42e… # v7.0.1`). A tag can be moved to other
code after it was reviewed; a SHA cannot. Dependabot's `github-actions` updater
bumps the SHA and the comment together. Every checkout that does not push sets
`persist-credentials: false`, so the token is not left in `.git/config` for
later steps to read. `refresh-activity.yml` pushes, so it keeps it.

CI deploys the frontend, and holds the deploy back until every job is green.
Render holds the backend back as well, by its Auto-Deploy setting (see
[Backend (Render)](#backend-render)), so a red CI run on `main` means neither
side was published. The difference is where the rule lives: the frontend's is
in `ci.yml`, the backend's in Render's dashboard, where a new or reset service
would deploy every push until it is set again.

### Weekly snapshot commit

`.github/workflows/refresh-activity.yml` keeps the contribution graph current. It
runs at 04:17 UTC every Monday, and on demand from the Actions tab.

- It runs `frontend/scripts/fetch-github-activity.mjs` and commits
  `frontend/src/data/github-activity.json` to `main` only if the file changed.
  The push uses `GITHUB_TOKEN`, so it starts no CI run, and CI's deploy job
  never sees the commit. The workflow's second job publishes it instead, by
  calling `deploy.yml` on the new commit, whose prebuild gate runs the content
  tests on the new snapshot. With no change there is no commit and no deploy.
- It is the one workflow here that writes, so it asks for `contents: write`
  itself rather than widening the default. If `main` is ever given a rule
  requiring pull requests, its push will start failing.
- A failed run changes nothing: the script writes only a validated response, so
  the site keeps the last good snapshot and the graph's label shows its age.
- Deleting the workflow file stops the commits. The graph keeps working.

The same script refreshes the snapshot by hand: run
`node frontend/scripts/fetch-github-activity.mjs` from the repository root and
commit the result.

### Weekly link check

`.github/workflows/links.yml` runs lychee over the links in the data modules,
`index.html`, `humans.txt` and the docs every Monday at 05:47 UTC, after the
snapshot run, and on demand. It asks only for `contents: read`. A dead link
fails the run and GitHub emails the owner; it never blocks a deploy. The
configuration and how to run it locally are in
[Testing](testing.md#link-check).

### Dependency updates

`.github/dependabot.yml` opens grouped weekly PRs for `frontend/`, `backend/`
and the GitHub Actions the workflows use.

- **npm: minor and patch only.** Majors are ignored on purpose. A major can
  break the app and deserves a manual read of the changelog.
- **GitHub Actions: majors included**, grouped into one PR. An Action's major
  is how it ships a new runner or drops a deprecated input, which makes it the
  update you most need. Ignoring them is what previously left
  `checkout`/`setup-node` three majors behind and `gitleaks-action` two.
- **A seven-day cooldown on all three.** A release is not proposed until it is
  a week old, since a compromised or broken version is usually caught and pulled
  within days.
- **Security updates are separate.** Dependabot alerts and security updates are
  enabled on the repository, and the cooldown does not delay them: a security
  update opens its own PR as soon as a patched version fits the dependents'
  ranges, transitive dependencies included. When none fits, the fix is by hand
  (see [Development](development.md#dependencies)). The full list of controls
  is in [Security](security.md#repository-and-supply-chain).

---

## Security headers and CSP

`frontend/public/_headers` is a headers file that Cloudflare applies to every
response from the site. It is separate from, and stricter than, the headers the
API sets for itself (see [API reference](api.md#security-headers)).

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | see below |

The CSP is `default-src 'self'` plus `object-src 'none'`, `base-uri 'self'`,
`form-action 'self'`, `frame-ancestors 'none'`, `upgrade-insecure-requests`
and `font-src 'self'`, with the backend origin in `connect-src` and the Google
Analytics hosts allow-listed per directive rather than globally. The command palette, contribution graph and
globe add no origins: their chunks are same-origin, and the graph reads a
committed snapshot rather than calling an API from the browser.

Three sources look looser than the rest, and each is load-bearing:

| Source | Why it is there |
|--------|-----------------|
| `style-src 'unsafe-inline'` | `cobe` and `react-activity-calendar` each add a `<style>` element at runtime, and `Reveal` writes a `style` attribute (`--reveal-delay`) into the prerendered HTML for the staggered Experience rows. Without it the browser blocks all three and reports a violation for each |
| `img-src data:` | `cobe` ships its map texture as a `data:` PNG, which this allows it to load |
| `script-src 'unsafe-inline'` | A fallback for CSP Level 1 browsers, which predate hash sources. A browser that understands hashes ignores it whenever a hash is present, so the hash below is what is enforced |

`font-src` is `'self'` alone: the site's one font is a file in `public/fonts/`,
and nothing loads a `data:` font.

A new third-party origin, or a new backend origin, needs its directive here in
the same commit. `vite preview` does not apply `_headers`, so a CSP break does
not show there; the browser suite serves the build under this exact policy and
fails on any violation (see [Testing](testing.md#browser-tests)), and after
each deploy `verify-deploy.mjs` confirms the live site sends every header in
the file.

### The inline analytics hash

The site's one inline script is the GA4 snippet at the top of `<body>` in
`frontend/index.html`. It is pinned in `script-src` by SHA-256 hash:

```text
'sha256-DcZnhiXzGRqf7Ap1FmHxA25PvMu+ebywXAvTxOAgB+E='
```

> **Editing that snippet by even one character silently kills analytics.** The
> hash covers the script's bytes exactly, whitespace included. The browser
> blocks the script for failing the hash, the page renders normally, and the
> only trace is a CSP error in the browser console.

If you change it, recompute the hash and update `_headers` in the same commit:

```bash
# from frontend/ - prints the value to paste into _headers
node -e "const fs=require('fs'),c=require('crypto');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1].replace(/\r\n/g,'\n')).digest('base64'))"
```

> **The `\r\n` to `\n` normalization is load-bearing on Windows.** `.gitattributes`
> stores this file with LF, so LF is what the deploy checks out and what the
> browser hashes, but an editor on Windows can save the working copy with
> CRLF, and hashing those bytes yields a completely different, wrong value. Pasting it produces exactly
> the silent failure this section warns about. Verify by recomputing against an
> unchanged `index.html` first: if the command does not reproduce the hash
> already in `_headers`, the command is wrong, not the file.

The repository invariants recompute the hash the same way and fail when
`_headers` does not match, in CI and in the prebuild gate, so a stale hash
no longer reaches the live site unnoticed. The browser suite checks the other
end: the snippet runs under the real CSP and adds its tag.

The snippet itself is deferred to `requestIdleCallback` (falling back to
`setTimeout`), so the tag only starts fetching once the main thread is idle and
never competes with first paint or the font preload. There is no
`gtag.js` tag in `<head>` and no analytics package in `package.json`.

---

## Caching

Cache rules also live in `frontend/public/_headers`:

| Path | Cache | Why |
|------|-------|-----|
| `/` | `max-age=0, must-revalidate` | A deploy is visible on the next visit. Never serve stale HTML. The 404 page gets the same value from Cloudflare's default |
| `/sw.js` | `max-age=0, must-revalidate` | The kill-switch service worker needs to reach users without a 24-hour delay |
| `/assets/*` | `max-age=31536000, immutable` | Filenames are content-hashed by Vite, so a one-year cache is correct |
| `/fonts/*` | `max-age=31536000, immutable` | The filename encodes family, subset and weight, so the bytes never change. A new typeface means a new file at a new URL |
| `/images/*` | `max-age=0, must-revalidate` | Unlike `/assets/*`, these filenames are stable, so a `max-age` here would keep serving an old portrait after a swap |

Cloudflare's edge serves a new version as soon as a deploy finishes; these
values only control the browser's own cache.

### Stale service worker recovery

The site briefly shipped with `vite-plugin-pwa`. Visitors from that window
still have a service worker installed locally that intercepts every request and
serves cached files.

`frontend/public/sw.js` is a **kill-switch service worker**: on its next
update it deletes every cache the old worker created, unregisters itself, and
reloads open tabs. No inline cleanup script is needed in `index.html`, so this
costs no additional CSP script hash beyond the analytics snippet.

Once analytics show no service-worker traffic for around 30 days, `sw.js` can
be deleted.

---

## Release process

The project is deployed continuously from `main` rather than from tags, so a
release is a documentation event rather than a build event. It goes through a
pull request like any other change, either on its own or in the PR that carries
the last change it covers:

1. Move the entries under `Unreleased` in [`CHANGELOG.md`](../CHANGELOG.md)
   into a new heading, `## [X.Y.Z] - YYYY-MM-DD`, and leave an empty
   `## [Unreleased]` above it. In the references at the end of the file, add
   the version's compare link and start the `[Unreleased]` link from the new
   tag.
2. Set the same version in all three `package.json` files, then run
   `npm install --package-lock-only` in `frontend/` and `backend/` so the
   lockfiles agree. The repository invariants fail if any manifest disagrees
   with the newest release heading.
3. Open the PR, wait for CI, and squash-merge it. Render deploys the merge
   commit automatically, and the CI run on it publishes the frontend once
   every job has passed (see [The deploy gate](#the-deploy-gate)).
4. Verify the deploy. The `deploy` job has already checked the live site
   against the build; load the site as well, then run the Postman collection
   against the production environment (see
   [Testing](testing.md#running-against-production)). If the site has not
   changed, look at the CI run on the merge commit: a failed job or gate
   leaves the previous version live.
5. Tag the squash-merge commit and publish its notes from the changelog
   section:

   ```bash
   git switch main && git pull   # HEAD is now the merge commit, unless something landed since
   git tag -a vX.Y.Z -m "X.Y.Z" && git push origin vX.Y.Z
   awk '/^## \[X.Y.Z\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md |
     gh release create vX.Y.Z --title "X.Y.Z" --notes-file - --verify-tag
   ```

Versions follow [Semantic Versioning](https://semver.org/) as applied to a site:
**major** for a change to the API contract or a redesign (2.0.0 had both),
**minor** for a new feature or section, **patch** for fixes, content and
dependency updates. Every release so far is tagged `vX.Y.Z` and published as
a GitHub Release.

---

## Related documents

- [Architecture](architecture.md) - how the parts fit together
- [API reference](api.md) - the endpoints Render serves
- [Security](security.md) - the full control inventory
- [Testing](testing.md) - what each suite covers, and post-deploy verification
