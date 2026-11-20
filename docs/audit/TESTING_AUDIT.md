# Testing audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). Line numbers
refer to commit `f07475f`.

## What was run

Every command was run on Windows 11 with Node 26.13.1 and npm 11.20.0. CI
runs the same commands on Ubuntu with Node 24.

### At the baseline, before any change

| Command | Result |
|---------|--------|
| `npm run lint` in `backend/` | Clean |
| `node --test` in `backend/` | 18 of 18 passed, in 2.2 seconds |
| `npm audit --omit=dev --audit-level=high` (the CI gate) | 0 vulnerabilities |
| `npm audit` (every severity, development packages included) | 0 vulnerabilities |
| `npm ls --all` | Exit 0: the lockfile and `package.json` agree |
| `npm outdated` | Three packages behind by a patch or minor |
| Latest CI run on `main`, for `f07475f` | Success |

### After the changes

| Command | Result |
|---------|--------|
| `npm run lint` in `backend/` | Clean |
| `node --test` in `backend/` | 33 of 33 passed, in 0.7 seconds |
| `npm run test:invariants` | See [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md#verification) |
| The mutation check below | 9 of 9 caught |

### Not run

- **The frontend suites** (content tests, build, size budgets, browser
  tests). No frontend file was changed. CI runs them on the pull request.
- **The Postman collection.** It needs Postman or Newman, and its assertions
  duplicate the API tests.
- **A real send.** No email was sent at any point in this audit.
- **A load test of production.** With F-01 live, even sixteen requests
  disturbed it.

## The existing suite

Eighteen tests in two files, on Node's own runner with no test dependency.

**What it does well.**

- **It tests the real thing.** Both files import the Express app and make
  real HTTP requests to it on an ephemeral port. Nothing in Express, the
  limiter, CORS or the body parser is mocked.
- **The provider is faked at the right layer.** `delivery.test.js` replaces
  `fetch`, not the SDK, so the SDK's own request building and error handling
  run in every test. That is what let this audit trust its findings about the
  SDK.
- **It cannot send mail.** One file blanks the credentials before importing
  the app; the other points the SDK at the reserved `.invalid` domain. Both
  were confirmed by reading, and the audit's probes reused the second method.
- **Assertions are exact.** Bodies are compared whole with `deepEqual`, not
  matched loosely.
- **Tests are isolated.** Each one that spends rate-limit quota uses its own
  client address, so order does not matter. No test sleeps.

**What it missed.** Collected as one finding.

### F-08: The failure paths and two silent couplings had no test

| | |
|---|---|
| Severity | Low |
| Status | Confirmed |
| Where | `backend/test/contact.test.js`, `backend/test/delivery.test.js` |
| State | Fixed |

| Gap | Why it mattered |
|-----|-----------------|
| No test made the provider fail | The `502` mapping, and the promise that nothing the provider says reaches a response, were unverified. The `EmailDeliveryError` branch (`contactRoutes.js:93-96`) had never run in a test |
| The CORS test sent a simple `GET` | The form's `POST` needs a preflight naming the method and the `Content-Type` header. Removing `POST` from the allowed methods would have broken the live form and failed no test |
| Nothing tied the body cap to the field caps | The largest valid submission in a three-byte script is 16,061 bytes against a 16,384 cap. Raising a field cap alone would refuse only those visitors |
| The limiter's window was not asserted | A change from 15 minutes to one would have passed. The count of five also equals the library's default, so the test could not tell an ignored option from an honoured one |
| No test pinned which `X-Forwarded-For` entry the limiter reads | Every test sent a one-entry header, which gives the same key for any proxy count. The suite passed identically under the wrong setting (F-01) |
| The configuration parser had no test | It could not have one without changing real environment variables |

Fifteen tests were added. They are listed in
[`docs/testing.md`](../testing.md#api-tests).

## Do the new tests prove anything?

A test that passes whether or not its fix is present is decoration. Each fix
was undone in turn and the suite run again:

| Change undone | Test that failed |
|---------------|------------------|
| One proxy trusted instead of two | `the limiter keys on the address the proxies report, not one the client wrote` |
| No timeout on the Resend call | `a Resend that never answers is a 502 once the timeout passes` (the run had to be killed: the request never completed) |
| Unpaired surrogates left in the subject | `text that is not well-formed Unicode is repaired and sent, not a 500` |
| Control characters allowed in the address | `rejects an address no mailbox could have with 400` |
| The provider's message returned in the `502` | `a send Resend refuses is a 502 that repeats nothing Resend said` and two more |
| Body cap lowered to 15 KB | `the largest submission the field caps allow fits under the body cap` |
| `POST` removed from the CORS methods | `CORS answers the preflight the form's POST depends on` |
| Rate-limit window cut to one minute | `rate-limits the sixth request from one address` |
| The origin warning switched off | `an allow-list entry no browser could send is reported at boot` |

Nine of nine. In every case only the tests for that behaviour failed.

## Probe results

Beyond the suite, the real app was driven in-process with 73 requests against
a fake provider. The outcomes that became findings are in the other
documents. The rest confirmed existing behaviour:

| Area | Requests | Outcome |
|------|----------|---------|
| Field content | 13 | Two defects (F-05, F-06); HTML escaped; wrong types refused; no prototype pollution |
| Body parser | 13 | Every malformed, oversized, compressed or mis-typed body refused with the documented status |
| Provider failure | 5 | Four became the fixed `502`; the fifth, a silent provider, hung (F-02) |
| Rate limiter | 21 | Headers as documented; exact under concurrency; IPv6 keyed by `/56`; the last `X-Forwarded-For` entry was the key |
| Routes, methods, CORS | 21 | Every row of the tables in `docs/api.md` reproduced |

## What tests still cannot show

These are limits, not oversights, and the first is the important one.

- **Whether the limiter keys on the visitor in production.** The tests prove
  which header entry is read. Which entry is the visitor depends on Render's
  proxies. Only the check in
  [`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key)
  answers that, by hand, after a deploy.
- **Whether Resend accepts and delivers.** Every test stops at a fake.
- **The `500` branch of the central handler.** With F-05 fixed, no input was
  found that reaches it, so it has no test and its generic message in
  production was verified only once, by this audit, through the defect that
  has now been removed.
- **Graceful shutdown.** No test sends `SIGTERM`.
- **A cold start.** The 60-second wait and the wake-up ping live in the form,
  and no test exercises them against an instance that is really asleep.
