# Security Policy

Thanks for taking the time to help keep this project safe.

This document is the disclosure policy. For an inventory of the controls
already implemented in the code and the platform configuration, see
[`docs/security.md`](docs/security.md).

## Supported versions

The project deploys continuously from `main`. Only the currently deployed
version of the site and API is supported; there are no maintained release
branches and fixes are not backported. Releases are tagged `vX.Y.Z` to mark
milestones in [`CHANGELOG.md`](CHANGELOG.md), not as separate lines of
support: a fix ships from `main` and is listed under the next release.

| Version | Supported |
|---------|-----------|
| `main` (live) | Yes |
| Earlier releases and any other branch | No |

## Reporting a vulnerability

If you find a security issue in this codebase or the deployed site
(`syedwaleedahmed.me`), please report it privately rather than opening a
public GitHub issue.

- **Preferred:** GitHub's private form,
  [Report a vulnerability](https://github.com/syed-waleed-ahmed/Portfolio/security/advisories/new),
  which keeps the report and any fix in a private advisory until it is
  published.
- **Or email:** [syedwaleedahmed9@gmail.com](mailto:syedwaleedahmed9@gmail.com),
  with the subject `Security: <short summary>`.

Please include:

- A clear description of the issue
- Steps to reproduce (URL, payload, browser/OS, etc.)
- The impact you believe it has
- Any suggested mitigation, if you have one

I will acknowledge the report within **72 hours** and aim to ship a fix
within **14 days** for high-severity issues. Lower-severity items are
prioritized alongside other work.

## Scope

In scope:

- The frontend at `https://syedwaleedahmed.me`
- The backend contact API at `https://portfolio-backend-kmum.onrender.com`
- Source code in this repository

Out of scope:

- Third-party services I depend on (Resend, Netlify, Render, GitHub, Google
  Analytics, and the community API behind the contribution graph) - please report
  those directly to the relevant vendor
- Findings that require physical access to a developer machine
- Reports based on outdated dependency advisories that are already fixed
  on `main`
- Missing headers or hardening with no demonstrated impact, and findings that
  restate a documented, deliberate decision - the reasoning for each is in
  [`docs/security.md`](docs/security.md#deliberate-non-goals)

## Automated hygiene

Some classes of issue are already checked automatically, by CI on every push
to `main` and every pull request against it or by GitHub's own security
features, so a report in these areas may already be covered:

- **Secret scanning** - `gitleaks` runs in CI over the full git history, and
  GitHub's secret scanning, with push protection, refuses a push that contains
  a recognized credential
- **Code scanning** - GitHub's CodeQL default setup analyzes the JavaScript
  and the workflow files on every push to `main`, every pull request against
  it, and weekly
- **Dependency alerts** - Dependabot alerts and security updates open a pull
  request for a vulnerable dependency without waiting for the weekly run,
  transitive ones included when a patched version fits the dependents' ranges
- **Dependency audit** - `npm audit --omit=dev --audit-level=high` on both
  projects. Note this gates *production* dependencies at high severity and
  above; dev-dependency and low-severity findings are reviewed manually rather
  than blocking a build
- **Dependency updates** - Dependabot opens grouped weekly PRs (npm minor and
  patch; GitHub Actions including majors), after a seven-day cooldown that
  security updates skip
- **Pinned actions** - every GitHub Action is pinned to a full commit SHA
- **Content Security Policy** - the browser tests load the built site under the
  production CSP and fail on any violation, and the repository invariants fail
  if the hash of the inline script drifts from the one the CSP pins

## Safe harbour

Good-faith research that follows responsible-disclosure principles will
not result in legal action. Please do not:

- Run automated scans that produce DoS-like traffic
- Test against other users or their data
- Exfiltrate, alter, or destroy data
- Use social engineering

## Recognition

This is a personal portfolio with no bug-bounty program, but I'm happy
to credit reporters in commit messages or release notes if they want.
