# Database audit

Part of the [2026-11-20 backend audit](EXECUTIVE_SUMMARY.md).

## There is no database

Schema, constraints, indexes, migrations, transactions, connection pooling
and query performance have nothing to be audited against. This is a finding of
fact, checked three ways:

- **Dependencies.** The six production packages are `express`, `cors`,
  `helmet`, `express-rate-limit`, `resend` and `dotenv`. None of the 76
  packages in the production tree is a database driver, an ORM, a cache
  client or a queue client.
- **Code.** No source file imports `fs` for writing, opens a connection, or
  reads a connection string. `config/env.js` reads eight variables and none
  names a datastore.
- **Behaviour.** No endpoint returns anything a caller did not send in the
  same request. There is nothing to read back.

The documentation says the same (`docs/api.md`, `docs/architecture.md`), and
here the documentation is right.

## The state that does exist

| State | Where | Lifetime | Integrity concern |
|-------|-------|----------|-------------------|
| Rate-limit counters | The limiter's in-memory store, one entry per client address | 15 minutes, or until the process restarts or the idle instance is spun down | Lost on restart, and not shared between instances. Both are stated in `docs/security.md` as accepted for a single instance. Measured at about 200 bytes an entry |
| The frozen `config` object | Process memory | The process | Read once at import; `Object.freeze` confirmed by test |
| Log lines | Render's log stream | The platform's retention, which was not verified | Hold a trapped submission's name and address by design, never a message body, never a raw request |
| Sent email | Resend, then the owner's inbox | Outside this system | The only durable copy of a submission. Its retention at Resend was not examined |

Concurrent writes to the counters were tested: twelve simultaneous requests
after a first one were split exactly, four accepted and eight refused. The
store is synchronous in a single-threaded process, so there is no race to
find.

## Personal data

The service handles a name, an email address and a message, and stores none
of them. They exist in memory for the length of a request, in transit to
Resend, and afterwards only in the email. A trapped submission's name and
address are written to the log, deliberately and with the reason documented
(`docs/security.md`, "Why the honeypot answers 200").

## If a database is ever added

The current design has no outbox, so the first reason to add one would be to
stop losing a message when a send fails. That would bring every question this
document skipped: a unique key per submission, a state column with a defined
set of transitions, a claim that survives a crashed worker, and a retry that
cannot send twice. None of it is warranted today
([RELIABILITY_AUDIT.md](RELIABILITY_AUDIT.md#the-send-path-as-a-delivery-pipeline)).
