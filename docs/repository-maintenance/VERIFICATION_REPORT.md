# Verification report

Part of the [2026-11-20 repository cleanup](CLEANUP_REPORT.md). Every command
below was run on Windows 11 with Node 26.13.1 and npm 11.20.0, from the
repository's own scripts. CI runs the same scripts on Ubuntu with Node 24.

"Before" is commit `08395c8` on a clean tree. "After" is the same tree with
this pass's changes, measured before they were committed.

## Before and after

| Check | Command | Before | After |
|-------|---------|--------|-------|
| Lint, both projects | `npm run lint` | Clean | Clean, and five more files checked |
| Backend tests | `npm test` | 33 of 33 | 33 of 33 |
| Frontend content tests | `npm test --prefix frontend` | 14 of 14 | 14 of 14 |
| Repository invariants | `npm run test:invariants` | 20 of 20 | 20 of 20 |
| Production build, behind its gate | `npm run build` | Passes | Passes |
| Size budgets | `npm run size --prefix frontend` | 8 of 8 within budget | 8 of 8 within budget, one of them raised by 2 kB |
| Browser suite | `npm run test:e2e --prefix frontend` | 28 of 28 | 29 of 29 |
| Dependency audit | `npm audit`, both projects | CI's gate green on this commit | 0 advisories at any severity, in both. No dependency changed |
| Lockfiles | `git status` | - | Neither lockfile changed |
| Whitespace | `git diff --check` | Clean | Clean |
| CI on the starting commit | GitHub Actions, run for `08395c8` | All five jobs green | Runs on the pull request, after this was written |

### Sizes

| Budget | Limit | Before | After |
|--------|-------|--------|-------|
| Entry JavaScript | 87 kB | 85.35 kB | 85.35 kB |
| Entry CSS | 8 kB | 7.91 kB | 7.89 kB |
| Skill sprite | 23 kB | 20.99 kB | 20.99 kB |
| Pictures, AVIF | 175 kB | 169.45 kB | 169.59 kB |
| Pictures, WebP | 210 kB, now 212 kB | 209.49 kB | 210.61 kB |
| Command palette | 20 kB | 18.61 kB | 18.61 kB |
| Contribution graph | 27 kB | 24.67 kB | 24.68 kB |
| Globe | 6.5 kB | 5.91 kB | 5.91 kB |

The JavaScript changed only in the hashed file names it refers to. The
stylesheet lost one rule and two declarations, and gained one. The pictures
grew because one of them was re-cut at its true size, which is why the WebP
budget moved: see the measurement below.

## Type checking

There is none to run. Both projects are plain JavaScript with no TypeScript,
no `jsconfig` and no `checkJs`, so this line of the brief has no command
behind it. The backend audit discusses the choice.

## Dead-code and dependency analysis

| Tool | Scope | Result |
|------|-------|--------|
| Knip 6.44.1 | Backend | Nothing unused |
| Knip 6.44.1 | Frontend | Crashed inside its parser on this machine, twice, before analysing anything |
| Knip 5.88.1 | Frontend | Nothing unused |
| The import-graph script | 53 script files, from every entry point | 0 unreachable, 0 unresolved imports, 1 export without an importer, which the build uses |
| The same, for styles | 19 stylesheets, 3 HTML files | 129 classes, 89 custom properties and 6 keyframes, all used |
| The same, for dependencies | 28 declared, across both projects | 24 imported, 1 run by a script, 1 loaded as a plugin, 2 type packages that nothing in the repository consumes |
| The same, for assets | 47 files | 45 referenced by code, 2 required for other reasons |

Knip was run with `npx` and installed nowhere. Neither manifest nor lockfile
shows it.

## Proof for each change that could alter behaviour

| Change | How it was shown safe |
|--------|-----------------------|
| The tooltip fix | A new browser test, written first. Against the old build it failed: the tooltip was 66.8px tall where one line allows under 45.6. Against the new build it passes |
| Two declarations removed | The built page, at 390, 800, 1440 and 1920px: putting both back moved 0 of 110 boxes in the two sections, and a control change moved about 100 |
| The placeholder rule removed | No element it could match exists. The form's browser tests pass |
| `nodeEnv` removed | No reader anywhere in the tree. Backend tests pass |
| `max` renamed `limit` | A one-off server with `limit: 2` refused its third request, with the policy header reading `2;w=60`. The existing test still sees the sixth request refused and the policy `5;w=900` |
| ESLint's pattern widened | `eslint --print-config` shows 81 rules active for a build script, where there were none. `npm run lint` is clean |
| The link check's file list | Not run: lychee is not installed here. The two added patterns are the single-star form the workflow already used. Every relative link in those folders was checked by this pass's own script instead |
| The picture re-cut | Encoding the crop at 960 with the documented settings reproduced the stored WebP files to the byte, so the settings are the ones that were used. The new file, at 920 by 460, is a mean 1.21 per channel from the source's pixels, where the enlarged one was 3.75. The picture test in the browser suite passes |
| Comment and documentation edits | 271 relative links and anchors with these reports included, 0 broken. The invariants test, which fails on an em dash anywhere, passes |

## The one measurement that found a fault

The stored FastAPI card picture against crops of its source screenshot, each
drawn at 960 by 480 in headless Chromium and compared pixel by pixel:

| Crop width | Mean difference per channel |
|------------|-----------------------------|
| 900 | 11.12 |
| 910 | 9.06 |
| **920** | **3.37** |
| 930 | 9.85 |
| 960 | 13.35 |

The stored file was the 920px crop, saved 960 wide. It has since been re-cut
at 920, on the owner's decision.

## Remaining failures

None. Every check that exists passes.

## Not verified

- **Real Safari or macOS.** The tooltip was reproduced and fixed in Chromium
  with the platform reported as a Mac. It was not looked at on an Apple
  device.
- **The changed workflows.** `links.yml` and `deploy.yml` were edited and had
  not been run when this was written. The `deploy.yml` change is a comment.
- **The Postman collection.** Not run. It needs Postman or Newman, and one of
  its requests sends a real email.
- **A real email.** None was sent.
- **`refresh-activity.yml`.** Untouched and not exercised today.
- **Production.** Nothing here was deployed when this was written. The owner
  chose to merge it, and two backend files changed, so the backend redeploys
  after CI passes. What that deploy did is for CI and the deploy check to
  say, not this report.
- **CSS that restates a default.** About a dozen declarations were reported as
  redundant and left alone without being measured.
