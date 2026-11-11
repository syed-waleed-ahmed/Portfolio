# Testing

Seven layers, each catching something the others cannot:

| Layer | Tool | Scope | Where it runs |
|-------|------|-------|---------------|
| API tests | `node --test` | Backend routing, validation, limits, the honeypot, CORS | Locally and in CI |
| Content tests | `node --test` | Frontend content rules in `src/data/` | Locally, in CI and in Netlify's build |
| Repository invariants | `node --test` | Pairs of files that must agree: the CSP hash, the palette copies, the mirrored form rules, the dates, the Node version, the house style | Locally, in CI and in Netlify's build |
| Browser tests | Playwright + axe-core | The built page in Chromium under its real CSP | Locally and in CI |
| Bundle budgets | Size Limit | Gzipped size of the entry bundle and each lazy chunk | Locally after a build, and in CI |
| Link check | lychee | Every link in the data modules, `index.html`, `humans.txt` and the docs | Weekly in GitHub Actions, and on demand |
| Manual / live | Postman | The API against a running server, local or production | On demand |

CI runs on every push to `main` and every pull request against it. Netlify runs
the lint, content and invariant checks itself before it builds: see
[Deployment](deployment.md#the-netlify-build-gate).

The frontend has no component tests. Its gates are ESLint, the content tests,
the invariants, a production build and the browser suite. The build compiles and
prerenders the whole app in Node, so a broken import or a component that throws
during render fails it, and the browser suite drives the two stateful
components, the contact form and the command palette, from the outside. See
[Gaps](#gaps) below.

---

## API tests

```bash
npm test              # from the repository root
npm test --prefix backend   # equivalent
cd backend && node --test --test-name-pattern="honeypot"   # a subset by name
```

Eighteen tests in two files, using Node's built-in runner with no extra
dependencies: fourteen in `backend/test/contact.test.js` with the mailer
unconfigured, and four in `backend/test/delivery.test.js` with it configured
against a fake Resend (see below). They import the Express app directly and bind
an ephemeral port, which is why they never collide with a dev server on 5000.
Each file runs in its own process, so the two configurations never meet.

| Test | Asserts |
|------|---------|
| `GET /health returns ok` | `200` and `status: "ok"` |
| `GET / returns running status` | `200` and `status: "ok"` |
| `POST /api/contact rejects missing fields with 400, naming the first` | `400` with exactly `Missing required field: name.` |
| `POST /api/contact rejects an invalid email with 400` | `400` with exactly `Invalid email address.` |
| `POST /api/contact rejects an over-length field with 400` | `400` with exactly `Field "name" is too long.`, on a 101-character name against the 100 cap |
| `POST /api/contact rejects a body over the 16kb cap with 413` | `413`, `Payload too large.`, and **no** `RateLimit-Remaining` header, proving the cap runs before the limiter |
| `POST /api/contact rejects malformed JSON with 400, before the limiter` | `400`, `Malformed JSON body.`, and no `RateLimit-Remaining` header, for the same reason |
| `POST /api/contact reaches the mailer with a valid body, which is unconfigured here` | `503` with `Email service is not configured.` |
| `POST /api/contact answers a tripped honeypot exactly as a real send` | `200` with exactly the body a delivered message gets, `{ success: true, message: "Message sent successfully." }` |
| `POST /api/contact gives an invalid body the same 400 with or without the honeypot` | The same status and body as the same request without the field |
| `POST /api/contact ignores an empty honeypot field` | `503`, proving an empty trap does not count as tripped and the request goes on to the mailer |
| `CORS answers an allowed origin and stays silent for any other` | An allowed origin, read from `config.allowedOrigins`, gets `Access-Control-Allow-Origin`; a disallowed one gets `200` and no such header |
| `POST /api/contact rate-limits the sixth request from one address` | Five invalid requests get `400`; the sixth gets `429`, `RateLimit-Remaining: 0` and the limiter's message |
| `unknown route returns 404` | `404` with exactly `{ success: false, error: "Not found." }` |

`delivery.test.js` configures the mailer with fake credentials and sets
`RESEND_BASE_URL` to `https://resend.invalid` (a top-level domain reserved never
to resolve), then answers the SDK's request itself and keeps what it would have
sent. So it can compare a real send with a trapped one, and read the email:

| Test | Asserts |
|------|---------|
| `a delivered message and a tripped honeypot get byte-identical responses` | Both `200` with the same body, which has no `id`; only the real one reached Resend |
| `the email goes to the owner, with the sender as Reply-To` | `from`, `to`, the Reply-To address, the `Portfolio: ` subject prefix and a UTC timestamp |
| `the sender's address cannot add parameters to the reply link` | An address with `?bcc=...&subject=...` appears URL-encoded in the `mailto:` links, never raw |
| `one-line fields cannot forge lines in the plain-text part` | A newline in the name or subject is flattened, so the text part has one `Email:` line |

Three properties of this suite are deliberate:

- **Importing `server.js` is itself a test.** A broken or missing import
  anywhere in `config/` or `services/` fails the whole suite, so CI catches a
  module-level mistake even in code no test exercises directly.
- **No email is ever sent, whatever `backend/.env` holds.** `contact.test.js`
  blanks `RESEND_API_KEY`, `EMAIL_FROM` and `EMAIL_TO` before it imports the app,
  and dotenv never overrides a variable that is already set, so the mailer is
  unconfigured there and a valid body stops at it with `503`, which one test
  checks. `delivery.test.js` sets fake values the same way and sends to
  `resend.invalid`, which cannot resolve even if its stub ever missed. The suite
  passes identically with or without Resend credentials.
- **Each test that spends rate-limit quota uses its own client address.** With
  `trust proxy` set to `1` and the test client on `127.0.0.1`, the limiter keys on
  the `X-Forwarded-For` each request sends, so the counter that persists for the
  whole run can never push a later test into a `429`. The rate-limit test sends
  invalid bodies, so not even a misconfigured run could send mail.

---

## Frontend content tests

```bash
npm test --prefix frontend
npm test --prefix frontend --silent -- --test-name-pattern=density   # a subset by name
```

Twelve checks in `frontend/test/data.test.js`, on the same built-in runner with
no dependencies. The data files are plain modules, so they import without a
bundler. They also run in Netlify's build, through the prebuild gate.

| Test | Asserts |
|------|---------|
| `every About figure appears in an entry that names its source` | Every stat in `about.js` appears in an Experience or Projects entry that names its source |
| `project cards keep a matching density` | Descriptions 32-53 words, highlights 9-26, four or five stack chips |
| `every project card fills its last row, with a link or a note` | Every card carries exactly one of `github` and `sourceNote` |
| `experience bullets stay within the shared length range` | Every bullet 12-26 words |
| `titles, keys and tags are unique` | Project titles, companies, section ids, stats and skill tags (several are React keys) |
| `section ids are valid fragment identifiers` | Lowercase ids with a label, and none collides with the hero's `top` |
| `links are absolute https URLs` | The resume, socials, repositories and demos are `https`; project repositories are on GitHub; a demo only on a card with a repository; a valid email |
| `command palette entries point somewhere real` | Every entry jumps to a real section or opens an `https` URL |
| `command palette ids and labels are unique` | Entry ids and labels are unique |
| `command palette search finds what was asked for` | Searches land on the right entry (a technology on the project's source before its demo), and nonsense matches nothing |
| `the GitHub activity snapshot is a usable year of days` | At least 300 valid days, in date order |
| `all copy is drawable by the self-hosted font subset` | No export of any data module uses a character outside the font's `unicode-range` |

---

## Repository invariants

```bash
npm run test:invariants      # from the repository root
```

Sixteen tests in `test/invariants.test.js` at the repository root, on the same
runner with no dependencies. Each pins a coupling that fails silently: two files
that must agree, where a mismatch breaks nothing a build or a glance would
catch. They read source files only, never build output, so they run before a
build as well, and every failure message says what to change.

| Test | Asserts |
|------|---------|
| `the CSP pins the hash of the inline analytics script` | `index.html` holds exactly one inline executable `<script>` (found in any letter case and with any attributes; JSON-LD and `src` scripts excluded), and the `sha256-` source in `_headers` is its hash, CRLF normalised |
| `index.html keeps the exact root element the prerender looks for` | `<div id="root"></div>` appears exactly once |
| `the portrait preload matches the AVIF source in Hero.jsx` | `imagesrcset` and `imagesizes` equal the AVIF `srcSet` and `PORTRAIT_SIZES` |
| `the theme-color metas and 404.html use the token palette` | Both theme-color metas equal `--color-bg`, and every hex colour in `404.html` is a token |
| `the social card script copies the token palette` | Each colour constant in `scripts/gen-og-card.mjs` equals the token named in its comment |
| `the contact email's BRAND copies the token palette` | `accent`, `accent2` and `ink` equal `--color-indigo`, `--color-accent` and `--color-bg` |
| `the contribution graph's scale is the accent mixed into the surface` | `THEME` is `--color-surface-raised`, the accent over `--color-surface` at 25, 50 and 75%, then the accent |
| `the globe's WebGL cyan is the accent` | `CYAN` is `--color-accent` as 0-1 fractions |
| `the three last-modified dates agree` | `dateModified` in `index.html`, `<lastmod>` in `sitemap.xml` and `Last update` in `humans.txt` name the same day |
| `the Node version is pinned the same way everywhere` | `.nvmrc` and `NODE_VERSION` in `netlify.toml` name the same major, and every `engines.node` admits it |
| `the three manifests and the newest changelog release name one version` | The root, frontend and backend `package.json` versions equal the newest `## [X.Y.Z] - date` heading in `CHANGELOG.md` |
| `the contact form's fields, email pattern and honeypot match the API` | Field names and caps, `EMAIL_RE` and the honeypot name agree between `Contact.jsx` and `contactRoutes.js` |
| `the CSP and the DNS hint name the API origin the form calls` | The default origin in `Contact.jsx` is in `connect-src` and is the `dns-prefetch` target |
| `the graph and the globe switch at the breakpoint the calendar measures` | `GitHubActivity.css` and `LocationGlobe.css` both use the `WIDE` query from `GitHubActivityCalendar.jsx` |
| `no file uses an em dash` | No tracked file, and no new file git does not ignore, contains U+2014 |
| `the data modules import nothing a bare Node process cannot load` | Data modules import only relative `.js` paths, and `portfolio.js` imports nothing |

The dates test only checks that the three agree, not that they are current:
moving them when content changes is still a manual step.

---

## Browser tests

```bash
cd frontend
npx playwright install chromium   # once per machine, and after a Playwright upgrade
npm run build
npm run test:e2e
```

Twenty tests in `frontend/e2e/site.spec.js`, on Playwright Test with
`@axe-core/playwright`, against the built and prerendered site.
`e2e/serve.mjs` serves `frontend/dist` on `127.0.0.1:4174` with the `/*` headers
from `dist/_headers`, so the suite runs under the CSP visitors get (which
`vite preview` ignores), and answers unknown paths with `404.html` as Netlify
does. Analytics and the backend are answered inside the test with `page.route`,
so the suite never touches the network and never sends mail.

**Build against the production API origin.** `frontend/.env` sets
`VITE_API_BASE_URL` for work on the contact form, and Vite inlines it, so that
build calls `localhost`, which the real CSP blocks. `serve.mjs` looks for the default origin in the entry chunk and
refuses such a build with the fix, rather than letting the contact tests fail
with "could not be reached":

```bash
# Setting the production origin works in every shell. Clearing the variable
# with '' also works in bash and PowerShell 7.5+, but older PowerShell deletes
# an empty variable, and the build reads frontend/.env again.
VITE_API_BASE_URL=https://portfolio-backend-kmum.onrender.com npm run build    # bash
$env:VITE_API_BASE_URL='https://portfolio-backend-kmum.onrender.com'; npm run build   # PowerShell
```

| Test | Asserts |
|------|---------|
| `loads under the real CSP with no errors, and analytics and the font load` | No console error (React reports a hydration mismatch there), page error or CSP violation over a full scroll; the analytics loader adds its tag, so its hash in `_headers` is current; Hanken Grotesk loads |
| `reveals everything that starts below the fold` | No `[data-reveal="pending"]` remains after a scroll through |
| `every revealed element keeps the reveal's fade` | Every `[data-reveal]` element still transitions `opacity`: a component rule that sets its own `transition` replaces the reveal's, as the project cards once did |
| `has no horizontal overflow at <width>px`, five tests | No horizontal scroll at 320, 390, 768, 1440 and 1920px, with the lazy graph and globe loaded |
| `axe finds no WCAG 2.2 A or AA violations on desktop` and `on phone` | No axe violations for the WCAG 2.0, 2.1 and 2.2 A and AA tags, at 1440 and 390px, under reduced motion so axe reads final colours |
| `axe finds no violations with the command palette open` | The same scan with the dialog open |
| `opens with Ctrl+K, runs a search, and gives focus back on Escape` | The input is focused; "copy email" and Enter announce the copy; Escape closes the dialog |
| `returns focus to the Search button it was opened from` | Focus is back on the dock's Search button after Escape |
| `the dock's Home link returns to the very top of the page` | `scrollY` is 0, so the masthead is in view, not just the hero |
| `posts rather than gets, and keeps its live region in the accessibility tree` | The prerendered form has `method="post"`; the status region is rendered and not `display: none` while empty |
| `an empty submit focuses the first field and marks it invalid` | Name has focus and `aria-invalid="true"` |
| `a successful send is announced in the live region` | A mocked `200` puts the thank-you in the live region and clears the form |
| `a rate-limited send explains the wait and offers email` | A mocked `429` shows the 15-minute message with a `mailto:` link |
| `the contribution graph fits a phone without its own scroller` | At 390px the library's own scroll container has nothing to scroll |
| `printing shows content the visitor had not scrolled to` | Under print media every `[data-reveal]` element has opacity 1 |

The suite runs in Chromium only, with four workers locally and two in CI, where
a failed test gets one retry. Locally there is none, so a flaky test shows up
where it can be fixed. Results print to the terminal, and a trace of each failed
test goes to `frontend/test-results/`. CI also writes an HTML report to
`frontend/playwright-report/` and uploads it as an artifact when the job fails,
kept for 14 days. Both folders are gitignored.

---

## Bundle size budgets

```bash
npm run build
npm run size --prefix frontend
```

Size Limit measures the gzipped output in `frontend/dist/assets/` against the
budgets in `frontend/.size-limit.json`, so it needs a build first.

| Budget | Files | Limit |
|--------|-------|-------|
| Entry JS, which every visitor downloads | `index-*.js` | 87 kB |
| Entry CSS | `index-*.css` | 8 kB |
| Command palette, `cmdk` | `CommandPalette-*.js` and `.css` | 20 kB |
| Contribution graph, `react-activity-calendar` | `GitHubActivityCalendar-*.js` and `Tooltip-*.js` | 27 kB |
| Globe, `cobe` | `index.esm-*.js` | 6.5 kB |

Each limit sits about 5 to 10% above what the build measured when the budgets
were set. The entry budget is the one that matters most: a static import of any
of the three lazy libraries moves it into the entry chunk and fails that budget.
To change a budget, edit `.size-limit.json` in the same commit as the change
that needs it, and give the reason in the commit message.

---

## Link check

`.github/workflows/links.yml` runs [lychee](https://github.com/lycheeverse/lychee)
every Monday at 05:47 UTC, and on demand from the Actions tab. It checks every
link in `frontend/src/data/*.js`, `frontend/index.html`,
`frontend/public/humans.txt`, the root Markdown files, `docs/*.md` and
`postman/README.md`, including the relative links between files. A broken link
fails the run, and GitHub emails the repository owner. It does not block a
deploy.

It runs weekly rather than per push because a third-party site having a bad hour
should not turn a commit red. `lychee.toml` holds the configuration: `429`
counts as alive, failures are retried three times, cookies are kept (Streamlit
Community Cloud, where two project demos run, loops a cookie-less client
through its auth redirect), and a few hosts are excluded
with the reason beside each: LinkedIn and LeetCode refuse automated clients,
the API sleeps and has no pages, the analytics loader is not a page, and the
docs quote wildcard, placeholder and loopback hosts.

To run it locally, install lychee and pass the file list from `links.yml`.
`--root-dir` resolves root-relative paths in `index.html` and must be absolute;
`--offline` checks only the links between local files:

```bash
lychee --config lychee.toml --no-progress --root-dir "$PWD/frontend/public" \
  'frontend/src/data/*.js' frontend/index.html frontend/public/humans.txt \
  README.md CONTRIBUTING.md SECURITY.md CODE_OF_CONDUCT.md 'docs/*.md' postman/README.md
```

---

## Postman collection

`postman/` holds a collection and two environments that exercise every endpoint
and every error path against a running server, including the CORS preflights
and the wrong method.

| File | Purpose |
|------|---------|
| `Portfolio-API.postman_collection.json` | Fourteen requests in four folders, with test scripts, for the whole API |
| `Portfolio-API.postman_environment.json` | `baseUrl` for local development |
| `Portfolio-API.postman_environment.production.json` | `baseUrl` for the live Render backend |

Every request carries a `pm.test()` script asserting status code and response
shape, so the collection can be run unattended in the Collection Runner.

Import both JSON files, select **Portfolio API - Local**, start the backend,
and run. Full instructions, including importing straight from GitHub without
cloning, are in [`postman/README.md`](../postman/README.md).

### Verifying the rate limiter

Open the Runner, select **POST /api/contact - Rate limit (run 6+ times)**, set
iterations to 6 or more, and run. Its body omits `name`, so it fails validation
and can never send mail. The limiter counts those requests all the same: the
first five return `400`, and the sixth returns `429` with `RateLimit-*` headers.
The limiter is in-memory, so restarting the backend clears the counter.

### Running against production

Select the **Portfolio API - Production** environment. Nothing else changes;
`baseUrl` is the only environment-specific value.

> Only the **valid submission** sends a real email. Validation, payload-too-large,
> malformed JSON, honeypot, rate-limit, CORS and 404 requests all stop before
> the mailer and are safe to run against production.

The backend is on Render's free tier, so the first request after idle may take
30 to 60 seconds to cold-start. Re-run if it times out.

---

## What CI runs

`.github/workflows/ci.yml`, on every push to `main` and every pull request
against it:

| Job | Steps |
|-----|-------|
| `frontend` | `npm ci`, `npm run lint`, `npm test`, the repository invariants, `npm run build --ignore-scripts` (which prerenders), `npm run size`, `npm audit --omit=dev --audit-level=high` |
| `e2e` | `npm ci`, `npx playwright install --with-deps chromium`, `npm run build --ignore-scripts`, `npm run test:e2e`, and the Playwright report uploaded if it fails |
| `backend` | `npm ci`, `npm run lint`, `npm test`, `npm audit --omit=dev --audit-level=high` |
| `secret-scan` | `gitleaks` over full git history |

`--ignore-scripts` skips the prebuild gate, which would repeat the lint, content
and invariant steps the `frontend` job runs on their own. The link check is a
separate weekly workflow, described [above](#link-check).

The audit gate covers **production** dependencies at high severity and above.
Dev-dependency and low-severity findings are reviewed rather than blocking a
build.

---

## Before opening a pull request

```bash
npm run lint                         # frontend and backend
npm test --prefix frontend           # content changes
npm run test:invariants              # any change
npm run build                        # frontend changes; runs the three above first
npm run size --prefix frontend       # frontend changes, after the build
npm run test:e2e --prefix frontend   # UI changes, after a build with VITE_API_BASE_URL empty
npm test                             # backend changes
```

If the change touches the API surface, update the Postman collection in the
same PR and confirm it still imports cleanly. The PR template has a checklist
covering this.

---

## Gaps

Known and accepted, listed here so nobody has to rediscover them:

- **No frontend component tests.** The site is presentational and
  data-driven; lint, the content tests and a prerendering build catch the
  failure modes that actually occur. The contact form and the command palette
  are the stateful components, and the browser suite drives both from the
  outside, so a component test runner would cover the same two from the inside.
  The palette's search scoring is covered by the content tests, since it lives
  in `data/commands.js`.
- **Real delivery is never exercised automatically.** Sending real email from CI
  would need a live Resend key in the environment. `delivery.test.js` covers
  everything up to the network (the payload, the template's links and the
  plain-text part) against a fake Resend; whether Resend accepts and delivers it
  is verified by running the Postman valid submission against a configured
  backend.
- **Browser tests run in Chromium only.** The suite checks this site's
  behaviour, not browser support, so Firefox and WebKit are not run.
- **The weekly snapshot commit starts no CI run.** A push made with
  `GITHUB_TOKEN` starts no workflows. Netlify still builds it, and its prebuild
  gate runs the content tests, so a malformed snapshot fails that build and the
  previous deploy stays live. The browser suite first sees the new snapshot on
  the next ordinary push.
- **Render is not gated.** Render deploys every push to `main` whatever CI
  reports, so a backend change that fails `npm test` can still go live. The
  browser suite and the size budgets do not gate Netlify either: only lint, the
  content tests, the invariants and the build do.
- **JSX copy is outside the font-subset check.** The test reads the data
  modules; the hero's text, the section subtitles and the contact panel's text
  follow the same rule by hand.
- **No JSX accessibility lint.** `eslint-plugin-jsx-a11y` does not support ESLint
  10, so axe in the browser suite checks the rendered page instead.
- **Performance is budgeted in bytes only.** Lighthouse scores vary too much
  between runs to gate on; the size budgets catch the regression that matters
  most here, a library slipping into the entry chunk.

---

## Related documents

- [API reference](api.md) - the contract these tests assert
- [Development](development.md#troubleshooting) - failures you may hit locally
- [Deployment](deployment.md#continuous-integration) - CI jobs and the Netlify build gate
- [`postman/README.md`](../postman/README.md) - collection usage in detail
