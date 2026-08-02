# Design System

The visual language of the site, and the handful of rules that keep it from
drifting. Read this before changing colours, type sizes or the Projects grid -
several of these choices look arbitrary and are not.

## Colour tokens

Every colour is a custom property in `:root`
(`frontend/src/styles/base.css`). The page background is flat top to bottom -
no gradients, no glows - and cards are defined purely by sitting a shade
lighter than it.

| Token | Value | Use |
|-------|-------|-----|
| `--bg-main` | `#0a192f` | Page background, uniform throughout |
| `--bg-card` | `#112240` | Raised blocks: cards, panels, inputs |
| `--bg-card-hover` | `#233554` | Card hover |
| `--accent` | `#6366f1` | Indigo: gradient start, timeline dots |
| `--accent-2` | `#22d3ee` | Cyan: outlined CTAs, card headings, focus rings |
| `--gradient-accent` | indigo to cyan | Accented type, logo mark, progress bar |

Two rules keep it consistent:

1. **Translucent surfaces compose from the palette**, never from a separate
   hardcoded colour: `rgba(var(--light-navy-rgb), 0.5)`, not
   `rgba(15, 23, 42, 0.5)`. `--navy-rgb` and `--light-navy-rgb` hold the raw
   triplets for exactly this.
2. **Three places inline the palette by hand** and cannot read the tokens, so
   they need updating in step:
   - `frontend/public/404.html` - standalone page, no bundled CSS
   - `frontend/public/apple-touch-icon.png` - `--bg-main` is baked in, since
     iOS composites transparent icons onto white
   - `<meta name="theme-color">` in both `index.html` and `404.html`

The same indigo-to-cyan 2px top rule marks the centrepiece in two places - the
`featured` project card and the Interests role cards - so "this one matters" is
a system signal rather than a per-section flourish.

---

## Typography

**NTR**, self-hosted, latin subset only, about 12 KB, with a `system-ui`
fallback. It is served from `public/fonts/` rather than Google Fonts, so
`font-src` stays at `'self' data:` and there is no third-party request on the
critical path. `index.html` preloads it, because the hero headline would
otherwise flash the fallback under `font-display: swap`.

`404.html` redeclares the same `@font-face` because it cannot reach the bundled
CSS. It points at the same file, so there is still only one copy on disk.

**NTR ships a single 400 weight.** Anything heavier - `fw-bold`,
`.hero-title .gradient-text`, headings - is synthesised by the browser rather
than being a real bold cut.

A second `@font-face` named `NTR Fallback` exists purely to stop layout shift.
Because every size is tuned to NTR's small x-height, the fallback that paints
first under `font-display: swap` would draw text about 20% too large and reflow
the page on swap. `size-adjust: 79.8%` matches the fallback to NTR's x-height -
the best single fit across Segoe UI, SF, Roboto and Arial - leaving under 3%
residual. If no `local()` match is found the face is skipped and the stack
falls through to plain `system-ui`.

### Why the font sizes look large

NTR's x-height is **0.412 em** against roughly 0.50 for Segoe UI and
`system-ui` generally, so it renders about **20% smaller** at the same
`font-size`. Every text size is therefore scaled **1.2x** from a
system-font-normalised baseline: body copy is `1.26rem` (about 20px), and the
hero headline tops out at `5rem` (80px). Those land on the same optical size
the old system-font stack produced.

If the typeface ever changes, rescale by the x-height ratio rather than copying
these numbers across.

**`font-size` on icon containers is not part of that scale.** `react-icons`
renders SVGs sized in `em`, so `font-size` there controls a glyph, not NTR
text. `.btn-outlined--icon`, `.card-heading-icon`, `.project-link-icon`,
`.btn-icon`, `.contact-label-icon` and `.scroll-top-btn` stay at their unscaled
values.

---

## Buttons

There is **one** button, `.btn-outlined` in `base.css`, with two modifiers:
`--accent` (the primary action in a group) and `--icon` (icon-only square).
Hero CTAs, the contact submit and the error-boundary retry all render from it,
so they cannot drift apart. Nothing on the site is a filled button.

