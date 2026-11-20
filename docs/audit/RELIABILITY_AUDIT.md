# Reliability audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md). Line numbers
refer to commit `f07475f`.

## What exists, and what does not

There are no background jobs, queues, workers, schedulers, locks, retry
policies, dead-letter queues or provider callbacks in this service. That was
checked rather than assumed: no dependency provides one, the SDK's request
function contains no retry loop (`resend/dist/index.mjs`, `fetchRequest`), and
the only timer in the source is the shutdown one (`server.js:114`).

So the questions an audit asks of an asynchronous pipeline, about claiming,
stale locks, concurrent workers and out-of-order callbacks, have no subject
here. What remains is one synchronous call to one provider, and it deserves
the same questions in the form that applies.

## The send path as a delivery pipeline

```text
form submit -> validate -> one HTTP call to Resend -> answer the visitor
```

| Question | Answer | Evidence |
|----------|--------|----------|
| Can a submission be processed more than once? | Not by the server: one request makes one attempt. Only if the visitor submits again | No retry in the route, the mailer or the SDK |
| Is a duplicate harmless? | Yes. The owner gets the same email twice | - |
| Can a retry duplicate an external message? | Yes, a human one. After a timeout the visitor cannot know whether Resend took the message, and may send again (F-14) | The send carries no idempotency key: observed on the wire |
| Can the process die without losing work? | No. A message in flight when the process dies is gone | Nothing is stored |
| Is a terminal failure recorded? | The failure is logged with the provider's error. The message is not recorded anywhere, on purpose: the log holds no message bodies | `contactRoutes.js:93-96` |
| Is delivery confirmed? | No. A `200` means Resend accepted the message. A later bounce or a spam-folder landing is invisible to the app | No webhook exists |

In the usual terms: at most once per request from the server's side, at least
once only if a person retries, and nothing that makes a retry safe. For a
contact form that is an acceptable design, provided every failure is shown to
the visitor with another way to reach the owner. It is: every failure state of
the form prints the email address (`Contact.jsx:285-299`).

### Failure windows

| Window | What happens | The visitor sees | The message |
|--------|--------------|------------------|-------------|
| Instance asleep | Render wakes it, in about a minute by its documentation. The form pings `/health` on first focus and waits 60 seconds | Usually a slow send with a notice after 6 seconds; sometimes a timeout | Sent, or the visitor is told it was not |
| Resend refuses the send | `502` | A warning and the email address | Lost unless they use the address |
| Resend unreachable | `502` | The same | The same |
| Resend stalls | Before: the request hung until the form gave up at 60 seconds. Now: `502` after 10 seconds (F-02) | The same | The same |
| Deploy or restart mid-send | `SIGTERM`, then the server stops accepting and waits for in-flight requests, exiting after 10 seconds at most (`server.js:107-117`). Render allows 30 | Normally nothing | Normally sent |
| Process killed mid-send | The connection drops | "Could not be reached" and the address | Unknown: Resend may or may not have it |
| Answer lost after Resend accepted | The visitor is told it failed | A warning and the address | Sent. A retry duplicates it |
| Accepted, then bounced or filtered | Nothing | Success | Not delivered, and nobody knows |

The last row is the only one where the visitor is told something untrue. It is
inherent to email and outside what this service can see without a delivery
webhook, which would be out of proportion.

## Findings

### F-02: A send has no time limit

| | |
|---|---|
| Severity | Medium |
| Status | Confirmed |
| Where | `backend/services/mailerService.js:70-77` |
| State | Fixed |

**What is wrong.** `resend.emails.send` was called with no abort signal, and
the SDK sets none: its `fetchRequest` passes the caller's options straight to
`fetch`. Node's `fetch` waits five minutes for a silent server by default.
That figure is its documented default and was not measured here.

**Reproduction.** With the provider faked to accept the connection and never
answer, a submission was still open when the test client gave up after 4
seconds, and the request the SDK made carried no signal.

**Impact.** During a provider stall every submission hangs. The visitor
watches "Sending..." for the full 60 seconds the form allows, and the server
keeps each request and its socket for up to five minutes. A deploy in that
state force-exits after 10 seconds with requests unanswered.

