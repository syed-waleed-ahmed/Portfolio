# Performance audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md).

## Summary

Performance is not a risk for this service. On a development machine the
process handles thousands of requests a second on every path, against the
load of one person's contact form. No bottleneck was found in the code. What a
visitor actually waits for is outside it: the free instance waking up, and
Resend's API.

Every number below was measured. None describes production, which runs on a
much smaller instance and was deliberately not load tested.

## Method

The real app, in-process, with the mail provider faked to answer at once, so
the figures are the cost of this code and its dependencies and nothing else.
One Node process acted as both client and server over loopback with 50
keep-alive connections. Node 26.13.1 on Windows 11. Each row is 5,000
requests unless it says otherwise.

## Throughput and latency

Measured twice, before and after the changes in this audit.

| Path | Before | After | p50 | p99 |
|------|--------|-------|-----|-----|
| `GET /health` | 11,245 req/s | 10,352 req/s | 4.6 ms | 8.1 ms |
| `POST`, invalid body (`400`), a new address each time | 7,914 | 7,352 | 6.1 ms | 29.0 ms |
| `POST`, valid, 500-character message, sent (`200`) | 3,509 | 3,472 | 14.0 ms | 31.3 ms |
| `POST`, valid, 5,000-character message, sent (`200`) | 3,539 | 3,537 | 13.7 ms | 19.4 ms |
| `POST` over the limit (`429`) | 9,518 | 9,833 | 4.9 ms | 7.3 ms |
| `POST`, 60 KB body (`413`, refused before the limiter), 3,000 requests | 5,358 | 5,224 | 8.8 ms | 16.2 ms |
| `POST` from 200,000 different addresses | 9,948 | 10,251 | 10.2 ms | 16.0 ms |

The percentiles are from the second run. The two runs differ by less than the
noise between any two runs on a desktop machine, so the timeout signal and the
text repair added here cost nothing measurable.

What the table says:

- **Message size does not matter.** A 5,000-character message costs the same
  as a 500-character one. Rendering two templates and escaping four strings
  is not where the time goes.
- **Refusals are cheap.** A request over the limit is answered about as fast
  as a health check, and an oversized body is refused on its `Content-Length`
  before any of it is read (`raw-body/index.js:162`).
- **The send path is the slowest at about 3,500 a second**, and that is with
  a provider that answers instantly. In production the provider's latency
  dominates, and it was not measured, because that needs real sends.
- **The event loop is never held.** Its delay at the 99th percentile stayed
  under 16 ms on every path, which is the client and server sharing one
  process, not the server stalling.

## Memory

| Measurement | Result |
|-------------|--------|
| Heap growth after 200,000 new limiter keys | 38.6 MB, about 200 bytes a key |
| Resident memory at the end of the whole run | 186 MB |

The limiter is the only structure that grows with traffic. It holds one entry
per client address per 15-minute window and drops them when the window ends.
Two hundred thousand distinct addresses in 15 minutes is far beyond anything
this service will see, and costs under 40 MB.

This is where the proxy count matters a second time. If it were set too high,
the key would be a header the client controls, and a client could create
entries at will instead of being limited to one. At 200 bytes each that still
takes millions of requests in 15 minutes to matter, through a platform proxy
that would throttle them first.

## The live service

Two readings, from one location, are not a benchmark and are recorded only as
observations:

| Request | Time |
|---------|------|
| `GET /health`, first | 172 ms |
| `GET /health`, second | 70 ms |

The instance was already awake. A sleeping one takes about a minute to answer
by Render's documentation. That delay is the service's real performance
characteristic, and the form is built around it: a wake-up request on first
focus, a notice after 6 seconds, a 60-second limit.

## Limits

| Limit | Where it comes from | Consequence |
|-------|---------------------|-------------|
| One instance | Render's free tier does not scale past one | The in-memory limiter is correct only because of this. A second instance would give each its own counters |
| Sleeps after 15 idle minutes | Render's free tier | The first visitor after a quiet period waits |
| Outbound latency unbounded until this audit | No timeout on the send | Now 10 seconds ([F-02](RELIABILITY_AUDIT.md#f-02-a-send-has-no-time-limit)) |
| The provider's quota | The Resend plan | Not examined. A spent quota would show as `502`s |

## Scaling

The service would scale horizontally with one change: the limiter's store.
Everything else is stateless. That change is not worth making until there is
a second instance, and the free tier does not allow one.

## Recommendations

None are needed for performance. Two measurements were not possible and would
be worth having if the service ever moved off the free tier: the provider's
real latency, and the throughput of the production instance.
