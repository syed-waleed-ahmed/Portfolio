// Prerenders the app into dist/index.html, the last step of `npm run build`.
//
// The client build (dist/) and the SSR build of src/entry-server.jsx
// (dist-server/) run first. This script renders the page once with the server
// bundle, places the markup inside <div id="root">, and removes dist-server/.
// main.jsx then hydrates that markup instead of building the page from an
// empty root, so content, headings and links are in the HTML response itself.
import { readFile, rm, writeFile } from "node:fs/promises";
import { projects } from "../src/data/projects.js";

const distIndex = new URL("../dist/index.html", import.meta.url);
const serverDir = new URL("../dist-server/", import.meta.url);
const serverEntry = new URL("entry-server.js", serverDir);

const ROOT = '<div id="root"></div>';

const { render } = await import(serverEntry.href);
const html = await readFile(distIndex, "utf8");

if (!html.includes(ROOT)) {
  throw new Error(`prerender: ${ROOT} not found in dist/index.html`);
}

// The projects as structured data, built from the module the Projects section
// renders, so search engines read the same names, descriptions and links as
// visitors and the two cannot drift. index.html keeps the hand-written Person,
// WebSite and ProfilePage blocks; its ProfilePage points here through
// "hasPart". A card with a public repository is SoftwareSourceCode; one without
// (RemindrAI, a private repository) is a plain CreativeWork, so no private URL
// is ever published. The demo, where one runs, is the item's url.
const SITE = "https://syedwaleedahmed.me/";
const LANGUAGES = new Set(["Python", "TypeScript", "JavaScript"]);
const projectsLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${SITE}#projects`,
  name: "Selected projects by Syed Waleed Ahmed",
  numberOfItems: projects.length,
  itemListElement: projects.map((project, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": project.github ? "SoftwareSourceCode" : "CreativeWork",
      name: project.title,
      description: project.description,
      author: { "@id": `${SITE}#person` },
      keywords: project.stack.join(", "),
      ...(project.github && {
        codeRepository: project.github,
        programmingLanguage: project.stack.filter((tech) => LANGUAGES.has(tech)),
      }),
      url: project.demo ?? project.github ?? `${SITE}#projects`,
    },
  })),
};
// "<" is escaped so no string in the data can close the script element early.
const projectsScript = `<script type="application/ld+json">${JSON.stringify(projectsLd).replace(/</g, "\\u003c")}</script>`;

if (!html.includes("</head>")) {
  throw new Error("prerender: </head> not found in dist/index.html");
}

const appHtml = render();
// Function replacements, so a "$" in the rendered markup or the data is
// inserted as-is rather than read as a replacement pattern.
await writeFile(
  distIndex,
  html
    .replace("</head>", () => `${projectsScript}\n  </head>`)
    .replace(ROOT, () => `<div id="root">${appHtml}</div>`),
);
await rm(serverDir, { recursive: true, force: true });

console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} KB of markup into dist/index.html`);
