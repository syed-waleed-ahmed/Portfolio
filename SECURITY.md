# Security Policy

Thanks for taking the time to help keep this project safe.

## Reporting a vulnerability

If you find a security issue in this codebase or the deployed site
(`syedwaleedahmed.me`), please report it privately rather than opening a
public GitHub issue.

- **Email:** [syedwaleedahmed9@gmail.com](mailto:syedwaleedahmed9@gmail.com)
- **Subject:** `Security: <short summary>`

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

- Third-party services I depend on (Resend, Netlify, Render, GitHub) -- please
  report those directly to the relevant vendor
- Findings that require physical access to a developer machine
- Reports based on outdated dependency advisories that are already fixed
  on `main`

## Automated hygiene

Some classes of issue are already gated in CI on every push and PR, so a
report in these areas may already be covered:

- **Secret scanning** -- `gitleaks` runs over the full git history
- **Dependency audit** -- `npm audit --omit=dev --audit-level=high` on both
  workspaces. Note this gates *production* dependencies at high severity and
  above; dev-dependency and low-severity findings are reviewed manually rather
  than blocking a build
- **Dependency updates** -- Dependabot opens grouped weekly PRs (npm minor +
  patch; GitHub Actions including majors)

## Safe-harbor

Good-faith research that follows responsible-disclosure principles will
not result in legal action. Please do not:

- Run automated scans that produce DoS-like traffic
- Test against other users or their data
- Exfiltrate, alter, or destroy data
- Use social engineering

## Recognition

This is a personal portfolio with no bug-bounty program, but I'm happy
to credit reporters in commit messages or release notes if they want.
