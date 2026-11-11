# Contributing

Thanks for taking an interest. This is a personal portfolio, so the shape of a
useful contribution is a little different from a general-purpose library -
worth reading the first section before you start.

## What is welcome

- **Bug reports.** Broken layout, a console error, an accessibility problem, a
  failing request - all useful, on any browser or device.
- **Accessibility, performance and security improvements.** Always welcome.
- **Documentation fixes.** Anything inaccurate, unclear or out of date.
- **Tooling and CI improvements** that make the project easier to maintain.
- **Fork it for your own portfolio.** The MIT licence allows this. Replace the
  content in `frontend/src/data/`, the images in `frontend/public/`, and the
  contact details, then set `githubUsername` in `portfolio.js` and run
  `node frontend/scripts/fetch-github-activity.mjs` for your own contribution
  graph - no attribution required, though it is appreciated.

## What is not

- **Content changes.** The copy, projects, experience and links describe a
  specific person. Pull requests editing them will be closed.
- **Redesigns.** The visual language is deliberate and documented in
  [`docs/design.md`](docs/design.md). Targeted fixes yes, restyles no.
- **New frameworks or heavy dependencies.** The lean bundle is a feature. A PR
  adding an animation library, a UI kit or a state manager needs to argue its
  case in an issue first. A library that does earn its place loads as a separate
  chunk on intent, as the command palette, contribution graph and globe do,
  with a size budget of its own in `frontend/.size-limit.json`.

If you are unsure whether something fits, open an issue before writing code.

---

## Reporting a bug

