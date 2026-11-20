# Backend audit: executive summary

An independent review of `backend/`, the Express service behind the site's
contact form, carried out on 2026-11-20 against commit `f07475f` (v2.5.0). Line
numbers throughout this set refer to that commit. The fixes described here are
on the branch `audit/backend-production-readiness` and are not deployed.

## Verdict

**As deployed today: not production ready, on one defect.** The rate limiter,
the only control that bounds abuse of the contact form, does not count
visitors. It counts Render's proxies, so every visitor shares a few counters
and a handful of requests from anyone locks the form for everyone for 15
minutes. This was measured against the live API, not inferred
([F-01](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors)).

**With the branch deployed and its live check passed: production ready with
accepted risks.** The rest of the service is small, deliberate and largely
correct. Injection handling, error mapping, the honeypot and the body parsing
all held up under hostile input, and most of what the existing documentation
claims was confirmed by test.

Would I approve it for continued operation? Yes. Nothing here loses or exposes
data, a visitor who is refused is shown the email address, and the fix is
written. I would not leave the deployed version running longer than it takes
to merge and check the branch.

## What was done

- Read every source file, test, workflow and backend document: 452 lines of
  source in four modules, 274 lines of tests, six production dependencies.
- Ran the repository's own checks at the baseline: lint clean, 18 of 18 tests
  passing, `npm audit` reporting nothing at any severity, lockfile consistent.
- Drove the real app in-process with 73 hostile or boundary requests against
  a fake mail provider, including a provider that refuses, breaks, answers
  nonsense and never answers.
- Measured the live API with 20 requests, none of which could send mail.
- Checked the platform assumptions against Render's own documentation.
- Benchmarked throughput and limiter memory locally.
- Fixed the confirmed defects, added 15 tests, and confirmed each new test
  fails when its fix is undone.

## Findings

Eighteen: one high, three medium, six low, eight informational.

| ID | Severity | Finding | State |
|----|----------|---------|-------|
| F-01 | High | The rate limiter counts proxies, not visitors, in production | Fixed on the branch; live check still to run |
| F-02 | Medium | A send has no time limit, so a stalled provider holds requests open | Fixed |
| F-03 | Medium | Render deploys the backend whether or not CI passed | Open: one dashboard setting |
| F-04 | Medium | Nothing notices when the form stops working | Open |
| F-05 | Low | A crafted subject or address makes the API answer `500` | Fixed |
| F-06 | Low | An address holding control characters is accepted, then rewritten | Fixed |
| F-07 | Low | An allow-list entry no browser can match fails silently | Fixed |
| F-08 | Low | The failure paths and two silent couplings had no test | Fixed |
| F-09 | Low | The Node version Render runs may not be the one CI tests | Open: needs a look at a deploy log |
| F-10 | Low | Four documents and two comments stated the limiter's production behaviour as fact | Fixed |
| F-11 to F-18 | Informational | Accepted trade-offs and small observations | Recorded |

Each has its evidence, reproduction and recommendation in the document for its
area. [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) lists them all in one table.

## The one that matters

`server.js` told Express to trust one proxy. The comment beside it, and four
documents, said that made the limiter key on the real client. Nobody had
checked, because nothing in the repository can: the answer depends on how many
proxies Render puts in front of the process.

Sixteen validation-failing requests from one machine, which was confirmed to
leave through a single public address, landed on three different counters.
A forged `X-Forwarded-For` value did not choose the counter. Three of the
sixteen were answered `429`. So the key is one of at least three proxy
addresses, shared by all visitors, and 5 to 15 requests spend everyone's
allowance. A bot that trips the honeypot spends it too, which means ordinary
spam can turn real visitors away without anyone attacking anything.

The measurement itself had that effect: for up to 15 minutes after it, around
08:05 to 08:20 UTC on 2026-11-20, a real visitor could have been told to try
again later.

The branch trusts two proxies, which is what Render's documentation describes,
makes the number a setting, and documents a four-request check that tells a
right number from a wrong one. Two cannot be worse than one. Whether it is
exactly right is the first thing to confirm after the deploy.

## Risks that remain

1. **The fix for F-01 is unverified in production.** If the live check still
   shows counters that do not count down, the number is three, and
   `TRUST_PROXY_HOPS=3` in the Render dashboard corrects it without a deploy.
2. **A backend commit that fails its tests is deployed anyway (F-03).** Render
   has had an "After CI Checks Pass" setting since May 2025. It is not on.
3. **Nobody is told when the form fails (F-04).** F-01 is the proof: it ran
   unnoticed for the life of the service.
4. **Real delivery is never exercised automatically.** Whether Resend accepts
   and delivers is checked only by sending a message by hand.

## Next steps

In order, and the first three take minutes:

1. Merge the branch, then run the check in
   [`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key),
   including its second-network step.
2. In the Render dashboard, set Auto-Deploy to **After CI Checks Pass**.
3. In the latest Render deploy log, read the Node version. If it is not 24,
   set `NODE_VERSION=24` on the service.
4. Decide how the owner hears about a broken form:
   [RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md#f-04-nothing-notices-when-the-form-stops-working)
   has two cheap options.

## The set

| Document | Covers |
|----------|--------|
| [ARCHITECTURE_REVIEW.md](ARCHITECTURE_REVIEW.md) | Modules, flows, dependencies, what was found sound |
| [SECURITY_AUDIT.md](SECURITY_AUDIT.md) | F-01, F-05, F-06 and the controls that held |
| [RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md) | The send path, failure windows, deploys, detection |
| [DATABASE_AUDIT.md](DATABASE_AUDIT.md) | What state exists, given that there is no database |
| [CODE_QUALITY_AUDIT.md](CODE_QUALITY_AUDIT.md) | Structure, typing, dependencies, documentation accuracy |
| [TESTING_AUDIT.md](TESTING_AUDIT.md) | What was run, what the tests prove, what they cannot |
| [PERFORMANCE_AUDIT.md](PERFORMANCE_AUDIT.md) | Measurements and limits |
| [REMEDIATION_PLAN.md](REMEDIATION_PLAN.md) | Every finding, what changed, what is left |
| [FINAL_CERTIFICATION.md](FINAL_CERTIFICATION.md) | Category by category, with the reasoning |
