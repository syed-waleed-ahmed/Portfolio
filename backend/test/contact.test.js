// Backend API tests - Node's built-in runner (`node --test`), no extra deps.
// Importing server.js here also validates that config/ and services/ modules
// load correctly, so a missing/broken import fails the suite (and CI).
import test from "node:test";
import assert from "node:assert/strict";

// No test may ever send real email, whatever a developer's backend/.env holds.
// config/env.js loads that file with dotenv, which never overrides a variable
// that is already set, so blanking these first leaves the mailer provably
// unconfigured: anything that reaches it gets a 503, never a delivery. That is
// also why the app is imported dynamically, after this runs.
for (const key of ["RESEND_API_KEY", "EMAIL_FROM", "EMAIL_TO"]) process.env[key] = "";
const { default: app } = await import("../server.js");
const { config } = await import("../config/env.js");

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

// The rate limiter allows 5 requests per address per 15 minutes and keeps its
// count in memory for the whole run. With `trust proxy` set to 1 and the
// client connecting from 127.0.0.1, the address it keys on is the last
// X-Forwarded-For entry, so each test that spends quota asks for its own and
// adding a test can never push a later one into a 429.
let nextClient = 1;
const newClient = () => `10.0.0.${nextClient++}`;

const postContact = (body, client = newClient()) =>
  fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Forwarded-For": client },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const VALID = {
  name: "Jane",
  email: "jane@example.com",
  subject: "Hi",
  message: "Hello there, this is a test.",
};

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

test("POST /api/contact rejects missing fields with 400, naming the first", async () => {
  const res = await postContact({ name: "", email: "", subject: "", message: "" });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { success: false, error: "Missing required field: name." });
});

test("POST /api/contact rejects an invalid email with 400", async () => {
  const res = await postContact({ ...VALID, email: "not-an-email" });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { success: false, error: "Invalid email address." });
});

test("POST /api/contact rejects an over-length field with 400", async () => {
  const res = await postContact({ ...VALID, name: "x".repeat(101) });
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { success: false, error: 'Field "name" is too long.' });
});

test("POST /api/contact rejects a body over the 16kb cap with 413", async () => {
  // Comfortably past express.json({ limit: "16kb" }) in server.js.
  const res = await postContact({ ...VALID, message: "a".repeat(20000) });
  assert.equal(res.status, 413);
  assert.deepEqual(await res.json(), { success: false, error: "Payload too large." });
  // express.json runs before the router, so this never reaches the limiter.
  assert.equal(res.headers.has("ratelimit-remaining"), false);
});

test("POST /api/contact rejects malformed JSON with 400, before the limiter", async () => {
  const res = await postContact('{"name": "Jane",');
  assert.equal(res.status, 400);
  assert.deepEqual(await res.json(), { success: false, error: "Malformed JSON body." });
  assert.equal(res.headers.has("ratelimit-remaining"), false);
});

test("POST /api/contact reaches the mailer with a valid body, which is unconfigured here", async () => {
  // The guarantee at the top of this file, checked: a valid submission gets
  // as far as the mailer and stops there with a 503.
  const res = await postContact(VALID);
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { success: false, error: "Email service is not configured." });
});

test("POST /api/contact answers a tripped honeypot exactly as a real send", async () => {
  const res = await postContact({ ...VALID, website: "http://spam.example.com" });
  // The same status and body a delivered message gets, so a bot cannot tell
  // the trap from success. Nothing is sent: had it reached the mailer, this
  // would be the 503 from the test above.
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { success: true, message: "Message sent successfully." });
});

test("POST /api/contact gives an invalid body the same 400 with or without the honeypot", async () => {
  const invalid = { ...VALID, email: "not-an-email" };
  const plain = await postContact(invalid);
  const trapped = await postContact({ ...invalid, website: "http://spam.example.com" });
  assert.equal(trapped.status, 400);
  assert.equal(trapped.status, plain.status);
  assert.deepEqual(await trapped.json(), await plain.json());
});

test("POST /api/contact ignores an empty honeypot field", async () => {
  const res = await postContact({ ...VALID, website: "" });
  // An empty trap must not count as tripped: this goes on to the mailer.
  assert.equal(res.status, 503);
});

test("CORS answers an allowed origin and stays silent for any other", async () => {
  // Read from config rather than hard-coded: ALLOWED_ORIGINS in a local .env
  // replaces the defaults.
  const [allowed] = config.allowedOrigins;
  const ok = await fetch(`${baseUrl}/health`, { headers: { Origin: allowed } });
  assert.equal(ok.headers.get("access-control-allow-origin"), allowed);

  // A disallowed origin gets no header and no error: the browser blocks the
  // response on its side, and a 500 would only advertise the allow-list.
  const other = await fetch(`${baseUrl}/health`, { headers: { Origin: "https://not-allowed.example" } });
  assert.equal(other.status, 200);
  assert.equal(other.headers.has("access-control-allow-origin"), false);
});

test("POST /api/contact rate-limits the sixth request from one address", async () => {
  // Invalid bodies, so not even a misconfigured run could send mail. The
  // limiter counts every request it sees, rejected or not.
  const client = newClient();
  const invalid = { ...VALID, email: "not-an-email" };
  for (let i = 0; i < 5; i++) {
    assert.equal((await postContact(invalid, client)).status, 400);
  }
  const res = await postContact(invalid, client);
  assert.equal(res.status, 429);
  assert.equal(res.headers.get("ratelimit-remaining"), "0");
  assert.deepEqual(await res.json(), {
    success: false,
    error: "Too many requests. Please try again later.",
  });
});

test("unknown route returns 404", async () => {
  const res = await fetch(`${baseUrl}/does-not-exist`);
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { success: false, error: "Not found." });
});
