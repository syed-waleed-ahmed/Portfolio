# Deployment

The two projects deploy independently.

| Part | Platform | URL | Trigger |
|------|----------|-----|---------|
| Frontend | Netlify | https://syedwaleedahmed.me | Push to `main`, published if the build and its gate pass |
| Backend | Render | https://portfolio-backend-kmum.onrender.com | Push to `main` |

Both build from the same repository. CI reads the Node version from `.nvmrc`
and Netlify from `NODE_VERSION` in `netlify.toml`, and the repository
invariants fail if the two name different majors.

---

## Frontend (Netlify)

| Setting | Value |
|---------|-------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `frontend/dist` |
| Node version | `24`, from `netlify.toml` |

Base directory, build command and publish directory are configured in the
Netlify UI. `netlify.toml` deliberately carries **only** the Node version, so
there is exactly one place where each setting lives and no chance of the file
and the UI disagreeing. Netlify reads it from the repository root even with the
base directory set to `frontend`; a `.nvmrc` placed in `frontend/` would
override it.

The build needs no environment variables. `npm run build` compiles the client
bundle, compiles a server bundle, and prerenders the page into
`dist/index.html` - see [Architecture](architecture.md#rendering-strategy). If
the prerender step fails the whole build fails, so a deploy can never publish
an empty page.

### The Netlify build gate

`frontend/package.json` has a `prebuild` script, which npm runs before every
`npm run build`, Netlify's included:

```text
eslint . && node --test && node --test ../test/invariants.test.js
```

That is frontend lint, the content tests and the repository invariants. A commit
that fails any of them fails the Netlify build before Vite starts, and Netlify
keeps serving the previous deploy. It is the one check that stands between a
push to `main` and the live site, since CI runs alongside the deploy rather than
before it. It does not run the browser suite or the size budgets, and nothing
gates Render.

`npm run build --ignore-scripts`, run in `frontend/`, skips the gate. CI builds
that way because it runs the same three checks as separate steps; locally it is
the deliberate way round a known failure while working on the build itself.

A custom domain with HTTPS is configured for `syedwaleedahmed.me`, with
`www.syedwaleedahmed.me` and the `syedwaleedahmed.netlify.app` default domain
also live. All three are on the backend's CORS allow-list.

Netlify serves `public/404.html` automatically on any unmatched path.

### Environment variables

Set `VITE_API_BASE_URL` in the Netlify UI only if the backend moves. Left
unset, the bundle falls back to the deployed Render URL baked into
`Contact.jsx`. Remember that `VITE_`-prefixed variables are compiled into the
client bundle and are therefore public.

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

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/health` |

Environment variables, set in the Render dashboard:

```text
NODE_ENV=production
RESEND_API_KEY=…
EMAIL_FROM=…
EMAIL_TO=…
ALLOWED_ORIGINS=…   # optional; omit to use the built-in defaults
```

`PORT` is injected by Render and must not be hardcoded. The app reads it from
the environment and falls back to 5000 locally.

With `NODE_ENV=production` set, `npm ci` skips devDependencies, so ESLint never
reaches the server. Nothing Render runs needs it: the backend is linted in CI.

Two details matter on this platform specifically:

- **`trust proxy` is set to `1`.** Render terminates TLS at its own proxy and
  forwards the client IP in `X-Forwarded-For`. Trusting exactly one hop is what
  makes the rate limiter key on the real client rather than on the proxy, while
  still refusing to believe a spoofed header chain.
- **Graceful shutdown is wired to `SIGTERM` and `SIGINT`.** Render sends
  `SIGTERM` on redeploy; the server stops accepting connections, finishes
  in-flight requests, and force-exits after 10 seconds if something hangs.

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

Node comes from `node-version-file: .nvmrc` in every job, never a hardcoded
number, so CI cannot drift from local or from Netlify. What each suite covers is
in [Testing](testing.md). CodeQL code scanning runs as well, from GitHub's
default setup in the repository settings rather than from a workflow file.

Every action in every workflow is pinned to a full commit SHA, with its version
in a comment (`actions/checkout@3d3c42e… # v7.0.1`). A tag can be moved to other
code after it was reviewed; a SHA cannot. Dependabot's `github-actions` updater
bumps the SHA and the comment together. Every checkout that does not push sets
`persist-credentials: false`, so the token is not left in `.git/config` for
later steps to read. `refresh-activity.yml` pushes, so it keeps it.

CI does not deploy, and it does not hold a deploy back either. Netlify builds
every push to `main` whatever CI reports, stopped only by its own
[build gate](#the-netlify-build-gate), and Render's auto-deploy is configured
separately in its own dashboard. A red CI run on `main` therefore means the
commit may already be live.

### Weekly snapshot commit

`.github/workflows/refresh-activity.yml` keeps the contribution graph current. It
runs at 04:17 UTC every Monday, and on demand from the Actions tab.

- It runs `frontend/scripts/fetch-github-activity.mjs` and commits
  `frontend/src/data/github-activity.json` to `main` only if the file changed.
  Every such commit starts a Netlify deploy, whose build gate runs the content
  tests on the new snapshot. The push uses `GITHUB_TOKEN`, so it starts no CI
  run.
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

`frontend/public/_headers` is a Netlify edge-header file applied to every
response from the site. It is separate from, and stricter than, the headers the
API sets for itself (see [API reference](api.md#security-headers)).

| Header | Value |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Content-Security-Policy` | see below |

The CSP is `default-src 'self'` with narrow additions:
`object-src 'none'`, `base-uri 'self'`, `form-action 'self'`,
`frame-ancestors 'none'`, `upgrade-insecure-requests`, `font-src 'self'`,
the backend origin in `connect-src`, and the Google Analytics hosts allow-listed
per directive rather than globally. The command palette, contribution graph and
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
fails on any violation (see [Testing](testing.md#browser-tests)).

### The inline analytics hash

The site's one inline script is the GA4 snippet at the top of `<body>` in
`frontend/index.html`. It is pinned in `script-src` by SHA-256 hash:

```text
'sha256-DcZnhiXzGRqf7Ap1FmHxA25PvMu+ebywXAvTxOAgB+E='
```

> **Editing that snippet by even one character silently kills analytics.** The
> hash covers the script's bytes exactly, whitespace included. The browser
> blocks the script for failing the hash, the page renders perfectly, and
> nothing appears in the console for most users.

If you change it, recompute the hash and update `_headers` in the same commit:

```bash
# from frontend/ - prints the value to paste into _headers
node -e "const fs=require('fs'),c=require('crypto');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1].replace(/\r\n/g,'\n')).digest('base64'))"
```

> **The `\r\n` to `\n` normalization is load-bearing on Windows.** `.gitattributes`
> stores this file with LF, so LF is what Netlify checks out and what the
> browser hashes - but a Windows working copy can hold CRLF, and hashing those
> bytes yields a completely different, wrong value. Pasting it produces exactly
> the silent failure this section warns about. Verify by recomputing against an
> unchanged `index.html` first: if the command does not reproduce the hash
> already in `_headers`, the command is wrong, not the file.

The repository invariants recompute the hash the same way and fail when
`_headers` does not match, in CI and in Netlify's build gate, so a stale hash
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
| `/`, `/index.html`, `/404.html` | `max-age=0, must-revalidate` | A deploy is visible on the next visit. Never serve stale HTML |
| `/sw.js` | `max-age=0, must-revalidate` | The kill-switch service worker needs to reach users without a 24-hour delay |
| `/assets/*` | `max-age=31536000, immutable` | Filenames are content-hashed by Vite, so a one-year cache is correct |
| `/fonts/*` | `max-age=31536000, immutable` | The filename encodes family, subset and weight, so the bytes never change. A new typeface means a new file at a new URL |
| `/images/*` | `max-age=0, must-revalidate` | Unlike `/assets/*`, these filenames are stable, so a `max-age` here would keep serving an old portrait after a swap |

Netlify's CDN still caches at the edge and purges on deploy; these values only
control the browser-cache layer.

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
   commit automatically, and Netlify does once its
   [build gate](#the-netlify-build-gate) passes.
4. Verify the deploy: load the site, then run the Postman collection against
   the production environment (see
   [Testing](testing.md#running-against-production)). If the site has not
   changed, check the Netlify deploy log: a failed gate keeps the previous
   deploy live.
5. Tag the squash-merge commit and publish its notes from the changelog
   section:

   ```bash
   git switch main && git pull   # HEAD is now the merge commit, unless something landed since
   git tag -a vX.Y.Z -m "X.Y.Z" && git push origin vX.Y.Z
   awk '/^## \[X.Y.Z\]/{f=1;next} /^## \[/{f=0} f' CHANGELOG.md |
     gh release create vX.Y.Z --title "X.Y.Z" --notes-file - --verify-tag
   ```

Versions follow [Semantic Versioning](https://semver.org/) read for a site:
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
