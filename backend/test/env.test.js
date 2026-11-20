// config/env.js as a function of the environment. loadConfig and
// configWarnings are pure, so each case passes its own environment and none
// of them reads or changes the real one.
import test from "node:test";
import assert from "node:assert/strict";
import { loadConfig, configWarnings } from "../config/env.js";

const MAIL = { RESEND_API_KEY: "key", EMAIL_FROM: "from@example.com", EMAIL_TO: "to@example.com" };

test("an empty environment gets the documented defaults", () => {
  const config = loadConfig({});
  assert.equal(config.port, 5000);
  assert.equal(config.isProduction, false);
  // Two proxies in front of the app, and ten seconds for a send: the reasons
  // are beside the constants in config/env.js.
  assert.equal(config.trustProxyHops, 2);
  assert.equal(config.resendTimeoutMs, 10_000);
  assert.deepEqual([...config.allowedOrigins], [
    "http://localhost:5173",
    "https://syedwaleedahmed.me",
    "https://www.syedwaleedahmed.me",
  ]);
  assert.ok(Object.isFrozen(config));
});

test("the proxy count and the send timeout are read as whole numbers", () => {
  const config = loadConfig({ TRUST_PROXY_HOPS: "3", RESEND_TIMEOUT_MS: " 2500 " });
  assert.equal(config.trustProxyHops, 3);
  assert.equal(config.resendTimeoutMs, 2500);
  // Zero proxies is a real setting, for a server reached directly.
  assert.equal(loadConfig({ TRUST_PROXY_HOPS: "0" }).trustProxyHops, 0);
});

test("a number that cannot be used falls back to the default, and says so", () => {
  for (const bad of ["two", "1.5", "-1", "true", "2 hops"]) {
    assert.equal(loadConfig({ TRUST_PROXY_HOPS: bad }).trustProxyHops, 2, `TRUST_PROXY_HOPS=${bad}`);
    const warnings = configWarnings({ ...MAIL, TRUST_PROXY_HOPS: bad });
    assert.equal(warnings.length, 1);
    assert.match(warnings[0], /^TRUST_PROXY_HOPS: .* using 2\.$/);
  }
  // A timeout of zero would fail every send at once.
  assert.equal(loadConfig({ RESEND_TIMEOUT_MS: "0" }).resendTimeoutMs, 10_000);
  assert.match(configWarnings({ ...MAIL, RESEND_TIMEOUT_MS: "0" })[0], /^RESEND_TIMEOUT_MS: "0" .* using 10000\.$/);
  // Unset and blank are not mistakes.
  assert.deepEqual(configWarnings({ ...MAIL, TRUST_PROXY_HOPS: "", RESEND_TIMEOUT_MS: "  " }), []);
});

test("ALLOWED_ORIGINS replaces the defaults, trimmed", () => {
  const config = loadConfig({ ALLOWED_ORIGINS: " https://a.example , https://b.example:8443,, " });
  assert.deepEqual([...config.allowedOrigins], ["https://a.example", "https://b.example:8443"]);
});

test("an allow-list entry no browser could send is reported at boot", () => {
  // Each of these looks right and silently locks its site out: the list is
  // compared with the Origin header character for character.
  const never = ["https://slash.example/", "https://path.example/app", "HTTPS://Upper.Example", "*", "bare.example"];
  const warnings = configWarnings({ ...MAIL, ALLOWED_ORIGINS: ["https://fine.example", ...never].join(",") });
  assert.equal(warnings.length, 1);
  for (const entry of never) assert.ok(warnings[0].includes(JSON.stringify(entry)), `${entry} was not reported`);
  assert.ok(!warnings[0].includes('"https://fine.example"'));
  // The entries are reported, not repaired or dropped: what was asked for is
  // what the server uses.
  assert.equal(loadConfig({ ALLOWED_ORIGINS: "https://slash.example/" }).allowedOrigins.has("https://slash.example/"), true);
});

test("the built-in origins and a complete environment raise no warning", () => {
  assert.deepEqual(configWarnings(MAIL), []);
  assert.deepEqual(configWarnings({ ...MAIL, ALLOWED_ORIGINS: "http://localhost:4173,https://syedwaleedahmed.me" }), []);
});

test("missing mail settings are named in one line", () => {
  assert.deepEqual(configWarnings({ EMAIL_TO: "to@example.com" }), [
    "missing: RESEND_API_KEY, EMAIL_FROM (contact form returns 503 until set).",
  ]);
});
