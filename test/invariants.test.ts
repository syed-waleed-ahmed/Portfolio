// Repository invariants, on Node's own runner with no dependencies:
//   npm run test:invariants
// Each test holds a rule a build would not catch on its own. They read source
// files only, so they also run in the frontend's prebuild gate.
import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { SITE } from "../frontend/src/content/site.ts";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const read = (path: string) => readFileSync(join(ROOT, path), "utf8");

const walk = (dir: string, keep: (path: string) => boolean): string[] =>
  readdirSync(join(ROOT, dir)).flatMap((name) => {
    const path = `${dir}/${name}`;
    return statSync(join(ROOT, path)).isDirectory() ? walk(path, keep) : keep(path) ? [path] : [];
  });

// ----- Colour ----------------------------------------------------------------

const TOKENS = read("frontend/src/styles/tokens.css");
const LIGHT = TOKENS.slice(0, TOKENS.indexOf("@media (prefers-color-scheme: dark)"));
const DARK = TOKENS.slice(TOKENS.indexOf("@media (prefers-color-scheme: dark)"));

const hexTokens = (css: string) => new Map([...css.matchAll(/(--color-[\w-]+):\s*(#[0-9a-f]{6});/gi)].map(([, name, hex]) => [name!, hex!.toLowerCase()]));

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
};
const contrast = (a: string, b: string) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
};

const SURFACES = ["--color-bg", "--color-surface", "--color-sunk"];
const TEXT = ["--color-ink-strong", "--color-ink", "--color-ink-soft", "--color-ink-muted", "--color-accent", "--color-accent-hover", "--color-success", "--color-warning", "--color-danger"];
const LINES = ["--color-rule-strong", "--color-field"];

for (const [theme, css] of [["light", LIGHT], ["dark", DARK]] as const) {
  test(`${theme} theme: every text colour is 7:1 on every surface, and control borders 3:1`, () => {
    const tokens = hexTokens(css);
    const get = (name: string) => {
      const value = tokens.get(name);
      assert.ok(value, `${name} is not set as a hex colour in the ${theme} block of tokens.css`);
      return value;
    };
    for (const ink of TEXT) {
      for (const surface of SURFACES) {
        const ratio = contrast(get(ink), get(surface));
        // The sunk surface holds tags and the palette's selected row, never
        // status messages or links, so those three only need to clear it at AA.
        const floor = surface === "--color-sunk" && ["--color-success", "--color-accent"].includes(ink) ? 4.5 : 7;
        assert.ok(ratio >= floor, `${theme}: ${ink} on ${surface} is ${ratio.toFixed(2)}:1, under ${floor}:1`);
      }
    }
    for (const line of LINES) {
      for (const surface of ["--color-bg", "--color-surface"]) {
        const ratio = contrast(get(line), get(surface));
        assert.ok(ratio >= 3, `${theme}: ${line} on ${surface} is ${ratio.toFixed(2)}:1, under the 3:1 WCAG 1.4.11 asks of a control's boundary`);
      }
    }
    assert.ok(contrast(get("--color-accent-ink"), get("--color-accent")) >= 7, `${theme}: button text on the accent is under 7:1`);
  });
}

test("stylesheets take every colour from the tokens", () => {
  const literal = /#[0-9a-f]{3,8}\b|\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(|\b(?:white|black)\b(?![-\w])/i;
  const sheets = walk("frontend/src", (path) => extname(path) === ".css" && !path.endsWith("styles/tokens.css"));
  assert.ok(sheets.length >= 8, "expected the stylesheets under frontend/src");
  for (const path of sheets) {
    const css = read(path).replace(/\/\*[\s\S]*?\*\//g, "");
    for (const declaration of css.split(/[;{}]/)) {
      // Paper's token values are the one literal print.css may hold.
      if (path.endsWith("styles/print.css") && /^\s*--color-[\w-]+:/.test(declaration)) continue;
      const found = declaration.match(literal);
      assert.ok(!found, `${path} writes the colour "${found?.[0]}"; use a token from styles/tokens.css`);
    }
  }
});

test("the theme-color metas match each theme's page colour", () => {
  const html = read("frontend/index.html");
  const meta = (scheme: string) => html.match(new RegExp(`<meta name="theme-color" media="\\(prefers-color-scheme: ${scheme}\\)" content="(#[0-9a-f]{6})"`, "i"))?.[1];
  assert.equal(meta("light")?.toLowerCase(), hexTokens(LIGHT).get("--color-bg"));
  assert.equal(meta("dark")?.toLowerCase(), hexTokens(DARK).get("--color-bg"));
});

// ----- Stylesheets ----------------------------------------------------------

// Imported nowhere, a stylesheet never loads; imported twice, it ships twice.
// Component styles are @imported by styles/index.css so they are in the one
// stylesheet every prerendered page links; only the palette, which never
// prerenders, imports its own.
test("every stylesheet is loaded exactly once", () => {
  const sheets = walk("frontend/src", (path) => extname(path) === ".css");
  const loads = new Map(sheets.map((path) => [path, 0]));
  const resolve = (from: string, spec: string) => {
    const parts = from.split("/").slice(0, -1);
    for (const segment of spec.split("/")) {
      if (segment === "..") parts.pop();
      else if (segment !== ".") parts.push(segment);
    }
    return parts.join("/");
  };
  for (const path of walk("frontend/src", (p) => /\.(css|tsx?)$/.test(p))) {
    const source = read(path);
    const pattern = extname(path) === ".css" ? /^\s*@import\s+"([^"]+)";/gm : /^\s*import\s+"([^"]+\.css)";/gm;
    for (const [, spec] of source.matchAll(pattern)) {
      const target = spec!.startsWith("@/") ? `frontend/src/${spec!.slice(2)}` : resolve(path, spec!);
      assert.ok(loads.has(target), `${path} loads ${spec}, which is not a stylesheet under frontend/src`);
      loads.set(target, loads.get(target)! + 1);
    }
  }
  loads.delete("frontend/src/styles/index.css");
  for (const [path, count] of loads) assert.equal(count, 1, `${path} is loaded ${count} times`);
  assert.match(read("frontend/src/main.tsx"), /import "@\/styles\/index\.css";/, "main.tsx must import styles/index.css");
});

// ----- Security headers -----------------------------------------------------

test("the CSP allows no inline script or style, and the page holds none", () => {
  const csp = read("frontend/public/_headers").match(/Content-Security-Policy: (.+)/)?.[1] ?? "";
  const directive = (name: string) => csp.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name} `)) ?? "";
  for (const name of ["script-src", "style-src"]) {
    assert.ok(directive(name), `the CSP has no ${name}`);
    assert.doesNotMatch(directive(name), /unsafe-inline|unsafe-eval|https?:/, `${name} should allow only 'self'`);
  }
  assert.match(directive("connect-src"), /^connect-src 'self'$/, "the contact form posts to its own origin; nothing else is needed");
  const html = read("frontend/index.html");
  const inline = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].filter(([, attributes]) => !/\bsrc=/.test(attributes!));
  assert.deepEqual(inline, [], "index.html holds an inline script, which the CSP would block");
  // A style attribute in prerendered markup is blocked the same way.
  const jsx = walk("frontend/src", (path) => path.endsWith(".tsx")).filter((path) => /\bstyle=\{/.test(read(path)));
  assert.deepEqual(jsx, [], "these components render a style attribute, which the CSP blocks in prerendered HTML");
});

// ----- Deployment -----------------------------------------------------------

test("the Worker publishes the build, runs the API first, and names one origin", () => {
  const config = read("frontend/wrangler.jsonc");
  const value = (key: string) => config.match(new RegExp(`"${key}":\\s*"([^"]+)"`))?.[1];
  assert.equal(value("directory"), "./dist", "assets.directory must be the Vite build output");
  assert.equal(value("not_found_handling"), "404-page", "unknown paths must get dist/404.html");
  assert.equal(value("binding"), "ASSETS", "the Worker reaches the build through the ASSETS binding");
  assert.ok(existsSync(join(ROOT, "frontend", value("main") ?? "missing")), "wrangler.jsonc main must point at the Worker entry");
  assert.match(config, /"run_worker_first":\s*\[\s*"\/api\/\*"\s*\]/, "only /api/* should reach the Worker before the assets");
  assert.match(config, /"workers_dev":\s*false/, "workers_dev: false keeps the site off a second, workers.dev address");
  assert.doesNotMatch(config, /"account_id"/, "the account comes from a repository variable, not this public file");
  const domain = config.match(/"pattern":\s*"([^"]+)",\s*"custom_domain":\s*true/)?.[1];
  assert.equal(`https://${domain}`, SITE.url, "the first custom domain must be SITE.url");
  assert.equal(read(".github/workflows/deploy.yml").match(/^\s*SITE_URL:\s*(\S+)$/m)?.[1], SITE.url, "deploy.yml verifies a different origin than SITE.url");
});

