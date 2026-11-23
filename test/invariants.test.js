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
// keeps a deploy from publishing a commit that breaks one. Each failure message
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

// Screen values only, the first definition of each. The values for paper are
// in styles/print.css, which this never reads.
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

// Every <script> element in a page, in any letter case and with any
// attributes, ending at a </script> that may carry whitespace or junk before
// its ">", as browsers accept. Matching only the exact "<script>" would let a
// second inline script written <SCRIPT> or <script defer> past the check below,
// to be blocked by the CSP on the live site with no error anywhere.
const scriptElements = (html) =>
  [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\b[^>]*>/gi)].map(([, attributes, body]) => ({
    attributes,
    body,
    src: /\bsrc\s*=/i.test(attributes),
    type: attributes.match(/\btype\s*=\s*["']?([^"'\s>]+)/i)?.[1].toLowerCase(),
  }));

// The ones the CSP's script-src governs: inline (no src) and executable, so no
// type or a JavaScript one. The JSON-LD blocks are data and need no hash.
const EXECUTABLE_TYPES = new Set(["text/javascript", "application/javascript", "module"]);
const inlineScripts = (html) =>
  scriptElements(html).filter((script) => !script.src && (!script.type || EXECUTABLE_TYPES.has(script.type)));

test("the CSP pins the hash of the inline analytics script", () => {
  const inline = inlineScripts(read("frontend/index.html"));
  assert.equal(
    inline.length,
    1,
    "frontend/index.html should hold exactly one inline executable <script>, the analytics loader; any other needs its own hash in the CSP"
  );
  // CRLF normalised, as docs/deployment.md computes it: the browser hashes the
  // LF bytes the host serves, whatever a Windows checkout holds.
  const hash = createHash("sha256").update(inline[0].body.replace(/\r\n/g, "\n")).digest("base64");
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
  const jsx = read("frontend/src/components/widgets/GitHubActivityCalendar.jsx");
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
  const jsx = read("frontend/src/components/widgets/LocationGlobe.jsx");
  const cyan = pick(jsx, /const CYAN = \[([^\]]+)\]/, "CYAN in LocationGlobe.jsx").split(",").map(Number);
  hexToRgb(token("--color-accent")).forEach((channel, c) => {
    assert.ok(Math.abs(cyan[c] - channel / 255) <= 0.002, `LocationGlobe.jsx CYAN should be --color-accent as 0-1 fractions. ${PALETTE_DOC}`);
  });
});

// ----- 4b. The colour system itself -----------------------------------------
// The browser suite measures contrast on the rendered page. These read only
// tokens.css and the stylesheets, so they also run in the prebuild gate,
// and they name the token to change.

const luminance = (hex) => {
  const [r, g, b] = hexToRgb(hex).map((value) => {
    const channel = value / 255;
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a, b) => {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter + 0.05) / (darker + 0.05);
};

test("every text, accent and status colour is 7:1 on the page and on a panel", () => {
  const inks = [
    "--color-text-strong",
    "--color-text",
    "--color-text-soft",
    "--color-text-muted",
    "--color-accent",
    "--color-success",
    "--color-warning",
    "--color-danger",
  ];
  for (const ink of inks) {
    for (const ground of ["--color-bg", "--color-surface"]) {
      const ratio = contrast(token(ink), token(ground));
      assert.ok(ratio >= 7, `${ink} on ${ground} is ${ratio.toFixed(2)}:1, under the 7:1 of WCAG AAA that every text colour here keeps`);
    }
  }
  // The two filled pairs: the primary button, and the inverse chips (the
  // tooltips), whose tokens alias --color-text-strong and --color-bg.
  for (const [ink, ground] of [["--color-accent-ink", "--color-accent"], ["--color-accent-ink", "--color-accent-hover"], ["--color-bg", "--color-text-strong"]]) {
    const ratio = contrast(token(ink), token(ground));
    assert.ok(ratio >= 7, `${ink} on ${ground} is ${ratio.toFixed(2)}:1, under 7:1`);
  }
});

test("every hue derives its border and its tint the same way", () => {
  const css = read("frontend/src/styles/tokens.css");
  for (const hue of ["accent", "success", "warning", "danger"]) {
    for (const [step, share] of [["border", 50], ["subtle", 10]]) {
      const name = `--color-${hue}-${step}`;
      const value = pick(css, new RegExp(`${name}:\\s*([^;]+);`), `${name} in tokens.css`);
      assert.equal(
        value,
        `color-mix(in srgb, var(--color-${hue}) ${share}%, transparent)`,
        `${name} should be --color-${hue} at ${share}%, like every other hue's: one formula is what makes the status colours and the accent read as one family`
      );
    }
  }
});

test("stylesheets take every colour from the tokens", () => {
  const stylesheets = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      const path = `${dir}/${entry}`;
      if (statSync(join(ROOT, path)).isDirectory()) walk(path);
      else if (extname(entry) === ".css" && path !== "frontend/src/styles/tokens.css") stylesheets.push(path);
    }
  };
  walk("frontend/src");
  assert.ok(stylesheets.length >= 15, "expected the component stylesheets under frontend/src");
  // A hex, a colour function, or the two named colours a rule is likely to
  // reach for. color-mix() of tokens, transparent and currentColor are fine.
  const literal = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\b(?:white|black)\b(?![-\w])/i;
  for (const path of stylesheets) {
    const css = read(path).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const declaration of css.split(/[;{}]/)) {
      // A mask is painted in alpha, not colour: black there means "show".
      if (/^\s*(?:-webkit-)?mask/.test(declaration)) continue;
      // The print stylesheet gives the colour tokens their values for paper.
      // A token's value is the one thing there that may be a literal: a rule
      // in it that paints with one is still caught.
      if (path === "frontend/src/styles/print.css" && /^\s*--color-[\w-]+:/.test(declaration)) continue;
      const found = declaration.match(literal);
      assert.ok(!found, `${path} writes the colour "${found?.[0]}" in "${declaration.trim().slice(0, 70)}". Every colour is a token in styles/tokens.css: use one, or add a role there`);
    }
  }
});

