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
  contact details - no attribution required, though it is appreciated.

## What is not

- **Content changes.** The copy, projects, experience and links describe a
  specific person. Pull requests editing them will be closed.
- **Redesigns.** The visual language is deliberate and documented in
  [`docs/design.md`](docs/design.md). Targeted fixes yes, restyles no.
- **New frameworks or heavy dependencies.** The lean bundle is a feature. A PR
  adding an animation library, a UI kit or a state manager needs to argue its
  case in an issue first.

If you are unsure whether something fits, open an issue before writing code.

---

## Reporting a bug

Open a [GitHub issue](https://github.com/syed-waleed-ahmed/Portfolio/issues)
including:

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
cp frontend/.env.example frontend/.env    # optional
npm run dev:backend      # http://localhost:5000
npm run dev:frontend     # http://localhost:5173
```

Node 22.13 or newer is required; `.nvmrc` pins 24, so `nvm use` gets you the
right one.

---

## Making a change

1. **Branch from `main`.** Use a descriptive name: `fix/navbar-focus-trap`,
   `docs/api-error-codes`.
2. **Keep the PR focused.** One concern per pull request. A drive-by
   reformatting of an unrelated file makes review harder.
3. **Follow the existing style.** Two-space indent, ES modules, the `@/` import
   alias in the frontend, and `.editorconfig` for the rest. Comments explain
   why rather than what. The repository uses no em dashes anywhere - in code,
   comments, copy or docs.
4. **Update documentation in the same commit** as the behaviour it describes.
   Documentation that lags behind the code is the failure mode this repository
   works hardest to avoid.
5. **Update the Postman collection** if you change the API surface, and confirm
   it still imports cleanly.
6. **Add a `CHANGELOG.md` entry** under `Unreleased` for anything user-visible.

### Before you push

```bash
npm run lint     # frontend changes
npm run build    # frontend changes
npm test         # backend changes
```

CI runs the same commands plus `npm audit` and a gitleaks secret scan, so
running them locally saves a round trip.

### Areas that need extra care

Some parts of the project have non-obvious invariants. If you are touching one
of these, read the linked document first:

| Area | Why | Read |
|------|-----|------|
| The inline script in `frontend/index.html` | Pinned in the CSP by SHA-256 hash; any edit silently kills analytics until the hash is recomputed | [Deployment](docs/deployment.md#the-inline-analytics-hash) |
| Colours, type scale, the Projects grid | Token system and a `subgrid` layout with three load-bearing rules | [Design](docs/design.md) |
| The contact endpoint | Ordering of the body cap, limiter, honeypot and validation is deliberate | [Architecture](docs/architecture.md#contact-form-request-flow) |
| `frontend/public/_headers` | Carries both the CSP and every cache rule | [Deployment](docs/deployment.md#caching) |

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

- CI must be green. It runs lint, build, backend tests, `npm audit` on
  production dependencies and a gitleaks scan over full history.
- Expect review comments; this is a small project and review is usually quick.
- Squash-merge is the default, so the branch history does not need to be tidy,
  but the PR title does - it becomes the commit message.

Dependency PRs from Dependabot arrive grouped weekly and are handled by the
maintainer.

---

## Code of conduct

Participation is governed by the [Code of Conduct](CODE_OF_CONDUCT.md). Be
decent to people.
