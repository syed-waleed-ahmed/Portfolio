# Development

Everything needed to run the project locally, change it, and get a change
reviewed.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | >= 22.13 (24 recommended) | `.nvmrc` pins 24; run `nvm use` to match |
| npm | 11+ | Ships with Node 24 |
| Resend account | - | Only needed to exercise the email path locally |

`.npmrc` sets `engine-strict=true`, so an install on an unsupported Node
version fails immediately rather than breaking at runtime.

---

## Setup

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
npm run install:all
```

`install:all` installs both workspaces. Then configure each side:

```bash
cp backend/.env.example backend/.env      # fill in Resend values
cp frontend/.env.example frontend/.env    # optional, local API override
```

Run the two servers in separate terminals:

```bash
npm run dev:backend    # http://localhost:5000
npm run dev:frontend   # http://localhost:5173
```

The frontend calls the deployed backend unless `VITE_API_BASE_URL` points it
somewhere else, so set that in `frontend/.env` when working on the contact form.

Without Resend credentials the backend still boots and serves every route; the
contact endpoint returns `503` instead of sending. That is enough to develop
against everything except delivery itself.

---

## Scripts

Run from the repository root. Each one delegates into a workspace, so there is
no need to change directories.

| Script | What it does |
|--------|--------------|
| `npm run install:all` | Install dependencies for `frontend/` and `backend/` |
| `npm run dev:frontend` | Vite dev server with HMR on port 5173 |
| `npm run dev:backend` | Express with `node --watch` on port 5000 |
| `npm run build` | Production build of the frontend into `frontend/dist/` |
| `npm run lint` | ESLint over the frontend |
| `npm test` | Backend API test suite (`node --test`) |
| `npm start` | Backend in production mode |

Inside `frontend/` there is also `npm run preview`, which serves the built
`dist/` for a final check before deploying.

Two workspace-level scripts are worth knowing about:

- The frontend build must run with `NODE_ENV=production` for PurgeCSS to
  engage. Netlify and CI both set it; if you build by hand and the CSS comes
  out at ~46 KB rather than ~10 KB gzipped, that is the missing variable.
- `node scripts/gen-og-card.mjs` regenerates the social card. It needs `sharp`
  and `fontkit`, which are installed on demand rather than kept as
  dependencies - see [Design](design.md#generated-assets).

---

## Dependencies

Both workspaces keep their own `package.json` and lockfile; there is no npm
workspace linking them, so every command below runs per side.

```bash
npm outdated --prefix backend      # what has moved
npm update   --prefix backend      # apply everything inside the existing ranges
npm audit --omit=dev --audit-level=high --prefix backend   # the gate CI enforces
```

Dependabot opens grouped weekly PRs for minor and patch bumps and is the normal
path for keeping current, so a manual `npm update` is usually only needed
between runs. Majors are deliberately excluded from those PRs and are done by
hand: read the upgrade guide, bump the range in `package.json`, then run the
full local gate (`npm test` for the backend, `npm run lint` and `npm run build`
for the frontend) before pushing.

Two rules are worth stating explicitly:

- **Commit the lockfile with the `package.json` change.** CI installs with
  `npm ci`, which fails outright if the two disagree.
- **A transitive advisory is still your advisory.** `npm audit fix` resolves
  most of them by tightening a nested version in the lockfile alone, which is a
  lockfile-only commit and needs no `package.json` edit.

The audit gate covers production dependencies at high severity and above. A
dev-dependency finding does not fail CI, but it is still worth clearing while
the fix is a one-line lockfile bump.

---

## Configuration

Both `.env.example` files are annotated templates and are the canonical
reference for what each variable does. The tables below are the summary.

### `backend/.env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `PORT` | no | Listen port. Defaults to 5000; Render sets it automatically |
| `NODE_ENV` | recommended | `production` suppresses error detail in responses |
| `RESEND_API_KEY` | yes | API key from [resend.com](https://resend.com) |
| `EMAIL_FROM` | yes | Verified sender, or `onboarding@resend.dev` for testing |
| `EMAIL_TO` | yes | Where submissions are delivered |
| `ALLOWED_ORIGINS` | no | Comma-separated origin allow-list. Unset uses the built-in defaults (localhost + the live domains) |

Missing mail variables are reported once at boot with a `[env] missing: …`
warning rather than failing the process, so the site stays up if the mail
provider is misconfigured.

### `frontend/.env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | no | Backend URL override. Defaults to the deployed Render backend |

`VITE_`-prefixed values are inlined into the client bundle at build time. Never
put a secret in one.

---

## Updating site content

All copy lives in `frontend/src/data/`. Components read from it and render
automatically, so adding a project or a job is a data change:

| Change | File |
|--------|------|
| New job or internship | `experience.js` |
| New project | `projects.js` - set `featured: true` for the centrepiece card |
| New skill group or tag | `skills.js` |
| New role, principle or topic | `interests.js` |
| Approach copy, a stat, a degree | `about.js` |
| Name, resume link, socials, nav items | `portfolio.js` |

Two rules keep the data layer honest:

1. **Icons are keys, not components.** Add the key to the section's lookup map
   as well as to the data entry, or the icon silently renders as nothing.
2. **Stats in `about.js` are aggregates, not new claims.** Every figure there
   is already stated in `experience.js` or `projects.js`. Change one without
   the other and the page contradicts itself.

Visual changes are governed by the token system - read
[Design](design.md) before touching colours, type sizes or the Projects grid.

---

## Code conventions

- **ES modules everywhere**, both workspaces. `backend/package.json` sets
  `"type": "module"`.
- **Imports use the `@/` alias** in the frontend rather than relative paths
  that climb directories.
- **Editor settings come from `.editorconfig`**: UTF-8, LF, two-space indent,
  final newline, trimmed trailing whitespace (except in Markdown, where
  trailing spaces are a line break).
- **Line endings are normalized to LF** by `.gitattributes`, so a Windows
  checkout can keep CRLF locally without producing whole-file diffs.
- **Comments explain why, not what.** The existing code comments are the
  reference for tone and density; match them rather than annotating obvious
  lines.
- **No em dashes** in code, comments, copy or docs. This is a deliberate
  house style, applied across the repository.

Lint the frontend with `npm run lint` before opening a PR. The backend has no
linter; it is small enough that the test suite plus review covers it.

---

## Development workflow

1. Branch from `main`. `main` is protected by CI and is what deploys.
2. Make the change, keeping documentation in step with behaviour.
3. Run the checks that apply:
   ```bash
   npm run lint     # frontend changes
   npm run build    # frontend changes
   npm test         # backend changes
   ```
4. Update the Postman collection if you changed the API surface, and
   [`CHANGELOG.md`](../CHANGELOG.md) if the change is user-visible.
5. Open a PR and fill in the template. CI runs lint, build, tests, `npm audit`
   and a gitleaks scan on every push and PR.

Full contributor guidance, including commit message conventions, is in
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Troubleshooting

**`npm install` fails with `EBADENGINE` / "Unsupported engine".**
Your Node version is below 22.13. Run `nvm use` (or install Node 24). This is
`engine-strict=true` in `.npmrc` doing its job.

**The contact form returns `503 Email service is not configured.`**
One of `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` is missing from
`backend/.env`. The boot log lists exactly which.

**The contact form returns `502 Email delivery failed.`**
Resend rejected the send. The usual cause is an `EMAIL_FROM` address on an
unverified domain. Use `onboarding@resend.dev` while testing. The real provider
error is in the server log, not the response.

**The browser console shows a CORS error against localhost.**
Your frontend origin is not on the allow-list. The defaults cover
`http://localhost:5173`; if Vite picked a different port because 5173 was busy,
add that origin to `ALLOWED_ORIGINS` in `backend/.env`.

**The contact form fails with a connection error against localhost.**
`VITE_API_BASE_URL` in `frontend/.env` and `PORT` in `backend/.env` have to
name the same port. Both templates default to 5000, as do the docs and the
Postman local environment; change one and you have to change the other. Note
that Vite reads `.env` at startup, so restart the dev server after editing it.

**The contact form works in Postman but not in the browser.**
Same cause. Postman sends no `Origin` header and so is never subject to CORS,
while the browser is. Check the response for an `Access-Control-Allow-Origin`
header.

**`429 Too many requests` while testing.**
The limiter allows 5 submissions per IP per 15 minutes. Restart the backend to
clear the in-memory counter.

**The built CSS is ~46 KB instead of ~10 KB gzipped.**
The build ran without `NODE_ENV=production`, so PurgeCSS was skipped and all of
Bootstrap shipped.

**Analytics stopped reporting after an edit to `index.html`.**
The inline analytics snippet is pinned in the CSP by SHA-256 hash. Any change,
including whitespace, invalidates it and the browser blocks the script with no
visible symptom. Recompute the hash - see
[Deployment](deployment.md#the-inline-analytics-hash).

**Stale content on the live site after a deploy.**
HTML and images revalidate on every visit, so a hard refresh should be enough.
If a visitor is stuck on a much older build, they may still have the retired
service worker installed - see
[Deployment](deployment.md#stale-service-worker-recovery).

---

## Related documents

- [Architecture](architecture.md) - how the pieces fit together
- [API reference](api.md) - endpoints and error codes
- [Testing](testing.md) - what the suites cover and how to run them
- [Design](design.md) - the token system and layout invariants
- [Deployment](deployment.md) - Netlify, Render and the header files