**Fix applied.** The call passes `AbortSignal.timeout(config.resendTimeoutMs)`,
10 seconds by default and settable as `RESEND_TIMEOUT_MS`. A timeout becomes
the existing `502`, and the log line says it was a timeout, which the SDK's
own error does not. Ten seconds matches the shutdown allowance, so a send in
flight at `SIGTERM` now finishes or fails inside it.

### F-03: Render deploys the backend whether or not CI passed

| | |
|---|---|
| Severity | Medium |
| Status | Confirmed from the repository's documentation and Render's. Not reproduced, since that means deploying a broken commit |
| Where | `.github/workflows/ci.yml:155-160`, `docs/deployment.md:256-260`, `docs/testing.md:508-512` |
| State | Fixed on 2026-11-20: Auto-Deploy was set to After CI Checks Pass in the Render dashboard, and read back after a reload |

**What was wrong.** The frontend is published only by a workflow that runs
after all four CI jobs. The backend is deployed by Render from the push
itself. The repository documents this as an accepted gap and says "nothing
gates Render".

**Impact.** A merge whose backend tests fail is live in production a minute
or two later, and stays live until someone notices the red run.

**Recommendation.** Render's Auto-Deploy setting has three values: On Commit
(the default), After CI Checks Pass, and Off. With the second, Render deploys
only when the commit's checks succeed, and does not deploy a commit that has
no checks at all. Every commit that touches `backend/` reaches `main` through
a pull request and so has checks. The weekly snapshot commit has none, but it
changes only `frontend/`, which Render already ignores for a service whose
root directory is `backend`.

**Done.** The setting was changed, and the places that said Render was
ungated were corrected with it: `CLAUDE.md`, `README.md`,
`docs/deployment.md`, `docs/development.md`, `docs/testing.md` and the
comment in `ci.yml`. One consequence is new and is written down there: the
checks Render waits for include the frontend's deploy job, so a frontend
deploy that fails its own check also holds that commit's backend back.

### F-04: Nothing notices when the form stops working

| | |
|---|---|
| Severity | Medium |
| Status | Confirmed |
| Where | The whole service; `docs/deployment.md:224-226` mentions an uptime pinger as an option not taken |
| State | Open |

**What is wrong.** The service logs clearly, with a prefix per module and a
distinct line for each failure. Nothing reads those lines. There is no uptime
check, no alert on `502` or `429`, no metric and no request identifier.
`/health` answers `ok` whether or not mail can be sent.

**Evidence.** F-01. The limiter had been counting every visitor on shared
counters for as long as the setting had been in place, and that was found by
an audit, not by anything the service reports. Whether it ever turned a real
visitor away is unknown, for the same reason.

**Impact.** The failure mode of a contact form is a message that never
arrives, which by its nature produces no complaint. A revoked API key, an
unverified sender domain or a spent provider quota would each turn every
submission into a `502` until someone happened to read the Render log.

**Recommendation.** Either of these, both free:

- A scheduled workflow beside the existing weekly ones that sends one empty
  `POST` and one preflight to the live API and fails unless it gets `400` with
  `RateLimit-Remaining: 4` and a `204` naming the site's origin. GitHub emails
  the owner on failure, as it already does for the link check. This also
  watches the F-01 fix.
- An external uptime monitor on `/health`. It detects an instance that is down
  and, as a side effect, keeps it awake, which removes cold starts and uses
  about 744 of the 750 free instance hours a month.

Neither tells the owner about a failing send. The honest version of that is
to check Resend's dashboard whenever a `502` appears.

### F-07: An allow-list entry no browser can match fails silently

| | |
|---|---|
| Severity | Low |
| Status | Confirmed |
| Where | `backend/config/env.js:19-22`, `backend/server.js:26-32` |
| State | Fixed |

**What is wrong.** `ALLOWED_ORIGINS` is compared with the `Origin` header
character for character. A preflight from `https://syedwaleedahmed.me/`, with
a trailing slash, and from the same origin in upper case, each got no
`Access-Control-Allow-Origin`. An entry written either way, or as a wildcard,
therefore locks out the site it was meant to allow, and since a disallowed
origin is refused silently by design, nothing is logged.

**Fix applied.** At boot, each entry is checked against what `URL` reports as
its origin, and any that differ are named in one warning with the rule. The
entries are reported, not repaired: the server still uses what it was given.

### F-09: The Node version Render runs may not be the one CI tests

