# Code quality audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). Line numbers
refer to commit `f07475f`.

## Summary

The code is better than most of its size: four modules with one job each, no
dead code of consequence, comments that explain decisions, and no abstraction
that is not earning its place. The one systemic weakness is not in the code
but beside it: a claim about production that was written down as fact in six
places and never measured (F-10).

## Structure

| Property | Assessment | Evidence |
|----------|------------|----------|
| Separation of concerns | Sound | `process.env` appears only in `config/env.js`; the route imports no SDK; the mailer imports nothing from Express |
| Cohesion | Sound | Every export is imported somewhere, and each module exports only what its job needs |
| Coupling | Low, one-directional | `server` to `routes` to `services` to `config`, no cycle |
| Function size | Fine | The longest function is the HTML template, about 50 lines of markup. The longest with logic is the route handler, 40 lines |
| Magic values | Named | Field caps in one table, the honeypot name, the limiter's window and count, the brand colours each have a constant and a comment |
| Duplication | One deliberate case | The field rules and email pattern are repeated in the form, and `test/invariants.test.js` fails if they drift |
| Global state | One singleton | The Resend client is created at import (`mailerService.js:7`). Acceptable: tests replace `fetch` at the network edge instead of injecting a client |

## Correctness of the asynchronous code

There is one `async` handler. Its `await` is inside a `try`, the two expected
errors are matched by class, and anything else goes to `next(err)`
(`contactRoutes.js:82-98`). Express 5 forwards a rejected handler promise to
the error middleware, so an unexpected throw before the `try` would be handled
too. The error middleware checks `res.headersSent` before writing
(`server.js:63-66`). No promise is created and dropped, and no `catch` is empty
except the one that deliberately answers "not run directly" (`server.js:127`).

## Input handling

Every value read from a request body is checked with `typeof` before use
(`contactRoutes.js:42`, `:67`), which is the right substitute for static types
at a trust boundary. Two gaps were found in what counts as valid, both about
characters and both fixed: [F-05 and F-06](SECURITY_AUDIT.md#findings).

## Findings

### F-10: Four documents and two comments stated the limiter's production behaviour as fact

| | |
|---|---|
| Severity | Low in itself. It is how the high finding survived |
| Status | Confirmed |
| Where | `backend/server.js:12-13`, `backend/routes/contactRoutes.js:27-28`, `docs/api.md:194-196`, `docs/deployment.md:209-212`, `docs/security.md:24`, `CLAUDE.md:96` |
| State | Fixed |

Each said, in its own words, that trusting one proxy makes the limiter key on
the real client behind Render. It does not
([F-01](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors)).
The statement was plausible, consistent across every document, and backed by
passing tests, which is why nobody doubted it.

This repository is unusually careful about the difference between what is
checked and what is assumed: its invariants test exists to catch values that
"fail silently". The proxy count was one of those and was not on the list,
because it cannot be checked without the platform.

All six now say what was measured and point at the check. `docs/testing.md`
lists the check under its known gaps.

The first fix repeated the mistake on a smaller scale. It took the number two
from Render's documentation, said so, and shipped with a check instead of a
claim, and the check showed two was wrong as well. The correct number, three,
is in none of the documentation this audit could find.

**A note for the rest of the documentation.** The other claims this audit
could test were accurate: every status code and message in `docs/api.md`, the
three-row `OPTIONS` table, the header table, the limiter's headers, the
honeypot's behaviour, the "before the limiter" ordering, and the test counts
in `docs/testing.md`.

## Informational

### Typing

**F-17: No static typing.** The backend is plain JavaScript with no JSDoc
types and no `checkJs`. For 450 lines with one data shape, four string
fields, that is a reasonable choice and this audit does not recommend
TypeScript. The cheap middle step, should the service grow a second endpoint,
is `// @ts-check` with JSDoc and `tsc --noEmit` in CI, which adds one
development dependency and no build.

### Small things

**F-18**, three of them. The audit left all three; the repository cleanup
that followed it fixed the first and the last
([`docs/repository-cleanup.md`](../repository-cleanup.md)):

- `rateLimit({ max: 5 })` used the option's legacy name. The installed
  version still honours it (`limit: passedOptions.max ?? 5` in its source,
  under a comment calling it deprecated), and the current name is `limit`.
  Now `limit`.
- `GET /` and `GET /health` are both liveness probes. One would do. Kept:
  both are documented, tested and in the Postman collection.
- `config.nodeEnv` was defined and never read (`config/env.js:26`). Removed.

## Dependencies

| Check | Result |
|-------|--------|
| Production dependencies | 6 direct, 76 packages in the tree |
| Development dependencies | 3: ESLint, its recommended config, `globals` |
| Each one used | Yes. Each production package is imported by exactly one or two modules |
| Known vulnerabilities | 0 at any severity, development packages included (`npm audit`) |
| Lockfile | Consistent with `package.json` (`npm ls --all` exits clean) |
| Behind latest | Three, all by a patch or minor: `eslint` 10.14.0 to 10.15.0, `express-rate-limit` 8.7.3 to 8.7.5, `resend` 6.37.0 to 6.39.0. Dependabot is configured for weekly grouped updates with a seven-day cooldown |
| Overrides | `minimatch` forced to `^11.0.1`, effective (`11.0.5` installed) and documented |
| Abandoned packages | None found among the direct dependencies |
| Could be removed | `dotenv`, in favour of Node's own `--env-file-if-exists`. Not worth the churn: it would change how the server is started and buy nothing |

## Lint and style

ESLint runs the recommended rules and reports nothing. There is no formatter,
by a decision recorded in `backend/eslint.config.js`. The code is consistent
enough that its absence does not show.

## Comments

Comments explain why, as the repository's conventions ask, and with the
exception of F-10 they were accurate. Two are worth keeping as examples: the
note on why the honeypot check runs after validation
(`contactRoutes.js:62-66`), and why the parser's error is logged by type only
(`server.js:68-72`). No `TODO`, `FIXME` or commented-out code was found.

## Changes made to the code

Described in [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md#what-changed). One is a
small refactor for testability: `config/env.js` now builds its object in
`loadConfig(env)` and collects its warnings in `configWarnings(env)`, both
pure, so the configuration can be tested without setting real environment
variables. `config` is still the single frozen object every other module
imports.
