// The send path, end to end, with Resend's API answered at the network edge.
//
// contact.test.js runs with the mailer unconfigured, so it can never compare a
// real send with anything. This file configures it with fake credentials and a
// base URL on .invalid, a top-level domain reserved never to resolve, then
// answers the SDK's request itself. Nothing can reach Resend: if the stub
// below ever missed, the request would fail at DNS. Each test file runs in its
// own process, so this configuration does not leak into the other.
import test from "node:test";
import assert from "node:assert/strict";

// Set before the app is imported: config/env.js reads them once, and dotenv
// never overrides a variable that is already set, whatever backend/.env says.
process.env.RESEND_API_KEY = "fake-key-for-tests";
process.env.EMAIL_FROM = "portfolio@example.com";
process.env.EMAIL_TO = "owner@example.com";
process.env.RESEND_BASE_URL = "https://resend.invalid";

// Every email the SDK tries to send, as the JSON it would have posted.
const outbox = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.startsWith("https://resend.invalid/")) return realFetch(input, init);
  outbox.push(JSON.parse(init.body));
  return new Response(JSON.stringify({ id: "re_test_message_id" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const { default: app } = await import("../server.js");

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, "127.0.0.1", resolve);
  });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => {
  server?.close();
});

// Its own address per request, as in contact.test.js, so the limiter's count
// never carries from one test into the next.
let nextClient = 1;
const postContact = (body) =>
  realFetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": `10.1.0.${nextClient++}` },
    body: JSON.stringify(body),
  });

const VALID = {
  name: "Jane",
  email: "jane@example.com",
  subject: "Hi",
  message: "Hello there, this is a test.",
};

test("a delivered message and a tripped honeypot get byte-identical responses", async () => {
  const before = outbox.length;
  const delivered = await postContact(VALID);
  const trapped = await postContact({ ...VALID, website: "http://spam.example.com" });

  assert.equal(delivered.status, 200);
  assert.equal(trapped.status, 200);
  const deliveredBody = await delivered.text();
  // The point of the honeypot: the body a bot sees gives nothing away, so it
  // carries no provider message id that only a real send could return.
  assert.equal(await trapped.text(), deliveredBody);
  assert.equal("id" in JSON.parse(deliveredBody), false);
  // Only the real one was handed to Resend.
  assert.equal(outbox.length, before + 1);
});

test("the email goes to the owner, with the sender as Reply-To", async () => {
  await postContact(VALID);
  const email = outbox.at(-1);
  assert.equal(email.from, "portfolio@example.com");
  assert.deepEqual([email.to].flat(), ["owner@example.com"]);
  assert.equal(email.reply_to ?? email.replyTo, "jane@example.com");
  assert.equal(email.subject, "Portfolio: Hi");
  assert.match(email.html, /Received<\/td>[\s\S]*? UTC</);
});

test("the sender's address cannot add parameters to the reply link", async () => {
  // Valid under EMAIL_RE, which admits "?", "&" and "=" in the local part.
  const email = "jane?bcc=intruder.example.com&subject=x@example.com";
  await postContact({ ...VALID, email });
  const { html } = outbox.at(-1);
  assert.ok(!html.includes("mailto:jane?bcc"), "the raw address reached a mailto: link");
  assert.ok(html.includes("mailto:jane%3Fbcc%3Dintruder.example.com%26subject%3Dx@example.com"));
});

test("one-line fields cannot forge lines in the plain-text part", async () => {
  await postContact({ ...VALID, name: "Jane\nEmail: forged@example.com", subject: "Hi\r\nBcc: someone" });
  const { text, subject } = outbox.at(-1);
  const lines = text.split("\n");
  assert.equal(lines.filter((line) => line.startsWith("Email:")).length, 1, "a second Email: line was forged");
  assert.ok(lines.includes("From:    Jane Email: forged@example.com"));
  assert.equal(subject, "Portfolio: Hi Bcc: someone");
});