Open an issue with the
[bug report form](https://github.com/syed-waleed-ahmed/Portfolio/issues/new?template=bug_report.yml).
There are forms for an improvement and a documentation problem too, and blank
issues are turned off, so every report arrives with what it needs:

- What you expected and what happened instead
- Steps to reproduce, with the URL or endpoint
- Browser, OS and viewport if it is a UI issue; the request body and response
  if it is an API issue
- A screenshot or console output where it helps

**Do not open a public issue for a security vulnerability.** Follow
[`SECURITY.md`](SECURITY.md) instead.

---

## Development setup

Full instructions are in [`docs/development.md`](docs/development.md). The
short version:

```bash
git clone https://github.com/syed-waleed-ahmed/Portfolio.git
cd Portfolio
npm run install:all
cp backend/.env.example backend/.env      # fill in Resend values
cp frontend/.env.example frontend/.env    # optional, local API override
npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173
```

Node `^22.19.0 || ^24.5.0 || >=26.0.0` is required (Size Limit's range);
`.nvmrc` pins 24, so `nvm use` gets you the right one. The browser tests also
need Chromium for Playwright, once: `npx playwright install chromium` in
`frontend/`.

---

## Making a change

1. **Branch from `main`.** Use a descriptive name: `fix/dock-focus-order`,
   `docs/api-error-codes`.
2. **Keep the PR focused.** One concern per pull request. A drive-by
   reformatting of an unrelated file makes review harder.
3. **Follow the existing style.** Two-space indent, ES modules, the `@/` import
   alias in the frontend (except in `src/data/`, which plain Node imports, so
   it uses relative `.js` paths), and `.editorconfig` for the rest. Comments
   explain why rather than what. The repository uses no em dashes anywhere -
   in code, comments, copy or docs.
4. **Update documentation in the same commit** as the behaviour it describes.
   Documentation that lags behind the code is the failure mode this repository
   works hardest to avoid.
5. **Update `docs/api.md` and the Postman collection** in `postman/` if you
   change the API surface, and confirm the collection still imports cleanly.
6. **Add a `CHANGELOG.md` entry** under `Unreleased` for anything user-visible.

### Before you push

```bash
npm run lint                         # frontend and backend
npm test --prefix frontend           # content changes
npm run test:invariants              # any change
npm run build                        # frontend changes; runs frontend lint and the two tests above first
npm run size --prefix frontend       # frontend changes, after the build
npm run test:e2e --prefix frontend   # UI changes, after a build against the production API origin
npm test                             # backend changes
```

CI runs the same checks plus `npm audit` and a gitleaks secret scan, so running
them locally saves a round trip. Netlify runs frontend lint, the content tests
and the invariants before every build, and keeps the previous deploy when one
fails. The browser tests refuse a build that `frontend/.env` pointed at a local
backend; how to rebuild for them is in
[`docs/testing.md`](docs/testing.md#browser-tests).

### Areas that need extra care

Some parts of the project have non-obvious invariants. If you are touching one
of these, read the linked document first:

| Area | Why | Read |
|------|-----|------|
| The inline script in `frontend/index.html` | Pinned in the CSP by SHA-256 hash; any edit kills analytics on the live site until the hash is recomputed. The repository invariants fail first and print the new value | [Deployment](docs/deployment.md#the-inline-analytics-hash) |
| Colours, type scale, layout, motion | Cascade layers, a token system and a `subgrid` card layout with load-bearing rules; six files copy the palette by hand, and the invariants check each | [Design](docs/design.md) |
| Anything `test/invariants.test.js` names | Pairs of files that must agree, where a mismatch breaks nothing a build would catch. Each failure message says what to change | [Testing](docs/testing.md#repository-invariants) |
| Bundle size | A static import of a lazily loaded library pulls it into the entry chunk and fails the size budget. Change a budget only in the commit that needs it, with the reason | [Testing](docs/testing.md#bundle-size-budgets) |
| Copy in `frontend/src/data/` | Figures must stay traceable and entries equally dense; `npm test` in `frontend/` enforces it | [Development](docs/development.md#updating-site-content) |
| `frontend/src/data/github-activity.json` | Generated, and overwritten by a weekly commit to `main`; hand edits do not survive | [Deployment](docs/deployment.md#weekly-snapshot-commit) |
| The contribution graph and the globe | Their CSS reserves exact heights and positions at an 80rem breakpoint, so a layout change has to check both | [Design](docs/design.md#github-activity) |
| `frontend/index.html` root element and render output | The build prerenders into `<div id="root"></div>` by string match, and the markup must hydrate identically | [Architecture](docs/architecture.md#rendering-strategy) |
| The contact endpoint | Ordering of the body cap, limiter, validation and honeypot is deliberate | [Architecture](docs/architecture.md#contact-form-request-flow) |
| `frontend/public/_headers` | Carries both the CSP and every cache rule. `vite preview` ignores it; the browser tests serve the build under it | [Deployment](docs/deployment.md#security-headers-and-csp) |

---

## Commit messages

Conventional Commits, matching the existing history:

```text
<type>(<optional scope>): <short, imperative summary>
```

Types in use: `feat`, `fix`, `docs`, `refactor`, `perf`, `test`, `chore`, `ci`,
`content`, `seo`.

```text
fix(contact): log who tripped the honeypot
docs: document the button system and Vite 8
ci: read Node from .nvmrc
```

Keep the summary under about 72 characters and describe the effect, not the
mechanics. Use the body for the reasoning when it is not obvious.

---

## Pull requests

Open the PR against `main` and fill in the template - the checklist mirrors
what CI enforces. Then:

- CI must be green. It runs lint on both projects, the content tests, the
  repository invariants, the build, the size budgets, the browser suite, the
  backend tests, `npm audit` on production dependencies and a gitleaks scan
  over full history. GitHub's CodeQL code scanning runs on the PR as well.
- Expect review comments. `CODEOWNERS` requests the maintainer's review on
  every PR; this is a small project and review is usually quick.
- PRs are squash-merged, so the branch history does not need to be tidy, but
  the PR title does - it becomes the commit message. A single-commit PR takes
  that commit's message instead, so it should follow the same format.

Dependabot's PRs, grouped weekly version updates and a security update
whenever an advisory has a compatible fix, are handled by the maintainer.

---

## Code of conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Be
decent to people.
