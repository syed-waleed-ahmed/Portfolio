// POST /api/contact. The order is deliberate: a body that cannot be parsed is
// refused before it costs the sender any quota; then the rate limit, then
// validation, then the honeypot, then the send.
import { CONTACT_ENDPOINT, HONEYPOT, validateContact, type ContactResponse, type ContactValues, type FieldName } from "../src/shared/contact.ts";
import { mailerConfigured, type Env } from "./env.ts";
import { clientKey, type Verdict } from "./limiter.ts";
import { EmailDeliveryError, sendContactEmail } from "./mailer.ts";

export const MAX_BODY_BYTES = 16 * 1024;

export interface Deps {
  limit(key: string, env: Env): Promise<Verdict>;
  send(values: ContactValues, env: Env): Promise<void>;
  log(event: Record<string, unknown>): void;
}

export const defaultDeps: Deps = {
  async limit(key, env) {
    const stub = env.CONTACT_LIMITER.get(env.CONTACT_LIMITER.idFromName(key));
    return (await (await stub.fetch(new Request("https://limiter/hit", { method: "POST" }))).json()) as Verdict;
  },
  send: (values, env) => sendContactEmail(values, env),
  // Structured, and never with what the visitor typed: the logs hold events,
  // not messages or addresses.
  log: (event) => console.log(JSON.stringify(event)),
};

const API_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
};

// Without JavaScript the form posts itself, and the visitor gets a plain page
// back instead of JSON, with a way home.
const page = (status: number, title: string, text: string, headers: Record<string, string> = {}) =>
  new Response(
    `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title></head>` +
      `<body><h1>${title}</h1><p>${text}</p><p><a href="/#contact">Back to the site</a></p></body></html>`,
    { status, headers: { ...API_HEADERS, ...headers, "Content-Type": "text/html; charset=utf-8" } }
  );

const json = (status: number, body: ContactResponse, headers: Record<string, string> = {}) =>
  Response.json(body, { status, headers: { ...API_HEADERS, ...headers } });

export async function handleContact(request: Request, env: Env, deps: Deps = defaultDeps): Promise<Response> {
  const type = (request.headers.get("Content-Type") ?? "").split(";")[0]!.trim().toLowerCase();
  const isForm = type === "application/x-www-form-urlencoded";
  const answer = (status: number, body: ContactResponse, headers: Record<string, string> = {}) =>
    isForm
      ? body.ok
        ? page(status, "Message sent", "Thanks, your message is on its way. I will reply by email.", headers)
        : page(status, "Message not sent", `${body.error} You can also email me directly.`, headers)
      : json(status, body, headers);

  if (request.method !== "POST") return json(405, { ok: false, error: "Use POST." }, { Allow: "POST" });

  // A browser names the page a POST came from. The form is on this origin,
  // so a submission from any other site is refused.
  const origin = request.headers.get("Origin");
  if (origin && origin !== new URL(request.url).origin) return answer(403, { ok: false, error: "Submissions are accepted from this site only." });

  if (type !== "application/json" && !isForm) return answer(415, { ok: false, error: "Send JSON or a form." });

  if (Number(request.headers.get("Content-Length") ?? 0) > MAX_BODY_BYTES) return answer(413, { ok: false, error: "The message is too large." });
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY_BYTES) return answer(413, { ok: false, error: "The message is too large." });

  let body: unknown;
  if (isForm) {
    body = Object.fromEntries(new URLSearchParams(raw));
  } else {
    try {
      body = JSON.parse(raw);
    } catch {
      return answer(400, { ok: false, error: "The request body is not valid JSON." });
    }
  }

  const verdict = await deps.limit(clientKey(request), env);
  if (!verdict.allowed) {
    deps.log({ event: "contact.rate_limited" });
    return answer(429, { ok: false, error: "Too many messages from this network. Please try again in 15 minutes." }, { "Retry-After": String(verdict.retryAfter ?? 900) });
  }

  const result = validateContact(body);
  if (!result.ok) return answer(400, { ok: false, error: result.error, field: result.field as FieldName });

  // Filled only by bots that complete every input. The answer is the one a
  // real send gets, so a bot learns nothing, and nothing is sent.
  const trap = (body as Record<string, unknown>)[HONEYPOT];
  if (typeof trap === "string" && trap.trim()) {
    deps.log({ event: "contact.honeypot" });
    return answer(200, { ok: true });
  }

  if (!mailerConfigured(env)) {
    deps.log({ event: "contact.not_configured" });
    return answer(503, { ok: false, error: "The contact form is not configured right now." });
  }

  try {
    await deps.send(result.values, env);
  } catch (error) {
    if (error instanceof EmailDeliveryError) {
      deps.log({ event: "contact.delivery_failed", reason: error.message, status: error.status });
      return answer(502, { ok: false, error: "The message could not be delivered right now." });
    }
    deps.log({ event: "contact.error", reason: error instanceof Error ? error.name : "unknown" });
    return answer(500, { ok: false, error: "Something went wrong on the server." });
  }
  deps.log({ event: "contact.sent" });
  return answer(200, { ok: true });
}

export const isContactRequest = (url: URL) => url.pathname === CONTACT_ENDPOINT;
