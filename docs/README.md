# Documentation

The maintained reference for this repository. Each document covers one concern
and links to the others where they meet, so read the one you need rather than
the set. The [README](../README.md) is the overview.

| Document | Read it to |
|----------|-----------|
| [Architecture](architecture.md) | Understand the system: repository layout, prerendering, the data layer, backend modules, the request flow |
| [Development](development.md) | Set up, run the scripts, manage dependencies, configure, update content, and troubleshoot |
| [Design system](design.md) | Change anything visual: tokens, type, layout, the dock, command palette, activity graph and globe, motion, accessibility, print, generated assets |
| [Testing](testing.md) | Run or extend the API, content, invariant and browser suites, size budgets and link check, and see what is not covered |
| [API reference](api.md) | Call `POST /api/contact`: payloads, status codes, rate limiting, CORS |
| [Deployment](deployment.md) | Ship: Cloudflare Workers and the deploy gate, Render, CI, headers and CSP, caching, releases |
| [Security controls](security.md) | See what is implemented, why, and what is out of scope |
| [Backend audit](audit/EXECUTIVE_SUMMARY.md) | Read the 2026-11-20 review of the backend: what was measured, what was wrong, what was fixed and what is still open |
| [Repository cleanup](repository-maintenance/CLEANUP_REPORT.md) | Read the 2026-11-20 pass over the whole tree: what was checked for dead code, the little that was removed, what was kept and why |

The last two are dated records of one day's work, not living references. They
describe the repository as it was then, and are not kept in step with later
changes the way the documents above them are.

Elsewhere in the repository:

- [`CONTRIBUTING.md`](../CONTRIBUTING.md): what contributions are welcome, and the workflow
- [`CODE_OF_CONDUCT.md`](../CODE_OF_CONDUCT.md): community expectations
- [`SECURITY.md`](../SECURITY.md): how to report a vulnerability
- [`CHANGELOG.md`](../CHANGELOG.md): release history
- [`postman/README.md`](../postman/README.md): the API collection
- [`frontend/`](../frontend/README.md) and [`backend/`](../backend/README.md): what each project holds
