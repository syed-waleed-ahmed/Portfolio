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
  await writeFile(file, template.replace(HEAD, () => page.head).replace(ROOT, () => page.html));
}

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
console.log(`prerender: wrote ${pages.length} pages, a sitemap of ${urls.length} URLs and security.txt`);