// .nvmrc is the one pin: local work, CI and the deploy read it.
test("the Node version is pinned once and every engines range admits it", () => {
  const nvmrc = Number(read(".nvmrc").trim());
  for (const file of readdirSync(join(ROOT, ".github/workflows"))) {
    const workflow = read(`.github/workflows/${file}`);
    assert.doesNotMatch(workflow, /^\s*node-version:/m, `${file} hardcodes a Node version; use node-version-file: ".nvmrc"`);
    const setups = workflow.split("actions/setup-node@").length - 1;
    const pinned = (workflow.match(/node-version-file:\s*"?\.nvmrc"?/g) ?? []).length;
    assert.equal(pinned, setups, `${file}: every setup-node step must read .nvmrc`);
  }
  for (const file of ["package.json", "frontend/package.json"]) {
    const range: string = JSON.parse(read(file)).engines?.node ?? "";
    const admits = range.split("||").some((part) => {
      const match = part.trim().match(/^(>=|\^)(\d+)\.\d+\.\d+$/);
      assert.ok(match, `cannot read the engines range "${range}" in ${file}`);
      return match[1] === ">=" ? nvmrc >= Number(match[2]) : nvmrc === Number(match[2]);
    });
    assert.ok(admits, `${file} engines.node "${range}" does not admit Node ${nvmrc}`);
  }
});

