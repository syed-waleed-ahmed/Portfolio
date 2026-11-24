# Repository cleanup

A pass over the whole repository on 2026-11-20: frontend, backend,
configuration and documentation. It started from commit `08395c8` (v2.6.0) on
a clean tree, was merged as pull request #67 (`5f465d1`) and released as
v2.6.1.

This is a dated record and is not kept up to date. The frontend it describes
was redesigned on 2026-11-23 and 2026-11-24 (see the
[changelog](../CHANGELOG.md)), so some files, selectors and sizes named below
have changed since. The two rows the redesign reversed are marked.

## Summary

All 177 tracked files were inspected. Two tools and a hand-written
cross-check found no unreachable file, no unused export and no unused
dependency, so **no file, folder or dependency was removed.** Four small
pieces of code that did nothing were.

What the pass did find came from reading the source, below what tools see: a
visible bug on Apple devices, a lint configuration that applied no rule to
five files, a deprecated option name, ten comments that no longer matched
their code, and six statements in the documentation that had fallen behind
it. One more finding, a picture saved larger than its source, cost bytes to
fix, so it was put to the owner first and then fixed.

## How dead code was looked for

| Method | Covers | Result |
|--------|--------|--------|
| Knip, run once with `npx` and installed nowhere | Unused files, exports and dependencies in both projects | Nothing reported. Its current major crashed on the frontend, so the previous one was used there |
| An import-graph script written for the pass | Every `.js`, `.jsx` and `.mjs` file, from every entry point | No unreachable file; one export with no importer, which the build uses |
| The same script, over styles | 129 class selectors, 89 custom properties, 6 keyframes | All used |
| The same script, over assets | 47 files in `public/` and `src/assets/` | 45 referenced by code, 2 required for other reasons |
| ESLint, and a search for markers | Unused variables and imports; `TODO`, `FIXME`, `debugger`, stray `console.log` | Clean |
| A full read of the frontend source by a second reviewer | Props, state, effects, selectors and comments that tools cannot judge | The findings below, each checked against the source |

## What was removed

Each was confirmed dead before it went.

| Removed | Where | Proof |
|---------|-------|-------|
| `nodeEnv`, a field of the backend's `config` | `backend/config/env.js` | No file reads it. The backend audit had noted it ([F-18](audit/CODE_QUALITY_AUDIT.md#small-things)) |
| The `::placeholder` rule for form fields | `frontend/src/components/sections/Contact.css` | No field has a `placeholder`; the only one belongs to the command palette, which has its own class |
| `flex: none` on `.monogram` | `frontend/src/styles/components.css` | Both parents are grids, where a flex property does nothing |
| `margin-block-start: auto` on `.stat__source` | `frontend/src/components/sections/About.css` | It sits in an `auto` row under a `1fr` row that already pushes it down. Later changed: the 2026-11-23 redesign moved the figures into the hero |

For the last two, the built page was measured with and without them at 390,
800, 1440 and 1920px. Of 110 boxes in the two sections none moved, while a
control change moved about 100.

## What was fixed

**On Apple devices the dock's Search tooltip stood three lines tall.** There it
reads "Search (", the Command key as an icon, "K)". The reset makes every `svg`
a block and the tooltip's rule set only `vertical-align`, which a block
ignores, so the icon took a line to itself: 66.8px against 30.4px for every
other tooltip. The rule now sets `display: inline-block`. A browser test
reports the platform as a Mac and checks the tooltip is one line; it failed
against the old build before the fix was written.

**ESLint applied no rule to the frontend's `.mjs` files.** The rules were
scoped to `**/*.{js,jsx}`, so the four build scripts and the test server
matched only the block that sets Node globals. The pattern now includes
`.mjs`, and all five pass.

**The rate limiter used a deprecated option name.** `express-rate-limit` still
honours `max` but calls it deprecated. It is now `limit`, and after the merge
the live API reported the expected policy, `5;w=900`.

**The weekly link check skipped `docs/audit/`.** Its pattern, `docs/*.md`,
stops at the top of `docs/`. The subfolder is now listed, and a manual run on
`main` checked 339 links with no error.

## Comments and documentation

Ten comments contradicted the code beside them, in `vite.config.js`,
`tokens.css`, `Experience.css`, `Contact.css` (two), `CommandMenu.jsx`,
`about.js`, `index.html`, `deploy.yml` and `lychee.toml`. Each now says what
the code does and nothing more: where the original gave a reason the pass
could not confirm, the new comment does not repeat it.

All 28 tracked Markdown files were reviewed, by script for what a script can
check (262 relative links and anchors, none broken, plus every `npm run` name,
inline path and stated test count) and by a full read for the rest. The read
found six statements behind the code: the backend test count in the README,
the optional backend variables, what a `502` means, the number of demos on
Streamlit, the entry budget's headroom, and which palette entries are written
by hand.

## Retained despite appearing unused

