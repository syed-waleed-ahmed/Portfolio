// Prerenders the app into dist/index.html, the last step of `npm run build`.
//
// The client build (dist/) and the SSR build of src/entry-server.jsx
// (dist-server/) run first. This script renders the page once with the server
// bundle, places the markup inside <div id="root">, and removes dist-server/.
// main.jsx then hydrates that markup instead of building the page from an
// empty root, so content, headings and links are in the HTML response itself.
import { readFile, rm, writeFile } from "node:fs/promises";

const distIndex = new URL("../dist/index.html", import.meta.url);
const serverDir = new URL("../dist-server/", import.meta.url);
const serverEntry = new URL("entry-server.js", serverDir);

const ROOT = '<div id="root"></div>';

const { render } = await import(serverEntry.href);
const html = await readFile(distIndex, "utf8");

if (!html.includes(ROOT)) {
  throw new Error(`prerender: ${ROOT} not found in dist/index.html`);
}

const appHtml = render();
// A function replacement, so a "$" in the rendered markup is inserted as-is
// rather than read as a replacement pattern.
await writeFile(distIndex, html.replace(ROOT, () => `<div id="root">${appHtml}</div>`));
await rm(serverDir, { recursive: true, force: true });

console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} KB of markup into dist/index.html`);
