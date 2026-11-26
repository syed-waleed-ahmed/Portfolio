# Security policy

The site deploys continuously from `main`; only the live version is supported.

## Reporting a vulnerability

Please report privately, not in a public issue:

- **Preferred:** GitHub's [private vulnerability report](https://github.com/syed-waleed-ahmed/Portfolio/security/advisories/new).
- **Or email** [syedwaleedahmed9@gmail.com](mailto:syedwaleedahmed9@gmail.com) with the subject `Security: <summary>`.

The site states both at [/.well-known/security.txt](https://syedwaleedahmed.me/.well-known/security.txt) (RFC 9116), written at build time.

Include what you found, how to reproduce it, and its impact. I will acknowledge a report within 72 hours and aim
to fix a high-severity issue within 14 days.

## Scope

In scope: the site at `https://syedwaleedahmed.me`, its contact API at `/api/contact`, and the code in this
repository. Out of scope: third-party services the site uses (Cloudflare, Resend, GitHub), which have their own
programmes; findings that need access to a developer's machine; and missing hardening with no demonstrated impact.

Please do not run load tests or send bulk messages through the contact form: it delivers to a real inbox, and a
rate limit of five messages per client per fifteen minutes applies.

## Safe harbour

Research done in good faith within this scope, that avoids privacy violations and service disruption and gives me
reasonable time to fix an issue before disclosure, will not be met with legal action. The controls already in
place are described in [docs/architecture.md](docs/architecture.md#security-and-privacy).
