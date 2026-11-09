# Development

Everything needed to run the project locally, change it, and get a change
reviewed.

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | `^22.19.0 \|\| >=24.5.0` (24 recommended) | `.nvmrc` pins 24; run `nvm use` to match. The frontend's range is the narrow one, set by Size Limit; the backend and root accept 22.13 and up |
| npm | 11+ | Ships with Node 24 |
| Resend account | - | Only needed to exercise the email path locally |
| Chromium for Playwright | - | Only for the browser tests: `npx playwright install chromium` once, in `frontend/` |

The root `.npmrc` sets `engine-strict=true`, so `npm run install:all` on an
unsupported Node version fails immediately rather than breaking at runtime. npm
passes that setting on to the two installs the script runs. An `npm install` or
`npm ci` run inside `frontend/` or `backend/`, or with `--prefix`, does not read
the root `.npmrc` and only warns, which is also why CI, Netlify and Render do
not enforce `engines`.

---

## Setup

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
npm run install:all
```

`install:all` installs both projects. Then configure each side:

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
against everything except delivery itself. `backend/.env.example` leaves the
three mail variables empty so that an unedited copy behaves exactly like that.

---

## Scripts

Run from the repository root. Most delegate into `frontend/` or `backend/`, so
there is no need to change directories.

| Script | What it does |
|--------|--------------|
| `npm run install:all` | Install dependencies for `frontend/` and `backend/` |
| `npm run dev:frontend` | Vite dev server with HMR on port 5173 |
| `npm run dev:backend` | Express with `node --watch` on port 5000 |
| `npm run build` | The prebuild gate (below), then a production build of the frontend into `frontend/dist/`, prerendered |
| `npm run lint` | ESLint over the frontend, then the backend |
| `npm test` | Backend API test suite (`node --test`) |
| `npm run test:invariants` | Repository invariants in `test/invariants.test.js` |
| `npm start` | Backend in production mode |

Inside `frontend/` there are also:

| Script | What it does |
|--------|--------------|
| `npm test` | The content tests in `test/data.test.js` |
| `npm run preview` | Serves the built `dist/` for a final look. The only way to see the prerendered page locally, since the dev server renders on the client, but it ignores `public/_headers` |
| `npm run size` | Size Limit budgets, against an existing build |
| `npm run test:e2e` | The Playwright and axe browser suite, against an existing build served with its real CSP |

`backend/` has `npm run lint` and `npm test` of its own, which the root scripts
call. What each suite covers, and how to run the browser tests, is in
[Testing](testing.md).

### The prebuild gate

`frontend/package.json` has a `prebuild` script, which npm runs before every
`npm run build`, from the root or inside `frontend/`: frontend lint, the content
tests, then the repository invariants. It exists for Netlify, whose build
command is `npm run build`, so a commit that fails any of the three never
replaces the live site (see
[Deployment](deployment.md#the-netlify-build-gate)). Locally it costs a few
seconds and catches the same failures before you push.

To skip it deliberately, for instance while working on a build problem with a
lint error you already know about, run `npm run build --ignore-scripts` inside
`frontend/`. CI does exactly that, because it runs the three checks as separate
steps.

`node scripts/gen-og-card.mjs` regenerates the social card. It needs `sharp`,
`fontkit` and `wawoff2`, which are installed on demand rather
than kept as dependencies - see [Design](design.md#generated-assets).

`node frontend/scripts/fetch-github-activity.mjs` refreshes the contribution
snapshot and needs no install - see [below](#updating-site-content).

---

## Dependencies

Both projects keep their own `package.json` and lockfile; there is no npm
workspace linking them, so every command below runs per side.

```bash
npm outdated --prefix backend      # what has moved
npm update   --prefix backend      # apply everything inside the existing ranges
npm audit --omit=dev --audit-level=high --prefix backend   # the gate CI enforces
```

Dependabot opens grouped weekly PRs for minor and patch bumps, each release at
least seven days old, and is the normal path for keeping current, so a manual
`npm update` is usually only needed between runs. Majors are deliberately
excluded from those PRs and are done by hand: read the upgrade guide, bump the
range in `package.json`, then run the full local gate before pushing
(`npm run lint` and `npm test` in `backend/`; `npm run build`, which lints and
runs the content tests and invariants first, then `npm run size` and
`npm run test:e2e` in `frontend/`). A new dependency's own `engines` can narrow
the project's: Size Limit 14 is why the frontend needs Node 22.19 or 24.5.

Run `npm run install:all` after pulling a Dependabot merge. Otherwise
`node_modules` stays behind the lockfile, and local builds run on older versions
than CI and Netlify do.

Two rules are worth stating explicitly:

- **Commit the lockfile with the `package.json` change.** CI installs with
  `npm ci`, which fails outright if the two disagree.
- **A transitive advisory is still your advisory.** `npm audit fix` resolves
  most of them by tightening a nested version in the lockfile alone, which is a
  lockfile-only commit and needs no `package.json` edit. The weekly Dependabot
  PRs will not clear one for you, because they only bump what `package.json`
  names directly.

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
| `ALLOWED_ORIGINS` | no | Comma-separated origin allow-list. Unset uses the built-in defaults (`http://localhost:5173` and the three live domains). Set, it replaces them rather than adding to them, so list every origin that should keep working |

