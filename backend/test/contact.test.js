// Backend API tests - Node's built-in runner (`node --test`), no extra deps.
// Importing server.js here also validates that config/ and services/ modules
// load correctly, so a missing/broken import fails the suite (and CI).
//
// These tests only exercise routing + validation, never the mailer, so they
// send no real email and pass regardless of whether Resend env vars are set.
import test from "node:test";
import assert from "node:assert/strict";
import app from "../server.js";

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

const postContact = (body) =>
  fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

test("GET /health returns ok", async () => {
  const res = await fetch(`${baseUrl}/health`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, "ok");
});

test("GET / returns running status", async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.status, "ok");
});

test("POST /api/contact rejects missing fields with 400", async () => {
  const res = await postContact({ name: "", email: "", subject: "", message: "" });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.match(json.error, /required|missing/i);
});

test("POST /api/contact rejects an invalid email with 400", async () => {
  const res = await postContact({
    name: "Jane",
    email: "not-an-email",
    subject: "Hi",
    message: "Hello there, this is a test.",
  });
  assert.equal(res.status, 400);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.match(json.error, /email/i);
});

test("POST /api/contact rejects an over-length field with 400", async () => {
  const res = await postContact({
    name: "x".repeat(101),
    email: "jane@example.com",
    subject: "Hi",
    message: "Hello there, this is a test.",
  });
  assert.equal(res.status, 400);
});

test("POST /api/contact rejects a body over the 16kb cap with 413", async () => {
  const res = await postContact({
    name: "Jane",
    email: "jane@example.com",
    subject: "Oversized",
    // Comfortably past express.json({ limit: "16kb" }) in server.js.
    message: "a".repeat(20000),
  });
  assert.equal(res.status, 413);
  const json = await res.json();
  assert.equal(json.success, false);
  assert.match(json.error, /payload too large/i);
  // express.json runs before the router, so this never reaches the limiter.
  assert.equal(res.headers.has("ratelimit-remaining"), false);
});

test("POST /api/contact silently drops a submission that trips the honeypot", async () => {
  const res = await postContact({
    name: "Spam Bot",
    email: "bot@example.com",
    subject: "Buy things",
    message: "Spam body.",
    website: "http://spam.example.com",
  });
  // Answers like a real send so a bot can't detect the trap. Nothing is sent -
  // if it had reached the mailer this would be 502/503 here, since the suite
  // runs without Resend configured.
  assert.equal(res.status, 200);
  const json = await res.json();
  assert.equal(json.success, true);
});

test("POST /api/contact ignores an empty honeypot field", async () => {
  const res = await postContact({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  // Empty honeypot must not short-circuit: this should still fail validation.
  assert.equal(res.status, 400);
});

test("unknown route returns 404", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
  const json = await res.json();
  assert.equal(json.success, false);
});
