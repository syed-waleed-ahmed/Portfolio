# Git configuration report

Part of the [2026-11-20 repository cleanup](CLEANUP_REPORT.md). It covers the
files that configure Git, editors, npm and GitHub, each read in full and
checked against the 177 tracked files.

Three files changed: the file list in `.github/workflows/links.yml`, and one
comment each in `.github/workflows/deploy.yml` and `lychee.toml`. The rest
were found correct and are left as they were. Each rule below was tested,
not just read.

## .gitignore

No change.

| What it must exclude | Rule | Checked how |
|----------------------|------|-------------|
| Dependencies | `node_modules/`, at any depth | Three exist locally (root, `frontend/`, `backend/`); none is tracked |
| Build output | `dist/`, `dist-server/` | `frontend/dist/` exists locally and is not tracked |
| Tool caches | `.vite/`, `.eslintcache`, `.cache/`, `.lychee-cookies.json` | - |
| Local environment and secrets | `.env`, `.env.*`, with `!.env.example` | Both `.env` files exist locally and are not tracked; both templates are |
| Keys and certificates | `*.pem`, `*.key`, `*.p12`, `id_rsa` and others | None exists |
| Logs | `npm-debug.log*`, `logs/`, `*.log` | - |
| Editors | `.vscode/*` apart from two shared files, `.idea/`, swap files | No editor folder is tracked |
| Test and coverage output | `coverage/`, `playwright-report/`, `test-results/`, `newman/` | `frontend/test-results/` exists locally and is not tracked |
| Platform artifacts | `.wrangler/`, `.render/` | - |
| OS files | `.DS_Store`, `Thumbs.db`, `desktop.ini`, `*.tmp`, `*.bak` | - |
| Agent and graph output | `.claude/`, `CLAUDE.local.md`, `graphify-out/` | Both folders exist locally and are not tracked |
| A stray root lockfile | `/package-lock.json` | The root has no dependencies |

Two checks for mistakes in the other direction:

- **No tracked file matches an ignore rule** (`git ls-files -i -c --exclude-standard`
  returns nothing), so nothing is half in and half out.
- **Nothing that should be tracked is ignored.** `git status` on a clean
  checkout shows no untracked file, and the two exceptions the file makes,
  `.env.example` and the shared `.vscode` settings, behave as written.

The file is grouped and commented, and no rule was removed. The handful that
match nothing today, such as `.render/` and `newman/`, each name the output
of a tool a contributor may run, and an unused ignore rule costs nothing.

## .gitattributes

No change.

- `* text=auto eol=lf` normalizes every text file to LF and overrides
  `core.autocrlf`, so a Windows checkout gets LF as well.
- **All 177 tracked files are stored with LF, or are binary**
  (`git ls-files --eol`). None is stored with CRLF or mixed endings.
- Images and fonts are marked `binary`, so they are never converted or
  diffed as text. Every image and font format in the tree is on the list.
- The three generated files (`package-lock.json`, the activity snapshot, the
  skill sprite) are marked `linguist-generated`, which collapses their diffs
  in a pull request. `docs/**` is `linguist-documentation`, and the pattern
  already covers `docs/audit/` and this folder.
- The rules for `.sh`, `.bat`, `.cmd` and `.ps1` match no file today. They
  were kept: they cost nothing, and a Windows script checked in with LF, or a
  shell script with CRLF, is the kind of mistake they exist to prevent.

One note about this machine, not the repository: two working copies,
`LICENSE` and `frontend/public/sw.js`, have CRLF on disk here while the index
holds LF. Git treats them as unchanged, and CI checks out LF.

## .editorconfig

No change. It sets UTF-8, LF, two-space indentation, a final newline and
trimmed trailing whitespace, with three reasoned exceptions: Markdown keeps
trailing spaces, Postman exports keep their tabs, and lockfiles are left
alone.

The tree agrees with it:

| Check | Result |
|-------|--------|
| Trailing whitespace in any tracked text file | None |
| Tabs in JavaScript, CSS or YAML | None |
| Text files without a final newline | One: `frontend/public/googleb4ba9f6faa31c433.html`. It is Google's site verification file and is kept byte for byte as issued |
| `git diff --check` over the whole tree | Clean |

