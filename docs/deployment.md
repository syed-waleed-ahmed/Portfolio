# Deployment

The two workspaces deploy independently.

| Part | Platform | URL | Trigger |
|------|----------|-----|---------|
| Frontend | Netlify | https://syedwaleedahmed.me | Push to `main` |
| Backend | Render | https://portfolio-backend-kmum.onrender.com | Push to `main` |

Both build from the same repository and the same Node version, pinned by
`.nvmrc`.

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
and the UI disagreeing.

`NODE_ENV=production` must be set for the build. PurgeCSS is gated on it in
`postcss.config.js`; without it the build succeeds but ships all of Bootstrap,
turning about 10 KB of gzipped CSS into about 46 KB.

A custom domain with HTTPS is configured for `syedwaleedahmed.me`, with
`www.syedwaleedahmed.me` and the `syedwaleedahmed.netlify.app` default domain
also live. All three are on the backend's CORS allow-list.

Netlify serves `public/404.html` automatically on any unmatched path.

### Environment variables

Set `VITE_API_BASE_URL` in the Netlify UI only if the backend moves. Left
unset, the bundle falls back to the deployed Render URL baked into
`Contact.jsx`. Remember that `VITE_`-prefixed variables are compiled into the
client bundle and are therefore public.

---

## Backend (Render)

| Setting | Value |
|---------|-------|
| Root directory | `backend` |
| Build command | `npm ci` |
| Start command | `npm start` |
| Health check path | `/health` |

Required environment variables, set in the Render dashboard:

```text
NODE_ENV=production
RESEND_API_KEY=…
EMAIL_FROM=…
EMAIL_TO=…
ALLOWED_ORIGINS=…   # optional; omit to use the built-in defaults
```

`PORT` is injected by Render and must not be hardcoded. The app reads it from
the environment and falls back to 5000 locally.

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
request after idle can take 30 to 60 seconds. Two mitigations are already in
place: `index.html` carries `dns-prefetch` and `preconnect` hints for the
backend origin, and the contact form surfaces a sending state rather than
appearing frozen. An uptime pinger against `/health` would remove the delay
entirely at the cost of keeping a free instance awake.

---

## Continuous integration

`.github/workflows/ci.yml` runs on every push and pull request against `main`,
with `permissions: contents: read` and in-progress runs cancelled per ref.

| Job | Steps |
|-----|-------|
| Frontend | `npm ci`, `eslint`, `vite build` with `NODE_ENV=production`, `npm audit --omit=dev --audit-level=high` |
| Backend | `npm ci`, `npm test`, `npm audit --omit=dev --audit-level=high` |
| Secret scan | `gitleaks` over the full git history (`fetch-depth: 0`) |

Node comes from `node-version-file: .nvmrc` in every job, never a hardcoded
number, so CI cannot drift from local or from Netlify.

CI does not deploy. Netlify and Render each watch `main` themselves.

### Dependency updates

`.github/dependabot.yml` opens grouped weekly PRs for `frontend/`, `backend/`
and the GitHub Actions used in CI.

- **npm: minor and patch only.** Majors are ignored on purpose. A major can
  break the app and deserves a manual read of the changelog.
- **GitHub Actions: majors included**, grouped into one PR. An Action's major
  is how it ships a new runner or drops a deprecated input, which makes it the
  update you most need. Ignoring them is what previously left
  `checkout`/`setup-node` three majors behind and `gitleaks-action` two.

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
`frame-ancestors 'none'`, `upgrade-insecure-requests`, `font-src 'self' data:`,
the backend origin in `connect-src`, and the Google Analytics hosts allow-listed
per directive rather than globally.

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
node -e "const fs=require('fs'),c=require('crypto');const m=fs.readFileSync('index.html','utf8').match(/<script>([\s\S]*?)<\/script>/);console.log('sha256-'+c.createHash('sha256').update(m[1]).digest('base64'))"
```

`script-src` also lists `'unsafe-inline'`, but only as a legacy fallback: per
CSP Level 3, a browser that understands hashes ignores `'unsafe-inline'`
entirely, so the hash is what is actually enforced.

The snippet itself is deferred to `requestIdleCallback` (falling back to
`setTimeout`), so the tag only starts fetching once the main thread is idle and
never competes with first paint or the hero font preload. There is no
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
release is a documentation event rather than a build event:

1. Merge the change to `main`. Netlify and Render deploy automatically.
2. Verify the deploy: load the site, then run the Postman collection against
   the production environment (see [Testing](testing.md#running-against-production)).
3. Move the entries under `Unreleased` in [`CHANGELOG.md`](../CHANGELOG.md)
   into a new dated version heading.

Bump the version in the root `package.json` when the change is significant
enough to reference by number.

---

## Related documents

- [Architecture](architecture.md) - how the parts fit together
- [API reference](api.md) - the endpoints Render serves
- [Security](security.md) - the full control inventory
- [Testing](testing.md) - post-deploy verification
