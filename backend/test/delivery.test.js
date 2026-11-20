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
// Short, so the test of a provider that never answers takes a fraction of a
// second rather than the ten the default allows.
process.env.RESEND_TIMEOUT_MS = "300";

// What the fake Resend does with the next request. Each test that changes it
// puts it back.
let resendAnswers = "accepted";

// Every email the SDK tries to send, as the JSON it would have posted.
const outbox = [];
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = String(input);
  if (!url.startsWith("https://resend.invalid/")) return realFetch(input, init);
  outbox.push(JSON.parse(init.body));

  if (resendAnswers === "rejected") {
    // The shape of a real refusal, with detail that must stay in the log.
    return new Response(
      JSON.stringify({ statusCode: 403, name: "validation_error", message: "The example.com domain is not verified." }),
      { status: 403, headers: { "Content-Type": "application/json" } }
    );
  }
  if (resendAnswers === "unreachable") throw new TypeError("fetch failed");
  if (resendAnswers === "silent") {
    // Never answers. Like the real fetch, it gives up only when told to.
    return new Promise((_resolve, reject) => {
      init.signal?.addEventListener("abort", () => reject(init.signal.reason));
    });
  }
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

test("text that is not well-formed Unicode is repaired and sent, not a 500", async () => {
  // Half a surrogate pair is legal in JSON, and encodeURIComponent, which
  // builds the reply link from the subject, throws on one. Built at runtime:
  // an unpaired surrogate cannot be written into a file.
  const half = String.fromCharCode(0xd800);
  const replacement = String.fromCharCode(0xfffd);
  const res = await postContact({ ...VALID, name: `Ja${half}ne`, subject: `Hi ${half}`, message: `Hello ${half}` });
  assert.equal(res.status, 200);
  const { subject, html, text } = outbox.at(-1);
  assert.equal(subject, `Portfolio: Hi ${replacement}`);
  for (const part of [html, text]) {
    assert.ok(part.isWellFormed(), "an unpaired surrogate reached the email");
    assert.ok(part.includes(`Ja${replacement}ne`));
  }
});

// The three ways a send fails. Each must be the same 502 with the same fixed
// message: what Resend said, or that it said nothing, belongs in the log.
const DELIVERY_FAILED = { success: false, error: "Email delivery failed." };

async function postWhileResend(answers) {
  resendAnswers = answers;
  try {
    const started = performance.now();
    const res = await postContact(VALID);
    return { res, body: await res.text(), ms: performance.now() - started };
  } finally {
    resendAnswers = "accepted";
  }
}

test("a send Resend refuses is a 502 that repeats nothing Resend said", async () => {
  const { res, body } = await postWhileResend("rejected");
  assert.equal(res.status, 502);
  assert.deepEqual(JSON.parse(body), DELIVERY_FAILED);
  assert.ok(!/verified|validation_error|example\.com domain/.test(body), "provider detail reached the response");
});

test("a Resend that cannot be reached is a 502", async () => {
  const { res, body } = await postWhileResend("unreachable");
  assert.equal(res.status, 502);
  assert.deepEqual(JSON.parse(body), DELIVERY_FAILED);
});

test("a Resend that never answers is a 502 once the timeout passes", async () => {
  const { res, body, ms } = await postWhileResend("silent");
  assert.equal(res.status, 502);
  assert.deepEqual(JSON.parse(body), DELIVERY_FAILED);
  // RESEND_TIMEOUT_MS is 300 here. Without a timeout this request would hang
  // until the test runner gave up; the bound is loose so a slow machine passes.
  assert.ok(ms >= 250 && ms < 5000, `answered after ${Math.round(ms)} ms`);
});