Missing mail variables are reported once at boot with a `[env] missing: …`
warning rather than failing the process, so the site stays up if the mail
provider is misconfigured. Any non-empty value counts as set, which is why the
template leaves all three empty: a copied placeholder would skip the warning and
turn the `503` into a `502` from a send that cannot succeed.

### `frontend/.env`

| Variable | Required | Purpose |
|----------|----------|---------|
| `VITE_API_BASE_URL` | no | Backend URL override. Defaults to the deployed Render backend. A new origin in production also needs `connect-src` in `frontend/public/_headers` and the `dns-prefetch` in `index.html`: see [Deployment](deployment.md#environment-variables) |

`VITE_`-prefixed values are inlined into the client bundle at build time. Never
put a secret in one.

The template sets `VITE_API_BASE_URL=http://localhost:5000`, so with a copied
`frontend/.env` every local build calls your local backend, `npm run build`
included. That is what you want for the contact form, and what the browser
tests refuse: build with the variable empty before `npm run test:e2e` (see
[Testing](testing.md#browser-tests)).

---

## Updating site content

Entries, figures and links live in `frontend/src/data/`. Components read from
it and render automatically, so adding a project or a job is a data change. A
few pieces of prose are tied to one component and live there instead:

| Change | File |
|--------|------|
| New job or internship | `experience.js` |
| New project | `projects.js` - array order is page order; each card carries exactly one of `github` or `sourceNote` |
| New skill group or tag | `skills.js` |
| Approach copy, a stat, a degree, a target role | `about.js` |
| Name, email, resume link, socials, GitHub username, section order | `portfolio.js` |
| A place on the globe | `about.js`: `locations` and its caption |
| GitHub contribution graph | Generated, do not edit: `github-activity.json`, see below |
| The hero's headline, lead and graduation note | `components/sections/Hero.jsx` |
| A section's subtitle | That section's component, passed to `SectionHeader` |
| The contact panel's text and the form's messages | `components/sections/Contact.jsx` |

Four rules keep the data layer honest. `npm test` in `frontend/` checks the
first, third and fourth; the second rests on whoever writes the copy:

1. **Stats in `about.js` are aggregates, not new claims.** Every figure there
   is already stated in `experience.js` or `projects.js` - the 985-test tile,
   for instance, restates the MemorAIz experience bullet. Change one without
   the other and the test fails rather than the page contradicting itself.
2. **Every claim must be checkable.** Project copy is written from the
   project's own repository or report. A figure that cannot be traced to one
   does not go on the page.
3. **Entries match their neighbours' density.** Project descriptions run 32 to
   53 words, highlights 9 to 26, with four or five stack chips; experience
   bullets 12 to 26 words. When a new fact arrives, drop an older one rather
   than growing the entry.
4. **Copy stays inside the font subset.** Arrows, curly symbols and the like
   render in a fallback face, so use `react-icons` for them. The test reads
   every export of every data module; prose in the components listed above is
   held to the same rule by hand.

The command palette builds its entries from these files, so new content reaches
it without being listed again; only its fixed links live in `commands.js`.

### Facts stated twice

`frontend/index.html` carries its own copy of the content for crawlers and link
previews, and nothing compares it with the data modules. A change of name,
role, degree, headline, contact details, socials or location therefore also
needs:

- `index.html`: the meta description, the Open Graph and Twitter text, and the
  `Person` JSON-LD (`jobTitle`, `alumniOf`, `knowsAbout`, `sameAs` and the rest)
- `frontend/public/humans.txt`, which names the contact details, socials and
  location
- for the name, role or headline, the `NAME`, `ROLE` and `BLURB` constants in
  `scripts/gen-og-card.mjs`, and a regenerated card (see
  [Design](design.md#generated-assets))

Any user-visible content change also moves three dates together: `dateModified`
in the `ProfilePage` JSON-LD in `index.html`, `<lastmod>` in
`public/sitemap.xml` and `Last update` in `public/humans.txt`. The repository
invariants fail if the three disagree, but cannot tell whether they are
current, so moving them is still part of the change. The weekly snapshot commit
does not count as a content change.

The contribution graph reads a committed snapshot. The
`refresh-activity.yml` workflow refreshes it every Monday and commits the result,
which also triggers a Netlify deploy, so a local `main` will need a `git pull`. To refresh
it by hand, run `node frontend/scripts/fetch-github-activity.mjs`. A failed run
leaves the last good snapshot in place. Deleting the workflow stops the commits,
and the graph then shows its age in its label.

A new section needs an entry in `sections` in `portfolio.js`, a component in
`components/sections/`, and a line in the `SECTION_COMPONENTS` map in
`App.jsx`, plus an icon in `SECTION_ICONS` in `Dock.jsx` (it falls back to a
generic one). Its `SectionHeader` id must be `<section id>-title`.

Visual changes are governed by the token system - read
[Design](design.md) before touching colours, type sizes or the Projects grid.

---

## Code conventions

- **ES modules everywhere**, both projects. Both `package.json` files set
  `"type": "module"`.
- **Imports use the `@/` alias** in the frontend rather than relative paths
  that climb directories.
- **Editor settings come from `.editorconfig`**: UTF-8, LF, two-space indent,
  final newline, trimmed trailing whitespace (except in Markdown, where
  trailing spaces are a line break).
- **Line endings are normalized to LF** by `.gitattributes`: checkouts get LF on
  every OS, and a file an editor saves with CRLF produces no whole-file diff.
- **Comments explain why, not what.** The existing code comments are the
  reference for tone and density; match them rather than annotating obvious
  lines.
- **No em dashes** in code, comments, copy or docs. This is a deliberate
  house style, applied across the repository, and the repository invariants
  fail on any tracked or new file that has one.

`npm run lint` from the root lints both projects. Each has its own flat config
built on ESLint's recommended rules: the frontend adds the React Hooks and
React Refresh plugins for the browser, and `backend/eslint.config.js` sets Node
globals. They hold correctness, not formatting; style is held by
`.editorconfig` and review.

---

## Development workflow

1. Branch from `main`, which is what deploys. CI does not hold a deploy back:
   Netlify builds every push whatever CI reports, stopped only by its own
   prebuild gate, and Render deploys every push unconditionally, so run the
   checks before merging.
2. Make the change, keeping documentation in step with behaviour.
3. Run the checks that apply:
   ```bash
   npm run lint                         # frontend and backend
   npm test --prefix frontend           # content changes
   npm run test:invariants              # any change
   npm run build                        # frontend changes; runs the three above first
   npm run size --prefix frontend       # frontend changes, after the build
   npm run test:e2e --prefix frontend   # UI changes, after a build with VITE_API_BASE_URL empty
   npm test                             # backend changes
   ```
4. Update the Postman collection if you changed the API surface, and
   [`CHANGELOG.md`](../CHANGELOG.md) if the change is user-visible.
5. Open a PR and fill in the template. CI runs lint, the content tests, the
   invariants, a build, the size budgets, the browser suite, the backend tests,
   `npm audit` and a gitleaks scan on every push to `main` and every pull
   request against it.

Full contributor guidance, including commit message conventions, is in
[`CONTRIBUTING.md`](../CONTRIBUTING.md).

---

## Troubleshooting

**`npm run install:all` fails with `EBADENGINE` / "Unsupported engine".**
Your Node version is outside the frontend's `^22.19.0 || >=24.5.0`, or below the
backend's 22.13. Run `nvm use` (or install Node 24). This is `engine-strict=true`
in the root `.npmrc` doing its job; an install inside `frontend/` or `backend/`
prints the same warning without stopping.

**`npm run build` stops before Vite starts.**
The prebuild gate failed: an ESLint error, a content test or a repository
invariant. The output above the npm error names which, and each invariant's
message says what to change. Fix it, or for a deliberate local build skip the
gate with `npm run build --ignore-scripts` inside `frontend/`. Netlify cannot
skip it, so the same commit would not deploy.

**`npm run test:e2e` exits with "frontend/dist was built with VITE_API_BASE_URL set".**
`frontend/.env` pointed the build at your local backend, and the real CSP the
suite serves would block that origin. Rebuild with the variable set to the
production origin, which works in any shell:
`VITE_API_BASE_URL=https://portfolio-backend-kmum.onrender.com npm run build` in
bash, or `$env:VITE_API_BASE_URL='https://portfolio-backend-kmum.onrender.com'`
then `npm run build` in PowerShell (the variable lasts for that session).
Clearing it with `''` instead works in bash and PowerShell 7.5+, but older
PowerShell deletes an empty variable, so the build reads `frontend/.env` again.
"frontend/dist is missing" means there is no build at all yet.

**`npm run test:e2e` fails with "Executable doesn't exist".**
Playwright's browser is not installed for this version. Run
`npx playwright install chromium` in `frontend/`, once per machine and again
after a Playwright upgrade.

**The contact form returns `503 Email service is not configured.`**
One of `RESEND_API_KEY`, `EMAIL_FROM`, `EMAIL_TO` is missing from
`backend/.env`. The boot log lists exactly which.

**The contact form returns `502 Email delivery failed.`**
Resend rejected the send, or could not be reached at all: the SDK reports a
network failure the same way. The usual cause is an `EMAIL_FROM` address on an
unverified domain, or a placeholder API key. Use `onboarding@resend.dev` while
testing. The real provider error is in the server log, not the response.

**The browser console shows a CORS error against localhost.**
Your frontend origin is not on the allow-list. The defaults cover
`http://localhost:5173`; if Vite picked a different port because 5173 was busy,
set `ALLOWED_ORIGINS` in `backend/.env` to include that origin. It replaces the
defaults, so list `http://localhost:5173` as well if you still need it.

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

**`prerender: <div id="root"></div> not found in dist/index.html`.**
The root element in `frontend/index.html` was edited. The prerender script
finds it by exact string match, so it must stay an empty
`<div id="root"></div>`. With the prebuild gate in place, the repository
invariants report this before the build starts.

**`git push` is rejected as non-fast-forward on `main`.**
The weekly workflow may have committed a new contribution snapshot since your last
pull. Run `git pull --rebase` and push again.

**A hydration error in the browser console.**
Something renders differently at build time than in the browser: a date, a
random value, or a read of `window` during render. Move browser-only values
into an effect, or fix them at build time as the footer year is.

**Analytics stopped reporting after an edit to `index.html`.**
The inline analytics snippet is pinned in the CSP by SHA-256 hash. Any change,
including whitespace, invalidates it and the browser blocks the script with no
visible symptom. The repository invariants now fail on it first, with the new
value in the message, so this should only reach the live site if the gate was
skipped. Recompute the hash - see
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
- [Testing](testing.md) - what the suites, budgets and link check cover, and how to run them
- [Design](design.md) - the token system and layout invariants
- [Deployment](deployment.md) - Netlify, Render and the header files