// Paper's rules moved out of the stylesheet every visitor waits for and into
// one of their own, linked with media="print". A print rule written beside a
// component still works, which is why nothing would say it had crept back
// into the render-blocking bundle, at the entry budget's expense.
test("print rules live in the print stylesheet, and the app links it", () => {
  const stray = [];
  const walk = (dir) => {
    for (const entry of readdirSync(join(ROOT, dir))) {
      const path = `${dir}/${entry}`;
      if (statSync(join(ROOT, path)).isDirectory()) walk(path);
      else if (extname(entry) === ".css" && path !== "frontend/src/styles/print.css" && /@media[^{]*\bprint\b/.test(read(path))) stray.push(path);
    }
  };
  walk("frontend/src");
  assert.deepEqual(stray, [], "These stylesheets hold an @media print rule. Move it to frontend/src/styles/print.css, in the layer of the rule it overrides.");
  const app = read("frontend/src/App.jsx");
  assert.ok(app.includes('import printStyles from "@/styles/print.css?url";'), "App.jsx should import styles/print.css with ?url, so it is a file of its own");
  assert.ok(app.includes('<link rel="stylesheet" media="print" href={printStyles} />'), 'App.jsx should link the print stylesheet with media="print", or nothing prints as designed');
});

// ----- 5. The hand-kept dates -----------------------------------------------

// dateModified must be a full ISO date-time: Google's profile-page markup
// reports a bare date as an invalid value. Its date part is what the other two
// are compared with.
test("the three last-modified dates agree", () => {
  const modified = pick(
    read("frontend/index.html"),
    /"dateModified": "(\d{4}-\d{2}-\d{2})T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})"/,
    "dateModified in index.html, as a full date-time such as 2026-11-22T00:00:00+01:00,"
  );
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
  // .nvmrc is the one pin: local work, CI and the deploy all read it. A
  // workflow that names a version itself would build with another Node and
  // nothing would say so.
  for (const file of readdirSync(join(ROOT, ".github/workflows"))) {
    const workflow = read(`.github/workflows/${file}`);
    const setups = workflow.split("actions/setup-node@").length - 1;
    const fromNvmrc = (workflow.match(/node-version-file:\s*"?\.nvmrc"?/g) ?? []).length;
    const advice = 'use node-version-file: ".nvmrc", as the other workflows do';
    assert.ok(!/^\s*node-version:/m.test(workflow), `.github/workflows/${file} hardcodes node-version; ${advice}`);
    assert.equal(fromNvmrc, setups, `.github/workflows/${file} has ${setups} actions/setup-node step(s) and ${fromNvmrc} reading .nvmrc; ${advice}`);
  }
  for (const file of ["package.json", "frontend/package.json", "backend/package.json"]) {
    const range = JSON.parse(read(file)).engines?.node;
    assert.ok(range, `${file} has no engines.node`);
    assert.ok(admitsMajor(range, nvmrc), `${file} engines.node "${range}" does not admit Node ${nvmrc} from .nvmrc`);
  }
});

// ----- 6b. The host ---------------------------------------------------------

// Both settings fail quietly when wrong. A mistyped directory is caught by
// the deploy, but a missing not_found_handling is not: Cloudflare then answers
// an unknown path with an empty 404 and the site's own page is never shown.
test("the Cloudflare configuration publishes the build with its headers and 404 page", () => {
  const config = read("frontend/wrangler.jsonc");
  assert.equal(
    pick(config, /"directory":\s*"([^"]+)"/, "assets.directory in frontend/wrangler.jsonc"),
    "./dist",
    "frontend/wrangler.jsonc must publish ./dist, the Vite build output"
  );
  assert.equal(
    pick(config, /"not_found_handling":\s*"([^"]+)"/, "assets.not_found_handling in frontend/wrangler.jsonc"),
    "404-page",
    'frontend/wrangler.jsonc needs "not_found_handling": "404-page", or unknown paths stop getting public/404.html'
  );
  for (const file of ["frontend/public/404.html", "frontend/public/_headers"]) {
    assert.ok(existsSync(join(ROOT, file)), `${file} is missing: Vite copies it into dist, where Cloudflare reads it`);
  }
  // The account is named by a repository variable. Committed here it would be
  // public, and the config would stop working in a fork.
  assert.ok(!/"account_id"/.test(config), "keep account_id out of frontend/wrangler.jsonc; the deploy workflow passes it from vars.CLOUDFLARE_ACCOUNT_ID");

  // One origin, named three times: the canonical URL crawlers are given, the
  // domain Cloudflare attaches the Worker to, and the address the deploy
  // verifies. If they part, a deploy can pass its check on one host while
  // visitors are sent to another.
  const canonical = pick(read("frontend/index.html"), /<link rel="canonical" href="(https:\/\/[^"/]+)\/?"/, 'rel="canonical" in index.html');
  const siteUrl = pick(read(".github/workflows/deploy.yml"), /^\s*SITE_URL:\s*(\S+)$/m, "SITE_URL in deploy.yml");
  const domains = [...config.matchAll(/"pattern":\s*"([^"]+)",\s*"custom_domain":\s*true/g)].map((match) => match[1]);
  const message = "the canonical URL in index.html, SITE_URL in deploy.yml and the first custom domain in frontend/wrangler.jsonc name one origin";
  assert.equal(siteUrl, canonical, message);
  assert.equal(`https://${domains[0]}`, canonical, message);
  assert.match(config, /"workers_dev":\s*false/, "frontend/wrangler.jsonc needs workers_dev: false, or the site is also public at a workers.dev address");
});

