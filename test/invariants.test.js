// Repository invariants, on Node's built-in runner with no dependencies:
//
//   npm run test:invariants
//
// Each test pins a coupling that CLAUDE.md lists as failing silently: two
// files that must agree, where getting it wrong breaks nothing a build or a
// glance would catch. The analytics hash is the model case. Edit the inline
// script by a single space and the CSP blocks it on the live site, with no
// error anywhere a developer would look.
//
// The tests read source files only, never build output, so they also run
// before a build: frontend/package.json's prebuild runs them, which is what
// keeps Netlify from publishing a commit that breaks one. Each failure message
// says what to change.
import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(join(ROOT, path), "utf8");

// The first capture group of `pattern` in `text`, failing with `what` when the
// file no longer has the shape this test expects, so a refactor shows up as a
// clear message rather than a TypeError.
const pick = (text, pattern, what) => {
  const match = text.match(pattern);
  assert.ok(match, `could not find ${what}; update test/invariants.test.js if it moved`);
  return match[1];
};

// ----- Colour helpers -------------------------------------------------------

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

// Screen values only: the print block at the end of tokens.css redefines some
// tokens for paper, and the first definition of each is the one on screen.
const tokens = (() => {
  const values = new Map();
  for (const [, name, value] of read("frontend/src/styles/tokens.css").matchAll(/(--color-[\w-]+):\s*(#[0-9a-f]{6});/gi)) {
    if (!values.has(name)) values.set(name, value.toLowerCase());
  }
  return values;
})();

const token = (name) => {
  assert.ok(tokens.has(name), `${name} is not a hex token in frontend/src/styles/tokens.css`);
  return tokens.get(name);
};

// ----- 1. The analytics hash ------------------------------------------------

test("the CSP pins the hash of the inline analytics script", () => {
  const html = read("frontend/index.html");
  const inline = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)];
  assert.equal(inline.length, 1, "frontend/index.html should hold exactly one untyped inline <script>, the analytics loader");
  // CRLF normalised, as docs/deployment.md computes it: the browser hashes the
  // LF bytes Netlify serves, whatever a Windows checkout holds.
  const hash = createHash("sha256").update(inline[0][1].replace(/\r\n/g, "\n")).digest("base64");
  const pinned = pick(read("frontend/public/_headers"), /'sha256-([A-Za-z0-9+/=]+)'/, "a sha256 source in the CSP");
  assert.equal(
    pinned,
    hash,
    "The inline analytics script changed, so the CSP now blocks it and analytics stop. " +
      `Set 'sha256-${hash}' in frontend/public/_headers (docs/deployment.md#the-inline-analytics-hash).`
  );
});

// ----- 2. The prerender target ----------------------------------------------

test("index.html keeps the exact root element the prerender looks for", () => {
  const count = read("frontend/index.html").split('<div id="root"></div>').length - 1;
  assert.equal(count, 1, 'frontend/scripts/prerender.mjs finds <div id="root"></div> by exact string; keep exactly one');
});

// ----- 3. The portrait preload ----------------------------------------------

test("the portrait preload matches the AVIF source in Hero.jsx", () => {
  const html = read("frontend/index.html");
  const hero = read("frontend/src/components/sections/Hero.jsx");
  const message = "or the browser downloads the portrait twice; update index.html and Hero.jsx together";
  assert.equal(
    pick(html, /imagesrcset="([^"]+)"/, "imagesrcset in index.html"),
    pick(hero, /type="image\/avif"\s+srcSet="([^"]+)"/, "the AVIF <source> srcSet in Hero.jsx"),
    `imagesrcset must equal the AVIF srcSet, ${message}`
  );
  assert.equal(
    pick(html, /imagesizes="([^"]+)"/, "imagesizes in index.html"),
    pick(hero, /const PORTRAIT_SIZES =\s*"([^"]+)"/, "PORTRAIT_SIZES in Hero.jsx"),
    `imagesizes must equal PORTRAIT_SIZES, ${message}`
  );
});

// ----- 4. The palette, wherever it is copied by hand ------------------------

const PALETTE_DOC = "Every copy is listed in docs/design.md (colour tokens).";