test("both manifests and the newest changelog release name one version", () => {
  const released = read("CHANGELOG.md").match(/^## \[(\d+\.\d+\.\d+)\] - \d{4}-\d{2}-\d{2}$/m)?.[1];
  for (const file of ["package.json", "frontend/package.json"]) {
    assert.equal(JSON.parse(read(file)).version, released, `${file} and the newest release in CHANGELOG.md differ`);
  }
});

// ----- Code that Node runs without a bundler ---------------------------------

// The tests, the prerender and the Worker load these with Node's type
// stripping, which needs relative imports with their .ts extension.
test("the shared modules import only relative .ts files", () => {
  const modules = [
    ...walk("frontend/src/content", (path) => path.endsWith(".ts")),
    ...walk("frontend/src/shared", (path) => path.endsWith(".ts")),
    "frontend/src/routes.ts",
    "frontend/src/head.ts",
    "frontend/src/commands.ts",
  ];
  for (const path of modules) {
    for (const [, spec] of read(path).matchAll(/^\s*(?:import|export)\s[^;]*?from\s+"([^"]+)"/gm)) {
      assert.match(spec!, /^\.\.?\/.+\.ts$/, `${path} imports "${spec}"; use a relative path ending in .ts`);
    }
  }
});

// ----- House style ------------------------------------------------------------

test("no file uses an em dash", () => {
  const EM_DASH = String.fromCharCode(0x2014);
  const BINARY = new Set([".png", ".jpg", ".ico", ".webp", ".avif", ".woff2", ".pdf"]);
  const files = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], { cwd: ROOT, encoding: "utf8" })
    .split("\0")
    .filter((file) => file && !BINARY.has(extname(file).toLowerCase()) && existsSync(join(ROOT, file)));
  const hits = files.flatMap((file) =>
    read(file)
      .split("\n")
      .flatMap((line, i) => (line.includes(EM_DASH) ? [`${file}:${i + 1}`] : []))
  );
  assert.deepEqual(hits, [], "Rewrite these lines with a colon, comma or full stop.");
});
