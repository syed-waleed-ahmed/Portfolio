// Serves the built site the way Netlify does, for the Playwright suite.
//
// vite preview ignores public/_headers, so a CSP that blocks the analytics
// snippet, the font or a lazy chunk looks fine there and breaks only in
// production. This server sends the "/*" block of dist/_headers (the CSP and
// the other security headers) with every response, so the suite runs under
// the policy visitors actually get. Unknown paths get 404.html with a 404, as
// on Netlify. Node built-ins only.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const PORT = Number(process.env.PORT) || 4174;

if (!existsSync(join(DIST, "index.html"))) {
  console.error("e2e/serve.mjs: frontend/dist is missing. Run npm run build first.");
  process.exit(1);
}

// A build made with VITE_API_BASE_URL set, as frontend/.env does for work on
// the contact form, calls that origin instead, and the real CSP rightly blocks
// it. Vite inlines the value, so such a build no longer contains the default
// origin from Contact.jsx. Refused here with the fix, rather than failing the
// contact tests with "could not be reached".
const contact = readFileSync(fileURLToPath(new URL("../src/components/sections/Contact.jsx", import.meta.url)), "utf8");
const apiOrigin = contact.match(/VITE_API_BASE_URL \|\| "(https:\/\/[^"]+)"/)?.[1];
const entry = readdirSync(join(DIST, "assets")).find((name) => /^index-.*\.js$/.test(name));
if (apiOrigin && entry && !readFileSync(join(DIST, "assets", entry), "utf8").includes(apiOrigin)) {
  console.error(
    `e2e/serve.mjs: frontend/dist was built with VITE_API_BASE_URL set, so it does not call ${apiOrigin}.\n` +
      `Rebuild pointing it at that origin, which works in any shell:\n` +
      `  bash:       VITE_API_BASE_URL=${apiOrigin} npm run build\n` +
      `  PowerShell: $env:VITE_API_BASE_URL='${apiOrigin}'; npm run build\n` +
      "CI builds without frontend/.env, so it needs neither."
  );
  process.exit(1);
}

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

// The indented "Name: value" lines under the "/*" path, up to the next path
// or comment. Only that block applies to every response; the per-path blocks
// below it are cache rules, which a test run has no use for.
const globalHeaders = (text) => {
  const headers = {};
  let inBlock = false;
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    if (!/^\s/.test(line)) {
      inBlock = line.trim() === "/*";
      continue;
    }
    if (!inBlock) continue;
    const colon = line.indexOf(":");
    headers[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
  }
  return headers;
};

const HEADERS = globalHeaders(await readFile(join(DIST, "_headers"), "utf8"));

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  const path = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const file = normalize(join(DIST, path));

  let status = 200;
  let body;
  try {
    // normalize() resolves "..", so a path that leaves dist/ is refused.
    if (!file.startsWith(DIST)) throw new Error("outside dist");
    body = await readFile(file);
  } catch {
    status = 404;
    body = await readFile(join(DIST, "404.html"));
  }

  res.writeHead(status, {
    ...HEADERS,
    "Content-Type": TYPES[status === 404 ? ".html" : extname(file)] ?? "application/octet-stream",
  });
  res.end(body);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`e2e/serve.mjs: serving frontend/dist with its CSP on http://127.0.0.1:${PORT}`);
});