| Item | Why it stays |
|------|--------------|
| `@types/react`, `@types/react-dom` | Nothing reads them, since there is no TypeScript or type check, but they give an editor the types for a JavaScript project |
| `@size-limit/file` | Never imported. Size Limit loads it as its plugin |
| `frontend/public/sw.js` | A kill-switch for an old service worker, documented, with a condition for its removal |
| `frontend/public/googleb4ba9f6faa31c433.html` | Google's site verification file, kept byte for byte |
| `frontend/public/fonts/OFL-hanken-grotesk.txt` | The font's licence, which has to travel with the font |
| `render`, exported from `entry-server.jsx` | Imported by the prerender step from the built bundle, which no static tool follows |
| `.react-activity-calendar__tooltip` | Styles markup the calendar library generates |
| `onClick` on `SectionLink`, `style` on `Reveal` | No caller passes either, but both components spread the remaining props after their own, so without the explicit handling a caller's value would silently replace the scroll handler or the stagger delay |
| `:disabled` beside `[aria-disabled]` on `.btn` | No button is `disabled` today. A shared button that styled only one of the two would be a trap |
| `strong`, `h4`, `video`, `select` in the base and reset layers | Generic element rules, with no such element on the page today |
| `name` on each entry of `locations` | Unread by code. It says which city the coordinates are |
| Hand-written `-webkit-` prefixes and the `100vh` fallback | The production build regenerates or drops them, so removing them changes no built byte; the dev server serves the source as written |
| Declarations that restate a default | Harmless, and removing them would tie each component to the reset |
| `!important` on `.visually-hidden` | A guard on the one class that must never be overridden. Later changed: the 2026-11-23 redesign removed it, since the class sits in the last cascade layer and already wins |
| `GET /` beside `GET /health` | Two liveness routes where one would do. Both are documented, tested and in the Postman collection |
| The `_headers` parser in both `e2e/serve.mjs` and `scripts/verify-deploy.mjs` | Duplicated so that each script runs with no dependency and no shared module |

## The picture saved larger than its source

`docs/design.md` said the FastAPI card picture was a 920px-wide crop and that
no picture is saved larger than its source, but the stored file was 960px wide.
To learn which statement was wrong, the stored picture was compared in headless
Chromium with crops of the source screenshot, each drawn at 960 by 480:

| Crop width | Mean difference per channel |
|------------|-----------------------------|
| 900 | 11.12 |
| 910 | 9.06 |
| **920** | **3.37** |
| 930 | 9.85 |
| 960 | 13.35 |

The documentation was right: the file was the 920px crop, enlarged by about 4%.

Re-encoding changes what every visitor downloads, so the owner was asked
first. Encoding the crop at 960 with `sharp` (AVIF at quality 55, WebP at 78)
reproduced the stored WebP files to the byte, which confirmed the settings.
Cut at its true width the pair is heavier, because an enlarged picture is a
blurred one and compresses better: the twelve WebP files went from 209.49 kB
to 210.61 kB, past their 210 kB budget. The owner chose the re-cut. Against
the source's own pixels the new 920 by 460 files differ by a mean of 1.21 per
channel, where the enlarged ones differed by 3.75, and the WebP budget moved
to 212 kB. Nothing in the repository compares a picture's width with its
source's, and the sources live in other repositories, so the rule is kept by
hand.

## Verification

| Check | Result |
|-------|--------|
| Lint, both projects | Clean, with five more files checked |
| Backend, content and invariant tests | 33, 14 and 20, all passing before and after |
| Production build and the eight size budgets | Pass, with the WebP budget raised by 2 kB as above |
| Browser suite | 28 of 28 before; 29 of 29 after, the new one being the tooltip test |
| Dependencies and lockfiles | Unchanged; no advisory at any severity in either project |
| Every available check run | Yes, apart from the Postman collection, one of whose requests sends a real email |
| Git history intact | Nothing rewritten, and no tag or branch removed |
| After the merge | CI green on the pull request and on `main`, the deploy check passed, Render deployed the backend only once the checks had finished, and the browser suite passed 29 of 29 against the live site |
| Not verified | The tooltip on a real Apple device (it was reproduced in Chromium reporting a Mac platform), and a real email |

## Left as found

1. **The two items the backend audit left open**: the rate limiter's
   second-network check, and a way to hear when the form stops working
   ([audit summary](audit/EXECUTIVE_SUMMARY.md#next-steps)).
2. **Nothing lints the two scripts at the repository root**,
   `scripts/gen-og-card.mjs` and `test/invariants.test.js`.
3. **Dead-code analysis is not automated.** An earlier tooling review declined
   Knip as a permanent dependency; this pass ran it once.
4. **Three figures for one measurement.** The hero entrance change's gain is
   "about 150ms" in `docs/design.md`, 1100 ms against 968 ms in
   `docs/testing.md`, and 168ms in a stylesheet comment. They may measure
   different things, and the repository cannot say, so none was changed.
