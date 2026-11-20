# Remediation plan

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). This document is
also the record of what was changed.

## Every finding

| ID | Severity | Finding | Status | State |
|----|----------|---------|--------|-------|
| [F-01](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors) | High | The rate limiter counts proxies, not visitors | Confirmed in production | Fixed on the branch. Live check pending |
| [F-02](RELIABILITY_AUDIT.md#f-02-a-send-has-no-time-limit) | Medium | A send has no time limit | Confirmed | Fixed |
| [F-03](RELIABILITY_AUDIT.md#f-03-render-deploys-the-backend-whether-or-not-ci-passed) | Medium | Render deploys the backend whether or not CI passed | Confirmed from documentation | Open: owner |
| [F-04](RELIABILITY_AUDIT.md#f-04-nothing-notices-when-the-form-stops-working) | Medium | Nothing notices when the form stops working | Confirmed | Open: owner |
| [F-05](SECURITY_AUDIT.md#f-05-a-crafted-subject-or-address-makes-the-api-answer-500) | Low | A crafted subject or address makes the API answer `500` | Confirmed, locally and in production | Fixed |
| [F-06](SECURITY_AUDIT.md#f-06-an-address-holding-control-characters-is-accepted-then-rewritten) | Low | An address holding control characters is accepted, then rewritten | Confirmed locally | Fixed |
| [F-07](RELIABILITY_AUDIT.md#f-07-an-allow-list-entry-no-browser-can-match-fails-silently) | Low | An allow-list entry no browser can match fails silently | Confirmed | Fixed |
| [F-08](TESTING_AUDIT.md#f-08-the-failure-paths-and-two-silent-couplings-had-no-test) | Low | The failure paths and two silent couplings had no test | Confirmed | Fixed |
| [F-09](RELIABILITY_AUDIT.md#f-09-the-node-version-render-runs-may-not-be-the-one-ci-tests) | Low | The Node version Render runs may not be the one CI tests | Requires verification | Open: owner |
| [F-10](CODE_QUALITY_AUDIT.md#f-10-four-documents-and-two-comments-stated-the-limiters-production-behaviour-as-fact) | Low | Four documents and two comments stated the limiter's production behaviour as fact | Confirmed | Fixed |
| F-11 | Informational | No ceiling on sends overall | Confirmed | Accepted, already a documented non-goal |
| F-12 | Informational | Error detail in a `500` is opt-out | Confirmed; production verified safe | Recorded |
| F-13 | Informational | `localhost:5173` is an allowed origin in production | Confirmed in production | Accepted |
| F-14 | Informational | One send attempt, no idempotency key | Confirmed | Accepted |
| F-15 | Informational | Keep-alive timeout is Node's default behind Render's proxy | Requires verification; no symptom seen | Recorded |
| F-16 | Informational | Invisible characters pass validation | Confirmed | Recorded |
| F-17 | Informational | No static typing | Confirmed | Accepted |
| F-18 | Informational | A legacy option name, two liveness routes, one unused config field | Confirmed | Recorded |

## Priorities

**A. Essential corrections.** F-01, F-02, F-05, F-06. All four are fixed on
the branch. F-01 is not finished until its live check passes.

**B. Important improvements.** F-03, F-04, F-07, F-08, F-09, F-10. Four are
fixed. F-03 and F-09 are settings in the Render dashboard, and F-04 is a
decision about how the owner wants to be told.

**C. Optional.** F-11 to F-18, and a `render.yaml` Blueprint
([ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md#recommendations)). None is
recommended as urgent, and several are recommended against.

## What changed

Four batches, each with its tests and its documentation.

### 1. The client address (F-01, F-10)

| File | Change |
|------|--------|
| `backend/config/env.js` | `trustProxyHops`, from `TRUST_PROXY_HOPS`, default `2`, with the reasoning and the limit of what is known beside the constant |
| `backend/server.js` | `trust proxy` reads the setting instead of the literal `1` |
| `backend/routes/contactRoutes.js` | The comment no longer claims the key is the real client |
| `backend/test/contact.test.js` | A test that pins which `X-Forwarded-For` entry is read, and that a forged entry and a different proxy do not change it |
| `docs/deployment.md` | The check against the live API, with a table for reading its result |
| `docs/api.md`, `docs/security.md`, `docs/architecture.md`, `CLAUDE.md` | State the assumption and point at the check |

Why `2` and not a measured number: the header as the app receives it cannot
be seen from outside, and Render does not document it. `1` was measured to be
too low, Render documents two layers, and two can only be right or still too
low. Too high is the dangerous direction, since it trusts an entry the client
wrote, and two cannot be too high.

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
- **Anything in the Render dashboard.**

## Verification

| Check | Result |
|-------|--------|
| `npm run lint` (frontend and backend) | Clean |
| `node --test` in `backend/` | 33 of 33 |
| `npm run test:invariants` | 20 of 20 |
| Mutation check | 9 of 9 fixes are caught by their tests |
| Server booted with bad settings | One warning for each, then serving |
| Benchmark before and after | No measurable difference |

Not yet done, because each needs a deploy: the live limiter check, and CI on
the pull request, which also runs the frontend suites this audit did not.

## What the owner has to do

In order.

1. **Merge the branch.** Merging deploys the backend to Render and, once CI
   is green, the frontend to Cloudflare. No frontend file changed.
2. **Run the live check** in
   [`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key).
   It takes four requests and one from a phone. If the readings do not count
   down, set `TRUST_PROXY_HOPS=3` on the Render service and run it again.
   Then replace the sentence in `backend/config/env.js` that says the number
   is "read from its documentation" with the fact.
3. **Set Auto-Deploy to After CI Checks Pass** on the Render service (F-03),
   then correct the four places that say Render is ungated.
4. **Read the Node version in the latest deploy log** (F-09). If it is not
   24, set `NODE_VERSION=24`.
5. **Choose how to hear about a broken form** (F-04).

## Outstanding risks

| Risk | Until |
|------|-------|
| The limiter is still shared in production | The branch is deployed and step 2 passes |
| Two might be too low, leaving the key on a Cloudflare address shared by a region | Step 2, including its second-network step |
| A backend commit that fails its tests is deployed | Step 3 |
| A failing mailer goes unnoticed | Step 5 |
| Real delivery is unverified by any automated test | Accepted. A manual send after any change to the mailer |
