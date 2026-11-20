# Documentation report

Part of the [2026-11-20 repository cleanup](CLEANUP_REPORT.md). All 28 tracked
Markdown files were reviewed against the code, twice over: by script, for what
a script can check, and by a full read, for what it cannot.

## Result

The documentation was already in good order. It had been reviewed against the
code the day before, and brought up to date for the backend audit that
morning. This pass found **six statements that had fallen behind the code**,
all in passages that morning's work had not reached, and **no broken link**.

| | Count |
|---|---|
| Markdown files reviewed | 28 |
| Updated | 10 |
| Added | 5, the reports in this folder |
| Consolidated | 0 |
| Archived or removed | 0 |
| Broken links found | 0 of 262 |

## What the scripts checked

| Check | Result |
|-------|--------|
| Every relative link and `#anchor` in every Markdown file | 262 checked, none broken |
| Every `npm run <name>` against the three manifests | All real |
| Every inline path against the tracked tree | 46 candidates, none stale: package names, file extensions, examples, paths in other repositories, and entries in the changelog's history |
| Backend tests | 33 in three files, as `docs/testing.md` says |
| Frontend content tests | 14, as stated |
| Repository invariants | 20, as stated |
| Postman | 14 requests in 4 folders, as stated |
| Size budgets | 8, as tabled |

## What the read found

Each was checked against the source before it was changed.

| Where | It said | The code says | Changed to |
|-------|---------|---------------|------------|
| `README.md`, two places and a paragraph | 18 backend tests, in two files | 33 in three, after the audit | 33, with the third file and the failure tests described |
| `README.md`, Configuration | Three optional backend variables | Five: `TRUST_PROXY_HOPS` and `RESEND_TIMEOUT_MS` were added | All five named |
| `README.md` twice, `docs/security.md` once | A `502` means Resend refused the send or could not be reached | Also that it did not answer within 10 seconds | The timeout added |
| `docs/testing.md`, and a comment in `lychee.toml` | Two project demos run on Streamlit | One. The others are on Vercel, Render and Workers | One |
| `CLAUDE.md` | The entry budget is under any one lazy library's size | The budget is 87 kB. It is the headroom, about 1.6 kB, that is smaller than any lazy library | "The entry budget's headroom" |
| `docs/development.md` | Only the Contact group's palette entries are written by hand | The Home entry is too | Both named |

Further changes that follow from this pass's own work:

| File | Change |
|------|--------|
| `docs/testing.md` | The browser suite is 29 tests, with a row for the new one. The link check's file list includes the two subfolders. The dated note that the suite passed against the live site now says it held 28 tests then. The WebP budget is 212 kB, with the reason it moved |
| `README.md` | 29 browser tests, in two places |
| `docs/development.md` | What ESLint covers: the frontend's `.mjs` files now, and still neither of the two scripts at the repository root |
| `docs/design.md` | The FastAPI picture's true width of 920px, the totals for the twelve pictures, and a note that nothing compares a picture's width with its source's |
| `CLAUDE.md` | A note on the reset's `svg` rule, which caused the tooltip bug |
| `docs/README.md` | The index lists this folder, and says that it and `docs/audit/` are dated records, not living references |
| `docs/audit/CODE_QUALITY_AUDIT.md`, `docs/audit/REMEDIATION_PLAN.md` | Finding F-18 records that two of its three items were fixed here |
| `CHANGELOG.md` | Entries under `Unreleased` |

## Every file, and its state

| File | State |
|------|-------|
| `README.md` | Partly outdated. Corrected |
| `CLAUDE.md` | One imprecise sentence. Corrected, and one note added |
| `CHANGELOG.md` | Current. Its history describes the past and was left alone. New entries added |
| `CONTRIBUTING.md` | Accurate |
| `SECURITY.md` | Accurate |
| `CODE_OF_CONDUCT.md` | Accurate. A standard text |
| `docs/README.md` | Accurate. Index extended |
| `docs/architecture.md` | Accurate. Its tree and module tables match the files |
| `docs/api.md` | Accurate. Updated that morning |
| `docs/security.md` | One stale clause. Corrected |
| `docs/deployment.md` | Accurate. Updated that morning |
| `docs/development.md` | One incomplete sentence. Corrected, and lint coverage described |
| `docs/design.md` | Accurate in every value that could be recomputed: tokens, contrast ratios, breakpoints. One exception added |
| `docs/testing.md` | One stale count. Corrected, and extended for the new test |
| `docs/audit/` (10 files) | A dated record of 2026-11-20, current to that day. Two files updated where this pass closed part of a finding |
| `frontend/README.md` | Accurate |
| `backend/README.md` | Accurate |
| `postman/README.md` | Accurate. Fourteen requests in four folders, as it says |
| `.github/PULL_REQUEST_TEMPLATE.md` | Accurate. Every command in its checklist exists |

## Consolidation and archiving

None, and deliberately.

- **No two documents duplicate each other.** Each of the eight reference
  documents covers one concern and links to the others where they meet. The
  root README repeats a few facts as an overview, which is its job.
- **The audit documents are historical by nature, and are labelled so.** Each
  opens with its date and the commit it describes. `docs/README.md` now says
  the same of both dated folders, so that nobody expects them to track later
  changes.
- **Nothing was obsolete.** No document describes a feature, file or process
  that no longer exists.

## Gaps that remain

Listed so they are known, not because they were missed.

- **Three figures for one measurement.** The gain from the hero's entrance
  change is given as "about 150ms" in `docs/design.md`, as 1100 ms against
  968 ms in `docs/testing.md` and the changelog, and as 168ms in a stylesheet
  comment. They may be different quantities from the same session: the gap
  between first paint and the old paint, and the difference between the two
  versions. The repository cannot say, so none was changed.
- **A dated saving.** `docs/testing.md` records that a 192px portrait "saves
  10 KB per visit", in a section dated 2026-11-14. The portrait has changed
  since, and with today's files the difference is 3 to 4 KB. It was left as a
  record of that day's measurement.
- **No check that a picture is not enlarged.** One was, by 4%, and it was
  found by measurement, not by a test
  ([CLEANUP_REPORT.md](CLEANUP_REPORT.md#found-and-fixed-on-the-owners-decision)).
  The sources live in other repositories, so the rule is kept by hand.
- **What a repository cannot confirm.** Statements about the live site, the
  Cloudflare zone, Render's dashboard, GitHub's settings and past
  measurements were not checked here. The Render settings were read from the
  dashboard earlier the same day, and that is recorded in
  `docs/deployment.md`.
- **Copy in components is outside the font check.** The existing gap in
  `docs/testing.md` stands: text written in JSX follows the font-subset rule
  by hand.
