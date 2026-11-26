// Serves the built site the way Cloudflare does, for the browser tests.
//
// `vite preview` ignores public/_headers, so a CSP that blocks a script or a
// stylesheet looks fine there and breaks only in production. This server
// sends the "/*" block of dist/_headers with every response, so the suite
// runs under the policy visitors get. Like Cloudflare it serves a directory's
// index.html, redirects /work/x to /work/x/, and answers unknown paths with
// 404.html and a 404. The contact API is not served here: the tests answer
// it themselves. Node built-ins only.
import { createServer } from "node:http";
import { existsSync, statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const PORT = Number(process.env.PORT) || 4174;

if (!existsSync(join(DIST, "index.html"))) {
  console.error("e2e/serve.mjs: frontend/dist is missing. Run npm run build first.");
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

// The indented "Name: value" lines under "/*", up to the next path.
const globalHeaders = (text) => {
  const headers = {};
  let inBlock = false;
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
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
// Playwright's WebKit upgrades http://127.0.0.1 to https under this directive
// and then cannot load anything, so a WebKit run can ask for it to be dropped.
if (process.env.E2E_NO_UPGRADE) HEADERS["Content-Security-Policy"] = HEADERS["Content-Security-Policy"].replace(/;\s*upgrade-insecure-requests/, "");

createServer(async (req, res) => {
  const { pathname } = new URL(req.url, "http://localhost");
  let file = normalize(join(DIST, decodeURIComponent(pathname)));

  // A directory without its trailing slash is redirected, as Cloudflare does.
  if (file.startsWith(DIST) && existsSync(file) && statSync(file).isDirectory()) {
    if (!pathname.endsWith("/")) {
      res.writeHead(307, { ...HEADERS, Location: `${pathname}/` });
      res.end();
      return;
    }
    file = join(file, "index.html");
  }

  let status = 200;
  let body;
  try {
    // normalize() resolves "..", so a path that leaves dist/ is refused.
    if (!file.startsWith(DIST)) throw new Error("outside dist");
    body = await readFile(file);
  } catch {
    status = 404;
    file = join(DIST, "404.html");
    body = await readFile(file);
  }

  res.writeHead(status, { ...HEADERS, "Content-Type": TYPES[extname(file)] ?? "application/octet-stream" });
  res.end(body);
}).listen(PORT, "127.0.0.1", () => {
  console.log(`e2e/serve.mjs: serving frontend/dist with its headers on http://127.0.0.1:${PORT}`);
});