test("the theme-color metas and 404.html use the token palette", () => {
  const bg = token("--color-bg");
  for (const file of ["frontend/index.html", "frontend/public/404.html"]) {
    const meta = pick(read(file), /<meta name="theme-color" content="(#[0-9a-f]{6})"/i, `the theme-color meta in ${file}`);
    assert.equal(meta.toLowerCase(), bg, `${file}: theme-color must equal --color-bg. ${PALETTE_DOC}`);
  }
  // A standalone page with no bundled CSS: every colour in it must still be a
  // colour the site uses.
  const palette = new Set(tokens.values());
  for (const hex of read("frontend/public/404.html").match(/#[0-9a-f]{6}\b/gi)) {
    assert.ok(palette.has(hex.toLowerCase()), `404.html uses ${hex}, which is not a token in tokens.css. ${PALETTE_DOC}`);
  }
});

test("the social card script copies the token palette", () => {
  const script = read("scripts/gen-og-card.mjs");
  const copies = [...script.matchAll(/const \w+ = "(#[0-9a-f]{6})"; \/\/ (--color-[\w-]+)/gi)];
  assert.ok(copies.length >= 5, "expected the colour constants in scripts/gen-og-card.mjs, each commented with its token");
  for (const [, value, name] of copies) {
    assert.equal(value.toLowerCase(), token(name), `scripts/gen-og-card.mjs: ${value} should equal ${name}; then regenerate the card. ${PALETTE_DOC}`);
  }
});

test("the contact email's BRAND copies the token palette", () => {
  const mailer = read("backend/services/mailerService.js");
  const brand = (key) => pick(mailer, new RegExp(`\\b${key}: "(#[0-9a-f]{6})"`, "i"), `BRAND.${key} in mailerService.js`).toLowerCase();
  const where = `backend/services/mailerService.js BRAND. ${PALETTE_DOC}`;
  assert.equal(brand("accent"), token("--color-indigo"), `BRAND.accent should equal --color-indigo: ${where}`);
  assert.equal(brand("accent2"), token("--color-accent"), `BRAND.accent2 should equal --color-accent: ${where}`);
  assert.equal(brand("ink"), token("--color-bg"), `BRAND.ink should equal --color-bg: ${where}`);
});

test("the contribution graph's scale is the accent mixed into the surface", () => {
  const jsx = read("frontend/src/components/sections/GitHubActivityCalendar.jsx");
  const theme = [...pick(jsx, /const THEME = \{ dark: \[([^\]]+)\]/, "THEME in GitHubActivityCalendar.jsx").matchAll(/#[0-9a-f]{6}/gi)].map(([hex]) => hex.toLowerCase());
  assert.equal(theme.length, 5, "THEME should hold five colours, empty day and four levels");
  const where = `GitHubActivityCalendar.jsx THEME. ${PALETTE_DOC}`;
  assert.equal(theme[0], token("--color-surface-raised"), `an empty day should be --color-surface-raised: ${where}`);
  assert.equal(theme[4], token("--color-accent"), `the top level should be --color-accent: ${where}`);
  // color-mix(in srgb, accent p%, surface), each channel within rounding.
  const surface = hexToRgb(token("--color-surface"));
  const accent = hexToRgb(token("--color-accent"));
  [0.25, 0.5, 0.75].forEach((p, i) => {
    const expected = surface.map((s, c) => s + (accent[c] - s) * p);
    hexToRgb(theme[i + 1]).forEach((value, c) => {
      assert.ok(Math.abs(value - expected[c]) <= 1, `level ${i + 1} should be the accent at ${p * 100}% over the surface: ${where}`);
    });
  });
});

test("the globe's WebGL cyan is the accent", () => {
  const jsx = read("frontend/src/components/sections/LocationGlobe.jsx");
  const cyan = pick(jsx, /const CYAN = \[([^\]]+)\]/, "CYAN in LocationGlobe.jsx").split(",").map(Number);
  hexToRgb(token("--color-accent")).forEach((channel, c) => {
    assert.ok(Math.abs(cyan[c] - channel / 255) <= 0.002, `LocationGlobe.jsx CYAN should be --color-accent as 0-1 fractions. ${PALETTE_DOC}`);
  });
});

// ----- 5. The hand-kept dates -----------------------------------------------

test("the three last-modified dates agree", () => {
  const modified = pick(read("frontend/index.html"), /"dateModified": "(\d{4}-\d{2}-\d{2})"/, "dateModified in index.html");
  const lastmod = pick(read("frontend/public/sitemap.xml"), /<lastmod>(\d{4}-\d{2}-\d{2})<\/lastmod>/, "<lastmod> in sitemap.xml");
  const humans = pick(read("frontend/public/humans.txt"), /Last update: (\d{4}\/\d{2}\/\d{2})/, "Last update in humans.txt").replaceAll("/", "-");
  const message = "dateModified (index.html), <lastmod> (public/sitemap.xml) and Last update (public/humans.txt) move together when content changes";
  assert.equal(lastmod, modified, message);
  assert.equal(humans, modified, message);
});

// ----- 6. The Node version --------------------------------------------------

// Enough of semver for the ranges this repo writes: >=X.Y.Z and ^X.Y.Z,
// joined by ||. Anything else fails loudly rather than passing unchecked.
const admitsMajor = (range, major) =>
  range.split("||").some((part) => {
    const match = part.trim().match(/^(>=|\^)(\d+)\.\d+\.\d+$/);
    assert.ok(match, `test/invariants.test.js cannot read the engines range "${range}"; extend admitsMajor`);
    return match[1] === ">=" ? major >= Number(match[2]) : major === Number(match[2]);
  });

test("the Node version is pinned the same way everywhere", () => {
  const nvmrc = Number(read(".nvmrc").trim());
  const netlify = Number(pick(read("netlify.toml"), /NODE_VERSION\s*=\s*"(\d+)"/, "NODE_VERSION in netlify.toml"));
  assert.equal(netlify, nvmrc, ".nvmrc (read by CI) and NODE_VERSION in netlify.toml (read by Netlify) must name the same Node major");
  for (const file of ["package.json", "frontend/package.json", "backend/package.json"]) {
    const range = JSON.parse(read(file)).engines?.node;
    assert.ok(range, `${file} has no engines.node`);
    assert.ok(admitsMajor(range, nvmrc), `${file} engines.node "${range}" does not admit Node ${nvmrc} from .nvmrc`);
  }
});

// ----- 7. The contact form, mirrored on both sides --------------------------

test("the contact form's fields, email pattern and honeypot match the API", () => {
  const form = read("frontend/src/components/sections/Contact.jsx");
  const route = read("backend/routes/contactRoutes.js");
  const message = "Contact.jsx and backend/routes/contactRoutes.js mirror each other; change both together";

  const formFields = [...form.matchAll(/\{ name: "(\w+)"[^}]*?maxLength: (\d+)/g)].map(([, name, max]) => `${name}:${max}`);
  const routeFields = [...pick(route, /const FIELDS = \{([\s\S]*?)\n\};/, "FIELDS in contactRoutes.js").matchAll(/(\w+): \{ max: (\d+) \}/g)].map(
    ([, name, max]) => `${name}:${max}`
  );
  assert.ok(routeFields.length > 0, "found no fields in FIELDS in contactRoutes.js");
  assert.deepEqual(formFields, routeFields, `field names and length caps differ: ${message}`);

  const pattern = /const EMAIL_RE = (\/.+\/[a-z]*);/;
  assert.equal(pick(form, pattern, "EMAIL_RE in Contact.jsx"), pick(route, pattern, "EMAIL_RE in contactRoutes.js"), `EMAIL_RE differs: ${message}`);

  const honeypot = pick(route, /const HONEYPOT_FIELD = "(\w+)";/, "HONEYPOT_FIELD in contactRoutes.js");
  assert.ok(form.includes(`name="${honeypot}"`), `the honeypot input in Contact.jsx must be named "${honeypot}": ${message}`);
});

// ----- 8. The backend origin ------------------------------------------------

test("the CSP and the DNS hint name the API origin the form calls", () => {
  const origin = pick(
    read("frontend/src/components/sections/Contact.jsx"),
    /VITE_API_BASE_URL \|\| "(https:\/\/[^"]+)"/,
    "the default API origin in Contact.jsx"
  );
  const connect = pick(read("frontend/public/_headers"), /connect-src ([^;]+);/, "connect-src in _headers").split(/\s+/);
  assert.ok(connect.includes(origin), `connect-src in frontend/public/_headers must allow ${origin}, or the CSP blocks the contact form`);
  const prefetch = pick(read("frontend/index.html"), /<link rel="dns-prefetch" href="([^"]+)"/, "the dns-prefetch link in index.html");
  assert.equal(prefetch, origin, "the dns-prefetch in index.html should name the API origin Contact.jsx calls");
});

