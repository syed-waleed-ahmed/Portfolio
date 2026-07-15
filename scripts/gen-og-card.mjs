// Regenerates frontend/public/images/og-card.png - the 1200x630 social card
// used by og:image and twitter:image.
//
// Run it after changing the portrait, your name, or your role:
//
//   npm i --no-save sharp fontkit
//   node scripts/gen-og-card.mjs
//
// Both dependencies are installed on demand rather than kept in package.json:
// sharp ships ~30 MB of native binaries, and CI has no reason to pull that in
// to lint and build a static site.
//
// Everything it reads already lives in the repo - the portrait and the font -
// so the card is reproducible from a clean checkout.
import * as fontkit from "fontkit";
import sharp from "sharp";
import { statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORTRAIT = path.join(root, "frontend/public/images/Profile.avif");
const FONT = path.join(root, "frontend/public/fonts/ntr-latin-400.woff2");
const OUT = path.join(root, "frontend/public/images/og-card.png");

const W = 1200;
const H = 630;
const NAVY = "#0a192f"; // --bg-main
const TEXT = "#e2e8f0"; // --text-main
const CYAN = "#22d3ee"; // --accent-2
const INDIGO = "#6366f1"; // --accent
const MUTED = "#94a3b8"; // --text-muted

const NAME = "Syed Waleed Ahmed";
const ROLE = "AI Engineer";
const BLURB = ["Multi-agent systems, RAG pipelines,", "and LLM workflow automation."];

const font = fontkit.openSync(FONT);

// Text is emitted as vector paths rather than <text>. The renderer would
// otherwise need NTR installed as a system font and would silently substitute
// a fallback if it wasn't - producing a card in the wrong typeface.
function textPath(str, sizePx, x, baseline, fill) {
  const scale = sizePx / font.unitsPerEm;
  const run = font.layout(str);
  let cursor = 0;
  const parts = [];
  for (const g of run.glyphs) {
    const d = g.path.toSVG();
    // Font space has +y up, SVG has +y down, hence the negative y scale.
    if (d) {
      parts.push(
        `<path d="${d}" fill="${fill}" transform="translate(${x + cursor * scale} ${baseline}) scale(${scale} ${-scale})"/>`
      );
    }
    cursor += g.advanceWidth;
  }
  return { svg: parts.join(""), width: cursor * scale };
}

const TEXT_X = 470;
const name = textPath(NAME, 76, TEXT_X, 300, TEXT);
const role = textPath(ROLE, 44, TEXT_X, 372, CYAN);
const l1 = textPath(BLURB[0], 30, TEXT_X, 440, MUTED);
const l2 = textPath(BLURB[1], 30, TEXT_X, 482, MUTED);

// Fail loudly rather than shipping a card with the name running off the edge.
for (const [label, t] of [["name", name], ["role", role], ["blurb line 1", l1], ["blurb line 2", l2]]) {
  if (TEXT_X + t.width > W - 40) {
    throw new Error(`${label} overflows the card: needs ${Math.ceil(TEXT_X + t.width)}px, have ${W - 40}px`);
  }
}

const svg = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
     <rect width="${W}" height="${H}" fill="${NAVY}"/>
     ${name.svg}${role.svg}${l1.svg}${l2.svg}
     <rect x="${TEXT_X}" y="330" width="90" height="3" rx="1.5" fill="${INDIGO}"/>
   </svg>`
);

const D = 380;
const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`
);
const portrait = await sharp(PORTRAIT)
  .resize(D, D)
  .composite([{ input: mask, blend: "dest-in" }])
  .png()
  .toBuffer();

await sharp(svg)
  .composite([{ input: portrait, left: 70, top: (H - D) / 2 }])
  .png({ quality: 90 })
  .toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(
  `og-card.png  ${meta.width}x${meta.height}  ${(statSync(OUT).size / 1024).toFixed(0)} KB  (${(meta.width / meta.height).toFixed(2)}:1)`
);
