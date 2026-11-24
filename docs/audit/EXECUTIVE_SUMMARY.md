# Backend audit: executive summary

A review of `backend/`, the Express service behind the site's contact form,
carried out on 2026-11-20 against commit `f07475f` (v2.5.0). Line numbers
throughout this set refer to that commit. The fixes were merged and deployed
the same day, in pull requests #61 and #62, and released as v2.6.0; what
happened when they met production is under [After the deploy](#after-the-deploy).

This set is a dated record of that day and is not kept up to date. The current
state of the one check still open on the rate limiter is in
[`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key).

## Verdict

**As audited, at `f07475f`: not production ready, on one defect.** The rate
limiter, the only control that bounds abuse of the contact form, did not count
visitors. It counted Render's proxies, so every visitor shared a few counters
and a handful of requests from anyone locked the form for everyone for 15
minutes. This was measured against the live API, not inferred
([F-01](SECURITY_AUDIT.md#f-01-the-rate-limiter-counts-proxies-not-visitors)).

**As deployed at the end of 2026-11-20, with the fix checked live: production
ready with accepted risks.** The rest of the service is small, deliberate and largely correct.
Injection handling, error mapping, the honeypot and the body parsing all held
up under hostile input, and most of what the existing documentation claims
was confirmed by test.

Recommendation: approve it for continued operation. Nothing here loses or
exposes data, a visitor who is refused is shown the email address, and the defect that
made the audited version unfit was replaced the same day.

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

Nineteen: one high, three medium, seven low, eight informational. The last,
F-19, was found after the audit, when the Render dashboard was opened to
close F-03.

| ID | Severity | Finding | State |
|----|----------|---------|-------|
| F-01 | High | The rate limiter counts proxies, not visitors, in production | Fixed, and checked live from one network |
| F-02 | Medium | A send has no time limit, so a stalled provider holds requests open | Fixed |
| F-03 | Medium | Render deploys the backend whether or not CI passed | Fixed: Auto-Deploy set to After CI Checks Pass |
| F-04 | Medium | Nothing notices when the form stops working | Open |
| F-05 | Low | A crafted subject or address makes the API answer `500` | Fixed |
| F-06 | Low | An address holding control characters is accepted, then rewritten | Fixed |
| F-07 | Low | An allow-list entry no browser can match fails silently | Fixed |
| F-08 | Low | The failure paths and two silent couplings had no test | Fixed |
| F-09 | Low | The Node version Render runs may not be the one CI tests | Closed, not a defect: the deploy log shows 24.22.3, read from `.nvmrc` |
| F-10 | Low | Four documents and two comments stated the limiter's production behaviour as fact | Fixed |
| F-19 | Low | The documented Render settings did not match the dashboard | Fixed: the docs corrected, then the build command and `NODE_ENV` set properly |
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

The fix makes the number a setting and documents a four-request check that
tells a right number from a wrong one.

## After the deploy

The check earned its place within the hour, against the fix itself.

The first version (#61) trusted two proxies, because Render's documentation
describes two layers, Cloudflare and its own load balancers. It was safe to
deploy unverified, since one had been measured too low and two could not be
too high. Run against the live API, it failed: six requests on fresh
connections from one machine landed on four counters. A different proxy
layer, and still not the visitor.

The second version (#62) trusts three. Nine requests, four from a browser and
five from a script on fresh connections, counted down a single counter, 4, 3,
2, 1, 0, and the last four were refused. A forged `X-Forwarded-For` changed
nothing. One counter where there had been three, then four.

Two things are worth keeping from that. The first fix repeated, in a smaller
way, the mistake it was correcting: it took a number about production from
documentation. And what caught it was not review or tests but a measurement
that had been written down as a procedure before the deploy.

One caution learned on the way: the first run of the check, a minute after
the deploy, read 4, 3, 4, 2, and that alone could not be told apart from
Render's previous instance still answering beside the new one.
`docs/deployment.md` now says to wait a few minutes.

## Risks that remain

1. **The live check has passed from one network only.** A proxy count that
   was still too low, where the proxy seen happened to be a single fixed
   address, would look the same from one place. The second-network step in
   `docs/deployment.md`, one request from a phone on mobile data while this
   network's counter is spent, rules that out and has not been run.
2. **The Render service is configured only in its dashboard.** F-03 was
   closed there on 2026-11-20, and looking found F-19: three statements in
   the docs about that dashboard were wrong. Those are corrected and the
   settings behind them put right, but nothing in the repository can notice
   the next drift.
3. **Nobody is told when the form fails (F-04).** F-01 is the proof: it ran
   unnoticed for the life of the service.
4. **Real delivery is never exercised automatically.** Whether Resend accepts
   and delivers is checked only by sending a message by hand.

## Next steps

In order:

1. Run the second-network step of the check in
   [`docs/deployment.md`](../deployment.md#checking-the-rate-limiters-key).
   Everything before it is done.
2. Decide how the owner hears about a broken form:
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