// ----- 9. The 80rem breakpoint ----------------------------------------------

test("the graph and the globe switch at the breakpoint the calendar measures", () => {
  const wide = pick(
    read("frontend/src/components/sections/GitHubActivityCalendar.jsx"),
    /const WIDE = "([^"]+)";/,
    "WIDE in GitHubActivityCalendar.jsx"
  );
  for (const file of ["frontend/src/components/sections/GitHubActivity.css", "frontend/src/components/sections/LocationGlobe.css"]) {
    assert.ok(read(file).includes(`@media ${wide}`), `${file} should switch at ${wide}, the query GitHubActivityCalendar.jsx sizes the graph by`);
  }
});

// ----- 10. The house style --------------------------------------------------

const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".avif", ".woff", ".woff2", ".ttf", ".eot", ".pdf"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "dist-server", "graphify-out", "playwright-report", "test-results"]);

// Tracked files plus new ones not yet added, so a file is checked before its
// first commit. Netlify's checkout has git; the walk is only a fallback.
const repoFiles = () => {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" });
    return out.split("\0").filter(Boolean);
  } catch {
    const walk = (dir) =>
      readdirSync(join(ROOT, dir)).flatMap((name) => {
        const path = dir ? `${dir}/${name}` : name;
        if (SKIP_DIRS.has(name)) return [];
        return statSync(join(ROOT, path)).isDirectory() ? walk(path) : [path];
      });
    return walk("");
  }
};

