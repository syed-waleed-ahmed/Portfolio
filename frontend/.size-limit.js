// Size budgets, checked by `npm run size` after a build.
//
// Vite names a shared chunk after the module it starts with, so the files a
// page loads change name as the code changes. The page budgets therefore read
// each built page and count exactly the scripts it references (its entry and
// the modules it preloads), rather than guessing file names. Lazy chunks are
// budgeted by the names their source files give them.
import { readFileSync } from "node:fs";

const scriptsOf = (page) => {
  try {
    const html = readFileSync(new URL(`dist/${page}`, import.meta.url), "utf8");
    return [...new Set([...html.matchAll(/(?:src|href)="\/(assets\/[^"]+\.js)"/g)].map(([, path]) => `dist/${path}`))];
  } catch {
    return ["dist/missing-build.js"];
  }
};

export default [
  { name: "Home page scripts (entry and preloads)", path: scriptsOf("index.html"), gzip: true, limit: "90 kB" },
  { name: "Case study page scripts, before its own chunk", path: scriptsOf("work/remindrai/index.html"), gzip: true, limit: "90 kB" },
  {
    name: "Largest case study chunk",
    path: "dist/assets/remindrai-*.js",
    gzip: true,
    limit: "8 kB",
  },
  { name: "The stylesheet every page waits for", path: "dist/assets/index-*.css", gzip: true, limit: "6.5 kB" },
  { name: "Command palette (cmdk), fetched on intent", path: ["dist/assets/CommandPalette-*.js", "dist/assets/CommandPalette-*.css"], gzip: true, limit: "20 kB" },
  { name: "The one font file", path: "dist/fonts/*.woff2", gzip: false, brotli: false, limit: "36 kB" },
  { name: "Case study screenshots, lazy, AVIF", path: "dist/assets/*.avif", gzip: false, brotli: false, limit: "240 kB" },
];
