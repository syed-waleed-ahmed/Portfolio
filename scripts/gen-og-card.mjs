// Regenerates frontend/public/images/og-card.png - the 1200x630 social card
// used by og:image and twitter:image.
//
// Run it after changing the portrait, name, role, font or palette:
//
//   npm i --no-save sharp fontkit wawoff2
//   node scripts/gen-og-card.mjs
//
// The favicons are not generated here. favicon.svg is hand-drawn artwork and
// the PNG and ICO versions are rasterised from it - see docs/design.md.
//
// The dependencies are installed on demand rather than kept in package.json:
// sharp ships ~30 MB of native binaries, and CI has no reason to pull that in
// to lint and build a static site. Install all three in one command - a
// separate `npm i --no-save` prunes whatever the previous one added.
//
// Everything it reads already lives in the repository - the portrait and the
// font - so the output is reproducible from a clean checkout. Colours mirror
// src/styles/tokens.css.
import * as fontkit from "fontkit";
import sharp from "sharp";
import { decompress } from "wawoff2";
import { readFileSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = (p) => path.join(root, "frontend/public", p);

const PORTRAIT = pub("images/Profile.avif");
const FONT = pub("fonts/hanken-grotesk-latin-wght.woff2");

const BG = "#0b1221"; // --color-bg
const TEXT = "#f5f7fb"; // --color-text-strong
const SOFT = "#b7c2d0"; // --color-text-soft
const MUTED = "#8c99ad"; // --color-text-muted
const CYAN = "#22d3ee"; // --color-accent
const INDIGO = "#6366f1"; // --color-indigo

const NAME = "Syed Waleed Ahmed";
const ROLE = "AI Engineer";
const BLURB = ["Multi-agent systems, RAG pipelines,", "and LLM workflow automation."];
const DOMAIN = "syedwaleedahmed.me";

// The site ships a variable WOFF2, and fontkit cannot apply variations to
// WOFF2 (its WOFF2 glyph decoder lacks the phantom points gvar needs). It can
// for TTF, so the file is decompressed to TTF in memory first.
const variable = fontkit.create(Buffer.from(await decompress(readFileSync(FONT))));
const weights = new Map();
function weight(wght) {
  if (!weights.has(wght)) weights.set(wght, variable.getVariation({ wght }));
  return weights.get(wght);
}

// Text is emitted as vector paths rather than <text>. The renderer would
// otherwise need the font installed system-wide and would silently substitute
// a fallback if it was not, producing assets in the wrong typeface.
function textPath(font, str, sizePx, x, baseline, fill, tracking = 0) {
  const scale = sizePx / font.unitsPerEm;
  const run = font.layout(str);
  let cursor = 0;
  const parts = [];
  for (const g of run.glyphs) {
    const d = g.path.toSVG();
    // Font space has +y up, SVG has +y down, hence the negative y scale.
    if (d) {
      parts.push(
        `<path d="${d}" fill="${fill}" transform="translate(${(x + cursor * scale).toFixed(2)} ${baseline}) scale(${scale} ${-scale})"/>`
      );
    }
    cursor += g.advanceWidth + tracking * font.unitsPerEm;
  }
  const width = (cursor - tracking * font.unitsPerEm) * scale;
  return { svg: parts.join(""), width };
}

const kb = (file) => `${(statSync(file).size / 1024).toFixed(1)} KB`;

// ===== Social card =====
async function socialCard() {
  const W = 1200;
  const H = 630;
  const TEXT_X = 500;

  const name = textPath(weight(700), NAME, 68, TEXT_X, 292, TEXT, -0.02);
  const role = textPath(weight(600), ROLE, 40, TEXT_X, 356, CYAN);
  const l1 = textPath(weight(400), BLURB[0], 30, TEXT_X, 428, SOFT);
  const l2 = textPath(weight(400), BLURB[1], 30, TEXT_X, 468, SOFT);
  const url = textPath(weight(500), DOMAIN, 24, TEXT_X, 548, MUTED);

  // Fail loudly rather than shipping a card with text running off the edge.
  for (const [label, t] of [["name", name], ["role", role], ["blurb 1", l1], ["blurb 2", l2]]) {
    if (TEXT_X + t.width > W - 48) {
      throw new Error(`${label} overflows the card: needs ${Math.ceil(TEXT_X + t.width)}px, have ${W - 48}px`);
    }
  }

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <defs>
         <radialGradient id="wash" cx="0.22" cy="0.3" r="0.6">
           <stop offset="0" stop-color="${INDIGO}" stop-opacity="0.22"/>
           <stop offset="1" stop-color="${INDIGO}" stop-opacity="0"/>
         </radialGradient>
         <linearGradient id="rule" x1="0" x2="1">
           <stop offset="0" stop-color="${INDIGO}"/>
           <stop offset="1" stop-color="${CYAN}"/>
         </linearGradient>
       </defs>
       <rect width="${W}" height="${H}" fill="${BG}"/>
       <rect width="${W}" height="${H}" fill="url(#wash)"/>
       <rect x="0" y="${H - 6}" width="${W}" height="6" fill="url(#rule)"/>
       ${name.svg}${role.svg}${l1.svg}${l2.svg}${url.svg}
     </svg>`
  );

  const D = 360;
  const RING = 8;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${D}" height="${D}"><circle cx="${D / 2}" cy="${D / 2}" r="${D / 2}" fill="#fff"/></svg>`
  );
  const ring = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${D + RING * 2}" height="${D + RING * 2}"><circle cx="${D / 2 + RING}" cy="${D / 2 + RING}" r="${D / 2 + RING - 1.5}" fill="none" stroke="${CYAN}" stroke-opacity="0.45" stroke-width="3"/></svg>`
  );
  const portrait = await sharp(PORTRAIT)
    .resize(D, D)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const top = (H - D) / 2;
  const out = pub("images/og-card.png");
  await sharp(svg)
    .composite([
      { input: ring, left: 90 - RING, top: top - RING },
      { input: portrait, left: 90, top },
    ])
    // Palette-quantized: full-colour PNG spent ~370 KB on the soft background
    // gradient. Dithering keeps that gradient from banding.
    .png({ palette: true, colors: 256, quality: 100, dither: 1, effort: 10, compressionLevel: 9 })
    .toFile(out);
  console.log(`images/og-card.png      ${W}x${H}  ${kb(out)}`);
}

await socialCard();
