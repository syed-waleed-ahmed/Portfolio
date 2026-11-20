# Cleanup report

A pass over the whole repository on 2026-11-20, frontend, backend,
configuration and documentation, starting from commit `08395c8` (v2.6.0) on a
clean tree. The changes were made on the branch `chore/repo-cleanup` and left
uncommitted, as the brief asked. The owner was then asked two things, and
chose to have the one open finding fixed and the whole pass committed and
merged.

This is a dated record of one day's work. It describes the repository as it
was then.

## Summary

The repository was already tight. Two tools and a hand-written cross-check
found no unreachable file, no unused export and no unused dependency, so
**no file, folder or dependency was removed.** Four small pieces of code that
did nothing were.

What the pass did find was the layer below what tools see, by reading the
source: a visible bug on Apple devices, a lint configuration that skipped five
files, ten comments that no longer matched their code, and six statements in
the documentation that had fallen behind the code. Those are fixed. One more
finding, a picture saved larger than its source, cost bytes to fix, so it was
put to the owner first and then fixed.

| | Count |
|---|---|
| Tracked files inspected | 177 |
| Files deleted | 0 |
| Folders deleted | 0 |
| Code elements removed | 4 |
| Dependencies removed | 0 |
| Defects fixed | 3 (a tooltip, a lint gap, an upscaled picture) |
| Deprecated usages replaced | 1 |
| Comments corrected | 10 |
| Markdown files updated | 10, plus the five in this folder |
| Files changed in all | 30, plus the five in this folder |

## Inventory

All 177 tracked files were listed, sized and placed in one of the classes the
brief asked for.

| Area | Files | What it holds |
|------|-------|---------------|
| `frontend/src/` | 77 | Components, data, styles, and 25 imported assets |
| `frontend/public/` | 22 | Files copied into the build as they are |
| `frontend/` (top level, `e2e/`, `scripts/`, `test/`) | 17 | Manifest and lockfile, configs, build scripts, both test suites |
| `backend/` | 12 | Four source modules, three test files, manifest, lockfile, config, template, README |
| `docs/` | 18 | Eight reference documents and the ten of the backend audit |
| `.github/` | 11 | Four workflows, templates, Dependabot, CODEOWNERS |
| Root | 14 | Git and editor configuration, manifests, community files |
| `postman/`, `scripts/`, `test/` | 6 | The API collection, the social-card generator, the invariants test |

| Class | Files |
|-------|-------|
| Essential to run, build or deploy | 114 |
| Should remain: tests, tooling, configuration, documentation | 63 |
| Unused | 0 |
| Duplicate | 0 |
| Obsolete | 0 |
| Generated and wrongly tracked | 0. Three generated files are tracked on purpose: the activity snapshot, the skill sprite and the social card |
| To reorganize | 0 |
| Needing a documentation update | 10 Markdown files, and comments in 9 other files |

## How dead code was looked for

| Method | Covers | Result |
|--------|--------|--------|
| Knip, run once and not installed | Unused files, exports and dependencies, in both projects | Nothing reported |
| An import-graph script written for this pass | Every `.js`, `.jsx` and `.mjs` from every entry point | No unreachable file; one export with no importer, used by the build |
| The same script, over styles | 129 class selectors, 89 custom properties, 6 keyframes | All used. One class is styled for a library's markup |
| The same script, over assets | 47 files in `public/` and `src/assets/` | 45 referenced by code; 2 required for other reasons |
| ESLint | Unused variables and imports | Clean |
| A full read of the frontend source by a second reviewer | Props, state, effects, selectors and comments that tools cannot judge | The findings below, each then checked against the source |
| A search for markers | `TODO`, `FIXME`, `debugger`, stray `console.log` | None |

## What was removed

Four code elements. Each was confirmed dead before it went.

