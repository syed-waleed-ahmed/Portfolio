# Backend

The API behind the site's contact form: Express 5 on Node, sending mail through
Resend. Its one real endpoint is `POST /api/contact`. Deployed by Render from
this directory.

It is one of two independent npm projects in this repository, with its own
`package.json` and lockfile; the other is [`../frontend`](../frontend/README.md).

```text
backend/
├── server.js                  Middleware, health routes, 404 and the central error handler
├── config/env.js              The only reader of process.env
├── routes/contactRoutes.js    Rate limit, validation, honeypot
├── services/mailerService.js  Email templates and Resend delivery
├── test/                      contact.test.js (routing and validation), delivery.test.js (the send path, against a fake Resend)
└── .env.example               Annotated template for backend/.env
```

## Commands

Run inside this directory, or from the repository root (`npm test` there runs
these tests).

| Command | What it does |
|---------|--------------|
| `npm run dev` | `node --watch` on :5000 |
| `npm start` | Production start |
| `npm test` | API tests; they never send mail, whatever `.env` holds |
| `npm run lint` | ESLint |

Without the three Resend variables the server still boots, and
`POST /api/contact` answers `503`.

## Read next

- [API reference](../docs/api.md): payloads, status codes, rate limiting, CORS
- [Architecture](../docs/architecture.md#backend): modules and the request flow
- [Security controls](../docs/security.md)
- [Postman collection](../postman/README.md)
