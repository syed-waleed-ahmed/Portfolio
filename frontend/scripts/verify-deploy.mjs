// Confirms that a deployed origin serves this build, under the headers
// public/_headers asks for, with every page answering and the Worker's API
// up. The deploy workflow runs it after publishing:
//
//   node scripts/verify-deploy.mjs https://syedwaleedahmed.me
//
// Nothing else looks at the host itself. `vite preview` ignores _headers, and
// the browser suite reads the file through e2e/serve.mjs, so a host that
// stopped applying a rule, kept serving the previous build or lost its 404
// page would pass every other check. Here each rule in dist/_headers is tested
// against one real URL it matches, so a new rule is covered without an edit.
// On the site's own domain it also checks the redirects to it, from plain HTTP
// and from www, which are settings in the Cloudflare zone and not in this
// repository.
//
// Node built-ins only, and it reads dist/, so it needs a build but no install.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const origin = (process.argv[2] ?? "").replace(/\/$/, "");
if (!/^https?:\/\//.test(origin)) {
  console.error("Usage: node scripts/verify-deploy.mjs <origin>, for example https://syedwaleedahmed.me");
  process.exit(2);
}

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
if (!existsSync(path.join(DIST, "index.html"))) {
  console.error("verify-deploy: frontend/dist is missing. Run npm run build first.");
  process.exit(2);
}

// _headers: an unindented path starts a rule, indented "Name: value" lines
// belong to it, and "#" starts a comment.
const rules = [];
for (const line of readFileSync(path.join(DIST, "_headers"), "utf8").split(/\r?\n/)) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  if (!/^\s/.test(line)) {
    rules.push({ pattern: line.trim(), headers: [] });
  } else {
    const colon = line.indexOf(":");
    rules.at(-1).headers.push([line.slice(0, colon).trim().toLowerCase(), line.slice(colon + 1).trim()]);
  }
}

// One URL the pattern matches: the path itself, or for "/dir/*" the first
// file the build put in that directory.
const sample = (pattern) => {
  if (pattern === "/*") return "/";
  if (!pattern.endsWith("/*")) return pattern;
  const dir = pattern.slice(0, -1);
  const file = readdirSync(path.join(DIST, dir)).sort()[0];
  if (!file) throw new Error(`no file in dist${dir} to test the ${pattern} rule against`);
  return dir + file;
};

// "text/plain; charset=utf-8" and "text/plain;charset=UTF-8" are one value.
const same = (a, b) => a.replace(/\s+/g, "").toLowerCase() === b.replace(/\s+/g, "").toLowerCase();

const get = (url) => fetch(origin + url, { redirect: "manual" });

// What the checks compare the origin with, read once.
const entry = readFileSync(path.join(DIST, "index.html"), "utf8").match(/\/assets\/index-[\w-]+\.js/)?.[0];
if (!entry) throw new Error("could not find the entry script in dist/index.html");
const everywhere = rules.find((rule) => rule.pattern === "/*")?.headers ?? [];
const title = readFileSync(path.join(DIST, "404.html"), "utf8").match(/<title>([^<]+)<\/title>/)?.[1];
const { protocol, host } = new URL(origin);
const wrangler = readFileSync(fileURLToPath(new URL("../wrangler.jsonc", import.meta.url)), "utf8");
const domains = [...wrangler.matchAll(/"pattern":\s*"([^"]+)",\s*"custom_domain":\s*true/g)].map((match) => match[1]);
const sitemapPaths = [...readFileSync(path.join(DIST, "sitemap.xml"), "utf8").matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map((match) => match[1]);

// One pass over every check, returning what is wrong.
const check = async () => {
  const problems = [];

  // 1. This build is the one being served. The entry script's fingerprint
  //    changes with every build, so it identifies one.
  if (!(await (await get("/")).text()).includes(entry)) {
    problems.push(`/ does not reference ${entry}: the origin is serving another build`);
  }

  // 2. Every rule in _headers is applied.
  for (const rule of rules) {
    const url = sample(rule.pattern);
    const response = await get(url);
    if (response.status !== 200) {
      problems.push(`${rule.pattern}: ${url} answered ${response.status}, so its rule never applies`);
      continue;
    }
    for (const [name, value] of rule.pattern === "/*" ? everywhere : [...rule.headers, ...everywhere]) {
      const got = response.headers.get(name);
      if (got === null || !same(got, value)) problems.push(`${url}: ${name} is ${JSON.stringify(got)}, expected ${JSON.stringify(value)}`);
    }
  }

  // 3. An unknown path gets the 404 page, with a 404, and every prerendered
  //    page in the sitemap answers.
  const missing = await get("/verify-deploy-no-such-page");
  if (missing.status !== 404) problems.push(`an unknown path answered ${missing.status}, expected 404`);
  if (title && !(await missing.text()).includes(title)) problems.push("an unknown path did not get the 404.html page");
  for (const path of sitemapPaths) {
    const response = await get(path);
    if (response.status !== 200) problems.push(`${path}, in the sitemap, answered ${response.status}`);
  }

  // 4. The Worker answers its API, and has the mail settings it needs. A
  //    deploy without them would otherwise show only as a form that fails.
  const health = await get("/api/health");
  const body = health.ok ? await health.json().catch(() => null) : null;
  if (body?.status !== "ok") problems.push(`/api/health answered ${health.status}, expected 200 with status ok`);
  else if (body.mailer !== "configured") problems.push("/api/health reports the mail secrets missing: run `wrangler secret put` for RESEND_API_KEY, EMAIL_FROM and EMAIL_TO");

  // 5. Plain HTTP goes to HTTPS, and every other hostname the Worker is
  //    attached to goes to this origin. Both are settings in the Cloudflare
  //    zone ("Always Use HTTPS" and a redirect rule), not files in the
  //    repository, so nothing else would notice either being switched off.
  //    Checked only for an origin that frontend/wrangler.jsonc names as a
  //    custom domain, so the script still runs against any other address.
  let redirects = 0;
  const expectRedirect = async (from, to) => {
    const response = await fetch(from, { redirect: "manual" });
    const location = response.headers.get("location") ?? "";
    if (![301, 308].includes(response.status) || !location.startsWith(to)) {
      problems.push(`${from} answered ${response.status}${location ? `, to ${location}` : ""}; expected a permanent redirect to ${to}`);
    }
    redirects += 1;
  };
  if (protocol === "https:" && domains.includes(host)) {
    await expectRedirect(`http://${host}/`, `https://${host}/`);
    for (const other of domains.filter((domain) => domain !== host)) await expectRedirect(`https://${other}/`, `${origin}/`);
  }

  return { problems, redirects };
};

// A new version reaches the edge locations over a few seconds, so one failed
// pass proves nothing. The whole set is retried, not the first check alone: a
// deploy that changes only _headers leaves the entry script's name as it was,
// and waiting for that name let the first such deploy fail on headers that
// arrived two seconds later. About a minute in all.
const ATTEMPTS = 12;
let result = await check();
for (let attempt = 1; result.problems.length && attempt < ATTEMPTS; attempt += 1) {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  result = await check();
}

if (result.problems.length) {
  console.error(`verify-deploy: ${origin} failed ${result.problems.length} check(s):\n- ${result.problems.join("\n- ")}`);
  process.exit(1);
}
console.log(
  `verify-deploy: ${origin} serves ${entry}, applies all ${rules.length} _headers rules, answers all ${sitemapPaths.length} pages and its API, and 404s with the 404 page` +
    (result.redirects ? `; ${result.redirects} redirects to it are in place.` : ".")
);