| Removed | Where | Proof |
|---------|-------|-------|
| `nodeEnv`, a field of the backend's `config` | `backend/config/env.js` | No file reads it. The backend audit had noted it (F-18) |
| The `::placeholder` rule for form fields | `frontend/src/components/sections/Contact.css` | No field has a `placeholder`. The only one in the source belongs to the command palette, which has its own class |
| `flex: none` on `.monogram` | `frontend/src/styles/components.css` | Both parents are grids, where a flex property does nothing |
| `margin-block-start: auto` on `.stat__source` | `frontend/src/components/sections/About.css` | It sits in an `auto` row under a `1fr` row that already pushes it down |

For the last two, the built page was measured with and without them at 390,
800, 1440 and 1920px: of 110 boxes in the two sections, none moved, while a
control change moved about 100.

## What was fixed

**On Apple devices the dock's Search tooltip stood three lines tall.** There
it reads "Search (", the Command key as an icon, "K)". The reset makes every
`svg` a block, the tooltip's rule set only `vertical-align`, which a block
ignores, and so the icon took a line to itself: 66.8px against 30.4px for
every other tooltip. No test ran the Apple branch. The rule now sets
`display: inline-block`, and a browser test reports the platform as a Mac and
checks the tooltip is one line. The test was run against the old build first
and failed.

**ESLint applied no rule to the frontend's `.mjs` files.** The rules were
scoped to `**/*.{js,jsx}`. The four build scripts and the test server matched
only the block that sets Node globals, so `eslint .` passed over them without
checking anything. The pattern now includes `.mjs`, and they pass.

**The rate limiter used a deprecated option name.** `max` is still honoured
by the installed `express-rate-limit`, whose source calls it deprecated. It is
now `limit`. A one-off check confirmed the library honours that name.

