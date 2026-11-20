# Remediation plan

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). This document is
also the record of what was changed.

## Every finding

| ID | Severity | Finding | Status | State |
|----|----------|---------|--------|-------|
| [F-01](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors) | High | The rate limiter counts proxies, not visitors | Confirmed in production | Fixed, and checked live from one network |
| [F-02](RELIABILITY_AUDIT.md#f-02-a-send-has-no-time-limit) | Medium | A send has no time limit | Confirmed | Fixed |
| [F-03](RELIABILITY_AUDIT.md#f-03-render-deploys-the-backend-whether-or-not-ci-passed) | Medium | Render deploys the backend whether or not CI passed | Confirmed from documentation, then in the dashboard | Fixed: the setting was changed on 2026-11-20 |
| [F-04](RELIABILITY_AUDIT.md#f-04-nothing-notices-when-the-form-stops-working) | Medium | Nothing notices when the form stops working | Confirmed | Open: owner |
| [F-05](SECURITY_AUDIT.md#f-05-a-crafted-subject-or-address-makes-the-api-answer-500) | Low | A crafted subject or address makes the API answer `500` | Confirmed, locally and in production | Fixed |
| [F-06](SECURITY_AUDIT.md#f-06-an-address-holding-control-characters-is-accepted-then-rewritten) | Low | An address holding control characters is accepted, then rewritten | Confirmed locally | Fixed |
| [F-07](RELIABILITY_AUDIT.md#f-07-an-allow-list-entry-no-browser-can-match-fails-silently) | Low | An allow-list entry no browser can match fails silently | Confirmed | Fixed |
| [F-08](TESTING_AUDIT.md#f-08-the-failure-paths-and-two-silent-couplings-had-no-test) | Low | The failure paths and two silent couplings had no test | Confirmed | Fixed |
| [F-09](RELIABILITY_AUDIT.md#f-09-the-node-version-render-runs-may-not-be-the-one-ci-tests) | Low | The Node version Render runs may not be the one CI tests | Verified from a deploy log: 24.22.3, from `.nvmrc` | Closed, not a defect |
| [F-10](CODE_QUALITY_AUDIT.md#f-10-four-documents-and-two-comments-stated-the-limiters-production-behaviour-as-fact) | Low | Four documents and two comments stated the limiter's production behaviour as fact | Confirmed | Fixed |
| F-11 | Informational | No ceiling on sends overall | Confirmed | Accepted, already a documented non-goal |
| F-12 | Informational | Error detail in a `500` is opt-out | Confirmed; production verified safe | Recorded |
| F-13 | Informational | `localhost:5173` is an allowed origin in production | Confirmed in production | Accepted |
| F-14 | Informational | One send attempt, no idempotency key | Confirmed | Accepted |
| F-15 | Informational | Keep-alive timeout is Node's default behind Render's proxy | Requires verification; no symptom seen | Recorded |
| F-16 | Informational | Invisible characters pass validation | Confirmed | Recorded |
| F-17 | Informational | No static typing | Confirmed | Accepted |
| F-18 | Informational | A legacy option name, two liveness routes, one unused config field | Confirmed | Recorded |
| [F-19](RELIABILITY_AUDIT.md#f-19-the-documented-render-settings-did-not-match-the-dashboard) | Low | The documented Render settings did not match the dashboard | Confirmed in the dashboard | Fixed in the docs. The build command is the owner's call |

## Priorities

**A. Essential corrections.** F-01, F-02, F-05, F-06. All four are fixed and
deployed. F-01 passed its live check from one network; the second-network
step is left.

**B. Important improvements.** F-03, F-04, F-07, F-08, F-09, F-10, F-19. Five
are fixed, F-09 turned out not to be a defect, and F-04 is a decision about
how the owner wants to be told.

**C. Optional.** F-11 to F-18, and a `render.yaml` Blueprint
([ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md#recommendations)). None is
recommended as urgent, and several are recommended against.

## What changed

Four batches, each with its tests and its documentation.

### 1. The client address (F-01, F-10)

| File | Change |
|------|--------|
| `backend/config/env.js` | `trustProxyHops`, from `TRUST_PROXY_HOPS`, with the reasoning and the measurements beside the constant. Default `2` in #61, `3` in #62 |
| `backend/server.js` | `trust proxy` reads the setting instead of the literal `1` |
| `backend/routes/contactRoutes.js` | The comment no longer claims the key is the real client |
| `backend/test/contact.test.js` | A test that pins which `X-Forwarded-For` entry is read, and that a forged entry and a different proxy do not change it |
| `docs/deployment.md` | The check against the live API, with a table for reading its result |
| `docs/api.md`, `docs/security.md`, `docs/architecture.md`, `CLAUDE.md` | State the assumption and point at the check |

The number took two deploys to find. The header as the app receives it cannot
be seen from outside, and Render does not document it. `1` had been measured
too low and Render documents two layers, so #61 shipped `2`: it could only be
right or still too low, and too high is the dangerous direction, since that
trusts an entry the client wrote. The live check showed `2` was still too
low. #62 shipped `3` on the same argument, and the check passed. The readings
are in [SECURITY_AUDIT.md](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors).

### 2. The send (F-02, F-05)

| File | Change |
|------|--------|
| `backend/config/env.js` | `resendTimeoutMs`, from `RESEND_TIMEOUT_MS`, default 10,000 |
| `backend/services/mailerService.js` | The send carries an abort signal; a timeout is reported as one in the log. All four fields are made well-formed before rendering |
| `backend/test/delivery.test.js` | The fake provider can refuse, break and stay silent. Four tests: the three failures and the repaired text |

### 3. Validation and configuration (F-06, F-07)

| File | Change |
|------|--------|
| `backend/routes/contactRoutes.js` | An address holding a control character or an unpaired surrogate is a `400` |
| `backend/config/env.js` | `loadConfig(env)` and `configWarnings(env)`, pure, so they can be tested. Boot warnings for an origin no browser could send and for an unusable number |
| `backend/test/env.test.js` | New. Seven tests of the configuration |
| `backend/test/contact.test.js` | The address test |

### 4. The remaining test gaps (F-08)

| File | Change |
|------|--------|
| `backend/test/contact.test.js` | The preflight, the largest valid submission against the body cap, and the limiter's window |

### Documentation that moved with the code

`docs/api.md`, `docs/security.md`, `docs/deployment.md`,
`docs/development.md`, `docs/testing.md`, `docs/architecture.md`,
`docs/README.md`, `backend/README.md`, `backend/.env.example`, `CLAUDE.md`
and `CHANGELOG.md`.

### What was deliberately not changed

- **The frontend.** The stricter address rule is server-only. The form's
  pattern still matches the route's, which the invariants test compares, and
  the server's `400` is shown to the visitor as it is.
- **The Postman collection.** No endpoint, field or status code was added.
- **The version.** The entries are under `Unreleased` in the changelog. A
  release is a separate step.
- **Anything in the Render dashboard**, during the audit. Afterwards, on the
  owner's instruction, one setting was changed there: Auto-Deploy, to After
  CI Checks Pass (F-03). `NODE_VERSION` was asked for as well and not set,
  because the deploy log showed Node 24 already, taken from `.nvmrc` (F-09).

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` (frontend and backend) | Clean |
| `node --test` in `backend/` | 33 of 33 |
| `npm run test:invariants` | 20 of 20 |
| Mutation check | 9 of 9 fixes are caught by their tests |
| Server booted with bad settings | One warning for each, then serving |
| Benchmark before and after | No measurable difference |

After the deploys, the same day:

| Check | Result |
|-------|--------|
| CI on #61 and #62, including the frontend suites this audit did not run | Green, on the pull requests and on `main` |
| Frontend deploy check after each merge | Passed |
| The new build is the one answering | An unsendable address gets `400`; before, `500` |
| Live limiter check, two proxies trusted (#61) | Failed: four counters for six requests on fresh connections |
| Live limiter check, three proxies trusted (#62) | Passed: 4, 3, 2 and, with a forged header, 1 from a browser; then 0 and four `429`s from a script on fresh connections |
| The second-network step of that check | Not run. It needs a second network |
| Render's Auto-Deploy setting (F-03) | Changed to After CI Checks Pass, and read back after a reload |
| Render's Node version (F-09) | 24.22.3 in the latest deploy log, read from the repository's `.nvmrc` |
| Render's other settings against the docs (F-19) | Three differences, corrected in the docs |

## What the owner has to do

In order. Merging, the live check and the Auto-Deploy setting are done.

1. **Run the second-network step** of the check in
   [`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key):
   one request from a phone on mobile data while this network's counter is
   spent, which must read 4. Submitting the live form from the phone does as
   well, since it sends only if the phone has a counter of its own.
2. **Decide on the build command** (F-19): `npm ci --omit=dev` instead of
   `npm install`, and whether to set `NODE_ENV=production` explicitly.
3. **Choose how to hear about a broken form** (F-04).

## Outstanding risks

| Risk | Until |
|------|-------|
| The limiter's key is a single fixed proxy address rather than the visitor, which one network cannot tell apart | Step 1. Unlikely: both wrong counts scattered requests over several addresses |
| The Render service's settings drift from what the docs say, as three already had | A `render.yaml` Blueprint, or a habit of re-reading the dashboard |
| A failing mailer goes unnoticed | Step 3 |
| Real delivery is unverified by any automated test | Accepted. A manual send after any change to the mailer |
