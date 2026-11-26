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
// the light theme in frontend/src/styles/tokens.css.
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

const BG = "#f7f6f2"; // --color-bg (light)
const INK = "#121417"; // --color-ink-strong
const SOFT = "#3b3f47"; // --color-ink-soft
const MUTED = "#484c54"; // --color-ink-muted
const ACCENT = "#92290a"; // --color-accent
const RULE = "#d6d2c7"; // --color-rule

const NAME = "Syed Waleed Ahmed";
const ROLE = "AI Software Engineer";
const GREETING = "hi, Waleed here.";
const BLURB = ["I build LLM applications and the backend", "systems that keep them reliable."];
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
  const TEXT_X = 470;

  // The site's first screen in miniature: the greeting in the accent, the
  // name, the role, and the claim, on paper.
  const greeting = textPath(weight(500), GREETING, 30, TEXT_X, 196, ACCENT);
  const name = textPath(weight(700), NAME, 64, TEXT_X, 272, INK, -0.02);
  const role = textPath(weight(500), ROLE, 32, TEXT_X, 322, SOFT);
  const l1 = textPath(weight(600), BLURB[0], 30, TEXT_X, 400, INK, -0.01);
  const l2 = textPath(weight(600), BLURB[1], 30, TEXT_X, 440, INK, -0.01);
  const url = textPath(weight(500), DOMAIN, 22, TEXT_X, 520, MUTED);

  // Fail loudly rather than shipping a card with text running off the edge.
  for (const [label, t] of [["greeting", greeting], ["name", name], ["role", role], ["blurb 1", l1], ["blurb 2", l2]]) {
    if (TEXT_X + t.width > W - 48) {
      throw new Error(`${label} overflows the card: needs ${Math.ceil(TEXT_X + t.width)}px, have ${W - 48}px`);
    }
  }

  const svg = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
       <rect width="${W}" height="${H}" fill="${BG}"/>
       <rect x="${TEXT_X}" y="470" width="${W - TEXT_X - 90}" height="1" fill="${RULE}"/>
       <rect x="0" y="${H - 8}" width="${W}" height="8" fill="${ACCENT}"/>
       ${greeting.svg}${name.svg}${role.svg}${l1.svg}${l2.svg}${url.svg}
     </svg>`
  );

  // A rounded square, as the portrait is on the site.
  const D = 320;
  const mask = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${D}" height="${D}"><rect width="${D}" height="${D}" rx="14" fill="#fff"/></svg>`
  );
  const portrait = await sharp(PORTRAIT)
    .resize(D, D)
    .composite([{ input: mask, blend: "dest-in" }])
    .png()
    .toBuffer();

  const out = pub("images/og-card.png");
  await sharp(svg)
    .composite([{ input: portrait, left: 90, top: (H - D) / 2 - 4 }])
    .png({ palette: true, colors: 256, quality: 100, effort: 10, compressionLevel: 9 })
    .toFile(out);
  console.log(`images/og-card.png      ${W}x${H}  ${kb(out)}`);
}

await socialCard();