**The weekly link check skipped two folders.** See
[GIT_CONFIGURATION_REPORT.md](GIT_CONFIGURATION_REPORT.md#workflows).

## Comments corrected

Ten, each because it contradicted the code beside it.

| File | The comment said | The code |
|------|------------------|----------|
| `frontend/vite.config.js` | Vite's default target is what the CSS already requires | The default is Chrome 111, Firefox 114, Safari 16.4, older than subgrid and `:has()`. The build flattens nesting and adds prefixes; it cannot stand in for those |
| `frontend/src/styles/tokens.css` | Those browser versions are "older than the build's browser target" | The target is the older one |
| `frontend/src/components/sections/Experience.css` | `text-wrap` is inherited from base and only the size differs | The rule overrides `text-wrap`, and the size is the same as a subhead's |
| `frontend/src/components/sections/Contact.css` | Extra top padding on `.section` makes room for the pill | No such padding exists; the panel's own margin does it |
| `frontend/src/components/sections/Contact.css` | The honeypot is "hit-testable" | It has `pointer-events: none` |
| `frontend/src/components/widgets/CommandMenu.jsx` | The palette would render "at the end of the dock" | Search is seventh of ten items |
| `frontend/src/data/about.js` | `About.jsx` renders it | Not the locations, which the globe draws |
| `frontend/index.html` | "Author / language hints" | Author and robots directives |
| `.github/workflows/deploy.yml` | Render deploys the backend "on its own" | It waits for the commit's checks, since 2026-11-20 |
| `lychee.toml` | Streamlit hosts two of the project demos | One |

## Retained despite appearing unused

Each of these was a candidate and was kept, with the reason.

| Item | Why it stays |
|------|--------------|
| `@types/react`, `@types/react-dom` | Nothing in the repository reads them: there is no TypeScript, `jsconfig` or type check. They arrived with the first commit and give an editor the types for a JavaScript project |
| `@size-limit/file` | Never imported. Size Limit loads it as its plugin |
| `frontend/public/sw.js` | A kill-switch for an old service worker, documented, with a condition for its removal |
| `frontend/public/googleb4ba9f6faa31c433.html` | Google's site verification file. Left byte for byte, final newline included |
| `frontend/public/fonts/OFL-hanken-grotesk.txt` | The font's licence, which has to travel with the font |
| `render`, exported from `entry-server.jsx` | Imported by the prerender step from the built bundle, which no static tool follows |
| `.react-activity-calendar__tooltip` | Styles markup the calendar library generates |
| `onClick` on `SectionLink`, `style` on `Reveal` | No caller passes either. Both components spread the remaining props after their own, so without the explicit handling a caller's `onClick` or `style` would silently replace the scroll handler or the stagger delay |
| `:disabled` beside `[aria-disabled]` on `.btn` | No button is ever `disabled` today. A shared button that styled only one of the two would be a trap |
| `strong`, `h4`, `video`, `select` in the base and reset layers | Generic element rules, with no such element on the page today |
| `name` on each entry of `locations` | Unread by code. It says which city the coordinates are |
| Hand-written `-webkit-` prefixes and the `100vh` fallback | The production build regenerates the prefixes and drops the fallback, so removing them would change no built byte. The dev server serves the source as written, where they still apply |
| Declarations that restate a default, such as `display: block` on an element the reset already blocks | Harmless, and removing them would tie each component to the reset. Not measured, so not touched |
| `!important` on `.visually-hidden` | Nine of them, in the last layer, where they are not needed to win. A guard on the one class that must never be overridden |
| `GET /` beside `GET /health` | Two liveness routes where one would do. Both are documented, tested and in the Postman collection |
| `scripts/` and `test/` at the root, one file each | Both paths are documented, and the invariants test reads `scripts/gen-og-card.mjs` by path. Moving them would mean editing every document that names them, for nothing |
| The `_headers` parser in both `e2e/serve.mjs` and `scripts/verify-deploy.mjs` | Duplicated so that each script runs with no dependency and no shared module |

## Found, and fixed on the owner's decision

**One card picture was upscaled.** `docs/design.md` says the FastAPI card is a
920px-wide crop and that no picture is ever saved larger than its source. The
stored file was 960px wide. To learn which statement was wrong, the stored
picture was compared in a browser with crops of the source screenshot from 880
to 1000px wide. It matched the 920px crop, with a mean difference of 3.4 per
channel against 9 or more for every other width. So the documentation was
right and the file was about 4% larger than its source.

It was not fixed in the first pass, for two reasons: re-encoding an image
changes what a visitor downloads, and the right encoder settings were not yet
confirmed. Both were then settled.

- **The settings.** `docs/design.md` records them: `sharp`, AVIF at quality
  55, WebP at quality 78. Encoding the crop at 960 with those reproduced the
  stored WebP files to the byte, 22,104 and 8,066, so they are the settings
  that were used.
- **The cost.** Cut at its own 920px the pair is heavier, not lighter: an
  enlarged picture is a blurred one and compresses better. The twelve WebP
  files went from 209.49 kB to 210.61 kB, which is 0.61 kB past their 210 kB
  budget. The AVIF files grew by 0.14 kB.

The owner chose the re-cut. The two 960 files are now 920 by 460, measured
against the source's own pixels they are three times closer than the enlarged
ones were (a mean difference of 1.21 against 3.75), and the WebP budget is
212 kB. The two 480 files were already reductions of the crop and are
unchanged.

Nothing in the repository compares a picture's width with its source's, which
is how this lasted. `docs/design.md` says so, since the check cannot be
automated without the sources.

## Reasoning behind the larger decisions

- **Nothing was deleted to make a number.** A repository where two tools find
  nothing is not hiding dead files, and inventing some would have been the
  wrong kind of thoroughness.
- **A removal needed proof, not absence of evidence.** The four removals each
  have a search result or a measurement behind them. The candidates without
  one are in the table above.
- **Comments were corrected to say what the code does**, and nothing more.
  Where the original gave a reason this pass could not confirm, the new
  comment does not repeat it.
- **Knip was run, not adopted.** An earlier tooling review of this repository
  decided against it as a permanent dependency. It was fetched for one run and
  left no trace in a manifest or lockfile.