test("the three manifests and the newest changelog release name one version", () => {
  const versions = ["package.json", "frontend/package.json", "backend/package.json"].map((file) => [file, JSON.parse(read(file)).version]);
  const released = pick(read("CHANGELOG.md"), /^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}$/m, "a released version heading in CHANGELOG.md");
  for (const [file, version] of versions) {
    assert.equal(
      version,
      released,
      `${file} is ${version} but the newest release in CHANGELOG.md is ${released}. A release moves all three manifests and the changelog together (docs/deployment.md#release-process).`
    );
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
    read("frontend/src/components/widgets/GitHubActivityCalendar.jsx"),
    /const WIDE = "([^"]+)";/,
    "WIDE in GitHubActivityCalendar.jsx"
  );
  for (const file of ["frontend/src/components/widgets/GitHubActivity.css", "frontend/src/components/widgets/LocationGlobe.css"]) {
    assert.ok(read(file).includes(`@media ${wide}`), `${file} should switch at ${wide}, the query GitHubActivityCalendar.jsx sizes the graph by`);
  }
});

// ----- 10. The house style --------------------------------------------------

const BINARY = new Set([".png", ".jpg", ".jpeg", ".gif", ".ico", ".webp", ".avif", ".woff", ".woff2", ".ttf", ".eot", ".pdf"]);
const SKIP_DIRS = new Set([".git", "node_modules", "dist", "dist-server", "graphify-out", "playwright-report", "test-results"]);

// Tracked files plus new ones not yet added, so a file is checked before its
// first commit. Every checkout that runs this has git; the walk is only a
// fallback for a copy of the tree without it.
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
