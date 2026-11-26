// Prerenders every page into dist/, the last step of `npm run build`.
//
// The client build (dist/) and the SSR build of src/entry-server.tsx
// (dist-server/) run first. Each page in the route table gets its own HTML
// file: the template from dist/index.html with that page's <head> and markup
// in place of the two placeholders. The sitemap is written from the same list,
// and dist-server/ is removed.
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const DIST = new URL("../dist/", import.meta.url);
const SERVER = new URL("../dist-server/", import.meta.url);
const HEAD = "<!--app-head-->";
const ROOT = "<!--app-html-->";

const { pages, PERSON, SITE } = await import(new URL("entry-server.js", SERVER).href);
const template = await readFile(new URL("index.html", DIST), "utf8");

// Each page's own chunk and what it imports, as modulepreload links, minus
// what the entry already loads. Without them the browser would find the
// page's chunk only once the entry had run.
const MANIFEST = new URL(".vite/manifest.json", DIST);
const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const entryKey = Object.keys(manifest).find((key) => manifest[key].isEntry);
const chunksOf = (key, seen = new Set()) => {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const child of manifest[key]?.imports ?? []) chunksOf(child, seen);
  return seen;
};
const loadedByEntry = new Set([...chunksOf(entryKey)].map((key) => manifest[key].file));
const preloadsFor = (module) => {
  if (!module) return "";
  if (!manifest[module]) throw new Error(`prerender: ${module} is not in the client manifest`);
  return [...chunksOf(module)]
    .map((key) => manifest[key].file)
    .filter((file) => !loadedByEntry.has(file))
    .map((file) => `\n    <link rel="modulepreload" crossorigin href="/${file}" />`)
    .join("");
};
for (const marker of [HEAD, ROOT]) {
  if (!template.includes(marker)) throw new Error(`prerender: ${marker} is missing from dist/index.html`);
}

// "/" and "/work/x/" are directories served by their index.html; "/404"
// becomes 404.html, which the host serves for unknown paths.
const fileFor = (path) => (path.endsWith("/") ? `${path}index.html` : `${path}.html`).slice(1);

for (const page of pages) {
  const file = new URL(fileFor(page.path), DIST);
  await mkdir(dirname(fileURLToPath(file)), { recursive: true });
  // Function replacements, so a "$" in the markup is inserted as written.
  await writeFile(file, template.replace(HEAD, () => page.head + preloadsFor(page.module)).replace(ROOT, () => page.html));
}

// A directory page asked for without its trailing slash gets a permanent
// redirect. The host's own redirect for it is a 307, which search engines
// treat as temporary.
const redirects = pages
  .map((page) => page.path)
  .filter((path) => path !== "/" && path.endsWith("/"))
  .map((path) => `${path.slice(0, -1)} ${path} 301`);
await writeFile(new URL("_redirects", DIST), `${redirects.join("\n")}\n`);

const urls = pages
  .filter((page) => page.indexable)
  .map((page) => `  <url>\n    <loc>${SITE.url}${page.path}</loc>\n    <lastmod>${SITE.updated}</lastmod>\n  </url>`);
await writeFile(
  new URL("sitemap.xml", DIST),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>\n`
);

// RFC 9116. Expires is required and must not be more than a year away, so it
// is set from the build: every deploy moves it forward.
const expires = new Date(Date.now() + 364 * 24 * 60 * 60 * 1000).toISOString().replace(/\.\d+Z$/, "Z");
await mkdir(new URL(".well-known/", DIST), { recursive: true });
await writeFile(
  new URL(".well-known/security.txt", DIST),
  [
    `Contact: ${SITE.repository}/security/advisories/new`,
    `Contact: mailto:${PERSON.email}`,
    `Expires: ${expires}`,
    "Preferred-Languages: en",
    `Canonical: ${SITE.url}/.well-known/security.txt`,
    `Policy: ${SITE.repository}/blob/main/SECURITY.md`,
    "",
  ].join("\n")
);

await rm(SERVER, { recursive: true, force: true });
await rm(new URL(".vite/", DIST), { recursive: true, force: true });
console.log(`prerender: wrote ${pages.length} pages, ${redirects.length} redirects, a sitemap of ${urls.length} URLs and security.txt`);