| | |
|---|---|
| Severity | Low |
| Status | Verified on 2026-11-20 from a deploy log, and not a defect |
| Where | `.nvmrc`, `backend/package.json:16-18` |
| State | Closed. No change made |

**What is uncertain.** CI and the deploy read Node 24 from `.nvmrc` at the
repository root. Render's documentation gives its own order: a `NODE_VERSION`
variable, then `.node-version`, then `.nvmrc` "in the root of your repo", then
`engines`. It also says files outside a service's root directory are not
available to the build, and this service's root directory is `backend`. If
the root `.nvmrc` is not seen, the version comes from `engines`, which is
`>=22.13.0`, and Render resolves a range with no upper bound to the newest
release.

**Impact.** Possibly none today. This audit ran every test on Node 26.13.1
and CI runs them on 24, so both candidates happen to be exercised. The next
major would arrive in production untested.

**Recommendation.** Read the Node version at the top of the latest Render
deploy log. If it is not 24, set `NODE_VERSION=24` on the service.

**What the log said.** `Requesting Node.js version 24`, then
`Using Node.js version 24.22.3 via /opt/render/project/src/.nvmrc`. Render
does read the pin at the repository root, although the service's root
directory is `backend`, so production runs the major that CI tests and takes
it from the same file. `NODE_VERSION` was therefore not set: it would
override `.nvmrc` and become a second pin that nothing keeps in step.

### F-19: The documented Render settings did not match the dashboard

| | |
|---|---|
| Severity | Low |
| Status | Confirmed on 2026-11-20, by reading the dashboard and a build log |
| Where | `docs/deployment.md:184-205`, `README.md:396` |
| State | Fixed in the docs. The build command itself is unchanged |

**What was wrong.** Three statements about the Render service were written
from intention, not from the dashboard:

| The docs said | The dashboard and the build log say |
|---------------|--------------------------------------|
| Build command `npm ci` | `npm install` |
| `NODE_ENV=production` is a variable set in the dashboard | It is not there. The service holds three variables, the mail settings. Production does run with `NODE_ENV=production`, as its generic `500` showed, because that is Render's default for a Node service |
| The install skips devDependencies, so ESLint never reaches the server | `audited 155 packages`: the whole tree, development packages included |

**Impact.** Small today. `npm install` honours the lockfile unless
`package.json` has moved ahead of it, and CI's own `npm ci` fails in that
case first. The unneeded packages cost build time and nothing at runtime. The
real cost is the same as F-10's: a reader who trusts the page is wrong about
production, and `NODE_ENV` in particular is what keeps error detail out of
responses ([F-12](SECURITY_AUDIT.md#informational)).

**Fix applied.** `docs/deployment.md` now carries the settings as read, with
the date, and says plainly that nothing in the repository checks them.

**Recommendation.** Change the build command to `npm ci --omit=dev`, which
installs exactly the lockfile's production tree, and consider setting
`NODE_ENV=production` in the dashboard so that it no longer rests on a
default. Neither was done: both change how production is built, and neither
was asked for. A `render.yaml` Blueprint would put all of this in the
repository, where a test could read it.

## Informational

**F-14: One attempt, no idempotency key.** The SDK accepts an
`idempotencyKey` and the route does not send one. A key derived from the
submission would make a visitor's retry after a timeout harmless. Not worth
its complexity while the cost of a duplicate is a second copy of an email.

**F-15: The keep-alive timeout is Node's default of five seconds.** Render's
troubleshooting page names "intermittent timeouts or `Connection reset by
peer` errors" on Node services and advises raising `keepAliveTimeout` and
`headersTimeout`. No such error was observed: all 20 live requests were
answered. If `502`s appear with no matching line in the app's log, set both
in `start()`.

## Startup and shutdown

- **Startup** was exercised: with the mail settings missing, a malformed
  origin and an unusable number, the process printed one warning for each and
  served requests. It does not refuse to start, by design, so a deploy with a
  missing key succeeds and answers `503`.
- **Shutdown** was read, not exercised: signals behave differently on the
  Windows machine this audit ran on. The handler closes the listener, which
  in current Node also closes idle keep-alive connections, and force-exits
  after 10 seconds, inside Render's 30.
- **Unhandled rejections** crash the process, Node's default, and Render
  restarts it. With Express 5 forwarding async route errors to the handler,
  none was found that could occur.
