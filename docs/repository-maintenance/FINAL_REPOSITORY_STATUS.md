# Final repository status

Part of the [2026-11-20 repository cleanup](CLEANUP_REPORT.md). The state of
the repository after the pass. The changes were made on the branch
`chore/repo-cleanup` and left uncommitted, as the brief asked; the owner then
chose to have them committed and merged.

## How to read the statuses

- **PASS**: verified and satisfactory.
- **PASS WITH OBSERVATIONS**: acceptable, with minor improvements outstanding.
- **FAIL**: a confirmed problem.
- **NOT VERIFIED**: the evidence could not be had.

## Assessment

| Area | Status | Basis |
|------|--------|-------|
| Repository cleanliness | PASS | 177 files, each with a purpose. Two tools and a cross-check found no unreachable file, unused export or unused dependency. No tracked file is ignored, and no generated file is tracked by accident |
| Frontend maintainability | PASS WITH OBSERVATIONS | Every component, class, token and asset is in use, and the one picture that was saved larger than its source is re-cut. The observation: about a dozen CSS declarations restate a default |
| Backend maintainability | PASS | Four modules, one direction, 33 tests. The unused field and the deprecated option the audit had noted are gone |
| Dependency health | PASS | 28 declared, every one accounted for. No advisory at any severity in either project. Lockfiles consistent and untouched |
| Documentation accuracy | PASS WITH OBSERVATIONS | 28 files reviewed, six stale statements corrected, 0 broken links of 271. The observations: three figures for one past measurement that the repository cannot reconcile, and one dated saving |
| Git configuration quality | PASS | `.gitignore`, `.gitattributes` and `.editorconfig` each tested against the tree. Every file is stored with LF or is binary, with no trailing whitespace anywhere |
| Build and test integrity | PASS | Lint, 33 backend tests, 14 content tests, 20 invariants, the production build, 8 size budgets and 29 browser tests all pass. Each change that could alter behaviour has its own proof |
| Production deployment safety | NOT VERIFIED | Nothing was deployed when this was written, and the changed workflows had not been run. What protects the deploy that follows is already in place: the frontend is published, and the backend redeployed, only after every CI job passes, and a check of the live site runs after the publish |
| Remaining technical debt | PASS WITH OBSERVATIONS | Listed below. None blocks anything |

## Against the acceptance criteria

| Criterion | Met |
|-----------|-----|
| Confirmed unnecessary files and folders removed | Yes. There were none |
| Confirmed dead code removed | Yes: four elements |
| Frontend and backend remain functional | Yes, by every test that exists |
| No required runtime file deleted | Yes. No file was deleted |
| Dependencies and lockfiles consistent | Yes, and unchanged |
| Documentation reflects the repository | Yes, with the gaps named in the documentation report |
| Markdown links and references valid | Yes: 271 of 271 |
| Git configuration accurate | Yes |
| No secret or local artifact introduced | Yes. A search for key shapes finds only a placeholder |
| All available checks run | Yes, apart from the Postman collection and the workflows themselves |
| No new regression | None found |
| All changes documented | Yes, in these five reports and the changelog |
| Git history and existing changes intact | Yes. Nothing was rewritten, and no tag or branch was removed. The pass added a working branch and, on the owner's decision, one commit |

## Remaining debt

In rough order of worth.

1. **The two items the backend audit left with the owner.** One request from
   a second network to finish the rate limiter's check, and a way to hear
   when the form stops working.
2. **Nothing lints the two scripts at the repository root.**
   `scripts/gen-og-card.mjs` and `test/invariants.test.js` belong to neither
   project. They are short and run often, so this has not bitten.
3. **Nothing checks that a picture is not enlarged.** One was, and it took a
   measurement against its source to find. The sources are in other
   repositories, so the rule is kept by hand.
4. **Dead-code analysis is not automated.** It was run by hand here. Knip was
   considered as a permanent tool in an earlier review and declined, and its
   current major crashed on this machine. If it is wanted, the previous major
   works.
5. **About a dozen CSS declarations restate a default.** Harmless, and left
   alone because removing them would tie each component to the reset.
6. **The Apple tooltip was fixed without an Apple device.** The test reports
   the platform as a Mac in Chromium. A look in Safari would close it.

## On this machine only

Not part of the repository, and left as found:

- 14 remote-tracking references to branches GitHub no longer has.
  `git fetch --prune` removes them.
- A `node_modules/` at the repository root, left by the social-card
  generator's unsaved install. It is ignored, and its copy of `sharp` is what
  re-cut the picture.
- Two working copies with CRLF line endings, `LICENSE` and
  `frontend/public/sw.js`, over an index that holds LF.

## The commit

The brief asked for a suggested message and no commit. Asked afterwards, the
owner chose to commit and merge, so this is the message the commit carries:

```text
chore(repo): remove dead code, fix the Apple tooltip, correct the docs

A pass over the whole tree found no unused file, export or dependency,
and four small pieces of code that did nothing: an unread config field,
a placeholder style for fields with no placeholder, and two CSS
declarations that moved no element at any of four widths.

Reading the source found what tools do not. On Apple devices the dock's
Search tooltip stood three lines tall, because the reset makes every svg
a block; it has a display of its own now, and a browser test runs that
branch. ESLint applied no rule to the frontend's .mjs files. Ten
comments described code that had changed, and six statements in the
docs had fallen behind it.

The FastAPI card picture was a 920px crop saved at 960, against the
rule that none is upscaled. It is re-cut at 920. The truer file is
1.1 kB heavier, since an enlarged picture is a blurred one and
compresses better, so the WebP budget moves from 210 to 212 kB.

The link check now reads docs/audit and docs/repository-maintenance, and
the rate limiter is configured with `limit`, not the deprecated `max`.
docs/repository-maintenance/ has the record.
```

Two things follow from merging it. Two backend files changed, so Render
redeploys the backend once CI has passed. And the entries sit under
`Unreleased` in the changelog: if they should ship as a version, the release
steps are in `docs/deployment.md`.