## GitHub

### Workflows

| Workflow | Runs on | Permissions | State |
|----------|---------|-------------|-------|
| `ci.yml` | Push to `main`, pull requests | `contents: read` | Working: green on every merge today. Unchanged |
| `deploy.yml` | Called by CI and by the snapshot workflow, or by hand | `contents: read` | Working: published and verified the site after each merge today. One comment corrected: it said Render deploys the backend on its own, which stopped being true when Render was set to wait for CI |
| `refresh-activity.yml` | Mondays 04:17 UTC, or by hand | `contents: write`, to commit the snapshot | Not exercised today. Unchanged |
| `links.yml` | Mondays 05:47 UTC, or by hand | `contents: read` | **Changed**, see below |

Every action in every workflow is pinned to a full commit SHA with its
version beside it: of 18 `uses:` lines, 16 are pinned and the other two are
calls to this repository's own `deploy.yml`. No workflow is obsolete or
broken, and none was removed.

**The change.** `links.yml` passed lychee the pattern `docs/*.md`, which
stops at the top of `docs/`. The ten documents in `docs/audit/` and the five
here were therefore never link-checked. The two folders are now listed beside
it, each with the same single-star pattern the workflow already used, since
a recursive pattern could not be tried here without lychee installed. The
only external addresses in those folders are the live site and a
loopback URL, which `lychee.toml` already excludes, so the weekly run gains
relative links to verify and no new host to depend on. `docs/testing.md`
describes the list and was updated with it.

### Other files

| File | Finding |
|------|---------|
| `dependabot.yml` | Three ecosystems, weekly, grouped, with a seven-day cooldown. Each choice is explained in a comment. No open Dependabot pull request. Unchanged |
| `CODEOWNERS` | One owner for the whole tree, which is accurate for a one-person project. Unchanged |
| `PULL_REQUEST_TEMPLATE.md` | Every command in its checklist is a real script. Unchanged |
| `ISSUE_TEMPLATE/` | Three forms and a `config.yml` that turns blank issues off and routes security reports to private reporting. Unchanged |

### What is not in the repository

Stated so that nobody looks for a file: CodeQL runs from GitHub's default
setup, secret scanning with push protection, Dependabot alerts and private
vulnerability reporting are repository settings, and a review bot's check
appears on pull requests from an installed app. None has a configuration
file here, and none was verified beyond its check appearing on today's pull
requests.

## Repository metadata

| File | Finding |
|------|---------|
| `LICENSE` | MIT, 2025-2026, the owner's name. Matches `license` in all three manifests |
| `package.json` (root, frontend, backend) | Name, description, author, licence, homepage and repository URL agree. Version is 2.6.0 in all three, which the invariants test compares with the changelog |
| `.nvmrc` | `24`. Every workflow reads it, and so does Render, as its build log shows |
| `.npmrc` | `engine-strict` and a quieter audit level, each with its reason. Unchanged |
| `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CODE_OF_CONDUCT.md`, `CHANGELOG.md` | Reviewed with the rest of the documentation: see [DOCUMENTATION_REPORT.md](DOCUMENTATION_REPORT.md) |

## Security-related configuration

- **No credential is tracked.** A search of every tracked file for the shapes
  of common keys (Resend, GitHub, AWS, Slack, private key headers) found one
  match, a placeholder made of the letter `x` in `backend/.env.example`.
- **No `.env` file was ever committed**: `git log --all` finds no commit that
  added one, as the backend audit recorded.
- `gitleaks` scans the full history in CI on every push and pull request.
- This cleanup added no file that an ignore rule should have caught.

## Branches and tags

Nothing was deleted. GitHub holds one branch, `main`, and 23 tags, the newest
`v2.6.0`.

This clone also holds 14 remote-tracking references to branches that were
merged and deleted on GitHub. They are local leftovers, not part of the
repository. `git fetch --prune` removes them; it was not run, since the brief
for this cleanup ruled out deleting branches of any kind.