Anything tappable gets a 48x48 floor under `@media (pointer: coarse)` - keyed
to the input device rather than a width breakpoint, and set on the elements
themselves, since an audit measures each element's own client rect and an
expanded `::after` would not count.

---

## Project cards line up on shared rows

Projects is the one section that does **not** use Bootstrap columns. It is a
CSS grid (`.projects-grid`), and each card spans three shared row bands - body,
insight, stack - via `grid-template-rows: subgrid`. That is what keeps the
insight block and the tag row on the same line across a row however long the
description above them runs. With plain flex cards each one sized itself and
the insight block floated to wherever its own text ended.

Three things about it are load-bearing:

1. **The card's padding lives in `components.css`, not in a `p-4` utility.** A
   subgrid's box has to be described alongside its track rules. Dropping it
   renders the title clipped against the card edge.
2. **`row-gap` on `.projects-grid` is the only vertical rhythm value.** It is
   both the space between cards and the space between the three bands inside
   one, so per-block margins cannot drift apart. Do not reintroduce `mb-*`
   utilities on the three children.
3. **The markup nests two subgrids.** `Reveal` renders the grid item
   (`.project-cell`) and the card sits inside it; both declare
   `grid-row: span 3`. Adding a wrapper between them breaks the chain, because
   subgrid only inherits from a direct parent.

`subgrid` is unsupported on Chrome below 117 and on Samsung Internet, where the
cards fall back to ordinary stacked blocks: content still reads top to bottom,
it just stops lining up. That fallback is the reason the layout carries no
fixed heights.

---

## Motion

Scroll reveals are a vanilla `IntersectionObserver` (`useInView`) plus CSS
keyframes. There is no `framer-motion` and no `tsparticles`. The hero entrance
and the headline caret blink are CSS keyframes as well.

Every animation is disabled under `prefers-reduced-motion: reduce`. When adding
motion, add the reduced-motion branch in the same change.

---

## Accessibility

- Skip-to-content link as the first focusable element
- Visible `:focus-visible` rings in `--accent-2`, never `outline: none`
- Semantic landmarks and one `<h1>` per page
- The honeypot input is off-screen rather than `display: none`, and is removed
  from the tab order and the accessibility tree with `tabIndex={-1}` and
  `aria-hidden` - so no real person can reach it
- Form errors are announced with `role="alert"`, success with `role="status"`
- 48x48 minimum tap targets on coarse pointers
- Responsive from a 375px baseline upward

---

## Generated assets

Three binaries in `public/` are generated rather than hand-drawn, so they need
regenerating rather than editing:

| Asset | Source | How |
|-------|--------|-----|
| `images/og-card.png` | `images/Profile.avif` + `fonts/ntr-latin-400.woff2` | `npm i --no-save sharp fontkit && node scripts/gen-og-card.mjs` |
| `images/Profile.{avif,webp}` | 680x680, square-cropped from the 1908x2392 original (2x the 340px hero slot) | Re-crop from the original if the photo changes |
| `favicon.*`, `apple-touch-icon.png` | `favicon.svg` | Rasterised from the SVG; the touch icon bakes in `--bg-main` |

`gen-og-card.mjs` reads only files already in the repository, so the card is
reproducible from a clean checkout. It renders text as vector paths rather than
`<text>`, so it does not need NTR installed as a system font - which would
otherwise silently substitute a fallback and produce a card in the wrong
typeface. It throws rather than emitting a card with text running off the edge.

`sharp` and `fontkit` are installed on demand and deliberately kept out of
`package.json`: sharp ships around 30 MB of native binaries, and CI has no
reason to pull that in to lint and build a static site.

---

## Related documents

- [Architecture](architecture.md#frontend) - component layers and the data layer
- [Development](development.md#updating-site-content) - editing copy and content
- [Deployment](deployment.md#caching) - why `/images/*` is not cached like `/assets/*`
