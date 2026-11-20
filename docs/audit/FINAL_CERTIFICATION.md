# Final certification

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). An assessment by
one reviewer on one day, against commit `f07475f` as it was deployed when the
audit began, and against what replaced it the same day in pull requests #61
and #62. It is evidence, not a warranty.

## How to read the statuses

- **PASS**: verified against sufficient evidence.
- **PASS WITH OBSERVATIONS**: fundamentally sound, improvements advisable.
- **FAIL**: a confirmed defect or an unacceptable weakness.
- **NOT VERIFIED**: the evidence could not be had.

Where a category has nothing to assess, because the system has no such part,
that is said, and the status records that its absence was verified.

Two columns, because the answer differs: the version the audit found
deployed, and the version deployed now, after the fixes and their live check.

## By category

| Category | As audited (`f07475f`) | As deployed now | Basis |
|----------|------------------------|-----------------|-------|
| Architecture | PASS | PASS | Four modules, one direction, boundaries verified by search and by test |
| Code quality | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | Clean and small. Observations are minor (F-18) |
| Type safety | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | No static typing (F-17). Runtime type checks at the one trust boundary, tested with wrong types |
| Security | FAIL | PASS WITH OBSERVATIONS | F-01: the only abuse control counted proxies. Now it counts the caller, checked live from one network; the second-network step is the observation. Injection, parsing, disclosure and secrets all held under test |
| Authentication and authorization | PASS | PASS | None exists and none is needed: verified that no endpoint returns, stores or changes anything on a caller's behalf |
| Database integrity | PASS | PASS | No database: verified absent. The only state is the limiter's counters, exact under concurrency |
| API correctness | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | Every documented status reproduced. As audited: a `500` for malformed text (F-05). Both: `404` where `405` is conventional, by documented choice |
| Background processing | PASS | PASS | None exists: verified absent. The synchronous send is assessed under external integrations |
| External integrations | FAIL | PASS WITH OBSERVATIONS | As audited: no timeout on the one outbound call (F-02). Now: bounded, failure modes tested. Real delivery is never exercised automatically |
| Error handling | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | Typed errors, fixed messages, no provider detail in any response. Error detail is opt-out, not opt-in (F-12) |
| Performance | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | Measured locally at thousands of requests a second. Production throughput and provider latency were not measured |
| Scalability | PASS WITH OBSERVATIONS | PASS WITH OBSERVATIONS | Single instance by design and by plan. Stateless apart from the limiter |
| Observability | FAIL | FAIL | Clear logs that nothing reads. No alert, no uptime check, and F-01 ran unseen (F-04) |
| Testing | PASS WITH OBSERVATIONS | PASS | As audited: sound method, but no failure-path tests (F-08). Now: 33 tests, each new one shown to fail without its fix |
| Deployment and operations | FAIL | FAIL | A backend commit that fails CI is deployed (F-03). Runtime version unverified (F-09). Service settings live only in a dashboard |
| Documentation | PASS WITH OBSERVATIONS | PASS | Thorough and, where testable, accurate, except for one unverified claim repeated in six places (F-10), now corrected |

## Overall

**As audited, at `f07475f`: NOT PRODUCTION READY.**

One reason carries that: F-01. The control that is supposed to stop one
client from spending everyone's allowance did the opposite, in production,
measurably. Two more categories failed on operations rather than code.

**As deployed now: PRODUCTION READY WITH ACCEPTED RISKS.**

The fixes are live and the limiter passed its check against production: one
counter for nine requests where there had been three, and then four. That
check was run from one network, and its second-network step is still open.

The accepted risks are the ones the project chose and documented: one free
instance that sleeps, one send attempt with nothing stored, no CAPTCHA, no
delivery confirmation. They are proportionate to a personal contact form.

Two FAILs remain, and neither is in the code: observability and deployment.
Each is closed by a setting or a small scheduled check. They did not hold the
merge, and the service is not finished until they are done.

## Reasoning

A reviewer could look at this service, see 450 tidy lines with good comments,
passing tests, a green pipeline and unusually complete documentation, and
sign it off. That would have been wrong, and it is worth saying why.

The tests were correct. The documentation was consistent. The code did what
its comment said. The fault was in a number that describes somebody else's
infrastructure, and it could only be found by asking the running system. That
is the difference between a service that works and one that has been checked,
and it is the main thing this audit would ask the project to keep: when a
statement is about production, measure production.

Against that, the things that usually sink a small backend were not found
here. No injection in any field. No secret in the history. No provider detail
in a response. No dependency with an advisory. No path where a malformed
request does anything but get refused. Those were tested, not assumed, and
they held.

## Limits of this assessment

- One reviewer, one day, one location.
- No real email was sent, so nothing past Resend's API was observed.
- The Render dashboard was not inspected. Everything said about its settings
  comes from the repository's documentation and Render's own.
- Production was measured with 20 requests before the fixes and 19 more to
  the limiter after, enough to prove F-01 and its correction and nothing
  broader.
- The correction of F-01 was observed from one network. A count that was
  still too low but landed on a single fixed proxy address would look the
  same from there.