test("no file uses an em dash", () => {
  // Built from its code point so this file never contains the character itself.
  const EM_DASH = String.fromCharCode(0x2014);
  const hits = [];
  for (const file of repoFiles()) {
    if (BINARY.has(extname(file).toLowerCase()) || !existsSync(join(ROOT, file))) continue;
    read(file)
      .split("\n")
      .forEach((line, i) => {
        if (line.includes(EM_DASH)) hits.push(`${relative(ROOT, join(ROOT, file))}:${i + 1}`);
      });
  }
  assert.deepEqual(hits, [], "The repository uses no em dashes (CLAUDE.md, Conventions). Rewrite these lines with a colon, comma or full stop.");
});

// ----- 11. Data modules stay plain Node -------------------------------------

test("the data modules import nothing a bare Node process cannot load", () => {
  const dir = "frontend/src/data";
  for (const name of readdirSync(join(ROOT, dir)).filter((file) => file.endsWith(".js"))) {
    const source = read(`${dir}/${name}`);
    const specifiers = [...source.matchAll(/^\s*(?:import|export)\s[^;]*?from\s+"([^"]+)"|^\s*import\s+"([^"]+)"/gm)].map((m) => m[1] ?? m[2]);
    for (const specifier of specifiers) {
      // frontend/test/data.test.js imports these without a bundler, so no
      // alias and no extensionless relative path.
      assert.ok(
        /^\.\.?\/.+\.js$/.test(specifier),
        `${dir}/${name} imports "${specifier}"; data modules use relative imports ending in .js, never "@/" or a package`
      );
    }
    if (name === "portfolio.js") {
      // scripts/fetch-github-activity.mjs imports it in a workflow that runs
      // no npm ci, so it must not import anything at all.
      assert.deepEqual(specifiers, [], `${dir}/portfolio.js must import nothing: refresh-activity.yml loads it without installing dependencies`);
    }
  }
});
