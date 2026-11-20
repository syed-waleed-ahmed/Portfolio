# Security audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). Line numbers
refer to commit `f07475f`. No secret value appears in this document, and none
was read: `backend/.env` was not opened.

## Scope and threat model

The service holds no data, has no accounts and returns nothing a caller did
not send. What can go wrong is narrow, and the repository's own
[`docs/security.md`](../security.md) names it correctly: abuse of the contact
endpoint, injection through the four fields that reach an email, and leaks
through responses, logs or the repository. This audit tested each.

Authentication, authorization, tenant isolation, session handling, SQL
injection, SSRF, path traversal, deserialization and webhook verification were
checked for and do not apply: there is no credentialed endpoint, no query, no
outbound request to a caller-chosen address, no file access and no inbound
callback.

## Findings

### F-01: The rate limiter counts proxies, not visitors

| | |
|---|---|
| Severity | High. It is the only abuse control and it does not do its job; the impact is on availability alone, so a CVSS-style score would be medium |
| Status | Confirmed, by measurement against production on 2026-11-20 |
| Where | `backend/server.js:14`, `backend/routes/contactRoutes.js:27-35` |
| State | Fixed in #61 and #62, and checked live from one network |

**What is wrong.** `app.set("trust proxy", 1)` tells Express that exactly one
proxy stands in front of the process, so `req.ip` is the last
`X-Forwarded-For` entry. On Render a request crosses Cloudflare and then
Render's own load balancers, so the last entry is the address of a proxy, not
of the visitor. `express-rate-limit` keys on `req.ip`.

**How it was shown.** Sixteen `POST /api/contact` requests with an empty JSON
body, which fail validation and cannot send mail, each on its own connection
from one machine:

| Requests | `X-Forwarded-For` sent | `RateLimit-Remaining` |
|----------|------------------------|-----------------------|
| 1 to 3 | none, a forged value, none | 4, 4, 3 |
| 4 to 7 | the same forged value four times | 3, 2, 1, 4 |
| 8 to 10 | three values never used before | 0, `429`, 3 |
| 11 to 12 | the first forged value again | 2, 2 |
| 13 to 15 | a two-entry chain, then each entry alone | 1, `429`, `429` |
| 16 | none | 1 |

Sorted, the readings are exactly three countdowns: one of eight requests
(4, 3, 2, 1, 0, then three `429`s) and two of four (4, 3, 2, 1). A value never
sent before landed on a spent counter, so the header does not choose the key.
As a control, ten fresh connections from the same machine to an endpoint that
echoes the caller's address returned one address, so the three counters are
not three client addresses. The key is one of at least three proxy addresses.

**Impact.**

- Every visitor shares those counters. Five requests per counter per 15
  minutes is the allowance of the whole internet, not of one address.
- Anyone can lock the form for everyone with 5 to 15 requests every 15
  minutes. It needs no forged header and no special tool.
- It happens without an attacker. A trapped honeypot submission spends quota
  (`contactRoutes.js:58-80`), so routine form spam turns away real visitors.
  They see "Too many messages from this network" and the email address.
- The owner cannot tell. Nothing reports `429`s.
- The measurement did it: three of the sixteen requests were refused, and the
  counters stayed spent for up to 15 minutes afterwards.

It is not a bypass. A caller cannot buy a fresh quota, because the forged
entries sit to the left of the ones Express reads.

**Why it went unseen.** The tests pass, and prove what they claim: with one
proxy trusted, the key is the last entry. Whether that entry is the visitor
depends on the platform, and Render does not document the header as the app
receives it. Three other public projects found during this audit assert the
same "one hop" for Render with no measurement.

**Fix applied.** The count is now `config.trustProxyHops`, read from
`TRUST_PROXY_HOPS`. A test pins which entry is read, and `docs/deployment.md`
gained a four-request check that distinguishes a right count from one too low
or too high.

**What the number turned out to be.** Three, found in two steps.

| Proxies trusted | Deployed | Requests from one machine | Counters they landed on |
|-----------------|----------|---------------------------|-------------------------|
| 1 | Before the audit | 16 | 3 |
| 2 | #61 | 6, on fresh connections | 4 |
| 3 | #62 | 9 | 1 |

Two came from Render's documentation, which names Cloudflare and its own load
balancers. It was safe to deploy unverified: one had been measured to land on
a proxy, so at least two entries were infrastructure's and two could not be
high enough to trust an entry the client wrote. The check then showed it was
still too low, on a different pool of addresses. Three followed by
the same argument, and passed: four requests from a browser read 4, 3, 2 and,
with a forged header, 1; five more from a script on fresh connections read 0
and then `429` four times. One counter across two clients and six
connections.

**Still to do.** The second-network step. From a single network, a count
that was still too low but landed on one fixed proxy address would read the
same. Given that both wrong counts scattered requests over several addresses
that is unlikely, and one request from a phone on mobile data settles it.

### F-05: A crafted subject or address makes the API answer 500

| | |
|---|---|
| Severity | Low |
| Status | Confirmed, locally and against production |
| Where | `backend/services/mailerService.js:111` and `:137` |
| State | Fixed |

**What is wrong.** `encodeURIComponent` throws `URIError` on an unpaired
surrogate, half of the pair that encodes an emoji. JSON can carry one
(`"\ud800"`), validation did not exclude it, and the mailer URL-encodes the
address and the subject to build the reply links. The exception is neither of
the mailer's typed errors, so it reached the central handler.

