// The contact API, end to end in Node: real Requests through the handler, with
// the limiter, the mailer and the log replaced by recorders. Nothing here can
// send mail, because the mailer is never the real one.
import test from "node:test";
import assert from "node:assert/strict";
import { handleContact, MAX_BODY_BYTES, type Deps } from "../contact.ts";
import type { Env } from "../env.ts";
import type { ContactValues } from "../../src/shared/contact.ts";

const ORIGIN = "https://syedwaleedahmed.me";
const VALID = { name: "Jane", email: "jane@example.com", subject: "Hi", message: "Hello there, this is a test." };

const configured: Env = {
  ASSETS: { fetch: async () => new Response("asset") },
  CONTACT_LIMITER: { idFromName: (name) => name, get: () => ({ fetch: async () => Response.json({ allowed: true }) }) },
  RESEND_API_KEY: "test-key",
  EMAIL_FROM: "portfolio@example.com",
  EMAIL_TO: "owner@example.com",
};

function harness(overrides: Partial<Deps> = {}) {
  const sent: ContactValues[] = [];
  const events: Record<string, unknown>[] = [];
  const keys: string[] = [];
  const deps: Deps = {
    limit: async (key) => {
      keys.push(key);
      return { allowed: true };
    },
    send: async (values) => {
      sent.push(values);
    },
    log: (event) => events.push(event),
    ...overrides,
  };
  return { deps, sent, events, keys };
}

const post = (body: string | object, headers: Record<string, string> = {}) =>
  new Request(`${ORIGIN}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: ORIGIN, "CF-Connecting-IP": "203.0.113.7", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

test("a valid message is sent, trimmed, and answered with ok", async () => {
  const h = harness();
  const response = await handleContact(post({ ...VALID, name: "  Jane  " }), configured, h.deps);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(h.sent.length, 1);
  assert.equal(h.sent[0]!.name, "Jane");
  assert.deepEqual(h.keys, ["v4:203.0.113.7"]);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
});

test("a tripped honeypot gets the same answer and nothing is sent", async () => {
  const h = harness();
  const real = await (await handleContact(post(VALID), configured, h.deps)).text();
  const trapped = await handleContact(post({ ...VALID, website: "http://spam.example" }), configured, h.deps);
  assert.equal(trapped.status, 200);
  assert.equal(await trapped.text(), real);
  assert.equal(h.sent.length, 1, "only the real message was sent");
  assert.ok(h.events.some((event) => event.event === "contact.honeypot"));
});

test("invalid input is a 400 naming the field, before anything is sent", async () => {
  const h = harness();
  const response = await handleContact(post({ ...VALID, email: "not-an-email" }), configured, h.deps);
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { ok: false, error: "Enter a valid email address, like name@example.com.", field: "email" });
  assert.equal(h.sent.length, 0);
});

test("malformed JSON is a 400 and costs no quota", async () => {
  const h = harness();
  const response = await handleContact(post("{not json"), configured, h.deps);
  assert.equal(response.status, 400);
  assert.equal(h.keys.length, 0, "the limiter was not consulted");
});

test("a body over the cap is a 413, whether or not it declares its length", async () => {
  const h = harness();
  const big = JSON.stringify({ ...VALID, message: "x".repeat(MAX_BODY_BYTES) });
  assert.equal((await handleContact(post(big), configured, h.deps)).status, 413);
  assert.equal((await handleContact(post(VALID, { "Content-Length": String(MAX_BODY_BYTES + 1) }), configured, h.deps)).status, 413);
  assert.equal(h.keys.length, 0);
});

test("the largest message the field caps allow fits under the body cap", async () => {
  const h = harness();
  const largest = { name: "n".repeat(100), email: `${"e".repeat(88)}@example.co`, subject: "s".repeat(200), message: "m".repeat(5000), website: "" };
  const response = await handleContact(post(largest), configured, h.deps);
  assert.equal(response.status, 200);
});

test("a refused limiter is a 429 with Retry-After, and nothing is sent", async () => {
  const h = harness({ limit: async () => ({ allowed: false, retryAfter: 120 }) });
  const response = await handleContact(post(VALID), configured, h.deps);
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("Retry-After"), "120");
  assert.equal(h.sent.length, 0);
});

test("another site's form is refused; a request with no Origin is not", async () => {
  const h = harness();
  assert.equal((await handleContact(post(VALID, { Origin: "https://evil.example" }), configured, h.deps)).status, 403);
  const request = post(VALID);
  request.headers.delete("Origin");
  assert.equal((await handleContact(request, configured, h.deps)).status, 200);
});

test("other methods and content types are refused", async () => {
  const h = harness();
  assert.equal((await handleContact(new Request(`${ORIGIN}/api/contact`), configured, h.deps)).status, 405);
  assert.equal((await handleContact(post("text", { "Content-Type": "text/plain" }), configured, h.deps)).status, 415);
});

test("without the mail secrets the API says so with a 503", async () => {
  const h = harness();
  const response = await handleContact(post(VALID), { ...configured, RESEND_API_KEY: undefined }, h.deps);
  assert.equal(response.status, 503);
  assert.equal(h.sent.length, 0);
});

test("a failed delivery is a 502 that repeats nothing from the provider", async () => {
  const { EmailDeliveryError } = await import("../mailer.ts");
  const h = harness({
    send: async () => {
      throw new EmailDeliveryError("Resend answered 403", 403);
    },
  });
  const response = await handleContact(post(VALID), configured, h.deps);
  assert.equal(response.status, 502);
  assert.doesNotMatch(await response.text(), /Resend|403/);
});

test("an unexpected error is a generic 500", async () => {
  const h = harness({
    send: async () => {
      throw new TypeError("boom: secret detail");
    },
  });
  const response = await handleContact(post(VALID), configured, h.deps);
  assert.equal(response.status, 500);
  assert.doesNotMatch(await response.text(), /boom|secret/);
});

test("a plain form post, as before the script loads, gets a page back", async () => {
  const h = harness();
  const form = new URLSearchParams({ ...VALID, website: "" }).toString();
  const response = await handleContact(post(form, { "Content-Type": "application/x-www-form-urlencoded" }), configured, h.deps);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("Content-Type") ?? "", /text\/html/);
  assert.match(await response.text(), /Message sent/);
  assert.equal(h.sent.length, 1);
});

test("the log records events, never what the visitor typed", async () => {
  const h = harness();
  await handleContact(post(VALID), configured, h.deps);
  await handleContact(post({ ...VALID, website: "x" }), configured, h.deps);
  const logged = JSON.stringify(h.events);
  for (const value of Object.values(VALID)) assert.ok(!logged.includes(value), `the log holds "${value}"`);
});
