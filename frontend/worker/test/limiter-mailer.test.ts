// The rate limiter's window and the email's escaping.
import test from "node:test";
import assert from "node:assert/strict";
import { clientKey, ContactLimiter, LIMIT, WINDOW_MS, type StorageLike } from "../limiter.ts";
import { composeMessage, EmailDeliveryError, RESEND_URL, sendContactEmail } from "../mailer.ts";
import type { Env } from "../env.ts";

function memoryStorage() {
  const data = new Map<string, unknown>();
  const alarms: number[] = [];
  const storage: StorageLike = {
    get: async <T,>(key: string) => data.get(key) as T | undefined,
    put: async (key, value) => void data.set(key, value),
    deleteAll: async () => data.clear(),
    setAlarm: async (time) => void alarms.push(time),
  };
  return { storage, data, alarms };
}

test("the limiter allows five in the window, refuses the sixth, and frees a slot as the window moves", async () => {
  const { storage } = memoryStorage();
  let now = 1_000_000;
  const limiter = new ContactLimiter({ storage }, undefined, () => now);
  const verdict = async () => (await (await limiter.fetch()).json()) as { allowed: boolean; retryAfter?: number };
  for (let i = 0; i < LIMIT; i++) {
    assert.equal((await verdict()).allowed, true, `submission ${i + 1}`);
    now += 1000;
  }
  const refused = await verdict();
  assert.equal(refused.allowed, false);
  assert.equal(refused.retryAfter, Math.ceil((WINDOW_MS - LIMIT * 1000) / 1000));
  now = 1_000_000 + WINDOW_MS + 1;
  assert.equal((await verdict()).allowed, true, "the oldest submission has left the window");
});

test("the alarm deletes everything once the window has passed", async () => {
  const { storage, data, alarms } = memoryStorage();
  let now = 0;
  const limiter = new ContactLimiter({ storage }, undefined, () => now);
  await limiter.fetch();
  assert.deepEqual(alarms, [WINDOW_MS]);
  now = WINDOW_MS + 1;
  await limiter.alarm();
  assert.equal(data.size, 0, "no submission times are kept after the window");
});

test("clients are keyed by IPv4 address and by IPv6 /56", () => {
  const key = (ip?: string) => clientKey(new Request("https://x/", { headers: ip ? { "CF-Connecting-IP": ip } : {} }));
  assert.equal(key("198.51.100.4"), "v4:198.51.100.4");
  assert.equal(key("2001:db8:abcd:12ff::1"), key("2001:db8:abcd:12aa:ffff::9"), "one /56 is one client");
  assert.notEqual(key("2001:db8:abcd:12ff::1"), key("2001:db8:abcd:13ff::1"));
  assert.equal(key("2001:db8:abcd:12ff::1"), "v6:2001:0db8:abcd:12");
  assert.equal(key(), "unknown");
});

const FIELDS = { name: "Jane <b>", email: "jane?bcc=intruder@example.com", subject: "Hi\r\nBcc: x@y.z", message: "<script>alert(1)</script>" };

test("the email escapes HTML and keeps the sender's address from adding parameters", () => {
  const { html, subject, text, replyTo } = composeMessage(FIELDS, new Date("2026-11-25T10:00:00Z"));
  assert.ok(!html.includes("<script>"), "the message is escaped");
  assert.ok(!html.includes("<b>"), "the name is escaped");
  assert.ok(!html.includes("mailto:jane?bcc"), "the raw address reached a mailto: link");
  assert.ok(html.includes("mailto:jane%3Fbcc%3Dintruder@example.com"));
  assert.doesNotMatch(subject, /[\r\n]/, "the subject cannot carry a header");
  assert.doesNotMatch(text.split("\n").find((line) => line.startsWith("Subject:")) ?? "", /Bcc:.*\n/);
  assert.equal(replyTo, "jane?bcc=intruder@example.com");
  assert.match(html, /25 Nov 2026, 10:00 UTC/);
});

test("text that is not well-formed Unicode is repaired, not a crash", () => {
  const { html } = composeMessage({ ...FIELDS, subject: "bad \uD800 surrogate", email: "a@b.co" });
  assert.ok(html.includes("�"));
});

const env: Env = {
  ASSETS: { fetch: async () => new Response() },
  CONTACT_LIMITER: { idFromName: (n) => n, get: () => ({ fetch: async () => new Response() }) },
  RESEND_API_KEY: "key",
  EMAIL_FROM: "from@example.com",
  EMAIL_TO: "to@example.com",
};

test("the send posts one message to Resend with the sender as Reply-To", async () => {
  const calls: { url: string; init: RequestInit }[] = [];
  await sendContactEmail({ name: "Jane", email: "jane@example.com", subject: "Hi", message: "Hello" }, env, (async (url: string, init: RequestInit) => {
    calls.push({ url, init });
    return Response.json({ id: "re_123" });
  }) as unknown as typeof fetch);
  assert.equal(calls.length, 1);
  assert.equal(calls[0]!.url, RESEND_URL);
  const body = JSON.parse(String(calls[0]!.init.body));
  assert.deepEqual(body.to, ["to@example.com"]);
  assert.equal(body.reply_to, "jane@example.com");
  assert.equal(body.subject, "Portfolio: Hi");
});

test("a refusal and an unreachable provider are both delivery errors", async () => {
  const values = { name: "Jane", email: "jane@example.com", subject: "Hi", message: "Hello" };
  await assert.rejects(sendContactEmail(values, env, (async () => new Response("no", { status: 403 })) as unknown as typeof fetch), EmailDeliveryError);
  await assert.rejects(
    sendContactEmail(values, env, (async () => {
      throw new TypeError("fetch failed");
    }) as unknown as typeof fetch),
    EmailDeliveryError
  );
});