**Reproduction.** `POST /api/contact` with a valid body whose `email` or
`subject` contains `\ud800`. Locally: `500` with `{"error":"URI malformed"}`.
Production: `500` with `{"error":"Internal server error."}`. No mail is sent
either way, since the throw comes before the provider is called.

**Impact.** A client-triggered `500` and a stack trace in the log per
request. The process does not crash, nothing is disclosed in production, and
the limiter bounds the rate. The realistic cost is a wrong status for bad
input and noise in the one log the owner has.

**Fix applied.** The mailer replaces unpaired surrogates with U+FFFD in all
four fields before rendering anything (`String.prototype.toWellFormed`), so no
caller can make it throw. In the address the route refuses them outright
(F-06).

### F-06: An address holding control characters is accepted, then rewritten

| | |
|---|---|
| Severity | Low |
| Status | Confirmed locally. What the provider does with the result was not tested, since that would mean sending real mail |
| Where | `backend/routes/contactRoutes.js:20` and `:48`, `backend/services/mailerService.js:34-39` and `:65` |
| State | Fixed |

**What is wrong.** `EMAIL_RE` excludes only whitespace and a second `@`.
Control characters such as NUL and ESC are neither, so
`ja\u0000ne\u001bx@example.com` passed validation. `sanitizeHeader` then
replaced each with a space, and the `Reply-To` handed to the provider was
`ja ne x@example.com`: a different string from the one validated, and not an
address.

**Impact.** Input the visitor should be asked to correct was passed on in a
changed form. If the provider refuses it, the visitor gets a `502` and a "not
your doing" warning for a mistake that was theirs; if it accepts it, the
owner's reply goes nowhere.

**Fix applied.** A second, server-only pattern refuses an address containing
a control character or an unpaired surrogate with the existing `400`
`Invalid email address.`. `EMAIL_RE` is unchanged, because it is mirrored in
the form and compared by the invariants test, and the form shows the server's
message for a `400` as it stands.

## Informational

**F-11: No ceiling on sends overall.** The limit is per address. Many
addresses can still spend the provider's quota, after which real messages get
a `502`. `docs/security.md` lists a CAPTCHA and a bot-management layer as
deliberate non-goals, and for this service that is a defensible call. With
F-01 live the opposite problem applied. No change.

**F-12: Error detail in a `500` is opt-out.** `server.js:86-91` returns
`err.message` unless `NODE_ENV` is exactly `production`, so a host that omits
the variable, or misspells it, discloses messages. Production was verified to
return the generic text. Making detail opt-in (shown only when `NODE_ENV` is
`development`) would be the safer default. It was left alone because, with
F-05 fixed, no input reaches that branch, so a change to it could not be
covered by a test.

**F-13: `http://localhost:5173` is an allowed origin in production**, verified
with a live preflight, and the frontend's default API origin is production.
A local dev server with no `frontend/.env` therefore sends real mail. CORS is
not access control and `curl` can do the same, so nothing is exposed. It is a
convenience with a surprise in it, and `CLAUDE.md` already warns about it.

**F-16: Invisible characters pass.** A message that is only a zero-width
space is accepted as non-empty, a bidirectional override in a subject reaches
the owner's inbox, and a honeypot value that is not a string (an array, say)
does not trip the trap. None is exploitable for more than a confusing email.

## What was tested and held

| Control | Test | Result |
|---------|------|--------|
| HTML injection into the email | `<img onerror>`, `<script>` and a `javascript:` link in every field | No raw tag in the HTML part |
| Header injection | CR, LF and U+2028 in name and subject | Flattened to spaces in the subject and the text part |
| `mailto:` parameter injection | An address with `?bcc=...&subject=...` | URL-encoded; existing test confirmed |
| Prototype pollution | `__proto__` and `constructor.prototype` keys | `Object.prototype` unchanged |
| Type confusion | Arrays, objects, numbers and booleans as fields | `400`, treated as missing |
| Decompression bomb | 5 MB of whitespace gzipped to a few KB | `413`; the cap applies to the inflated size |
| Deep nesting | 7,500 nested arrays inside the cap | Parsed, then `400` |
| Parser errors | Malformed JSON, `null`, a bare string, two charsets | Fixed messages; logged by type only, never the body |
| Cross-site form post | JSON sent as `text/plain`, and form-encoded | Not parsed, `400`: a page cannot submit without a preflight |
| CORS | Nine origins, including trailing slash, upper case and `null` | Only the three listed origins got `Access-Control-Allow-Origin` |
| Provider detail in responses | Four failure modes | The same fixed `502` each time |
| Honeypot parity | Existing test | Byte-identical `200` |
| Limiter under concurrency | 12 simultaneous requests after one | Exactly 4 more accepted, 8 refused |
| IPv6 keying | Two addresses in one `/56`, one in the next | Shared counter, then a fresh one |
| Secrets in the repository | `git log --all` for any `.env` ever added | None; `.env` is ignored and `gitleaks` scans full history in CI |
| Production headers | `GET /health` on the live API | HSTS, `nosniff`, frame and referrer policies present; no `X-Powered-By` |
| Dependencies | `npm audit` at every severity, dev included | 0 advisories |

## Not verified

- Whether Resend rejects or accepts the edge-case addresses that still pass
  validation, such as `"x"<a@b.c>`. Testing it needs a real send.
- The Render dashboard: who has access, and whether the API key is stored as
  a secret. Outside the repository.
